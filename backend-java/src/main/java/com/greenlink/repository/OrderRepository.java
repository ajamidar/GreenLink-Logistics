package com.greenlink.repository;

import com.greenlink.model.DeliveryOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<DeliveryOrder, UUID> {

    // Custom capability: Find all orders that are still "UNASSIGNED"
    List<DeliveryOrder> findByStatusAndOrganizationId(String  status, UUID organizationId);

    List<DeliveryOrder> findByOrganizationId(UUID organizationId);

    java.util.Optional<DeliveryOrder> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
