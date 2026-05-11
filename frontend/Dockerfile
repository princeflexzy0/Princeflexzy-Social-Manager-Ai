# Use Node.js 18 as the base image
FROM node:18-alpine AS base

# Install dependencies for node-gyp
RUN apk add --no-cache python3 make g++ libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Setup build stage
FROM base AS builder

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Accept build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build the application
RUN pnpm build

# Production stage
FROM base AS runner

# Create system user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to nextjs user
USER nextjs

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]
