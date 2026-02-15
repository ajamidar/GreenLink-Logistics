package com.greenlink.controller;

import com.greenlink.repository.RouteRepository;
import com.greenlink.service.RoutingService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.greenlink.model.Route;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RoutingService routingService;
    private final RouteRepository routeRepository;

    public RouteController(RoutingService routingService, RouteRepository routeRepository) {
        this.routingService = routingService;
        this.routeRepository = routeRepository;
    }

    @GetMapping
    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    @PostMapping("/optimize")
    public List<Route> optimizeRoutes() {
        return routingService.optimizeRoutes();
    }
}