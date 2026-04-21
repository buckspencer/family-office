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
ARG POSTGRES_URL=postgres://placeholder:placeholder@localhost:5432/placeholder
ARG STRIPE_SECRET_KEY
ARG STRIPE_WEBHOOK_SECRET=whsec_placeholder
ARG AUTH_SECRET=placeholder
ARG BASE_URL=https://placeholder.example.com
ARG NEXT_PUBLIC_APP_URL=https://placeholder.example.com
ENV POSTGRES_URL=$POSTGRES_URL
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
ENV STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET
ENV AUTH_SECRET=$AUTH_SECRET
ENV BASE_URL=$BASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN pnpm build

FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
