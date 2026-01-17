import pg from "pg";
const { Pool } = pg;
import logger from "../utils/logger.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
  logger.info("Database connected successfully");
});

pool.on("error", (err) => {
  logger.error("Unexpected database error", err);
  process.exit(-1);
});

// Query function with error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error("Query error", { text, params, error: error.message });
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export { query, pool, transaction };
