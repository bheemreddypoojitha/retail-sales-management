import { getDatabase } from "./database.js";

/**
 * Load sales data from SQLite
 */
export const loadSalesData = async () => {
  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM sales", (err, rows) => {
        if (err) {
          console.error("❌ Error loading data:", err);
          return reject(err);
        }

        // Convert database format to CSV format for compatibility
        const data = rows.map((row) => ({
          "Transaction ID": row.transaction_id,
          Date: row.date,
          "Customer ID": row.customer_id,
          "Customer Name": row.customer_name,
          "Phone Number": row.phone_number,
          Gender: row.gender,
          Age: row.age?.toString(),
          "Customer Region": row.customer_region,
          "Customer Type": row.customer_type,
          "Product ID": row.product_id,
          "Product Name": row.product_name,
          Brand: row.brand,
          "Product Category": row.product_category,
          Tags: row.tags,
          Quantity: row.quantity?.toString(),
          "Price per Unit": row.price_per_unit?.toString(),
          "Discount Percentage": row.discount_percentage?.toString(),
          "Total Amount": row.total_amount?.toString(),
          "Final Amount": row.final_amount?.toString(),
          "Payment Method": row.payment_method,
          "Order Status": row.order_status,
          "Delivery Type": row.delivery_type,
          "Store ID": row.store_id,
          "Store Location": row.store_location,
          "Salesperson ID": row.salesperson_id,
          "Employee Name": row.employee_name,
        }));

        console.log(`📊 Loaded ${data.length} records from SQLite`);
        resolve(data);
      });
    });
  } catch (error) {
    console.error("❌ Error loading from SQLite:", error);
    throw new Error("Failed to load sales data from database");
  }
};

/**
 * Get filter options from database
 */
export const getFilterOptionsFromDB = async () => {
  try {
    const db = await getDatabase();

    const getDistinct = (column) => {
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT DISTINCT ${column} FROM sales WHERE ${column} IS NOT NULL ORDER BY ${column}`,
          (err, rows) => {
            if (err) return reject(err);
            resolve(rows.map((row) => row[column]));
          }
        );
      });
    };

    const getAgeRange = () => {
      return new Promise((resolve, reject) => {
        db.get(
          "SELECT MIN(age) as min, MAX(age) as max FROM sales",
          (err, row) => {
            if (err) return reject(err);
            resolve({ min: row.min || 18, max: row.max || 100 });
          }
        );
      });
    };

    const getTags = () => {
      return new Promise((resolve, reject) => {
        db.all(
          "SELECT DISTINCT tags FROM sales WHERE tags IS NOT NULL",
          (err, rows) => {
            if (err) return reject(err);

            const tagsSet = new Set();
            rows.forEach((row) => {
              if (row.tags) {
                row.tags.split(",").forEach((tag) => {
                  const trimmed = tag.trim();
                  if (trimmed) tagsSet.add(trimmed);
                });
              }
            });

            resolve(Array.from(tagsSet).sort());
          }
        );
      });
    };

    // Get all filter options in parallel
    const [
      customerRegions,
      genders,
      productCategories,
      paymentMethods,
      orderStatuses,
      deliveryTypes,
      ageRange,
      tags,
    ] = await Promise.all([
      getDistinct("customer_region"),
      getDistinct("gender"),
      getDistinct("product_category"),
      getDistinct("payment_method"),
      getDistinct("order_status"),
      getDistinct("delivery_type"),
      getAgeRange(),
      getTags(),
    ]);

    return {
      customerRegions,
      genders,
      productCategories,
      tags,
      paymentMethods,
      orderStatuses,
      deliveryTypes,
      ageRange,
    };
  } catch (error) {
    console.error("❌ Error getting filter options:", error);
    throw error;
  }
};

/**
 * Clear cache
 */
export const clearCache = () => {
  console.log("ℹ️ Cache clearing not needed with SQLite");
};
