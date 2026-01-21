import "dotenv/config";
import { RagService } from "../services/RagService.js";
import { supabase } from "../database/client.js";

async function main() {
  console.log("🧪 Testing 6MX embedding search\n");
  
  const query = "what is 6MX";
  console.log(`Query: "${query}"\n`);
  
  // Generate embedding
  const embedding = await RagService.generateEmbedding(query);
  console.log(`Embedding generated: ${embedding.length} dimensions\n`);
  
  // Try different thresholds
  const thresholds = [2.0, 1.8, 1.6, 1.4, 1.2, 1.0];
  
  for (const threshold of thresholds) {
    const { data, error } = await supabase.rpc("search_chunks", {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: 5,
    });
    
    console.log(`\nThreshold ${threshold}:`);
    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
    } else if (!data || data.length === 0) {
      console.log(`  ❌ No results`);
    } else {
      console.log(`  ✅ Found ${data.length} chunks`);
      data.forEach((chunk: any, idx: number) => {
        console.log(`     ${idx + 1}. "${chunk.section}" (distance: ${chunk.distance.toFixed(3)}, similarity: ${((1 - chunk.distance / 2) * 100).toFixed(1)}%)`);
      });
    }
  }
}

main().catch(console.error);
