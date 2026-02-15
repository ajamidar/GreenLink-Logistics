package com.greenlink.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "routes")
public class Route extends BaseEntity {

    @Column(nullable = false)
    private String status; // PLANNED, IN_PROGRESS, COMPLETED

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    // A Route has many Orders.
    // "mappedBy" tells Hibernate: "Look at the 'route' field in DeliveryOrder to find the link."
    @OneToMany(mappedBy = "route", cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JsonManagedReference
    private List<DeliveryOrder> orders = new ArrayList<>();
}