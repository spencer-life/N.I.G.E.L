import "dotenv/config";
import { supabase } from "../database/client.js";

async function main() {
  const { data } = await supabase
    .from("chunks")
    .select("section, content")
    .eq("section", "Elicitation")
    .single();
  
  console.log("=".repeat(80));
  console.log("GENERAL ELICITATION CHUNK CONTENT:");
  console.log("=".repeat(80));
  console.log(data?.content || "Not found");
  console.log("=".repeat(80));
  console.log(`\nLength: ${data?.content?.length || 0} characters`);
  
  process.exit(0);
}

main().catch(console.error);
