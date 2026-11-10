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
var memoryStore_exports = {};
__export(memoryStore_exports, {
  memoryStore: () => memoryStore
});
module.exports = __toCommonJS(memoryStore_exports);
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_env = require("../config/env.js");
class MemoryStoreService {
  users = /* @__PURE__ */ new Map();
  workshops = /* @__PURE__ */ new Map();
  enrollments = /* @__PURE__ */ new Map();
  registrations = /* @__PURE__ */ new Map();
  sessions = /* @__PURE__ */ new Map();
  resources = /* @__PURE__ */ new Map();
  certificates = /* @__PURE__ */ new Map();
  submissions = /* @__PURE__ */ new Map();
  assignments = /* @__PURE__ */ new Map();
  auditLogs = [];
  settings = {
    key: "global_settings",
    branding: {
      siteName: "AI Launchpad",
      tagline: "2-Day Hands-On AI Bootcamp",
      supportEmail: "admissions@ailaunchpad.edu",
      supportPhone: "+91 98765 43210",
      primaryColor: "#081e4a"
    },
    registration: {
      allowPublicRegistration: true,
      requireEmailVerification: false,
      maxSeatsPerBatch: 60,
      reservationHoldMinutes: 15,
      waitlistEnabled: true
    },
    workshopDefaults: {
      defaultBasePrice: 1999,
      defaultCurrency: "INR",
      defaultTaxPercentage: 18,
      defaultTimezone: "Asia/Kolkata (IST)",
      defaultTimings: "10:00 AM \u2013 3:00 PM IST"
    },
    emailTemplates: {
      registrationConfirmationSubject: "Welcome to AI Launchpad \u2014 Your Cohort Registration Details",
      paymentReceiptSubject: "Confirmed: Your AI Launchpad Bootcamp Seat & Payment Receipt",
      certificateIssuedSubject: "Congratulations! Your Official AI Launchpad Certificate is Ready",
      reminderHoursBeforeSession: 24
    },
    instructorPermissions: {
      canMarkAttendance: true,
      canReviewSubmissions: true,
      canUploadMaterials: true,
      canViewStudentEmails: true
    },
    notifications: {
      notifyAdminOnNewEnrollment: true,
      notifyAdminOnPaymentFailure: true,
      notifyStudentOnCertificateIssue: true
    },
    updatedAt: /* @__PURE__ */ new Date()
  };
  initPromise = null;
  constructor() {
    this.initPromise = this.runInit();
  }
  async init() {
    if (!this.initPromise) {
      this.initPromise = this.runInit();
    }
    await this.initPromise;
  }
  async runInit() {
    const adminPasswordHash = await import_bcryptjs.default.hash(import_env.env.ADMIN_PASSWORD, 10);
    const fallbackAdminHash = await import_bcryptjs.default.hash("AdminPassword123!", 10);
    const eduAdminHash = await import_bcryptjs.default.hash("AdminLaunchpad2026!", 10);
    const compareAdminPwd = async (pwd, primaryHash) => {
      if (primaryHash && await import_bcryptjs.default.compare(pwd, primaryHash)) return true;
      if (await import_bcryptjs.default.compare(pwd, fallbackAdminHash)) return true;
      if (await import_bcryptjs.default.compare(pwd, eduAdminHash)) return true;
      return false;
    };
    const adminEmails = Array.from(
      /* @__PURE__ */ new Set([import_env.env.ADMIN_EMAIL.toLowerCase(), "admin@ailaunchpad.edu", "admin@ailaunchpad.com"])
    );
    adminEmails.forEach((admEmail, idx) => {
      const adminId = `mem_user_admin_00${idx + 1}`;
      this.users.set(adminId, {
        _id: adminId,
        name: import_env.env.ADMIN_NAME || "System Administrator",
        email: admEmail,
        passwordHash: adminPasswordHash,
        role: "admin",
        userCategory: "working_professional",
        experienceLevel: "advanced",
        phone: { countryCode: "+91", number: "9999999999" },
        marketingConsent: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        async comparePassword(pwd) {
          return compareAdminPwd(pwd, this.passwordHash);
        }
      });
    });
    const defaultWorkshops = [
      {
        _id: "batch-nov-14",
        title: "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
        slug: "ai-launchpad-nov-14-2026",
        batchCode: "AILP-2026-NOV-14",
        description: "Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.",
        instructor: {
          name: "Vikram Malhotra",
          role: "Staff AI Engineer & Former ML Lead",
          bio: "Over 12 years building production software and 4 years leading enterprise LLM integrations. Mentored over 1,500 professionals.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
        },
        startDate: /* @__PURE__ */ new Date("2026-11-14T10:00:00+05:30"),
        endDate: /* @__PURE__ */ new Date("2026-11-15T15:00:00+05:30"),
        timings: "10:00 AM \u2013 3:00 PM IST",
        timezone: "Asia/Kolkata (IST)",
        capacity: 60,
        enrolledCount: 36,
        reservedCount: 0,
        availableSeats: 24,
        price: {
          basePrice: 1999,
          currency: "INR",
          taxPercentage: 18,
          isFree: false
        },
        status: "published"
      },
      {
        _id: "batch-nov-28",
        title: "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
        slug: "ai-launchpad-nov-28-2026",
        batchCode: "AILP-2026-NOV-28",
        description: "Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.",
        instructor: {
          name: "Ananya Sharma",
          role: "Senior Applied AI Researcher",
          bio: "Former AI Architect at DeepScale AI. Specialized in agent architectures, multi-agent frameworks, and vector search.",
          avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
        },
        startDate: /* @__PURE__ */ new Date("2026-11-28T10:00:00+05:30"),
        endDate: /* @__PURE__ */ new Date("2026-11-29T15:00:00+05:30"),
        timings: "10:00 AM \u2013 3:00 PM IST",
        timezone: "Asia/Kolkata (IST)",
        capacity: 60,
        enrolledCount: 12,
        reservedCount: 0,
        availableSeats: 48,
        price: {
          basePrice: 1999,
          currency: "INR",
          taxPercentage: 18,
          isFree: false
        },
        status: "published"
      },
      {
        _id: "batch-dec-12",
        title: "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
        slug: "ai-launchpad-dec-12-2026",
        batchCode: "AILP-2026-DEC-12",
        description: "Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.",
        instructor: {
          name: "Vikram Malhotra",
          role: "Staff AI Engineer & Former ML Lead",
          bio: "Over 12 years building production software and 4 years leading enterprise LLM integrations. Mentored over 1,500 professionals.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
        },
        startDate: /* @__PURE__ */ new Date("2026-12-12T10:00:00+05:30"),
        endDate: /* @__PURE__ */ new Date("2026-12-13T15:00:00+05:30"),
        timings: "10:00 AM \u2013 3:00 PM IST",
        timezone: "Asia/Kolkata (IST)",
        capacity: 60,
        enrolledCount: 2,
        reservedCount: 0,
        availableSeats: 58,
        price: {
          basePrice: 1999,
          currency: "INR",
          taxPercentage: 18,
          isFree: false
        },
        status: "published"
      }
    ];
    for (const w of defaultWorkshops) {
      this.workshops.set(w._id, w);
      const day1Start = new Date(w.startDate);
      const day1End = new Date(day1Start.getTime() + 5 * 60 * 60 * 1e3);
      const day2Start = new Date(w.endDate);
      day2Start.setHours(day1Start.getHours(), day1Start.getMinutes(), 0, 0);
      const day2End = new Date(day2Start.getTime() + 5 * 60 * 60 * 1e3);
      this.sessions.set(`${w._id}_day1`, {
        _id: `${w._id}_day1`,
        workshopId: w._id,
        batchId: w._id,
        batchCode: w.batchCode,
        dayNumber: 1,
        title: "Day 1: LLM Foundations, Prompt Architecture & Custom Assistants",
        description: "Interactive live training on LLM architectures, prompt engineering, and custom AI assistants.",
        sessionDate: day1Start,
        startAt: day1Start,
        endAt: day1End,
        durationMinutes: 300,
        startTime: "10:00 AM",
        endTime: "3:00 PM",
        timezone: "Asia/Kolkata",
        instructorName: w.instructor.name,
        classType: "live",
        meetingProvider: "google_meet",
        liveSessionUrl: `https://meet.google.com/ailp-${w.batchCode.toLowerCase()}-day1`,
        meetingPasscode: "AILP2026",
        visibility: "enrolled_only",
        capacity: w.capacity,
        maxAttendees: w.capacity,
        registrationDeadline: new Date(day1Start.getTime() - 24 * 60 * 60 * 1e3),
        status: "scheduled",
        changeHistory: [
          {
            action: "CREATED",
            summary: "Initial cohort Day 1 live session scheduled",
            actorEmail: import_env.env.ADMIN_EMAIL,
            timestamp: /* @__PURE__ */ new Date()
          }
        ]
      });
      this.sessions.set(`${w._id}_day2`, {
        _id: `${w._id}_day2`,
        workshopId: w._id,
        batchId: w._id,
        batchCode: w.batchCode,
        dayNumber: 2,
        title: "Day 2: Multi-Step AI Workflows, React Prototypes & Production Ship",
        description: "Hands-on lab building multi-step AI workflows, RAG pipelines, and full-stack web prototypes.",
        sessionDate: day2Start,
        startAt: day2Start,
        endAt: day2End,
        durationMinutes: 300,
        startTime: "10:00 AM",
        endTime: "3:00 PM",
        timezone: "Asia/Kolkata",
        instructorName: w.instructor.name,
        classType: "live",
        meetingProvider: "google_meet",
        liveSessionUrl: `https://meet.google.com/ailp-${w.batchCode.toLowerCase()}-day2`,
        meetingPasscode: "AILP2026",
        visibility: "enrolled_only",
        capacity: w.capacity,
        maxAttendees: w.capacity,
        registrationDeadline: new Date(day1Start.getTime() - 24 * 60 * 60 * 1e3),
        status: "scheduled",
        changeHistory: [
          {
            action: "CREATED",
            summary: "Initial cohort Day 2 live session scheduled",
            actorEmail: import_env.env.ADMIN_EMAIL,
            timestamp: /* @__PURE__ */ new Date()
          }
        ]
      });
    }
    const inst1Id = "mem_user_inst_001";
    this.users.set(inst1Id, {
      _id: inst1Id,
      name: "Vikram Malhotra",
      email: "vikram@ailaunchpad.edu",
      passwordHash: adminPasswordHash,
      role: "instructor",
      accountStatus: "active",
      bio: "Over 12 years building production software and 4 years leading enterprise LLM integrations. Mentored over 1,500 professionals.",
      expertise: ["LLM Architecture", "RAG Systems", "Prompt Engineering", "TypeScript"],
      availabilityStatus: "available",
      phone: { countryCode: "+91", number: "9888888881" },
      marketingConsent: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      async comparePassword(pwd) {
        return import_bcryptjs.default.compare(pwd, this.passwordHash || "");
      }
    });
    const inst2Id = "mem_user_inst_002";
    this.users.set(inst2Id, {
      _id: inst2Id,
      name: "Ananya Sharma",
      email: "ananya@ailaunchpad.edu",
      passwordHash: adminPasswordHash,
      role: "instructor",
      accountStatus: "active",
      bio: "Specialist in agentic AI architectures and LLM evals. Former AI Lead at hyper-growth tech startups.",
      expertise: ["AI Agents", "n8n & Make Workflows", "LLM Evals", "Full-Stack AI"],
      availabilityStatus: "available",
      phone: { countryCode: "+91", number: "9888888882" },
      marketingConsent: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      async comparePassword(pwd) {
        return import_bcryptjs.default.compare(pwd, this.passwordHash || "");
      }
    });
    const defaultResources = [
      {
        _id: "res_001",
        title: "Module 1 & 2: Reusable 10-Prompt Enterprise Library",
        category: "prompt_template",
        description: "Battle-tested system prompt templates for GPT-4o, Claude 3.5 Sonnet, and Gemini 2.0.",
        url: "https://ai-training-sessions-zeta.vercel.app/#curriculum",
        workshopBatchCode: "ALL",
        accessLevel: "enrolled_only",
        isPublished: true,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        _id: "res_002",
        title: "Module 3: Custom Assistant Grounding & RAG PDF Guide",
        category: "pdf",
        description: "Step-by-step architecture playbook for building hallucination-free enterprise AI assistants.",
        url: "https://ai-training-sessions-zeta.vercel.app/#curriculum",
        workshopBatchCode: "ALL",
        accessLevel: "enrolled_only",
        isPublished: true,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        _id: "res_003",
        title: "Module 5: React + Tailwind AI Prototype Starter Repository",
        category: "code_repo",
        description: "Production-ready full-stack starter kit with streaming LLM responses and tool calling.",
        url: "https://github.com/example/ai-prototype-starter",
        workshopBatchCode: "ALL",
        accessLevel: "enrolled_only",
        isPublished: true,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        _id: "res_004",
        title: "Day 2 Capstone: Production AI Workflow & App Deliverable",
        category: "assignment",
        description: "Build and deploy a working AI assistant or multi-step automation workflow and submit your repository URL.",
        url: "https://ai-training-sessions-zeta.vercel.app/dashboard/assignments",
        workshopBatchCode: "ALL",
        accessLevel: "enrolled_only",
        isPublished: true,
        createdAt: /* @__PURE__ */ new Date()
      }
    ];
    for (const r of defaultResources) {
      this.resources.set(r._id, r);
    }
    const defaultAssignments = [
      {
        _id: "assign_day1",
        title: "Day 1 Deliverable: Custom Grounded AI Assistant & Prompt Library",
        description: "Configure a domain-specific AI assistant with system prompt instructions, structured JSON output schema, and knowledge base grounding.",
        dayNumber: 1,
        workshopBatchCode: "ALL",
        isRequiredForCertificate: true,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        _id: "assign_day2",
        title: "Day 2 Capstone: Multi-Step AI Workflow & Functional Web Prototype",
        description: "Build and deploy a working multi-step AI automation or full-stack web prototype and submit your repository and live demo links.",
        dayNumber: 2,
        workshopBatchCode: "ALL",
        isRequiredForCertificate: true,
        createdAt: /* @__PURE__ */ new Date()
      }
    ];
    for (const a of defaultAssignments) {
      this.assignments.set(a._id, a);
    }
    const studentPwdHash = await import_bcryptjs.default.hash("StudentLaunchpad2026!", 10);
    const simpleStudentHash = await import_bcryptjs.default.hash("Student123!", 10);
    const compareStudentPwd = async (pwd) => {
      if (await import_bcryptjs.default.compare(pwd, studentPwdHash)) return true;
      if (await import_bcryptjs.default.compare(pwd, simpleStudentHash)) return true;
      if (await import_bcryptjs.default.compare(pwd, adminPasswordHash)) return true;
      return false;
    };
    const enrolledStudentId = "mem_user_student_001";
    this.users.set(enrolledStudentId, {
      _id: enrolledStudentId,
      name: "Aarav Mehta",
      email: "student@ailaunchpad.edu",
      passwordHash: studentPwdHash,
      role: "learner",
      accountStatus: "active",
      userCategory: "working_professional",
      experienceLevel: "intermediate",
      phone: { countryCode: "+91", number: "9876543210" },
      marketingConsent: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      async comparePassword(pwd) {
        return compareStudentPwd(pwd);
      }
    });
    const enrolledStudentAltId = "mem_user_student_002";
    this.users.set(enrolledStudentAltId, {
      _id: enrolledStudentAltId,
      name: "Aarav Mehta",
      email: "student@example.com",
      passwordHash: simpleStudentHash,
      role: "learner",
      accountStatus: "active",
      userCategory: "working_professional",
      experienceLevel: "intermediate",
      phone: { countryCode: "+91", number: "9876543210" },
      marketingConsent: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      async comparePassword(pwd) {
        return compareStudentPwd(pwd);
      }
    });
    this.enrollments.set("enr_default_student_001", {
      _id: "enr_default_student_001",
      enrollmentId: "AILP-ENR-1001",
      user: enrolledStudentId,
      workshop: "batch-nov-14",
      status: "confirmed",
      paymentStatus: "captured",
      confirmedAt: /* @__PURE__ */ new Date(),
      attendeeDetails: {
        fullName: "Aarav Mehta",
        email: "student@ailaunchpad.edu",
        phone: "9876543210"
      },
      day1Attended: true,
      day2Attended: true,
      enrolledAt: /* @__PURE__ */ new Date()
    });
    this.enrollments.set("enr_default_student_002", {
      _id: "enr_default_student_002",
      enrollmentId: "AILP-ENR-1002",
      user: enrolledStudentAltId,
      workshop: "batch-nov-14",
      status: "confirmed",
      paymentStatus: "captured",
      confirmedAt: /* @__PURE__ */ new Date(),
      attendeeDetails: {
        fullName: "Aarav Mehta",
        email: "student@example.com",
        phone: "9876543210"
      },
      day1Attended: true,
      day2Attended: true,
      enrolledAt: /* @__PURE__ */ new Date()
    });
    const registeredUserId = "mem_user_student_003";
    this.users.set(registeredUserId, {
      _id: registeredUserId,
      name: "Priya Nair",
      email: "user@ailaunchpad.edu",
      passwordHash: studentPwdHash,
      role: "learner",
      accountStatus: "active",
      userCategory: "student",
      experienceLevel: "beginner",
      phone: { countryCode: "+91", number: "9876501234" },
      marketingConsent: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      async comparePassword(pwd) {
        return compareStudentPwd(pwd);
      }
    });
    const ramyaPwdHash = await import_bcryptjs.default.hash("mnopqrs123", 10);
    const ramyaUserId = "mem_user_student_004";
    this.users.set(ramyaUserId, {
      _id: ramyaUserId,
      name: "Ramya",
      email: "ramya@gmail.com",
      passwordHash: ramyaPwdHash,
      role: "learner",
      accountStatus: "active",
      userCategory: "student",
      experienceLevel: "beginner",
      phone: { countryCode: "+91", number: "9876543210" },
      marketingConsent: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      async comparePassword(pwd) {
        if (!this.passwordHash) return false;
        return import_bcryptjs.default.compare(pwd, this.passwordHash);
      }
    });
  }
  // --- User Operations ---
  async findUserByEmail(email) {
    await this.init();
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email === normalized) {
        return user;
      }
    }
    return null;
  }
  async findUserById(id) {
    await this.init();
    return this.users.get(id) || null;
  }
  async findUserByResetToken(hashedToken) {
    await this.init();
    const now = /* @__PURE__ */ new Date();
    for (const user of this.users.values()) {
      if (user.resetPasswordToken === hashedToken && user.resetPasswordExpires && new Date(user.resetPasswordExpires) > now) {
        return user;
      }
    }
    return null;
  }
  async createUser(userData) {
    await this.init();
    let passwordHash;
    if (userData.password) {
      passwordHash = await import_bcryptjs.default.hash(userData.password, 10);
    }
    const _id = "mem_user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const newUser = {
      _id,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      passwordHash,
      phone: userData.phone || { countryCode: "+91", number: "" },
      googleId: userData.googleId,
      avatarUrl: userData.avatarUrl,
      role: userData.role || "learner",
      userCategory: userData.userCategory || "working_professional",
      experienceLevel: userData.experienceLevel || "beginner",
      marketingConsent: userData.marketingConsent || false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      async comparePassword(pwd) {
        if (!this.passwordHash) return false;
        return import_bcryptjs.default.compare(pwd, this.passwordHash);
      }
    };
    this.users.set(_id, newUser);
    return newUser;
  }
  async restoreUserWithHash(userData) {
    await this.init();
    const existing = await this.findUserByEmail(userData.email);
    if (existing) {
      if (userData.passwordHash && !existing.passwordHash) {
        existing.passwordHash = userData.passwordHash;
      }
      return existing;
    }
    const _id = userData._id || "mem_user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const restoredUser = {
      _id,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      phone: userData.phone || { countryCode: "+91", number: "" },
      role: "learner",
      userCategory: userData.userCategory || "working_professional",
      experienceLevel: userData.experienceLevel || "beginner",
      marketingConsent: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      async comparePassword(pwd) {
        if (!this.passwordHash) return false;
        return import_bcryptjs.default.compare(pwd, this.passwordHash);
      }
    };
    this.users.set(_id, restoredUser);
    return restoredUser;
  }
  // --- Workshop Operations ---
  async getPublishedWorkshops() {
    await this.init();
    return Array.from(this.workshops.values()).filter((w) => w.status === "published");
  }
  async findWorkshop(idOrCode) {
    await this.init();
    if (!idOrCode) return null;
    if (this.workshops.has(idOrCode)) {
      return this.workshops.get(idOrCode);
    }
    for (const w of this.workshops.values()) {
      if (w.batchCode === idOrCode || w.slug === idOrCode || w._id.toLowerCase() === idOrCode.toLowerCase()) {
        return w;
      }
    }
    for (const w of this.workshops.values()) {
      if (idOrCode.includes("nov-14") || idOrCode.includes("B1")) {
        return w;
      }
    }
    const published = await this.getPublishedWorkshops();
    return published[0] || null;
  }
  // --- Enrollment Operations ---
  async createEnrollment(data) {
    await this.init();
    for (const existing of this.enrollments.values()) {
      if (existing.user === data.userId && existing.workshop === data.workshopId && existing.status !== "cancelled" && existing.status !== "expired") {
        if (existing.status !== "confirmed") {
          existing.reservedUntil = new Date(Date.now() + 15 * 60 * 1e3);
        }
        return existing;
      }
    }
    const num = Math.floor(1e3 + Math.random() * 9e3);
    const enrollmentId = `AILP-${(/* @__PURE__ */ new Date()).getFullYear()}-${num}`;
    const _id = "mem_enr_" + Date.now() + "_" + Math.floor(Math.random() * 1e3);
    const isFreeConfirmed = data.paymentStatus === "completed" || data.paymentStatus === "captured" || data.paymentStatus === "free";
    const enrollment = {
      _id,
      enrollmentId,
      user: data.userId,
      workshop: data.workshopId,
      status: isFreeConfirmed ? "confirmed" : "pending_payment",
      paymentStatus: isFreeConfirmed ? "free" : "created",
      reservedUntil: isFreeConfirmed ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3) : new Date(Date.now() + 15 * 60 * 1e3),
      confirmedAt: isFreeConfirmed ? /* @__PURE__ */ new Date() : void 0,
      attendeeDetails: data.attendeeDetails,
      day1Attended: false,
      day2Attended: false,
      enrolledAt: /* @__PURE__ */ new Date()
    };
    this.enrollments.set(_id, enrollment);
    const workshop = this.workshops.get(data.workshopId);
    if (workshop && workshop.availableSeats > 0) {
      workshop.availableSeats -= 1;
      if (isFreeConfirmed) {
        workshop.enrolledCount += 1;
      } else {
        workshop.reservedCount += 1;
      }
    }
    return enrollment;
  }
  async confirmEnrollmentPayment(enrollmentId) {
    await this.init();
    const enr = await this.findEnrollmentById(enrollmentId);
    if (enr) {
      const wasConfirmed = enr.status === "confirmed";
      enr.status = "confirmed";
      enr.paymentStatus = "captured";
      enr.confirmedAt = /* @__PURE__ */ new Date();
      if (!wasConfirmed) {
        const ws = this.workshops.get(enr.workshop);
        if (ws) {
          ws.reservedCount = Math.max(0, ws.reservedCount - 1);
          ws.enrolledCount += 1;
        }
      }
      return enr;
    }
    for (const reg of this.registrations.values()) {
      if (reg._id === enrollmentId || `REG-${reg._id.slice(-6).toUpperCase()}` === enrollmentId || reg._id.toUpperCase() === enrollmentId) {
        reg.registrationStatus = "confirmed";
        reg.paymentStatus = "paid";
        reg.updatedAt = /* @__PURE__ */ new Date();
      }
    }
    return null;
  }
  async getEnrollmentsByUserId(userId) {
    await this.init();
    return Array.from(this.enrollments.values()).filter((e) => e.user === userId);
  }
  async getAllEnrollments() {
    await this.init();
    return Array.from(this.enrollments.values());
  }
  async findEnrollmentById(enrollmentId) {
    await this.init();
    for (const e of this.enrollments.values()) {
      if (e._id === enrollmentId || e.enrollmentId === enrollmentId) {
        return e;
      }
    }
    return null;
  }
  async findRegistration(email, batchId) {
    await this.init();
    const normalizedEmail = email.toLowerCase().trim();
    for (const reg of this.registrations.values()) {
      if (reg.email.toLowerCase() === normalizedEmail && reg.batchId === batchId) {
        return reg;
      }
    }
    return null;
  }
  async createRegistration(data) {
    await this.init();
    const _id = "reg_" + Date.now() + "_" + Math.floor(1e3 + Math.random() * 9e3);
    const registration = {
      _id,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      batchId: data.batchId.trim(),
      registrationStatus: data.registrationStatus || "confirmed",
      paymentStatus: data.paymentStatus || "unpaid",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.registrations.set(_id, registration);
    return registration;
  }
  async getAllRegistrations() {
    await this.init();
    return Array.from(this.registrations.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  // --- Admin Extended Operations ---
  async getAllUsers() {
    await this.init();
    return Array.from(this.users.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  async updateUser(id, updates) {
    await this.init();
    const user = this.users.get(id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: /* @__PURE__ */ new Date() });
    this.users.set(id, user);
    return user;
  }
  async getAllWorkshops() {
    await this.init();
    return Array.from(this.workshops.values());
  }
  async createWorkshop(data) {
    await this.init();
    const _id = "ws_" + Date.now();
    const capacity = Number(data.capacity) || 60;
    const ws = {
      _id,
      title: data.title || "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
      slug: data.slug || `ai-launchpad-${Date.now()}`,
      batchCode: (data.batchCode || `AILP-${Date.now().toString().slice(-4)}`).toUpperCase(),
      description: data.description || "Hands-on AI Engineering Bootcamp",
      instructor: data.instructor || {
        name: "Vikram Malhotra",
        role: "Staff AI Engineer",
        bio: "Enterprise AI Architect",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
      },
      startDate: data.startDate ? new Date(data.startDate) : /* @__PURE__ */ new Date(),
      endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 864e5),
      timings: data.timings || "10:00 AM \u2013 3:00 PM IST",
      timezone: data.timezone || "Asia/Kolkata (IST)",
      capacity,
      enrolledCount: 0,
      reservedCount: 0,
      availableSeats: capacity,
      price: data.price || {
        basePrice: 1999,
        currency: "INR",
        taxPercentage: 18,
        isFree: false
      },
      status: data.status || "published",
      thumbnailUrl: data.thumbnailUrl,
      registrationDeadline: data.registrationDeadline,
      liveSessionUrl: data.liveSessionUrl,
      meetingPasscode: data.meetingPasscode
    };
    this.workshops.set(_id, ws);
    return ws;
  }
  async updateWorkshop(id, updates) {
    await this.init();
    const ws = await this.findWorkshop(id);
    if (!ws) return null;
    Object.assign(ws, updates);
    ws.availableSeats = Math.max(0, ws.capacity - (ws.enrolledCount + ws.reservedCount));
    this.workshops.set(ws._id, ws);
    return ws;
  }
  async deleteWorkshop(id) {
    await this.init();
    return this.workshops.delete(id);
  }
  async getAllSessions() {
    await this.init();
    return Array.from(this.sessions.values()).sort((a, b) => {
      const ta = new Date(a.startAt || a.sessionDate || 0).getTime();
      const tb = new Date(b.startAt || b.sessionDate || 0).getTime();
      return ta - tb;
    });
  }
  async findSessionById(id) {
    await this.init();
    return this.sessions.get(id) || null;
  }
  async upsertSession(data) {
    await this.init();
    const id = data._id || `ses_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const existing = this.sessions.get(id) || {};
    const updated = {
      ...existing,
      ...data,
      _id: id,
      createdAt: existing.createdAt || /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.sessions.set(id, updated);
    return updated;
  }
  async getAllResources() {
    await this.init();
    return Array.from(this.resources.values());
  }
  async createResource(data) {
    await this.init();
    const _id = "res_" + Date.now();
    const item = {
      _id,
      ...data,
      isPublished: data.isPublished ?? true,
      accessLevel: data.accessLevel || "enrolled_only",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.resources.set(_id, item);
    return item;
  }
  async updateResource(id, updates) {
    await this.init();
    const item = this.resources.get(id);
    if (!item) return null;
    Object.assign(item, updates, { updatedAt: /* @__PURE__ */ new Date() });
    this.resources.set(id, item);
    return item;
  }
  async deleteResource(id) {
    await this.init();
    return this.resources.delete(id);
  }
  async getAllCertificates() {
    await this.init();
    return Array.from(this.certificates.values());
  }
  async saveCertificate(cert) {
    await this.init();
    const _id = cert._id || "cert_" + Date.now();
    const item = { ...cert, _id };
    this.certificates.set(_id.toString(), item);
    return item;
  }
  async getAllSubmissions() {
    await this.init();
    return Array.from(this.submissions.values());
  }
  async saveSubmission(sub) {
    await this.init();
    const _id = sub._id || "sub_" + Date.now();
    const item = {
      ...sub,
      _id,
      status: sub.status || "submitted",
      createdAt: sub.createdAt || /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.submissions.set(_id.toString(), item);
    return item;
  }
  async getAllAssignments() {
    await this.init();
    return Array.from(this.assignments.values());
  }
  async createAuditLog(entry) {
    await this.init();
    const log = {
      _id: "audit_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      ...entry,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.auditLogs.unshift(log);
    return log;
  }
  async getAuditLogs(limit = 50) {
    await this.init();
    return this.auditLogs.slice(0, limit);
  }
  async getSettings() {
    await this.init();
    return this.settings;
  }
  async updateSettings(updates, updatedBy) {
    await this.init();
    this.settings = {
      ...this.settings,
      branding: { ...this.settings.branding, ...updates.branding || {} },
      registration: { ...this.settings.registration, ...updates.registration || {} },
      workshopDefaults: { ...this.settings.workshopDefaults, ...updates.workshopDefaults || {} },
      emailTemplates: { ...this.settings.emailTemplates, ...updates.emailTemplates || {} },
      instructorPermissions: {
        ...this.settings.instructorPermissions,
        ...updates.instructorPermissions || {}
      },
      notifications: { ...this.settings.notifications, ...updates.notifications || {} },
      updatedBy,
      updatedAt: /* @__PURE__ */ new Date()
    };
    return this.settings;
  }
}
const memoryStore = new MemoryStoreService();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  memoryStore
});
