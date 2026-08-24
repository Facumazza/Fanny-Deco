-- Reglas de compra por categoría.
--
-- El pedido de Laura: los accesorios no se venden solos, tienen que ir
-- acompañados de una cartera. En vez de hardcodear los slugs en el código
-- (que obligaría a un deploy cada vez que cambie el criterio), la regla
-- vive como dos flags editables desde el admin:
--
--   requires_companion  la categoría NO se puede comprar sola
--   is_companion        sus productos habilitan a las que sí lo requieren
--
-- La validación es "al menos un acompañante en el pedido" — una cartera
-- habilita todos los accesorios que el cliente quiera sumar.

ALTER TABLE categories
    ADD COLUMN requires_companion BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN is_companion       BOOLEAN NOT NULL DEFAULT false;

-- Las dos categorías de carteras habilitan la compra de accesorios.
UPDATE categories
   SET is_companion = true
 WHERE slug IN ('carteras-cuero', 'carteras-otros');

-- Categoría Accesorios. El ON CONFLICT cubre el caso de que Laura ya la
-- haya creado a mano desde el admin: no duplica, sólo prende el flag.
INSERT INTO categories (slug, name, subtitle, image_url, display_order, requires_companion)
VALUES ('accesorios', 'Accesorios', 'Se venden junto a una cartera',
        'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800', 5, true)
ON CONFLICT (slug) DO UPDATE SET requires_companion = true;
