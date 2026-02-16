package com.greenlink.dto;

import java.util.List;

public class DriverRouteResponse {
    private final String driverName;
    private final String vehicleName;
    private final String routeStatus;
    private final List<DriverStop> stops;
    private final Integer estimatedRemainingMinutes;

    public DriverRouteResponse(
            String driverName,
            String vehicleName,
            String routeStatus,
            List<DriverStop> stops,
            Integer estimatedRemainingMinutes
    ) {
        this.driverName = driverName;
        this.vehicleName = vehicleName;
        this.routeStatus = routeStatus;
        this.stops = stops;
        this.estimatedRemainingMinutes = estimatedRemainingMinutes;
    }

    public String getDriverName() {
        return driverName;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public String getRouteStatus() {
        return routeStatus;
    }

    public List<DriverStop> getStops() {
        return stops;
    }

    public Integer getEstimatedRemainingMinutes() {
        return estimatedRemainingMinutes;
    }

    public static class DriverStop {
        private final String id;
        private final String address;
        private final Double latitude;
        private final Double longitude;
        private final String status;
        private final Integer serviceDurationMin;

        public DriverStop(
                String id,
                String address,
                Double latitude,
                Double longitude,
                String status,
                Integer serviceDurationMin
        ) {
            this.id = id;
            this.address = address;
            this.latitude = latitude;
            this.longitude = longitude;
            this.status = status;
            this.serviceDurationMin = serviceDurationMin;
        }

        public String getId() {
            return id;
        }

        public String getAddress() {
            return address;
        }

        public Double getLatitude() {
            return latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public String getStatus() {
            return status;
        }

        public Integer getServiceDurationMin() {
            return serviceDurationMin;
        }
    }
}
