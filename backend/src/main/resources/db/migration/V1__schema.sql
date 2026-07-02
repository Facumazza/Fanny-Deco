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
    hex            CHAR(7)      NOT NULL,
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
