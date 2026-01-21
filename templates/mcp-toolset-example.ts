/**
 * MCP Toolset Integration Examples
 * 
 * Copy this file to your project and customize for your use case.
 */

import { McpToolsetService } from "./McpToolsetService";

/**
 * Example 1: Calendar Integration
 * Use case: Search and manage calendar events
 */
export async function calendarExample() {
  const service = new McpToolsetService();

  service.addServer(
    "https://calendar.example.com/sse",
    "calendar",
    process.env.CALENDAR_TOKEN,
    {
      allowlist: ["search_events", "create_event", "get_event"],
    }
  );

  const response = await service.query(
    "Find all meetings labeled ACTION ITEM from this week"
  );

  console.log(response);
}

/**
 * Example 2: Multi-Source Research
 * Use case: Aggregate information from multiple sources
 */
export async function researchExample() {
  const service = new McpToolsetService("claude-sonnet-4-5-20250929");

  // Research papers (deferred loading for large corpus)
  service.addServer(
    "https://research-papers.com/sse",
    "papers",
    process.env.PAPERS_TOKEN,
    {
      allowlist: ["search_papers", "get_abstract"],
      deferLoading: true,
    }
  );

  // News API
  service.addServer(
    "https://news-api.com/sse",
    "news",
    process.env.NEWS_TOKEN,
    {
      allowlist: ["search_articles", "get_article"],
    }
  );

  // Wikipedia (public, no auth)
  service.addServer(
    "https://wikipedia.com/sse",
    "wiki",
    undefined,
    {
      allowlist: ["search", "get_page"],
    }
  );

  const research = await service.query(`
    Research "AI safety advancements in 2025" using all available sources.
    Provide:
    1. Recent academic papers (last 6 months)
    2. News articles (last 30 days)
    3. Wikipedia summary
    
    Synthesize into a 500-word summary with citations.
  `);

  console.log(research);
}

/**
 * Example 3: Database + Email Automation
 * Use case: Query database and send email summaries
 */
export async function databaseEmailExample() {
  const service = new McpToolsetService();

  // Database (with safety denylist)
  service.addServer(
    "https://db.example.com/sse",
    "database",
    process.env.DB_TOKEN,
    {
      denylist: ["drop_table", "delete_all", "truncate", "grant_admin"],
    }
  );

  // Email service
  service.addServer(
    "https://email.example.com/sse",
    "email",
    process.env.EMAIL_TOKEN,
    {
      allowlist: ["send_email", "draft_email"],
    }
  );

  await service.query(`
    Query active users from the last 7 days,
    calculate engagement statistics,
    and email the summary to admin@example.com with subject "Weekly Report"
  `);
}

/**
 * Example 4: GitHub + Slack Integration
 * Use case: Monitor repos and post to Slack
 */
export async function gitHubSlackExample() {
  const service = new McpToolsetService();

  service.addServer(
    "https://github.example.com/sse",
    "github",
    process.env.GITHUB_TOKEN,
    {
      allowlist: ["search_issues", "get_pr", "list_commits"],
      denylist: ["delete_repository", "force_push"],
    }
  );

  service.addServer(
    "https://slack.example.com/sse",
    "slack",
    process.env.SLACK_TOKEN,
    {
      allowlist: ["send_message", "create_channel"],
    }
  );

  await service.query(`
    Find all GitHub pull requests opened today in the "ai-tools" repo
    and post a summary to the #code-review Slack channel
  `);
}

/**
 * Example 5: Streaming Response
 * Use case: Real-time output for long-running queries
 */
export async function streamingExample() {
  const service = new McpToolsetService();

  service.addServer(
    "https://knowledge-base.com/sse",
    "kb",
    process.env.KB_TOKEN,
    {
      deferLoading: true, // Large knowledge base
    }
  );

  console.log("Streaming response:\n");

  await service.queryStream(
    "Explain quantum computing in detail",
    (chunk) => {
      process.stdout.write(chunk);
    }
  );

  console.log("\n\nDone!");
}

/**
 * Example 6: Model Switching for Cost Optimization
 * Use case: Use cheap model for simple tasks, expensive for complex
 */
export async function costOptimizedExample() {
  const service = new McpToolsetService();

  service.addServer(
    "https://tools.example.com/sse",
    "tools",
    process.env.TOOLS_TOKEN
  );

  // Simple task - use Haiku (10x cheaper)
  service.setModel("claude-haiku-4-5-20251001");
  const simpleResult = await service.query("What time is it?");
  console.log("Simple result:", simpleResult);

  // Complex task - switch to Sonnet
  service.setModel("claude-sonnet-4-5-20250929");
  const complexResult = await service.query(
    "Analyze the trade-offs between microservices and monolithic architecture for a financial SaaS platform"
  );
  console.log("Complex result:", complexResult);
}

/**
 * Example 7: Error Handling and Retries
 */
export async function errorHandlingExample() {
  const service = new McpToolsetService();

  service.addServer(
    "https://unreliable-api.com/sse",
    "api",
    process.env.API_TOKEN
  );

  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const response = await service.query("Your query");
      console.log(response);
      break; // Success
    } catch (error) {
      lastError = error as Error;
      retries--;
      console.log(`Retry ${3 - retries}/3 failed:`, error);

      if (retries > 0) {
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, (4 - retries) * 1000)
        );
      }
    }
  }

  if (retries === 0) {
    console.error("All retries failed:", lastError);
    throw lastError;
  }
}

/**
 * Example 8: Testing MCP Server Connectivity
 */
export async function connectivityTestExample() {
  const { testMcpConnection } = await import("./McpToolsetService");

  const servers = [
    {
      name: "Calendar",
      url: "https://calendar.example.com/sse",
      token: process.env.CALENDAR_TOKEN,
    },
    {
      name: "Database",
      url: "https://db.example.com/sse",
      token: process.env.DB_TOKEN,
    },
    {
      name: "Email",
      url: "https://email.example.com/sse",
      token: process.env.EMAIL_TOKEN,
    },
  ];

  console.log("Testing MCP server connectivity...\n");

  for (const server of servers) {
    const isConnected = await testMcpConnection(server.url, server.token);
    console.log(
      `${server.name}: ${isConnected ? "✅ Connected" : "❌ Failed"}`
    );
  }
}

/**
 * Main function - run all examples
 */
async function main() {
  console.log("=== MCP Toolset Examples ===\n");

  // Uncomment the example you want to run:

  // await calendarExample();
  // await researchExample();
  // await databaseEmailExample();
  // await gitHubSlackExample();
  // await streamingExample();
  // await costOptimizedExample();
  // await errorHandlingExample();
  // await connectivityTestExample();

  console.log("\nExamples complete!");
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
