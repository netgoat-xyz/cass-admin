# syntax=docker/dockerfile:1

FROM oven/bun:1.4.0-alpine AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json bun.lock ./
COPY packages/design-system/package.json ./packages/design-system/
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM oven/bun:1.4.0-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
# Bun's isolated linker puts workspace dependencies in
# packages/design-system/node_modules, so the whole install tree is copied
# rather than only the root node_modules.
COPY --from=deps /app ./
COPY . .
RUN bun run build

FROM gcr.io/distroless/nodejs22-debian13:nonroot AS runner
LABEL org.opencontainers.image.description="NetGoat CAS admin panel (Next.js) runtime" \
      org.opencontainers.image.base.name="gcr.io/distroless/nodejs22-debian13:nonroot" \
      org.opencontainers.image.source="https://github.com/netgoat-xyz/cass-admin"
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3200 \
    HOSTNAME=0.0.0.0 \
    NODE_OPTIONS=--max-old-space-size=256
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static
USER nonroot:nonroot
EXPOSE 3200
HEALTHCHECK --interval=15s --timeout=5s --retries=10 --start-period=25s \
  CMD ["/nodejs/bin/node", "-e", "fetch('http://127.0.0.1:3200').then(r=>process.exit(r.ok||r.status===401?0:1)).catch(()=>process.exit(1))"]
CMD ["server.js"]
