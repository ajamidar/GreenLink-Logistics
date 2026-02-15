package com.greenlink.service;

import com.greenlink.dto.DriverRequest;
import com.greenlink.model.Driver;
import com.greenlink.model.Vehicle;
import com.greenlink.repository.DriverRepository;
import com.greenlink.repository.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DriverService {

    private static final UUID DEFAULT_ORG_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    public DriverService(DriverRepository driverRepository, VehicleRepository vehicleRepository) {
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    @Transactional
    public Driver createDriver(DriverRequest request) {
        Driver driver = new Driver();
        applyRequest(driver, request);

        if (driver.getOrganizationId() == null) {
            driver.setOrganizationId(DEFAULT_ORG_ID);
        }

        if (driver.getLastCheckIn() == null) {
            driver.setLastCheckIn(LocalDateTime.now());
        }

        return driverRepository.save(driver);
    }

    @Transactional
    public Driver updateDriver(UUID id, DriverRequest request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found."));

        applyRequest(driver, request);

        return driverRepository.save(driver);
    }

    public void deleteDriver(UUID id) {
        if (!driverRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found.");
        }

        driverRepository.deleteById(id);
    }

    private void applyRequest(Driver driver, DriverRequest request) {
        if (request.getName() != null) {
            driver.setName(request.getName());
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
            Vehicle vehicle = vehicleRepository.findById(request.getAssignedVehicleId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vehicle not found."));
            driver.setAssignedVehicle(vehicle);
        } else {
            driver.setAssignedVehicle(null);
        }
    }
}
