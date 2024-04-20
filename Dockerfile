# Start image with a node base image
FROM node:18.17.1

# The /app directory should act as the main application directory
WORKDIR /app

# Copy the app package and package-lock.json file
COPY package*.json ./

RUN npm install 


COPY ./back ./back

RUN npm run db:migrate

RUN npm run db:generate

EXPOSE 3002

CMD ["npm", "run", "serve"]
