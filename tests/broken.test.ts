import "dotenv/config";
import { RagService } from "../src/services/RagService.js";

async function main() {
  console.log("🧪 Testing Subagent Intelligence: Failure Scenario");
  
  // INTENTIONAL BUG: We are testing a query that we expect to FAIL 
  // or we use a confidence threshold that is impossible to meet.
  const query = "how to bake a cake"; // Not in doctrine
  console.log(`Query: "${query}"\n`);
  
  const response = await RagService.ask(query);
  
  console.log(`Confidence: ${response.confidence}`);
  
  // This assertion will fail because "how to bake a cake" is not in the SPARK doctrine
  if (response.confidence > 0.8) {
    console.log("✅ Unexpectedly found cake recipes in SPARK doctrine?");
  } else {
    console.error("❌ FAILURE: No cake recipes found (Expected behavior, but let's see if test-runner can explain why)");
    process.exit(1); // Exit with error to trigger test-runner's "fixer" mode
  }
}

main().catch(() => process.exit(1));
