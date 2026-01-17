import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();
console.log("Testing Neon.tech connection...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");

// Clean the URL - remove any quotes
let dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  // Remove surrounding quotes if present
  dbUrl = dbUrl.replace(/^['"]|['"]$/g, "");
  console.log("Cleaned URL:", dbUrl.substring(0, 50) + "...");
}

const pool = new Pool({
  connectionString: dbUrl,
});

async function testConnection() {
  try {
    console.log("\nAttempting to connect...");
    const client = await pool.connect();
    console.log("✅ Connected to Neon.tech!");

    // Test query
    const result = await client.query("SELECT current_database(), current_user, version()");
    console.log("\nConnection details:");
    console.log("- Database:", result.rows[0].current_database);
    console.log("- User:", result.rows[0].current_user);
    console.log("- PostgreSQL:", result.rows[0].version.substring(0, 50) + "...");

    // Check if uuid-ossp extension exists
    try {
      const extResult = await client.query(`
        SELECT EXISTS(
          SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
        ) as has_uuid_ossp
      `);
      console.log(
        "- UUID-OSSP extension:",
        extResult.rows[0].has_uuid_ossp ? "Available" : "Not available"
      );

      if (!extResult.rows[0].has_uuid_ossp) {
        console.log(
          "⚠️  Note: Some Neon instances have uuid-ossp pre-installed. We'll use gen_random_uuid() instead."
        );
      }
    } catch (extError) {
      console.log("- UUID-OSSP check failed:", extError.message);
    }

    client.release();
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.error("\nTroubleshooting steps:");
    console.log("1. Check if your Neon.tech database is running");
    console.log("2. Verify your connection string in .env");
    console.log("3. Make sure IP is allowed in Neon.tech network settings");
    console.log('4. Try removing "channel_binding=require" from URL');
  } finally {
    await pool.end();
  }
}

testConnection();
