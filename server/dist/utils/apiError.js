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
var apiError_exports = {};
__export(apiError_exports, {
  ApiError: () => ApiError
});
module.exports = __toCommonJS(apiError_exports);
class ApiError extends Error {
  statusCode;
  isOperational;
  errors;
  constructor(statusCode, message, errors, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(message, errors) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = "Unauthorized access") {
    return new ApiError(401, message);
  }
  static forbidden(message = "Forbidden access") {
    return new ApiError(403, message);
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }
  static conflict(message) {
    return new ApiError(409, message);
  }
  static unprocessable(message, errors) {
    return new ApiError(422, message, errors);
  }
  static internal(message = "Internal server error") {
    return new ApiError(500, message, void 0, false);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiError
});
//# sourceMappingURL=apiError.js.map
