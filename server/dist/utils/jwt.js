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
var jwt_exports = {};
__export(jwt_exports, {
  clearAuthCookie: () => clearAuthCookie,
  setAuthCookie: () => setAuthCookie,
  signToken: () => signToken,
  verifyToken: () => verifyToken
});
module.exports = __toCommonJS(jwt_exports);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_env = require("../config/env.js");
const signToken = (payload) => {
  const options = {
    expiresIn: import_env.env.JWT_EXPIRES_IN
  };
  return import_jsonwebtoken.default.sign(payload, import_env.env.JWT_SECRET, options);
};
const verifyToken = (token) => {
  return import_jsonwebtoken.default.verify(token, import_env.env.JWT_SECRET);
};
const setAuthCookie = (res, token) => {
  res.cookie(import_env.env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: import_env.env.isProduction,
    sameSite: import_env.env.isProduction ? "strict" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1e3
    // 7 days
  });
};
const clearAuthCookie = (res) => {
  res.clearCookie(import_env.env.COOKIE_NAME, {
    httpOnly: true,
    secure: import_env.env.isProduction,
    sameSite: import_env.env.isProduction ? "strict" : "lax",
    path: "/"
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  clearAuthCookie,
  setAuthCookie,
  signToken,
  verifyToken
});
//# sourceMappingURL=jwt.js.map
