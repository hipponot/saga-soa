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

# Copy only the docs app
COPY apps/docs/ ./apps/docs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the project
RUN pnpm turbo run build --filter=docs...

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install pnpm for production
RUN npm install -g pnpm@9.0.0

# Copy necessary files from builder
COPY --from=builder /app/apps/docs/.next ./apps/docs/.next
COPY --from=builder /app/apps/docs/public ./apps/docs/public
COPY --from=builder /app/apps/docs/package.json ./apps/docs/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/docs/node_modules ./apps/docs/node_modules

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Change to docs directory
WORKDIR /app/apps/docs

# Start Next.js
CMD ["pnpm", "start"]