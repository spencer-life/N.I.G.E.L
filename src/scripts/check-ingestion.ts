import "dotenv/config";
import { supabase } from "../database/client.js";

async function main() {
  console.log("🔍 Checking database ingestion status\n");
  
  // Check total documents and chunks
  const { data: docs, error: docsError } = await supabase
    .from("documents")
    .select("id, name");
  
  if (docsError) {
    console.error("❌ Error fetching documents:", docsError);
    return;
  }
  
  console.log(`📚 Total documents: ${docs?.length || 0}\n`);
  
  if (docs && docs.length > 0) {
    console.log("Documents in database:");
    docs.forEach(doc => console.log(`  - ${doc.name}`));
  }
  
  // Check for specific topics
  console.log("\n🔎 Checking for specific content:\n");
  
  const searchTerms = ["grief", "decision pillar", "pillar"];
  
  for (const term of searchTerms) {
    const { data: chunks, error } = await supabase
      .from("chunks")
      .select("id, section, content")
      .or(`section.ilike.%${term}%,content.ilike.%${term}%`)
      .limit(5);
    
    if (error) {
      console.error(`❌ Error searching for "${term}":`, error);
      continue;
    }
    
    console.log(`"${term}" - Found ${chunks?.length || 0} chunks`);
    if (chunks && chunks.length > 0) {
      chunks.forEach(chunk => {
        console.log(`  - Section: "${chunk.section}"`);
        console.log(`    Preview: ${chunk.content.substring(0, 100)}...`);
      });
    }
    console.log("");
  }
  
  // Check total chunks
  const { count, error: countError } = await supabase
    .from("chunks")
    .select("*", { count: "exact", head: true });
  
  if (countError) {
    console.error("❌ Error counting chunks:", countError);
  } else {
    console.log(`\n📊 Total chunks in database: ${count}`);
  }
}

main().catch(console.error);
