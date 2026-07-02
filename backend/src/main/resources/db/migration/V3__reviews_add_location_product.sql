-- Extend reviews with location and product association for the design's testimonial cards.
ALTER TABLE reviews ADD COLUMN location     VARCHAR(120);
ALTER TABLE reviews ADD COLUMN product_name VARCHAR(200);

-- Replace the V2 seed reviews with the ones shown in the design.
DELETE FROM reviews;

INSERT INTO reviews (author_name, rating, body, location, product_name, created_at) VALUES
    ('Valentina R.', 5,
     'El bolso Tote Milano llegó en una caja preciosa. El cuero tiene un olor increíble y la calidad es insuperable. Vale cada peso.',
     'Buenos Aires', 'BOLSO TOTE MILANO', now() - interval '2 days'),
    ('Camilo S.',    5,
     'Compré el set de cuencos como regalo y fue un éxito total. La textura y el color son exactamente como en las fotos.',
     'Medellín', 'SET CUENCOS TIERRA', now() - interval '9 days'),
    ('Lucía F.',     5,
     'La Cartera Minerva es perfecta. Cabe todo lo que necesito y el cierre dorado es un detalle muy elegante.',
     'Ciudad de México', 'CARTERA MINERVA', now() - interval '15 days'),
    ('Martín P.',    5,
     'La cerámica es una obra de arte. Cada pieza se nota trabajada a mano, sin dos iguales.',
     'Rosario', 'JARRÓN VELA', now() - interval '22 days'),
    ('Sofía R.',     4,
     'Muy buen producto. Solo tardó un poco más de lo que esperaba en llegar, pero la calidad justifica la espera.',
     'Córdoba', 'MOCHILA FORESTA', now() - interval '30 days'),
    ('Camila L.',    5,
     'Mi taza favorita. La uso todas las mañanas. Vale cada peso.',
     'Santiago', 'TAZA RITUAL', now() - interval '45 days');
