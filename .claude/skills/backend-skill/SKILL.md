---
name: backend-skill
description: Build backend systems by generating routes, handling requests/responses, and connecting to databases.
---

# Backend Skill

## Instructions

1. **Route Generation**
   - Define RESTful endpoints (GET, POST, PUT, DELETE)
   - Group related routes logically
   - Follow clear naming conventions
   - Use route parameters and query strings effectively

2. **Request & Response Handling**
   - Parse incoming requests (body, params, query)
   - Send structured responses (JSON, status codes)
   - Handle errors and send meaningful messages
   - Implement middleware for logging, authentication, or validation

3. **Database Connectivity**
   - Connect to relational or NoSQL databases
   - Use ORM or query builder for cleaner queries
   - Handle database errors gracefully
   - Close connections or use connection pooling

4. **Middleware & Utilities**
   - Validate request data before processing
   - Authenticate and authorize users
   - Use logging for debugging and monitoring
   - Implement CORS, rate-limiting, or other middleware as needed

5. **Error Handling**
   - Catch and log errors centrally
   - Return proper HTTP status codes
   - Avoid exposing sensitive information in responses
   - Provide fallback or default responses

## Best Practices
- Keep routes modular and maintainable
- Use async/await or Promises for asynchronous code
- Centralize configuration (DB, server, environment variables)
- Validate all incoming data
- Follow consistent naming and response structure
- Test endpoints using tools like Postman or curl

## Example Structure

### Express Route Example
```js
import express from "express";
import { getUsers, createUser } from "./controllers/userController.js";

const router = express.Router();

router.get("/users", getUsers);
router.post("/users", createUser);

export default router;
