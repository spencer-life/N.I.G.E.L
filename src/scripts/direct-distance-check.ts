import "dotenv/config";
import { supabase } from "../database/client.js";
import { RagService } from "../services/RagService.js";

async function main() {
  console.log("🎯 Direct Distance Check Using PostgreSQL\n");
  
  const query = "what is an elicitation";
  const queryEmbedding = await RagService.generateEmbedding(query);
  
  console.log(`Query: "${query}"\n`);
  
  // Query directly for the specific Elicitation chunks using raw SQL
  const { data, error } = await supabase.rpc("sql", {
    query: `
      SELECT 
        id,
        section,
        framework_tags,
        embedding <=> $1::vector as distance,
        SUBSTRING(content, 1, 80) as content_preview
      FROM chunks
      WHERE 'Elicitation' = ANY(framework_tags)
      ORDER BY distance ASC
      LIMIT 20
    `,
    params: [JSON.stringify(queryEmbedding)]
  });

  if (error) {
    console.error("Error:", error);
    
    // Try alternative approach - get all elicitation chunks and manually calculate
    console.log("\n📊 Alternative: Fetching chunks and using search_chunks RPC...\n");
    
    const { data: elicitationChunks } = await supabase
      .from("chunks")
      .select("id, section, content")
      .contains("framework_tags", ["Elicitation"]);
    
    console.log(`Found ${elicitationChunks?.length || 0} Elicitation chunks in database`);
    
    // Now use search_chunks to see what's returned
    const { data: searchResults } = await supabase.rpc("search_chunks", {
      query_embedding: queryEmbedding,
      match_threshold: 1.0,
      match_count: 50
    });
    
    console.log(`Search returned ${searchResults?.length || 0} chunks total\n`);
    
    // Check which elicitation chunks are in the results
    console.log("Elicitation chunks in search results:");
    elicitationChunks?.forEach(ec => {
      const found = searchResults?.find((r: any) => r.id === ec.id);
      if (found) {
        const similarity = (1 - found.distance / 2) * 100;
        console.log(`  ✅ ${ec.section}: distance ${found.distance.toFixed(4)} (${similarity.toFixed(1)}%)`);
      } else {
        console.log(`  ❌ ${ec.section}: NOT in search results (distance > 1.0)`);
      }
    });
  } else {
    console.log("Results:");
    data.forEach((row: any, i: number) => {
      const similarity = (1 - row.distance / 2) * 100;
      console.log(`  ${i + 1}. ${row.section || "N/A"}`);
      console.log(`     Distance: ${row.distance.toFixed(4)} | Similarity: ${similarity.toFixed(1)}%`);
      console.log(`     Preview: ${row.content_preview}...\n`);
    });
  }
  
  process.exit(0);
}

main().catch(console.error);
