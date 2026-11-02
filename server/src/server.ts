import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { seedDatabase } from './utils/seed.js';

const startServer = async () => {
  const app = createApp();

  // Connect to Database
  const dbConnected = await connectDB();
  if (dbConnected) {
    await seedDatabase();
  }

  const server = app.listen(env.PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AI Launchpad Backend Server running on port ${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 REST API Base: http://localhost:${env.PORT}/api`);
    console.log(`🔐 Database: ${dbConnected ? 'Connected (MongoDB)' : 'Pending MongoDB Atlas URI'}`);
    console.log(`====================================================`);
  });

  const handleShutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      await disconnectDB();
      console.log('[Server] Process terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
};

startServer().catch((error) => {
  console.error('[Fatal Startup Error]', error);
  process.exit(1);
});

