---
description: Implement a planned TableFlow feature — follow the approved plan, validate tenant isolation on every file
---

### Step 1 — Read Context
Read PROJECT_CONSTITUTION.md and the approved plan from /plan.

### Step 2 — Implement Data Layer First
If new tables are needed: write the SQL migration, apply via Supabase CLI or dashboard.
If schema changes: update docs/schema.md immediately.

### Step 3 — Write RLS Policies
For every new table, write and apply RLS policies before writing any API code.

### Step 4 — Implement Service Layer
Write service functions in src/lib/services/. Every function must take restaurantId as first param.

### Step 5 — Implement API Routes
Write Next.js API routes in src/app/api/. Every route: validate input → check auth → verify restaurant_id → call service → respond.

### Step 6 — Implement UI
Write React components and pages. Use Tailwind for styling. Clean and aesthetic — no placeholder UI.

### Step 7 — Lint
// turbo
Run `npm run lint`
Fix all lint errors before proceeding.

### Step 8 — Ask User to Review
"Build complete. Review the implementation, then run /review before /test."
