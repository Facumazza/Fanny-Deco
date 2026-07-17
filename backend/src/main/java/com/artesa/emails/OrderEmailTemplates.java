package com.artesa.emails;

import com.artesa.orders.Order;
import com.artesa.orders.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.Locale;

/**
 * Builds subject + HTML for every transactional email the shop sends.
 * Kept inline in Java (no template files yet) since the volume is small.
 * If we ever grow past ~10 templates, migrate to a real templating engine.
 */
@Component
public class OrderEmailTemplates {

    private static final NumberFormat ARS = NumberFormat.getCurrencyInstance(new Locale("es", "AR"));
    static { ARS.setMaximumFractionDigits(0); }

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter
        .ofPattern("d 'de' MMMM 'de' yyyy", new Locale("es", "AR"))
        .withZone(ZoneId.of("America/Argentina/Buenos_Aires"));

    private final String storefrontUrl;
    private final String shopName;

    public OrderEmailTemplates(
        @Value("${artesa.payments.frontend-base-url}") String storefrontUrl,
        @Value("${artesa.emails.shop-name:FannyDeco}") String shopName
    ) {
        this.storefrontUrl = storefrontUrl.replaceAll("/$", "");
        this.shopName = shopName;
    }

    // -------------- Customer emails --------------

    /** After the order is created — waiting for payment. */
    public EmailMessage orderReceived(Order o) {
        String subject = "Recibimos tu orden " + o.getReference();
        String body = shell(
            "Recibimos tu orden",
            "Hola " + escape(o.getCustomerName()) + ",<br><br>" +
            "Recibimos tu orden <strong>" + o.getReference() + "</strong> y estamos esperando la confirmación del pago. " +
            "Apenas MercadoPago la confirme te avisamos por acá.",
            renderOrderBlock(o),
            null
        );
        return new EmailMessage(o.getCustomerEmail(), subject, body);
    }

    /** Payment approved. */
    public EmailMessage orderPaid(Order o) {
        String subject = "¡Pago confirmado! Estamos preparando tu pedido — " + o.getReference();
        String body = shell(
            "Estamos preparando tu pedido",
            "Hola " + escape(o.getCustomerName()) + ",<br><br>" +
            "¡Gracias! Recibimos tu pago y ya estamos preparando cada pieza en el taller. " +
            "En cuanto lo despachemos te mandamos el número de seguimiento.",
            renderOrderBlock(o),
            "Referencia: <strong>" + o.getReference() + "</strong>"
        );
        return new EmailMessage(o.getCustomerEmail(), subject, body);
    }

    /** Shipped — in transit. Includes the tracking code when the admin has set one. */
    public EmailMessage orderShipped(Order o) {
        String subject = "Tu pedido está en camino — " + o.getReference();
        String trackingLine = (o.getTrackingInfo() != null && !o.getTrackingInfo().isBlank())
            ? "<br><br><strong>Código de seguimiento:</strong><br>" +
              "<span style=\"font-family:monospace;background:#F5EFE5;padding:6px 10px;display:inline-block;border-radius:4px;\">" +
              escape(o.getTrackingInfo()) + "</span>"
            : "";
        String body = shell(
            "Tu pedido está en camino",
            "Hola " + escape(o.getCustomerName()) + ",<br><br>" +
            "Despachamos tu pedido <strong>" + o.getReference() + "</strong>. " +
            "Va a la dirección: " + escape(o.getShippingAddress()) + ", " + escape(o.getCity()) + "." +
            trackingLine,
            renderOrderBlock(o),
            null
        );
        return new EmailMessage(o.getCustomerEmail(), subject, body);
    }

    /** Delivered. */
    public EmailMessage orderDelivered(Order o) {
        String subject = "Tu pedido llegó — esperamos que te guste — " + o.getReference();
        String body = shell(
            "Tu pedido llegó",
            "Hola " + escape(o.getCustomerName()) + ",<br><br>" +
            "El correo nos confirmó la entrega de tu pedido <strong>" + o.getReference() + "</strong>. " +
            "¡Esperamos que te guste!<br><br>" +
            "Si algo no llegó como esperabas, respondé este email o escribinos por WhatsApp — lo resolvemos.",
            null,
            "¿Te gustó? Podés dejarnos una reseña respondiendo este mail."
        );
        return new EmailMessage(o.getCustomerEmail(), subject, body);
    }

    /** Refunded — money returned to the customer's card/account. */
    public EmailMessage orderRefunded(Order o) {
        String subject = "Reembolso procesado — " + o.getReference();
        String body = shell(
            "Reembolso procesado",
            "Hola " + escape(o.getCustomerName()) + ",<br><br>" +
            "Procesamos el reembolso de tu orden <strong>" + o.getReference() + "</strong> " +
            "por " + escape(ARS.format(o.getSubtotalArs())) + ".<br><br>" +
            "MercadoPago va a devolver el importe a tu medio de pago original. Los " +
            "plazos varían según el emisor de la tarjeta (habitualmente 5 a 14 días hábiles).",
            renderOrderBlock(o),
            "Si tenés dudas sobre este reembolso, respondé este email."
        );
        return new EmailMessage(o.getCustomerEmail(), subject, body);
    }

    /** Cancelled. */
    public EmailMessage orderCancelled(Order o) {
        String subject = "Tu orden fue cancelada — " + o.getReference();
        String body = shell(
            "Tu orden fue cancelada",
            "Hola " + escape(o.getCustomerName()) + ",<br><br>" +
            "Tu orden <strong>" + o.getReference() + "</strong> fue cancelada. " +
            "Si esto fue un error o querés más info, respondé este mail y te ayudamos.",
            null,
            null
        );
        return new EmailMessage(o.getCustomerEmail(), subject, body);
    }

    // -------------- Admin notifications --------------

    /** Notifies the admin that a new payment just came in. */
    public EmailMessage adminOrderPaid(String adminEmail, Order o) {
        String subject = "🔔 Venta nueva — " + o.getReference() + " · " + ARS.format(o.getSubtotalArs());
        String body = shell(
            "Venta nueva",
            "Se acaba de acreditar el pago de <strong>" + o.getReference() + "</strong>.<br><br>" +
            "<strong>Cliente</strong>: " + escape(o.getCustomerName()) + " · " + escape(o.getCustomerEmail()) +
                (o.getPhone() != null ? " · " + escape(o.getPhone()) : "") + "<br>" +
            "<strong>Envío</strong>: " + escape(o.getShippingAddress()) + ", " + escape(o.getCity()) +
                (o.getPostalCode() != null ? " (" + escape(o.getPostalCode()) + ")" : "") +
                ", " + escape(o.getCountry()) + "<br>" +
            (o.getNotes() != null ? "<strong>Notas</strong>: " + escape(o.getNotes()) + "<br>" : "") +
            "<strong>Método de pago</strong>: " + (o.getPaymentMethod() != null ? o.getPaymentMethod() : "?") + "<br><br>" +
            "Preparala y marcala como <em>Enviada</em> en el panel cuando la despaches.",
            renderOrderBlock(o),
            null
        );
        return new EmailMessage(adminEmail, subject, body);
    }

    // -------------- Layout helpers --------------

    private String shell(String heading, String intro, String orderBlock, String footerNote) {
        return """
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><title>%s</title></head>
        <body style="margin:0;padding:0;background:#F5EFE5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1A1A1A;">
          <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
            <div style="text-align:center;margin-bottom:32px;">
              <p style="font-size:22px;font-weight:700;letter-spacing:6px;color:#5C3A28;margin:0;">%s</p>
              <p style="font-size:10px;letter-spacing:3px;color:#6B6B6B;margin:4px 0 0;">CUERO &amp; CERÁMICA</p>
            </div>
            <div style="background:white;padding:32px 28px;border-radius:4px;">
              <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:24px;color:#1A1A1A;margin:0 0 16px;">%s</h1>
              <p style="font-size:15px;line-height:1.6;color:#1A1A1A;margin:0 0 24px;">%s</p>
              %s
              %s
            </div>
            <div style="text-align:center;margin-top:24px;">
              <a href="%s" style="color:#B04A2C;font-size:13px;text-decoration:none;">%s</a>
            </div>
            <p style="text-align:center;font-size:11px;color:#6B6B6B;margin-top:32px;">
              Este email fue enviado automáticamente. Si tenés dudas, respondé y te ayudamos.
            </p>
          </div>
        </body>
        </html>
        """.formatted(
            escape(heading),
            escape(shopName),
            escape(heading),
            intro,  // trusted, contains our own tags
            orderBlock != null ? orderBlock : "",
            footerNote != null
                ? "<p style=\"font-size:13px;color:#6B6B6B;border-top:1px solid #F5EFE5;padding-top:16px;margin-top:24px;\">" + footerNote + "</p>"
                : "",
            escape(storefrontUrl),
            escape(shopName + " · Buenos Aires, Argentina")
        );
    }

    private String renderOrderBlock(Order o) {
        StringBuilder rows = new StringBuilder();
        for (OrderItem i : o.getItems()) {
            rows.append("""
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#1A1A1A;">%s <span style="color:#6B6B6B;">× %d</span></td>
                  <td style="padding:8px 0;font-size:14px;color:#B04A2C;text-align:right;font-weight:600;">%s</td>
                </tr>
                """.formatted(escape(i.getProductName()), i.getQuantity(), ARS.format(i.getLineTotalArs())));
        }
        return """
            <table style="width:100%%;border-collapse:collapse;margin:16px 0 8px;">
              <tbody>%s</tbody>
              <tfoot>
                <tr>
                  <td style="padding:12px 0 0;border-top:1px solid #F5EFE5;font-size:15px;color:#1A1A1A;font-weight:600;">Total</td>
                  <td style="padding:12px 0 0;border-top:1px solid #F5EFE5;text-align:right;font-family:Georgia,serif;font-size:20px;color:#B04A2C;">%s</td>
                </tr>
              </tfoot>
            </table>
            """.formatted(rows, ARS.format(o.getSubtotalArs()));
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
