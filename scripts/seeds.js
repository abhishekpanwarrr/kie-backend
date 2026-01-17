import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query, pool } from "../src/config/database.js";
import { hashPassword } from "../src/utils/helpers.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
  try {
    console.log("Seeding database...");

    // Read seed files
    const seedPath = path.join(__dirname, "../seeds/initial_data.sql");
    const sql = fs.readFileSync(seedPath, "utf8");

    // Split and execute SQL
    const statements = sql.split(";").filter((stmt) => stmt.trim() !== "");

    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement);
      }
    }

    // Create admin user with actual hashed password
    const hashedPassword = await hashPassword("Admin123!");
    await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING`,
      ["admin@shoppingapp.com", hashedPassword, "Admin", "User", "admin", true, true]
    );

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedDatabase();
