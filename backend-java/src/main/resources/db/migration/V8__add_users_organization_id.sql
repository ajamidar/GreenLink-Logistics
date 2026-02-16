ALTER TABLE users ADD COLUMN organization_id UUID;

UPDATE users
SET organization_id = (md5(random()::text || clock_timestamp()::text)::uuid)
WHERE organization_id IS NULL;

ALTER TABLE users ALTER COLUMN organization_id SET NOT NULL;

CREATE INDEX idx_users_org ON users(organization_id);
