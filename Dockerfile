FROM node:16

ENV PORT 3000
ENV ROOT_PATH /opt/spaceone/wconsole-server

RUN mkdir -p ${ROOT_PATH}
WORKDIR ${ROOT_PATH}

COPY package.json package-lock.json tsconfig.build.json tsconfig.start.json .* ${ROOT_PATH}/
RUN npm ci

COPY config ${ROOT_PATH}/config
COPY src ${ROOT_PATH}/src

RUN npm run build && rm -rf ${ROOT_PATH}/src

ENV NODE_ENV production
EXPOSE ${PORT}

ENTRYPOINT ["npm", "run", "start"]
