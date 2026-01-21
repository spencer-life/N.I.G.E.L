# Setting Up Gemini Best Practices in Cursor

## Overview
This guide configures Cursor for Google's Gemini 3 models (Flash & Pro), enabling Thought Signatures and Context Caching optimizations.

---

## Step 1: Global Rules Setup
(If you haven't already added the global rules from `GLOBAL-CURSOR-RULES.md`)

1. Open Cursor Settings (`Ctrl + ,`).
2. Search "Rules".
3. Add the Gemini section from `GLOBAL-CURSOR-RULES.md`.

---

## Step 2: Project-Level Configuration

For any project using Gemini, add this to your `.cursorrules`:

```markdown
### Gemini API Usage
**Reference**: See `GEMINI-BEST-PRACTICES.md`

1. **Temperature 1.0**: Never lower temperature for Gemini 3.
2. **System Prompt**: Use the "Strong Reasoner" template for agents.
3. **Context Caching**: Enable for any context > 32k tokens.
4. **Delimiters**: Use XML tags `<context>` `<instructions>` for structure.
```

---

## Code Templates

### Basic Gemini Request (with Caching)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-3.0-pro-001",
  systemInstruction: "You are a helpful assistant...",
  // Caching configuration would go here for supported SDKs
});

const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: "Your query" }] }],
  generationConfig: {
    temperature: 1.0, // Critical for Gemini 3
  }
});
```

### RAG Pattern with Gemini

```typescript
// Gemini handles large context well - you can pass more chunks
const chunks = await vectorSearch(query, { limit: 30 }); // Higher limit than Claude

const prompt = `
<context>
${chunks.map(c => c.content).join("\n")}
</context>

<instruction>
Answer the question using the context above.
</instruction>
`;
```

---

## Quick Reference
- **Simple Task?** → Gemini 3.0 Flash
- **Complex Task?** → Gemini 3.0 Pro
- **Huge Doc?** → Use File API upload + Gemini Pro 1.5/3.0
