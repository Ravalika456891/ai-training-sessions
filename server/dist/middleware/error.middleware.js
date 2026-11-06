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
var error_middleware_exports = {};
__export(error_middleware_exports, {
  errorHandler: () => errorHandler
});
module.exports = __toCommonJS(error_middleware_exports);
var import_env = require("../config/env.js");
const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors;
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for resource ID: ${err.value}`;
  }
  if (err.code === 11e3) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {});
    if (fields.includes("userId") && fields.includes("workshopId")) {
      message = "You already have an active enrollment for this workshop cohort.";
    } else {
      message = `Duplicate value entered for ${fields.join(", ")}. Must be unique.`;
    }
  }
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }
  const responsePayload = {
    success: false,
    message,
    ...errors && { errors },
    ...!import_env.env.isProduction && { stack: err.stack }
  };
  if (statusCode >= 500) {
    console.error("[Unhandled Server Error]", err);
  }
  res.status(statusCode).json(responsePayload);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  errorHandler
});
