# Índice de Documentación — Plataforma GR

**Baseline normativo:** 1.4  
**Fecha de actualización:** 7 de septiembre de 2026

> [!IMPORTANT]
> Los documentos de `/docs` son la fuente de verdad. Código legacy, fixtures, mocks, Stitch/prototipos y documentación antigua no pueden cambiar estas decisiones.

---

## Arquitectura contract-first 1.4

Se incorporan como documentos rectores:

1. [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) — arquitectura objetivo, fronteras, transacciones, integraciones y protocolo de implementación.
2. [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) — bounded contexts, aggregates, entidades, value objects, policies, invariantes y transacciones del dominio.
3. [DATA_MODEL.md](./DATA_MODEL.md) — schema objetivo PostgreSQL/Prisma, relaciones, constraints, índices, locking y migración legacy.
4. [API_ENDPOINT_MATRIX.md](./API_ENDPOINT_MATRIX.md) — inventario canónico de `operationId`, rutas, actores, transacciones, idempotencia, audit/outbox y pruebas.
5. [ARCHITECTURE_DELIVERABLES.md](./ARCHITECTURE_DELIVERABLES.md) — estado y orden de cierre previo al backend productivo.
6. [SEATING_AUTOMATION_CONTRACT.md](./SEATING_AUTOMATION_CONTRACT.md) — ampliación aprobada para detección/OCR asistidos del croquis.

### Precedencia técnica

```text
SYSTEM_ARCHITECTURE.md
→ DOMAIN_MODEL.md
→ TECH_STACK.md
→ DATA_MODEL.md
→ API_ENDPOINT_MATRIX.md
→ API_CONTRACT.openapi.yaml cuando esté READY
→ API_CONTRACTS.md / NON_FUNCTIONAL_REQUIREMENTS.md
→ REPOSITORY_SOURCE_OF_TRUTH.md
→ código existente
```

`SYSTEM_ARCHITECTURE.md` organiza la implementación y no puede alterar silenciosamente reglas funcionales.

`DOMAIN_MODEL.md` define autoridad semántica, aggregates, ownership e invariantes.

`DATA_MODEL.md` expresa esas decisiones en PostgreSQL/Prisma. Define qué se persiste, qué se deriva, FKs, constraints, índices, locks y migración; no crea reglas comerciales nuevas.

`API_ENDPOINT_MATRIX.md` define las operaciones HTTP canónicas. Cuando `API_CONTRACTS.md` anterior proponga un alias/ruta contradictoria, prevalece la matriz y después OpenAPI.

`SEATING_AUTOMATION_CONTRACT.md` es una extensión funcional posterior y prevalece únicamente sobre afirmaciones previas que excluyan el reconocimiento automático de planos o limiten el fondo a uso exclusivamente manual.

---

## Baseline UX 1.3 — corrección de simplificación

La revisión del 5 de septiembre de 2026 detectó que el baseline visual anterior redujo componentes `Card` sin reducir suficientemente la dashboardización, cantidad de datos visibles, navegación redundante, divisores y falta de responsive real.

Se mantienen como vinculantes:

1. [GRADUATE_UX_SIMPLIFICATION_AUDIT.md](./GRADUATE_UX_SIMPLIFICATION_AUDIT.md)
2. [ADMIN_UX_SIMPLIFICATION_AUDIT.md](./ADMIN_UX_SIMPLIFICATION_AUDIT.md)
3. [CODEX_UX_SIMPLIFICATION_PLAN.md](./CODEX_UX_SIMPLIFICATION_PLAN.md)

### Regla de precedencia visual

Cuando exista contradicción sobre información visible, composición, navegación, cards, divisores o responsive, los documentos `*_UX_SIMPLIFICATION_AUDIT.md` prevalecen sobre:

- `UX_FLOWS.md`;
- `SCREEN_VISUAL_SPECIFICATIONS.md`;
- `UI_REFACTOR_ACCEPTANCE.md`;
- `UI_REFACTOR_ROADMAP.md`;
- `CODEX_UI_REFACTOR_PROMPT.md`;
- implementación frontend anterior.

Esta precedencia no modifica reglas de negocio, permisos, contratos API, modelo de datos ni invariantes financieras.

---

## Orden normativo funcional y visual

1. [PRODUCT_SCOPE.md](./PRODUCT_SCOPE.md) — frontera del producto.
2. [BUSINESS_RULES.md](./BUSINESS_RULES.md) — invariantes y reglas vinculantes.
3. [SRS.md](./SRS.md) — requisitos `FR-*`.
4. [ROLES_PERMISSIONS.md](./ROLES_PERMISSIONS.md) — autorización `ADMIN/GRADUATE`.
5. [SEATING_AUTOMATION_CONTRACT.md](./SEATING_AUTOMATION_CONTRACT.md) — extensión específica de croquis aprobada posteriormente.
6. [GRADUATE_UX_SIMPLIFICATION_AUDIT.md](./GRADUATE_UX_SIMPLIFICATION_AUDIT.md)
7. [ADMIN_UX_SIMPLIFICATION_AUDIT.md](./ADMIN_UX_SIMPLIFICATION_AUDIT.md)
8. [UX_FLOWS.md](./UX_FLOWS.md)
9. [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md)
10. [SCREEN_VISUAL_SPECIFICATIONS.md](./SCREEN_VISUAL_SPECIFICATIONS.md)
11. [ANTIGRAVITY_DESIGN_GUIDE.md](./ANTIGRAVITY_DESIGN_GUIDE.md)
12. [FINANCIAL_DOMAIN.md](./FINANCIAL_DOMAIN.md)
13. [SEATING_MAP.md](./SEATING_MAP.md)
14. [DATA_MODEL.md](./DATA_MODEL.md)
15. [API_ENDPOINT_MATRIX.md](./API_ENDPOINT_MATRIX.md)
16. [API_CONTRACTS.md](./API_CONTRACTS.md)
17. [NON_FUNCTIONAL_REQUIREMENTS.md](./NON_FUNCTIONAL_REQUIREMENTS.md)
18. [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md)
19. [REQUIREMENTS_TRACEABILITY_MATRIX.md](./REQUIREMENTS_TRACEABILITY_MATRIX.md)
20. [ROADMAP_IMPLEMENTATION.md](./ROADMAP_IMPLEMENTATION.md)

---

## Fuentes técnicas vinculantes

- [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) — arquitectura, ownership de módulos, límites y estrategia contract-first.
- [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) — lenguaje ubicuo, aggregates, entidades, value objects, policies, invariantes, transacciones y ports.
- [DATA_MODEL.md](./DATA_MODEL.md) — persistencia objetivo, constraints PostgreSQL, índices, locking y estrategia de migración.
- [API_ENDPOINT_MATRIX.md](./API_ENDPOINT_MATRIX.md) — inventario HTTP canónico; una operación por caso de uso.
- [TECH_STACK.md](./TECH_STACK.md) — stack objetivo e infraestructura.
- [REPOSITORY_SOURCE_OF_TRUTH.md](./REPOSITORY_SOURCE_OF_TRUTH.md) — estado real de código y estrategia `REUSE/ADAPT/REPLACE/REMOVE`.
- [ARCHITECTURE_DELIVERABLES.md](./ARCHITECTURE_DELIVERABLES.md) — gate documental.

Para tecnología base prevalece `TECH_STACK.md`, salvo refinamientos explícitos cerrados por `SYSTEM_ARCHITECTURE.md` donde el stack anterior dejaba una decisión abierta.

Para semántica de dominio, aggregates e invariantes prevalece `DOMAIN_MODEL.md`, subordinado a las reglas funcionales superiores.

Para persistencia, `DATA_MODEL.md` prevalece sobre `schema.prisma` legacy. Ningún model legacy crea requisito.

Para operaciones HTTP, `API_ENDPOINT_MATRIX.md` prevalece sobre rutas legacy y sobre `API_CONTRACTS.md` cuando exista conflicto; OpenAPI, una vez `READY`, será el contrato ejecutable de esas mismas operaciones.

Para responder qué existe hoy en código prevalece `REPOSITORY_SOURCE_OF_TRUTH.md`; no puede inventar requisitos.

---

## Baseline funcional vigente

Se mantienen:

- contrato individual y folio;
- aceptación contractual;
- productos/lugares configurables;
- compras adicionales con catch-up;
- comprobantes de transferencia/depósito;
- pagos administrativos `CASH`, `TRANSFER`, `DEPOSIT`;
- Mercado Pago primario y OpenPay secundario;
- penalización tardía;
- políticas/cancelaciones/refunds;
- asignación `GroupMember → EventTable`;
- selección de platillo por persona;
- termo y entrega;
- reportes/cortes/exportaciones;
- notas y auditoría.

Ampliación 1.4 de croquis:

- PNG/JPG/JPEG/PDF de una página;
- detección automática asistida de mesas circulares y rectangulares/cuadradas;
- OCR de numeración cuando exista;
- overlay editable;
- revisión humana obligatoria;
- importación final transaccional.

Siguen fuera:

- selección individual de silla;
- CAD;
- ML entrenado/servicio IA obligatorio para reconocimiento;
- invitaciones digitales;
- RSVP;
- QR/check-in;
- scanner;
- multi-tenant;
- CFDI.

---

## Baseline técnico

```text
Frontend: React + TypeScript + Vite
Canvas: React-Konva
Backend: NestJS + TypeScript
ORM: Prisma
DB: PostgreSQL administrado en Supabase
DB schema objetivo: privado de aplicación (`app` recomendado)
Storage: adapter backend; target Supabase Storage privado
Payments: Mercado Pago primario + OpenPay secundario
API: REST /api/v1 contract-first
```

Automatización de croquis V1:

```text
PDF.js + OpenCV.js + Tesseract.js + Web Worker
```

Persistencia crítica cerrada por `DATA_MODEL.md`:

```text
NUMERIC exacto para dinero
coordenadas normalizadas no Float
idempotencia persistida
outbox PostgreSQL
same-event FKs
states financieros/operativos derivados cuando corresponda
schema legacy reemplazado de forma incremental
```

Contrato HTTP cerrado por `API_ENDPOINT_MATRIX.md`:

```text
129 operaciones HTTP canónicas
7 jobs internos sin controllers públicos
sin aliases global/event-scoped innecesarios
create event compuesto/atómico
OCR local + table import transaccional
exports async job-based
reconciliation explícita de conflictos financieros
```

Las versiones concretas de librerías se fijan al implementar tras verificar releases/documentación vigentes.

---

## Baseline visual

```text
Tema: negro/obsidiana + plateado
Acento: dorado limitado
Display: Cormorant Garamond
UI/datos: Inter
ADMIN: desktop-first con soporte tablet/mobile operacional
GRADUATE: mobile-first con adaptación tablet/desktop real
```

Restricciones vigentes:

- menos información simultánea;
- no dashboard por defecto;
- `Card` no es layout;
- líneas/divisores no son sistema de estructura;
- el croquis es workspace visual;
- responsive no se resuelve solo con columnas anchas u `overflow-x-auto`;
- demo/debug UI no aparece ante el cliente;
- capacidades `DEFER UI` pueden seguir en dominio sin aparecer en navegación MVP.

---

## Frontend aprobado

El frontend aprobado por cliente es referencia de superficies y flujos visibles, no fuente autónoma de reglas.

Los planes y documentos de refactor UX se conservan como historial y baseline visual. No deben reintroducir dashboards o superficies descartadas.

Mocks/fixtures pueden seguir existiendo para demo/test, pero producción debe sustituirlos por adapters API explícitos. Nunca fallback silencioso a mock.

---

## Documentación legacy / reference only

Documentación antigua fuera de `/docs`, por ejemplo:

```text
ENDPOINTS.md
OPENPAY_SETUP.md
GUIA_PRUEBAS.md
RESULTADOS_PRUEBAS.md
NGROK_SETUP.md
contratos api.txt
srs.txt
```

es `LEGACY / REFERENCE ONLY` cuando contradiga el baseline vigente.

`README.md` es punto de entrada/resumen.

El `backend/prisma/schema.prisma` vigente también es `LEGACY IMPLEMENTATION` frente a `DATA_MODEL.md` 2.0 hasta completar su migración controlada.

`API_CONTRACTS.md` sigue siendo referencia conceptual útil, pero rutas/aliases incompatibles con `API_ENDPOINT_MATRIX.md` no son normativos.

---

## Regla para agentes frontend

```text
1. leer PRODUCT_SCOPE/BUSINESS_RULES/ROLES_PERMISSIONS
2. leer audits UX aplicables
3. identificar requisitos funcionales
4. consultar UX/design system
5. localizar operationId en API_ENDPOINT_MATRIX/OpenAPI
6. fixture != requisito
7. mock != fallback productivo
8. ejecutar QA técnico + visual
```

---

## Regla para agentes backend

```text
1. leer INDEX
2. leer SYSTEM_ARCHITECTURE
3. leer DOMAIN_MODEL
4. leer DATA_MODEL
5. leer API_ENDPOINT_MATRIX
6. localizar FR/BR/AC/rol aplicable
7. identificar aggregate/policy/tablas/constraints/locks
8. localizar mismo operationId en OpenAPI cuando esté READY
9. definir autorización/idempotencia/audit/outbox
10. implementar
11. ejecutar tests
12. actualizar trazabilidad
```

`API_ENDPOINT_MATRIX.md` ya está `READY`; mientras `API_CONTRACT.openapi.yaml` permanezca `TODO`, no deben implementarse controllers/rutas productivas que congelen schemas HTTP por inferencia.

Tampoco debe reemplazarse el `schema.prisma` legacy de forma destructiva antes de completar la secuencia de migración definida por `DATA_MODEL.md`.

---

## Track vigente

Frontend:

```text
Baseline visual aprobado / demo disponible
```

Arquitectura/backend:

```text
Architecture Closure → Backend Production
```

Estado actual:

```text
SYSTEM_ARCHITECTURE    READY
DOMAIN_MODEL           READY
DATA_MODEL             READY
API_ENDPOINT_MATRIX    READY
API_CONTRACT.openapi   NEXT
```

Orden y estado oficial:

[ARCHITECTURE_DELIVERABLES.md](./ARCHITECTURE_DELIVERABLES.md)
