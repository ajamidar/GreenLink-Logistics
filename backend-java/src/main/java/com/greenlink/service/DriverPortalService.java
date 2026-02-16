package com.greenlink.service;

import com.greenlink.dto.DriverRouteResponse;
import com.greenlink.model.DeliveryOrder;
import com.greenlink.model.Driver;
import com.greenlink.model.Route;
import com.greenlink.repository.DriverRepository;
import com.greenlink.repository.OrderRepository;
import com.greenlink.repository.RouteRepository;
import com.greenlink.security.CurrentUserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DriverPortalService {

    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;
    private final RouteRepository routeRepository;
    private final CurrentUserService currentUserService;
    private final RestClient restClient;

    public DriverPortalService(
            DriverRepository driverRepository,
            OrderRepository orderRepository,
            RouteRepository routeRepository,
            CurrentUserService currentUserService,
            @Value("${app.osrm.base-url:http://localhost:5000}") String osrmBaseUrl
    ) {
        this.driverRepository = driverRepository;
        this.orderRepository = orderRepository;
        this.routeRepository = routeRepository;
        this.currentUserService = currentUserService;
        this.restClient = RestClient.builder()
                .baseUrl(osrmBaseUrl)
                .build();
    }

    @Transactional(readOnly = true)
    public DriverRouteResponse getDriverRoute() {
        Driver driver = getCurrentDriver();
        if (driver.getAssignedVehicle() == null) {
            return new DriverRouteResponse(driver.getName(), null, null, List.of(), 0);
        }

        Route route = routeRepository
            .findByVehicleIdAndOrganizationId(
                driver.getAssignedVehicle().getId(),
                currentUserService.requireOrganizationId()
            )
            .stream()
            .findFirst()
            .orElse(null);

        if (route == null) {
            return new DriverRouteResponse(driver.getName(), driver.getAssignedVehicle().getName(), null, List.of(), 0);
        }

        List<DriverRouteResponse.DriverStop> stops = route.getOrders().stream()
                .map(order -> new DriverRouteResponse.DriverStop(
                        order.getId().toString(),
                        order.getAddress(),
                        order.getLatitude(),
                        order.getLongitude(),
                order.getStatus(),
                order.getServiceDurationMin()
                ))
                .collect(Collectors.toList());

        int estimatedRemainingMinutes = estimateRemainingMinutes(route.getOrders());

        return new DriverRouteResponse(
                driver.getName(),
                driver.getAssignedVehicle().getName(),
                route.getStatus(),
            stops,
            estimatedRemainingMinutes
        );
    }

    @Transactional
    public void markDelivered(UUID orderId) {
        Driver driver = getCurrentDriver();
        if (driver.getAssignedVehicle() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No assigned vehicle.");
        }

        DeliveryOrder order = orderRepository
                .findByIdAndOrganizationId(orderId, currentUserService.requireOrganizationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        if (order.getRoute() == null || order.getRoute().getVehicle() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is not assigned.");
        }

        if (!order.getRoute().getVehicle().getId().equals(driver.getAssignedVehicle().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order not assigned to this driver.");
        }

        order.setStatus("DELIVERED");
        orderRepository.save(order);
    }

    private Driver getCurrentDriver() {
        String email = currentUserService.requireUser().getUsername();
        return driverRepository
                .findByEmailAndOrganizationId(email, currentUserService.requireOrganizationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver profile not found."));
    }

    private int estimateRemainingMinutes(List<DeliveryOrder> orders) {
        List<DeliveryOrder> remaining = orders.stream()
                .filter(order -> !"DELIVERED".equals(order.getStatus()))
                .toList();

        if (remaining.isEmpty()) {
            return 0;
        }

        int serviceMinutes = remaining.stream()
                .map(DeliveryOrder::getServiceDurationMin)
                .filter(value -> value != null)
                .mapToInt(Integer::intValue)
                .sum();

        int travelMinutes = 0;
        for (int i = 0; i < remaining.size() - 1; i++) {
            DeliveryOrder from = remaining.get(i);
            DeliveryOrder to = remaining.get(i + 1);
            if (from.getLongitude() == null || from.getLatitude() == null || to.getLongitude() == null || to.getLatitude() == null) {
                continue;
            }

            Integer segmentMinutes = fetchOsrmMinutes(
                    from.getLongitude(),
                    from.getLatitude(),
                    to.getLongitude(),
                    to.getLatitude()
            );
            if (segmentMinutes != null) {
                travelMinutes += segmentMinutes;
            }
        }

        return serviceMinutes + travelMinutes;
    }

    private Integer fetchOsrmMinutes(double fromLon, double fromLat, double toLon, double toLat) {
        try {
            String routePath = String.format(
                    "/route/v1/driving/%f,%f;%f,%f?overview=false",
                    fromLon,
                    fromLat,
                    toLon,
                    toLat
            );

            OsrmRouteResponse response = restClient.get()
                    .uri(routePath)
                    .retrieve()
                    .body(OsrmRouteResponse.class);

            if (response == null || response.routes == null || response.routes.isEmpty()) {
                return null;
            }

            double seconds = response.routes.get(0).duration;
            return (int) Math.round(seconds / 60.0);
        } catch (Exception ex) {
            return null;
        }
    }

    private static class OsrmRouteResponse {
        public List<OsrmRoute> routes;
    }

    private static class OsrmRoute {
        public double duration;
    }
}
