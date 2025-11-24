# Multi-stage build for optimized production image
# Stage 1: Build stage
FROM node:24-alpine AS builder

WORKDIR /build

# Copy package files
COPY package.json package-lock.json tsconfig.build.json tsconfig.start.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY config ./config
COPY src ./src

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Production stage
FROM node:24-alpine

# Install dumb-init and update npm to latest (fixes CVE-2025-64756)
RUN apk add --no-cache dumb-init && \
    npm install -g npm@latest && \
    npm cache clean --force

# Set environment variables
ENV PORT=3000
ENV ROOT_PATH=/opt/spaceone/wconsole-server
ENV NODE_ENV=production

# Create app directory
RUN mkdir -p ${ROOT_PATH}
WORKDIR ${ROOT_PATH}

# Copy package files
COPY package.json package-lock.json ./
COPY tsconfig.start.json ./tsconfig.json

# Install production dependencies only (skip husky with env var)
RUN HUSKY=0 npm ci --omit=dev && \
    rm -rf node_modules/*/cli node_modules/*/*/cli && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /build/dist ./dist

# Copy configuration files
COPY --from=builder /build/config ./config

# Create non-root user for security
RUN addgroup -g 1001 spaceone && \
    adduser -D -u 1001 -G spaceone spaceone && \
    chown -R spaceone:spaceone ${ROOT_PATH}

# Switch to non-root user
USER spaceone

# Expose port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/check || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application (with tsconfig-paths for path aliases)
CMD ["node", "-r", "tsconfig-paths/register", "dist/bin/www.js"]
