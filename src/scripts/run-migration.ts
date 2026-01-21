import "dotenv/config";
import { readFile } from "fs/promises";
import { supabase } from "../database/client.js";

async function main() {
  const migrationFile = process.argv[2];
  
  if (!migrationFile) {
    console.error("Usage: npx tsx src/scripts/run-migration.ts <migration-file>");
    process.exit(1);
  }
  
  console.log(`📦 Running migration: ${migrationFile}`);
  
  try {
    const sql = await readFile(migrationFile, "utf-8");
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      // If exec_sql doesn't exist, try direct execution (might not work)
      console.log("⚠️  exec_sql function not available, trying alternative method...");
      
      // Split by semicolons and execute each statement
      const statements = sql.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          // This won't work for CREATE FUNCTION, need to use Supabase Dashboard
          console.log("❌ Cannot execute migrations programmatically without exec_sql function");
          console.log("\n📝 Please run this SQL manually in Supabase SQL Editor:");
          console.log("\n" + "=".repeat(80));
          console.log(sql);
          console.log("=".repeat(80));
          return;
        }
      }
      
      return { error: null };
    });
    
    if (error) {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    }
    
    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
