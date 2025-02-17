# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY libs/api-sdk/package*.json ./libs/api-sdk/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build:api

# Production stage
FROM node:22-alpine

# Install MySQL client dependencies
RUN apk add --no-cache mysql-client

WORKDIR /app

# Copy built assets and dependencies
COPY --from=builder /app/dist/apps/api ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/api/package*.json ./

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
