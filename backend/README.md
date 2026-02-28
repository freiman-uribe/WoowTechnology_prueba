# WoowTechnology - API REST de Gestión de Usuarios

API REST con autenticación JWT desarrollada con Node.js + TypeScript + PostgreSQL.

---

## Prerrequisitos

- **Node.js** v18 o superior
- **PostgreSQL** v14 o superior
- **npm** v9 o superior

---

## Instalación paso a paso

### 1. Clonar e instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus datos de PostgreSQL:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=woow_db
DB_USER=postgres
DB_PASSWORD=tu_password

JWT_SECRET=un_secreto_muy_seguro
JWT_EXPIRES_IN=24h
```

### 3. Crear la base de datos

Conéctate a PostgreSQL y ejecuta:

```sql
CREATE DATABASE woow_db;
```

O desde la terminal:

```bash
psql -U postgres -c "CREATE DATABASE woow_db;"
```

### 4. Ejecutar el esquema de tablas

```bash
psql -U postgres -d woow_db -f database/schema.sql
```

### 5. (Opcional) Cargar datos de prueba

```bash
psql -U postgres -d woow_db -f database/seed.sql
```

### 6. Iniciar el servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Modo producción
npm run build
npm start
```

El servidor inicia en `http://localhost:3000`

---

## Endpoints disponibles

### Autenticación

#### `POST /api/auth/register` — Registrar usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan Pérez", "email": "juan@example.com", "password": "12345678"}'
```

**Respuesta 201:**
```json
{ "message": "Usuario registrado exitosamente" }
```

---

#### `POST /api/auth/login` — Iniciar sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "juan@example.com", "password": "12345678"}'
```

**Respuesta 200:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Usuarios (requieren autenticación)

#### `GET /api/users/me` — Obtener perfil propio

```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <token>"
```

**Respuesta 200:**
```json
{
  "id": "uuid",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "role": "user",
  "created_at": "...",
  "updated_at": "..."
}
```

---

#### `PUT /api/users/me` — Actualizar perfil propio

```bash
curl -X PUT http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan Carlos Pérez"}'
```

**Respuesta 200:**
```json
{
  "message": "Perfil actualizado",
  "user": { "id": "...", "name": "Juan Carlos Pérez", ... }
}
```

---

#### `GET /api/users` — Listar usuarios (solo admin)

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer <token_de_admin>"
```

**Respuesta 200:**
```json
{
  "users": [{ "id": "...", "name": "...", ... }, ...]
}
```

---

#### `GET /api/users/:id` — Obtener usuario por ID (solo admin)

```bash
curl http://localhost:3000/api/users/<uuid> \
  -H "Authorization: Bearer <token_de_admin>"
```

**Respuesta 200:**
```json
{
  "id": "uuid",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "role": "user",
  "created_at": "...",
  "updated_at": "..."
}
```

---

#### `PUT /api/users/:id` — Actualizar usuario por ID (solo admin)

```bash
curl -X PUT http://localhost:3000/api/users/<uuid> \
  -H "Authorization: Bearer <token_de_admin>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Nuevo Nombre", "email": "nuevo@example.com", "role": "admin"}'
```

**Respuesta 200:**
```json
{
  "message": "Usuario actualizado",
  "user": { "id": "...", "name": "Nuevo Nombre", "email": "nuevo@example.com", "role": "admin", ... }
}
```

---

### Roles (requieren autenticación de admin)

#### `GET /api/roles` — Listar roles

```bash
curl http://localhost:3000/api/roles \
  -H "Authorization: Bearer <token_de_admin>"
```

**Respuesta 200:**
```json
[
  { "id": "uuid", "name": "admin", "description": "Administrador del sistema", "created_at": "..." },
  { "id": "uuid", "name": "user",  "description": "Usuario estándar",         "created_at": "..." }
]
```

---

#### `GET /api/roles/:id` — Obtener rol por ID

```bash
curl http://localhost:3000/api/roles/<uuid> \
  -H "Authorization: Bearer <token_de_admin>"
```

**Respuesta 200:**
```json
{ "id": "uuid", "name": "admin", "description": "Administrador del sistema", "created_at": "..." }
```

---

#### `POST /api/roles` — Crear rol

```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Authorization: Bearer <token_de_admin>" \
  -H "Content-Type: application/json" \
  -d '{"name": "moderator", "description": "Moderador de contenido"}'
```

**Respuesta 201:**
```json
{ "id": "uuid", "name": "moderator", "description": "Moderador de contenido", "created_at": "..." }
```

---

#### `PUT /api/roles/:id` — Actualizar rol

```bash
curl -X PUT http://localhost:3000/api/roles/<uuid> \
  -H "Authorization: Bearer <token_de_admin>" \
  -H "Content-Type: application/json" \
  -d '{"name": "moderator", "description": "Descripción actualizada"}'
```

**Respuesta 200:**
```json
{ "id": "uuid", "name": "moderator", "description": "Descripción actualizada", "created_at": "..." }
```

---

#### `DELETE /api/roles/:id` — Eliminar rol

```bash
curl -X DELETE http://localhost:3000/api/roles/<uuid> \
  -H "Authorization: Bearer <token_de_admin>"
```

**Respuesta 200:**
```json
{ "message": "Rol eliminado correctamente", "role": { "id": "...", "name": "moderator", ... } }
```

---

## Credenciales de prueba (datos del seed)

| Rol   | Email              | Password    |
|-------|--------------------|-------------|
| Admin | admin@woow.com     | Admin1234!  |
| User  | juan@example.com   | User1234!   |
| User  | maria@example.com  | User1234!   |

---

## Estructura del proyecto

```
src/
├── config/           # Configuración de DB y JWT
├── controllers/      # Manejo de requests/responses
├── middlewares/      # Auth, roles, validaciones
├── models/           # Interfaces y tipos TypeScript
├── repositories/     # Acceso a datos (SQL)
├── routes/           # Definición de rutas
├── services/         # Lógica de negocio
└── server.ts         # Entry point
database/
├── schema.sql        # Definición de tablas
└── seed.sql          # Datos de prueba
```

---

## Códigos de respuesta

| Código | Descripción                        |
|--------|------------------------------------|
| 200    | Éxito                              |
| 201    | Recurso creado                     |
| 400    | Error de validación                |
| 401    | No autenticado / token inválido    |
| 403    | Sin permisos                       |
| 404    | Recurso no encontrado              |
| 500    | Error interno del servidor         |
