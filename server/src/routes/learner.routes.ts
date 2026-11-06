import { Router } from 'express';
import { LearnerController } from '../controllers/learner.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireVerifiedWorkshopAccess } from '../middleware/enrollmentAccess.middleware.js';

const router = Router();

router.use(authenticate);

// Open to all authenticated Registered Users & Enrolled Students
router.get('/dashboard', LearnerController.getDashboard);
router.post('/enroll', LearnerController.enrollInWorkshop);
router.get('/submissions', LearnerController.getMySubmissions);
router.get('/certificates', LearnerController.getMyCertificates);
router.get('/payments', LearnerController.getPayments);
router.get('/progress', LearnerController.getProgress);

// Protected by 5-step Backend Access Control Middleware (Requires confirmed enrollment & captured payment)
router.get(
  '/materials',
  requireVerifiedWorkshopAccess({ resourceType: 'material' }),
  LearnerController.getAuthorizedMaterials
);
router.get(
  '/workshops/:workshopId/materials',
  requireVerifiedWorkshopAccess({ resourceType: 'material' }),
  LearnerController.getAuthorizedMaterials
);
router.get(
  '/live-classes',
  requireVerifiedWorkshopAccess({ resourceType: 'live_class' }),
  LearnerController.getAuthorizedLiveClasses
);
router.get(
  '/workshops/:workshopId/live-classes',
  requireVerifiedWorkshopAccess({ resourceType: 'live_class' }),
  LearnerController.getAuthorizedLiveClasses
);
router.post(
  '/submissions',
  requireVerifiedWorkshopAccess({ resourceType: 'assignment' }),
  LearnerController.submitProject
);
router.get(
  '/certificates/download',
  requireVerifiedWorkshopAccess({ resourceType: 'certificate', requireCompletion: true }),
  LearnerController.downloadCertificate
);
router.get(
  '/workshops/:workshopId/certificate',
  requireVerifiedWorkshopAccess({ resourceType: 'certificate', requireCompletion: true }),
  LearnerController.downloadCertificate
);

export default router;
