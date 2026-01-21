// Supabase Edge Function: embed
// Purpose: Generate embeddings for chunks using Gemini API
// Triggered by: util.process_embeddings() via pg_cron

import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.21.0";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import { z } from "npm:zod@^3.22.4";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

// Initialize Postgres client
const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!);

const jobSchema = z.object({
  jobId: z.number(),
  id: z.number(),
  schema: z.string(),
  table: z.string(),
  contentFunction: z.string(),
  embeddingColumn: z.string(),
});

const failedJobSchema = jobSchema.extend({
  error: z.string(),
});

type Job = z.infer<typeof jobSchema>;
type FailedJob = z.infer<typeof failedJobSchema>;

type Row = {
  id: string;
  content: unknown;
};

const QUEUE_NAME = "embedding_jobs";

// Listen for HTTP requests
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("expected POST request", { status: 405 });
  }

  if (req.headers.get("content-type") !== "application/json") {
    return new Response("expected json body", { status: 400 });
  }

  // Parse and validate request body
  const parseResult = z.array(jobSchema).safeParse(await req.json());

  if (parseResult.error) {
    return new Response(`invalid request body: ${parseResult.error.message}`, {
      status: 400,
    });
  }

  const pendingJobs = parseResult.data;

  // Track completed and failed jobs
  const completedJobs: Job[] = [];
  const failedJobs: FailedJob[] = [];

  async function processJobs() {
    let currentJob: Job | undefined;

    while ((currentJob = pendingJobs.shift()) !== undefined) {
      try {
        await processJob(currentJob);
        completedJobs.push(currentJob);
      } catch (error) {
        failedJobs.push({
          ...currentJob,
          error: error instanceof Error ? error.message : JSON.stringify(error),
        });
      }
    }
  }

  try {
    // Process jobs while listening for worker termination
    await Promise.race([processJobs(), catchUnload()]);
  } catch (error) {
    // If worker is terminating, add pending jobs to fail list
    failedJobs.push(
      ...pendingJobs.map((job) => ({
        ...job,
        error: error instanceof Error ? error.message : JSON.stringify(error),
      }))
    );
  }

  // Log results
  console.log("finished processing jobs:", {
    completedJobs: completedJobs.length,
    failedJobs: failedJobs.length,
  });

  return new Response(
    JSON.stringify({
      completedJobs,
      failedJobs,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        "x-completed-jobs": completedJobs.length.toString(),
        "x-failed-jobs": failedJobs.length.toString(),
      },
    }
  );
});

/**
 * Generates an embedding using Gemini text-embedding-004 (768 dimensions)
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

/**
 * Processes a single embedding job
 */
async function processJob(job: Job) {
  const { jobId, id, schema, table, contentFunction, embeddingColumn } = job;

  // Fetch content for the schema/table/row combination
  const [row]: [Row] = await sql`
    SELECT
      id,
      ${sql(contentFunction)}(t) as content
    FROM
      ${sql(schema)}.${sql(table)} t
    WHERE
      id = ${id}
  `;

  if (!row) {
    throw new Error(`row not found: ${schema}.${table}/${id}`);
  }

  if (typeof row.content !== "string") {
    throw new Error(`invalid content - expected string: ${schema}.${table}/${id}`);
  }

  // Generate embedding
  const embedding = await generateEmbedding(row.content);

  // Update the row with the new embedding
  await sql`
    UPDATE
      ${sql(schema)}.${sql(table)}
    SET
      ${sql(embeddingColumn)} = ${JSON.stringify(embedding)}
    WHERE
      id = ${id}
  `;

  // Delete the job from the queue
  await sql`
    SELECT pgmq.delete(${QUEUE_NAME}, ${jobId}::bigint)
  `;
}

/**
 * Returns a promise that rejects if the worker is terminating
 */
function catchUnload() {
  return new Promise((reject) => {
    addEventListener("beforeunload", (ev: any) => {
      reject(new Error(ev.detail?.reason));
    });
  });
}
