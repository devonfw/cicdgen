FROM node:lts as builder

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

FROM node:lts

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production=true && yarn cache clean

COPY --from=builder /usr/src/app/dist/ ./dist/
COPY nest-cli.json ./
COPY ormconfig.json ./


EXPOSE 3000
CMD [ "npm","run", "start:prod" ] 