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
var import_db = require("../config/db.js");
var import_memoryStore = require("../services/memoryStore.js");
var import_mongoose = __toESM(require("mongoose"));
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
    let user = null;
    if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(payload.userId)) {
      try {
        user = await import_User.User.findById(payload.userId);
      } catch (err) {
        console.warn("[Auth Middleware Fallback]", err);
      }
    }
    if (!user) {
      user = await import_memoryStore.memoryStore.findUserById(payload.userId);
    }
    if (!user && payload.email) {
      user = await import_memoryStore.memoryStore.findUserByEmail(payload.email);
    }
    if (!user && payload.userId && payload.email) {
      user = {
        _id: payload.userId,
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        role: payload.role || "learner",
        phone: payload.phone || { countryCode: "+91", number: "" },
        userCategory: payload.userCategory || "working_professional",
        experienceLevel: payload.experienceLevel || "beginner",
        createdAt: /* @__PURE__ */ new Date()
      };
    }
    if (!user) {
      throw import_apiError.ApiError.unauthorized("User account no longer exists.");
    }
    if (user.accountStatus === "suspended" || user.accountStatus === "deactivated") {
      throw import_apiError.ApiError.forbidden("Your account has been suspended or deactivated by an administrator.");
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
      let user = null;
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(payload.userId)) {
        try {
          user = await import_User.User.findById(payload.userId);
        } catch {
        }
      }
      if (!user) {
        user = await import_memoryStore.memoryStore.findUserById(payload.userId);
      }
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
