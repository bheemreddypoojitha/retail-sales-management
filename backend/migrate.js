import fs from "fs";
import readline from "readline";
import Papa from "papaparse";
import { getDatabase } from "./src/utils/database.js";

const CSV_FILE = "./src/data/sales_data.csv";
const BATCH_SIZE = 500;

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return dateStr;
};

const insertBatch = async (db, batch) => {
  if (batch.length === 0) return;

  await db.exec("BEGIN TRANSACTION");
  const stmt = await db.prepare(`
    INSERT INTO sales (
      transaction_id, date, customer_id, customer_name, phone_number, gender, age, 
      customer_region, customer_type, product_id, product_name, brand, product_category, 
      tags, quantity, price_per_unit, discount_percentage, total_amount, final_amount, 
      payment_method, order_status, delivery_type, store_id, store_location, salesperson_id, employee_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const row of batch) {
    const safeFloat = (val) =>
      parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
    const safeInt = (val) => parseInt(String(val).replace(/[^0-9]+/g, "")) || 0;

    await stmt.run(
      row["Transaction ID"],
      parseDate(row["Date"]),
      row["Customer ID"],
      row["Customer Name"],
      row["Phone Number"],
      row["Gender"],
      safeInt(row["Age"]),
      row["Customer Region"],
      row["Customer Type"],
      row["Product ID"],
      row["Product Name"],
      row["Brand"],
      row["Product Category"],
      row["Tags"],
      safeInt(row["Quantity"]),
      safeFloat(row["Price per Unit"]),
      safeFloat(row["Discount Percentage"]),
      safeFloat(row["Total Amount"]),
      safeFloat(row["Final Amount"]),
      row["Payment Method"],
      row["Order Status"],
      row["Delivery Type"],
      row["Store ID"],
      row["Store Location"],
      row["Salesperson ID"],
      row["Employee Name"]
    );
  }

  await stmt.finalize();
  await db.exec("COMMIT");
};

const migrate = async () => {
  const db = await getDatabase();
  console.log("📦 Setting up SQLite database...");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT, date TEXT, customer_id TEXT, customer_name TEXT, phone_number TEXT,
      gender TEXT, age INTEGER, customer_region TEXT, customer_type TEXT,
      product_id TEXT, product_name TEXT, brand TEXT, product_category TEXT, tags TEXT,
      quantity INTEGER, price_per_unit REAL, discount_percentage REAL, total_amount REAL, final_amount REAL,
      payment_method TEXT, order_status TEXT, delivery_type TEXT, store_id TEXT, store_location TEXT,
      salesperson_id TEXT, employee_name TEXT
    )
  `);

  await db.exec("DELETE FROM sales");

  console.log("📖 Streaming CSV line-by-line (Ultra-Safe Mode)...");

  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ File not found: ${CSV_FILE}`);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(CSV_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let batch = [];
  let count = 0;
  let headers = null;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const result = Papa.parse(line, { header: false });
    const rowValues = result.data[0];

    if (!headers) {
      headers = rowValues;
      continue;
    }
    const rowObject = {};
    headers.forEach((header, index) => {
      rowObject[header.trim()] = rowValues[index];
    });

    batch.push(rowObject);
    count++;

    if (batch.length >= BATCH_SIZE) {
      await insertBatch(db, batch);
      if (count % 10000 === 0) console.log(`...processed ${count} records`);
      batch = [];
      await new Promise((resolve) => setImmediate(resolve));
    }
  }

  if (batch.length > 0) {
    await insertBatch(db, batch);
  }

  console.log(`✅ Database ready! Successfully loaded ${count} records.`);
};

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
