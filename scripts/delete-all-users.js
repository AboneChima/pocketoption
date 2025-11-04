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
    return admin.firestore();
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
  return admin.firestore();
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if (!args.has("--yes") && !args.has("-y")) {
    console.error(
      "Refusing to proceed without confirmation. Re-run with --yes to delete all Firestore users."
    );
    process.exit(1);
  }

  const db = initAdmin();
  const USERS_COLLECTION = "users";
  console.log(`Fetching documents from collection: ${USERS_COLLECTION} ...`);
  const snap = await db.collection(USERS_COLLECTION).get();
  const total = snap.size;
  console.log(`Found ${total} user document(s).`);

  if (total === 0) {
    console.log("No documents to delete.");
    return;
  }

  const CHUNK_SIZE = 500;
  let deleted = 0;
  const docs = snap.docs;

  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const chunk = docs.slice(i, i + CHUNK_SIZE);
    const batch = db.batch();
    for (const doc of chunk) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    deleted += chunk.length;
    console.log(`Deleted ${deleted}/${total} ...`);
  }

  console.log(`Deletion complete. Total deleted: ${deleted}.`);
}

main().catch((err) => {
  console.error("Error deleting users:", err);
  process.exit(1);
});
