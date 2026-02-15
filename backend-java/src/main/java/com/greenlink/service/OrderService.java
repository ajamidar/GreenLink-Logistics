package com.greenlink.service;

import com.greenlink.model.DeliveryOrder;
import com.greenlink.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private static final UUID DEFAULT_ORG_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final String DEFAULT_STATUS = "UNASSIGNED";

    private final OrderRepository orderRepository;
    private final GeocodingService geocodingService;

    public OrderService(OrderRepository orderRepository, GeocodingService geocodingService) {
        this.orderRepository = orderRepository;
        this.geocodingService = geocodingService;
    }

    public List<DeliveryOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    public DeliveryOrder createOrder(DeliveryOrder order) {
        if (order.getOrganizationId() == null) {
            order.setOrganizationId(DEFAULT_ORG_ID);
        }

        if (order.getStatus() == null) {
            order.setStatus(DEFAULT_STATUS);
        }

        String address = order.getAddress();
        if (address != null) {
            address = address.trim();
        }
        Double lat = order.getLatitude();
        Double lon = order.getLongitude();

        if (lat == null || lon == null) {
            if (address == null || address.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Address or coordinates are required to create an order."
                );
            }

            GeocodingService.GeocodeResult result = geocodingService.geocodeAddress(address);
            if (result == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unable to geocode the provided address."
                );
            }

            order.setLatitude(result.latitude());
            order.setLongitude(result.longitude());
            if (result.address() != null && !result.address().isBlank()) {
                order.setAddress(result.address());
            }
        } else if (address == null || address.isBlank()) {
            order.setAddress(geocodingService.getAddress(lat, lon));
        }

        if (order.getLatitude() == null || order.getLongitude() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Latitude/longitude are required and could not be resolved from the address."
            );
        }

        return orderRepository.save(order);
    }

    public void deleteOrder(java.util.UUID orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found.");
        }

        orderRepository.deleteById(orderId);
    }
}
