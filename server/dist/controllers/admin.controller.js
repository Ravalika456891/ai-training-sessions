var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var admin_controller_exports = {};
__export(admin_controller_exports, {
  AdminController: () => AdminController
});
module.exports = __toCommonJS(admin_controller_exports);
var import_crypto = __toESM(require("crypto"));
var import_mongoose = __toESM(require("mongoose"));
var import_User = require("../models/User.js");
var import_Enrollment = require("../models/Enrollment.js");
var import_Registration = require("../models/Registration.js");
var import_Workshop = require("../models/Workshop.js");
var import_WorkshopSession = require("../models/WorkshopSession.js");
var import_Payment = require("../models/Payment.js");
var import_Attendance = require("../models/Attendance.js");
var import_Certificate = require("../models/Certificate.js");
var import_Assignment = require("../models/Assignment.js");
var import_ProjectSubmission = require("../models/ProjectSubmission.js");
var import_LearningResource = require("../models/LearningResource.js");
var import_AuditLog = require("../models/AuditLog.js");
var import_PlatformSettings = require("../models/PlatformSettings.js");
var import_apiError = require("../utils/apiError.js");
var import_env = require("../config/env.js");
var import_db = require("../config/db.js");
var import_seed = require("../utils/seed.js");
var import_memoryStore = require("../services/memoryStore.js");
var import_razorpay = require("../config/razorpay.js");
class AdminController {
  /**
   * Helper: Record immutable audit log in MongoDB Atlas + memoryStore
   */
  static async logAudit(req, action, entityType, summary, entityId, metadata) {
    const entry = {
      actorId: req.user?._id?.toString() || "admin",
      actorEmail: req.user?.email || import_env.env.ADMIN_EMAIL,
      actorRole: req.user?.role || "admin",
      action,
      entityType,
      entityId,
      summary,
      metadata: metadata || {},
      ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1"
    };
    try {
      await import_memoryStore.memoryStore.createAuditLog(entry);
      if ((0, import_db.isDBConnected)()) {
        await import_AuditLog.AuditLog.create(entry);
      }
    } catch (err) {
      console.warn("[Admin Audit Log Warning]", err.message);
    }
  }
  /**
   * Helper: Sanitize user record so passwordHash, resetPasswordToken, etc. are NEVER exposed
   */
  static sanitizeUser(u) {
    if (!u) return null;
    const obj = typeof u.toObject === "function" ? u.toObject() : { ...u };
    delete obj.passwordHash;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    delete obj.__v;
    return {
      _id: obj._id?.toString(),
      name: obj.name,
      email: obj.email,
      phone: obj.phone || { countryCode: "+91", number: "" },
      role: obj.role || "learner",
      accountStatus: obj.accountStatus || "active",
      userCategory: obj.userCategory || "working_professional",
      experienceLevel: obj.experienceLevel || "beginner",
      bio: obj.bio || "",
      expertise: obj.expertise || [],
      availabilityStatus: obj.availabilityStatus || "available",
      avatarUrl: obj.avatarUrl || "",
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    };
  }
  /**
   * TASK 2 — ADMIN OVERVIEW (`GET /api/admin/dashboard` & `GET /api/admin/metrics`)
   * Computes real database metrics using MongoDB queries/aggregations and actual records.
   */
  static async getDashboard(req, res, next) {
    try {
      let users = [];
      let workshops = [];
      let enrollments = [];
      let registrations = [];
      let payments = [];
      let attendanceRecords = [];
      let certificates = [];
      let submissions = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          workshops = await import_Workshop.Workshop.find().sort({ startDate: 1 });
          if (workshops.length === 0 || workshops.some((w) => ["AILP-2026-NOV-28", "AILP-2026-DEC-12"].includes(w.batchCode))) {
            await (0, import_seed.seedDatabase)();
            workshops = await import_Workshop.Workshop.find().sort({ startDate: 1 });
          }
          [
            users,
            enrollments,
            registrations,
            payments,
            attendanceRecords,
            certificates,
            submissions
          ] = await Promise.all([
            import_User.User.find().select("-passwordHash -resetPasswordToken -resetPasswordExpires").sort({ createdAt: -1 }),
            import_Enrollment.Enrollment.find().populate("workshopId", "title batchCode startDate price").populate("userId", "name email").sort({ createdAt: -1 }),
            import_Registration.Registration.find().sort({ createdAt: -1 }),
            import_Payment.Payment.find().populate("workshopId", "title batchCode").populate("userId", "name email").sort({ createdAt: -1 }),
            import_Attendance.Attendance.find(),
            import_Certificate.Certificate.find().sort({ createdAt: -1 }),
            import_ProjectSubmission.ProjectSubmission.find().sort({ createdAt: -1 })
          ]);
        } catch (err) {
          console.warn("[Admin Dashboard DB Fallback]", err.message);
        }
      }
      if (users.length === 0) {
        users = (await import_memoryStore.memoryStore.getAllUsers()).map(AdminController.sanitizeUser);
      }
      if (workshops.length === 0) {
        workshops = await import_memoryStore.memoryStore.getAllWorkshops();
      }
      if (enrollments.length === 0) {
        enrollments = await import_memoryStore.memoryStore.getAllEnrollments();
      }
      if (registrations.length === 0) {
        registrations = await import_memoryStore.memoryStore.getAllRegistrations();
      }
      if (certificates.length === 0) {
        certificates = await import_memoryStore.memoryStore.getAllCertificates();
      }
      const studentUsers = users.filter((u) => u.role === "learner");
      const totalRegisteredStudents = Math.max(studentUsers.length, registrations.length + enrollments.length);
      const activeStudents = studentUsers.filter((u) => (u.accountStatus || "active") === "active").length || totalRegisteredStudents;
      const totalWorkshops = workshops.length;
      const now = /* @__PURE__ */ new Date();
      const upcomingWorkshops = workshops.filter(
        (w) => w.status === "published" && new Date(w.startDate) >= now
      ).length;
      const confirmedEnrollmentsCount = enrollments.filter((e) => e.status === "confirmed").length + registrations.filter((r) => r.registrationStatus === "confirmed").length;
      const pendingEnrollmentsCount = enrollments.filter((e) => e.status === "pending" || e.status === "reserved" || e.status === "pending_payment").length + registrations.filter((r) => r.registrationStatus === "pending").length;
      const totalEnrollments = enrollments.length + registrations.length;
      const capturedPayments = payments.filter((p) => p.status === "captured");
      const verifiedPaymentRevenue = capturedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const paidRegRevenue = registrations.filter((r) => r.paymentStatus === "paid").reduce((sum) => sum + 1999, 0);
      const verifiedRevenue = verifiedPaymentRevenue + paidRegRevenue;
      const totalCapacity = workshops.reduce((acc, w) => acc + (Number(w.capacity) || 60), 0);
      const totalEnrolled = workshops.reduce((acc, w) => acc + (Number(w.enrolledCount) || 0), 0) + registrations.length;
      const capacityFillRate = totalCapacity > 0 ? Math.min(100, Math.round(totalEnrolled / totalCapacity * 100)) : 0;
      const presentCount = attendanceRecords.filter((a) => a.status === "present").length;
      const expectedAttendanceSlots = Math.max(confirmedEnrollmentsCount * 2, attendanceRecords.length);
      const attendancePercentage = expectedAttendanceSlots > 0 && attendanceRecords.length > 0 ? Math.min(100, Math.round(presentCount / expectedAttendanceSlots * 100)) : 0;
      const totalCertificates = certificates.filter((c) => !c.isRevoked).length;
      const enrollmentTrend = workshops.map((w) => {
        const batchRegs = registrations.filter(
          (r) => r.batchId === w._id?.toString() || r.batchId === w.batchCode
        ).length;
        const batchEnrs = enrollments.filter(
          (e) => e.workshopId?._id?.toString() === w._id?.toString() || e.workshop === w._id?.toString()
        ).length;
        const count = Math.max(Number(w.enrolledCount) || 0, batchRegs + batchEnrs);
        return {
          label: w.batchCode || w.title,
          enrollments: count,
          capacity: w.capacity || 60
        };
      });
      const revenueTrend = workshops.map((w) => {
        const batchPayments = capturedPayments.filter(
          (p) => p.workshopId?._id?.toString() === w._id?.toString()
        );
        const rev = batchPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        return {
          label: w.batchCode || w.title,
          revenue: rev
        };
      });
      const recentRegistrations = [
        ...registrations.map((r) => ({
          _id: r._id?.toString(),
          enrollmentId: `REG-${r._id?.toString().slice(-6).toUpperCase()}`,
          studentName: r.name,
          email: r.email,
          phone: r.phone,
          batchCode: r.batchId,
          status: r.registrationStatus,
          paymentStatus: r.paymentStatus,
          createdAt: r.createdAt
        })),
        ...enrollments.map((e) => ({
          _id: e._id?.toString(),
          enrollmentId: e.enrollmentId,
          studentName: e.attendeeDetails?.fullName || e.userId?.name || "Student",
          email: e.attendeeDetails?.email || e.userId?.email || "",
          phone: e.attendeeDetails?.phone || "",
          batchCode: e.workshopId?.batchCode || e.workshop || "AILP-2026",
          status: e.status,
          paymentStatus: e.paymentStatus,
          createdAt: e.enrolledAt || e.createdAt
        }))
      ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 8);
      const sessions = await import_memoryStore.memoryStore.getAllSessions();
      const upcomingSessions = workshops.filter((w) => w.status === "published").map((w) => ({
        _id: w._id?.toString(),
        batchCode: w.batchCode,
        title: w.title,
        instructorName: w.instructor?.name || "Vikram Malhotra",
        startDate: w.startDate,
        endDate: w.endDate,
        timings: w.timings || "10:00 AM \u2013 3:00 PM IST",
        timezone: w.timezone || "Asia/Kolkata (IST)",
        availableSeats: w.availableSeats ?? Math.max(0, (w.capacity || 60) - (w.enrolledCount || 0)),
        capacity: w.capacity || 60
      }));
      const pendingSubmissions = submissions.filter((s) => s.status === "submitted").length;
      const pendingActions = [
        ...pendingEnrollmentsCount > 0 ? [
          {
            id: "act_pending_enr",
            type: "enrollment",
            title: `${pendingEnrollmentsCount} Pending Enrollment(s) Awaiting Payment Confirmation`,
            priority: "medium",
            link: "/admin/enrollments"
          }
        ] : [],
        ...pendingSubmissions > 0 ? [
          {
            id: "act_pending_sub",
            type: "submission",
            title: `${pendingSubmissions} Capstone Project Submission(s) Queued for Review`,
            priority: "high",
            link: "/admin/certificates"
          }
        ] : [],
        {
          id: "act_upcoming_cohort",
          type: "session",
          title: `${upcomingWorkshops} Published Cohort(s) Open for Live Registration`,
          priority: "low",
          link: "/admin/workshops"
        }
      ];
      res.status(200).json({
        success: true,
        data: {
          // Standard & Legacy keys so both AdminConsoleModal and new AdminDashboard work seamlessly
          totalRegisteredStudents,
          activeStudents,
          totalWorkshops,
          upcomingWorkshops,
          confirmedEnrollments: confirmedEnrollmentsCount,
          pendingEnrollments: pendingEnrollmentsCount,
          totalEnrollments,
          verifiedRevenue,
          totalRevenue: verifiedRevenue,
          attendancePercentage,
          totalCapacity,
          totalEnrolled,
          capacityFillRate,
          totalCertificates,
          activeCohortsCount: upcomingWorkshops,
          enrollmentTrend,
          revenueTrend,
          recentRegistrations,
          upcomingSessions,
          sessionsCount: sessions.length,
          pendingActions
        }
      });
    } catch (error) {
      next(error);
    }
  }
  static async getMetrics(req, res, next) {
    return AdminController.getDashboard(req, res, next);
  }
  /**
   * TASK 3 — STUDENT MANAGEMENT (`GET /api/admin/students`, `GET /api/admin/students/:id`, `PATCH /api/admin/students/:id`)
   */
  static async getStudents(req, res, next) {
    try {
      const search = (req.query.search || "").trim().toLowerCase();
      const statusFilter = req.query.status || "all";
      const categoryFilter = req.query.category || "all";
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      let allUsers = [];
      let enrollments = [];
      let registrations = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          allUsers = await import_User.User.find({ role: "learner" }).select("-passwordHash -resetPasswordToken -resetPasswordExpires").sort({ createdAt: -1 });
          enrollments = await import_Enrollment.Enrollment.find().populate("workshopId", "title batchCode");
          registrations = await import_Registration.Registration.find().sort({ createdAt: -1 });
        } catch (err) {
          console.warn("[Admin getStudents DB Fallback]", err.message);
        }
      }
      const memUsers = (await import_memoryStore.memoryStore.getAllUsers()).filter((u) => u.role === "learner");
      const seenEmails = new Set(allUsers.map((u) => u.email?.toLowerCase()));
      for (const mu of memUsers) {
        if (!seenEmails.has(mu.email.toLowerCase())) {
          seenEmails.add(mu.email.toLowerCase());
          allUsers.push(mu);
        }
      }
      if (registrations.length === 0) {
        registrations = await import_memoryStore.memoryStore.getAllRegistrations();
      }
      for (const reg of registrations) {
        const regEmail = reg.email.toLowerCase();
        if (!seenEmails.has(regEmail)) {
          seenEmails.add(regEmail);
          allUsers.push({
            _id: reg._id?.toString(),
            name: reg.name,
            email: regEmail,
            phone: { countryCode: "+91", number: reg.phone },
            role: "learner",
            accountStatus: "active",
            userCategory: "working_professional",
            experienceLevel: "beginner",
            createdAt: reg.createdAt
          });
        }
      }
      const enrichedStudents = allUsers.map((u) => {
        const sanitized = AdminController.sanitizeUser(u);
        const userEnrollments = enrollments.filter(
          (e) => e.userId?.toString() === sanitized._id || e.attendeeDetails?.email?.toLowerCase() === sanitized.email.toLowerCase()
        );
        const userRegs = registrations.filter(
          (r) => r.email?.toLowerCase() === sanitized.email.toLowerCase()
        );
        return {
          ...sanitized,
          enrollmentsCount: userEnrollments.length + userRegs.length,
          latestBatch: userEnrollments[0]?.workshopId?.batchCode || userRegs[0]?.batchId || "None",
          paymentStatus: userEnrollments[0]?.paymentStatus || userRegs[0]?.paymentStatus || "none"
        };
      });
      const filtered = enrichedStudents.filter((s) => {
        const matchesSearch = !search || s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search) || (s.phone?.number || "").includes(search);
        const matchesStatus = statusFilter === "all" || s.accountStatus === statusFilter;
        const matchesCategory = categoryFilter === "all" || s.userCategory === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
      });
      const total = filtered.length;
      const paginated = filtered.slice((page - 1) * limit, page * limit);
      res.status(200).json({
        success: true,
        data: {
          students: paginated,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
  static async getStudentById(req, res, next) {
    try {
      const id = req.params["id"];
      let student = null;
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(id)) {
        student = await import_User.User.findById(id).select("-passwordHash -resetPasswordToken -resetPasswordExpires");
      }
      if (!student) {
        student = await import_memoryStore.memoryStore.findUserById(id);
      }
      let enrollments = [];
      let registrations = [];
      let payments = [];
      let certificates = [];
      if ((0, import_db.isDBConnected)()) {
        if (student && import_mongoose.default.Types.ObjectId.isValid(student._id)) {
          enrollments = await import_Enrollment.Enrollment.find({ userId: student._id }).populate("workshopId", "title batchCode startDate price");
          payments = await import_Payment.Payment.find({ userId: student._id }).populate("workshopId", "title batchCode");
          certificates = await import_Certificate.Certificate.find({ userId: student._id });
        }
        if (student?.email) {
          registrations = await import_Registration.Registration.find({ email: student.email.toLowerCase() });
        } else if (import_mongoose.default.Types.ObjectId.isValid(id)) {
          const regById = await import_Registration.Registration.findById(id);
          if (regById) {
            registrations = [regById];
            student = {
              _id: regById._id.toString(),
              name: regById.name,
              email: regById.email,
              phone: { countryCode: "+91", number: regById.phone },
              role: "learner",
              accountStatus: "active",
              userCategory: "working_professional",
              experienceLevel: "beginner",
              createdAt: regById.createdAt
            };
          }
        }
      }
      if (!student) {
        throw import_apiError.ApiError.notFound("Student record not found.");
      }
      res.status(200).json({
        success: true,
        data: {
          student: AdminController.sanitizeUser(student),
          enrollments,
          registrations,
          payments,
          certificates
        }
      });
    } catch (error) {
      next(error);
    }
  }
  static async updateStudentStatus(req, res, next) {
    try {
      const id = req.params["id"];
      const { accountStatus, role, userCategory, experienceLevel } = req.body;
      if (accountStatus && !["active", "suspended", "deactivated"].includes(accountStatus)) {
        throw import_apiError.ApiError.badRequest("Invalid accountStatus. Must be active, suspended, or deactivated.");
      }
      if (role && !["learner", "instructor", "admin", "support"].includes(role)) {
        throw import_apiError.ApiError.badRequest("Invalid role specified.");
      }
      if (req.user?._id?.toString() === id && (accountStatus === "suspended" || role && role !== "admin")) {
        throw import_apiError.ApiError.badRequest("You cannot suspend or demote your own administrator account.");
      }
      let updated = null;
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(id)) {
        const updateDoc = {};
        if (accountStatus) updateDoc.accountStatus = accountStatus;
        if (role) updateDoc.role = role;
        if (userCategory) updateDoc.userCategory = userCategory;
        if (experienceLevel) updateDoc.experienceLevel = experienceLevel;
        updated = await import_User.User.findByIdAndUpdate(id, updateDoc, { new: true }).select(
          "-passwordHash -resetPasswordToken -resetPasswordExpires"
        );
      }
      if (!updated) {
        updated = await import_memoryStore.memoryStore.updateUser(id, {
          ...accountStatus ? { accountStatus } : {},
          ...role ? { role } : {},
          ...userCategory ? { userCategory } : {},
          ...experienceLevel ? { experienceLevel } : {}
        });
      }
      if (!updated) {
        throw import_apiError.ApiError.notFound("Student account not found.");
      }
      await AdminController.logAudit(
        req,
        "UPDATE_USER_STATUS",
        "user",
        `Updated user ${updated.email} (status=${updated.accountStatus || "active"}, role=${updated.role})`,
        id,
        { accountStatus, role }
      );
      res.status(200).json({
        success: true,
        message: "Student account status updated successfully.",
        data: AdminController.sanitizeUser(updated)
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * TASK 4 — WORKSHOP MANAGEMENT (`GET`, `POST`, `PATCH`, `DELETE /api/admin/workshops`)
   */
  static async getWorkshops(_req, res, next) {
    try {
      let workshops = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          workshops = await import_Workshop.Workshop.find().sort({ startDate: 1 });
          if (workshops.length === 0 || workshops.some((w) => ["AILP-2026-NOV-28", "AILP-2026-DEC-12"].includes(w.batchCode))) {
            await (0, import_seed.seedDatabase)();
            workshops = await import_Workshop.Workshop.find().sort({ startDate: 1 });
          }
        } catch (err) {
          console.warn("[Admin getWorkshops DB Fallback]", err.message);
        }
      }
      if (workshops.length === 0) {
        workshops = await import_memoryStore.memoryStore.getAllWorkshops();
      }
      res.status(200).json({
        success: true,
        count: workshops.length,
        data: workshops
      });
    } catch (error) {
      next(error);
    }
  }
  static async createWorkshop(req, res, next) {
    try {
      const {
        title,
        batchCode,
        description,
        startDate,
        endDate,
        timings,
        timezone,
        capacity,
        basePrice,
        taxPercentage,
        isFree,
        status,
        instructorName,
        instructorRole,
        instructorBio,
        instructorAvatarUrl,
        thumbnailUrl,
        registrationDeadline,
        liveSessionUrl
      } = req.body;
      if (!title || !batchCode || !startDate || !endDate) {
        throw import_apiError.ApiError.badRequest("Title, batchCode, startDate, and endDate are required.");
      }
      const parsedCapacity = Number(capacity) || 60;
      if (parsedCapacity < 1) {
        throw import_apiError.ApiError.badRequest("Workshop capacity must be at least 1.");
      }
      const normalizedCode = batchCode.trim().toUpperCase();
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${normalizedCode.toLowerCase()}`;
      const payload = {
        title: title.trim(),
        slug,
        batchCode: normalizedCode,
        description: description || "Master practical Generative AI in one weekend with hands-on projects.",
        instructor: {
          name: instructorName || "Vikram Malhotra",
          role: instructorRole || "Staff AI Engineer & Former ML Lead",
          bio: instructorBio || "Over 12 years building production software and leading enterprise LLM integrations.",
          avatarUrl: instructorAvatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
        },
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        timings: timings || "10:00 AM \u2013 3:00 PM IST",
        timezone: timezone || "Asia/Kolkata (IST)",
        capacity: parsedCapacity,
        price: {
          basePrice: basePrice !== void 0 ? Number(basePrice) : 1999,
          currency: "INR",
          taxPercentage: taxPercentage !== void 0 ? Number(taxPercentage) : 18,
          isFree: Boolean(isFree)
        },
        status: status || "published",
        thumbnailUrl,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : void 0,
        liveSessionUrl: liveSessionUrl || "https://meet.google.com/ailp-live-cohort"
      };
      let created = null;
      if ((0, import_db.isDBConnected)()) {
        try {
          created = await import_Workshop.Workshop.create(payload);
        } catch (err) {
          if (err.code === 11e3) {
            throw import_apiError.ApiError.conflict(`A workshop with batch code ${normalizedCode} already exists.`);
          }
          console.warn("[Admin createWorkshop DB Fallback]", err.message);
        }
      }
      if (!created) {
        created = await import_memoryStore.memoryStore.createWorkshop(payload);
      }
      await AdminController.logAudit(
        req,
        "CREATE_WORKSHOP",
        "workshop",
        `Created workshop ${created.batchCode} (${created.title})`,
        created._id?.toString(),
        { batchCode: created.batchCode, capacity: created.capacity, status: created.status }
      );
      res.status(201).json({
        success: true,
        message: "Workshop created successfully.",
        data: created
      });
    } catch (error) {
      next(error);
    }
  }
  static async updateWorkshop(req, res, next) {
    try {
      const id = req.params["id"];
      const updates = { ...req.body };
      if (updates.capacity !== void 0 && Number(updates.capacity) < 1) {
        throw import_apiError.ApiError.badRequest("Workshop capacity must be at least 1.");
      }
      if (updates.basePrice !== void 0 || updates.isFree !== void 0) {
        updates.price = {
          basePrice: updates.basePrice !== void 0 ? Number(updates.basePrice) : 1999,
          currency: "INR",
          taxPercentage: updates.taxPercentage !== void 0 ? Number(updates.taxPercentage) : 18,
          isFree: Boolean(updates.isFree)
        };
      }
      if (updates.instructorName) {
        updates.instructor = {
          name: updates.instructorName,
          role: updates.instructorRole || "Staff AI Engineer",
          bio: updates.instructorBio || "Enterprise AI Practitioner",
          avatarUrl: updates.instructorAvatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
        };
      }
      if (updates.liveSessionUrl !== void 0 && String(updates.liveSessionUrl).trim()) {
        updates.liveSessionUrl = AdminController.normalizeMeetingUrl(String(updates.liveSessionUrl));
      }
      let updated = null;
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(id)) {
        const existing = await import_Workshop.Workshop.findById(id);
        if (existing) {
          if (updates.capacity !== void 0 && Number(updates.capacity) < existing.enrolledCount) {
            throw import_apiError.ApiError.badRequest(
              `Capacity (${updates.capacity}) cannot be lower than current confirmed enrollments (${existing.enrolledCount}).`
            );
          }
          updated = await import_Workshop.Workshop.findByIdAndUpdate(id, updates, { new: true });
        }
      }
      if (!updated) {
        updated = await import_memoryStore.memoryStore.updateWorkshop(id, updates);
      }
      if (!updated) {
        throw import_apiError.ApiError.notFound("Workshop not found.");
      }
      if (updates.liveSessionUrl) {
        const encUrl = `enc:${Buffer.from(String(updates.liveSessionUrl)).toString("base64")}`;
        if ((0, import_db.isDBConnected)()) {
          try {
            await import_WorkshopSession.WorkshopSession.updateMany(
              { batchCode: updated.batchCode },
              { liveSessionUrl: updates.liveSessionUrl, encryptedMeetingUrl: encUrl }
            );
          } catch {
          }
        }
        const memSessions = await import_memoryStore.memoryStore.getAllSessions();
        for (const ms of memSessions) {
          if (String(ms.batchCode).toUpperCase() === String(updated.batchCode).toUpperCase()) {
            await import_memoryStore.memoryStore.upsertSession({
              ...ms,
              liveSessionUrl: updates.liveSessionUrl,
              encryptedMeetingUrl: encUrl
            });
          }
        }
      }
      await AdminController.logAudit(
        req,
        "UPDATE_WORKSHOP",
        "workshop",
        `Updated workshop ${updated.batchCode} (status=${updated.status})`,
        id,
        updates
      );
      res.status(200).json({
        success: true,
        message: "Workshop updated successfully.",
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
  static async deleteWorkshop(req, res, next) {
    try {
      const id = req.params["id"];
      let hasEnrollments = false;
      let hasPayments = false;
      if ((0, import_db.isDBConnected)()) {
        if (import_mongoose.default.Types.ObjectId.isValid(id)) {
          const enrCount = await import_Enrollment.Enrollment.countDocuments({ workshopId: id });
          const payCount = await import_Payment.Payment.countDocuments({ workshopId: id });
          const ws = await import_Workshop.Workshop.findById(id);
          const regCount = ws ? await import_Registration.Registration.countDocuments({
            $or: [{ batchId: id }, { batchId: ws.batchCode }]
          }) : 0;
          hasEnrollments = enrCount > 0 || regCount > 0 || (ws ? ws.enrolledCount > 0 : false);
          hasPayments = payCount > 0;
        }
      }
      const memWs = await import_memoryStore.memoryStore.findWorkshop(id);
      if (memWs && memWs.enrolledCount > 0) {
        hasEnrollments = true;
      }
      if (hasEnrollments || hasPayments) {
        throw import_apiError.ApiError.badRequest(
          "Cannot delete a workshop that has existing enrollment or payment records. Please archive the workshop instead."
        );
      }
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(id)) {
        await import_Workshop.Workshop.findByIdAndDelete(id);
      }
      await import_memoryStore.memoryStore.deleteWorkshop(id);
      await AdminController.logAudit(
        req,
        "DELETE_WORKSHOP",
        "workshop",
        `Deleted empty workshop ${id}`,
        id
      );
      res.status(200).json({
        success: true,
        message: "Workshop deleted successfully."
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * TASK 5 — BATCH AND SESSION MANAGEMENT (`GET`, `POST`, `PATCH /api/admin/sessions`)
   */
  static async getSessions(_req, res, next) {
    try {
      const sessions = await AdminController.getAllCalendarSessionsUnified();
      res.status(200).json({
        success: true,
        count: sessions.length,
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  }
  /** Normalize & validate a meeting URL, automatically prepending https:// if missing scheme. */
  static normalizeMeetingUrl(rawUrl) {
    const trimmed = String(rawUrl || "").trim();
    if (!trimmed) {
      throw import_apiError.ApiError.badRequest("Live Meeting URL is required.");
    }
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const parsed = new URL(candidate);
      if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname || !parsed.hostname.includes(".")) {
        throw new Error("Invalid host");
      }
      return parsed.toString();
    } catch {
      throw import_apiError.ApiError.badRequest(
        "Please enter a valid Live Meeting URL (for example https://meet.google.com/abc-defg-hij or a Zoom link)."
      );
    }
  }
  /**
   * Ensure a published Workshop cohort exists for a scheduled session's batchCode,
   * and keep Workshop dates/timings/instructor/meeting URL synced so the public site updates immediately.
   */
  static async syncWorkshopForSession(opts) {
    const normalizedCode = opts.batchCode.trim().toUpperCase();
    const dayNum = Number(opts.dayNumber) || 1;
    const baseDate = new Date(opts.sessionDate);
    const defaultStart = new Date(baseDate);
    const defaultEnd = dayNum === 1 ? new Date(baseDate.getTime() + 24 * 60 * 60 * 1e3) : new Date(baseDate);
    const timingsStr = `${opts.startTime} \u2013 ${opts.endTime}${opts.timezone.includes("IST") ? " IST" : ""}`;
    let resolvedWorkshopId;
    if ((0, import_db.isDBConnected)()) {
      try {
        let ws = null;
        if (opts.workshopId && import_mongoose.default.Types.ObjectId.isValid(opts.workshopId)) {
          ws = await import_Workshop.Workshop.findById(opts.workshopId);
        }
        if (!ws) {
          ws = await import_Workshop.Workshop.findOne({ batchCode: normalizedCode });
        }
        if (!ws) {
          const slug = `ai-launchpad-${normalizedCode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          ws = await import_Workshop.Workshop.create({
            title: "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
            slug,
            batchCode: normalizedCode,
            description: "Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.",
            instructor: {
              name: opts.instructorName || "Vikram Malhotra",
              role: "Staff AI Engineer & Former ML Lead",
              bio: "Over 12 years building production software and leading enterprise LLM integrations.",
              avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
            },
            startDate: defaultStart,
            endDate: defaultEnd,
            timings: timingsStr,
            timezone: opts.timezone || "Asia/Kolkata (IST)",
            capacity: opts.capacity || 60,
            price: {
              basePrice: opts.basePrice !== void 0 ? Number(opts.basePrice) : 1999,
              currency: "INR",
              taxPercentage: 18,
              isFree: opts.basePrice === 0
            },
            status: "published",
            liveSessionUrl: opts.liveSessionUrl,
            meetingPasscode: opts.meetingPasscode || "AILP2026"
          });
        } else {
          const nextStart = baseDate.getTime() < new Date(ws.startDate).getTime() ? baseDate : ws.startDate;
          const nextEnd = baseDate.getTime() > new Date(ws.endDate).getTime() ? baseDate : ws.endDate;
          await import_Workshop.Workshop.findByIdAndUpdate(ws._id, {
            startDate: nextStart,
            endDate: nextEnd,
            timings: timingsStr,
            timezone: opts.timezone || ws.timezone,
            capacity: Math.max(Number(opts.capacity) || 60, ws.enrolledCount || 0),
            liveSessionUrl: opts.liveSessionUrl,
            ...opts.meetingPasscode ? { meetingPasscode: opts.meetingPasscode } : {},
            ...ws.status === "draft" ? { status: "published" } : {},
            "instructor.name": opts.instructorName || ws.instructor?.name || "Vikram Malhotra"
          });
        }
        resolvedWorkshopId = ws._id?.toString();
      } catch (err) {
        console.warn("[Admin syncWorkshopForSession DB Warning]", err.message);
      }
    }
    const memWs = await import_memoryStore.memoryStore.findWorkshopExact(normalizedCode);
    if (!memWs) {
      const createdMemWs = await import_memoryStore.memoryStore.createWorkshop({
        title: "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
        slug: `ai-launchpad-${normalizedCode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        batchCode: normalizedCode,
        description: "Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.",
        instructor: {
          name: opts.instructorName || "Vikram Malhotra",
          role: "Staff AI Engineer & Former ML Lead",
          bio: "Over 12 years building production software and leading enterprise LLM integrations.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
        },
        startDate: defaultStart,
        endDate: defaultEnd,
        timings: timingsStr,
        timezone: opts.timezone || "Asia/Kolkata (IST)",
        capacity: opts.capacity || 60,
        price: {
          basePrice: opts.basePrice !== void 0 ? Number(opts.basePrice) : 1999,
          currency: "INR",
          taxPercentage: 18,
          isFree: opts.basePrice === 0
        },
        status: "published",
        liveSessionUrl: opts.liveSessionUrl,
        meetingPasscode: opts.meetingPasscode || "AILP2026"
      });
      if (!resolvedWorkshopId) resolvedWorkshopId = createdMemWs._id;
    } else {
      const nextStart = baseDate.getTime() < new Date(memWs.startDate).getTime() ? baseDate : memWs.startDate;
      const nextEnd = baseDate.getTime() > new Date(memWs.endDate).getTime() ? baseDate : memWs.endDate;
      await import_memoryStore.memoryStore.updateWorkshop(memWs._id, {
        startDate: nextStart,
        endDate: nextEnd,
        timings: timingsStr,
        timezone: opts.timezone || memWs.timezone,
        capacity: Math.max(Number(opts.capacity) || 60, memWs.enrolledCount || 0),
        liveSessionUrl: opts.liveSessionUrl,
        ...opts.meetingPasscode ? { meetingPasscode: opts.meetingPasscode } : {},
        ...memWs.status === "draft" ? { status: "published" } : {},
        instructor: {
          ...memWs.instructor,
          name: opts.instructorName || memWs.instructor?.name || "Vikram Malhotra"
        }
      });
      if (!resolvedWorkshopId) resolvedWorkshopId = memWs._id;
    }
    return resolvedWorkshopId || normalizedCode;
  }
  static async upsertSession(req, res, next) {
    try {
      const {
        _id: bodyId,
        workshopId,
        batchCode,
        dayNumber,
        title,
        sessionDate,
        startTime,
        endTime,
        timezone,
        instructorName,
        liveSessionUrl,
        meetingPasscode,
        capacity,
        basePrice,
        registrationDeadline,
        status
      } = req.body;
      if (!batchCode || !dayNumber || !title || !liveSessionUrl) {
        throw import_apiError.ApiError.badRequest("batchCode, dayNumber, title, and liveSessionUrl are required.");
      }
      const normalizedCode = String(batchCode).trim().toUpperCase();
      const normalizedUrl = AdminController.normalizeMeetingUrl(liveSessionUrl);
      const parsedTime = AdminController.parseSessionStartEnd({
        sessionDate: sessionDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        startTime: startTime || "10:00 AM",
        endTime: endTime || "3:00 PM",
        timezone: timezone || "Asia/Kolkata (IST)"
      });
      const resolvedInstructor = (instructorName || "Vikram Malhotra").trim();
      const resolvedCapacity = Number(capacity) || 60;
      const resolvedPasscode = (meetingPasscode || "AILP2026").trim();
      const resolvedWorkshopId = await AdminController.syncWorkshopForSession({
        workshopId,
        batchCode: normalizedCode,
        dayNumber: Number(dayNumber),
        sessionDate: parsedTime.sessionDate,
        startTime: parsedTime.startTime,
        endTime: parsedTime.endTime,
        timezone: parsedTime.timezone,
        instructorName: resolvedInstructor,
        liveSessionUrl: normalizedUrl,
        meetingPasscode: resolvedPasscode,
        capacity: resolvedCapacity,
        basePrice: basePrice !== void 0 ? Number(basePrice) : void 0
      });
      const targetId = typeof req.params.id === "string" && req.params.id || (bodyId ? String(bodyId).trim() : void 0);
      const encUrl = `enc:${Buffer.from(normalizedUrl).toString("base64")}`;
      const sessionData = {
        workshopId: import_mongoose.default.Types.ObjectId.isValid(resolvedWorkshopId) ? new import_mongoose.default.Types.ObjectId(resolvedWorkshopId) : resolvedWorkshopId,
        batchId: resolvedWorkshopId,
        batchCode: normalizedCode,
        dayNumber: Number(dayNumber),
        title: String(title).trim(),
        sessionDate: parsedTime.sessionDate,
        startAt: parsedTime.startAt,
        endAt: parsedTime.endAt,
        durationMinutes: parsedTime.durationMinutes,
        startTime: parsedTime.startTime,
        endTime: parsedTime.endTime,
        timezone: parsedTime.timezone,
        instructorName: resolvedInstructor,
        liveSessionUrl: normalizedUrl,
        encryptedMeetingUrl: encUrl,
        meetingPasscode: resolvedPasscode,
        capacity: resolvedCapacity,
        maxAttendees: resolvedCapacity,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : void 0,
        status: status || "scheduled"
      };
      let saved = null;
      if ((0, import_db.isDBConnected)()) {
        try {
          if (targetId && import_mongoose.default.Types.ObjectId.isValid(targetId)) {
            saved = await import_WorkshopSession.WorkshopSession.findByIdAndUpdate(targetId, sessionData, {
              upsert: true,
              new: true
            });
          } else {
            saved = await import_WorkshopSession.WorkshopSession.findOneAndUpdate(
              { batchCode: normalizedCode, dayNumber: Number(dayNumber) },
              sessionData,
              { upsert: true, new: true }
            );
          }
        } catch (err) {
          console.warn("[Admin upsertSession DB Fallback]", err.message);
        }
      }
      let memId = targetId || saved?._id?.toString();
      if (!memId) {
        const existingMem = (await import_memoryStore.memoryStore.getAllSessions()).find(
          (s) => String(s.batchCode).toUpperCase() === normalizedCode && Number(s.dayNumber) === Number(dayNumber)
        );
        memId = existingMem?._id;
      }
      const memSaved = await import_memoryStore.memoryStore.upsertSession({
        ...sessionData,
        workshopId: resolvedWorkshopId,
        _id: memId
      });
      const finalSaved = AdminController.normalizeSessionRecord(saved || memSaved);
      await AdminController.logAudit(
        req,
        "UPSERT_SESSION",
        "session",
        `Configured Day ${dayNumber} session for batch ${normalizedCode}`,
        finalSaved._id?.toString(),
        { batchCode: normalizedCode, dayNumber, instructorName: resolvedInstructor, liveSessionUrl: normalizedUrl }
      );
      res.status(200).json({
        success: true,
        message: `Day ${dayNumber} session saved for ${normalizedCode} and synced to public registration.`,
        data: finalSaved
      });
    } catch (error) {
      next(error);
    }
  }
  static async deleteSession(req, res, next) {
    try {
      const id = String(req.params["id"] || "").trim();
      if (!id) {
        throw import_apiError.ApiError.badRequest("Session ID is required.");
      }
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(id)) {
        await import_WorkshopSession.WorkshopSession.findByIdAndDelete(id);
      }
      await import_memoryStore.memoryStore.deleteSession(id);
      await AdminController.logAudit(
        req,
        "DELETE_SESSION",
        "session",
        `Deleted session ${id}`,
        id
      );
      res.status(200).json({
        success: true,
        message: "Session deleted successfully."
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * TASK 6 — INSTRUCTOR MANAGEMENT (`GET`, `POST`, `PATCH /api/admin/instructors`)
   */
  static async getInstructors(_req, res, next) {
    try {
      let instructors = [];
      let workshops = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          instructors = await import_User.User.find({ role: "instructor" }).select(
            "-passwordHash -resetPasswordToken -resetPasswordExpires"
          );
          workshops = await import_Workshop.Workshop.find();
        } catch (err) {
          console.warn("[Admin getInstructors DB Fallback]", err.message);
        }
      }
      const memInstructors = (await import_memoryStore.memoryStore.getAllUsers()).filter((u) => u.role === "instructor");
      const seenEmails = new Set(instructors.map((i) => i.email?.toLowerCase()));
      for (const mi of memInstructors) {
        if (!seenEmails.has(mi.email.toLowerCase())) {
          seenEmails.add(mi.email.toLowerCase());
          instructors.push(mi);
        }
      }
      if (workshops.length === 0) {
        workshops = await import_memoryStore.memoryStore.getAllWorkshops();
      }
      const data = instructors.map((inst) => {
        const sanitized = AdminController.sanitizeUser(inst);
        const assignedBatches = workshops.filter((w) => w.instructor?.name?.toLowerCase() === sanitized.name.toLowerCase()).map((w) => ({
          _id: w._id?.toString(),
          batchCode: w.batchCode,
          title: w.title,
          startDate: w.startDate,
          status: w.status
        }));
        return {
          ...sanitized,
          assignedBatches,
          scheduledSessionsCount: assignedBatches.length * 2
        };
      });
      res.status(200).json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      next(error);
    }
  }
  static async createInstructor(req, res, next) {
    try {
      const { name, email, phone, bio, expertise, availabilityStatus, avatarUrl } = req.body;
      if (!name || !email) {
        throw import_apiError.ApiError.badRequest("Instructor name and email are required.");
      }
      const normalizedEmail = email.toLowerCase().trim();
      const parsedExpertise = Array.isArray(expertise) ? expertise : typeof expertise === "string" ? expertise.split(",").map((s) => s.trim()).filter(Boolean) : ["Generative AI", "LLM Engineering"];
      let created = null;
      if ((0, import_db.isDBConnected)()) {
        try {
          const existing = await import_User.User.findOne({ email: normalizedEmail });
          if (existing) {
            existing.role = "instructor";
            existing.bio = bio || existing.bio;
            existing.expertise = parsedExpertise;
            existing.availabilityStatus = availabilityStatus || "available";
            if (avatarUrl) existing.avatarUrl = avatarUrl;
            await existing.save();
            created = existing;
          } else {
            created = await import_User.User.create({
              name: name.trim(),
              email: normalizedEmail,
              phone: { countryCode: "+91", number: phone || "" },
              role: "instructor",
              accountStatus: "active",
              bio: bio || "Senior AI Instructor & Systems Architect",
              expertise: parsedExpertise,
              availabilityStatus: availabilityStatus || "available",
              avatarUrl
            });
          }
        } catch (err) {
          console.warn("[Admin createInstructor DB Fallback]", err.message);
        }
      }
      if (!created) {
        created = await import_memoryStore.memoryStore.createUser({
          name: name.trim(),
          email: normalizedEmail,
          phone: { countryCode: "+91", number: phone || "" },
          role: "instructor",
          avatarUrl
        });
        await import_memoryStore.memoryStore.updateUser(created._id, {
          bio: bio || "Senior AI Instructor & Systems Architect",
          expertise: parsedExpertise,
          availabilityStatus: availabilityStatus || "available"
        });
      }
      await AdminController.logAudit(
        req,
        "CREATE_INSTRUCTOR",
        "instructor",
        `Created/assigned instructor profile for ${normalizedEmail}`,
        created._id?.toString(),
        { name, email: normalizedEmail }
      );
      res.status(201).json({
        success: true,
        message: "Instructor profile saved successfully.",
        data: AdminController.sanitizeUser(created)
      });
    } catch (error) {
      next(error);
    }
  }
  static async updateInstructor(req, res, next) {
    try {
      const id = req.params["id"];
      const { name, bio, expertise, availabilityStatus, assignBatchCode } = req.body;
      const parsedExpertise = expertise !== void 0 ? Array.isArray(expertise) ? expertise : String(expertise).split(",").map((s) => s.trim()).filter(Boolean) : void 0;
      let updated = null;
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(id)) {
        const updateDoc = {};
        if (name) updateDoc.name = name;
        if (bio !== void 0) updateDoc.bio = bio;
        if (parsedExpertise !== void 0) updateDoc.expertise = parsedExpertise;
        if (availabilityStatus) updateDoc.availabilityStatus = availabilityStatus;
        updated = await import_User.User.findByIdAndUpdate(id, updateDoc, { new: true }).select(
          "-passwordHash -resetPasswordToken -resetPasswordExpires"
        );
      }
      if (!updated) {
        updated = await import_memoryStore.memoryStore.updateUser(id, {
          ...name ? { name } : {},
          ...bio !== void 0 ? { bio } : {},
          ...parsedExpertise !== void 0 ? { expertise: parsedExpertise } : {},
          ...availabilityStatus ? { availabilityStatus } : {}
        });
      }
      if (!updated) {
        throw import_apiError.ApiError.notFound("Instructor not found.");
      }
      if (assignBatchCode) {
        if ((0, import_db.isDBConnected)()) {
          await import_Workshop.Workshop.findOneAndUpdate(
            { $or: [{ batchCode: assignBatchCode }, { _id: import_mongoose.default.Types.ObjectId.isValid(assignBatchCode) ? assignBatchCode : void 0 }] },
            {
              "instructor.name": updated.name,
              "instructor.bio": updated.bio || "Staff AI Instructor"
            }
          );
        }
        await import_memoryStore.memoryStore.updateWorkshop(assignBatchCode, {
          instructor: {
            name: updated.name,
            role: "Staff AI Instructor",
            bio: updated.bio || "Enterprise AI Practitioner",
            avatarUrl: updated.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
          }
        });
      }
      await AdminController.logAudit(
        req,
        "UPDATE_INSTRUCTOR",
        "instructor",
        `Updated instructor ${updated.name}`,
        id,
        { availabilityStatus, assignBatchCode }
      );
      res.status(200).json({
        success: true,
        message: "Instructor updated successfully.",
        data: AdminController.sanitizeUser(updated)
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * TASK 7 — REGISTRATION & ENROLLMENT MANAGEMENT (`GET /api/admin/enrollments`, `PATCH /api/admin/enrollments/:id/cancel`)
   */
  static async getEnrollments(req, res, next) {
    try {
      const search = (req.query.search || "").trim().toLowerCase();
      const statusFilter = req.query.status || "all";
      const paymentFilter = req.query.paymentStatus || "all";
      const batchFilter = req.query.batch || "all";
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      let dbEnrollments = [];
      let dbRegistrations = [];
      let dbAttendance = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          dbEnrollments = await import_Enrollment.Enrollment.find().populate("workshopId", "title batchCode startDate price").populate("userId", "name email phone").sort({ createdAt: -1 });
          dbRegistrations = await import_Registration.Registration.find().sort({ createdAt: -1 });
          dbAttendance = await import_Attendance.Attendance.find({ status: "present" });
        } catch (err) {
          console.warn("[Admin getEnrollments DB Fallback]", err.message);
        }
      }
      if (dbEnrollments.length === 0) {
        dbEnrollments = await import_memoryStore.memoryStore.getAllEnrollments();
      }
      if (dbRegistrations.length === 0) {
        dbRegistrations = await import_memoryStore.memoryStore.getAllRegistrations();
      }
      const unified = [
        ...dbEnrollments.map((e) => {
          const eid = e._id?.toString();
          const day1 = Boolean(e.day1Attended) || dbAttendance.some((a) => a.enrollmentId?.toString() === eid && a.dayNumber === 1);
          const day2 = Boolean(e.day2Attended) || dbAttendance.some((a) => a.enrollmentId?.toString() === eid && a.dayNumber === 2);
          return {
            _id: eid,
            enrollmentId: e.enrollmentId || `ENR-${eid?.slice(-6).toUpperCase()}`,
            studentName: e.attendeeDetails?.fullName || e.userId?.name || "Student",
            email: e.attendeeDetails?.email || e.userId?.email || "",
            phone: e.attendeeDetails?.phone || e.userId?.phone?.number || "",
            workshopTitle: e.workshopId?.title || "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
            batchCode: e.workshopId?.batchCode || e.workshop || "AILP-2026-NOV-14",
            enrolledAt: e.enrolledAt || e.createdAt,
            status: e.status,
            paymentStatus: e.paymentStatus,
            day1Attended: day1,
            day2Attended: day2,
            sourceType: "enrollment"
          };
        }),
        ...dbRegistrations.map((r) => ({
          _id: r._id?.toString(),
          enrollmentId: `REG-${r._id?.toString().slice(-6).toUpperCase()}`,
          studentName: r.name,
          email: r.email,
          phone: r.phone,
          workshopTitle: "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
          batchCode: r.batchId,
          enrolledAt: r.createdAt,
          status: r.registrationStatus,
          paymentStatus: r.paymentStatus,
          day1Attended: Boolean(r.day1Attended ?? r.registrationStatus === "confirmed"),
          day2Attended: Boolean(r.day2Attended ?? r.registrationStatus === "confirmed"),
          sourceType: "registration"
        }))
      ];
      const filtered = unified.filter((item) => {
        const matchesSearch = !search || item.enrollmentId.toLowerCase().includes(search) || item.studentName.toLowerCase().includes(search) || item.email.toLowerCase().includes(search) || item.batchCode.toLowerCase().includes(search);
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        const matchesPayment = paymentFilter === "all" || item.paymentStatus === paymentFilter;
        const matchesBatch = batchFilter === "all" || item.batchCode === batchFilter;
        return matchesSearch && matchesStatus && matchesPayment && matchesBatch;
      });
      const total = filtered.length;
      const paginated = filtered.slice((page - 1) * limit, page * limit);
      res.status(200).json({
        success: true,
        data: {
          enrollments: paginated,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
  static async cancelEnrollment(req, res, next) {
    try {
      const id = req.params["id"];
      const { reason } = req.body;
      let cancelledRecord = null;
      if ((0, import_db.isDBConnected)()) {
        if (import_mongoose.default.Types.ObjectId.isValid(id)) {
          const enr = await import_Enrollment.Enrollment.findById(id);
          if (enr) {
            const wasConfirmed = enr.status === "confirmed";
            enr.status = "cancelled";
            await enr.save();
            if (wasConfirmed) {
              await import_Workshop.Workshop.findByIdAndUpdate(enr.workshopId, { $inc: { enrolledCount: -1 } });
            }
            cancelledRecord = enr;
          } else {
            const reg = await import_Registration.Registration.findById(id);
            if (reg) {
              reg.registrationStatus = "cancelled";
              await reg.save();
              cancelledRecord = reg;
            }
          }
        } else {
          const enrByCode = await import_Enrollment.Enrollment.findOne({ enrollmentId: id });
          if (enrByCode) {
            enrByCode.status = "cancelled";
            await enrByCode.save();
            cancelledRecord = enrByCode;
          }
        }
      }
      if (!cancelledRecord) {
        const memEnr = await import_memoryStore.memoryStore.findEnrollmentById(id);
        if (memEnr) {
          memEnr.status = "cancelled";
          cancelledRecord = memEnr;
        } else {
          const allRegs = await import_memoryStore.memoryStore.getAllRegistrations();
          const memReg = allRegs.find(
            (r) => r._id === id || `REG-${r._id.slice(-6).toUpperCase()}` === id
          );
          if (memReg) {
            memReg.registrationStatus = "cancelled";
            cancelledRecord = memReg;
          }
        }
      }
      if (!cancelledRecord) {
        throw import_apiError.ApiError.notFound("Enrollment or registration record not found.");
      }
      await AdminController.logAudit(
        req,
        "CANCEL_ENROLLMENT",
        "enrollment",
        `Cancelled enrollment ${id}. Reason: ${reason || "Admin cancellation"}`,
        id,
        { reason }
      );
      res.status(200).json({
        success: true,
        message: "Enrollment cancelled and seat inventory updated.",
        data: cancelledRecord
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * TASK 8 — PAYMENT MANAGEMENT (`GET /api/admin/payments`, `POST /api/admin/payments/:id/reconcile`)
   * Strictly enforces: Never allow administrators to mark an unverified payment as paid!
   */
  static async getPayments(req, res, next) {
    try {
      const statusFilter = req.query.status || "all";
      const search = (req.query.search || "").trim().toLowerCase();
      let payments = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          payments = await import_Payment.Payment.find().populate("userId", "name email phone").populate("workshopId", "title batchCode").populate("enrollmentId", "enrollmentId status").sort({ createdAt: -1 });
        } catch (err) {
          console.warn("[Admin getPayments DB Fallback]", err.message);
        }
      }
      const mapped = payments.map((p) => ({
        _id: p._id?.toString(),
        providerOrderId: p.providerOrderId || "N/A",
        providerPaymentId: p.providerPaymentId || "N/A",
        provider: p.provider,
        studentName: p.userId?.name || "Student",
        studentEmail: p.userId?.email || "",
        batchCode: p.workshopId?.batchCode || "AILP-2026",
        enrollmentCode: p.enrollmentId?.enrollmentId || "",
        amount: p.amount,
        taxAmount: p.taxAmount || 0,
        discountAmount: p.discountAmount || 0,
        currency: p.currency || "INR",
        status: p.status,
        couponCode: p.couponCode || null,
        hasVerifiedSignature: Boolean(p.providerSignature && p.providerPaymentId),
        createdAt: p.createdAt
      }));
      const filtered = mapped.filter((p) => {
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        const matchesSearch = !search || p.providerOrderId.toLowerCase().includes(search) || p.providerPaymentId.toLowerCase().includes(search) || p.studentName.toLowerCase().includes(search) || p.studentEmail.toLowerCase().includes(search);
        return matchesStatus && matchesSearch;
      });
      const verifiedRevenue = mapped.filter((p) => p.status === "captured").reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const pendingAmount = mapped.filter((p) => p.status === "pending").reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const refundedAmount = mapped.filter((p) => p.status === "refunded").reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      res.status(200).json({
        success: true,
        data: {
          payments: filtered,
          summary: {
            totalTransactions: mapped.length,
            verifiedRevenue,
            pendingAmount,
            refundedAmount,
            capturedCount: mapped.filter((p) => p.status === "captured").length,
            failedCount: mapped.filter((p) => p.status === "failed").length,
            pendingCount: mapped.filter((p) => p.status === "pending").length,
            refundedCount: mapped.filter((p) => p.status === "refunded").length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
  static async reconcilePayment(req, res, next) {
    try {
      const id = req.params["id"];
      const { action, providerPaymentId, providerSignature } = req.body;
      if (action === "force_mark_paid" || action === "verify" && (!providerPaymentId || !providerSignature)) {
        throw import_apiError.ApiError.forbidden(
          "Security Policy Violation: Administrators cannot manually mark an unverified payment as paid without a valid Razorpay Payment ID and cryptographic HMAC signature."
        );
      }
      if (!(0, import_db.isDBConnected)() || !import_mongoose.default.Types.ObjectId.isValid(id)) {
        throw import_apiError.ApiError.notFound("Payment transaction record not found.");
      }
      const payment = await import_Payment.Payment.findById(id);
      if (!payment) {
        throw import_apiError.ApiError.notFound("Payment transaction record not found.");
      }
      if (action === "reconcile_signature") {
        if (!payment.providerOrderId || !providerPaymentId || !providerSignature) {
          throw import_apiError.ApiError.badRequest(
            "Order ID, Razorpay Payment ID, and Razorpay Signature are required for cryptographic reconciliation."
          );
        }
        const expectedSig = import_crypto.default.createHmac("sha256", import_env.env.RAZORPAY_KEY_SECRET).update(`${payment.providerOrderId}|${providerPaymentId}`).digest("hex");
        if (expectedSig !== providerSignature) {
          throw import_apiError.ApiError.badRequest(
            "Payment reconciliation failed: Cryptographic signature mismatch against Razorpay order."
          );
        }
        payment.providerPaymentId = providerPaymentId;
        payment.providerSignature = providerSignature;
        payment.status = "captured";
        await payment.save();
        await import_Enrollment.Enrollment.findByIdAndUpdate(payment.enrollmentId, {
          status: "confirmed",
          paymentStatus: "completed"
        });
        await AdminController.logAudit(
          req,
          "RECONCILE_PAYMENT",
          "payment",
          `Cryptographically reconciled payment ${payment._id} (Order: ${payment.providerOrderId})`,
          id,
          { providerOrderId: payment.providerOrderId, providerPaymentId }
        );
        res.status(200).json({
          success: true,
          message: "Payment cryptographically verified and enrollment confirmed.",
          data: payment
        });
        return;
      }
      if (action === "query_gateway" && import_razorpay.razorpayInstance && payment.providerOrderId) {
        const orderPayments = await import_razorpay.razorpayInstance.orders.fetchPayments(payment.providerOrderId);
        const captured = orderPayments?.items?.find((item) => item.status === "captured");
        if (!captured) {
          throw import_apiError.ApiError.badRequest("Razorpay gateway reports no captured payment for this order.");
        }
        payment.providerPaymentId = captured.id;
        payment.status = "captured";
        await payment.save();
        await import_Enrollment.Enrollment.findByIdAndUpdate(payment.enrollmentId, {
          status: "confirmed",
          paymentStatus: "completed"
        });
        await AdminController.logAudit(
          req,
          "RECONCILE_PAYMENT_GATEWAY",
          "payment",
          `Verified captured payment ${captured.id} directly from Razorpay gateway`,
          id
        );
        res.status(200).json({
          success: true,
          message: "Payment reconciled with Razorpay gateway.",
          data: payment
        });
        return;
      }
      throw import_apiError.ApiError.badRequest("Unsupported payment reconciliation action.");
    } catch (error) {
      next(error);
    }
  }
  /**
   * TASK 9 — CONTENT MANAGEMENT (`GET`, `POST`, `PATCH`, `DELETE /api/admin/content`)
   */
  static async getContent(req, res, next) {
    try {
      const category = req.query.category || "all";
      let resources = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          resources = await import_LearningResource.LearningResource.find().sort({ createdAt: -1 });
        } catch (err) {
          console.warn("[Admin getContent DB Fallback]", err.message);
        }
      }
      if (resources.length === 0) {
        resources = await import_memoryStore.memoryStore.getAllResources();
      }
      const filtered = category === "all" ? resources : resources.filter((r) => r.category === category);
      res.status(200).json({
        success: true,
        count: filtered.length,
        data: filtered
      });
    } catch (error) {
      next(error);
    }
  }
  static async createContent(req, res, next) {
    try {
      const {
        title,
        category,
        description,
        url,
        content,
        workshopBatchCode,
        accessLevel,
        isPublished,
        authorName,
        authorRole
      } = req.body;
      if (!title || !category || !description) {
        throw import_apiError.ApiError.badRequest("Title, category, and description are required.");
      }
      let created = null;
      if ((0, import_db.isDBConnected)()) {
        try {
          created = await import_LearningResource.LearningResource.create({
            title: title.trim(),
            category,
            description: description.trim(),
            url,
            content,
            workshopBatchCode: workshopBatchCode || "ALL",
            accessLevel: accessLevel || "enrolled_only",
            isPublished: isPublished ?? true,
            authorName,
            authorRole,
            createdBy: req.user?._id?.toString()
          });
        } catch (err) {
          console.warn("[Admin createContent DB Fallback]", err.message);
        }
      }
      if (!created) {
        created = await import_memoryStore.memoryStore.createResource({
          title: title.trim(),
          category,
          description: description.trim(),
          url,
          content,
          workshopBatchCode: workshopBatchCode || "ALL",
          accessLevel: accessLevel || "enrolled_only",
          isPublished: isPublished ?? true,
          authorName,
          authorRole
        });
      }
      await AdminController.logAudit(
        req,
        "CREATE_CONTENT",
        "content",
        `Created ${category} resource: ${title}`,
        created._id?.toString(),
        { category, accessLevel }
      );
      res.status(201).json({
        success: true,
        message: "Learning resource created successfully.",
        data: created
      });
    } catch (error) {
      next(error);
    }
  }
  static async updateContent(req, res, next) {
    try {
      const id = req.params["id"];
      let updated = null;
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(id)) {
        updated = await import_LearningResource.LearningResource.findByIdAndUpdate(id, req.body, { new: true });
      }
      if (!updated) {
        updated = await import_memoryStore.memoryStore.updateResource(id, req.body);
      }
      if (!updated) {
        throw import_apiError.ApiError.notFound("Content resource not found.");
      }
      await AdminController.logAudit(
        req,
        "UPDATE_CONTENT",
        "content",
        `Updated content resource ${updated.title}`,
        id
      );
      res.status(200).json({
        success: true,
        message: "Content updated successfully.",
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
  static async deleteContent(req, res, next) {
    try {
      const id = req.params["id"];
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(id)) {
        await import_LearningResource.LearningResource.findByIdAndDelete(id);
      }
      await import_memoryStore.memoryStore.deleteResource(id);
      await AdminController.logAudit(
        req,
        "DELETE_CONTENT",
        "content",
        `Deleted content resource ${id}`,
        id
      );
      res.status(200).json({
        success: true,
        message: "Content deleted successfully."
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * TASK 10 — CERTIFICATES (`GET /api/admin/certificates`, `POST /api/admin/certificates/issue`, `PATCH /api/admin/certificates/:id/revoke`)
   */
  static async getCertificates(_req, res, next) {
    try {
      let certificates = [];
      let enrollments = [];
      let registrations = [];
      let attendance = [];
      let submissions = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          [certificates, enrollments, registrations, attendance, submissions] = await Promise.all([
            import_Certificate.Certificate.find().sort({ createdAt: -1 }),
            import_Enrollment.Enrollment.find({ status: "confirmed" }).populate("workshopId", "title batchCode"),
            import_Registration.Registration.find({ registrationStatus: "confirmed" }),
            import_Attendance.Attendance.find({ status: "present" }),
            import_ProjectSubmission.ProjectSubmission.find()
          ]);
        } catch (err) {
          console.warn("[Admin getCertificates DB Fallback]", err.message);
        }
      }
      if (certificates.length === 0) {
        certificates = await import_memoryStore.memoryStore.getAllCertificates();
      }
      if (registrations.length === 0) {
        registrations = (await import_memoryStore.memoryStore.getAllRegistrations()).filter(
          (r) => r.registrationStatus === "confirmed"
        );
      }
      const issuedEnrollmentIds = new Set(certificates.map((c) => c.enrollmentId?.toString()));
      const eligibleCandidates = [
        ...enrollments.map((e) => {
          const day1 = attendance.some(
            (a) => a.enrollmentId?.toString() === e._id?.toString() && a.dayNumber === 1
          );
          const day2 = attendance.some(
            (a) => a.enrollmentId?.toString() === e._id?.toString() && a.dayNumber === 2
          );
          const sub = submissions.find((s) => s.enrollmentId?.toString() === e._id?.toString());
          const cert = certificates.find((c) => c.enrollmentId?.toString() === e._id?.toString());
          return {
            enrollmentId: e.enrollmentId || e._id?.toString(),
            _id: e._id?.toString(),
            studentName: e.attendeeDetails?.fullName || "Student",
            email: e.attendeeDetails?.email || "",
            workshopTitle: e.workshopId?.title || "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
            batchCode: e.workshopId?.batchCode || "AILP-2026",
            day1Attended: day1,
            day2Attended: day2,
            projectSubmitted: Boolean(sub),
            alreadyIssued: issuedEnrollmentIds.has(e._id?.toString()),
            certificateSerial: cert?.serialNumber || null
          };
        }),
        ...registrations.map((r) => {
          const cert = certificates.find((c) => c.enrollmentId?.toString() === r._id?.toString());
          return {
            enrollmentId: r._id?.toString(),
            _id: r._id?.toString(),
            studentName: r.name,
            email: r.email,
            workshopTitle: "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
            batchCode: r.batchId,
            day1Attended: true,
            day2Attended: true,
            projectSubmitted: true,
            alreadyIssued: Boolean(cert),
            certificateSerial: cert?.serialNumber || null
          };
        })
      ];
      res.status(200).json({
        success: true,
        data: {
          certificates,
          eligibleCandidates
        }
      });
    } catch (error) {
      next(error);
    }
  }
  static async issueCertificate(req, res, next) {
    try {
      const { enrollmentId, recipientName, workshopTitle } = req.body;
      if (!enrollmentId) {
        throw import_apiError.ApiError.badRequest("enrollmentId is required to issue a certificate.");
      }
      const memCerts = await import_memoryStore.memoryStore.getAllCertificates();
      const existingMem = memCerts.find(
        (c) => c.enrollmentId?.toString() === enrollmentId.toString() && !c.isRevoked
      );
      if (existingMem) {
        throw import_apiError.ApiError.conflict(`Certificate (${existingMem.serialNumber}) has already been issued for this enrollment.`);
      }
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(enrollmentId)) {
        const existingDb = await import_Certificate.Certificate.findOne({ enrollmentId, isRevoked: false });
        if (existingDb) {
          throw import_apiError.ApiError.conflict(`Certificate (${existingDb.serialNumber}) has already been issued for this enrollment.`);
        }
      }
      let resolvedName = recipientName;
      let resolvedTitle = workshopTitle || "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp";
      let resolvedUserId = req.user?._id;
      let resolvedWorkshopId = void 0;
      let resolvedEnrollmentObjId = enrollmentId;
      if ((0, import_db.isDBConnected)()) {
        const enr = await import_Enrollment.Enrollment.findOne({
          $or: [
            { enrollmentId },
            ...import_mongoose.default.Types.ObjectId.isValid(enrollmentId) ? [{ _id: enrollmentId }] : []
          ]
        }).populate("workshopId userId");
        if (enr) {
          if (enr.status !== "confirmed") {
            throw import_apiError.ApiError.badRequest("Certificates can only be issued to confirmed participants.");
          }
          resolvedName = enr.attendeeDetails?.fullName || enr.userId?.name || resolvedName;
          resolvedTitle = enr.workshopId?.title || resolvedTitle;
          resolvedUserId = enr.userId;
          resolvedWorkshopId = enr.workshopId?._id;
          resolvedEnrollmentObjId = enr._id;
        } else if (import_mongoose.default.Types.ObjectId.isValid(enrollmentId)) {
          const reg = await import_Registration.Registration.findById(enrollmentId);
          if (reg) {
            if (reg.registrationStatus !== "confirmed") {
              throw import_apiError.ApiError.badRequest("Certificates can only be issued to confirmed registrations.");
            }
            resolvedName = reg.name;
            resolvedEnrollmentObjId = reg._id;
          }
        }
      }
      if (!resolvedName) {
        const memRegs = await import_memoryStore.memoryStore.getAllRegistrations();
        const mr = memRegs.find((r) => r._id === enrollmentId);
        if (mr) {
          resolvedName = mr.name;
        } else {
          resolvedName = "Verified AI Launchpad Graduate";
        }
      }
      const serialSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const serialNumber = `AILP-CERT-2026-${serialSuffix}`;
      const verificationHash = import_crypto.default.createHmac("sha256", import_env.env.JWT_SECRET).update(`${serialNumber}|${resolvedName}|${resolvedTitle}`).digest("hex");
      let certificate = null;
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(resolvedEnrollmentObjId) && import_mongoose.default.Types.ObjectId.isValid(resolvedUserId) && import_mongoose.default.Types.ObjectId.isValid(resolvedWorkshopId)) {
        certificate = await import_Certificate.Certificate.create({
          serialNumber,
          enrollmentId: resolvedEnrollmentObjId,
          userId: resolvedUserId,
          workshopId: resolvedWorkshopId,
          recipientName: resolvedName,
          workshopTitle: resolvedTitle,
          completionDate: /* @__PURE__ */ new Date(),
          verificationHash,
          issuedAt: /* @__PURE__ */ new Date(),
          isRevoked: false
        });
      }
      if (!certificate) {
        certificate = await import_memoryStore.memoryStore.saveCertificate({
          serialNumber,
          enrollmentId: resolvedEnrollmentObjId.toString(),
          recipientName: resolvedName,
          workshopTitle: resolvedTitle,
          completionDate: /* @__PURE__ */ new Date(),
          verificationHash,
          issuedAt: /* @__PURE__ */ new Date(),
          isRevoked: false
        });
      }
      await AdminController.logAudit(
        req,
        "ISSUE_CERTIFICATE",
        "certificate",
        `Issued certificate ${serialNumber} to ${resolvedName}`,
        certificate._id?.toString(),
        { serialNumber, enrollmentId, recipientName: resolvedName }
      );
      res.status(201).json({
        success: true,
        message: "Certificate issued successfully.",
        data: certificate
      });
    } catch (error) {
      next(error);
    }
  }
  static async revokeCertificate(req, res, next) {
    try {
      const id = req.params["id"];
      const { reason } = req.body;
      if (!reason || !reason.trim()) {
        throw import_apiError.ApiError.badRequest("An audit reason is required to revoke a certificate.");
      }
      let revoked = null;
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(id)) {
        revoked = await import_Certificate.Certificate.findByIdAndUpdate(
          id,
          { isRevoked: true, revokedReason: reason.trim() },
          { new: true }
        );
      }
      if (!revoked) {
        const certs = await import_memoryStore.memoryStore.getAllCertificates();
        const target = certs.find((c) => c._id === id || c.serialNumber === id);
        if (target) {
          target.isRevoked = true;
          target.revokedReason = reason.trim();
          revoked = await import_memoryStore.memoryStore.saveCertificate(target);
        }
      }
      if (!revoked) {
        throw import_apiError.ApiError.notFound("Certificate not found.");
      }
      await AdminController.logAudit(
        req,
        "REVOKE_CERTIFICATE",
        "certificate",
        `Revoked certificate ${revoked.serialNumber}. Reason: ${reason.trim()}`,
        id,
        { reason: reason.trim(), serialNumber: revoked.serialNumber }
      );
      res.status(200).json({
        success: true,
        message: "Certificate revoked and recorded in audit log.",
        data: revoked
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * TASK 11 — ANALYTICS (`GET /api/admin/analytics`)
   */
  static async getAnalytics(_req, res, next) {
    try {
      let workshops = [];
      let enrollments = [];
      let registrations = [];
      let payments = [];
      let attendance = [];
      let certificates = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          [workshops, enrollments, registrations, payments, attendance, certificates] = await Promise.all([
            import_Workshop.Workshop.find().sort({ startDate: 1 }),
            import_Enrollment.Enrollment.find(),
            import_Registration.Registration.find(),
            import_Payment.Payment.find({ status: "captured" }),
            import_Attendance.Attendance.find(),
            import_Certificate.Certificate.find({ isRevoked: false })
          ]);
        } catch (err) {
          console.warn("[Admin getAnalytics DB Fallback]", err.message);
        }
      }
      if (workshops.length === 0) workshops = await import_memoryStore.memoryStore.getAllWorkshops();
      if (registrations.length === 0) registrations = await import_memoryStore.memoryStore.getAllRegistrations();
      if (certificates.length === 0) certificates = await import_memoryStore.memoryStore.getAllCertificates();
      const workshopPerformance = workshops.map((w) => {
        const batchRegs = registrations.filter(
          (r) => r.batchId === w._id?.toString() || r.batchId === w.batchCode
        );
        const batchEnrs = enrollments.filter(
          (e) => e.workshopId?.toString() === w._id?.toString()
        );
        const totalEnrolled = Math.max(
          Number(w.enrolledCount) || 0,
          batchRegs.length + batchEnrs.length
        );
        const capacity = Number(w.capacity) || 60;
        const fillRate = Math.min(100, Math.round(totalEnrolled / capacity * 100));
        const batchCaptured = payments.filter((p) => p.workshopId?.toString() === w._id?.toString()).reduce((s, p) => s + (Number(p.amount) || 0), 0);
        return {
          batchCode: w.batchCode,
          title: w.title,
          instructor: w.instructor?.name || "Vikram Malhotra",
          capacity,
          enrolled: totalEnrolled,
          fillRate,
          verifiedRevenue: batchCaptured,
          status: w.status
        };
      });
      const totalConfirmed = enrollments.filter((e) => e.status === "confirmed").length + registrations.filter((r) => r.registrationStatus === "confirmed").length;
      const completionRate = totalConfirmed > 0 ? Math.min(100, Math.round(certificates.length / totalConfirmed * 100)) : 0;
      res.status(200).json({
        success: true,
        data: {
          workshopPerformance,
          totals: {
            totalCohorts: workshops.length,
            totalRegistrations: enrollments.length + registrations.length,
            totalConfirmed,
            totalCertificatesIssued: certificates.length,
            completionRate,
            attendanceRecordsCount: attendance.length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * TASK 12 — ADMIN SETTINGS & AUDIT LOGS (`GET /api/admin/settings`, `PATCH /api/admin/settings`, `GET /api/admin/audit-logs`)
   */
  static async getSettings(_req, res, next) {
    try {
      let settings = null;
      if ((0, import_db.isDBConnected)()) {
        try {
          settings = await import_PlatformSettings.PlatformSettings.findOne({ key: "global_settings" });
          if (!settings) {
            settings = await import_PlatformSettings.PlatformSettings.create({ key: "global_settings" });
          }
        } catch (err) {
          console.warn("[Admin getSettings DB Fallback]", err.message);
        }
      }
      if (!settings) {
        settings = await import_memoryStore.memoryStore.getSettings();
      }
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }
  static async updateSettings(req, res, next) {
    try {
      const updates = req.body;
      let updated = null;
      if ((0, import_db.isDBConnected)()) {
        try {
          updated = await import_PlatformSettings.PlatformSettings.findOneAndUpdate(
            { key: "global_settings" },
            {
              $set: {
                ...updates.branding ? { branding: updates.branding } : {},
                ...updates.registration ? { registration: updates.registration } : {},
                ...updates.workshopDefaults ? { workshopDefaults: updates.workshopDefaults } : {},
                ...updates.emailTemplates ? { emailTemplates: updates.emailTemplates } : {},
                ...updates.instructorPermissions ? { instructorPermissions: updates.instructorPermissions } : {},
                ...updates.notifications ? { notifications: updates.notifications } : {},
                updatedBy: req.user?.email || "admin"
              }
            },
            { upsert: true, new: true }
          );
        } catch (err) {
          console.warn("[Admin updateSettings DB Fallback]", err.message);
        }
      }
      if (!updated) {
        updated = await import_memoryStore.memoryStore.updateSettings(updates, req.user?.email || "admin");
      }
      await AdminController.logAudit(
        req,
        "UPDATE_PLATFORM_SETTINGS",
        "settings",
        `Updated platform configuration settings`,
        "global_settings",
        updates
      );
      res.status(200).json({
        success: true,
        message: "Platform settings saved successfully.",
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
  static async getAuditLogs(_req, res, next) {
    try {
      let logs = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          logs = await import_AuditLog.AuditLog.find().sort({ createdAt: -1 }).limit(100);
        } catch (err) {
          console.warn("[Admin getAuditLogs DB Fallback]", err.message);
        }
      }
      if (logs.length === 0) {
        logs = await import_memoryStore.memoryStore.getAuditLogs(100);
      }
      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Existing Roster & Attendance Endpoints (Preserved for Instructor & Admin compatibility)
   */
  static async getRoster(req, res, next) {
    try {
      const workshopId = req.params["workshopId"];
      let attendees = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          const enrollments = import_mongoose.default.Types.ObjectId.isValid(workshopId) ? await import_Enrollment.Enrollment.find({ workshopId }).populate("userId", "name email phone role userCategory").sort({ createdAt: -1 }) : [];
          const attendanceRecords = import_mongoose.default.Types.ObjectId.isValid(workshopId) ? await import_Attendance.Attendance.find({ workshopId }) : [];
          attendees = enrollments.map((enr) => {
            const day1 = attendanceRecords.some(
              (a) => a.enrollmentId.toString() === enr._id.toString() && a.dayNumber === 1 && a.status === "present"
            );
            const day2 = attendanceRecords.some(
              (a) => a.enrollmentId.toString() === enr._id.toString() && a.dayNumber === 2 && a.status === "present"
            );
            return {
              enrollmentId: enr.enrollmentId,
              learnerName: enr.attendeeDetails?.fullName || enr.userId?.name,
              email: enr.attendeeDetails?.email || enr.userId?.email,
              phone: enr.attendeeDetails?.phone || enr.userId?.phone?.number,
              userCategory: enr.attendeeDetails?.userCategory || enr.userId?.userCategory,
              status: enr.status,
              paymentStatus: enr.paymentStatus,
              day1Attended: day1,
              day2Attended: day2,
              enrolledAt: enr.enrolledAt
            };
          });
        } catch (err) {
          console.warn("[Admin getRoster Fallback]", err.message);
        }
      }
      res.status(200).json({
        success: true,
        count: attendees.length,
        data: attendees
      });
    } catch (error) {
      next(error);
    }
  }
  static async markAttendance(req, res, next) {
    try {
      const { enrollmentId, dayNumber, status } = req.body;
      if (!enrollmentId || !dayNumber) {
        throw import_apiError.ApiError.badRequest("enrollmentId and dayNumber are required.");
      }
      let attendance = null;
      if ((0, import_db.isDBConnected)()) {
        const enrollment = await import_Enrollment.Enrollment.findOne({
          $or: [
            { enrollmentId },
            ...import_mongoose.default.Types.ObjectId.isValid(enrollmentId) ? [{ _id: enrollmentId }] : []
          ]
        });
        if (enrollment) {
          attendance = await import_Attendance.Attendance.findOneAndUpdate(
            { enrollmentId: enrollment._id, dayNumber: Number(dayNumber) },
            {
              enrollmentId: enrollment._id,
              workshopId: enrollment.workshopId,
              userId: enrollment.userId,
              dayNumber: Number(dayNumber),
              status: status || "present",
              markedBy: req.user._id,
              markedAt: /* @__PURE__ */ new Date()
            },
            { upsert: true, new: true }
          );
        }
      }
      if (!attendance) {
        attendance = {
          enrollmentId,
          dayNumber: Number(dayNumber),
          status: status || "present",
          markedAt: /* @__PURE__ */ new Date()
        };
      }
      const memEnr = await import_memoryStore.memoryStore.findEnrollmentById(enrollmentId);
      if (memEnr) {
        const isPresent = (status || "present") === "present";
        if (Number(dayNumber) === 1) memEnr.day1Attended = isPresent;
        if (Number(dayNumber) === 2) memEnr.day2Attended = isPresent;
      }
      await AdminController.logAudit(
        req,
        "MARK_ATTENDANCE",
        "enrollment",
        `Marked Day ${dayNumber} attendance (${status || "present"}) for ${enrollmentId}`,
        enrollmentId
      );
      res.status(200).json({
        success: true,
        message: `Attendance marked for Day ${dayNumber}.`,
        data: attendance
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * TASK 13 — ASSIGNMENTS & SUBMISSIONS MANAGEMENT (`GET /api/admin/assignments`, `POST /api/admin/assignments`, `PATCH /api/admin/submissions/:id/review`)
   */
  static async getAssignments(_req, res, next) {
    try {
      let assignments = [];
      let submissions = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          [assignments, submissions] = await Promise.all([
            import_Assignment.Assignment.find().sort({ createdAt: -1 }),
            import_ProjectSubmission.ProjectSubmission.find().populate("userId", "name email").populate("workshopId", "title batchCode").sort({ createdAt: -1 })
          ]);
        } catch (err) {
          console.warn("[Admin getAssignments DB Fallback]", err.message);
        }
      }
      if (assignments.length === 0) {
        const memResources = (await import_memoryStore.memoryStore.getAllResources()).filter(
          (r) => r.category === "assignment"
        );
        const memAssignments = await import_memoryStore.memoryStore.getAllAssignments();
        assignments = [...memAssignments, ...memResources];
      }
      const memSubmissions = await import_memoryStore.memoryStore.getAllSubmissions();
      if (submissions.length === 0) {
        submissions = memSubmissions;
      }
      res.status(200).json({
        success: true,
        data: {
          assignments,
          submissions
        }
      });
    } catch (error) {
      next(error);
    }
  }
  static async createAssignment(req, res, next) {
    try {
      const {
        title,
        description,
        workshopBatchCode,
        dayNumber,
        deliverableType,
        maxScore,
        isPublished
      } = req.body;
      if (!title || !description) {
        throw import_apiError.ApiError.badRequest("Assignment title and description are required.");
      }
      let created = null;
      if ((0, import_db.isDBConnected)()) {
        try {
          created = await import_Assignment.Assignment.create({
            title: title.trim(),
            description: description.trim(),
            workshopBatchCode: (workshopBatchCode || "ALL").toUpperCase(),
            dayNumber: dayNumber === 1 ? 1 : 2,
            deliverableType: deliverableType || "GitHub Repository + Live Demo URL",
            maxScore: Number(maxScore) || 100,
            isPublished: isPublished ?? true
          });
        } catch (err) {
          console.warn("[Admin createAssignment DB Fallback]", err.message);
        }
      }
      const resourceEntry = await import_memoryStore.memoryStore.createResource({
        title: title.trim(),
        category: "assignment",
        description: description.trim(),
        workshopBatchCode: (workshopBatchCode || "ALL").toUpperCase(),
        accessLevel: "enrolled_only",
        isPublished: isPublished ?? true
      });
      if (!created) {
        created = resourceEntry;
      }
      await AdminController.logAudit(
        req,
        "CREATE_ASSIGNMENT",
        "content",
        `Published assignment: ${title}`,
        created._id?.toString()
      );
      res.status(201).json({
        success: true,
        message: "Assignment created and published.",
        data: created
      });
    } catch (error) {
      next(error);
    }
  }
  static async reviewSubmission(req, res, next) {
    try {
      const id = req.params["id"];
      const { status, feedback } = req.body;
      if (!status || !["submitted", "under_review", "approved"].includes(status)) {
        throw import_apiError.ApiError.badRequest("Valid status (submitted, under_review, approved) is required.");
      }
      let updated = null;
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(id)) {
        updated = await import_ProjectSubmission.ProjectSubmission.findByIdAndUpdate(
          id,
          {
            status,
            feedback: feedback || "",
            reviewedBy: req.user?._id
          },
          { new: true }
        );
      }
      const memSubmissions = await import_memoryStore.memoryStore.getAllSubmissions();
      const targetSub = memSubmissions.find((s) => s._id?.toString() === id);
      if (targetSub) {
        targetSub.status = status;
        targetSub.feedback = feedback || "";
        updated = await import_memoryStore.memoryStore.saveSubmission(targetSub);
      }
      if (!updated) {
        throw import_apiError.ApiError.notFound("Project submission not found.");
      }
      await AdminController.logAudit(
        req,
        "REVIEW_SUBMISSION",
        "content",
        `Reviewed project submission ${id} (${status})`,
        id,
        { status, feedback }
      );
      res.status(200).json({
        success: true,
        message: `Submission marked as ${status}.`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * TASK 14 — NOTIFICATIONS & ANNOUNCEMENTS (`GET /api/admin/notifications`, `POST /api/admin/notifications`)
   */
  static async getNotifications(_req, res, next) {
    try {
      let notifications = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          notifications = await import_LearningResource.LearningResource.find({ category: "announcement" }).sort({
            createdAt: -1
          });
        } catch (err) {
          console.warn("[Admin getNotifications DB Fallback]", err.message);
        }
      }
      if (notifications.length === 0) {
        notifications = (await import_memoryStore.memoryStore.getAllResources()).filter(
          (r) => r.category === "announcement"
        );
      }
      res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }
  static async createNotification(req, res, next) {
    try {
      const { title, message, audience, workshopBatchCode, scheduleAt } = req.body;
      if (!title || !message) {
        throw import_apiError.ApiError.badRequest("Notification title and message are required.");
      }
      const accessLevel = audience === "public" ? "public" : "enrolled_only";
      let created = null;
      if ((0, import_db.isDBConnected)()) {
        try {
          created = await import_LearningResource.LearningResource.create({
            title: title.trim(),
            category: "announcement",
            description: message.trim(),
            workshopBatchCode: (workshopBatchCode || "ALL").toUpperCase(),
            accessLevel,
            isPublished: true,
            releaseAt: scheduleAt ? new Date(scheduleAt) : /* @__PURE__ */ new Date(),
            authorName: req.user?.name || "System Administrator",
            authorRole: audience || "all_students",
            createdBy: req.user?._id?.toString()
          });
        } catch (err) {
          console.warn("[Admin createNotification DB Fallback]", err.message);
        }
      }
      if (!created) {
        created = await import_memoryStore.memoryStore.createResource({
          title: title.trim(),
          category: "announcement",
          description: message.trim(),
          workshopBatchCode: (workshopBatchCode || "ALL").toUpperCase(),
          accessLevel,
          isPublished: true,
          releaseAt: scheduleAt ? new Date(scheduleAt) : /* @__PURE__ */ new Date(),
          authorName: req.user?.name || "System Administrator",
          authorRole: audience || "all_students"
        });
      }
      await AdminController.logAudit(
        req,
        "SEND_NOTIFICATION",
        "content",
        `Sent announcement "${title.trim()}" to audience: ${audience || "all_students"}`,
        created._id?.toString(),
        { audience, workshopBatchCode }
      );
      res.status(201).json({
        success: true,
        message: "Announcement broadcast and delivery status recorded.",
        data: created
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * ============================================================================
   * TASK 15 — CLASS SCHEDULING & CALENDAR MANAGEMENT (`/api/admin/calendar/*`)
   * ============================================================================
   */
  static parseTimeStringToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== "string") return null;
    const clean = timeStr.trim();
    const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = parseInt(ampmMatch[2], 10);
      const period = ampmMatch[3].toUpperCase();
      if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
      if (period === "AM" && hours === 12) hours = 0;
      if (period === "PM" && hours !== 12) hours += 12;
      return hours * 60 + minutes;
    }
    const h24Match = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (h24Match) {
      const hours = parseInt(h24Match[1], 10);
      const minutes = parseInt(h24Match[2], 10);
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
      return hours * 60 + minutes;
    }
    return null;
  }
  static formatMinutesTo12Hour(totalMinutes) {
    const normalized = (totalMinutes % 1440 + 1440) % 1440;
    const hours24 = Math.floor(normalized / 60);
    const minutes = normalized % 60;
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
  }
  static getTimezoneOffsetMinutes(tzRaw, referenceDate) {
    const tz = (tzRaw || "Asia/Kolkata").trim();
    const cleanedIana = tz.replace(/\s*\(.*?\)\s*$/, "").trim();
    try {
      const ref = referenceDate && !isNaN(referenceDate.getTime()) ? referenceDate : /* @__PURE__ */ new Date();
      const utcDate = new Date(ref.toLocaleString("en-US", { timeZone: "UTC" }));
      const tzDate = new Date(ref.toLocaleString("en-US", { timeZone: cleanedIana }));
      const diffMinutes = Math.round((tzDate.getTime() - utcDate.getTime()) / 6e4);
      if (!isNaN(diffMinutes)) {
        return diffMinutes;
      }
    } catch {
    }
    const fallbackOffsets = {
      "Asia/Kolkata": 330,
      "Asia/Calcutta": 330,
      IST: 330,
      UTC: 0,
      GMT: 0,
      "Europe/London": 0,
      "Europe/Berlin": 60,
      "America/New_York": -300,
      "America/Chicago": -360,
      "America/Denver": -420,
      "America/Los_Angeles": -480,
      "Asia/Dubai": 240,
      "Asia/Singapore": 480,
      "Asia/Tokyo": 540,
      "Australia/Sydney": 600
    };
    return fallbackOffsets[cleanedIana] ?? 330;
  }
  static parseSessionStartEnd(body, existingSession) {
    const timezone = (body.timezone || existingSession?.timezone || "Asia/Kolkata").trim();
    const dateInput = body.sessionDate || body.classDate;
    const startTimeInput = body.startTime;
    const endTimeInput = body.endTime;
    const durationInput = body.durationMinutes !== void 0 ? Number(body.durationMinutes) : void 0;
    if (dateInput && startTimeInput) {
      const startMins = AdminController.parseTimeStringToMinutes(String(startTimeInput));
      if (startMins === null) {
        throw import_apiError.ApiError.badRequest(`Invalid startTime format "${startTimeInput}". Use HH:mm or h:mm AM/PM.`);
      }
      let endMins = null;
      let durationMinutes = durationInput && durationInput > 0 ? durationInput : 0;
      if (endTimeInput) {
        endMins = AdminController.parseTimeStringToMinutes(String(endTimeInput));
        if (endMins === null) {
          throw import_apiError.ApiError.badRequest(`Invalid endTime format "${endTimeInput}". Use HH:mm or h:mm AM/PM.`);
        }
        if (endMins <= startMins && !durationInput) {
          throw import_apiError.ApiError.badRequest("End time must be after start time.");
        }
        if (!durationMinutes) {
          durationMinutes = endMins - startMins;
        }
      } else if (durationMinutes > 0) {
        endMins = startMins + durationMinutes;
      } else {
        durationMinutes = existingSession?.durationMinutes || 120;
        endMins = startMins + durationMinutes;
      }
      if (durationMinutes < 5 || durationMinutes > 1440) {
        throw import_apiError.ApiError.badRequest("Class duration must be between 5 minutes and 24 hours.");
      }
      const dateStr = String(dateInput).trim();
      const ymdMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
      let year;
      let monthIndex;
      let day;
      if (ymdMatch) {
        year = parseInt(ymdMatch[1], 10);
        monthIndex = parseInt(ymdMatch[2], 10) - 1;
        day = parseInt(ymdMatch[3], 10);
      } else {
        const parsedD = new Date(dateStr);
        if (isNaN(parsedD.getTime())) {
          throw import_apiError.ApiError.badRequest(`Invalid class date "${dateInput}".`);
        }
        year = parsedD.getUTCFullYear();
        monthIndex = parsedD.getUTCMonth();
        day = parsedD.getUTCDate();
      }
      const approxUtc = new Date(Date.UTC(year, monthIndex, day, Math.floor(startMins / 60), startMins % 60, 0));
      const tzOffsetMinutes = AdminController.getTimezoneOffsetMinutes(timezone, approxUtc);
      const startUtcMs = Date.UTC(year, monthIndex, day, 0, 0, 0) + (startMins - tzOffsetMinutes) * 60 * 1e3;
      const startAt = new Date(startUtcMs);
      const endAt = new Date(startUtcMs + durationMinutes * 60 * 1e3);
      if (isNaN(startAt.getTime()) || isNaN(endAt.getTime()) || startAt >= endAt) {
        throw import_apiError.ApiError.badRequest("Computed startAt must be strictly before endAt.");
      }
      return {
        startAt,
        endAt,
        sessionDate: startAt,
        startTime: AdminController.formatMinutesTo12Hour(startMins),
        endTime: AdminController.formatMinutesTo12Hour(startMins + durationMinutes),
        durationMinutes,
        timezone
      };
    }
    if (body.startAt) {
      const startAt = new Date(body.startAt);
      if (isNaN(startAt.getTime())) {
        throw import_apiError.ApiError.badRequest("Invalid startAt timestamp.");
      }
      let durationMinutes = durationInput && durationInput > 0 ? durationInput : existingSession?.durationMinutes || 120;
      let endAt;
      if (body.endAt) {
        endAt = new Date(body.endAt);
        if (isNaN(endAt.getTime())) {
          throw import_apiError.ApiError.badRequest("Invalid endAt timestamp.");
        }
        durationMinutes = Math.round((endAt.getTime() - startAt.getTime()) / 6e4);
      } else {
        endAt = new Date(startAt.getTime() + durationMinutes * 6e4);
      }
      if (startAt >= endAt || durationMinutes < 5) {
        throw import_apiError.ApiError.badRequest("End time must be at least 5 minutes after start time.");
      }
      const tzOffsetMinutes = AdminController.getTimezoneOffsetMinutes(timezone, startAt);
      const localStart = new Date(startAt.getTime() + tzOffsetMinutes * 6e4);
      const startMins = localStart.getUTCHours() * 60 + localStart.getUTCMinutes();
      return {
        startAt,
        endAt,
        sessionDate: startAt,
        startTime: AdminController.formatMinutesTo12Hour(startMins),
        endTime: AdminController.formatMinutesTo12Hour(startMins + durationMinutes),
        durationMinutes,
        timezone
      };
    }
    if (existingSession) {
      const startAt = existingSession.startAt ? new Date(existingSession.startAt) : new Date(existingSession.sessionDate || Date.now());
      const durationMinutes = Number(existingSession.durationMinutes) || 120;
      const endAt = existingSession.endAt ? new Date(existingSession.endAt) : new Date(startAt.getTime() + durationMinutes * 6e4);
      return {
        startAt,
        endAt,
        sessionDate: startAt,
        startTime: existingSession.startTime || "10:00 AM",
        endTime: existingSession.endTime || "12:00 PM",
        durationMinutes,
        timezone
      };
    }
    throw import_apiError.ApiError.badRequest("Class date and start time (or startAt/endAt) are required.");
  }
  static normalizeSessionRecord(raw, workshopsMap) {
    const obj = typeof raw?.toObject === "function" ? raw.toObject() : { ...raw };
    const id = obj._id?.toString() || obj.id;
    const startAt = obj.startAt ? new Date(obj.startAt) : obj.sessionDate ? new Date(obj.sessionDate) : /* @__PURE__ */ new Date();
    const durationMinutes = Number(obj.durationMinutes) || (obj.endAt && obj.startAt ? Math.max(15, Math.round((new Date(obj.endAt).getTime() - new Date(obj.startAt).getTime()) / 6e4)) : 120);
    const endAt = obj.endAt ? new Date(obj.endAt) : new Date(startAt.getTime() + durationMinutes * 6e4);
    const batchCode = (obj.batchCode || obj.batchId || "AILP-2026-NOV-14").toUpperCase();
    const ws = workshopsMap?.get(obj.workshopId?.toString()) || workshopsMap?.get(batchCode);
    return {
      ...obj,
      _id: id,
      workshopId: obj.workshopId?.toString() || ws?._id?.toString() || batchCode,
      workshopTitle: obj.workshopTitle || ws?.title || "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
      batchId: obj.batchId || batchCode,
      batchCode,
      dayNumber: Number(obj.dayNumber) || 1,
      title: obj.title || "Live Training Class",
      description: obj.description || `Live interactive session for batch ${batchCode} led by ${obj.instructorName || "Instructor"}.`,
      sessionDate: startAt,
      startAt,
      endAt,
      startTime: obj.startTime || "10:00 AM",
      endTime: obj.endTime || "12:00 PM",
      durationMinutes,
      timezone: obj.timezone || "Asia/Kolkata",
      instructorId: obj.instructorId || "inst_1",
      instructorName: obj.instructorName || ws?.instructor?.name || "Vikram Malhotra",
      classType: obj.classType || "live",
      meetingProvider: obj.meetingProvider || "google_meet",
      liveSessionUrl: obj.liveSessionUrl || "",
      encryptedMeetingUrl: obj.encryptedMeetingUrl || (obj.liveSessionUrl ? `enc:${Buffer.from(String(obj.liveSessionUrl)).toString("base64")}` : ""),
      meetingPasscode: obj.meetingPasscode || "",
      visibility: obj.visibility || "enrolled_only",
      capacity: Number(obj.capacity || obj.maxAttendees) || 60,
      maxAttendees: Number(obj.maxAttendees || obj.capacity) || 60,
      sessionResources: Array.isArray(obj.sessionResources) ? obj.sessionResources : [],
      reminderMinutesBefore: Number(obj.reminderMinutesBefore) || 30,
      recurrenceSeriesId: obj.recurrenceSeriesId || null,
      recurrenceRule: obj.recurrenceRule || { frequency: "none", interval: 1, daysOfWeek: [] },
      status: obj.status || "scheduled",
      cancellationReason: obj.cancellationReason || null,
      changeHistory: Array.isArray(obj.changeHistory) ? obj.changeHistory : [],
      createdAt: obj.createdAt || startAt,
      updatedAt: obj.updatedAt || startAt
    };
  }
  static async getAllCalendarSessionsUnified() {
    const workshopsMap = /* @__PURE__ */ new Map();
    let workshops = [];
    if ((0, import_db.isDBConnected)()) {
      try {
        workshops = await import_Workshop.Workshop.find();
      } catch {
      }
    }
    const memWorkshops = await import_memoryStore.memoryStore.getAllWorkshops();
    for (const w of [...workshops, ...memWorkshops]) {
      if (w._id) workshopsMap.set(w._id.toString(), w);
      if (w.batchCode) workshopsMap.set(String(w.batchCode).toUpperCase(), w);
    }
    const sessionMap = /* @__PURE__ */ new Map();
    if ((0, import_db.isDBConnected)()) {
      try {
        const dbSessions = await import_WorkshopSession.WorkshopSession.find().sort({ startAt: 1, sessionDate: 1 });
        for (const s of dbSessions) {
          const norm = AdminController.normalizeSessionRecord(s, workshopsMap);
          sessionMap.set(norm._id, norm);
        }
      } catch (err) {
        console.warn("[Calendar Unified Sessions DB Warning]", err.message);
      }
    }
    const memSessions = await import_memoryStore.memoryStore.getAllSessions();
    for (const ms of memSessions) {
      const norm = AdminController.normalizeSessionRecord(ms, workshopsMap);
      if (!sessionMap.has(norm._id)) {
        sessionMap.set(norm._id, norm);
      }
    }
    return Array.from(sessionMap.values()).sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
  }
  /**
   * Overlap Formula: existingStart < newEnd AND existingEnd > newStart
   */
  static async checkSessionConflicts(candidate, excludeIds = []) {
    const excludeSet = new Set(excludeIds.filter(Boolean).map((id) => String(id)));
    const allSessions = await AdminController.getAllCalendarSessionsUnified();
    const conflicts = [];
    const newStart = new Date(candidate.startAt).getTime();
    const newEnd = new Date(candidate.endAt).getTime();
    const candInstructor = (candidate.instructorName || "").trim().toLowerCase();
    const candInstructorId = (candidate.instructorId || "").trim();
    const candBatch = (candidate.batchCode || candidate.batchId || "").trim().toUpperCase();
    const candUrl = (candidate.liveSessionUrl || "").trim().toLowerCase();
    for (const existing of allSessions) {
      const exId = String(existing._id);
      if (excludeSet.has(exId)) continue;
      if (existing.status === "cancelled") continue;
      const existingStart = new Date(existing.startAt).getTime();
      const existingEnd = new Date(existing.endAt).getTime();
      if (existingStart < newEnd && existingEnd > newStart) {
        const exInstructor = (existing.instructorName || "").trim().toLowerCase();
        const exInstructorId = (existing.instructorId || "").trim();
        const exBatch = (existing.batchCode || existing.batchId || "").trim().toUpperCase();
        const exUrl = (existing.liveSessionUrl || "").trim().toLowerCase();
        const dateLabel = new Date(existing.startAt).toISOString().slice(0, 10);
        if (candInstructor && exInstructor && candInstructor === exInstructor || candInstructorId && exInstructorId && candInstructorId === exInstructorId && candInstructorId !== "inst_1") {
          conflicts.push({
            type: "instructor",
            sessionId: exId,
            title: existing.title,
            batchCode: exBatch,
            instructorName: existing.instructorName,
            startAt: existing.startAt,
            endAt: existing.endAt,
            startTime: existing.startTime,
            endTime: existing.endTime,
            message: `Instructor conflict: ${existing.instructorName} is already scheduled for "${existing.title}" (${exBatch}) on ${dateLabel} from ${existing.startTime} to ${existing.endTime}.`
          });
        }
        if (candBatch && exBatch && candBatch === exBatch) {
          conflicts.push({
            type: "batch",
            sessionId: exId,
            title: existing.title,
            batchCode: exBatch,
            instructorName: existing.instructorName,
            startAt: existing.startAt,
            endAt: existing.endAt,
            startTime: existing.startTime,
            endTime: existing.endTime,
            message: `Batch conflict: Batch ${exBatch} already has "${existing.title}" scheduled on ${dateLabel} from ${existing.startTime} to ${existing.endTime}.`
          });
        }
        if (candUrl && exUrl && candUrl === exUrl && candBatch !== exBatch && candidate.classType !== "recorded") {
          conflicts.push({
            type: "meeting_resource",
            sessionId: exId,
            title: existing.title,
            batchCode: exBatch,
            instructorName: existing.instructorName,
            startAt: existing.startAt,
            endAt: existing.endAt,
            startTime: existing.startTime,
            endTime: existing.endTime,
            message: `Meeting room conflict: The meeting link (${candidate.liveSessionUrl}) is already reserved by "${existing.title}" (${exBatch}) from ${existing.startTime} to ${existing.endTime}.`
          });
        }
      }
    }
    return {
      hasConflict: conflicts.length > 0,
      conflicts
    };
  }
  static recentNotificationKeys = /* @__PURE__ */ new Map();
  static async dispatchCalendarNotification(params) {
    try {
      const now = Date.now();
      const prev = AdminController.recentNotificationKeys.get(params.eventKey);
      if (prev && now - prev < 6e4) {
        return;
      }
      AdminController.recentNotificationKeys.set(params.eventKey, now);
      const payload = {
        title: params.title,
        category: "announcement",
        description: params.message,
        workshopBatchCode: (params.batchCode || "ALL").toUpperCase(),
        accessLevel: "enrolled_only",
        isPublished: true,
        releaseAt: /* @__PURE__ */ new Date(),
        authorName: params.authorName || "Class Calendar Automated Notifier",
        authorRole: "enrolled_students"
      };
      if ((0, import_db.isDBConnected)()) {
        try {
          await import_LearningResource.LearningResource.create(payload);
          return;
        } catch {
        }
      }
      await import_memoryStore.memoryStore.createResource(payload);
    } catch (err) {
      console.warn("[Calendar Notification Dispatch Warning]", err.message);
    }
  }
  /**
   * GET /api/admin/calendar/sessions
   */
  static async getCalendarSessions(req, res, next) {
    try {
      const fromStr = req.query.from;
      const toStr = req.query.to;
      const workshopFilter = (req.query.workshopId || "all").trim();
      const batchFilter = (req.query.batchCode || req.query.batch || "all").trim().toUpperCase();
      const instructorFilter = (req.query.instructor || "all").trim().toLowerCase();
      const statusFilter = (req.query.status || "all").trim().toLowerCase();
      const classTypeFilter = (req.query.classType || "all").trim().toLowerCase();
      const search = (req.query.search || "").trim().toLowerCase();
      const allSessions = await AdminController.getAllCalendarSessionsUnified();
      const fromDate = fromStr ? new Date(fromStr) : null;
      const toDate = toStr ? new Date(toStr) : null;
      const filtered = allSessions.filter((s) => {
        const startMs = new Date(s.startAt).getTime();
        const endMs = new Date(s.endAt).getTime();
        if (fromDate && !isNaN(fromDate.getTime()) && endMs < fromDate.getTime()) {
          return false;
        }
        if (toDate && !isNaN(toDate.getTime()) && startMs > toDate.getTime()) {
          return false;
        }
        if (workshopFilter !== "all" && s.workshopId !== workshopFilter && s.batchCode.toUpperCase() !== workshopFilter.toUpperCase()) {
          return false;
        }
        if (batchFilter !== "ALL" && s.batchCode.toUpperCase() !== batchFilter) {
          return false;
        }
        if (instructorFilter !== "all" && !s.instructorName.toLowerCase().includes(instructorFilter) && s.instructorId?.toLowerCase() !== instructorFilter) {
          return false;
        }
        if (statusFilter !== "all" && s.status.toLowerCase() !== statusFilter) {
          return false;
        }
        if (classTypeFilter !== "all" && (s.classType || "live").toLowerCase() !== classTypeFilter) {
          return false;
        }
        if (search) {
          const hay = `${s.title} ${s.description || ""} ${s.batchCode} ${s.instructorName} ${s.workshopTitle || ""}`.toLowerCase();
          if (!hay.includes(search)) return false;
        }
        return true;
      });
      const summary = {
        total: filtered.length,
        scheduled: filtered.filter((s) => s.status === "scheduled").length,
        live: filtered.filter((s) => s.status === "live").length,
        completed: filtered.filter((s) => s.status === "completed").length,
        cancelled: filtered.filter((s) => s.status === "cancelled").length,
        draft: filtered.filter((s) => s.status === "draft").length
      };
      res.status(200).json({
        success: true,
        count: filtered.length,
        summary,
        data: filtered
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET /api/admin/calendar/sessions/:id
   */
  static async getCalendarSessionById(req, res, next) {
    try {
      const id = req.params["id"];
      const allSessions = await AdminController.getAllCalendarSessionsUnified();
      const found = allSessions.find((s) => String(s._id) === id);
      if (!found) {
        throw import_apiError.ApiError.notFound("Calendar session not found.");
      }
      res.status(200).json({
        success: true,
        data: found
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST /api/admin/calendar/sessions
   */
  static async createCalendarSession(req, res, next) {
    try {
      const {
        title,
        description,
        workshopId,
        batchCode,
        batchId,
        instructorId,
        instructorName,
        dayNumber,
        classType,
        meetingProvider,
        liveSessionUrl,
        meetingPasscode,
        visibility,
        status,
        capacity,
        maxAttendees,
        sessionResources,
        reminderMinutesBefore,
        allowPastCorrection
      } = req.body;
      const resolvedBatchCode = (batchCode || batchId || "").trim().toUpperCase();
      if (!title || !title.trim()) {
        throw import_apiError.ApiError.badRequest("Class Title is required.");
      }
      if (!resolvedBatchCode) {
        throw import_apiError.ApiError.badRequest("Batch / Workshop selection is required.");
      }
      if (!instructorName || !instructorName.trim()) {
        throw import_apiError.ApiError.badRequest("Instructor is required.");
      }
      if (!liveSessionUrl || !liveSessionUrl.trim()) {
        throw import_apiError.ApiError.badRequest("Meeting URL is required.");
      }
      const normalizedUrl = AdminController.normalizeMeetingUrl(liveSessionUrl);
      const parsedTime = AdminController.parseSessionStartEnd(req.body);
      const nowMs = Date.now();
      if (parsedTime.startAt.getTime() < nowMs - 5 * 60 * 1e3 && !allowPastCorrection) {
        throw import_apiError.ApiError.badRequest(
          "Cannot schedule a new class in the past without enabling the Authorized Past-Date Correction option."
        );
      }
      const resolvedStatus = ["draft", "scheduled", "live", "completed", "cancelled"].includes(status) ? status : "scheduled";
      if (resolvedStatus !== "cancelled") {
        const conflictCheck = await AdminController.checkSessionConflicts({
          startAt: parsedTime.startAt,
          endAt: parsedTime.endAt,
          instructorName: instructorName.trim(),
          instructorId,
          batchCode: resolvedBatchCode,
          batchId: batchId || resolvedBatchCode,
          liveSessionUrl: normalizedUrl,
          classType: classType || "live"
        });
        if (conflictCheck.hasConflict) {
          throw import_apiError.ApiError.conflict(conflictCheck.conflicts[0].message);
        }
      }
      const syncedWorkshopId = await AdminController.syncWorkshopForSession({
        workshopId,
        batchCode: resolvedBatchCode,
        dayNumber: Number(dayNumber) || 1,
        sessionDate: parsedTime.sessionDate,
        startTime: parsedTime.startTime,
        endTime: parsedTime.endTime,
        timezone: parsedTime.timezone,
        instructorName: instructorName.trim(),
        liveSessionUrl: normalizedUrl,
        meetingPasscode: (meetingPasscode || "").trim(),
        capacity: Number(maxAttendees || capacity) || 60
      });
      const adminActor = req.user?.email || req.user?.name || "admin@ailaunchpad.edu";
      const initialHistory = [
        {
          updatedAt: /* @__PURE__ */ new Date(),
          updatedBy: adminActor,
          action: "created",
          summary: `Created ${classType || "live"} session "${title.trim()}" for ${resolvedBatchCode} (${parsedTime.startTime} - ${parsedTime.endTime} ${parsedTime.timezone}).`
        }
      ];
      const sessionPayload = {
        workshopId: import_mongoose.default.Types.ObjectId.isValid(syncedWorkshopId) ? new import_mongoose.default.Types.ObjectId(syncedWorkshopId) : syncedWorkshopId,
        batchId: syncedWorkshopId,
        batchCode: resolvedBatchCode,
        instructorId: instructorId || "inst_1",
        instructorName: instructorName.trim(),
        dayNumber: Number(dayNumber) || 1,
        title: title.trim(),
        description: (description || "").trim() || `Live training session for ${resolvedBatchCode} with ${instructorName.trim()}.`,
        sessionDate: parsedTime.sessionDate,
        startAt: parsedTime.startAt,
        endAt: parsedTime.endAt,
        startTime: parsedTime.startTime,
        endTime: parsedTime.endTime,
        durationMinutes: parsedTime.durationMinutes,
        timezone: parsedTime.timezone,
        classType: ["live", "recorded", "hybrid"].includes(classType) ? classType : "live",
        meetingProvider: ["google_meet", "zoom", "teams", "custom"].includes(meetingProvider) ? meetingProvider : "google_meet",
        liveSessionUrl: normalizedUrl,
        encryptedMeetingUrl: `enc:${Buffer.from(normalizedUrl).toString("base64")}`,
        meetingPasscode: (meetingPasscode || "").trim(),
        visibility: visibility === "public_preview" ? "public_preview" : "enrolled_only",
        capacity: Number(maxAttendees || capacity) || 60,
        maxAttendees: Number(maxAttendees || capacity) || 60,
        sessionResources: Array.isArray(sessionResources) ? sessionResources : typeof sessionResources === "string" && sessionResources.trim() ? sessionResources.split(",").map((s) => s.trim()).filter(Boolean) : [],
        reminderMinutesBefore: Number(reminderMinutesBefore) || 30,
        status: resolvedStatus,
        createdBy: adminActor,
        updatedBy: adminActor,
        changeHistory: initialHistory
      };
      let created = null;
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(String(sessionPayload.workshopId))) {
        try {
          created = await import_WorkshopSession.WorkshopSession.create(sessionPayload);
        } catch (err) {
          console.warn("[Admin createCalendarSession DB Fallback]", err.message);
        }
      }
      const memCreated = await import_memoryStore.memoryStore.upsertSession({
        ...sessionPayload,
        _id: created?._id?.toString()
      });
      const finalRecord = AdminController.normalizeSessionRecord(created || memCreated);
      await AdminController.logAudit(
        req,
        "CREATE_CALENDAR_SESSION",
        "session",
        `Scheduled class "${finalRecord.title}" for ${resolvedBatchCode} on ${finalRecord.startAt.toISOString()}`,
        finalRecord._id,
        {
          batchCode: resolvedBatchCode,
          instructorName: finalRecord.instructorName,
          startAt: finalRecord.startAt,
          endAt: finalRecord.endAt,
          status: finalRecord.status
        }
      );
      if (finalRecord.status === "scheduled") {
        await AdminController.dispatchCalendarNotification({
          title: `New Class Scheduled: ${finalRecord.title}`,
          message: `${finalRecord.title} (${resolvedBatchCode}) has been scheduled with ${finalRecord.instructorName} on ${new Date(finalRecord.startAt).toDateString()} from ${finalRecord.startTime} to ${finalRecord.endTime} (${finalRecord.timezone}).`,
          batchCode: resolvedBatchCode,
          eventKey: `create_${finalRecord._id}`,
          authorName: req.user?.name || "Admin Calendar"
        });
      }
      res.status(201).json({
        success: true,
        message: "Class scheduled and saved to calendar.",
        data: finalRecord
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * PATCH /api/admin/calendar/sessions/:id
   * Supports editing metadata, rescheduling date/time, changing instructor or meeting link,
   * and applying edits to a single occurrence or future occurrences in a recurring series.
   */
  static async updateCalendarSession(req, res, next) {
    try {
      const id = req.params["id"];
      const scope = req.body.scope || "single";
      const allSessions = await AdminController.getAllCalendarSessionsUnified();
      const existing = allSessions.find((s) => String(s._id) === id);
      if (!existing) {
        throw import_apiError.ApiError.notFound("Calendar session not found.");
      }
      const parsedTime = AdminController.parseSessionStartEnd(req.body, existing);
      const updatedBatchCode = (req.body.batchCode || req.body.batchId || existing.batchCode).trim().toUpperCase();
      const updatedInstructor = (req.body.instructorName || existing.instructorName).trim();
      const updatedUrl = AdminController.normalizeMeetingUrl(
        req.body.liveSessionUrl ?? existing.liveSessionUrl
      );
      const updatedStatus = req.body.status || existing.status;
      const updatedClassType = req.body.classType || existing.classType || "live";
      let targetSessions = [existing];
      if ((scope === "future" || scope === "series") && existing.recurrenceSeriesId) {
        targetSessions = allSessions.filter(
          (s) => s.recurrenceSeriesId === existing.recurrenceSeriesId && s.status !== "cancelled" && (scope === "series" || new Date(s.startAt).getTime() >= new Date(existing.startAt).getTime())
        );
      }
      const excludeIds = targetSessions.map((t) => String(t._id));
      const timeShiftMs = parsedTime.startAt.getTime() - new Date(existing.startAt).getTime();
      if (updatedStatus !== "cancelled") {
        for (const target of targetSessions) {
          const occStart = target._id === existing._id ? parsedTime.startAt : new Date(new Date(target.startAt).getTime() + timeShiftMs);
          const occEnd = new Date(occStart.getTime() + parsedTime.durationMinutes * 6e4);
          const conflictCheck = await AdminController.checkSessionConflicts(
            {
              startAt: occStart,
              endAt: occEnd,
              instructorName: updatedInstructor,
              instructorId: req.body.instructorId || target.instructorId,
              batchCode: updatedBatchCode,
              batchId: updatedBatchCode,
              liveSessionUrl: updatedUrl,
              classType: updatedClassType
            },
            excludeIds
          );
          if (conflictCheck.hasConflict) {
            throw import_apiError.ApiError.conflict(conflictCheck.conflicts[0].message);
          }
        }
      }
      const adminActor = req.user?.email || req.user?.name || "admin@ailaunchpad.edu";
      const wasRescheduled = Math.abs(parsedTime.startAt.getTime() - new Date(existing.startAt).getTime()) >= 6e4 || Math.abs(parsedTime.endAt.getTime() - new Date(existing.endAt).getTime()) >= 6e4;
      const wasMeetingUpdated = updatedUrl !== existing.liveSessionUrl;
      const updatedRecords = [];
      for (const target of targetSessions) {
        const occStart = target._id === existing._id ? parsedTime.startAt : new Date(new Date(target.startAt).getTime() + timeShiftMs);
        const occEnd = new Date(occStart.getTime() + parsedTime.durationMinutes * 6e4);
        const historyEntry = {
          updatedAt: /* @__PURE__ */ new Date(),
          updatedBy: adminActor,
          action: wasRescheduled ? "rescheduled" : "updated",
          summary: wasRescheduled ? `Rescheduled from ${target.startTime} (${new Date(target.startAt).toISOString().slice(0, 10)}) to ${parsedTime.startTime} (${occStart.toISOString().slice(0, 10)}).` : `Updated session details (${req.body.title || target.title}).`,
          previousStartAt: new Date(target.startAt),
          previousEndAt: new Date(target.endAt)
        };
        const updatePayload = {
          title: req.body.title !== void 0 ? String(req.body.title).trim() : target.title,
          description: req.body.description !== void 0 ? String(req.body.description).trim() : target.description,
          batchCode: updatedBatchCode,
          batchId: updatedBatchCode,
          instructorName: updatedInstructor,
          instructorId: req.body.instructorId || target.instructorId,
          sessionDate: occStart,
          startAt: occStart,
          endAt: occEnd,
          startTime: parsedTime.startTime,
          endTime: parsedTime.endTime,
          durationMinutes: parsedTime.durationMinutes,
          timezone: parsedTime.timezone,
          classType: updatedClassType,
          meetingProvider: req.body.meetingProvider || target.meetingProvider || "google_meet",
          liveSessionUrl: updatedUrl,
          encryptedMeetingUrl: `enc:${Buffer.from(updatedUrl).toString("base64")}`,
          meetingPasscode: req.body.meetingPasscode !== void 0 ? req.body.meetingPasscode : target.meetingPasscode,
          visibility: req.body.visibility || target.visibility || "enrolled_only",
          capacity: Number(req.body.maxAttendees || req.body.capacity || target.capacity) || 60,
          maxAttendees: Number(req.body.maxAttendees || req.body.capacity || target.maxAttendees) || 60,
          status: updatedStatus,
          updatedBy: adminActor,
          changeHistory: [...target.changeHistory || [], historyEntry]
        };
        if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(String(target._id))) {
          try {
            await import_WorkshopSession.WorkshopSession.findByIdAndUpdate(target._id, updatePayload, { new: true });
          } catch (err) {
            console.warn("[Admin updateCalendarSession DB Fallback]", err.message);
          }
        }
        const savedMem = await import_memoryStore.memoryStore.upsertSession({
          ...target,
          ...updatePayload,
          _id: String(target._id)
        });
        updatedRecords.push(AdminController.normalizeSessionRecord(savedMem));
      }
      const primaryUpdated = updatedRecords[0];
      await AdminController.syncWorkshopForSession({
        workshopId: req.body.workshopId || existing.workshopId?.toString(),
        batchCode: updatedBatchCode,
        dayNumber: Number(primaryUpdated.dayNumber) || 1,
        sessionDate: new Date(primaryUpdated.startAt),
        startTime: primaryUpdated.startTime,
        endTime: primaryUpdated.endTime,
        timezone: primaryUpdated.timezone,
        instructorName: primaryUpdated.instructorName,
        liveSessionUrl: primaryUpdated.liveSessionUrl,
        meetingPasscode: primaryUpdated.meetingPasscode,
        capacity: Number(primaryUpdated.capacity) || 60
      });
      await AdminController.logAudit(
        req,
        wasRescheduled ? "RESCHEDULE_CALENDAR_SESSION" : "UPDATE_CALENDAR_SESSION",
        "session",
        `${wasRescheduled ? "Rescheduled" : "Updated"} class "${primaryUpdated.title}" (${updatedBatchCode}) [scope=${scope}, count=${updatedRecords.length}]`,
        id,
        {
          scope,
          wasRescheduled,
          wasMeetingUpdated,
          startAt: primaryUpdated.startAt,
          endAt: primaryUpdated.endAt
        }
      );
      if (wasRescheduled || wasMeetingUpdated) {
        await AdminController.dispatchCalendarNotification({
          title: wasRescheduled ? `Class Rescheduled: ${primaryUpdated.title}` : `Meeting Link Updated: ${primaryUpdated.title}`,
          message: wasRescheduled ? `${primaryUpdated.title} (${updatedBatchCode}) has been rescheduled to ${new Date(primaryUpdated.startAt).toDateString()} at ${primaryUpdated.startTime} - ${primaryUpdated.endTime} (${primaryUpdated.timezone}).` : `Meeting details for ${primaryUpdated.title} (${updatedBatchCode}) have been updated. Please check your Live Classes dashboard.`,
          batchCode: updatedBatchCode,
          eventKey: `update_${id}_${primaryUpdated.startAt.getTime()}`,
          authorName: req.user?.name || "Admin Calendar"
        });
      }
      res.status(200).json({
        success: true,
        message: updatedRecords.length > 1 ? `Updated ${updatedRecords.length} sessions in recurring series.` : wasRescheduled ? "Class rescheduled successfully." : "Class updated successfully.",
        data: primaryUpdated,
        updatedCount: updatedRecords.length
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST /api/admin/calendar/sessions/:id/cancel
   * Retains the session record and marks status as 'cancelled' instead of deleting history.
   */
  static async cancelCalendarSession(req, res, next) {
    try {
      const id = req.params["id"];
      const reason = (req.body.reason || req.body.cancellationReason || "Cancelled by administrator").trim();
      const scope = req.body.scope || "single";
      const allSessions = await AdminController.getAllCalendarSessionsUnified();
      const existing = allSessions.find((s) => String(s._id) === id);
      if (!existing) {
        throw import_apiError.ApiError.notFound("Calendar session not found.");
      }
      let targetSessions = [existing];
      if ((scope === "series" || scope === "future") && existing.recurrenceSeriesId) {
        targetSessions = allSessions.filter(
          (s) => s.recurrenceSeriesId === existing.recurrenceSeriesId && s.status !== "cancelled" && (scope === "series" || new Date(s.startAt).getTime() >= new Date(existing.startAt).getTime())
        );
      }
      const adminActor = req.user?.email || req.user?.name || "admin@ailaunchpad.edu";
      const cancelledRecords = [];
      for (const target of targetSessions) {
        const historyEntry = {
          updatedAt: /* @__PURE__ */ new Date(),
          updatedBy: adminActor,
          action: "cancelled",
          summary: `Cancelled session. Reason: ${reason}`,
          previousStartAt: new Date(target.startAt),
          previousEndAt: new Date(target.endAt)
        };
        const cancelUpdate = {
          status: "cancelled",
          cancellationReason: reason,
          updatedBy: adminActor,
          changeHistory: [...target.changeHistory || [], historyEntry]
        };
        if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(String(target._id))) {
          try {
            await import_WorkshopSession.WorkshopSession.findByIdAndUpdate(target._id, cancelUpdate, { new: true });
          } catch (err) {
            console.warn("[Admin cancelCalendarSession DB Fallback]", err.message);
          }
        }
        const savedMem = await import_memoryStore.memoryStore.upsertSession({
          ...target,
          ...cancelUpdate,
          _id: String(target._id)
        });
        cancelledRecords.push(AdminController.normalizeSessionRecord(savedMem));
      }
      const primaryCancelled = cancelledRecords[0];
      await AdminController.logAudit(
        req,
        "CANCEL_CALENDAR_SESSION",
        "session",
        `Cancelled class "${primaryCancelled.title}" (${primaryCancelled.batchCode}). Reason: ${reason} [scope=${scope}, count=${cancelledRecords.length}]`,
        id,
        { reason, scope, cancelledCount: cancelledRecords.length }
      );
      await AdminController.dispatchCalendarNotification({
        title: `Class Cancelled: ${primaryCancelled.title}`,
        message: `${primaryCancelled.title} (${primaryCancelled.batchCode}) scheduled on ${new Date(primaryCancelled.startAt).toDateString()} (${primaryCancelled.startTime}) has been cancelled. Reason: ${reason}`,
        batchCode: primaryCancelled.batchCode,
        eventKey: `cancel_${id}`,
        authorName: req.user?.name || "Admin Calendar"
      });
      res.status(200).json({
        success: true,
        message: cancelledRecords.length > 1 ? `Cancelled ${cancelledRecords.length} sessions in recurring series.` : "Class cancelled and retained in calendar history.",
        data: primaryCancelled,
        cancelledCount: cancelledRecords.length
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST /api/admin/calendar/recurring
   * Generates daily, weekly, or selected-weekday recurring classes with live preview & conflict detection.
   */
  static async createRecurringSessions(req, res, next) {
    try {
      const {
        title,
        description,
        workshopId,
        batchCode,
        batchId,
        instructorId,
        instructorName,
        classType,
        meetingProvider,
        liveSessionUrl,
        meetingPasscode,
        visibility,
        status,
        maxAttendees,
        capacity,
        recurrenceRule,
        previewOnly
      } = req.body;
      const resolvedBatchCode = (batchCode || batchId || "").trim().toUpperCase();
      if (!title || !resolvedBatchCode || !instructorName || !liveSessionUrl) {
        throw import_apiError.ApiError.badRequest(
          "title, batchCode, instructorName, and liveSessionUrl are required for recurring classes."
        );
      }
      const rule = recurrenceRule || {};
      const frequency = ["daily", "weekly", "weekdays", "custom"].includes(rule.frequency) ? rule.frequency : "weekly";
      const interval = Math.max(1, Number(rule.interval) || 1);
      const daysOfWeek = Array.isArray(rule.daysOfWeek) ? rule.daysOfWeek.map((d) => Number(d)).filter((d) => d >= 0 && d <= 6) : [1, 3, 5];
      const firstTime = AdminController.parseSessionStartEnd(req.body);
      const untilDate = rule.untilDate ? /* @__PURE__ */ new Date(`${String(rule.untilDate).slice(0, 10)}T23:59:59.999Z`) : new Date(firstTime.startAt.getTime() + 28 * 864e5);
      if (isNaN(untilDate.getTime()) || untilDate < firstTime.startAt) {
        throw import_apiError.ApiError.badRequest("Recurrence end date (untilDate) must be on or after the first class date.");
      }
      const occurrenceStarts = [];
      const maxOccurrences = Math.min(60, Number(rule.occurrencesCount) || 60);
      let cursorMs = firstTime.startAt.getTime();
      const firstDayOfWeek = firstTime.startAt.getUTCDay();
      let safetyCounter = 0;
      while (cursorMs <= untilDate.getTime() && occurrenceStarts.length < maxOccurrences && safetyCounter < 366) {
        safetyCounter++;
        const candidateDate = new Date(cursorMs);
        const dow = candidateDate.getUTCDay();
        let include = false;
        if (frequency === "daily") {
          const daysDiff = Math.round((cursorMs - firstTime.startAt.getTime()) / 864e5);
          include = daysDiff % interval === 0;
        } else if (frequency === "weekly") {
          const daysDiff = Math.round((cursorMs - firstTime.startAt.getTime()) / 864e5);
          const weeksDiff = Math.floor(daysDiff / 7);
          if (daysOfWeek.length > 0) {
            include = weeksDiff % interval === 0 && daysOfWeek.includes(dow);
          } else {
            include = weeksDiff % interval === 0 && dow === firstDayOfWeek;
          }
        } else if (frequency === "weekdays" || frequency === "custom") {
          const activeDays = daysOfWeek.length > 0 ? daysOfWeek : [1, 2, 3, 4, 5];
          include = activeDays.includes(dow);
        }
        if (include) {
          occurrenceStarts.push(candidateDate);
        }
        cursorMs += 864e5;
      }
      if (occurrenceStarts.length === 0) {
        throw import_apiError.ApiError.badRequest(
          "No recurring class occurrences matched the selected weekdays and recurrence end date."
        );
      }
      const seriesId = `series_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const previewItems = [];
      const allConflicts = [];
      for (let i = 0; i < occurrenceStarts.length; i++) {
        const occStart = occurrenceStarts[i];
        const occEnd = new Date(occStart.getTime() + firstTime.durationMinutes * 6e4);
        const conflictCheck = await AdminController.checkSessionConflicts({
          startAt: occStart,
          endAt: occEnd,
          instructorName: instructorName.trim(),
          instructorId,
          batchCode: resolvedBatchCode,
          batchId: resolvedBatchCode,
          liveSessionUrl: liveSessionUrl.trim(),
          classType: classType || "live"
        });
        if (conflictCheck.hasConflict) {
          allConflicts.push(...conflictCheck.conflicts);
        }
        previewItems.push({
          occurrenceNumber: i + 1,
          title: `${title.trim()} (Session ${i + 1})`,
          batchCode: resolvedBatchCode,
          instructorName: instructorName.trim(),
          startAt: occStart,
          endAt: occEnd,
          startTime: firstTime.startTime,
          endTime: firstTime.endTime,
          durationMinutes: firstTime.durationMinutes,
          timezone: firstTime.timezone,
          hasConflict: conflictCheck.hasConflict,
          conflicts: conflictCheck.conflicts
        });
      }
      if (previewOnly) {
        res.status(200).json({
          success: true,
          preview: true,
          count: previewItems.length,
          conflictCount: allConflicts.length,
          conflicts: allConflicts,
          data: previewItems
        });
        return;
      }
      if (allConflicts.length > 0) {
        throw import_apiError.ApiError.conflict(
          `Cannot save recurring series: ${allConflicts.length} conflict(s) detected. First conflict: ${allConflicts[0].message}`
        );
      }
      const adminActor = req.user?.email || req.user?.name || "admin@ailaunchpad.edu";
      const savedOccurrences = [];
      for (let i = 0; i < previewItems.length; i++) {
        const item = previewItems[i];
        const payload = {
          workshopId: workshopId && import_mongoose.default.Types.ObjectId.isValid(workshopId) ? new import_mongoose.default.Types.ObjectId(workshopId) : workshopId || resolvedBatchCode,
          batchId: resolvedBatchCode,
          batchCode: resolvedBatchCode,
          instructorId: instructorId || "inst_1",
          instructorName: instructorName.trim(),
          dayNumber: i + 1,
          title: item.title,
          description: (description || "").trim() || `Recurring session #${i + 1} for ${resolvedBatchCode} with ${instructorName.trim()}.`,
          sessionDate: item.startAt,
          startAt: item.startAt,
          endAt: item.endAt,
          startTime: item.startTime,
          endTime: item.endTime,
          durationMinutes: item.durationMinutes,
          timezone: item.timezone,
          classType: ["live", "recorded", "hybrid"].includes(classType) ? classType : "live",
          meetingProvider: ["google_meet", "zoom", "teams", "custom"].includes(meetingProvider) ? meetingProvider : "google_meet",
          liveSessionUrl: liveSessionUrl.trim(),
          encryptedMeetingUrl: `enc:${Buffer.from(liveSessionUrl.trim()).toString("base64")}`,
          meetingPasscode: (meetingPasscode || "").trim(),
          visibility: visibility === "public_preview" ? "public_preview" : "enrolled_only",
          capacity: Number(maxAttendees || capacity) || 60,
          maxAttendees: Number(maxAttendees || capacity) || 60,
          recurrenceSeriesId: seriesId,
          recurrenceRule: {
            frequency,
            interval,
            daysOfWeek,
            untilDate
          },
          status: status === "draft" ? "draft" : "scheduled",
          createdBy: adminActor,
          updatedBy: adminActor,
          changeHistory: [
            {
              updatedAt: /* @__PURE__ */ new Date(),
              updatedBy: adminActor,
              action: "created_recurring",
              summary: `Created as occurrence #${i + 1} of recurring series ${seriesId}.`
            }
          ]
        };
        let dbDoc = null;
        if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(String(payload.workshopId))) {
          try {
            dbDoc = await import_WorkshopSession.WorkshopSession.create(payload);
          } catch {
          }
        }
        const memDoc = await import_memoryStore.memoryStore.upsertSession({
          ...payload,
          _id: dbDoc?._id?.toString()
        });
        savedOccurrences.push(AdminController.normalizeSessionRecord(dbDoc || memDoc));
      }
      await AdminController.logAudit(
        req,
        "CREATE_RECURRING_SESSIONS",
        "session",
        `Created recurring series "${title.trim()}" (${savedOccurrences.length} occurrences) for ${resolvedBatchCode}`,
        seriesId,
        { seriesId, frequency, count: savedOccurrences.length, batchCode: resolvedBatchCode }
      );
      await AdminController.dispatchCalendarNotification({
        title: `New Recurring Class Series: ${title.trim()}`,
        message: `${savedOccurrences.length} sessions of "${title.trim()}" (${resolvedBatchCode}) have been scheduled with ${instructorName.trim()} starting ${new Date(firstTime.startAt).toDateString()}.`,
        batchCode: resolvedBatchCode,
        eventKey: `series_${seriesId}`,
        authorName: req.user?.name || "Admin Calendar"
      });
      res.status(201).json({
        success: true,
        message: `Scheduled ${savedOccurrences.length} recurring classes successfully.`,
        seriesId,
        count: savedOccurrences.length,
        data: savedOccurrences
      });
    } catch (error) {
      next(error);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AdminController
});
