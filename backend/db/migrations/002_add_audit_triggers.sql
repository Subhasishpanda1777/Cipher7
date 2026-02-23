DROP TRIGGER IF EXISTS trg_users_updated ON users;
DROP TRIGGER IF EXISTS trg_children_updated ON children;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS migrate
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
migrate LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_children_updated
BEFORE UPDATE ON children
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
