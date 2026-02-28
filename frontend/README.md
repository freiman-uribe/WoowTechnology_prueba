# WoowApp — Frontend

Frontend para la prueba técnica de **WoowTechnology**. Aplicación React con autenticación JWT, gestión de perfil y panel de administración.

---

## 📋 Descripción

SPA (Single Page Application) construida con React 18 + TypeScript + Vite que consume la API REST del backend (`http://localhost:3000`). Incluye:

- **Login** con validaciones y manejo de errores
- **Registro** de nuevos usuarios
- **Perfil** con modo edición del nombre
- **Panel de administración** (solo rol `admin`) con listado de usuarios y búsqueda
- **Guards de rutas** para proteger páginas privadas y bloquear acceso a admins vs usuarios comunes

---

## 🔧 Prerrequisitos

- **Node.js** v21 (o superior compatible)
- **npm** v10+
- Backend corriendo en `http://localhost:3000`

---

## 📦 Instalación

```bash
# 1. Entrar a la carpeta del frontend
cd prueba/frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
```

Edita `.env` con la URL de tu backend:

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## ▶️ Ejecutar el proyecto

```bash
# Modo desarrollo (con hot-reload)
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador.

> **Nota:** el backend debe estar activo en la URL definida en `VITE_API_BASE_URL`.

---

## 🏗️ Build para producción

```bash
npm run build
npm run preview
```

---

## 🧪 Tests

```bash
# Modo watch (interactivo)
npm run test

# Ejecución única
npm run test:run

# Reporte de cobertura
npm run coverage
```

---

## 🔑 Credenciales de prueba

Para usar la aplicación necesitas tener el backend corriendo y haber ejecutado el seed de la base de datos.

| Rol   | Email                 | Contraseña |
|-------|-----------------------|------------|
| Admin | admin@woow.com        | Admin1234! |
| User  | maria@example.com     | User1234!  |
| User  | juan@example.com      | User1234!  |

> Registra nuevos usuarios desde la pantalla `/register`.

---

## 🗂️ Estructura del proyecto

```
src/
├── components/             # Componentes reutilizables
│   ├── AdminRoute.tsx      # Guard: solo admins
│   ├── AuthLayout.tsx      # Layout compartido para login/registro
│   ├── LoadingSpinner.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx  # Guard: usuarios autenticados
├── contexts/
│   └── AuthContext.tsx     # Estado global de autenticación
├── hooks/
│   └── useAuth.ts          # Hook para consumir AuthContext
├── pages/
│   ├── AdminPage.tsx       # Dashboard admin (listado + búsqueda + paginación)
│   ├── LoginPage.tsx
│   ├── NotFoundPage.tsx    # Página 404
│   ├── ProfilePage.tsx     # Perfil con edición de nombre
│   └── RegisterPage.tsx
├── services/
│   └── api.ts              # Axios + interceptores JWT + todos los servicios
├── test/                   # Tests unitarios y de integración (Vitest)
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── setup.ts
├── types/
│   └── index.ts            # Interfaces TypeScript
├── App.tsx                 # Configuración de rutas
└── main.tsx                # Entry point
```

---

## 📡 Endpoints consumidos

| Método | Ruta                  | Descripción                           | Auth     |
|--------|-----------------------|---------------------------------------|----------|
| POST   | /api/auth/login       | Login (devuelve JWT + user)           | —        |
| POST   | /api/auth/register    | Registro de usuario                   | —        |
| GET    | /api/users/me         | Obtener perfil propio                 | JWT      |
| PUT    | /api/users/me         | Actualizar nombre / email / password  | JWT      |
| GET    | /api/users            | Listar usuarios                       | Admin    |
| PUT    | /api/users/:id        | Actualizar usuario por ID             | Admin    |
| GET    | /api/roles            | Listar roles                          | Admin    |
| POST   | /api/roles            | Crear rol                             | Admin    |
| PUT    | /api/roles/:id        | Actualizar rol                        | Admin    |
| DELETE | /api/roles/:id        | Eliminar rol                          | Admin    |

---

## 🛠️ Tecnologías

- React 19 + TypeScript (modo estricto)
- Vite 7
- React Router DOM v7
- Axios
- Tailwind CSS v3
- Vitest + Testing Library (tests unitarios e integración)