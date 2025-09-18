# Use Node.js 20 (recommended for Supabase + Next.js)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file first (better caching)
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies like tailwindcss & postcss)
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose frontend port
EXPOSE 3000

# Start Next.js in development mode
CMD ["npm", "run", "dev"]
