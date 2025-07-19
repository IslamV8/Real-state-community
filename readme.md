# README Additions (Supplemental Documentation)

> This file contains the missing documentation sections to append to the existing `readme.md`.
> Environment variable *values* are intentionally omitted (only names referenced where needed).

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Runtime | Node.js (>=20) |
| Framework | Express |
| Database | MongoDB + Mongoose |
| Auth | express-session (cookie-based) |
| Validation | Joi |
| File Upload | Multer + Cloudinary |
| Security | bcrypt, (helmet recommended), cors, cookie-parser |
| Logging | morgan (dev) |
| Testing (planned) | Jest + Supertest |

---

## Installation & Run
```bash
git clone <repo-url>
cd real-state-community
npm install
npm run dev
```
Default port: 5000 (override with `PORT`).

---

## Authentication Flow
1. Register / login returns user JSON and sets `sid` HttpOnly cookie (`SameSite=Lax`; add `Secure` in production).
2. Client automatically sends cookie on subsequent requests (use `credentials: "include"` or `withCredentials: true`).
3. Protected routes read `req.session.user`.
4. Logout destroys session.
5. Forgot password issues a one-time, short-lived reset token via email.
6. Reset password validates token, updates hashed password, invalidates token.
7. Session expiry controlled by `cookie.maxAge` (e.g. 7d).

---

## API Endpoints Overview
Sections below document request/response bodies (examples abbreviated).

### Authentication (/api/auth)
| Method | Path | Action |
|--------|------|--------|
| POST | /api/auth/register | Create user & session |
| POST | /api/auth/login | Authenticate user |
| POST | /api/auth/logout | Destroy session |
| POST | /api/auth/forgot-password | Send reset link |
| POST | /api/auth/reset-password | Reset password |

### Properties (/api/properties)
| Method | Path | Action |
|--------|------|--------|
| GET | /api/properties | List (filter + paginate) |
| GET | /api/properties/:id | Get single |
| POST | /api/properties | Create |
| PUT | /api/properties/:id | Update |
| DELETE | /api/properties/:id | Delete |
| POST | /api/properties/:id/images | Upload up to 5 images |

### Comments (/api/comments)
| Method | Path | Action |
|--------|------|--------|
| POST | /api/comments/:propertyId | Create comment |
| GET | /api/comments/:propertyId | List comments |
| PUT | /api/comments/:id | Update comment |
| DELETE | /api/comments/:id | Delete own comment |

### Likes (/api/likes)
| Method | Path | Action |
|--------|------|--------|
| POST | /api/likes | Toggle like |
| GET | /api/likes/property/:propertyId | List likes |
| DELETE | /api/likes/:id | Remove like |

### Bookmarks (/api/bookmarks)
| Method | Path | Action |
|--------|------|--------|
| POST | /api/bookmarks | Create bookmark |
| GET | /api/bookmarks | List own bookmarks |
| DELETE | /api/bookmarks/:id | Remove bookmark |

### Messages (/api/messages)
| Method | Path | Action |
|--------|------|--------|
| POST | /api/messages | Send message |
| GET | /api/messages/:withUserId | Conversation (two users) |
| DELETE | /api/messages/:id | Soft delete (record deletion) |

### Admin (/api/admin)
| Method | Path | Action |
|--------|------|--------|
| GET | /api/admin/users | List users |
| PUT | /api/admin/users/:id/promote | Promote user |
| PUT | /api/admin/users/:id/demote | Demote admin |
| DELETE | /api/admin/users/:id | Delete user |
| DELETE | /api/admin/property/:id | Delete property |
| DELETE | /api/admin/comment/:id | Delete comment |
| DELETE | /api/admin/message/:id | Delete message |

---

## Object Schemas (Response Shapes)

### User
```json
{
  "_id": "665fa112...",
  "username": "johndoe",
  "displayName": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2025-07-01T09:50:00.000Z",
  "updatedAt": "2025-07-05T14:10:22.000Z"
}
```

### Property
```json
{
  "_id": "665fa8f2...",
  "title": "Cozy Apartment",
  "description": "2-bed in downtown",
  "price": 120000,
  "type": "apartment",
  "city": "Austin",
  "state": "Texas",
  "images": ["https://.../prop1.jpg"],
  "forSale": true,
  "createdBy": "665fa112...",
  "createdAt": "2025-07-01T10:15:20.000Z",
  "updatedAt": "2025-07-05T14:42:10.000Z"
}
```

### Comment
```json
{
  "_id": "66a1c0f2...",
  "property": "665fa8f2...",
  "user": "665fa112...",
  "content": "Looks great!",
  "createdAt": "2025-07-10T12:30:11.000Z",
  "updatedAt": "2025-07-10T12:30:11.000Z"
}
```

### Like
```json
{
  "_id": "66a1c3f9...",
  "property": "665fa8f2...",
  "user": "665fa112...",
  "createdAt": "2025-07-10T13:01:20.000Z",
  "updatedAt": "2025-07-10T13:01:20.000Z"
}
```

### Bookmark
```json
{
  "_id": "66a1c6a3...",
  "property": "665fa8f2...",
  "user": "665fa112...",
  "createdAt": "2025-07-10T13:15:42.000Z",
  "updatedAt": "2025-07-10T13:15:42.000Z"
}
```

### Message
```json
{
  "_id": "66a1c8db...",
  "sender": "665fa112...",
  "receiver": "665fa224...",
  "content": "Hello!",
  "deletedBy": [],
  "createdAt": "2025-07-10T13:24:05.000Z",
  "updatedAt": "2025-07-10T13:24:05.000Z"
}
```

---

## Validation Summary
| Model | Field | Rule |
|-------|-------|------|
| User | username | Required, unique |
| User | email | Required, unique, email format |
| User | password | Required, min length (e.g. 6+) |
| Property | title | Required |
| Property | price | Required, positive number |
| Property | type | Enum (apartment|house|villa|building|store) |
| Property | state | Enum (US states list) |
| Property | images | Array length ≤ 5 |
| Comment | content | Required |
| Like | (user, property) | Unique pair |
| Bookmark | (user, property) | Unique pair |
| Message | content | Required |

---

## Pagination & Sorting
**Query params:** `page`, `limit`, `sort`.  
Defaults: `page=1`, `limit=10` (cap 50).  
Sorting: `sort=createdAt` asc, `sort=-createdAt` desc, `sort=price` or `-price` (if implemented).  
Paginated response shape:
```json
{
  "page": 1,
  "totalPages": 5,
  "totalItems": 42,
  "itemsOnPage": 10,
  "properties": [ /* ... */ ]
}
```

---

## Status Codes
| Endpoint (example) | Success | Notes |
|--------------------|---------|-------|
| POST /api/auth/register | 201 | User created |
| POST /api/auth/login | 200 | Session set |
| POST /api/properties | 201 | Property created |
| POST /api/comments/:propertyId | 201 | Comment created |
| POST /api/messages | 201 | Message created |
| Other reads/updates/deletes | 200 | OK |
| Validation error | 400 | Joi errors |
| Unauthorized | 401 | Missing/expired session |
| Forbidden | 403 | Role restriction |
| Not found | 404 | Resource absent |
| Conflict | 409 | Duplicate (user, like, bookmark) |
| Server error | 500 | Unhandled |

**Error JSON Shape:**
```json
{
  "error": "ValidationError",
  "message": "Invalid request body",
  "details": [{ "field": "title", "message": "Required" }]
}
```

---

## Indexes
| Collection | Index | Purpose |
|------------|-------|---------|
| properties | { state:1, city:1, type:1 } | Compound filter |
| properties | { createdAt:-1 } | Recent first |
| likes | { user:1, property:1 } unique | One like per user/property |
| bookmarks | { user:1, property:1 } unique | One bookmark per user/property |
| comments | { property:1, createdAt:-1 } | Fast property comments |
| messages | { sender:1, receiver:1, createdAt:-1 } | Conversations |

---

## Security
- Session cookie: HttpOnly (add `Secure` + `SameSite=Strict` in production).
- Password hashing: bcrypt (≥10 rounds).
- Validation enforced with Joi for all mutating routes.
- Add Helmet for security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy).
- Implement rate limiting (login / password reset) to mitigate brute force.
- Reset tokens: single-use, short expiry (e.g. 15–30 min), store hashed token only.
- Restrict CORS origin to frontend domain in production.

---

## Logging & Monitoring
- Development: morgan (`dev` format).
- Production: structured logger (winston/pino) + error aggregation.
- Suggested health endpoint: `GET /health` -> `{ "status":"ok","uptime":123.45,"timestamp":"2025-07-19T12:00:00.000Z" }`.

---

## Roadmap
- Add `purpose` field (`sale|rent`).
- Notifications & real-time updates.
- Reports / moderation workflow.
- Property analytics (views, favorites counts).
- Rate limiting & brute-force protection.
- Test suite (Jest + Supertest).
- Group conversations model.
- Internationalization (states/currencies).

---

## Design Notes
- Session-based auth chosen for server-side invalidation simplicity.
- Flat JSON responses (arrays or paginated object); minimal wrapping.
- Images stored as external URLs (Cloudinary), not binary in Mongo.
- Messages support soft delete via `deletedBy` array (others hard delete).

---

## Deployment
1. Configure environment variables on host.
2. Use persistent session store (Mongo / Redis) – avoid in-memory store in production.
3. Enforce HTTPS; set cookie `Secure`.
4. Restrict CORS to production frontend origin.
5. Add process manager (PM2 / Docker) and log rotation.
6. Include health check & readiness probes.

---
