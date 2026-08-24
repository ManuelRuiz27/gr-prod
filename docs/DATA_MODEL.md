# DATA_MODEL.md

# Plataforma GR — Modelo de Datos

**Documento:** `DATA_MODEL.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline lógico de datos para esquema físico, migraciones y contratos API  
**Fecha:** 24 de agosto de 2026  
**Documentos fuente:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `UX_FLOWS.md`, `FINANCIAL_DOMAIN.md`, `SEATING_MAP.md`  
**Persistencia objetivo:** PostgreSQL + Prisma  
**Propósito:** Definir entidades, relaciones, enums, constraints, índices, ownership y reglas de persistencia de Plataforma GR.

---

# 1. Propósito

Este documento convierte las decisiones funcionales ya cerradas en un **modelo lógico de datos**.

Debe servir como fuente para:

- `schema.prisma`;
- migraciones;
- constraints de PostgreSQL;
- repositorios/servicios backend;
- contratos API;
- pruebas de integración;
- seeds;
- auditoría;
- estrategia de concurrencia;
- refactor del repositorio existente.

Este documento no autoriza nuevas funcionalidades.

---

# 2. Principios del modelo

## DM-P-001 — Single-tenant

No existe entidad:

```text
Tenant
Organization
Company
Workspace
```

La instancia completa pertenece a una sola empresa operadora.

---

## DM-P-002 — Identidad separada del dominio

La autenticación se modela mediante:

```text
Account
```

La participación de un graduado en un evento se modela mediante:

```text
GraduateMembership
```

No deberá utilizarse directamente:

```text
Account == Graduate
```

porque una misma cuenta puede participar en más de un evento.

---

## DM-P-003 — Datos históricos no destructivos

Las entidades con valor financiero o de auditoría deberán preservarse.

No se hará hard-delete operativo de:

- PaymentPlan congelado;
- Installment con historia;
- PaymentTransaction confirmada;
- PaymentAllocation;
- Adjustment;
- Refund;
- AuditLog.

---

## DM-P-004 — Valores derivados

No deberán almacenarse como fuente autoritativa si pueden calcularse:

- ocupación de mesa;
- lugares disponibles;
- total pagado;
- total pendiente;
- total vencido;
- progreso financiero;
- estado FULL de una mesa.

Podrán existir caches/materializaciones futuras, pero no serán fuente de verdad.

---

## DM-P-005 — Dinero exacto

Los montos deberán persistirse mediante:

```text
DECIMAL/NUMERIC
```

o enteros en centavos.

En el baseline PostgreSQL/Prisma se recomienda:

```text
Decimal @db.Decimal(12, 2)
```

mientras no se decida migrar a centavos enteros.

Nunca usar `Float` para dinero.

---

## DM-P-006 — Timestamps

Los eventos de tiempo deberán persistirse en UTC mediante tipos equivalentes a:

```text
TIMESTAMPTZ
```

Las fechas civiles sin hora, como la fecha del evento, podrán almacenarse como:

```text
DATE
```

El timezone operativo deberá existir como dato de configuración.

---

# 3. Mapa de entidades

```text
Account
│
├── PasswordResetToken
├── Notification
├── AuditLog (actor)
│
└── GraduateMembership
      │
      ├── GroupMember
      │     └── MealSelection
      │
      ├── PaymentPlan
      │     ├── Installment
      │     ├── PaymentAttempt
      │     ├── PaymentTransaction
      │     │     ├── PaymentAllocation
      │     │     └── Refund
      │     └── Adjustment
      │
      ├── TableAssignment
      │
      └── ThermoRequest

Event
│
├── EventSettings
├── MealOption
├── SeatingMap
│     └── EventTable
│           └── TableAssignment
│
├── GraduateMembership
└── FileAsset

PaymentProviderEvent
└── PaymentAttempt / PaymentTransaction

AuditLog
└── references entities logically
```

---

# 4. Enums principales

## AccountRole

```text
ADMIN
GRADUATE
```

---

## AccountStatus

```text
ACTIVE
DISABLED
```

---

## EventStatus

```text
DRAFT
OPEN
CLOSED
FINALIZED
CANCELLED
```

---

## GraduateMembershipStatus

Estados mínimos:

```text
ACTIVE
CANCELLED
COMPLETED
```

`PENDING` podrá utilizarse únicamente si el flujo de alta requiere distinguir una membresía todavía no activada.

La necesidad exacta de `PENDING` deberá confirmarse al cerrar contratos de registro.

---

## TableShape

```text
SQUARE
ROUND
```

---

## TableStatus

```text
AVAILABLE
BLOCKED
```

`FULL` no se persiste.

---

## PaymentPlanStatus

```text
ACTIVE
SETTLED
CANCELLED
```

---

## PaymentAttemptStatus

```text
CREATED
REDIRECTED
PENDING
CONFIRMED
FAILED
EXPIRED
CANCELLED
```

---

## PaymentSource

```text
MERCADO_PAGO
OPENPAY
CASH
TRANSFER
```

---

## PaymentTransactionStatus

```text
CONFIRMED
REVERSED
```

---

## AdjustmentType

Tipos ya definidos conceptualmente:

```text
CREDIT
DEBIT
OBLIGATION_REDUCTION
OBLIGATION_CANCELLATION
```

---

## RefundStatus

```text
REQUESTED
PENDING
CONFIRMED
FAILED
CANCELLED
```

---

## ThermoStatus

```text
LOCKED
AVAILABLE
REQUESTED
IN_PRODUCTION
DELIVERED
```

---

## NotificationStatus

No se requiere un enum persistido si se utiliza:

```text
read_at IS NULL / NOT NULL
```

---

# 5. Account

## 5.1 Propósito

Entidad autenticable para ambos roles.

---

## 5.2 Campos

```text
Account
-------
id                  UUID PK
email               VARCHAR UNIQUE NOT NULL
password_hash       VARCHAR NOT NULL
full_name           VARCHAR NOT NULL
phone               VARCHAR NULL

role                AccountRole NOT NULL
status              AccountStatus NOT NULL DEFAULT ACTIVE

last_login_at       TIMESTAMPTZ NULL

created_at          TIMESTAMPTZ NOT NULL
updated_at          TIMESTAMPTZ NOT NULL
```

---

## 5.3 Constraints

```text
UNIQUE(lower(email))
```

o estrategia equivalente de normalización.

El email deberá normalizarse antes de persistencia.

---

## 5.4 Reglas

- el usuario no puede modificar `role`;
- `DISABLED` bloquea autenticación;
- una cuenta no se elimina físicamente si posee historia financiera o de auditoría.

---

# 6. PasswordResetToken

## Campos

```text
PasswordResetToken
------------------
id                  UUID PK
account_id          UUID FK → Account
token_hash          VARCHAR UNIQUE NOT NULL
expires_at          TIMESTAMPTZ NOT NULL
used_at             TIMESTAMPTZ NULL
created_at          TIMESTAMPTZ NOT NULL
```

---

## Reglas

Un token válido requiere:

```text
used_at IS NULL
AND expires_at > now()
```

El token plano no deberá persistirse.

---

# 7. Event

## 7.1 Propósito

Representa un evento de graduación.

---

## 7.2 Campos

```text
Event
-----
id                  UUID PK

name                VARCHAR NOT NULL
event_date          DATE NOT NULL
venue               VARCHAR NOT NULL
capacity            INTEGER NOT NULL

timezone            VARCHAR NOT NULL

status              EventStatus NOT NULL DEFAULT DRAFT

created_at          TIMESTAMPTZ NOT NULL
updated_at          TIMESTAMPTZ NOT NULL
```

---

## 7.3 Constraints

```text
CHECK(capacity > 0)
```

---

## 7.4 Notas

No se agrega una hora del evento porque no forma parte del baseline aprobado.

---

# 8. EventSettings

## 8.1 Propósito

Agrupar reglas configurables por evento que no pertenecen a una entidad operativa propia.

---

## Campos

```text
EventSettings
-------------
id                          UUID PK
event_id                    UUID UNIQUE FK → Event

places_deadline             TIMESTAMPTZ NULL
table_change_deadline       TIMESTAMPTZ NULL
meals_deadline              TIMESTAMPTZ NULL

thermo_threshold_percent    INTEGER NOT NULL

financial_config_version    INTEGER NOT NULL DEFAULT 1

cancellation_policy_config  JSONB NULL

created_at                  TIMESTAMPTZ NOT NULL
updated_at                  TIMESTAMPTZ NOT NULL
```

---

## Constraints

```text
CHECK(thermo_threshold_percent >= 0)
CHECK(thermo_threshold_percent <= 100)
CHECK(financial_config_version >= 1)
```

---

## Nota sobre cancellation_policy_config

La política de cancelación es configurable pero su estructura exacta todavía no se ha convertido en un esquema cerrado.

Por ello se permite:

```text
JSONB
```

como contenedor controlado por validación de aplicación.

No deberá aceptarse JSON arbitrario sin schema.

El contrato estructurado final se definirá en `API_CONTRACTS.md`.

---

# 9. GraduateMembership

## 9.1 Propósito

Representar la participación de una cuenta GRADUATE en un evento específico.

---

## Campos

```text
GraduateMembership
------------------
id                      UUID PK
account_id              UUID FK → Account
event_id                UUID FK → Event

career                  VARCHAR NULL
generation              VARCHAR NULL

active_places           INTEGER NOT NULL
places_confirmed_at     TIMESTAMPTZ NULL

status                  GraduateMembershipStatus NOT NULL DEFAULT ACTIVE

cancelled_at            TIMESTAMPTZ NULL
cancel_reason           TEXT NULL

created_at              TIMESTAMPTZ NOT NULL
updated_at              TIMESTAMPTZ NOT NULL
```

---

## Constraints

```text
UNIQUE(account_id, event_id)
CHECK(active_places >= 1)
```

---

## Reglas

La suma de integrantes activos:

```text
<= active_places
```

La suma de asignaciones de mesa:

```text
<= active_places
```

---

## Confirmación comercial

Cuando el evento requiera obligación inicial:

```text
places_confirmed_at
```

se establece cuando dicha obligación queda confirmada y la capacidad global es validada.

---

# 10. GroupMember

## 10.1 Propósito

Representar nominalmente a las personas incluidas en los lugares de una membresía.

Incluye al propio graduado como integrante principal.

---

## Campos

```text
GroupMember
-----------
id                      UUID PK
graduate_membership_id  UUID FK → GraduateMembership

full_name               VARCHAR NOT NULL
is_primary              BOOLEAN NOT NULL DEFAULT FALSE
is_active               BOOLEAN NOT NULL DEFAULT TRUE

created_at              TIMESTAMPTZ NOT NULL
updated_at              TIMESTAMPTZ NOT NULL
```

---

## Constraints

Debe existir como máximo:

```text
1 is_primary = true
```

por `GraduateMembership`.

PostgreSQL deberá reforzarlo mediante índice único parcial o estrategia equivalente.

---

## Reglas

El integrante principal:

```text
is_primary = true
```

representa al graduado titular.

No se utilizará `seat_number`.

---

# 11. MealOption

## 11.1 Propósito

Catálogo de opciones de platillo específico de cada evento.

---

## Campos

```text
MealOption
----------
id              UUID PK
event_id        UUID FK → Event

name            VARCHAR NOT NULL
is_active       BOOLEAN NOT NULL DEFAULT TRUE
sort_order      INTEGER NOT NULL DEFAULT 0

created_at      TIMESTAMPTZ NOT NULL
updated_at      TIMESTAMPTZ NOT NULL
```

---

## Constraints

```text
UNIQUE(event_id, name)
```

normalizado según estrategia de aplicación.

---

# 12. MealSelection

## Campos

```text
MealSelection
-------------
id                  UUID PK
group_member_id     UUID UNIQUE FK → GroupMember
meal_option_id      UUID FK → MealOption

selected_by_account_id  UUID FK → Account
selected_at              TIMESTAMPTZ NOT NULL

override_reason      TEXT NULL

created_at           TIMESTAMPTZ NOT NULL
updated_at           TIMESTAMPTZ NOT NULL
```

---

## Reglas

- `GroupMember` y `MealOption` deben pertenecer al mismo evento;
- una selección activa por integrante;
- cambios posteriores al deadline por ADMIN requieren `override_reason`;
- el historial detallado de cambios se conserva mediante `AuditLog`.

---

# 13. SeatingMap

## Campos

```text
SeatingMap
----------
id                          UUID PK
event_id                    UUID UNIQUE FK → Event

background_file_id          UUID NULL FK → FileAsset
background_original_width   INTEGER NULL
background_original_height  INTEGER NULL

coordinate_mode             VARCHAR NOT NULL DEFAULT 'NORMALIZED'

created_at                  TIMESTAMPTZ NOT NULL
updated_at                  TIMESTAMPTZ NOT NULL
```

---

## Reglas

En baseline:

```text
coordinate_mode = NORMALIZED
```

Eliminar/cambiar el fondo no elimina mesas ni asignaciones.

---

# 14. EventTable

## Campos

```text
EventTable
----------
id                  UUID PK
event_id            UUID FK → Event
seating_map_id      UUID FK → SeatingMap

label               VARCHAR NOT NULL
shape               TableShape NOT NULL
capacity            INTEGER NOT NULL

position_x          DECIMAL NOT NULL
position_y          DECIMAL NOT NULL

width               DECIMAL NOT NULL
height              DECIMAL NOT NULL

status              TableStatus NOT NULL DEFAULT AVAILABLE

created_at          TIMESTAMPTZ NOT NULL
updated_at          TIMESTAMPTZ NOT NULL
```

---

## Constraints

```text
UNIQUE(event_id, label)

CHECK(capacity > 0)

CHECK(position_x >= 0 AND position_x <= 1)
CHECK(position_y >= 0 AND position_y <= 1)

CHECK(width > 0 AND width <= 1)
CHECK(height > 0 AND height <= 1)
```

---

## Reglas

No persistir:

```text
occupied_places
available_places
FULL
```

como fuente autoritativa.

---

# 15. TableAssignment

## 15.1 Propósito

Asignar una cantidad de lugares de una membresía a una mesa.

---

## Campos

```text
TableAssignment
---------------
id                      UUID PK
event_id                UUID FK → Event
graduate_membership_id  UUID FK → GraduateMembership
table_id                UUID FK → EventTable

places_assigned         INTEGER NOT NULL

assigned_by_account_id  UUID FK → Account
assigned_at             TIMESTAMPTZ NOT NULL
updated_at              TIMESTAMPTZ NOT NULL
```

---

## Constraints

```text
UNIQUE(graduate_membership_id, table_id)
CHECK(places_assigned > 0)
```

---

## Invariantes transaccionales

No son resolubles únicamente con un CHECK local.

Deben validarse dentro de transacción:

```text
SUM(assignments on table)
<= EventTable.capacity
```

y:

```text
SUM(assignments for membership)
<= GraduateMembership.active_places
```

---

## Grupo dividido

El modelo admite:

```text
GraduateMembership 1
→ TableAssignment Mesa 24 / 5 lugares
→ TableAssignment Mesa 25 / 3 lugares
```

---

# 16. PaymentPlan

## Campos

```text
PaymentPlan
-----------
id                      UUID PK
event_id                UUID FK → Event
graduate_membership_id  UUID UNIQUE FK → GraduateMembership

currency                CHAR(3) NOT NULL DEFAULT 'MXN'

base_amount             DECIMAL NOT NULL
contracted_total        DECIMAL NOT NULL

financial_terms_version INTEGER NOT NULL

is_frozen               BOOLEAN NOT NULL DEFAULT FALSE
frozen_at               TIMESTAMPTZ NULL

initial_payment_required BOOLEAN NOT NULL
initial_payment_amount   DECIMAL NULL

grace_period_days       INTEGER NOT NULL DEFAULT 0

status                  PaymentPlanStatus NOT NULL DEFAULT ACTIVE

created_at              TIMESTAMPTZ NOT NULL
updated_at              TIMESTAMPTZ NOT NULL
```

---

## Constraints

```text
CHECK(base_amount >= 0)
CHECK(contracted_total >= 0)
CHECK(grace_period_days >= 0)
CHECK(financial_terms_version >= 1)
```

Si:

```text
initial_payment_required = true
```

entonces:

```text
initial_payment_amount IS NOT NULL
AND initial_payment_amount > 0
```

---

# 17. Installment

## 17.1 Propósito

Representar una obligación individual.

---

## Campos

```text
Installment
-----------
id                  UUID PK
payment_plan_id     UUID FK → PaymentPlan

sequence            INTEGER NOT NULL
concept_code        VARCHAR NOT NULL
label               VARCHAR NOT NULL

original_amount     DECIMAL NOT NULL
effective_amount    DECIMAL NOT NULL

due_date            DATE NOT NULL
grace_period_days_snapshot INTEGER NOT NULL

cancelled_at        TIMESTAMPTZ NULL
cancel_reason       TEXT NULL

created_at          TIMESTAMPTZ NOT NULL
updated_at          TIMESTAMPTZ NOT NULL
```

---

## Constraints

```text
UNIQUE(payment_plan_id, sequence)

CHECK(sequence >= 1)
CHECK(original_amount >= 0)
CHECK(effective_amount >= 0)
CHECK(grace_period_days_snapshot >= 0)
```

---

## Estado derivado

No se requiere almacenar como fuente de verdad:

```text
FUTURE
UPCOMING
DUE
OVERDUE
PAID
```

Estos estados se derivan de:

- fecha;
- gracia;
- cancelación;
- allocations;
- adjustments/refunds aplicables.

`CANCELLED` se representa mediante:

```text
cancelled_at
```

---

# 18. PaymentAttempt

## Campos

```text
PaymentAttempt
--------------
id                      UUID PK
payment_plan_id         UUID FK → PaymentPlan
graduate_membership_id  UUID FK → GraduateMembership

provider                PaymentSource NOT NULL
provider_preference_id  VARCHAR NULL

requested_amount        DECIMAL NOT NULL
currency                CHAR(3) NOT NULL

status                  PaymentAttemptStatus NOT NULL

idempotency_key         VARCHAR UNIQUE NOT NULL

created_at              TIMESTAMPTZ NOT NULL
expires_at              TIMESTAMPTZ NULL
updated_at              TIMESTAMPTZ NOT NULL
```

---

## Constraint

El campo `provider` para `PaymentAttempt` electrónico deberá estar limitado en aplicación a:

```text
MERCADO_PAGO
OPENPAY
```

No se crean `PaymentAttempt` para efectivo/transferencia manual.

---

# 19. PaymentTransaction

## Campos

```text
PaymentTransaction
------------------
id                      UUID PK
payment_plan_id         UUID FK → PaymentPlan
graduate_membership_id  UUID FK → GraduateMembership

payment_attempt_id      UUID NULL FK → PaymentAttempt

source                  PaymentSource NOT NULL

provider_transaction_id VARCHAR NULL

amount                  DECIMAL NOT NULL
currency                CHAR(3) NOT NULL

status                  PaymentTransactionStatus NOT NULL

confirmed_at            TIMESTAMPTZ NOT NULL
registered_at           TIMESTAMPTZ NOT NULL

created_by_account_id   UUID NULL FK → Account

reference               VARCHAR NULL
notes                   TEXT NULL
evidence_file_id        UUID NULL FK → FileAsset

created_at              TIMESTAMPTZ NOT NULL
```

---

## Constraints

```text
CHECK(amount > 0)
```

Para transacciones de proveedor deberá existir unicidad lógica:

```text
UNIQUE(source, provider_transaction_id)
WHERE provider_transaction_id IS NOT NULL
```

En Prisma podrá requerir estrategia equivalente según capacidades del schema/migración SQL.

---

## Reglas

- electrónica: `created_by_account_id` puede ser NULL/sistema;
- manual: `created_by_account_id` debe ser ADMIN;
- confirmada = inmutable.

---

# 20. PaymentAllocation

## Campos

```text
PaymentAllocation
-----------------
id                      UUID PK
payment_transaction_id  UUID FK → PaymentTransaction
installment_id          UUID FK → Installment

amount                  DECIMAL NOT NULL

created_at              TIMESTAMPTZ NOT NULL
```

---

## Constraints

```text
CHECK(amount > 0)
```

Puede existir más de una allocation hacia una obligación.

---

## Invariantes

Dentro de transacción:

```text
SUM(allocations for transaction)
<= transaction.amount
```

---

# 21. Adjustment

## Campos

```text
Adjustment
----------
id                      UUID PK
payment_plan_id         UUID FK → PaymentPlan
graduate_membership_id  UUID FK → GraduateMembership

type                    AdjustmentType NOT NULL
amount                  DECIMAL NOT NULL
currency                CHAR(3) NOT NULL

related_installment_id  UUID NULL FK → Installment
related_transaction_id  UUID NULL FK → PaymentTransaction

reason                  TEXT NOT NULL

created_by_account_id   UUID FK → Account
created_at              TIMESTAMPTZ NOT NULL
```

---

## Constraints

```text
CHECK(amount > 0)
```

---

## Regla

No edita ni elimina el movimiento original.

---

# 22. Refund

## Campos

```text
Refund
------
id                      UUID PK
payment_plan_id         UUID FK → PaymentPlan
graduate_membership_id  UUID FK → GraduateMembership
payment_transaction_id  UUID FK → PaymentTransaction

amount                  DECIMAL NOT NULL
currency                CHAR(3) NOT NULL

provider                PaymentSource NULL
provider_refund_id      VARCHAR NULL

manual_method           VARCHAR NULL
reference               VARCHAR NULL
evidence_file_id        UUID NULL FK → FileAsset

status                  RefundStatus NOT NULL

reason                  TEXT NOT NULL

created_by_account_id   UUID FK → Account

created_at              TIMESTAMPTZ NOT NULL
confirmed_at            TIMESTAMPTZ NULL
```

---

## Constraints

```text
CHECK(amount > 0)
```

Invariante:

```text
SUM(confirmed refunds)
<= refundable amount of PaymentTransaction
```

---

# 23. PaymentProviderEvent

## 23.1 Propósito

Entidad técnica de soporte para:

- idempotencia de webhook;
- reintentos;
- trazabilidad;
- conciliación.

No es una entidad visible de negocio.

---

## Campos

```text
PaymentProviderEvent
--------------------
id                  UUID PK

provider            PaymentSource NOT NULL
external_event_id   VARCHAR NOT NULL

event_type          VARCHAR NULL
payload_hash        VARCHAR NULL

received_at         TIMESTAMPTZ NOT NULL
processed_at        TIMESTAMPTZ NULL

processing_status   VARCHAR NOT NULL
attempt_count       INTEGER NOT NULL DEFAULT 0
last_error          TEXT NULL

created_at          TIMESTAMPTZ NOT NULL
updated_at          TIMESTAMPTZ NOT NULL
```

---

## Constraint

```text
UNIQUE(provider, external_event_id)
```

---

## Nota

La política de almacenar o no el payload completo del proveedor es un TBD técnico de seguridad/retención.

No se requiere guardar información sensible innecesaria.

---

# 24. ThermoRequest

## Campos

```text
ThermoRequest
-------------
id                      UUID PK
graduate_membership_id  UUID UNIQUE FK → GraduateMembership
event_id                UUID FK → Event

status                  ThermoStatus NOT NULL

personalization         JSONB NULL

requested_at            TIMESTAMPTZ NULL
production_started_at   TIMESTAMPTZ NULL
delivered_at            TIMESTAMPTZ NULL

updated_by_account_id   UUID NULL FK → Account

created_at              TIMESTAMPTZ NOT NULL
updated_at              TIMESTAMPTZ NOT NULL
```

---

## Regla

La estructura exacta de `personalization` depende de lo que el evento permita.

No se hardcodearán atributos no aprobados.

La aplicación deberá validar el JSON contra una estructura definida/configurada.

---

# 25. Notification

## Campos

```text
Notification
------------
id                      UUID PK
account_id              UUID FK → Account
graduate_membership_id  UUID NULL FK → GraduateMembership
event_id                UUID NULL FK → Event

type                    VARCHAR NOT NULL
title                   VARCHAR NOT NULL
body                    TEXT NOT NULL

read_at                 TIMESTAMPTZ NULL
created_at              TIMESTAMPTZ NOT NULL
```

---

## Reglas

Un GRADUATE solo puede consultar notificaciones cuyo:

```text
account_id == authenticated_account.id
```

---

# 26. FileAsset

## Propósito

Referencia común para archivos del sistema.

Casos:

- fondo del croquis;
- evidencia de transferencia;
- evidencia de reembolso;
- exportaciones temporales cuando corresponda.

---

## Campos

```text
FileAsset
---------
id                  UUID PK

storage_provider    VARCHAR NOT NULL
storage_key         VARCHAR UNIQUE NOT NULL

original_name       VARCHAR NOT NULL
mime_type           VARCHAR NOT NULL
size_bytes          BIGINT NOT NULL

checksum            VARCHAR NULL

uploaded_by_account_id UUID NULL FK → Account

created_at          TIMESTAMPTZ NOT NULL
```

---

## Regla

No guardar blobs grandes directamente en las tablas transaccionales.

---

# 27. AuditLog

## 27.1 Propósito

Registro append-only de acciones administrativas críticas.

---

## Campos

```text
AuditLog
--------
id                  UUID PK

actor_account_id    UUID FK → Account
event_id            UUID NULL FK → Event

action              VARCHAR NOT NULL
entity_type         VARCHAR NOT NULL
entity_id           UUID NOT NULL

before_data         JSONB NULL
after_data          JSONB NULL

reason              TEXT NULL

created_at          TIMESTAMPTZ NOT NULL
```

---

## Reglas

No deberá existir:

```text
UPDATE AuditLog
DELETE AuditLog
```

en operaciones normales del producto.

---

## Entidades auditables mínimas

- Event;
- GraduateMembership;
- EventTable;
- TableAssignment;
- MealSelection;
- PaymentPlan;
- PaymentTransaction manual;
- Adjustment;
- Refund;
- ThermoRequest.

---

# 28. Relaciones principales

```text
Account 1 ─── N GraduateMembership
Event   1 ─── N GraduateMembership

GraduateMembership 1 ─── N GroupMember
GroupMember         1 ─── 0..1 MealSelection
Event               1 ─── N MealOption

Event       1 ─── 0..1 SeatingMap
SeatingMap  1 ─── N EventTable

GraduateMembership 1 ─── N TableAssignment
EventTable          1 ─── N TableAssignment

GraduateMembership 1 ─── 1 PaymentPlan
PaymentPlan         1 ─── N Installment
PaymentPlan         1 ─── N PaymentAttempt
PaymentPlan         1 ─── N PaymentTransaction
PaymentTransaction  1 ─── N PaymentAllocation
Installment         1 ─── N PaymentAllocation

PaymentPlan         1 ─── N Adjustment
PaymentTransaction  1 ─── N Refund

GraduateMembership 1 ─── 0..1 ThermoRequest

Account 1 ─── N Notification
Account 1 ─── N AuditLog
```

---

# 29. Invariantes inter-entidad

## DATA-INV-001 — Membresía única

```text
UNIQUE(account_id, event_id)
```

---

## DATA-INV-002 — Evento consistente

Para cualquier entidad dependiente:

```text
membership.event_id
==
resource.event_id
```

cuando aplique.

---

## DATA-INV-003 — Grupo

```text
COUNT(active GroupMember)
<= GraduateMembership.active_places
```

---

## DATA-INV-004 — Mesa

```text
SUM(TableAssignment.places_assigned by table)
<= EventTable.capacity
```

---

## DATA-INV-005 — Graduado

```text
SUM(TableAssignment.places_assigned by membership)
<= GraduateMembership.active_places
```

---

## DATA-INV-006 — MealSelection

```text
GroupMember.event
==
MealOption.event
```

---

## DATA-INV-007 — Plan financiero

```text
PaymentPlan.graduate_membership_id UNIQUE
```

---

## DATA-INV-008 — Installment

```text
UNIQUE(payment_plan_id, sequence)
```

---

## DATA-INV-009 — Transacción externa

```text
UNIQUE(source, provider_transaction_id)
```

cuando exista identificador externo.

---

## DATA-INV-010 — Refund

```text
confirmed_refunds
<= refundable_transaction_amount
```

---

## DATA-INV-011 — Termo

```text
UNIQUE(graduate_membership_id)
```

---

## DATA-INV-012 — Auditoría

Append-only.

---

# 30. Datos derivados

Las siguientes propiedades deberán calcularse mediante queries/servicios.

## Evento

```text
confirmed_places
available_event_places
graduates_count
```

---

## Mesa

```text
occupied_places
available_places
is_full
```

---

## Graduado

```text
assigned_places
unassigned_places
meal_completion
financial_progress
```

---

## Finanzas

```text
paid_total
pending_total
overdue_total
available_credit
next_installment
financial_progress
```

---

## Termo

La elegibilidad:

```text
LOCKED / AVAILABLE
```

depende del progreso financiero y umbral.

El estado podrá persistirse para workflow, pero cualquier transición automática deberá validar la condición financiera.

---

# 31. Índices recomendados

## Account

```text
UNIQUE(email_normalized)
INDEX(role, status)
```

---

## Event

```text
INDEX(status)
INDEX(event_date)
```

---

## GraduateMembership

```text
UNIQUE(account_id, event_id)
INDEX(event_id, status)
INDEX(account_id)
```

---

## GroupMember

```text
INDEX(graduate_membership_id, is_active)
```

---

## EventTable

```text
UNIQUE(event_id, label)
INDEX(event_id, status)
INDEX(seating_map_id)
```

---

## TableAssignment

```text
UNIQUE(graduate_membership_id, table_id)
INDEX(table_id)
INDEX(graduate_membership_id)
INDEX(event_id)
```

---

## PaymentPlan

```text
UNIQUE(graduate_membership_id)
INDEX(event_id, status)
```

---

## Installment

```text
UNIQUE(payment_plan_id, sequence)
INDEX(payment_plan_id, due_date)
INDEX(due_date)
```

---

## PaymentAttempt

```text
UNIQUE(idempotency_key)
INDEX(payment_plan_id, status)
INDEX(provider_preference_id)
```

---

## PaymentTransaction

```text
INDEX(payment_plan_id, confirmed_at)
INDEX(graduate_membership_id)
INDEX(source)
```

Más constraint único de transacción externa.

---

## PaymentAllocation

```text
INDEX(payment_transaction_id)
INDEX(installment_id)
```

---

## Adjustment

```text
INDEX(payment_plan_id)
INDEX(related_installment_id)
INDEX(related_transaction_id)
```

---

## Refund

```text
INDEX(payment_transaction_id)
INDEX(payment_plan_id)
INDEX(status)
```

---

## Notification

```text
INDEX(account_id, read_at, created_at)
```

---

## AuditLog

```text
INDEX(event_id, created_at)
INDEX(actor_account_id, created_at)
INDEX(entity_type, entity_id)
```

---

# 32. Estrategia de borrado

## Account

No hard-delete si tiene historia.

Usar:

```text
status = DISABLED
```

---

## Event

No hard-delete operativo después de tener membresías/finanzas.

Utilizar lifecycle:

```text
CANCELLED
FINALIZED
```

---

## GraduateMembership

No hard-delete después de actividad.

Usar:

```text
CANCELLED
COMPLETED
```

---

## GroupMember

Puede utilizar:

```text
is_active = false
```

para preservar historia cuando sea necesario.

---

## EventTable

Puede eliminarse únicamente sin asignaciones activas.

La operación debe auditarse.

---

## Finanzas

No hard-delete.

---

## AuditLog

No hard-delete operativo.

---

# 33. Estrategia de cascadas FK

Por defecto, para entidades con historia:

```text
ON DELETE RESTRICT
```

o equivalente.

No utilizar cascadas que puedan borrar accidentalmente:

- pagos;
- allocations;
- refunds;
- ajustes;
- auditoría;
- membresías históricas.

---

# 34. Concurrencia — lugares del evento

La confirmación o incremento de lugares deberá bloquear/serializar el recurso necesario para garantizar:

```text
SUM(confirmed active_places)
<= Event.capacity
```

No debe resolverse mediante un contador frontend.

---

# 35. Concurrencia — mesas

La operación deberá proteger:

- EventTable objetivo;
- EventTable anterior cuando existe cambio;
- múltiples mesas cuando existe división.

La fuente de verdad es `TableAssignment`.

---

# 36. Concurrencia — pagos

Las operaciones:

```text
PaymentTransaction
PaymentAllocation
PaymentPlan.freeze
Refund
Adjustment
```

deberán ejecutarse con transacciones y constraints adecuados para evitar duplicidad.

---

# 37. Idempotencia

## Pago electrónico

```text
PaymentProviderEvent(provider, external_event_id)
```

y:

```text
PaymentTransaction(source, provider_transaction_id)
```

protegen contra duplicados de proveedor.

---

## Operaciones administrativas

`PaymentAttempt` y los endpoints sensibles deberán utilizar:

```text
idempotency_key
```

o mecanismo equivalente.

Si se requiere persistencia de claves administrativas independiente de una entidad concreta, deberá añadirse una tabla técnica en diseño físico.

No se crea todavía una entidad adicional sin necesidad demostrada.

---

# 38. Proyecciones / vistas recomendadas

No son tablas de negocio obligatorias.

Podrán implementarse como queries, views o servicios.

## EventFinancialSummary

```text
event_id
contracted_total
paid_total
pending_total
overdue_total
```

---

## TableAvailability

```text
table_id
capacity
occupied_places
available_places
is_full
```

---

## GraduateOperationalSummary

```text
graduate_membership_id
active_places
assigned_places
meal_completion
paid_total
pending_total
overdue_total
thermo_status
```

---

## PortfolioRow

```text
graduate_membership_id
next_installment
next_due_date
pending_total
overdue_total
```

---

# 39. Reportes

Los reportes no requieren tablas duplicadas.

Deberán derivarse de:

- PaymentPlan;
- Installment;
- PaymentTransaction;
- PaymentAllocation;
- Adjustment;
- Refund;
- EventTable;
- TableAssignment;
- MealOption;
- MealSelection;
- ThermoRequest.

No crear tablas como:

```text
FinancialReport
MealReport
TableReport
```

solo para persistir totales ya derivables.

---

# 40. Auditoría vs historial de negocio

`AuditLog` registra:

```text
quién cambió qué
```

Las entidades financieras registran:

```text
qué movimiento económico ocurrió
```

No deben confundirse.

Ejemplo:

```text
PaymentTransaction = pago real
AuditLog = Mariana registró el pago
```

---

# 41. Archivos

`FileAsset` deberá relacionarse mediante FK lógica/real con:

- `SeatingMap.background_file_id`;
- `PaymentTransaction.evidence_file_id`;
- `Refund.evidence_file_id`.

No deberán utilizarse rutas arbitrarias aportadas por frontend como fuente persistida.

---

# 42. Campos que NO deben existir en el modelo objetivo

No introducir:

```text
tenant_id
organization_id
planner_id
staff_id
scanner_id
seat_id
seat_number
vip_zone
premium_package
rsvp_status
checkin_status
invitation_id
```

Estos conceptos están fuera del alcance.

---

# 43. Mapeo desde el esquema GR existente

El repositorio actual contiene entidades conceptuales:

```text
Event
Graduate
Ticket
Guest
Table
TableSelection
Payment
Thermo
```

El modelo objetivo deberá refactorizarlas.

---

## 43.1 Graduate

Actual:

```text
Graduate
- email
- password_hash
- event_id
- perfil
```

Objetivo:

```text
Account
+
GraduateMembership
```

Mapping:

```text
Graduate.email/password_hash/full_name/phone
→ Account

Graduate.event_id/career/generation/status
→ GraduateMembership
```

---

## 43.2 Ticket

Actual:

```text
Ticket
- tickets_count
- base_price
- total_amount
```

Objetivo:

```text
GraduateMembership.active_places
+
PaymentPlan
+
Installment[]
```

`Ticket` no deberá mantenerse como agregador simultáneo de lugares y finanzas.

---

## 43.3 Guest

Actual:

```text
Guest
- type
- full_name
- seat_number
- meal_type
```

Objetivo:

```text
GroupMember
+
MealSelection
```

Eliminar:

```text
seat_number
```

porque no existe asiento individual.

---

## 43.4 Table

Actual:

```text
Table
- label
- capacity
- position_x
- position_y
- status
```

Objetivo:

```text
EventTable
- label
- shape
- capacity
- normalized position
- normalized size
- AVAILABLE/BLOCKED
```

`FULL` se deriva.

---

## 43.5 TableSelection

Actual:

```text
graduate_id UNIQUE
table_id
```

Objetivo:

```text
TableAssignment
- graduate_membership_id
- table_id
- places_assigned
```

Se elimina la restricción de una sola mesa por graduado a nivel de dominio.

---

## 43.6 Payment

Actual:

```text
Payment
- amount
- type
- status
- openpay_tx_id
- month_number
```

Objetivo:

```text
PaymentPlan
Installment
PaymentAttempt
PaymentTransaction
PaymentAllocation
Adjustment
Refund
```

El modelo actual deberá considerarse insuficiente para el baseline financiero.

---

## 43.7 Thermo

Actual:

```text
Thermo
- prefix
- name
- requested/produced/delivered
```

Objetivo:

```text
ThermoRequest
- LOCKED
- AVAILABLE
- REQUESTED
- IN_PRODUCTION
- DELIVERED
- personalization
```

---

# 44. Orden recomendado de migración lógica

La migración deberá planearse antes de escribir cambios destructivos.

Orden conceptual:

```text
1. Account
2. Event / EventSettings
3. GraduateMembership
4. GroupMember
5. MealOption / MealSelection
6. SeatingMap / EventTable / TableAssignment
7. PaymentPlan / Installment
8. PaymentAttempt / PaymentTransaction / PaymentAllocation
9. Adjustment / Refund / PaymentProviderEvent
10. ThermoRequest
11. Notification
12. FileAsset
13. AuditLog
14. Migrar datos legacy
15. Validar invariantes
16. Retirar estructuras legacy
```

El plan ejecutable se definirá posteriormente en roadmap/migraciones.

---

# 45. Riesgos de migración

## DM-RISK-001

El email actual de `Graduate` es globalmente `UNIQUE`.

El modelo objetivo separa:

```text
Account.email UNIQUE
```

y permite:

```text
Account
→ múltiples GraduateMembership
```

La migración deberá deduplicar correctamente cuentas si existe un mismo correo en múltiples eventos futuros/importados.

---

## DM-RISK-002

`TableSelection.graduate_id UNIQUE` no soporta grupo dividido.

Debe migrarse a `TableAssignment`.

---

## DM-RISK-003

La ocupación actual depende indirectamente de `Ticket.tickets_count`.

Debe migrarse a `TableAssignment.places_assigned`.

---

## DM-RISK-004

`Payment` mezcla obligación y transacción.

No debe migrarse 1:1 sin clasificar datos.

Cada registro histórico deberá determinar si representa:

- obligación;
- transacción;
- ambas de forma implícita.

La estrategia concreta requerirá script de migración auditado.

---

# 46. Seeds

Los seeds de desarrollo deberán respetar el modelo y los invariantes.

Datos demo aprobados pueden incluir:

```text
Andrea Martínez
Graduación Facultad de Derecho 2027
Mesa 24
8 lugares
$12,500 MXN
5 obligaciones de $2,500
```

Pero deberán permanecer exclusivamente como:

```text
development/test seed data
```

No como defaults de producción.

---

# 47. Constraints que deben implementarse en DB

Mínimo:

```text
Account.email UNIQUE

GraduateMembership(account_id, event_id) UNIQUE

MealOption(event_id, name) UNIQUE

SeatingMap.event_id UNIQUE

EventTable(event_id, label) UNIQUE

TableAssignment(graduate_membership_id, table_id) UNIQUE

PaymentPlan.graduate_membership_id UNIQUE

Installment(payment_plan_id, sequence) UNIQUE

PaymentAttempt.idempotency_key UNIQUE

PaymentProviderEvent(provider, external_event_id) UNIQUE

ThermoRequest.graduate_membership_id UNIQUE
```

Además del unique externo de `PaymentTransaction`.

---

# 48. Invariantes que NO pueden depender solo de Prisma validation

Deben reforzarse transaccionalmente:

```text
event confirmed capacity
table occupancy
graduate assigned places
refund limit
allocation limit
first-payment plan freeze
provider transaction idempotency
```

---

# 49. Campos auditables sensibles

Cambios en:

```text
Event.capacity
Event.status
EventSettings deadlines
EventSettings thermo_threshold
GraduateMembership.active_places
GraduateMembership.status
EventTable.capacity
EventTable.status
TableAssignment
MealSelection after deadline
PaymentTransaction manual
Adjustment
Refund
ThermoRequest status
```

deberán generar auditoría conforme a reglas.

---

# 50. Datos personales

PII principal:

```text
Account.full_name
Account.email
Account.phone
GroupMember.full_name
```

Deberán limitarse por autorización.

Los endpoints GRADUATE de mesas no deberán hacer joins que expongan estos datos de terceros.

---

# 51. Datos financieros sensibles

Incluyen:

```text
PaymentPlan
Installment
PaymentTransaction
Adjustment
Refund
evidence files
```

GRADUATE solo puede consultar los asociados a sus membresías.

---

# 52. Integridad de currency

Toda entidad financiera relacionada con un plan deberá utilizar la misma moneda:

```text
entity.currency == PaymentPlan.currency
```

No existe conversión de moneda en MVP.

---

# 53. Integridad de eventos

Para cualquier operación cruzada:

```text
PaymentPlan.event_id
==
GraduateMembership.event_id

EventTable.event_id
==
TableAssignment.event_id
==
GraduateMembership.event_id

MealOption.event_id
==
GraduateMembership.event_id
```

cuando corresponda.

---

# 54. Estado del evento y persistencia

El cambio a:

```text
CLOSED
FINALIZED
CANCELLED
```

no elimina datos.

Los bloqueos de operación pertenecen a reglas de servicio/autorización, no a cascadas de borrado.

---

# 55. Uso de JSONB

Solo se autoriza en baseline donde la estructura todavía no está completamente cerrada y no constituye un eje de consultas relacionales frecuentes:

```text
EventSettings.cancellation_policy_config
ThermoRequest.personalization
AuditLog.before_data
AuditLog.after_data
```

No utilizar JSONB como sustituto general de modelado relacional.

---

# 56. Campos TBD

Los siguientes detalles permanecerán TBD hasta los documentos técnicos correspondientes:

1. longitud máxima de nombres;
2. longitud máxima de referencias bancarias;
3. schema exacto de `cancellation_policy_config`;
4. schema exacto de `ThermoRequest.personalization`;
5. política exacta de `PaymentProviderEvent.processing_status`;
6. expiración de PaymentAttempt;
7. retención de notificaciones;
8. retención de archivos;
9. retención de provider events;
10. estrategia física final de montos:
    - `Decimal(12,2)`;
    - centavos enteros.

Estos TBD no cambian el dominio.

---

# 57. Entidades fuera de alcance

No crear:

```text
Tenant
Organization
Planner
Staff
Scanner
Invitation
RSVP
CheckIn
Seat
SeatAssignment
VIPZone
Package
Invoice
CFDI
Album
PhotoSale
```

---

# 58. Trazabilidad por dominio

| Entidad | Documento origen |
|---|---|
| Account | ROLES_PERMISSIONS |
| GraduateMembership | ROLES_PERMISSIONS / BUSINESS_RULES |
| Event | PRODUCT_SCOPE / SRS |
| EventSettings | BUSINESS_RULES |
| GroupMember | PRODUCT_SCOPE / BUSINESS_RULES |
| MealOption | BUSINESS_RULES |
| MealSelection | BUSINESS_RULES / UX_FLOWS |
| SeatingMap | SEATING_MAP |
| EventTable | SEATING_MAP |
| TableAssignment | SEATING_MAP |
| PaymentPlan | FINANCIAL_DOMAIN |
| Installment | FINANCIAL_DOMAIN |
| PaymentAttempt | FINANCIAL_DOMAIN |
| PaymentTransaction | FINANCIAL_DOMAIN |
| PaymentAllocation | FINANCIAL_DOMAIN |
| Adjustment | FINANCIAL_DOMAIN |
| Refund | FINANCIAL_DOMAIN |
| PaymentProviderEvent | idempotencia/conciliación financiera |
| ThermoRequest | BUSINESS_RULES / SRS |
| Notification | BUSINESS_RULES / SRS |
| FileAsset | SEATING_MAP / FINANCIAL_DOMAIN |
| AuditLog | BUSINESS_RULES / SRS |

---

# 59. Diagrama lógico resumido

```text
┌─────────────┐
│   Account   │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼──────────────────────┐
│    GraduateMembership      │
└───┬────────┬────────┬──────┘
    │        │        │
    │        │        └──────────────┐
    │        │                       │
    │ N      │ 1                     │ 0..1
┌───▼──────┐ │                ┌──────▼──────┐
│GroupMember│ │                │ThermoRequest│
└───┬──────┘ │                └─────────────┘
    │ 0..1   │
┌───▼──────────┐
│MealSelection │
└──────────────┘

GraduateMembership
       │ 1
┌──────▼───────┐
│ PaymentPlan  │
└─┬────┬────┬──┘
  │    │    │
  │N   │N   │N
  │    │    │
┌─▼──┐ │ ┌──▼────────────────┐
│Inst│ │ │PaymentTransaction │
└─┬──┘ │ └──┬─────────────┬──┘
  │    │    │             │
  │    │    │N            │N
  │    │ ┌──▼──────────┐ ┌▼──────┐
  │    │ │ Allocation  │ │ Refund│
  │    │ └─────────────┘ └───────┘
  │    │
  │  ┌─▼────────────┐
  │  │PaymentAttempt│
  │  └──────────────┘
  │
  └───────────── Adjustment

Event
  │
  ├── EventSettings
  ├── GraduateMembership
  ├── MealOption
  └── SeatingMap
        │
        └── EventTable
              │
              └── TableAssignment
                    │
                    └── GraduateMembership
```

---

# 60. Criterios de aceptación del modelo

El esquema físico derivado deberá demostrar:

## DM-AC-001

Una cuenta GRADUATE puede pertenecer a dos eventos sin duplicar credenciales.

## DM-AC-002

No puede existir una membresía duplicada para el mismo account/event.

## DM-AC-003

No puede existir una mesa con capacidad menor o igual a cero.

## DM-AC-004

Una mesa no puede quedar sobreocupada después de una operación concurrente.

## DM-AC-005

Un graduado puede tener asignaciones en dos mesas sin exceder sus lugares.

## DM-AC-006

No puede existir una obligación duplicada con el mismo `sequence` dentro del plan.

## DM-AC-007

Un webhook duplicado no puede crear una segunda transacción confirmada.

## DM-AC-008

Un pago confirmado no se puede eliminar mediante operación normal.

## DM-AC-009

Un refund confirmado no puede exceder el monto reembolsable.

## DM-AC-010

Cambiar defaults financieros del evento no modifica el plan congelado.

## DM-AC-011

Una MealSelection no puede relacionar integrante y opción de eventos diferentes.

## DM-AC-012

Eliminar el fondo del SeatingMap no elimina EventTable ni TableAssignment.

## DM-AC-013

Un GRADUATE no puede obtener datos de otra membresía mediante IDs manipulados.

## DM-AC-014

AuditLog permanece inmutable desde APIs normales.

---

# 61. Decisiones cerradas

Queda definido como baseline:

1. `Account` separado de `GraduateMembership`.
2. una cuenta puede participar en múltiples eventos;
3. `UNIQUE(account_id, event_id)` para membresía;
4. `GroupMember` reemplaza el concepto legacy de Guest;
5. no existe asiento individual;
6. `MealOption` es por evento;
7. `MealSelection` es por integrante;
8. `SeatingMap` tiene fondo independiente;
9. `EventTable` solo `SQUARE/ROUND`;
10. `TableAssignment` almacena `places_assigned`;
11. un graduado puede tener múltiples TableAssignment;
12. ocupación de mesa es derivada;
13. `PaymentPlan` es uno por membresía;
14. `Installment` representa obligación;
15. `PaymentAttempt` representa intento;
16. `PaymentTransaction` representa cobro confirmado/manual;
17. `PaymentAllocation` aplica dinero a obligaciones;
18. `Adjustment` y `Refund` son entidades separadas;
19. `PaymentProviderEvent` protege idempotencia/conciliación;
20. `ThermoRequest` es uno por membresía;
21. `AuditLog` es append-only;
22. `FileAsset` separa archivos de tablas transaccionales;
23. reportes se derivan, no se duplican;
24. no se modela multi-tenant;
25. no se reutiliza el schema legacy como fuente de verdad.

---

# 62. Documentos siguientes

Este documento deberá utilizarse como fuente directa para:

1. `API_CONTRACTS.md`
2. `NON_FUNCTIONAL_REQUIREMENTS.md`
3. `ACCEPTANCE_CRITERIA.md`
4. `ROADMAP_IMPLEMENTATION.md`

Antes de modificar `schema.prisma`, el equipo deberá contrastar el cambio propuesto contra este baseline.

---

# 63. Baseline

Con esta versión se establece:

```text
DATA_MODEL_VERSION = 1.0
```

El modelo lógico queda congelado como baseline para diseño físico, migraciones y contratos API hasta que un Change Request aprobado modifique explícitamente el dominio.
