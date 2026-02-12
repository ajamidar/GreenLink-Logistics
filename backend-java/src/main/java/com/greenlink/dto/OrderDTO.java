package com.greenlink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private String id;  // Python expects String representation of UUID
    private Double latitude;
    private Double longitude;
    private Double weightKg;  // Changed to Double to match Python float
    private Double serviceDurationMin;  // Changed to Double to match Python float
}
