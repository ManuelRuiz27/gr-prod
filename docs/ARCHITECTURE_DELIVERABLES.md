# Plataforma GR — Entregables de Arquitectura

**Documento:** `ARCHITECTURE_DELIVERABLES.md`  
**Versión:** 1.7  
**Fecha:** 14 de septiembre de 2026  
**Objetivo:** cerrar contract-first el backend antes de producción.

Estados:

```text
READY        = suficiente como input normativo
EXISTS       = existe y requiere reconciliación/endurecimiento
TODO         = debe crearse
REFERENCE    = auxiliar/no normativo
RETIRED      = decisión anterior conservada solo como historial
```

| # | Entregable | Estado | Resultado requerido |
|---:|---|---|---|
| 1 | `SYSTEM_ARCHITECTURE.md` | READY | arquitectura y límites |
| 2 | `DOMAIN_MODEL.md` | READY | dominio, policies e invariantes |
| 3 | `DATA_MODEL.md` | READY | persistencia objetivo |
| 4 | `API_ENDPOINT_MATRIX.md` | READY | inventario canónico general; seating sujeto a amendment de catálogo |
| 5 | `API_CONTRACT.openapi.yaml` | READY | contrato general; seating dinámico histórico queda superseded por catálogo |
| 6 | `API_CONTRACTS.md` | EXISTS | referencia conceptual anterior |
| 7 | `AUTHORIZATION_MATRIX.md` | READY | autorización; operations seating retiradas no deben consumirse |
| 8 | `STATE_MACHINES.md` | READY | máquinas de estado |
| 9 | `EVENTS_REALTIME_CONTRACT.md` | READY | outbox/realtime |
| 10 | `ERROR_CONTRACT.md` | READY | errores canónicos |
| 11 | `INTEGRATIONS.md` | READY | pagos/storage/email/webhooks |
| 12 | `AUDIT_LOG_CONTRACT.md` | EXISTS | contrato presente; validar estado contra implementación vigente |
| 13 | `NON_FUNCTIONAL_REQUIREMENTS.md` | EXISTS | gaps finales de runtime |
| 14 | `BACKEND_TEST_STRATEGY.md` | TODO | estrategia de pruebas |
| 15 | `FRONTEND_BACKEND_TRACEABILITY.md` | EXISTS | mantener alineado a superficies vigentes |
| 16 | `ADRs/` | TODO | solo decisiones arquitectónicas relevantes |
| 17 | `BACKEND_READY_CHECKLIST.md` | TODO | gate de producción |
| 18 | `REQUIREMENTS_TRACEABILITY_MATRIX.md` | EXISTS | trazabilidad FR/BR/técnica |
| 19 | `REPOSITORY_SOURCE_OF_TRUTH.md` | EXISTS | reauditar contra HEAD |
| 20 | `SEATING_CATALOG_CONTRACT.md` | READY | catálogo semi-fijo precargado; reemplaza upload/OCR/editor dinámico |
| 21 | `SEATING_AUTOMATION_CONTRACT.md` | RETIRED | histórico; no implementar |

## Amendment de seating — 2026-09-14

Decisión cliente:

```text
aprox. 15 croquis habituales
→ catálogo precargado/versionado
→ selección por evento
→ sin upload/detección/OCR/editor estructural en runtime
```

Documentos vigentes:

```text
SEATING_CATALOG_CONTRACT.md
→ SEATING_QUANTITY_CONTRACT.md
→ SEATING_MAP.md
```

Funciones retiradas:

```text
adminUploadSeatingBackground
adminRemoveSeatingBackground
adminCreateTable
adminBulkCreateTables
adminImportDetectedTables
adminUpdateTable para edición estructural
adminDeleteTable para edición estructural
```

Mientras esos operationId permanezcan en la matriz/OpenAPI/autorización históricos, `SEATING_CATALOG_CONTRACT.md` tiene precedencia y los agentes deben tratarlos como `RETIRED`.

La siguiente regeneración de contratos HTTP deberá eliminarlos/reconciliarlos sin reintroducir funcionalidad equivalente.

## Gate general

No se considera cerrado un módulo porque exista un endpoint o una tabla:

```text
UI/action
→ requirement
→ use case
→ aggregate/policy
→ API/authorization
→ DB/locks
→ idempotency
→ audit/outbox
→ tests
```

## Reglas para agentes

1. leer `INDEX`, arquitectura, dominio, datos y contratos aplicables;
2. amendments posteriores tienen precedencia solo en su alcance;
3. no implementar una operación marcada `RETIRED` aunque exista código/fixture/contrato histórico;
4. no marcar READY con gaps P0;
5. actualizar contratos antes de ampliar código ante una contradicción;
6. mocks/fixtures/rutas legacy no son fuente contractual.
