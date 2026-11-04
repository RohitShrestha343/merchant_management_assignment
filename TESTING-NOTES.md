# Testing checklist

1. Log in as `sales@test.com` / `password123`.
2. Create a draft, move between wizard steps, and wait one second after typing to observe auto-save.
3. Submit a completed application.
4. Log in as `admin@test.com` / `password123`, assign APP-001 or another application to the reviewer.
5. Log in as `reviewer@test.com` / `password123`, open Review Queue, and record a decision.
6. Verify a SALES user cannot open reviewer/admin routes and cannot call protected APIs directly.

## Concurrent refresh test
The access token in the demo API expires after 20 seconds. Wait for expiry, then trigger several API requests concurrently (e.g. reload dashboard and open multiple application details). Inspect the Network tab: requests should share one `/api/auth/refresh` call and retry with the returned token.

For a rigorous automated test, add an interceptor unit test using `HttpTestingController` that starts several requests, flushes each first attempt with 401, asserts exactly one refresh request, flushes refresh success, and asserts all retries carry the new Authorization header.
