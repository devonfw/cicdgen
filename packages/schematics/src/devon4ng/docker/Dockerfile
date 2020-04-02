# 1. Build
FROM node:lts AS build
WORKDIR /app
COPY . /app
RUN yarn
RUN yarn build --configuration=docker

# 2. Deploy
FROM devonfwforge/nginx4ng:latest

COPY --from=build /app/dist/. /var/www/
