const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const mongoLine = envContent.split('\n').find(line => line.trim().startsWith('MONGODB_URI='));
const mongoUri = mongoLine.split('MONGODB_URI=')[1].trim();

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isVerified: Boolean,
  imageUrl: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function listUsers() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    const users = await User.find({}).lean();
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('\nRun: node scripts/create-verified-user.js');
    } else {
      console.log(`📊 Found ${users.length} user(s):\n`);
      users.forEach((user, idx) => {
        console.log(`${idx + 1}. Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Verified: ${user.isVerified}`);
        console.log(`   Has Password: ${!!user.password}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

listUsers();
