import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  // If connection is already open in this serverless runtime, reuse it
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  // If connection is currently connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    return true;
  }

  // If running on Vercel without a configured remote MongoDB Atlas URI
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
  const isLocalhostURI = !env.MONGODB_URI || env.MONGODB_URI.includes('127.0.0.1') || env.MONGODB_URI.includes('localhost');

  if (isVercel && isLocalhostURI) {
    console.warn('[MongoDB Notice] Running on Vercel with default localhost MONGODB_URI. Please add your live MongoDB Atlas connection string in Vercel Project Settings.');
    isConnected = false;
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);
    
    // Connect with 4s timeout so serverless invocations don't freeze
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
      maxPoolSize: 10,
      autoIndex: !env.isProduction,
    });

    isConnected = true;
    console.log(`[MongoDB] Successfully connected to database: ${mongoose.connection.name}`);
    return true;
  } catch (error: any) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Could not establish connection to database.`);
    console.warn(`Reason: ${error.message}`);
    return false;
  }
};

export const isDBConnected = (): boolean => mongoose.connection.readyState === 1;

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Disconnected from database.');
  }
};

