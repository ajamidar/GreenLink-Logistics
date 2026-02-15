package com.greenlink.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greenlink.dto.OrderDTO;
import com.greenlink.dto.RouteRequest;
import com.greenlink.dto.RouteResponse;
import com.greenlink.dto.VehicleDTO;
import com.greenlink.model.DeliveryOrder;
import com.greenlink.model.Route;
import com.greenlink.model.Vehicle;
import com.greenlink.repository.OrderRepository;
import com.greenlink.repository.RouteRepository;
import com.greenlink.repository.VehicleRepository;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.util.ArrayList;
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
    private final ObjectMapper objectMapper = new ObjectMapper();

    // A static UUID for your "Default Organization" so all data stays linked
    private static final UUID DEFAULT_ORG_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    public RoutingService(VehicleRepository vehicleRepository,
                          OrderRepository orderRepository,
                          RouteRepository routeRepository) {
        this.vehicleRepository = vehicleRepository;
        this.orderRepository = orderRepository;
        this.routeRepository = routeRepository;

        // Create HttpClient that uses HTTP/1.1 (not HTTP/2)
        // This prevents protocol upgrade issues with FastAPI/Uvicorn
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();

        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);

        // Pointing to your Python FastAPI server
        this.restClient = RestClient.builder()
                .baseUrl("http://127.0.0.1:8000")
                .requestFactory(requestFactory)
                .build();
    }

    @Transactional
    public List<Route> optimizeRoutes() {
        System.out.println("=== OPTIMIZE ROUTES CALLED ===");

        // 1. Fetch Data
        List<DeliveryOrder> orders = orderRepository.findAll();
        List<Vehicle> vehicles = vehicleRepository.findAll();

        System.out.println("Found " + orders.size() + " orders and " + vehicles.size() + " vehicles");

        // Safety check: Don't call Python if we have nothing to optimize
        if (orders.isEmpty() || vehicles.isEmpty()) {
            System.out.println("WARNING: Cannot optimize - missing orders or vehicles");
            return List.of();
        }

        // 2. Map entities to DTOs (clean objects without JPA annotations)
        List<OrderDTO> orderDTOs = orders.stream()
                .map(order -> new OrderDTO(
                        order.getId().toString(),  // Convert UUID to String
                        order.getLatitude(),
                        order.getLongitude(),
                        order.getWeightKg().doubleValue(),  // Convert Integer to Double
                        order.getServiceDurationMin().doubleValue()  // Convert Integer to Double
                ))
                .collect(Collectors.toList());

        List<VehicleDTO> vehicleDTOs = vehicles.stream()
                .map(vehicle -> new VehicleDTO(
                        vehicle.getId().toString(),  // Convert UUID to String
                        vehicle.getCapacityKg().doubleValue(),  // Convert Integer to Double
                        vehicle.getStartLat(),
                        vehicle.getStartLon()
                ))
                .collect(Collectors.toList());

        // Create clean DTO request
        RouteRequest request = new RouteRequest(orderDTOs, vehicleDTOs);

        // DEBUG: Print the JSON that will be sent
        try {
            String json = objectMapper.writeValueAsString(request);
            System.out.println("=== SENDING TO PYTHON ===");
            System.out.println(json);
            System.out.println("=========================");
        } catch (Exception e) {
            System.err.println("Failed to serialize request: " + e.getMessage());
        }

        // 3. Call Python API
        // Manually serialize to JSON string to ensure proper formatting
        String jsonBody;
        try {
            jsonBody = objectMapper.writeValueAsString(request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize request", e);
        }

        RouteResponse response = restClient.post()
                .uri("/solve")
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonBody)  // Pass the JSON string directly
                .retrieve()
                .body(RouteResponse.class);

        // Safety check: Ensure Python actually returned routes
        if (response == null || response.getRoutes() == null || response.getRoutes().isEmpty()) {
            return List.of();
        }

        // 4. CLEAR EXISTING ROUTES
        for (DeliveryOrder order : orders) {
            if (order.getRoute() != null) {
                order.setRoute(null);
            }
            if (!"UNASSIGNED".equals(order.getStatus())) {
                order.setStatus("UNASSIGNED");
            }
        }
        orderRepository.saveAll(orders);
        routeRepository.deleteAll();

        // 5. SAVE TO DATABASE

        Map<UUID, DeliveryOrder> orderMap = orders.stream()
                .collect(Collectors.toMap(DeliveryOrder::getId, o -> o));
        Map<String, Vehicle> vehicleMap = vehicles.stream()
                .collect(Collectors.toMap(v -> v.getId().toString(), v -> v));

        List<Route> savedRoutes = new ArrayList<>();

        for (RouteResponse.RoutePlan routePlan : response.getRoutes()) {
            String vehicleId = routePlan.getVehicleId();
            Vehicle vehicle = vehicleId != null ? vehicleMap.get(vehicleId) : null;
            if (vehicle == null) {
                vehicle = vehicles.get(0);
            }

            Route newRoute = new Route();
            newRoute.setStatus("PLANNED");
            newRoute.setVehicle(vehicle);
            newRoute.setOrganizationId(DEFAULT_ORG_ID);

            Route savedRoute = routeRepository.save(newRoute);

            List<Map<String, Object>> sortedStops = routePlan.getStops();
            if (sortedStops == null) {
                savedRoutes.add(savedRoute);
                continue;
            }

            for (Map<String, Object> stop : sortedStops) {
                String idStr = (String) stop.get("id");

                if (idStr != null) {
                    try {
                        UUID id = UUID.fromString(idStr);
                        DeliveryOrder order = orderMap.get(id);

                        if (order != null) {
                            order.setRoute(savedRoute);
                            order.setStatus("ASSIGNED");
                            orderRepository.save(order);
                            savedRoute.getOrders().add(order);
                        }
                    } catch (IllegalArgumentException e) {
                        System.err.println("Skipping invalid UUID from Python: " + idStr);
                    }
                }
            }

            savedRoutes.add(savedRoute);
            System.out.println("Route created for vehicle " + vehicle.getId() + " with " + savedRoute.getOrders().size() + " orders assigned");
        }

        return savedRoutes;
    }
}