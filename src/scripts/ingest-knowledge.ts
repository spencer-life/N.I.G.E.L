import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import { supabase } from "../database/client.js";
import { RagService } from "../services/RagService.js";

interface FrontMatter {
  tags?: string[];
}

/**
 * Knowledge ingestion script.
 * Reads markdown files from knowledge/ folder, chunks them, and generates embeddings.
 * 
 * Usage: npm run ingest-knowledge
 */

const KNOWLEDGE_DIR = "knowledge";
const TARGET_CHUNK_SIZE = 500; // tokens (approx 375 words)
const MAX_CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 50;
const CHARS_PER_TOKEN = 4; // Rough approximation

/**
 * Extracts YAML frontmatter from markdown content.
 */
function parseFrontMatter(content: string): { frontMatter: FrontMatter | null; body: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return { frontMatter: null, body: content };
  }

  try {
    const yamlContent = match[1];
    const body = match[2];
    
    // Simple YAML parser for tags array
    const tagsMatch = yamlContent.match(/tags:\s*\[(.*?)\]/);
    if (tagsMatch) {
      const tags = tagsMatch[1]
        .split(",")
        .map((t) => t.trim().replace(/['"]/g, ""))
        .filter((t) => t.length > 0);
      return { frontMatter: { tags }, body };
    }

    return { frontMatter: null, body };
  } catch (error) {
    console.warn("Failed to parse frontmatter, using full content");
    return { frontMatter: null, body: content };
  }
}

/**
 * Extracts framework tags from filename.
 * Examples:
 *   "fate-framework.md" -> ["FATE"]
 *   "6mx.md" -> ["6MX"]
 *   "cognitive-biases.md" -> ["Cognitive Biases"]
 */
function extractTagsFromFilename(filename: string): string[] {
  const name = filename.replace(".md", "");
  
  // Special cases
  const specialCases: Record<string, string[]> = {
    "6mx": ["6MX"],
    "fate-framework": ["FATE"],
    "bte": ["BTE"],
    "pcp-framework": ["PCP"],
    "four-frames": ["4 Frames"],
    "cialdini-hack": ["Influence", "Cialdini"],
    "body-language": ["Body Language"],
    "cognitive-biases": ["Cognitive Biases"],
    "cognitive-dissonance": ["Cognitive Dissonance"],
    "six-axis-model": ["Six Axis Model"],
    "grief-interrogation": ["Grief", "Interrogation"],
    "grief-process": ["Grief"],
    "interrogation-protocol": ["Interrogation"],
    "script-hacking": ["Script Hacking"],
    "human-needs": ["Human Needs"],
    "social-skills": ["Social Skills"],
    "confusion-statements": ["Confusion Statements"],
    "decision-map": ["Decision Map", "6MX"],
    compass: ["Compass", "6MX"],
    elicitation: ["Elicitation"],
    rapport: ["Rapport"],
    profiling: ["Profiling"],
    influence: ["Influence"],
    hypnosis: ["Hypnosis"],
    neuroscience: ["Neuroscience"],
    linguistics: ["Linguistics"],
    protocols: ["Protocols"],
    scenarios: ["Scenarios"],
    hierarchy: ["Hierarchy"],
    authority: ["Authority"],
    general: ["General"],
  };

  if (specialCases[name]) {
    return specialCases[name];
  }

  // Default: title case the filename
  return [name.split("-").map((word) => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ")];
}

/**
 * Chunks content into sections based on headers and size constraints.
 */
function chunkContent(content: string, filename: string): Array<{ content: string; section: string | null }> {
  const chunks: Array<{ content: string; section: string | null }> = [];
  
  // Split by headers (##, ###, etc.)
  const sections = content.split(/(?=^#{2,}\s+.+$)/gm);
  
  for (const section of sections) {
    const lines = section.trim().split("\n");
    if (lines.length === 0) continue;
    
    // Extract section title from header
    const headerMatch = lines[0].match(/^#{2,}\s+(.+)$/);
    const sectionTitle = headerMatch ? headerMatch[1] : null;
    
    const sectionContent = lines.join("\n").trim();
    const estimatedTokens = Math.floor(sectionContent.length / CHARS_PER_TOKEN);
    
    if (estimatedTokens <= MAX_CHUNK_SIZE) {
      // Section fits in one chunk
      chunks.push({
        content: sectionContent,
        section: sectionTitle,
      });
    } else {
      // Split large section into smaller chunks with overlap
      const targetChars = TARGET_CHUNK_SIZE * CHARS_PER_TOKEN;
      const overlapChars = CHUNK_OVERLAP * CHARS_PER_TOKEN;
      
      let start = 0;
      let chunkIndex = 0;
      
      while (start < sectionContent.length) {
        const end = Math.min(start + targetChars, sectionContent.length);
        const chunkText = sectionContent.slice(start, end);
        
        chunks.push({
          content: chunkText,
          section: sectionTitle ? `${sectionTitle} (Part ${chunkIndex + 1})` : null,
        });
        
        start = end - overlapChars;
        chunkIndex++;
        
        // Prevent infinite loop
        if (start >= sectionContent.length - overlapChars) break;
      }
    }
  }
  
  return chunks;
}

/**
 * Processes a single markdown file.
 */
async function processFile(filepath: string, filename: string): Promise<void> {
  console.log(`Processing: ${filename}`);
  
  try {
    const content = await readFile(filepath, "utf-8");
    
    // Skip empty files
    if (content.trim().length === 0) {
      console.warn(`  ⚠️  Skipping empty file: ${filename}`);
      return;
    }
    
    // Parse frontmatter
    const { frontMatter, body } = parseFrontMatter(content);
    
    // Determine tags
    const tags = frontMatter?.tags || extractTagsFromFilename(filename);
    
    // Calculate content hash
    const contentHash = createHash("md5").update(content).digest("hex");
    
    // Check if document already exists with same hash
    const { data: existing } = await supabase
      .from("documents")
      .select("id, content_hash")
      .eq("name", filename)
      .single();
    
    if (existing?.content_hash === contentHash) {
      console.log(`  ✓ Already ingested (unchanged): ${filename}`);
      return;
    }
    
    // Create or update document
    let documentId: number;
    
    if (existing) {
      // Update existing document
      const { data: updated } = await supabase
        .from("documents")
        .update({
          content_hash: contentHash,
          doc_type: "markdown",
          metadata: { tags },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
      
      documentId = updated!.id;
      
      // Delete old chunks
      await supabase.from("chunks").delete().eq("document_id", documentId);
      
      console.log(`  🔄 Updated document: ${filename}`);
    } else {
      // Create new document
      const { data: newDoc } = await supabase
        .from("documents")
        .insert({
          name: filename,
          source: `knowledge/${filename}`,
          doc_type: "markdown",
          content_hash: contentHash,
          metadata: { tags },
        })
        .select()
        .single();
      
      documentId = newDoc!.id;
      console.log(`  ✨ Created document: ${filename}`);
    }
    
    // Chunk the content
    const chunks = chunkContent(body, filename);
    console.log(`  📝 Created ${chunks.length} chunks`);
    
    // Generate embeddings and insert chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const tokenCount = Math.floor(chunk.content.length / CHARS_PER_TOKEN);
      
      try {
        const embedding = await RagService.generateEmbedding(chunk.content);
        
        // Convert embedding to PostgreSQL vector format string
        // Format: '[0.1,0.2,0.3,...]' which will be cast to vector(768)
        const vectorString = `[${embedding.join(',')}]`;
        
        // Direct insert with vector string - PostgreSQL will handle the cast
        const { data: insertedData, error: insertError } = await supabase.from("chunks").insert({
          document_id: documentId,
          section: chunk.section || null,
          content: chunk.content,
          framework_tags: tags,
          token_count: tokenCount,
          embedding: vectorString,
        }).select();
        
        if (insertError) {
          console.error(`    ✗ Insert error for chunk ${i + 1}:`, insertError);
          throw insertError;
        }
        
        if (!insertedData || insertedData.length === 0) {
          console.error(`    ✗ No data returned for chunk ${i + 1}`);
        }
        
        console.log(`    ✓ Chunk ${i + 1}/${chunks.length} embedded (${tokenCount} tokens)`);
      } catch (error) {
        console.error(`    ✗ Failed to embed chunk ${i + 1}:`, error);
      }
    }
    
    console.log(`  ✅ Completed: ${filename}\n`);
  } catch (error) {
    console.error(`  ✗ Error processing ${filename}:`, error);
  }
}

/**
 * Main ingestion process.
 */
async function main(): Promise<void> {
  console.log("🚀 NIGEL Knowledge Ingestion\n");
  console.log("Reading from:", KNOWLEDGE_DIR);
  console.log("Chunk target:", TARGET_CHUNK_SIZE, "tokens");
  console.log("Chunk max:", MAX_CHUNK_SIZE, "tokens");
  console.log("Overlap:", CHUNK_OVERLAP, "tokens\n");
  
  try {
    const files = await readdir(KNOWLEDGE_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    
    console.log(`Found ${mdFiles.length} markdown files\n`);
    
    for (const file of mdFiles) {
      const filepath = join(KNOWLEDGE_DIR, file);
      await processFile(filepath, file);
    }
    
    console.log("\n✅ Ingestion complete!");
    
    // Summary
    const { count: docCount } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true });
    
    const { count: chunkCount } = await supabase
      .from("chunks")
      .select("*", { count: "exact", head: true });
    
    console.log(`\nDatabase summary:`);
    console.log(`  Documents: ${docCount}`);
    console.log(`  Chunks: ${chunkCount}`);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
