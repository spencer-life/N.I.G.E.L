import "dotenv/config";
import { supabase } from "../database/client.js";
import { RagService } from "../services/RagService.js";

async function main() {
  // Create test doc
  const { data: doc } = await supabase
    .from("documents")
    .insert({ name: "test.md", source: "test", doc_type: "markdown", content_hash: "test", metadata: {} })
    .select()
    .single();
  
  console.log("Doc created:", doc?.id);
  
  // Generate embedding
  const embedding = await RagService.generateEmbedding("test");
  const vectorString = `[${embedding.join(',')}]`;
  
  // Try insert WITHOUT .select()
  console.log("\n1. Insert WITHOUT .select():");
  const { data: data1, error: error1 } = await supabase.from("chunks").insert({
    document_id: doc!.id,
    content: "test1",
    framework_tags: ["test"],
    token_count: 1,
    embedding: vectorString,
  });
  console.log("  Data:", data1);
  console.log("  Error:", error1);
  
  // Check count
  const { count: count1 } = await supabase.from("chunks").select("*", { count: "exact", head: true });
  console.log("  Chunks in DB:", count1);
  
  // Try insert WITH .select()
  console.log("\n2. Insert WITH .select():");
  const { data: data2, error: error2 } = await supabase.from("chunks").insert({
    document_id: doc!.id,
    content: "test2",
    framework_tags: ["test"],
    token_count: 1,
    embedding: vectorString,
  }).select();
  console.log("  Data:", data2?.length, "rows");
  console.log("  Error:", error2);
  
  // Check count
  const { count: count2 } = await supabase.from("chunks").select("*", { count: "exact", head: true });
  console.log("  Chunks in DB:", count2);
  
  // Cleanup
  await supabase.from("chunks").delete().eq("document_id", doc!.id);
  await supabase.from("documents").delete().eq("id", doc!.id);
}

main();
