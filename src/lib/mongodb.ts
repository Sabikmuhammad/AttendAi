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

function isTransientMongoConnectError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : '';
  return (
    message.includes('querySrv ENOTFOUND') ||
    message.includes('ServerSelectionError') ||
    message.includes('connection <monitor>') ||
    message.includes('ECONNRESET') ||
    message.includes('ETIMEDOUT')
  );
}

async function connectWithRetry(
  uri: string,
  options: Parameters<typeof mongoose.connect>[1],
  maxRetries = 2
) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await mongoose.connect(uri, options);
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !isTransientMongoConnectError(error)) {
        throw error;
      }

      const waitMs = (attempt + 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError;
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

  try {
    const classroomsCollection = mongoose.connection.collection('classrooms');
    const indexes = await classroomsCollection.indexes();
    const legacyRoomNumberIndex = indexes.find(
      (index) => index.name === 'roomNumber_1' && index.unique
    );

    if (legacyRoomNumberIndex) {
      await classroomsCollection.dropIndex('roomNumber_1');
      console.log('[MongoDB] Dropped legacy unique index classrooms.roomNumber_1');
    }

    const scopedRoomIndex = indexes.find(
      (index) => index.name === 'institutionId_1_roomNumber_1' && index.unique
    );

    if (!scopedRoomIndex) {
      await classroomsCollection.createIndex(
        { institutionId: 1, roomNumber: 1 },
        { unique: true, name: 'institutionId_1_roomNumber_1' }
      );
      console.log('[MongoDB] Ensured unique index classrooms.institutionId_1_roomNumber_1');
    }
  } catch (error) {
    console.warn(
      '[MongoDB] Could not verify/drop legacy classroom indexes:',
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
      // Atlas M0 free clusters can take 30-60s to auto-resume from pause
      serverSelectionTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    cached!.promise = connectWithRetry(MONGODB_URI, opts, 2);
  }

  try {
    cached!.conn = await cached!.promise;
    await ensureDatabaseIndexes();
    console.log('[MongoDB] Connected successfully');
  } catch (e) {
    cached!.promise = null;
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('[MongoDB] Connection failed:', msg);
    if (msg.includes('Server selection timed out') || msg.includes('ServerSelectionError')) {
      console.error(
        '[MongoDB] LIKELY CAUSE: Your Atlas cluster may be paused.\n' +
        '  → Visit https://cloud.mongodb.com → Clusters → Resume cluster\n' +
        '  → Also check Network Access: add your IP or 0.0.0.0/0'
      );
    }
    throw e;
  }

  return cached!.conn;
}
