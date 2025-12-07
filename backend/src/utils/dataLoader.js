import fs from "fs";
import Papa from "papaparse";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedData = null;
let isLoading = false;
let loadPromise = null;

export const loadSalesData = async () => {
  // Return cached data if available
  if (cachedData) {
    console.log(
      "📦 Returning cached data (" +
        cachedData.length.toLocaleString() +
        " records)"
    );
    return cachedData;
  }

  if (isLoading && loadPromise) {
    console.log("⏳ CSV load already in progress, waiting...");
    return await loadPromise;
  }

  const csvPath = path.join(__dirname, "../data/sales_data.csv");

  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    try {
      console.log("📂 Loading CSV from:", csvPath);

      if (!fs.existsSync(csvPath)) {
        throw new Error(
          "CSV file not found. Please add sales_data.csv to backend/src/data/"
        );
      }

      const stats = fs.statSync(csvPath);
      const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`📊 File size: ${fileSizeMB} MB`);
      console.log(
        "🔄 Parsing CSV... (this may take 30-60 seconds for large files)"
      );

      const startTime = Date.now();
      const fileContent = fs.readFileSync(csvPath, "utf8");

      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, 
        worker: false, 
        complete: (results) => {
          const endTime = Date.now();
          const duration = ((endTime - startTime) / 1000).toFixed(2);

          if (results.errors.length > 0) {
            console.warn("⚠️ CSV parsing warnings (first 5):");
            results.errors.slice(0, 5).forEach((err) => {
              console.warn(`  - Row ${err.row}: ${err.message}`);
            });
          }

          cachedData = results.data;
          isLoading = false;
          const memUsage = process.memoryUsage();
          const memUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
          const memTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);

          console.log("CSV loaded successfully!");
          console.log(`Records: ${cachedData.length.toLocaleString()}`);
          console.log(`Parse time: ${duration}s`);
          console.log(`Memory: ${memUsedMB} MB / ${memTotalMB} MB`);

          resolve(cachedData);
        },
        error: (error) => {
          console.error("❌ CSV parsing error:", error);
          isLoading = false;
          reject(error);
        },
      });
    } catch (error) {
      console.error("❌ Error loading CSV:", error.message);
      isLoading = false;
      reject(error);
    }
  });

  return await loadPromise;
};


export const clearCache = () => {
  const recordCount = cachedData ? cachedData.length : 0;
  cachedData = null;
  loadPromise = null;
  isLoading = false;
  if (global.gc) {
    global.gc();
  }

  console.log(
    `🗑️  Cache cleared (${recordCount.toLocaleString()} records freed)`
  );
};


export const getMemoryStats = () => {
  const memUsage = process.memoryUsage();
  return {
    heapUsed: (memUsage.heapUsed / 1024 / 1024).toFixed(2) + " MB",
    heapTotal: (memUsage.heapTotal / 1024 / 1024).toFixed(2) + " MB",
    rss: (memUsage.rss / 1024 / 1024).toFixed(2) + " MB",
    cached: cachedData
      ? cachedData.length.toLocaleString() + " records"
      : "No data cached",
  };
};
