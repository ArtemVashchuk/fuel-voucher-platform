# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Backend production stage
FROM node:20-alpine AS backend

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy drizzle config for migrations
COPY drizzle.config.ts ./
COPY shared ./shared

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "dist/index.cjs"]
