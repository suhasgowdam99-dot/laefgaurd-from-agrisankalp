# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 5000 5173

# Standard start command (Backend)
CMD [ "node", "server/index.js" ]
