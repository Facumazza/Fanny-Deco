package com.artesa.payments;

import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class WebhookSignatureVerifierTest {

    private static final String SECRET = "test-secret-abc123";

    @Test
    void disabled_whenSecretIsBlank_acceptsEverything() {
        WebhookSignatureVerifier v = new WebhookSignatureVerifier("", false);
        assertThat(v.isDisabled()).isTrue();
        assertThat(v.verify(null, null, "12345")).isTrue();
        assertThat(v.verify("garbage", "req-1", "12345")).isTrue();
    }

    // ---- Fail-closed contract: prod refuses to boot without a real secret. ----

    @Test
    void failClosed_requiredButBlank_throwsAtConstruction() {
        assertThatThrownBy(() -> new WebhookSignatureVerifier("", true))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("require-signature=true")
            .hasMessageContaining("webhook-secret is empty");
    }

    @Test
    void failClosed_requiredButNull_alsoThrows() {
        assertThatThrownBy(() -> new WebhookSignatureVerifier(null, true))
            .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void failClosed_requiredWithSecret_constructsFine() {
        WebhookSignatureVerifier v = new WebhookSignatureVerifier(SECRET, true);
        assertThat(v.isDisabled()).isFalse();
    }

    @Test
    void enabled_rejectsMissingHeader() {
        WebhookSignatureVerifier v = new WebhookSignatureVerifier(SECRET, false);
        assertThat(v.verify(null, "req-1", "12345")).isFalse();
        assertThat(v.verify("",   "req-1", "12345")).isFalse();
    }

    @Test
    void enabled_rejectsMalformedHeader() {
        WebhookSignatureVerifier v = new WebhookSignatureVerifier(SECRET, false);
        // Missing v1 segment
        assertThat(v.verify("ts=1000", "req-1", "12345")).isFalse();
        // Missing ts segment
        assertThat(v.verify("v1=abcdef", "req-1", "12345")).isFalse();
        // Garbage
        assertThat(v.verify("not-a-real-signature", "req-1", "12345")).isFalse();
    }

    @Test
    void enabled_rejectsMissingPaymentId() {
        WebhookSignatureVerifier v = new WebhookSignatureVerifier(SECRET, false);
        String sig = sign(SECRET, "id:X;request-id:req-1;ts:1000;");
        assertThat(v.verify("ts=1000,v1=" + sig, "req-1", null)).isFalse();
        assertThat(v.verify("ts=1000,v1=" + sig, "req-1", "")).isFalse();
    }

    @Test
    void enabled_acceptsValidSignature() {
        WebhookSignatureVerifier v = new WebhookSignatureVerifier(SECRET, false);
        String paymentId = "1234567890";
        String ts = "1730000000";
        String requestId = "abc-def-123";
        String canonical = "id:" + paymentId + ";request-id:" + requestId + ";ts:" + ts + ";";
        String v1 = sign(SECRET, canonical);

        assertThat(v.verify("ts=" + ts + ",v1=" + v1, requestId, paymentId)).isTrue();
        // Order-independent within the header
        assertThat(v.verify("v1=" + v1 + ",ts=" + ts, requestId, paymentId)).isTrue();
        // Extra whitespace tolerated
        assertThat(v.verify(" ts=" + ts + " , v1=" + v1 + " ", requestId, paymentId)).isTrue();
    }

    @Test
    void enabled_rejectsTamperedPaymentId() {
        WebhookSignatureVerifier v = new WebhookSignatureVerifier(SECRET, false);
        String sig = sign(SECRET, "id:1234567890;request-id:r1;ts:1000;");
        String header = "ts=1000,v1=" + sig;
        // Attacker submits a different payment id with the original signature.
        assertThat(v.verify(header, "r1", "9999999999")).isFalse();
    }

    @Test
    void enabled_rejectsWrongSecret() {
        WebhookSignatureVerifier v = new WebhookSignatureVerifier(SECRET, false);
        // Attacker used a guessed secret to build the signature.
        String sig = sign("wrong-secret", "id:1;request-id:r;ts:1;");
        assertThat(v.verify("ts=1,v1=" + sig, "r", "1")).isFalse();
    }

    @Test
    void enabled_handlesMissingRequestIdAsEmptyString() {
        WebhookSignatureVerifier v = new WebhookSignatureVerifier(SECRET, false);
        String canonical = "id:1;request-id:;ts:100;";
        String sig = sign(SECRET, canonical);
        assertThat(v.verify("ts=100,v1=" + sig, null, "1")).isTrue();
    }

    // Test helper: compute HMAC-SHA256 hex the same way the verifier does.
    private static String sign(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(raw.length * 2);
            for (byte b : raw) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
