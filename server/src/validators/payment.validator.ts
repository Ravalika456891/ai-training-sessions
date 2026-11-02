import { z } from 'zod';

export const createOrderSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  couponCode: z.string().trim().toUpperCase().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Razorpay Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay Signature is required'),
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
});

export const validateCouponSchema = z.object({
  couponCode: z.string().min(1, 'Coupon code is required').trim().toUpperCase(),
  workshopId: z.string().min(1, 'Workshop ID is required'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
