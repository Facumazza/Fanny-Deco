package com.artesa.payments;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Validates the `x-signature` header MercadoPago sends with webhooks v1. Rejects
 * forged notifications where someone would otherwise POST a fake payment id and
 * push our order to PAID.
 *
 * MP format:
 *   x-signature: ts=1234567890,v1=abcdef1234...
 *   x-request-id: some-uuid
 * The canonical string that gets signed with HMAC-SHA256(secret) is:
 *   "id:{paymentId};request-id:{requestId};ts:{ts};"
 *
 * If the webhook secret isn't configured (dev environment), the verifier lets
 * everything through with a warning — you set MERCADOPAGO_WEBHOOK_SECRET in
 * prod (from MP dashboard) to lock things down.
 */
@Component
public class WebhookSignatureVerifier {

    private static final Logger log = LoggerFactory.getLogger(WebhookSignatureVerifier.class);

    private final String secret;

    public WebhookSignatureVerifier(
        @Value("${artesa.payments.mercadopago.webhook-secret:}") String secret
    ) {
        this.secret = secret;
    }

    /** True when the verifier is inert (no secret configured yet). */
    public boolean isDisabled() {
        return secret == null || secret.isBlank();
    }

    /**
     * @param signatureHeader raw value of `x-signature`, e.g. "ts=17…,v1=abcdef…"
     * @param requestId raw value of `x-request-id` (opaque token, may be null)
     * @param paymentId payment id we resolved from the notification
     * @return true if the signature is valid, false if it's malformed or wrong
     */
    public boolean verify(String signatureHeader, String requestId, String paymentId) {
        if (isDisabled()) {
            log.warn("Webhook signature check skipped — MERCADOPAGO_WEBHOOK_SECRET is not set. " +
                     "Configure it in production to reject forged notifications.");
            return true;
        }
        if (signatureHeader == null || signatureHeader.isBlank()) {
            log.warn("Rejecting webhook: missing x-signature header");
            return false;
        }
        if (paymentId == null || paymentId.isBlank()) {
            log.warn("Rejecting webhook: no payment id to sign");
            return false;
        }

        String ts = null, v1 = null;
        for (String part : signatureHeader.split(",")) {
            String[] kv = part.trim().split("=", 2);
            if (kv.length != 2) continue;
            switch (kv[0].trim()) {
                case "ts" -> ts = kv[1].trim();
                case "v1" -> v1 = kv[1].trim();
                default -> { /* MP might add other segments; ignore. */ }
            }
        }
        if (ts == null || v1 == null) {
            log.warn("Rejecting webhook: x-signature missing ts or v1 (raw='{}')", signatureHeader);
            return false;
        }

        // Canonical string MercadoPago documents. Empty request-id when absent.
        String canonical = "id:" + paymentId + ";"
                         + "request-id:" + (requestId == null ? "" : requestId) + ";"
                         + "ts:" + ts + ";";
        String expected = hmacSha256Hex(secret, canonical);

        boolean ok = constantTimeEquals(expected, v1);
        if (!ok) {
            log.warn("Rejecting webhook: signature mismatch for payment {}", paymentId);
        }
        return ok;
    }

    private static String hmacSha256Hex(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(raw.length * 2);
            for (byte b : raw) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new IllegalStateException("HMAC-SHA256 unavailable", e);
        }
    }

    /** Prevents timing-based side channels when comparing the two hex strings. */
    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) return false;
        return MessageDigest.isEqual(
            a.getBytes(StandardCharsets.UTF_8),
            b.getBytes(StandardCharsets.UTF_8)
        );
    }
}
