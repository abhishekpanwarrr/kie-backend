import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query, pool } from "../src/config/database.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  try {
    console.log("Starting database migrations...");

    // Read migration files in order
    const migrationsDir = path.join(__dirname, "../migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      // Split SQL by semicolon and execute each statement
      const statements = sql.split(";").filter((stmt) => stmt.trim() !== "");

      for (const statement of statements) {
        if (statement.trim()) {
          await query(statement);
        }
      }
    }

    console.log("✅ All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations();
