import "dotenv/config";
import { RagService } from "../services/RagService.js";
import { supabase } from "../database/client.js";

async function main() {
  console.log("🔍 Debugging Elicitation Search Rankings\n");
  
  const query = "what is an elicitation";
  console.log(`Query: "${query}"\n`);
  
  // Get embedding
  const embedding = await RagService.generateEmbedding(query);
  
  // Search with very low threshold to get ALL elicitation chunks
  const { data: allResults } = await supabase.rpc("search_chunks", {
    query_embedding: embedding,
    match_threshold: 2.0, // Very permissive
    match_count: 50
  });
  
  // Filter to only Elicitation chunks
  const elicitationChunks = allResults
    .filter((r: any) => r.framework_tags.includes("Elicitation"))
    .map((r: any) => ({
      section: r.section,
      distance: r.distance,
      similarity: (1 - r.distance / 2) * 100,
      contentStart: r.content.substring(0, 100)
    }));
  
  console.log(`Found ${elicitationChunks.length} Elicitation chunks:\n`);
  
  elicitationChunks
    .sort((a, b) => a.distance - b.distance)
    .forEach((chunk, i) => {
      const marker = (chunk.section === "Elicitation" || chunk.section === "Elicitation (General)") ? "⭐" : "  ";
      console.log(`${marker} ${i + 1}. ${chunk.section || "N/A"}`);
      console.log(`     Similarity: ${chunk.similarity.toFixed(1)}% | Distance: ${chunk.distance.toFixed(4)}`);
      console.log(`     Content: ${chunk.contentStart}...`);
      console.log();
    });
  
  process.exit(0);
}

main().catch(console.error);
