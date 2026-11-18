# B1 — Diseño de datos, invariantes y migración GR → nuevo backend

**Estado:** diseño P0, NO DDL aprobado ni ejecutado. **Fecha:** 2026-11-18.  
**Fuente auditada:** `gr-prod/main/backend/prisma/schema.prisma`, 49 modelos Prisma. **Límite:** GR sólo agrupa cantidades por mesas; Monkavia acomoda y genera `rightId` individuales. No crear `AccessUnit` ni `TableAllocation` como modelos comerciales GR.

## 1. Reutilización de datos (no copiar indiscriminadamente el esquema)

| Agregado lógico | Persistencia histórica verificada | Tratamiento para nuevo backend |
| --- | --- | --- |
| Cuenta y autenticación | `Account`, `AuthSession`, `PasswordResetToken` | REUSE con refresh rotatorio atómico, bloqueo de cuenta y mecanismo de cookie/bearer por ADR |
| Graduaciones | `Event`, `EventSettings`, `EventAccessCode` | REUSE; validar OPEN real al resolver código, sin depender de UI |
| Membresía | `GraduateMembership` con UNIQUE(event_id, account_id), `GroupMember.full_name` | REUSE; admite varias graduaciones por Account, una membresía por evento; no duplicar principal |
| Contratación | `GraduateContract`, `ContractLineItem`, `ContractLineItemQuote` | REUSE; falta snapshot íntegro legible de versión legal y CAS en accept |
| Finanzas | `PaymentPlan`, `Installment`, `PaymentAttempt`, `PaymentSubmission`, `PaymentTransaction`, `PaymentAllocation`, `Adjustment`, `Refund` | REUSE con ledger append-only y montos exactos, sin duplicar en Monkavia |
| Mesas GR | `SeatingMap`, `EventTable`, `TableAssignment` | ADAPT sólo **agrupación por cantidades** conforme a reglas GR; `TableAssignment.group_member_id UNIQUE` no expresa cantidades aún sin nombre |
| Menús y termos | `MealSelection`, `ThermoRequest`, `ThermoDelivery` y configuración | REUSE con milestones separados |
| Operación | `IdempotencyRecord`, `OutboxEvent`, `AuditLog`, `FileAsset`, `ExportJob`, `ReconciliationCase` | REUSE/EXTEND; outbox necesita versión y entrega GR_ACCESS trazable |

### 1.1 Brecha real de agrupación por mesa

GR debe persistir **qué cantidad de una membresía se agrupa con qué mesa**, aunque los nombres aún no existan; de otra manera no puede restaurar el estado tras reiniciar el servidor. El esquema histórico `TableAssignment` guarda **una persona por asignación**, y por ello no basta.

Se propone **primero auditar el CRUD de agrupación actual** y comparar su semántica con `SEATING_QUANTITY_CONTRACT.md`. Sólo después elegir el cambio físico más pequeño que permita consulta y actualización atómicas del agregado `(event_id, membership_id, table_reference, quantity)`; sin IDs individuales de acceso, sin asociación obligatoria a GroupMember y sin reconstruir el acomodo de Monkavia. Esta necesidad de persistencia **no crea una regla de negocio** ni autoriza introducir la entidad funcional `TableAllocation` rechazada por producto.

**Gate bloqueante para SQL final:** conocer cómo los servicios actuales representan/validan el agrupamiento por mesa y cómo migrar datos nominales sin contar dos veces. El nuevo backend no debe ocultar esta incompatibilidad.

## 2. Contrato de datos interno — agrupación GR

```text
GroupingSnapshot (GR / agregado contractual)
  eventId: UUID
  membershipId: UUID
  groupingVersion: integer
  groups:
    - tableReference: UUID|null  // referencia de agrupación, no asiento
      productKind: ADULT|CHILD|NO_DINNER
      quantity: integer >= 1
```

- El payload de sincronización a Monkavia es `memberships[].groups[]` con `externalMembershipId`, `externalTableId`, `productKind`, `quantity` más metadatos/versiones de evento.
- No enviar `externalPlaceId`, `GroupMember` anónimo ni generar identificador por boleto.
- Los nombres y documentos de los graduados permanecen privados en GR. No se envía monto, método de pago, cuenta bancaria, móvil ni comprobante a Monkavia.
- Cantidades y cambios comerciales se validan con **reglas GR aprobadas**, nunca contra reglas supuestas de Monkavia. El cupo físico/escaneo operativo de Monkavia es verificación de integridad de acceso, no nueva norma de contratación.
- Un snapshot completo vacío es distinto de omisión por error. El worker debe saber si un snapshot representa sustitución total del evento, versionada y completa.

## 3. Entidades técnicas P0 necesarias

### 3.1 Contrato y evidencia legal

**Agregar/ajustar:**
- `LegalDocumentVersion`: `id`, `documentType` (TERMS/POLICY), `version`, `eventId?`, `contentAssetId` privado, `contentSha256`, `publishedAt`, `publishedBy`, `supersedesId?`. Inmutable al publicar, sin eliminar evidencia utilizada por contratos.
- `ContractLegalSnapshot`: `id`, `contractId`, `termsVersionId`, `policyVersionId`, `termsContentHash`, `policyContentHash`, `renderedSnapshotAssetId`, `snapshotHash`, `createdAt`; inmutable, contiene documento legible completo recuperable.
- `ContractAcceptanceEvidence`: `id`, `contractId`, `accountId`, `snapshotId`, `acceptedAt` (reloj DB), `consentVersion`, `requestId`, `ipDigest?`, `userAgentDigest?`, `createdAt`. UNIQUE por aceptación vigente de contrato (o recibo idempotente), no guardar raw IP salvo política legal aprobada.

**Comando de aceptación (atómico):**
1. Resolver contrato por membership propia y versión de documento; revisar estado `PENDING_ACCEPTANCE`.
2. Comprobar el `snapshotHash`, `termsVersionId` y `policyVersionId` que el cliente leyó. Si cambiaron: `409`, contrato sin aceptar, exigir nueva lectura.
3. Confirmar autorización de cuenta, guardar evidencia de documento exacto y estado `ACCEPTED` en una transacción + audit + idempotency receipt.
4. Después de `ACCEPTED`: no sobrescribir contrato ni documento; una modificación requiere adenda formal o superseding.
5. GET entrega **texto/archivo legible íntegro** de ambos documentos y checksum; acceso sólo al titular/ADMIN autorizado.

**Gate jurídico:** texto y política deben existir, aprobarse y conservarse. Un hash aislado de un documento no recuperable **no constituye aceptación suficientemente verificable**.

### 3.2 Enrollment multi-evento de cuenta existente

Reutilizar `Account` y `GraduateMembership`; **NO crear otro Account**. El UNIQUE `(event_id, account_id)` histórico ya brinda la restricción clave, además de idempotencia de comando.

```text
Public POST /auth/event-access/resolve {code}
  -> event info + short-lived event_access_token

Authenticated POST /me/events/{eventId}/enroll     [CANDIDATO NUEVO]
  Authorization: Bearer GR access token
  Idempotency-Key: ...
  body: {event_access_token, confirm_enrollment: true}
  -> existing or new membership/folio/contract (no nueva cuenta)
```

**Guardas:** cuenta ACTIVE, GRADUATE, event OPEN, token de código firmado vigente y vinculado a ese eventId, confirmación voluntaria y ausencia de membresía incompatible. Token de evento **no sustituye** el login. La operación crea membresía+principal nominal+contrato pendiente dentro de una sola transacción; conflicto de UNIQUE se reconsulta y devuelve membership existente si la petición es el replay de la misma alta. Cancelado/no reactivable exige decisión explícita, no un auto-reenrollment.

**Pendiente de aprobación de producto:** DEC-02 del acta CEO; la solución técnica fue aceptada conceptualmente, pero el contrato público y sus textos aún no fueron ratificados.

### 3.3 GR ↔ Monkavia: binding, cursores y outbox

**Reutilizar/expandir `OutboxEvent`**, no enviar antes del commit GR. Los campos técnicos mínimos recomendados:
- `event_id`, `operation_id` único, `aggregate_type/id`, `kind` (`RIGHTS_SNAPSHOT | RELEASE_DECISION | EVENT_METADATA | ADMISSION_CONTROL`), `payload_hash`, `sequence`, `critical`, `created_at`, `delivered_at?`, `attempt_count`, `next_retry_at`, `last_error_code?`.
- `IntegrationBinding`: UNIQUE GR eventId, Monkavia eventId, external event id, client identity scope y timestamps.
- `IntegrationCursor` por eventId: `metadata_version`, `sync_version`, `eligibility_revision`, `acknowledged_revision`, `last_remote_sync_at`, `last_lease_expires_at`, `is_blocked`.
- `MembershipReleaseCursor`: UNIQUE `(event_id,membership_id)`, `release_version`, `family_state`, `no_dinner_state`, `decision_ref`; datos derivados de GR, no una segunda contabilidad.
- `IdempotencyRecord` existente: adaptar a comandos de negocio y de integración, hash de payload + scope y receipts sin secretos.

**Orden de escritura:** cambio comercial/financiero + outbox crítico y nueva revisión se confirman en la misma transacción GR; worker firma HMAC y publica **después**. Al recibir ack actualiza cursor/receipt; replay no crea nuevos cambios.

**Guardas de lease:** si `exists outbox critical undelivered`, gap de revisión, conciliación con error o cálculo financiero inconsistente, no llamar `grRenewAdmissionLease`. Caduca a los 30 s desde la última renovación confirmada. No almacenar secreto HMAC/QR temporal en JSON outbox ni ledger.

### 3.4 Identificadores de acceso Monkavia

Monkavia genera `gr_access_right.id` para cada unidad operativa a partir de `quantity`; persistencia exclusiva de su DB. Repetir snapshot o reordenar grupos conserva `rightId` existentes. Un nuevo conteo agrega sólo delta y una reducción retira sólo derechos no consumidos; los consumidos son históricos.

GR guarda exclusivamente contadores agregados y versiones; no mantiene tabla espejo de IDs por boleto. Los NO_DINNER se imprimen vía respuestas autenticadas de Monkavia, sin almacenar tokens QR crudos en GR. El lector de Monkavia valida entrada única e irreversible.

## 4. Invariantes transaccionales y de seguridad

| Invariante | Comprobación mínima |
| --- | --- |
| Account una vez | UNIQUE email normalizado, registro actual no agrega una cuenta existente |
| Membership única por evento | UNIQUE(event_id,account_id), concurrent enroll crea a lo sumo una |
| GroupMember no ficticio | `full_name` obligatorio y principal único por membership según regla GR |
| Contratos | Snapshot legal íntegro + hash + versión inmutable antes de accept |
| Finanzas | NUMERIC exacto; `PaymentTransaction` confirmado no se edita/borra; reverso como movimiento separado |
| Comprobantes | PENDING no modifica saldo; APPROVED crea a lo sumo una transacción |
| Agrupación | Registro persistente de cantidad por contrato/mesa; validaciones sólo GR, sin doble contador por nombres |
| Integración | No se envían IDs por boleto; firma HMAC sólo API GR; cada receipt idempotente y versionado |
| Check-in | Monkavia verifica y guarda `rightId` usado una sola vez; no se revierte en GR |
| Recursos privados | Pruebas IDOR para evento, membresía, contrato, recibo, archivo, PDF |
| Riesgo financiero remoto | Con outbox crítico pendiente se detiene lease; no se promete bloqueo antes de expiración |

## 5. Orden de migración segura

1. **Inventario real:** migraciones actuales, constraints efectivas, conteos por tabla, foreign keys/cascades y fixtures sin PII productiva.
2. **Baseline compatible:** generar nueva DB con la migración legacy, comparar modelo real con Prisma; probar alteraciones en entorno aislado.
3. **Ampliaciones aditivas:** tablas/versiones legales, índices de enrollment, cursores, estados de entrega y recibos; ningún DROP inicial.
4. **Agrupación por cantidades:** definir representación mínima después del audit del servicio de mesas; backfill desde nominal sólo cuando correlación sea inequívoca. Los registros ambiguos se reportan, no se inventan asignaciones.
5. **Dual read/reconciliación:** validar cortes de cartera, contrato y agrupación vs dataset legacy, y versiones Monkavia por evento en entorno de prueba.
6. **Cutover controlado:** snapshots y backups verificables, scripts reversibles del código, verificación por checksum y compensaciones para el caso irreversible de check-ins.
7. **Post-cutover:** observar mismatch de revisiones, outbox crítico, lease, pago pendiente, error 409, deadlocks y migración fallida.

**No es seguro ejecutar SQL de migración ni crear esquema definitivo de agrupación antes de resolver el punto 1.1 y obtener autorización de cambio de datos.**

## 6. Decisiones abiertas (no inventar valores)

- DEC-01: contenido legal final y autoridad que publica versiones.
- DEC-02: copy y UX del enrolamiento multi-evento de cuenta autenticada.
- DEC-04: catálogo real de croquis referenciado por agrupaciones GR.
- DEC-07 / Q3: no crear excepción multimesa sin CEO.
- Política sesión web: cookie HttpOnly/CSRF o bearer sólo memoria; especificar dominio/API/CDN de despliegue.
- Retención de evidencia legal y ficheros: validar regulación y política de negocio.
- Acomodación/agrupación heredada: representación física final sólo tras auditoría de servicios y migración de fixtures.
