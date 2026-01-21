import "dotenv/config";
import { supabase } from "../database/client.js";
import { RagService } from "../services/RagService.js";

async function main() {
  console.log("🧮 Calculating Manual Distance\n");
  
  // Get the general elicitation chunk
  const { data: chunk } = await supabase
    .from("chunks")
    .select("id, section, content, embedding")
    .eq("section", "Elicitation")
    .single();
  
  if (!chunk) {
    console.log("Chunk not found");
    process.exit(1);
  }
  
  console.log(`Chunk: ${chunk.section}`);
  console.log(`Content: ${chunk.content.substring(0, 100)}...\n`);
  
  // Generate query embedding
  const query = "what is an elicitation";
  const queryEmbedding = await RagService.generateEmbedding(query);
  
  // Get chunk embedding (might be stored as string)
  const chunkEmbedding = typeof chunk.embedding === 'string' 
    ? JSON.parse(chunk.embedding) 
    : chunk.embedding;
  
  // Calculate cosine similarity manually
  // Cosine distance = 1 - (dot product / (magnitude1 * magnitude2))
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  for (let i = 0; i < queryEmbedding.length; i++) {
    dotProduct += queryEmbedding[i] * chunkEmbedding[i];
    mag1 += queryEmbedding[i] * queryEmbedding[i];
    mag2 += chunkEmbedding[i] * chunkEmbedding[i];
  }
  
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);
  
  const cosineSimilarity = dotProduct / (mag1 * mag2);
  const cosineDistance = 1 - cosineSimilarity;
  
  console.log(`Cosine Similarity: ${(cosineSimilarity * 100).toFixed(2)}%`);
  console.log(`Cosine Distance: ${cosineDistance.toFixed(4)}`);
  console.log(`\nFor reference:`);
  console.log(`  - Disbelief chunk has distance ~0.4507 (77.5% similarity)`);
  console.log(`  - Match threshold being used: ${2 * (1 - 0.5)} = 1.0`);
  
  if (cosineDistance > 1.0) {
    console.log(`\n❌ This chunk FAILS the default threshold! (distance ${cosineDistance.toFixed(4)} > 1.0)`);
    console.log(`   That's why it's not being retrieved.`);
  } else {
    console.log(`\n✅ This chunk PASSES the default threshold.`);
  }
  
  process.exit(0);
}

main().catch(console.error);
