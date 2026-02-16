package com.greenlink.controller;

import com.greenlink.dto.DriverRouteResponse;
import com.greenlink.service.DriverPortalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/driver")
public class DriverPortalController {

    private final DriverPortalService driverPortalService;

    public DriverPortalController(DriverPortalService driverPortalService) {
        this.driverPortalService = driverPortalService;
    }

    @GetMapping("/route")
    public DriverRouteResponse getRoute() {
        return driverPortalService.getDriverRoute();
    }

    @PatchMapping("/orders/{orderId}/delivered")
    public ResponseEntity<Void> markDelivered(@PathVariable UUID orderId) {
        driverPortalService.markDelivered(orderId);
        return ResponseEntity.noContent().build();
    }
}
