# Next.js SaaS Starter Project Rules

## Project Overview
This is a Next.js SaaS starter template that implements a complete authentication system, team management, and Stripe integration for payments. The project follows modern web development practices and uses a robust tech stack.

## Core Technologies
- Next.js 15.2.2 (Canary) with App Router
- TypeScript for type safety
- PostgreSQL with Drizzle ORM
- shadcn/ui components with Tailwind CSS
- Custom JWT authentication
- Stripe for payments
- Server Components + Server Actions

## Project Rules

1. **Architecture Pattern**
   - Follow Next.js App Router patterns
   - Use Server Components by default
   - Client Components only when necessary for interactivity
   - Implement Server Actions for mutations

2. **Database Operations**
   - Use Drizzle ORM for all database operations
   - Follow the established schema patterns in `lib/db/schema.ts`
   - Implement activity logging for all significant actions
   - Maintain referential integrity in relations

3. **Authentication & Authorization**
   - Implement JWT-based authentication
   - Follow RBAC patterns with Owner/Member roles
   - Use middleware for route protection
   - Handle team-based access control

4. **UI Components**
   - Use shadcn/ui component library
   - Follow Tailwind CSS class naming conventions
   - Maintain responsive design patterns
   - Keep accessibility standards (ARIA)

5. **API Integration**
   - Use Stripe for all payment-related features
   - Implement webhook handlers for async operations
   - Follow established patterns for API routes

6. **State Management**
   - Prefer server-side state management
   - Use React Server Components where possible
   - Implement optimistic updates for better UX

7. **Error Handling**
   - Implement consistent error boundaries
   - Use Zod for schema validation
   - Log errors appropriately
   - Provide user-friendly error messages

8. **Testing**
   - Write tests for critical business logic
   - Test authentication flows
   - Validate subscription workflows
   - Test team management features

9. **Security**
   - Follow security best practices for JWT
   - Implement CSRF protection
   - Secure API routes
   - Handle sensitive data appropriately

10. **Performance**
    - Optimize database queries
    - Implement proper caching strategies
    - Use proper loading states
    - Optimize client-side bundle size

## Database Schema Overview
- Users table with authentication
- Teams table with Stripe integration
- Team Members for user-team relationships
- Activity Logs for audit trails
- Invitations for team member onboarding

## Development Environment
- Package Manager: pnpm
- Development Server: Next.js with Turbopack
- Database Migrations: Drizzle Kit
- Environment: Vercel-optimized

## Version Control Guidelines
- Follow conventional commits
- Keep feature branches focused
- Maintain clean git history
- Review code before merging

## Deployment
- Deploy to Vercel
- Use environment variables for configuration
- Set up proper monitoring and logging
- Configure Stripe webhooks correctly 