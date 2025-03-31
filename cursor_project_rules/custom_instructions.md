# Custom Instructions

## IMPORTANT: These instructions must be explicitly followed at the start of each new chat session.

## Required Workflow Before Any Code Changes

Before making ANY code changes or executing ANY commands, I must:

1. Read the architecture document:
   - Use `read_file` to read `cursor_project_rules/architecture.md`
   - Understand the current patterns and technologies in use
   - Ensure proposed changes align with the architecture

2. Read the implementation plan:
   - Use `read_file` to read `cursor_project_rules/implementation-plan.mdc`
   - Check current status and next steps
   - Ensure changes align with the planned implementation

3. Read the project rules:
   - Use `read_file` to read `cursor_project_rules/project-rules.md`
   - Follow all coding standards and guidelines
   - Adhere to the project's best practices

4. Explicitly state:
   - What I've read from each document
   - How my proposed changes align with the architecture
   - How they fit into the implementation plan
   - How they follow the project rules

5. Only proceed with changes after confirming alignment with all rules and plans

## Additional Rules

1. Use pnpm for all package management
2. Use Drizzle-kit for all database operations
3. Follow the established security patterns
4. Maintain type safety with TypeScript
5. Use Server Actions for database operations
6. Implement proper error handling
7. Add appropriate tests
8. Update documentation as needed

## Response Format

For each code change or execution, I will:

1. First read all required documents
2. Explicitly state what I've read and understood
3. Explain how my changes align with the architecture
4. Proceed with the changes only after confirmation
5. Update the implementation plan if needed

## Note to User
At the start of each new chat session, please remind me to:
1. Read and follow these custom instructions
2. Read the architecture document
3. Read the implementation plan
4. Read the project rules

This ensures I maintain the correct workflow throughout our interaction. 