---
name: test-writer
description: Write tests for TableFlow features. Invoke after implementing any module.
---

# Test Writer

## When to Use
After implementing a feature, before marking it complete.

## Test Priorities
1. Multi-tenancy isolation — restaurant A cannot access restaurant B data
2. Session lifecycle — OTP generation, validation, expiry, closure
3. Order flow — place, update status, realtime sync
4. API route auth — unauthenticated requests rejected
5. OTP rate limiting — 6th attempt blocked

## Naming Convention
should [expected result] when [condition]
Example: should reject order when session is closed

## Run Tests
// turbo
Run `npm test`
