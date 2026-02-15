package com.greenlink.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle extends BaseEntity {

    @Column(nullable = false)
    private String name; // e.g., "Van 001"

    @Column(nullable = false)
    private Integer capacityKg;

    @Column(nullable = false)
    private Integer startShiftMinutes; // e.g., 540 = 9:00 AM

    @Column(nullable = false)
    private Integer endShiftMinutes;   // e.g., 1020 = 5:00 PM

    private Double startLat;
    private Double startLon;

    @Column(length = 500)
    private String address;
}