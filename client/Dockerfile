# Use Node.js as base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port React runs on
EXPOSE 3000

# Start the React app using npm start
CMD ["npm", "start"]
