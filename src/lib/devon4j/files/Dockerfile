# 1. Build
FROM maven:3.6-jdk-8-alpine AS build
WORKDIR /app
COPY . /app
RUN mvn clean install

# 2. Deploy Java war
FROM java:8
WORKDIR /app
COPY --from=build /app/server/target/<%= appname %>-server-bootified.war /app/
ENTRYPOINT ["java","-jar","/app/<%= appname %>-server-bootified.war"]
EXPOSE 8080