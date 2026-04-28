# TypeScript Rules
# Overrides: common/coding-style.md

Always on. Glob: **/*.ts, **/*.tsx

- Strict mode enabled in tsconfig — no exceptions
- Never use `any` — use `unknown` and narrow, or define a proper type
- All API route request/response bodies must have explicit types in `types/` folder
- Use Zod for runtime validation of all API inputs
- Prefer `interface` for object shapes, `type` for unions and utilities
- All Supabase query results must be typed — use generated Supabase types
- Async functions must handle errors explicitly — no unhandled promise rejections
- Naming: PascalCase components, camelCase functions/variables, SCREAMING_SNAKE for constants
- File naming: kebab-case for all files (`session-service.ts`, `menu-card.tsx`)
