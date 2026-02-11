package com.greenlink.dto;

import com.greenlink.model.DeliveryOrder;
import com.greenlink.model.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteRequest {
    private List<DeliveryOrder> orders;
    private List<Vehicle> vehicles;
}