package com.greenlink.repository;

import com.greenlink.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    // Custom query: Find all vehicles for a specific company
    // This is CRITICAL for multi-tenancy security later.
    List<Vehicle> findByOrganizationId(UUID organizationId);

    java.util.Optional<Vehicle> findByIdAndOrganizationId(UUID id, UUID organizationId);
}