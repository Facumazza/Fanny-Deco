-- Cuando un producto se borra, order_items conserva el snapshot (slug, name,
-- image, unit_price_ars) y el FK pasa a NULL. Antes el FK no tenia ON DELETE
-- y por eso la DB rechazaba borrar un producto que ya se habia vendido:
-- la unica cartera Tilcara se vendio y el admin no podia sacarla del catalogo
-- (DELETE devolvia 500 por foreign key violation).
--
-- El historial de ventas no se rompe: la vista de orden en el admin usa
-- productName/productSlug/productImageUrl de order_items, no la tabla
-- products. El unico lugar que resuelve el join real es StatsService.
-- topProductsLast30Days, que naturalmente excluye los rows con product NULL
-- -- comportamiento correcto: un producto borrado deja de aparecer en el
-- ranking.
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE order_items DROP CONSTRAINT order_items_product_id_fkey;
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
