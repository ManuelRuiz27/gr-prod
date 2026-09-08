# Plataforma GR — Entregables de Arquitectura

**Documento:** `ARCHITECTURE_DELIVERABLES.md`  
**Versión:** 1.2  
**Fecha:** 7 de septiembre de 2026  
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
| 4 | `API_ENDPOINT_MATRIX.md` | TODO | pantalla/acción → use case → operationId → endpoint → auth → domain → DB → transaction → audit → tests |
| 5 | `API_CONTRACT.openapi.yaml` | TODO | OpenAPI 3.1 completo y validable |
| 6 | `API_CONTRACTS.md` | EXISTS | material conceptual; reconciliar contra Domain/Data Model + matriz + OpenAPI |
| 7 | `AUTHORIZATION_MATRIX.md` | TODO | policy por operación y ownership |
| 8 | `STATE_MACHINES.md` | TODO | eventos, membership, contrato, attempts/submissions, policy, refunds, termo y jobs |
| 9 | `EVENTS_REALTIME_CONTRACT.md` | TODO | envelope, versionado, privacidad, polling V1 y evolución SSE/WS |
| 10 | `ERROR_CONTRACT.md` | TODO | catálogo único de códigos, HTTP y payload seguro |
| 11 | `INTEGRATIONS.md` | TODO | Mercado Pago, OpenPay, storage, correo, webhooks, reconciliación, timeouts/retries |
| 12 | `AUDIT_LOG_CONTRACT.md` | TODO | acciones auditables, before/after, motivos y retención |
| 13 | `NON_FUNCTIONAL_REQUIREMENTS.md` | EXISTS | validar contra Architecture + Domain/Data Model y cerrar gaps finales de runtime |
| 14 | `BACKEND_TEST_STRATEGY.md` | TODO | unit, integration, DB constraints, contract, concurrency, security, provider y E2E |
| 15 | `FRONTEND_BACKEND_TRACEABILITY.md` | TODO | cobertura de superficies aprobadas y eliminación de fixtures productivos |
| 16 | `ADRs/` | TODO | solo decisiones que cambien arquitectura o introduzcan infraestructura/framework |
| 17 | `BACKEND_READY_CHECKLIST.md` | TODO | gate único previo a implementación masiva y producción |
| 18 | `REQUIREMENTS_TRACEABILITY_MATRIX.md` | EXISTS | enlazar FR/BR con Domain/Data Model y artefactos técnicos finales |
| 19 | `REPOSITORY_SOURCE_OF_TRUTH.md` | EXISTS | reauditar contra HEAD antes de comenzar backend productivo |

## Orden de cierre

```text
SYSTEM_ARCHITECTURE        READY
→ DOMAIN_MODEL             READY
→ DATA_MODEL               READY
→ API_ENDPOINT_MATRIX      NEXT
→ OpenAPI
→ AUTHORIZATION_MATRIX
→ STATE_MACHINES
→ ERROR_CONTRACT
→ EVENTS_REALTIME_CONTRACT
→ INTEGRATIONS
→ AUDIT_LOG_CONTRACT
→ BACKEND_TEST_STRATEGY
→ FRONTEND_BACKEND_TRACEABILITY
→ BACKEND_READY_CHECKLIST
```

## Gate

No se considera cerrado un módulo porque exista un endpoint o una tabla. Debe existir trazabilidad completa:

```text
UI/action
→ requirement
→ use case
→ aggregate/policy
→ API
→ authorization
→ DB tables/constraints
→ transaction/locks
→ audit/outbox
→ tests
```

## Decisiones cerradas por DATA_MODEL 2.0

Se consideran normativas para artefactos siguientes:

```text
schema PostgreSQL privado de aplicación
UUID + TIMESTAMPTZ + NUMERIC exacto
same-event composite FKs donde refuercen aislamiento
AuthSession / EventAccessCode
EventFinancialConfiguration + InstallmentTemplate
ThermoConfiguration estructurada/versionada
ContractLineItemQuote
Installment temporal state derivado
Thermo LOCKED/AVAILABLE derivado
PaymentAllocationReversal para refunds no destructivos
RefundSource para trazabilidad a cobros
ReconciliationCase para pago confirmado/capacidad conflictiva
IdempotencyRecord persistente
OutboxEvent PostgreSQL
ExportJob
migración paralela desde schema legacy
```

## Regla para agentes

Al completar un entregable:

1. actualizar este tracker;
2. actualizar `docs/INDEX.md` si cambia precedencia/lectura obligatoria;
3. no marcar `READY` con gaps P0 no modelados;
4. reportar contradicciones en vez de resolverlas mediante código;
5. mantener los commits documentales separados de implementación cuando cambien contratos;
6. no crear `schema.prisma` definitivo antes de leer `DOMAIN_MODEL.md` + `DATA_MODEL.md`;
7. partial indexes/checks/triggers PostgreSQL siguen siendo obligatorios aunque Prisma no los represente directamente.

## Próximo entregable

```text
API_ENDPOINT_MATRIX.md
```

Debe construirse a partir de:

```text
frontend aprobado
+ BR/FR/AC
+ SYSTEM_ARCHITECTURE
+ DOMAIN_MODEL
+ DATA_MODEL
```

No desde rutas legacy o fixtures.
