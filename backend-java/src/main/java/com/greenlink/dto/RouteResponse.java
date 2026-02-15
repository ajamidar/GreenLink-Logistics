package com.greenlink.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
public class RouteResponse {
    // Python sends: {"routes": [{"vehicleId": "...", "stops": [ ... ]}, ...]}
    private List<RoutePlan> routes;

    @Data
    @NoArgsConstructor
    public static class RoutePlan {
        private String vehicleId;
        private List<Map<String, Object>> stops;
    }
}