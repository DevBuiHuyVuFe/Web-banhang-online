import 'dotenv/config';
import mysql from 'mysql2/promise';

// const {
//   DB_HOST = 'shortline.proxy.rlwy.net',
//   DB_PORT = '43943',
//   DB_USER = 'root',
//   DB_PASSWORD = 'EaeZlITLbITHtUvsWLEjaSrBIoEIPvbo',
//   DB_NAME = 'railway',
// } = process.env;

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function ping() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    return true;
  } finally {
    conn.release();
  }
} 