# Database Types Documentation

## Custom Types

### Document Status
```sql
CREATE TYPE "public"."document_status" AS ENUM(
    'draft',
    'active',
    'archived',
    'deleted'
);
```
Used for tracking the state of family documents.

### Event Status
```sql
CREATE TYPE "public"."event_status" AS ENUM(
    'scheduled',
    'in_progress',
    'completed',
    'cancelled'
);
```
Used for tracking the state of family events.

### Task Priority
```sql
CREATE TYPE "public"."task_priority" AS ENUM(
    'low',
    'medium',
    'high',
    'urgent'
);
```
Used for prioritizing family tasks.

### Task Status
```sql
CREATE TYPE "public"."task_status" AS ENUM(
    'pending',
    'in_progress',
    'completed',
    'cancelled'
);
```
Used for tracking the state of family tasks.

### User Role
```sql
CREATE TYPE "public"."user_role" AS ENUM(
    'owner',
    'admin',
    'member',
    'guest'
);
```
Used for defining user roles within teams.

## Type Usage

### Document Status
- `draft`: Initial state when creating a document
- `active`: Document is currently in use
- `archived`: Document is no longer active but preserved
- `deleted`: Document is marked for deletion

### Event Status
- `scheduled`: Event is planned for future
- `in_progress`: Event is currently happening
- `completed`: Event has finished
- `cancelled`: Event was cancelled

### Task Priority
- `low`: Can be done when convenient
- `medium`: Should be done soon
- `high`: Needs attention soon
- `urgent`: Requires immediate attention

### Task Status
- `pending`: Task is created but not started
- `in_progress`: Task is being worked on
- `completed`: Task is finished
- `cancelled`: Task was cancelled

### User Role
- `owner`: Full control over team and all resources
- `admin`: Can manage team members and settings
- `member`: Standard access to team resources
- `guest`: Limited access to team resources

## Type Safety

### TypeScript Integration
These types are automatically generated in our TypeScript code through Drizzle ORM:

```typescript
import { type DocumentStatus, type EventStatus, type TaskPriority, type TaskStatus, type UserRole } from '@/lib/db/schema';
```

### Validation
- All enum values are enforced at the database level
- TypeScript provides type checking at compile time
- RLS policies can use these types for access control

## Best Practices

### Using Types
1. Always use the enum type instead of string literals
2. Include type validation in forms and API endpoints
3. Use type guards when checking values
4. Document any special cases or edge cases

### Adding New Types
1. Create the type in a new migration
2. Update the schema
3. Generate TypeScript types
4. Update relevant tests
5. Document the new type

### Type Changes
1. Create a new migration
2. Add new values to the enum
3. Update existing records if needed
4. Update TypeScript code
5. Update tests
6. Document changes

## Examples

### Type Usage in Queries
```typescript
// Filtering by status
const activeDocuments = await db
  .select()
  .from(familyDocuments)
  .where(eq(familyDocuments.status, 'active'));

// Creating with type
const newTask = await db
  .insert(familyTasks)
  .values({
    title: 'New Task',
    priority: 'high',
    status: 'pending'
  });
```

### Type Guards
```typescript
function isValidTaskStatus(status: string): status is TaskStatus {
  return ['pending', 'in_progress', 'completed', 'cancelled'].includes(status);
}
```

### Form Validation
```typescript
const taskSchema = z.object({
  title: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled'])
});
``` 