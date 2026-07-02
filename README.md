# ARTESA — Cuero & Cerámica

E-commerce artesanal. Fase 1: fundación (catálogo dinámico).

Ver [spec](docs/superpowers/specs/2026-07-02-artesa-fase1-design.md) y [plan de implementación](docs/superpowers/plans/2026-07-02-artesa-fase1-implementation.md).

## Requisitos

- Docker Desktop
- Java 21 (JDK)
- Maven 3.9+ (o usar `./mvnw`)
- Node.js 20 LTS + npm

## Cómo correr (WIP — se completa en la última tarea del plan)

1. `docker compose up -d`
2. `cd backend && ./mvnw spring-boot:run`
3. `cd frontend && npm install && npm run dev`
