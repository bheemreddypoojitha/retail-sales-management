import {
  getDatabase,
  initializeDatabase,
  getRecordCount,
  closeDatabase,
} from "../utils/database.js";
import Papa from "papaparse";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadCSVToDatabase = async () => {
  try {
    console.log("🚀 Starting CSV upload to SQLite...");

    // Initialize database
    await initializeDatabase();
    const db = await getDatabase();

    // Check if data already exists
    const existingCount = await getRecordCount();
    if (existingCount > 0) {
      console.log(`⚠️ Database already has ${existingCount} records`);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        rl.question(
          "Delete existing data and re-upload? (yes/no): ",
          async (answer) => {
            rl.close();
            if (answer.toLowerCase() !== "yes") {
              console.log("❌ Upload cancelled");
              await closeDatabase();
              process.exit(0);
            }

            console.log("🗑️ Deleting existing data...");
            await new Promise((res, rej) => {
              db.run("DELETE FROM sales", (err) => {
                if (err) rej(err);
                else res();
              });
            });
            console.log("✅ Existing data deleted");

            await performUpload(db);
            resolve();
          }
        );
      });
    } else {
      await performUpload(db);
    }
  } catch (error) {
    console.error("❌ Upload failed:", error);
    await closeDatabase();
    process.exit(1);
  }
};

const performUpload = async (db) => {
  // Read CSV file
  console.log("📂 Reading CSV file...");
  const csvPath = path.join(__dirname, "../../src/data/sales_data.csv");

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }

  const fileContent = fs.readFileSync(csvPath, "utf8");

  // Parse CSV
  console.log("📊 Parsing CSV...");
  Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      console.log(`✅ Parsed ${results.data.length} records`);

      // Prepare insert statement
      const insertSql = `
        INSERT INTO sales (
          transaction_id, date, customer_id, customer_name, phone_number,
          gender, age, customer_region, customer_type, product_id,
          product_name, brand, product_category, tags, quantity,
          price_per_unit, discount_percentage, total_amount, final_amount,
          payment_method, order_status, delivery_type, store_id,
          store_location, salesperson_id, employee_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      console.log("⬆️ Uploading to database...");

      // Use transaction for better performance
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run("BEGIN TRANSACTION");

          const stmt = db.prepare(insertSql);

          let count = 0;
          for (const record of results.data) {
            stmt.run(
              [
                record["Transaction ID"],
                record["Date"],
                record["Customer ID"],
                record["Customer Name"],
                record["Phone Number"],
                record["Gender"],
                parseInt(record["Age"]) || 0,
                record["Customer Region"],
                record["Customer Type"],
                record["Product ID"],
                record["Product Name"],
                record["Brand"],
                record["Product Category"],
                record["Tags"],
                parseInt(record["Quantity"]) || 0,
                parseFloat(record["Price per Unit"]) || 0,
                parseFloat(record["Discount Percentage"]) || 0,
                parseFloat(record["Total Amount"]) || 0,
                parseFloat(record["Final Amount"]) || 0,
                record["Payment Method"],
                record["Order Status"],
                record["Delivery Type"],
                record["Store ID"],
                record["Store Location"],
                record["Salesperson ID"],
                record["Employee Name"],
              ],
              (err) => {
                if (err) {
                  console.error("Error inserting record:", err);
                }
              }
            );

            count++;
            if (count % 100 === 0) {
              console.log(
                `   Uploaded ${count}/${results.data.length} records...`
              );
            }
          }

          stmt.finalize();

          db.run("COMMIT", async (err) => {
            if (err) {
              console.error("❌ Error committing transaction:", err);
              return reject(err);
            }

            const finalCount = await getRecordCount();
            console.log("✅ Upload complete!");
            console.log(`📊 Total records in database: ${finalCount}`);

            await closeDatabase();
            resolve();
            process.exit(0);
          });
        });
      });
    },
    error: (error) => {
      console.error("❌ CSV parsing error:", error);
      process.exit(1);
    },
  });
};

// Run the upload
uploadCSVToDatabase();
