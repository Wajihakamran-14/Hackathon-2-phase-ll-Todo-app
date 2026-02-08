---
name: database-skill
description: Design and manage databases including table creation, migrations, and schema design.
---

# Database Skill

## Instructions

1. **Schema Design**
   - Identify entities and relationships
   - Define primary keys and foreign keys
   - Normalize data to reduce redundancy
   - Choose appropriate data types

2. **Table Creation**
   - Create tables with clear naming conventions
   - Define constraints (NOT NULL, UNIQUE, DEFAULT)
   - Use indexes for frequently queried columns
   - Enforce referential integrity

3. **Migrations**
   - Create versioned database migrations
   - Apply schema changes incrementally
   - Support rollback and forward migrations
   - Keep migrations idempotent and reversible

4. **Relationships**
   - One-to-one, one-to-many, many-to-many
   - Use join tables where necessary
   - Define cascading rules (ON DELETE / ON UPDATE)

5. **Data Integrity & Performance**
   - Use transactions for critical operations
   - Add indexes strategically
   - Avoid over-indexing
   - Validate data at database level when possible

## Best Practices
- Use snake_case or camelCase consistently
- Never modify existing migrations in production
- Always backup database before major changes
- Keep schema simple and well-documented
- Separate read and write concerns when scaling
- Use environment-specific databases (dev, staging, prod)

## Example Structure

### Table Creation
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
