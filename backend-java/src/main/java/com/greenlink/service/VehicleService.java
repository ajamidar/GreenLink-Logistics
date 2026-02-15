package com.greenlink.service;

import com.greenlink.model.Vehicle;
import com.greenlink.repository.RouteRepository;
import com.greenlink.repository.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class VehicleService {

    private static final UUID DEFAULT_ORG_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    private final VehicleRepository vehicleRepository;
    private final RouteRepository routeRepository;
    private final GeocodingService geocodingService;

    public VehicleService(
            VehicleRepository vehicleRepository,
            RouteRepository routeRepository,
            GeocodingService geocodingService
    ) {
        this.vehicleRepository = vehicleRepository;
        this.routeRepository = routeRepository;
        this.geocodingService = geocodingService;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        if (vehicle.getOrganizationId() == null) {
            vehicle.setOrganizationId(DEFAULT_ORG_ID);
        }

        String address = vehicle.getAddress();
        if (address != null) {
            address = address.trim();
        }

        Double lat = vehicle.getStartLat();
        Double lon = vehicle.getStartLon();

        if ((lat == null || lon == null) && address != null && !address.isBlank()) {
            GeocodingService.GeocodeResult result = geocodingService.geocodeAddress(address);
            if (result == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unable to geocode the provided address."
                );
            }

            vehicle.setStartLat(result.latitude());
            vehicle.setStartLon(result.longitude());
            if (result.address() != null && !result.address().isBlank()) {
                vehicle.setAddress(result.address());
            }
        }

        if (vehicle.getStartLat() == null || vehicle.getStartLon() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start location is required and could not be resolved from the address."
            );
        }

        if (vehicle.getAddress() == null || vehicle.getAddress().isBlank()) {
            vehicle.setAddress(geocodingService.getAddress(vehicle.getStartLat(), vehicle.getStartLon()));
        }

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(UUID id) {
        if (!vehicleRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found.");
        }

        var routes = routeRepository.findByVehicleId(id);
        if (!routes.isEmpty()) {
            for (var route : routes) {
                if (route.getOrders() != null) {
                    for (var order : route.getOrders()) {
                        order.setRoute(null);
                        order.setStatus("UNASSIGNED");
                    }
                }
                route.setVehicle(null);
            }
            routeRepository.saveAll(routes);
        }

        vehicleRepository.deleteById(id);
    }
}
