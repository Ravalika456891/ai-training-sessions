import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Admin-only metrics
router.get('/metrics', requireRole('admin'), AdminController.getMetrics);

// Roster (Admin & Instructor)
router.get('/roster/:workshopId', requireRole('admin', 'instructor'), AdminController.getRoster);

// Attendance marking (Admin & Instructor)
router.post('/attendance', requireRole('admin', 'instructor'), AdminController.markAttendance);

// Certificate issuance (Admin)
router.post('/certificates/issue', requireRole('admin'), AdminController.issueCertificate);

export default router;

