package com.artesa.uploads;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

/**
 * Validates uploads (size, MIME, magic bytes) and delegates the actual byte
 * persistence to a StorageBackend (local filesystem in dev, R2 in prod). This
 * class stays storage-agnostic so tests exercise the security-relevant logic
 * (MIME sniff, spoof detection) without any I/O.
 */
@Service
public class UploadService {

    private static final Set<String> ALLOWED_MIME_TYPES =
        Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;  // 5 MB

    private final StorageBackend backend;

    public UploadService(StorageBackend backend) {
        this.backend = backend;
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

        String url;
        try (InputStream in = file.getInputStream()) {
            url = backend.store(filename, detectedMime, file.getSize(), in);
        } catch (IOException e) {
            throw new UploadException("IO_ERROR", "No se pudo leer el archivo");
        }

        return new StoredFile(filename, url);
    }

    /**
     * Reads the first 12 bytes and matches known file-format signatures.
     * Returns the canonical MIME type or null if none match — so an attacker
     * can't sneak past by claiming Content-Type: image/jpeg on a .exe.
     * Caller filters the returned MIME against its own allow-list.
     */
    public static String detectMimeFromMagic(MultipartFile file) {
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
        // PDF: "%PDF-" (25 50 44 46 2D). Not accepted by UploadService itself
        // (product images are images only) but ReceiptService needs to accept
        // PDFs from home-banking apps, so we detect it here and let the caller
        // decide via its allow-list.
        if (read >= 5
            && head[0] == 0x25 && head[1] == 'P' && head[2] == 'D' && head[3] == 'F'
            && head[4] == 0x2D) {
            return "application/pdf";
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
