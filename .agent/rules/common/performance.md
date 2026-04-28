# Performance Rules

Model decision — apply when writing data-fetching or rendering code.

- No N+1 queries — always join or batch fetch related data
- No synchronous operations in loops — use Promise.all for parallel async
- Supabase queries must select only needed columns — never select(*)
- Realtime subscriptions must be cleaned up on component unmount
- Menu data should be cached per restaurant — does not change per request
