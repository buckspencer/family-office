# Database Migration Guidelines

## Overview
This document outlines the guidelines and best practices for database migrations in our project. We use Supabase with Drizzle ORM for type-safe database operations.

## Migration Structure

### Required Fields
Every table MUST include these fields:
```sql
id uuid NOT NULL DEFAULT gen_random_uuid(),
created_at timestamp DEFAULT now() NOT NULL,
updated_at timestamp DEFAULT now() NOT NULL,
deleted_at timestamp,
created_by uuid,
updated_by uuid
```

### Naming Conventions
- Table names: lowercase, plural, snake_case (e.g., `family_documents`)
- Column names: lowercase, snake_case (e.g., `created_at`)
- Index names: `idx_tablename_columnname`
- Constraint names: `tablename_constraintname`

### Required Components
Every migration MUST include:
1. Schema changes
2. RLS policies
3. Indexes
4. Types (if custom types are needed)

## Process for Changes

1. **Create Migration**
   ```bash
   # Generate a new migration
   pnpm db:generate
   ```

2. **Review Changes**
   - Check schema changes
   - Verify RLS policies
   - Validate indexes
   - Review foreign key constraints

3. **Test Locally**
   ```bash
   # Apply migration
   pnpm db:migrate
   
   # Run tests
   pnpm test
   ```

4. **Deploy**
   ```bash
   # Push to production
   pnpm supabase db push
   ```

## Best Practices

### Soft Delete
- Always use `deleted_at` for soft deletes
- Include `deleted_at` in queries where appropriate
- Never hard delete data unless absolutely necessary

### Indexes
- Create indexes for:
  - Foreign keys
  - Frequently queried columns
  - Columns used in WHERE clauses
  - Columns used in ORDER BY clauses

### RLS Policies
- Enable RLS on all tables
- Create policies for:
  - SELECT (read access)
  - INSERT (create access)
  - UPDATE (modify access)
  - DELETE (delete access)

### Foreign Keys
- Always include ON DELETE behavior
- Use CASCADE for child records
- Use RESTRICT for critical relationships

### Types
- Use custom types for enums
- Use appropriate data types (uuid, timestamp, text, etc.)
- Consider using JSONB for flexible data structures

## Common Patterns

### User Ownership
```sql
created_by uuid REFERENCES users(id),
updated_by uuid REFERENCES users(id)
```

### Soft Delete Query
```sql
WHERE deleted_at IS NULL
```

### Timestamp Updates
```sql
updated_at timestamp DEFAULT now() NOT NULL
```

### RLS Policy Template
```sql
CREATE POLICY "policy_name" ON "table_name"
FOR operation
TO authenticated
USING (condition)
WITH CHECK (condition);
```

## Testing

### Required Tests
1. CRUD operations
2. RLS policy enforcement
3. Index effectiveness
4. Foreign key constraints
5. Soft delete functionality

### Test Data
- Use meaningful test data
- Include edge cases
- Test both success and failure scenarios

## Rollback Procedures

### Local Rollback
```bash
# Revert last migration
pnpm db:migrate:down
```

### Production Rollback
1. Create a new migration that reverts changes
2. Apply the rollback migration
3. Verify data integrity

## Security Considerations

### Data Protection
- Never store sensitive data in plain text
- Use appropriate encryption for sensitive fields
- Implement proper access controls

### Audit Trail
- Log all schema changes
- Track who made changes
- Document reason for changes

## Maintenance

### Regular Tasks
1. Review and optimize indexes
2. Clean up unused tables/columns
3. Update RLS policies as needed
4. Monitor query performance

### Performance Monitoring
- Watch for slow queries
- Monitor index usage
- Track table sizes
- Monitor connection pools 