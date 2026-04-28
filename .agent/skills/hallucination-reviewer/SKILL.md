---
name: hallucination-reviewer
description: Review AI-generated TableFlow code for hallucinated APIs, phantom Supabase methods, and broken imports.
---

# Hallucination Reviewer

## When to Use
After any AI-generated code block, before running it.

## Check For
- Supabase methods that do not exist in the JS SDK
- Next.js App Router APIs used incorrectly
- Imported modules not in package.json
- Realtime subscription patterns that do not match Supabase docs
- RLS policy syntax errors

## Output Format
HALLUCINATION RISKS: imports/APIs that do not exist
WIRING ISSUES: disconnected inputs/outputs
LATENT BUGS: code that fails under real conditions
DEAD CODE: defined but never used
VERDICT: PASS / NEEDS FIXES / CRITICAL
