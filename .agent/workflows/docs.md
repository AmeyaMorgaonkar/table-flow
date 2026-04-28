---
description: Update all TableFlow documentation after a feature or behavior change
---

### Step 1 — Ask What Changed
"What feature or milestone just shipped?"

### Step 2 — Update Inline Docs
Update JSDoc on all exported functions that changed.

### Step 3 — Update README
Update the README section describing the changed behavior.

### Step 4 — Update Schema Docs
If any DB tables or columns changed: update docs/schema.md.

### Step 5 — Update API Docs
If any API routes changed: update docs/api.md with method, path, request body, response shape.

### Step 6 — Add CHANGELOG Entry
Format: ## [version] - [date] / ### Added|Changed|Fixed / - description

### Step 7 — Confirm
"Documentation updated. Here is a summary of what changed."
