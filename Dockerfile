# Use Node.js LTS version
FROM node:18-slim

# Set working directory for the entire monorepo
WORKDIR /app

# Install OpenSSL, a required dependency for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copy root dependency manifests
COPY package.json package-lock.json* ./

# Copy workspace dependency manifests to satisfy npm workspaces
# This is needed for 'npm ci' to work correctly in a monorepo.
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install production dependencies for all workspaces using the root lockfile
RUN npm ci --only=production

# Copy the server's source code and other necessary files
COPY ./server ./server

# Change the working directory to the server app
WORKDIR /app/server

# Generate Prisma client (schema path is relative to the new WORKDIR)
RUN npx prisma generate

# Expose the port the server will run on
EXPOSE 3000

# Start the server using the start script in server/package.json
CMD ["npm", "start"] 