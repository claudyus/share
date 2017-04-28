FROM node:7.9-alpine

RUN apk update && apk add git
RUN npm install -g grunt-cli bower

WORKDIR /app
COPY . /app

RUN npm install && bower --allow-root install

CMD ["node", "."]
