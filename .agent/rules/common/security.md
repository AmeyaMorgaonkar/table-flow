# Security Rules

Always on. Non-negotiable on every route and query.

- No hardcoded secrets, API keys, or credentials — use environment variables only
- Validate ALL inputs server-side before processing — never trust client data
- Every API route must validate `restaurant_id` from the session before querying
- Never log PII — no emails, names, phone numbers in logs
- RLS is the last line of defense — validate in API routes first
- Rate limit sensitive endpoints: OTP validation max 5 attempts per IP
- Never expose internal error messages to clients — return generic errors
- Always sanitize user-generated content before storing or rendering
