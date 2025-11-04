const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

function initAdmin() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
    }
    return admin;
  }

  // Fallback to local service account file
  const saPath = path.join(__dirname, "..", "functions", "service-account-key.json");
  if (!fs.existsSync(saPath)) {
    throw new Error(
      "Missing FIREBASE_ADMIN_* env vars and service-account-key.json not found at functions/service-account-key.json"
    );
  }
  const serviceAccount = require(saPath);
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if (!args.has("--yes") && !args.has("-y")) {
    console.error(
      "Refusing to proceed without confirmation. Re-run with --yes to delete ALL Firebase Auth users."
    );
    process.exit(1);
  }

  const adminApp = initAdmin();
  const adminAuth = adminApp.auth();

  console.log("Listing Firebase Auth users...");
  const allUids = [];
  let pageToken = undefined;
  do {
    const listResult = await adminAuth.listUsers(1000, pageToken);
    const chunkUids = listResult.users.map((u) => u.uid);
    allUids.push(...chunkUids);
    pageToken = listResult.pageToken;
    console.log(`Fetched ${chunkUids.length} users in this page; total so far: ${allUids.length}`);
  } while (pageToken);

  if (allUids.length === 0) {
    console.log("No Firebase Auth users to delete.");
    return;
  }

  console.log(`Deleting ${allUids.length} Firebase Auth user(s)...`);
  const CHUNK_SIZE = 1000;
  let success = 0;
  let failure = 0;
  const errors = [];

  for (let i = 0; i < allUids.length; i += CHUNK_SIZE) {
    const chunk = allUids.slice(i, i + CHUNK_SIZE);
    const res = await adminAuth.deleteUsers(chunk);
    success += res.successCount || 0;
    failure += res.failureCount || 0;
    if (res.errors && res.errors.length) {
      errors.push(...res.errors.map((e) => ({ index: e.index, uid: chunk[e.index], error: e.error })));
    }
    console.log(`Deleted chunk ${i}-${i + chunk.length - 1}: success=${res.successCount}, failure=${res.failureCount}`);
  }

  console.log(`Deletion complete. Success: ${success}, Failure: ${failure}`);
  if (errors.length) {
    console.error("Errors:");
    for (const e of errors) {
      console.error(`- uid=${e.uid} index=${e.index} error=${e.error && e.error.message}`);
    }
  }
}

main().catch((err) => {
  console.error("Error deleting Firebase Auth users:", err);
  process.exit(1);
});
