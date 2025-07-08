# Use a Node.js base image
FROM node:20

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the source code
COPY . .

# Expose the port
EXPOSE 4000

# Start the server
CMD ["node", "index.js"]
