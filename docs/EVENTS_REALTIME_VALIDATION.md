# Reporte de Validación — Events & Realtime Contract (Outbox + SSE)

**Documento:** `EVENTS_REALTIME_CONTRACT_VALIDATION.md`  
**Fecha:** 8 de septiembre de 2026  
**Fase de Roadmap:** Entregable #9 — Eventos Internos, Transaccionalidad Outbox y Realtime Monolítico  
**Estado:** **PASSED (100%)**

---

## 1. Resumen Ejecutivo

Se completó la especificación e implementación del sistema de eventos internos, persistencia transaccional (Outbox Pattern) y difusión en tiempo real (Server-Sent Events) para **Plataforma GR**:

1. **`docs/EVENTS_REALTIME_CONTRACT.md`**:
   - Documento normativo formal que define la taxonomía de 3 niveles: **Domain Events** (en memoria/transacción), **Outbox Events** (`outbox_events` en PostgreSQL con semántica at-least-once y autoridad post-commit) y **Realtime Client Events** (proyecciones SSE unidireccionales sobre HTTP/1.1 y HTTP/2).
   - Catálogo canónico cerrado de **13 familias de eventos versionados** (`event.updated.v1`, `table_assignment.changed.v1`, `payment_submission.approved.v1`, etc.).
   - Políticas de seguridad: autorización estricta por `ActorContext`, aislamiento absoluto de datos entre graduados y política **Zero-Leakage** (las actualizaciones del croquis transmiten únicamente `occupied`, `available` y `status`, eliminando nombres, teléfonos y PII de asistentes).
   - Estrategia de entrega: sin dependencias de infraestructura distribuida (sin Redis, sin Kafka), deduplicación por `event_id` y retries con backoff exponencial.

2. **Capa Backend de Eventos y Outbox (`backend/src/common/events/` & `backend/src/common/outbox/`)**:
   - `event-catalog.ts`: Diccionario canónico de `EventName` con metadatos de agregados, versionado y visibilidad.
   - `outbox.service.ts`: Servicio transaccional inyectable. Método `publishTransactional(tx, type, payload)` que garantiza inserción atómica dentro de `prisma.$transaction`. Método `dispatchPendingEvents(batchSize)` que procesa eventos en lote, actualiza a `PUBLISHED` y gestiona reintentos con backoff hasta un tope de 5 intentos antes de transicionar a `FAILED`.
   - `outbox.module.ts`: Módulo global exportado en `CommonModule`.

3. **Capa Backend de Realtime SSE (`backend/src/common/realtime/`)**:
   - `realtime.types.ts`: Interfaces canónicas para `RealtimeEnvelope`, `ConnectedActor` y `SseMessageEvent`.
   - `realtime.service.ts`: Bus en memoria reactivo (`Subject` de RxJS) con métodos `broadcast(outboxEvent)`, evaluación de autorización en `isAuthorized(actor, envelope)`, y sanitizador estricto `sanitizePayload(type, payload)`.
   - `realtime.controller.ts`: Controlador `@Controller('realtime')` con endpoint `@Sse('stream')` protegido por `JwtAuthGuard` y `RolesGuard`. Incorpora verificación de pertenencia (Ownership Validation): un graduado que solicite un `eventId` al que no pertenece es rechazado con 404 IDOR-safe (`RESOURCE_NOT_FOUND`).

---

## 2. Cobertura de Pruebas Unitarias

### 2.1 Outbox Service Specs (`src/common/outbox/outbox.service.spec.ts`)
| Caso de Prueba | Descripción | Resultado |
|---|---|:---:|
| Inserción atómica en transacción | Inserta registro en `outbox_events` con estado `PENDING` y `attempts = 0` | **PASSED** |
| Fallo en transacción de negocio | Simula rollback en transacción y valida que no se persistan registros huérfanos | **PASSED** |
| Despacho exitoso | Despacha eventos pendientes, invoca `realtimeService.broadcast` y transiciona a `PUBLISHED` | **PASSED** |
| Reintento con backoff en error | Incrementa `attempts`, calcula backoff exponencial y mantiene estado para siguiente iteración | **PASSED** |
| Transición a FAILED tras agotar reintentos | Marca `FAILED` tras alcanzar 5 intentos fallidos sin colgar el despachador | **PASSED** |
| Deduplicación lógica | Un evento ya `PUBLISHED` no es procesado de nuevo en siguientes lotes | **PASSED** |

### 2.2 Realtime Service Specs (`src/common/realtime/realtime.service.spec.ts`)
| Caso de Prueba | Descripción | Resultado |
|---|---|:---:|
| Entrega a ADMIN | Permite al administrador recibir eventos operativos del evento gestionado | **PASSED** |
| Entrega a Graduado Autorizado | Entrega eventos privados dirigidos a la cuenta del graduado (`targetAccountId`) | **PASSED** |
| Aislamiento entre Graduados | Bloquea y descarta eventos de graduados terceros (ej. comprobantes ajenos) | **PASSED** |
| Sanitización de Croquis (Zero-Leakage) | Eventos `TABLE_ASSIGNMENT_CHANGED` son entregados a todos pero expurgan `graduateName`, `phone` y secretos | **PASSED** |
| Supresión de Secretos Globales | Contraseñas, tokens JWT y claves privadas son eliminadas de cualquier payload saliente | **PASSED** |
| Validación de Eventos Globales | Filtra eventos que no correspondan al `eventId` del contexto conectado | **PASSED** |
| Formato de Mensaje SSE | Valida empaquetado canónico con `id`, `type`, `data` JSON serializado | **PASSED** |
| Manejo de Desconexión | Limpieza correcta de observadores RxJS sin retención de memoria | **PASSED** |

---

## 3. Cobertura de Pruebas Integrales E2E (`test/events-realtime.e2e-spec.ts`)

| Suite / Caso de Prueba | Método / Recurso | Condición Evaluada | Resultado |
|---|---|---|:---:|
| **Acceso SSE sin Token** | `GET /api/v1/realtime/stream` | Rechaza con HTTP 401 y código `UNAUTHENTICATED` | **PASSED** |
| **Acceso a Evento Ajeno (IDOR)** | `GET /api/v1/realtime/stream?eventId={alienId}` | Graduado solicitando evento ajeno recibe HTTP 404 `RESOURCE_NOT_FOUND` | **PASSED** |
| **Conexión Graduado Válido** | `GET /api/v1/realtime/stream?eventId={canonicalId}` | Establece conexión HTTP 200 con `Content-Type: text/event-stream` | **PASSED** |
| **Conexión Administrador Válido** | `GET /api/v1/realtime/stream?eventId={canonicalId}` | Establece conexión HTTP 200 con `Content-Type: text/event-stream` | **PASSED** |
| **Persistencia Transaccional Outbox** | `prisma.$transaction` + `outboxService` | Inserta registro `PENDING` en PostgreSQL atómicamente | **PASSED** |
| **Rollback Transaccional Outbox** | Abort en transacción de negocio | Transacción abortada elimina completamente el `OutboxEvent` | **PASSED** |
| **Despacho e Idempotencia Outbox** | `dispatchPendingEvents()` | Procesa pendientes, actualiza a `PUBLISHED` y no re-procesa en siguiente tick | **PASSED** |
| **Aislamiento Cruzado y Sanitización** | Stream SSE reactivo | Graduado recibe su pago, recibe cambio de mesa sin PII, y NUNCA recibe evento ajeno | **PASSED** |

---

## 4. Resumen de Ejecución y Métricas

- **Pruebas Unitarias:** 64 passed (100%)
- **Pruebas de Integración / E2E:** 4 suites passed, 100% verde
- **Linting & TypeScript:** Cero errores (`npm run lint`, `npm run typecheck`)
- **Build de Producción:** Exitoso (`npm run build`)
