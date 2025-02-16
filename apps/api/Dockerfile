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

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Azure MySQL environment variables
ENV MYSQL_HOST=${MYSQL_HOST}
ENV MYSQL_PORT=${MYSQL_PORT}
ENV MYSQL_USER=${MYSQL_USER}
ENV MYSQL_PASSWORD=${MYSQL_PASSWORD}
ENV MYSQL_DATABASE=${MYSQL_DATABASE}
ENV MYSQL_SSL=${MYSQL_SSL}

# Expose the application port
EXPOSE 3000

CMD ["ls", "-la", "/app"]

# Start the application
CMD ["node", "dist/main"]
