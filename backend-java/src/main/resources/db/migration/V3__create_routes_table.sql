-- 1. Create the Routes table
CREATE TABLE routes (
                        id UUID PRIMARY KEY,
                        organization_id UUID NOT NULL,
                        status VARCHAR(50) NOT NULL,
                        vehicle_id UUID REFERENCES vehicles(id),
                        created_at TIMESTAMP,
                        updated_at TIMESTAMP
);

-- 2. Update Orders to link to a Route
ALTER TABLE delivery_orders
    ADD COLUMN route_id UUID REFERENCES routes(id);

-- 3. Create Index
CREATE INDEX idx_orders_route_id ON delivery_orders(route_id);