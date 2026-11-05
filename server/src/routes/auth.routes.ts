import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validateRequest(registerSchema),
  AuthController.register
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest(loginSchema),
  AuthController.login
);

router.post('/google', authRateLimiter, AuthController.googleAuth);

router.post('/forgot-password', authRateLimiter, AuthController.forgotPassword);
router.post('/reset-password', authRateLimiter, AuthController.resetPassword);

router.post('/logout', AuthController.logout);

router.get('/me', authenticate, AuthController.getMe);
router.put('/profile', authenticate, AuthController.updateProfile);
router.put('/change-password', authenticate, AuthController.changePassword);

export default router;

