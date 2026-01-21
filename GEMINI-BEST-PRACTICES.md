# Gemini API Best Practices Guide
**For Gemini 3 Models (Pro, Flash)**  
*Reference: [Google AI Studio Docs](https://ai.google.dev/gemini-api/docs/prompting-strategies)*

---

## Table of Contents
1. [Model Selection](#model-selection)
2. [Thinking & Thought Signatures](#thinking--thought-signatures)
3. [Prompting Strategy](#prompting-strategy)
4. [System Instructions](#system-instructions)
5. [Token Optimization](#token-optimization)

---

## Model Selection

### Available Models (2026)

| Model | API ID | Best For | Cost (Input/Output) |
|-------|--------|----------|---------------------|
| **Gemini 3.0 Flash** | `gemini-3.0-flash-001` | High volume, low latency, simple tasks | Lowest |
| **Gemini 3.0 Pro** | `gemini-3.0-pro-001` | Complex reasoning, RAG, content creation | Moderate |
| **Gemini 3.0 Ultra** | `gemini-3.0-ultra-001` | Highest capability, deep research | Highest |

### When to Use Which
- **Flash 3.0**: Chatbots, extraction, high-frequency RAG, real-time interactions.
- **Pro 3.0**: Complex instruction following, synthesis of multiple documents, coding agents.
- **Thinking Models**: Use specific `thinking` configuration for logic puzzles, math, or complex planning.

---

## Thinking & Thought Signatures

Gemini 3 introduces native **Thought Signatures**, allowing the model to reveal its reasoning process before answering.

### Enabling Thinking
Unlike Claude's "Extended Thinking", Gemini's thinking is controlled via specific config or model variants (like `gemini-2.0-flash-thinking-exp`).

**Key Difference:** Gemini 3 is highly steerable *during* the thinking process if using the specific thinking API.

**Best Practice:**
- **Temperature:** Keep at `1.0` (Default) for Gemini 3. **Do not lower temperature** as it degrades reasoning quality.
- **Instruction:** Explicitly ask for "Chain of Thought" or "Step-by-step reasoning" in the system prompt.

---

## Prompting Strategy

### 1. The "Persona + Task + Constraints" Formula

Gemini responds best to highly structured, persona-driven prompts.

```markdown
**System Instruction:**
You are an expert software engineer specializing in scalable distributed systems.
You prioritize clean, readable code and robust error handling.

**Input:**
Write a Python function to process a transaction.
```

### 2. Partial Input Completion (JSON Mode)

Gemini is the state-of-the-art model for JSON enforcement. Instead of just describing the JSON, **start the JSON for it**.

**Prompt:**
```text
Extract the order details into JSON.
Valid fields: item, quantity, price.
Input: I want two burgers and a coke.
Output: ```json
{
  "order_items": [
```

**Result:** Gemini completes the array immediately, saving tokens on introductory text.

### 3. Delimiters & Structure

Use XML tags or clear Markdown delimiters. Gemini 3 is optimized for XML parsing.

```xml
<document>
[Insert Context Here]
</document>

<instruction>
Summarize the document above.
</instruction>
```

---

## System Instructions (The "Agent" Pattern)

For autonomous agents (like NIGEL), use this robust System Instruction template recommended by Google DeepMind researchers:

```text
You are a very strong reasoner and planner. Use these critical instructions to structure your plans, thoughts, and responses.

Before taking any action, you must proactively, methodically, and independently plan and reason about:

1) Logical dependencies and constraints: Analyze the intended action against policy-based rules and order of operations.
2) Risk assessment: What are the consequences of taking the action?
3) Abductive reasoning: Identify the most logical reasons for problems encountered.
4) Information availability: Incorporate all applicable sources (tools, history, policies).

Inhibit your response: only take an action after all the above reasoning is completed.
```

---

## Token Optimization strategies

### 1. Context Caching
Gemini has a massive context window (2M+ tokens). **Cache your system instructions and knowledge base.**
- **Cost:** Huge savings for long conversations.
- **TTL:** Set appropriate Time-To-Live for the cache.

### 2. Response Prefixes
Don't ask Gemini to "Please provide the code".
**Do this instead:**
User: "Write a function to add two numbers."
Model Response Start (Pre-filled): `def add_numbers(a, b):`

This forces the model to skip the "Sure! Here is the code..." chatter.

### 3. File API vs Text
For large documents (PDFs, CSVs), use the **File API** to upload them rather than pasting text into the prompt. It's cheaper and more accurate.

---

## Common Pitfalls

1. **Low Temperature:** Setting temperature < 0.7 kills Gemini 3's creativity and reasoning. Keep it at 1.0.
2. **Vague Constraints:** Gemini needs explicit "Do not" instructions.
   - ❌ "Keep it short."
   - ✅ "Output exactly 3 sentences. Do not use bullet points."
3. **Ignoring Safety Settings:** Ensure safety settings aren't blocking legitimate creative outputs (configure `BLOCK_NONE` if necessary/safe).

---
*Last Updated: 2026*
