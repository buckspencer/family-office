# Next.js SaaS Starter

# Family Office

A comprehensive family office management system built with Next.js, focusing on document management, contact organization, event tracking, and subscription management.

**Demo: [https://next-saas-start.vercel.app/](https://next-saas-start.vercel.app/)**

## Project Status & Roadmap

### Current Features
- ✅ User authentication and team management
- ✅ Basic dashboard layout
- ✅ Wizard UI for data entry
- ✅ Form components for different data types
- ✅ State management with Zustand
- ✅ Basic navigation and routing

### MVP Roadmap

#### Phase 1: Core Infrastructure (Current)
- Database & Authentication
  - ✅ Database schema setup
  - ✅ User authentication
  - ✅ Team management
  - ✅ Basic role-based access control

- Resource Management APIs
  - ✅ Subscription management
  - ⬜ Document management
    - Basic CRUD operations
    - File upload/storage integration
    - Basic file type validation
  - ⬜ Contact management
  - ⬜ Event management

#### Phase 2: Essential UI/UX
- Dashboard & Navigation
  - ⬜ Resource overview dashboard
  - ⬜ Resource-specific list views
  - ⬜ Mobile responsiveness

- Data Entry Workflows
  - ⬜ Document upload wizard
  - ⬜ Contact entry form
  - ⬜ Event creation
  - ⬜ Subscription management

#### Phase 3: MVP Features
- Team Collaboration
  - ⬜ Basic sharing controls
  - ⬜ Team member invitations
  - ⬜ Activity logging
  - ⬜ Simple notification system

- Data Organization
  - ⬜ Basic tagging system
  - ⬜ Categories/folders
  - ⬜ Simple search
  - ⬜ Basic export functionality

#### Phase 4: MVP Polish & Launch
- ⬜ Testing & Optimization
- ⬜ Documentation
- ⬜ Production environment setup
- ⬜ Monitoring & logging

### Future Enhancements (Post-MVP)
- End-to-end encryption
- Advanced search capabilities
- Document OCR and data extraction
- Advanced reporting
- Custom workflows
- Mobile app
- API integrations
- Advanced analytics
- Multi-language support

## Features

- Marketing landing page (`/`) with animated Terminal element
- Pricing page (`/pricing`) which connects to Stripe Checkout
- Dashboard pages with CRUD operations on users/teams
- Basic RBAC with Owner and Member roles
- Subscription management with Stripe Customer Portal
- Email/password authentication with JWTs stored to cookies
- Global middleware to protect logged-in routes
- Local middleware to protect Server Actions or validate Zod schemas
- Activity logging system for any user events

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/nextjs/saas-starter
cd saas-starter
pnpm install
```

## Running Locally

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

Then, run the database migrations and seed the database with a default user and team:

```bash
pnpm db:migrate
pnpm db:seed
```

This will create the following user and team:

- User: `test@test.com`
- Password: `admin123`

You can, of course, create new users as well through `/sign-up`.

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

Optionally, you can listen for Stripe webhooks locally through their CLI to handle subscription change events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Testing Payments

To test Stripe payments, use the following test card details:

- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number

## Going to Production

When you're ready to deploy your SaaS application to production, follow these steps:

### Set up a production Stripe webhook

1. Go to the Stripe Dashboard and create a new webhook for your production environment.
2. Set the endpoint URL to your production API route (e.g., `https://yourdomain.com/api/stripe/webhook`).
3. Select the events you want to listen for (e.g., `checkout.session.completed`, `customer.subscription.updated`).

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/) and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `STRIPE_SECRET_KEY`: Use your Stripe secret key for the production environment.
3. `STRIPE_WEBHOOK_SECRET`: Use the webhook secret from the production webhook you created in step 1.
4. `POSTGRES_URL`: Set this to your production database URL.
5. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.

## Other Templates

While this template is intentionally minimal and to be used as a learning resource, there are other paid versions in the community which are more full-featured:

- https://achromatic.dev
- https://shipfa.st
- https://makerkit.dev

## Project Management

This project is managed using Trello. To view or contribute to the project board:

1. Request access to the Trello board
2. Track progress through the MVP phases
3. Participate in task assignments and updates

[Request Trello Access →]

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

[Add License Information]
