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
var auth_controller_exports = {};
__export(auth_controller_exports, {
  AuthController: () => AuthController
});
module.exports = __toCommonJS(auth_controller_exports);
var import_auth_service = require("../services/auth.service.js");
var import_jwt = require("../utils/jwt.js");
class AuthController {
  static async register(req, res, next) {
    try {
      const { user, token } = await import_auth_service.AuthService.register(req.body);
      (0, import_jwt.setAuthCookie)(res, token);
      res.status(201).json({
        success: true,
        message: "Account registered successfully.",
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
  static async login(req, res, next) {
    try {
      const { user, token } = await import_auth_service.AuthService.login(req.body);
      (0, import_jwt.setAuthCookie)(res, token);
      res.status(200).json({
        success: true,
        message: "Signed in successfully.",
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
  static async googleAuth(req, res, next) {
    try {
      const { user, token } = await import_auth_service.AuthService.googleAuth(req.body);
      (0, import_jwt.setAuthCookie)(res, token);
      res.status(200).json({
        success: true,
        message: "Signed in with Google successfully.",
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
  static async logout(_req, res, next) {
    try {
      (0, import_jwt.clearAuthCookie)(res);
      res.status(200).json({
        success: true,
        message: "Signed out successfully."
      });
    } catch (error) {
      next(error);
    }
  }
  static async getMe(req, res, next) {
    try {
      const user = await import_auth_service.AuthService.getMe(req.user._id.toString());
      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
  static async forgotPassword(req, res, next) {
    try {
      const result = await import_auth_service.AuthService.forgotPassword(req.body.email);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await import_auth_service.AuthService.resetPassword(token, newPassword);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
  static async updateProfile(req, res, next) {
    try {
      const updatedUser = await import_auth_service.AuthService.updateProfile(req.user._id.toString(), req.body);
      res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await import_auth_service.AuthService.changePassword(
        req.user._id.toString(),
        currentPassword,
        newPassword
      );
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthController
});
//# sourceMappingURL=auth.controller.js.map
