# Plataforma GR — Entregables de Arquitectura

**Documento:** `ARCHITECTURE_DELIVERABLES.md`  
**Versión:** 1.0  
**Fecha:** 7 de septiembre de 2026  
**Objetivo:** cerrar contract-first el backend antes de producción.

Estados:

```text
READY        = suficiente para implementar
EXISTS       = existe, requiere auditoría/endurecimiento contra arquitectura 1.0
TODO         = debe crearse
REFERENCE    = auxiliar/no normativo
```

| # | Entregable | Estado | Resultado requerido |
|---:|---|---|---|
| 1 | `SYSTEM_ARCHITECTURE.md` | READY | arquitectura, módulos, límites, transacciones, integración, seguridad, runtime y protocolo para agentes |
| 2 | `DOMAIN_MODEL.md` | TODO | aggregates, entidades, value objects, invariantes y ownership de dominio |
| 3 | `DATA_MODEL.md` | EXISTS | incorporar gaps cerrados por arquitectura: AuthSession, EventAccessCode, IdempotencyRecord y ExportJob si async |
| 4 | `API_ENDPOINT_MATRIX.md` | TODO | pantalla/acción → use case → operationId → endpoint → auth → transaction → audit → tests |
| 5 | `API_CONTRACT.openapi.yaml` | TODO | OpenAPI 3.1 completo y validable |
| 6 | `API_CONTRACTS.md` | EXISTS | material conceptual; deberá reconciliarse contra OpenAPI/matriz |
| 7 | `AUTHORIZATION_MATRIX.md` | TODO | policy por operación y ownership |
| 8 | `STATE_MACHINES.md` | TODO | eventos, membership, contrato, pagos, submissions, policies, refunds, termo y jobs |
| 9 | `EVENTS_REALTIME_CONTRACT.md` | TODO | envelope, versionado, privacidad, polling V1 y evolución SSE/WS |
| 10 | `ERROR_CONTRACT.md` | TODO | catálogo único de códigos, HTTP y payload seguro |
| 11 | `INTEGRATIONS.md` | TODO | Mercado Pago, OpenPay, storage, correo, webhooks, timeouts/retries |
| 12 | `AUDIT_LOG_CONTRACT.md` | TODO | acciones auditables, before/after, motivos y retención |
| 13 | `NON_FUNCTIONAL_REQUIREMENTS.md` | EXISTS | validar contra arquitectura 1.0 y cerrar gaps de auth/storage/jobs |
| 14 | `BACKEND_TEST_STRATEGY.md` | TODO | unit, integration, contract, concurrency, security, provider y E2E |
| 15 | `FRONTEND_BACKEND_TRACEABILITY.md` | TODO | cobertura de todas las superficies aprobadas y eliminación de fixtures productivos |
| 16 | `ADRs/` | TODO | solo decisiones que cambien arquitectura o introduzcan infraestructura/framework |
| 17 | `BACKEND_READY_CHECKLIST.md` | TODO | gate único previo a implementación masiva y producción |
| 18 | `REQUIREMENTS_TRACEABILITY_MATRIX.md` | EXISTS | enlazar FR/BR con artefactos técnicos finales |
| 19 | `REPOSITORY_SOURCE_OF_TRUTH.md` | EXISTS | reauditar contra HEAD antes de comenzar backend productivo |

## Orden de cierre

```text
SYSTEM_ARCHITECTURE
→ DOMAIN_MODEL
→ DATA_MODEL
→ API_ENDPOINT_MATRIX
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

No se considera cerrado un módulo porque “exista un endpoint”. Debe existir trazabilidad completa:

```text
UI/action
→ requirement
→ use case
→ API
→ authorization
→ domain
→ DB
→ audit/effects
→ tests
```

Los documentos `EXISTS` no se consideran automáticamente `READY`: fueron creados antes de `SYSTEM_ARCHITECTURE.md` y deben auditarse contra sus decisiones.

## Regla para agentes

Al completar un entregable:

1. actualizar este tracker;
2. actualizar `docs/INDEX.md` si cambia precedencia;
3. no marcar `READY` con TODOs funcionales P0;
4. reportar contradicciones en vez de resolverlas mediante código;
5. hacer commit documental separado del commit de implementación cuando el cambio altere contratos.
