---
name: security-auditor
description: Audit TableFlow code for security issues before deploy. Focus on tenant isolation, OTP security, and input validation.
---

# Security Auditor

## When to Use
Before every deploy. Always run /security before /deploy.

## TableFlow-Specific Checks
- [ ] Every API route validates restaurant_id ownership
- [ ] OTP attempts rate-limited (max 5 per IP per session)
- [ ] Closed/expired sessions reject all order requests
- [ ] RLS enabled on all Supabase tables
- [ ] No tenant data in client-side localStorage
- [ ] Supabase anon key only reads public menu data
- [ ] Admin routes protected by Supabase Auth role check
- [ ] No PII in error messages or logs

## Output
PASS / FAIL with specific findings and remediation steps
