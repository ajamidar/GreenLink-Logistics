CREATE TABLE drivers (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    name VARCHAR(255) NOT NULL,
    license_id VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    home_base VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    last_check_in TIMESTAMP,
    vehicle_id UUID REFERENCES vehicles(id)
);

CREATE INDEX idx_drivers_org ON drivers(organization_id);
CREATE INDEX idx_drivers_vehicle ON drivers(vehicle_id);
