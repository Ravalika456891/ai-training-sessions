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
var validate_middleware_exports = {};
__export(validate_middleware_exports, {
  validateRequest: () => validateRequest
});
module.exports = __toCommonJS(validate_middleware_exports);
var import_zod = require("zod");
var import_apiError = require("../utils/apiError.js");
const validateRequest = (schema) => {
  return async (req, _res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof import_zod.ZodError) {
        const errorMessages = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message
        }));
        next(new import_apiError.ApiError(400, "Validation failed", errorMessages));
      } else {
        next(error);
      }
    }
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  validateRequest
});
