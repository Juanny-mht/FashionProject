# Start image with a node base image
FROM node:18.17.1

# The /app directory should act as the main application directory
WORKDIR /app

# Copy the package*.json files
COPY package*.json ./

# Copy the dir
COPY . .

# Install backend dependencies
RUN npm install \
    && npm run db:migrate \
    && npm run db:generate 

# Expose the port
EXPOSE 3002

# Command to start the backend server
CMD ["npm", "run", "serve"]
