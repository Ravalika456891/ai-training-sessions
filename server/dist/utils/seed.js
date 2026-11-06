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
var import_env = require("../config/env.js");
const seedDatabase = async () => {
  try {
    const existingAdmin = await import_User.User.findOne({ email: import_env.env.ADMIN_EMAIL.toLowerCase() });
    if (!existingAdmin) {
      const passwordHash = await import_bcryptjs.default.hash(import_env.env.ADMIN_PASSWORD, 10);
      await import_User.User.create({
        name: import_env.env.ADMIN_NAME,
        email: import_env.env.ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: "admin",
        userCategory: "working_professional",
        experienceLevel: "advanced",
        phone: { countryCode: "+91", number: "9999999999" }
      });
      console.log(`[Database Seed] Default Admin created: ${import_env.env.ADMIN_EMAIL}`);
    }
    const workshopCount = await import_Workshop.Workshop.countDocuments();
    if (workshopCount === 0) {
      await import_Workshop.Workshop.create([
        {
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
        },
        {
          title: "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
          slug: "ai-launchpad-nov-28-2026",
          batchCode: "AILP-2026-NOV-28",
          description: "Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.",
          instructor: {
            name: "Ananya Sharma",
            role: "Head of Product Design & AI Workflows",
            bio: "Specializes in human-AI interaction, generative UI, and multimodal creative automation.",
            avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
          },
          startDate: /* @__PURE__ */ new Date("2026-11-28T10:00:00+05:30"),
          endDate: /* @__PURE__ */ new Date("2026-11-29T15:00:00+05:30"),
          timings: "10:00 AM \u2013 3:00 PM IST",
          timezone: "Asia/Kolkata (IST)",
          capacity: 60,
          enrolledCount: 12,
          reservedCount: 0,
          price: {
            basePrice: 1999,
            currency: "INR",
            taxPercentage: 18,
            isFree: false
          },
          status: "published"
        },
        {
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
          enrolledCount: 2,
          reservedCount: 0,
          price: {
            basePrice: 1999,
            currency: "INR",
            taxPercentage: 18,
            isFree: false
          },
          status: "published"
        }
      ]);
      console.log("[Database Seed] Default workshop cohorts seeded successfully.");
    }
  } catch (err) {
    console.warn(`[Database Seed Warning] ${err.message}`);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  seedDatabase
});
