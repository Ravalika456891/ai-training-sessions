import { Router } from 'express';
import authRoutes from './auth.routes.js';
import workshopRoutes from './workshop.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import paymentRoutes from './payment.routes.js';
import learnerRoutes from './learner.routes.js';
import adminRoutes from './admin.routes.js';
import certificateRoutes from './certificate.routes.js';
import registrationRoutes from './registration.routes.js';
import { WorkshopController } from '../controllers/workshop.controller.js';
import { EnrollmentController } from '../controllers/enrollment.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createWorkshopSchema, updateWorkshopSchema } from '../validators/workshop.validator.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Launchpad Backend API is running.',
    timestamp: new Date().toISOString(),
  });
});

// Domain Routes
router.use('/auth', authRoutes);
router.use('/workshops', workshopRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/learners', learnerRoutes);
router.use('/admin', adminRoutes);
router.use('/certificates', certificateRoutes);
router.use('/registrations', registrationRoutes);

// Direct Admin Workshop endpoints
router.post(
  '/admin/workshops',
  authenticate,
  requireRole('admin'),
  validateRequest(createWorkshopSchema),
  WorkshopController.createWorkshop
);

router.patch(
  '/admin/workshops/:id',
  authenticate,
  requireRole('admin'),
  validateRequest(updateWorkshopSchema),
  WorkshopController.updateWorkshop
);

router.get(
  '/admin/enrollments',
  authenticate,
  requireRole('admin'),
  EnrollmentController.getAllEnrollments
);

export default router;
