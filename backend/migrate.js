import fs from "fs";
import Papa from "papaparse";
import { getDb } from "./src/utils/db.js";

const CSV_FILE = "./src/data/sales_data.csv";
const BATCH_SIZE = 5000; // Insert 5000 records at a time to save memory

const migrate = async () => {
  const db = await getDb();
  console.log("📦 Setting up SQLite database...");

  // 1. Create Table (Matches your specific CSV structure)
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

  // 2. Clear old data
  await db.exec("DELETE FROM sales");

  // 3. Helper function to insert a batch of rows
  const insertBatch = async (rows) => {
    await db.exec("BEGIN TRANSACTION");
    const stmt = await db.prepare(`
      INSERT INTO sales (
        transaction_id, date, customer_id, customer_name, phone_number, gender, age, 
        customer_region, customer_type, product_id, product_name, brand, product_category, 
        tags, quantity, price_per_unit, discount_percentage, total_amount, final_amount, 
        payment_method, order_status, delivery_type, store_id, store_location, salesperson_id, employee_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const row of rows) {
      const safeFloat = (val) =>
        parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
      const safeInt = (val) =>
        parseInt(String(val).replace(/[^0-9]+/g, "")) || 0;

      await stmt.run(
        row["Transaction ID"],
        row["Date"],
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

  // 4. Stream the CSV
  console.log("📖 Streaming CSV file (Memory Safe Mode)...");

  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ File not found: ${CSV_FILE}`);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(CSV_FILE, "utf8");
  let batch = [];
  let count = 0;

  return new Promise((resolve, reject) => {
    Papa.parse(fileStream, {
      header: true,
      skipEmptyLines: true,
      step: async (results, parser) => {
        // Pause parser to write to DB
        parser.pause();

        batch.push(results.data);
        count++;

        if (batch.length >= BATCH_SIZE) {
          try {
            await insertBatch(batch);
            if (count % 50000 === 0)
              console.log(`...processed ${count} records`);
            batch = []; // Clear memory
          } catch (err) {
            console.error("Batch insert failed:", err);
            process.exit(1);
          }
        }

        // Resume parser
        parser.resume();
      },
      complete: async () => {
        // Insert any remaining rows
        if (batch.length > 0) {
          await insertBatch(batch);
        }
        console.log(`✅ Database ready! Successfully loaded ${count} records.`);
        resolve();
      },
      error: (err) => {
        reject(err);
      },
    });
  });
};

migrate().catch(console.error);
