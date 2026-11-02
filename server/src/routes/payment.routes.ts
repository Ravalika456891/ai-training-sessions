import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createOrderSchema, verifyPaymentSchema } from '../validators/payment.validator.js';

const router = Router();

// 1. Create Razorpay Order
router.post(
  '/create-order',
  optionalAuthenticate,
  validateRequest(createOrderSchema),
  PaymentController.createOrder
);

// 2. Cryptographically Verify Signature
router.post(
  '/verify',
  optionalAuthenticate,
  validateRequest(verifyPaymentSchema),
  PaymentController.verify
);

// 3. Razorpay Server-to-Server Webhook Receiver
router.post('/webhook', PaymentController.webhook);

// 4. Validate Coupon Code
router.post('/validate-coupon', PaymentController.validateCoupon);

// 5. Get Authenticated User's Payment History
router.get('/my-payments', authenticate, PaymentController.getMyPayments);

// 6. Get Payment Status for a Specific Enrollment
router.get('/enrollment/:enrollmentId', PaymentController.getPaymentByEnrollment);

export default router;
