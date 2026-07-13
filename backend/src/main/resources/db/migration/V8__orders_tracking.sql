-- Free-text shipping tracking info the admin can put on an order. Kept as a single
-- flexible field (e.g. "OCA E1234567AR", "Correo Argentino CD123456789AR",
-- "Andreani 45678 · retira jueves") instead of split carrier+code columns —
-- Argentine couriers format tracking a dozen different ways.

ALTER TABLE orders ADD COLUMN tracking_info VARCHAR(300);
