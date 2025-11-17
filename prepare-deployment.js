// ========================================
// Deployment Preparation Script
// ========================================
// This script helps prepare your app for deployment
// Run: node prepare-deployment.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🚀 ShopHub Deployment Preparation\n');
console.log('=====================================\n');

// Check required files
const requiredFiles = [
  'server.js',
  'package.json',
  '.htaccess',
  'ecosystem.config.js',
  'src/models/User.js',
  'src/models/Product.js',
  'src/models/Order.js',
  'public/index.html',
  'public/customer.html',
  'public/admin.html',
  'public/master.html'
];

console.log('✅ Checking required files...\n');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✓ ${file}`);
  } else {
    console.log(`   ✗ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

console.log('\n=====================================\n');

// Check package.json
console.log('📦 Checking package.json...\n');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (packageJson.scripts && packageJson.scripts.start) {
  console.log(`   ✓ Start script: ${packageJson.scripts.start}`);
} else {
  console.log('   ✗ No start script found!');
  allFilesExist = false;
}

if (packageJson.engines && packageJson.engines.node) {
  console.log(`   ✓ Node version: ${packageJson.engines.node}`);
} else {
  console.log('   ⚠ No Node.js version specified (recommended)');
}

console.log('\n=====================================\n');

// Check uploads directory
console.log('📁 Checking directories...\n');
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('   ⚠ Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('   ✓ Uploads directory created');
} else {
  console.log('   ✓ Uploads directory exists');
}

console.log('\n=====================================\n');

// Summary
if (allFilesExist) {
  console.log('✅ All checks passed!\n');
  console.log('📋 Next Steps:\n');
  console.log('1. Complete MongoDB Atlas setup');
  console.log('2. Get your Stripe LIVE API keys');
  console.log('3. Upload files to Hostinger via FTP');
  console.log('4. Configure environment variables in Hostinger');
  console.log('5. Install dependencies via SSH: npm install');
  console.log('6. Start your application in Hostinger Node.js panel\n');
  console.log('📖 See DEPLOYMENT_GUIDE.md for detailed instructions\n');
} else {
  console.log('❌ Some files are missing!\n');
  console.log('Please ensure all required files exist before deploying.\n');
}

console.log('=====================================\n');

