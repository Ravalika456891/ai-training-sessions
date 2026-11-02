import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_launchpad',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_development_secret_do_not_use_in_prod_12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: process.env.COOKIE_NAME || 'ai_launchpad_token',
  ADMIN_NAME: process.env.ADMIN_NAME || 'System Administrator',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@ailaunchpad.edu',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminLaunchpad2026!',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyId',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'YourTestKeySecret12345',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'YourWebhookSecret67890',
  isProduction: process.env.NODE_ENV === 'production',
};
