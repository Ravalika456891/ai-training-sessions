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
var auth_validator_exports = {};
__export(auth_validator_exports, {
  loginSchema: () => loginSchema,
  registerSchema: () => registerSchema
});
module.exports = __toCommonJS(auth_validator_exports);
var import_zod = require("zod");
const registerSchema = import_zod.z.object({
  name: import_zod.z.string().min(2, "Name must be at least 2 characters").max(100),
  email: import_zod.z.string().email("Invalid email address").toLowerCase(),
  password: import_zod.z.string().min(6, "Password must be at least 6 characters").optional(),
  phone: import_zod.z.union([
    import_zod.z.object({
      countryCode: import_zod.z.string().default("+91"),
      number: import_zod.z.string().optional().default("")
    }),
    import_zod.z.string().transform((val) => ({ countryCode: "+91", number: val }))
  ]).optional(),
  userCategory: import_zod.z.enum(["student", "working_professional", "founder", "creator", "other"]).optional(),
  experienceLevel: import_zod.z.enum(["beginner", "intermediate", "advanced"]).optional(),
  marketingConsent: import_zod.z.boolean().optional()
});
const loginSchema = import_zod.z.object({
  email: import_zod.z.string().email("Invalid email address").toLowerCase(),
  password: import_zod.z.string().min(1, "Password is required")
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  loginSchema,
  registerSchema
});
//# sourceMappingURL=auth.validator.js.map
