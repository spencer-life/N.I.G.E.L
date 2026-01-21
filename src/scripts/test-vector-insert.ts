import "dotenv/config";
import { supabase } from "../database/client.js";
import { RagService } from "../services/RagService.js";

async function main() {
  console.log("🧪 Testing vector insertion\n");
  
  // Create a test document
  const { data: doc } = await supabase
    .from("documents")
    .insert({
      name: "test.md",
      source: "test",
      doc_type: "markdown",
      content_hash: "test123",
      metadata: {},
    })
    .select()
    .single();
  
  console.log("✅ Created test document:", doc?.id);
  
  // Generate embedding
  const embedding = await RagService.generateEmbedding("This is a test");
  console.log("✅ Generated embedding:", embedding.length, "dimensions");
  
  // Try to insert with vector string
  const vectorString = `[${embedding.join(',')}]`;
  console.log("Vector string length:", vectorString.length);
  
  const { data: chunk, error } = await supabase
    .from("chunks")
    .insert({
      document_id: doc!.id,
      content: "This is a test",
      framework_tags: ["test"],
      token_count: 4,
      embedding: vectorString,
    })
    .select();
  
  if (error) {
    console.error("❌ Insert error:", error);
  } else {
    console.log("✅ Chunk inserted:", chunk);
    
    // Check if it was stored correctly
    const { data: retrieved } = await supabase
      .from("chunks")
      .select("id, embedding")
      .eq("id", chunk[0].id)
      .single();
    
    console.log("✅ Retrieved chunk, embedding type:", typeof retrieved?.embedding);
    
    // Try vector search
    const { data: searchResult, error: searchError } = await supabase.rpc("search_chunks", {
      query_embedding: embedding,
      match_threshold: 1.0,
      match_count: 5,
    });
    
    if (searchError) {
      console.error("❌ Search error:", searchError);
    } else {
      console.log("✅ Search results:", searchResult?.length, "chunks found");
      if (searchResult && searchResult.length > 0) {
        console.log("   First result distance:", searchResult[0].distance);
      }
    }
  }
  
  // Cleanup
  await supabase.from("chunks").delete().eq("document_id", doc!.id);
  await supabase.from("documents").delete().eq("id", doc!.id);
  console.log("\n✅ Cleanup complete");
}

main().catch(console.error);
