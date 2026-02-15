package com.greenlink.controller;

import com.greenlink.dto.DriverRequest;
import com.greenlink.model.Driver;
import com.greenlink.service.DriverService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping
    public List<Driver> getAllDrivers() {
        return driverService.getAllDrivers();
    }

    @PostMapping
    public Driver createDriver(@RequestBody DriverRequest request) {
        return driverService.createDriver(request);
    }

    @PutMapping("/{id}")
    public Driver updateDriver(@PathVariable UUID id, @RequestBody DriverRequest request) {
        return driverService.updateDriver(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteDriver(@PathVariable UUID id) {
        driverService.deleteDriver(id);
    }
}
