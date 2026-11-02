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
var workshop_service_exports = {};
__export(workshop_service_exports, {
  WorkshopService: () => WorkshopService
});
module.exports = __toCommonJS(workshop_service_exports);
var import_Workshop = require("../models/Workshop.js");
var import_apiError = require("../utils/apiError.js");
var import_db = require("../config/db.js");
var import_seed = require("../utils/seed.js");
var import_mongoose = __toESM(require("mongoose"));
class WorkshopService {
  static async getPublishedWorkshops() {
    if (!(0, import_db.isDBConnected)()) {
      return [];
    }
    let workshops = await import_Workshop.Workshop.find({
      status: "published"
    }).sort({ startDate: 1 });
    if (workshops.length === 0) {
      try {
        await (0, import_seed.seedDatabase)();
        workshops = await import_Workshop.Workshop.find({
          status: "published"
        }).sort({ startDate: 1 });
      } catch (seedErr) {
        console.warn("[Auto-Seed Error]", seedErr);
      }
    }
    return workshops;
  }
  static async getWorkshopById(idOrSlug) {
    let workshop = null;
    if (import_mongoose.default.Types.ObjectId.isValid(idOrSlug)) {
      workshop = await import_Workshop.Workshop.findById(idOrSlug);
    } else {
      workshop = await import_Workshop.Workshop.findOne({ slug: idOrSlug });
    }
    if (!workshop) {
      throw import_apiError.ApiError.notFound(`Workshop '${idOrSlug}' not found.`);
    }
    return workshop;
  }
  static async createWorkshop(input) {
    const existing = await import_Workshop.Workshop.findOne({
      $or: [{ slug: input.slug }, { batchCode: input.batchCode }]
    });
    if (existing) {
      throw import_apiError.ApiError.conflict("A workshop with this slug or batch code already exists.");
    }
    const workshop = await import_Workshop.Workshop.create({
      ...input,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate)
    });
    return workshop;
  }
  static async updateWorkshop(id, input) {
    if (!import_mongoose.default.Types.ObjectId.isValid(id)) {
      throw import_apiError.ApiError.badRequest("Invalid workshop ID format.");
    }
    const updateData = { ...input };
    if (input.startDate) updateData.startDate = new Date(input.startDate);
    if (input.endDate) updateData.endDate = new Date(input.endDate);
    const workshop = await import_Workshop.Workshop.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    if (!workshop) {
      throw import_apiError.ApiError.notFound("Workshop not found.");
    }
    return workshop;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WorkshopService
});
//# sourceMappingURL=workshop.service.js.map
