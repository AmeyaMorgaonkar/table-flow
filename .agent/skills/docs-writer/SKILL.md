---
name: docs-writer
description: Update TableFlow documentation after any feature or schema change.
---

# Docs Writer

## When to Use
After any milestone ships or behavior changes.

## Steps
1. Update JSDoc on all changed exported functions
2. Update README section for the changed feature
3. If schema changed: update docs/schema.md
4. If API routes changed: update docs/api.md
5. Add CHANGELOG entry: ## [version] - [date] / ### Added|Changed|Fixed / - description
6. If any .agent/workflows/ steps are now outdated: update them
