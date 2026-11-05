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
var import_db = require("../config/db.js");
var import_memoryStore = require("./memoryStore.js");
var import_mongoose = __toESM(require("mongoose"));
class AuthService {
  static async register(input) {
    const email = input.email.toLowerCase().trim();
    if ((0, import_db.isDBConnected)()) {
      try {
        const existingUser = await import_User.User.findOne({ email });
        if (existingUser) {
          throw import_apiError.ApiError.conflict("An account with this email address already exists.");
        }
        let passwordHash;
        if (input.password) {
          passwordHash = await import_bcryptjs.default.hash(input.password, 10);
        }
        const user = await import_User.User.create({
          name: input.name,
          email,
          passwordHash,
          phone: input.phone,
          userCategory: input.userCategory || "working_professional",
          experienceLevel: input.experienceLevel || "beginner",
          marketingConsent: input.marketingConsent || false,
          role: "learner"
        });
        const token2 = (0, import_jwt.signToken)({
          userId: user._id.toString(),
          email: user.email,
          role: user.role
        });
        return {
          user: {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            userCategory: user.userCategory,
            experienceLevel: user.experienceLevel,
            createdAt: user.createdAt
          },
          token: token2
        };
      } catch (err) {
        if (err.statusCode) throw err;
        console.warn("[MongoDB Registration Fallback]", err.message);
      }
    }
    const existingMemUser = await import_memoryStore.memoryStore.findUserByEmail(email);
    if (existingMemUser) {
      throw import_apiError.ApiError.conflict("An account with this email address already exists.");
    }
    const memUser = await import_memoryStore.memoryStore.createUser({
      name: input.name,
      email,
      password: input.password,
      phone: input.phone,
      userCategory: input.userCategory,
      experienceLevel: input.experienceLevel,
      marketingConsent: input.marketingConsent,
      role: "learner"
    });
    const token = (0, import_jwt.signToken)({
      userId: memUser._id,
      email: memUser.email,
      role: memUser.role
    });
    return {
      user: {
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone,
        role: memUser.role,
        userCategory: memUser.userCategory,
        experienceLevel: memUser.experienceLevel,
        createdAt: memUser.createdAt
      },
      token
    };
  }
  static async login(input) {
    const email = input.email.toLowerCase().trim();
    if ((0, import_db.isDBConnected)()) {
      try {
        const user = await import_User.User.findOne({ email }).select("+passwordHash");
        if (user) {
          if (!user.passwordHash) {
            throw import_apiError.ApiError.unauthorized("This account was created via direct registration. Please register or reset password.");
          }
          const isMatch2 = await user.comparePassword(input.password);
          if (!isMatch2) {
            throw import_apiError.ApiError.unauthorized("Invalid email or password.");
          }
          const token2 = (0, import_jwt.signToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role
          });
          return {
            user: {
              _id: user._id.toString(),
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              userCategory: user.userCategory,
              experienceLevel: user.experienceLevel,
              createdAt: user.createdAt
            },
            token: token2
          };
        }
      } catch (err) {
        if (err.statusCode) throw err;
        console.warn("[MongoDB Login Fallback]", err.message);
      }
    }
    const memUser = await import_memoryStore.memoryStore.findUserByEmail(email);
    if (!memUser) {
      throw import_apiError.ApiError.unauthorized("Invalid email or password.");
    }
    const isMatch = await memUser.comparePassword(input.password);
    if (!isMatch) {
      throw import_apiError.ApiError.unauthorized("Invalid email or password.");
    }
    const token = (0, import_jwt.signToken)({
      userId: memUser._id,
      email: memUser.email,
      role: memUser.role
    });
    return {
      user: {
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone,
        role: memUser.role,
        userCategory: memUser.userCategory,
        experienceLevel: memUser.experienceLevel,
        createdAt: memUser.createdAt
      },
      token
    };
  }
  static async getMe(userId) {
    if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(userId)) {
      try {
        const user = await import_User.User.findById(userId);
        if (user) {
          return {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            userCategory: user.userCategory,
            experienceLevel: user.experienceLevel,
            createdAt: user.createdAt
          };
        }
      } catch (err) {
        console.warn("[MongoDB getMe Fallback]", err.message);
      }
    }
    const memUser = await import_memoryStore.memoryStore.findUserById(userId);
    if (memUser) {
      return {
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone,
        role: memUser.role,
        userCategory: memUser.userCategory,
        experienceLevel: memUser.experienceLevel,
        createdAt: memUser.createdAt
      };
    }
    throw import_apiError.ApiError.notFound("User not found.");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthService
});
//# sourceMappingURL=auth.service.js.map
