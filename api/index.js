const { createApp } = require('../server/dist/app.js');
const { connectDB } = require('../server/dist/config/db.js');

let appInstance = null;

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('[Vercel Serverless DB Error]', error);
  }

  if (!appInstance) {
    appInstance = createApp();
  }

  return appInstance(req, res);
};

