# API Contract: Task Management Endpoints

**Date**: 2026-01-09
**Feature**: 001-backend-todo-crud
**Version**: 1.0.0

## Overview

This document defines the API contract for the task management functionality. It specifies the endpoints, request/response formats, and error handling for all task-related operations.

## Base URL

```
https://api.example.com/api/v1  # Production
http://localhost:8000           # Development
```

## Common Headers

### Request Headers
- `Content-Type: application/json` (For POST, PUT, PATCH requests)

### Response Headers
- `Content-Type: application/json`

## Common Error Responses

All error responses follow this format:

```json
{
  "detail": "Human-readable error message"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `INTERNAL_ERROR`: Unexpected server error

---

## Endpoints

### 1. Get All Tasks
```
GET /tasks
```

#### Description
Retrieves all tasks in the system.

#### Request Headers
```
Content-Type: application/json
```

#### Response Codes
- `200 OK`: Tasks retrieved successfully
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (200)
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Task title",
    "description": "Task description",
    "completed": false,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

---

### 2. Create Task
```
POST /tasks
```

#### Description
Creates a new task.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "Task title",
  "description": "Optional task description"
}
```

**Request Body Schema:**
- `title` (string, required): Task title (max 255 characters)
- `description` (string, optional): Task description

#### Response Codes
- `201 Created`: Task created successfully
- `422 Unprocessable Entity`: Validation error in request body
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (201)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Task title",
  "description": "Optional task description",
  "completed": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Error Response (422)
```json
{
  "detail": "Validation error: title is required and must be less than 255 characters"
}
```

---

### 3. Get Specific Task
```
GET /tasks/{id}
```

#### Description
Retrieves a specific task by ID.

#### Path Parameters
- `id` (string): UUID of the task to retrieve

#### Request Headers
```
Content-Type: application/json
```

#### Response Codes
- `200 OK`: Task retrieved successfully
- `404 Not Found`: Task does not exist
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Task title",
  "description": "Task description",
  "completed": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Error Response (404)
```json
{
  "detail": "Task not found"
}
```

---

### 4. Update Task
```
PUT /tasks/{id}
```

#### Description
Updates a specific task by ID.

#### Path Parameters
- `id` (string): UUID of the task to update

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "Updated task title",
  "description": "Updated task description"
}
```

**Request Body Schema:**
- `title` (string, required): Task title (max 255 characters)
- `description` (string, optional): Task description

#### Response Codes
- `200 OK`: Task updated successfully
- `422 Unprocessable Entity`: Validation error in request body
- `404 Not Found`: Task does not exist
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated task title",
  "description": "Updated task description",
  "completed": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T10:30:00Z"
}
```

---

### 5. Delete Task
```
DELETE /tasks/{id}
```

#### Description
Deletes a specific task by ID.

#### Path Parameters
- `id` (string): UUID of the task to delete

#### Request Headers
```
Content-Type: application/json
```

#### Response Codes
- `204 No Content`: Task deleted successfully
- `404 Not Found`: Task does not exist
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (204)
```
[Empty response body]
```

#### Error Response (404)
```json
{
  "detail": "Task not found"
}
```

---

### 6. Toggle Task Completion
```
PATCH /tasks/{id}/complete
```

#### Description
Toggles the completion status of a specific task by ID.

#### Path Parameters
- `id` (string): UUID of the task to update

#### Request Headers
```
Content-Type: application/json
```

#### Response Codes
- `200 OK`: Task completion status toggled successfully
- `404 Not Found`: Task does not exist
- `500 Internal Server Error`: Unexpected server error

#### Successful Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Original task title",
  "description": "Original task description",
  "completed": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T10:30:00Z"
}
```

#### Error Response (404)
```json
{
  "detail": "Task not found"
}
```

---

## Performance Guidelines

### Response Times
- 95% of requests should respond within 500ms
- 99% of requests should respond within 1000ms

### Pagination
- Collection endpoints support pagination (future enhancement)
- Default limit is 20 items per page
- Maximum limit is 100 items per page