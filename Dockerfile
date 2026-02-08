# Use a base image with both Python and Node.js capabilities
# Using a Python base and installing Node.js is often easier
FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Install Backend dependencies
RUN cd backend && pip install --no-cache-dir -r requirements.txt

# Install Frontend dependencies
RUN cd frontend && npm install

# Build the frontend
RUN cd frontend && npm run build

# Expose ports for both backend (8000) and frontend (3000)
EXPOSE 8000 3000

# The startup command (using npm from root to run everything)
CMD ["npm", "run", "dev"]
