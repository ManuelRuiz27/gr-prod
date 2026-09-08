# Validación de Cierre: Authorization Matrix & Auth Foundation

**Documento:** `docs/AUTH_FOUNDATION_VALIDATION.md`  
**Fecha:** 8 de septiembre de 2026  
**Fase:** Authorization Matrix + Auth Foundation  
**Estado:** `READY` / `VERIFIED`  
**Branch / Commit base:** `main` / `4880d30`

---

## 1. Resumen Ejecutivo y Límites de Alcance

En estricto cumplimiento con la directiva de alcance del roadmap:
- Se cerró de forma exclusiva la **Authorization Matrix** y la **Auth Foundation**.
- **No se modificó ni amplió lógica de negocio** de Eventos, Contratos, Finanzas, Pagos, Croquis/Mesas, Platillos, Termos ni Reportes.
- No se crearon nuevos endpoints en la API; se cubrieron con precisión biyectiva las **129 operaciones canónicas** existentes en `API_ENDPOINT_MATRIX.md`.

---

## 2. Authorization Matrix (`docs/AUTHORIZATION_MATRIX.md`)

Se elaboró y validó formalmente el documento `docs/AUTHORIZATION_MATRIX.md` cubriendo las **129 operaciones HTTP canónicas**:
- Cada operación define:
  - **Actor**: `PUBLIC`, `GRADUATE`, `ADMIN`, `PROVIDER` o `SYSTEM`.
  - **Auth Requerida**: `None`, `Bearer JWT (Session)`, `Bearer JWT (EventAccess)` o `Bearer Webhook Secret / Signature`.
  - **Role Requerido**: `PUBLIC`, `GRADUATE`, `ADMIN` o `SYSTEM`.
  - **Scope**: `global`, `event`, `membership`, `webhook` o `internal`.
  - **Ownership Policy**: Regla explícita de pertenencia (anti-IDOR) que valida server-side la relación entre la cuenta autenticada y los recursos (`eventId`, `membershipId`, `memberId`, etc.).
  - **Policy Reference**: Cláusula de seguridad y regla de negocio aplicable.
  - **Denial Behavior**: Código HTTP exacto (`401 Unauthorized` o `403 Forbidden`) y código de error canónico en caso de rechazo (`AUTH_UNAUTHORIZED`, `ACCOUNT_DISABLED`, `FORBIDDEN_ROLE`, `NOT_MEMBER_OF_EVENT`, `OWNERSHIP_MISMATCH`).

### Validación Automatizada de la Matriz

Script de verificación: `backend/scripts/validate-authorization-matrix.ts`.
Resultado de ejecución:
```bash
$ npx ts-node --transpile-only scripts/validate-authorization-matrix.ts
🔍 Validating AUTHORIZATION_MATRIX against API_ENDPOINT_MATRIX...
📊 API_ENDPOINT_MATRIX HTTP operations: 129
📊 AUTHORIZATION_MATRIX HTTP operations: 129
✅ 100% Bijective Match: All 129 canonical operations are accurately authorized.
```

---

## 3. Arquitectura y Endurecimiento de Auth Foundation

### 3.1. Contexto Canónico del Actor (`ActorContext`)
- Archivo: `backend/src/common/auth/actor-context.interface.ts` y decorador `@CurrentActor()` en `backend/src/common/auth/current-actor.decorator.ts`.
- Estructura fuertemente tipada:
  - `actorType`: `'PUBLIC' | 'GRADUATE' | 'ADMIN' | 'PROVIDER' | 'SYSTEM'`
  - `accountId`: UUID de la cuenta
  - `email`: correo electrónico del actor
  - `fullName`: nombre completo
  - `role`: `AccountRole` (`ADMIN` | `GRADUATE`)
  - `membershipId` / `eventId`: contexto de sesión derivado del token firmado
  - `requestId`: UUID de trazabilidad de la solicitud (`x-request-id`)

### 3.2. Estrategia JWT y Guard de Roles (`RolesGuard`)
- Archivos: `backend/src/auth/jwt.strategy.ts` y `backend/src/common/guards/roles.guard.ts`.
- `JwtStrategy`:
  - Valida el token con `JWT_SECRET` server-side.
  - Consulta `authService.validateUser(payload.sub)` verificando existencia y estado de la cuenta.
  - Si la cuenta tiene `status: DISABLED`, rechaza con `401 Unauthorized` (`ACCOUNT_DISABLED`).
  - Asigna `req.actor` y `req.user` para disponibilidad en guards, interceptores y controladores.
- `RolesGuard`:
  - Extrae roles requeridos mediante metadatos `@Roles(...)`.
  - Verifica autenticación, valida que `user.status === 'ACTIVE'` y comprueba pertenencia de rol.
  - Si el rol no coincide, rechaza con `403 Forbidden` (`FORBIDDEN_ROLE`).

### 3.3. Políticas de Ownership Anti-IDOR (`OwnershipService`)
- Archivo: `backend/src/common/auth/ownership.service.ts`.
- Métodos reutilizables para garantizar que nunca se confíe en IDs suministrados por el cliente:
  - `assertEventMembership(actor, eventId)`: Verifica que un graduado pertenezca activamente al evento indicado; rechaza con `403 Forbidden` (`NOT_MEMBER_OF_EVENT` o `OWNERSHIP_MISMATCH`).
  - `assertMembershipOwnership(actor, membershipId)`: Verifica que la membresía pertenezca al `actor.accountId`.
  - `assertGroupMemberOwnership(actor, memberId)`: Verifica que el integrante pertenezca a la membresía del actor.
  - Los administradores (`ADMIN`) tienen acceso global a los recursos previo chequeo de existencia.

### 3.4. Sesiones Persistidas, Rotación y Detección de Reúso de Refresh Token
- Archivo: `backend/src/auth/auth.service.ts`.
- **Almacenamiento seguro**: La base de datos (`auth_sessions`) **nunca almacena refresh tokens en texto plano**, únicamente su hash SHA-256 (`refresh_token_hash = sha256(token)`).
- **Rotación estricta**: Al usar un refresh token válido en `POST /api/v1/auth/refresh`, la sesión previa se marca inmediatamente como revocada (`revoked_at = now()`) y se expide una nueva sesión con un nuevo par de tokens.
- **Detección automática de reúso (Compromise Detection)**:
  - Si un refresh token previamente revocado (`revoked_at !== null`) es presentado nuevamente:
  - El sistema detecta una posible suplantación o robo de tokens.
  - **Revoca inmediatamente TODAS las sesiones activas de esa cuenta** (`updateMany({ where: { account_id, revoked_at: null }, data: { revoked_at: now() } })`).
  - Rechaza con `401 Unauthorized` (`TOKEN_REUSE_DETECTED`).

### 3.5. Cierre de Sesión (`authLogout`)
- `POST /api/v1/auth/logout`:
  - Si se proporciona el refresh token en el cuerpo, revoca específicamente dicha sesión.
  - Si no se proporciona, revoca todas las sesiones activas de la cuenta autenticada.
  - Intentos subsecuentes de refresh con tokens de la sesión cerrada son rechazados.

### 3.6. Restablecimiento de Contraseña Atómico y de Un Solo Uso
- `POST /api/v1/auth/password-reset/request`: Genera un token criptográfico aleatorio de 32 bytes, almacena su hash SHA-256 en `password_reset_tokens` con vigencia de 1 hora y emite evento en el outbox sin filtrar existencia de cuenta.
- `POST /api/v1/auth/password-reset/confirm`:
  - Valida el token contra `token_hash`, `used_at: null` y `expires_at >= now()`.
  - En una **única transacción atómica**:
    1. Actualiza `password_hash` con bcrypt (12 rounds).
    2. Marca `used_at = now()`, invalidando el token para cualquier segundo intento (`INVALID_RESET_TOKEN`).
    3. Revoca **todas las sesiones activas previas** de la cuenta (`revoked_at = now()`).

### 3.7. Resolución de Código de Acceso y Prevención de Account Takeover
- `POST /api/v1/auth/event-access/resolve`:
  - Valida el código contra los hashes bcrypt en `event_access_codes` (con constraint de unicidad condicional de 1 código activo por evento).
  - Emite un JWT de alcance limitado (`scope: 'event_access'`) con expiración de 2 horas.
- `POST /api/v1/auth/graduate/register`:
  - **Exige obligatoriamente** el encabezado `Idempotency-Key` y el campo `access_token`.
  - Verifica server-side que el `access_token` tenga firma válida, scope `event_access`, pertenezca al `event_id` y que el código siga activo en la base de datos.
  - **Bloqueo estricto de Account Takeover**: Si el correo ya existe en la base de datos, rechaza con `409 Conflict` (`ACCOUNT_ALREADY_EXISTS`). Se prohíbe el auto-link silencioso o la reutilización de cuentas sin autenticación previa.

---

## 4. Cobertura de la Suite de Pruebas Automatizadas

Archivo de prueba: `backend/test/auth-foundation.e2e-spec.ts`.  
Se implementaron y ejecutaron de manera real y secuencial (`--runInBand`) las **24 aserciones** distribuidas en los 13 escenarios de seguridad:

| # | Escenario de Seguridad | Endpoint / Método | Resultado |
|---|---|---|:---:|
| 1 | Login exitoso con emisión de JWT y refresco | `POST /api/v1/auth/login` | **PASS** |
| 2 | Contraseña incorrecta rechazada (`INVALID_CREDENTIALS`) | `POST /api/v1/auth/login` | **PASS** |
| 3 | Correo inexistente rechazado (`INVALID_CREDENTIALS`) | `POST /api/v1/auth/login` | **PASS** |
| 4 | Cuenta deshabilitada no puede autenticarse (`ACCOUNT_DISABLED`) | `POST /api/v1/auth/login` | **PASS** |
| 5 | Cuenta desactivada a posteriori no puede refrescar (`ACCOUNT_DISABLED`) | `POST /api/v1/auth/refresh` | **PASS** |
| 6 | Token de cuenta desactivada rechazado en endpoints protegidos | `GET /api/v1/me/profile` | **PASS** |
| 7 | Rotación de refresh token: emite nuevo y revoca el anterior | `POST /api/v1/auth/refresh` | **PASS** |
| 8 | Detección de reúso de refresh token revocado invalida todas las sesiones | `POST /api/v1/auth/refresh` | **PASS** |
| 9 | Cierre de sesión invalida la sesión y bloquea refresh | `POST /api/v1/auth/logout` | **PASS** |
| 10 | Confirmación de reset de password de un solo uso | `POST /api/v1/auth/password-reset/confirm` | **PASS** |
| 11 | Segundo uso del mismo token de reset rechazado (`INVALID_RESET_TOKEN`) | `POST /api/v1/auth/password-reset/confirm` | **PASS** |
| 12 | Sesiones activas previas revocadas tras reset de contraseña | `POST /api/v1/auth/refresh` | **PASS** |
| 13 | Resolución exitosa de código de acceso activo emite token firmado | `POST /api/v1/auth/event-access/resolve` | **PASS** |
| 14 | Código de acceso inexistente rechazado (`INVALID_ACCESS_CODE`) | `POST /api/v1/auth/event-access/resolve` | **PASS** |
| 15 | Código de acceso expirado rechazado (`INVALID_ACCESS_CODE`) | `POST /api/v1/auth/event-access/resolve` | **PASS** |
| 16 | Account takeover bloqueado en registro con email existente (`ACCOUNT_ALREADY_EXISTS`) | `POST /api/v1/auth/graduate/register` | **PASS** |
| 17 | Registro sin token de acceso rechazado (400) | `POST /api/v1/auth/graduate/register` | **PASS** |
| 18 | Registro con token de acceso alterado/inválido rechazado (`INVALID_EVENT_ACCESS_TOKEN`) | `POST /api/v1/auth/graduate/register` | **PASS** |
| 19 | Registro exitoso con token válido crea membresía, contrato y plan | `POST /api/v1/auth/graduate/register` | **PASS** |
| 20 | Graduado intentando acceder a ruta de Admin rechazado (`FORBIDDEN_ROLE`) | `GET /api/v1/admin/events` | **PASS** |
| 21 | Administrador accede con éxito a rutas de Admin (200 OK) | `GET /api/v1/admin/events` | **PASS** |
| 22 | Graduado A accediendo a resumen de evento ajeno rechazado (`NOT_MEMBER_OF_EVENT`) | `GET /api/v1/me/events/:eventId/summary` | **PASS** |
| 23 | Graduado A modificando integrante de Graduado B rechazado (`OWNERSHIP_MISMATCH`) | `PATCH /api/v1/me/events/:id/group-members/:id` | **PASS** |
| 24 | Acceso anónimo a endpoints protegidos rechazado (401) | `GET /api/v1/me/profile`, `GET /api/v1/admin/events` | **PASS** |

---

## 5. Registro de Ejecución de Comandos de Verificación

Todos los comandos fueron ejecutados en el entorno real y finalizaron con código de salida `0`:

```bash
# 1. Validación de Esquema Prisma
npx prisma validate
# Output: The schema at prisma\schema.prisma is valid 🚀 (Exit code: 0)

# 2. Validación de Matriz de Autorización contra API Endpoint Matrix
npx ts-node --transpile-only scripts/validate-authorization-matrix.ts
# Output: ✅ 100% Bijective Match: All 129 canonical operations are accurately authorized. (Exit code: 0)

# 3. Linter (ESLint)
npm run lint
# Output: 0 errors, 17 warnings (interim files). (Exit code: 0)

# 4. Verificación de Tipos (TypeScript)
npm run typecheck
# Output: tsc --noEmit (Exit code: 0)

# 5. Pruebas Unitarias
npm run test
# Output: Test Suites: 3 passed, 3 total; Tests: 4 passed, 4 total. (Exit code: 0)

# 6. Pruebas de Integración (E2E)
npm run test:integration
# Output: Test Suites: 3 passed, 3 total; Tests: 26 passed, 26 total. (Exit code: 0)
#   PASS test/seating-concurrency.e2e-spec.ts
#   PASS test/app.e2e-spec.ts
#   PASS test/auth-foundation.e2e-spec.ts

# 7. Compilación de Producción
npm run build
# Output: nest build (Exit code: 0)
```

---

## 6. Conclusión de la Fase

La fase **Authorization Matrix + Auth Foundation** queda formalmente **CERRADA Y VERIFICADA**.
Los entregables cumplen estrictamente con los criterios de aceptación, preservan la integridad del trabajo previo y dejan la base de seguridad lista para que el siguiente entregable normativo del roadmap (`STATE_MACHINES.md`) pueda desarrollarse sin vacíos conceptuales ni riesgos de autorización.
