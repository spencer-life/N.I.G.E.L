import "dotenv/config";
import { supabase } from "../database/client.js";

async function main() {
  console.log("🔧 Initializing RAG configuration...\n");

  // Set the default RAG threshold
  const { data, error } = await supabase
    .from("config")
    .upsert(
      {
        key: "rag_threshold",
        value: { value: 0.7 },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    )
    .select();

  if (error) {
    console.error("❌ Failed to set config:", error.message);
    process.exit(1);
  }

  console.log("✅ Configuration set successfully:");
  console.log("   Key: rag_threshold");
  console.log("   Value: 0.7 (Default confidence threshold)");
  console.log("   Distance threshold: 0.6 (2 * (1 - 0.7))");
  console.log("\nThis allows matches with cosine distance < 0.6 to pass.\n");

  process.exit(0);
}

main().catch(console.error);
