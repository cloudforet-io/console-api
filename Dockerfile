FROM node:10
# Create app directory
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source

COPY --chown=node:node dist dist
COPY --chown=node:node src/config/env src/config/env
COPY --chown=node:node src/proto/ dist/proto/

EXPOSE 3000
CMD [ "npm", "run", "start:dev" ]
