-- =============================================
-- Schema de la base de datos - WoowTechnology
-- =============================================

-- Crear la base de datos (ejecutar manualmente si no existe)
-- CREATE DATABASE woow_db;

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Eliminar tablas en orden (FK primero) ────────────────────────────────────
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- ─── Tabla de roles ───────────────────────────────────────────────────────────
CREATE TABLE roles (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(50)   NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Comentarios de la tabla roles
COMMENT ON TABLE roles IS 'Catálogo de roles del sistema';
COMMENT ON COLUMN roles.id IS 'Identificador único UUID del rol';
COMMENT ON COLUMN roles.name IS 'Nombre único del rol (ej. admin, user)';
COMMENT ON COLUMN roles.description IS 'Descripción legible del rol';
COMMENT ON COLUMN roles.created_at IS 'Fecha de creación del rol';
COMMENT ON COLUMN roles.updated_at IS 'Fecha de última actualización del rol';

-- ─── Tabla de usuarios ────────────────────────────────────────────────────────
CREATE TABLE users (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role_id     UUID          NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- Comentarios de columnas de users
COMMENT ON TABLE users IS 'Tabla de usuarios del sistema';
COMMENT ON COLUMN users.id IS 'Identificador único UUID';
COMMENT ON COLUMN users.name IS 'Nombre completo del usuario';
COMMENT ON COLUMN users.email IS 'Correo electrónico único';
COMMENT ON COLUMN users.password IS 'Password hasheado con bcrypt';
COMMENT ON COLUMN users.role_id IS 'FK al catálogo de roles (NOT NULL)';
COMMENT ON COLUMN users.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN users.updated_at IS 'Fecha de última actualización';
