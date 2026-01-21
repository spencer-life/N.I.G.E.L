import "dotenv/config";
import { RagService } from "../services/RagService.js";

async function main() {
  console.log("🎯 Final Test: User's Original Query\n");
  
  const query = "what is an elicitation";
  console.log(`Query: "${query}"\n`);
  
  const response = await RagService.ask(query);
  
  console.log("=" .repeat(80));
  console.log("NIGEL's Response:");
  console.log("=" .repeat(80));
  console.log(response.answer);
  console.log("=" .repeat(80));
  console.log(`\nConfidence: ${(response.confidence * 100).toFixed(1)}%`);
  console.log(`Sources: ${response.sources.length} chunks`);
  
  // Check for the error
  const hasQuestionError = response.answer.toLowerCase().includes("as a question") || 
                           response.answer.toLowerCase().includes("weaponized as a question");
  
  const hasCorrectDefinition = response.answer.toLowerCase().includes("without asking direct questions") ||
                                response.answer.toLowerCase().includes("statements instead of questions");
  
  console.log("\n✅ Validation:");
  console.log(`  - Avoids "as a question" error: ${!hasQuestionError ? "✅" : "❌"}`);
  console.log(`  - Includes correct definition: ${hasCorrectDefinition ? "✅" : "❌"}`);
  
  if (!hasQuestionError && hasCorrectDefinition) {
    console.log("\n🎉 FIX SUCCESSFUL!");
  } else {
    console.log("\n⚠️  Issue may still exist");
  }
  
  process.exit(0);
}

main().catch(console.error);
