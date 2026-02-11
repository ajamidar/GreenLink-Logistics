package com.greenlink.service;

import com.greenlink.dto.RouteRequest;
import com.greenlink.dto.RouteResponse;
import com.greenlink.model.DeliveryOrder;
import com.greenlink.model.Vehicle;
import com.greenlink.repository.OrderRepository;
import com.greenlink.repository.VehicleRepository;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class RoutingService {

    private final VehicleRepository vehicleRepository;
    private final OrderRepository orderRepository;
    private final RestClient restClient;

    public RoutingService(VehicleRepository vehicleRepository, OrderRepository orderRepository) {
        this.vehicleRepository = vehicleRepository;
        this.orderRepository = orderRepository;
        // This connects to your running Python server
        this.restClient = RestClient.create("http://127.0.0.1:8000");
    }

    public List<Map<String, Object>> optimizeRoutes() {
        // 1. Get real data from the database
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<DeliveryOrder> orders = orderRepository.findAll();

        // 2. Prepare the request
        RouteRequest request = new RouteRequest(orders, vehicles);

        // 3. Call Python
        RouteResponse response = restClient.post()
                .uri("/solve")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(RouteResponse.class);

        return response != null ? response.getRoute() : List.of();
    }
}