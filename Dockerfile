# Start image with a node base image
FROM node:18.17.1

# The /app directory should act as the main application directory
WORKDIR /app

# Copy the app package-lock.json file
COPY package-lock.json ./

# Copy the backend code
COPY ./back ./back

# Change the working directory to the backend directory
WORKDIR /app/back

# Copy the app package.json file
COPY ./back/package.json ./

# Install backend dependencies
RUN npm install \
    && npm install -g serve \
    && npm run db:migrate \
    && npm run db:generate \
    && rm -fr node_modules

# Expose the port
EXPOSE 3002

# Command to start the backend server
CMD ["npm", "run", "serve"]
