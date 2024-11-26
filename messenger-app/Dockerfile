# syntax=docker/dockerfile:1
FROM node:22
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./
RUN npm install
# Bundle the app source
COPY . .
# Just for CPS490
RUN echo "Creating a Docker image by Qbert Gang"
# the command to execute the app
CMD [ "npm", "start" ]