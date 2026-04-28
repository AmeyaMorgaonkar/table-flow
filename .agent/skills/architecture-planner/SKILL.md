---
name: architecture-planner
description: Plan architecture for a TableFlow module. Invoke when a milestone involves new services, routes, or schema decisions.
---

# Architecture Planner

## When to Use
When starting a new module or making structural decisions.

## Steps
1. Identify components: DB tables, API routes, UI components, Realtime channels
2. Map data flow: client → API route → service → Supabase → response
3. Identify tenant isolation points — where does restaurant_id get validated?
4. List all new DB tables/columns with tenant_id scoping
5. Define Supabase RLS policies needed
6. Identify Realtime channels and their payload shape
7. Output ADR to docs/adr/[feature].md

## TableFlow Checklist
- [ ] Every new table has restaurant_id column
- [ ] RLS policy scopes reads/writes by restaurant_id
- [ ] API route validates restaurant_id before any query
- [ ] Realtime channels scoped per session or restaurant
