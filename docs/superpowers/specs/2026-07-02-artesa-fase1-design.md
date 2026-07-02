# ARTESA — Fase 1: Fundación

**Fecha:** 2026-07-02
**Estado:** Diseño aprobado, pendiente review final del usuario antes de plan.
**Diseño visual origen:** capturas del archivo Figma provistas por el usuario (5 screenshots del sitio ARTESA — Cuero & Cerámica).

## Contexto

Recrear el sitio de e-commerce **ARTESA — Cuero & Cerámica** en React + Spring Boot. El alcance total (catálogo dinámico + carrito + checkout + pagos reales + admin) es grande, así que se descompuso en 5 fases secuenciales. Cada fase tiene su propio spec y plan.

### Descomposición general

| Fase | Objetivo |
|---|---|
| **1 (este spec)** | Fundación técnica: monorepo, stack corriendo, catálogo dinámico servido por el backend, homepage funcional (sin pixel-perfect). |
| 2 | Storefront visual completo pixel-fiel: hero, categorías, cards con badges/ratings/swatches, "El Proceso", reseñas, detalle de producto, wishlist en localStorage. |
| 3 | Carrito persistido, libreta de direcciones guest, modelo `Orden`, flujo de checkout sin pago aún. |
| 4 | Pasarela de pagos (MercadoPago o Stripe sandbox), state machine de orden, emails transaccionales. |
| 5 | Panel admin (login admin único), CRUD productos/categorías con upload de imágenes, gestión de órdenes, moderación de reseñas. |

### Decisiones globales que aplican desde Fase 1

- **Sin sistema de cuentas de usuario final.** Toda la app es guest-first: wishlist en localStorage, carrito en localStorage sincronizado al checkout, órdenes atadas a email. Único login que existirá es el del admin (Fase 5).
- **Idioma UI:** solo español.
- **Moneda:** USD (como el diseño). Sin conversión multi-moneda.

## Alcance de la Fase 1

**Entra:**
- Monorepo con `frontend/`, `backend/`, `docker-compose.yml`, `README.md`.
- Backend Spring Boot 3 + JPA + Flyway + PostgreSQL. Entidades `Category`, `Product`, `ProductColor`, `Review`. Seed con las 4 categorías del diseño, ~12 productos reales visibles en las capturas, ~6 reseñas.
- 4 endpoints REST públicos (`GET /api/categories`, `GET /api/products` con filtros y paginación, `GET /api/products/{slug}`, `GET /api/reviews`).
- Frontend React 18 + Vite + TypeScript + Tailwind CSS. Design tokens (colores + tipografías) configurados. Homepage funcional que consume la API y muestra categorías y productos con `Header` visualmente fiel al diseño y `ProductCard` que ya incluye badge, rating, swatches y corazón wishlist (inerte).
- Tests: unitarios de servicios/mappers + integración con Testcontainers en backend; Vitest + RTL + MSW en frontend.
- README que documenta correr todo desde cero en < 5 minutos.

**No entra (queda para Fase 2+):**
- Hero pulido, sección "El Proceso", grilla de reseñas rendereada, footer completo.
- Tabs de filtro por categoría en la home con animación.
- Página de detalle de producto (el endpoint existe, la ruta React también, pero la página es placeholder).
- Wishlist funcional, carrito, auth, admin, pagos, emails.
- E2E tests, CI, deploy.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite 5, TypeScript 5, Tailwind CSS 3, React Router v6, fetch API (wrapper propio). |
| Testing FE | Vitest, React Testing Library, MSW. |
| Backend | Java 21 (LTS), Spring Boot 3.3, Spring Web, Spring Data JPA, Flyway, Bean Validation. |
| DB | PostgreSQL 16. |
| Testing BE | JUnit 5, Mockito, Testcontainers (Postgres). |
| Dev tooling | Docker Compose para Postgres. Maven para backend, npm para frontend. |

## Arquitectura y estructura del monorepo

```
FannyDeco/
├── docker-compose.yml         # Postgres + pgAdmin (opcional)
├── README.md
├── .gitignore
├── backend/
│   ├── pom.xml
│   ├── src/main/java/com/artesa/
│   │   ├── ArtesaApplication.java
│   │   ├── config/            # CORS, ObjectMapper, error handler
│   │   ├── catalog/           # Feature: catálogo
│   │   │   ├── domain/        # Category, Product, ProductColor, Review (entidades JPA)
│   │   │   ├── repository/    # Spring Data JPA repositories
│   │   │   ├── service/       # CatalogService (queries + filtros)
│   │   │   ├── web/           # CategoryController, ProductController, ReviewController + DTOs
│   │   │   └── mapper/        # Entity ↔ DTO
│   │   └── common/            # ApiError, GlobalExceptionHandler
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/      # V1__schema.sql, V2__seed.sql
│   └── src/test/java/…
└── frontend/
    ├── package.json
    ├── vite.config.ts         # Proxy /api → http://localhost:8080
    ├── tailwind.config.ts     # Design tokens
    ├── index.html             # Carga Google Fonts (Playfair Display + Inter)
    └── src/
        ├── main.tsx
        ├── App.tsx            # <BrowserRouter> con las rutas
        ├── api/
        │   ├── client.ts      # fetch wrapper: base URL, JSON, throw en 4xx/5xx
        │   └── catalog.ts     # getCategories/getProducts/getProduct/getReviews
        ├── types/             # Product, Category, Review, ApiError
        ├── pages/
        │   ├── HomePage.tsx
        │   ├── ProductPage.tsx  # placeholder Fase 1
        │   └── NotFoundPage.tsx
        ├── components/
        │   ├── layout/        # Header, Footer
        │   ├── catalog/       # CategoryCard, ProductCard, StarRating, Badge
        │   └── ui/            # Skeleton, ErrorState
        └── styles/
            └── index.css      # @tailwind directives + fuentes
```

**Puntos clave:**
- Backend organizado por **feature** (`catalog/`), no por capas técnicas. Cada feature es autocontenida.
- DTOs viven en `web/`. No serializamos entidades JPA al HTTP directamente (evita lazy loading fugas y desacopla el modelo persistente del contrato público).
- El frontend proxea `/api/*` al backend vía `vite.config.ts` en dev → sin CORS en local. En prod se resuelve con CORS explícito en `config/` cuando corresponda (fuera de scope de Fase 1).

## Modelo de datos

Cuatro tablas. Diseñadas para no requerir cambios de schema en Fase 2.

### `categories`
| columna | tipo | notas |
|---|---|---|
| id | BIGSERIAL PK | |
| slug | VARCHAR(80) UNIQUE NOT NULL | ej: `carteras-cuero` |
| name | VARCHAR(120) NOT NULL | "Carteras de Cuero" |
| subtitle | VARCHAR(200) | "Full-grain curtido al vegetal" |
| image_url | TEXT NOT NULL | |
| display_order | INT NOT NULL DEFAULT 0 | |

### `products`
| columna | tipo | notas |
|---|---|---|
| id | BIGSERIAL PK | |
| slug | VARCHAR(120) UNIQUE NOT NULL | ej: `bolso-tote-milano` |
| name | VARCHAR(200) NOT NULL | |
| description | TEXT | opcional; se usa en Fase 2 en el detalle |
| price_usd | NUMERIC(10,2) NOT NULL | |
| image_url | TEXT NOT NULL | |
| badge | VARCHAR(30) | nullable, valores: `MAS_VENDIDO`, `NUEVO`, `ARTESANAL`, `EDICION_LIMITADA`, `SET_X3`, `VERANO` |
| rating_avg | NUMERIC(2,1) NOT NULL DEFAULT 0 | |
| rating_count | INT NOT NULL DEFAULT 0 | |
| category_id | BIGINT NOT NULL FK → categories(id) | |
| created_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |

Índices: `products(category_id)`, `products(badge)`.

### `product_colors`
| columna | tipo | notas |
|---|---|---|
| id | BIGSERIAL PK | |
| product_id | BIGINT NOT NULL FK → products(id) ON DELETE CASCADE | |
| hex | CHAR(7) NOT NULL | `#6B4029` |
| display_order | INT NOT NULL DEFAULT 0 | |

### `reviews`
| columna | tipo | notas |
|---|---|---|
| id | BIGSERIAL PK | |
| author_name | VARCHAR(120) NOT NULL | |
| rating | SMALLINT NOT NULL | CHECK (rating BETWEEN 1 AND 5) |
| body | TEXT NOT NULL | |
| created_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |

**Decisiones:**
- `badge` como VARCHAR + `@Enumerated(EnumType.STRING)` en Java. Los valores son fijos por diseño, no dinámicos.
- `rating_avg` y `rating_count` **desnormalizados** en `products`. Las reseñas por producto llegarán en fases posteriores; en Fase 1 son datos del seed.
- Sin soft-delete todavía. Se agrega en Fase 5 cuando aparece el admin.
- Sin `updated_at` por ahora (nadie edita nada en Fase 1).
- Todo el schema se crea via Flyway (`V1__schema.sql`), datos iniciales en `V2__seed.sql`.

## Endpoints REST (Fase 1)

Todos son públicos, `GET`, sin auth. JSON. Errores con shape uniforme:

```json
{ "code": "PRODUCT_NOT_FOUND", "message": "…", "timestamp": "2026-07-02T10:00:00Z" }
```

### `GET /api/categories`
Lista todas las categorías ordenadas por `display_order`, luego por `name`.

Respuesta 200:
```json
[
  { "id": 1, "slug": "carteras-cuero", "name": "Carteras de Cuero",
    "subtitle": "Full-grain curtido al vegetal", "imageUrl": "https://…" }
]
```

### `GET /api/products`
Lista productos con filtros y paginación.

Query params (todos opcionales):
| param | tipo | default | notas |
|---|---|---|---|
| `category` | string (slug) | — | filtra por categoría |
| `badge` | string (enum) | — | filtra por badge |
| `q` | string | — | búsqueda `ILIKE %q%` sobre `name` |
| `page` | int | 0 | |
| `size` | int | 12 | máx 48; si excede, se clampa a 48 |
| `sort` | string | `created_at,desc` | también acepta `price,asc` y `price,desc` |

Respuesta 200 (formato paginado simplificado):
```json
{
  "content": [
    { "id": 1, "slug": "bolso-tote-milano", "name": "Bolso Tote Milano",
      "priceUsd": 285.00, "imageUrl": "https://…",
      "badge": "MAS_VENDIDO", "ratingAvg": 5.0, "ratingCount": 128,
      "categorySlug": "carteras-cuero",
      "colors": ["#6B4029", "#2B2A28", "#C9B79C"] }
  ],
  "page": 0, "size": 12, "totalElements": 42, "totalPages": 4
}
```

### `GET /api/products/{slug}`
Detalle de un producto.
- 200: mismo shape que el item del listado + `description` y `categoryName`.
- 404: `ApiError` con `code: PRODUCT_NOT_FOUND`.

### `GET /api/reviews?limit=6`
Últimas N reseñas ordenadas por `created_at DESC`. `limit` default 6, máx 20.

Respuesta 200:
```json
[
  { "id": 1, "authorName": "María G.", "rating": 5,
    "body": "…", "createdAt": "2026-06-10T14:00:00Z" }
]
```

**Decisiones:**
- Sin versionado (`/v1/`) todavía. Se agrega si Fase 4+ trae breaking changes.
- Shape de paginación custom más liviano que el default de Spring (`Pageable`).
- Precios como `number` JSON. Redondeo garantizado por `NUMERIC(10,2)` en DB.

## Frontend: design system y componentes

### Design tokens (Tailwind config)

```ts
// tailwind.config.ts (extracto)
theme: {
  extend: {
    colors: {
      brown: { dark: '#5C3A28', DEFAULT: '#6B4029' },
      cream: { bg: '#F5EFE5', card: '#FAF6EF' },
      terracotta: { DEFAULT: '#B04A2C', light: '#C55B2E' },
      ink: '#1A1A1A',
      muted: '#6B6B6B',
    },
    fontFamily: {
      display: ['"Playfair Display"', 'serif'],
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    borderRadius: { card: '4px' },
  }
}
```

Fuentes cargadas via `<link>` a Google Fonts en `index.html`.

### Ruteo

```
/                → HomePage
/producto/:slug  → ProductPage (placeholder en Fase 1, se implementa en Fase 2)
*                → NotFoundPage
```

### Componentes de Fase 1

**`Header`** — Fiel al diseño. Top-bar marrón con links (`Política de cambio y devolución`, `Opciones de pago`, `Método de envío`, `Contacto`) + iconos de redes (Instagram, Facebook, Twitter, YouTube, chat). Nav con logo `ARTESA` serif + `Cuero & Cerámica` como tagline + links (`Colecciones`, `Cuero`, `Cerámica`, `Nosotros`) + icono de carrito (visualmente presente, inerte).

**`Footer`** — Skeleton mínimo con copyright. Se completa en Fase 2.

**`CategoryCard`** — Card con imagen + overlay con `name` y `subtitle`.

**`ProductCard`** — Versión Fase 1:
- Imagen principal.
- `<Badge>` arriba a la izquierda si `badge != null`.
- Corazón wishlist arriba a la derecha (visual, click inerte).
- `<StarRating value={ratingAvg} count={ratingCount} />` con estrellas SVG, soporte de rating fraccional (media estrella).
- Nombre en tipografía display.
- Precio con formato `$XXX USD` (sin centavos, como en el diseño).
- Swatches de color a la derecha del precio (círculos con `background-color: hex`).

**`Badge`** — Componente que mapea el enum del backend a estilo visual (fondo terracota, texto claro) y a la etiqueta en español (`MAS_VENDIDO` → "MÁS VENDIDO", etc.).

**`StarRating`** — Reutilizable. Toma `value: number` (0-5, puede ser fraccional) y `count: number`. Rendereá 5 estrellas SVG. Rating fraccional se muestra rellenando parcialmente la estrella.

**`HomePage`**:
- Fetch en paralelo de `getCategories()` y `getProducts()` al montar.
- Estados: `loading` (skeletons), `error` (mensaje + botón "Reintentar"), `ok`.
- Layout: `<Header />` → sección `<h2>Nuestras categorías</h2>` con grid 4 col de `<CategoryCard>` → sección `<h2>Nuestra Colección</h2>` con grid 4 col de `<ProductCard>` → `<Footer />`.
- Sin hero elegante en Fase 1: título simple como placeholder.
- Sin tabs de filtro por categoría en Fase 1 (queda para Fase 2).

### Cliente HTTP

- `client.ts`: wrapper mínimo sobre `fetch`. Base URL desde `import.meta.env.VITE_API_BASE` o `/api` en dev. Parsea JSON. Si `!response.ok`, intenta leer `ApiError` del body y lo tira como `throw`.
- `catalog.ts`: funciones tipadas contra los DTOs del backend.
- Tipos TS en `types/` como espejo manual de los DTOs. En Fase 4 se puede considerar generar desde OpenAPI.

### Manejo de errores

- `ErrorBoundary` en la raíz de `App.tsx` para excepciones de render.
- Estados de fetch (`loading` / `error` / `ok`) por página.
- Mensajes al usuario en español, genéricos. Detalle técnico solo a consola.

## Testing

### Backend

**Unitarios (JUnit 5 + Mockito):**
- `CatalogServiceTest`: filtros combinados, paginación, sort, slug inexistente.
- `ProductMapperTest`: mapeo entity → DTO, flatten de `colors`.

**Integración (`@SpringBootTest` + Testcontainers Postgres):**
- `ProductControllerIT`: happy path con filtros, forma del JSON, 404 en slug inexistente, `size` que excede 48 se clampa, shape del `ApiError`.
- `CategoryControllerIT`: happy path, orden por `display_order`.
- `ReviewControllerIT`: happy path, `limit` respetado.
- **No usamos H2.** H2 no soporta `ILIKE` como Postgres y difiere en `NUMERIC`.

`mvn verify` corre todo.

### Frontend

**Vitest + RTL + MSW:**
- `ProductCard.test.tsx`: renderiza nombre, precio formateado, badge cuando llega, cantidad correcta de swatches, corazón wishlist inerte.
- `StarRating.test.tsx`: cantidad de estrellas rellenas para enteros y fraccionales.
- `HomePage.test.tsx`: con MSW interceptando `/api/*` — loading → ok → render de categorías y productos; path de error muestra mensaje y botón reintentar.

Sin E2E en Fase 1. Playwright entra en Fase 3.

`npm test` corre Vitest headless.

### Verificación manual (checklist en README)

1. `docker compose up -d` → Postgres levanta.
2. `mvn spring-boot:run` en `backend/` → API en `localhost:8080`.
3. `curl localhost:8080/api/categories` → devuelve las 4 categorías del seed.
4. `curl 'localhost:8080/api/products?category=carteras-cuero'` → productos filtrados.
5. `npm run dev` en `frontend/` → app en `localhost:5173`.
6. Abrir en navegador → header fiel al diseño, 4 categorías, grid de productos con badges/ratings/swatches. Sin errores en consola.

### Criterios de "done" para Fase 1

- `mvn verify` verde.
- `npm test` verde.
- Checklist manual entera OK.
- README documenta levantar todo desde cero en < 5 minutos.

## Riesgos e ítems a validar en implementación

- **Rendering de rating fraccional con SVG:** el enfoque con `<linearGradient>` que corta la estrella por `offset` es simple pero requiere IDs únicos si hay varios ratings en la misma página. Solución: `useId()` de React por instancia.
- **Testcontainers en Windows:** requiere Docker Desktop corriendo. Documentado en README.
- **Google Fonts en producción:** en Fase 1 usamos CDN de Google. Si eventualmente hay requerimientos de performance/privacidad, se self-hostean con `fontsource` — fuera de scope.
- **Currency formatting:** el diseño muestra precios enteros (`$285 USD`, `$165 USD`, sin centavos). Usar `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })` y concatenar ` USD` manualmente (o usar el output nativo `$285.00` según preferencia visual — decisión final en implementación).
