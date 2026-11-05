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
var User_exports = {};
__export(User_exports, {
  User: () => User
});
module.exports = __toCommonJS(User_exports);
var import_mongoose = __toESM(require("mongoose"));
var import_bcryptjs = __toESM(require("bcryptjs"));
const UserSchema = new import_mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
      index: true
    },
    passwordHash: {
      type: String,
      select: false
      // Do not return password hash by default
    },
    phone: {
      countryCode: { type: String, default: "+91" },
      number: { type: String, trim: true }
    },
    googleId: {
      type: String,
      sparse: true,
      index: true
    },
    avatarUrl: {
      type: String
    },
    role: {
      type: String,
      enum: ["learner", "instructor", "admin", "support"],
      default: "learner",
      index: true
    },
    userCategory: {
      type: String,
      enum: ["student", "working_professional", "founder", "creator", "other"],
      default: "working_professional"
    },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    marketingConsent: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpires: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.passwordHash) return false;
  return import_bcryptjs.default.compare(candidatePassword, this.passwordHash);
};
const User = import_mongoose.default.model("User", UserSchema);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  User
});
//# sourceMappingURL=User.js.map
