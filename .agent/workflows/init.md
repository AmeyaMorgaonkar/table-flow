---
description: Initialize TableFlow project — scaffold Next.js, configure Supabase, set up folder structure, install dependencies
---

### Step 1 — Read Project Constitution
Read PROJECT_CONSTITUTION.md to load all project constraints, stack decisions, and architecture rules before touching any files.

### Step 2 — Scaffold Next.js Project
// turbo
Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`

### Step 3 — Install Core Dependencies
// turbo
Run `npm install @supabase/supabase-js @supabase/ssr zod qrcode`
Run `npm install -D @types/qrcode supabase`

### Step 4 — Set Up Folder Structure
Create the following folders if they do not exist:
- `src/app/[slug]/` — tenant-scoped customer routes
- `src/app/[slug]/table/[tableId]/` — table session routes
- `src/app/admin/` — waiter/admin dashboard routes
- `src/app/api/` — all API routes
- `src/lib/supabase/` — Supabase client utilities
- `src/lib/services/` — business logic (session, order, menu services)
- `src/types/` — shared TypeScript types
- `src/components/` — shared UI components
- `docs/` — schema, API, ADR, PRD docs

### Step 5 — Configure Environment Variables
Create `.env.local` with placeholders (do NOT fill real values):
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
Add `.env.local` to `.gitignore` immediately.

### Step 6 — Set Up Supabase Clients
Create `src/lib/supabase/client.ts` — browser client using createBrowserClient
Create `src/lib/supabase/server.ts` — server client using createServerClient with cookie handling
Create `src/lib/supabase/admin.ts` — service role client for admin operations only

### Step 7 — Initialize Git
// turbo
Run `git init && git add -A && git commit -m "chore: initialize TableFlow project"`

### Step 8 — Confirm
Ask the user: "Project initialized. Confirm your Supabase project URL and anon key are in .env.local, then we can move to /milestone-schema."
