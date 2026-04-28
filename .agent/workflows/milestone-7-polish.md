---
description: Final polish before deploy — mobile responsiveness, error states, loading states, seed demo data, deploy to Vercel
---

### Step 1 — Read Context
Read PROJECT_CONSTITUTION.md. This milestone makes the project portfolio-ready. Every screen must work on mobile. Every error must be handled gracefully.

### Step 2 — Mobile Responsiveness Audit
Open every customer-facing page on a 390px wide viewport (iPhone 14 size).
Fix any layout issues: text overflow, buttons too small (min 44px touch target), forms not usable on mobile.

### Step 3 — Loading States
Add loading skeletons or spinners to:
- Menu page while categories/items fetch
- Order status while realtime connects
- Kitchen dashboard while orders load
- Any form submission button (show "Submitting..." state)

### Step 4 — Error States
Add user-friendly error handling to:
- Invalid slug → branded 404 page: "Restaurant not found"
- Session expired → "This session has ended. Please ask your waiter."
- OTP failed → clear count of remaining attempts
- Order failed → "Something went wrong. Please try again or call your waiter."
- Network error → retry button

### Step 5 — Empty States
Add empty state UI to:
- Kitchen dashboard with no orders: "No active orders — you are all caught up"
- Menu with no items: "Menu is being updated, check back soon"
- Session orders with no orders placed yet: "Your order will appear here"

### Step 6 — Seed Demo Restaurant
Ensure seed data is comprehensive and realistic:
- Restaurant: "Demo Bistro" at /demo-bistro
- 3 tables
- 4 categories: Starters, Mains, Desserts, Drinks
- 10+ menu items with realistic names and prices
- Demo waiter account credentials documented in README
// turbo
Run `npx supabase db seed`

### Step 7 — Add Health Endpoint and Daily Keepalive Cron
Create `src/app/api/health/route.ts`:
- Run a lightweight query against Supabase (fetch one row from restaurants)
- Return `{ ok: true, timestamp: new Date().toISOString() }`
- This endpoint is also used for deployment smoke tests and uptime monitoring

Create `vercel.json` in project root:
```json
{
  "crons": [{
    "path": "/api/health",
    "schedule": "0 12 * * *"
  }]
}
```
This pings Supabase once daily at noon UTC, preventing the free tier project from pausing due to inactivity.

### Step 8 — Environment Variables for Production
Document all required env vars in README under "Deployment" section.
Verify all are set in Vercel project settings before deploying.

### Step 9 — Final Build Check
// turbo
Run `npm run build`
Fix any TypeScript or build errors.

### Step 10 — Deploy
// turbo
Run `vercel --prod`

### Step 11 — Smoke Test Production
Verify in production:
- /demo-bistro/table/[id] loads menu with Demo Bistro branding
- OTP flow works end to end
- Placing an order appears in kitchen dashboard
- Realtime status update reaches customer
- QR code download works
- /api/health returns { ok: true } — confirm keepalive is working

### Step 12 — Final Commit
// turbo
Run `git add -A && git commit -m "chore(polish): mobile responsiveness, error states, deploy ready"`
// turbo
Run `git tag -a v1.0.0 -m "release: TableFlow MVP"`

### Step 13 — Update README
Write a complete README: project description, tech stack, local setup steps, demo credentials, architecture decisions (session OTP model, why no location check, multi-tenancy approach).
