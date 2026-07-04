CREATE TABLE orders (
    id                BIGSERIAL PRIMARY KEY,
    reference         VARCHAR(20)   NOT NULL UNIQUE,
    customer_email    VARCHAR(180)  NOT NULL,
    customer_name     VARCHAR(200)  NOT NULL,
    shipping_address  TEXT          NOT NULL,
    city              VARCHAR(120)  NOT NULL,
    postal_code       VARCHAR(20),
    country           VARCHAR(120)  NOT NULL,
    phone             VARCHAR(60),
    notes             TEXT,
    subtotal_usd      NUMERIC(10,2) NOT NULL,
    status            VARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT orders_status_check CHECK (status IN
        ('PENDING','PAID','SHIPPED','DELIVERED','CANCELLED'))
);

CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_orders_created_at     ON orders(created_at DESC);

CREATE TABLE order_items (
    id                 BIGSERIAL PRIMARY KEY,
    order_id           BIGINT       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id         BIGINT       NOT NULL REFERENCES products(id),
    product_slug       VARCHAR(120) NOT NULL,
    product_name       VARCHAR(200) NOT NULL,
    product_image_url  TEXT         NOT NULL,
    color              VARCHAR(7),
    quantity           INT          NOT NULL,
    unit_price_usd     NUMERIC(10,2) NOT NULL,
    line_total_usd     NUMERIC(10,2) NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK (quantity > 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
