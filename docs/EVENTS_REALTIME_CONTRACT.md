# Contrato Normativo de Eventos y Tiempo Real (Events & Realtime Contract)

**Documento:** `EVENTS_REALTIME_CONTRACT.md`  
**Versión:** 1.0  
**Fecha:** 8 de septiembre de 2026  
**Fase de Roadmap:** Entregable #9 — Eventos Internos, Transaccionalidad Outbox y Realtime Monolítico  
**Fuentes Normativas:** `SYSTEM_ARCHITECTURE.md` (§21), `DOMAIN_MODEL.md`, `DATA_MODEL.md` (§55), `API_ENDPOINT_MATRIX.md`, `AUTHORIZATION_MATRIX.md`, `STATE_MACHINES.md`, `ERROR_CONTRACT.md`.

---

## 1. Declaración de Principios y Taxonomía de Tres Niveles

En **Plataforma GR**, la reactividad y la sincronización entre componentes desacoplados se rige por una separación estricta en tres niveles de abstracción. Mezclar la ejecución de una regla de negocio con la difusión a la interfaz de usuario corrompe la consistencia del sistema y viola el principio de autoridad de base de datos.

```text
+-----------------------------------------------------------------------------------+
| 1. DOMAIN EVENT (In-Memory / In-Transaction)                                      |
|    - Emitido dentro del límite transaccional de un Aggregate Root.                |
|    - Síncrono, rico en objetos de dominio. Nunca sale del proceso del hilo.       |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ (Mapeo persistente atómico)
+-----------------------------------------------------------------------------------+
| 2. OUTBOX EVENT (PostgreSQL: outbox_events)                                       |
|    - Registro inmutable persistido en el mismo COMMIT que las mutaciones.         |
|    - Semántica At-Least-Once, id único (UUID), idempotencia y retries ordenados.  |
|    - Autoridad post-transacción. Despachador asíncrono con control de fallos.     |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ (Filtrado de Autorización y PII)
+-----------------------------------------------------------------------------------+
| 3. REALTIME CLIENT EVENT (Server-Sent Events / SSE)                               |
|    - Proyección pública / semi-pública serializada hacia navegadores conectados.  |
|    - Restringido por ActorContext + Ownership (ADMIN vs GRADUATE).                |
|    - Cero PII ajena, solo IDs y contadores seguros (ej. ocupación de mesas).      |
+-----------------------------------------------------------------------------------+
```

### 1.1 Regla de Oro: Consistencia Transaccional Outbox
**NUNCA** se emite un evento directamente a sockets o clientes HTTP antes o inmediatamente después de un comando sin haber confirmado atómicamente la transacción en base de datos.
1. La mutación del dominio y la creación de `OutboxEvent` se ejecutan dentro del mismo bloque `prisma.$transaction`.
2. Si la transacción aborta (rollback), el evento de outbox **desaparece**.
3. Una vez confirmado el `COMMIT`, el `OutboxDispatcher` reclama eventos pendientes y los distribuye.

---

## 2. Arquitectura de Transporte Realtime (Monolito V1)

Conforme a la decisión ratificada en `SYSTEM_ARCHITECTURE.md` (§21):
- **Transporte Oficial V1:** **Server-Sent Events (SSE)** mediante `@Sse('api/v1/realtime/stream')`.
- **Justificación:** SSE es nativo en el stack HTTP (soporta HTTP/1.1 y HTTP/2), es unidireccional (Server -> Client), se integra directamente con los guards de autenticación JWT y roles de NestJS, y no requiere servicios adicionales de infraestructura (sin Redis, sin Kafka, sin brokers distribuidos).
- **Mutaciones:** Todas las modificaciones de estado se realizan exclusivamente a través de los endpoints REST idempotentes existentes. El canal realtime es puramente de **notificación de cambios y sincronización de proyecciones**.
- **Reconexión y Tolerancia a Fallos:** Los clientes SSE utilizan el protocolo nativo `EventSource` con soporte de `Last-Event-ID`. En caso de desconexión temporal o latencia, el cliente recurre al polling REST existente (3–5s) como fallback de autoridad.

---

## 3. Matriz de Autorización y Reglas de Exposición

### 3.1 Política de Privacidad de Audiencia
1. **Audiencia ADMIN:**
   - Puede suscribirse a eventos operativos de eventos que gestiona.
   - Recibe alertas de jobs, inconsistencias de conciliación, comprobantes de pago entrantes y cambios de configuración.
2. **Audiencia GRADUATE:**
   - **Estrictamente personal:** Un graduado únicamente recibe eventos dirigidos a su propia membresía o cuenta (`target_account_id === actor.id`).
   - **Excepción de Croquis (Ocupación Colectiva Segura):** Para el croquis interactivo, los graduados reciben eventos de mesas (`table_assignment.changed.v1`, `table.updated.v1`), pero el payload **NUNCA** contiene PII de terceros (sin nombres de otros graduados, sin teléfonos, sin referencias de pago). Solo transporta: `tableId`, `occupied`, `available`, y `status`.

### 3.2 Prohibición de Fuga de Información Sensible (Zero-Leakage Payload)
Bajo ninguna circunstancia un payload de Outbox o Realtime transmitirá:
- Contraseñas o hashes bcrypt.
- Tokens JWT, claves de reseteo o secretos de pasarela (Mercado Pago / OpenPay).
- Códigos de acceso a eventos (`access_code`).
- Montos de adeudo, estados financieros o evidencia de pago de graduados distintos al receptor.
- Trazas de error técnico o sintaxis de base de datos.

---

## 4. Catálogo Canónico de Eventos Versionados

El sistema implementa 13 familias de eventos mínimos, estructurados bajo el estándar `<aggregate>.<action>.v<version>`.

### 4.1 Evento: `event.updated.v1`
- **Agregado:** `Event`
- **Productor / Caso de Uso:** `adminUpdateEvent`, `adminTransitionEventStatus`.
- **Propósito:** Notificar cambios de estado del evento (`OPEN`, `CLOSED`, `FINALIZED`) o cambios en deadlines operativos.
- **Audiencia:** `ALL_ATTENDEES` (Admin y Graduados del evento).
- **Autorización:** Suscriptores con rol `ADMIN` o graduados con membresía en el `eventId`.
- **Semántica de Entrega:** At-least-once. Orden secuencial por `occurred_at`.
- **Exposición Realtime:** **SÍ**.
- **Estructura del Payload:**
```json
{
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "previousStatus": "DRAFT",
  "newStatus": "OPEN",
  "updatedFields": ["status", "date"],
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

### 4.2 Membresía: `membership.status_changed.v1`
- **Agregado:** `GraduateMembership`
- **Productor / Caso de Uso:** `adminCancelGraduateMembership`, reconciliación de liquidación.
- **Propósito:** Informar cancelación o culminación de la membresía del graduado.
- **Audiencia:** `SPECIFIC_USER` (Graduado dueño) + `ADMIN`.
- **Autorización:** `account_id` coincide con el actor autenticado o `ADMIN`.
- **Semántica de Entrega:** At-least-once. Deduplicación por `membershipId` + `toStatus`.
- **Exposición Realtime:** **SÍ**.
- **Estructura del Payload:**
```json
{
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "membershipId": "m0000000-0000-0000-0000-000000000001",
  "accountId": "a0000000-0000-0000-0000-000000000002",
  "fromStatus": "ACTIVE",
  "toStatus": "CANCELLED",
  "reason": "Solicitud formal de baja",
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

### 4.3 Contrato: `contract.accepted.v1` & `contract.cancelled.v1`
- **Agregado:** `GraduateContract`
- **Productor / Caso de Uso:** `meAcceptContract`, `adminCancelContract`.
- **Propósito:** Confirmar aceptación legal vinculante con firma digital e IP del graduado.
- **Audiencia:** `SPECIFIC_USER` (Graduado dueño) + `ADMIN`.
- **Autorización:** Actor con `accountId` o `ADMIN`.
- **Semántica de Entrega:** At-least-once.
- **Exposición Realtime:** **SÍ**.
- **Estructura del Payload:**
```json
{
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "contractId": "c0000000-0000-0000-0000-000000000001",
  "membershipId": "m0000000-0000-0000-0000-000000000001",
  "accountId": "a0000000-0000-0000-0000-000000000002",
  "status": "ACCEPTED",
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

### 4.4 Plan de Pagos: `payment_plan.updated.v1`
- **Agregado:** `PaymentPlan`
- **Productor / Caso de Uso:** `recalculatePaymentPlan`, `adminApplyPenalty`.
- **Propósito:** Sincronizar saldos de pago, parcialidades cubiertas o recargos generados.
- **Audiencia:** `SPECIFIC_USER` + `ADMIN`.
- **Autorización:** Graduado propietario o `ADMIN`.
- **Semántica de Entrega:** At-least-once.
- **Exposición Realtime:** **SÍ**.
- **Estructura del Payload:**
```json
{
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "planId": "p0000000-0000-0000-0000-000000000001",
  "membershipId": "m0000000-0000-0000-0000-000000000001",
  "accountId": "a0000000-0000-0000-0000-000000000002",
  "status": "ACTIVE",
  "totalAmount": "15000.00",
  "paidAmount": "5000.00",
  "pendingAmount": "10000.00",
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

### 4.5 Comprobantes de Pago: `payment_submission.created.v1`, `payment_submission.approved.v1`, `payment_submission.rejected.v1`
- **Agregado:** `PaymentSubmission`
- **Productor / Caso de Uso:** `meSubmitPaymentProof`, `adminApprovePaymentSubmission`, `adminRejectPaymentSubmission`.
- **Propósito:** Notificar a finanzas de nuevo comprobante por revisar; notificar al graduado de resolución (aprobado o rechazado con motivo).
- **Audiencia:** Creado: `ADMIN`. Aprobado/Rechazado: `SPECIFIC_USER` + `ADMIN`.
- **Autorización:** `ADMIN` o graduado propietario del comprobante.
- **Semántica de Entrega:** At-least-once.
- **Exposición Realtime:** **SÍ**.
- **Estructura del Payload:**
```json
{
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "submissionId": "s0000000-0000-0000-0000-000000000001",
  "membershipId": "m0000000-0000-0000-0000-000000000001",
  "accountId": "a0000000-0000-0000-0000-000000000002",
  "status": "APPROVED",
  "amount": "2500.00",
  "rejectionReason": null,
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

### 4.6 Transacción Contable: `payment_transaction.confirmed.v1` & `payment_transaction.reversed.v1`
- **Agregado:** `PaymentTransaction`
- **Productor / Caso de Uso:** `adminApprovePaymentSubmission`, conciliación de webhooks de pasarela.
- **Propósito:** Asentar el movimiento irreversible en el ledger contable.
- **Audiencia:** `SPECIFIC_USER` + `ADMIN`.
- **Autorización:** Graduado acreedor del pago o `ADMIN`.
- **Semántica de Entrega:** At-least-once. Deduplicación por `transactionId`.
- **Exposición Realtime:** **SÍ**.
- **Estructura del Payload:**
```json
{
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "transactionId": "t0000000-0000-0000-0000-000000000001",
  "membershipId": "m0000000-0000-0000-0000-000000000001",
  "accountId": "a0000000-0000-0000-0000-000000000002",
  "amount": "2500.00",
  "status": "CONFIRMED",
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

### 4.7 Reembolsos: `refund.requested.v1`, `refund.confirmed.v1`, `refund.failed.v1`
- **Agregado:** `Refund`
- **Productor / Caso de Uso:** `adminCreateRefund`, webhook de devolución de pasarela.
- **Propósito:** Registrar ejecución o fallo del reembolso bancario/pasarela sin reescribir cobros originales.
- **Audiencia:** `SPECIFIC_USER` + `ADMIN`.
- **Autorización:** Graduado receptor o `ADMIN`.
- **Semántica de Entrega:** At-least-once.
- **Exposición Realtime:** **SÍ**.
- **Estructura del Payload:**
```json
{
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "refundId": "r0000000-0000-0000-0000-000000000001",
  "membershipId": "m0000000-0000-0000-0000-000000000001",
  "accountId": "a0000000-0000-0000-0000-000000000002",
  "amount": "1200.00",
  "status": "CONFIRMED",
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

### 4.8 Estructura de Mesas: `table.created.v1`, `table.updated.v1`, `table.deleted.v1`, `table.status_changed.v1`
- **Agregado:** `EventTable`
- **Productor / Caso de Uso:** `adminCreateTable`, `adminUpdateTable`, `adminDeleteTable`, `adminBlockTable`, `adminUnblockTable`.
- **Propósito:** Notificar a todos los usuarios con el croquis abierto de adiciones, reubicaciones geométricas o bloqueos de mesas.
- **Audiencia:** `ALL_ATTENDEES` del evento.
- **Autorización:** Todo usuario con acceso al `eventId`.
- **Semántica de Entrega:** At-least-once.
- **Exposición Realtime:** **SÍ**.
- **Estructura del Payload:**
```json
{
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "tableId": "tbl-00000000-0000-0000-0000-000000000012",
  "tableNumber": 12,
  "capacity": 10,
  "shape": "ROUND",
  "status": "AVAILABLE",
  "posX": 340.5,
  "posY": 180.0,
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

### 4.9 Asignación de Asientos: `table_assignment.changed.v1`
- **Agregado:** `TableAssignment`
- **Productor / Caso de Uso:** `meAssignTableMembers`, `adminAssignTableMembers`.
- **Propósito:** Notificar inmediatamente a otros clientes que una mesa ha recibido asignaciones, actualizando contadores en vivo para evitar colisiones en la selección.
- **Audiencia:** `ALL_ATTENDEES` del evento.
- **Autorización:** Todo usuario con acceso al `eventId`.
- **Regla Estricta Anti-PII:** **NUNCA** incluye `graduateName`, `guestName`, ni arreglos de miembros. Solo contadores y estado.
- **Semántica de Entrega:** At-least-once.
- **Exposición Realtime:** **SÍ**.
- **Estructura del Payload:**
```json
{
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "tableId": "tbl-00000000-0000-0000-0000-000000000012",
  "occupied": 7,
  "available": 3,
  "status": "AVAILABLE",
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

### 4.10 Selección de Platillo: `meal_selection.updated.v1`
- **Agregado:** `MealSelection`
- **Productor / Caso de Uso:** `meSelectMeal`, `adminUpdateMealSelection`.
- **Propósito:** Confirmar registro de requerimientos alimenticios / menú seleccionado para un invitado.
- **Audiencia:** `SPECIFIC_USER` + `ADMIN`.
- **Autorización:** Graduado asignado o `ADMIN`.
- **Semántica de Entrega:** At-least-once.
- **Exposición Realtime:** **SÍ**.
- **Estructura del Payload:**
```json
{
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "memberId": "gm-00000000-0000-0000-0000-000000000001",
  "accountId": "a0000000-0000-0000-0000-000000000002",
  "mealOptionId": "mo-00000000-0000-0000-0000-000000000001",
  "mealType": "VEGETARIAN",
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

### 4.11 Solicitud de Termo: `thermo.updated.v1`
- **Agregado:** `ThermoRequest`
- **Productor / Caso de Uso:** `meRequestThermo`, `adminUpdateThermoStatus`.
- **Propósito:** Informar avance logístico del termo conmemorativo (`REQUESTED` -> `IN_PRODUCTION` -> `DELIVERED`).
- **Audiencia:** `SPECIFIC_USER` + `ADMIN`.
- **Autorización:** Graduado dueño o `ADMIN`.
- **Semántica de Entrega:** At-least-once.
- **Exposición Realtime:** **SÍ**.
- **Estructura del Payload:**
```json
{
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "thermoId": "th-00000000-0000-0000-0000-000000000001",
  "accountId": "a0000000-0000-0000-0000-000000000002",
  "status": "IN_PRODUCTION",
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

### 4.12 Trabajos de Exportación: `export.completed.v1` & `export.failed.v1`
- **Agregado:** `ExportJob`
- **Productor / Caso de Uso:** `jobProcessExports`.
- **Propósito:** Notificar al administrador que solicitó el reporte que el archivo Excel/PDF/CSV está generado y listo para descarga.
- **Audiencia:** `ADMIN_INITIATOR` (Exclusivo para la cuenta administradora solicitante).
- **Autorización:** `created_by_account_id === actor.id`.
- **Semántica de Entrega:** At-least-once.
- **Exposición Realtime:** **SÍ**.
- **Estructura del Payload:**
```json
{
  "jobId": "job-00000000-0000-0000-0000-000000000001",
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "accountId": "a0000000-0000-0000-0000-000000000001",
  "status": "COMPLETED",
  "reportType": "ATTENDEES_AND_TABLES",
  "format": "XLSX",
  "fileAssetId": "fa-00000000-0000-0000-0000-000000000001",
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

### 4.13 Casos de Conciliación: `reconciliation_case.created.v1` & `reconciliation_case.resolved.v1`
- **Agregado:** `ReconciliationCase`
- **Productor / Caso de Uso:** `jobPaymentReconciliationRepair`, webhook de pasarela con discrepancia.
- **Propósito:** Alertar al equipo financiero de una anomalía contable o de capacidad para intervención manual.
- **Audiencia:** `ADMIN` únicamente.
- **Autorización:** Rol `ADMIN`. **PROHIBIDO** a cualquier graduado.
- **Semántica de Entrega:** At-least-once.
- **Exposición Realtime:** **SÍ** (a canales administrativos).
- **Estructura del Payload:**
```json
{
  "caseId": "rc-00000000-0000-0000-0000-000000000001",
  "eventId": "e0000000-0000-0000-0000-000000000001",
  "caseType": "PAYMENT_CONFIRMED_CAPACITY_CONFLICT",
  "status": "OPEN",
  "details": {
    "externalPaymentId": "mp_987654321",
    "attemptedAmount": "3500.00"
  },
  "occurredAt": "2026-09-08T12:00:00.000Z"
}
```

---

## 5. Protocolo de Persistencia y Despacho Outbox

### 5.1 Ciclo de Vida del Outbox
La tabla `outbox_events` opera como el registro transaccional oficial de eventos a despachar.
- **Estados de `OutboxStatus`:**
  - `PENDING`: Evento insertado en la transacción; en espera de ser tomado por el despachador.
  - `PROCESSING`: Evento tomado por el worker despachador; previene despacho simultáneo.
  - `PUBLISHED`: Evento despachado exitosamente hacia los suscriptores / bus SSE.
  - `FAILED`: Evento que superó el umbral máximo de reintentos (`attempts >= 5`). Requiere inspección operativa.

```text
[PENDING] ────(Claim worker)────► [PROCESSING] ────(Éxito)────► [PUBLISHED]
                                        │
                                     (Error)
                                        ▼
                                 [attempts < 5] ───► Backoff / Retry a [PENDING]
                                 [attempts >= 5] ──► [FAILED] (Dead-letter)
```

### 5.2 Algoritmo de Reintento y Backoff
- Si el despacho falla (ej. error de serialización o timeout interno), el worker incrementa `attempts` y programa el siguiente reintento con backoff exponencial:
  $$\text{backoff\_seconds} = \min(2^{\text{attempts}} \times 5, 300)$$
- Si `attempts >= 5`, el estado pasa a `FAILED` y se genera una entrada en el log de auditoría del sistema para resolución.

### 5.3 Deduplicación en Consumidores
Todo suscriptor o cliente que procese eventos debe registrar el `id` (UUID) del `OutboxEvent`. Si recibe un evento cuyo `id` ya fue procesado con anterioridad, debe descartar la acción secundaria sin fallar (idempotencia en el consumidor).

---

## 6. Especificación del Endpoint Realtime SSE

### 6.1 Contrato del Endpoint
- **Ruta:** `GET /api/v1/realtime/stream`
- **Protocolo:** HTTP/1.1 o HTTP/2 con `text/event-stream`.
- **Encabezados Requeridos:**
  - `Authorization: Bearer <jwt_access_token>`
  - `Accept: text/event-stream`
- **Parámetros de Consulta (Opcional):**
  - `eventId`: UUID del evento que se desea escuchar.
- **Validación de Acceso:**
  - Si el usuario es `ADMIN`: Autorizado para cualquier `eventId` existente.
  - Si el usuario es `GRADUATE`: El backend verifica en base de datos que el usuario posea una membresía en estado `ACTIVE` para dicho `eventId`. Si no pertenece al evento, la conexión se rechaza inmediatamente con `403 FORBIDDEN` o `404 RESOURCE_NOT_FOUND` (IDOR-safe).

### 6.2 Formato del Mensaje SSE
Cada paquete transmitido por el servidor sigue el formato canónico:

```text
id: 550e8400-e29b-41d4-a716-446655440000
event: table_assignment.changed.v1
data: {"eventId":"e0000000-0000-0000-0000-000000000001","tableId":"tbl-00000000-0000-0000-0000-000000000012","occupied":7,"available":3,"status":"AVAILABLE","occurredAt":"2026-09-08T12:00:00.000Z"}
```

---

## 7. Criterios de Aceptación y Verificación

1. **At-Least-Once:** Ningún evento de mutación sensible se pierde si el servidor se reinicia tras el commit.
2. **Zero-Leakage:** Bajo ninguna prueba un graduado puede recibir información financiera, comprobantes o nombres de invitados de otro graduado.
3. **Desacoplamiento Monolítico:** La implementación no introduce dependencias de software no presentes en el repositorio (no Redis, no Kafka).