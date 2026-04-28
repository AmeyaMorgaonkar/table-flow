---
description: Fast production fix — reproduction test first, minimal scope, bypass /plan cycle
---

### Step 1 — Understand the Issue
Ask: "What is failing in production? Share the error message or reproduction steps."

### Step 2 — Identify Scope
Find the exact failing component. Do NOT expand scope beyond the reported issue.

### Step 3 — Write Reproduction Test First
Write a test that fails with the current broken code.
// turbo
Run `npm test --grep "[test name]"` to confirm it fails.

### Step 4 — Implement Minimal Fix
Change as few lines as possible. Do not refactor unrelated code.

### Step 5 — Verify Fix
// turbo
Run `npm test --grep "[test name]"` to confirm it now passes.
// turbo
Run `npm test` to confirm nothing else broke.

### Step 6 — Deploy
Ask user: "Fix verified. Review diff and approve to deploy."
// turbo
Run `npm run build && vercel --prod`

### Step 7 — Document Incident
Create docs/incidents/[date]-[issue].md with: cause, fix applied, prevention notes.
