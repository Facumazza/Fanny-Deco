# ARTESA — Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levantar el esqueleto full-stack del e-commerce ARTESA con backend Spring Boot 3 sirviendo catálogo desde Postgres y frontend React que consume esa API y muestra categorías + productos con `Header` fiel al diseño.

**Architecture:** Monorepo con `backend/` (Spring Boot 3 + JPA + Flyway + Postgres) y `frontend/` (React 18 + Vite + TS + Tailwind). Backend organizado por feature (`catalog/`). Frontend con fetch wrapper propio, React Router y design tokens en Tailwind config. Postgres corre en Docker.

**Tech Stack:** Java 17, Spring Boot 3.3, Spring Data JPA, Flyway, PostgreSQL 16, JUnit 5, Testcontainers. React 18, Vite 5, TypeScript 5, Tailwind CSS 3, React Router v6, Vitest, React Testing Library, MSW.

## Global Constraints

- Idioma UI: solo español.
- Moneda: USD, sin centavos en display (`$285 USD`).
- Sin usuarios finales. Wishlist/carrito serán localStorage en fases futuras. Fase 1 no expone auth de ninguna clase.
- Package Java: `com.artesa`. Maven groupId `com.artesa`, artifactId `artesa-backend`.
- DB name: `artesa`. Postgres user/pass en dev: `artesa` / `artesa`.
- Puerto backend: `8080`. Puerto frontend dev: `5173`. Vite proxea `/api/*` → `http://localhost:8080`.
- Endpoints públicos, sin CORS necesario en dev (por el proxy). Sin versionado (`/v1/`) todavía.
- Enum badges: `MAS_VENDIDO`, `NUEVO`, `ARTESANAL`, `EDICION_LIMITADA`, `SET_X3`, `VERANO`.
- Página de detalle de producto (`/producto/:slug`): endpoint funcional, ruta React presente, pero la página React es placeholder que muestra el slug.
- Wishlist heart en `ProductCard`: visible pero click inerte.
- Sin E2E, sin CI, sin deploy en esta fase.
- Commits: convencionales (`feat:`, `test:`, `chore:`, `docs:`, `fix:`). Frecuentes: uno por tarea al final.
- Spec de referencia: [docs/superpowers/specs/2026-07-02-artesa-fase1-design.md](../specs/2026-07-02-artesa-fase1-design.md).

---

## File Structure

Todo lo que se va a crear en esta fase:

```
FannyDeco/
├── .gitignore
├── .gitattributes
├── docker-compose.yml
├── README.md
├── docs/superpowers/
│   ├── specs/2026-07-02-artesa-fase1-design.md      (ya existe)
│   └── plans/2026-07-02-artesa-fase1-implementation.md (este archivo)
├── backend/
│   ├── pom.xml
│   ├── .gitignore
│   ├── mvnw / mvnw.cmd / .mvn/                       (Maven wrapper)
│   ├── src/main/java/com/artesa/
│   │   ├── ArtesaApplication.java
│   │   ├── config/CorsConfig.java
│   │   ├── common/
│   │   │   ├── ApiError.java
│   │   │   └── GlobalExceptionHandler.java
│   │   └── catalog/
│   │       ├── domain/
│   │       │   ├── Category.java
│   │       │   ├── Product.java
│   │       │   ├── ProductColor.java
│   │       │   ├── ProductBadge.java
│   │       │   └── Review.java
│   │       ├── repository/
│   │       │   ├── CategoryRepository.java
│   │       │   ├── ProductRepository.java
│   │       │   └── ReviewRepository.java
│   │       ├── service/
│   │       │   ├── CatalogService.java
│   │       │   └── ProductNotFoundException.java
│   │       ├── mapper/CatalogMapper.java
│   │       └── web/
│   │           ├── dto/
│   │           │   ├── CategoryDto.java
│   │           │   ├── ProductSummaryDto.java
│   │           │   ├── ProductDetailDto.java
│   │           │   ├── ReviewDto.java
│   │           │   └── PageDto.java
│   │           ├── CategoryController.java
│   │           ├── ProductController.java
│   │           └── ReviewController.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/
│   │       ├── V1__schema.sql
│   │       └── V2__seed.sql
│   └── src/test/java/com/artesa/
│       ├── catalog/service/CatalogServiceTest.java
│       ├── catalog/mapper/CatalogMapperTest.java
│       └── catalog/web/
│           ├── CategoryControllerIT.java
│           ├── ProductControllerIT.java
│           └── ReviewControllerIT.java
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── index.html
    ├── .gitignore
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── vite-env.d.ts
        ├── styles/index.css
        ├── types/api.ts
        ├── api/
        │   ├── client.ts
        │   └── catalog.ts
        ├── components/
        │   ├── layout/
        │   │   ├── Header.tsx
        │   │   └── Footer.tsx
        │   ├── catalog/
        │   │   ├── Badge.tsx
        │   │   ├── StarRating.tsx
        │   │   ├── CategoryCard.tsx
        │   │   └── ProductCard.tsx
        │   └── ui/
        │       ├── Skeleton.tsx
        │       └── ErrorState.tsx
        ├── pages/
        │   ├── HomePage.tsx
        │   ├── ProductPage.tsx
        │   └── NotFoundPage.tsx
        └── test/
            ├── setup.ts
            ├── mocks/handlers.ts
            ├── components/
            │   ├── Badge.test.tsx
            │   ├── StarRating.test.tsx
            │   └── ProductCard.test.tsx
            └── pages/HomePage.test.tsx
```

---

### Task 1: Inicializar monorepo (git, .gitignore, docker-compose, README skeleton)

**Files:**
- Create: `.gitignore`, `.gitattributes`, `docker-compose.yml`, `README.md`

**Interfaces:**
- Produces: Repo git inicializado, `docker compose up -d` levanta Postgres 16 en `localhost:5432` con DB `artesa`, user `artesa`, pass `artesa`.

- [ ] **Step 1: `git init` en el working directory**

Working dir: `C:\Users\facum\OneDrive\Desktop\FannyDeco`

```bash
git init
git config core.autocrlf false
```

- [ ] **Step 2: Crear `.gitattributes`**

```
* text=auto eol=lf
*.bat text eol=crlf
*.cmd text eol=crlf
```

- [ ] **Step 3: Crear `.gitignore` en la raíz**

```
# OS
.DS_Store
Thumbs.db

# IDEs
.idea/
.vscode/
*.iml

# Java / Maven
backend/target/
backend/.mvn/wrapper/maven-wrapper.jar

# Node
frontend/node_modules/
frontend/dist/
frontend/coverage/

# Env / secrets
.env
.env.local
```

- [ ] **Step 4: Crear `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: artesa-postgres
    environment:
      POSTGRES_DB: artesa
      POSTGRES_USER: artesa
      POSTGRES_PASSWORD: artesa
    ports:
      - "5432:5432"
    volumes:
      - artesa-pg-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U artesa -d artesa"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  artesa-pg-data:
```

- [ ] **Step 5: Crear `README.md` skeleton**

```markdown
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
```

- [ ] **Step 6: Verificar que Postgres levanta**

```bash
docker compose up -d
docker compose ps
```

Esperado: contenedor `artesa-postgres` en estado `Up (healthy)` después de ~10s.

Luego apagalo para no dejarlo corriendo:
```bash
docker compose down
```

- [ ] **Step 7: Commit**

```bash
git add .gitignore .gitattributes docker-compose.yml README.md docs/
git commit -m "chore: initialize monorepo with docker-compose and gitignore"
```

---

### Task 2: Scaffold backend Spring Boot

**Files:**
- Create: `backend/pom.xml`, `backend/.gitignore`, `backend/src/main/java/com/artesa/ArtesaApplication.java`, `backend/src/main/resources/application.yml`, `backend/src/test/java/com/artesa/ArtesaApplicationTests.java`
- Create: Maven wrapper (`mvnw`, `mvnw.cmd`, `.mvn/wrapper/*`) — se genera automáticamente en Step 4.

**Interfaces:**
- Produces: `mvn spring-boot:run` desde `backend/` arranca la app en `localhost:8080` (sin endpoints funcionales todavía, solo el health y actuator implícito). `mvn verify` corre el smoke test `contextLoads()`.

- [ ] **Step 1: Crear `backend/.gitignore`**

```
target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

.idea
*.iws
*.iml
*.ipr
```

- [ ] **Step 2: Crear `backend/pom.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>

    <groupId>com.artesa</groupId>
    <artifactId>artesa-backend</artifactId>
    <version>0.1.0</version>
    <name>artesa-backend</name>

    <properties>
        <java.version>17</java.version>
        <testcontainers.version>1.20.3</testcontainers.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>junit-jupiter</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.testcontainers</groupId>
                <artifactId>testcontainers-bom</artifactId>
                <version>${testcontainers.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 3: Crear `backend/src/main/java/com/artesa/ArtesaApplication.java`**

```java
package com.artesa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ArtesaApplication {
    public static void main(String[] args) {
        SpringApplication.run(ArtesaApplication.class, args);
    }
}
```

- [ ] **Step 4: Generar Maven wrapper**

```bash
cd backend
mvn -N io.takari:maven:wrapper -Dmaven=3.9.9
cd ..
```

Esto crea `mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties`.

- [ ] **Step 5: Crear `backend/src/main/resources/application.yml`**

```yaml
spring:
  application:
    name: artesa
  datasource:
    url: jdbc:postgresql://localhost:5432/artesa
    username: artesa
    password: artesa
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
    open-in-view: false
  flyway:
    enabled: true
    locations: classpath:db/migration

server:
  port: 8080

logging:
  level:
    org.hibernate.SQL: DEBUG
```

- [ ] **Step 6: Crear el test de smoke `backend/src/test/java/com/artesa/ArtesaApplicationTests.java`**

```java
package com.artesa;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
class ArtesaApplicationTests {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("artesa")
        .withUsername("artesa")
        .withPassword("artesa");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Test
    void contextLoads() {
    }
}
```

- [ ] **Step 7: Verificar compilación (el test va a fallar por falta de migrations — es esperado)**

```bash
cd backend
./mvnw compile
```

Esperado: BUILD SUCCESS.

- [ ] **Step 8: Commit**

```bash
git add backend/
git commit -m "feat(backend): scaffold Spring Boot 3.3 with Java 21, JPA, Flyway, Testcontainers"
```

---

### Task 3: Schema + seed data (Flyway migrations)

**Files:**
- Create: `backend/src/main/resources/db/migration/V1__schema.sql`
- Create: `backend/src/main/resources/db/migration/V2__seed.sql`

**Interfaces:**
- Produces: Tablas `categories`, `products`, `product_colors`, `reviews` con datos iniciales. Al final de esta tarea, `contextLoads()` de la Task 2 pasa porque las migrations son válidas.

- [ ] **Step 1: Crear `V1__schema.sql`**

```sql
CREATE TABLE categories (
    id             BIGSERIAL PRIMARY KEY,
    slug           VARCHAR(80)  NOT NULL UNIQUE,
    name           VARCHAR(120) NOT NULL,
    subtitle       VARCHAR(200),
    image_url      TEXT         NOT NULL,
    display_order  INT          NOT NULL DEFAULT 0
);

CREATE TABLE products (
    id            BIGSERIAL PRIMARY KEY,
    slug          VARCHAR(120)   NOT NULL UNIQUE,
    name          VARCHAR(200)   NOT NULL,
    description   TEXT,
    price_usd     NUMERIC(10,2)  NOT NULL,
    image_url     TEXT           NOT NULL,
    badge         VARCHAR(30),
    rating_avg    NUMERIC(2,1)   NOT NULL DEFAULT 0,
    rating_count  INT            NOT NULL DEFAULT 0,
    category_id   BIGINT         NOT NULL REFERENCES categories(id),
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),
    CONSTRAINT products_badge_check CHECK (
        badge IS NULL OR badge IN
        ('MAS_VENDIDO','NUEVO','ARTESANAL','EDICION_LIMITADA','SET_X3','VERANO')
    )
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_badge       ON products(badge);

CREATE TABLE product_colors (
    id             BIGSERIAL PRIMARY KEY,
    product_id     BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    hex            VARCHAR(7)   NOT NULL,
    display_order  INT          NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_colors_product_id ON product_colors(product_id);

CREATE TABLE reviews (
    id           BIGSERIAL PRIMARY KEY,
    author_name  VARCHAR(120) NOT NULL,
    rating       SMALLINT     NOT NULL,
    body         TEXT         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5)
);
```

- [ ] **Step 2: Crear `V2__seed.sql`**

Nota: las URLs de imágenes son placeholders de Unsplash. En Fase 5 (admin) se reemplazan con uploads reales.

```sql
INSERT INTO categories (slug, name, subtitle, image_url, display_order) VALUES
    ('carteras-cuero',  'Carteras de Cuero',        'Full-grain curtido al vegetal',
     'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', 1),
    ('carteras-otros',  'Carteras Otros Materiales','Lona, raffia y tejidos naturales',
     'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', 2),
    ('ceramica-deco',   'Cerámica Deco',            'Jarrones, esculturas y piezas de arte',
     'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800', 3),
    ('ceramica-casa',   'Cerámica Casa',            'Tazas, cuencos y maceteros',
     'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800', 4);

-- Productos: 12 items que reflejan lo visible en el diseño.
INSERT INTO products (slug, name, description, price_usd, image_url, badge, rating_avg, rating_count, category_id) VALUES
    ('bolso-tote-milano',       'Bolso Tote Milano',
     'Bolso tote de cuero full-grain italiano, matelasseado en chevron.',
     285.00,
     'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
     'MAS_VENDIDO', 5.0, 128, (SELECT id FROM categories WHERE slug='carteras-cuero')),

    ('cartera-minerva',         'Cartera Minerva',
     'Cartera estructurada roja con herrajes plateados.',
     165.00,
     'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800',
     'NUEVO', 5.0, 64, (SELECT id FROM categories WHERE slug='carteras-cuero')),

    ('mochila-foresta',         'Mochila Foresta',
     'Mochila urbana en lona resistente al agua.',
     340.00,
     'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
     NULL, 5.0, 42, (SELECT id FROM categories WHERE slug='carteras-otros')),

    ('bolso-lona-nomade',       'Bolso Lona Nómade',
     'Bolso de mano en lona con estampa floral vintage.',
     98.00,
     'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
     'VERANO', 5.0, 77, (SELECT id FROM categories WHERE slug='carteras-otros')),

    ('clutch-raffia-soleil',    'Clutch Raffia Soleil',
     'Clutch de raffia con solapa rayada.',
     72.00,
     'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
     'ARTESANAL', 5.0, 53, (SELECT id FROM categories WHERE slug='carteras-otros')),

    ('bolso-tejido-brisa',      'Bolso Tejido Brisa',
     'Bolso tejido a mano en fibras naturales.',
     115.00,
     'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
     NULL, 5.0, 38, (SELECT id FROM categories WHERE slug='carteras-otros')),

    ('jarron-vela',             'Jarrón Vela',
     'Jarrón cerámico gres con esmalte moteado.',
     95.00,
     'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
     'ARTESANAL', 5.0, 88, (SELECT id FROM categories WHERE slug='ceramica-deco')),

    ('plato-decorativo-luma',   'Plato Decorativo Luma',
     'Plato decorativo con vidriado mate.',
     58.00,
     'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800',
     NULL, 5.0, 57, (SELECT id FROM categories WHERE slug='ceramica-deco')),

    ('escultura-organica-alba', 'Escultura Orgánica Alba',
     'Pieza escultórica hecha a torno con forma orgánica.',
     130.00,
     'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
     'EDICION_LIMITADA', 5.0, 29, (SELECT id FROM categories WHERE slug='ceramica-deco')),

    ('set-cuencos-tierra',      'Set Cuencos Tierra',
     'Set de 3 cuencos de gres con base natural.',
     78.00,
     'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800',
     'SET_X3', 5.0, 115, (SELECT id FROM categories WHERE slug='ceramica-casa')),

    ('taza-ritual',             'Taza Ritual',
     'Taza de porcelana con asa curva minimalista.',
     42.00,
     'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800',
     'NUEVO', 5.0, 96, (SELECT id FROM categories WHERE slug='ceramica-casa')),

    ('macetero-raiz',           'Macetero Raíz',
     'Macetero cerámico turquesa con drenaje.',
     65.00,
     'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800',
     NULL, 5.0, 48, (SELECT id FROM categories WHERE slug='ceramica-casa'));

-- Colores por producto (swatches)
INSERT INTO product_colors (product_id, hex, display_order) VALUES
    ((SELECT id FROM products WHERE slug='bolso-tote-milano'), '#6B4029', 1),
    ((SELECT id FROM products WHERE slug='bolso-tote-milano'), '#2B2A28', 2),
    ((SELECT id FROM products WHERE slug='bolso-tote-milano'), '#C9B79C', 3),
    ((SELECT id FROM products WHERE slug='cartera-minerva'),   '#C7B499', 1),
    ((SELECT id FROM products WHERE slug='cartera-minerva'),   '#6B4029', 2),
    ((SELECT id FROM products WHERE slug='mochila-foresta'),   '#2B2A28', 1),
    ((SELECT id FROM products WHERE slug='mochila-foresta'),   '#4B4238', 2),
    ((SELECT id FROM products WHERE slug='bolso-lona-nomade'), '#C9B79C', 1),
    ((SELECT id FROM products WHERE slug='bolso-lona-nomade'), '#5B7360', 2),
    ((SELECT id FROM products WHERE slug='bolso-lona-nomade'), '#2B2A28', 3),
    ((SELECT id FROM products WHERE slug='clutch-raffia-soleil'), '#E5DBC2', 1),
    ((SELECT id FROM products WHERE slug='clutch-raffia-soleil'), '#BFA97D', 2),
    ((SELECT id FROM products WHERE slug='bolso-tejido-brisa'),   '#C7B499', 1),
    ((SELECT id FROM products WHERE slug='bolso-tejido-brisa'),   '#8B4A2C', 2),
    ((SELECT id FROM products WHERE slug='jarron-vela'),          '#E5DBC2', 1),
    ((SELECT id FROM products WHERE slug='jarron-vela'),          '#C9B79C', 2),
    ((SELECT id FROM products WHERE slug='jarron-vela'),          '#8B4A2C', 3),
    ((SELECT id FROM products WHERE slug='plato-decorativo-luma'),'#E5DBC2', 1),
    ((SELECT id FROM products WHERE slug='plato-decorativo-luma'),'#C9B79C', 2),
    ((SELECT id FROM products WHERE slug='plato-decorativo-luma'),'#6B4029', 3),
    ((SELECT id FROM products WHERE slug='escultura-organica-alba'),'#E5DBC2', 1),
    ((SELECT id FROM products WHERE slug='escultura-organica-alba'),'#BFA97D', 2),
    ((SELECT id FROM products WHERE slug='set-cuencos-tierra'),   '#8B4A2C', 1),
    ((SELECT id FROM products WHERE slug='set-cuencos-tierra'),   '#E5DBC2', 2),
    ((SELECT id FROM products WHERE slug='taza-ritual'),          '#C9B79C', 1),
    ((SELECT id FROM products WHERE slug='taza-ritual'),          '#6B4029', 2),
    ((SELECT id FROM products WHERE slug='taza-ritual'),          '#2B2A28', 3),
    ((SELECT id FROM products WHERE slug='macetero-raiz'),        '#8B4A2C', 1),
    ((SELECT id FROM products WHERE slug='macetero-raiz'),        '#6B4029', 2);

-- Reseñas (6)
INSERT INTO reviews (author_name, rating, body, created_at) VALUES
    ('María G.',    5, 'Calidad impecable. El cuero se siente premium desde el primer día.', now() - interval '3 days'),
    ('Laura P.',    5, 'Empaque hermoso, entrega rápida. La cartera es tal cual la foto.',    now() - interval '10 days'),
    ('Javier M.',   5, 'La cerámica es una obra de arte. Cada pieza se nota trabajada a mano.', now() - interval '17 days'),
    ('Sofía R.',    4, 'Muy buen producto. Solo tardó un poco más de lo que esperaba en llegar.', now() - interval '25 days'),
    ('Pablo T.',    5, 'El taller cumple con lo que promete. Sin producción en masa se nota.', now() - interval '40 days'),
    ('Camila L.',   5, 'Mi taza favorita. La uso todas las mañanas.',                          now() - interval '55 days');
```

- [ ] **Step 3: Levantar Postgres y correr el smoke test para validar las migrations**

```bash
docker compose up -d
cd backend
./mvnw test -Dtest=ArtesaApplicationTests
```

Esperado: `Tests run: 1, Failures: 0`. Flyway aplica V1 y V2 en la DB efímera de Testcontainers.

- [ ] **Step 4: Commit**

```bash
cd ..
git add backend/src/main/resources/db/migration/
git commit -m "feat(backend): add V1 schema and V2 seed with 4 categories, 12 products, 6 reviews"
```

---

### Task 4: Entidades JPA + repositories

**Files:**
- Create: `backend/src/main/java/com/artesa/catalog/domain/Category.java`
- Create: `backend/src/main/java/com/artesa/catalog/domain/ProductBadge.java`
- Create: `backend/src/main/java/com/artesa/catalog/domain/Product.java`
- Create: `backend/src/main/java/com/artesa/catalog/domain/ProductColor.java`
- Create: `backend/src/main/java/com/artesa/catalog/domain/Review.java`
- Create: `backend/src/main/java/com/artesa/catalog/repository/CategoryRepository.java`
- Create: `backend/src/main/java/com/artesa/catalog/repository/ProductRepository.java`
- Create: `backend/src/main/java/com/artesa/catalog/repository/ReviewRepository.java`

**Interfaces:**
- Produces:
  - `ProductBadge` enum con valores `MAS_VENDIDO, NUEVO, ARTESANAL, EDICION_LIMITADA, SET_X3, VERANO`.
  - `Category { Long id; String slug; String name; String subtitle; String imageUrl; int displayOrder; }` (JPA entity, tabla `categories`).
  - `Product { Long id; String slug; String name; String description; BigDecimal priceUsd; String imageUrl; ProductBadge badge; BigDecimal ratingAvg; int ratingCount; Category category; Instant createdAt; List<ProductColor> colors; }`.
  - `ProductColor { Long id; Product product; String hex; int displayOrder; }`.
  - `Review { Long id; String authorName; short rating; String body; Instant createdAt; }`.
  - `CategoryRepository extends JpaRepository<Category, Long>` con `Optional<Category> findBySlug(String slug)` y `List<Category> findAllByOrderByDisplayOrderAscNameAsc()`.
  - `ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product>` con `Optional<Product> findBySlug(String slug)`.
  - `ReviewRepository extends JpaRepository<Review, Long>` con `List<Review> findAllByOrderByCreatedAtDesc(Pageable p)`.

- [ ] **Step 1: Crear `Category.java`**

```java
package com.artesa.catalog.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 200)
    private String subtitle;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    protected Category() {}

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public String getName() { return name; }
    public String getSubtitle() { return subtitle; }
    public String getImageUrl() { return imageUrl; }
    public int getDisplayOrder() { return displayOrder; }
}
```

- [ ] **Step 2: Crear `ProductBadge.java`**

```java
package com.artesa.catalog.domain;

public enum ProductBadge {
    MAS_VENDIDO,
    NUEVO,
    ARTESANAL,
    EDICION_LIMITADA,
    SET_X3,
    VERANO
}
```

- [ ] **Step 3: Crear `Product.java`**

```java
package com.artesa.catalog.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_usd", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceUsd;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ProductBadge badge;

    @Column(name = "rating_avg", nullable = false, precision = 2, scale = 1)
    private BigDecimal ratingAvg;

    @Column(name = "rating_count", nullable = false)
    private int ratingCount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    private List<ProductColor> colors = new ArrayList<>();

    protected Product() {}

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPriceUsd() { return priceUsd; }
    public String getImageUrl() { return imageUrl; }
    public ProductBadge getBadge() { return badge; }
    public BigDecimal getRatingAvg() { return ratingAvg; }
    public int getRatingCount() { return ratingCount; }
    public Category getCategory() { return category; }
    public Instant getCreatedAt() { return createdAt; }
    public List<ProductColor> getColors() { return colors; }
}
```

- [ ] **Step 4: Crear `ProductColor.java`**

```java
package com.artesa.catalog.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "product_colors")
public class ProductColor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, columnDefinition = "CHAR(7)")
    private String hex;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    protected ProductColor() {}

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public String getHex() { return hex; }
    public int getDisplayOrder() { return displayOrder; }
}
```

- [ ] **Step 5: Crear `Review.java`**

```java
package com.artesa.catalog.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "author_name", nullable = false, length = 120)
    private String authorName;

    @Column(nullable = false)
    private short rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Review() {}

    public Long getId() { return id; }
    public String getAuthorName() { return authorName; }
    public short getRating() { return rating; }
    public String getBody() { return body; }
    public Instant getCreatedAt() { return createdAt; }
}
```

- [ ] **Step 6: Crear `CategoryRepository.java`**

```java
package com.artesa.catalog.repository;

import com.artesa.catalog.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    List<Category> findAllByOrderByDisplayOrderAscNameAsc();
}
```

- [ ] **Step 7: Crear `ProductRepository.java`**

```java
package com.artesa.catalog.repository;

import com.artesa.catalog.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>,
                                            JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);
}
```

- [ ] **Step 8: Crear `ReviewRepository.java`**

```java
package com.artesa.catalog.repository;

import com.artesa.catalog.domain.Review;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByOrderByCreatedAtDesc(Pageable p);
}
```

- [ ] **Step 9: Correr el smoke test para validar que las entidades mapean al schema**

```bash
cd backend
./mvnw test -Dtest=ArtesaApplicationTests
```

Esperado: PASS. Hibernate valida el mapeo contra la DB (por `ddl-auto: validate`).

- [ ] **Step 10: Commit**

```bash
cd ..
git add backend/src/main/java/com/artesa/catalog/
git commit -m "feat(backend): add JPA entities and repositories for catalog"
```

---

### Task 5: DTOs + mapper (con test unitario)

**Files:**
- Create: `backend/src/main/java/com/artesa/catalog/web/dto/CategoryDto.java`
- Create: `backend/src/main/java/com/artesa/catalog/web/dto/ProductSummaryDto.java`
- Create: `backend/src/main/java/com/artesa/catalog/web/dto/ProductDetailDto.java`
- Create: `backend/src/main/java/com/artesa/catalog/web/dto/ReviewDto.java`
- Create: `backend/src/main/java/com/artesa/catalog/web/dto/PageDto.java`
- Create: `backend/src/main/java/com/artesa/catalog/mapper/CatalogMapper.java`
- Create: `backend/src/test/java/com/artesa/catalog/mapper/CatalogMapperTest.java`

**Interfaces:**
- Produces:
  - `record CategoryDto(Long id, String slug, String name, String subtitle, String imageUrl)`.
  - `record ProductSummaryDto(Long id, String slug, String name, BigDecimal priceUsd, String imageUrl, ProductBadge badge, BigDecimal ratingAvg, int ratingCount, String categorySlug, List<String> colors)`.
  - `record ProductDetailDto(...campos de summary..., String description, String categoryName)`.
  - `record ReviewDto(Long id, String authorName, int rating, String body, Instant createdAt)`.
  - `record PageDto<T>(List<T> content, int page, int size, long totalElements, int totalPages)`.
  - `CatalogMapper` con `@Component` y métodos: `CategoryDto toDto(Category)`, `ProductSummaryDto toSummary(Product)`, `ProductDetailDto toDetail(Product)`, `ReviewDto toDto(Review)`, `<E,D> PageDto<D> toPage(Page<E>, Function<E,D> mapper)`.

- [ ] **Step 1: Crear los DTOs (records)**

`CategoryDto.java`:
```java
package com.artesa.catalog.web.dto;

public record CategoryDto(
    Long id, String slug, String name, String subtitle, String imageUrl
) {}
```

`ProductSummaryDto.java`:
```java
package com.artesa.catalog.web.dto;

import com.artesa.catalog.domain.ProductBadge;
import java.math.BigDecimal;
import java.util.List;

public record ProductSummaryDto(
    Long id,
    String slug,
    String name,
    BigDecimal priceUsd,
    String imageUrl,
    ProductBadge badge,
    BigDecimal ratingAvg,
    int ratingCount,
    String categorySlug,
    List<String> colors
) {}
```

`ProductDetailDto.java`:
```java
package com.artesa.catalog.web.dto;

import com.artesa.catalog.domain.ProductBadge;
import java.math.BigDecimal;
import java.util.List;

public record ProductDetailDto(
    Long id,
    String slug,
    String name,
    BigDecimal priceUsd,
    String imageUrl,
    ProductBadge badge,
    BigDecimal ratingAvg,
    int ratingCount,
    String categorySlug,
    String categoryName,
    String description,
    List<String> colors
) {}
```

`ReviewDto.java`:
```java
package com.artesa.catalog.web.dto;

import java.time.Instant;

public record ReviewDto(
    Long id, String authorName, int rating, String body, Instant createdAt
) {}
```

`PageDto.java`:
```java
package com.artesa.catalog.web.dto;

import java.util.List;

public record PageDto<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {}
```

- [ ] **Step 2: Escribir el test del mapper (falla)**

`backend/src/test/java/com/artesa/catalog/mapper/CatalogMapperTest.java`:

```java
package com.artesa.catalog.mapper;

import com.artesa.catalog.domain.*;
import com.artesa.catalog.web.dto.*;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CatalogMapperTest {

    private final CatalogMapper mapper = new CatalogMapper();

    @Test
    void toDto_mapsCategory() {
        Category c = new Category();
        ReflectionTestUtils.setField(c, "id", 1L);
        ReflectionTestUtils.setField(c, "slug", "carteras-cuero");
        ReflectionTestUtils.setField(c, "name", "Carteras de Cuero");
        ReflectionTestUtils.setField(c, "subtitle", "Full-grain");
        ReflectionTestUtils.setField(c, "imageUrl", "https://x/y.jpg");
        ReflectionTestUtils.setField(c, "displayOrder", 1);

        CategoryDto dto = mapper.toDto(c);

        assertThat(dto).isEqualTo(new CategoryDto(1L, "carteras-cuero", "Carteras de Cuero",
                                                  "Full-grain", "https://x/y.jpg"));
    }

    @Test
    void toSummary_flattensColorsAndIncludesCategorySlug() {
        Category c = new Category();
        ReflectionTestUtils.setField(c, "slug", "carteras-cuero");

        Product p = new Product();
        ReflectionTestUtils.setField(p, "id", 10L);
        ReflectionTestUtils.setField(p, "slug", "bolso-tote-milano");
        ReflectionTestUtils.setField(p, "name", "Bolso Tote Milano");
        ReflectionTestUtils.setField(p, "priceUsd", new BigDecimal("285.00"));
        ReflectionTestUtils.setField(p, "imageUrl", "https://x/img.jpg");
        ReflectionTestUtils.setField(p, "badge", ProductBadge.MAS_VENDIDO);
        ReflectionTestUtils.setField(p, "ratingAvg", new BigDecimal("5.0"));
        ReflectionTestUtils.setField(p, "ratingCount", 128);
        ReflectionTestUtils.setField(p, "category", c);

        ProductColor c1 = new ProductColor();
        ReflectionTestUtils.setField(c1, "hex", "#6B4029");
        ReflectionTestUtils.setField(c1, "displayOrder", 1);
        ProductColor c2 = new ProductColor();
        ReflectionTestUtils.setField(c2, "hex", "#2B2A28");
        ReflectionTestUtils.setField(c2, "displayOrder", 2);
        ReflectionTestUtils.setField(p, "colors", List.of(c1, c2));

        ProductSummaryDto dto = mapper.toSummary(p);

        assertThat(dto.id()).isEqualTo(10L);
        assertThat(dto.categorySlug()).isEqualTo("carteras-cuero");
        assertThat(dto.badge()).isEqualTo(ProductBadge.MAS_VENDIDO);
        assertThat(dto.colors()).containsExactly("#6B4029", "#2B2A28");
    }

    @Test
    void toDetail_includesDescriptionAndCategoryName() {
        Category c = new Category();
        ReflectionTestUtils.setField(c, "slug", "carteras-cuero");
        ReflectionTestUtils.setField(c, "name", "Carteras de Cuero");

        Product p = new Product();
        ReflectionTestUtils.setField(p, "id", 10L);
        ReflectionTestUtils.setField(p, "slug", "bolso-tote-milano");
        ReflectionTestUtils.setField(p, "name", "Bolso Tote Milano");
        ReflectionTestUtils.setField(p, "priceUsd", new BigDecimal("285.00"));
        ReflectionTestUtils.setField(p, "imageUrl", "https://x/img.jpg");
        ReflectionTestUtils.setField(p, "ratingAvg", new BigDecimal("5.0"));
        ReflectionTestUtils.setField(p, "ratingCount", 128);
        ReflectionTestUtils.setField(p, "category", c);
        ReflectionTestUtils.setField(p, "description", "Bolso premium.");
        ReflectionTestUtils.setField(p, "colors", List.of());

        ProductDetailDto dto = mapper.toDetail(p);

        assertThat(dto.description()).isEqualTo("Bolso premium.");
        assertThat(dto.categoryName()).isEqualTo("Carteras de Cuero");
        assertThat(dto.categorySlug()).isEqualTo("carteras-cuero");
    }

    @Test
    void toDto_mapsReview() {
        Review r = new Review();
        ReflectionTestUtils.setField(r, "id", 1L);
        ReflectionTestUtils.setField(r, "authorName", "María G.");
        ReflectionTestUtils.setField(r, "rating", (short) 5);
        ReflectionTestUtils.setField(r, "body", "Excelente");
        Instant ts = Instant.parse("2026-06-10T14:00:00Z");
        ReflectionTestUtils.setField(r, "createdAt", ts);

        ReviewDto dto = mapper.toDto(r);

        assertThat(dto).isEqualTo(new ReviewDto(1L, "María G.", 5, "Excelente", ts));
    }

    @Test
    void toPage_wrapsSpringPageIntoPageDto() {
        Page<String> src = new PageImpl<>(List.of("a", "b"), PageRequest.of(0, 12), 25);
        PageDto<String> out = mapper.toPage(src, s -> s.toUpperCase());

        assertThat(out.content()).containsExactly("A", "B");
        assertThat(out.page()).isZero();
        assertThat(out.size()).isEqualTo(12);
        assertThat(out.totalElements()).isEqualTo(25);
        assertThat(out.totalPages()).isEqualTo(3);
    }
}
```

- [ ] **Step 3: Correr el test para verificar que falla (aún no existe `CatalogMapper`)**

```bash
cd backend
./mvnw test -Dtest=CatalogMapperTest
```

Esperado: FAIL con "cannot resolve CatalogMapper".

- [ ] **Step 4: Implementar `CatalogMapper.java`**

```java
package com.artesa.catalog.mapper;

import com.artesa.catalog.domain.*;
import com.artesa.catalog.web.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Function;

@Component
public class CatalogMapper {

    public CategoryDto toDto(Category c) {
        return new CategoryDto(c.getId(), c.getSlug(), c.getName(),
                               c.getSubtitle(), c.getImageUrl());
    }

    public ProductSummaryDto toSummary(Product p) {
        return new ProductSummaryDto(
            p.getId(), p.getSlug(), p.getName(), p.getPriceUsd(), p.getImageUrl(),
            p.getBadge(), p.getRatingAvg(), p.getRatingCount(),
            p.getCategory().getSlug(),
            p.getColors().stream().map(ProductColor::getHex).toList()
        );
    }

    public ProductDetailDto toDetail(Product p) {
        return new ProductDetailDto(
            p.getId(), p.getSlug(), p.getName(), p.getPriceUsd(), p.getImageUrl(),
            p.getBadge(), p.getRatingAvg(), p.getRatingCount(),
            p.getCategory().getSlug(), p.getCategory().getName(),
            p.getDescription(),
            p.getColors().stream().map(ProductColor::getHex).toList()
        );
    }

    public ReviewDto toDto(Review r) {
        return new ReviewDto(r.getId(), r.getAuthorName(), r.getRating(),
                             r.getBody(), r.getCreatedAt());
    }

    public <E, D> PageDto<D> toPage(Page<E> src, Function<E, D> mapper) {
        List<D> content = src.getContent().stream().map(mapper).toList();
        return new PageDto<>(content, src.getNumber(), src.getSize(),
                             src.getTotalElements(), src.getTotalPages());
    }
}
```

- [ ] **Step 5: Correr el test — debe pasar**

```bash
./mvnw test -Dtest=CatalogMapperTest
```

Esperado: `Tests run: 5, Failures: 0`.

- [ ] **Step 6: Commit**

```bash
cd ..
git add backend/src/main/java/com/artesa/catalog/web/dto/ \
        backend/src/main/java/com/artesa/catalog/mapper/ \
        backend/src/test/java/com/artesa/catalog/mapper/
git commit -m "feat(backend): add catalog DTOs and mapper with unit tests"
```

---

### Task 6: CatalogService con Specifications + tests unitarios

**Files:**
- Create: `backend/src/main/java/com/artesa/catalog/service/ProductNotFoundException.java`
- Create: `backend/src/main/java/com/artesa/catalog/service/CatalogService.java`
- Create: `backend/src/test/java/com/artesa/catalog/service/CatalogServiceTest.java`

**Interfaces:**
- Consumes: `CategoryRepository`, `ProductRepository`, `ReviewRepository` (Task 4). Entidades y `ProductBadge` (Task 4).
- Produces:
  - `class ProductNotFoundException extends RuntimeException` (con `String slug`).
  - `class CatalogService` (`@Service`, `@Transactional(readOnly = true)`) con:
    - `List<Category> listCategories()`.
    - `Page<Product> searchProducts(String categorySlug, ProductBadge badge, String q, Pageable pageable)`.
    - `Product getProduct(String slug)` — tira `ProductNotFoundException` si no existe.
    - `List<Review> latestReviews(int limit)` — clampa `limit` al rango `[1, 20]`.

- [ ] **Step 1: Crear `ProductNotFoundException.java`**

```java
package com.artesa.catalog.service;

public class ProductNotFoundException extends RuntimeException {
    private final String slug;
    public ProductNotFoundException(String slug) {
        super("Product not found: " + slug);
        this.slug = slug;
    }
    public String getSlug() { return slug; }
}
```

- [ ] **Step 2: Escribir el test del servicio (falla)**

`backend/src/test/java/com/artesa/catalog/service/CatalogServiceTest.java`:

```java
package com.artesa.catalog.service;

import com.artesa.catalog.domain.Product;
import com.artesa.catalog.domain.ProductBadge;
import com.artesa.catalog.domain.Review;
import com.artesa.catalog.repository.CategoryRepository;
import com.artesa.catalog.repository.ProductRepository;
import com.artesa.catalog.repository.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogServiceTest {

    @Mock CategoryRepository categoryRepo;
    @Mock ProductRepository productRepo;
    @Mock ReviewRepository reviewRepo;

    @InjectMocks CatalogService service;

    @Test
    void searchProducts_delegatesToRepositoryWithSpecification() {
        Page<Product> emptyPage = new PageImpl<>(List.of());
        when(productRepo.findAll(any(Specification.class), any(Pageable.class)))
            .thenReturn(emptyPage);

        Page<Product> result = service.searchProducts(
            "carteras-cuero", ProductBadge.NUEVO, "bolso",
            PageRequest.of(0, 12));

        assertThat(result).isSameAs(emptyPage);
        verify(productRepo).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void getProduct_throwsWhenSlugMissing() {
        when(productRepo.findBySlug("no-existe")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getProduct("no-existe"))
            .isInstanceOf(ProductNotFoundException.class)
            .hasMessageContaining("no-existe");
    }

    @Test
    void getProduct_returnsWhenFound() {
        Product p = new Product();
        when(productRepo.findBySlug("slug")).thenReturn(Optional.of(p));
        assertThat(service.getProduct("slug")).isSameAs(p);
    }

    @Test
    void latestReviews_clampsLimitToOneMinimum() {
        when(reviewRepo.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
            .thenReturn(List.<Review>of());

        service.latestReviews(0);

        verify(reviewRepo).findAllByOrderByCreatedAtDesc(
            argThat(p -> p.getPageSize() == 1));
    }

    @Test
    void latestReviews_clampsLimitToTwentyMax() {
        when(reviewRepo.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
            .thenReturn(List.<Review>of());

        service.latestReviews(999);

        verify(reviewRepo).findAllByOrderByCreatedAtDesc(
            argThat(p -> p.getPageSize() == 20));
    }
}
```

- [ ] **Step 3: Verificar que falla**

```bash
cd backend
./mvnw test -Dtest=CatalogServiceTest
```

Esperado: FAIL — `CatalogService` no existe.

- [ ] **Step 4: Implementar `CatalogService.java`**

```java
package com.artesa.catalog.service;

import com.artesa.catalog.domain.Category;
import com.artesa.catalog.domain.Product;
import com.artesa.catalog.domain.ProductBadge;
import com.artesa.catalog.domain.Review;
import com.artesa.catalog.repository.CategoryRepository;
import com.artesa.catalog.repository.ProductRepository;
import com.artesa.catalog.repository.ReviewRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final CategoryRepository categoryRepo;
    private final ProductRepository productRepo;
    private final ReviewRepository reviewRepo;

    public CatalogService(CategoryRepository categoryRepo,
                          ProductRepository productRepo,
                          ReviewRepository reviewRepo) {
        this.categoryRepo = categoryRepo;
        this.productRepo = productRepo;
        this.reviewRepo = reviewRepo;
    }

    public List<Category> listCategories() {
        return categoryRepo.findAllByOrderByDisplayOrderAscNameAsc();
    }

    public Page<Product> searchProducts(String categorySlug,
                                        ProductBadge badge,
                                        String q,
                                        Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            if (categorySlug != null && !categorySlug.isBlank()) {
                preds.add(cb.equal(root.get("category").get("slug"), categorySlug));
            }
            if (badge != null) {
                preds.add(cb.equal(root.get("badge"), badge));
            }
            if (q != null && !q.isBlank()) {
                preds.add(cb.like(cb.lower(root.get("name")),
                                  "%" + q.toLowerCase() + "%"));
            }
            return preds.isEmpty() ? cb.conjunction() : cb.and(preds.toArray(new Predicate[0]));
        };
        return productRepo.findAll(spec, pageable);
    }

    public Product getProduct(String slug) {
        return productRepo.findBySlug(slug)
                          .orElseThrow(() -> new ProductNotFoundException(slug));
    }

    public List<Review> latestReviews(int limit) {
        int clamped = Math.max(1, Math.min(20, limit));
        return reviewRepo.findAllByOrderByCreatedAtDesc(PageRequest.of(0, clamped));
    }
}
```

- [ ] **Step 5: Correr tests — deben pasar**

```bash
./mvnw test -Dtest=CatalogServiceTest
```

Esperado: `Tests run: 5, Failures: 0`.

- [ ] **Step 6: Commit**

```bash
cd ..
git add backend/src/main/java/com/artesa/catalog/service/ \
        backend/src/test/java/com/artesa/catalog/service/
git commit -m "feat(backend): add CatalogService with Specification-based product search"
```

---

### Task 7: GlobalExceptionHandler + CategoryController + IT

**Files:**
- Create: `backend/src/main/java/com/artesa/common/ApiError.java`
- Create: `backend/src/main/java/com/artesa/common/GlobalExceptionHandler.java`
- Create: `backend/src/main/java/com/artesa/catalog/web/CategoryController.java`
- Create: `backend/src/test/java/com/artesa/catalog/web/CategoryControllerIT.java`

**Interfaces:**
- Consumes: `CatalogService.listCategories()` (Task 6), `CatalogMapper.toDto(Category)` (Task 5).
- Produces:
  - `record ApiError(String code, String message, Instant timestamp)`.
  - `GlobalExceptionHandler` con handler para `ProductNotFoundException` → 404 con `code: "PRODUCT_NOT_FOUND"` y para `MethodArgumentTypeMismatchException` → 400 con `code: "BAD_REQUEST"`.
  - `GET /api/categories` → 200 con `List<CategoryDto>`.

- [ ] **Step 1: Crear `ApiError.java`**

```java
package com.artesa.common;

import java.time.Instant;

public record ApiError(String code, String message, Instant timestamp) {
    public static ApiError of(String code, String message) {
        return new ApiError(code, message, Instant.now());
    }
}
```

- [ ] **Step 2: Crear `GlobalExceptionHandler.java`**

```java
package com.artesa.common;

import com.artesa.catalog.service.ProductNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<ApiError> productNotFound(ProductNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiError.of("PRODUCT_NOT_FOUND", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> typeMismatch(MethodArgumentTypeMismatchException e) {
        String msg = "Invalid value for parameter '" + e.getName() + "'";
        return ResponseEntity.badRequest().body(ApiError.of("BAD_REQUEST", msg));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException e) {
        return ResponseEntity.badRequest()
            .body(ApiError.of("VALIDATION_ERROR", e.getMessage()));
    }
}
```

- [ ] **Step 3: Crear `CategoryController.java`**

```java
package com.artesa.catalog.web;

import com.artesa.catalog.mapper.CatalogMapper;
import com.artesa.catalog.service.CatalogService;
import com.artesa.catalog.web.dto.CategoryDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CatalogService service;
    private final CatalogMapper mapper;

    public CategoryController(CatalogService service, CatalogMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<CategoryDto> list() {
        return service.listCategories().stream().map(mapper::toDto).toList();
    }
}
```

- [ ] **Step 4: Escribir el IT de `CategoryController`**

`backend/src/test/java/com/artesa/catalog/web/CategoryControllerIT.java`:

```java
package com.artesa.catalog.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class CategoryControllerIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("artesa")
        .withUsername("artesa")
        .withPassword("artesa");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired MockMvc mvc;

    @Test
    void listsFourCategoriesInDisplayOrder() throws Exception {
        mvc.perform(get("/api/categories"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(4))
            .andExpect(jsonPath("$[0].slug").value("carteras-cuero"))
            .andExpect(jsonPath("$[1].slug").value("carteras-otros"))
            .andExpect(jsonPath("$[2].slug").value("ceramica-deco"))
            .andExpect(jsonPath("$[3].slug").value("ceramica-casa"))
            .andExpect(jsonPath("$[0].name").value("Carteras de Cuero"))
            .andExpect(jsonPath("$[0].imageUrl").isNotEmpty());
    }
}
```

- [ ] **Step 5: Correr el IT**

```bash
cd backend
./mvnw test -Dtest=CategoryControllerIT
```

Esperado: `Tests run: 1, Failures: 0`.

- [ ] **Step 6: Commit**

```bash
cd ..
git add backend/src/main/java/com/artesa/common/ \
        backend/src/main/java/com/artesa/catalog/web/CategoryController.java \
        backend/src/test/java/com/artesa/catalog/web/CategoryControllerIT.java
git commit -m "feat(backend): add ApiError, exception handler, and GET /api/categories"
```

---

### Task 8: ProductController (listado + detalle) con IT

**Files:**
- Create: `backend/src/main/java/com/artesa/catalog/web/ProductController.java`
- Create: `backend/src/test/java/com/artesa/catalog/web/ProductControllerIT.java`

**Interfaces:**
- Consumes: `CatalogService.searchProducts()` y `getProduct()` (Task 6), `CatalogMapper.toSummary/toDetail/toPage` (Task 5).
- Produces:
  - `GET /api/products` con query params `category`, `badge`, `q`, `page`, `size`, `sort` → 200 `PageDto<ProductSummaryDto>`. `size` clampa a `[1, 48]`. `sort` acepta `created_at,desc` (default), `price,asc`, `price,desc`.
  - `GET /api/products/{slug}` → 200 `ProductDetailDto` o 404 `ApiError`.

- [ ] **Step 1: Implementar `ProductController.java`**

```java
package com.artesa.catalog.web;

import com.artesa.catalog.domain.Product;
import com.artesa.catalog.domain.ProductBadge;
import com.artesa.catalog.mapper.CatalogMapper;
import com.artesa.catalog.service.CatalogService;
import com.artesa.catalog.web.dto.PageDto;
import com.artesa.catalog.web.dto.ProductDetailDto;
import com.artesa.catalog.web.dto.ProductSummaryDto;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final int MAX_PAGE_SIZE = 48;

    private final CatalogService service;
    private final CatalogMapper mapper;

    public ProductController(CatalogService service, CatalogMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public PageDto<ProductSummaryDto> list(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) ProductBadge badge,
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(defaultValue = "created_at,desc") String sort
    ) {
        int clampedSize = Math.max(1, Math.min(MAX_PAGE_SIZE, size));
        int safePage = Math.max(0, page);
        Sort resolved = resolveSort(sort);
        var pageable = PageRequest.of(safePage, clampedSize, resolved);
        var results = service.searchProducts(category, badge, q, pageable);
        return mapper.toPage(results, mapper::toSummary);
    }

    @GetMapping("/{slug}")
    public ProductDetailDto get(@PathVariable String slug) {
        Product p = service.getProduct(slug);
        return mapper.toDetail(p);
    }

    private Sort resolveSort(String raw) {
        return switch (raw) {
            case "price,asc"  -> Sort.by(Sort.Order.asc("priceUsd"));
            case "price,desc" -> Sort.by(Sort.Order.desc("priceUsd"));
            default           -> Sort.by(Sort.Order.desc("createdAt"));
        };
    }
}
```

- [ ] **Step 2: Escribir el IT**

`backend/src/test/java/com/artesa/catalog/web/ProductControllerIT.java`:

```java
package com.artesa.catalog.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class ProductControllerIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("artesa").withUsername("artesa").withPassword("artesa");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired MockMvc mvc;

    @Test
    void listsAllProductsWithDefaultPagination() throws Exception {
        mvc.perform(get("/api/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(12))
            .andExpect(jsonPath("$.page").value(0))
            .andExpect(jsonPath("$.size").value(12))
            .andExpect(jsonPath("$.totalElements").value(12))
            .andExpect(jsonPath("$.totalPages").value(1))
            .andExpect(jsonPath("$.content[0].slug").isNotEmpty())
            .andExpect(jsonPath("$.content[0].colors").isArray());
    }

    @Test
    void filtersByCategory() throws Exception {
        mvc.perform(get("/api/products?category=carteras-cuero"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(2))
            .andExpect(jsonPath("$.content[?(@.categorySlug != 'carteras-cuero')]").isEmpty());
    }

    @Test
    void filtersByBadge() throws Exception {
        mvc.perform(get("/api/products?badge=NUEVO"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[?(@.badge != 'NUEVO')]").isEmpty())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void searchByQuery() throws Exception {
        mvc.perform(get("/api/products?q=bolso"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(3));
    }

    @Test
    void clampsSizeAboveMaximum() throws Exception {
        mvc.perform(get("/api/products?size=999"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.size").value(48));
    }

    @Test
    void sortsByPriceAscending() throws Exception {
        mvc.perform(get("/api/products?sort=price,asc&size=48"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].priceUsd").value(42.00));
    }

    @Test
    void getBySlugReturnsDetail() throws Exception {
        mvc.perform(get("/api/products/bolso-tote-milano"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.slug").value("bolso-tote-milano"))
            .andExpect(jsonPath("$.name").value("Bolso Tote Milano"))
            .andExpect(jsonPath("$.description").isNotEmpty())
            .andExpect(jsonPath("$.categoryName").value("Carteras de Cuero"))
            .andExpect(jsonPath("$.colors.length()").value(3));
    }

    @Test
    void getBySlugReturns404WhenMissing() throws Exception {
        mvc.perform(get("/api/products/no-existe"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"))
            .andExpect(jsonPath("$.message").exists())
            .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void invalidBadgeReturns400() throws Exception {
        mvc.perform(get("/api/products?badge=NO_EXISTE"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }
}
```

- [ ] **Step 3: Correr el IT**

```bash
cd backend
./mvnw test -Dtest=ProductControllerIT
```

Esperado: `Tests run: 9, Failures: 0`.

- [ ] **Step 4: Commit**

```bash
cd ..
git add backend/src/main/java/com/artesa/catalog/web/ProductController.java \
        backend/src/test/java/com/artesa/catalog/web/ProductControllerIT.java
git commit -m "feat(backend): add GET /api/products (list with filters + detail by slug)"
```

---

### Task 9: ReviewController + IT + smoke test end-to-end del backend

**Files:**
- Create: `backend/src/main/java/com/artesa/catalog/web/ReviewController.java`
- Create: `backend/src/test/java/com/artesa/catalog/web/ReviewControllerIT.java`

**Interfaces:**
- Consumes: `CatalogService.latestReviews(int)` (Task 6), `CatalogMapper.toDto(Review)` (Task 5).
- Produces: `GET /api/reviews?limit=N` → 200 `List<ReviewDto>` ordenados por `createdAt DESC`. `limit` default 6, clampa a `[1, 20]`.

- [ ] **Step 1: Crear `ReviewController.java`**

```java
package com.artesa.catalog.web;

import com.artesa.catalog.mapper.CatalogMapper;
import com.artesa.catalog.service.CatalogService;
import com.artesa.catalog.web.dto.ReviewDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final CatalogService service;
    private final CatalogMapper mapper;

    public ReviewController(CatalogService service, CatalogMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public List<ReviewDto> latest(@RequestParam(defaultValue = "6") int limit) {
        return service.latestReviews(limit).stream().map(mapper::toDto).toList();
    }
}
```

- [ ] **Step 2: Crear `ReviewControllerIT.java`**

```java
package com.artesa.catalog.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class ReviewControllerIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("artesa").withUsername("artesa").withPassword("artesa");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired MockMvc mvc;

    @Test
    void latestReturnsSixByDefault() throws Exception {
        mvc.perform(get("/api/reviews"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(6))
            .andExpect(jsonPath("$[0].authorName").value("María G."));
    }

    @Test
    void limitParamRespected() throws Exception {
        mvc.perform(get("/api/reviews?limit=3"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void limitAboveMaxIsClamped() throws Exception {
        mvc.perform(get("/api/reviews?limit=999"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(6));
    }
}
```

- [ ] **Step 3: Correr toda la suite backend para asegurar que nada rompió**

```bash
cd backend
./mvnw verify
```

Esperado: BUILD SUCCESS, todos los tests verdes (unitarios + ITs).

- [ ] **Step 4: Commit**

```bash
cd ..
git add backend/src/main/java/com/artesa/catalog/web/ReviewController.java \
        backend/src/test/java/com/artesa/catalog/web/ReviewControllerIT.java
git commit -m "feat(backend): add GET /api/reviews endpoint"
```

---

### Task 10: Scaffold frontend (Vite + React + TS + Tailwind)

**Files:**
- Create: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/tsconfig.node.json`, `frontend/vite.config.ts`, `frontend/tailwind.config.ts`, `frontend/postcss.config.js`, `frontend/index.html`, `frontend/.gitignore`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/vite-env.d.ts`, `frontend/src/styles/index.css`

**Interfaces:**
- Produces: `npm install && npm run dev` levanta la app en `localhost:5173`. Vite proxea `/api/*` a `http://localhost:8080`. Tailwind configurado con design tokens (colores marca, fuentes Playfair + Inter). App muestra "ARTESA" con estilos Tailwind aplicados.

- [ ] **Step 1: Crear `frontend/.gitignore`**

```
node_modules
dist
dist-ssr
*.local
coverage
.env
.env.local
*.log
```

- [ ] **Step 2: Crear `frontend/package.json`**

```json
{
  "name": "artesa-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "msw": "^2.4.11",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2",
    "vite": "^5.4.8",
    "vitest": "^2.1.2"
  }
}
```

- [ ] **Step 3: Crear `frontend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Crear `frontend/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "tailwind.config.ts"]
}
```

- [ ] **Step 5: Crear `frontend/vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false
  }
});
```

- [ ] **Step 6: Crear `frontend/tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brown: { dark: '#5C3A28', DEFAULT: '#6B4029' },
        cream: { bg: '#F5EFE5', card: '#FAF6EF' },
        terracotta: { DEFAULT: '#B04A2C', light: '#C55B2E' },
        ink: '#1A1A1A',
        muted: '#6B6B6B'
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: { card: '4px' }
    }
  },
  plugins: []
} satisfies Config;
```

- [ ] **Step 7: Crear `frontend/postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

- [ ] **Step 8: Crear `frontend/index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ARTESA — Cuero & Cerámica</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Crear `frontend/src/styles/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body { @apply bg-cream-bg text-ink font-sans antialiased; }
```

- [ ] **Step 10: Crear `frontend/src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 11: Crear `frontend/src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 12: Crear `frontend/src/App.tsx` (placeholder mínimo)**

```tsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="font-display text-5xl text-brown-dark">ARTESA</h1>
    </div>
  );
}
```

- [ ] **Step 13: Instalar deps y levantar el dev server**

```bash
cd frontend
npm install
npm run dev
```

Esperado: Vite arranca en `http://localhost:5173`. Al abrirlo en el navegador se ve "ARTESA" en tipografía serif Playfair, sobre fondo cream. Cerrar con Ctrl+C.

- [ ] **Step 14: Commit**

```bash
cd ..
git add frontend/
git commit -m "feat(frontend): scaffold Vite+React+TS+Tailwind with design tokens"
```

---

### Task 11: Types + HTTP client con test

**Files:**
- Create: `frontend/src/types/api.ts`
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/catalog.ts`
- Create: `frontend/src/test/setup.ts`
- Create: `frontend/src/test/mocks/handlers.ts`
- Create: `frontend/src/api/client.test.ts`

**Interfaces:**
- Produces:
  - Tipos TS espejo de los DTOs Java: `ProductBadge`, `Category`, `ProductSummary`, `ProductDetail`, `Review`, `Page<T>`, `ApiError`.
  - `apiFetch<T>(path: string, init?: RequestInit): Promise<T>` — hace `fetch`, parsea JSON, si `!res.ok` lee el body como `ApiError` y hace `throw`.
  - `catalog.getCategories()`, `getProducts(filters?)`, `getProduct(slug)`, `getReviews(limit?)`.

- [ ] **Step 1: Crear `frontend/src/types/api.ts`**

```ts
export type ProductBadge =
  | 'MAS_VENDIDO' | 'NUEVO' | 'ARTESANAL'
  | 'EDICION_LIMITADA' | 'SET_X3' | 'VERANO';

export interface Category {
  id: number;
  slug: string;
  name: string;
  subtitle: string | null;
  imageUrl: string;
}

export interface ProductSummary {
  id: number;
  slug: string;
  name: string;
  priceUsd: number;
  imageUrl: string;
  badge: ProductBadge | null;
  ratingAvg: number;
  ratingCount: number;
  categorySlug: string;
  colors: string[];
}

export interface ProductDetail extends ProductSummary {
  description: string | null;
  categoryName: string;
}

export interface Review {
  id: number;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  timestamp: string;
}

export class ApiRequestError extends Error {
  status: number;
  body: ApiError | null;
  constructor(status: number, body: ApiError | null) {
    super(body?.message ?? `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}
```

- [ ] **Step 2: Crear `frontend/src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

- [ ] **Step 3: Crear `frontend/src/test/mocks/handlers.ts` (fixtures compartidos)**

```ts
import { http, HttpResponse } from 'msw';
import type { Category, Page, ProductSummary, Review } from '../../types/api';

export const mockCategories: Category[] = [
  { id: 1, slug: 'carteras-cuero', name: 'Carteras de Cuero',
    subtitle: 'Full-grain curtido al vegetal', imageUrl: 'https://x/1.jpg' },
  { id: 2, slug: 'carteras-otros', name: 'Carteras Otros Materiales',
    subtitle: 'Lona, raffia y tejidos naturales', imageUrl: 'https://x/2.jpg' },
  { id: 3, slug: 'ceramica-deco', name: 'Cerámica Deco',
    subtitle: 'Jarrones', imageUrl: 'https://x/3.jpg' },
  { id: 4, slug: 'ceramica-casa', name: 'Cerámica Casa',
    subtitle: 'Tazas', imageUrl: 'https://x/4.jpg' },
];

export const mockProduct: ProductSummary = {
  id: 10, slug: 'bolso-tote-milano', name: 'Bolso Tote Milano',
  priceUsd: 285, imageUrl: 'https://x/p.jpg',
  badge: 'MAS_VENDIDO', ratingAvg: 5.0, ratingCount: 128,
  categorySlug: 'carteras-cuero',
  colors: ['#6B4029', '#2B2A28', '#C9B79C'],
};

export const mockProductsPage: Page<ProductSummary> = {
  content: [mockProduct],
  page: 0, size: 12, totalElements: 1, totalPages: 1,
};

export const mockReviews: Review[] = [
  { id: 1, authorName: 'María G.', rating: 5,
    body: 'Calidad impecable', createdAt: '2026-06-10T14:00:00Z' },
];

export const handlers = [
  http.get('/api/categories', () => HttpResponse.json(mockCategories)),
  http.get('/api/products',   () => HttpResponse.json(mockProductsPage)),
  http.get('/api/products/:slug', ({ params }) => {
    if (params.slug === 'no-existe') {
      return HttpResponse.json(
        { code: 'PRODUCT_NOT_FOUND', message: 'x', timestamp: 'x' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ ...mockProduct, description: 'desc',
                                categoryName: 'Carteras de Cuero' });
  }),
  http.get('/api/reviews', () => HttpResponse.json(mockReviews)),
];
```

- [ ] **Step 4: Escribir el test de `client.ts` (falla)**

`frontend/src/api/client.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/setup';
import { apiFetch } from './client';
import { ApiRequestError } from '../types/api';

describe('apiFetch', () => {
  it('parses JSON on 2xx', async () => {
    server.use(http.get('/api/x', () => HttpResponse.json({ ok: true })));
    const res = await apiFetch<{ ok: boolean }>('/x');
    expect(res).toEqual({ ok: true });
  });

  it('throws ApiRequestError on non-2xx with ApiError body', async () => {
    server.use(http.get('/api/x', () => HttpResponse.json(
      { code: 'BOOM', message: 'kaboom', timestamp: '2026' },
      { status: 500 }
    )));
    await expect(apiFetch('/x')).rejects.toBeInstanceOf(ApiRequestError);
  });

  it('throws ApiRequestError with null body when response is not JSON', async () => {
    server.use(http.get('/api/x', () => new HttpResponse('nope',
      { status: 500 })));
    await expect(apiFetch('/x')).rejects.toMatchObject({
      status: 500, body: null,
    });
  });
});
```

- [ ] **Step 5: Correr el test — falla**

```bash
cd frontend
npm test -- src/api/client.test.ts
```

Esperado: FAIL — no existe `client.ts`.

- [ ] **Step 6: Implementar `frontend/src/api/client.ts`**

```ts
import { ApiError, ApiRequestError } from '../types/api';

const BASE_URL = '/api';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Accept': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let body: ApiError | null = null;
    try { body = (await res.json()) as ApiError; } catch { /* not JSON */ }
    throw new ApiRequestError(res.status, body);
  }

  return res.json() as Promise<T>;
}
```

- [ ] **Step 7: Implementar `frontend/src/api/catalog.ts`**

```ts
import { apiFetch } from './client';
import type { Category, Page, ProductBadge, ProductDetail, ProductSummary, Review } from '../types/api';

export interface ProductFilters {
  category?: string;
  badge?: ProductBadge;
  q?: string;
  page?: number;
  size?: number;
  sort?: 'created_at,desc' | 'price,asc' | 'price,desc';
}

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories');
}

export function getProducts(filters: ProductFilters = {}): Promise<Page<ProductSummary>> {
  const qs = new URLSearchParams();
  if (filters.category) qs.set('category', filters.category);
  if (filters.badge)    qs.set('badge', filters.badge);
  if (filters.q)        qs.set('q', filters.q);
  if (filters.page !== undefined) qs.set('page', String(filters.page));
  if (filters.size !== undefined) qs.set('size', String(filters.size));
  if (filters.sort)     qs.set('sort', filters.sort);
  const suffix = qs.toString() ? `?${qs}` : '';
  return apiFetch<Page<ProductSummary>>(`/products${suffix}`);
}

export function getProduct(slug: string): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/products/${encodeURIComponent(slug)}`);
}

export function getReviews(limit = 6): Promise<Review[]> {
  return apiFetch<Review[]>(`/reviews?limit=${limit}`);
}
```

- [ ] **Step 8: Correr tests — deben pasar**

```bash
npm test -- src/api/client.test.ts
```

Esperado: PASS.

- [ ] **Step 9: Commit**

```bash
cd ..
git add frontend/src/types/ frontend/src/api/ frontend/src/test/
git commit -m "feat(frontend): add typed HTTP client, catalog API, and MSW test setup"
```

---

### Task 12: Componentes primitivos — Badge y StarRating (con tests)

**Files:**
- Create: `frontend/src/components/catalog/Badge.tsx`
- Create: `frontend/src/components/catalog/StarRating.tsx`
- Create: `frontend/src/test/components/Badge.test.tsx`
- Create: `frontend/src/test/components/StarRating.test.tsx`

**Interfaces:**
- Produces:
  - `<Badge kind={ProductBadge} />` — renderea etiqueta ES en fondo terracota. Mapa: `MAS_VENDIDO → "MÁS VENDIDO"`, `NUEVO → "NUEVO"`, `ARTESANAL → "ARTESANAL"`, `EDICION_LIMITADA → "EDICIÓN LIMITADA"`, `SET_X3 → "SET X3"`, `VERANO → "VERANO"`.
  - `<StarRating value={number} count={number} />` — 5 estrellas SVG (24px). Rating fraccional se renderea con clip-path o `<linearGradient>`. Muestra `(count)` a la derecha.

- [ ] **Step 1: Escribir tests de `Badge`**

`frontend/src/test/components/Badge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../../components/catalog/Badge';

describe('Badge', () => {
  it('renders Spanish label for MAS_VENDIDO', () => {
    render(<Badge kind="MAS_VENDIDO" />);
    expect(screen.getByText('MÁS VENDIDO')).toBeInTheDocument();
  });

  it('renders EDICIÓN LIMITADA with accent', () => {
    render(<Badge kind="EDICION_LIMITADA" />);
    expect(screen.getByText('EDICIÓN LIMITADA')).toBeInTheDocument();
  });

  it('renders SET X3 with space', () => {
    render(<Badge kind="SET_X3" />);
    expect(screen.getByText('SET X3')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Escribir tests de `StarRating`**

`frontend/src/test/components/StarRating.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StarRating } from '../../components/catalog/StarRating';

describe('StarRating', () => {
  it('renders count in parentheses', () => {
    render(<StarRating value={5} count={128} />);
    expect(screen.getByText('(128)')).toBeInTheDocument();
  });

  it('renders 5 star elements', () => {
    const { container } = render(<StarRating value={4} count={10} />);
    expect(container.querySelectorAll('[data-star]')).toHaveLength(5);
  });

  it('marks fractional rating with fill percentage attribute', () => {
    const { container } = render(<StarRating value={4.5} count={10} />);
    const stars = container.querySelectorAll('[data-star-fill]');
    const fills = Array.from(stars).map(s => s.getAttribute('data-star-fill'));
    expect(fills).toEqual(['1', '1', '1', '1', '0.5']);
  });
});
```

- [ ] **Step 3: Correr — deben fallar**

```bash
cd frontend
npm test -- src/test/components/
```

Esperado: FAIL — componentes no existen.

- [ ] **Step 4: Implementar `Badge.tsx`**

```tsx
import type { ProductBadge } from '../../types/api';

const LABELS: Record<ProductBadge, string> = {
  MAS_VENDIDO: 'MÁS VENDIDO',
  NUEVO: 'NUEVO',
  ARTESANAL: 'ARTESANAL',
  EDICION_LIMITADA: 'EDICIÓN LIMITADA',
  SET_X3: 'SET X3',
  VERANO: 'VERANO',
};

export function Badge({ kind }: { kind: ProductBadge }) {
  return (
    <span className="inline-block bg-terracotta text-white text-[10px] font-semibold tracking-wider px-2 py-1 rounded-sm">
      {LABELS[kind]}
    </span>
  );
}
```

- [ ] **Step 5: Implementar `StarRating.tsx`**

```tsx
import { useId } from 'react';

export function StarRating({ value, count }: { value: number; count: number }) {
  const clamped = Math.max(0, Math.min(5, value));
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fill = Math.max(0, Math.min(1, clamped - i));
    return fill;
  });

  return (
    <div className="inline-flex items-center gap-1 text-terracotta text-sm">
      <div className="inline-flex" role="img" aria-label={`Rating ${clamped} de 5`}>
        {stars.map((fill, i) => (
          <Star key={i} fill={fill} />
        ))}
      </div>
      <span className="text-muted">({count})</span>
    </div>
  );
}

function Star({ fill }: { fill: number }) {
  const id = useId();
  return (
    <svg
      data-star
      data-star-fill={fill}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden
    >
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} stopColor="#E5E5E5" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.5L6 22l1.5-7.2L2 10l7.1-1.1L12 2z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}
```

- [ ] **Step 6: Correr — deben pasar**

```bash
npm test -- src/test/components/
```

Esperado: PASS.

- [ ] **Step 7: Commit**

```bash
cd ..
git add frontend/src/components/catalog/Badge.tsx \
        frontend/src/components/catalog/StarRating.tsx \
        frontend/src/test/components/Badge.test.tsx \
        frontend/src/test/components/StarRating.test.tsx
git commit -m "feat(frontend): add Badge and StarRating components with tests"
```

---

### Task 13: CategoryCard + ProductCard (con test)

**Files:**
- Create: `frontend/src/components/catalog/CategoryCard.tsx`
- Create: `frontend/src/components/catalog/ProductCard.tsx`
- Create: `frontend/src/test/components/ProductCard.test.tsx`

**Interfaces:**
- Consumes: `Badge`, `StarRating` (Task 12), tipos `Category` y `ProductSummary` (Task 11).
- Produces:
  - `<CategoryCard category={Category} />` — imagen full-size con overlay al pie con `name` (font-display) y `subtitle`.
  - `<ProductCard product={ProductSummary} />` — imagen, `<Badge>` si `product.badge`, corazón wishlist (SVG inerte), `<StarRating>`, nombre en font-display, precio `$XXX USD`, swatches como círculos.

- [ ] **Step 1: Escribir test de `ProductCard`**

`frontend/src/test/components/ProductCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductCard } from '../../components/catalog/ProductCard';
import { mockProduct } from '../mocks/handlers';

describe('ProductCard', () => {
  it('renders name, price without decimals, and badge label', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Bolso Tote Milano')).toBeInTheDocument();
    expect(screen.getByText('$285 USD')).toBeInTheDocument();
    expect(screen.getByText('MÁS VENDIDO')).toBeInTheDocument();
  });

  it('renders correct number of color swatches', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    expect(container.querySelectorAll('[data-swatch]')).toHaveLength(3);
  });

  it('renders wishlist heart (inert)', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    expect(container.querySelector('[data-wishlist]')).not.toBeNull();
  });

  it('omits badge when product.badge is null', () => {
    render(<ProductCard product={{ ...mockProduct, badge: null }} />);
    expect(screen.queryByText('MÁS VENDIDO')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr — falla**

```bash
cd frontend
npm test -- src/test/components/ProductCard.test.tsx
```

Esperado: FAIL — `ProductCard` no existe.

- [ ] **Step 3: Implementar `CategoryCard.tsx`**

```tsx
import type { Category } from '../../types/api';

export function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="relative overflow-hidden rounded-card aspect-[3/4] group">
      <img
        src={category.imageUrl}
        alt={category.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <h3 className="font-display text-2xl leading-tight">{category.name}</h3>
        {category.subtitle && (
          <p className="text-sm opacity-90 mt-1">{category.subtitle}</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implementar `ProductCard.tsx`**

```tsx
import type { ProductSummary } from '../../types/api';
import { Badge } from './Badge';
import { StarRating } from './StarRating';

const priceFmt = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
});

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="bg-white rounded-card overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-cream-card">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge kind={product.badge} />
          </div>
        )}
        <button
          type="button"
          data-wishlist
          aria-label="Agregar a favoritos"
          className="absolute top-3 right-3 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white cursor-default"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <StarRating value={product.ratingAvg} count={product.ratingCount} />
        <h3 className="font-display text-lg leading-snug text-ink">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-terracotta font-semibold">
            {priceFmt.format(product.priceUsd).replace('$', '$')} USD
          </span>
          <div className="flex gap-1">
            {product.colors.map((hex, i) => (
              <span
                key={i}
                data-swatch
                title={hex}
                style={{ backgroundColor: hex }}
                className="w-4 h-4 rounded-sm border border-black/10"
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
```

Nota sobre el precio: `Intl.NumberFormat('en-US', ..., maximumFractionDigits: 0).format(285)` devuelve `"$285"`. Se le concatena ` USD` para llegar al formato del diseño (`"$285 USD"`).

- [ ] **Step 5: Correr — deben pasar**

```bash
npm test -- src/test/components/ProductCard.test.tsx
```

Esperado: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
cd ..
git add frontend/src/components/catalog/CategoryCard.tsx \
        frontend/src/components/catalog/ProductCard.tsx \
        frontend/src/test/components/ProductCard.test.tsx
git commit -m "feat(frontend): add CategoryCard and ProductCard components"
```

---

### Task 14: Header (fiel al diseño) + Footer skeleton

**Files:**
- Create: `frontend/src/components/layout/Header.tsx`
- Create: `frontend/src/components/layout/Footer.tsx`

**Interfaces:**
- Produces:
  - `<Header />` — top-bar marrón con links (`Política de cambio y devolución`, `Opciones de pago`, `Método de envío`, `Contacto`) + iconos de redes; nav con logo `ARTESA` + tagline + links (`Colecciones`, `Cuero`, `Cerámica`, `Nosotros`) + icono de carrito (inerte).
  - `<Footer />` — skeleton mínimo con copyright.

- [ ] **Step 1: Implementar `Header.tsx`**

```tsx
export function Header() {
  return (
    <header>
      {/* Top-bar */}
      <div className="bg-brown-dark text-white text-xs">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <nav className="flex items-center gap-6">
            <a href="#" className="hover:opacity-80">Política de cambio y devolución</a>
            <a href="#" className="hover:opacity-80">Opciones de pago</a>
            <a href="#" className="hover:opacity-80">Método de envío</a>
            <a href="#" className="hover:opacity-80">Contacto</a>
          </nav>
          <div className="flex items-center gap-3 text-lg" aria-label="Redes sociales">
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="YouTube">▶</a>
            <a href="#" aria-label="Chat">💬</a>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="bg-cream-bg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="flex flex-col leading-none">
            <span className="font-display text-3xl tracking-widest text-ink">ARTESA</span>
            <span className="font-sans text-[10px] tracking-[0.3em] text-muted mt-1">CUERO &amp; CERÁMICA</span>
          </a>
          <nav className="flex items-center gap-10 text-sm text-ink">
            <a href="#" className="hover:text-terracotta">Colecciones</a>
            <a href="#" className="hover:text-terracotta">Cuero</a>
            <a href="#" className="hover:text-terracotta">Cerámica</a>
            <a href="#" className="hover:text-terracotta">Nosotros</a>
          </nav>
          <button aria-label="Carrito" className="text-2xl cursor-default">🛍</button>
        </div>
      </div>
    </header>
  );
}
```

Nota sobre iconos: en Fase 1 usamos glifos/emojis para redes/carrito para no incorporar una librería de iconos. Fase 2 los reemplaza por SVGs o `lucide-react`.

- [ ] **Step 2: Implementar `Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="bg-brown-dark text-white/80 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <p>© {new Date().getFullYear()} ARTESA — Cuero &amp; Cerámica.</p>
        <p className="opacity-60">Hecho a mano, para durar.</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Verificar visualmente**

```bash
cd frontend
npm run dev
```

Abrir `http://localhost:5173`. Debe verse el header estilizado, sobre fondo cream. La página aún muestra el `<h1>ARTESA</h1>` del scaffold porque no montamos el Header todavía — eso pasa en la próxima tarea.

Cerrar con Ctrl+C.

- [ ] **Step 4: Commit**

```bash
cd ..
git add frontend/src/components/layout/
git commit -m "feat(frontend): add Header (top-bar + main nav) and Footer skeleton"
```

---

### Task 15: HomePage + rutas + ProductPage placeholder + NotFoundPage (con test de integración MSW)

**Files:**
- Create: `frontend/src/pages/HomePage.tsx`
- Create: `frontend/src/pages/ProductPage.tsx`
- Create: `frontend/src/pages/NotFoundPage.tsx`
- Create: `frontend/src/components/ui/Skeleton.tsx`
- Create: `frontend/src/components/ui/ErrorState.tsx`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/test/pages/HomePage.test.tsx`

**Interfaces:**
- Consumes: `getCategories`, `getProducts` (Task 11), `CategoryCard`, `ProductCard` (Task 13), `Header`, `Footer` (Task 14).
- Produces:
  - `HomePage` que fetchea categorías y productos en paralelo. Estados: `loading` (skeletons), `error` (mensaje + botón reintentar), `ok` (grids).
  - Rutas: `/` → HomePage, `/producto/:slug` → ProductPage (placeholder mostrando el slug), `*` → NotFoundPage.

- [ ] **Step 1: Crear `Skeleton.tsx`**

```tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-cream-card animate-pulse rounded-card ${className}`} />;
}
```

- [ ] **Step 2: Crear `ErrorState.tsx`**

```tsx
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <p className="text-ink mb-4">Algo salió mal. Intentá de nuevo en un momento.</p>
      <button
        type="button"
        onClick={onRetry}
        className="bg-brown-dark text-white px-5 py-2 rounded-sm hover:bg-brown"
      >
        Reintentar
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Crear `ProductPage.tsx`**

```tsx
import { useParams } from 'react-router-dom';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl">Detalle de producto</h1>
      <p className="mt-4 text-muted">
        Placeholder Fase 1 — se implementa en Fase 2. Slug solicitado:{' '}
        <code className="bg-cream-card px-2 py-1 rounded">{slug}</code>
      </p>
    </main>
  );
}
```

- [ ] **Step 4: Crear `NotFoundPage.tsx`**

```tsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="max-w-md mx-auto text-center py-24 px-6">
      <h1 className="font-display text-4xl mb-3">404</h1>
      <p className="text-muted mb-6">La página que buscás no existe.</p>
      <Link to="/" className="text-terracotta hover:underline">Volver al inicio</Link>
    </main>
  );
}
```

- [ ] **Step 5: Crear `HomePage.tsx`**

```tsx
import { useCallback, useEffect, useState } from 'react';
import type { Category, Page, ProductSummary } from '../types/api';
import { getCategories, getProducts } from '../api/catalog';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CategoryCard } from '../components/catalog/CategoryCard';
import { ProductCard } from '../components/catalog/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

type Status = 'loading' | 'error' | 'ok';

export default function HomePage() {
  const [status, setStatus] = useState<Status>('loading');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts({ size: 12 }),
      ]);
      setCategories(cats);
      setProducts((prods as Page<ProductSummary>).content);
      setStatus('ok');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl mb-6">ARTESA</h1>

        {status === 'error' && <ErrorState onRetry={load} />}

        {status === 'loading' && (
          <>
            <section className="mb-12">
              <h2 className="font-display text-3xl mb-4">Nuestras categorías</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4]" />
                ))}
              </div>
            </section>
            <section>
              <h2 className="font-display text-3xl mb-4">Nuestra Colección</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))}
              </div>
            </section>
          </>
        )}

        {status === 'ok' && (
          <>
            <section className="mb-12">
              <h2 className="font-display text-3xl mb-4">Nuestras categorías</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(c => <CategoryCard key={c.id} category={c} />)}
              </div>
            </section>
            <section>
              <p className="text-terracotta text-xs tracking-[0.3em] mb-2">TIENDA</p>
              <h2 className="font-display text-4xl mb-6">Nuestra Colección</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 6: Reemplazar `App.tsx` con el router**

```tsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/producto/:slug" element={<ProductPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

- [ ] **Step 7: Escribir el test de `HomePage`**

`frontend/src/test/pages/HomePage.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import HomePage from '../../pages/HomePage';
import { server } from '../setup';
import { mockCategories, mockProductsPage } from '../mocks/handlers';

function renderWithRouter() {
  return render(<MemoryRouter><HomePage /></MemoryRouter>);
}

describe('HomePage', () => {
  it('renders categories and products from the API', async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Carteras de Cuero')).toBeInTheDocument();
      expect(screen.getByText('Bolso Tote Milano')).toBeInTheDocument();
    });
    for (const c of mockCategories) {
      expect(screen.getByText(c.name)).toBeInTheDocument();
    }
    expect(screen.getAllByText('$285 USD')).toHaveLength(mockProductsPage.content.length);
  });

  it('shows retry button on error and recovers on click', async () => {
    server.use(
      http.get('/api/categories', () =>
        HttpResponse.json({ code: 'BOOM', message: 'x', timestamp: 'x' }, { status: 500 })
      ),
    );
    renderWithRouter();

    const retry = await screen.findByRole('button', { name: /reintentar/i });
    expect(retry).toBeInTheDocument();

    server.resetHandlers();
    await userEvent.click(retry);

    await waitFor(() => {
      expect(screen.getByText('Bolso Tote Milano')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 8: Correr toda la suite frontend**

```bash
cd frontend
npm test
```

Esperado: TODOS los tests pasan (Badge, StarRating, ProductCard, client, HomePage).

- [ ] **Step 9: Smoke test manual con backend real**

Terminal 1:
```bash
docker compose up -d
```

Terminal 2:
```bash
cd backend
./mvnw spring-boot:run
```

Terminal 3:
```bash
cd frontend
npm run dev
```

Abrir `http://localhost:5173` en el navegador:
- Header estilizado (top-bar marrón + nav con logo ARTESA).
- Sección "Nuestras categorías" con 4 cards.
- Sección "Nuestra Colección" con 12 productos, cada uno con badge (los que corresponda), rating, nombre, precio `$XXX USD`, swatches.
- Sin errores en la consola del navegador (F12 → Console).
- Probar: cerrar backend (Ctrl+C en terminal 2) → refrescar la home → aparece el `ErrorState` con botón "Reintentar". Levantar backend de nuevo → clickear "Reintentar" → recupera.

Apagar todo (Ctrl+C en cada terminal, luego `docker compose down`).

- [ ] **Step 10: Commit**

```bash
cd ..
git add frontend/src/pages/ frontend/src/components/ui/ \
        frontend/src/App.tsx frontend/src/test/pages/
git commit -m "feat(frontend): add HomePage with loading/error/ok states and router"
```

---

### Task 16: README completo + verificación end-to-end

**Files:**
- Modify: `README.md` (root)

**Interfaces:**
- Produces: README que documenta cómo levantar todo desde cero en < 5 minutos, con troubleshooting básico.

- [ ] **Step 1: Reescribir `README.md`**

```markdown
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
```

- [ ] **Step 2: Verificación end-to-end final (checklist de la spec)**

Ejecutar en orden y confirmar cada resultado:

```bash
# 1. DB
docker compose up -d
docker compose ps                                              # Esperado: artesa-postgres Up (healthy)

# 2. Backend
cd backend
./mvnw verify                                                  # Esperado: BUILD SUCCESS, todos los tests verdes
./mvnw spring-boot:run &                                       # Backend en :8080

# 3. Endpoints
curl -s http://localhost:8080/api/categories | head -c 200     # Esperado: JSON con 4 categorías
curl -s 'http://localhost:8080/api/products?category=carteras-cuero' | head -c 200
curl -s http://localhost:8080/api/products/no-existe -w '\n%{http_code}\n'   # Esperado: 404

# 4. Frontend
cd ../frontend
npm test                                                        # Esperado: 4 test files, todos verdes
npm run dev &                                                   # App en :5173

# 5. Abrir navegador en http://localhost:5173
#    - Header visible con top-bar marrón y nav ARTESA
#    - Grid de 4 categorías
#    - Grid de 12 productos con badges, ratings, precios, swatches
#    - Consola limpia (F12 → Console)
```

Cuando todo pase, apagar procesos y bajar Postgres:

```bash
# Matar procesos node/java corriendo en background según OS
docker compose down
```

- [ ] **Step 3: Commit final**

```bash
cd ..
git add README.md
git commit -m "docs: update README with full setup, endpoints, and troubleshooting"
```

- [ ] **Step 4: Tag opcional**

```bash
git tag -a v0.1.0 -m "Fase 1 — Fundación (catálogo dinámico end-to-end)"
```

---

## Self-review de este plan

**1. Spec coverage:**
- ✅ Monorepo con `frontend/`/`backend/`/`docker-compose.yml`/`README.md` → Task 1, Task 2, Task 10, Task 16.
- ✅ Backend Spring Boot 3 + JPA + Flyway + Postgres → Tasks 2–4.
- ✅ Entidades `Category`, `Product`, `ProductColor`, `Review` → Task 4.
- ✅ Seed con 4 categorías, ~12 productos, ~6 reseñas → Task 3.
- ✅ Endpoints: `GET /api/categories`, `/api/products` (con filtros y paginación), `/api/products/{slug}`, `/api/reviews` → Tasks 7, 8, 9.
- ✅ Error shape `ApiError` uniforme y 404 en slug inexistente → Task 7 + Task 8.
- ✅ Frontend React 18 + Vite + TS + Tailwind → Task 10.
- ✅ Design tokens (paleta + fuentes) → Task 10 Step 6.
- ✅ Homepage funcional con categorías y productos del backend → Task 15.
- ✅ Header fiel al diseño → Task 14.
- ✅ ProductCard con badge, rating, swatches, corazón inerte → Task 13.
- ✅ Ruta `/producto/:slug` como placeholder → Task 15 Step 3.
- ✅ Estados loading/error/ok con retry → Task 15.
- ✅ Tests unitarios + integración con Testcontainers → Tasks 5, 6, 7, 8, 9.
- ✅ Vitest + RTL + MSW en frontend → Tasks 11, 12, 13, 15.
- ✅ README con setup en <5 minutos → Task 16.

**2. Placeholder scan:** Sin "TBD"/"TODO"/"implement later"/"similar to Task N" — cada paso tiene código completo o comando exacto.

**3. Type consistency:**
- Interfaces del mapper (`toDto`, `toSummary`, `toDetail`, `toPage`) usadas consistentemente en Tasks 5, 7, 8, 9.
- Repositorios: `findAllByOrderByDisplayOrderAscNameAsc`, `findBySlug`, `findAllByOrderByCreatedAtDesc(Pageable)` — nombres iguales entre Task 4 (definición) y Task 6 (uso).
- Frontend types `Category`/`ProductSummary`/`ProductDetail`/`Review`/`Page<T>`/`ApiError`/`ApiRequestError` definidos en Task 11, reusados en Tasks 13, 15.
- `ProductBadge` enum: mismos valores en Java (Task 4), SQL check constraint (Task 3), TS union (Task 11), labels de `Badge` (Task 12).
- Endpoint paths (`/api/categories`, `/api/products`, `/api/reviews`) consistentes entre backend (`@RequestMapping`) y frontend (`apiFetch`).
