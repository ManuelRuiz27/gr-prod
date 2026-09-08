# Reporte de Validación — Error Contract & Zero-Leakage Sanitization

**Documento:** `ERROR_CONTRACT_VALIDATION.md`  
**Fecha:** 8 de septiembre de 2026  
**Fase de Roadmap:** Error Contract & Error Mapping  
**Estado:** **PASSED (100%)**

---

## 1. Resumen Ejecutivo

Se implementó y validó el contrato canónico de errores de **Plataforma GR**, compuesto por:
1. **`docs/ERROR_CONTRACT.md`**: Especificación normativa completa con envelope unificado (`{ error: { code, message, request_id, details } }`), taxonomía HTTP (400, 401, 403, 404, 409, 422, 429, 500, 503), catálogo cerrado de 35+ códigos canónicos, reglas de sanitización estricta (Zero-Leakage Policy) y política IDOR-Safe.
2. **Capa de Errores y Sanitización Backend (`backend/src/common/errors/` & `backend/src/common/filters/`)**:
   - `error-codes.ts`: Constantes canónicas de error `ErrorCode`.
   - `domain-exceptions.ts`: Jerarquía tipada de excepciones de dominio derivadas de `BaseDomainException` y `HttpException`.
   - `error-sanitizer.util.ts`: Mapeo determinista de errores de Prisma (`P2002`, `P2025`, `P2034`, `P1001`), filtrado exhaustivo contra exposición de SQL, tablas, credenciales, stack traces y rutas de servidor.
   - `all-exceptions.filter.ts`: Filtro global `@Catch()` endurecido que garantiza que todas las respuestas de error salgan empaquetadas únicamente bajo la llave `error` y con el encabezado `X-Request-Id`.
   - `idempotency.service.ts`: Validación de colisión de payload (`IDEMPOTENCY_KEY_REUSED`) cuando se reutiliza una clave existente con diferente hash de solicitud.
3. **Suite de Pruebas Unitarias e Integración**:
   - `src/common/filters/all-exceptions.filter.spec.ts`: 4 pruebas unitarias que comprueban el empaquetado canónico, el mapeo de `class-validator` y la sanitización de errores 500 y Prisma `P2002`.
   - `test/error-contract.e2e-spec.ts`: 18 pruebas integrales end-to-end sobre la aplicación NestJS completa.

---

## 2. Cobertura de Pruebas E2E de Errores (`test/error-contract.e2e-spec.ts`)

| Caso de Prueba | Código HTTP | Código Canónico Esperado | Verificación Específica | Resultado |
|---|---|---|---|:---:|
| Token ausente en endpoint protegido | 401 | `UNAUTHENTICATED` | `X-Request-Id` presente, mensaje en español, sin duplicación en raíz | **PASSED** |
| Token malformado en endpoint protegido | 401 | `UNAUTHENTICATED` | Rechazo estándar de sesión inválida | **PASSED** |
| Rol insuficiente (`GRADUATE` a `/admin/events`) | 403 | `FORBIDDEN_ROLE` | Mensaje de restricción de permisos sin exponer detalles de cuentas admin | **PASSED** |
| Endpoint inexistente / ID ajeno (IDOR-Safe) | 404 | `RESOURCE_NOT_FOUND` | Mismo status y mensaje uniforme sin revelar si el folio existe o no | **PASSED** |
| Registro Prisma no encontrado (`P2025`) | 404 | `RESOURCE_NOT_FOUND` | Sanitizado a 404 canónico sin exponer sintaxis Prisma | **PASSED** |
| Transición inválida en máquina de estados | 409 | `INVALID_STATE_TRANSITION` | `details` contiene `{ entity, fromState, toState }` sin stack traces | **PASSED** |
| Carrera por capacidad de mesa en croquis | 409 | `TABLE_CAPACITY_CHANGED` | `details` incluye `tableId`, capacidad real y conteo solicitado | **PASSED** |
| Conflicto transaccional de concurrencia | 409 | `CONCURRENT_MODIFICATION` | Mensaje amigable para reintento bajo optimismo o locks de BD | **PASSED** |
| Restricción de unicidad Prisma (`P2002`) | 409 | `CONFLICT` | Totalmente limpio: sin nombres de tabla (`accounts`), columnas o índices | **PASSED** |
| `Idempotency-Key` faltante en ruta requerida | 400 | `IDEMPOTENCY_KEY_REQUIRED` | Requerimiento de encabezado normativo para operaciones críticas | **PASSED** |
| Primera ejecución con Idempotency-Key | 201 | N/A (Éxito) | Procesa y cachea respuesta | **PASSED** |
| Repetición exacta de solicitud idempotente | 201 | N/A (Replay) | Retorna respuesta idéntica cacheada sin doble mutación | **PASSED** |
| Reúso de Idempotency-Key con payload diferente | 409 | `IDEMPOTENCY_KEY_REUSED` | Detección de alteración o colisión de payload para una misma clave | **PASSED** |
| Violación de invariante de negocio | 422 | `BUSINESS_INVARIANT_VIOLATION` | Rechazo operativo (ej. registrar pago en contrato cancelado) | **PASSED** |
| Evento no operable en estado actual | 422 | `EVENT_NOT_OPERABLE` | `details` incluye el estado inoperable del evento (`CANCELLED`) | **PASSED** |
| Límite de tasa excedido | 429 | `RATE_LIMITED` | Throttle controlado con aviso al cliente | **PASSED** |
| Error de validación DTO (`class-validator`) | 400 | `VALIDATION_ERROR` | `details.validation_errors` con mensajes limpios de campos | **PASSED** |
| Error no controlado 500 (Zero-Leakage) | 500 | `INTERNAL_ERROR` | Verificación estricta: `JSON.stringify(body)` no contiene `SELECT`, `password_hash`, nombres de tabla, paths `C:\\...`, ni stack traces | **PASSED** |

---

## 3. Verificación Integral de la Suite Backend

### 3.1 Pruebas Unitarias
```bash
npm run test -- --runInBand
```
**Resultado:**
- Test Suites: 4 passed, 4 total
- Tests: 50 passed, 50 total (100%)

### 3.2 Pruebas de Integración (E2E)
```bash
npm run test:integration -- --runInBand
```
**Resultado:**
- Test Suites: 4 passed, 4 total (`auth-foundation.e2e-spec.ts`, `error-contract.e2e-spec.ts`, `seating-concurrency.e2e-spec.ts`, `app.e2e-spec.ts`)
- Tests: 44 passed, 44 total (100%)

### 3.3 Verificación de Tipos y Calidad de Código
```bash
npm run lint       # 0 errores, 17 warnings (código existente no modificado)
npm run typecheck  # 0 errores TypeScript
npm run build      # Compilación NestJS exitosa sin advertencias
```

---

## 4. Estado en Roadmap

De acuerdo con `docs/ARCHITECTURE_DELIVERABLES.md`:
- **`ERROR_CONTRACT.md`**: **READY**
- **Siguiente Entregable:** **`EVENTS_REALTIME_CONTRACT.md`**
