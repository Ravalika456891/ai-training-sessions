var import_app = require("./app.js");
var import_env = require("./config/env.js");
var import_db = require("./config/db.js");
var import_seed = require("./utils/seed.js");
const startServer = async () => {
  const app = (0, import_app.createApp)();
  const dbConnected = await (0, import_db.connectDB)();
  if (dbConnected) {
    await (0, import_seed.seedDatabase)();
  }
  const server = app.listen(import_env.env.PORT, () => {
    console.log(`====================================================`);
    console.log(`\u{1F680} AI Launchpad Backend Server running on port ${import_env.env.PORT}`);
    console.log(`\u{1F4E1} Environment: ${import_env.env.NODE_ENV}`);
    console.log(`\u{1F517} REST API Base: http://localhost:${import_env.env.PORT}/api`);
    console.log(`\u{1F510} Database: ${dbConnected ? "Connected (MongoDB)" : "Pending MongoDB Atlas URI"}`);
    console.log(`====================================================`);
  });
  const handleShutdown = async (signal) => {
    console.log(`
[Server] Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      await (0, import_db.disconnectDB)();
      console.log("[Server] Process terminated cleanly.");
      process.exit(0);
    });
  };
  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
};
startServer().catch((error) => {
  console.error("[Fatal Startup Error]", error);
  process.exit(1);
});
