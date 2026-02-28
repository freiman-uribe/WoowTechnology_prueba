# DECISIONS.md — Decisiones técnicas del Frontend

## ¿Por qué elegiste esas librerías?

### React 18 + TypeScript
Requerimiento explícito de la prueba. React 18 ofrece mejoras en renderizado concurrente y TypeScript garantiza type-safety en toda la aplicación, eliminando los errores en runtime por tipos incorrectos.

### Vite 7
Bundler moderno con HMR (Hot Module Replacement) instantáneo y build mucho más rápido que CRA (Create React App). La configuración de proxy en `vite.config.ts` evita problemas de CORS durante el desarrollo sin necesidad de modificar el backend.

### React Router DOM v7
Librería estándar del ecosistema React para SPA. Se usaron `<Outlet>` y componentes wrapper (`ProtectedRoute`, `AdminRoute`) para implementar los guards de forma declarativa y limpia, siguiendo el patrón recomendado en v6/v7.

### Axios
Elegido sobre `fetch` nativo por su soporte nativo de **interceptores**. Los interceptores permiten:
- Adjuntar el JWT en cada request automáticamente (sin repetir código)
- Detectar errores 401 globalmente y redirigir al login

### Tailwind CSS v3
Permite escribir estilos directamente en el JSX sin saltar entre archivos. Se eligió v3 (en lugar de v4) por compatibilidad garantizada con Node 21. Se combinó con CSS custom en `index.css` usando `@layer components` para clases reutilizables como `.btn-primary`, `.input-field`, etc.

### Context API (AuthContext)
Solución nativa de React sin dependencias externas. Para el alcance de esta prueba (autenticación básica), Context API es suficiente y evita añadir Redux u otras librerías de estado global que agregarían complejidad innecesaria.

---

## ¿Qué desafíos enfrentaste?

1. **Compatibilidad Node 21 con Vite 7:** Vite 7 requiere oficialmente Node 20.19+ o 22.12+. Con Node 21 se generan advertencias EBADENGINE, pero la aplicación funciona correctamente. Se documentó para transparencia.

2. **Guards de rutas declarativos:** Implementar `ProtectedRoute` y `AdminRoute` como Outlet wrappers (patrón React Router v6+) requirió separar claramente la lógica de autenticación del layout.

3. **Sincronización del estado global:** Al recargar la página, el usuario puede tener un token en `localStorage` pero no en el estado React. Se implementó un efecto inicial en `AuthContext` que valida el token con el backend (`GET /api/users/me`) para refrescar el estado.

4. **Evitar flicker de redirección:** Si el usuario tiene token válido y navega a `/login`, se redirige inmediatamente sin mostrar el formulario. Se implementó con un guard en el propio componente de Login/Register.

---

## ¿Qué mejorarías con más tiempo?

1. **Tests unitarios y de integración:** Agregar Vitest + React Testing Library para testear los hooks, los guards de rutas y los formularios.

2. **Manejo de tokens con refresh:** Implementar token refresh automático (cuando el JWT expira) usando un interceptor de Axios que llame a `POST /api/auth/refresh`.

3. **Error Boundaries:** Agregar `<ErrorBoundary>` para capturar errores de renderizado de forma elegante.

4. **Optimistic UI:** En la edición del perfil, actualizar el estado local inmediatamente antes de confirmar con el servidor, y revertir si falla.

5. **Paginación del servidor para admin:** Actualmente la búsqueda es client-side sobre la página actual. Con más tiempo, conectaría la búsqueda a un query param del endpoint para que el backend filtre.

6. **Variables de entorno tipadas:** Usar `import.meta.env` con declaraciones TypeScript en `vite-env.d.ts` para evitar strings mágicos con la URL base del API.

---

## ¿Cómo escalarías esta solución?

### Estado global
Si la app crece, migrar de Context API a **Zustand** (ligero y con soporte TypeScript excelente) o **TanStack Query** para el estado del servidor (caché, sincronización, reintentos automáticos).

### Estructura por features
Reorganizar el código en módulos por dominio:
```
src/
├── features/
│   ├── auth/        (login, register, context, service)
│   ├── profile/     (page, service, hooks)
│   └── admin/       (page, service, hooks)
└── shared/          (components, utils, types)
```