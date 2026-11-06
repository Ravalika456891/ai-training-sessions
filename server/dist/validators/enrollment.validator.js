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
var enrollment_validator_exports = {};
__export(enrollment_validator_exports, {
  createEnrollmentSchema: () => createEnrollmentSchema
});
module.exports = __toCommonJS(enrollment_validator_exports);
var import_zod = require("zod");
const createEnrollmentSchema = import_zod.z.object({
  workshopId: import_zod.z.string().min(1, "Workshop ID is required"),
  fullName: import_zod.z.string().min(2, "Full Name must be at least 2 characters"),
  email: import_zod.z.string().email("Valid email address is required").toLowerCase(),
  phoneCountryCode: import_zod.z.string().default("+91"),
  phoneNumber: import_zod.z.string().min(7, "Phone number must be at least 7 digits"),
  userCategory: import_zod.z.enum(["student", "working_professional", "founder", "creator", "other"]).default("working_professional"),
  experienceLevel: import_zod.z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  acceptTerms: import_zod.z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms and Privacy Policy to register" })
  }),
  marketingConsent: import_zod.z.boolean().optional(),
  utm: import_zod.z.object({
    source: import_zod.z.string().optional(),
    medium: import_zod.z.string().optional(),
    campaign: import_zod.z.string().optional()
  }).optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createEnrollmentSchema
});
