-- Bank-transfer receipt uploaded by the customer from
-- /orden/:ref/transferencia. Nullable — MP orders never set it, and even
-- transfer orders may not have one if the customer skipped the upload
-- and sent the receipt by WhatsApp instead. VARCHAR is enough for both a
-- relative /uploads/xxx path (local dev) and an absolute https:// URL
-- from R2 (prod).
ALTER TABLE orders ADD COLUMN receipt_url VARCHAR(2000);
