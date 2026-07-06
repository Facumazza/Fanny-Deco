package com.artesa.uploads;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class UploadService {

    private static final Set<String> ALLOWED_MIME_TYPES =
        Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;  // 5 MB

    private final Path baseDir;

    public UploadService(@Value("${artesa.uploads.directory:./uploads}") String directory) {
        this.baseDir = Paths.get(directory).toAbsolutePath().normalize();
        try {
            Files.createDirectories(baseDir);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create uploads directory: " + baseDir, e);
        }
    }

    public StoredFile store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new UploadException("EMPTY_FILE", "No file was provided");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new UploadException("FILE_TOO_LARGE",
                "El archivo supera el máximo permitido (5 MB)");
        }
        String mime = file.getContentType();
        if (mime == null || !ALLOWED_MIME_TYPES.contains(mime.toLowerCase())) {
            throw new UploadException("UNSUPPORTED_TYPE",
                "Tipo no permitido. Solo JPG, PNG, WebP o GIF.");
        }

        String ext = extensionFor(mime);
        String filename = UUID.randomUUID() + ext;
        Path target = baseDir.resolve(filename).normalize();

        // Defensive: reject if resolution escaped the base dir (shouldn't happen with UUID).
        if (!target.startsWith(baseDir)) {
            throw new UploadException("BAD_PATH", "Nombre de archivo inválido");
        }

        try {
            Files.copy(file.getInputStream(), target);
        } catch (IOException e) {
            throw new UploadException("IO_ERROR", "No se pudo guardar el archivo");
        }

        return new StoredFile(filename, "/uploads/" + filename);
    }

    private String extensionFor(String mime) {
        return switch (mime.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png"  -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif"  -> ".gif";
            default -> ".bin";
        };
    }

    public record StoredFile(String filename, String url) {}
}
