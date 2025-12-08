import { connectToDatabase, closeConnection } from "../utils/mongoClient.js";
import Papa from "papaparse";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLLECTION_NAME = "sales";
const BATCH_SIZE = 1000;

const uploadCSV = async () => {
  try {
    console.log("🚀 Starting CSV upload to MongoDB...");

    const db = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const count = await collection.countDocuments();
    if (count > 0) {
      console.log(`⚠️ Collection has ${count} records. Deleting...`);
      await collection.deleteMany({});
    }

    const csvPath = path.join(__dirname, "../../src/data/sales_data.csv");

    const fileContent = fs.readFileSync(csvPath, "utf8");
    const totalLines = fileContent.split("\n").length;
    console.log(`📄 CSV file has ${totalLines} total lines (including header)`);

    const fileStream = fs.createReadStream(csvPath);

    console.log("📊 Parsing CSV in batches...");

    let batch = [];
    let totalRecords = 0;
    let batchNumber = 0;
    let errorCount = 0;
    let skippedRows = 0;

    Papa.parse(fileStream, {
      header: true,
      skipEmptyLines: true,
      step: async (result, parser) => {
        if (result.errors && result.errors.length > 0) {
          errorCount++;
          if (errorCount <= 5) {
            console.warn(
              `⚠️ Parse error at row ${totalRecords + skippedRows}:`,
              result.errors[0].message
            );
          }
          return;
        }

        const record = result.data;
        if (!record["Transaction ID"] || !record["Date"]) {
          skippedRows++;
          if (skippedRows <= 5) {
            console.warn(
              `⚠️ Skipping invalid row ${
                totalRecords + skippedRows
              }: Missing required fields`
            );
          }
          return;
        }

        const document = {
          transaction_id: record["Transaction ID"],
          date: record["Date"],
          customer_id: record["Customer ID"],
          customer_name: record["Customer Name"],
          phone_number: record["Phone Number"],
          gender: record["Gender"],
          age: parseInt(record["Age"]) || 0,
          customer_region: record["Customer Region"],
          customer_type: record["Customer Type"],
          product_id: record["Product ID"],
          product_name: record["Product Name"],
          brand: record["Brand"],
          product_category: record["Product Category"],
          tags: record["Tags"],
          quantity: parseInt(record["Quantity"]) || 0,
          price_per_unit: parseFloat(record["Price per Unit"]) || 0,
          discount_percentage: parseFloat(record["Discount Percentage"]) || 0,
          total_amount: parseFloat(record["Total Amount"]) || 0,
          final_amount: parseFloat(record["Final Amount"]) || 0,
          payment_method: record["Payment Method"],
          order_status: record["Order Status"],
          delivery_type: record["Delivery Type"],
          store_id: record["Store ID"],
          store_location: record["Store Location"],
          salesperson_id: record["Salesperson ID"],
          employee_name: record["Employee Name"],
        };

        batch.push(document);
        if (batch.length >= BATCH_SIZE) {
          parser.pause();
          batchNumber++;

          try {
            const result = await collection.insertMany(batch);
            totalRecords += result.insertedCount;
            console.log(
              `✅ Batch ${batchNumber}: ${result.insertedCount} records (Total: ${totalRecords})`
            );
          } catch (insertError) {
            console.error(
              `❌ Error inserting batch ${batchNumber}:`,
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
            const result = await collection.insertMany(batch);
            totalRecords += result.insertedCount;
            console.log(
              `✅ Final batch ${batchNumber}: ${result.insertedCount} records`
            );
          } catch (insertError) {
            console.error(
              `❌ Error inserting final batch:`,
              insertError.message
            );
          }
        }

        console.log("\n📊 Upload Summary:");
        console.log(`✅ Total records uploaded: ${totalRecords}`);
        console.log(`⚠️ Rows skipped: ${skippedRows}`);
        console.log(`❌ Parse errors: ${errorCount}`);
        console.log(
          `📄 Expected records: ${totalLines - 1} (file lines - header)`
        );

        if (totalRecords < totalLines - 1) {
          console.log(
            `\n⚠️ WARNING: ${totalLines - 1 - totalRecords} records missing!`
          );
        }

        console.log("\n🔍 Creating indexes...");
        await collection.createIndex({ customer_name: 1 });
        await collection.createIndex({ phone_number: 1 });
        await collection.createIndex({ date: -1 });
        await collection.createIndex({ customer_region: 1 });
        await collection.createIndex({ product_category: 1 });

        console.log("✅ Upload complete!");

        await closeConnection();
        process.exit(0);
      },
      error: (error) => {
        console.error("❌ CSV parsing error:", error);
        throw error;
      },
    });
  } catch (error) {
    console.error("❌ Upload failed:", error);
    await closeConnection();
    process.exit(1);
  }
};

uploadCSV();
