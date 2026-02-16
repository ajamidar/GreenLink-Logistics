package com.greenlink.service;

import com.greenlink.dto.DriverRequest;
import com.greenlink.model.Driver;
import com.greenlink.model.Vehicle;
import com.greenlink.repository.DriverRepository;
import com.greenlink.repository.VehicleRepository;
import com.greenlink.security.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DriverService {

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final CurrentUserService currentUserService;

    public DriverService(
            DriverRepository driverRepository,
            VehicleRepository vehicleRepository,
            CurrentUserService currentUserService
    ) {
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.currentUserService = currentUserService;
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findByOrganizationId(currentUserService.requireOrganizationId());
    }

    @Transactional
    public Driver createDriver(DriverRequest request) {
        Driver driver = new Driver();
        applyRequest(driver, request);
        driver.setOrganizationId(currentUserService.requireOrganizationId());

        if (driver.getLastCheckIn() == null) {
            driver.setLastCheckIn(LocalDateTime.now());
        }

        return driverRepository.save(driver);
    }

    @Transactional
    public Driver updateDriver(UUID id, DriverRequest request) {
        Driver driver = driverRepository
            .findByIdAndOrganizationId(id, currentUserService.requireOrganizationId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found."));

        applyRequest(driver, request);

        return driverRepository.save(driver);
    }

    public void deleteDriver(UUID id) {
        Driver driver = driverRepository
                .findByIdAndOrganizationId(id, currentUserService.requireOrganizationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found."));

        driverRepository.delete(driver);
    }

    private void applyRequest(Driver driver, DriverRequest request) {
        if (request.getName() != null) {
            driver.setName(request.getName());
        }
        if (request.getEmail() != null) {
            driver.setEmail(request.getEmail());
        }
        if (request.getLicenseId() != null) {
            driver.setLicenseId(request.getLicenseId());
        }
        if (request.getPhone() != null) {
            driver.setPhone(request.getPhone());
        }
        if (request.getHomeBase() != null) {
            driver.setHomeBase(request.getHomeBase());
        }
        if (request.getStatus() != null) {
            driver.setStatus(request.getStatus());
        }
        if (request.getLastCheckIn() != null) {
            driver.setLastCheckIn(request.getLastCheckIn());
        }

        if (request.getAssignedVehicleId() != null) {
            Vehicle vehicle = vehicleRepository
                    .findByIdAndOrganizationId(request.getAssignedVehicleId(), currentUserService.requireOrganizationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle not found."));
            driver.setAssignedVehicle(vehicle);
        } else {
            driver.setAssignedVehicle(null);
        }
    }
}
