import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "../data/sales.db");

let db = null;

/**
 * Get or create database connection
 */
export const getDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("❌ Error opening database:", err);
        return reject(err);
      }
      console.log("✅ Connected to SQLite database");
      resolve(db);
    });
  });
};

/**
 * Initialize database schema
 */
export const initializeDatabase = async () => {
  const database = await getDatabase();

  return new Promise((resolve, reject) => {
    database.serialize(() => {
      // Create sales table
      database.run(
        `
        CREATE TABLE IF NOT EXISTS sales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transaction_id TEXT,
          date TEXT,
          customer_id TEXT,
          customer_name TEXT,
          phone_number TEXT,
          gender TEXT,
          age INTEGER,
          customer_region TEXT,
          customer_type TEXT,
          product_id TEXT,
          product_name TEXT,
          brand TEXT,
          product_category TEXT,
          tags TEXT,
          quantity INTEGER,
          price_per_unit REAL,
          discount_percentage REAL,
          total_amount REAL,
          final_amount REAL,
          payment_method TEXT,
          order_status TEXT,
          delivery_type TEXT,
          store_id TEXT,
          store_location TEXT,
          salesperson_id TEXT,
          employee_name TEXT
        )
      `,
        (err) => {
          if (err) {
            console.error("❌ Error creating table:", err);
            return reject(err);
          }
        }
      );

      // Create indexes
      const indexes = [
        "CREATE INDEX IF NOT EXISTS idx_customer_name ON sales(customer_name)",
        "CREATE INDEX IF NOT EXISTS idx_phone_number ON sales(phone_number)",
        "CREATE INDEX IF NOT EXISTS idx_date ON sales(date)",
        "CREATE INDEX IF NOT EXISTS idx_customer_region ON sales(customer_region)",
        "CREATE INDEX IF NOT EXISTS idx_product_category ON sales(product_category)",
        "CREATE INDEX IF NOT EXISTS idx_payment_method ON sales(payment_method)",
        "CREATE INDEX IF NOT EXISTS idx_order_status ON sales(order_status)",
        "CREATE INDEX IF NOT EXISTS idx_delivery_type ON sales(delivery_type)",
      ];

      indexes.forEach((indexSql) => {
        database.run(indexSql);
      });

      console.log("✅ Database schema initialized");
      resolve();
    });
  });
};

/**
 * Close database connection
 */
export const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return resolve();
    }

    db.close((err) => {
      if (err) {
        console.error("❌ Error closing database:", err);
        return reject(err);
      }
      db = null;
      console.log("🔌 Database connection closed");
      resolve();
    });
  });
};

/**
 * Get total record count
 */
export const getRecordCount = async () => {
  const database = await getDatabase();

  return new Promise((resolve, reject) => {
    database.get("SELECT COUNT(*) as count FROM sales", (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row.count);
    });
  });
};
