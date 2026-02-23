INSERT INTO users (first_name, last_name, email, password_hash, role)
VALUES
  ('Alice', 'Parent', 'alice.parent@example.com', '', 'parent'),
  ('Dr', 'Ophthalmologist', 'doctor@example.com', '', 'doctor')
ON CONFLICT (email) DO NOTHING;

INSERT INTO children (user_id, first_name, last_name, date_of_birth)
VALUES
  (1, 'Maya', 'Parent', '2017-05-14')
ON CONFLICT DO NOTHING;

