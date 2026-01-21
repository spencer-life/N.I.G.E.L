# Load Claude API Best Practices

## Auto-Loaded Context
@CLAUDE-BEST-PRACTICES.md

## Purpose
Load comprehensive guide for optimizing Claude API usage, reducing costs, and improving response quality.

## When to Use
- Setting up Claude API integration
- Optimizing prompt structure
- Reducing token costs
- Implementing prompt caching
- Configuring extended thinking
- Improving response quality

## What's Included

This guide covers:
- **API Configuration**: Model selection, temperature, max tokens
- **Prompt Engineering**: XML structure, system prompts, best practices
- **Cost Optimization**: Prompt caching (90% savings), batch processing
- **Extended Thinking**: When to enable, how to configure
- **Response Quality**: Context management, few-shot examples
- **Error Handling**: Rate limits, retries, fallbacks

## Key Takeaways

**Prompt Caching:**
- Cache system prompts for 90% cost savings
- 5-minute TTL on cached content
- Enable on static, large contexts

**Extended Thinking:**
- Enable for complexity score 60+
- Budget: 8,000 tokens for thinking
- Significantly improves output quality

**XML Structure:**
- Use XML tags for reliable parsing
- Claude follows XML better than markdown
- Provide context for WHY behind instructions

## Next Steps

After loading this guide:
- Configure Claude API with optimal settings
- Implement prompt caching
- Structure prompts with XML
- Enable extended thinking where appropriate
- Monitor costs and adjust strategy
