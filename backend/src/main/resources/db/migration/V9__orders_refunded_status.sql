-- Add REFUNDED to the allowed order statuses. Distinct from CANCELLED so we can
-- track "customer got money back" separately from "cancelled before paying".
ALTER TABLE orders DROP CONSTRAINT orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN
    ('PENDING','PAID','SHIPPED','DELIVERED','CANCELLED','REFUNDED'));
