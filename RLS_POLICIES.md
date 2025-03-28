# Row Level Security (RLS) Policies Documentation

## Overview
This document outlines all Row Level Security (RLS) policies implemented in our database. RLS ensures that users can only access and modify data they are authorized to see.

## Policy Categories

### User Policies
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON "public"."users"
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON "public"."users"
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Team Policies
```sql
-- Team members can view their teams
CREATE POLICY "Team members can view their teams"
ON "public"."teams"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "teams"."id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Team owners can update their teams
CREATE POLICY "Team owners can update their teams"
ON "public"."teams"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "teams"."id"
    AND "team_members"."user_id" = auth.uid()
    AND "team_members"."role" = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "teams"."id"
    AND "team_members"."user_id" = auth.uid()
    AND "team_members"."role" = 'owner'
  )
);
```

### Team Member Policies
```sql
-- Team members can view their team members
CREATE POLICY "Team members can view their team members"
ON "public"."team_members"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members" AS tm
    WHERE tm.team_id = "team_members"."team_id"
    AND tm.user_id = auth.uid()
  )
);
```

### Family Document Policies
```sql
-- Team members can view family documents
CREATE POLICY "Team members can view family documents"
ON "public"."family_documents"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_documents"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Team members can create family documents
CREATE POLICY "Team members can create family documents"
ON "public"."family_documents"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_documents"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Team members can update their own documents
CREATE POLICY "Team members can update their own documents"
ON "public"."family_documents"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_documents"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
  AND (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_documents"."team_id"
    AND "team_members"."user_id" = auth.uid()
    AND "team_members"."role" IN ('owner', 'admin')
  ))
);
```

### Family Task Policies
```sql
-- Team members can view family tasks
CREATE POLICY "Team members can view family tasks"
ON "public"."family_tasks"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_tasks"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Team members can create family tasks
CREATE POLICY "Team members can create family tasks"
ON "public"."family_tasks"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_tasks"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Team members can update their own tasks
CREATE POLICY "Team members can update their own tasks"
ON "public"."family_tasks"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_tasks"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
  AND (created_by = auth.uid() OR assigned_to = auth.uid() OR EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_tasks"."team_id"
    AND "team_members"."user_id" = auth.uid()
    AND "team_members"."role" IN ('owner', 'admin')
  ))
);
```

### Family Event Policies
```sql
-- Team members can view family events
CREATE POLICY "Team members can view family events"
ON "public"."family_events"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_events"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Team members can create family events
CREATE POLICY "Team members can create family events"
ON "public"."family_events"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_events"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Team members can update their own events
CREATE POLICY "Team members can update their own events"
ON "public"."family_events"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_events"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
  AND (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_events"."team_id"
    AND "team_members"."user_id" = auth.uid()
    AND "team_members"."role" IN ('owner', 'admin')
  ))
);
```

### Family AI Chat Policies
```sql
-- Team members can view their AI chats
CREATE POLICY "Team members can view their AI chats"
ON "public"."family_ai_chats"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_ai_chats"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Team members can create AI chats
CREATE POLICY "Team members can create AI chats"
ON "public"."family_ai_chats"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_ai_chats"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Team members can update their own AI chats
CREATE POLICY "Team members can update their own AI chats"
ON "public"."family_ai_chats"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_ai_chats"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
  AND user_id = auth.uid()
);
```

### Invitation Policies
```sql
-- Team members can view invitations
CREATE POLICY "Team members can view invitations"
ON "public"."invitations"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "invitations"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Team admins can create invitations
CREATE POLICY "Team admins can create invitations"
ON "public"."invitations"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "invitations"."team_id"
    AND "team_members"."user_id" = auth.uid()
    AND "team_members"."role" IN ('owner', 'admin')
  )
);
```

## Policy Patterns

### Common Patterns
1. **Team-Based Access**
   ```sql
   EXISTS (
     SELECT 1 FROM "public"."team_members"
     WHERE "team_members"."team_id" = table_name."team_id"
     AND "team_members"."user_id" = auth.uid()
   )
   ```

2. **Owner-Based Access**
   ```sql
   EXISTS (
     SELECT 1 FROM "public"."team_members"
     WHERE "team_members"."team_id" = table_name."team_id"
     AND "team_members"."user_id" = auth.uid()
     AND "team_members"."role" = 'owner'
   )
   ```

3. **Admin-Based Access**
   ```sql
   EXISTS (
     SELECT 1 FROM "public"."team_members"
     WHERE "team_members"."team_id" = table_name."team_id"
     AND "team_members"."user_id" = auth.uid()
     AND "team_members"."role" IN ('owner', 'admin')
   )
   ```

4. **Creator-Based Access**
   ```sql
   created_by = auth.uid()
   ```

## Best Practices

### Policy Creation
1. Always enable RLS on new tables
2. Create policies for all operations (SELECT, INSERT, UPDATE, DELETE)
3. Test policies thoroughly
4. Document all policies
5. Review policies regularly

### Policy Testing
1. Test with different user roles
2. Test with different team memberships
3. Test edge cases
4. Test policy combinations

### Policy Maintenance
1. Review policies when adding new features
2. Update policies when changing access requirements
3. Document policy changes
4. Test policy changes thoroughly

## Security Considerations

### Data Protection
- Policies should prevent unauthorized access
- Policies should prevent data leakage
- Policies should enforce business rules
- Policies should be auditable

### Performance
- Policies should be efficient
- Use appropriate indexes
- Avoid complex policy conditions
- Monitor policy performance

### Audit Trail
- Log policy changes
- Track policy effectiveness
- Monitor policy violations
- Review policy logs regularly 