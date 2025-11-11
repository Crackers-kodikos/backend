FROM node:22-alpine

RUN npm install -g tsx

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3232

RUN npm run drizzle:push 
# && \ npm run drizzle:seed

CMD ["npm", "run", "dev"]