# Índice de Documentación — Plataforma GR

**Baseline normativo:** 1.1  
**Fecha de congelamiento:** 31 de agosto de 2026

> [!IMPORTANT]
> Los documentos listados en el orden normativo son la fuente de verdad del producto. El código legacy, fixtures, prototipos y documentación antigua no pueden cambiar estas decisiones. Si existe una contradicción, el agente debe reportarla y corregir implementación/documentación subordinada antes de continuar.

---

## Orden Normativo Funcional

1. [PRODUCT_SCOPE.md](./PRODUCT_SCOPE.md) — frontera del producto.
2. [BUSINESS_RULES.md](./BUSINESS_RULES.md) — invariantes y reglas vinculantes.
3. [SRS.md](./SRS.md) — requisitos funcionales `FR-*`.
4. [ROLES_PERMISSIONS.md](./ROLES_PERMISSIONS.md) — autorización ADMIN/GRADUATE.
5. [UX_FLOWS.md](./UX_FLOWS.md) — recorridos, pantallas y estados UX.
6. [FINANCIAL_DOMAIN.md](./FINANCIAL_DOMAIN.md) — ledger, pagos, comprobantes, penalizaciones, cancelaciones y refunds.
7. [SEATING_MAP.md](./SEATING_MAP.md) — croquis y asignación `GroupMember → EventTable`.
8. [DATA_MODEL.md](./DATA_MODEL.md) — entidades, constraints e invariantes de persistencia.
9. [API_CONTRACTS.md](./API_CONTRACTS.md) — contratos REST `/api/v1`.
10. [NON_FUNCTIONAL_REQUIREMENTS.md](./NON_FUNCTIONAL_REQUIREMENTS.md) — seguridad, concurrencia, jobs, storage, observabilidad y operación.
11. [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) — criterios `AC-*` y Definition of Done.
12. [REQUIREMENTS_TRACEABILITY_MATRIX.md](./REQUIREMENTS_TRACEABILITY_MATRIX.md) — cobertura requisito → regla → UX → datos → API → QA.
13. [ROADMAP_IMPLEMENTATION.md](./ROADMAP_IMPLEMENTATION.md) — secuencia de implementación posterior al baseline.

---

## Fuentes Técnicas Vinculantes

- [TECH_STACK.md](./TECH_STACK.md) — stack objetivo, infraestructura y ownership técnico.
- [REPOSITORY_SOURCE_OF_TRUTH.md](./REPOSITORY_SOURCE_OF_TRUTH.md) — estado real del código, reusable/legacy/deprecated y estrategia de refactor.

Para decisiones de tecnología prevalece `TECH_STACK.md`.

Para responder **qué existe hoy en código**, prevalece `REPOSITORY_SOURCE_OF_TRUTH.md`, pero este documento no puede inventar/cambiar requisitos de producto.

`REPOSITORY_SOURCE_OF_TRUTH.md` debe actualizarse después de ejecutar el Impact Audit v1.1 definido como `GR-00-12`.

---

## Cambios estructurales del baseline 1.1

El baseline 1.1 formaliza como parte del alcance:

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
- reembolso como movimiento separado;
- asignación de mesa por persona (`GroupMember`) sin selección de silla;
- termo adicional/entrega cuando se habilite;
- notas internas ADMIN;
- cortes diarios/semanales/mensuales y exportaciones ampliadas.

---

## Documentación legacy / reference only

Documentación operativa antigua fuera de `/docs`, por ejemplo:

```text
ENDPOINTS.md
OPENPAY_SETUP.md
GUIA_PRUEBAS.md
RESULTADOS_PRUEBAS.md
NGROK_SETUP.md
```

se considera **LEGACY / REFERENCE ONLY** cuando contradiga el baseline 1.1.

`README.md` es únicamente punto de entrada/resumen y no sustituye estos documentos.

---

## Regla para agentes

Antes de implementar un ticket:

```text
1. identificar fila en REQUIREMENTS_TRACEABILITY_MATRIX.md
2. leer documentos normativos de ese dominio
3. contrastar REPOSITORY_SOURCE_OF_TRUTH.md
4. no reutilizar comportamiento legacy contradictorio
5. citar BR/FR/AC en el ticket/commit
6. ejecutar AC y NFR aplicables antes de DONE
```

Después de este congelamiento, el siguiente paso recomendado del roadmap es:

```text
GR-00-12 — Impact audit del repositorio contra baseline 1.1
```
