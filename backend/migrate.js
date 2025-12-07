import fs from "fs";
import Papa from "papaparse";
import { getDb } from "./src/utils/db.js";

const CSV_FILE = "./src/data/sales_data.csv";

const migrate = async () => {
  const db = await getDb();
  console.log("📦 Setting up SQLite database...");

  // 1. Create Table matching your CSV columns
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

  // 2. Clear old data to prevent duplicates
  await db.exec("DELETE FROM sales");

  // 3. Read & Insert Data
  console.log("📖 Reading CSV...");
  const fileContent = fs.readFileSync(CSV_FILE, "utf8");

  Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      console.log(`🚀 Inserting ${results.data.length} records...`);
      await db.exec("BEGIN TRANSACTION");

      const stmt = await db.prepare(`
        INSERT INTO sales (
          transaction_id, date, customer_id, customer_name, phone_number, gender, age, 
          customer_region, customer_type, product_id, product_name, brand, product_category, 
          tags, quantity, price_per_unit, discount_percentage, total_amount, final_amount, 
          payment_method, order_status, delivery_type, store_id, store_location, salesperson_id, employee_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const row of results.data) {
        // Safe number parsing
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
      console.log("✅ Migration Complete! Database ready.");
    },
  });
};

migrate().catch(console.error);
