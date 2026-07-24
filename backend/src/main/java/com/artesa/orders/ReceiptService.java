package com.artesa.orders;

import com.artesa.emails.OrderMailer;
import com.artesa.uploads.StorageBackend;
import com.artesa.uploads.UploadException;
import com.artesa.uploads.UploadService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.util.Set;
import java.util.UUID;

/**
 * Handles the customer-side "upload my transfer receipt" flow triggered
 * from the /orden/:ref/transferencia page. The endpoint is public (there's
 * no login for guest customers) but scoped by the order reference, which
 * is a 12-char random capability token — hard to guess.
 *
 * Storage reuses the same StorageBackend as product images (local in dev,
 * R2 in prod). MIME allow-list is different though: we accept image/*
 * (screenshots) AND application/pdf (comprobantes from home-banking apps
 * usually come as PDF).
 */
@Service
@Transactional
public class ReceiptService {

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp", "application/pdf"
    );
    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;  // 5 MB

    private final OrderRepository orderRepo;
    private final StorageBackend storage;
    private final OrderMailer mailer;

    public ReceiptService(OrderRepository orderRepo,
                          StorageBackend storage,
                          OrderMailer mailer) {
        this.orderRepo = orderRepo;
        this.storage = storage;
        this.mailer = mailer;
    }

    public Order uploadReceipt(String reference, MultipartFile file) {
        Order order = orderRepo.findByReference(reference)
            .orElseThrow(() -> new OrderNotFoundException(reference));

        // Once the order is closed (PAID / SHIPPED / DELIVERED / CANCELLED / REFUNDED),
        // there is nothing to reconcile — the admin has already sorted the payment,
        // and accepting a new receipt would only cause confusion. Only PENDING
        // orders can receive a receipt.
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new UploadException("ORDER_NOT_PENDING",
                "Esta orden ya no acepta comprobantes (estado: " + order.getStatus() + ")");
        }

        if (file == null || file.isEmpty()) {
            throw new UploadException("EMPTY_FILE", "No se recibió el archivo");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new UploadException("FILE_TOO_LARGE",
                "El archivo supera el máximo permitido (5 MB)");
        }
        String declaredMime = file.getContentType();
        if (declaredMime == null || !ALLOWED_MIME_TYPES.contains(declaredMime.toLowerCase())) {
            throw new UploadException("UNSUPPORTED_TYPE",
                "Formato no permitido. Aceptamos JPG, PNG, WebP o PDF.");
        }
        String detected = UploadService.detectMimeFromMagic(file);
        if (detected == null || !ALLOWED_MIME_TYPES.contains(detected)) {
            throw new UploadException("UNSUPPORTED_TYPE",
                "El archivo no parece ser un comprobante válido (JPG/PNG/WebP/PDF).");
        }
        if (!detected.equalsIgnoreCase(declaredMime.toLowerCase())) {
            throw new UploadException("MIME_MISMATCH",
                "El tipo declarado (" + declaredMime + ") no coincide con el contenido real ("
                    + detected + ").");
        }

        String filename = "receipt-" + order.getReference() + "-"
            + UUID.randomUUID() + extensionFor(detected);

        String url;
        try (InputStream in = file.getInputStream()) {
            url = storage.store(filename, detected, file.getSize(), in);
        } catch (IOException e) {
            throw new UploadException("IO_ERROR", "No se pudo procesar el archivo");
        }

        // We deliberately do NOT delete a previous receipt if the customer
        // re-uploads: keeps the audit trail intact on the R2 side and costs
        // fractions of a cent. Only the DB pointer moves.
        setField(order, "receiptUrl", url);
        Order saved = orderRepo.save(order);

        // Fire-and-forget notification to the admin so they know to verify
        // the transfer in the bank. Wrapped in a safeSend inside the mailer,
        // so a mail-provider outage never fails the upload.
        mailer.onReceiptUploaded(saved);

        return saved;
    }

    private static String extensionFor(String mime) {
        return switch (mime.toLowerCase()) {
            case "image/jpeg"       -> ".jpg";
            case "image/png"        -> ".png";
            case "image/webp"       -> ".webp";
            case "application/pdf"  -> ".pdf";
            default -> ".bin";
        };
    }

    private static void setField(Object target, String name, Object value) {
        Field f = ReflectionUtils.findField(target.getClass(), name);
        if (f == null) throw new IllegalStateException("Missing field " + name);
        ReflectionUtils.makeAccessible(f);
        ReflectionUtils.setField(f, target, value);
    }
}
