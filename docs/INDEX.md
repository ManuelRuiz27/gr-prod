# Índice de Documentación — Plataforma GR

**Baseline normativo:** 1.3  
**Fecha de actualización:** 5 de septiembre de 2026

> [!IMPORTANT]
> Los documentos listados en el orden normativo son la fuente de verdad del producto. El código legacy, fixtures, prototipos, Stitch y documentación antigua no pueden cambiar estas decisiones. Si existe contradicción, el agente debe reportarla y corregir implementación/documentación subordinada antes de continuar.

---

## Baseline UX 1.3 — corrección de simplificación

La revisión del 5 de septiembre de 2026 detectó que el baseline visual anterior redujo componentes `Card` sin reducir suficientemente la **dashboardización, cantidad de datos visibles, navegación redundante, divisores y falta de responsive real**.

Se incorporan como corrección vinculante:

1. [GRADUATE_UX_SIMPLIFICATION_AUDIT.md](./GRADUATE_UX_SIMPLIFICATION_AUDIT.md) — composición, navegación, prioridad de información y responsive GRADUATE.
2. [ADMIN_UX_SIMPLIFICATION_AUDIT.md](./ADMIN_UX_SIMPLIFICATION_AUDIT.md) — composición, densidad operativa, navegación y responsive ADMIN.
3. [CODEX_UX_SIMPLIFICATION_PLAN.md](./CODEX_UX_SIMPLIFICATION_PLAN.md) — secuencia autorizada para implementar las correcciones.

### Regla de precedencia

Cuando exista contradicción sobre **qué información se muestra, cuánto se muestra, dónde se muestra, navegación visible, cards, divisores o responsive**, los dos documentos `*_UX_SIMPLIFICATION_AUDIT.md` prevalecen sobre:

- `UX_FLOWS.md`;
- `SCREEN_VISUAL_SPECIFICATIONS.md`;
- `UI_REFACTOR_ACCEPTANCE.md`;
- `UI_REFACTOR_ROADMAP.md`;
- `CODEX_UI_REFACTOR_PROMPT.md`;
- implementación frontend existente.

Esta precedencia NO autoriza modificar reglas de negocio, permisos, contratos API, modelo de datos o invariantes financieras. Capacidades marcadas `DEFER UI` se ocultan del MVP visible; no se eliminan del dominio/backend salvo ticket explícito.

---

## Orden Normativo Funcional y Visual

1. [PRODUCT_SCOPE.md](./PRODUCT_SCOPE.md) — frontera del producto.
2. [BUSINESS_RULES.md](./BUSINESS_RULES.md) — invariantes y reglas vinculantes.
3. [SRS.md](./SRS.md) — requisitos funcionales `FR-*`.
4. [ROLES_PERMISSIONS.md](./ROLES_PERMISSIONS.md) — autorización ADMIN/GRADUATE.
5. [GRADUATE_UX_SIMPLIFICATION_AUDIT.md](./GRADUATE_UX_SIMPLIFICATION_AUDIT.md) — corrección UX vinculante GRADUATE.
6. [ADMIN_UX_SIMPLIFICATION_AUDIT.md](./ADMIN_UX_SIMPLIFICATION_AUDIT.md) — corrección UX vinculante ADMIN.
7. [UX_FLOWS.md](./UX_FLOWS.md) — recorridos y estados UX; subordinado a 5–6 en composición/visibilidad.
8. [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) — tokens, components, responsive, motion y accesibilidad.
9. [SCREEN_VISUAL_SPECIFICATIONS.md](./SCREEN_VISUAL_SPECIFICATIONS.md) — especificaciones visuales previas; subordinadas a 5–6 cuando haya conflicto.
10. [ANTIGRAVITY_DESIGN_GUIDE.md](./ANTIGRAVITY_DESIGN_GUIDE.md) — límites de ejecución visual.
11. [FINANCIAL_DOMAIN.md](./FINANCIAL_DOMAIN.md) — ledger, pagos, comprobantes, penalizaciones, cancelaciones y refunds.
12. [SEATING_MAP.md](./SEATING_MAP.md) — croquis y asignación `GroupMember → EventTable`.
13. [DATA_MODEL.md](./DATA_MODEL.md) — entidades, constraints e invariantes de persistencia.
14. [API_CONTRACTS.md](./API_CONTRACTS.md) — contratos REST `/api/v1`.
15. [NON_FUNCTIONAL_REQUIREMENTS.md](./NON_FUNCTIONAL_REQUIREMENTS.md) — seguridad, concurrencia, jobs, storage, performance y NFR-UI.
16. [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) — criterios `AC-*`, `AC-UI-*` y Definition of Done.
17. [REQUIREMENTS_TRACEABILITY_MATRIX.md](./REQUIREMENTS_TRACEABILITY_MATRIX.md) — cobertura funcional y visual trazable.
18. [ROADMAP_IMPLEMENTATION.md](./ROADMAP_IMPLEMENTATION.md) — secuencia funcional existente.

### Plan de ejecución vigente para frontend

- [CODEX_UX_SIMPLIFICATION_PLAN.md](./CODEX_UX_SIMPLIFICATION_PLAN.md)

`CODEX_UI_REFACTOR_PROMPT.md`, `UI_REFACTOR_ACCEPTANCE.md` y `UI_REFACTOR_ROADMAP.md` se conservan como historial del refactor v2, pero **no deben usarse para reintroducir dashboards o superficies descartadas por baseline 1.3**.

---

## Fuentes Técnicas Vinculantes

- [TECH_STACK.md](./TECH_STACK.md) — stack objetivo, infraestructura y ownership técnico.
- [REPOSITORY_SOURCE_OF_TRUTH.md](./REPOSITORY_SOURCE_OF_TRUTH.md) — estado real del código, reusable/legacy/deprecated y estrategia de refactor.

Para decisiones de tecnología prevalece `TECH_STACK.md`.

Para responder **qué existe hoy en código**, prevalece `REPOSITORY_SOURCE_OF_TRUTH.md`, pero este documento no puede inventar/cambiar requisitos de producto o UX.

---

## Baseline funcional heredado

Se mantienen las capacidades funcionales ya definidas, entre ellas:

- contrato individual y folio;
- aceptación contractual;
- productos/lugares configurables;
- compras adicionales con catch-up;
- comprobantes de transferencia/depósito;
- pagos administrativos `CASH`, `TRANSFER`, `DEPOSIT`;
- penalización tardía;
- políticas/cancelaciones/refunds;
- asignación de mesa por persona;
- selección de platillos por persona;
- termo y entrega;
- reportes/cortes/exportaciones.

La simplificación UX no elimina estas capacidades. Solo reduce lo que debe ser protagonista en el MVP y corrige su composición.

---

## Baseline visual

Se conserva:

```text
Tema: negro/obsidiana + plateado
Acento: dorado limitado
Display: Cormorant Garamond
UI/datos: Inter
ADMIN: desktop-first con soporte tablet/mobile operacional
GRADUATE: mobile-first con adaptación tablet/desktop real
```

Nuevas restricciones baseline 1.3:

- menos información simultánea;
- no dashboard por defecto;
- `Card` no es layout;
- las líneas no son sistema de estructura;
- el croquis es workspace visual;
- responsive no puede resolverse solo ensanchando columnas o con `overflow-x-auto`;
- demo/debug UI no aparece frente al cliente;
- funciones no confirmadas pueden conservarse técnicamente pero quedar fuera de navegación MVP.

---

## Documentación legacy / reference only

Documentación antigua fuera de `/docs`, por ejemplo:

```text
ENDPOINTS.md
OPENPAY_SETUP.md
GUIA_PRUEBAS.md
RESULTADOS_PRUEBAS.md
NGROK_SETUP.md
```

se considera **LEGACY / REFERENCE ONLY** cuando contradiga el baseline vigente.

`README.md` es únicamente punto de entrada/resumen.

---

## Regla para agentes

Antes de implementar un ticket frontend:

```text
1. leer PRODUCT_SCOPE/BUSINESS_RULES/ROLES_PERMISSIONS
2. leer GRADUATE_UX_SIMPLIFICATION_AUDIT y/o ADMIN_UX_SIMPLIFICATION_AUDIT
3. identificar requisitos funcionales del dominio
4. leer UX_FLOWS/UI_DESIGN_SYSTEM/SCREEN_VISUAL_SPECIFICATIONS como material subordinado
5. contrastar REPOSITORY_SOURCE_OF_TRUTH
6. no reutilizar visual legacy contradictorio
7. no inventar métricas, módulos ni datos para llenar pantalla
8. ejecutar QA técnico + QA visual responsive real antes de DONE
```

---

## Próximo track autorizado — Codex

```text
UX Simplification
```

Ejecutar por fases según:

[CODEX_UX_SIMPLIFICATION_PLAN.md](./CODEX_UX_SIMPLIFICATION_PLAN.md)

Prioridad actual:

```text
Fase A — Shells + demo/debug cleanup
Fase B — GRADUATE simplification
Fase C — ADMIN core operation
Fase D — ADMIN operational modules
Fase E — Secondary cleanup
```

No ejecutar otro rediseño masivo fuera de este plan.
