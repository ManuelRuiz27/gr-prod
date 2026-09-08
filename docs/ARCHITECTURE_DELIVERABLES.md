# Plataforma GR — Entregables de Arquitectura

**Documento:** `ARCHITECTURE_DELIVERABLES.md`  
**Versión:** 1.5  
**Fecha:** 8 de septiembre de 2026  
**Objetivo:** cerrar contract-first el backend antes de producción.

Estados:

```text
READY        = suficiente como input normativo del siguiente entregable/implementación autorizada
EXISTS       = existe, requiere auditoría/endurecimiento contra arquitectura vigente
TODO         = debe crearse
REFERENCE    = auxiliar/no normativo
```

| # | Entregable | Estado | Resultado requerido |
|---:|---|---|---|
| 1 | `SYSTEM_ARCHITECTURE.md` | READY | arquitectura, módulos, límites, transacciones, integración, seguridad, runtime y protocolo para agentes |
| 2 | `DOMAIN_MODEL.md` | READY | bounded contexts, aggregates, entidades, value objects, policies, invariantes, transacciones, concurrencia y ports |
| 3 | `DATA_MODEL.md` | READY | PostgreSQL/Prisma target: tablas, tipos, FKs, constraints, índices, estados derivados, locking, idempotencia, outbox y migración legacy |
| 4 | `API_ENDPOINT_MATRIX.md` | READY | 129 operaciones HTTP canónicas: superficie → operationId → endpoint → use case → DB/locks → idempotencia → audit/outbox → tests |
| 5 | `API_CONTRACT.openapi.yaml` | READY | OpenAPI 3.1 completo y validable derivado de la matriz, sin operaciones nuevas |
| 6 | `API_CONTRACTS.md` | EXISTS | referencia conceptual anterior; reconciliar/migrar hacia matriz + OpenAPI; no prevalece ante conflicto de rutas |
| 7 | `AUTHORIZATION_MATRIX.md` | READY | 129 operaciones canónicas con actor, auth, role, scope, ownership, policy y denial behavior; validación 100% biyectiva |
| 8 | `STATE_MACHINES.md` | READY | 13 máquinas de estado, transiciones válidas, actores, precondiciones, estados derivados prohibidos e invariantes de dominio |
| 9 | `EVENTS_REALTIME_CONTRACT.md` | READY | envelope, versionado, privacidad, outbox transaccional y mecanismo realtime SSE |
| 10 | `ERROR_CONTRACT.md` | READY | catálogo canónico de códigos, taxonomía HTTP, envelope único y sanitización zero-leakage |
| 11 | `INTEGRATIONS.md` | TODO | Mercado Pago, OpenPay, storage, correo, webhooks, reconciliación, timeouts/retries |
| 12 | `AUDIT_LOG_CONTRACT.md` | TODO | acciones auditables, before/after, motivos y retención |
| 13 | `NON_FUNCTIONAL_REQUIREMENTS.md` | EXISTS | validar contra Architecture + Domain/Data/API Matrix y cerrar gaps finales de runtime |
| 14 | `BACKEND_TEST_STRATEGY.md` | TODO | unit, integration, DB constraints, contract, concurrency, security, provider y E2E |
| 15 | `FRONTEND_BACKEND_TRACEABILITY.md` | TODO | cobertura de superficies aprobadas y eliminación de fixtures productivos |
| 16 | `ADRs/` | TODO | solo decisiones que cambien arquitectura o introduzcan infraestructura/framework |
| 17 | `BACKEND_READY_CHECKLIST.md` | TODO | gate único previo a implementación masiva y producción |
| 18 | `REQUIREMENTS_TRACEABILITY_MATRIX.md` | EXISTS | enlazar FR/BR con Domain/Data/API y artefactos técnicos finales |
| 19 | `REPOSITORY_SOURCE_OF_TRUTH.md` | EXISTS | reauditar contra HEAD antes de comenzar backend productivo |

## Orden de cierre

```text
SYSTEM_ARCHITECTURE        READY
→ DOMAIN_MODEL             READY
→ DATA_MODEL               READY
→ API_ENDPOINT_MATRIX      READY
→ API_CONTRACT.openapi     READY
→ AUTHORIZATION_MATRIX     READY
→ STATE_MACHINES           READY
→ ERROR_CONTRACT           READY
→ EVENTS_REALTIME_CONTRACT READY
→ INTEGRATIONS             NEXT
→ AUDIT_LOG_CONTRACT
→ BACKEND_TEST_STRATEGY
→ FRONTEND_BACKEND_TRACEABILITY
→ BACKEND_READY_CHECKLIST
```

## Gate

No se considera cerrado un módulo porque exista un endpoint o una tabla:

```text
UI/action
→ requirement
→ use case
→ aggregate/policy
→ operationId/OpenAPI
→ authorization
→ DB tables/constraints
→ transaction/locks
→ audit/outbox
→ tests
```

## Decisiones cerradas hasta API_ENDPOINT_MATRIX 1.0 y API_CONTRACT 1.0

```text
SYSTEM/DOMAIN/DATA model normativos
schema PostgreSQL privado de aplicación
UUID + TIMESTAMPTZ + NUMERIC exacto
same-event composite FKs
AuthSession / EventAccessCode
financial/thermo configuration versioning
ContractLineItemQuote
states derivados de installment/table/thermo
RefundSource + PaymentAllocationReversal
ReconciliationCase
IdempotencyRecord + OutboxEvent + ExportJob
migración paralela desde schema legacy
129 operaciones HTTP canónicas
7 jobs internos sin controllers públicos
una operación por caso de uso; sin aliases global/event-scoped innecesarios
crear evento de forma compuesta/atómica
emitir código contextual en command separado del create event
pago parcial como intención, allocation server-side
OCR local + import backend transaccional
exports productivos job-based
OpenAPI 3.1 validado al 100% contra matriz canónica
Persistencia Data Model 2.0 con 49 modelos Prisma sincronizados
Enum MealType y clasificación canónica integrada
Restricción FK RESTRICT en ledger financiero
23 CHECK constraints y 3 UNIQUE indexes parciales aplicados en PostgreSQL
Envelope canónico unificado de errores y sanitización Zero-Leakage (ERROR_CONTRACT)
Separación formal de 3 niveles: Domain vs Outbox vs Realtime Client (EVENTS_REALTIME_CONTRACT)
Persistencia transaccional Outbox (outbox_events) confirmada en PostgreSQL antes de emitir
Transporte realtime Server-Sent Events (SSE) monolítico en HTTP/1.1 y HTTP/2 sin Redis/Kafka
Aislamiento reactivo por ActorContext y sanitización anti-PII estricta en croquis
```

## Regla para agentes

1. leer `INDEX`, `SYSTEM_ARCHITECTURE`, `DOMAIN_MODEL`, `DATA_MODEL` y `API_ENDPOINT_MATRIX`;
2. no crear ruta/operationId ausente en la matriz;
3. no implementar controllers productivos antes de que OpenAPI esté `READY`;
4. no marcar `READY` con gaps P0;
5. reportar contradicciones y actualizar contratos antes de código;
6. partial indexes/checks/triggers siguen siendo obligatorios aunque Prisma no los represente;
7. fixtures/mocks/rutas legacy no son fuente contractual.

## Próximo entregable

```text
INTEGRATIONS.md
```

Debe especificar exhaustivamente los contratos de integración externa con proveedores: Mercado Pago, OpenPay, almacenamiento de comprobantes (Cloudflare R2 / S3), servicio de correos transaccionales, tratamiento de webhooks con firma HMAC, políticas de reintentos, idempotencia por folio de proveedor y casos de reconciliación asíncrona.
