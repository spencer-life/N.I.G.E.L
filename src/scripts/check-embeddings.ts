import "dotenv/config";
import { supabase } from "../database/client.js";

async function main() {
  console.log("🔍 Checking embeddings in database\n");
  
  // Check a specific 6MX chunk
  const { data: doc } = await supabase
    .from("documents")
    .select("id")
    .eq("name", "6mx.md")
    .single();
  
  if (!doc) {
    console.log("❌ 6mx.md document not found");
    return;
  }
  
  const { data: chunks } = await supabase
    .from("chunks")
    .select("id, section, embedding")
    .eq("document_id", doc.id)
    .limit(3);
  
  if (!chunks || chunks.length === 0) {
    console.log("❌ No chunks found for 6mx.md");
    return;
  }
  
  console.log(`Found ${chunks.length} chunks for 6mx.md:\n`);
  
  chunks.forEach((chunk, idx) => {
    console.log(`${idx + 1}. Section: "${chunk.section}"`);
    console.log(`   Embedding: ${chunk.embedding ? `EXISTS (${(chunk.embedding as any).length || 'unknown'} dimensions)` : '❌ NULL'}`);
    if (chunk.embedding) {
      const embedding = chunk.embedding as any;
      if (Array.isArray(embedding)) {
        console.log(`   Sample values: [${embedding.slice(0, 5).join(", ")}...]`);
      } else if (typeof embedding === 'string') {
        console.log(`   Type: string (length: ${embedding.length})`);
      } else {
        console.log(`   Type: ${typeof embedding}`);
      }
    }
    console.log("");
  });
  
  // Check total chunks with/without embeddings
  const { count: totalChunks } = await supabase
    .from("chunks")
    .select("*", { count: "exact", head: true });
  
  const { count: chunksWithEmbeddings } = await supabase
    .from("chunks")
    .select("*", { count: "exact", head: true })
    .not("embedding", "is", null);
  
  console.log(`\n📊 Statistics:`);
  console.log(`   Total chunks: ${totalChunks}`);
  console.log(`   Chunks with embeddings: ${chunksWithEmbeddings}`);
  console.log(`   Chunks without embeddings: ${(totalChunks || 0) - (chunksWithEmbeddings || 0)}`);
}

main().catch(console.error);
