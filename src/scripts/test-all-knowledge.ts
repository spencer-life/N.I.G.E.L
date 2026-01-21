import "dotenv/config";
import { RagService } from "../services/RagService.js";
import { supabase } from "../database/client.js";

async function main() {
  console.log("🧪 Testing ALL knowledge base files\n");
  console.log("=" .repeat(80));
  
  // Get all documents from the database
  const { data: docs, error } = await supabase
    .from("documents")
    .select("id, name")
    .order("name");
  
  if (error || !docs) {
    console.error("❌ Error fetching documents:", error);
    return;
  }
  
  console.log(`\n📚 Found ${docs.length} documents in database\n`);
  
  // Test queries for each major framework/concept
  const testQueries = [
    // Core frameworks
    { query: "what is 6MX", expectedDoc: "6mx.md" },
    { query: "what is the Six-Minute X-Ray", expectedDoc: "6mx.md" },
    { query: "what is authority", expectedDoc: "authority.md" },
    { query: "what is body language", expectedDoc: "body-language.md" },
    { query: "what is BTE", expectedDoc: "bte.md" },
    { query: "what is Baseline Trigger Exception", expectedDoc: "bte.md" },
    { query: "what is the Cialdini hack", expectedDoc: "cialdini-hack.md" },
    { query: "what is cognitive bias", expectedDoc: "cognitive-biases.md" },
    { query: "what is cognitive dissonance", expectedDoc: "cognitive-dissonance.md" },
    { query: "what is the compass", expectedDoc: "compass.md" },
    { query: "what is the decision map", expectedDoc: "decision-map.md" },
    { query: "what is elicitation", expectedDoc: "elicitation.md" },
    { query: "what is the FATE framework", expectedDoc: "fate-framework.md" },
    { query: "what is FATE", expectedDoc: "fate-framework.md" },
    { query: "what is four frames", expectedDoc: "four-frames.md" },
    { query: "what is the grief model", expectedDoc: "grief-interrogation.md" },
    { query: "what is the grief process", expectedDoc: "grief-process.md" },
    { query: "what is hierarchy", expectedDoc: "hierarchy.md" },
    { query: "what is human needs", expectedDoc: "human-needs.md" },
    { query: "what is hypnosis", expectedDoc: "hypnosis.md" },
    { query: "what is influence", expectedDoc: "influence.md" },
    { query: "what is interrogation", expectedDoc: "interrogation-protocol.md" },
    { query: "what is linguistics", expectedDoc: "linguistics.md" },
    { query: "what is neuroscience", expectedDoc: "neuroscience.md" },
    { query: "what is PCP", expectedDoc: "pcp-framework.md" },
    { query: "what is profiling", expectedDoc: "profiling.md" },
    { query: "what is rapport", expectedDoc: "rapport.md" },
    { query: "what is script hacking", expectedDoc: "script-hacking.md" },
    { query: "what is the six-axis model", expectedDoc: "six-axis-model.md" },
    { query: "what are social skills", expectedDoc: "social-skills.md" },
  ];
  
  const results = {
    passed: 0,
    failed: 0,
    details: [] as any[]
  };
  
  for (const test of testQueries) {
    try {
      const chunks = await RagService.searchDoctrine(test.query);
      
      if (chunks.length === 0) {
        console.log(`❌ FAIL: "${test.query}"`);
        console.log(`   Expected: ${test.expectedDoc}`);
        console.log(`   Got: NO RESULTS\n`);
        results.failed++;
        results.details.push({ query: test.query, expected: test.expectedDoc, actual: "NO RESULTS", status: "FAIL" });
        continue;
      }
      
      // Get document IDs from chunks
      const chunkDocIds = chunks.map(c => c.chunk.document_id);
      const { data: chunkDocs } = await supabase
        .from("documents")
        .select("id, name")
        .in("id", chunkDocIds);
      
      const foundDocs = chunkDocs?.map(d => d.name) || [];
      const hasExpectedDoc = foundDocs.includes(test.expectedDoc);
      
      if (hasExpectedDoc) {
        console.log(`✅ PASS: "${test.query}"`);
        console.log(`   Found in: ${test.expectedDoc}`);
        console.log(`   Top similarity: ${(chunks[0].similarity * 100).toFixed(1)}%`);
        console.log(`   Top section: "${chunks[0].chunk.section}"\n`);
        results.passed++;
        results.details.push({ query: test.query, expected: test.expectedDoc, actual: foundDocs[0], status: "PASS" });
      } else {
        console.log(`⚠️  PARTIAL: "${test.query}"`);
        console.log(`   Expected: ${test.expectedDoc}`);
        console.log(`   Got: ${foundDocs[0] || "Unknown"}`);
        console.log(`   Top section: "${chunks[0].chunk.section}"`);
        console.log(`   Similarity: ${(chunks[0].similarity * 100).toFixed(1)}%\n`);
        results.failed++;
        results.details.push({ query: test.query, expected: test.expectedDoc, actual: foundDocs[0], status: "PARTIAL" });
      }
      
    } catch (error) {
      console.log(`❌ ERROR: "${test.query}"`);
      console.log(`   ${error instanceof Error ? error.message : error}\n`);
      results.failed++;
      results.details.push({ query: test.query, expected: test.expectedDoc, actual: "ERROR", status: "ERROR" });
    }
  }
  
  console.log("\n" + "=".repeat(80));
  console.log(`\n📊 SUMMARY:`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📈 Success Rate: ${((results.passed / testQueries.length) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log(`\n⚠️  Failed tests:`);
    results.details
      .filter(d => d.status !== "PASS")
      .forEach(d => {
        console.log(`   - "${d.query}"`);
        console.log(`     Expected: ${d.expected}, Got: ${d.actual}`);
      });
  }
  
  console.log("\n" + "=".repeat(80));
}

main().catch(console.error);
