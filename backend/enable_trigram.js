import pg from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const setupTrigram = async () => {
  try {
    await client.connect();
    console.log("Setting up Search...");
    await client.query("CREATE EXTENSION IF NOT EXISTS pg_trgm");
    await client.query("DROP INDEX IF EXISTS idx_customer_name");
    await client.query("DROP INDEX IF EXISTS idx_fast_search_name");
    console.log("⚡ Creating Trigram Index...");
    await client.query(`
      CREATE INDEX idx_trigram_search 
      ON sales 
      USING GIN (customer_name gin_trgm_ops);
    `);

    await client.query(`
      CREATE INDEX idx_trigram_phone 
      ON sales 
      USING GIN (phone_number gin_trgm_ops);
    `);

    console.log(
      "Search Upgrade Complete! You can now search for middle names."
    );
  } catch (err) {
    console.error("Setup failed:", err.message);
  } finally {
    await client.end();
  }
};

setupTrigram();
