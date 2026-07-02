INSERT INTO categories (slug, name, subtitle, image_url, display_order) VALUES
    ('carteras-cuero',  'Carteras de Cuero',        'Full-grain curtido al vegetal',
     'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', 1),
    ('carteras-otros',  'Carteras Otros Materiales','Lona, raffia y tejidos naturales',
     'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', 2),
    ('ceramica-deco',   'Cerámica Deco',            'Jarrones, esculturas y piezas de arte',
     'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800', 3),
    ('ceramica-casa',   'Cerámica Casa',            'Tazas, cuencos y maceteros',
     'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800', 4);

-- Productos: 12 items que reflejan lo visible en el diseño.
INSERT INTO products (slug, name, description, price_usd, image_url, badge, rating_avg, rating_count, category_id) VALUES
    ('bolso-tote-milano',       'Bolso Tote Milano',
     'Bolso tote de cuero full-grain italiano, matelasseado en chevron.',
     285.00,
     'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
     'MAS_VENDIDO', 5.0, 128, (SELECT id FROM categories WHERE slug='carteras-cuero')),

    ('cartera-minerva',         'Cartera Minerva',
     'Cartera estructurada roja con herrajes plateados.',
     165.00,
     'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800',
     'NUEVO', 5.0, 64, (SELECT id FROM categories WHERE slug='carteras-cuero')),

    ('mochila-foresta',         'Mochila Foresta',
     'Mochila urbana en lona resistente al agua.',
     340.00,
     'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
     NULL, 5.0, 42, (SELECT id FROM categories WHERE slug='carteras-otros')),

    ('bolso-lona-nomade',       'Bolso Lona Nómade',
     'Bolso de mano en lona con estampa floral vintage.',
     98.00,
     'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
     'VERANO', 5.0, 77, (SELECT id FROM categories WHERE slug='carteras-otros')),

    ('clutch-raffia-soleil',    'Clutch Raffia Soleil',
     'Clutch de raffia con solapa rayada.',
     72.00,
     'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
     'ARTESANAL', 5.0, 53, (SELECT id FROM categories WHERE slug='carteras-otros')),

    ('bolso-tejido-brisa',      'Bolso Tejido Brisa',
     'Bolso tejido a mano en fibras naturales.',
     115.00,
     'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
     NULL, 5.0, 38, (SELECT id FROM categories WHERE slug='carteras-otros')),

    ('jarron-vela',             'Jarrón Vela',
     'Jarrón cerámico gres con esmalte moteado.',
     95.00,
     'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
     'ARTESANAL', 5.0, 88, (SELECT id FROM categories WHERE slug='ceramica-deco')),

    ('plato-decorativo-luma',   'Plato Decorativo Luma',
     'Plato decorativo con vidriado mate.',
     58.00,
     'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800',
     NULL, 5.0, 57, (SELECT id FROM categories WHERE slug='ceramica-deco')),

    ('escultura-organica-alba', 'Escultura Orgánica Alba',
     'Pieza escultórica hecha a torno con forma orgánica.',
     130.00,
     'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
     'EDICION_LIMITADA', 5.0, 29, (SELECT id FROM categories WHERE slug='ceramica-deco')),

    ('set-cuencos-tierra',      'Set Cuencos Tierra',
     'Set de 3 cuencos de gres con base natural.',
     78.00,
     'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800',
     'SET_X3', 5.0, 115, (SELECT id FROM categories WHERE slug='ceramica-casa')),

    ('taza-ritual',             'Taza Ritual',
     'Taza de porcelana con asa curva minimalista.',
     42.00,
     'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800',
     'NUEVO', 5.0, 96, (SELECT id FROM categories WHERE slug='ceramica-casa')),

    ('macetero-raiz',           'Macetero Raíz',
     'Macetero cerámico turquesa con drenaje.',
     65.00,
     'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800',
     NULL, 5.0, 48, (SELECT id FROM categories WHERE slug='ceramica-casa'));

-- Colores por producto (swatches)
INSERT INTO product_colors (product_id, hex, display_order) VALUES
    ((SELECT id FROM products WHERE slug='bolso-tote-milano'), '#6B4029', 1),
    ((SELECT id FROM products WHERE slug='bolso-tote-milano'), '#2B2A28', 2),
    ((SELECT id FROM products WHERE slug='bolso-tote-milano'), '#C9B79C', 3),
    ((SELECT id FROM products WHERE slug='cartera-minerva'),   '#C7B499', 1),
    ((SELECT id FROM products WHERE slug='cartera-minerva'),   '#6B4029', 2),
    ((SELECT id FROM products WHERE slug='mochila-foresta'),   '#2B2A28', 1),
    ((SELECT id FROM products WHERE slug='mochila-foresta'),   '#4B4238', 2),
    ((SELECT id FROM products WHERE slug='bolso-lona-nomade'), '#C9B79C', 1),
    ((SELECT id FROM products WHERE slug='bolso-lona-nomade'), '#5B7360', 2),
    ((SELECT id FROM products WHERE slug='bolso-lona-nomade'), '#2B2A28', 3),
    ((SELECT id FROM products WHERE slug='clutch-raffia-soleil'), '#E5DBC2', 1),
    ((SELECT id FROM products WHERE slug='clutch-raffia-soleil'), '#BFA97D', 2),
    ((SELECT id FROM products WHERE slug='bolso-tejido-brisa'),   '#C7B499', 1),
    ((SELECT id FROM products WHERE slug='bolso-tejido-brisa'),   '#8B4A2C', 2),
    ((SELECT id FROM products WHERE slug='jarron-vela'),          '#E5DBC2', 1),
    ((SELECT id FROM products WHERE slug='jarron-vela'),          '#C9B79C', 2),
    ((SELECT id FROM products WHERE slug='jarron-vela'),          '#8B4A2C', 3),
    ((SELECT id FROM products WHERE slug='plato-decorativo-luma'),'#E5DBC2', 1),
    ((SELECT id FROM products WHERE slug='plato-decorativo-luma'),'#C9B79C', 2),
    ((SELECT id FROM products WHERE slug='plato-decorativo-luma'),'#6B4029', 3),
    ((SELECT id FROM products WHERE slug='escultura-organica-alba'),'#E5DBC2', 1),
    ((SELECT id FROM products WHERE slug='escultura-organica-alba'),'#BFA97D', 2),
    ((SELECT id FROM products WHERE slug='set-cuencos-tierra'),   '#8B4A2C', 1),
    ((SELECT id FROM products WHERE slug='set-cuencos-tierra'),   '#E5DBC2', 2),
    ((SELECT id FROM products WHERE slug='taza-ritual'),          '#C9B79C', 1),
    ((SELECT id FROM products WHERE slug='taza-ritual'),          '#6B4029', 2),
    ((SELECT id FROM products WHERE slug='taza-ritual'),          '#2B2A28', 3),
    ((SELECT id FROM products WHERE slug='macetero-raiz'),        '#8B4A2C', 1),
    ((SELECT id FROM products WHERE slug='macetero-raiz'),        '#6B4029', 2);

-- Reseñas (6)
INSERT INTO reviews (author_name, rating, body, created_at) VALUES
    ('María G.',    5, 'Calidad impecable. El cuero se siente premium desde el primer día.', now() - interval '3 days'),
    ('Laura P.',    5, 'Empaque hermoso, entrega rápida. La cartera es tal cual la foto.',    now() - interval '10 days'),
    ('Javier M.',   5, 'La cerámica es una obra de arte. Cada pieza se nota trabajada a mano.', now() - interval '17 days'),
    ('Sofía R.',    4, 'Muy buen producto. Solo tardó un poco más de lo que esperaba en llegar.', now() - interval '25 days'),
    ('Pablo T.',    5, 'El taller cumple con lo que promete. Sin producción en masa se nota.', now() - interval '40 days'),
    ('Camila L.',   5, 'Mi taza favorita. La uso todas las mañanas.',                          now() - interval '55 days');
