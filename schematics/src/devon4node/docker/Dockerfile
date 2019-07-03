FROM node:lts

RUN npm install -g yarn

USER node
WORKDIR /home/node
COPY . .
RUN yarn
RUN yarn build
RUN yarn install --production=true
EXPOSE 3000

ENTRYPOINT [ "npm","run", "start:prod" ]