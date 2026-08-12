import mysql from "mysql2/promise";
import { execSync } from "child_process";

export async function ensureDatabaseExists() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("❌ DATABASE_URL environment variable is not defined in .env");
    return;
  }

  try {
    // Parse DATABASE_URL (mysql://user:pass@host:port/dbname)
    const url = new URL(dbUrl);
    const host = url.hostname || "localhost";
    const port = parseInt(url.port || "3306", 10);
    const user = decodeURIComponent(url.username || "root");
    const password = decodeURIComponent(url.password || "");
    const dbName = url.pathname.replace(/^\//, "");

    if (!dbName) {
      console.error("❌ Database name not specified in DATABASE_URL");
      return;
    }

    // Connect to MySQL server without selecting specific DB
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    // Create database dynamically if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    console.log(`✅ MySQL Database '${dbName}' verified/created successfully at runtime.`);

    // Sync Prisma schema automatically (create tables)
    try {
      execSync("npx prisma db push --skip-generate", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log("✅ Prisma Schema tables synced successfully.");
    } catch (pushErr) {
      console.warn("⚠️ Prisma db push failed during startup:", pushErr);
    }
  } catch (error: any) {
    console.error("❌ Runtime Database Initialization Error:", error.message || error);
    if (error.code === "ER_ACCESS_DENIED_ERROR" || error.message.includes("Authentication failed")) {
      console.error("💡 Check your MySQL root password in backend/.env file.");
    }
  }
}
