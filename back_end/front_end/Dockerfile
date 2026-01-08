# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage with minimal image
FROM node:20-alpine

WORKDIR /app

# Install serve to run production build
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Start application
CMD ["serve", "-s", "dist", "-l", "3000"]
