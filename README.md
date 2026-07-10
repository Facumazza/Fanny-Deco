# ARTESA — Cuero & Cerámica

E-commerce artesanal en React + Spring Boot. Storefront público + panel admin + checkout via MercadoPago.

## Requisitos

- **Docker Desktop** (para Postgres)
- **JDK 17** — verificar con `java -version`
- **Node.js 20 LTS** + npm — verificar con `node -v`
- **Maven 3.9+** (opcional — el repo incluye `./mvnw`)
- **ngrok** (solo para probar el webhook de MercadoPago en local — `winget install ngrok.ngrok`)

## Levantar en local

**1. Base de datos:**
```bash
docker compose up -d
```
Postgres 16 en `localhost:5432`, DB `artesa` / user `artesa` / pass `artesa`.

**2. Backend:**
```bash
cd backend
cp .env.example .env  # y editá con tus credenciales de MP
./mvnw spring-boot:run
```
API en `http://localhost:8080`. Flyway aplica migrations y seed automáticamente.

**3. Frontend:**
```bash
cd frontend
npm install    # primera vez
npm run dev
```
App en `http://localhost:5173`. Vite proxea `/api/*` al backend.

**4. (Opcional) ngrok** para recibir webhooks de MercadoPago (ver sección abajo).

## Setup de MercadoPago

Sin esto, el checkout no funciona.

**a) Crear una cuenta de developer en MercadoPago:**
1. Ir a https://www.mercadopago.com.ar/developers/panel/app
2. Loguearte con tu cuenta de MP (o crearla).
3. **Crear aplicación** → elegí "Checkout Pro".
4. En la app creada, buscá **Credenciales de prueba**.
5. Copiá el **Access Token** que empieza con `TEST-...`.

**b) Ponerlo en el backend:**
```bash
cd backend
cp .env.example .env
# Editá .env y pegá tu access token en MERCADOPAGO_ACCESS_TOKEN
```

**c) Arrancar ngrok** en otra terminal:
```bash
ngrok http 8080
```
Copiá el URL `https://...ngrok-free.app` que muestra y pegalo en `.env` como `ARTESA_PUBLIC_BASE_URL` (sin barra al final). Reiniciá el backend.

**d) Probar con tarjetas de prueba:**

| Estado esperado | Número | CVV | Vto |
|---|---|---|---|
| Aprobado | `5031 7557 3453 0604` (Mastercard) | 123 | 11/25 |
| Rechazado | `5031 4332 1540 6351` (Mastercard) | 123 | 11/25 |
| Pendiente (Rapipago) | Método "Efectivo" en el checkout | - | - |

**Titular** en todas: `APRO` (aprobado) o `OTHE` (rechazado). **DNI** cualquier número de 8 dígitos.

Lista completa: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards

## Smoke test rápido

```bash
curl http://localhost:8080/api/categories
curl 'http://localhost:8080/api/products?category=carteras-cuero'
curl http://localhost:8080/api/reviews
```

## Tests

**Backend** (necesita Docker Desktop para Testcontainers):
```bash
cd backend && ./mvnw verify
```

**Frontend:**
```bash
cd frontend && npm test
```

## Endpoints principales

### Storefront público
| Método | Path | Descripción |
|---|---|---|
| `GET` | `/api/categories` | Lista categorías |
| `GET` | `/api/products` | Lista productos (query: `category`, `badge`, `q`, `page`, `size`, `sort`) |
| `GET` | `/api/products/{slug}` | Detalle de un producto |
| `GET` | `/api/reviews?limit=N` | Últimas N reseñas |
| `POST` | `/api/orders` | Crear orden (guest checkout) |
| `GET` | `/api/orders/{reference}` | Ver orden por referencia |
| `POST` | `/api/orders/{reference}/payment` | Crear preferencia MP → devuelve URL de redirect |
| `POST` | `/api/webhooks/mercadopago` | Webhook (llamado por MP) |

### Admin (requiere sesión — `POST /api/admin/auth/login`)
| Método | Path | Descripción |
|---|---|---|
| `GET` `POST` `PUT` `DELETE` | `/api/admin/products` | CRUD de productos |
| `GET` `POST` `PUT` `DELETE` | `/api/admin/categories` | CRUD de categorías |
| `GET` `PUT` | `/api/admin/orders` | Listar / ver / cambiar status de órdenes |
| `POST` | `/api/admin/uploads` | Upload multipart de imagen |

## Estructura del proyecto

```
backend/     Spring Boot 3.3 + Java 17 + JPA + Flyway + Postgres + MercadoPago SDK
frontend/    React 18 + Vite + TypeScript + Tailwind CSS
docs/        Specs y planes de implementación
```

## Troubleshooting

- **Backend arranca pero pagos fallan con "MP_SDK_ERROR":** revisá que `MERCADOPAGO_ACCESS_TOKEN` esté en `.env` y que el backend lo esté leyendo (`echo $MERCADOPAGO_ACCESS_TOKEN` antes de arrancar).
- **Webhook no llega:** ngrok tiene que estar corriendo, y `ARTESA_PUBLIC_BASE_URL` en `.env` tiene que apuntar al URL activo de ngrok. Reiniciá el backend después de cambiar `.env`.
- **Ngrok URL cambia cada vez:** el free tier es así. Cada vez que reiniciás ngrok tenés que actualizar `.env` y reiniciar el backend.
- **`Connection refused` en tests del backend:** Docker Desktop tiene que estar corriendo. Testcontainers necesita el daemon.
- **Puerto 5432 ocupado:** cambiar mapping en `docker-compose.yml` a `"5433:5432"` y ajustar `spring.datasource.url` en `application.yml`.

## Credenciales admin por default (cambialas antes de deployar)

- Email: `admin@artesa.com`
- Password: `changeme123`

Configurable via env vars `ARTESA_ADMIN_EMAIL` y `ARTESA_ADMIN_PASSWORD` (ver `backend/.env.example`).
