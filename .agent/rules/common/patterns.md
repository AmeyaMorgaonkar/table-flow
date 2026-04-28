# Patterns

Model decision — apply when structuring code.

- DRY: if the same logic appears 3+ times, extract to a shared utility
- YAGNI: do not build what is not in the current milestone scope
- Composition over inheritance — prefer small composable functions
- API routes: validate input → authorize tenant → execute query → respond
- Multi-tenancy pattern: every service function takes restaurantId as first param
