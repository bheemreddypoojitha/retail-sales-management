import { getClient, closePool } from "../utils/db.js";
import Papa from "papaparse";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_SIZE = 1000;

const uploadCSV = async () => {
  const client = await getClient();

  try {
    console.log("🚀 Starting CSV upload to PostgreSQL...");
    const countResult = await client.query("SELECT COUNT(*) FROM sales");
    const count = parseInt(countResult.rows[0].count);

    if (count > 0) {
      console.log(`⚠️ Table has ${count} records. Clearing...`);
      await client.query("TRUNCATE TABLE sales RESTART IDENTITY");
    }

    const csvPath = path.join(__dirname, "../../src/data/sales_data.csv");

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    const fileContent = fs.readFileSync(csvPath, "utf8");
    const totalLines = fileContent.split("\n").length;
    console.log(`📄 CSV file has ${totalLines} total lines (including header)`);

    const fileStream = fs.createReadStream(csvPath);
    console.log("📊 Parsing and uploading in batches...");

    let batch = [];
    let totalRecords = 0;
    let batchNumber = 0;
    let errorCount = 0;

    Papa.parse(fileStream, {
      header: true,
      skipEmptyLines: true,
      step: async (result, parser) => {
        const r = result.data;
        if (!r["Transaction ID"]) {
          errorCount++;
          return;
        }

        batch.push([
          r["Transaction ID"],
          r["Date"],
          r["Customer ID"],
          r["Customer Name"],
          r["Phone Number"],
          r["Gender"],
          parseInt(r["Age"]) || 0,
          r["Customer Region"],
          r["Customer Type"],
          r["Product ID"],
          r["Product Name"],
          r["Brand"],
          r["Product Category"],
          r["Tags"],
          parseInt(r["Quantity"]) || 0,
          parseFloat(r["Price per Unit"]) || 0,
          parseFloat(r["Discount Percentage"]) || 0,
          parseFloat(r["Total Amount"]) || 0,
          parseFloat(r["Final Amount"]) || 0,
          r["Payment Method"],
          r["Order Status"],
          r["Delivery Type"],
          r["Store ID"],
          r["Store Location"],
          r["Salesperson ID"],
          r["Employee Name"],
        ]);

        if (batch.length >= BATCH_SIZE) {
          parser.pause();
          batchNumber++;

          try {
            const placeholders = batch
              .map((_, i) => {
                const start = i * 26 + 1;
                const nums = Array.from(
                  { length: 26 },
                  (_, j) => `$${start + j}`
                );
                return `(${nums.join(",")})`;
              })
              .join(",");

            const values = batch.flat();

            const insertQuery = `
              INSERT INTO sales (
                transaction_id, date, customer_id, customer_name, phone_number,
                gender, age, customer_region, customer_type, product_id,
                product_name, brand, product_category, tags, quantity,
                price_per_unit, discount_percentage, total_amount, final_amount,
                payment_method, order_status, delivery_type, store_id,
                store_location, salesperson_id, employee_name
              ) VALUES ${placeholders}
            `;

            await client.query(insertQuery, values);
            totalRecords += batch.length;
            console.log(
              `✅ Batch ${batchNumber}: ${batch.length} records | Total: ${totalRecords}`
            );
          } catch (insertError) {
            console.error(
              `❌ Batch ${batchNumber} failed:`,
              insertError.message
            );
          }

          batch = [];
          parser.resume();
        }
      },
      complete: async () => {
        if (batch.length > 0) {
          batchNumber++;
          try {
            const placeholders = batch
              .map((_, i) => {
                const start = i * 26 + 1;
                const nums = Array.from(
                  { length: 26 },
                  (_, j) => `$${start + j}`
                );
                return `(${nums.join(",")})`;
              })
              .join(",");

            const values = batch.flat();

            const insertQuery = `
              INSERT INTO sales (
                transaction_id, date, customer_id, customer_name, phone_number,
                gender, age, customer_region, customer_type, product_id,
                product_name, brand, product_category, tags, quantity,
                price_per_unit, discount_percentage, total_amount, final_amount,
                payment_method, order_status, delivery_type, store_id,
                store_location, salesperson_id, employee_name
              ) VALUES ${placeholders}
            `;

            await client.query(insertQuery, values);
            totalRecords += batch.length;
            console.log(`✅ Final batch: ${batch.length} records`);
          } catch (insertError) {
            console.error(`❌ Final batch failed:`, insertError.message);
          }
        }

        console.log("\n📊 Upload Summary:");
        console.log(`✅ Total uploaded: ${totalRecords} records`);
        console.log(`📄 Expected: ${totalLines - 1} records`);
        if (errorCount > 0) console.log(`⚠️ Errors: ${errorCount}`);
        console.log("✅ Upload complete!");

        client.release();
        await closePool();
        process.exit(0);
      },
      error: (error) => {
        console.error("❌ CSV parsing error:", error);
        throw error;
      },
    });
  } catch (error) {
    console.error("❌ Upload failed:", error);
    client.release();
    await closePool();
    process.exit(1);
  }
};

uploadCSV();
