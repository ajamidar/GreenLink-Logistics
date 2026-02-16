package com.greenlink.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DriverRequest {

    private String name;
    private String email;
    private String licenseId;
    private String phone;
    private String homeBase;
    private String status;
    private LocalDateTime lastCheckIn;
    private UUID assignedVehicleId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLicenseId() {
        return licenseId;
    }

    public void setLicenseId(String licenseId) {
        this.licenseId = licenseId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getHomeBase() {
        return homeBase;
    }

    public void setHomeBase(String homeBase) {
        this.homeBase = homeBase;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastCheckIn() {
        return lastCheckIn;
    }

    public void setLastCheckIn(LocalDateTime lastCheckIn) {
        this.lastCheckIn = lastCheckIn;
    }

    public UUID getAssignedVehicleId() {
        return assignedVehicleId;
    }

    public void setAssignedVehicleId(UUID assignedVehicleId) {
        this.assignedVehicleId = assignedVehicleId;
    }
}
