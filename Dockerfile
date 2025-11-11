FROM node:22-alpine

RUN npm install -g tsx

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3232

CMD ["npm", "run", "drizzle:push"]

CMD ["npm", "run", "drizzle:seed"]

CMD ["npm", "run", "drizzle:studio"]

CMD ["npm", "run", "dev"]
