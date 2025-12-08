import { query, closePool } from "../utils/db.js";

const setupDatabase = async () => {
  try {
    console.log("🚀 Setting up database...");

    await query("DROP TABLE IF EXISTS sales CASCADE");

    await query(`
      CREATE TABLE sales (
        id SERIAL PRIMARY KEY,
        transaction_id VARCHAR(50),
        date VARCHAR(20),
        customer_id VARCHAR(50),
        customer_name VARCHAR(255),
        phone_number VARCHAR(20),
        gender VARCHAR(10),
        age INTEGER,
        customer_region VARCHAR(100),
        customer_type VARCHAR(50),
        product_id VARCHAR(50),
        product_name VARCHAR(255),
        brand VARCHAR(100),
        product_category VARCHAR(100),
        tags TEXT,
        quantity INTEGER,
        price_per_unit NUMERIC(10,2),
        discount_percentage NUMERIC(5,2),
        total_amount NUMERIC(10,2),
        final_amount NUMERIC(10,2),
        payment_method VARCHAR(50),
        order_status VARCHAR(50),
        delivery_type VARCHAR(50),
        store_id VARCHAR(50),
        store_location VARCHAR(255),
        salesperson_id VARCHAR(50),
        employee_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Table created successfully!");

    // Create indexes for faster queries
    console.log("🔍 Creating indexes...");
    await query("CREATE INDEX idx_customer_name ON sales(customer_name)");
    await query("CREATE INDEX idx_phone_number ON sales(phone_number)");
    await query("CREATE INDEX idx_date ON sales(date)");
    await query("CREATE INDEX idx_customer_region ON sales(customer_region)");
    await query("CREATE INDEX idx_product_category ON sales(product_category)");

    console.log("✅ Indexes created!");
    console.log("✅ Database setup complete!");

    await closePool();
    process.exit(0);
  } catch (error) {
    console.error("❌ Setup failed:", error);
    await closePool();
    process.exit(1);
  }
};

setupDatabase();
