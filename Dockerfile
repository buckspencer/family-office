FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV POSTGRES_URL=postgres://placeholder:placeholder@localhost:5432/placeholder
ENV STRIPE_SECRET_KEY=sk_test_placeholder
ENV STRIPE_WEBHOOK_SECRET=whsec_placeholder
ENV AUTH_SECRET=placeholder
ENV BASE_URL=https://placeholder.example.com
ENV NEXT_PUBLIC_APP_URL=https://placeholder.example.com
RUN pnpm build

FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
