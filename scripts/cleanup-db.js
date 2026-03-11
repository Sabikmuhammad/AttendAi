const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const mongoLine = envContent.split('\n').find(line => line.trim().startsWith('MONGODB_URI='));
const mongoUri = mongoLine.split('MONGODB_URI=')[1].trim();

async function cleanup() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Drop the old clerkId index
    try {
      await usersCollection.dropIndex('clerkId_1');
      console.log('✅ Dropped old clerkId index');
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  clerkId index already removed');
      } else {
        console.log('⚠️  Error dropping index:', error.message);
      }
    }

    // List all users
    const users = await usersCollection.find({}).toArray();
    console.log(`\n📊 Found ${users.length} user(s) in database:`);
    users.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.email} - Role: ${user.role} - Verified: ${user.isVerified}`);
    });

    // Remove all existing users (clean slate)
    const deleteResult = await usersCollection.deleteMany({});
    console.log(`\n🗑️  Deleted ${deleteResult.deletedCount} user(s)`);

    console.log('\n✅ Database cleanup complete!');
    console.log('You can now run: node scripts/create-verified-user.js');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanup();
