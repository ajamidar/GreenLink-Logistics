package com.greenlink.service;

import com.greenlink.model.Vehicle;
import com.greenlink.repository.RouteRepository;
import com.greenlink.repository.VehicleRepository;
import com.greenlink.security.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final RouteRepository routeRepository;
    private final GeocodingService geocodingService;
    private final CurrentUserService currentUserService;

    public VehicleService(
            VehicleRepository vehicleRepository,
            RouteRepository routeRepository,
            GeocodingService geocodingService,
            CurrentUserService currentUserService
    ) {
        this.vehicleRepository = vehicleRepository;
        this.routeRepository = routeRepository;
        this.geocodingService = geocodingService;
        this.currentUserService = currentUserService;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findByOrganizationId(currentUserService.requireOrganizationId());
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        vehicle.setOrganizationId(currentUserService.requireOrganizationId());

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
        UUID organizationId = currentUserService.requireOrganizationId();
        Vehicle vehicle = vehicleRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found."));

        var routes = routeRepository.findByVehicleIdAndOrganizationId(id, organizationId);
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

        vehicleRepository.delete(vehicle);
    }
}
