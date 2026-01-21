import "dotenv/config";
import { supabase } from "../database/client.js";

async function main() {
  console.log("🔍 Checking 6MX chunks in database\n");
  
  const { data, error } = await supabase
    .from("chunks")
    .select("id, section, framework_tags, content")
    .contains("framework_tags", ["6mx"]);
  
  if (error) {
    console.error("❌ Error:", error);
    return;
  }
  
  console.log(`Found ${data?.length || 0} chunks with '6mx' tag\n`);
  
  if (data && data.length > 0) {
    console.log("Sample chunks:");
    data.slice(0, 5).forEach((chunk, idx) => {
      console.log(`\n${idx + 1}. Section: "${chunk.section}"`);
      console.log(`   Tags: [${chunk.framework_tags.join(", ")}]`);
      console.log(`   Content preview: ${chunk.content.substring(0, 100)}...`);
    });
  }
  
  // Also check for chunks from the 6mx.md document
  const { data: docs } = await supabase
    .from("documents")
    .select("id, name")
    .eq("name", "6mx.md");
  
  if (docs && docs.length > 0) {
    const docId = docs[0].id;
    console.log(`\n\n📄 Document "6mx.md" exists with ID: ${docId}`);
    
    const { data: docChunks } = await supabase
      .from("chunks")
      .select("id, section, framework_tags")
      .eq("document_id", docId);
    
    console.log(`   Contains ${docChunks?.length || 0} chunks`);
    if (docChunks && docChunks.length > 0) {
      console.log("\n   Sections:");
      docChunks.forEach(c => {
        console.log(`   - "${c.section}" [${c.framework_tags.join(", ")}]`);
      });
    }
  } else {
    console.log("\n❌ Document '6mx.md' NOT FOUND in database!");
  }
}

main().catch(console.error);
