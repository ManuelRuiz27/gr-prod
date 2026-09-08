# Plataforma GR — Contrato Canónico de Auditoría (Audit Log Contract)

**Documento:** `AUDIT_LOG_CONTRACT.md`  
**Versión:** 1.0  
**Fecha:** 8 de septiembre de 2026  
**Estado:** READY — Canónico y Normativo para Backend de Plataforma GR  
**Fuentes de Verdad:** `SYSTEM_ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `DATA_MODEL.md`, `API_ENDPOINT_MATRIX.md`, `AUTHORIZATION_MATRIX.md`, `STATE_MACHINES.md`, `ERROR_CONTRACT.md`, `EVENTS_REALTIME_CONTRACT.md`.

---

## 1. Propósito y Principios de Diseño

El sistema de auditoría de **Plataforma GR** constituye la pista de verdad forense, financiera y operativa de todas las mutaciones realizadas sobre la plataforma. A diferencia de las bitácoras técnicas de depuración (logs de servidor) y del outbox de eventos reactivos, el `AuditLog` tiene valor probatorio de negocio.

### Principios Mandatorios:
1. **Append-Only Estricto:** Los registros de auditoría son inmutables desde su inserción. Ningún usuario, administrador ni proceso de aplicación puede modificar o eliminar filas de auditoría.
2. **Autoridad Server-Side Exclusiva:** Los registros de auditoría se originan única y exclusivamente en los servicios de aplicación del backend tras la ejecución de reglas de dominio. Ningún cliente frontend puede enviar o forzar registros de auditoría arbitrarios.
3. **Atomicidad Transaccional (No Huérfanos):** Toda mutación sensible debe persistir su registro de auditoría dentro de la misma transacción de PostgreSQL (`prisma.$transaction`). Si la operación de dominio aborta o falla, el registro de auditoría hace rollback atómicamente con ella, evitando pistas huérfanas de transacciones incompletas.
4. **Zero-Leakage de Secretos:** Prohibición absoluta de almacenar contraseñas, hashes, tokens de acceso o reseteo, códigos de acceso en claro, credenciales de proveedores externos, datos de tarjetas bancarias (PAN/CVV) o URLs firmadas con TTL en las pistas de auditoría.
5. **Auditoría Relevante y Sucinta:** `before` y `after` registran exclusivamente los campos modificados relevantes para la trazabilidad forense, evitando duplicación masiva de estados completos no alterados.
6. **No Auditoría de Lecturas Estándar:** Las consultas HTTP de solo lectura (`GET` ordinarios) **no** generan registros de auditoría para evitar contaminación y degradación de rendimiento.

---

## 2. Esquema y Modelo de Datos Canónico

El modelo físico reside en la tabla `audit_logs` de PostgreSQL administrada vía Prisma:

```prisma
model AuditLog {
  id          String         @id @default(uuid()) @db.Uuid
  event_id    String?        @db.Uuid
  actor_id    String?        @db.Uuid
  actor_type  AuditActorType // 'ACCOUNT' | 'SYSTEM'
  actor_name  String         @db.VarChar(200)
  action      String         @db.VarChar(100)
  entity_type String         @db.VarChar(64)
  entity_id   String         @db.VarChar(64)
  description String         @db.Text
  diff        Json?          // { before: ..., after: ... }
  reason      String?        @db.Text
  request_id  String?        @db.Uuid
  created_at  DateTime       @default(now()) @db.Timestamptz(3)

  event Event?   @relation(fields: [event_id], references: [id], onDelete: Cascade)
  actor Account? @relation(fields: [actor_id], references: [id])

  @@index([event_id, created_at])
  @@index([entity_type, entity_id])
  @@map("audit_logs")
}
```

### Definición Detallada de Campos:

| Campo | Tipo DB | Nullable | Descripción Normativa |
|---|---|:---:|---|
| `id` | `UUID` | No | Identificador único universal generado automáticamente. |
| `event_id` | `UUID` | Sí | Contexto del evento de graduación al que pertenece la entidad auditada (`NULL` solo para acciones de administración global como creación de administradores). |
| `actor_id` | `UUID` | Sí | `id` de la cuenta (`Account.id`) que ejecutó la acción. `NULL` cuando el actor es el sistema (`actor_type = SYSTEM`). |
| `actor_type` | `AuditActorType` | No | Clasificación del ejecutor: `ACCOUNT` (usuario autenticado) o `SYSTEM` (job interno, webhook o tarea automática). |
| `actor_name` | `VARCHAR(200)` | No | Nombre legible o identificador del actor para visualización rápida en paneles (`"Carlos Ruiz"`, `"Sistema / Webhook MP"`). |
| `action` | `VARCHAR(100)` | No | Nombre canónico de la acción auditada en notación punteada (`"event.created"`, `"payment_submission.approved"`). |
| `entity_type` | `VARCHAR(64)` | No | Nombre canónico del agregado o entidad afectada (`"Event"`, `"PaymentSubmission"`, `"Table"`). |
| `entity_id` | `VARCHAR(64)` | No | Identificador de la entidad afectada (generalmente UUID). |
| `description` | `TEXT` | No | Resumen comprensible para operadores humanos del cambio efectuado. |
| `diff` | `JSONB` | Sí | Objeto estructurado `{ before: Record<string, unknown>, after: Record<string, unknown> }` sanitizado contra secretos. |
| `reason` | `TEXT` | Sí | Justificación obligatoria en operaciones sensibles de cancelación, sobrecupo, excepciones de platillo o reembolsos. |
| `request_id` | `UUID` | Sí | Correlation ID de la petición HTTP obtenido del middleware `RequestIdMiddleware` para enlazar auditoría con telemetría de red. |
| `created_at` | `TIMESTAMPTZ(3)` | No | Marca de tiempo inmutable del momento exacto del registro (`occurred_at`). |

---

## 3. Inmutabilidad y Protección en Base de Datos

La inmutabilidad de `audit_logs` no descansa únicamente en la lógica de aplicación de NestJS, sino que está blindada a nivel de motor PostgreSQL mediante la función y trigger canónicos:

```sql
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only and cannot be updated or deleted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON "audit_logs";
CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON "audit_logs"
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_modification();
```

Cualquier intento de ejecutar:
```sql
UPDATE audit_logs SET ...;
DELETE FROM audit_logs WHERE ...;
```
es rechazado de inmediato por el motor relacional con código de error PL/pgSQL y mensaje `AuditLog is append-only and cannot be updated or deleted`.

---

## 4. Patrón Canónico de Ejecución Transaccional

Para toda operación de negocio mutante, el flujo de ejecución obligatorio es:

```text
Actor (HTTP Request)
  │
  ▼
Domain Service / Use Case
  │
  ├─► 1. Validación de Precondiciones / Guards de Dominio
  │
  ├─► 2. Iniciar Transacción PostgreSQL (tx)
  │     │
  │     ├─► 3. Ejecutar Mutación de Dominio en DB (INSERT / UPDATE)
  │     │
  │     ├─► 4. Registrar AuditLog transaccional:
  │     │      await auditService.logTransactional(tx, { ... })
  │     │
  │     ├─► 5. Persistir OutboxEvent transaccional (si aplica):
  │     │      await outboxService.publishTransactional(tx, ...)
  │     │
  │     └─► 6. COMMIT Transacción ACID
  │
  └─► Retornar DTO de Respuesta al Controlador
```

### Reglas del Patrón:
1. **Nunca desde Controllers:** Los controladores solo orquestan HTTP y autorización. La auditoría se invoca exclusivamente dentro de los servicios de dominio donde ocurren las mutaciones.
2. **Propagación del TransactionClient:** El método `auditService.logTransactional(tx, params)` recibe `tx` y garantiza que la escritura ocurra dentro del mismo bloque de transacción. Si ocurre un fallo en cualquier paso previo al commit, PostgreSQL revierte tanto la mutación como el registro de auditoría.

---

## 5. Política de Sanitización Zero-Leakage

La función interna `sanitizeAuditData` de `AuditService` inspecciona y sanea de forma recursiva cualquier objeto antes de persistirlo en el campo `diff` (`before` y `after`).

### Campos Prohibidos y Redactados (`"[REDACTED]"`):
- Credenciales: `password`, `password_hash`, `salt`, `pin`.
- Tokens y Firmas: `token`, `access_token`, `refresh_token`, `reset_token`, `jwt`, `signature`, `x-signature`.
- Códigos de Acceso: `code`, `access_code`, `code_hash`, `temp_code`.
- Secretos de Integración: `secret`, `webhook_secret`, `api_key`, `client_secret`, `private_key`.
- Información Bancaria / Financiera: `pan`, `cvv`, `card_number`, `card_exp`, `security_code`.
- URLs efímeras con firma: `signed_url`, `download_url` con query parameters de firma HMAC.

---

## 6. Catálogo Canónico de Operaciones Auditadas

Se instrumentan de forma obligatoria las siguientes 14 familias de operaciones sensibles:

| # | Operación Sensible | Servicio Responsable | Acción (`action`) | Entidad (`entity_type`) | Requisitos Específicos |
|---:|---|---|---|---|---|
| 1 | **Event Create** | `AdminEventsService` | `event.created` | `Event` | Transaccional en creación inicial del evento y paquetes base. |
| 2 | **Event Update** | `AdminEventsService` | `event.updated` | `Event` | Diff con campos modificados (`name`, `capacity`, `venue`, etc.). |
| 3 | **Event Transition** | `AdminEventsService` | `event.transitioned` | `Event` | Diff `{ before: status_old, after: status_new }` + motivo (`reason`). |
| 4 | **Contract Acceptance** | `MeService` | `contract.accepted` | `GraduateContract` | Transaccional; registra timestamp e IP hash; sin credenciales. |
| 5 | **Membership Cancellation** | `AdminGraduatesService` | `membership.cancelled` | `GraduateMembership` | Transaccional; motivo obligatorio; monto de reembolso asociado. |
| 6 | **Place Reduction** | `AdminGraduatesService` | `membership.places_reduced` | `GraduateMembership` | Motivo obligatorio; registros de miembros excluidos. |
| 7 | **Manual Payment** | `AdminFinanceService` | `payment.manual_registered` | `PaymentTransaction` | Transaccional; monto, fuente, folio/referencia y cobrador. |
| 8 | **Payment Submission Approve** | `AdminFinanceService` | `payment_submission.approved` | `PaymentSubmission` | Transaccional junto a la creación de `PaymentTransaction` y allocations. |
| 9 | **Payment Submission Reject** | `AdminFinanceService` | `payment_submission.rejected` | `PaymentSubmission` | Motivo obligatorio de rechazo (`rejection_reason`). |
| 10 | **Adjustment** | `AdminFinanceService` | `payment_plan.adjusted` | `Adjustment` | Transaccional; tipo de ajuste, monto y motivo mandatorio. |
| 11 | **Refund** | `AdminFinanceService` | `payment_plan.refunded` | `Refund` | Transaccional; monto, motivo y método de reembolso. |
| 12 | **Table Layout (Create/Update/Block/Unblock/Delete)** | `AdminSeatingService` | `table.created`, `table.updated`, `table.blocked`, `table.unblocked`, `table.deleted` | `Table` | Bloqueos registran motivo; eliminación audita solo mesas sin asignación. |
| 13 | **Table Assignment** | `AdminSeatingService` / `MeService` | `table_assignment.changed` | `TableAssignment` | Reasignación de asientos; registra mesa origen y mesa destino. |
| 14 | **Meal Override** | `AdminGraduatesService` | `meal_selection.overridden` | `GroupMember` | Excepción administrativa post-deadline; motivo obligatorio. |
| 15 | **Thermo Production / Delivery** | `AdminGraduatesService` | `thermo.production_started`, `thermo.delivered` | `ThermoRequest` | Cambio de estado y datos de entrega / evidencia. |
| 16 | **EventAccessCode Rotation** | `AdminEventsService` | `access_code.rotated` | `EventAccessCode` | Transaccional; jamás registra el código en claro en el log. |
| 17 | **Admin Account Create / Disable** | `AuthService` | `account.created`, `account.disabled` | `Account` | Rol y correo del usuario; contraseñas estrictamente redactadas. |
| 18 | **Reconciliation Resolution** | `AdminFinanceService` | `reconciliation_case.resolved` | `ReconciliationCase` | Nota de resolución obligatoria y cuenta del operador resolutor. |

---

## 7. Autorización y Política de Consulta

### Restricciones de Acceso:
1. **Exclusividad para Administradores (`ADMIN`):**
   - El endpoint canónico de consulta `GET /api/v1/admin/events/:eventId/audit-logs` exige rol `ADMIN` validado por `RolesGuard`.
   - Cualquier intento de acceso por parte de un usuario con rol `GRADUATE` es rechazado con código HTTP `403 Forbidden` (`FORBIDDEN_RESOURCE`).
   - Peticiones anónimas o sin cabecera `Authorization: Bearer <jwt>` son rechazadas con HTTP `401 Unauthorized` (`UNAUTHENTICATED`).
2. **Filtrado por Evento:**
   - La consulta de auditoría se acota por `event_id` para garantizar compartimentalización entre eventos independientes.

---

## 8. Políticas de Retención y Rendimiento

1. **Índices de Base de Datos:**
   - `@@index([event_id, created_at])`: Optimiza la paginación y ordenamiento cronológico por evento.
   - `@@index([entity_type, entity_id])`: Permite la reconstrucción inmediata del historial forense de cualquier agregada o entidad específica.
2. **Retención Mínima:**
   - Todos los registros de auditoría se conservan durante un mínimo de 5 años conforme a las directrices de trazabilidad fiscal y contractual de Plataforma GR.
3. **Paginación Mandatoria:**
   - Toda consulta de auditoría aplica paginación server-side (por defecto 100 registros por página ordenados descendientemente por `created_at`).
