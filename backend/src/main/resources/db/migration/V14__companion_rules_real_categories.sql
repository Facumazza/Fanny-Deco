-- Corrige V13, que asumió las categorías del seed original (V2).
--
-- La base real ya no se parece al seed: Laura renombró y creó categorías
-- desde el admin, así que en producción hay 8 con otros slugs. El
-- UPDATE de V13 no matcheó ninguna fila (ninguna categoría quedó como
-- habilitante) y su INSERT agregó una categoría "Accesorios" vacía que
-- duplica a "Complementos para carteras y bolsas", que ya cumple ese rol.
--
-- Va como migración nueva y no como edición de V13 porque V13 ya puede
-- haber corrido en producción: tocarla rompería el checksum de Flyway y
-- con eso el deploy siguiente.

-- 1. La categoría que sembró V13, sólo si nadie le cargó productos.
--    Si Laura ya la empezó a usar, se queda y decide ella desde el admin.
DELETE FROM categories c
 WHERE c.slug = 'accesorios'
   AND NOT EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.id);

-- 2. La regla real: los complementos (pañuelos, charms) no se venden
--    solos; cualquier otra categoría los habilita.
--
--    Se escribe como expresión y no como lista de slugs justamente para
--    no volver a depender de nombres que pueden cambiar. Corre una sola
--    vez; de acá en más las categorías nuevas arrancan en false/false y
--    se configuran desde el admin.
UPDATE categories
   SET requires_companion = (slug = 'complementos-para-carteras-y-bolsas'),
       is_companion       = (slug <> 'complementos-para-carteras-y-bolsas');
