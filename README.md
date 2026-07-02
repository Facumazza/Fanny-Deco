# ARTESA — Cuero & Cerámica

E-commerce artesanal en React + Spring Boot. **Estado actual: Fase 1 (Fundación).**

Ver [spec de Fase 1](docs/superpowers/specs/2026-07-02-artesa-fase1-design.md) y [plan de implementación](docs/superpowers/plans/2026-07-02-artesa-fase1-implementation.md).

## Requisitos

- **Docker Desktop** (para Postgres)
- **JDK 17** — verificar con `java -version`
- **Node.js 20 LTS** + npm — verificar con `node -v`
- **Maven 3.9+** (opcional — el repo incluye `./mvnw`)

## Levantar en local (3 terminales)

**Terminal 1 — Base de datos:**
```bash
docker compose up -d
```
Esto levanta Postgres 16 en `localhost:5432` con DB `artesa`, user `artesa`, pass `artesa`.

**Terminal 2 — Backend:**
```bash
cd backend
./mvnw spring-boot:run
```
API disponible en `http://localhost:8080`. Flyway aplica migrations y seed automáticamente al primer arranque.

**Terminal 3 — Frontend:**
```bash
cd frontend
npm install    # solo la primera vez
npm run dev
```
App disponible en `http://localhost:5173`. Vite proxea `/api/*` al backend.

## Smoke test rápido

```bash
curl http://localhost:8080/api/categories
curl 'http://localhost:8080/api/products?category=carteras-cuero'
curl http://localhost:8080/api/reviews
```

## Tests

**Backend** (necesita Docker Desktop corriendo para Testcontainers):
```bash
cd backend && ./mvnw verify
```

**Frontend:**
```bash
cd frontend && npm test
```

## Endpoints (Fase 1)

| Método | Path | Descripción |
|---|---|---|
| `GET` | `/api/categories` | Lista las 4 categorías. |
| `GET` | `/api/products` | Lista productos. Query params: `category`, `badge`, `q`, `page`, `size` (máx 48), `sort` (`created_at,desc`, `price,asc`, `price,desc`). |
| `GET` | `/api/products/{slug}` | Detalle de un producto. 404 si no existe. |
| `GET` | `/api/reviews?limit=N` | Últimas N reseñas (default 6, máx 20). |

## Estructura del proyecto

```
backend/     Spring Boot 3.3 + Java 17 + JPA + Flyway + Postgres
frontend/    React 18 + Vite + TypeScript + Tailwind CSS
docs/        Specs y planes de implementación
```

## Troubleshooting

- **`Connection refused` en tests del backend:** asegurate que Docker Desktop esté corriendo. Testcontainers necesita el daemon.
- **Puerto 5432 ocupado:** cambiar el mapping en `docker-compose.yml` a `"5433:5432"` y ajustar `spring.datasource.url` en `application.yml`.
- **Google Fonts no cargan:** las fuentes vienen de CDN. Sin internet la app se ve con la fuente de fallback (system-ui).

## Roadmap (fases futuras)

- **Fase 2:** storefront visual pixel-fiel (hero, filtros por tab, "El Proceso", reseñas rendereadas, detalle de producto, wishlist en localStorage).
- **Fase 3:** carrito y checkout guest (sin pago).
- **Fase 4:** integración de pagos (MercadoPago o Stripe sandbox) + emails.
- **Fase 5:** panel admin.
