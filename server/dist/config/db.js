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
var db_exports = {};
__export(db_exports, {
  connectDB: () => connectDB,
  disconnectDB: () => disconnectDB,
  isDBConnected: () => isDBConnected
});
module.exports = __toCommonJS(db_exports);
var import_mongoose = __toESM(require("mongoose"));
var import_env = require("./env.js");
let isConnected = false;
const connectDB = async () => {
  if (isConnected) {
    return true;
  }
  try {
    import_mongoose.default.set("strictQuery", true);
    await import_mongoose.default.connect(import_env.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5e3,
      autoIndex: true
    });
    isConnected = true;
    console.log(`[MongoDB] Successfully connected to database: ${import_mongoose.default.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not establish connection to ${import_env.env.MONGODB_URI}`);
    console.warn(`Reason: ${error.message}`);
    console.warn(`Please set MONGODB_URI in server/.env with your valid MongoDB Atlas connection string.`);
    return false;
  }
};
const isDBConnected = () => isConnected;
const disconnectDB = async () => {
  if (isConnected) {
    await import_mongoose.default.disconnect();
    isConnected = false;
    console.log("[MongoDB] Disconnected from database.");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  connectDB,
  disconnectDB,
  isDBConnected
});
//# sourceMappingURL=db.js.map
