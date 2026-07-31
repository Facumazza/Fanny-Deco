# ---- Build stage ----
# JDK image with Maven — used only to compile + package the fat JAR.
FROM eclipse-temurin:17-jdk-jammy AS build
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
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Run as a non-root user. If someone breaks out of the JVM, they're 'app'
# with a read-only home instead of root. Debian-style syntax (Alpine's
# addgroup/adduser -S doesn't exist here).
RUN groupadd --system app && useradd --system --gid app app
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
#   Kept at 50% (not the JDK default of 75%) because on Railway's smaller
#   plans the JVM overhead (metaspace, threads, native buffers, direct
#   memory) plus a 75%-heap comfortably exceeds the container limit under
#   real traffic and the kernel silently SIGKILLs the process — no stack
#   trace, just a restart loop every few hours. 50% leaves ~250MB of
#   headroom on a 512MB plan, which is enough for this app's working set.
#
# We do NOT set -Djava.net.preferIPv6Addresses=true here: on Debian (jammy)
# glibc's dual-stack resolver picks IPv6 automatically when a host is
# AAAA-only (postgres.railway.internal) and IPv4 when a host is dual-stack
# (Cloudflare R2 endpoints). Forcing IPv6 broke R2 uploads because Railway
# containers only have IPv6 routing to internal services, not to the public
# IPv6 internet — the SDK would get 'Network is unreachable' trying to POST
# to r2.cloudflarestorage.com over v6.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=50 -XX:+UseContainerSupport"

# Exec form so signals (SIGTERM from Railway on redeploy) reach the JVM,
# not a shell wrapper.
ENTRYPOINT ["java", "-jar", "app.jar"]
