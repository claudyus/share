# NOTE: use the same version of travis.yml
FROM node:10-alpine

WORKDIR /app

COPY package.json /app
RUN apk --update add git && yarn && yarn cache clean

COPY . /app


CMD ["node", "."]
