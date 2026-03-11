#!/bin/bash

# MongoDB Atlas Connection Test Script
# Usage: ./test-mongodb.sh

echo "🔍 Testing MongoDB Atlas Connection..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "   Create .env.local with your MONGODB_URI"
    exit 1
fi

# Check if MONGODB_URI is set
if ! grep -q "MONGODB_URI=" .env.local; then
    echo "❌ Error: MONGODB_URI not found in .env.local"
    exit 1
fi

echo "✅ .env.local file found"
echo ""

# Get current IP
echo "📍 Your current IP address:"
CURRENT_IP=$(curl -s ifconfig.me)
echo "   $CURRENT_IP"
echo ""

# Test MongoDB connection using Node.js
echo "🔌 Testing MongoDB connection..."
echo ""

node -e "
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.log('❌ MONGODB_URI not set in .env.local');
  process.exit(1);
}

console.log('📝 Connection string loaded (credentials hidden)');
console.log('');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('✅ SUCCESS! MongoDB Atlas connected');
  console.log('');
  console.log('✨ You can now use the admin module features:');
  console.log('   - Student Management');
  console.log('   - Class Management');
  console.log('   - Attendance Tracking');
  console.log('   - Reports & Analytics');
  console.log('');
  process.exit(0);
})
.catch((error) => {
  console.log('❌ FAILED! Could not connect to MongoDB Atlas');
  console.log('');
  console.log('Error:', error.message);
  console.log('');
  console.log('📋 Troubleshooting Steps:');
  console.log('');
  console.log('1. Whitelist your IP address in MongoDB Atlas:');
  console.log('   👉 Go to: https://cloud.mongodb.com');
  console.log('   👉 Click: Network Access → Add IP Address');
  console.log('   👉 Add: $CURRENT_IP (your current IP)');
  console.log('   👉 Or use: 0.0.0.0/0 for development only');
  console.log('');
  console.log('2. Verify your connection string in .env.local:');
  console.log('   👉 Check username and password are correct');
  console.log('   👉 URL-encode special characters in password');
  console.log('   👉 Ensure cluster is not paused');
  console.log('');
  console.log('3. Check MongoDB Atlas cluster status:');
  console.log('   👉 Go to: https://cloud.mongodb.com');
  console.log('   👉 Verify cluster is running (not paused)');
  console.log('');
  console.log('📖 Full guide: See MONGODB-FIX.md');
  console.log('');
  process.exit(1);
});
" || {
    echo ""
    echo "❌ Error running test. Make sure mongoose is installed:"
    echo "   npm install mongoose"
    echo ""
    exit 1
}
