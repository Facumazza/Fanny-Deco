-- Migrate USD-denominated columns to ARS. Names are renamed so the code (Java entities,
-- DTOs, frontend types) is forced to catch up — no silent drift where the column keeps
-- being called "usd" while carrying pesos.

ALTER TABLE products      RENAME COLUMN price_usd     TO price_ars;
ALTER TABLE orders        RENAME COLUMN subtotal_usd  TO subtotal_ars;
ALTER TABLE order_items   RENAME COLUMN unit_price_usd TO unit_price_ars;
ALTER TABLE order_items   RENAME COLUMN line_total_usd TO line_total_ars;

-- Widen numeric precision — ARS prices can easily exceed the 8-digit integer
-- portion that USD prices used to fit in (NUMERIC(10,2)). At ~$1200 ARS/USD, a
-- $500 USD product is $600.000 ARS which fits but leaves little margin.
ALTER TABLE products      ALTER COLUMN price_ars     TYPE NUMERIC(12,2);
ALTER TABLE orders        ALTER COLUMN subtotal_ars  TYPE NUMERIC(12,2);
ALTER TABLE order_items   ALTER COLUMN unit_price_ars TYPE NUMERIC(12,2);
ALTER TABLE order_items   ALTER COLUMN line_total_ars TYPE NUMERIC(12,2);

-- Convert existing seed values from USD (approx) to ARS. Rate used: 1 USD ~= 1200 ARS.
-- This is a rough migration price — the admin should re-price via the UI.
UPDATE products      SET price_ars      = ROUND(price_ars      * 1200, 2);
UPDATE orders        SET subtotal_ars   = ROUND(subtotal_ars   * 1200, 2);
UPDATE order_items   SET unit_price_ars = ROUND(unit_price_ars * 1200, 2),
                         line_total_ars = ROUND(line_total_ars * 1200, 2);
