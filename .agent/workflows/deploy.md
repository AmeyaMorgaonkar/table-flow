---
description: Deploy TableFlow to Vercel — env vars, build check, deploy, smoke test
---

### Step 1 — Pre-deploy Checklist
Confirm /security returned PASS. Confirm all tests pass. Confirm no .env.local values are committed.

### Step 2 — Build Check
// turbo
Run `npm run build`
Fix any build errors before deploying.

### Step 3 — Deploy to Vercel
// turbo
Run `vercel --prod`

### Step 4 — Smoke Test
Verify these work in production:
- A restaurant slug loads their menu
- OTP generation works from admin dashboard
- Placing an order appears in kitchen dashboard
- Realtime order status update reaches customer UI

### Step 5 — Commit Release Tag
// turbo
Run `git tag -a v[version] -m "release: [milestone name]" && git push --tags`
