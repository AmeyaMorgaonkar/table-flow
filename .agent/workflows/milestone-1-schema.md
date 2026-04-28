---
description: Build TableFlow database schema — all tables with tenant isolation, RLS policies, seed data
---

### Step 1 — Read Context
Read PROJECT_CONSTITUTION.md. This milestone is the foundation — every future milestone depends on getting this right.

### Step 2 — Create Supabase Project
If not already done: create a new Supabase project and add credentials to .env.local.
Initialize Supabase CLI locally:
// turbo
Run `npx supabase init`
// turbo
Run `npx supabase login`

### Step 3 — Write Schema Migration
Create `supabase/migrations/001_initial_schema.sql` with these tables in order:

**restaurants** (tenant table)
- id (uuid, primary key)
- slug (text, unique) — used in URL routing
- name (text)
- logo_url (text, nullable)
- brand_color (text, nullable)
- currency (text, default 'INR')
- timezone (text, default 'Asia/Kolkata')
- created_at (timestamptz)

**tables** (physical restaurant tables)
- id (uuid, primary key)
- restaurant_id (uuid, references restaurants)
- label (text) — e.g. "Table 4", "Patio 2"
- qr_code_url (text, nullable)
- created_at (timestamptz)

**table_sessions** (one active session per table at a time)
- id (uuid, primary key)
- restaurant_id (uuid, references restaurants)
- table_id (uuid, references tables)
- otp (char(4)) — 4-digit join code, waiter-generated
- otp_attempts (int, default 0)
- status (text) — 'active' | 'closed'
- opened_at (timestamptz)
- closed_at (timestamptz, nullable)

**menu_categories**
- id (uuid, primary key)
- restaurant_id (uuid, references restaurants)
- name (text)
- display_order (int)

**menu_items**
- id (uuid, primary key)
- restaurant_id (uuid, references restaurants)
- category_id (uuid, references menu_categories)
- name (text)
- description (text, nullable)
- price (numeric)
- image_url (text, nullable)
- is_available (boolean, default true)
- display_order (int)

**orders**
- id (uuid, primary key)
- restaurant_id (uuid, references restaurants)
- session_id (uuid, references table_sessions)
- status (text) — 'pending' | 'preparing' | 'ready' | 'served'
- notes (text, nullable)
- created_at (timestamptz)

**order_items**
- id (uuid, primary key)
- order_id (uuid, references orders)
- restaurant_id (uuid, references restaurants)
- menu_item_id (uuid, references menu_items)
- quantity (int)
- unit_price (numeric) — snapshot price at time of order
- name (text) — snapshot name at time of order

**waiter_requests**
- id (uuid, primary key)
- restaurant_id (uuid, references restaurants)
- session_id (uuid, references table_sessions)
- status (text) — 'pending' | 'acknowledged'
- created_at (timestamptz)

### Step 4 — Write RLS Policies
Create `supabase/migrations/002_rls_policies.sql`:
- Enable RLS on all tables
- restaurants: readable by owner only
- tables: readable/writable by restaurant owner
- table_sessions: readable by restaurant owner; otp readable only during active session
- menu_categories + menu_items: publicly readable by slug; writable by owner only
- orders + order_items: readable by restaurant owner and active session
- waiter_requests: insertable by active session; readable/updatable by restaurant owner

### Step 5 — Apply Migrations
// turbo
Run `npx supabase db push`

### Step 6 — Generate TypeScript Types
// turbo
Run `npx supabase gen types typescript --local > src/types/supabase.ts`

### Step 7 — Write Seed Script
Create `supabase/seed.sql` with:
- One demo restaurant (slug: 'demo-bistro', name: 'Demo Bistro')
- 3 tables (Table 1, Table 2, Table 3)
- 2 menu categories (Mains, Drinks)
- 5 menu items with prices
// turbo
Run `npx supabase db seed`

### Step 8 — Update Schema Docs
Write `docs/schema.md` describing every table, column, and relationship.

### Step 9 — Commit
// turbo
Run `git add -A && git commit -m "feat(schema): initial database schema with RLS policies and seed data"`
