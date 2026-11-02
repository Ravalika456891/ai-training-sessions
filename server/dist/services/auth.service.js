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
var auth_service_exports = {};
__export(auth_service_exports, {
  AuthService: () => AuthService
});
module.exports = __toCommonJS(auth_service_exports);
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_User = require("../models/User.js");
var import_apiError = require("../utils/apiError.js");
var import_jwt = require("../utils/jwt.js");
class AuthService {
  static async register(input) {
    const existingUser = await import_User.User.findOne({ email: input.email });
    if (existingUser) {
      throw import_apiError.ApiError.conflict("An account with this email address already exists.");
    }
    let passwordHash;
    if (input.password) {
      passwordHash = await import_bcryptjs.default.hash(input.password, 10);
    }
    const user = await import_User.User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
      userCategory: input.userCategory || "working_professional",
      experienceLevel: input.experienceLevel || "beginner",
      marketingConsent: input.marketingConsent || false,
      role: "learner"
    });
    const token = (0, import_jwt.signToken)({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        userCategory: user.userCategory,
        experienceLevel: user.experienceLevel,
        createdAt: user.createdAt
      },
      token
    };
  }
  static async login(input) {
    const user = await import_User.User.findOne({ email: input.email }).select("+passwordHash");
    if (!user) {
      throw import_apiError.ApiError.unauthorized("Invalid email or password.");
    }
    if (!user.passwordHash) {
      throw import_apiError.ApiError.unauthorized("This account was created via direct registration. Please set a password or use registration.");
    }
    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw import_apiError.ApiError.unauthorized("Invalid email or password.");
    }
    const token = (0, import_jwt.signToken)({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        userCategory: user.userCategory,
        experienceLevel: user.experienceLevel,
        createdAt: user.createdAt
      },
      token
    };
  }
  static async getMe(userId) {
    const user = await import_User.User.findById(userId);
    if (!user) {
      throw import_apiError.ApiError.notFound("User not found.");
    }
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      userCategory: user.userCategory,
      experienceLevel: user.experienceLevel,
      createdAt: user.createdAt
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthService
});
//# sourceMappingURL=auth.service.js.map
