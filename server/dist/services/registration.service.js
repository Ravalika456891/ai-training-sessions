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
var registration_service_exports = {};
__export(registration_service_exports, {
  RegistrationService: () => RegistrationService
});
module.exports = __toCommonJS(registration_service_exports);
var import_Registration = require("../models/Registration.js");
var import_apiError = require("../utils/apiError.js");
var import_db = require("../config/db.js");
var import_memoryStore = require("./memoryStore.js");
var import_email_service = require("./email.service.js");
class RegistrationService {
  /**
   * Create a new student registration with duplicate protection and email confirmation
   */
  static async createRegistration(input) {
    const name = input.name.trim();
    const email = input.email.toLowerCase().trim();
    const phone = input.phone.trim();
    const batchId = input.batchId.trim();
    if ((0, import_db.isDBConnected)()) {
      try {
        const existing = await import_Registration.Registration.findOne({ email, batchId });
        if (existing) {
          throw import_apiError.ApiError.conflict(
            `You have already registered for this training batch (${batchId}) with this email address.`
          );
        }
        const registration = await import_Registration.Registration.create({
          name,
          email,
          phone,
          batchId,
          registrationStatus: "confirmed",
          paymentStatus: "unpaid"
        });
        const emailResult2 = await import_email_service.EmailService.sendRegistrationConfirmation({
          id: registration._id.toString(),
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          batchId: registration.batchId,
          createdAt: registration.createdAt
        });
        return {
          registration: {
            id: registration._id.toString(),
            name: registration.name,
            email: registration.email,
            phone: registration.phone,
            batchId: registration.batchId,
            registrationStatus: registration.registrationStatus,
            paymentStatus: registration.paymentStatus,
            createdAt: registration.createdAt
          },
          emailDispatched: emailResult2.sent
        };
      } catch (err) {
        if (err.code === 11e3) {
          throw import_apiError.ApiError.conflict(
            `You have already registered for this training batch (${batchId}) with this email address.`
          );
        }
        if (err.statusCode) throw err;
        console.warn("[MongoDB Registration Fallback to MemoryStore]", err.message);
      }
    }
    const existingInMemory = await import_memoryStore.memoryStore.findRegistration(email, batchId);
    if (existingInMemory) {
      throw import_apiError.ApiError.conflict(
        `You have already registered for this training batch (${batchId}) with this email address.`
      );
    }
    const savedInMemory = await import_memoryStore.memoryStore.createRegistration({
      name,
      email,
      phone,
      batchId,
      registrationStatus: "confirmed",
      paymentStatus: "unpaid"
    });
    const emailResult = await import_email_service.EmailService.sendRegistrationConfirmation({
      id: savedInMemory._id,
      name: savedInMemory.name,
      email: savedInMemory.email,
      phone: savedInMemory.phone,
      batchId: savedInMemory.batchId,
      createdAt: savedInMemory.createdAt
    });
    return {
      registration: {
        id: savedInMemory._id,
        name: savedInMemory.name,
        email: savedInMemory.email,
        phone: savedInMemory.phone,
        batchId: savedInMemory.batchId,
        registrationStatus: savedInMemory.registrationStatus,
        paymentStatus: savedInMemory.paymentStatus,
        createdAt: savedInMemory.createdAt
      },
      emailDispatched: emailResult.sent
    };
  }
  /**
   * Retrieve registrations (for verification or admin audits)
   */
  static async getRegistrations(filter) {
    if ((0, import_db.isDBConnected)()) {
      try {
        const query = {};
        if (filter?.email) query.email = filter.email.toLowerCase().trim();
        if (filter?.batchId) query.batchId = filter.batchId.trim();
        const list = await import_Registration.Registration.find(query).sort({ createdAt: -1 }).lean();
        return list.map((item) => ({
          id: item._id.toString(),
          name: item.name,
          email: item.email,
          phone: item.phone,
          batchId: item.batchId,
          registrationStatus: item.registrationStatus,
          paymentStatus: item.paymentStatus,
          createdAt: item.createdAt
        }));
      } catch (err) {
        console.warn("[MongoDB GetRegistrations Fallback]", err.message);
      }
    }
    const all = await import_memoryStore.memoryStore.getAllRegistrations();
    return all.filter((r) => {
      if (filter?.email && r.email.toLowerCase() !== filter.email.toLowerCase().trim()) return false;
      if (filter?.batchId && r.batchId !== filter.batchId.trim()) return false;
      return true;
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RegistrationService
});
