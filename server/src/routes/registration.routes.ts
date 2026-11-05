import { Router } from 'express';
import { RegistrationController } from '../controllers/registration.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createRegistrationSchema } from '../validators/registration.validator.js';
import { registrationRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// POST /api/registrations - Register participant for a training batch
router.post(
  '/',
  registrationRateLimiter,
  validateRequest(createRegistrationSchema),
  RegistrationController.createRegistration
);

// GET /api/registrations - Query registrations
router.get('/', RegistrationController.getRegistrations);

export default router;

