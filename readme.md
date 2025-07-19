# Real Estate Community API

A RESTful backend for a real-estate community application built with Node.js, Express, MongoDB, and session-based authentication. Users can register, authenticate, reset passwords, create and browse properties, comment, like, bookmark, and send direct messages. Admins can moderate content and manage users.

---

## Authentication Routes (`/api/auth`)

All authentication uses **cookie-based sessions** (`HttpOnly`, `SameSite=Lax`).

### `POST /api/auth/register`
**Description:** Create a new user session.  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "username": "johndoe",
  "displayName": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```
**Response:**
```json
{
  "id": "60f7a1b2c3d4e5f67890abcd",
  "username": "johndoe",
  "displayName": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```
**Cookie Set:** `sid=<session-id>; HttpOnly; SameSite=Lax`

### `POST /api/auth/login`
**Description:** Authenticate an existing user.  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "username": "johndoe",
  "password": "secret123"
}
```
**Response:**
```json
{
  "id": "60f7a1b2c3d4e5f67890abcd",
  "username": "johndoe",
  "displayName": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```
**Cookie Set:** `sid=<session-id>; HttpOnly; SameSite=Lax`

### `POST /api/auth/logout`
**Description:** Destroy the active session.  
**Headers:** Session cookie.  
**Body:** _none_  
**Response:**
```json
{ "message": "Logged out successfully" }
```
**Cookie Cleared:** `sid`

### `POST /api/auth/forgot-password`
**Description:** Issue a password reset token and email it.  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{ "email": "john@example.com" }
```
**Response:**
```json
{ "message": "Reset link sent to your email." }
```

### `POST /api/auth/reset-password`
**Description:** Reset a password using a valid token.  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "token": "the-reset-token",
  "newPassword": "newSecret123"
}
```
**Response:**
```json
{ "message": "Password has been reset successfully." }
```

---

## Property Routes (`/api/properties`)

All property endpoints require authentication (session cookie).

### `GET /api/properties`
**Query Parameters (optional):** `page`, `limit`, `state`, `city`, `type`, `forSale`, `minPrice`, `maxPrice`  
**Response:**
```json
{
  "page": 1,
  "totalPages": 5,
  "totalItems": 42,
  "itemsOnPage": 10,
  "properties": [ /* array of property objects */ ]
}
```

### `GET /api/properties/:id`
**Description:** Fetch one property by ID.  
**Response:**
```json
{ /* single property object */ }
```

### `POST /api/properties`
**Description:** Create a property.  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "title": "Cozy Apartment",
  "description": "2-bed in downtown",
  "price": 120000,
  "city": "Austin",
  "state": "Texas",
  "type": "apartment",
  "forSale": true,
  "images": []
}
```
**Response:**
```json
{ /* created property object */ }
```

### `PUT /api/properties/:id`
**Description:** Update a property (owner or admin).  
**Body (partial):**
```json
{ "price": 125000, "forSale": false }
```
**Response:**
```json
{ /* updated property object */ }
```

### `DELETE /api/properties/:id`
**Description:** Delete a property (owner or admin).  
**Response:**
```json
{ "message": "Property deleted successfully" }
```

### `POST /api/properties/:id/images`
**Description:** Upload up to 5 images (multipart, key: images).  
**Headers:** `Content-Type: multipart/form-data`  
**Response:**
```json
{ /* property object with new image URLs */ }
```

### Property Object Schema (API Response Shape)

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | Yes | Auto-generated |
| `title` | String | Yes | Property title |
| `description` | String | Yes | Description text |
| `price` | Number | Yes | Current price |
| `type` | String (enum) | Yes | `apartment` \| `house` \| `villa` \| `building` \| `store` |
| `city` | String | Yes | City name |
| `state` | String (enum) | Yes | US state (from predefined list) |
| `images` | String[] | No | Image URLs (max 5 recommended) |
| `forSale` | Boolean | No (default: true) | `true` = for sale, `false` interpreted as for rent |
| `createdBy` | ObjectId (User) | Yes | Reference to user |
| `createdAt` | Date | Yes | Timestamp (auto) |
| `updatedAt` | Date | Yes | Timestamp (auto) |

**Single Object Example:**
```json
{
  "_id": "665fa8f2b7c1d243c0e8d91a",
  "title": "Cozy Apartment",
  "description": "2-bed in downtown",
  "price": 120000,
  "type": "apartment",
  "city": "Austin",
  "state": "Texas",
  "images": ["https://.../prop1.jpg"],
  "forSale": true,
  "createdBy": "665fa112b7c1d243c0e8d8ff",
  "createdAt": "2025-07-01T10:15:20.000Z",
  "updatedAt": "2025-07-05T14:42:10.000Z"
}
```

**Paginated List Example:**
```json
{
  "page": 1,
  "totalPages": 5,
  "totalItems": 74,
  "itemsOnPage": 15,
  "properties": [
    {
      "_id": "665fa8f2b7c1d243c0e8d91a",
      "title": "Cozy Apartment",
      "price": 120000,
      "type": "apartment",
      "city": "Austin",
      "state": "Texas",
      "forSale": true,
      "images": ["https://.../prop1.jpg"]
    }
  ]
}
```

**Filtering Parameters:**
| Param | Example | Description |
|-------|---------|-------------|
| `state` | `?state=Texas` | Filter by state |
| `city` | `?city=Austin` | Filter by city |
| `type` | `?type=apartment` | Filter by property type |
| `forSale` | `?forSale=true` | For sale (`true`) or for rent (`false`) |
| `minPrice` | `?minPrice=50000` | Minimum price |
| `maxPrice` | `?maxPrice=200000` | Maximum price |
| Combined | `?state=Texas&type=apartment&minPrice=80000` | Compound filters |

**Frontend Notes:**
- Use exact field names (case-sensitive).
- Interpret `forSale: false` as rental listings (consider adding a dedicated `purpose` field later).
- Enforce client-side limit of 5 images before upload.
- Implement dropdowns for `type` and `state` based on enums.
- Consider adding indexes on `state`, `city`, `type` and a compound `{ state, city, type }` for scalability.

**Optional Future Enhancements:**
| Enhancement | Reason |
|-------------|--------|
| Add `purpose: "sale" | "rent"` | Explicit intent |
| Add `coverImage` | Faster listing rendering |
| Add `views`, `favoritesCount` | Analytics & engagement |
| Virtual `id` field | Front-end convenience |
| Compound index `{ state, city, type }` | Query performance |

---

## Comment Routes (`/api/comments`)

### `POST /api/comments/:propertyId`
**Body:**
```json
{ "content": "Looks great!" }
```
**Response:**
```json
{ /* created comment object */ }
```

### `GET /api/comments/:propertyId`
**Description:** List comments for a property.  
**Response:**
```json
[ /* array of comments */ ]
```

### `PUT /api/comments/:id`
**Body:**
```json
{ "content": "Updated comment" }
```
**Response:**
```json
{ /* updated comment object */ }
```

### `DELETE /api/comments/:id`
**Description:** Delete own comment.  
**Response:**
```json
{ "message": "Deleted" }
```

---

## Like Routes (`/api/likes`)

### `POST /api/likes`
**Body:**
```json
{ "propertyId": "60f7..." }
```
**Response:**
```json
{ "liked": true, "likeId": "..." }
```

### `GET /api/likes/property/:propertyId`
**Description:** List likes on a property.  
**Response:**
```json
[ /* array of like objects */ ]
```

### `DELETE /api/likes/:id`
**Description:** Remove a like.  
**Response:**
```json
{ "message": "Like removed" }
```

---

## Bookmark Routes (`/api/bookmarks`)

### `POST /api/bookmarks`
**Body:**
```json
{ "propertyId": "60f7..." }
```
**Response:**
```json
{ /* created bookmark object */ }
```

### `GET /api/bookmarks`
**Description:** List current user's bookmarks.  
**Response:**
```json
[ /* array of bookmark objects */ ]
```

### `DELETE /api/bookmarks/:id`
**Description:** Remove a bookmark.  
**Response:**
```json
{ "message": "Bookmark removed" }
```

---

## Message Routes (`/api/messages`)

### `POST /api/messages`
**Body:**
```json
{ "receiverId": "60f7...", "content": "Hello!" }
```
**Response:**
```json
{ /* created message object */ }
```

### `GET /api/messages/:withUserId`
**Description:** Conversation with another user.  
**Response:**
```json
[ /* array of messages */ ]
```

### `DELETE /api/messages/:id`
**Description:** Soft-delete (recorded deletion) for the sender or per implemented logic.  
**Response:**
```json
{ "message": "Message deletion recorded" }
```

---

## Admin Routes (`/api/admin`)

### `GET /api/admin/users`
**Description:** List users (non-sensitive fields).  
**Response:**
```json
[ /* users */ ]
```

### `PUT /api/admin/users/:id/promote`
**Description:** Promote a user to admin.  
**Response:**
```json
{ "message": "username promoted to admin" }
```

### `PUT /api/admin/users/:id/demote`
**Description:** Demote an admin to user.  
**Response:**
```json
{ "message": "username demoted to user" }
```

### `DELETE /api/admin/users/:id`
**Description:** Delete a user.  
**Response:**
```json
{ "message": "User deleted successfully" }
```

### `DELETE /api/admin/property/:id`
**Description:** Delete any property.  
**Response:**
```json
{ "message": "Property deleted by admin" }
```

### `DELETE /api/admin/comment/:id`
**Description:** Delete any comment.  
**Response:**
```json
{ "message": "Comment deleted by admin" }
```

### `DELETE /api/admin/message/:id`
**Description:** Delete any message.  
**Response:**
```json
{ "message": "Message deleted by admin" }
```

---

## Notes

- **Error Handling:** Centralized middleware.  
- **Validation:** Joi + request body validator.  
- **CORS & Cookies:** `cors({ credentials: true })` + `cookie-parser` (ensure client sets `credentials: "include"` or `withCredentials: true`).

---

## Front-End Integration

Use `fetch` with `credentials: "include"` or Axios with `withCredentials: true` to send the session cookie on every request.

