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
var app_exports = {};
__export(app_exports, {
  createApp: () => createApp
});
module.exports = __toCommonJS(app_exports);
var import_express = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_cookie_parser = __toESM(require("cookie-parser"));
var import_routes = __toESM(require("./routes/index.js"));
var import_error_middleware = require("./middleware/error.middleware.js");
var import_rateLimit_middleware = require("./middleware/rateLimit.middleware.js");
var import_apiError = require("./utils/apiError.js");
var import_env = require("./config/env.js");
const createApp = () => {
  const app = (0, import_express.default)();
  if (import_env.env.isProduction) {
    app.set("trust proxy", 1);
  }
  app.use(
    (0, import_helmet.default)({
      contentSecurityPolicy: import_env.env.isProduction ? void 0 : false,
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(
    (0, import_cors.default)({
      origin: (requestOrigin, callback) => {
        if (!requestOrigin) return callback(null, true);
        const isAllowed = requestOrigin === import_env.env.CLIENT_ORIGIN || requestOrigin === "http://localhost:5173" || requestOrigin === "http://127.0.0.1:5173" || requestOrigin.endsWith(".vercel.app") || requestOrigin.includes("localhost") || process.env.VERCEL_URL && requestOrigin.includes(process.env.VERCEL_URL);
        if (isAllowed) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-requested-with"]
    })
  );
  app.use(
    import_express.default.json({
      limit: "1mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf.toString();
      }
    })
  );
  app.use(import_express.default.urlencoded({ extended: true, limit: "1mb" }));
  app.use((0, import_cookie_parser.default)());
  app.use("/api", import_rateLimit_middleware.apiRateLimiter);
  app.use((req, _res, next) => {
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
    const hasAuthCookie = Boolean(req.cookies?.[import_env.env.COOKIE_NAME]);
    if (isMutation && hasAuthCookie) {
      const customHeader = req.headers["x-requested-with"] || req.headers["authorization"];
      if (!customHeader && req.path.startsWith("/api/admin")) {
        return next(
          import_apiError.ApiError.forbidden("CSRF validation failed: Missing custom request header.")
        );
      }
    }
    next();
  });
  app.use("/api", import_routes.default);
  app.use((req, _res, next) => {
    next(import_apiError.ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
  });
  app.use(import_error_middleware.errorHandler);
  return app;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createApp
});
