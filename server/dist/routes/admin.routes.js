var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var admin_routes_exports = {};
__export(admin_routes_exports, {
  default: () => admin_routes_default
});
module.exports = __toCommonJS(admin_routes_exports);
var import_express = require("express");
var import_admin_controller = require("../controllers/admin.controller.js");
var import_auth_middleware = require("../middleware/auth.middleware.js");
const router = (0, import_express.Router)();
router.use(import_auth_middleware.authenticate);
router.get("/dashboard", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getDashboard);
router.get("/metrics", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getMetrics);
router.get("/students", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getStudents);
router.get("/students/:id", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getStudentById);
router.patch("/students/:id", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.updateStudentStatus);
router.patch("/students/:id/status", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.updateStudentStatus);
router.get("/users", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getStudents);
router.get("/users/:id", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getStudentById);
router.patch("/users/:id", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.updateStudentStatus);
router.get("/workshops", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getWorkshops);
router.post("/workshops", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.createWorkshop);
router.patch("/workshops/:id", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.updateWorkshop);
router.delete("/workshops/:id", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.deleteWorkshop);
router.get("/batches", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getWorkshops);
router.post("/batches", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.createWorkshop);
router.get("/sessions", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.getSessions);
router.post("/sessions", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.upsertSession);
router.patch("/sessions/:id", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.upsertSession);
router.get("/calendar/sessions", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.getCalendarSessions);
router.get("/calendar/sessions/:id", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.getCalendarSessionById);
router.post("/calendar/sessions", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.createCalendarSession);
router.patch("/calendar/sessions/:id", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.updateCalendarSession);
router.post("/calendar/sessions/:id/cancel", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.cancelCalendarSession);
router.post("/calendar/recurring", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.createRecurringSessions);
router.get("/instructors", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getInstructors);
router.post("/instructors", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.createInstructor);
router.patch("/instructors/:id", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.updateInstructor);
router.get("/enrollments", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getEnrollments);
router.patch("/enrollments/:id/cancel", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.cancelEnrollment);
router.get("/payments", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getPayments);
router.post("/payments/:id/reconcile", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.reconcilePayment);
router.get("/content", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.getContent);
router.post("/content", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.createContent);
router.patch("/content/:id", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.updateContent);
router.delete("/content/:id", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.deleteContent);
router.get("/materials", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.getContent);
router.post("/materials", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.createContent);
router.get("/assignments", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.getAssignments);
router.post("/assignments", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.createAssignment);
router.patch("/submissions/:id/review", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.reviewSubmission);
router.get("/notifications", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getNotifications);
router.post("/notifications", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.createNotification);
router.get("/certificates", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getCertificates);
router.post("/certificates/issue", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.issueCertificate);
router.patch("/certificates/:id/revoke", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.revokeCertificate);
router.get("/analytics", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getAnalytics);
router.get("/settings", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getSettings);
router.patch("/settings", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.updateSettings);
router.get("/audit-logs", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getAuditLogs);
router.get("/roster/:workshopId", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.getRoster);
router.post("/attendance", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.markAttendance);
var admin_routes_default = router;
