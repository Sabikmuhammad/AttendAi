// Run: node scripts/create-super-admin.js
// Creates a verified super admin user for testing

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

function readEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const env = fs.readFileSync(envPath, 'utf8');
  const find = (key) => {
    const line = env
      .split('\n')
      .find((l) => l.trim().startsWith(`${key}=`));
    return line ? line.split(`${key}=`)[1].trim() : '';
  };

  return {
    mongoUri: find('MONGODB_URI'),
    defaultInstitutionId: find('DEFAULT_INSTITUTION_ID') || 'default-institution',
  };
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  password: String,
  role: String,
  institutionId: String,
  departmentIds: [String],
  isVerified: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const InstitutionSchema = new mongoose.Schema({
  name: String,
  subdomain: String,
  code: String,
  plan: String,
  planLimits: {
    students: Number,
    faculty: Number,
    cameras: Number,
    classes: Number,
  },
  domain: String,
  contactEmail: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

async function createSuperAdmin() {
  const { mongoUri, defaultInstitutionId } = readEnvLocal();

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in .env.local');
  }

  await mongoose.connect(mongoUri);
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const Institution =
    mongoose.models.Institution || mongoose.model('Institution', InstitutionSchema);

  const superInstitutionCode = 'SUPER';
  let superInstitution = await Institution.findOne({ code: superInstitutionCode });

  if (!superInstitution) {
    superInstitution = await Institution.create({
      name: 'Platform Super Admin',
      subdomain: 'super',
      code: superInstitutionCode,
      plan: 'enterprise',
      planLimits: {
        students: 50000,
        faculty: 2500,
        cameras: 1000,
        classes: 5000,
      },
      domain: 'platform.internal',
      contactEmail: 'superadmin@attendai.com',
      status: 'active',
    });
  } else {
    if (!superInstitution.subdomain) superInstitution.subdomain = 'super';
    if (!superInstitution.plan) superInstitution.plan = 'enterprise';
    if (!superInstitution.planLimits) {
      superInstitution.planLimits = {
        students: 50000,
        faculty: 2500,
        cameras: 1000,
        classes: 5000,
      };
    }
    if (!superInstitution.status) superInstitution.status = 'active';
    await superInstitution.save();
  }

  const email = 'superadmin@attendai.com';
  const password = 'SuperAdmin123!';

  const existing = await User.findOne({ email });
  if (existing) {
    const updatedHash = await bcrypt.hash(password, 12);
    existing.role = 'super_admin';
    existing.isVerified = true;
    existing.institutionId = String(superInstitution._id) || defaultInstitutionId;
    existing.departmentIds = existing.departmentIds || [];
    existing.passwordHash = updatedHash;
    existing.password = updatedHash;
    await existing.save();
    console.log('Updated existing user to verified super_admin');

    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Institution Code: ${superInstitutionCode}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    name: 'Super Admin',
    email,
    passwordHash: hashedPassword,
    password: hashedPassword,
    role: 'super_admin',
    institutionId: String(superInstitution._id),
    departmentIds: [],
    isVerified: true,
  });

  console.log('Created verified super_admin user');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Institution Code: ${superInstitutionCode}`);
}

createSuperAdmin()
  .catch((err) => {
    console.error('Error:', err.message || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
