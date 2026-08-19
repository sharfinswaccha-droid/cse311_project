const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true // return DECIMAL columns as JS numbers, not strings
});

// Fail fast with a clear message if the DB is unreachable, instead of
// letting every route throw a cryptic connection error.
async function verifyConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME);
  } catch (err) {
    console.error('❌ Could not connect to MySQL:', err.message);
    console.error('   Check your .env DB_* values and that MySQL is running.');
  }
}

module.exports = { pool, verifyConnection };
