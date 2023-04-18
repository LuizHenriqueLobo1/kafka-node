FROM node:16-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY .env ./

COPY . .

EXPOSE 3009

CMD ["npm", "start"]