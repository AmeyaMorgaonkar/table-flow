---
description: Write and run tests for the current TableFlow milestone
---

### Step 1 — Read Implementation
Read the service files and API routes implemented in this milestone.

### Step 2 — Write Tests (Priority Order)
1. Multi-tenancy isolation tests — restaurant A cannot see restaurant B data
2. Session lifecycle tests — OTP gen, validation, rate limiting, expiry, closure
3. Business logic tests — order placement, status updates, waiter request
4. API route tests — auth rejection, bad input rejection, happy path

### Step 3 — Run Tests
// turbo
Run `npm test`
All tests must pass before proceeding.

### Step 4 — Coverage Check
Identify any untested edge cases and add tests for them.

### Step 5 — Confirm
"Tests passing. Ready for /security before deploy."
