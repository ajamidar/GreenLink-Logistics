package com.greenlink.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.greenlink.dto.RouteRequest;
import com.greenlink.dto.RouteResponse;
import com.greenlink.model.DeliveryOrder;
import com.greenlink.model.Route;
import com.greenlink.model.Vehicle;
import com.greenlink.repository.OrderRepository;
import com.greenlink.repository.RouteRepository;
import com.greenlink.repository.VehicleRepository;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoutingService {

    private final VehicleRepository vehicleRepository;
    private final OrderRepository orderRepository;
    private final RouteRepository routeRepository;
    private final RestClient restClient;

    // A static UUID for your "Default Organization" so all data stays linked
    private static final UUID DEFAULT_ORG_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    public RoutingService(VehicleRepository vehicleRepository,
                          OrderRepository orderRepository,
                          RouteRepository routeRepository) {
        this.vehicleRepository = vehicleRepository;
        this.orderRepository = orderRepository;
        this.routeRepository = routeRepository;
        this.restClient = RestClient.create("http://127.0.0.1:8000");
    }

    @Transactional
    public List<Route> optimizeRoutes() {
        // 1. Fetch Data
        List<DeliveryOrder> orders = orderRepository.findAll();
        List<Vehicle> vehicles = vehicleRepository.findAll();

        if (orders.isEmpty() || vehicles.isEmpty()) return List.of();

        // 2. Prepare JSON for Python
        RouteRequest request = new RouteRequest(orders, vehicles);

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        String jsonBody;
        try {
            jsonBody = mapper.writeValueAsString(request);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON Error", e);
        }

        // 3. Call Python API
        RouteResponse response = restClient.post()
                .uri("/solve")
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonBody)
                .retrieve()
                .body(RouteResponse.class);

        if (response == null || response.getRoute() == null || response.getRoute().isEmpty()) {
            return List.of();
        }

        // 4. SAVE TO DATABASE

        // A. Create Route
        Route newRoute = new Route();
        newRoute.setStatus("PLANNED");
        newRoute.setVehicle(vehicles.get(0));

        // We use the static UUID instead of the String "org-1"
        newRoute.setOrganizationId(DEFAULT_ORG_ID);
        // ---------------

        Route savedRoute = routeRepository.save(newRoute);

        // B. Link Orders to this Route
        List<Map<String, Object>> sortedStops = response.getRoute();

        Map<UUID, DeliveryOrder> orderMap = orders.stream()
                .collect(Collectors.toMap(DeliveryOrder::getId, o -> o));

        for (Map<String, Object> stop : sortedStops) {
            String idStr = (String) stop.get("id");

            if (idStr != null) {
                try {
                    UUID id = UUID.fromString(idStr);
                    DeliveryOrder order = orderMap.get(id);

                    if (order != null) {
                        order.setRoute(savedRoute);
                        orderRepository.save(order);
                    }
                } catch (IllegalArgumentException e) {
                    System.err.println("Skipping invalid UUID from Python: " + idStr);
                }
            }
        }

        return List.of(savedRoute);
    }
}