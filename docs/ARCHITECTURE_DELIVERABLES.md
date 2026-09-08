# Plataforma GR — Entregables de Arquitectura

**Documento:** `ARCHITECTURE_DELIVERABLES.md`  
**Versión:** 1.1  
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
| 3 | `DATA_MODEL.md` | EXISTS | reconciliar dominio 1.0 y agregar gaps explícitos: AuthSession, EventAccessCode, IdempotencyRecord, configuración financiera versionada/templates, ContractLineItemQuote, termo config, reconciliación y ExportJob cuando aplique |
| 4 | `API_ENDPOINT_MATRIX.md` | TODO | pantalla/acción → use case → operationId → endpoint → auth → domain → transaction → audit → tests |
| 5 | `API_CONTRACT.openapi.yaml` | TODO | OpenAPI 3.1 completo y validable |
| 6 | `API_CONTRACTS.md` | EXISTS | material conceptual; reconciliar contra Domain Model + matriz + OpenAPI |
| 7 | `AUTHORIZATION_MATRIX.md` | TODO | policy por operación y ownership |
| 8 | `STATE_MACHINES.md` | TODO | eventos, membership, contrato, attempts/submissions, policy, refunds, termo y jobs |
| 9 | `EVENTS_REALTIME_CONTRACT.md` | TODO | envelope, versionado, privacidad, polling V1 y evolución SSE/WS |
| 10 | `ERROR_CONTRACT.md` | TODO | catálogo único de códigos, HTTP y payload seguro |
| 11 | `INTEGRATIONS.md` | TODO | Mercado Pago, OpenPay, storage, correo, webhooks, reconciliación, timeouts/retries |
| 12 | `AUDIT_LOG_CONTRACT.md` | TODO | acciones auditables, before/after, motivos y retención |
| 13 | `NON_FUNCTIONAL_REQUIREMENTS.md` | EXISTS | validar contra Architecture + Domain Model y cerrar gaps de auth/storage/jobs |
| 14 | `BACKEND_TEST_STRATEGY.md` | TODO | unit, integration, contract, concurrency, security, provider y E2E |
| 15 | `FRONTEND_BACKEND_TRACEABILITY.md` | TODO | cobertura de superficies aprobadas y eliminación de fixtures productivos |
| 16 | `ADRs/` | TODO | solo decisiones que cambien arquitectura o introduzcan infraestructura/framework |
| 17 | `BACKEND_READY_CHECKLIST.md` | TODO | gate único previo a implementación masiva y producción |
| 18 | `REQUIREMENTS_TRACEABILITY_MATRIX.md` | EXISTS | enlazar FR/BR con Domain Model y artefactos técnicos finales |
| 19 | `REPOSITORY_SOURCE_OF_TRUTH.md` | EXISTS | reauditar contra HEAD antes de comenzar backend productivo |

## Orden de cierre

```text
SYSTEM_ARCHITECTURE        READY
→ DOMAIN_MODEL             READY
→ DATA_MODEL               NEXT
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

No se considera cerrado un módulo porque exista un endpoint o una tabla. Debe existir trazabilidad completa:

```text
UI/action
→ requirement
→ use case
→ aggregate/policy
→ API
→ authorization
→ transaction/locks
→ DB
→ audit/effects
→ tests
```

Los documentos `EXISTS` no se consideran automáticamente `READY`: fueron creados antes del cierre arquitectónico actual y deben auditarse contra `SYSTEM_ARCHITECTURE.md` + `DOMAIN_MODEL.md`.

## Gaps que el siguiente entregable debe resolver

`DATA_MODEL.md` deberá expresar sin reinterpretar el dominio:

1. `AuthSession`;
2. `EventAccessCode`;
3. `IdempotencyRecord`;
4. `EventFinancialConfiguration` + `InstallmentTemplate`;
5. `ContractLineItemQuote`;
6. configuración estructurada de termo/personalización/evidencia;
7. persistencia o proyección de incidencias de reconciliación;
8. `ExportJob` cuando async se active;
9. estados derivados vs persistidos (`Installment`, termo elegibilidad);
10. constraints/índices P0.

## Regla para agentes

Al completar un entregable:

1. actualizar este tracker;
2. actualizar `docs/INDEX.md` cuando cambie la jerarquía técnica;
3. no marcar `READY` con contradicciones P0;
4. documentar gaps en lugar de resolverlos mediante código ad hoc;
5. no implementar el siguiente nivel hasta que su input precedente esté `READY`.
