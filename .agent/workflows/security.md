---
description: Security audit before any TableFlow deploy — tenant isolation, OTP security, input validation, RLS
---

### Step 1 — Run Security Auditor Skill
Apply the full security-auditor checklist to all files in scope.

### Step 2 — Check RLS Policies
Verify every table in Supabase has RLS enabled and correct policies.

### Step 3 — Check Rate Limiting
Verify OTP validation endpoint has rate limiting implemented and tested.

### Step 4 — Check Environment Variables
Verify no secrets are hardcoded. Verify .env.local is in .gitignore.

### Step 5 — Output Audit Report
PASS / FAIL with specific findings.
Only proceed to /deploy if PASS. If FAIL, fix issues and re-run /security.
