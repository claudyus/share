FROM google/nodejs

COPY . /app
WORKDIR /app

RUN npm install -g grunt-cli bower && \
	npm install && bower --allow-root install

ENV PORT 5000
EXPOSE 5000
CMD ["node", "."]
