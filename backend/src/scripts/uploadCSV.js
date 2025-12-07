import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import csvParser from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_SIZE = 10000;

async function uploadCSV() {
  console.log("🚀 Starting FAST CSV upload to SQLite...");

  const db = await open({
    filename: path.join(__dirname, "../data/sales.db"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = OFF;
    PRAGMA temp_store = MEMORY;
    PRAGMA mmap_size = 30000000000;
  `);
  await db.exec(`
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
  `);

  const csvPath = path.join(__dirname, "../../src/data/sales_data.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("❌ CSV file not found:", csvPath);
    process.exit(1);
  }

  console.log("📂 Reading CSV...");
  const stream = fs.createReadStream(csvPath).pipe(csvParser());

  let buffer = [];
  let totalInserted = 0;

  const insertBatch = async () => {
    if (buffer.length === 0) return;

    await db.exec("BEGIN TRANSACTION;");

    const stmt = await db.prepare(`
      INSERT INTO sales (
        transaction_id, date, customer_id, customer_name, phone_number,
        gender, age, customer_region, customer_type, product_id,
        product_name, brand, product_category, tags, quantity,
        price_per_unit, discount_percentage, total_amount, final_amount,
        payment_method, order_status, delivery_type, store_id,
        store_location, salesperson_id, employee_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let row of buffer) {
      await stmt.run(row);
    }

    await stmt.finalize();
    await db.exec("COMMIT;");

    totalInserted += buffer.length;
    console.log(`📊 Inserted: ${totalInserted} rows...`);

    buffer = [];
  };

  stream.on("data", (row) => {
    buffer.push([
      row["Transaction ID"],
      row["Date"],
      row["Customer ID"],
      row["Customer Name"],
      row["Phone Number"],
      row["Gender"],
      parseInt(row["Age"]) || 0,
      row["Customer Region"],
      row["Customer Type"],
      row["Product ID"],
      row["Product Name"],
      row["Brand"],
      row["Product Category"],
      row["Tags"],
      parseInt(row["Quantity"]) || 0,
      parseFloat(row["Price per Unit"]) || 0,
      parseFloat(row["Discount Percentage"]) || 0,
      parseFloat(row["Total Amount"]) || 0,
      parseFloat(row["Final Amount"]) || 0,
      row["Payment Method"],
      row["Order Status"],
      row["Delivery Type"],
      row["Store ID"],
      row["Store Location"],
      row["Salesperson ID"],
      row["Employee Name"],
    ]);

    if (buffer.length >= BATCH_SIZE) {
      stream.pause();
      insertBatch().then(() => stream.resume());
    }
  });

  stream.on("end", async () => {
    await insertBatch();
    console.log(`🎉 Upload complete! Total rows inserted: ${totalInserted}`);
    process.exit(0);
  });

  stream.on("error", (err) => {
    console.error("❌ CSV error:", err);
    process.exit(1);
  });
}

uploadCSV();
