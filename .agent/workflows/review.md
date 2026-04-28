---
description: Review TableFlow code before merging — multi-tenancy, security, style, test coverage
---

### Step 1 — Read Changed Files
Read all files changed in this branch.

### Step 2 — Run Code Reviewer Skill
Apply the full code-reviewer skill checklist to every changed file.

### Step 3 — Check Multi-tenancy
Verify every new DB query filters by restaurant_id. Flag any that do not.

### Step 4 — Check Security
Verify every new API route validates auth and restaurant ownership before executing.

### Step 5 — Run Hallucination Check
Apply hallucination-reviewer skill to any AI-generated code blocks.

### Step 6 — Output Review Report
PASS / NEEDS FIXES / CRITICAL with specific findings.
Ask user: "Review complete. Approve to proceed to /test or describe changes needed."
