# B1 — Handoff para el nuevo backend GR

**Fecha:** 2026-11-18. **Estado:** DISEÑO DOCUMENTAL COMPLETADO, **NO** implementación, despliegue ni QA PASS.  
**Ubicación temporal:** `ManuelRuiz27/gr-prod@integration/monkavia-gr-access/docs/`. No se crearon ramas adicionales; el repositorio backend independiente aún no existe.  
**Producto:** GR completo primero; integración Monkavia progresiva. CEO sigue pendiente de aprobar 27 casos y 40 mocks del frontend `GR-app/main`.

## Entregables B1 (leer en este orden)

1. [Baseline de requisitos y contrato de frontera](GR_MONKAVIA_BACKEND_BASELINE_V1.md): GR administra negocio y agrupación por mesas; Monkavia genera `rightId` por derecho, acomoda y hace check-in.
2. [ADR de arquitectura](B1_ADR_ARQUITECTURA_BACKEND_GR.md): topología, módulos NestJS, autoridad de datos, HMAC, outbox, lease y decisiones/gates.
3. [Modelo de datos y migración](B1_MODELO_DATOS_MIGRACION.md): auditoría de 49 modelos, estructuras reutilizables, brecha nominal/cantidades, legal, enrollment y consistencia entre DB.
4. [Matriz API y validaciones](B1_MATRIZ_API_VALIDACIONES.md): rutas P0, autenticación/ownership, 15 endpoints GR_ACCESS, mapeo hacia 18 privadas y DTO de cantidades.
5. [Inventario de 129 operaciones](B1_INVENTARIO_129_ENDPOINTS.md): catálogo completo REUSE-CANDIDATE/REVIEW/ADAPT/HARDEN/DEPRECATE/RESTRICT/BLOCKED, no asumir uso productivo.
6. [Plan de pruebas, seguridad y gates](B1_PLAN_TDD_SEGURIDAD_GATES.md): paquetes P0-01..08 y casos RED para identidad, legal, pagos, grouping, interop y SQL.
7. [Trazabilidad funcional](GR_BACKEND_TRACEABILITY_MATRIX.md): UC-ADM-01..15, UC-GRA-01..12, 10 escenarios GR y accesos Monkavia.

## Contratos normativos externos

- GR público histórico: `gr-prod/main/docs/API_CONTRACT.openapi.yaml` (129 operaciones legacy, no lista automática de endpoints nuevos).
- Agrupación por cantidades histórica: `gr-prod/main/docs/SEATING_QUANTITY.openapi.yaml` (4 operaciones, aún no desplegadas; el nombre `table-allocations` no obliga a crear nuevo modelo `TableAllocation`).
- Fachada GR_ACCESS: [GR_ACCESS_INTEGRATION.openapi.yaml](GR_ACCESS_INTEGRATION.openapi.yaml) (15 operaciones, 0.3.0-draft).
- Monkavia privado: `ManuelRuiz27/invitacionespremium@monkavia-gr/docs/04-tecnico/GR_PRIVATE_API.openapi.yaml` **2.1.0 diseño** (18 operaciones; `memberships[].groups` y `rightId` generado por Monkavia).
- Reglas de negocio GR: `GR-app/main/docs/USE_CASES_GR_MOCKS.md`, `gr-prod/main/docs/FINANCIAL_DOMAIN.md`, `ERROR_CONTRACT.md` y `SEATING_QUANTITY_CONTRACT.md`. En conflicto de mesa, respetar aclaración de producto GR sólo agrupa, Monkavia acomoda.

## Decisiones cerradas

- No hay `AccessUnit` ni `TableAllocation` como **nuevos** modelos comerciales GR ni obligación de UUID por lugar desde GR.
- GR y Monkavia no comparten DB. GR valida contratos/pagos; Monkavia administra acceso, QR, Staff y derecho individual.
- GR `OPEN` es condición de alta. Cuenta existente debe autenticarse para segundo evento, sin duplicar `Account` y con una sola membresía/evento.
- El contrato aceptado requiere documento legible y snapshot inmutable; se bloquea aceptación real sin versión legal aprobada.
- `GR_ACCESS` admite 5,000 derechos, QR familiar con entrada parcial, QR NO_DINNER individual y liberaciones independientes.
- Integración con HMAC, idempotencia, versiones, outbox transaccional y lease 30 s; GR no promete bloqueo financiero instantáneo entre bases.

## Decisiones/revisiones que bloquean ejecución

| ID | Bloqueo | Salida necesaria |
| --- | --- | --- |
| D1 | Nuevo repositorio backend aún no creado | Nombre/URL/privacidad/permisos y CI base; no crear un repo por suposición |
| D2 | Schema legacy `TableAssignment` nominal, while GR requires cantidad comercial | Auditar CRUD actual, definir persistencia mínima, revisar backfill con fixtures; no reintroducir modelo comercial rechazado |
| D3 | Documento legal y política final | DEC-01, validación jurídica y versiones aprobadas |
| D4 | Cuenta existente nueva graduación | DEC-02 CEO para UI/copy y ruta pública; solución técnica definida |
| D5 | Prototipos GR pendientes de aprobación | Acta CEO con commit de 40 mocks y 27 UC |
| D6 | Monkavia V2.1 aún diseño | Implementación independiente, esquema, tests L3 y regresión M01 |
| D7 | Persistencia sesión, hosting y secretos | ADR de despliegue, CORS/cookie/CSRF, backups/restore |
| D8 | Q3 multimesa | Sin gate especial mientras CEO no determine; no bloquear B1 |

## Siguiente etapa: B2

**B2 — Foundation ejecutable del repositorio backend GR**, una vez disponible su URL:
1. Inicializar NestJS modular + TypeScript + Prisma/PostgreSQL, entorno local reproducible y CI.
2. Generar OpenAPI GR v1 consolidado a partir de rutas **aprobadas**, no copiando 129 endpoints indiscriminadamente.
3. Instalar request-id, errores canónicos, DTO strict validation, RBAC+ownership y auditoría.
4. Preparar modelo de sesiones/contratos y pruebas TDD RED; migración en entorno aislado, no productivo.
5. Integrar Outbox/SyncCursor y adapter de cantidades V2.1 en modo contrato/mock hasta que Monkavia esté implementado.
6. No conectar frontend productivo ni aceptar documentos reales antes del CEO y los gates legales/QA.

**Regla de cierre:** este handoff no declara que código, SQL, parser OpenAPI, test de integración, E2E o carga hayan sido ejecutados. No autoriza despliegue.
