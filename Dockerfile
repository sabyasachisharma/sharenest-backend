FROM node:18-bullseye-slim

# Set timezone
ENV TZ="Europe/Berlin"

# Install only the essential build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    g++ \
    make \
    python3 \
    tini && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Clean install dependencies
RUN npm cache clean --force && \
    npm install && \
    npm install mysql2@latest --save

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Rebuild bcrypt
RUN npm rebuild bcrypt --build-from-source

EXPOSE 3005

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/usr/bin/tini", "--"]

# Start the application
CMD ["npm", "run", "start:prod"]