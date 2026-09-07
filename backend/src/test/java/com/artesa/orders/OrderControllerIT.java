package com.artesa.orders;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Transactional
class OrderControllerIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("artesa").withUsername("artesa").withPassword("artesa");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    @Test
    void createOrder_happyPath_computesSubtotalFromDbPrices() throws Exception {
        // bolso-tote-milano (id=1) is 285.00, cartera-minerva (id=2) is 165.00.
        // Even if the client lies about totals here, the server ignores it.
        String body = """
            {
              "customerEmail": "Cliente@Example.com",
              "customerName": " Ana Cliente ",
              "shippingAddress": "Av. Corrientes 1234, 3B",
              "city": "CABA",
              "postalCode": "1043",
              "country": "Argentina",
              "phone": "+54 11 5555 5555",
              "notes": "Tocar timbre 3B",
              "items": [
                { "productId": 1, "quantity": 2, "color": "#6B4029" },
                { "productId": 2, "quantity": 1 }
              ]
            }""";

        mvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.reference").exists())
            .andExpect(jsonPath("$.status").value("PENDING"))
            .andExpect(jsonPath("$.customerEmail").value("cliente@example.com"))
            .andExpect(jsonPath("$.customerName").value("Ana Cliente"))
            // Seed prices after ARS migration: product 1 = 342000, product 2 = 198000.
            .andExpect(jsonPath("$.subtotalArs").value(882000.00))  // 342000*2 + 198000
            .andExpect(jsonPath("$.items.length()").value(2))
            .andExpect(jsonPath("$.items[0].productName").exists())
            .andExpect(jsonPath("$.items[0].unitPriceArs").exists());
    }

    @Test
    void createOrder_returns404WhenProductMissing() throws Exception {
        String body = """
            {
              "customerEmail": "x@example.com",
              "customerName": "Nombre",
              "shippingAddress": "Calle 1",
              "city": "Ciudad",
              "country": "Argentina",
              "items": [ { "productId": 99999, "quantity": 1 } ]
            }""";

        mvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"));
    }

    @Test
    void createOrder_returns400OnValidationErrors() throws Exception {
        String body = """
            {
              "customerEmail": "no-es-email",
              "customerName": "",
              "shippingAddress": "",
              "city": "",
              "country": "",
              "items": []
            }""";

        mvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void createOrder_returns400OnInvalidColorHex() throws Exception {
        String body = """
            {
              "customerEmail": "x@example.com",
              "customerName": "Nombre",
              "shippingAddress": "Calle 1",
              "city": "Ciudad",
              "country": "Argentina",
              "items": [ { "productId": 1, "quantity": 1, "color": "rojo" } ]
            }""";

        mvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void getByReference_returnsOrder() throws Exception {
        // Create one first to get a real reference.
        String body = """
            {
              "customerEmail": "x@example.com",
              "customerName": "N",
              "shippingAddress": "Calle 1",
              "city": "C",
              "country": "AR",
              "items": [ { "productId": 1, "quantity": 1 } ]
            }""";
        String resp = mvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        String reference = resp.replaceAll(".*\"reference\":\"([^\"]+)\".*", "$1");

        mvc.perform(get("/api/orders/" + reference))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.reference").value(reference))
            .andExpect(jsonPath("$.items.length()").value(1));
    }

    @Test
    void getByReference_returns404WhenMissing() throws Exception {
        mvc.perform(get("/api/orders/ARTESA-XXXXXX"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("ORDER_NOT_FOUND"));
    }

    // ---- Regla de acompañante: los accesorios no se venden solos ----

    /**
     * Crea una categoría que no se vende sola y un producto adentro, y
     * devuelve el id del producto.
     *
     * El test arma su propia categoría en vez de apoyarse en una sembrada por
     * las migraciones: los datos reales divergieron del seed hace rato (V14),
     * así que atarse a un slug concreto es exactamente lo que ya falló una vez.
     * La clase es @Transactional, así que todo esto se revierte al terminar.
     */
    private long insertAccessory() {
        jdbc.update("""
            INSERT INTO categories (slug, name, subtitle, image_url, display_order,
                                    requires_companion, is_companion)
            VALUES ('complementos-test', 'Complementos de prueba', NULL,
                    'https://x/cat.jpg', 90, true, false)
            """);
        return jdbc.queryForObject("""
            INSERT INTO products (slug, name, description, price_ars, image_url,
                                  rating_avg, rating_count, category_id)
            VALUES ('llavero-test', 'Llavero de prueba', NULL, 25000.00,
                    'https://x/llavero.jpg', 5.0, 0,
                    (SELECT id FROM categories WHERE slug = 'complementos-test'))
            RETURNING id
            """, Long.class);
    }

    @Test
    void createOrder_rejectsAccessoryWithoutBag() throws Exception {
        long accessoryId = insertAccessory();
        String body = """
            {
              "customerEmail": "x@example.com",
              "customerName": "Nombre",
              "shippingAddress": "Calle 1",
              "city": "Ciudad",
              "country": "Argentina",
              "items": [ { "productId": %d, "quantity": 1 } ]
            }""".formatted(accessoryId);

        mvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isUnprocessableEntity())
            .andExpect(jsonPath("$.code").value("COMPANION_REQUIRED"))
            // El mensaje se muestra tal cual en el checkout: nombra la
            // categoría bloqueada.
            .andExpect(jsonPath("$.message").value(
                org.hamcrest.Matchers.containsString("Complementos de prueba")));
    }

    @Test
    void createOrder_acceptsAccessoryAlongsideBag() throws Exception {
        long accessoryId = insertAccessory();
        // productId 1 = bolso-tote-milano, categoría carteras-cuero (is_companion).
        String body = """
            {
              "customerEmail": "x@example.com",
              "customerName": "Nombre",
              "shippingAddress": "Calle 1",
              "city": "Ciudad",
              "country": "Argentina",
              "items": [
                { "productId": 1, "quantity": 1 },
                { "productId": %d, "quantity": 1 }
              ]
            }""".formatted(accessoryId);

        mvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.items.length()").value(2));
    }
}
