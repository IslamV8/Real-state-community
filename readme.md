# Real Estate Community API

A RESTful backend for a real-estate community application, built with Node.js, Express, MongoDB, and session-based authentication. Users can register, log in/out, reset passwords, create and browse properties, comment, like, bookmark, and message each other. Admins can manage content and users.

---

## Authentication Routes (`/api/auth`)

> All routes under `/api/auth` use **cookie-based sessions** (`HttpOnly`, `SameSite=Lax`).

### `POST /api/auth/register`
- **Description**: Create a new user and start a session.
- **Headers**:  
  - `Content-Type: application/json`  
- **Body**:
  ```json
  {
    "username": "johndoe",
    "displayName": "John Doe",
    "email": "john@example.com",
    "password": "secret123"
  }
  ```
- **Response**:  
  ```json
  {
    "id": "60f7a1b2c3d4e5f67890abcd",
    "username": "johndoe",
    "displayName": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
  ```
- **Cookie Set**: `sid=<session-id>; HttpOnly; SameSite=Lax`

### `POST /api/auth/login`
- **Description**: Authenticate an existing user and start a session.
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "password": "secret123"
  }
  ```
- **Response**:  
  ```json
  {
    "id": "60f7a1b2c3d4e5f67890abcd",
    "username": "johndoe",
    "displayName": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
  ```
- **Cookie Set**: `sid=<session-id>; HttpOnly; SameSite=Lax`

### `POST /api/auth/logout`
- **Description**: Destroy the user’s session and clear the cookie.
- **Headers**:  
  - Include the `sid` cookie automatically.
- **Body**: _none_
- **Response**:  
  ```json
  { "message": "Logged out successfully" }
  ```
- **Cookie Cleared**: `sid`

### `POST /api/auth/forgot-password`
- **Description**: Request a password reset link. Generates a time-limited token and sends it via email.
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Response**:  
  ```json
  { "message": "Reset link sent to your email." }
  ```

### `POST /api/auth/reset-password`
- **Description**: Reset password using the token received by email.
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "token": "the-reset-token",
    "newPassword": "newSecret123"
  }
  ```
- **Response**:  
  ```json
  { "message": "Password has been reset successfully." }
  ```

---

## Property Routes (`/api/properties`)

> All property routes **require** authentication. Front-end must send the `sid` cookie with each request.

### `GET /api/properties`
- **Query Parameters** (optional):
  - `page` (number)  
  - `limit` (number)  
  - `state`, `city`, `type`, `forSale`, `minPrice`, `maxPrice`
- **Response**:
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
- **Description**: Fetch one property by ID.
- **Response**:  
  ```json
  { /* single property object */ }
  ```

### `POST /api/properties`
- **Description**: Create a new property.
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
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
- **Response**:
  ```json
  { /* created property object */ }
  ```

### `PUT /api/properties/:id`
- **Description**: Update fields of an existing property (owner or admin only).
- **Body** (any subset):
  ```json
  { "price": 125000, "forSale": false }
  ```
- **Response**:
  ```json
  { /* updated property object */ }
  ```

### `DELETE /api/properties/:id`
- **Description**: Delete a property (owner or admin only).
- **Response**:
  ```json
  { "message": "Property deleted successfully" }
  ```

### `POST /api/properties/:id/images`
- **Description**: Upload up to 5 images to Cloudinary.
- **Headers**:  
  - `Content-Type: multipart/form-data`
- **Form-Data**:
  - Key: `images` (File), up to 5 files
- **Response**:
  ```json
  { /* property object with new images URLs */ }
  ```

---

## Comment Routes (`/api/comments`)

> **Authenticated** routes for commenting on properties.

### `POST /api/comments/:propertyId`
- **Body**:
  ```json
  { "content": "Looks great!" }
  ```
- **Response**:
  ```json
  { /* created comment object */ }
  ```

### `GET /api/comments/:propertyId`
- **Description**: List all comments for a property.
- **Response**:
  ```json
  [ /* array of comments */ ]
  ```

### `PUT /api/comments/:id`
- **Body**:
  ```json
  { "content": "Updated comment" }
  ```
- **Response**:
  ```json
  { /* updated comment object */ }
  ```

### `DELETE /api/comments/:id`
- **Description**: Delete your own comment.
- **Response**:
  ```json
  { "message": "Deleted" }
  ```

---

## Like Routes (`/api/likes`)

> **Authenticated** toggle & fetch likes.

### `POST /api/likes`
- **Body**:
  ```json
  { "propertyId": "60f7..." }
  ```
- **Response**:
  ```json
  { "liked": true, "likeId": "..." }
  ```

### `GET /api/likes/property/:propertyId`
- **Description**: Get all likes on a property.
- **Response**:
  ```json
  [ /* array of like objects */ ]
  ```

### `DELETE /api/likes/:id`
- **Description**: Remove a like (owner or admin).
- **Response**:
  ```json
  { "message": "Like removed" }
  ```


---

## Bookmark Routes (`/api/bookmarks`)

> **Authenticated** bookmark management.

### `POST /api/bookmarks`
- **Body**:
  ```json
  { "propertyId": "60f7..." }
  ```
- **Response**:
  ```json
  { /* created bookmark object */ }
  ```

### `GET /api/bookmarks`
- **Description**: List your bookmarks.
- **Response**:
  ```json
  [ /* array of bookmark objects */ ]
  ```

### `DELETE /api/bookmarks/:id`
- **Description**: Remove a bookmark.
- **Response**:
  ```json
  { "message": "Bookmark removed" }
  ```


---

## Message Routes (`/api/messages`)

> **Authenticated** one-to-one messaging.

### `POST /api/messages`
- **Body**:
  ```json
  { "receiverId": "60f7...", "content": "Hello!" }
  ```
- **Response**:
  ```json
  { /* created message object */ }
  ```

### `GET /api/messages/:withUserId`
- **Description**: Get conversation with another user.
- **Response**:
  ```json
  [ /* array of messages */ ]
  ```

### `DELETE /api/messages/:id`
- **Description**: Delete a message for you.
- **Response**:
  ```json
  { "message": "Message deletion recorded" }
  ```


---

## Admin Routes (`/api/admin`)

> **Admins only** (`role: "admin"`).

### `GET /api/admin/users`
- **Description**: List all users.
- **Response**:
  ```json
  [ /* array of users without passwords */ ]
  ```

### `PUT /api/admin/users/:id/promote`
- **Description**: Make a user an admin.
- **Response**:
  ```json
  { "message": "username promoted to admin" }
  ```

### `PUT /api/admin/users/:id/demote`
- **Description**: Revoke admin rights.
- **Response**:
  ```json
  { "message": "username demoted to user" }
  ```

### `DELETE /api/admin/users/:id`
- **Description**: Delete a user.
- **Response**:
  ```json
  { "message": "User deleted successfully" }
  ```

### `DELETE /api/admin/property/:id`
- **Description**: Admin-delete any property.
- **Response**:
  ```json
  { "message": "Property deleted by admin" }
  ```

### `DELETE /api/admin/comment/:id`
- **Description**: Admin-delete any comment.
- **Response**:
  ```json
  { "message": "Comment deleted by admin" }
  ```

### `DELETE /api/admin/message/:id`
- **Description**: Admin-delete any message.
- **Response**:
  ```json
  { "message": "Message deleted by admin" }
  ```

---

## Notes

- **Error Handling**: Centralized `errorHandler` middleware.  
- **Validation**: Joi schemas + `validateBody` middleware.  
- **CORS & Cookies**: `cors({ credentials: true })` + `cookie-parser`.

---

## Front-End Integration

- Use `credentials: "include"` (fetch) or `withCredentials: true` (axios) to send session cookie.
