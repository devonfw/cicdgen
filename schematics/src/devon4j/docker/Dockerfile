# 1. Build
FROM maven:3.6-jdk-11-alpine AS build
WORKDIR /app
COPY . .
RUN mvn clean install

# 2. Deploy Java war
FROM adoptopenjdk/openjdk11:jre-11.0.4_11-alpine
WORKDIR /app
COPY --from=build /app/server/target/<%= appname %>-server-bootified.war /app/
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/<%= appname %>-server-bootified.war"]