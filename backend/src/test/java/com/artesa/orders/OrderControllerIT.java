package com.artesa.orders;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
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
            .andExpect(jsonPath("$.subtotalUsd").value(735.00))  // 285*2 + 165 = 735
            .andExpect(jsonPath("$.items.length()").value(2))
            .andExpect(jsonPath("$.items[0].productName").exists())
            .andExpect(jsonPath("$.items[0].unitPriceUsd").exists());
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
}
