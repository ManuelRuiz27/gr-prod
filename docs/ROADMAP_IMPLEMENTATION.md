# Plataforma GR — Roadmap de Implementación

**Documento:** `ROADMAP_IMPLEMENTATION.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.2  
**Estado:** Rebaseline de ejecución funcional 1.1 + visual 1.0  
**Fecha:** 31 de agosto de 2026  
**Repositorio:** `ManuelRuiz27/gr-prod`  
**Branch:** `main`

---

# 1. Principio rector

La documentación 1.2 combina:

```text
BASELINE FUNCIONAL 1.1
+
BASELINE VISUAL 1.0
```

Orden técnico principal:

```text
DOCUMENTACIÓN 1.2 CERRADA
→ IMPACT AUDIT DEL CÓDIGO Y SUPERFICIE UI EXISTENTE
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
→ FRONTEND FUNCIONAL INTEGRADO
→ HARDENING
→ MIGRACIÓN LEGACY
→ RELEASE
```

En paralelo existe un **track visual VIS** operado preferentemente con Antigravity. El track VIS puede trabajar presentación y primitives siempre que no cambie dominio, contratos API ni reglas.

Código construido contra baseline 1.0/1.1 no se considera automáticamente válido para 1.2; debe pasar impact audit, AC funcionales y AC-UI aplicables.

---

# 2. Fuente de verdad

Orden normativo:

```text
1. PRODUCT_SCOPE.md
2. BUSINESS_RULES.md
3. SRS.md
4. ROLES_PERMISSIONS.md
5. UX_FLOWS.md
6. UI_DESIGN_SYSTEM.md
7. SCREEN_VISUAL_SPECIFICATIONS.md
8. ANTIGRAVITY_DESIGN_GUIDE.md
9. FINANCIAL_DOMAIN.md
10. SEATING_MAP.md
11. DATA_MODEL.md
12. API_CONTRACTS.md
13. NON_FUNCTIONAL_REQUIREMENTS.md
14. ACCEPTANCE_CRITERIA.md
15. REQUIREMENTS_TRACEABILITY_MATRIX.md
16. ROADMAP_IMPLEMENTATION.md
```

Fuentes técnicas:

```text
TECH_STACK.md
REPOSITORY_SOURCE_OF_TRUTH.md
```

Si código/fixture/prototipo contradice documentación normativa, debe refactorizarse. Stitch, mocks o frontend previo son referencia visual/implementación, no fuente de negocio.

---

# 3. Efecto del rebaseline

El baseline funcional 1.1 introdujo:

1. contrato individual + folio + aceptación versionada;
2. productos configurables y line items;
3. compra adicional con catch-up;
4. `PaymentSubmission` para comprobantes GRADUATE;
5. método `DEPOSIT`;
6. penalización tardía configurable;
7. política de cancelación con rangos dinámicos/versiones;
8. `CancellationQuote` y refund separado;
9. `TableAssignment` por `GroupMember`;
10. reportes/cortes ampliados;
11. notas internas;
12. entrega/firma de termo opcional.

El baseline visual 1.0 agrega sin cambiar negocio:

1. tema oscuro negro/plateado con dorado de acento;
2. Cormorant Garamond para display e Inter para UI/datos;
3. ADMIN desktop-first y GRADUATE mobile-first;
4. design tokens/primitives reutilizables;
5. especificación visual por pantalla `VS-*`;
6. loading/empty/error/success obligatorios;
7. focus/keyboard/contraste/reduced-motion;
8. restricciones de performance visual y dependencias;
9. alternativa accesible para canvas;
10. criterios `AC-UI-*`.

Cualquier ticket previo que toque dominios funcionales alterados o pantallas visuales ahora normadas vuelve a `IN_REVIEW` hasta confirmar compatibilidad.

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

`DONE` requiere criterios AC/AC-UI relacionados verdes.

---

# 5. Definition of Done

```text
[ ] BR/FR/AC y fila de trazabilidad citados
[ ] VS/AC-UI citados si toca frontend visual
[ ] alcance exacto respetado
[ ] no módulos/roles inventados
[ ] schema/migration consistente cuando aplique
[ ] autorización backend cuando aplique
[ ] DTO validation cuando aplique
[ ] idempotencia/concurrencia cuando aplique
[ ] auditoría cuando aplique
[ ] OpenAPI actualizado cuando aplique
[ ] design tokens/primitives respetados si es UI
[ ] responsive/focus/reduced-motion si es UI
[ ] lint
[ ] typecheck
[ ] unit tests
[ ] integration tests cuando aplique
[ ] E2E para flujo crítico
[ ] NFR P0 verdes
[ ] no regresiones P0
```

---

# 6. Milestones funcionales

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

## GR-00-11 — Congelar docs funcionales 1.1
**P0 — DONE.**

## GR-00-11B — Congelar baseline visual 1.0
**P0 — DONE** al incorporar:

```text
UI_DESIGN_SYSTEM.md
SCREEN_VISUAL_SPECIFICATIONS.md
ANTIGRAVITY_DESIGN_GUIDE.md
NFR-UI-*
AC-UI-*
trazabilidad visual
```

## GR-00-12 — Impact audit del repositorio contra baseline 1.2
**P0 — DONE.**

Auditar código actual y clasificar cada módulo/superficie:

```text
REUSE
ADAPT
REPLACE
REMOVE
MISSING
```

Obligatorio revisar backend:

- Prisma schema/migrations;
- auth/membership;
- event settings;
- contracts/products;
- payments/submissions;
- table selection/layout;
- meals;
- thermo;
- cancellation/refund;
- reports/audit.

Obligatorio revisar frontend:

- rutas reales ADMIN/GRADUATE;
- shells/navigation;
- tokens/theme existentes;
- Button/Input/Card/Table/Modal/Drawer/Badge primitives;
- tipografías y carga de fonts;
- pantallas implementadas vs `VS-*`;
- fixtures que contradigan dominio 1.1;
- responsive actual;
- loading/empty/error states;
- accesibilidad/focus/reduced-motion;
- dependencias visuales y bundle-impact evidente;
- canvas/croquis y alternativa accesible.

Entrega obligatoria:

```text
docs/REPOSITORY_SOURCE_OF_TRUTH.md actualizado a baseline 1.2
+ matriz de gaps funcionales
+ matriz de gaps visuales VS/AC-UI
+ clasificación REUSE/ADAPT/REPLACE/REMOVE/MISSING
+ tickets concretos ordenados
+ recomendación de migration strategy
+ NO cambios de comportamiento durante este ticket
```

## GR-00-13 — Revalidar CI/migrations
**P0 — READY.** Lint, typecheck, tests, builds, migrate desde DB vacía.

### Gate M0

No iniciar refactor de dominio M1+ sin impact audit y migration strategy aprobados.

El track VIS puede preparar diseño/maquetas, pero cambios de implementación estructural deben respetar el resultado del audit para evitar rehacer primitives/routing.

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

## GR-01-07 — Contract frontend funcional
Integrar datos reales conforme `VS-G-CON-001`; refinamiento visual pertenece al track VIS.

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

## GR-02-08 — UI wizard funcional evento/products
Integrar datos/validaciones; presentación debe respetar `VS-A-EVT-002`.

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

## GR-04-06 — GRADUATE UI funcional
Enviar comprobante + estados conforme `VS-G-PROOF-001`.

## GR-04-07 — ADMIN UI funcional
Bandeja, visor y review conforme `VS-A-PROOF-001`.

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
Selector de integrantes + croquis conforme `VS-G-SEAT-001`.

## GR-05-08 — UI ADMIN
Personas asignadas por mesa conforme `VS-A-SEAT-001`.

### Gate M5

AC-SEAT-* P0 verdes y AC-UI-016 aplicable verde.

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

## GR-07-05 — Payment UX funcional
Confirmando/confirmado/pendiente/fallido conforme `VS-G-PAY-001`.

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

## GR-08-05 — Policy editor funcional
Validación de huecos/traslapes/cobertura/porcentajes; UI conforme `VS-A-CANPOL-001`.

## GR-08-06 — Publish/version
Inmutabilidad y contrato conserva versión.

## GR-08-07 — CancellationQuote
Fórmula server-side y quote stale protection; UI conforme `VS-A-CAN-001`.

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

No cerrar M9 si existen pantallas basadas en fixtures que contradigan contratos 1.1 o especificaciones visuales 1.0.

Gate visual: AC-UI aplicables a ADMIN verdes.

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

Debe cubrir multi-evento, estados bloqueados, mobile-first y AC-UI aplicables.

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
- signed URLs/retention cleanup;
- accessibility regression;
- responsive regression;
- bundle/dependency review;
- reduced-motion review.

### Gate M12

Todos los NFR P0 verdes y AC-UI P0 verdes.

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
9. visual regression smoke ADMIN/GRADUATE;
10. release gate aprobado.

---

# 21. Track VIS — Diseño/implementación visual con Antigravity

Este track no sustituye milestones funcionales. Puede avanzar sobre pantallas existentes/mocks siempre que no marque como DONE lógica no implementada.

## VIS-00 — Baseline visual documental
**DONE.** `UI_DESIGN_SYSTEM`, `SCREEN_VISUAL_SPECIFICATIONS`, `ANTIGRAVITY_DESIGN_GUIDE`, NFR-UI y AC-UI.

## VIS-01 — Tokens y primitives
**DONE.** Foundation visual migrada a Baseline 1.2 (Obsidian/Silver/Gold, Cormorant Garamond, Inter, JetBrains Mono, primitives Button, Input, Select, TextArea, Checkbox, Badge, Card, Table, Modal, ConfirmDialog, Alert, Breadcrumb, Search, KpiCard, Drawer, Tabs, Toast, Skeleton, Divider, IconButton, Headers, StateBoundary, focus-visible, reduced-motion, showcase completa en `/showcase`).

## VIS-02 — ADMIN shell
**DONE.** Shell administrativo implementado conforme a `VS-A-SHELL-001` (Sidebar global Inicio/Eventos/Graduados/Pagos/Reportes/Más, Topbar con jerarquía y account area, Event context header reutilizable con 9 pestañas contextuales, Drawer móvil <1024px con trampa de foco y retorno, skip link accesible, tokens Obsidian/Silver/Gold).

## VIS-03 — GRADUATE shell
**DONE.** Shell graduado mobile-first implementado conforme a `VS-G-SHELL-001` (Header compacto con marca GR, back button y profile badge, GraduateEventContext reutilizable, BottomNav con 4 destinos Inicio/Mi grupo/Pagos/Más, acento dorado activo, safe-area bottom support, skip link accesible, tokens Obsidian/Silver/Gold).

## VIS-04 — ADMIN dashboard
**DONE.** Dashboard global administrativo implementado conforme a `VS-A-DASH-001` (PageHeader con CTA primario Crear evento, 5 KPIs en Inter Eventos activos/Graduados/Cobrado/Pendiente/Vencido, sección de alertas accionables, tabla de eventos activos con badges, lista de pagos por validar, 4 accesos rápidos, soporte estructural de loading skeleton, empty state y partial error).

## VIS-05 — GRADUATE home
**DONE.** Home definitivo del graduado implementado conforme a `VS-G-HOME-001` (Saludo personal, GraduateEventContext integrado, superficie Qué sigue con próximo pago y CTA contextual, resumen financiero con progress bar y desglose de aportaciones, hub de preparación con grupo/mesa/platillos/termo, estados liquidado, overdue, loading skeleton, empty y partial error).

## VIS-06 — Eventos ADMIN
**DONE.** Módulo de eventos administrativos implementado conforme a `VS-A-EVT-001` (Listado con 8 columnas prioritarias, Search, filtros por estado y empty/loading states), `VS-A-EVT-002` (Wizard de creación progresiva en 6 pasos que cubre todas las secciones normativas: Información general, Escuela/Carrera/Generación, Productos y precios, Plan de pagos, Pago inicial e hitos, Fechas límite, Mora/penalización, Política de cancelación, Platillos, Termo y Revisión) y `VS-A-EVT-003` (Resumen del evento con PageHeader, KPIs en Inter, módulos de Cartera, Mesas, Platillos, Termos y Comprobantes pendientes con placeholders honestos sin invención de cifras, y diálogo de ciclo de vida con tokens Obsidian/Silver/Gold). Incluye corrección de cobertura normativa `VIS-06R1` y eliminación de defaults demo `VIS-06R2 — removed non-normative demo defaults`.

## VIS-07 — Graduados/expediente
**DONE.** Experiencia administrativa de graduados y expediente implementada conforme a `VS-A-GRAD-001` (Listado con 9 columnas prioritarias, buscador Search, drawer de filtros avanzados con 6 dimensiones, chips de filtros activos y navegación interactiva por fila) y `VS-A-GRAD-002` (Página dedicada de expediente con PageHeader sobrio, contacto, badges de membresía/financiero/comprobante, 9 pestañas estructuradas: Resumen, Contrato, Grupo/productos, Pagos, Mesa, Platillos, Termo, Notas e Historial, y modales de confirmación para acciones críticas con semantics danger).

## VIS-08 — Payments/submissions
**DONE.** Ecosistema visual de pagos implementado conforme a `VS-A-PAY-001` (Cartera/pagos ADMIN con subnavegación por Tabs: Resumen, Cartera, Comprobantes por validar y Conciliación de pasarelas con Bento KPIs y tabla de cartera con 9 columnas operativas), `VS-A-PAY-002` (Registrar pago manual con métodos CASH, TRANSFER y DEPOSIT, orden de campos normativo, preview informativo no vinculante y resumen antes de confirmar), `VS-A-PROOF-001` (Comprobantes por validar con tabla de cola de revisión, drawer lateral con preview de evidencia adjunta, aprobación con advertencia explícita y rechazo con motivo obligatorio), `VS-G-PAY-001` (Centro de pagos GRADUATE mobile-first con cifras monetarias en Inter, Próximo pago sin hardcodes, Calendario de obligaciones dinámico, Historial de transacciones confirmadas separado de comprobantes y métodos de pago) y `VS-G-PROOF-001` (Reportar transferencia/depósito con métodos TRANSFER y DEPOSIT, subida accesible de evidencia y disclaimer obligatorio destacado: "Enviar este comprobante no confirma el pago. El equipo administrativo revisará la información. Tu saldo se actualizará únicamente después de la aprobación."). Incluye corrección correctiva `VIS-08R1 — removed residual payment/thermo hardcodes` (eliminación de Meta Termo 70% y cálculos `>= 70` / `70 - progress` de Pagos, barra de progreso exclusivamente financiera, eliminación de fallback `$2,500` en formulario de comprobantes e inputs vacíos cuando `nextPayment` es `undefined`).

## VIS-09 — Contract/group
**DONE.** Experiencia de contrato y grupo/productos GRADUATE implementada conforme a `VS-G-CON-001` (Nueva ruta `/graduate/contract` dentro de GraduateLayout y acceso desde GraduateMoreScreen; jerarquía contractual obligatoria: Evento + folio único `CT-2027-0042`, resumen de membresía, productos y line items en lenguaje natural, esquema de pagos con enlace contextual a Pagos, política de cancelación aplicable inmutable y contenedor de lectura accesible de términos; flujo de aceptación explícita `UX-G-CON-002` con modal de revisión, checkbox y feedback demostrativo honesto sin persistencia fake en DB; modos de lectura para estados `ACCEPTED`, `SUPERSEDED` y `CANCELLED`, además de soporte para EmptyState) y `VS-G-GROUP-001` (Refactorización completa de `/graduate/group` eliminando terminología legacy de "invitados"; resumen de capacidad con lugares contratados, registrados y pendientes; identificación semántica de graduado titular mediante `isPrimary`; lista nominal con desglose de ubicación de mesa por persona y resumen de platillo con acceso a `/graduate/meals`; modal de alta de integrante sin simular persistencia en DB; compra de lugares adicionales con cotización visual obligatoria `precalculatedQuote` desglosando precio, nuevo total contratado, pago requerido hoy / catch-up y saldo futuro sin fórmulas arbitrarias en frontend; y cobertura de estados operativos bloqueados por fecha límite, evento no abierto y nota de no reducción unilateral).

## VIS-10 — Seating
**DONE.** Experiencia completa de croquis y asignación de mesas implementada conforme a `VS-A-SEAT-001` (Croquis ADMIN con react-konva, onDragEnd local, eliminación de escenario fijo artificial, soporte exclusivo para formas Cuadrada y Circular sin unidades de silla funcionales, Bento KPIs de aforo y ocupación derivados de asignaciones de personas, Toolbar con carga de plano de referencia JPG/PNG y creación individual/múltiple, subnavegación por Tabs entre Croquis interactivo y Lista de mesas accesible, TableDetailPanel con desglose nominal de asignaciones por persona y acciones de edición/bloqueo/duplicación, y modal de asignación por integrantes nominales con guardia de capacidad y aviso explícito de vista previa no persistente) y `VS-G-SEAT-001` (Mesa GRADUATE mobile-first eliminando la premisa legacy de "una mesa para todo el grupo", soporte de estados operativos: bloqueo financiero con CTA a `/graduate/payments`, deadline cerrado en modo lectura, conflicto de concurrencia y grupos distribuidos en múltiples mesas; selector de integrantes propios, vista alternativa de lista/tarjetas para touchscreens y croquis interactivo de solo lectura, protección estricta de privacidad sin PII de terceros y confirmación en modo vista previa sin persistencia simulada).

## VIS-11 — Meals/thermo
**DONE.** Experiencia visual completa de Platillos y Termos ADMIN y GRADUATE implementada conforme a `VS-A-MEAL-001` (Platillos ADMIN con PageHeader, KPIs dinámicos derivados por opción y pendientes, tabla de selecciones por PERSONA a nivel GroupMember con 6 columnas normativas: Folio, Persona/Graduado, Tipo de persona, Platillo, Estado y Acciones de Ver detalle y Modificar; selector de cambio con motivo obligatorio post-deadline, aviso explícito de vista previa local no guardada y cero ramificación por nombres de platillo), `VS-G-MEAL-001` (Platillos GRADUATE mobile-first basada en GroupMember nominal, identificación de titular mediante `isPrimary`, catálogo de opciones activas del evento, manejo de opciones inactivas históricas, aviso de deadline, modo lectura tras el cierre, modal de revisión comparativa antes de confirmar y feedback honesto en modo visual sin falso guardado en DB), `VS-A-TH-001` (Termos ADMIN con PageHeader, Bento summary con los 5 estados normativos: Bloqueados, Disponibles, Solicitados, En producción y Entregados; tabla de 7 columnas operativas: Folio, Graduado, Mesa, Estado, Personalización, Entrega y Acción; detalle con avance financiero real, umbral configurable, personalización conocida, timeline por etapas y transiciones administrativas START_PRODUCTION y MARK_DELIVERED en modo preview sin recálculo arbitrario de estado en frontend) y `VS-G-TH-001` (Termo GRADUATE con gobernanza autoritativa estricta por estado de backend `ThermoRequest.status` sin recálculo por porcentaje financiero; soporte de los 5 estados: LOCKED con banner, avance y CTA a pagos; AVAILABLE celebratorio con campos dinámicos de personalización y sin fallback al nombre completo; REQUESTED, IN_PRODUCTION y DELIVERED en modo lectura con fecha y receptor cuando existan; aviso de termo adicional contratado y feedback honesto de solicitud en modo visual).

## VIS-12 — Cancellation/reports/audit
**DONE.** Experiencias administrativas de Política de cancelación (`VS-A-CANPOL-001`), Cotización/Cancelación de membresía (`VS-A-CAN-001`), Reportes y cortes (`VS-A-REP-001`) y Auditoría (`VS-A-AUD-001`) implementadas y verificadas. Incluye ticket correctivo de integración `VIS-12-R1`:
- `VS-A-CANPOL-001`: Editor de política de cancelación versionada en `/admin/events/:eventId/settings/cancellation-policy` con selector de versiones históricas/activas/borradores, editor de rangos interactivo para estado `DRAFT`, visualización estricta de solo lectura para estados `ACTIVE` y `ARCHIVED`, motor de validación en tiempo real (porcentajes 0..100, no negatividad, max >= min, inicio obligatorio en día 0, detección de huecos, detección de traslapes y último rango abierto "Sin límite"), generador de preview textual en lenguaje natural, CTA *"Crear nueva versión"* en versiones activas preservando la inmutabilidad de la versión vigente, y modal de publicación con aviso explícito y feedback en modo visual sin mutaciones en DB ni asunciones de defaults fijos (`BR-CANPOL-001..009`).
- `VS-A-CAN-001`: Modal de cotización y cancelación de membresía integrado en el expediente (`AdminGraduateOverviewScreen`) con flujo quote-first estricto, resolución estricta por `graduateId` eliminando folios y quotes hardcodeados (`CT-2027-0042` / Andrea fallback) mediante `VISUAL_QA_CANCELLATION_QUOTE_BY_GRADUATE_ID`, validación de invariantes (`quote.graduateMembershipId === graduateId`), manejo de estado no disponible para graduados sin cotización QA con botón confirmar deshabilitado, reintento respetando la identidad del expediente, estados de carga con skeleton, error y cotización expirada que bloquean la confirmación, desglose financiero jerárquico (`Total contratado`, `Total pagado`, `Días antes del evento`, `Política y rango aplicado`, `Penalización % y monto`, `Monto retenido`), soporte desacoplado de `Reembolso estimado / pendiente` con aviso explícito de movimiento independiente vs `Saldo adicional pendiente` (sin saldo negativo ni confirmación automática de devolución), resumen de capacidad operativa a liberar, `TextArea` de motivo obligatorio y CTA `danger` con feedback neutral sin ejecutar cancelaciones reales ni alterar datos del contrato (`BR-CAN-001..009`, `BR-REF-001..004`).
- `VS-A-REP-001`: Centro de reportes y cortes en `/admin/events/:eventId/reports` y `/admin/reports` con selector global de evento accesible directamente desde la pantalla sin navegación forzada, filtros normativos completos (Escuela/Facultad, Método de pago, Estado, Rango de fechas y selector de periodo temporal `Diario`, `Semanal`, `Mensual`), soporte exhaustivo de las 7 familias normativas con detalle completo (`Cobranza` con contratado/cobrado/pendiente/vencido/penalizaciones/reembolsos, `Cartera por Graduado` con listado de todos los graduados en plan, `Transacciones y Pagos Confirmados` de `PaymentTransaction`, `Comprobantes por Validar` de `PaymentSubmission` con contadores y detalle, `Ocupación de Mesas` con desglose por mesa y comensales, `Comanda de Platillos` con totales y detalle nominal, `Termos Conmemorativos` con los 5 estados y tabla nominal de personalización/entrega), reconciliación matemática estricta entre transacciones individuales y totales de cartera/recaudación ($7,500) comprobada por pruebas unitarias, y botones de exportación (XLSX, CSV, PDF) deshabilitados con título explícito *"Exportación pendiente de backend"* sin falsas descargas simuladas (`BR-REP-001..010`).
- `VS-A-AUD-001`: Historial de auditoría en `/admin/events/:eventId/audit` y `/admin/audit` con encabezado normativo, selector de evento global accesible en pantalla, filtros normativos completos (Actor/origen incluyendo `Proveedor`, Acción/categoría, Entidad/contexto, Rango de fechas y búsqueda por palabra clave Search), estado honesto de integración de backend pendiente, presentación estructurada de cambios (tablas con `Campo`, `Valor Anterior` y `Nuevo Valor` con eliminación total de `JSON.stringify` en el DOM), Drawer de detalle ampliado `AuditDetailDrawer`, y estructura estricta append-only sin botones de editar ni eliminar registros (`BR-AUD-001..004`).

## VIS-13 — Responsive/a11y/polish
**READY.** Cierre transversal de AC-UI-004..020, NFR-UI y visual regression.

### Gate VIS

Cada ticket VIS requiere:

```text
VS citado
AC-UI aplicables verdes
sin cambios de dominio/API no autorizados
lint/typecheck/tests verdes
estados visuales cubiertos
```

---

# 22. Ownership recomendado

```text
Codex:
- impact audit
- backend/domain/API
- migrations
- integración funcional
- tests técnicos
- correcciones estructurales

Antigravity:
- design system implementation
- visual refactor
- shells
- screen composition
- responsive
- microinteractions
- visual/accessibility polish
```

Ambos deben leer la misma documentación normativa. Ningún agente puede reinterpretar el negocio por conveniencia visual/técnica.

---

# 23. Orden de ejecución inmediata

## Siguiente ticket técnico para Codex

```text
GR-00-13 — Revalidar CI/migrations
```

Valida CI, scripts de build, typecheck, tests y migrations desde DB vacía para cerrar formalmente el Gate M0.

## Siguiente ticket visual para Antigravity

```text
VIS-01 — Tokens y primitives
```

Implementa los tokens normativos (Negro/Obsidiana + Plateado + Dorado), Cormorant Garamond / Inter, y consolida las primitives base del Design System.
