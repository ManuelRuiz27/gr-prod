# Índice de Documentación — Plataforma GR

**Baseline normativo:** 1.2  
**Fecha de congelamiento:** 31 de agosto de 2026

> [!IMPORTANT]
> Los documentos listados en el orden normativo son la fuente de verdad del producto. El código legacy, fixtures, prototipos, Stitch y documentación antigua no pueden cambiar estas decisiones. Si existe contradicción, el agente debe reportarla y corregir implementación/documentación subordinada antes de continuar.

---

## Orden Normativo Funcional y Visual

1. [PRODUCT_SCOPE.md](./PRODUCT_SCOPE.md) — frontera del producto.
2. [BUSINESS_RULES.md](./BUSINESS_RULES.md) — invariantes y reglas vinculantes.
3. [SRS.md](./SRS.md) — requisitos funcionales `FR-*`.
4. [ROLES_PERMISSIONS.md](./ROLES_PERMISSIONS.md) — autorización ADMIN/GRADUATE.
5. [UX_FLOWS.md](./UX_FLOWS.md) — recorridos, pantallas y estados UX.
6. [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) — identidad visual, tokens, components, responsive, motion y accesibilidad.
7. [SCREEN_VISUAL_SPECIFICATIONS.md](./SCREEN_VISUAL_SPECIFICATIONS.md) — especificaciones visuales `VS-*` por pantalla.
8. [ANTIGRAVITY_DESIGN_GUIDE.md](./ANTIGRAVITY_DESIGN_GUIDE.md) — límites y reglas de ejecución visual para Antigravity.
9. [FINANCIAL_DOMAIN.md](./FINANCIAL_DOMAIN.md) — ledger, pagos, comprobantes, penalizaciones, cancelaciones y refunds.
10. [SEATING_MAP.md](./SEATING_MAP.md) — croquis y asignación `GroupMember → EventTable`.
11. [DATA_MODEL.md](./DATA_MODEL.md) — entidades, constraints e invariantes de persistencia.
12. [API_CONTRACTS.md](./API_CONTRACTS.md) — contratos REST `/api/v1`.
13. [NON_FUNCTIONAL_REQUIREMENTS.md](./NON_FUNCTIONAL_REQUIREMENTS.md) — seguridad, concurrencia, jobs, storage, performance y NFR-UI.
14. [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) — criterios `AC-*`, `AC-UI-*` y Definition of Done.
15. [REQUIREMENTS_TRACEABILITY_MATRIX.md](./REQUIREMENTS_TRACEABILITY_MATRIX.md) — cobertura funcional y visual trazable.
16. [ROADMAP_IMPLEMENTATION.md](./ROADMAP_IMPLEMENTATION.md) — secuencia funcional + track visual VIS.

---

## Fuentes Técnicas Vinculantes

- [TECH_STACK.md](./TECH_STACK.md) — stack objetivo, infraestructura y ownership técnico.
- [REPOSITORY_SOURCE_OF_TRUTH.md](./REPOSITORY_SOURCE_OF_TRUTH.md) — estado real del código, reusable/legacy/deprecated y estrategia de refactor.

Para decisiones de tecnología prevalece `TECH_STACK.md`.

Para responder **qué existe hoy en código**, prevalece `REPOSITORY_SOURCE_OF_TRUTH.md`, pero este documento no puede inventar/cambiar requisitos de producto o visuales.

`REPOSITORY_SOURCE_OF_TRUTH.md` debe actualizarse durante `GR-00-12 — Impact audit del repositorio contra baseline 1.2`.

---

## Baseline funcional 1.1 incluido en 1.2

El baseline funcional mantiene:

- contrato individual y folio;
- aceptación contractual versionada;
- productos/lugares configurables;
- compras adicionales con catch-up;
- `PaymentSubmission` para comprobantes de transferencia/depósito enviados por GRADUATE;
- método administrativo `DEPOSIT`;
- penalización tardía configurable e idempotente;
- cancelación automática opcional bajo regla explícita;
- políticas de cancelación con rangos y porcentajes dinámicos administrados por ADMIN;
- versionado inmutable de políticas publicadas;
- `CancellationQuote` antes de cancelar;
- refund separado;
- asignación de mesa por persona (`GroupMember`) sin selección de silla;
- termo adicional/entrega cuando se habilite;
- notas internas ADMIN;
- cortes diarios/semanales/mensuales y exportaciones ampliadas.

---

## Baseline visual 1.0 incorporado en 1.2

Se formaliza:

```text
Tema: negro/obsidiana + plateado
Acento: dorado limitado
Display: Cormorant Garamond
UI/datos: Inter
ADMIN: desktop-first
GRADUATE: mobile-first
```

Además:

- design tokens y primitives reutilizables;
- especificaciones `VS-*` por pantalla;
- loading/empty/error/success obligatorios;
- responsive y targets táctiles;
- contraste/focus/keyboard;
- `prefers-reduced-motion`;
- performance de fonts/assets/dependencias;
- alternativa accesible para canvas;
- criterios `AC-UI-*`;
- track `VIS-*` operado preferentemente con Antigravity.

Este baseline visual **no modifica reglas de negocio, API ni datos**.

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

se considera **LEGACY / REFERENCE ONLY** cuando contradiga baseline 1.2.

`README.md` es únicamente punto de entrada/resumen.

---

## Regla para agentes

Antes de implementar un ticket:

```text
1. identificar fila en REQUIREMENTS_TRACEABILITY_MATRIX.md
2. leer documentos normativos del dominio
3. leer UI_DESIGN_SYSTEM/SCREEN_VISUAL_SPECIFICATIONS si toca UI
4. contrastar REPOSITORY_SOURCE_OF_TRUTH.md
5. no reutilizar comportamiento/visual legacy contradictorio
6. citar BR/FR/VS/AC/AC-UI aplicables
7. ejecutar NFR y pruebas correspondientes antes de DONE
```

---

## Próximos tickets autorizados

### Técnico — Codex

```text
GR-00-12 — Impact audit del repositorio contra baseline 1.2
```

### Visual — Antigravity

```text
VIS-01 — Tokens y primitives
```

Preferencia: ejecutar primero `GR-00-12` para confirmar qué foundation frontend puede reutilizarse sin rehacer trabajo visual.