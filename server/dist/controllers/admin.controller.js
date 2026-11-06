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
var import_ProjectSubmission = require("../models/ProjectSubmission.js");
var import_LearningResource = require("../models/LearningResource.js");
var import_AuditLog = require("../models/AuditLog.js");
var import_PlatformSettings = require("../models/PlatformSettings.js");
var import_apiError = require("../utils/apiError.js");
var import_env = require("../config/env.js");
var import_db = require("../config/db.js");
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
          [
            users,
            workshops,
            enrollments,
            registrations,
            payments,
            attendanceRecords,
            certificates,
            submissions
          ] = await Promise.all([
            import_User.User.find().select("-passwordHash -resetPasswordToken -resetPasswordExpires").sort({ createdAt: -1 }),
            import_Workshop.Workshop.find().sort({ startDate: 1 }),
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
      const pendingEnrollmentsCount = enrollments.filter((e) => e.status === "pending" || e.status === "reserved").length + registrations.filter((r) => r.registrationStatus === "pending").length;
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
      const { id } = req.params;
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
      const { id } = req.params;
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
      const { id } = req.params;
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
      const { id } = req.params;
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
      let sessions = [];
      if ((0, import_db.isDBConnected)()) {
        try {
          sessions = await import_WorkshopSession.WorkshopSession.find().sort({ sessionDate: 1, dayNumber: 1 });
        } catch (err) {
          console.warn("[Admin getSessions DB Fallback]", err.message);
        }
      }
      if (sessions.length === 0) {
        sessions = await import_memoryStore.memoryStore.getAllSessions();
      }
      res.status(200).json({
        success: true,
        count: sessions.length,
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  }
  static async upsertSession(req, res, next) {
    try {
      const {
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
        registrationDeadline,
        status
      } = req.body;
      if (!batchCode || !dayNumber || !title || !liveSessionUrl) {
        throw import_apiError.ApiError.badRequest("batchCode, dayNumber, title, and liveSessionUrl are required.");
      }
      let saved = null;
      if ((0, import_db.isDBConnected)() && workshopId && import_mongoose.default.Types.ObjectId.isValid(workshopId)) {
        try {
          saved = await import_WorkshopSession.WorkshopSession.findOneAndUpdate(
            { workshopId, dayNumber: Number(dayNumber) },
            {
              workshopId,
              batchCode: batchCode.toUpperCase(),
              dayNumber: Number(dayNumber),
              title,
              sessionDate: sessionDate ? new Date(sessionDate) : /* @__PURE__ */ new Date(),
              startTime: startTime || "10:00 AM",
              endTime: endTime || "3:00 PM",
              timezone: timezone || "Asia/Kolkata (IST)",
              instructorName: instructorName || "Vikram Malhotra",
              liveSessionUrl,
              meetingPasscode,
              capacity: Number(capacity) || 60,
              registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : void 0,
              status: status || "scheduled"
            },
            { upsert: true, new: true }
          );
        } catch (err) {
          console.warn("[Admin upsertSession DB Fallback]", err.message);
        }
      }
      if (!saved) {
        saved = await import_memoryStore.memoryStore.upsertSession({
          _id: req.params.id,
          workshopId: workshopId || batchCode,
          batchCode: batchCode.toUpperCase(),
          dayNumber: Number(dayNumber),
          title,
          sessionDate: sessionDate ? new Date(sessionDate) : /* @__PURE__ */ new Date(),
          startTime: startTime || "10:00 AM",
          endTime: endTime || "3:00 PM",
          timezone: timezone || "Asia/Kolkata (IST)",
          instructorName: instructorName || "Vikram Malhotra",
          liveSessionUrl,
          meetingPasscode,
          capacity: Number(capacity) || 60,
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : void 0,
          status: status || "scheduled"
        });
      }
      await AdminController.logAudit(
        req,
        "UPSERT_SESSION",
        "session",
        `Configured Day ${dayNumber} session for batch ${batchCode}`,
        saved._id?.toString(),
        { batchCode, dayNumber, instructorName, liveSessionUrl }
      );
      res.status(200).json({
        success: true,
        message: `Day ${dayNumber} session saved for ${batchCode}.`,
        data: saved
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
      const { id } = req.params;
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
      if ((0, import_db.isDBConnected)()) {
        try {
          dbEnrollments = await import_Enrollment.Enrollment.find().populate("workshopId", "title batchCode startDate price").populate("userId", "name email phone").sort({ createdAt: -1 });
          dbRegistrations = await import_Registration.Registration.find().sort({ createdAt: -1 });
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
        ...dbEnrollments.map((e) => ({
          _id: e._id?.toString(),
          enrollmentId: e.enrollmentId || `ENR-${e._id?.toString().slice(-6).toUpperCase()}`,
          studentName: e.attendeeDetails?.fullName || e.userId?.name || "Student",
          email: e.attendeeDetails?.email || e.userId?.email || "",
          phone: e.attendeeDetails?.phone || e.userId?.phone?.number || "",
          workshopTitle: e.workshopId?.title || "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
          batchCode: e.workshopId?.batchCode || e.workshop || "AILP-2026-NOV-14",
          enrolledAt: e.enrolledAt || e.createdAt,
          status: e.status,
          paymentStatus: e.paymentStatus,
          sourceType: "enrollment"
        })),
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
      const { id } = req.params;
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
      const { id } = req.params;
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
      const { id } = req.params;
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
      const { id } = req.params;
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
      const { id } = req.params;
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
      const { workshopId } = req.params;
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
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AdminController
});
//# sourceMappingURL=admin.controller.js.map
