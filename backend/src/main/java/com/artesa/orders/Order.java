package com.artesa.orders;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String reference;

    @Column(name = "customer_email", nullable = false, length = 180)
    private String customerEmail;

    @Column(name = "customer_name", nullable = false, length = 200)
    private String customerName;

    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(nullable = false, length = 120)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(nullable = false, length = 120)
    private String country;

    @Column(length = 60)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "subtotal_ars", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotalArs;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "payment_id", length = 80)
    private String paymentId;

    @Column(name = "payment_status", length = 30)
    private String paymentStatus;

    @Column(name = "payment_method", length = 60)
    private String paymentMethod;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "preference_id", length = 120)
    private String preferenceId;

    @Column(name = "tracking_info", length = 300)
    private String trackingInfo;

    @Column(name = "receipt_url", length = 2000)
    private String receiptUrl;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY,
               cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public Order() {}

    public Long getId() { return id; }
    public String getReference() { return reference; }
    public String getCustomerEmail() { return customerEmail; }
    public String getCustomerName() { return customerName; }
    public String getShippingAddress() { return shippingAddress; }
    public String getCity() { return city; }
    public String getPostalCode() { return postalCode; }
    public String getCountry() { return country; }
    public String getPhone() { return phone; }
    public String getNotes() { return notes; }
    public BigDecimal getSubtotalArs() { return subtotalArs; }
    public OrderStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public String getPaymentId() { return paymentId; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public Instant getPaidAt() { return paidAt; }
    public String getPreferenceId() { return preferenceId; }
    public String getTrackingInfo() { return trackingInfo; }
    public String getReceiptUrl() { return receiptUrl; }
    public List<OrderItem> getItems() { return items; }
}
