package com.artesa.uploads;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Serves uploaded images at /uploads/**. Reads are public; writes go through
 * /api/admin/uploads which SecurityConfig protects with ROLE_ADMIN.
 */
@Configuration
public class UploadWebConfig implements WebMvcConfigurer {

    private final String directory;

    public UploadWebConfig(@Value("${artesa.uploads.directory:./uploads}") String directory) {
        this.directory = directory;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = "file:" + Paths.get(directory).toAbsolutePath().normalize() + "/";
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations(location)
            .setCachePeriod(3600);
    }
}
