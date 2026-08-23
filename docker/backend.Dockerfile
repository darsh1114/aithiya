FROM node:22-bookworm-slim AS builder

WORKDIR /app
COPY . .
RUN corepack enable && corepack pnpm install --frozen-lockfile && corepack pnpm build:backend

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/standalone.js ./dist/standalone.js

EXPOSE 3000
CMD ["node", "dist/standalone.js"]
