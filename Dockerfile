# Use official Node.js LTS slim image
FROM node:20-slim

# Install wget, gnupg, and Chrome dependencies, then install official Google Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer executable path to the installed Google Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Create app directory
WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install npm dependencies
RUN npm ci

# Copy application source files
COPY . .

# Expose port 8085
EXPOSE 8085

# Start command
CMD ["npm", "start"]
