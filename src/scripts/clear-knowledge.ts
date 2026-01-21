import "dotenv/config";
import { supabase } from "../database/client.js";

/**
 * Clears all documents and chunks from the database.
 * Run this before re-ingesting knowledge if needed.
 */

async function main() {
  console.log("🗑️  Clearing knowledge base...\n");

  // Delete all chunks (cascades will handle this, but explicit is clearer)
  const { error: chunksError } = await supabase
    .from("chunks")
    .delete()
    .neq("id", 0); // Delete all

  if (chunksError) {
    console.error("Error deleting chunks:", chunksError);
  } else {
    console.log("✅ Deleted all chunks");
  }

  // Delete all documents
  const { error: docsError } = await supabase
    .from("documents")
    .delete()
    .neq("id", 0); // Delete all

  if (docsError) {
    console.error("Error deleting documents:", docsError);
  } else {
    console.log("✅ Deleted all documents");
  }

  console.log("\n✅ Knowledge base cleared. Run 'npm run ingest-knowledge' to re-ingest.\n");
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
