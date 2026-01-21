import "dotenv/config";
import { RagService } from "../services/RagService.js";

async function main() {
  console.log("🔍 Testing FATE Query\n");
  
  const query = "What is FATE, and how can I use it to change influence scenarios to my benefit";
  console.log(`Query: "${query}"\n`);
  
  const chunks = await RagService.searchDoctrine(query);
  
  console.log(`📚 Retrieved ${chunks.length} chunks:\n`);
  
  chunks.slice(0, 10).forEach((result, idx) => {
    const isFate = result.chunk.framework_tags.some(tag => 
      tag.toLowerCase().includes("fate")
    );
    const marker = isFate ? "🎯" : "  ";
    
    console.log(`${marker} ${idx + 1}. ${result.chunk.section || "N/A"}`);
    console.log(`     Similarity: ${(result.similarity * 100).toFixed(1)}%`);
    console.log(`     Tags: ${result.chunk.framework_tags.join(", ")}`);
    console.log(`     Preview: ${result.chunk.content.substring(0, 120)}...`);
    console.log();
  });
  
  console.log("\n🤖 Generating response...\n");
  const response = await RagService.synthesizeResponse(query, chunks);
  
  console.log("=" .repeat(80));
  console.log("NIGEL's Response:");
  console.log("=" .repeat(80));
  console.log(response.answer);
  console.log("=" .repeat(80));
  
  // Check for the issue
  const describesAsXray = response.answer.toLowerCase().includes("x-ray") || 
                           response.answer.toLowerCase().includes("diagnostic");
  const describesFears = response.answer.toLowerCase().includes("fear") && 
                          response.answer.toLowerCase().includes("grief");
  const describesModel = response.answer.toLowerCase().includes("evolutionary driver") ||
                          response.answer.toLowerCase().includes("hard-wired") ||
                          response.answer.toLowerCase().includes("mammalian brain");
  
  console.log("\n✅ Validation:");
  console.log(`  - Describes as diagnostic/X-ray: ${describesAsXray ? "⚠️  (might be wrong focus)" : "✅"}`);
  console.log(`  - Focuses on fears/grief: ${describesFears ? "⚠️  (sub-concept, not core)" : "✅"}`);
  console.log(`  - Describes core FATE model: ${describesModel ? "✅" : "❌ MISSING"}`);
  
  process.exit(0);
}

main().catch(console.error);
