import { Router } from 'express';
import { LearnerController } from '../controllers/learner.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', LearnerController.getDashboard);
router.post('/submissions', LearnerController.submitProject);
router.get('/submissions', LearnerController.getMySubmissions);
router.get('/certificates', LearnerController.getMyCertificates);
router.get('/payments', LearnerController.getPayments);
router.get('/progress', LearnerController.getProgress);

export default router;

