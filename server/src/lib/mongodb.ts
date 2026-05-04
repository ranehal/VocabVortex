/**
 * Database Connection Module
 * Handles establishing and caching the connection to MongoDB.
 * Caching is crucial in serverless environments (like Next.js API routes)
 * to prevent exhausting database connection limits across hot reloads or many requests.
 */
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vocabvortex';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global cache object to store the connection and promise.
 * This ensures that across hot reloads in development, we don't multiply connections.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Connects to MongoDB using Mongoose.
 * Reuses the existing connection if it exists in the global cache.
 * 
 * @returns {Promise<mongoose.Connection>} The established Mongoose connection.
 */
async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

export default dbConnect;

