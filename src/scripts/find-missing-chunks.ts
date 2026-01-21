import "dotenv/config";
import { supabase } from "../database/client.js";
import { RagService } from "../services/RagService.js";

async function main() {
  console.log("🔍 Finding Missing Elicitation Chunks\n");
  
  // Get the general elicitation chunk directly
  const { data: generalChunk } = await supabase
    .from("chunks")
    .select("*")
    .eq("section", "Elicitation")
    .single();
  
  if (!generalChunk) {
    console.log("❌ 'Elicitation' chunk not found in database!");
    process.exit(1);
  }
  
  console.log("✅ Found 'Elicitation' chunk (general definition)");
  console.log(`   ID: ${generalChunk.id}`);
  console.log(`   Section: ${generalChunk.section}`);
  console.log(`   Content start: ${generalChunk.content.substring(0, 150)}...\n`);
  
  // Generate query embedding
  const query = "what is an elicitation";
  const queryEmbedding = await RagService.generateEmbedding(query);
  
  // Calculate similarity manually by querying with no threshold
  const { data: searchResults } = await supabase.rpc("search_chunks", {
    query_embedding: queryEmbedding,
    match_threshold: 10.0, // Extremely permissive - return everything
    match_count: 100
  });
  
  console.log(`Search returned ${searchResults?.length || 0} total chunks\n`);
  
  // Find the general elicitation chunk in results
  const generalInResults = searchResults?.find((r: any) => r.section === "Elicitation");
  
  if (generalInResults) {
    const similarity = (1 - generalInResults.distance / 2) * 100;
    console.log("✅ 'Elicitation' chunk WAS found in search results!");
    console.log(`   Similarity: ${similarity.toFixed(1)}%`);
    console.log(`   Distance: ${generalInResults.distance.toFixed(4)}`);
    console.log(`   Rank: ${searchResults.findIndex((r: any) => r.section === "Elicitation") + 1} out of ${searchResults.length}`);
  } else {
    console.log("❌ 'Elicitation' chunk NOT found in search results!");
    console.log("   This suggests an embedding or search function issue");
  }
  
  // Also check "Elicitation (General)"
  const { data: generalChunk2 } = await supabase
    .from("chunks")
    .select("*")
    .eq("section", "Elicitation (General)")
    .single();
  
  if (generalChunk2) {
    console.log("\n✅ Found 'Elicitation (General)' chunk");
    const generalInResults2 = searchResults?.find((r: any) => r.section === "Elicitation (General)");
    
    if (generalInResults2) {
      const similarity = (1 - generalInResults2.distance / 2) * 100;
      console.log(`   Similarity: ${similarity.toFixed(1)}%`);
      console.log(`   Rank: ${searchResults.findIndex((r: any) => r.section === "Elicitation (General)") + 1} out of ${searchResults.length}`);
    } else {
      console.log("   ❌ NOT found in search results");
    }
  }
  
  process.exit(0);
}

main().catch(console.error);
