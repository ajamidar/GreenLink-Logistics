package com.greenlink.controller;

import com.greenlink.model.DeliveryOrder;
import com.greenlink.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<DeliveryOrder> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PostMapping
    public DeliveryOrder createOrder(@RequestBody DeliveryOrder order) {
        return orderService.createOrder(order);
    }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable UUID id) {
        orderService.deleteOrder(id);
    }
}
