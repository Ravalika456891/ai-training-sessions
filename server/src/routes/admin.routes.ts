import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All admin routes require an authenticated session
router.use(authenticate);

// 1. Overview & Metrics (Admin only)
router.get('/dashboard', requireRole('admin'), AdminController.getDashboard);
router.get('/metrics', requireRole('admin'), AdminController.getMetrics);

// 2. Student Directory & Account Management (Admin only)
router.get('/students', requireRole('admin'), AdminController.getStudents);
router.get('/students/:id', requireRole('admin'), AdminController.getStudentById);
router.patch('/students/:id', requireRole('admin'), AdminController.updateStudentStatus);
router.patch('/students/:id/status', requireRole('admin'), AdminController.updateStudentStatus);

// 3. Workshop Management (Admin only)
router.get('/workshops', requireRole('admin'), AdminController.getWorkshops);
router.post('/workshops', requireRole('admin'), AdminController.createWorkshop);
router.patch('/workshops/:id', requireRole('admin'), AdminController.updateWorkshop);
router.delete('/workshops/:id', requireRole('admin'), AdminController.deleteWorkshop);

// 4. Batch & Session Management (Admin & Instructor view, Admin mutate)
router.get('/sessions', requireRole('admin', 'instructor'), AdminController.getSessions);
router.post('/sessions', requireRole('admin'), AdminController.upsertSession);
router.patch('/sessions/:id', requireRole('admin'), AdminController.upsertSession);

// 5. Instructor Management (Admin only)
router.get('/instructors', requireRole('admin'), AdminController.getInstructors);
router.post('/instructors', requireRole('admin'), AdminController.createInstructor);
router.patch('/instructors/:id', requireRole('admin'), AdminController.updateInstructor);

// 6. Registration & Enrollment Management (Admin only)
router.get('/enrollments', requireRole('admin'), AdminController.getEnrollments);
router.patch('/enrollments/:id/cancel', requireRole('admin'), AdminController.cancelEnrollment);

// 7. Payment Management & Reconciliation (Admin only)
router.get('/payments', requireRole('admin'), AdminController.getPayments);
router.post('/payments/:id/reconcile', requireRole('admin'), AdminController.reconcilePayment);

// 8. Content Management (Admin & Instructor)
router.get('/content', requireRole('admin', 'instructor'), AdminController.getContent);
router.post('/content', requireRole('admin', 'instructor'), AdminController.createContent);
router.patch('/content/:id', requireRole('admin', 'instructor'), AdminController.updateContent);
router.delete('/content/:id', requireRole('admin'), AdminController.deleteContent);

// 9. Certificate Management (Admin only)
router.get('/certificates', requireRole('admin'), AdminController.getCertificates);
router.post('/certificates/issue', requireRole('admin'), AdminController.issueCertificate);
router.patch('/certificates/:id/revoke', requireRole('admin'), AdminController.revokeCertificate);

// 10. Analytics Reports (Admin only)
router.get('/analytics', requireRole('admin'), AdminController.getAnalytics);

// 11. Platform Settings & Audit Logs (Admin only)
router.get('/settings', requireRole('admin'), AdminController.getSettings);
router.patch('/settings', requireRole('admin'), AdminController.updateSettings);
router.get('/audit-logs', requireRole('admin'), AdminController.getAuditLogs);

// 12. Roster & Attendance (Admin & Instructor)
router.get('/roster/:workshopId', requireRole('admin', 'instructor'), AdminController.getRoster);
router.post('/attendance', requireRole('admin', 'instructor'), AdminController.markAttendance);

export default router;
