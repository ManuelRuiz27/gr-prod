# Índice de Documentación — Plataforma GR

**Baseline normativo:** 1.7  
**Fecha de actualización:** 14 de septiembre de 2026

> Los documentos de `/docs` son la fuente de verdad. Código legacy, fixtures, mocks y prototipos no pueden ampliar ni reducir alcance por sí solos.

## 1. Arquitectura y contratos

Orden rector:

1. `SYSTEM_ARCHITECTURE.md`
2. `DOMAIN_MODEL.md`
3. `TECH_STACK.md`
4. `DATA_MODEL.md`
5. `API_ENDPOINT_MATRIX.md`
6. `API_CONTRACT.openapi.yaml`
7. `AUTHORIZATION_MATRIX.md`
8. `STATE_MACHINES.md`
9. `ERROR_CONTRACT.md`
10. `EVENTS_REALTIME_CONTRACT.md`
11. `INTEGRATIONS.md`
12. `AUDIT_LOG_CONTRACT.md`
13. `ARCHITECTURE_DELIVERABLES.md`

`API_CONTRACTS.md` es referencia conceptual anterior cuando contradiga la matriz/OpenAPI vigente.

## 2. Precedencia funcional

```text
PRODUCT_SCOPE.md
→ BUSINESS_RULES.md
→ SRS.md
→ ROLES_PERMISSIONS.md
→ amendments específicos posteriores
→ arquitectura/datos/API
→ implementación
```

Los amendments posteriores solo prevalecen dentro de su alcance declarado.

## 3. Croquis / seating — baseline vigente 2026-09-14

Documentos rectores, en orden:

1. `SEATING_CATALOG_CONTRACT.md` — origen y ciclo de vida del croquis.
2. `SEATING_QUANTITY_CONTRACT.md` — distribución/ocupación por cantidades.
3. `SEATING_MAP.md` — baseline visual/operativo.

`SEATING_AUTOMATION_CONTRACT.md` se conserva como **RETIRED / HISTÓRICO**.

### Decisión del cliente

El producto utilizará un catálogo semi-fijo de croquis precargados/versionados, estimado inicialmente en aproximadamente 15 plantillas.

No forma parte de la superficie vigente:

```text
upload arbitrario PNG/JPG/PDF
OpenCV/Tesseract/OCR
análisis automático de planos
review/import de candidatos detectados
creación/bulk de mesas estructurales en runtime
edición libre de geometry/label/shape/capacity del catálogo
eliminación estructural de mesas del croquis
```

Se conserva:

```text
ADMIN selecciona plantilla aprobada por evento
GRADUATE ve la plantilla asociada
zoom/pan/selección operacional
block/unblock
ocupación/disponibilidad backend-authoritative
TableAllocation/TableAssignment según contrato vigente
concurrencia
realtime agregado
privacidad/auditoría
```

### Precedencia sobre contratos API anteriores

`SEATING_CATALOG_CONTRACT.md` es una adenda posterior y prevalece sobre filas/operations dinámicas de seating que aún permanezcan en `API_ENDPOINT_MATRIX.md`, `API_CONTRACT.openapi.yaml` o `AUTHORIZATION_MATRIX.md` hasta su regeneración.

Se consideran RETIRED:

```text
adminUploadSeatingBackground
adminRemoveSeatingBackground
adminCreateTable
adminBulkCreateTables
adminImportDetectedTables
adminUpdateTable para edición estructural
adminDeleteTable para edición estructural
```

Ningún agente debe implementar, ampliar o consumir estas operaciones para nueva funcionalidad.

`adminUpdateSeatingMap` solo puede conservar semántica de asociación de `template_id` + `template_version` y metadata permitida; no es editor de layout.

## 4. Baseline funcional general

Se mantienen, entre otros:

- contrato individual y folio;
- productos/lugares configurables;
- plan financiero y pagos;
- comprobantes y pagos manuales;
- cancelaciones/refunds;
- croquis por catálogo y asignación de mesas;
- platillos;
- termos;
- reportes/exportaciones;
- notas y auditoría.

Siguen fuera:

- selección individual de silla;
- CAD;
- reconocimiento de planos/OCR/CV como feature;
- invitaciones digitales;
- RSVP;
- QR/check-in;
- scanner;
- multi-tenant;
- CFDI.

## 5. UX

Para composición visual y simplificación prevalecen:

1. `GRADUATE_UX_SIMPLIFICATION_AUDIT.md`
2. `ADMIN_UX_SIMPLIFICATION_AUDIT.md`
3. `CODEX_UX_SIMPLIFICATION_PLAN.md`
4. `UX_FLOWS.md`
5. `UI_DESIGN_SYSTEM.md`
6. `SCREEN_VISUAL_SPECIFICATIONS.md`
7. `ANTIGRAVITY_DESIGN_GUIDE.md`

La precedencia visual no modifica reglas de dominio, autorización, datos ni API.

## 6. Fuentes técnicas

- `REPOSITORY_SOURCE_OF_TRUTH.md`: qué existe realmente en código; no crea requisitos.
- `TECH_STACK.md`: stack e infraestructura.
- `.agents/rules/gr-project.md`: reglas generales para agentes.
- `.agents/rules/gr-frontend.md`: reglas frontend.
- `.agents/rules/gr-backend.md`: reglas backend.

## 7. Reglas para agentes

### Frontend

```text
leer INDEX + contratos aplicables
fixture != requisito
mock != fallback productivo
no mover reglas autoritativas al cliente
para seating usar catálogo; no reintroducir upload/OCR/editor estructural
QA técnico + visual cuando aplique
```

### Backend

```text
leer INDEX/SYSTEM/DOMAIN/DATA/API
resolver authorization/locks/idempotency/audit/outbox
para seating validar template_id/version contra catálogo aprobado
no implementar operationIds retirados aunque existan en contratos históricos
```

## 8. Nota de reconciliación contractual

El cambio a catálogo no exige reintroducir visión/OCR ni un CRUD de plantillas. El siguiente ciclo de mantenimiento de contratos debe retirar de la matriz/OpenAPI/autorización los operationId marcados RETIRED y mantener únicamente la selección/asociación de plantilla y la operación de ocupación/asignación.
