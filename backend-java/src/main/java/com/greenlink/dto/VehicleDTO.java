package com.greenlink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDTO {
    private String id;  // Python expects String (optional)
    private Double capacityKg;  // Python expects float
    private Double startLat;  // Python expects float
    private Double startLon;  // Python expects float
}
