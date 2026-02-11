package com.greenlink.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
public class RouteResponse {
    // Python sends: {"route": [ ... ]}
    // We map strictly to that structure.
    // We use Map<String, Object> because the Python object is flexible.
    private List<Map<String, Object>> route;
}