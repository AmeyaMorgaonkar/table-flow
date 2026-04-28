---
name: prd-writer
description: Write a Product Requirements Document for a TableFlow feature. Invoke when planning a new milestone or feature before any code is written.
---

# PRD Writer

## When to Use
Before implementing any new feature or milestone. Invoke this before /plan.

## Steps
1. Ask: "What feature are we writing the PRD for?"
2. Define the problem this feature solves
3. List goals and non-goals explicitly
4. Write user stories: "As a [waiter/customer/admin], I want to [action] so that [outcome]"
5. Define acceptance criteria — specific, testable conditions
6. Note edge cases specific to TableFlow (multi-tenancy, session lifecycle, OTP flow)
7. Save to docs/prd/[feature-name].md

## Output Format
- Problem statement
- Goals / Non-goals
- User stories
- Acceptance criteria (checkboxes)
- Edge cases
