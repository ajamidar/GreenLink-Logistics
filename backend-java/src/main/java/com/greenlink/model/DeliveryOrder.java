package com.greenlink.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "delivery_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOrder extends BaseEntity {

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 500)
    private String address;

    @Column(nullable = false)
    private Integer weightKg;

    // Time to unload the package (e.g., 15 mins)
    @Column(nullable = false)
    private Integer serviceDurationMin;

    // Status: "UNASSIGNED" (Waiting), "ASSIGNED" (On a truck), "COMPLETED"
    @Column(nullable = false)
    private String status = "UNASSIGNED";

    // ... existing fields ...
    @ManyToOne
    @JoinColumn(name = "route_id", nullable = true)
    @JsonBackReference
    private Route route;
}