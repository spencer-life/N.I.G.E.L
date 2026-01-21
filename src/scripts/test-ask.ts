import "dotenv/config";
import { RagService } from "../services/RagService.js";

async function main() {
  console.log("🧪 Testing /ask command output\n");
  
  const testQueries = [
    "what is elicitation",
    "how does elicitation work",
    "what is the FATE framework",
  ];
  
  for (const query of testQueries) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Query: "${query}"`);
    console.log("=".repeat(60));
    
    try {
      // Search doctrine first
      const chunks = await RagService.searchDoctrine(query);
      console.log(`\nChunks found: ${chunks.length}`);
      
      if (chunks.length > 0) {
        console.log("\nTop 3 chunks:");
        chunks.slice(0, 3).forEach((result, idx) => {
          console.log(`\n${idx + 1}. Section: "${result.chunk.section}"`);
          console.log(`   Similarity: ${(result.similarity * 100).toFixed(1)}%`);
          console.log(`   Content preview: ${result.chunk.content.substring(0, 150)}...`);
        });
        
        // Synthesize response
        console.log("\n--- Synthesizing response ---");
        const response = await RagService.synthesizeResponse(query, chunks);
        
        console.log(`\nModel used: ${response.modelUsed}`);
        console.log(`Complexity score: ${response.complexity.score}`);
        console.log(`Extended thinking: ${response.usedThinking}`);
        console.log(`\nAnswer:\n${response.answer}`);
      } else {
        console.log("❌ No chunks found!");
      }
    } catch (error) {
      console.error("❌ Error:", error instanceof Error ? error.message : error);
    }
  }
}

main().catch(console.error);
