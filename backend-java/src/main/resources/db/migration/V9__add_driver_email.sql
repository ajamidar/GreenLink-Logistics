ALTER TABLE drivers ADD COLUMN email VARCHAR(255);

CREATE INDEX idx_drivers_email ON drivers(email);
