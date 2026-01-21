import "dotenv/config";
import { supabase } from "../database/client.js";

async function main() {
  console.log("🔍 Checking FATE chunks in database...\n");

  const { data, error } = await supabase
    .from("chunks")
    .select("section, content, framework_tags")
    .contains("framework_tags", ["FATE"])
    .order("id");

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log("❌ No FATE chunks found in database!");
    console.log("\nLet me check the documents table...");
    
    const { data: docs } = await supabase
      .from("documents")
      .select("name, metadata")
      .ilike("name", "%fate%");
    
    console.log(`\nFATE-related documents: ${docs?.length || 0}`);
    docs?.forEach(d => {
      console.log(`  - ${d.name}`);
      console.log(`    Metadata:`, d.metadata);
    });
  } else {
    console.log(`Found ${data.length} chunks with 'FATE' tag:\n`);
    data.forEach((chunk, i) => {
      console.log(`${i + 1}. Section: ${chunk.section || "N/A"}`);
      console.log(`   Tags: ${chunk.framework_tags.join(", ")}`);
      console.log(`   Content start: ${chunk.content.substring(0, 100)}...`);
      console.log();
    });
  }

  process.exit(0);
}

main().catch(console.error);
