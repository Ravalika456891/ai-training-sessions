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
var seed_exports = {};
__export(seed_exports, {
  seedDatabase: () => seedDatabase
});
module.exports = __toCommonJS(seed_exports);
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_User = require("../models/User.js");
var import_Workshop = require("../models/Workshop.js");
var import_WorkshopSession = require("../models/WorkshopSession.js");
var import_Enrollment = require("../models/Enrollment.js");
var import_Assignment = require("../models/Assignment.js");
var import_LearningResource = require("../models/LearningResource.js");
var import_env = require("../config/env.js");
const seedDatabase = async () => {
  try {
    const adminEmail = import_env.env.ADMIN_EMAIL.toLowerCase();
    const existingAdmin = await import_User.User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await import_bcryptjs.default.hash(import_env.env.ADMIN_PASSWORD, 10);
      await import_User.User.create({
        name: import_env.env.ADMIN_NAME,
        email: adminEmail,
        passwordHash,
        role: "admin",
        accountStatus: "active",
        userCategory: "working_professional",
        experienceLevel: "advanced",
        phone: { countryCode: "+91", number: "9999999999" }
      });
      console.log(`[Database Seed] Default Admin created: ${adminEmail}`);
    }
    await import_Workshop.Workshop.deleteMany({
      batchCode: { $in: ["AILP-2026-NOV-28", "AILP-2026-DEC-12"] }
    });
    await import_WorkshopSession.WorkshopSession.deleteMany({
      batchCode: { $in: ["AILP-2026-NOV-28", "AILP-2026-DEC-12"] }
    });
    let primaryWorkshop = await import_Workshop.Workshop.findOne({ batchCode: "AILP-2026-NOV-14" });
    if (!primaryWorkshop) {
      primaryWorkshop = await import_Workshop.Workshop.create({
        title: "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
        slug: "ai-launchpad-nov-14-2026",
        batchCode: "AILP-2026-NOV-14",
        description: "Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.",
        instructor: {
          name: "Vikram Malhotra",
          role: "Staff AI Engineer & Former ML Lead",
          bio: "Over 12 years building production software and 4 years leading enterprise LLM integrations. Mentored over 1,500 professionals in practical AI adoption.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
        },
        startDate: /* @__PURE__ */ new Date("2026-11-14T10:00:00+05:30"),
        endDate: /* @__PURE__ */ new Date("2026-11-15T15:00:00+05:30"),
        timings: "10:00 AM \u2013 3:00 PM IST",
        timezone: "Asia/Kolkata (IST)",
        capacity: 60,
        enrolledCount: 36,
        reservedCount: 0,
        price: {
          basePrice: 1999,
          currency: "INR",
          taxPercentage: 18,
          isFree: false
        },
        status: "published"
      });
      console.log("[Database Seed] Primary workshop cohort AILP-2026-NOV-14 seeded.");
    }
    const existingSessionsCount = await import_WorkshopSession.WorkshopSession.countDocuments({
      batchCode: "AILP-2026-NOV-14"
    });
    if (existingSessionsCount === 0 && primaryWorkshop) {
      const day1Start = /* @__PURE__ */ new Date("2026-11-14T10:00:00+05:30");
      const day1End = /* @__PURE__ */ new Date("2026-11-14T15:00:00+05:30");
      const day2Start = /* @__PURE__ */ new Date("2026-11-15T10:00:00+05:30");
      const day2End = /* @__PURE__ */ new Date("2026-11-15T15:00:00+05:30");
      await import_WorkshopSession.WorkshopSession.create([
        {
          workshopId: primaryWorkshop._id,
          batchCode: "AILP-2026-NOV-14",
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
          instructorName: "Vikram Malhotra",
          classType: "live",
          meetingProvider: "google_meet",
          liveSessionUrl: "https://meet.google.com/ailp-ailp-2026-nov-14-day1",
          meetingPasscode: "AILP2026",
          visibility: "enrolled_only",
          capacity: 60,
          status: "scheduled"
        },
        {
          workshopId: primaryWorkshop._id,
          batchCode: "AILP-2026-NOV-14",
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
          instructorName: "Vikram Malhotra",
          classType: "live",
          meetingProvider: "google_meet",
          liveSessionUrl: "https://meet.google.com/ailp-ailp-2026-nov-14-day2",
          meetingPasscode: "AILP2026",
          visibility: "enrolled_only",
          capacity: 60,
          status: "scheduled"
        }
      ]);
    }
    await import_User.User.deleteOne({ email: "ram@gmail.com" });
    const studentPwdHash = await import_bcryptjs.default.hash("StudentLaunchpad2026!", 10);
    const simpleStudentHash = await import_bcryptjs.default.hash("Student123!", 10);
    const ramyaPwdHash = await import_bcryptjs.default.hash("mnopqrs123", 10);
    const defaultUsers = [
      {
        name: "Aarav Mehta",
        email: "student@ailaunchpad.edu",
        passwordHash: studentPwdHash,
        role: "learner",
        userCategory: "working_professional",
        experienceLevel: "intermediate",
        phone: { countryCode: "+91", number: "9876543210" },
        enrolled: true,
        enrollmentId: "AILP-ENR-1001"
      },
      {
        name: "Aarav Mehta",
        email: "student@example.com",
        passwordHash: simpleStudentHash,
        role: "learner",
        userCategory: "working_professional",
        experienceLevel: "intermediate",
        phone: { countryCode: "+91", number: "9876543210" },
        enrolled: true,
        enrollmentId: "AILP-ENR-1002"
      },
      {
        name: "Priya Nair",
        email: "user@ailaunchpad.edu",
        passwordHash: studentPwdHash,
        role: "learner",
        userCategory: "student",
        experienceLevel: "beginner",
        phone: { countryCode: "+91", number: "9876501234" },
        enrolled: false
      },
      {
        name: "Ramya",
        email: "ramya@gmail.com",
        passwordHash: ramyaPwdHash,
        role: "learner",
        userCategory: "student",
        experienceLevel: "beginner",
        phone: { countryCode: "+91", number: "9876543210" },
        enrolled: false
      }
    ];
    for (const u of defaultUsers) {
      let dbUser = await import_User.User.findOne({ email: u.email });
      if (!dbUser) {
        dbUser = await import_User.User.create({
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role,
          accountStatus: "active",
          userCategory: u.userCategory,
          experienceLevel: u.experienceLevel,
          phone: u.phone,
          marketingConsent: true
        });
      }
      if (u.enrolled && primaryWorkshop && dbUser && u.enrollmentId) {
        const existingEnr = await import_Enrollment.Enrollment.findOne({
          $or: [
            { enrollmentId: u.enrollmentId },
            { userId: dbUser._id, workshopId: primaryWorkshop._id }
          ]
        });
        if (!existingEnr) {
          await import_Enrollment.Enrollment.create({
            enrollmentId: u.enrollmentId,
            userId: dbUser._id,
            workshopId: primaryWorkshop._id,
            status: "confirmed",
            paymentStatus: "captured",
            confirmedAt: /* @__PURE__ */ new Date(),
            attendeeDetails: {
              fullName: u.name,
              email: u.email,
              phone: u.phone.number,
              countryCode: u.phone.countryCode,
              userCategory: u.userCategory,
              experienceLevel: u.experienceLevel
            }
          });
        }
      }
    }
    const assignmentCount = await import_Assignment.Assignment.countDocuments();
    if (assignmentCount === 0) {
      await import_Assignment.Assignment.create([
        {
          title: "Day 1 Deliverable: Custom Grounded AI Assistant & Prompt Library",
          description: "Configure a domain-specific AI assistant with system prompt instructions, structured JSON output schema, and knowledge base grounding.",
          dayNumber: 1,
          workshopBatchCode: "ALL",
          isRequiredForCertificate: true
        },
        {
          title: "Day 2 Capstone: Multi-Step AI Workflow & Functional Web Prototype",
          description: "Build and deploy a working multi-step AI automation or full-stack web prototype and submit your repository and live demo links.",
          dayNumber: 2,
          workshopBatchCode: "ALL",
          isRequiredForCertificate: true
        }
      ]);
    }
    const resourceCount = await import_LearningResource.LearningResource.countDocuments();
    if (resourceCount === 0) {
      await import_LearningResource.LearningResource.create([
        {
          title: "Module 1 & 2: Reusable 10-Prompt Enterprise Library",
          category: "prompt_template",
          description: "Battle-tested system prompt templates for GPT-4o, Claude 3.5 Sonnet, and Gemini 2.0.",
          url: "https://ai-training-sessions-zeta.vercel.app/#curriculum",
          workshopBatchCode: "ALL",
          accessLevel: "enrolled_only",
          isPublished: true
        },
        {
          title: "Module 3: Custom Assistant Grounding & RAG PDF Guide",
          category: "pdf",
          description: "Step-by-step architecture playbook for building hallucination-free enterprise AI assistants.",
          url: "https://ai-training-sessions-zeta.vercel.app/#curriculum",
          workshopBatchCode: "ALL",
          accessLevel: "enrolled_only",
          isPublished: true
        },
        {
          title: "Module 5: React + Tailwind AI Prototype Starter Repository",
          category: "code_repo",
          description: "Production-ready full-stack starter kit with streaming LLM responses and tool calling.",
          url: "https://github.com/example/ai-prototype-starter",
          workshopBatchCode: "ALL",
          accessLevel: "enrolled_only",
          isPublished: true
        }
      ]);
    }
  } catch (err) {
    console.warn(`[Database Seed Warning] ${err.message}`);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  seedDatabase
});
