package com.greenlink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteRequest {
    // Use DTOs instead of entity objects to avoid JPA serialization issues
    private List<OrderDTO> orders;
    private List<VehicleDTO> vehicles;
}