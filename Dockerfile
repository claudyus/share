FROM google/nodejs

RUN npm install -g grunt-cli bower

WORKDIR /app
COPY . /app

RUN npm install && bower --allow-root install

CMD ["node", "."]
