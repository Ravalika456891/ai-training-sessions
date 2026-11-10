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
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_User = require("../models/User.js");
var import_Registration = require("../models/Registration.js");
var import_Enrollment = require("../models/Enrollment.js");
var import_apiError = require("../utils/apiError.js");
var import_jwt = require("../utils/jwt.js");
var import_db = require("../config/db.js");
var import_env = require("../config/env.js");
var import_memoryStore = require("./memoryStore.js");
var import_mongoose = __toESM(require("mongoose"));
function formatDisplayNameFromEmail(email) {
  const prefix = (email.split("@")[0] || "Learner").replace(/[._-]+/g, " ").trim();
  const capitalized = prefix.split(/\s+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  const finalName = capitalized || "Student";
  return finalName.length >= 2 ? finalName : `${finalName} Learner`;
}
function createRegistrationProof(user) {
  return import_jsonwebtoken.default.sign(
    {
      type: "reg_proof",
      _id: user._id,
      email: user.email.toLowerCase().trim(),
      name: user.name,
      passwordHash: user.passwordHash,
      phone: user.phone,
      userCategory: user.userCategory,
      experienceLevel: user.experienceLevel
    },
    import_env.env.JWT_SECRET,
    { expiresIn: "365d" }
  );
}
function verifyRegistrationProof(proofToken, expectedEmail) {
  if (!proofToken) return null;
  try {
    const decoded = import_jsonwebtoken.default.verify(proofToken, import_env.env.JWT_SECRET);
    if (decoded?.type !== "reg_proof") return null;
    if (expectedEmail && decoded.email?.toLowerCase().trim() !== expectedEmail.toLowerCase().trim()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}
class AuthService {
  static async register(input) {
    const email = input.email.toLowerCase().trim();
    const rawName = (input.name || formatDisplayNameFromEmail(email)).trim();
    const safeName = rawName.length >= 2 ? rawName : `${rawName} Learner`;
    if ((0, import_db.isDBConnected)()) {
      try {
        let user = await import_User.User.findOne({ email }).select("+passwordHash");
        let passwordHash;
        if (input.password) {
          passwordHash = await import_bcryptjs.default.hash(input.password, 10);
        }
        if (user) {
          if (user.role === "admin") {
            throw import_apiError.ApiError.conflict("An administrator account with this email address already exists.");
          }
          user.name = safeName || user.name;
          if (passwordHash) {
            user.passwordHash = passwordHash;
          }
          if (input.phone) {
            user.phone = input.phone;
          }
          if (input.userCategory) user.userCategory = input.userCategory;
          if (input.experienceLevel) user.experienceLevel = input.experienceLevel;
          await user.save();
        } else {
          user = await import_User.User.create({
            name: safeName,
            email,
            passwordHash,
            phone: input.phone,
            userCategory: input.userCategory || "working_professional",
            experienceLevel: input.experienceLevel || "beginner",
            marketingConsent: input.marketingConsent || false,
            role: "learner"
          });
        }
        const existingMem = await import_memoryStore.memoryStore.findUserByEmail(email);
        if (!existingMem) {
          await import_memoryStore.memoryStore.createUser({
            name: user.name,
            email,
            password: input.password,
            phone: user.phone,
            userCategory: user.userCategory,
            experienceLevel: user.experienceLevel,
            marketingConsent: user.marketingConsent,
            role: "learner"
          });
        } else if (passwordHash && existingMem.role !== "admin") {
          existingMem.name = user.name;
          existingMem.passwordHash = passwordHash;
        }
        const token2 = (0, import_jwt.signToken)({
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
          phone: user.phone,
          userCategory: user.userCategory,
          experienceLevel: user.experienceLevel
        });
        const registrationProof2 = createRegistrationProof({
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          passwordHash: passwordHash || user.passwordHash,
          phone: user.phone,
          userCategory: user.userCategory,
          experienceLevel: user.experienceLevel
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
          token: token2,
          registrationProof: registrationProof2
        };
      } catch (err) {
        if (err.statusCode) throw err;
        console.warn("[MongoDB Registration Fallback]", err.message);
      }
    }
    let memUser = await import_memoryStore.memoryStore.findUserByEmail(email);
    if (memUser) {
      if (memUser.role === "admin") {
        throw import_apiError.ApiError.conflict("An administrator account with this email address already exists.");
      }
      memUser.name = safeName || memUser.name;
      if (input.password) {
        memUser.passwordHash = await import_bcryptjs.default.hash(input.password, 10);
      }
      if (input.phone) {
        memUser.phone = input.phone;
      }
    } else {
      memUser = await import_memoryStore.memoryStore.createUser({
        name: safeName,
        email,
        password: input.password,
        phone: input.phone,
        userCategory: input.userCategory,
        experienceLevel: input.experienceLevel,
        marketingConsent: input.marketingConsent,
        role: "learner"
      });
    }
    const token = (0, import_jwt.signToken)({
      userId: memUser._id,
      email: memUser.email,
      role: memUser.role,
      name: memUser.name,
      phone: memUser.phone,
      userCategory: memUser.userCategory,
      experienceLevel: memUser.experienceLevel
    });
    const registrationProof = createRegistrationProof({
      _id: memUser._id,
      email: memUser.email,
      name: memUser.name,
      passwordHash: memUser.passwordHash,
      phone: memUser.phone,
      userCategory: memUser.userCategory,
      experienceLevel: memUser.experienceLevel
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
      token,
      registrationProof
    };
  }
  static async login(input) {
    const email = input.email.toLowerCase().trim();
    const verifiedProof = verifyRegistrationProof(input.registrationProof, email);
    if ((0, import_db.isDBConnected)()) {
      try {
        let user = await import_User.User.findOne({ email }).select("+passwordHash");
        if (!user && verifiedProof) {
          user = await import_User.User.create({
            name: verifiedProof.name || formatDisplayNameFromEmail(email),
            email,
            passwordHash: verifiedProof.passwordHash,
            phone: verifiedProof.phone || { countryCode: "+91", number: "" },
            role: "learner",
            userCategory: verifiedProof.userCategory || "working_professional",
            experienceLevel: verifiedProof.experienceLevel || "beginner",
            marketingConsent: true
          });
        }
        if (!user) {
          const existingReg = await import_Registration.Registration.findOne({ email }).sort({ createdAt: -1 });
          const existingEnr = !existingReg ? await import_Enrollment.Enrollment.findOne({ "attendeeDetails.email": email }).sort({ createdAt: -1 }) : null;
          if (existingReg || existingEnr) {
            const regName = existingReg?.name || existingEnr?.attendeeDetails?.fullName || formatDisplayNameFromEmail(email);
            const passwordHash = await import_bcryptjs.default.hash(input.password, 10);
            user = await import_User.User.create({
              name: regName.length >= 2 ? regName : `${regName} Learner`,
              email,
              passwordHash,
              phone: existingReg?.phone ? { countryCode: "+91", number: existingReg.phone } : { countryCode: "+91", number: "" },
              role: "learner",
              userCategory: "working_professional",
              experienceLevel: "beginner",
              marketingConsent: true
            });
          }
        }
        if (user) {
          if (!user.passwordHash) {
            user.passwordHash = await import_bcryptjs.default.hash(input.password, 10);
            await user.save();
          } else {
            const isMatch = await user.comparePassword(input.password);
            if (!isMatch) {
              throw import_apiError.ApiError.unauthorized("Invalid email or password.");
            }
          }
          const token2 = (0, import_jwt.signToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
            phone: user.phone,
            userCategory: user.userCategory,
            experienceLevel: user.experienceLevel
          });
          const registrationProof2 = user.role !== "admin" ? createRegistrationProof({
            _id: user._id.toString(),
            email: user.email,
            name: user.name,
            passwordHash: user.passwordHash,
            phone: user.phone,
            userCategory: user.userCategory,
            experienceLevel: user.experienceLevel
          }) : void 0;
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
            token: token2,
            registrationProof: registrationProof2
          };
        }
      } catch (err) {
        if (err.statusCode) throw err;
        console.warn("[MongoDB Login Fallback]", err.message);
      }
    }
    let memUser = await import_memoryStore.memoryStore.findUserByEmail(email);
    if (!memUser && verifiedProof) {
      memUser = await import_memoryStore.memoryStore.restoreUserWithHash({
        _id: verifiedProof._id,
        name: verifiedProof.name || formatDisplayNameFromEmail(email),
        email,
        passwordHash: verifiedProof.passwordHash,
        phone: verifiedProof.phone,
        userCategory: verifiedProof.userCategory,
        experienceLevel: verifiedProof.experienceLevel
      });
    }
    if (!memUser) {
      const allRegs = await import_memoryStore.memoryStore.getAllRegistrations();
      const matchedReg = allRegs.find((r) => r.email.toLowerCase() === email);
      if (matchedReg) {
        memUser = await import_memoryStore.memoryStore.createUser({
          name: matchedReg.name || formatDisplayNameFromEmail(email),
          email,
          password: input.password,
          phone: matchedReg.phone ? { countryCode: "+91", number: matchedReg.phone } : { countryCode: "+91", number: "" },
          role: "learner",
          userCategory: "working_professional",
          experienceLevel: "beginner",
          marketingConsent: true
        });
      }
    }
    if (!memUser) {
      throw import_apiError.ApiError.unauthorized("Account not found. Please create an account first.");
    }
    if (!memUser.passwordHash || memUser.passwordHash === "no_password_set") {
      memUser.passwordHash = await import_bcryptjs.default.hash(input.password, 10);
    } else {
      const isMatch = await memUser.comparePassword(input.password);
      if (!isMatch) {
        throw import_apiError.ApiError.unauthorized("Invalid email or password.");
      }
    }
    const token = (0, import_jwt.signToken)({
      userId: memUser._id,
      email: memUser.email,
      role: memUser.role,
      name: memUser.name,
      phone: memUser.phone,
      userCategory: memUser.userCategory,
      experienceLevel: memUser.experienceLevel
    });
    const registrationProof = memUser.role !== "admin" ? createRegistrationProof({
      _id: memUser._id,
      email: memUser.email,
      name: memUser.name,
      passwordHash: memUser.passwordHash,
      phone: memUser.phone,
      userCategory: memUser.userCategory,
      experienceLevel: memUser.experienceLevel
    }) : void 0;
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
      token,
      registrationProof
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw import_apiError.ApiError.badRequest("Please enter a valid email address (e.g., you@gmail.com).");
    }
    const rawPassword = input.password ? String(input.password) : void 0;
    if (input.mode !== "register" && !input.credential) {
      if (!rawPassword) {
        throw import_apiError.ApiError.badRequest("Please enter your password to sign in.");
      }
      return AuthService.login({
        email,
        password: rawPassword,
        registrationProof: input.registrationProof
      });
    }
    const rawName = (payload?.name || input.name || email.split("@")[0] || "Learner").trim();
    const name = rawName.length >= 2 ? rawName : `${rawName} Learner`;
    const googleId = payload?.sub || input.googleId || `g_${Date.now()}`;
    const avatarUrl = payload?.picture || input.avatarUrl;
    if ((0, import_db.isDBConnected)()) {
      try {
        let user = await import_User.User.findOne({
          $or: [{ email }, { googleId }]
        }).select("+passwordHash");
        if (user) {
          let needsSave = false;
          if (!user.googleId) {
            user.googleId = googleId;
            if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
            needsSave = true;
          }
          if (rawPassword) {
            user.passwordHash = await import_bcryptjs.default.hash(rawPassword, 10);
            needsSave = true;
          }
          if (needsSave) {
            await user.save();
          }
        } else {
          const passwordHash = rawPassword ? await import_bcryptjs.default.hash(rawPassword, 10) : void 0;
          user = await import_User.User.create({
            name,
            email,
            passwordHash,
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
          role: user.role,
          name: user.name,
          phone: user.phone,
          userCategory: user.userCategory,
          experienceLevel: user.experienceLevel
        });
        const registrationProof2 = createRegistrationProof({
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          passwordHash: user.passwordHash,
          phone: user.phone,
          userCategory: user.userCategory,
          experienceLevel: user.experienceLevel
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
          token: token2,
          registrationProof: registrationProof2
        };
      } catch (dbErr) {
        if (dbErr.statusCode) throw dbErr;
        console.warn("[MongoDB Google Auth Fallback]", dbErr.message);
      }
    }
    let memUser = await import_memoryStore.memoryStore.findUserByEmail(email);
    if (!memUser) {
      memUser = await import_memoryStore.memoryStore.createUser({
        name,
        email,
        password: rawPassword,
        googleId,
        avatarUrl,
        role: "learner",
        marketingConsent: true
      });
    } else if (rawPassword) {
      memUser.passwordHash = await import_bcryptjs.default.hash(rawPassword, 10);
    }
    const token = (0, import_jwt.signToken)({
      userId: memUser._id,
      email: memUser.email,
      role: memUser.role,
      name: memUser.name,
      phone: memUser.phone,
      userCategory: memUser.userCategory,
      experienceLevel: memUser.experienceLevel
    });
    const registrationProof = createRegistrationProof({
      _id: memUser._id,
      email: memUser.email,
      name: memUser.name,
      passwordHash: memUser.passwordHash,
      phone: memUser.phone,
      userCategory: memUser.userCategory,
      experienceLevel: memUser.experienceLevel
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
      token,
      registrationProof
    };
  }
  static async getMe(userId, fallbackUser) {
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
    if (fallbackUser) {
      return {
        _id: fallbackUser._id?.toString() || userId,
        name: fallbackUser.name,
        email: fallbackUser.email,
        phone: fallbackUser.phone,
        role: fallbackUser.role || "learner",
        userCategory: fallbackUser.userCategory || "working_professional",
        experienceLevel: fallbackUser.experienceLevel || "beginner",
        createdAt: fallbackUser.createdAt || /* @__PURE__ */ new Date()
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
  static async updateProfile(userId, data, fallbackUser) {
    let updatedUser = null;
    if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(userId)) {
      try {
        const user = await import_User.User.findById(userId);
        if (user) {
          if (data.name) user.name = data.name.trim();
          if (data.phone) user.phone = data.phone;
          if (data.experienceLevel) user.experienceLevel = data.experienceLevel;
          if (data.userCategory) user.userCategory = data.userCategory;
          await user.save();
          updatedUser = await this.getMe(userId, user);
        }
      } catch (err) {
        console.warn("[MongoDB updateProfile fallback]", err);
      }
    }
    if (!updatedUser) {
      const memUser = await import_memoryStore.memoryStore.findUserById(userId);
      if (memUser) {
        if (data.name) memUser.name = data.name.trim();
        if (data.phone) memUser.phone = data.phone;
        if (data.experienceLevel) memUser.experienceLevel = data.experienceLevel;
        if (data.userCategory) memUser.userCategory = data.userCategory;
        updatedUser = await this.getMe(userId, memUser);
      }
    }
    if (!updatedUser && fallbackUser) {
      updatedUser = {
        _id: fallbackUser._id?.toString() || userId,
        name: data.name ? data.name.trim() : fallbackUser.name,
        email: fallbackUser.email,
        phone: data.phone || fallbackUser.phone,
        role: fallbackUser.role || "learner",
        userCategory: data.userCategory || fallbackUser.userCategory || "working_professional",
        experienceLevel: data.experienceLevel || fallbackUser.experienceLevel || "beginner",
        createdAt: fallbackUser.createdAt || /* @__PURE__ */ new Date()
      };
    }
    if (!updatedUser) {
      throw import_apiError.ApiError.notFound("User not found.");
    }
    const token = (0, import_jwt.signToken)({
      userId: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
      phone: updatedUser.phone,
      userCategory: updatedUser.userCategory,
      experienceLevel: updatedUser.experienceLevel
    });
    return { user: updatedUser, token };
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
