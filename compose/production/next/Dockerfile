FROM node:lts-slim AS base

# Rebuild the source code only when needed
FROM base AS builder

RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm --no-fund --no-update-notifier ci

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# RUN npx prisma generate --schema ./prisma/schema.prisma

COPY prisma/ ./prisma
COPY public/ ./public
COPY src/ ./src
COPY next.config.js ./
COPY .env ./env

RUN npx prisma generate --schema ./prisma/schema.prisma

RUN npm run build


# Production image, copy all the files and run next
FROM base AS runner

RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME=0.0.0.0
ENV CHECKPOINT_DISABLE=1
ENV DISABLE_PRISMA_TELEMETRY=true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

RUN npm install --global --save-exact "prisma@$(node --print 'require("./node_modules/@prisma/client/package.json").version')"

COPY start.sh /usr/local/bin

USER nextjs

EXPOSE 3000

# ENTRYPOINT [ "/start.sh" ]
CMD HOST="0.0.0.0" node server.js
