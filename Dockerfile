FROM node:9.4-alpine

WORKDIR /app

COPY package.json /app
RUN apk --update add git && yarn

COPY . /app


CMD ["node", "."]
