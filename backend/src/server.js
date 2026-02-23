require('dotenv').config();

const app = require('./app');
const { pool } = require('./config');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const client = await pool.connect();
    client.release();
    console.log('Connected to PostgreSQL database');

    app.listen(PORT, () => {
      console.log(`VisionAI backend listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

