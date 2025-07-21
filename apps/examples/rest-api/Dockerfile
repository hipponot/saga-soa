# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Set working directory
WORKDIR /app

# Copy workspace files
# COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
# COPY turbo.json ./
# COPY shared-tsup.config.ts ./

# Copy packages
# COPY packages/ ./packages/

# # Copy only the rest-api app
# COPY apps/examples/rest-api/ ./apps/examples/rest-api/

# Install dependencies
RUN pnpm install 
# --frozen-lockfile

# Build the project
RUN pnpm turbo run build --filter=rest-api...

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Copy necessary dependencies
COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/apps/examples/rest-api/node_modules ./apps/examples/rest-api/node_modules
# COPY --from=builder /app/packages/ ./packages/

# Expose port (adjust based on your app configuration)
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]