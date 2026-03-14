/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require('mongoose');

const DEFAULT_INSTITUTION_ID =
  process.env.DEFAULT_INSTITUTION_ID || 'default-institution';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable.');
  process.exit(1);
}

async function backfillCollection(modelName, update, filter = {}) {
  const model = mongoose.models[modelName];
  if (!model) {
    console.warn(`Model not found: ${modelName}`);
    return;
  }

  const query = {
    ...filter,
    $or: [{ institutionId: { $exists: false } }, { institutionId: null }, { institutionId: '' }],
  };

  const result = await model.updateMany(query, update);
  console.log(`${modelName}: matched=${result.matchedCount}, modified=${result.modifiedCount}`);
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected. Starting migration...');

  // Register lightweight models so updateMany helper can work in plain Node.
  const modelMap = {
    User: 'users',
    Faculty: 'faculties',
    Student: 'students',
    Class: 'classes',
    Classroom: 'classrooms',
    Attendance: 'attendances',
    Department: 'departments',
    Camera: 'cameras',
  };

  Object.entries(modelMap).forEach(([modelName, collectionName]) => {
    if (!mongoose.models[modelName]) {
      mongoose.model(modelName, new mongoose.Schema({}, { strict: false, collection: collectionName }));
    }
  });

  await backfillCollection('User', {
    $set: { institutionId: DEFAULT_INSTITUTION_ID },
    $setOnInsert: { departmentIds: [] },
  });

  await backfillCollection('Faculty', {
    $set: { institutionId: DEFAULT_INSTITUTION_ID },
  });

  await backfillCollection('Student', {
    $set: { institutionId: DEFAULT_INSTITUTION_ID },
  });

  await backfillCollection('Class', {
    $set: { institutionId: DEFAULT_INSTITUTION_ID },
  });

  await backfillCollection('Classroom', {
    $set: { institutionId: DEFAULT_INSTITUTION_ID },
  });

  await backfillCollection('Attendance', {
    $set: { institutionId: DEFAULT_INSTITUTION_ID },
  });

  await backfillCollection('Department', {
    $set: { institutionId: DEFAULT_INSTITUTION_ID },
  });

  await backfillCollection('Camera', {
    $set: { institutionId: DEFAULT_INSTITUTION_ID },
  });

  // Ensure departmentIds exists on all users.
  const User = mongoose.models.User;
  if (User) {
    const depResult = await User.updateMany(
      { $or: [{ departmentIds: { $exists: false } }, { departmentIds: null }] },
      { $set: { departmentIds: [] } }
    );
    console.log(`User.departmentIds: matched=${depResult.matchedCount}, modified=${depResult.modifiedCount}`);
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Migration failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
