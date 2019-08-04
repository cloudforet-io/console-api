FROM node:10
# Create appBak directory
WORKDIR /usr/src/appBak
COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production
# Bundle appBak source

COPY --chown=node:node dist dist
COPY --chown=node:node src/config/env src/config/env
COPY --chown=node:node src/proto/ dist/proto/

EXPOSE 3000
CMD [ "npm", "run", "start" ]
