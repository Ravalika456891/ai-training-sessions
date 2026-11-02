import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { enrollmentRateLimiter } from '../middleware/rateLimit.middleware.js';
import { createEnrollmentSchema } from '../validators/enrollment.validator.js';

const router = Router();

// Public / Learner registration endpoint
router.post(
  '/',
  enrollmentRateLimiter,
  optionalAuthenticate,
  validateRequest(createEnrollmentSchema),
  EnrollmentController.register
);

// Authenticated learner view of own enrollments
router.get('/me', authenticate, EnrollmentController.getMyEnrollments);

// Administrator view of all enrollments
router.get('/admin', authenticate, requireRole('admin'), EnrollmentController.getAllEnrollments);

export default router;

