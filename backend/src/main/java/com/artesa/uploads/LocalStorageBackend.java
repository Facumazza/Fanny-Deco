package com.artesa.uploads;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Filesystem backend: writes to a directory served statically at /uploads/**
 * by UploadWebConfig. Fine for dev; in prod a container restart wipes the
 * directory unless it's on a volume — that's why R2StorageBackend exists.
 */
@Component
@ConditionalOnProperty(name = "artesa.uploads.provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageBackend implements StorageBackend {

    private final Path baseDir;

    public LocalStorageBackend(@Value("${artesa.uploads.directory:./uploads}") String directory) {
        this.baseDir = Paths.get(directory).toAbsolutePath().normalize();
        try {
            Files.createDirectories(baseDir);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create uploads directory: " + baseDir, e);
        }
    }

    @Override
    public String store(String filename, String mimeType, long size, InputStream bytes) {
        Path target = baseDir.resolve(filename).normalize();
        // Defensive: reject if resolution escaped the base dir (shouldn't happen
        // with a UUID filename, but cheap to check).
        if (!target.startsWith(baseDir)) {
            throw new UploadException("BAD_PATH", "Nombre de archivo inválido");
        }
        try {
            Files.copy(bytes, target);
        } catch (IOException e) {
            throw new UploadException("IO_ERROR", "No se pudo guardar el archivo");
        }
        return "/uploads/" + filename;
    }
}
