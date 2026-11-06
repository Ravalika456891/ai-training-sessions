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
var import_memoryStore = require("./memoryStore.js");
var import_mongoose = __toESM(require("mongoose"));
class WorkshopService {
  static async getPublishedWorkshops() {
    if ((0, import_db.isDBConnected)()) {
      try {
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
        if (workshops && workshops.length > 0) {
          return workshops;
        }
      } catch (err) {
        console.warn("[MongoDB getPublishedWorkshops Fallback]", err.message);
      }
    }
    return import_memoryStore.memoryStore.getPublishedWorkshops();
  }
  static async getWorkshopById(idOrSlug) {
    if ((0, import_db.isDBConnected)()) {
      try {
        let workshop = null;
        if (import_mongoose.default.Types.ObjectId.isValid(idOrSlug)) {
          workshop = await import_Workshop.Workshop.findById(idOrSlug);
        } else {
          workshop = await import_Workshop.Workshop.findOne({
            $or: [{ slug: idOrSlug }, { batchCode: idOrSlug }]
          });
        }
        if (workshop) {
          return workshop;
        }
      } catch (err) {
        console.warn("[MongoDB getWorkshopById Fallback]", err.message);
      }
    }
    const memWorkshop = await import_memoryStore.memoryStore.findWorkshop(idOrSlug);
    if (!memWorkshop) {
      throw import_apiError.ApiError.notFound(`Workshop '${idOrSlug}' not found.`);
    }
    return memWorkshop;
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
      endDate: new Date(input.endDate),
      enrolledCount: 0,
      reservedCount: 0
    });
    return workshop;
  }
  static async updateWorkshop(id, input) {
    const workshop = await import_Workshop.Workshop.findByIdAndUpdate(
      id,
      {
        ...input,
        ...input.startDate && { startDate: new Date(input.startDate) },
        ...input.endDate && { endDate: new Date(input.endDate) }
      },
      { new: true, runValidators: true }
    );
    if (!workshop) {
      throw import_apiError.ApiError.notFound(`Workshop with ID '${id}' not found.`);
    }
    return workshop;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WorkshopService
});
