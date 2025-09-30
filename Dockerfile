# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy TypeScript configuration
COPY tsconfig.json ./
COPY eslint.config.js ./

# Copy source code
COPY src ./src
COPY docs ./docs

# Build the application
RUN pnpm run build

# Production stage
FROM gcr.io/distroless/nodejs20-debian12:nonroot

WORKDIR /app

# Copy package.json for runtime dependencies info
COPY package.json ./

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/docs ./docs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"]

# Set non-root user
USER nonroot:nonroot

# Start the application
CMD ["dist/index.js"]