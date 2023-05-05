FROM node:18-alpine

WORKDIR /app

COPY . .

COPY /git-repos-producer/.env.example git-repos-producer/.env
COPY /git-repos-consumer/.env.example git-repos-consumer/.env

RUN npm --prefix /app/ms-monitor/ i
RUN npm --prefix /app/git-repos-producer/ i
RUN npm --prefix /app/git-repos-consumer/ i

CMD ["npm", "--prefix", "/app/ms-monitor", "run", "start-all"]