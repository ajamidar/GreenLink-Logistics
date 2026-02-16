package com.greenlink.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Driver extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column
    private String email;

    @Column(name = "license_id", nullable = false)
    private String licenseId;

    @Column(nullable = false)
    private String phone;

    @Column(name = "home_base", nullable = false)
    private String homeBase;

    @Column(nullable = false)
    private String status;

    @Column(name = "last_check_in")
    private java.time.LocalDateTime lastCheckIn;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle assignedVehicle;

    @JsonProperty("assignedVehicleId")
    public java.util.UUID getAssignedVehicleId() {
        return assignedVehicle != null ? assignedVehicle.getId() : null;
    }
}
