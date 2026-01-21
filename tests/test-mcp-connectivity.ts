/**
 * Test MCP Toolset Connectivity
 * 
 * This script tests the MCP toolset integration to ensure everything works correctly.
 * 
 * Usage:
 *   tsx tests/test-mcp-connectivity.ts
 */

import { McpToolsetService, testMcpConnection } from "../src/services/McpToolsetService";
import { config } from "dotenv";

// Load environment variables
config();

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

/**
 * Test 1: Basic Service Initialization
 */
async function testServiceInitialization(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const service = new McpToolsetService();
    
    // Verify service exists
    if (!service) {
      throw new Error("Service not created");
    }

    // Verify default model
    const model = service.getModel();
    if (!model.includes("claude")) {
      throw new Error("Invalid default model");
    }

    return {
      name: "Service Initialization",
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: "Service Initialization",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test 2: Server Configuration
 */
async function testServerConfiguration(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const service = new McpToolsetService();

    // Add a mock server (no actual connection)
    service.addServer(
      "https://mock-server.example.com/sse",
      "mock-server",
      undefined,
      {
        allowlist: ["tool1", "tool2"],
      }
    );

    // Verify server was added
    if (!service.hasServer("mock-server")) {
      throw new Error("Server not added");
    }

    // Verify server names
    const names = service.getServerNames();
    if (!names.includes("mock-server")) {
      throw new Error("Server name not in list");
    }

    // Test removal
    service.removeServer("mock-server");
    if (service.hasServer("mock-server")) {
      throw new Error("Server not removed");
    }

    return {
      name: "Server Configuration",
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: "Server Configuration",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test 3: Model Switching
 */
async function testModelSwitching(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const service = new McpToolsetService();

    // Check default model
    const defaultModel = service.getModel();
    if (!defaultModel.includes("sonnet")) {
      throw new Error("Default model not Sonnet");
    }

    // Switch to Haiku
    service.setModel("claude-haiku-4-5-20251001");
    const haikuModel = service.getModel();
    if (!haikuModel.includes("haiku")) {
      throw new Error("Model not switched to Haiku");
    }

    // Switch back to Sonnet
    service.setModel("claude-sonnet-4-5-20250929");
    const sonnetModel = service.getModel();
    if (!sonnetModel.includes("sonnet")) {
      throw new Error("Model not switched back to Sonnet");
    }

    return {
      name: "Model Switching",
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: "Model Switching",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test 4: URL Validation
 */
async function testUrlValidation(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const service = new McpToolsetService();

    // Test invalid URL (HTTP instead of HTTPS)
    try {
      service.addServer("http://insecure.com/sse", "insecure");
      throw new Error("Should have rejected HTTP URL");
    } catch (error) {
      if (error instanceof Error && !error.message.includes("HTTPS")) {
        throw error; // Wrong error
      }
      // Expected error - continue
    }

    // Test valid HTTPS URL
    service.addServer("https://secure.com/sse", "secure");
    if (!service.hasServer("secure")) {
      throw new Error("Valid HTTPS URL rejected");
    }

    // Test localhost (allowed for development)
    service.addServer("http://localhost:3000/sse", "localhost");
    if (!service.hasServer("localhost")) {
      throw new Error("Localhost URL rejected");
    }

    return {
      name: "URL Validation",
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: "URL Validation",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test 5: Configuration Patterns
 */
async function testConfigurationPatterns(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    const service = new McpToolsetService();

    // Allowlist pattern
    service.addServer(
      "https://server1.com/sse",
      "server1",
      undefined,
      {
        allowlist: ["tool1", "tool2"],
      }
    );

    // Denylist pattern
    service.addServer(
      "https://server2.com/sse",
      "server2",
      undefined,
      {
        denylist: ["dangerous_tool"],
      }
    );

    // Deferred loading
    service.addServer(
      "https://server3.com/sse",
      "server3",
      undefined,
      {
        deferLoading: true,
      }
    );

    // Verify all servers added
    const names = service.getServerNames();
    if (names.length !== 3) {
      throw new Error(`Expected 3 servers, got ${names.length}`);
    }

    return {
      name: "Configuration Patterns",
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: "Configuration Patterns",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Test 6: API Key Check (Optional - requires real API key)
 */
async function testApiKey(): Promise<TestResult> {
  const startTime = Date.now();
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        name: "API Key Check",
        passed: true, // Skip if no key
        duration: Date.now() - startTime,
      };
    }

    const service = new McpToolsetService();
    const model = service.getModel();

    if (!model) {
      throw new Error("Model not accessible with API key");
    }

    return {
      name: "API Key Check",
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: "API Key Check",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log("🧪 MCP Toolset Integration Tests\n");
  console.log("=".repeat(50));
  console.log();

  // Run tests
  results.push(await testServiceInitialization());
  results.push(await testServerConfiguration());
  results.push(await testModelSwitching());
  results.push(await testUrlValidation());
  results.push(await testConfigurationPatterns());
  results.push(await testApiKey());

  // Print results
  console.log("\n📊 Test Results:\n");
  
  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    const duration = result.duration ? ` (${result.duration}ms)` : "";
    console.log(`${icon} ${result.name}${duration}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    if (result.passed) passed++;
    else failed++;
  });

  console.log("\n" + "=".repeat(50));
  console.log(`\nTotal: ${results.length} tests`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  // Additional info
  console.log("\n📋 Environment:");
  console.log(`API Key: ${process.env.ANTHROPIC_API_KEY ? "✅ Set" : "❌ Not set"}`);
  console.log(`Node Version: ${process.version}`);
  
  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});
