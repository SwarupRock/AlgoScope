// db.js — MySQL database layer for AlgoScope
const mysql = require('mysql2/promise');

const dbName = process.env.DB_NAME || 'algoscope';

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'algoscope123',
  database: dbName,
  port:     process.env.DB_PORT     || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

async function initializeDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'algoscope123';
  const port = process.env.DB_PORT || 3306;

  const adminConnection = await mysql.createConnection({ host, user, password, port });
  await adminConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await adminConnection.end();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('user','admin') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS visualizations (
      id VARCHAR(36) PRIMARY KEY,
      user_id INT NULL,
      code MEDIUMTEXT NOT NULL,
      trace_json JSON NOT NULL,
      algorithm VARCHAR(120) NULL,
      data_structure VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_visualizations_user_id (user_id),
      INDEX idx_visualizations_created_at (created_at),
      CONSTRAINT fk_visualizations_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

// ── User helpers ──────────────────────────────────────────────────────────────
async function createUser(username, email, passwordHash) {
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  );
  return result.insertId;
}

async function getUserByUsername(username) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
}

async function getUserByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function getUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]
  );
  return rows[0] || null;
}

async function getAllUsers() {
  const [rows] = await pool.execute(`
    SELECT u.id, u.username, u.email, u.role, u.created_at,
           COUNT(v.id) as viz_count
    FROM users u LEFT JOIN visualizations v ON v.user_id = u.id
    GROUP BY u.id ORDER BY u.created_at DESC
  `);
  return rows;
}

// ── Visualization helpers ─────────────────────────────────────────────────────
async function saveVisualization(id, code, trace, algorithm, dataStructure, userId = null) {
  await pool.execute(
    'INSERT INTO visualizations (id, user_id, code, trace_json, algorithm, data_structure) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, code, JSON.stringify(trace), algorithm || null, dataStructure || null]
  );
  return { id };
}

async function getVisualization(id) {
  const [rows] = await pool.execute('SELECT * FROM visualizations WHERE id = ?', [id]);
  if (!rows[0]) return null;
  const row = rows[0];
  row.trace_json = typeof row.trace_json === 'string' ? JSON.parse(row.trace_json) : row.trace_json;
  return row;
}

async function getRecentVisualizations(limit = 20) {
  const [rows] = await pool.execute(`
    SELECT v.id, v.algorithm, v.data_structure, v.created_at, u.username
    FROM visualizations v LEFT JOIN users u ON u.id = v.user_id
    ORDER BY v.created_at DESC LIMIT ?
  `, [limit]);
  return rows;
}

async function getVisualizationsByUser(userId) {
  const [rows] = await pool.execute(`
    SELECT id, algorithm, data_structure, code, created_at
    FROM visualizations WHERE user_id = ? ORDER BY created_at DESC
  `, [userId]);
  return rows;
}

// ── Admin SQL runner (read-only) ──────────────────────────────────────────────
async function runAdminQuery(query) {
  const q = query.trim().toUpperCase();
  const blocked = ['INSERT','UPDATE','DELETE','DROP','CREATE','ALTER','TRUNCATE'];
  if (blocked.some(kw => q.startsWith(kw))) throw new Error('Only SELECT queries allowed.');
  const [rows] = await pool.execute(query);
  return rows;
}

async function getSchema() {
  const [tables] = await pool.execute("SHOW TABLES");
  const schema = {};
  for (const t of tables) {
    const tName = Object.values(t)[0];
    const safeName = String(tName).replace(/`/g, '``');
    const [cols] = await pool.execute(`DESCRIBE \`${safeName}\``);
    schema[tName] = cols;
  }
  return schema;
}

// ── Test connection ───────────────────────────────────────────────────────────
async function testConnection() {
  const conn = await pool.getConnection();
  console.log('[db] MySQL connected — algoscope database ready');
  conn.release();
}

module.exports = {
  initializeDatabase,
  testConnection,
  createUser, getUserByUsername, getUserByEmail, getUserById, getAllUsers,
  saveVisualization, getVisualization, getRecentVisualizations, getVisualizationsByUser,
  runAdminQuery, getSchema
};
