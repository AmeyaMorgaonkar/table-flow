---
name: code-reviewer
description: Review TableFlow code for correctness, security, multi-tenancy safety, and style. Invoke before any PR merge.
---

# Code Reviewer

## When to Use
After /build, before /test. Run on every PR.

## Review Checklist
- [ ] No missing restaurant_id filters in any query
- [ ] No hardcoded secrets or tenant-specific values
- [ ] All inputs validated with Zod before use
- [ ] RLS policies exist for any new table
- [ ] No N+1 queries
- [ ] TypeScript strict — no `any`
- [ ] Tests written for new logic
- [ ] Error responses do not leak internal details
- [ ] Realtime subscriptions cleaned up on unmount
- [ ] OTP rate limiting on session join route

## Output
PASS / NEEDS FIXES / CRITICAL with specific line references
