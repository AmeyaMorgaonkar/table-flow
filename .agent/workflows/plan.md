---
description: Plan a TableFlow feature or milestone — break into tasks, identify risks, confirm before building
---

### Step 1 — Read Context
Read PROJECT_CONSTITUTION.md and the relevant milestone workflow file to understand scope and constraints.

### Step 2 — Clarify Scope
Ask the user: "What are we planning? Which milestone or feature?"

### Step 3 — Break Into Tasks
List specific implementation tasks in order:
- DB schema changes (if any)
- New API routes (list each with method + path)
- Service functions needed
- UI components needed
- Realtime channels (if any)
- RLS policies (if any new tables)
- Tests to write

### Step 4 — Identify Risks
Flag anything that could break multi-tenancy, session integrity, or existing features.

### Step 5 — Confirm With User
Present the task list and ask: "Does this match your expectations? Approve to start /build or describe changes."
