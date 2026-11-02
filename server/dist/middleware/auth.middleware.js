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
var auth_middleware_exports = {};
__export(auth_middleware_exports, {
  authenticate: () => authenticate,
  optionalAuthenticate: () => optionalAuthenticate,
  requireRole: () => requireRole
});
module.exports = __toCommonJS(auth_middleware_exports);
var import_jwt = require("../utils/jwt.js");
var import_apiError = require("../utils/apiError.js");
var import_User = require("../models/User.js");
var import_env = require("../config/env.js");
const authenticate = async (req, _res, next) => {
  try {
    let token = req.cookies?.[import_env.env.COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      throw import_apiError.ApiError.unauthorized("Authentication required. Please sign in.");
    }
    const payload = (0, import_jwt.verifyToken)(token);
    req.tokenPayload = payload;
    const user = await import_User.User.findById(payload.userId);
    if (!user) {
      throw import_apiError.ApiError.unauthorized("User account no longer exists.");
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(import_apiError.ApiError.unauthorized("Invalid or expired authentication session."));
    } else {
      next(error);
    }
  }
};
const optionalAuthenticate = async (req, _res, next) => {
  try {
    let token = req.cookies?.[import_env.env.COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      const payload = (0, import_jwt.verifyToken)(token);
      req.tokenPayload = payload;
      const user = await import_User.User.findById(payload.userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch {
    next();
  }
};
const requireRole = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(import_apiError.ApiError.unauthorized("Authentication required."));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        import_apiError.ApiError.forbidden(
          `Access forbidden: requires one of [${allowedRoles.join(", ")}] permissions.`
        )
      );
    }
    next();
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  authenticate,
  optionalAuthenticate,
  requireRole
});
//# sourceMappingURL=auth.middleware.js.map
