FROM node:lts-slim AS base

# Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm --no-fund --no-update-notifier ci

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# RUN npx prisma generate --schema ./prisma/schema.prisma

COPY public/ ./public
COPY app/ ./app
COPY lib/ ./lib
COPY next.config.mjs ./
RUN npm run build


# Production image, copy all the files and run next
FROM base AS runner

RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# COPY --from=builder /app/package.json ./package.json

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# COPY --chown=nextjs:nodejs prisma ./prisma/

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOST="0.0.0.0" node server.js
