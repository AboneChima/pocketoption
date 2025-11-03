#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Running postinstall script...');

// Check if DATABASE_URL is set
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL found, generating Prisma client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma client generated successfully!');
  } catch (error) {
    console.warn('Warning: Prisma generation failed, but continuing...');
    console.warn(error.message);
  }
} else {
  console.log('DATABASE_URL not set, skipping Prisma generation.');
  console.log('The application will run in database-disabled mode.');
  console.log('Set DATABASE_URL environment variable to enable database features.');
}

console.log('Postinstall script completed.');