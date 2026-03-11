// Run: node scripts/create-verified-user.js
// Creates a verified admin user for testing

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://muhammadsabik:muhammadsabik2005@cluster0.p4gvz.mongodb.net/?appName=Cluster0';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isVerified: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

async function createVerifiedUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@attendai.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@attendai.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create verified admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await User.create({
      name: 'Admin User',
      email: 'admin@attendai.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    console.log('✅ Verified admin user created!');
    console.log('');
    console.log('Login credentials:');
    console.log('Email: admin@attendai.com');
    console.log('Password: admin123');
    console.log('');
    console.log('Login at: http://localhost:3000/login');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createVerifiedUser();
