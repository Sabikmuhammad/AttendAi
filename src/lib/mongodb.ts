import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  indexesChecked?: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null, indexesChecked: false };
}

async function ensureDatabaseIndexes() {
  if (cached!.indexesChecked) {
    return;
  }

  try {
    const usersCollection = mongoose.connection.collection('users');
    const indexes = await usersCollection.indexes();
    const legacyEmailIndex = indexes.find((index) => index.name === 'email_1' && index.unique);

    if (legacyEmailIndex) {
      await usersCollection.dropIndex('email_1');
      console.log('[MongoDB] Dropped legacy unique index users.email_1');
    }
  } catch (error) {
    console.warn(
      '[MongoDB] Could not verify/drop legacy user indexes:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  cached!.indexesChecked = true;
}

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Fail fast after 5 seconds
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached!.conn = await cached!.promise;
    await ensureDatabaseIndexes();
    console.log('[MongoDB] Connected successfully');
  } catch (e) {
    cached!.promise = null;
    console.error('[MongoDB] Connection failed:', e instanceof Error ? e.message : 'Unknown error');
    console.error('[MongoDB] Check MONGODB-FIX.md for troubleshooting steps');
    throw e;
  }

  return cached!.conn;
}
