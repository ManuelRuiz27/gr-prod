# Índice de Documentación — Plataforma GR

**Baseline normativo:** 1.4  
**Fecha de actualización:** 7 de septiembre de 2026

> [!IMPORTANT]
> Los documentos de `/docs` son la fuente de verdad. Código legacy, fixtures, mocks, Stitch/prototipos y documentación antigua no pueden cambiar estas decisiones.

---

## Arquitectura contract-first 1.4

Se incorporan como documentos rectores:

1. [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) — arquitectura objetivo, fronteras, transacciones, integraciones y protocolo de implementación.
2. [ARCHITECTURE_DELIVERABLES.md](./ARCHITECTURE_DELIVERABLES.md) — estado y orden de cierre previo al backend productivo.
3. [SEATING_AUTOMATION_CONTRACT.md](./SEATING_AUTOMATION_CONTRACT.md) — ampliación aprobada para detección/OCR asistidos del croquis.

### Precedencia técnica

```text
SYSTEM_ARCHITECTURE.md
→ TECH_STACK.md
→ DATA_MODEL.md / API_CONTRACTS.md / NON_FUNCTIONAL_REQUIREMENTS.md
→ REPOSITORY_SOURCE_OF_TRUTH.md
→ código existente
```

`SYSTEM_ARCHITECTURE.md` organiza la implementación y no puede alterar silenciosamente reglas funcionales.

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
15. [API_CONTRACTS.md](./API_CONTRACTS.md)
16. [NON_FUNCTIONAL_REQUIREMENTS.md](./NON_FUNCTIONAL_REQUIREMENTS.md)
17. [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md)
18. [REQUIREMENTS_TRACEABILITY_MATRIX.md](./REQUIREMENTS_TRACEABILITY_MATRIX.md)
19. [ROADMAP_IMPLEMENTATION.md](./ROADMAP_IMPLEMENTATION.md)

---

## Fuentes técnicas vinculantes

- [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) — arquitectura, ownership de módulos, límites y estrategia contract-first.
- [TECH_STACK.md](./TECH_STACK.md) — stack objetivo e infraestructura.
- [REPOSITORY_SOURCE_OF_TRUTH.md](./REPOSITORY_SOURCE_OF_TRUTH.md) — estado real de código y estrategia `REUSE/ADAPT/REPLACE/REMOVE`.
- [ARCHITECTURE_DELIVERABLES.md](./ARCHITECTURE_DELIVERABLES.md) — gate documental.

Para tecnología base prevalece `TECH_STACK.md`, salvo refinamientos explícitos cerrados por `SYSTEM_ARCHITECTURE.md` donde el stack anterior dejaba una decisión abierta.

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
Storage: adapter backend; target Supabase Storage privado
Payments: Mercado Pago primario + OpenPay secundario
API: REST /api/v1 contract-first
```

Automatización de croquis V1:

```text
PDF.js + OpenCV.js + Tesseract.js + Web Worker
```

Las versiones concretas se fijan al implementar tras verificar releases/documentación vigentes.

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

---

## Regla para agentes frontend

```text
1. leer PRODUCT_SCOPE/BUSINESS_RULES/ROLES_PERMISSIONS
2. leer audits UX aplicables
3. identificar requisitos funcionales
4. consultar UX/design system
5. contrastar REPOSITORY_SOURCE_OF_TRUTH
6. fixture != requisito
7. mock != fallback productivo
8. ejecutar QA técnico + visual
```

---

## Regla para agentes backend

```text
1. leer INDEX
2. leer SYSTEM_ARCHITECTURE
3. localizar FR/BR/rol
4. localizar dominio/modelo
5. localizar operationId en API_ENDPOINT_MATRIX/OpenAPI
6. definir autorización/transacción/idempotencia/audit
7. implementar
8. ejecutar tests
9. actualizar trazabilidad
```

Mientras `API_ENDPOINT_MATRIX.md` y `API_CONTRACT.openapi.yaml` permanezcan `TODO`, no deben inventarse endpoints para hacer funcionar una pantalla.

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

Orden y estado oficial:

[ARCHITECTURE_DELIVERABLES.md](./ARCHITECTURE_DELIVERABLES.md)
