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
  isInitialized = false;
  constructor() {
    this.init();
  }
  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    const adminPasswordHash = await import_bcryptjs.default.hash(import_env.env.ADMIN_PASSWORD, 10);
    const adminId = "mem_user_admin_001";
    this.users.set(adminId, {
      _id: adminId,
      name: import_env.env.ADMIN_NAME,
      email: import_env.env.ADMIN_EMAIL.toLowerCase(),
      passwordHash: adminPasswordHash,
      role: "admin",
      userCategory: "working_professional",
      experienceLevel: "advanced",
      phone: { countryCode: "+91", number: "9999999999" },
      marketingConsent: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      async comparePassword(pwd) {
        return import_bcryptjs.default.compare(pwd, this.passwordHash || "");
      }
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
          role: "AI Product Architect & Startup Advisor",
          bio: "Specialist in agentic AI architectures and LLM evals. Former AI Lead at hyper-growth tech startups.",
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
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
          bio: "Over 12 years building production software and 4 years leading enterprise LLM integrations.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
        },
        startDate: /* @__PURE__ */ new Date("2026-12-12T10:00:00+05:30"),
        endDate: /* @__PURE__ */ new Date("2026-12-13T15:00:00+05:30"),
        timings: "10:00 AM \u2013 3:00 PM IST",
        timezone: "Asia/Kolkata (IST)",
        capacity: 60,
        enrolledCount: 0,
        reservedCount: 0,
        availableSeats: 60,
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
    }
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
    const num = Math.floor(1e3 + Math.random() * 9e3);
    const enrollmentId = `AILP-${(/* @__PURE__ */ new Date()).getFullYear()}-${num}`;
    const _id = "mem_enr_" + Date.now();
    const enrollment = {
      _id,
      enrollmentId,
      user: data.userId,
      workshop: data.workshopId,
      status: "reserved",
      paymentStatus: data.paymentStatus || "pending",
      reservedUntil: new Date(Date.now() + 15 * 60 * 1e3),
      // 15 mins
      attendeeDetails: data.attendeeDetails,
      day1Attended: false,
      day2Attended: false,
      enrolledAt: /* @__PURE__ */ new Date()
    };
    this.enrollments.set(_id, enrollment);
    const workshop = this.workshops.get(data.workshopId);
    if (workshop && workshop.availableSeats > 0) {
      workshop.availableSeats -= 1;
      workshop.reservedCount += 1;
    }
    return enrollment;
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
}
const memoryStore = new MemoryStoreService();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  memoryStore
});
//# sourceMappingURL=memoryStore.js.map
