---
description: Activate white-label multi-tenancy — restaurant onboarding, per-tenant branding, slug routing, table QR generation
---

### Step 1 — Read Context
Read PROJECT_CONSTITUTION.md. White-label means any restaurant can sign up and run their own branded ordering experience. Data isolation via restaurant_id is already in schema — this milestone makes it user-facing.

### Step 2 — Build Restaurant Onboarding Flow
Create `src/app/onboarding/page.tsx` — public signup page:
- Fields: restaurant name, desired slug, owner email, password
- Slug validation: lowercase, alphanumeric + hyphens, unique check via API
- On submit: create Supabase Auth user + restaurants row in one transaction
- On success: redirect to /admin/dashboard

Create `src/app/api/onboarding/route.ts`:
- Validate all inputs with Zod
- Check slug uniqueness
- Create auth user via Supabase admin client
- Create restaurant row with restaurant_id = user id
- Return session on success

### Step 3 — Build Admin Dashboard Shell
Create `src/app/admin/dashboard/page.tsx`:
- Welcome message with restaurant name
- Quick links: Menu Management, Tables, Kitchen Dashboard
- Summary stats: tables count, menu items count, active sessions today

### Step 4 — Build Restaurant Settings Page
Create `src/app/admin/settings/page.tsx`:
- Edit restaurant name, logo URL, brand color (color picker)
- Preview of how branding looks on customer menu
- Save → PATCH to /api/restaurant/settings
- Slug shown but not editable after creation

### Step 5 — Build Table Management
Create `src/app/admin/tables/manage/page.tsx`:
- List all tables with their labels
- Add new table form: label input → creates tables row
- Delete table (only if no active session)

### Step 6 — Build QR Code Generator
Create `src/app/admin/tables/qr/page.tsx`:
- For each table: generate QR code pointing to /[slug]/table/[tableId]
- Use `qrcode` npm package to render QR as PNG
- Download button per table — saves as [restaurant-slug]-[table-label].png
- Print all QR codes at once option

Create `src/app/api/tables/qr/route.ts` — generates QR buffer and returns as image response.

### Step 7 — Apply Per-tenant Branding
In `src/app/[slug]/layout.tsx` (already created in milestone-menu):
- Fetch restaurant config including brand_color and logo_url
- Inject brand_color as CSS custom property (--brand-color)
- Show restaurant logo in customer-facing header
- All accent colors reference --brand-color

### Step 8 — Verify Full Tenant Isolation
Run a manual test: create two restaurants, verify neither can see the other's data via API.
Write integration tests for cross-tenant data access attempts.
// turbo
Run `npm test`

### Step 9 — Lint
// turbo
Run `npm run lint`

### Step 10 — Commit
// turbo
Run `git add -A && git commit -m "feat(whitelabel): restaurant onboarding, per-tenant branding, QR generation"`
