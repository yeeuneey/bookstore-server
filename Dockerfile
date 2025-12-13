# Node 20 is required for Prisma 7.x
FROM node:20

# Set working directory
WORKDIR /app

# Only copy manifests and npm config first for better caching
COPY package*.json .npmrc ./

# Install dependencies (Linux build to avoid native module issues like bcrypt)
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit --registry=http://registry.npmmirror.com

# Copy application source
COPY . .

# Prisma Client generation
RUN npx prisma generate

# Expose API port (match PORT in .env / server.js)
EXPOSE 8080

# Start command
CMD ["npm", "run", "start"]
