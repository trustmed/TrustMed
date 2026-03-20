# Use Node LTS
FROM node:20

# Install prerequisites
RUN apt-get update && \
    apt-get install -y curl git jq docker-cli && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first for caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy rest of the app
COPY . .

# Build NestJS app
RUN pnpm build

# Set environment variable for Fabric path
ENV FABRIC_PATH=/fabric

# Expose app port
EXPOSE 4001

# Start app
CMD ["node", "dist/src/main.js"]