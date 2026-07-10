-- MercadoPago payment tracking columns. All nullable — an order without a payment
-- attempt yet is a valid state (checkout might have been abandoned).

ALTER TABLE orders ADD COLUMN payment_id      VARCHAR(80);
ALTER TABLE orders ADD COLUMN payment_status  VARCHAR(30);
ALTER TABLE orders ADD COLUMN payment_method  VARCHAR(60);
ALTER TABLE orders ADD COLUMN paid_at         TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN preference_id   VARCHAR(120);

CREATE INDEX idx_orders_payment_id     ON orders(payment_id)     WHERE payment_id IS NOT NULL;
CREATE INDEX idx_orders_preference_id  ON orders(preference_id)  WHERE preference_id IS NOT NULL;
