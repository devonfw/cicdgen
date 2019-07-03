# 1. Build
FROM node:lts AS build
WORKDIR /app
COPY . /app
RUN npm i -g yarn
RUN yarn
RUN yarn build --configuration=docker

# 2. Deploy
FROM nginx:alpine-perl

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/. /var/www/

RUN chown -R nginx /var/cache/nginx && chmod -R 755 /var/cache/nginx && chmod 777 /var/cache/nginx
RUN chown -R nginx /run && chmod -R 755 /run && chmod 777 /run

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
