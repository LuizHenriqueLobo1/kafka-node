FROM node:18-alpine

COPY . .

COPY /git-repos-producer/.env.example /git-repos-producer/.env
COPY /git-repos-consumer/.env.example /git-repos-consumer/.env

RUN npm --prefix /ms-monitor/ i
RUN npm --prefix /git-repos-producer/ i
RUN npm --prefix /git-repos-consumer/ i

CMD ["npm", "--prefix", "./ms-monitor", "run", "start-all"]