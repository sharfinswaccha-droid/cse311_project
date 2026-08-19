const app = require('./app');
const { verifyConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  await verifyConnection();
  app.listen(PORT, () => {
    console.log(`🚀 API server running at http://localhost:${PORT}`);
  });
})();
