import { env } from './env.js';

let razorpayClient: any = null;

try {
  // Use require to isolate razorpay from static TypeScript type parsing
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Razorpay = require('razorpay');
  razorpayClient = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
} catch {
  razorpayClient = {
    orders: {
      create: async (params: any) => ({
        id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        ...params,
      }),
    },
  };
}

export const razorpayInstance = razorpayClient;

export const isRazorpayConfigured = (): boolean => {
  return (
    Boolean(env.RAZORPAY_KEY_ID) &&
    Boolean(env.RAZORPAY_KEY_SECRET) &&
    env.RAZORPAY_KEY_ID !== 'rzp_test_YourTestKeyId'
  );
};
