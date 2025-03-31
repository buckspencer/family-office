# Application Architecture

## Authentication
- Custom JWT-based authentication system
- Uses `bcryptjs` for password hashing
- Uses `jose` for JWT signing/verification
- Session management via Next.js cookies
- Custom middleware for route protection
- Email verification system with custom tokens

## Database
- PostgreSQL database hosted on Supabase
- Drizzle ORM for type-safe database operations
- Custom schema definitions in `lib/db/schema.ts`
- Row Level Security (RLS) policies for access control
- Custom database queries in `lib/db/queries.ts`

## API Layer
- Server Actions for database operations
- Next.js API routes where needed
- Type-safe request/response handling with Zod schemas

## Frontend
- Next.js 14 with App Router
- React Server Components where possible
- Client Components for interactive elements
- Tailwind CSS for styling
- Radix UI for accessible components

## State Management
- React Context for global state
- Server-side state management where possible
- Client-side state for UI interactions

## Security
- JWT-based authentication
- HTTP-only cookies
- CSRF protection
- Rate limiting
- Input validation with Zod
- SQL injection prevention via Drizzle ORM

## Development Tools
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- pnpm for package management
- Drizzle Kit for database migrations 