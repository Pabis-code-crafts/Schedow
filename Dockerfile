FROM eclipse-temurin:21-jdk-alpine AS user-build
WORKDIR /workspace
COPY user-service/user-service/.mvn .mvn
COPY user-service/user-service/mvnw user-service/user-service/pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -DskipTests dependency:go-offline
COPY user-service/user-service/src src
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jdk-alpine AS schedule-build
WORKDIR /workspace
COPY schedule-service/.mvn .mvn
COPY schedule-service/mvnw schedule-service/pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -DskipTests dependency:go-offline
COPY schedule-service/src src
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jdk-alpine AS ai-build
WORKDIR /workspace
COPY ai-services/.mvn .mvn
COPY ai-services/mvnw ai-services/pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -DskipTests dependency:go-offline
COPY ai-services/src src
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jdk-alpine AS gateway-build
WORKDIR /workspace
COPY gateway-service/gateway-service/.mvn .mvn
COPY gateway-service/gateway-service/mvnw gateway-service/gateway-service/pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -DskipTests dependency:go-offline
COPY gateway-service/gateway-service/src src
RUN ./mvnw -B -DskipTests package

FROM node:22-alpine AS frontend-build
WORKDIR /app
RUN corepack enable
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend ./
ARG VITE_API_BASE_URL=/
ARG VITE_APP_NAME=Schedow
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
RUN pnpm build

FROM nginx:1.27-alpine
RUN apk add --no-cache openjdk21-jre bash
WORKDIR /app
COPY --from=user-build /workspace/target/*.jar /app/user-service.jar
COPY --from=schedule-build /workspace/target/*.jar /app/schedule-service.jar
COPY --from=ai-build /workspace/target/*.jar /app/ai-services.jar
COPY --from=gateway-build /workspace/target/*.jar /app/gateway-service.jar
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY docker/nginx.all-in-one.conf /etc/nginx/conf.d/default.conf
COPY docker/start-all.sh /app/start-all.sh
RUN chmod +x /app/start-all.sh
EXPOSE 80
CMD ["/app/start-all.sh"]