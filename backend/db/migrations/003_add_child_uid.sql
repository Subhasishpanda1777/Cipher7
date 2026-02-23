ALTER TABLE children
ADD COLUMN IF NOT EXISTS child_uid VARCHAR(40);

CREATE SEQUENCE IF NOT EXISTS child_uid_seq START WITH 1000;

CREATE OR REPLACE FUNCTION assign_child_uid()
RETURNS TRIGGER AS $$
DECLARE
  parent_first TEXT;
  parent_last TEXT;
  seq_value TEXT;
BEGIN
  IF NEW.child_uid IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(LOWER(SUBSTRING(first_name FROM 1 FOR 2)), 'px'),
         COALESCE(LOWER(SUBSTRING(last_name FROM 1 FOR 2)), 'ly')
    INTO parent_first, parent_last
  FROM users
  WHERE id = NEW.user_id;

  seq_value := LPAD(nextval('child_uid_seq')::text, 5, '0');

  NEW.child_uid := CONCAT('VA-', parent_first, parent_last, '-', seq_value);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_child_uid ON children;
CREATE TRIGGER set_child_uid
BEFORE INSERT ON children
FOR EACH ROW
EXECUTE FUNCTION assign_child_uid();

UPDATE children AS c
SET child_uid = CONCAT('VA-',
                       COALESCE(LOWER(SUBSTRING(u.first_name FROM 1 FOR 2)), 'px'),
                       COALESCE(LOWER(SUBSTRING(u.last_name FROM 1 FOR 2)), 'ly'),
                       '-',
                       LPAD(nextval('child_uid_seq')::text, 5, '0'))
FROM users u
WHERE c.child_uid IS NULL
  AND u.id = c.user_id;

ALTER TABLE children
  ADD CONSTRAINT children_child_uid_key UNIQUE (child_uid);

ALTER TABLE children
  ALTER COLUMN child_uid SET NOT NULL;
