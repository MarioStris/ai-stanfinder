# E2E API Test Scenarios — AI StanFinder
**Date**: 2026-04-01
**Base URL**: `http://localhost:3001` (staging: `https://api-staging.ai-stanfinder.hr`)
**Format**: Manual test scenarios + Postman/Insomnia collection reference

---

## Environment Variables

```
BASE_URL=http://localhost:3001
VALID_JWT=<obtain from Clerk after login>
EXPIRED_JWT=<manually expired token for auth tests>
WRONG_ROLE_JWT=<token without required claims>
WEBHOOK_SECRET=test-webhook-secret
SCRAPING_API_KEY=test-scraping-key
```

---

## 1. Health Check

### TC-HEALTH-01: GET /api/health — success
```http
GET /api/health HTTP/1.1
Host: {{BASE_URL}}
```
**Expected**: 200 OK
```json
{
  "data": { "status": "ok", "version": "0.0.1", "timestamp": "<ISO string>" },
  "error": null,
  "meta": null
}
```
**Assertions**:
- status === 200
- data.status === "ok"
- data.timestamp is valid ISO 8601

### TC-HEALTH-02: GET /api/nonexistent — 404
```http
GET /api/v1/nonexistent HTTP/1.1
```
**Expected**: 404
```json
{ "error": { "code": "NOT_FOUND" } }
```

---

## 2. Auth Flow

### TC-AUTH-01: Register with valid email — success
```http
POST /api/v1/auth/register HTTP/1.1
Content-Type: application/json

{ "email": "test+{{$randomInt}}@example.com", "password": "SecurePass123!" }
```
**Expected**: 201
**Assertions**: data.id exists, data.email matches input

### TC-AUTH-02: Register with invalid email format
```http
POST /api/v1/auth/register HTTP/1.1
Content-Type: application/json

{ "email": "not-an-email", "password": "SecurePass123!" }
```
**Expected**: 400, error.code === "VALIDATION_ERROR"

### TC-AUTH-03: Register with short password (< 8 chars)
```http
POST /api/v1/auth/register HTTP/1.1
Content-Type: application/json

{ "email": "valid@example.com", "password": "short" }
```
**Expected**: 400

### TC-AUTH-04: Register with duplicate email
```http
POST /api/v1/auth/register HTTP/1.1
Content-Type: application/json

{ "email": "existing@example.com", "password": "SecurePass123!" }
```
**Expected**: 409, error.code === "EMAIL_IN_USE"

### TC-AUTH-05: Register without body
```http
POST /api/v1/auth/register HTTP/1.1
Content-Type: application/json
```
**Expected**: 400

### TC-AUTH-06: Access protected route without token
```http
GET /api/v1/filters HTTP/1.1
```
**Expected**: 401

### TC-AUTH-07: Access protected route with expired JWT
```http
GET /api/v1/filters HTTP/1.1
Authorization: Bearer {{EXPIRED_JWT}}
```
**Expected**: 401, error.code === "TOKEN_EXPIRED" or "UNAUTHORIZED"

### TC-AUTH-08: Access protected route with malformed JWT
```http
GET /api/v1/filters HTTP/1.1
Authorization: Bearer not.a.real.token
```
**Expected**: 401

---

## 3. Listings Endpoints

### TC-LIST-01: GET /listings — public access, no auth needed
```http
GET /api/v1/listings HTTP/1.1
```
**Expected**: 200
```json
{
  "data": [...],
  "error": null,
  "meta": { "hasNextPage": false, "limit": 20, "cursor": null }
}
```
**Assertions**: data is array, meta.limit === 20

### TC-LIST-02: GET /listings with filters
```http
GET /api/v1/listings?city=Zagreb&propertyType=APARTMENT&priceMin=100000&priceMax=300000 HTTP/1.1
```
**Expected**: 200, all returned items match filter criteria

### TC-LIST-03: GET /listings with invalid propertyType
```http
GET /api/v1/listings?propertyType=VILLA HTTP/1.1
```
**Expected**: 400, validation error

### TC-LIST-04: GET /listings with pagination (cursor)
```http
# Step 1: get first page
GET /api/v1/listings?limit=5 HTTP/1.1
# Save meta.cursor from response

# Step 2: get next page
GET /api/v1/listings?limit=5&cursor={{cursor_from_step1}} HTTP/1.1
```
**Expected**: Step 2 returns different items, no overlap

### TC-LIST-05: GET /listings/:id — existing property
```http
GET /api/v1/listings/{{valid_property_id}} HTTP/1.1
```
**Expected**: 200, data.id === valid_property_id

### TC-LIST-06: GET /listings/:id — not found
```http
GET /api/v1/listings/nonexistent-id-000 HTTP/1.1
```
**Expected**: 404, error.code === "NOT_FOUND"

### TC-LIST-07: GET /listings with area filters
```http
GET /api/v1/listings?areaMin=50&areaMax=100 HTTP/1.1
```
**Expected**: 200, all items have area between 50 and 100

---

## 4. Filter CRUD Flow

### TC-FILTER-01: POST /filters — create filter, success (FREE tier)
```http
POST /api/v1/filters HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{
  "name": "Zagreb Centar",
  "city": "Zagreb",
  "propertyType": "APARTMENT",
  "priceMin": 100000,
  "priceMax": 250000,
  "areaMin": 50,
  "areaMax": 80
}
```
**Expected**: 201
```json
{ "data": { "id": "<uuid>", "name": "Zagreb Centar", "userId": "<user-id>", "isActive": true } }
```

### TC-FILTER-02: POST /filters — FREE tier limit (second filter)
**Prerequisites**: User already has 1 active filter
```http
POST /api/v1/filters HTTP/1.1
Authorization: Bearer {{VALID_JWT_FREE}}
Content-Type: application/json

{ "name": "Second Filter" }
```
**Expected**: 403, error.code === "FILTER_LIMIT_REACHED"

### TC-FILTER-03: POST /filters — no auth
```http
POST /api/v1/filters HTTP/1.1
Content-Type: application/json

{ "name": "Test Filter" }
```
**Expected**: 401

### TC-FILTER-04: POST /filters — missing required name field
```http
POST /api/v1/filters HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{ "city": "Zagreb" }
```
**Expected**: 400, VALIDATION_ERROR

### TC-FILTER-05: POST /filters — negative price value
```http
POST /api/v1/filters HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{ "name": "Bad Filter", "priceMin": -500 }
```
**Expected**: 400

### TC-FILTER-06: GET /filters — list owned filters
```http
GET /api/v1/filters HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 200, data is array of filters belonging to authenticated user only

### TC-FILTER-07: GET /filters — no auth
```http
GET /api/v1/filters HTTP/1.1
```
**Expected**: 401

### TC-FILTER-08: PUT /filters/:id — update filter
```http
PUT /api/v1/filters/{{filter_id}} HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{ "name": "Updated Name", "priceMax": 300000 }
```
**Expected**: 200, data.name === "Updated Name"

### TC-FILTER-09: PUT /filters/:id — update other user's filter (IDOR)
```http
PUT /api/v1/filters/{{other_user_filter_id}} HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{ "name": "Hijacked" }
```
**Expected**: 403, FORBIDDEN

### TC-FILTER-10: DELETE /filters/:id — success
```http
DELETE /api/v1/filters/{{filter_id}} HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 204

### TC-FILTER-11: DELETE /filters/:id — not found
```http
DELETE /api/v1/filters/nonexistent-filter-id HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 404

### TC-FILTER-12: DELETE /filters/:id — other user's filter (IDOR)
```http
DELETE /api/v1/filters/{{other_user_filter_id}} HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 403, FORBIDDEN

### TC-FILTER-13: PREMIUM tier — create 4 filters
**Prerequisites**: User has active PREMIUM subscription
```http
# Repeat 4 times with different names
POST /api/v1/filters HTTP/1.1
Authorization: Bearer {{VALID_JWT_PREMIUM}}
Content-Type: application/json

{ "name": "Filter N" }
```
**Expected**: Each returns 201 (no limit for PREMIUM)

---

## 5. Matching Flow

### TC-MATCH-01: GET /filters/:id/matches — success
```http
GET /api/v1/filters/{{filter_id}}/matches HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 200
```json
{
  "data": [{
    "id": "...",
    "matchPercent": 85,
    "rank": 1,
    "aiComment": "...",
    "isNew": true,
    "property": { "id": "...", "title": "...", "city": "...", "price": 200000 }
  }],
  "meta": { "total": 5, "newCount": 2 }
}
```
**Assertions**:
- data is sorted by rank ASC
- each item has matchPercent, rank, aiComment, property
- meta.total matches data.length
- meta.newCount = count of items where isNew === true

### TC-MATCH-02: GET /filters/:id/matches — filter not found
```http
GET /api/v1/filters/nonexistent-filter/matches HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 404, NOT_FOUND

### TC-MATCH-03: GET /filters/:id/matches — another user's filter (IDOR)
```http
GET /api/v1/filters/{{other_user_filter_id}}/matches HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 403, FORBIDDEN

### TC-MATCH-04: GET /filters/:id/matches — no auth
```http
GET /api/v1/filters/{{filter_id}}/matches HTTP/1.1
```
**Expected**: 401

### TC-MATCH-05: POST /filters/:id/matches/refresh — success (queues job)
```http
POST /api/v1/filters/{{filter_id}}/matches/refresh HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 202
```json
{ "data": { "jobId": "<uuid>", "status": "queued" } }
```

### TC-MATCH-06: POST /filters/:id/matches/refresh — inactive filter
```http
POST /api/v1/filters/{{inactive_filter_id}}/matches/refresh HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 400, FILTER_INACTIVE

### TC-MATCH-07: POST /filters/:id/matches/refresh — not found
```http
POST /api/v1/filters/nonexistent/matches/refresh HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 404

### TC-MATCH-08: POST /filters/:id/matches/refresh — other user's filter (IDOR)
```http
POST /api/v1/filters/{{other_user_filter_id}}/matches/refresh HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 403, FORBIDDEN

### TC-MATCH-09: PATCH /matches/:id/read — mark match as seen
```http
PATCH /api/v1/matches/{{match_id}}/read HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{}
```
**Expected**: 200, data.isNew === false, data.isSeen === true

### TC-MATCH-10: PATCH /matches/:id/read — not found
```http
PATCH /api/v1/matches/nonexistent/read HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{}
```
**Expected**: 404

### TC-MATCH-11: PATCH /matches/:id/read — another user's match (IDOR)
```http
PATCH /api/v1/matches/{{other_user_match_id}}/read HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{}
```
**Expected**: 403, FORBIDDEN

---

## 6. Notification Flow

### TC-NOTIF-01: POST /push-tokens — register iOS token
```http
POST /api/v1/push-tokens HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{ "token": "ExponentPushToken[abc123def456]", "platform": "ios" }
```
**Expected**: 201, data.registered === true

### TC-NOTIF-02: POST /push-tokens — register Android token
```http
POST /api/v1/push-tokens HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{ "token": "ExponentPushToken[xyz789]", "platform": "android" }
```
**Expected**: 201

### TC-NOTIF-03: POST /push-tokens — invalid (empty token)
```http
POST /api/v1/push-tokens HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{ "token": "", "platform": "ios" }
```
**Expected**: 400, VALIDATION_ERROR

### TC-NOTIF-04: POST /push-tokens — invalid platform
```http
POST /api/v1/push-tokens HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{ "token": "ExponentPushToken[abc]", "platform": "windows" }
```
**Expected**: 400

### TC-NOTIF-05: POST /push-tokens — no auth
```http
POST /api/v1/push-tokens HTTP/1.1
Content-Type: application/json

{ "token": "ExponentPushToken[abc]", "platform": "ios" }
```
**Expected**: 401

### TC-NOTIF-06: DELETE /push-tokens/:token — deactivate token
```http
DELETE /api/v1/push-tokens/ExponentPushToken[abc123def456] HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 204

### TC-NOTIF-07: GET /notifications — list notifications
```http
GET /api/v1/notifications HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 200
```json
{
  "data": [...],
  "meta": { "cursor": null, "limit": 20, "hasMore": false }
}
```

### TC-NOTIF-08: GET /notifications — pagination
```http
GET /api/v1/notifications?limit=5 HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 200, meta.limit === 5, if hasMore === true then cursor is non-null

### TC-NOTIF-09: GET /notifications — no auth
```http
GET /api/v1/notifications HTTP/1.1
```
**Expected**: 401

### TC-NOTIF-10: PATCH /notifications/:id/read — mark as read
```http
PATCH /api/v1/notifications/{{notification_id}}/read HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 200, data.status === "READ", data.readAt is set

### TC-NOTIF-11: PATCH /notifications/:id/read — not found
```http
PATCH /api/v1/notifications/nonexistent/read HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 404

### TC-NOTIF-12: POST /notifications/read-all — mark all as read
```http
POST /api/v1/notifications/read-all HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 200, data.updated >= 0

### TC-NOTIF-13: GET /notifications/settings — defaults when none set
```http
GET /api/v1/notifications/settings HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 200
```json
{ "data": { "pushEnabled": true, "emailEnabled": false, "frequency": "instant", "minMatchScore": 80 } }
```

### TC-NOTIF-14: PUT /notifications/settings — update preferences
```http
PUT /api/v1/notifications/settings HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{ "pushEnabled": false, "frequency": "daily", "minMatchScore": 90 }
```
**Expected**: 200, data reflects updated values

### TC-NOTIF-15: PUT /notifications/settings — invalid minMatchScore
```http
PUT /api/v1/notifications/settings HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{ "minMatchScore": 150 }
```
**Expected**: 400, VALIDATION_ERROR

### TC-NOTIF-16: PUT /notifications/settings — invalid frequency
```http
PUT /api/v1/notifications/settings HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
Content-Type: application/json

{ "frequency": "weekly" }
```
**Expected**: 400

---

## 7. Billing Flow

### TC-BILL-01: POST /billing/webhook — INITIAL_PURCHASE success
```http
POST /api/v1/billing/webhook HTTP/1.1
Authorization: Bearer {{WEBHOOK_SECRET}}
Content-Type: application/json

{
  "event": {
    "type": "INITIAL_PURCHASE",
    "app_user_id": "{{clerk_user_id}}",
    "product_id": "premium_monthly",
    "purchased_at_ms": 1743465600000,
    "expiration_at_ms": 1746057600000
  }
}
```
**Expected**: 200, data.received === true
**Side effects**: User tier in DB changed to PREMIUM, scheduler interval set to 15 min

### TC-BILL-02: POST /billing/webhook — no Authorization header
```http
POST /api/v1/billing/webhook HTTP/1.1
Content-Type: application/json

{ "event": { "type": "INITIAL_PURCHASE", "app_user_id": "clerk-1" } }
```
**Expected**: 401, UNAUTHORIZED

### TC-BILL-03: POST /billing/webhook — wrong secret
```http
POST /api/v1/billing/webhook HTTP/1.1
Authorization: Bearer wrong-secret-value
Content-Type: application/json

{ "event": { "type": "INITIAL_PURCHASE", "app_user_id": "clerk-1" } }
```
**Expected**: 401

### TC-BILL-04: POST /billing/webhook — user not found
```http
POST /api/v1/billing/webhook HTTP/1.1
Authorization: Bearer {{WEBHOOK_SECRET}}
Content-Type: application/json

{ "event": { "type": "INITIAL_PURCHASE", "app_user_id": "clerk-nonexistent" } }
```
**Expected**: 404, NOT_FOUND

### TC-BILL-05: POST /billing/webhook — RENEWAL event
```http
POST /api/v1/billing/webhook HTTP/1.1
Authorization: Bearer {{WEBHOOK_SECRET}}
Content-Type: application/json

{
  "event": {
    "type": "RENEWAL",
    "app_user_id": "{{clerk_user_id}}",
    "purchased_at_ms": 1746057600000,
    "expiration_at_ms": 1748736000000
  }
}
```
**Expected**: 200, subscription period_end updated

### TC-BILL-06: POST /billing/webhook — CANCELLATION event
```http
POST /api/v1/billing/webhook HTTP/1.1
Authorization: Bearer {{WEBHOOK_SECRET}}
Content-Type: application/json

{ "event": { "type": "CANCELLATION", "app_user_id": "{{clerk_user_id}}" } }
```
**Expected**: 200, subscription status === CANCELLED

### TC-BILL-07: POST /billing/webhook — EXPIRATION event
```http
POST /api/v1/billing/webhook HTTP/1.1
Authorization: Bearer {{WEBHOOK_SECRET}}
Content-Type: application/json

{ "event": { "type": "EXPIRATION", "app_user_id": "{{clerk_user_id}}" } }
```
**Expected**: 200, tier reverted to FREE, scheduler interval set to 720 min (12h)

### TC-BILL-08: POST /billing/webhook — invalid body (missing event.type)
```http
POST /api/v1/billing/webhook HTTP/1.1
Authorization: Bearer {{WEBHOOK_SECRET}}
Content-Type: application/json

{ "event": { "app_user_id": "clerk-1" } }
```
**Expected**: 400, VALIDATION_ERROR

### TC-BILL-09: GET /billing/status — FREE user (no subscription)
```http
GET /api/v1/billing/status HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 200
```json
{ "data": { "tier": "FREE", "status": "ACTIVE", "currentPeriodEnd": null, "cancelledAt": null } }
```

### TC-BILL-10: GET /billing/status — PREMIUM user
**Prerequisites**: INITIAL_PURCHASE webhook sent successfully
```http
GET /api/v1/billing/status HTTP/1.1
Authorization: Bearer {{VALID_JWT_PREMIUM}}
```
**Expected**: 200, data.tier === "PREMIUM", data.currentPeriodEnd is set

### TC-BILL-11: GET /billing/status — no auth
```http
GET /api/v1/billing/status HTTP/1.1
```
**Expected**: 401

---

## 8. CSV Ingest Flow

### TC-INGEST-01: POST /ingest — valid CSV, success
```http
POST /api/v1/ingest HTTP/1.1
X-API-Key: {{SCRAPING_API_KEY}}
Content-Type: multipart/form-data

# Body: file field with valid CSV
```
**Expected**: 202, data.jobId is set

### TC-INGEST-02: POST /ingest — missing API key
```http
POST /api/v1/ingest HTTP/1.1
Content-Type: multipart/form-data
```
**Expected**: 401

### TC-INGEST-03: POST /ingest — wrong API key
```http
POST /api/v1/ingest HTTP/1.1
X-API-Key: wrong-key-value
Content-Type: multipart/form-data
```
**Expected**: 401

### TC-INGEST-04: POST /ingest — invalid CSV format (missing headers)
```http
POST /api/v1/ingest HTTP/1.1
X-API-Key: {{SCRAPING_API_KEY}}
Content-Type: multipart/form-data

# Body: malformed CSV
```
**Expected**: 400

### TC-INGEST-05: POST /ingest — duplicate listing (same externalId)
```
1. POST /ingest with CSV containing listing X (externalId: "njuskalo-12345")
2. POST /ingest again with same CSV
```
**Expected**: Second ingest does NOT create duplicate — DB row count unchanged

### TC-INGEST-06: POST /ingest — price update on existing listing
```
1. POST /ingest with listing at price 200000
2. POST /ingest with same externalId but price 190000
```
**Expected**: DB record updated to 190000, not duplicated

---

## 9. GDPR Flow

### TC-GDPR-01: GET /me/data-export — success
```http
GET /api/v1/me/data-export HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 200
```
Content-Type: application/json
Content-Disposition: attachment; filename="data-export-<user-id>.json"
```
**Body assertions**:
- data.exportedAt is ISO string
- data.user.email matches authenticated user
- data.filters is array
- data.matches is array
- data.notifications is array
- data.apiUsageSummary.totalCalls is number

### TC-GDPR-02: GET /me/data-export — no auth
```http
GET /api/v1/me/data-export HTTP/1.1
```
**Expected**: 401

### TC-GDPR-03: DELETE /me — without confirmation header
```http
DELETE /api/v1/me HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
```
**Expected**: 400, error.code === "CONFIRMATION_REQUIRED"

### TC-GDPR-04: DELETE /me — with confirmation header
```http
DELETE /api/v1/me HTTP/1.1
Authorization: Bearer {{VALID_JWT}}
X-Confirm-Delete: true
```
**Expected**: 200, data.deleted === true
**Side effects**:
- User record deleted from PostgreSQL
- User deleted from Clerk
- All related data (filters, matches, notifications, push tokens) deleted

### TC-GDPR-05: DELETE /me — subsequent request with same token
```http
DELETE /api/v1/me HTTP/1.1
Authorization: Bearer {{VALID_JWT_FROM_DELETED_USER}}
X-Confirm-Delete: true
```
**Expected**: 401 (token no longer valid) or 404 (user not found)

### TC-GDPR-06: DELETE /me — no auth
```http
DELETE /api/v1/me HTTP/1.1
X-Confirm-Delete: true
```
**Expected**: 401

---

## 10. Rate Limiting

### TC-RATE-01: Exceed rate limit
```
# Send 110 requests within 60 seconds from same IP
for i in {1..110}; do
  curl -s http://localhost:3001/api/health > /dev/null
done
```
**Expected**: Requests 101+ return 429, Retry-After header set

### TC-RATE-02: Rate limit resets after window
```
# After waiting 60 seconds post-limit
GET /api/health HTTP/1.1
```
**Expected**: 200 (rate limit window reset)

---

## Complete E2E Flow: Registration to Account Deletion

```
1. TC-AUTH-01: Register new user → save JWT
2. TC-FILTER-01: Create filter "Zagreb Centar" → save filterId
3. TC-MATCH-05: Trigger matching refresh → save jobId
4. (wait for worker to process)
5. TC-MATCH-01: Get matches → verify data has items
6. TC-MATCH-09: Mark first match as read
7. TC-NOTIF-01: Register push token
8. TC-NOTIF-14: Update notification settings (daily frequency)
9. TC-BILL-01: Send INITIAL_PURCHASE webhook → tier becomes PREMIUM
10. TC-BILL-10: Verify billing status is PREMIUM
11. TC-FILTER-13: Create 3 more filters (PREMIUM allows it)
12. TC-GDPR-01: Export data → verify all data present
13. TC-BILL-07: Send EXPIRATION webhook → tier reverts to FREE
14. TC-FILTER-02: Attempt second filter creation → expect 403
15. TC-FILTER-10: Delete filter
16. TC-NOTIF-06: Deregister push token
17. TC-GDPR-04: Delete account → expect 200, deleted: true
```
