import 'dotenv/config';
import mysql from 'mysql2/promise';

const {
  DB_HOST = 'shortline.proxy.rlwy.net',
  DB_PORT = '43943',
  DB_USER = 'root',
  DB_PASSWORD = 'EaeZlITLbITHtUvsWLEjaSrBIoEIPvbo',
  DB_NAME = 'banhang',
} = process.env;

export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
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