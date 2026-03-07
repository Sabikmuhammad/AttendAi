/**
 * MongoDB connection utility using Mongoose.
 * Implements a singleton connection with caching to prevent
 * multiple connections during Next.js hot reloads in development.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable in .env.local"
    );
}

/** Cached connection object — persisted across module re-evaluations in dev */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Extend the global namespace to store the cached connection
declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache;
}

const cached: MongooseCache = global.mongooseCache ?? {
    conn: null,
    promise: null,
};

if (!global.mongooseCache) {
    global.mongooseCache = cached;
}

/**
 * Connect to MongoDB Atlas.
 * Returns the cached connection if already established.
 */
export async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose
            .connect(MONGODB_URI, opts)
            .then((mongooseInstance) => {
                console.log("✅ MongoDB connected successfully");
                return mongooseInstance;
            })
            .catch((err) => {
                cached.promise = null;
                throw err;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
