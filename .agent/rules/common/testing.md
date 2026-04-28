# Testing Rules

Always on.

- Write tests before marking any feature complete
- Unit test all business logic (session validation, OTP generation, order flow)
- Integration test all API routes — especially auth and tenant isolation
- Test naming: `should [expected behavior] when [condition]`
- Multi-tenancy tests: always verify one tenant cannot access another's data
