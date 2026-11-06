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
var LearningResource_exports = {};
__export(LearningResource_exports, {
  LearningResource: () => LearningResource
});
module.exports = __toCommonJS(LearningResource_exports);
var import_mongoose = __toESM(require("mongoose"));
const LearningResourceSchema = new import_mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true
    },
    category: {
      type: String,
      enum: ["pdf", "prompt_template", "code_repo", "assignment", "faq", "testimonial", "workshop_description"],
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      trim: true
    },
    content: {
      type: String
    },
    workshopBatchCode: {
      type: String,
      trim: true,
      uppercase: true,
      index: true
    },
    accessLevel: {
      type: String,
      enum: ["enrolled_only", "public"],
      default: "enrolled_only",
      index: true
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true
    },
    authorName: {
      type: String,
      trim: true
    },
    authorRole: {
      type: String,
      trim: true
    },
    createdBy: {
      type: String
    }
  },
  {
    timestamps: true
  }
);
const LearningResource = import_mongoose.default.model(
  "LearningResource",
  LearningResourceSchema
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LearningResource
});
//# sourceMappingURL=LearningResource.js.map
