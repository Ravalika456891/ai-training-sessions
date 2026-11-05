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
var registration_validator_exports = {};
__export(registration_validator_exports, {
  createRegistrationSchema: () => createRegistrationSchema
});
module.exports = __toCommonJS(registration_validator_exports);
var import_zod = require("zod");
const createRegistrationSchema = import_zod.z.object({
  name: import_zod.z.string({ required_error: "Full name is required" }).trim().min(2, "Full name must be at least 2 characters").max(100, "Full name cannot exceed 100 characters"),
  email: import_zod.z.string({ required_error: "Email address is required" }).trim().email("Please enter a valid email address").toLowerCase(),
  phone: import_zod.z.string({ required_error: "Phone number is required" }).trim().min(7, "Phone number must be at least 7 digits").max(25, "Phone number cannot exceed 25 characters"),
  batchId: import_zod.z.string({ required_error: "Training batch ID is required" }).trim().min(1, "Please select a training batch")
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createRegistrationSchema
});
//# sourceMappingURL=registration.validator.js.map
