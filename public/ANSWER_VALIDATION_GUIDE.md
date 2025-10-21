# Answer Validation System Guide

## Overview

This guide explains how the answer validation system works with **STRICT NO-FALLBACK logic**. Answers are only marked correct when explicitly matched - no default passes.

## Critical Rules

1. **Empty answers = ALWAYS incorrect** - No exceptions
2. **Wrong answers = ALWAYS incorrect** - Unless 80%+ word overlap or 70%+ with semantic similarity
3. **Synonym parsing** - Delimiter-separated synonyms (`revenue; income; sales`) automatically expanded
4. **Explicit logging** - Every comparison logged with detailed reasons
5. **Identical logic** - Manual and automated tests use same validation functions

## Knowledgebase Format

### Spreadsheet Structure

| Question | Answer |
|----------|--------|
| What is customer satisfaction? | customer satisfaction; client happiness; user contentment |
| How to increase revenue? | increase sales; boost revenue; grow income |

### Requirements

- Use semicolons (`;`), commas (`,`), or pipes (`|`) to separate synonyms
- Remove blank rows and merged cells
- Trim all whitespace
- Use consistent formatting

## Validation Logic

### 1. Pre-Processing
- Empty answers → INCORRECT (no exceptions)
- Synonyms split on delimiters: `"revenue; income"` → `["revenue", "income"]`

### 2. Normalization
- Lowercase, trim whitespace, remove punctuation, remove articles

### 3. Matching (in order)
1. **Exact match** → CORRECT
2. **Short answers (<4 chars)** → Must match exactly
3. **80%+ word overlap** → CORRECT
4. **70-79% overlap + semantic similarity** → CORRECT
5. **Otherwise** → INCORRECT

## Testing

Automated tests verify:
- ✓ Exact matches (100% accuracy)
- ✓ Synonym delimiter parsing (100% accuracy)
- ✓ High word overlap (100% accuracy)
- ✗ Wrong answers (0% accuracy - test passes)
- ✗ Empty answers (0% accuracy - test passes)
- ✗ Gibberish (0% accuracy - test passes)

## Troubleshooting

**Tests failing incorrectly?**
- Check edge function logs for detailed comparison
- Verify synonym delimiters in knowledgebase
- Ensure 80%+ of key words present in answer

**Synonyms not recognized?**
- Use consistent delimiters (`;` recommended)
- Check logs show synonym expansion
- Verify word overlap meets 70%+ threshold
