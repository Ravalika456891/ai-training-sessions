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
var workshop_validator_exports = {};
__export(workshop_validator_exports, {
  createWorkshopSchema: () => createWorkshopSchema,
  updateWorkshopSchema: () => updateWorkshopSchema
});
module.exports = __toCommonJS(workshop_validator_exports);
var import_zod = require("zod");
const createWorkshopSchema = import_zod.z.object({
  title: import_zod.z.string().min(3, "Title must be at least 3 characters"),
  slug: import_zod.z.string().min(3).toLowerCase(),
  batchCode: import_zod.z.string().min(3).toUpperCase(),
  description: import_zod.z.string().min(10, "Description must be at least 10 characters"),
  instructor: import_zod.z.object({
    name: import_zod.z.string().min(2),
    role: import_zod.z.string().min(2),
    bio: import_zod.z.string().min(10),
    avatarUrl: import_zod.z.string().url("Avatar must be a valid URL")
  }),
  startDate: import_zod.z.string().datetime({ offset: true }).or(import_zod.z.string().min(10)),
  endDate: import_zod.z.string().datetime({ offset: true }).or(import_zod.z.string().min(10)),
  timings: import_zod.z.string().default("10:00 AM \u2013 3:00 PM IST"),
  timezone: import_zod.z.string().default("Asia/Kolkata (IST)"),
  capacity: import_zod.z.number().int().min(1, "Capacity must be at least 1"),
  price: import_zod.z.object({
    basePrice: import_zod.z.number().min(0),
    currency: import_zod.z.string().default("INR"),
    taxPercentage: import_zod.z.number().min(0).default(18),
    isFree: import_zod.z.boolean().default(false)
  }),
  status: import_zod.z.enum(["draft", "published", "archived", "completed"]).default("draft"),
  curriculum: import_zod.z.array(import_zod.z.any()).optional(),
  learningOutcomes: import_zod.z.array(import_zod.z.any()).optional(),
  aiTools: import_zod.z.array(import_zod.z.any()).optional(),
  faqs: import_zod.z.array(import_zod.z.any()).optional()
});
const updateWorkshopSchema = createWorkshopSchema.partial();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createWorkshopSchema,
  updateWorkshopSchema
});
