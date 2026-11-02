import { Router } from 'express';
import { WorkshopController } from '../controllers/workshop.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createWorkshopSchema, updateWorkshopSchema } from '../validators/workshop.validator.js';

const router = Router();

// Public routes
router.get('/', WorkshopController.getWorkshops);
router.get('/:id', WorkshopController.getWorkshopById);

// Admin-only routes
router.post(
  '/admin',
  authenticate,
  requireRole('admin'),
  validateRequest(createWorkshopSchema),
  WorkshopController.createWorkshop
);

router.patch(
  '/admin/:id',
  authenticate,
  requireRole('admin'),
  validateRequest(updateWorkshopSchema),
  WorkshopController.updateWorkshop
);

export default router;

