# ==============================================================================
# Consenzo Frontend Multi-Stage Dockerfile (React 18 + Vite + Nginx)
# ==============================================================================

# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace files
COPY package*.json tsconfig.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
COPY shared/ ./shared/
COPY catalog/ ./catalog/
COPY frontend/ ./frontend/

# Install dependencies and build frontend bundle
RUN npm ci
RUN npm --prefix frontend run build

# --- Stage 2: Web Server Stage ---
FROM nginx:alpine AS runner

# Copy built static files to Nginx doc root
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
