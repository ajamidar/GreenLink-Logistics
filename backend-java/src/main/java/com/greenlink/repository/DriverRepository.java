package com.greenlink.repository;

import com.greenlink.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {
	List<Driver> findByOrganizationId(UUID organizationId);
	Optional<Driver> findByIdAndOrganizationId(UUID id, UUID organizationId);
	Optional<Driver> findByEmailAndOrganizationId(String email, UUID organizationId);
}
