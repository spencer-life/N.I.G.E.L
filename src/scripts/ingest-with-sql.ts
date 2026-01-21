import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import { supabase } from "../database/client.js";
import { RagService } from "../services/RagService.js";

const KNOWLEDGE_DIR = "knowledge";
const TARGET_CHUNK_SIZE = 500;
const MAX_CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 50;
const CHARS_PER_TOKEN = 4;

interface FrontMatter {
  tags?: string[];
}

function parseFrontMatter(content: string): { frontMatter: FrontMatter | null; body: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    return { frontMatter: null, body: content };
  }

  try {
    const yamlContent = match[1];
    const body = match[2];
    
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

function extractTagsFromFilename(filename: string): string[] {
  const name = filename.replace(".md", "");
  
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
  };

  if (specialCases[name]) {
    return specialCases[name];
  }

  const words = name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1));
  return [words.join(" ")];
}

interface Chunk {
  section: string;
  content: string;
}

function chunkContent(content: string, filename: string): Chunk[] {
  const sections = content.split(/^##\s+/m).filter(s => s.trim());
  const chunks: Chunk[] = [];

  for (const section of sections) {
    const lines = section.split("\n");
    const title = lines[0].trim();
    const body = lines.slice(1).join("\n").trim();

    const fullContent = `## ${title}\n${body}`;
    const targetLength = TARGET_CHUNK_SIZE * CHARS_PER_TOKEN;

    if (fullContent.length <= MAX_CHUNK_SIZE * CHARS_PER_TOKEN) {
      chunks.push({ section: title, content: fullContent });
    } else {
      const paragraphs = body.split(/\n\n+/);
      let currentChunk = `## ${title}\n`;
      let partNumber = 1;

      for (const para of paragraphs) {
        if ((currentChunk + para).length > targetLength && currentChunk.length > title.length + 10) {
          chunks.push({
            section: `${title} (Part ${partNumber})`,
            content: currentChunk.trim()
          });
          currentChunk = `## ${title}\n${para}\n`;
          partNumber++;
        } else {
          currentChunk += para + "\n\n";
        }
      }

      if (currentChunk.trim().length > title.length + 10) {
        chunks.push({
          section: partNumber > 1 ? `${title} (Part ${partNumber})` : title,
          content: currentChunk.trim()
        });
      }
    }
  }

  return chunks;
}

async function main(): Promise<void> {
  console.log("🚀 NIGEL Knowledge Ingestion (SQL Direct)\n");
  
  const files = await readdir(KNOWLEDGE_DIR);
  const mdFiles = files.filter(f => f.endsWith(".md"));
  
  console.log(`Found ${mdFiles.length} markdown files\n`);

  for (const filename of mdFiles) {
    try {
      const filePath = join(KNOWLEDGE_DIR, filename);
      const content = await readFile(filePath, "utf-8");
      const contentHash = createHash("sha256").update(content).digest("hex");

      const { frontMatter, body } = parseFrontMatter(content);
      const tags = frontMatter?.tags || extractTagsFromFilename(filename);

      console.log(`Processing: ${filename}`);

      // Create document
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

      const documentId = newDoc!.id;
      console.log(`  ✨ Created document: ${filename}`);

      // Chunk and embed
      const chunks = chunkContent(body, filename);
      console.log(`  📝 Created ${chunks.length} chunks`);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const tokenCount = Math.floor(chunk.content.length / CHARS_PER_TOKEN);

        try {
          const embedding = await RagService.generateEmbedding(chunk.content);
          const vectorString = `[${embedding.join(',')}]`;

          // Use direct SQL with proper escaping
          const escapedSection = chunk.section ? chunk.section.replace(/'/g, "''") : null;
          const escapedContent = chunk.content.replace(/'/g, "''");
          const tagsArray = `{${tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}`;

          const sql = `
            INSERT INTO chunks (document_id, section, content, framework_tags, token_count, embedding)
            VALUES (
              ${documentId},
              ${escapedSection ? `'${escapedSection}'` : 'NULL'},
              '${escapedContent}',
              '${tagsArray}'::text[],
              ${tokenCount},
              '${vectorString}'::vector(768)
            )
          `;

          const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

          if (error) {
            throw error;
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

  // Summary
  const { count: docCount } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true });

  const { count: chunkCount } = await supabase
    .from("chunks")
    .select("*", { count: "exact", head: true });

  console.log("\n✅ Ingestion complete!\n");
  console.log("Database summary:");
  console.log(`  Documents: ${docCount}`);
  console.log(`  Chunks: ${chunkCount}`);
}

main();
