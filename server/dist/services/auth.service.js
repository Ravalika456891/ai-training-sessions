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
var import_crypto = __toESM(require("crypto"));
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
  static async googleAuth(input) {
    let payload = null;
    if (input.credential) {
      try {
        const parts = input.credential.split(".");
        if (parts.length === 3) {
          const jsonStr = Buffer.from(parts[1], "base64url").toString("utf8");
          payload = JSON.parse(jsonStr);
        }
      } catch (err) {
        console.warn("[Google JWT Parse Warning]", err);
      }
    }
    const email = (payload?.email || input.email || "").toLowerCase().trim();
    if (!email) {
      throw import_apiError.ApiError.badRequest("A valid email address is required for Google Sign-In.");
    }
    const name = payload?.name || input.name || email.split("@")[0];
    const googleId = payload?.sub || input.googleId || `g_${Date.now()}`;
    const avatarUrl = payload?.picture || input.avatarUrl;
    if ((0, import_db.isDBConnected)()) {
      try {
        let user = await import_User.User.findOne({
          $or: [{ email }, { googleId }]
        });
        if (user) {
          if (!user.googleId) {
            user.googleId = googleId;
            if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
            await user.save();
          }
        } else {
          user = await import_User.User.create({
            name,
            email,
            googleId,
            avatarUrl,
            role: "learner",
            userCategory: "working_professional",
            experienceLevel: "beginner",
            marketingConsent: true
          });
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
            avatarUrl: user.avatarUrl,
            role: user.role,
            userCategory: user.userCategory,
            experienceLevel: user.experienceLevel,
            createdAt: user.createdAt
          },
          token: token2
        };
      } catch (dbErr) {
        console.warn("[MongoDB Google Auth Fallback]", dbErr.message);
      }
    }
    let memUser = await import_memoryStore.memoryStore.findUserByEmail(email);
    if (!memUser) {
      memUser = await import_memoryStore.memoryStore.createUser({
        name,
        email,
        googleId,
        avatarUrl,
        role: "learner",
        marketingConsent: true
      });
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
        avatarUrl: memUser.avatarUrl,
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
  static async forgotPassword(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const rawToken = import_crypto.default.randomBytes(32).toString("hex");
    const hashedToken = import_crypto.default.createHash("sha256").update(rawToken).digest("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1e3);
    if ((0, import_db.isDBConnected)()) {
      try {
        const user = await import_User.User.findOne({ email: normalizedEmail });
        if (user) {
          user.resetPasswordToken = hashedToken;
          user.resetPasswordExpires = expiry;
          await user.save();
        }
      } catch (err) {
        console.warn("[MongoDB forgotPassword fallback]", err);
      }
    }
    const memUser = await import_memoryStore.memoryStore.findUserByEmail(normalizedEmail);
    if (memUser) {
      memUser.resetPasswordToken = hashedToken;
      memUser.resetPasswordExpires = expiry;
    }
    return {
      message: "If an account exists for this email, password reset instructions have been generated.",
      resetToken: rawToken
    };
  }
  static async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      throw import_apiError.ApiError.badRequest("Reset token and new password are required.");
    }
    if (newPassword.length < 8) {
      throw import_apiError.ApiError.badRequest("Password must be at least 8 characters with letters and numbers.");
    }
    const hashedToken = import_crypto.default.createHash("sha256").update(token.trim()).digest("hex");
    const passwordHash = await import_bcryptjs.default.hash(newPassword, 10);
    if ((0, import_db.isDBConnected)()) {
      try {
        const user = await import_User.User.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { $gt: /* @__PURE__ */ new Date() }
        });
        if (user) {
          user.passwordHash = passwordHash;
          user.resetPasswordToken = void 0;
          user.resetPasswordExpires = void 0;
          await user.save();
          return { message: "Password has been reset successfully. You can now sign in." };
        }
      } catch (err) {
        if (err.statusCode) throw err;
      }
    }
    const memUser = await import_memoryStore.memoryStore.findUserByResetToken(hashedToken);
    if (!memUser) {
      throw import_apiError.ApiError.badRequest("Password reset token is invalid or has expired.");
    }
    memUser.passwordHash = passwordHash;
    memUser.resetPasswordToken = void 0;
    memUser.resetPasswordExpires = void 0;
    return { message: "Password has been reset successfully. You can now sign in." };
  }
  static async updateProfile(userId, data) {
    if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(userId)) {
      try {
        const user = await import_User.User.findById(userId);
        if (user) {
          if (data.name) user.name = data.name.trim();
          if (data.phone) user.phone = data.phone;
          if (data.experienceLevel) user.experienceLevel = data.experienceLevel;
          if (data.userCategory) user.userCategory = data.userCategory;
          await user.save();
          return this.getMe(userId);
        }
      } catch (err) {
        console.warn("[MongoDB updateProfile fallback]", err);
      }
    }
    const memUser = await import_memoryStore.memoryStore.findUserById(userId);
    if (memUser) {
      if (data.name) memUser.name = data.name.trim();
      if (data.phone) memUser.phone = data.phone;
      if (data.experienceLevel) memUser.experienceLevel = data.experienceLevel;
      if (data.userCategory) memUser.userCategory = data.userCategory;
      return this.getMe(userId);
    }
    throw import_apiError.ApiError.notFound("User not found.");
  }
  static async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw import_apiError.ApiError.badRequest("Current password and new password are required.");
    }
    if (newPassword.length < 8) {
      throw import_apiError.ApiError.badRequest("New password must be at least 8 characters.");
    }
    if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(userId)) {
      try {
        const user = await import_User.User.findById(userId).select("+passwordHash");
        if (user && user.passwordHash) {
          const isMatch = await import_bcryptjs.default.compare(currentPassword, user.passwordHash);
          if (!isMatch) {
            throw import_apiError.ApiError.badRequest("Incorrect current password.");
          }
          user.passwordHash = await import_bcryptjs.default.hash(newPassword, 10);
          await user.save();
          return { message: "Password changed successfully." };
        }
      } catch (err) {
        if (err.statusCode) throw err;
      }
    }
    const memUser = await import_memoryStore.memoryStore.findUserById(userId);
    if (memUser && memUser.passwordHash) {
      const isMatch = await import_bcryptjs.default.compare(currentPassword, memUser.passwordHash);
      if (!isMatch) {
        throw import_apiError.ApiError.badRequest("Incorrect current password.");
      }
      memUser.passwordHash = await import_bcryptjs.default.hash(newPassword, 10);
      return { message: "Password changed successfully." };
    }
    throw import_apiError.ApiError.badRequest("Password could not be updated for this account.");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthService
});
//# sourceMappingURL=auth.service.js.map
