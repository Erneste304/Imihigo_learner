# Stage 1: Build the Vite Client
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
# Clean install, omitting the missing modules from the original environment if necessary
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build the Server and Production Image
FROM node:20-alpine
WORKDIR /app

# Copy package config and install production only
COPY package*.json ./
RUN npm install --omit=dev

# We use tsx to run our typescript backend, so we need to install it
RUN npm install tsx --global

# Mount the source correctly
COPY . .
# Overwrite frontend built dist from Stage 1 into the running dir (if Express serves it)
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 3001
EXPOSE 5000

# Using our normal dev runner as the prod runner for simplicity across the MVP
CMD ["npm", "run", "dev:server"]
