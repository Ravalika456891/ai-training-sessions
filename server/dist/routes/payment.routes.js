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
var payment_routes_exports = {};
__export(payment_routes_exports, {
  default: () => payment_routes_default
});
module.exports = __toCommonJS(payment_routes_exports);
var import_express = require("express");
var import_payment_controller = require("../controllers/payment.controller.js");
var import_auth_middleware = require("../middleware/auth.middleware.js");
var import_validate_middleware = require("../middleware/validate.middleware.js");
var import_payment_validator = require("../validators/payment.validator.js");
const router = (0, import_express.Router)();
router.post(
  "/create-order",
  import_auth_middleware.optionalAuthenticate,
  (0, import_validate_middleware.validateRequest)(import_payment_validator.createOrderSchema),
  import_payment_controller.PaymentController.createOrder
);
router.post(
  "/verify",
  import_auth_middleware.optionalAuthenticate,
  (0, import_validate_middleware.validateRequest)(import_payment_validator.verifyPaymentSchema),
  import_payment_controller.PaymentController.verify
);
router.post("/webhook", import_payment_controller.PaymentController.webhook);
router.post("/validate-coupon", import_payment_controller.PaymentController.validateCoupon);
router.get("/my-payments", import_auth_middleware.authenticate, import_payment_controller.PaymentController.getMyPayments);
router.get("/enrollment/:enrollmentId", import_payment_controller.PaymentController.getPaymentByEnrollment);
var payment_routes_default = router;
