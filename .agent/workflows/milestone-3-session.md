---
description: Build table session management — waiter opens table, generates OTP, customer joins, session closes
---

### Step 1 — Read Context
Read PROJECT_CONSTITUTION.md. The session is the core security primitive of TableFlow. OTP gates order placement only — menu browsing is always public.

### Step 2 — Write Session Service
Create `src/lib/services/session-service.ts` with these functions:
- `openSession(restaurantId, tableId)` — creates new session, generates random 4-digit OTP, returns session
- `closeSession(restaurantId, sessionId)` — sets status to 'closed', sets closed_at
- `validateOtp(tableId, otp)` — checks OTP matches active session, increments attempts, returns session token or error
- `getActiveSession(tableId)` — returns current active session for a table, null if none
- `isSessionActive(sessionId)` — returns boolean

Rate limiting rule: if otp_attempts >= 5, reject with 'too many attempts' error regardless of OTP value.

### Step 3 — Write Session API Routes
Create `src/app/api/session/open/route.ts` — POST, waiter auth required, opens table session
Create `src/app/api/session/close/route.ts` — POST, waiter auth required, closes session
Create `src/app/api/session/join/route.ts` — POST, public, validates OTP, returns session token (JWT or signed cookie)
Create `src/app/api/session/status/route.ts` — GET, returns current session status for a table

### Step 4 — Session Token
On successful OTP validation, issue a signed session token stored in a cookie:
- Contains: sessionId, tableId, restaurantId, issuedAt
- Expires: when session is closed or 8 hours, whichever first
- Used by order API routes to validate customer is in an active session

### Step 5 — Build Waiter Session UI
Create `src/app/admin/tables/page.tsx` — grid of all tables showing status (open/closed)
Create `src/app/admin/tables/[tableId]/page.tsx`:
- Open table button → calls /api/session/open → shows generated OTP large and clear
- Close table button → calls /api/session/close → confirms closure
- Current session orders summary

### Step 6 — Build Customer OTP Entry UI
Create `src/app/[slug]/table/[tableId]/join/page.tsx`:
- 4-digit OTP input (large, mobile-friendly)
- Submit → calls /api/session/join
- On success: redirect to /[slug]/table/[tableId]/menu
- On fail: show error, show remaining attempts
- On 5 failures: show "please ask your waiter for assistance"

### Step 7 — Enable Realtime on Sessions
In the admin tables page: subscribe to table_sessions table changes for this restaurant.
When a session status changes, update the table grid in real time without page refresh.

### Step 8 — Lint and Test
// turbo
Run `npm run lint`
Write tests: OTP validation happy path, wrong OTP, 6th attempt blocked, closed session rejects join.
// turbo
Run `npm test`

### Step 9 — Commit
// turbo
Run `git add -A && git commit -m "feat(session): OTP-based table session management with rate limiting"`
