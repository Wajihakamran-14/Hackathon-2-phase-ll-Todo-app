# API Contract: Authentication Endpoints for Todo API

**Date**: 2026-01-09
**Feature**: 002-auth-jwt-better
**Version**: 1.0.0

## Overview

This document defines the API contract for authentication functionality in the Todo API. It specifies the endpoints, request/response formats, authentication requirements, and error handling for all authentication-related operations.

## Base URL

```
https://api.example.com/api/v1  # Production
http://localhost:8000/api/v1    # Development
```

## Authentication

Most endpoints require a valid JWT token in the Authorization header, except for public endpoints like `/auth/login` and `/auth/register`.

```
Authorization: Bearer <jwt_token_here>
```

## Common Headers

### Request Headers
- `Authorization: Bearer <token>` (Required for protected endpoints)
- `Content-Type: application/json` (For POST, PUT, PATCH requests)

### Response Headers
- `Content-Type: application/json`
- `X-Request-ID: <uuid>` (For request tracing)

## Common Error Responses

All error responses follow this format:

```json
{
  "detail": "Human-readable error message",
  "error_code": "ERROR_CODE_CONSTANT"
}
```

### Common Error Codes
- `AUTHENTICATION_ERROR`: Invalid or missing authentication token
- `AUTHORIZATION_ERROR`: User not authorized for this resource
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `INTERNAL_ERROR`: Unexpected server error

---

## Public Authentication Endpoints

These endpoints do NOT require authentication.

### 1. User Registration
```
POST /auth/register
```

#### Description
Registers a new user account and returns authentication tokens.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirm_password": "securePassword123"
}
```

**Request Body Schema:**
- `email` (string, required): User's email address (valid email format)
- `password` (string, required): User's password (min 8 characters)
- `confirm_password` (string, required): Password confirmation (must match password)

#### Response Codes
- `201 Created`: User registered successfully
- `400 Bad Request`: Validation error in request body
- `409 Conflict`: User with this email already exists
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (201)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

#### Error Response (400)
```json
{
  "detail": "Validation error: email must be a valid email address",
  "error_code": "VALIDATION_ERROR"
}
```

#### Error Response (409)
```json
{
  "detail": "User with this email already exists",
  "error_code": "USER_EXISTS_ERROR"
}
```

---

### 2. User Login
```
POST /auth/login
```

#### Description
Authenticates a user and returns authentication tokens.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Request Body Schema:**
- `email` (string, required): User's email address (valid email format)
- `password` (string, required): User's password

#### Response Codes
- `200 OK`: Login successful
- `400 Bad Request`: Validation error in request body
- `401 Unauthorized`: Invalid email or password
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (200)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "created_at": "2023-01-01T00:00:00Z"
  }
}
```

#### Error Response (401)
```json
{
  "detail": "Incorrect email or password",
  "error_code": "AUTHENTICATION_ERROR"
}
```

---

### 3. Token Refresh
```
POST /auth/refresh
```

#### Description
Refreshes an existing access token using a refresh token.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body Schema:**
- `refresh_token` (string, required): Valid refresh token

#### Response Codes
- `200 OK`: Token refreshed successfully
- `400 Bad Request`: Validation error in request body
- `401 Unauthorized`: Invalid or expired refresh token
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (200)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## Protected Endpoints (Require Authentication)

These endpoints require a valid JWT token in the Authorization header.

### 4. Get Current User
```
GET /auth/me
```

#### Description
Retrieves information about the currently authenticated user.

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Response Codes
- `200 OK`: User information retrieved successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2023-01-01T00:00:00Z"
}
```

---

### 5. User Logout
```
POST /auth/logout
```

#### Description
Logs out the current user (client-side token invalidation).

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Response Codes
- `200 OK`: Logout successful
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (200)
```json
{
  "message": "Successfully logged out"
}
```

---

## Task Endpoints with Authentication

All existing task endpoints now require authentication. Below are the updated specifications:

### 6. Create Task (Protected)
```
POST /tasks
```

#### Description
Creates a new task for the authenticated user.

#### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "Task title",
  "description": "Optional task description",
  "status": "todo"
}
```

**Request Body Schema:**
- `title` (string, required): Task title (max 255 characters)
- `description` (string, optional): Task description
- `status` (string, optional): Task status, default "todo" (values: "todo", "in_progress", "done")

#### Response Codes
- `201 Created`: Task created successfully
- `400 Bad Request`: Validation error in request body
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (201)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Task title",
  "description": "Optional task description",
  "status": "todo",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

---

### 7. Get User Tasks (Protected)
```
GET /tasks
```

#### Description
Retrieves all tasks owned by the authenticated user.

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Query Parameters
- `limit` (integer, optional): Maximum number of tasks to return (default: 20, max: 100)
- `offset` (integer, optional): Number of tasks to skip (for pagination)
- `status` (string, optional): Filter tasks by status (values: "todo", "in_progress", "done")

#### Response Codes
- `200 OK`: Tasks retrieved successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (200)
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Task title",
      "description": "Task description",
      "status": "todo",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

### 8. Get Specific Task (Protected)
```
GET /tasks/{id}
```

#### Description
Retrieves a specific task owned by the authenticated user.

#### Path Parameters
- `id` (string): UUID of the task to retrieve

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Response Codes
- `200 OK`: Task retrieved successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User does not own this task
- `404 Not Found`: Task does not exist
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Task title",
  "description": "Task description",
  "status": "todo",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Error Response (403)
```json
{
  "detail": "You do not have permission to access this task",
  "error_code": "AUTHORIZATION_ERROR"
}
```

---

### 9. Update Task (Protected)
```
PUT /tasks/{id}
```

#### Description
Updates a specific task owned by the authenticated user.

#### Path Parameters
- `id` (string): UUID of the task to update

#### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "status": "in_progress"
}
```

**Request Body Schema:**
- `title` (string, required): Task title (max 255 characters)
- `description` (string, optional): Task description
- `status` (string, required): Task status (values: "todo", "in_progress", "done")

#### Response Codes
- `200 OK`: Task updated successfully
- `400 Bad Request`: Validation error in request body
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User does not own this task
- `404 Not Found`: Task does not exist
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated task title",
  "description": "Updated task description",
  "status": "in_progress",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T10:30:00Z"
}
```

---

### 10. Partially Update Task (Protected)
```
PATCH /tasks/{id}
```

#### Description
Partially updates a specific task owned by the authenticated user.

#### Path Parameters
- `id` (string): UUID of the task to update

#### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "status": "done"
}
```

**Request Body Schema (all fields optional):**
- `title` (string, optional): Task title (max 255 characters)
- `description` (string, optional): Task description
- `status` (string, optional): Task status (values: "todo", "in_progress", "done")

#### Response Codes
- `200 OK`: Task updated successfully
- `400 Bad Request`: Validation error in request body
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User does not own this task
- `404 Not Found`: Task does not exist
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Original task title",
  "description": "Original task description",
  "status": "done",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T10:30:00Z"
}
```

---

### 11. Delete Task (Protected)
```
DELETE /tasks/{id}
```

#### Description
Deletes a specific task owned by the authenticated user.

#### Path Parameters
- `id` (string): UUID of the task to delete

#### Request Headers
```
Authorization: Bearer <jwt_token>
```

#### Response Codes
- `204 No Content`: Task deleted successfully
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User does not own this task
- `404 Not Found`: Task does not exist
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (204)
```
[Empty response body]
```

#### Error Response (403)
```json
{
  "detail": "You do not have permission to delete this task",
  "error_code": "AUTHORIZATION_ERROR"
}
```

---

## Security Considerations

### Authentication
- All protected endpoints require a valid JWT token
- Tokens must be included in the Authorization header
- Expired tokens will result in 401 responses

### Authorization
- Users can only access tasks they own
- Attempts to access another user's task results in 403 Forbidden
- Task ownership is verified on each request using the user ID from the JWT token

### Data Validation
- All input data is validated before processing
- Malformed requests return 400 Bad Request
- Character limits are enforced on text fields

### Rate Limiting
- Authentication endpoints may be subject to rate limiting
- Excessive requests may result in 429 Too Many Requests
- Rate limits are applied per IP address and/or user account

## Performance Guidelines

### Response Times
- 95% of authenticated requests should respond within 500ms
- 99% of authenticated requests should respond within 1000ms

### Token Expiration
- Access tokens expire after 7 days (configurable)
- Refresh tokens (if implemented) have longer expiration
- Clients should handle token expiration gracefully