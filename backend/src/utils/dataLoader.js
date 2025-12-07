import { getDatabase, initializeDatabase } from "./database.js";

export const loadSalesData = async () => {
  try {
    const db = await getDatabase();
    const result = db.exec("SELECT * FROM sales");

    if (!result || result.length === 0) {
      console.log("⚠️ No data found in database");
      return [];
    }

    const columns = result[0].columns;
    const values = result[0].values;

    const data = values.map((row) => {
      const obj = {};
      columns.forEach((col, i) => {
        const mapping = {
          transaction_id: "Transaction ID",
          date: "Date",
          customer_id: "Customer ID",
          customer_name: "Customer Name",
          phone_number: "Phone Number",
          gender: "Gender",
          age: "Age",
          customer_region: "Customer Region",
          customer_type: "Customer Type",
          product_id: "Product ID",
          product_name: "Product Name",
          brand: "Brand",
          product_category: "Product Category",
          tags: "Tags",
          quantity: "Quantity",
          price_per_unit: "Price per Unit",
          discount_percentage: "Discount Percentage",
          total_amount: "Total Amount",
          final_amount: "Final Amount",
          payment_method: "Payment Method",
          order_status: "Order Status",
          delivery_type: "Delivery Type",
          store_id: "Store ID",
          store_location: "Store Location",
          salesperson_id: "Salesperson ID",
          employee_name: "Employee Name",
        };

        const csvColName = mapping[col] || col;
        obj[csvColName] = row[i] !== null ? row[i].toString() : "";
      });
      return obj;
    });

    console.log(`📊 Loaded ${data.length} records from SQLite`);
    return data;
  } catch (error) {
    console.error("❌ Error loading from SQLite:", error);
    throw new Error("Failed to load sales data from database");
  }
};


export const getFilterOptionsFromDB = async () => {
  try {
    const db = await getDatabase();

    const getDistinct = (column) => {
      const result = db.exec(
        `SELECT DISTINCT ${column} FROM sales WHERE ${column} IS NOT NULL ORDER BY ${column}`
      );
      if (result.length > 0) {
        return result[0].values.map((row) => row[0]);
      }
      return [];
    };

    const customerRegions = getDistinct("customer_region");
    const genders = getDistinct("gender");
    const productCategories = getDistinct("product_category");
    const paymentMethods = getDistinct("payment_method");
    const orderStatuses = getDistinct("order_status");
    const deliveryTypes = getDistinct("delivery_type");

    const ageResult = db.exec(
      "SELECT MIN(age) as min, MAX(age) as max FROM sales"
    );
    const ageRange = {
      min: ageResult[0]?.values[0]?.[0] || 18,
      max: ageResult[0]?.values[0]?.[1] || 100,
    };

    const tagsResult = db.exec(
      "SELECT DISTINCT tags FROM sales WHERE tags IS NOT NULL"
    );
    const tagsSet = new Set();
    if (tagsResult.length > 0) {
      tagsResult[0].values.forEach((row) => {
        if (row[0]) {
          row[0].split(",").forEach((tag) => {
            const trimmed = tag.trim();
            if (trimmed) tagsSet.add(trimmed);
          });
        }
      });
    }

    return {
      customerRegions,
      genders,
      productCategories,
      tags: Array.from(tagsSet).sort(),
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

export const clearCache = () => {
  console.log("ℹ️ Cache clearing not needed with SQLite");
};
