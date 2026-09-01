# Plataforma GR — Roadmap de Implementación

**Documento:** `ROADMAP_IMPLEMENTATION.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.1  
**Estado:** Rebaseline de ejecución posterior al cierre funcional 1.1  
**Fecha:** 31 de agosto de 2026  
**Repositorio:** `ManuelRuiz27/gr-prod`  
**Branch:** `main`

---

# 1. Principio rector

Orden obligatorio:

```text
DOCUMENTACIÓN 1.1 CERRADA
→ IMPACT AUDIT DEL CÓDIGO EXISTENTE
→ MODELO DE DATOS/MIGRACIONES
→ IDENTIDAD + CONTRATO
→ EVENTOS + PRODUCTOS + MEMBRESÍAS
→ NÚCLEO FINANCIERO
→ COMPROBANTES
→ MESAS POR PERSONA
→ PLATILLOS + TERMO
→ PASARELAS
→ PENALIZACIÓN + CANCELACIONES + REFUNDS
→ REPORTES/CORTES/NOTAS/AUDITORÍA
→ FRONTEND INTEGRADO
→ HARDENING
→ MIGRACIÓN LEGACY
→ RELEASE
```

Código construido contra baseline 1.0 no se considera automáticamente válido para 1.1. Debe pasar impact audit y AC 1.1.

---

# 2. Fuente de verdad

Orden normativo:

```text
1. PRODUCT_SCOPE.md
2. BUSINESS_RULES.md
3. SRS.md
4. ROLES_PERMISSIONS.md
5. UX_FLOWS.md
6. FINANCIAL_DOMAIN.md
7. SEATING_MAP.md
8. DATA_MODEL.md
9. API_CONTRACTS.md
10. NON_FUNCTIONAL_REQUIREMENTS.md
11. ACCEPTANCE_CRITERIA.md
12. REQUIREMENTS_TRACEABILITY_MATRIX.md
13. ROADMAP_IMPLEMENTATION.md
```

Fuentes técnicas:

```text
TECH_STACK.md
REPOSITORY_SOURCE_OF_TRUTH.md
```

Si código/fixture/prototipo contradice documentación normativa, debe refactorizarse.

---

# 3. Estado y efecto del rebaseline

El repositorio contiene una base Alpha con NestJS/Prisma/PostgreSQL y React/Vite, además de avance frontend previo.

El baseline 1.1 introduce cambios estructurales que invalidan supuestos de 1.0:

1. contrato individual + folio + aceptación versionada;
2. productos configurables y line items;
3. compra adicional con catch-up;
4. `PaymentSubmission` para comprobantes de GRADUATE;
5. método `DEPOSIT`;
6. penalización tardía configurable;
7. política de cancelación con rangos dinámicos/versiones;
8. `CancellationQuote` y refund separado;
9. `TableAssignment` por `GroupMember`, no por cantidad de lugares;
10. reportes/cortes ampliados;
11. notas internas;
12. entrega/firma de termo opcional.

Por ello, cualquier ticket previo que toque estos dominios vuelve a `IN_REVIEW` hasta confirmar compatibilidad.

---

# 4. Estados de ticket

```text
BACKLOG
READY
IN_PROGRESS
BLOCKED
IN_REVIEW
QA
DONE
```

`DONE` requiere criterios AC relacionados verdes.

---

# 5. Definition of Done

```text
[ ] BR/FR/AC y fila de trazabilidad citados
[ ] alcance exacto respetado
[ ] no módulos/roles inventados
[ ] schema/migration consistente
[ ] autorización backend
[ ] DTO validation
[ ] idempotencia/concurrencia cuando aplique
[ ] auditoría cuando aplique
[ ] OpenAPI actualizado
[ ] lint
[ ] typecheck
[ ] unit tests
[ ] integration tests
[ ] E2E para flujo crítico
[ ] NFR P0 verdes
[ ] no regresiones P0
```

---

# 6. Milestones 1.1

```text
M0  — Rebaseline documental + Impact Audit
M1  — Identidad, membresía y contratos
M2  — Eventos, productos, lugares e integrantes
M3  — Núcleo financiero
M4  — Payment submissions y pagos manuales
M5  — Croquis y mesas por persona
M6  — Platillos y termo
M7  — Pasarelas y conciliación
M8  — Mora, penalización, cancelaciones y refunds
M9  — Operación ADMIN completa
M10 — Experiencia GRADUATE completa
M11 — Reportes, cortes, archivos, notas y auditoría
M12 — Hardening/NFR
M13 — Migración legacy y release
```

---

# 7. M0 — Rebaseline + Impact Audit

## GR-00-11 — Congelar docs 1.1
**P0 — DONE al completar commit documental.**

Incluye todos los documentos normativos y matriz de trazabilidad.

## GR-00-12 — Impact audit del repositorio
**P0 — READY.**

Auditar código actual contra v1.1 y clasificar cada módulo:

```text
REUSE
ADAPT
REPLACE
REMOVE
MISSING
```

Obligatorio revisar:

- Prisma schema/migrations;
- auth/membership;
- event settings;
- payments;
- comprobantes si ya existen fixtures/UI;
- table selection/layout;
- meals;
- thermo;
- admin routes/screens;
- reports/audit.

Entrega:

```text
docs/REPOSITORY_SOURCE_OF_TRUTH.md actualizado
+ lista de gaps v1.1
+ tickets concretos
```

## GR-00-13 — Revalidar CI/migrations
**P0.** Lint, typecheck, tests, builds, migrate desde DB vacía.

### Gate M0

No iniciar refactor de dominio sin impact audit y migration strategy aprobados.

---

# 8. M1 — Identidad, membresía y contratos

## GR-01-01 — Account/GraduateMembership
Implementar/ajustar separación de identidad y dominio.

## GR-01-02 — Ownership guards
Proteger `/me` y `/admin`, IDOR tests.

## GR-01-03 — GraduateContract
Schema, folio único, estados y relación policy version.

## GR-01-04 — ContractLineItem base
Persistencia del desglose contratado.

## GR-01-05 — Contract snapshot/acceptance
Snapshot, hash, server timestamp, evidencia conforme NFR.

## GR-01-06 — Contract APIs
GET propio/admin + accept idempotente.

## GR-01-07 — Contract frontend
Pantalla pendiente/aceptado + folio.

### Gate M1

AC-AUTH-* y AC-CON-* P0 verdes.

---

# 9. M2 — Eventos, productos, lugares e integrantes

## GR-02-01 — EventSettings 1.1
Agregar school/career/generation cuando aplique, deadlines y configuraciones nuevas sin mezclar policy JSONB.

## GR-02-02 — EventProduct
Catálogo por evento compatible con Adulto/Niño/Sin cena y termo extra.

## GR-02-03 — FinancialMilestone
Hitos configurables; no hardcodear 50/75 salvo datos del evento.

## GR-02-04 — GroupMember
Integrantes nominales, principal y producto asociado cuando corresponda.

## GR-02-05 — Product quote + catch-up
Backend authoritative.

## GR-02-06 — Confirmar compra adicional
Capacidad + line item + obligaciones en transacción coherente.

## GR-02-07 — Reducción ADMIN
Impacto financiero no destructivo.

## GR-02-08 — UI wizard evento/products
Actualizar creación/configuración ADMIN.

### Gate M2

AC-PLC-* P0 verdes y capacidad concurrente probada.

---

# 10. M3 — Núcleo financiero

## GR-03-01 — PaymentPlan/Installment v1.1
Calendario irregular, freeze y totales derivados.

## GR-03-02 — PaymentTransaction/Allocation
Ledger y aplicación secuencial.

## GR-03-03 — Adjustment/Refund base
Append-only y límites.

## GR-03-04 — Cash/Transfer/Deposit ADMIN
Pago manual idempotente.

## GR-03-05 — Financial projections
Paid/pending/overdue/credit/progress.

### Gate M3

AC-FIN-* + AC-MAN-* P0 verdes.

---

# 11. M4 — PaymentSubmission

## GR-04-01 — FileAsset private evidence
Storage privado, MIME/size/checksum/signed URL.

## GR-04-02 — PaymentSubmission schema
Estados y ownership.

## GR-04-03 — GRADUATE upload/submission APIs
Transfer/deposit reportado no altera saldo.

## GR-04-04 — ADMIN review APIs
Approve/reject idempotentes.

## GR-04-05 — Atomic approve
`APPROVED + PaymentTransaction + Allocation` atómico.

## GR-04-06 — GRADUATE UI
Enviar comprobante + estados.

## GR-04-07 — ADMIN UI
Bandeja, visor y review.

### Gate M4

AC-PROOF-* y AC-FILE-* P0 verdes.

---

# 12. M5 — Croquis y mesas por persona

## GR-05-01 — SeatingMap/EventTable
Adaptar/reutilizar canvas React Konva.

## GR-05-02 — Migrar TableAssignment
Objetivo `group_member_id UNIQUE`; retirar modelo agregado por membresía.

## GR-05-03 — Eligibility financiera
Bloquear GRADUATE hasta condición configurada.

## GR-05-04 — Assignment API GRADUATE
Asignar personas propias.

## GR-05-05 — Assignment API ADMIN
Override con motivo.

## GR-05-06 — Concurrencia
Locks y tests con varias personas/mesas.

## GR-05-07 — UI GRADUATE
Selector de integrantes + croquis.

## GR-05-08 — UI ADMIN
Personas asignadas por mesa.

### Gate M5

AC-SEAT-* P0 verdes.

---

# 13. M6 — Platillos y termo

## GR-06-01 — MealOption/Selection
Catalog + per-member selection + deadline.

## GR-06-02 — Meal ADMIN override
Motivo/auditoría.

## GR-06-03 — ThermoRequest
Eligibility y estados.

## GR-06-04 — Extra thermo
Usar EventProduct/line item, no dominio financiero paralelo.

## GR-06-05 — ThermoDelivery
Implementar solo si se confirma evidencia/firma para release; schema/API ya previstos.

### Gate M6

AC-MEAL-* y AC-TH-* aplicables verdes.

---

# 14. M7 — Pasarelas y conciliación

## GR-07-01 — Mercado Pago Checkout Pro
PaymentAttempt, redirect y webhook.

## GR-07-02 — Webhook idempotency
ProviderEvent + transaction uniqueness.

## GR-07-03 — OpenPay
Adaptar como proveedor alternativo al mismo dominio.

## GR-07-04 — Reconciliation
MATCHED/PENDING/REQUIRES_REVIEW.

## GR-07-05 — Payment UX
Confirmando/confirmado/pendiente/fallido.

### Gate M7

AC-PAY-* P0 verdes.

---

# 15. M8 — Mora, cancelación y refunds

## GR-08-01 — Late payment config
Event settings + API/UI.

## GR-08-02 — PenaltyCharge
Cargo independiente, idempotencia y job durable.

## GR-08-03 — Optional auto-cancel
Proceso durable, idempotente y auditable.

## GR-08-04 — CancellationPolicy
Schema versionado + ranges.

## GR-08-05 — Policy editor
Validación de huecos/traslapes/cobertura/porcentajes.

## GR-08-06 — Publish/version
Inmutabilidad y contrato conserva versión.

## GR-08-07 — CancellationQuote
Fórmula server-side y quote stale protection.

## GR-08-08 — Cancel membership
Liberar recursos sin borrar historia.

## GR-08-09 — Refund workflow
Manual/electrónico y concurrency limit.

### Gate M8

AC-LATE-*, AC-CANPOL-*, AC-CAN-* y AC-REF-* P0 verdes.

---

# 16. M9 — Operación ADMIN completa

Consolidar:

- dashboard;
- event wizard/settings;
- graduates/contract;
- products/group;
- payments/submissions;
- portfolio;
- seating;
- meals;
- thermo;
- cancellation/refund;
- notes;
- audit navigation.

No cerrar M9 si existen pantallas basadas en fixtures que contradigan contratos 1.1.

---

# 17. M10 — Experiencia GRADUATE completa

Recorrido E2E:

```text
registro/login
→ contrato/aceptación
→ inicio
→ grupo/productos
→ pago inicial
→ mesa por persona
→ platillos
→ pagos electrónicos o submission
→ termo
→ notificaciones
```

Debe cubrir multi-evento y estados bloqueados.

---

# 18. M11 — Reportes, cortes, notas, archivos y auditoría

## GR-11-01 — Financial/portfolio reports

## GR-11-02 — Payments/submissions reports

## GR-11-03 — Daily/weekly/monthly cash cuts

## GR-11-04 — Tables/meals/thermos reports

## GR-11-05 — XLSX/CSV/PDF exports
Con formula-injection protection y signed download.

## GR-11-06 — InternalNote
ADMIN only.

## GR-11-07 — Audit complete
System actors, request_id y lenguaje administrativo.

### Gate M11

AC-NOTE-*, AC-REP-* y AC-AUD-* verdes.

---

# 19. M12 — Hardening/NFR

- rate limiting;
- CORS/headers;
- secret management;
- file malware strategy;
- job durability;
- observability/alerts;
- backup/restore test;
- load/concurrency tests;
- dependency/provider failure tests;
- security test suite;
- signed URLs/retention cleanup.

### Gate M12

Todos los NFR P0 verdes.

---

# 20. M13 — Migración y release

1. frontend oficial consume solo `/api/v1`;
2. routes legacy retiradas/deprecated;
3. datos legacy migrados con reconciliación;
4. backups previos;
5. smoke E2E prod-like;
6. OpenAPI y docs alineados;
7. no contradicciones en traceability matrix;
8. rollback plan probado;
9. release gate aprobado.

---

# 21. Orden de ejecución inmediata

Después de este rebaseline, el siguiente ticket autorizado recomendado es:

```text
GR-00-12 — Impact audit del repositorio contra baseline 1.1
```

No conviene seguir desarrollando M1+ usando supuestos de datos/flows de v1.0 hasta terminar esa auditoría.
