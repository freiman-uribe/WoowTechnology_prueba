# Documento de Decisiones Técnicas

## ¿Por qué elegiste esas librerías?

### Express.js
Framework maduro, minimalista y con una comunidad enorme.
Permite construir APIs REST sin agregar complejidad innecesaria,
siendo perfecto para una prueba técnica donde la claridad es clave.

### TypeScript
Permite detectar errores en tiempo de compilación, mejora el
autocompletado y hace el código más mantenible. El uso de
interfaces (`User`, `JwtPayload`, `AuthRequest`) hace explícitos
los contratos entre capas.

### bcryptjs
Alternativa pura en JavaScript de bcrypt. Evita problemas de
compilación de módulos nativos en Windows. Los passwords se
hashean con 12 rondas de salt, lo que ofrece un buen balance
entre seguridad y rendimiento (~250ms por hash).

### jsonwebtoken
Librería estándar de la industria para firmar y verificar JWTs.
El payload incluye `userId`, `email` y `role` para tener la
información necesaria sin consultas adicionales a la DB en cada
request autenticado.

### joi
Ofrece validaciones declarativas y mensajes de error claros en
español. La separación entre el esquema de validación y el
middleware permite reutilizar esquemas fácilmente.

### pg (node-postgres)
Driver nativo de PostgreSQL para Node.js. Se usan prepared
statements (queries parametrizados con `$1`, `$2`, etc.) en
todos los accesos a datos para prevenir SQL injection.

---

## ¿Qué desafíos enfrentaste?

1. **Extensión del tipo Request de Express**: TypeScript no permite
   añadir propiedades al tipo `Request` directamente. Se resolvió
   creando la interfaz `AuthRequest` que extiende `Request` e
   incluye `user?: JwtPayload`.

2. **UPDATE dinámico sin ORM**: Construir una query `UPDATE`
   dinámica (solo los campos enviados) con prepared statements
   requirió construir los campos y valores programáticamente,
   manteniendo el índice de los parámetros (`$1`, `$2`...).

3. **No exponer passwords**: La destructuración `{ password: _password, ...userPublic }`
   garantiza que el campo `password` nunca llegue a las respuestas,
   sin depender de lógica manual.

---

## ¿Qué mejorarías con más tiempo?

1. **Tests unitarios e integración**: Con Jest + Supertest cubriría
   todos los endpoints y escenarios de error.

2. **Refresh tokens**: Implementar un mecanismo de refresh token
   para no forzar re-login al expirar el access token.

3. **Rate limiting**: Añadir `express-rate-limit` en los endpoints
   de autenticación para prevenir ataques de fuerza bruta.

4. **Paginación**: El endpoint `GET /api/users` debería soportar
   paginación (`page`, `limit`) cuando hay miles de usuarios.

5. **Logging estructurado**: Reemplazar los `console.error` con
   una librería como `pino` o `winston` para logs en formato JSON
   fáciles de indexar en herramientas como Datadog o ELK.

6. **Docker Compose**: Un `docker-compose.yml` que levante
   PostgreSQL y la API juntos simplificaría el onboarding.

7. **Validación de emails**: Verificar que el email exista de verdad
   enviando un correo de confirmación antes de activar la cuenta.

8. **Documentación con Swagger**: Integrar `swagger-ui-express` y
   `swagger-jsdoc` para generar documentación interactiva en
   `/api/docs`. Permitiría probar los endpoints directamente desde
   el navegador y serviría como contrato vivo entre el backend y
   los equipos consumidores de la API.

---

## ¿Cómo escalarías esta solución?

### Horizontal
- Desplegar múltiples instancias de la API detrás de un load
  balancer (NGINX o ALB de AWS). Los JWTs son stateless, por lo
  que no requieren sesión compartida entre instancias.

### Base de datos
- **Read replicas** de PostgreSQL para las queries de lectura.
- **Connection pooling** con PgBouncer para manejar miles de
  conexiones concurrentes sin saturar PostgreSQL.
- Migrar a un gestor de migraciones (Flyway / `db-migrate`)
  en lugar de scripts SQL manuales.

### Seguridad en producción
- Rotar el `JWT_SECRET` regularmente y soportar múltiples
  secrets activos simultáneamente (JWKS).
- Mover secrets a un vault (AWS Secrets Manager, HashiCorp Vault).

### Arquitectura
- Si el sistema crece mucho, separar en microservicios:
  `auth-service`, `user-service`, con comunicación via gRPC o
  eventos (Kafka/RabbitMQ).
- Añadir un API Gateway (Kong, AWS API GW) para centralizar
  autenticación, rate limiting y observabilidad.
