# ---- Build stage ----
# JDK image with Maven — used only to compile + package the fat JAR.
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /workspace

# Cache dependencies in their own layer: only re-download if pom.xml changes.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline

# Copy sources + build. -DskipTests: CI runs tests separately on every push;
# baking them into the image would double build time and require the
# Testcontainers Postgres image inside the Docker build sandbox.
COPY src/ src/
RUN ./mvnw -q -B -DskipTests package

# ---- Runtime stage ----
# Slim JRE — no Maven, no build tools, ~80MB smaller than the JDK image.
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Run as a non-root user. If someone breaks out of the JVM, they're 'app'
# with a read-only home instead of root.
RUN addgroup -S app && adduser -S app -G app
USER app

# Copy just the fat JAR from the build stage — no source, no .m2 cache.
COPY --from=build /workspace/target/*.jar app.jar

# Platform-agnostic port. Railway injects PORT env var; server.port in
# application.yml defaults to 8080 but we let $PORT win when set.
ENV PORT=8080
EXPOSE 8080

# JVM tuning for a container:
# - MaxRAMPercentage/UseContainerSupport: honor cgroup limits so the OOM
#   killer doesn't hit us because native + heap combined blew past the limit.
# - preferIPv6Addresses: Railway's private DNS (*.railway.internal) is
#   IPv6-only. Java defaults to IPv4, so without this flag the JDBC connection
#   to postgres.railway.internal fails with 'connection attempt failed'
#   (SQLState 08001) even though the URL is perfectly valid. Applies to any
#   host with an IPv6-only DNS record; harmless when talking to IPv4 hosts.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseContainerSupport -Djava.net.preferIPv6Addresses=true"

# Exec form so signals (SIGTERM from Railway on redeploy) reach the JVM,
# not a shell wrapper.
ENTRYPOINT ["java", "-jar", "app.jar"]
