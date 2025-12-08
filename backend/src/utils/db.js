import pg from "pg";
import dotenv from "dotenv";
import path from "path";

const { Pool } = pg;
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 60000,
  max: 4, 
  query_timeout: 60000, 
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});

export const query = async (text, params) => {
  return await pool.query(text, params);
};

export default pool;
