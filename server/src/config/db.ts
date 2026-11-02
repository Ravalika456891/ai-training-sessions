import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async (): Promise<boolean> => {
  if (isConnected) {
    return true;
  }

  try {
    mongoose.set('strictQuery', true);
    
    // Connect with 5s timeout to not hang if MongoDB Atlas is not yet provisioned
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });

    isConnected = true;
    console.log(`[MongoDB] Successfully connected to database: ${mongoose.connection.name}`);
    return true;
  } catch (error: any) {
    console.warn(`[MongoDB Warning] Could not establish connection to ${env.MONGODB_URI}`);
    console.warn(`Reason: ${error.message}`);
    console.warn(`Please set MONGODB_URI in server/.env with your valid MongoDB Atlas connection string.`);
    return false;
  }
};

export const isDBConnected = (): boolean => isConnected;

export const disconnectDB = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[MongoDB] Disconnected from database.');
  }
};

