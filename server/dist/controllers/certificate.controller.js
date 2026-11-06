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
var certificate_controller_exports = {};
__export(certificate_controller_exports, {
  CertificateController: () => CertificateController
});
module.exports = __toCommonJS(certificate_controller_exports);
var import_Certificate = require("../models/Certificate.js");
var import_apiError = require("../utils/apiError.js");
class CertificateController {
  // Public verification endpoint
  static async verifyCertificate(req, res, next) {
    try {
      const serialNumber = req.params.serialNumber.trim().toUpperCase();
      const certificate = await import_Certificate.Certificate.findOne({
        serialNumber
      }).populate("workshopId", "title batchCode instructor");
      if (!certificate) {
        throw import_apiError.ApiError.notFound(`No certificate found matching serial number '${serialNumber}'.`);
      }
      res.status(200).json({
        success: true,
        data: {
          isValid: !certificate.isRevoked,
          serialNumber: certificate.serialNumber,
          recipientName: certificate.recipientName,
          workshopTitle: certificate.workshopTitle,
          completionDate: certificate.completionDate,
          issuedAt: certificate.issuedAt,
          isRevoked: certificate.isRevoked,
          revokedReason: certificate.revokedReason,
          verificationHash: certificate.verificationHash,
          issuingAuthority: "AI Launchpad Accreditation Council"
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CertificateController
});
