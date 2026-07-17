package com.artesa.uploads;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
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

        // Content-Type is client-declared and trivially spoofable, so we also
        // inspect the file's magic bytes. This catches an attacker uploading
        // e.g. a PHP script renamed to .jpg with a faked Content-Type header.
        String detectedMime = detectMimeFromMagic(file);
        if (detectedMime == null) {
            throw new UploadException("UNSUPPORTED_TYPE",
                "El archivo no parece ser una imagen válida (JPG/PNG/WebP/GIF).");
        }
        if (!detectedMime.equalsIgnoreCase(mime.toLowerCase())) {
            throw new UploadException("MIME_MISMATCH",
                "El tipo declarado (" + mime + ") no coincide con el contenido real ("
                    + detectedMime + ").");
        }

        String ext = extensionFor(detectedMime);
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

    /**
     * Reads the first 12 bytes and matches known image-format signatures.
     * Returns the canonical MIME type or null if none match — so an attacker
     * can't sneak past by claiming Content-Type: image/jpeg on a .exe.
     */
    static String detectMimeFromMagic(MultipartFile file) {
        byte[] head = new byte[12];
        int read;
        try (InputStream in = file.getInputStream()) {
            read = in.read(head);
        } catch (IOException e) {
            return null;
        }
        if (read < 4) return null;

        // JPEG: FF D8 FF
        if (head[0] == (byte) 0xFF && head[1] == (byte) 0xD8 && head[2] == (byte) 0xFF) {
            return "image/jpeg";
        }
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (read >= 8
            && head[0] == (byte) 0x89 && head[1] == 'P' && head[2] == 'N' && head[3] == 'G'
            && head[4] == 0x0D && head[5] == 0x0A && head[6] == 0x1A && head[7] == 0x0A) {
            return "image/png";
        }
        // GIF: "GIF87a" or "GIF89a"
        if (read >= 6
            && head[0] == 'G' && head[1] == 'I' && head[2] == 'F' && head[3] == '8'
            && (head[4] == '7' || head[4] == '9') && head[5] == 'a') {
            return "image/gif";
        }
        // WebP: "RIFF" .... "WEBP"
        if (read >= 12
            && head[0] == 'R' && head[1] == 'I' && head[2] == 'F' && head[3] == 'F'
            && head[8] == 'W' && head[9] == 'E' && head[10] == 'B' && head[11] == 'P') {
            return "image/webp";
        }
        return null;
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
