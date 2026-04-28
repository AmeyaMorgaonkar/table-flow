---
description: Build waiter and admin authentication — Supabase Auth, protected routes, role-based access
---

### Step 1 — Read Context
Read PROJECT_CONSTITUTION.md. Auth protects all admin and waiter routes. Customers are anonymous — no customer auth needed.

### Step 2 — Configure Supabase Auth
In Supabase dashboard: enable Email auth provider. Disable public signups (only admins can create staff accounts).

### Step 3 — Create Auth Utility Functions
In `src/lib/supabase/auth.ts` create:
- `getServerSession()` — reads session from cookies server-side
- `requireAuth()` — throws if no session, used in API routes
- `requireRestaurantAccess(restaurantId)` — verifies user owns this restaurant

### Step 4 — Create Middleware
Write `src/middleware.ts`:
- Protect all routes under /admin/* — redirect to /admin/login if no session
- Public routes: /[slug]/*, /admin/login
- Refresh Supabase session on every request

### Step 5 — Build Login Page
Create `src/app/admin/login/page.tsx`:
- Email + password form
- On success: redirect to /admin/dashboard
- On error: show clear error message
- No signup link (accounts created by super admin only)

### Step 6 — Build Auth API Routes
Create `src/app/api/auth/login/route.ts` — handle login, set session cookie
Create `src/app/api/auth/logout/route.ts` — clear session, redirect to login

### Step 7 — Protect Admin Layout
Create `src/app/admin/layout.tsx`:
- Check session server-side
- If no session: redirect to /admin/login
- If session: render children with user context

### Step 8 — Lint and Test
// turbo
Run `npm run lint`
Write tests: unauthenticated requests to /admin/* routes redirect to login. Authenticated requests pass through.
// turbo
Run `npm test`

### Step 9 — Commit
// turbo
Run `git add -A && git commit -m "feat(auth): waiter and admin authentication with protected routes"`
