# Use a Node.js image to build the React app
FROM node:20 AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the React app
RUN npm run build

# Use a lightweight web server for production
FROM nginx:1.23

# Copy the built React files to Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port Nginx runs on
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
