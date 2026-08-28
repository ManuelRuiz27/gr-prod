# ROADMAP_IMPLEMENTATION.md

# Plataforma GR — Roadmap de Implementación

**Documento:** `ROADMAP_IMPLEMENTATION.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline de ejecución  
**Fecha:** 24 de agosto de 2026  
**Repositorio objetivo:** `ManuelRuiz27/gr-prod`  
**Branch de referencia:** `main`  
**Commit de referencia auditado:** `5986eb963c0ef66ccec84e5ba4c504617768cc34`  
**Documentos fuente obligatorios:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `UX_FLOWS.md`, `FINANCIAL_DOMAIN.md`, `SEATING_MAP.md`, `DATA_MODEL.md`, `API_CONTRACTS.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `ACCEPTANCE_CRITERIA.md`  
**Propósito:** Convertir el baseline funcional y técnico de Plataforma GR en una secuencia ejecutable de refactor, desarrollo, integración, QA y release.

---

# 1. Propósito

Este documento define:

- qué se debe construir;
- qué se debe reutilizar;
- qué se debe refactorizar;
- qué se debe retirar;
- en qué orden debe ejecutarse;
- qué dependencias existen entre trabajos;
- qué tickets bloquean a otros;
- qué gates deben aprobarse antes de avanzar;
- qué criterios determinan que una fase está terminada.

El roadmap parte del repositorio existente.

No propone reconstruir todo desde cero.

Tampoco autoriza conservar comportamientos legacy que contradigan la nueva fuente de verdad documental.

---

# 2. Principio rector de implementación

La secuencia obligatoria será:

```text
DOCUMENTACIÓN CERRADA
        ↓
BASE TÉCNICA REPRODUCIBLE
        ↓
IDENTIDAD + AUTORIZACIÓN
        ↓
MODELO DE DATOS OBJETIVO
        ↓
EVENTOS + MEMBRESÍAS + LUGARES
        ↓
DOMINIO FINANCIERO
        ↓
CROQUIS / MESAS
        ↓
PLATILLOS + TERMO
        ↓
PASARELAS
        ↓
REPORTES + NOTIFICACIONES + AUDITORÍA
        ↓
FRONTEND INTEGRADO
        ↓
HARDENING
        ↓
MIGRACIÓN LEGACY
        ↓
RELEASE
```

No deberán implementarse pantallas finales sobre contratos backend que todavía se encuentren conceptualmente inestables.

---

# 3. Fuente de verdad

Todo ticket deberá consultar, según su dominio, los documentos correspondientes.

Prioridad documental:

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
12. ROADMAP_IMPLEMENTATION.md
```

Si el código legacy contradice esta documentación:

```text
la documentación aprobada prevalece.
```

---

# 4. Estado actual del repositorio

El repositorio existente constituye una **base funcional Alpha/prototipo**, no una implementación final.

Backend actual:

```text
NestJS 11
TypeScript
Prisma 5.22
PostgreSQL
JWT / Passport
bcrypt
class-validator
OpenPay SDK
Jest / Supertest
```

Frontend actual:

```text
React 19
TypeScript
Vite 7
React Router
Axios
Tailwind CSS
```

Módulos backend actualmente presentes como base:

```text
auth
graduates
layout
payments
prisma
```

El roadmap asume reutilización de esta base tecnológica.

---

# 5. Clasificación del código existente

## 5.1 Reutilizar

Se considera razonable reutilizar:

### Backend

```text
NestJS application bootstrap
Prisma integration
PostgreSQL
DTO validation stack
Passport/JWT scaffolding
bcrypt
testing stack
```

### Frontend

```text
React
Vite
TypeScript
React Router
Axios
Tailwind
componentes visuales útiles
estructura visual GRADUATE que coincida con el prototipo aprobado
```

### Croquis

Reutilizar/adaptar desde:

```text
Soft-Monkey_InvitacionesPremium
```

principalmente:

```text
React Konva
FloorplanCanvas concepts
TableLayer concepts
viewport
pan
zoom
normalized coordinates
drag/drop
```

---

# 6. Refactorizar

No debe desecharse necesariamente el código, pero sí cambiar su contrato/dominio.

```text
auth
graduates
layout
payments
frontend routing
frontend API services
```

---

# 7. Reemplazar como modelo de dominio

Los siguientes conceptos legacy no deberán permanecer como fuente autoritativa final:

```text
Graduate como identidad autenticable
Ticket como mezcla de lugares/contrato
Guest.seat_number
TableSelection graduate_id UNIQUE
Payment monolítico
OpenPay como proveedor principal
thermo_step legacy
layout_step como fuente de verdad
```

---

# 8. Construir

El repositorio actual necesita incorporar formalmente:

```text
Account
GraduateMembership
EventSettings
GroupMember
MealOption
MealSelection

SeatingMap
EventTable objetivo
TableAssignment

PaymentPlan
Installment
PaymentAttempt
PaymentTransaction
PaymentAllocation
Adjustment
Refund
PaymentProviderEvent

ThermoRequest
Notification
FileAsset
AuditLog

ADMIN API
ADMIN frontend
Mercado Pago
reporting
reconciliation
backup/observability configuration
```

---

# 9. Estrategia de integración

Mientras no exista una instrucción explícita en contrario, el proyecto trabajará directamente sobre `main`.

Flujo obligatorio:

1. actualizar `main` con `git pull --ff-only origin main`;
2. realizar únicamente el change set autorizado;
3. mantener un commit aislable por ticket o bloque aprobado;
4. ejecutar validaciones locales;
5. hacer `push origin main`;
6. validar GitHub Actions.

No crear ramas ni Pull Requests por defecto.

---

# 10. Estados de ticket

```text
BACKLOG
READY
IN_PROGRESS
BLOCKED
IN_REVIEW
QA
DONE
```

Un ticket no pasa a `DONE` solo porque compile.

Debe cumplir su Definition of Done.

---

# 11. Definition of Done por ticket

Todo ticket deberá cumplir:

```text
[ ] alcance exacto respetado
[ ] documentación fuente citada en PR/ticket
[ ] sin módulos inventados
[ ] lint
[ ] typecheck
[ ] build
[ ] unit tests
[ ] integration tests cuando aplique
[ ] E2E cuando afecte flujo crítico
[ ] autorización backend
[ ] validación DTO
[ ] auditoría cuando corresponda
[ ] migration cuando cambie schema
[ ] OpenAPI actualizado
[ ] criterios AC-* asociados verdes
[ ] no regressions P0
```

---

# 12. Roadmap por milestones

El desarrollo se divide en:

```text
M0 — Baseline técnico
M1 — Identidad y autorización
M2 — Eventos, membresías y lugares
M3 — Núcleo financiero
M4 — Croquis y mesas
M5 — Platillos y termo
M6 — Pasarelas y conciliación
M7 — Operación ADMIN
M8 — Experiencia GRADUATE integrada
M9 — Reportes, notificaciones y archivos
M10 — Hardening y NFR
M11 — Migración y release
```

## 12.1 Estado de ejecución verificado

Estado backend:

| Milestone | Estado |
|---|---|
| M0 — Baseline técnico | DONE |
| M1 — Identidad y autorización | READY |
| M2–M11 | BACKLOG |

### Track frontend paralelo

| Ticket | Estado |
|---|---|
| FRONTEND-01 — Foundation normativa | DONE |
| FRONTEND-01-R2 — Normalización de fixtures de dominio | IN_REVIEW |
| FRONTEND-02A — Acceso e identidad UI | DONE |
| FRONTEND-03A — Listado ADMIN de eventos | DONE |
| FRONTEND-03B — Creación de evento | DONE |
| FRONTEND-03C — Resumen y ciclo de vida | QA |
| FRONTEND-03D-A — Graduados del evento | QA |


El avance frontend no cierra por sí mismo los gates backend de M1–M11.


---

# 13. M0 — Baseline técnico

## Objetivo

Antes del refactor de negocio, garantizar que el repo sea:

- reproducible;
- testeable;
- migrable;
- verificable;
- estable para cambios incrementales.

---

## GR-00-01 — Congelar baseline documental

**Prioridad:** P0  
**Estado inicial:** READY

Agregar los documentos aprobados al repositorio bajo una estructura equivalente a:

```text
docs/
├── PRODUCT_SCOPE.md
├── BUSINESS_RULES.md
├── SRS.md
├── ROLES_PERMISSIONS.md
├── UX_FLOWS.md
├── FINANCIAL_DOMAIN.md
├── SEATING_MAP.md
├── DATA_MODEL.md
├── API_CONTRACTS.md
├── NON_FUNCTIONAL_REQUIREMENTS.md
├── ACCEPTANCE_CRITERIA.md
└── ROADMAP_IMPLEMENTATION.md
```

No modificar su contenido durante el ticket salvo correcciones de formato.

### Gate

Todo agente posterior debe poder citar una fuente concreta.

---

## GR-00-02 — Repository source of truth

**Prioridad:** P0  
**Depende de:** GR-00-01

Crear:

```text
docs/REPOSITORY_SOURCE_OF_TRUTH.md
```

Debe indicar:

- stack real;
- estructura;
- módulos existentes;
- rutas legacy;
- código reusable;
- código deprecated;
- documentación vigente;
- cómo ejecutar proyecto;
- cómo correr tests.

No debe introducir requisitos nuevos.

---

## GR-00-03 — Corregir scripts de calidad

**Prioridad:** P0

Backend deberá disponer de scripts separados:

```text
lint
lint:fix
typecheck
test
test:integration
build
```

El script de lint no deberá modificar código silenciosamente durante CI.

Frontend deberá disponer de:

```text
lint
typecheck
test
build
```

Si todavía no existe stack de tests frontend, deberá añadirse uno compatible con React/Vite.

---

## GR-00-04 — Migraciones reproducibles

**Prioridad:** P0

Crear baseline Prisma migrations válido.

Debe ser posible:

```text
DB vacía
→ prisma migrate deploy/dev según entorno
→ schema completo
```

sin `db push` manual.

### Gate

`AC-MIG-001` verde.

---

## GR-00-05 — CI baseline

**Prioridad:** P0  
**Depende de:** GR-00-03, GR-00-04

Pipeline mínimo:

```text
install
lint
typecheck
unit tests
integration tests
build
migration validation
```

No desplegar si falla P0.

---

## GR-00-06 — API v1 bootstrap

**Prioridad:** P0

Introducir:

```text
/api/v1
```

como base para contratos nuevos.

Rutas legacy pueden coexistir temporalmente en desarrollo.

---

## GR-00-07 — Error envelope + request_id

**Prioridad:** P0

Implementar:

```text
request_id
error.code
error.message
details
```

con mapping inicial:

```text
401
403
409
422
500
```

---

## Gate M0

No avanzar al refactor de dominio si:

```text
migrations != reproducibles
CI != verde
build != verde
```

---

# 14. M1 — Identidad y autorización

## Objetivo

Eliminar la premisa legacy:

```text
Graduate == authenticated account
```

e implementar:

```text
Account
+
GraduateMembership
```

---

## GR-01-01 — Account schema

**Prioridad:** P0  
**Depende de:** M0

Implementar:

```text
Account
AccountRole
AccountStatus
```

con:

```text
ADMIN
GRADUATE
```

---

## GR-01-02 — GraduateMembership schema

**Prioridad:** P0

Implementar:

```text
GraduateMembership
UNIQUE(account_id, event_id)
```

sin migrar aún destructivamente todos los datos legacy.

---

## GR-01-03 — Auth service refactor

**Prioridad:** P0

JWT deberá emitir:

```json
{
  "sub": "account_id",
  "role": "ADMIN|GRADUATE"
}
```

Eliminar dependencias donde:

```text
jwt.sub == Graduate.id
```

---

## GR-01-04 — Guards de rol

**Prioridad:** P0

Implementar autorización:

```text
ADMIN
GRADUATE
```

sin sistema de permisos configurables.

---

## GR-01-05 — Membership authorization

**Prioridad:** P0

Helper/policy reutilizable:

```text
Account + Event
→ GraduateMembership
```

Toda ruta `/me/events/{eventId}` deberá utilizarlo.

---

## GR-01-06 — Password reset

**Prioridad:** P1

Implementar:

```text
PasswordResetToken
30 min
single-use
hashed
```

---

## GR-01-07 — Refresh/revocation

**Prioridad:** P0

Implementar estrategia de sesión alineada con:

```text
15 min access token
7 day refresh baseline
```

---

## GR-01-08 — Admin accounts

**Prioridad:** P1

Endpoints:

```text
GET /admin/accounts
POST /admin/accounts
PATCH /admin/accounts/{id}
```

Sin selector de roles/permisos.

---

## GR-01-09 — Authorization security suite

**Prioridad:** P0

Automatizar al menos:

```text
IDOR
admin route denial
role spoofing
event id spoofing
disabled account
```

---

## Gate M1

Deben estar verdes:

```text
AC-AUTH-*
AC-REG-001..004
AC-SEC-001/002
```

---

# 15. M2 — Eventos, membresías y lugares

## GR-02-01 — Event refactor

**Prioridad:** P0

Migrar Event hacia:

```text
name
event_date
venue
capacity
timezone
status
```

Estados:

```text
DRAFT
OPEN
CLOSED
FINALIZED
CANCELLED
```

---

## GR-02-02 — EventSettings

**Prioridad:** P1

Agregar:

```text
places_deadline
table_change_deadline
meals_deadline
thermo_threshold_percent
financial_config_version
cancellation_policy_config
```

---

## GR-02-03 — Event lifecycle service

**Prioridad:** P0

Implementar:

```text
OPEN
CLOSE
REOPEN
FINALIZE
CANCEL
```

con auditoría.

---

## GR-02-04 — Admin event API

**Prioridad:** P1

Implementar contratos:

```text
GET/POST /admin/events
GET/PATCH /admin/events/{id}
POST /admin/events/{id}/transitions
```

---

## GR-02-05 — GroupMember

**Prioridad:** P1

Migrar concepto legacy `Guest` hacia:

```text
GroupMember
```

Eliminar semántica de `seat_number`.

---

## GR-02-06 — Places service

**Prioridad:** P0

Fuente:

```text
GraduateMembership.active_places
```

Implementar:

- capacidad;
- incremento;
- reducción ADMIN;
- validación de integrantes;
- capacidad global.

---

## GR-02-07 — Event capacity transaction

**Prioridad:** P0

Implementar locking/serialización para:

```text
confirmed_places <= event.capacity
```

---

## GR-02-08 — Graduate `/me` group APIs

**Prioridad:** P1

Implementar:

```text
GET group
POST member
PATCH member
```

---

## GR-02-09 — Admin graduate APIs

**Prioridad:** P1

Implementar:

```text
list
filters
detail
places
cancel
```

---

## GR-02-10 — Cancellation membership

**Prioridad:** P1

Cancelar sin hard-delete.

Debe:

- bloquear mutaciones;
- liberar capacidad operativa conforme a regla;
- conservar historia.

---

## Gate M2

P0:

```text
AC-EVT-001..008 según prioridad
AC-PLC-001..006
AC-GRP-002
AC-CON event capacity
```

---

# 16. M3 — Núcleo financiero

Este milestone debe implementarse **antes de integrar Mercado Pago**.

No construir la pasarela sobre el modelo `Payment` legacy.

---

## GR-03-01 — PaymentPlan schema/service

**Prioridad:** P0

Implementar:

```text
PaymentPlan
financial_terms_version
is_frozen
frozen_at
```

---

## GR-03-02 — Installment

**Prioridad:** P0

Implementar:

```text
sequence
label
amount
due_date
grace snapshot
```

Estados derivados.

---

## GR-03-03 — Plan generator

**Prioridad:** P0

Generar planes a partir de configuración del evento.

Debe soportar:

- calendario fijo;
- alta tardía;
- obligación inicial;
- planes no congelados.

---

## GR-03-04 — Financial freeze

**Prioridad:** P0

Primer pago confirmado:

```text
is_frozen = true
```

Cambios posteriores al evento no modifican el plan.

---

## GR-03-05 — PaymentTransaction

**Prioridad:** P0

Implementar movimiento monetario inmutable.

---

## GR-03-06 — PaymentAllocation

**Prioridad:** P0

Implementar motor de aplicación:

```text
oldest due first
→ future obligations
→ available credit
```

---

## GR-03-07 — Financial summaries

**Prioridad:** P0

Derivar:

```text
contracted
paid
pending
overdue
available_credit
progress
next_installment
```

No persistir como contadores manuales autoritativos.

---

## GR-03-08 — Manual CASH payment

**Prioridad:** P1

ADMIN-only.

Idempotencia obligatoria.

---

## GR-03-09 — Manual TRANSFER payment

**Prioridad:** P1

Agregar:

```text
reference
notes
evidence
```

---

## GR-03-10 — Adjustment

**Prioridad:** P1

Append-only.

---

## GR-03-11 — Refund domain

**Prioridad:** P1

Implementar entidad y límite de refund.

Proveedor aún puede ser mock/manual.

---

## GR-03-12 — Financial audit

**Prioridad:** P0

Auditar:

```text
manual payment
adjustment
refund
places financial impact
```

---

## GR-03-13 — Financial test suite

**Prioridad:** P0

Automatizar los casos `FIN-TEST-*` y AC financieros P0.

---

## Gate M3

No iniciar gateway real hasta validar:

```text
exact payment
advance payment
overpayment
late enrollment
freeze
manual payment idempotency
refund limit
ledger immutability
```

---

# 17. M4 — Croquis y mesas

## GR-04-01 — Integrar React Konva

**Prioridad:** P1

Añadir al frontend GR:

```text
konva
react-konva
```

Reutilizar/adaptar conceptos de `Soft-Monkey_InvitacionesPremium`.

---

## GR-04-02 — SeatingMap schema

**Prioridad:** P1

Implementar:

```text
SeatingMap
background
coordinate_mode NORMALIZED
```

---

## GR-04-03 — EventTable refactor

**Prioridad:** P0

Migrar `Table` a contrato objetivo:

```text
SQUARE
ROUND
capacity
normalized coordinates
normalized size
AVAILABLE/BLOCKED
```

`FULL` derivado.

---

## GR-04-04 — TableAssignment

**Prioridad:** P0

Reemplazar:

```text
TableSelection
graduate_id UNIQUE
```

por:

```text
TableAssignment
graduate_membership_id
table_id
places_assigned
```

---

## GR-04-05 — Availability query

**Prioridad:** P0

Calcular:

```text
occupied
available
is_full
```

desde assignments.

---

## GR-04-06 — Concurrent selection

**Prioridad:** P0

Implementar:

```text
SERIALIZABLE
or
row locks
```

y retry máximo de 3.

---

## GR-04-07 — Graduate seating API

**Prioridad:** P0

Implementar:

```text
GET seating-map
GET table-selection
PUT table-selection
```

sin PII ajena.

---

## GR-04-08 — Admin seating API

**Prioridad:** P1

Implementar:

```text
seating-map
background
table CRUD
bulk tables
table assignments
```

---

## GR-04-09 — Admin floorplan editor

**Prioridad:** P1

Implementar:

- pan;
- zoom;
- drag;
- SQUARE;
- ROUND;
- bulk creation;
- background reference.

Persistencia en `dragEnd`.

---

## GR-04-10 — Graduate map UI

**Prioridad:** P1

Implementar el flujo aprobado:

```text
map
→ detail
→ confirm
→ success/conflict
```

---

## GR-04-11 — Split group ADMIN

**Prioridad:** P1

Soportar:

```text
5 + 3
```

u otras distribuciones válidas.

No silla por silla.

---

## GR-04-12 — Seating concurrency suite

**Prioridad:** P0

Ejecutar al menos:

```text
100 operaciones concurrentes
```

sobre capacidad limitada.

---

## Gate M4

Deben pasar:

```text
AC-SEAT-*
AC-CON-SEAT-*
AC-INV-SEAT-*
```

P0.

---

# 18. M5 — Platillos y termo

# 18.1 Platillos

## GR-05-01 — MealOption

**Prioridad:** P1

Configurable por evento.

---

## GR-05-02 — MealSelection

**Prioridad:** P1

Una selección por GroupMember.

---

## GR-05-03 — Graduate meals API/UI

**Prioridad:** P1

Flujo:

```text
overview
→ select
→ review
→ saved
```

Deadline aplicado backend.

---

## GR-05-04 — Admin meals

**Prioridad:** P1

Panel:

- totals;
- pending;
- graduate detail;
- post-deadline override.

---

# 18.2 Termo

## GR-05-05 — ThermoRequest refactor

**Prioridad:** P1

Estados:

```text
LOCKED
AVAILABLE
REQUESTED
IN_PRODUCTION
DELIVERED
```

---

## GR-05-06 — Thermo eligibility

**Prioridad:** P0

Derivar elegibilidad desde:

```text
financial progress
vs
event threshold
```

---

## GR-05-07 — Graduate thermo

**Prioridad:** P1

Implementar:

```text
locked
available
request
requested
production
delivered
```

---

## GR-05-08 — Admin thermo

**Prioridad:** P1

Panel + detalle + transitions.

---

## Gate M5

Pasar:

```text
AC-MEAL-*
AC-TH-*
AC-INV-MEAL-*
AC-INV-TH-*
```

---

# 19. M6 — Pasarelas y conciliación

Mercado Pago se implementa primero.

OpenPay después.

---

# 19.1 Mercado Pago

## GR-06-01 — Mercado Pago adapter

**Prioridad:** P0

Crear adapter aislado del dominio.

Responsabilidades:

```text
create checkout
verify payment
refund when supported
normalize provider response
```

No permitir que DTOs de Mercado Pago invadan `PaymentPlan`.

---

## GR-06-02 — PaymentAttempt

**Prioridad:** P0

Implementar ciclo:

```text
CREATED
REDIRECTED
PENDING
CONFIRMED
FAILED
EXPIRED
```

---

## GR-06-03 — Checkout Pro flow

**Prioridad:** P0

```text
frontend
→ backend
→ preference
→ init_point
→ redirect
```

Monto resuelto en backend.

---

## GR-06-04 — Mercado Pago webhook

**Prioridad:** P0

Implementar:

- autenticidad oficial;
- PaymentProviderEvent;
- deduplicación;
- server verification;
- PaymentTransaction;
- allocation;
- freeze;
- termo progress.

---

## GR-06-05 — Return flow

**Prioridad:** P0

Frontend:

```text
return
→ Estamos confirmando tu pago
→ poll attempt
→ confirmed/pending/failed
```

No confiar en URL.

---

## GR-06-06 — MP reconciliation

**Prioridad:** P1

Detectar:

```text
MATCHED
PENDING_CONFIRMATION
REQUIRES_REVIEW
```

---

# 19.2 OpenPay

## GR-06-07 — Auditar adapter OpenPay legacy

**Prioridad:** P0

No continuar utilizando automáticamente la implementación actual.

Comparar:

- autenticación;
- webhook verification;
- retries;
- idempotencia;
- provider IDs;

contra contrato oficial vigente.

---

## GR-06-08 — OpenPay adapter

**Prioridad:** P2

Refactorizar como proveedor secundario detrás de la misma abstracción.

---

## GR-06-09 — OpenPay webhook

**Prioridad:** P2

Mismos invariantes de idempotencia.

---

## Gate M6

Mercado Pago P0 debe superar:

```text
AC-MP-001..006
AC-IDEM-*
AC-INV-FIN-003
```

OpenPay no bloquea el núcleo del primer release si se decide lanzar únicamente con proveedor primario, siempre que el alcance comercial de release lo permita.

---

# 20. M7 — Operación ADMIN

El prototipo Admin aprobado deberá implementarse contra APIs reales.

---

## GR-07-01 — Admin application shell

**Prioridad:** P1

Navegación global:

```text
Inicio
Eventos
Graduados
Pagos
Reportes
Más
```

---

## GR-07-02 — Event context shell

**Prioridad:** P1

Dentro de evento:

```text
Resumen
Graduados
Pagos
Mesas
Platillos
Termos
Reportes
Configuración
```

---

## GR-07-03 — Dashboard real

**Prioridad:** P1

Conectar métricas reales.

No hardcodear datos demo.

---

## GR-07-04 — Event wizard

**Prioridad:** P1

Implementar pasos definidos en `UX_FLOWS.md`.

---

## GR-07-05 — Graduate list/detail

**Prioridad:** P1

Implementar filtros, expediente y navegación contextual.

---

## GR-07-06 — Finance admin UI

**Prioridad:** P1

Implementar:

```text
summary
portfolio
graduate payment plan
manual payment
adjustment/refund
reconciliation
```

---

## GR-07-07 — Seating admin UI

**Prioridad:** P1

Integrar el editor M4 al contexto del evento.

---

## GR-07-08 — Meal admin UI

**Prioridad:** P1

---

## GR-07-09 — Thermo admin UI

**Prioridad:** P1

---

## GR-07-10 — Lifecycle modals

**Prioridad:** P1

```text
close
reopen
finalize
cancel
graduate cancellation
```

---

## GR-07-11 — Admin account UI

**Prioridad:** P1

Sin selector de roles.

---

## GR-07-12 — Audit history UI

**Prioridad:** P1

Lenguaje natural.

---

# 21. M8 — Experiencia GRADUATE integrada

La UI existente podrá reutilizarse cuando coincida con los prototipos y contratos nuevos.

No reescribir pantallas útiles por principio.

---

## GR-08-01 — Graduate app shell

**Prioridad:** P1

Bottom nav exacto:

```text
Inicio
Mi grupo
Pagos
Más
```

---

## GR-08-02 — Auth screens

**Prioridad:** P1

- access;
- register;
- login;
- password reset.

---

## GR-08-03 — Event selector

**Prioridad:** P1

Solo visible si la cuenta tiene múltiples membresías.

---

## GR-08-04 — Home

**Prioridad:** P1

Estados:

```text
normal
upcoming
overdue
```

---

## GR-08-05 — Group

**Prioridad:** P1

- list;
- add;
- no capacity;
- reduction path.

---

## GR-08-06 — Seating flow

**Prioridad:** P1

Integrado desde M4.

---

## GR-08-07 — Meals flow

**Prioridad:** P1

---

## GR-08-08 — Payments flow

**Prioridad:** P0

```text
overview
detail
pre-confirm
redirect
confirming
success
failed
pending
history
other methods
```

---

## GR-08-09 — Thermo flow

**Prioridad:** P1

---

## GR-08-10 — Summary

**Prioridad:** P1

---

## GR-08-11 — More/profile/help/logout

**Prioridad:** P1

---

## GR-08-12 — Cross-cutting states

**Prioridad:** P1

```text
loading
empty
error
offline
success
```

---

## Gate M8

Suite E2E:

```text
E2E-001..011
```

deberá poder ejecutarse contra frontend + API reales.

---

# 22. M9 — Reportes, notificaciones y archivos

## GR-09-01 — Notification persistence

**Prioridad:** P1

Implementar:

```text
Notification
read_at
```

---

## GR-09-02 — Email adapter

**Prioridad:** P1

Casos:

```text
password reset
payment reminder
payment confirmed
overdue
thermo available
```

---

## GR-09-03 — Reminder scheduler

**Prioridad:** P1

Recordatorios:

```text
pre-due
post-due
```

Sin WhatsApp automático.

---

## GR-09-04 — Financial reports

**Prioridad:** P1

---

## GR-09-05 — Portfolio report

**Prioridad:** P1

---

## GR-09-06 — Seating report

**Prioridad:** P1

---

## GR-09-07 — Meals report

**Prioridad:** P1

---

## GR-09-08 — Thermos report

**Prioridad:** P1

---

## GR-09-09 — CSV/XLSX exports

**Prioridad:** P1

---

## GR-09-10 — PDF summary exports

**Prioridad:** P2

---

## GR-09-11 — FileAsset storage

**Prioridad:** P1

Soportar:

```text
seating background
payment evidence
refund evidence
```

con storage privado.

---

# 23. M10 — Hardening y NFR

Este milestone no es una fase cosmética.

Es requisito previo a producción.

---

# 23.1 Seguridad

## GR-10-01 — CORS

**Prioridad:** P0

Eliminar CORS abierto en producción.

---

## GR-10-02 — Rate limiting

**Prioridad:** P0

Configurar baselines de `NON_FUNCTIONAL_REQUIREMENTS.md`.

---

## GR-10-03 — Security headers

**Prioridad:** P1

---

## GR-10-04 — Secret audit

**Prioridad:** P0

Verificar repo y frontend bundle.

---

## GR-10-05 — Session security

**Prioridad:** P0

Verificar:

- access TTL;
- refresh rotation;
- revocation;
- logout;
- disabled users.

---

# 23.2 Observabilidad

## GR-10-06 — Structured logging

**Prioridad:** P0

---

## GR-10-07 — Metrics

**Prioridad:** P1

---

## GR-10-08 — Error tracking

**Prioridad:** P1

---

## GR-10-09 — Alerts

**Prioridad:** P0/P1

DB/webhook P0.

---

## GR-10-10 — Health endpoints

**Prioridad:** P0

```text
/health/live
/health/ready
```

---

# 23.3 Backups

## GR-10-11 — Backup policy

**Prioridad:** P0

Configurar:

```text
daily 30d
monthly 6m
```

---

## GR-10-12 — PITR

**Prioridad:** P1

Habilitar si infraestructura lo soporta.

---

## GR-10-13 — Restore drill

**Prioridad:** P0

Realizar restauración real.

No aceptar solo "backup job success".

---

# 23.4 Performance

## GR-10-14 — Load test harness

**Prioridad:** P1

Escenario baseline:

```text
300 concurrent sessions
50 RPS
10 min
```

---

## GR-10-15 — Peak test

**Prioridad:** P1

```text
100 RPS
60 sec
```

---

## GR-10-16 — Seating stress

**Prioridad:** P0

Probar race condition + 200 mesas.

---

## GR-10-17 — Query optimization

**Prioridad:** P1

Usar:

```text
EXPLAIN ANALYZE
```

en:

- dashboard;
- portfolio;
- payment plan;
- seating availability.

---

# 23.5 Accessibility / compatibility

## GR-10-18 — WCAG review

**Prioridad:** P1

Objetivo:

```text
WCAG 2.1 AA
```

en flujos esenciales.

---

## GR-10-19 — Browser matrix

**Prioridad:** P1

Validar browsers del NFR.

---

# 24. M11 — Migración legacy y release

## Objetivo

Retirar la dependencia operacional del modelo original sin perder datos útiles.

---

## GR-11-01 — Migration inventory

**Prioridad:** P0

Antes de ejecutar migración:

obtener conteos y clasificar:

```text
Graduate
Ticket
Guest
Table
TableSelection
Payment
Thermo
```

---

## GR-11-02 — Graduate → Account/Membership

**Prioridad:** P0

Migrar:

```text
identity
profile
event participation
```

---

## GR-11-03 — Ticket → places/plan

**Prioridad:** P0

Separar:

```text
tickets_count
→ active_places

total/base amounts
→ PaymentPlan/Installments
```

No migrar ciegamente.

---

## GR-11-04 — Guest → GroupMember

**Prioridad:** P1

Eliminar semántica de seat number.

---

## GR-11-05 — Table → EventTable

**Prioridad:** P1

Normalizar posiciones existentes.

Corregir coordenadas legacy que estén fuera del formato objetivo.

---

## GR-11-06 — TableSelection → TableAssignment

**Prioridad:** P0

Crear:

```text
places_assigned
```

desde la cantidad vigente de lugares.

Validar no sobrecupo.

---

## GR-11-07 — Payment legacy classification

**Prioridad:** P0

No hacer migración 1:1 automática sin clasificar:

```text
obligation
confirmed payment
pending attempt
failed attempt
```

---

## GR-11-08 — Thermo migration

**Prioridad:** P1

Mapear estados legacy al nuevo workflow.

---

## GR-11-09 — Reconciliation migration report

**Prioridad:** P0

Generar reporte antes/después:

```text
graduates
places
tables
financial totals
thermos
```

---

## GR-11-10 — Legacy API deprecation

**Prioridad:** P0

Frontend oficial debe consumir solo:

```text
/api/v1
```

---

## GR-11-11 — Remove unsafe legacy paths

**Prioridad:** P0

Eliminar/deshabilitar rutas que permitan:

- auth Graduate-as-account;
- payment legacy mutation;
- table selection sin locking;
- authorization incorrecta.

---

## GR-11-12 — Production migration rehearsal

**Prioridad:** P0

Ejecutar migración completa en clon de staging.

---

## GR-11-13 — Release candidate

**Prioridad:** P0

Crear RC solo si:

```text
Blocker = 0
Critical = 0
```

---

## GR-11-14 — Production release

**Prioridad:** P0

Precondiciones:

```text
backup verified
restore tested
migrations rehearsed
CI green
P0 AC green
monitoring active
webhook endpoints validated
```

---

# 25. Dependencias críticas

```text
M0
 ↓
M1
 ↓
M2
 ├─────────────┐
 ↓             │
M3             │
 ├──────┐      │
 ↓      │      │
M6      M5     M4
 │       │      │
 └──┬────┴──────┘
    ↓
 M7 + M8
    ↓
   M9
    ↓
  M10
    ↓
  M11
```

Interpretación:

- M3 financiero no depende de croquis.
- M4 croquis depende de identidad + lugares.
- M5 termo depende de M3.
- M6 pasarelas depende de M3.
- Admin/Graduate UI real puede avanzar por vertical slices una vez que sus APIs estén estables.
- Hardening y migration final requieren todos los dominios core.

---

# 26. Trabajo paralelizable

Después de M2 pueden avanzar en paralelo:

### Línea A

```text
M3 — Finanzas
→ M6 — Pasarelas
```

### Línea B

```text
M4 — Croquis
```

### Línea C

```text
M5 — Platillos
```

El termo de M5 deberá esperar al núcleo financiero de M3 para su cálculo real.

---

# 27. Orden recomendado de integración frontend

No implementar frontend por orden de menú.

Implementar por vertical slice:

```text
1. Auth
2. Event context
3. Group
4. Financial read
5. Seating
6. Meals
7. Payment checkout
8. Thermo
9. Admin management
10. Reports
```

Cada slice debe conectar:

```text
UI
→ API
→ service
→ DB
→ tests
```

antes de declararse cerrado.

---

# 28. Orden recomendado para Codex/agentes

Los agentes no deberán recibir prompts como:

```text
"implementa toda Plataforma GR"
```

Se deberá entregar:

```text
1 ticket
+
documentos obligatorios
+
archivos afectados
+
criterios de aceptación
+
restricciones
```

---

# 29. Plantilla mínima de ticket para agente

```markdown
# TICKET GR-XX-XX — Título

Estado: READY
Prioridad: P0/P1/P2
Bloqueado por: ...

## Objetivo

...

## Fuente de verdad obligatoria

Leer en este orden:

1. docs/PRODUCT_SCOPE.md
2. docs/BUSINESS_RULES.md
3. documento específico
4. docs/API_CONTRACTS.md
5. docs/ACCEPTANCE_CRITERIA.md

## Alcance autorizado

- ...

## Fuera de alcance

- ...

## Criterios de aceptación

- AC-...
- AC-...

## Restricciones técnicas

- no modificar ...
- no crear ...
- no cambiar contrato ...

## Entregables

- código
- migration
- tests
- OpenAPI
- notas QA

## Definition of Done

...
```

---

# 30. Reglas para agentes

## AGENT-001

No inventar roles.

## AGENT-002

No inventar módulos.

## AGENT-003

No cambiar `SQUARE/ROUND`.

## AGENT-004

No introducir sillas.

## AGENT-005

No cambiar Mercado Pago como proveedor principal.

## AGENT-006

No volver a usar `Payment` como obligación + transacción.

## AGENT-007

No confiar en frontend para roles, IDs o montos.

## AGENT-008

No omitir transacciones/locking en capacidad.

## AGENT-009

No hard-delete financiero.

## AGENT-010

No mantener una ruta legacy solo por compatibilidad si viola el baseline.

---

# 31. Estrategia de testing por milestone

## M0

```text
build
lint
migration
CI
```

## M1

```text
auth
authorization
IDOR
```

## M2

```text
event lifecycle
membership
event capacity concurrency
```

## M3

```text
financial unit
ledger integration
idempotency
refund
```

## M4

```text
seating integration
concurrency
frontend canvas
```

## M5

```text
deadline
meal ownership
thermo state machine
```

## M6

```text
provider sandbox/mock
webhooks
duplicate events
reconciliation
```

## M7/M8

```text
E2E
visual QA
contract QA
```

## M9

```text
report totals
exports
notifications
```

## M10

```text
load
security
restore
alerts
```

## M11

```text
migration rehearsal
regression
RC
```

---

# 32. Release gates

## Gate A — Technical Foundation

```text
M0 complete
```

---

## Gate B — Domain Integrity

```text
M1 + M2 + M3 core P0 complete
```

---

## Gate C — Operations

```text
M4 + M5 + Mercado Pago M6 complete
```

---

## Gate D — Product Complete

```text
M7 + M8 + M9 complete
```

---

## Gate E — Production Ready

```text
M10 complete
M11 rehearsal complete
```

---

# 33. P0 dependency chain

El camino crítico aproximado es:

```text
GR-00-04 migrations
→ GR-01-01 Account
→ GR-01-02 Membership
→ GR-01-03 Auth
→ GR-02-01 Event
→ GR-02-06 Places
→ GR-03-01 PaymentPlan
→ GR-03-02 Installment
→ GR-03-05 Transaction
→ GR-03-06 Allocation
→ GR-06-02 PaymentAttempt
→ GR-06-04 Mercado Pago webhook
→ GR-08-08 Graduate payments UI
→ GR-10 hardening
→ GR-11 migration/release
```

Croquis es crítico para el producto, pero puede desarrollarse paralelamente después de M2.

---

# 34. Entregables por milestone

| Milestone | Entregable verificable |
|---|---|
| M0 | Repo reproducible + CI + `/api/v1` |
| M1 | Account/Membership + RBAC + secure auth |
| M2 | Eventos/lugares/grupos operativos |
| M3 | Ledger financiero funcional |
| M4 | Croquis concurrent-safe |
| M5 | Platillos + termo |
| M6 | Mercado Pago funcional + OpenPay secundario |
| M7 | Admin conectado |
| M8 | Graduate conectado |
| M9 | Reportes/notificaciones/files |
| M10 | NFR validados |
| M11 | Migración + RC + release |

---

# 35. Componentes que no deben bloquear el primer avance

No se debe esperar a tener:

- PDF reports;
- OpenPay secundario;
- optimizaciones cosméticas;
- browser matrix completa;

para comenzar M1–M5.

Pero ninguno deberá omitirse del release si sigue clasificado como requerido para ese release.

---

# 36. Riesgos técnicos principales

## RISK-001 — Migración financiera

Impacto:

```text
MUY ALTO
```

El modelo `Payment` actual mezcla conceptos.

Mitigación:

- construir dominio nuevo primero;
- script de clasificación;
- reconciliation report;
- no migrar 1:1.

---

## RISK-002 — Concurrencia mesas

Impacto:

```text
ALTO
```

Mitigación:

- row locks/serializable;
- stress tests antes del frontend final.

---

## RISK-003 — Capacidad evento

Impacto:

```text
ALTO
```

Mitigación:

- transaction;
- DB authority;
- concurrent tests.

---

## RISK-004 — Auth migration

Impacto:

```text
ALTO
```

Cambiar de Graduate identity a Account/Membership afecta gran parte del backend.

Mitigación:

- implementar policies centrales;
- migrar endpoints por dominio;
- no mezclar ambas identidades en rutas nuevas.

---

## RISK-005 — Gateway coupling

Impacto:

```text
ALTO
```

Mitigación:

- provider adapters;
- PaymentAttempt;
- PaymentTransaction independiente.

---

## RISK-006 — Legacy docs

Impacto:

```text
MEDIO
```

El repo contiene documentación antigua.

Mitigación:

- nuevo índice documental;
- marcar legacy;
- no permitir que agentes usen README/SRS viejos como fuente superior.

---

# 37. Estrategia de documentación legacy

No borrar inmediatamente documentos históricos.

Clasificar:

```text
CURRENT
LEGACY
DEPRECATED
```

Crear índice:

```text
docs/INDEX.md
```

Los once documentos baseline de este proceso deberán figurar como:

```text
CURRENT / SOURCE OF TRUTH
```

---

# 38. Estrategia de endpoint legacy

Durante desarrollo:

```text
legacy API
+
/api/v1
```

pueden coexistir.

Pero:

```text
frontend nuevo
→ solo /api/v1
```

Antes de release:

```text
legacy unsafe routes
→ removed/disabled
```

---

# 39. Estrategia de migración de frontend

Para cada pantalla existente:

```text
1. comparar contra UX_FLOWS
2. conservar si coincide
3. adaptar datos y navegación
4. reemplazar servicios API
5. añadir estados faltantes
6. eliminar conceptos legacy
7. ejecutar visual QA
```

No recrear una pantalla que ya cumple la UX solo para cambiar su implementación.

---

# 40. Estrategia de croquis

La secuencia exacta será:

```text
1. importar/adaptar primitives React Konva
2. crear SeatingMap
3. EventTable normalized
4. Admin render
5. Admin drag
6. table CRUD
7. availability
8. TableAssignment
9. row locking
10. Graduate projection
11. Graduate selection
12. conflict UX
13. split group ADMIN
14. stress test
```

No implementar:

```text
zones
seats
VIP
recognition
```

---

# 41. Estrategia financiera

Secuencia exacta:

```text
1. PaymentPlan
2. Installment
3. derived balances
4. PaymentTransaction
5. PaymentAllocation
6. manual CASH
7. manual TRANSFER
8. Adjustment
9. Refund
10. PaymentAttempt
11. Mercado Pago
12. Reconciliation
13. OpenPay
```

Esta secuencia es deliberada.

No integrar gateway antes de contar con ledger funcional.

---

# 42. Auditoría como cross-cutting

AuditLog deberá introducirse temprano.

No esperar al final para "agregar auditoría".

Orden recomendado:

```text
M1 schema
M2 event audit
M3 finance audit
M4 seating audit
M5 meals/thermo audit
```

---

# 43. OpenAPI como contrato ejecutable

Desde M0/M1:

```text
Swagger/OpenAPI
```

deberá permanecer sincronizado con:

```text
API_CONTRACTS.md
```

Cada ticket API debe actualizar schemas.

---

# 44. Seeds de desarrollo

Después del nuevo modelo:

crear seed controlado con datos demo ya utilizados por los prototipos.

Objetivo:

- QA consistente;
- screenshots;
- E2E;
- demos.

Nunca usarlo como default de producción.

---

# 45. Datos demo recomendados para seed

```text
Admin: Mariana López

Graduate: Andrea Martínez
andrea.martinez@ejemplo.com
Licenciatura en Derecho
Generación 2027

Evento:
Graduación Facultad de Derecho 2027
19 de junio de 2027
Centro de Convenciones

8 lugares
Mesa 24

Plan:
$12,500
5 x $2,500
3 pagadas
2 pendientes

Meals:
Tradicional / Vegetariano / Vegano

Thermo threshold:
70%
```

Estos valores son exclusivamente seed/demo.

---

# 46. Qué no debe incorporarse al roadmap

Quedan excluidos:

```text
invitaciones digitales
RSVP
QR/check-in
scanner
hostess
album
marketplace
multi-tenant
planners
organizaciones
VIP
seat assignment
CAD
automatic floorplan recognition
WhatsApp automation
CFDI
automatic late fees
native mobile apps
```

---

# 47. Priorización resumida

## P0 — Integridad / seguridad / dinero

```text
migrations
auth
authorization
Account/Membership
event capacity
financial ledger
plan freeze
payment idempotency
Mercado Pago verification
refund limits
table concurrency
audit immutability
backup/restore
production security
```

---

## P1 — MVP operativo

```text
Admin UI
Graduate UI
events
groups
meals
thermo
manual payments
portfolio
reports
notifications
files
seating editor
```

---

## P2 — Complemento

```text
OpenPay secondary
PDF summaries
advanced export processing
non-critical operational polish
```

---

# 48. Definition of MVP implemented

Se considerará que el software implementa el MVP cuando:

```text
1. ADMIN puede crear y operar eventos.
2. GRADUATE puede registrarse/acceder por evento.
3. Lugares se controlan sin sobrecupo.
4. Grupo se administra según deadlines.
5. Plan financiero funciona con calendario fijo.
6. Mercado Pago confirma server-to-server.
7. ADMIN registra efectivo/transferencia.
8. Ajustes/refunds preservan historia.
9. Mesas funcionan con concurrencia segura.
10. Platillos funcionan por integrante.
11. Termo se desbloquea por progreso.
12. ADMIN ve cartera/reportes.
13. Auditoría cubre cambios críticos.
14. Notificaciones base funcionan.
15. UI aprobada está integrada.
16. P0 acceptance criteria están verdes.
17. Backups/restores están probados.
18. Observabilidad está activa.
```

---

# 49. Definition of Production Ready

MVP funcional no equivale automáticamente a producción.

Para producción además:

```text
Blocker = 0
Critical = 0

CI = green
migrations = rehearsed
restore = tested
CORS = restricted
rate limits = active
provider webhooks = verified
idempotency = proven
load test = passed
security tests = passed
monitoring = active
alerts = active
```

---

# 50. Plan de checkpoints

## Checkpoint 1 — Foundation

Después de M0.

Pregunta:

```text
¿Puede un desarrollador nuevo levantar y validar el repo desde cero?
```

---

## Checkpoint 2 — Domain

Después de M3.

Pregunta:

```text
¿El sistema ya puede representar correctamente una deuda, un pago y una corrección sin depender de una pasarela?
```

---

## Checkpoint 3 — Operations

Después de M5.

Pregunta:

```text
¿Eventos, lugares, mesas, platillos y termos cumplen las reglas aprobadas?
```

---

## Checkpoint 4 — Payments

Después de Mercado Pago.

Pregunta:

```text
¿Un pago real/sandbox recorre checkout → webhook → ledger → UI sin confiar en el navegador?
```

---

## Checkpoint 5 — Product

Después de M8/M9.

Pregunta:

```text
¿ADMIN y GRADUATE pueden completar todos los flujos aprobados desde UI?
```

---

## Checkpoint 6 — Release

Después de M10/M11.

Pregunta:

```text
¿Podemos perder una instancia y restaurarla, recibir carga concurrente y detectar errores sin corromper datos?
```

---

# 51. Prohibición de salto de dependencias

Ejemplos explícitos:

No hacer:

```text
Mercado Pago production integration
ANTES de PaymentPlan/Transaction/Allocation
```

No hacer:

```text
Graduate table selection final
ANTES de concurrency control
```

No hacer:

```text
Admin financial UI final
ANTES de ledger
```

No hacer:

```text
production release
ANTES de migrations + restore test
```

---

# 52. Estrategia de entrega incremental

Cada milestone deberá terminar en software ejecutable.

No acumular:

```text
5 milestones
→ merge masivo
```

Preferir:

```text
ticket pequeño
→ review
→ test
→ merge
→ siguiente
```

---

# 53. Métricas de avance

El avance no deberá medirse únicamente por:

```text
pantallas terminadas
```

Debe medirse por:

```text
tickets DONE
AC P0 verdes
AC P1 verdes
E2E verdes
migrations reproducibles
regressions abiertas
```

---

# 54. Dashboard de progreso recomendado

Por milestone:

| Campo | Métrica |
|---|---|
| Tickets | Done / Total |
| P0 | Passed / Total |
| P1 | Passed / Total |
| Bugs blocker | Count |
| Bugs critical | Count |
| E2E | Passed / Total |
| Migration status | Pass/Fail |
| Build | Pass/Fail |
| Deploy staging | Pass/Fail |

---

# 55. Punto de inicio recomendado

El primer trabajo de implementación posterior a esta documentación debe ser:

```text
GR-00-01 — Congelar baseline documental
```

seguido de:

```text
GR-00-02 — Repository source of truth
GR-00-03 — Scripts de calidad
GR-00-04 — Migraciones reproducibles
```

No iniciar todavía:

```text
Admin UI final
Mercado Pago
croquis final
```

hasta completar el foundation gate correspondiente.

---

# 56. Estado inicial del roadmap

```text
M0 — READY
M1 — BLOCKED BY M0
M2 — BLOCKED BY M1
M3 — BLOCKED BY M2
M4 — BLOCKED BY M2
M5 — PARTIALLY BLOCKED BY M2/M3
M6 — BLOCKED BY M3
M7 — BLOCKED BY DOMAIN APIS
M8 — BLOCKED BY DOMAIN APIS
M9 — BLOCKED BY CORE DOMAINS
M10 — BLOCKED BY MVP COMPLETE
M11 — BLOCKED BY HARDENING
```

---

# 57. Baseline

Con esta versión se establece:

```text
ROADMAP_IMPLEMENTATION_VERSION = 1.0
```

El roadmap se considera la secuencia oficial de implementación mientras los documentos de producto y negocio baseline permanezcan sin cambios.

Cualquier alteración de alcance deberá:

```text
1. actualizar documento fuente;
2. identificar tickets afectados;
3. reordenar dependencias;
4. actualizar este roadmap;
5. reevaluar acceptance criteria.
```
