-- =============================================
-- Datos de prueba - WoowTechnology
-- =============================================
-- NOTA: Los passwords están hasheados con bcrypt (12 rounds)
-- Admin:    password = Admin1234!
-- Usuario:  password = User1234!

-- Limpiar datos existentes (orden importa por FK)
DELETE FROM users;
DELETE FROM roles;

-- ─── Insertar roles del sistema ───────────────────────────────────────────────
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrador del sistema con acceso completo'),
  ('user',  'Usuario estándar con acceso limitado');

-- ─── Insertar usuarios referenciando los roles ────────────────────────────────

-- Administrador  (Password: Admin1234!)
INSERT INTO users (name, email, password, role_id) VALUES (
  'Admin WoowTechnology',
  'admin@woow.com',
  '$2a$12$mAiRAKq74t8OK1w2PukJBOa1UfVqLr3mTu4hc0f/tsehLI0.Q2bSy',
  (SELECT id FROM roles WHERE name = 'admin')
);

-- Usuario normal  (Password: User1234!)
INSERT INTO users (name, email, password, role_id) VALUES (
  'Juan Perez',
  'juan@example.com',
  '$2a$12$ayknHDvLv4BtmLM9vydsmOUXE2shUIMz36WEvVZf6oEBqpiSPO2VG',
  (SELECT id FROM roles WHERE name = 'user')
);

-- Otro usuario normal  (Password: User1234!)
INSERT INTO users (name, email, password, role_id) VALUES (
  'Maria Garcia',
  'maria@example.com',
  '$2a$12$ayknHDvLv4BtmLM9vydsmOUXE2shUIMz36WEvVZf6oEBqpiSPO2VG',
  (SELECT id FROM roles WHERE name = 'user')
);

-- Verificar datos insertados
SELECT r.name AS rol, u.name, u.email, u.role_id
FROM users u
LEFT JOIN roles r ON r.id = u.role_id
ORDER BY u.created_at;
