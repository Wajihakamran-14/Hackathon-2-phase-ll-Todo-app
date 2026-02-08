# Research: Authentication for Todo Full-Stack Web Application (Hackathon Phase-2, Spec 2)

**Date**: 2026-01-09
**Feature**: 002-auth-jwt-better
**Status**: Completed

## Overview

Research and analysis for implementing secure multi-user authentication using Better Auth on the frontend and JWT-based authorization verification in the FastAPI backend. This document analyzes the technical approach, security considerations, and implementation strategy for integrating authentication into the existing backend.

## Architecture Analysis

### 1. Authentication Flow Design

The authentication system will implement a standard JWT-based flow:

1. **User Authentication** (Frontend):
   - User signs in via Better Auth
   - Better Auth issues JWT token with user information
   - Token is stored in session/local storage

2. **API Request Flow** (Frontend → Backend):
   - Frontend attaches JWT to Authorization header (Bearer token)
   - Request reaches backend with token

3. **Token Verification** (Backend):
   - Middleware extracts JWT from Authorization header
   - Token signature verified using shared secret
   - Token expiry validated
   - User information extracted from claims

4. **Authorization Enforcement**:
   - Request context enriched with user information
   - Task endpoints verify user ownership before operations

### 2. JWT Implementation Strategy

#### Token Structure
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Claims**:
  - `sub`: User ID (UUID)
  - `email`: User email address
  - `exp`: Expiration timestamp (7 days from issue)
  - `iat`: Issued at timestamp
  - `jti`: JWT ID (optional for revocation)

#### Token Lifecycle
- **Issuance**: By Better Auth on successful authentication
- **Storage**: In frontend session/storage
- **Transmission**: Via Authorization: Bearer header
- **Verification**: On every protected backend request
- **Expiry**: 7-day validity period (configurable)

### 3. Security Considerations

#### Threat Mitigation
1. **Token Tampering**: HS256 signature verification with strong secret
2. **Token Theft**: Short expiry times and secure transmission (HTTPS)
3. **Session Hijacking**: Per-request token validation
4. **Brute Force**: Rate limiting on authentication endpoints

#### Best Practices
1. **Secret Management**: Environment variable storage of `BETTER_AUTH_SECRET`
2. **Token Storage**: Secure frontend storage with XSS protection
3. **Transport Security**: HTTPS enforcement
4. **Input Validation**: Strict validation of JWT claims

## Technical Stack Analysis

### Backend Authentication Libraries
1. **PyJWT**: Industry-standard JWT library for Python
   - Pros: Mature, well-maintained, good FastAPI integration
   - Cons: Requires manual token management
2. **python-jose**: Alternative JWT library
   - Pros: Supports multiple algorithms, good async support
   - Cons: Less community adoption than PyJWT

**Choice**: PyJWT with python-jose for additional cryptography functions

### FastAPI Authentication Patterns
1. **Dependency Injection**: Use Depends() for auth validation
2. **Middleware**: Global JWT verification
3. **Custom Security Scheme**: FastAPI's security framework

**Recommended Pattern**: Combination of dependency injection for route-level auth and middleware for global verification

### User Identity Extraction
- Extract user_id and email from JWT claims
- Store in request state for downstream use
- Use dependency to inject user context into route handlers

## Implementation Phases

### Phase 1: Backend Infrastructure
1. JWT utility functions (encode/decode/verify)
2. Authentication middleware
3. Auth dependency injection
4. Updated task models with user relationships
5. Task service updates for user filtering

### Phase 2: Route Protection
1. Apply auth dependencies to task endpoints
2. Implement user ownership validation
3. Add 401/403 error handling
4. Test authentication flows

### Phase 3: Integration Testing
1. End-to-end authentication testing
2. User isolation verification
3. Error case testing (expired/invalid tokens)
4. Performance validation

## Database Schema Updates

### Current Schema (from Spec 1)
- `tasks` table with basic fields (id, title, description, status, created_at, updated_at)

### Required Updates
1. Add `user_id` foreign key to `tasks` table
2. Create `users` table if not already present
3. Update task model to include user relationship

### Migration Strategy
- Use Alembic for schema migration
- Handle existing tasks (assign to default user or migrate appropriately)
- Maintain backward compatibility during transition

## Error Handling Strategy

### HTTP Status Codes
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Valid token but insufficient permissions (wrong user)
- `422 Unprocessable Entity`: Malformed JWT or missing claims
- `500 Internal Server Error`: JWT verification service unavailable

### Error Response Format
Consistent with existing API error format:
```json
{
  "detail": "Descriptive error message",
  "error_code": "AUTH_ERROR_TYPE"
}
```

## Performance Considerations

### JWT Verification Performance
- Caching: Minimal (tokens are short-lived)
- Algorithm: HS256 provides good performance
- Database: User lookup optimized with indexes

### Scalability Factors
- Stateless authentication (no server-side session storage)
- JWT verification doesn't require database calls
- Horizontal scaling supported

## Security Recommendations

### Secret Management
- Use environment variable for `BETTER_AUTH_SECRET`
- Minimum 256-bit entropy for secret
- Rotate secrets periodically
- Never hardcode secrets in source code

### Token Security
- Set appropriate expiry (7 days as per spec)
- Consider refresh token strategy for long-lived access
- Implement token revocation if needed
- Secure token storage on frontend

### Rate Limiting
- Implement on authentication endpoints
- Prevent brute-force attacks
- Use sliding window approach
- Consider distributed rate limiting for production

## Dependency Analysis

### Backend Dependencies
- `pyjwt`: JWT encoding/decoding
- `python-jose`: Cryptographic functions
- `fastapi`: Framework (already present)
- `bcrypt`: Password hashing (if needed for user management)
- `cryptography`: Additional crypto functions

### Frontend Dependencies (Reference)
- `better-auth`: Frontend authentication
- `@better-auth/token`: JWT utilities

## Testing Strategy

### Unit Tests
- JWT utility functions
- Authentication middleware
- User context extraction
- Token validation logic

### Integration Tests
- End-to-end authentication flow
- Protected route access
- User isolation validation
- Error case handling

### Security Tests
- Token tampering attempts
- Expired token handling
- Cross-user access prevention
- Rate limiting effectiveness

## Migration Path

### From Current State (Spec 1)
1. Add authentication infrastructure
2. Update existing task models/endpoints gradually
3. Maintain backward compatibility during transition
4. Remove any unauthenticated access paths

### Gradual Rollout Strategy
1. Implement authentication system
2. Apply to new endpoints first
3. Migrate existing endpoints gradually
4. Monitor for regressions

## Decision Log

### JWT Algorithm Selection
- **Decision**: HS256 with shared secret
- **Alternative Considered**: RS256 with public/private key pair
- **Reason**: Simpler implementation, sufficient security for this context

### Authentication Pattern
- **Decision**: Dependency injection + middleware combination
- **Alternative Considered**: Pure middleware approach
- **Reason**: Dependency injection provides better flexibility for route-specific auth requirements

### Token Expiry Duration
- **Decision**: 7-day expiry as specified
- **Alternative Considered**: Shorter (1-2 day) or longer (30+ day) tokens
- **Reason**: Balance between security and user experience

## Future Considerations

### Potential Enhancements
1. Refresh token implementation
2. Token revocation/blacklisting
3. Multi-factor authentication
4. Social provider integration
5. Role-based access control

### Monitoring Requirements
1. Authentication success/failure rates
2. Token refresh patterns
3. Suspicious access patterns
4. Performance metrics for auth operations