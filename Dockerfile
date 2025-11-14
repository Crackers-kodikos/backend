FROM node:22-alpine

RUN npm install -g tsx

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY . /app

COPY shell.sh /app/shell.sh
RUN chmod +x /app/shell.sh

EXPOSE 3232

CMD ["/app/shell.sh"]
