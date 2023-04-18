FROM node:18-alpine

COPY . .

RUN npm --prefix /ms-monitor/ i
RUN npm --prefix /git-repos-producer/ i
RUN npm --prefix /git-repos-consumer/ i

CMD ["npm", "--prefix", "./ms-monitor", "run", "start-all"]