# Real Estate Community API

A RESTful backend for a real-estate community platform (properties, comments, likes, bookmarks, messaging, admin moderation). Session-based authentication with HTTP-only cookies.

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Runtime | Node.js (>=20) |
| Framework | Express |
| Database | MongoDB + Mongoose |
| Auth | express-session (cookie-based) |
| Validation | Joi |
| Uploads | Multer + Cloudinary |
| Security | bcrypt, cors, cookie-parser |
| Logging | morgan (dev) |

---

## Installation
```bash
git clone <repo-url>
cd real-state-community
npm install
npm run dev
```
Default port: 5000 (override with PORT).

---

## Environment Variables (names only)
`MONGODB_URI`, `SESSION_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `APP_BASE_URL`, `FRONTEND_ORIGIN`, `NODE_ENV`.

---

## Authentication Flow
1. Register / login returns user JSON + sets `sid` HttpOnly cookie (`SameSite=Lax`, add `Secure` in production).  
2. Subsequent requests send cookie automatically.  
3. Logout destroys session.  
4. Forgot password issues short-lived reset token (email).  
5. Reset password verifies token, updates hash, invalidates token.  
6. Session expiry via `cookie.maxAge` (e.g. 7 days).

---

## Authentication Routes (`/api/auth`)

### `POST /api/auth/register`
Request:
```json
{ "username":"johndoe", "displayName":"John Doe", "email":"john@example.com", "password":"secret123" }
```
Response (201):
```json
{ "id":"<id>", "username":"johndoe", "displayName":"John Doe", "email":"john@example.com", "role":"user" }
```

### `POST /api/auth/login`
Request:
```json
{ "username":"johndoe", "password":"secret123" }
```
Response (200): same shape as register.

### `POST /api/auth/logout`
Response:
```json
{ "message":"Logged out successfully" }
```

### `POST /api/auth/forgot-password`
Request:
```json
{ "email":"john@example.com" }
```
Response:
```json
{ "message":"Reset link sent to your email." }
```

### `POST /api/auth/reset-password`
Request:
```json
{ "token":"<token>", "newPassword":"newSecret123" }
```
Response:
```json
{ "message":"Password has been reset successfully." }
```

### User Object Schema
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Identifier |
| `username` | String | Unique |
| `displayName` | String | Optional |
| `email` | String | Unique |
| `role` | String (user|admin) | Authorization |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

Example:
```json
{ "_id":"665fa112...", "username":"johndoe", "displayName":"John Doe", "email":"john@example.com", "role":"user", "createdAt":"2025-07-01T09:50:00.000Z", "updatedAt":"2025-07-05T14:10:22.000Z" }
```

---

## Property Routes (`/api/properties`)

### `GET /api/properties`
Query params: `page`, `limit`, `state`, `city`, `type`, `forSale`, `minPrice`, `maxPrice`, `sort` (e.g. `-createdAt`, `price`).  
Response:
```json
{
  "page":1,
  "totalPages":5,
  "totalItems":42,
  "itemsOnPage":10,
  "properties":[ /* property objects */ ]
}
```

### `GET /api/properties/:id`
Response:
```json
{ /* property object */ }
```

### `POST /api/properties`
Request:
```json
{
  "title":"Cozy Apartment",
  "description":"2-bed in downtown",
  "price":120000,
  "city":"Austin",
  "state":"Texas",
  "type":"apartment",
  "forSale":true,
  "images":[]
}
```
Response (201): created object.

### `PUT /api/properties/:id`
Partial update:
```json
{ "price":125000, "forSale":false }
```

### `DELETE /api/properties/:id`
Response:
```json
{ "message":"Property deleted successfully" }
```

### `POST /api/properties/:id/images`
Multipart (key: `images`, up to 5 files). Returns updated property.

### Property Object Schema
| Field | Type | Notes |
|-------|------|------|
| `_id` | ObjectId | Identifier |
| `title` | String | Required |
| `description` | String | Required |
| `price` | Number | Required |
| `type` | String enum | `apartment|house|villa|building|store` |
| `city` | String | Required |
| `state` | String enum | US state |
| `images` | String[] | Max 5 |
| `forSale` | Boolean | Default `true` (`false` = rent) |
| `createdBy` | ObjectId (User) | Owner reference |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

Example:
```json
{
  "_id":"665fa8f2...",
  "title":"Cozy Apartment",
  "description":"2-bed in downtown",
  "price":120000,
  "type":"apartment",
  "city":"Austin",
  "state":"Texas",
  "images":["https://.../prop1.jpg"],
  "forSale":true,
  "createdBy":"665fa112...",
  "createdAt":"2025-07-01T10:15:20.000Z",
  "updatedAt":"2025-07-05T14:42:10.000Z"
}
```

---

## Comment Routes (`/api/comments`)

### `POST /api/comments/:propertyId`
Request:
```json
{ "content":"Looks great!" }
```
Response (201): comment object.

### `GET /api/comments/:propertyId`
Response:
```json
[ /* comments */ ]
```

### `PUT /api/comments/:id`
Request:
```json
{ "content":"Updated comment" }
```

### `DELETE /api/comments/:id`
Response:
```json
{ "message":"Deleted" }
```

### Comment Object Schema
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Identifier |
| `property` | ObjectId (Property) | Reference |
| `user` | ObjectId (User) | Author |
| `content` | String | Required |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

Example:
```json
{
  "_id":"66a1c0f2...",
  "property":"665fa8f2...",
  "user":"665fa112...",
  "content":"Looks great!",
  "createdAt":"2025-07-10T12:30:11.000Z",
  "updatedAt":"2025-07-10T12:30:11.000Z"
}
```

---

## Like Routes (`/api/likes`)

### `POST /api/likes`
Request:
```json
{ "propertyId":"665fa8f2..." }
```
Response:
```json
{ "liked":true, "likeId":"66a1c3f9..." }
```

### `GET /api/likes/property/:propertyId`
Response:
```json
[ /* like objects */ ]
```

### `DELETE /api/likes/:id`
Response:
```json
{ "message":"Like removed" }
```

### Like Object Schema
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Identifier |
| `property` | ObjectId (Property) | Reference |
| `user` | ObjectId (User) | Liker |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

Example:
```json
{
  "_id":"66a1c3f9...",
  "property":"665fa8f2...",
  "user":"665fa112...",
  "createdAt":"2025-07-10T13:01:20.000Z",
  "updatedAt":"2025-07-10T13:01:20.000Z"
}
```

---

## Bookmark Routes (`/api/bookmarks`)

### `POST /api/bookmarks`
Request:
```json
{ "propertyId":"665fa8f2..." }
```
Response (201): bookmark object.

### `GET /api/bookmarks`
Response:
```json
[ /* bookmarks */ ]
```

### `DELETE /api/bookmarks/:id`
Response:
```json
{ "message":"Bookmark removed" }
```

### Bookmark Object Schema
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Identifier |
| `property` | ObjectId (Property) | Reference |
| `user` | ObjectId (User) | Owner |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

Example:
```json
{
  "_id":"66a1c6a3...",
  "property":"665fa8f2...",
  "user":"665fa112...",
  "createdAt":"2025-07-10T13:15:42.000Z",
  "updatedAt":"2025-07-10T13:15:42.000Z"
}
```

---

## Message Routes (`/api/messages`)

### `POST /api/messages`
Request:
```json
{ "receiverId":"665fa224...", "content":"Hello!" }
```
Response (201): message object.

### `GET /api/messages/:withUserId`
Response:
```json
[ /* messages */ ]
```

### `DELETE /api/messages/:id`
Response:
```json
{ "message":"Message deletion recorded" }
```

### Message Object Schema
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Identifier |
| `sender` | ObjectId (User) | Sender |
| `receiver` | ObjectId (User) | Receiver |
| `content` | String | Required |
| `deletedBy` | ObjectId[] | Soft-delete tracking |
| `createdAt` | Date | Timestamp |
| `updatedAt` | Date | Timestamp |

Example:
```json
{
  "_id":"66a1c8db...",
  "sender":"665fa112...",
  "receiver":"665fa224...",
  "content":"Hello!",
  "deletedBy":[],
  "createdAt":"2025-07-10T13:24:05.000Z",
  "updatedAt":"2025-07-10T13:24:05.000Z"
}
```

---

## Admin Routes (`/api/admin`)

### `GET /api/admin/users`
Returns array of users (non-sensitive).

### `PUT /api/admin/users/:id/promote`
Response:
```json
{ "message":"<username> promoted to admin" }
```

### `PUT /api/admin/users/:id/demote`
Response:
```json
{ "message":"<username> demoted to user" }
```

### `DELETE /api/admin/users/:id`
Response:
```json
{ "message":"User deleted successfully" }
```

### `DELETE /api/admin/property/:id`
Response:
```json
{ "message":"Property deleted by admin" }
```

### `DELETE /api/admin/comment/:id`
Response:
```json
{ "message":"Comment deleted by admin" }
```

### `DELETE /api/admin/message/:id`
Response:
```json
{ "message":"Message deleted by admin" }
```

---

## Validation Summary
| Model | Field | Rule |
|-------|-------|------|
| User | username | Required, unique |
| User | email | Required, unique, email |
| User | password | Required, min length (e.g. 6+) |
| Property | title | Required |
| Property | price | Required, positive |
| Property | type | Enum |
| Property | state | Enum (US states) |
| Property | images | Max 5 |
| Comment | content | Required |
| Like | (user, property) | Unique pair |
| Bookmark | (user, property) | Unique pair |
| Message | content | Required |

---

## Pagination & Sorting
Defaults: `page=1`, `limit=10` (cap 50).  
Sort param: `sort=field` ascending, `sort=-field` descending. Supported fields: `createdAt`, `price` (extend as needed).

---

## Status Codes
| Endpoint | Success |
|----------|---------|
| POST /api/auth/register | 201 |
| POST /api/auth/login | 200 |
| POST /api/auth/logout | 200 |
| POST /api/auth/forgot-password | 200 |
| POST /api/auth/reset-password | 200 |
| GET /api/properties | 200 |
| POST /api/properties | 201 |
| PUT /api/properties/:id | 200 |
| DELETE /api/properties/:id | 200 |
| POST /api/comments/:propertyId | 201 |
| DELETE /api/comments/:id | 200 |
| POST /api/likes | 200 |
| POST /api/bookmarks | 201 |
| POST /api/messages | 201 |

Errors: 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict), 500 (server).

---

## Indexes
| Collection | Index |
|------------|-------|
| properties | `{ state:1, city:1, type:1 }` |
| properties | `{ createdAt:-1 }` |
| likes | `{ user:1, property:1 }` unique |
| bookmarks | `{ user:1, property:1 }` unique |
| comments | `{ property:1, createdAt:-1 }` |
| messages | `{ sender:1, receiver:1, createdAt:-1 }` |

---

## Security
| Aspect | Status | Recommendation |
|--------|--------|---------------|
| Password hashing | bcrypt | >=10 rounds |
| Session cookie | HttpOnly | Add Secure + Strict in prod |
| Validation | Joi | Apply everywhere |
| Rate limiting | Pending | Add for auth & reset routes |
| Helmet | Pending | Add `helmet()` |
| Reset tokens | One-time | Store hashed only |
| CORS | Credentials | Restrict origin |

---

## Design Notes
- Session-based auth (simplifies invalidation).
- Flat JSON responses; pagination object wraps arrays.
- Soft delete for messages only (others hard delete).
- Image URLs stored directly (no binary).

---

## Time & Locale
All timestamps UTC ISO strings. Client handles localization.

---

## Roadmap
Notifications, reports, purpose field (`sale|rent`), property analytics, indexing refinements, rate limiting, test suite, i18n, conversation model (group chats).

---

## Deployment
1. Set env vars on host.  
2. Use persistent session store (Redis/Mongo).  
3. Enforce HTTPS (Secure cookies).  
4. Restrict CORS origin.  
5. Add structured logging & health endpoint (`/health`).

---

## Logging & Monitoring
Development: morgan. Production: add structured logger + uptime/health checks.

---

## Error Response Shape (recommended)
```json
{
  "error":"ValidationError",
  "message":"Invalid request body",
  "details":[{ "field":"title","message":"Required" }]
}
```

---

## License
Add a license section if distributing publicly.

