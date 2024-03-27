# Use a Node.js base image with a specific version
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the React app
RUN npm run build

EXPOSE 5173

# Command to start the React app
CMD ["npm", "run","dev"]
