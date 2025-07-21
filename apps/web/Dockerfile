# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY shared-tsup.config.ts ./

# Copy packages
COPY packages/ ./packages/

# Copy only the web app
COPY apps/web/ ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the project
RUN pnpm turbo run build --filter=web...

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install pnpm for production
RUN npm install -g pnpm@9.0.0

# Copy necessary files from builder
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Change to web directory
WORKDIR /app/apps/web

# Start Next.js
CMD ["pnpm", "start"]