package com.artesa.uploads;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.file.Path;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class UploadControllerIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("artesa").withUsername("artesa").withPassword("artesa");

    @TempDir
    static Path uploadsDir;

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("artesa.uploads.directory", () -> uploadsDir.toString());
    }

    @Autowired MockMvc mvc;

    @Test
    void unauthenticated_returns401() throws Exception {
        var file = new MockMultipartFile("file", "img.jpg", "image/jpeg", fakePngBytes());
        mvc.perform(multipart("/api/admin/uploads").file(file))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void uploadJpeg_returnsUrl() throws Exception {
        var file = new MockMultipartFile("file", "photo.jpg", "image/jpeg", fakePngBytes());
        mvc.perform(multipart("/api/admin/uploads").file(file))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.filename").exists())
            .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.startsWith("/uploads/")))
            .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.endsWith(".jpg")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void uploadPng_returnsUrl() throws Exception {
        var file = new MockMultipartFile("file", "photo.png", "image/png", fakePngBytes());
        mvc.perform(multipart("/api/admin/uploads").file(file))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.endsWith(".png")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void unsupportedType_returns400() throws Exception {
        var file = new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[]{1, 2, 3});
        mvc.perform(multipart("/api/admin/uploads").file(file))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("UNSUPPORTED_TYPE"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void emptyFile_returns400() throws Exception {
        var file = new MockMultipartFile("file", "empty.png", "image/png", new byte[0]);
        mvc.perform(multipart("/api/admin/uploads").file(file))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("EMPTY_FILE"));
    }

    /** Minimal PNG header + a tiny payload — enough for MultipartFile to accept as content. */
    private static byte[] fakePngBytes() {
        return new byte[] {
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  // PNG magic
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52          // IHDR chunk header
        };
    }
}
