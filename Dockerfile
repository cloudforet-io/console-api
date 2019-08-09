FROM node:10

ENV PORT 3000
ENV ROOT_PATH /opt/cloudone/wconsole-server

RUN mkdir -p ${ROOT_PATH}
WORKDIR ${ROOT_PATH}

COPY package.json ${ROOT_PATH}/package.json
RUN npm install

COPY config ${ROOT_PATH}/config
COPY src ${ROOT_PATH}/src
COPY .* ${ROOT_PATH}/

RUN npm run build
RUN rm -rf ${ROOT_PATH}/src

ENV NODE_ENV production
EXPOSE ${PORT}

ENTRYPOINT ["npm", "run", "start"]
