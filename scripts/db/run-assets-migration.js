const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// Also load from .env.local if it exists
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocalConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const k in envLocalConfig) {
    process.env[k] = envLocalConfig[k];
  }
  console.log('Loaded environment variables from .env.local');
}

// Get database connection string from environment variables
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('POSTGRES_URL environment variable is not set');
  console.error('Please ensure POSTGRES_URL is set in .env.local');
  process.exit(1);
}

console.log('Database connection string found');
console.log('Using Drizzle Kit to generate and apply migrations...');

try {
  // Generate migrations using drizzle-kit
  console.log('\n1. Generating migration...');
  execSync('npx drizzle-kit generate', { stdio: 'inherit' });
  
  // Apply migrations using drizzle-kit
  console.log('\n2. Applying migration...');
  execSync('npx drizzle-kit migrate', { stdio: 'inherit' });
  
  console.log('\nMigration completed successfully!');
  console.log('The assets and attachments tables have been created in your database.');
} catch (error) {
  console.error('\nError during migration:', error.message);
  console.error('\nTroubleshooting tips:');
  console.error('1. Make sure drizzle-kit is installed');
  console.error('2. Check that your POSTGRES_URL is correct');
  console.error('3. Ensure you have the necessary database permissions');
  console.error('4. Check if the schema already exists');
  process.exit(1);
} 