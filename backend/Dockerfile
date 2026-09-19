# ==============================================================================
# Consenzo Backend Multi-Stage Dockerfile
# ==============================================================================

# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package*.json tsconfig.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY shared/ ./shared/
COPY backend/ ./backend/
COPY catalog/ ./catalog/

# Install dependencies and build backend
RUN npm ci
RUN npm --prefix backend run build

# --- Stage 2: Runtime Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV USE_LOCAL_DB=true
ENV LLM_PROVIDER=nvidia
ENV LLM_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
ENV LLM_BASE_URL=https://integrate.api.nvidia.com/v1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S consenzo -u 1001

# Copy built artifacts and dependencies
COPY package*.json tsconfig.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/catalog ./catalog

USER consenzo

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "backend/dist/backend/src/localServer.js"]
