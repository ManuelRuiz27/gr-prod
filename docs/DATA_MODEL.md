# Plataforma GR — Modelo de Datos

**Documento:** `DATA_MODEL.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.1  
**Estado:** Baseline lógico para Prisma/PostgreSQL  
**Fecha:** 31 de agosto de 2026  
**Persistencia objetivo:** PostgreSQL + Prisma  
**Fuentes:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `UX_FLOWS.md`, `FINANCIAL_DOMAIN.md`, `SEATING_MAP.md`

---

# 1. Principios

- Single-tenant: no `Tenant`, `Organization`, `Workspace`.
- `Account` se separa de `GraduateMembership`.
- Dinero exacto mediante `Decimal/Numeric` o centavos; nunca float.
- Timestamps operativos en UTC/TIMESTAMPTZ; evento conserva timezone.
- Historia contractual, financiera y auditoría no se borra destructivamente.
- Totales, ocupación y progreso son derivados salvo cache no autoritativo.
- Published policy/accepted contract snapshots son inmutables.

---

# 2. Mapa de entidades

```text
Account
├── PasswordResetToken
├── Notification
├── AuditLog (actor)
├── InternalNote (author)
└── GraduateMembership
    ├── GraduateContract
    │   └── ContractLineItem[]
    ├── GroupMember[]
    │   ├── MealSelection
    │   └── TableAssignment
    ├── PaymentPlan
    │   ├── Installment[]
    │   ├── PaymentAttempt[]
    │   ├── PaymentSubmission[]
    │   ├── PaymentTransaction[]
    │   │   ├── PaymentAllocation[]
    │   │   └── Refund[]
    │   ├── Adjustment[]
    │   ├── PenaltyCharge[]
    │   └── CancellationQuote[]
    └── ThermoRequest
        └── ThermoDelivery optional

Event
├── EventSettings
├── EventProduct[]
├── FinancialMilestone[]
├── MealOption[]
├── CancellationPolicy[]
│   └── CancellationPolicyRange[]
├── SeatingMap
│   └── EventTable[]
├── GraduateMembership[]
├── InternalNote[]
└── FileAsset[]

PaymentProviderEvent
```

---

# 3. Enums

## AccountRole
```text
ADMIN
GRADUATE
```

## AccountStatus
```text
ACTIVE
DISABLED
```

## EventStatus
```text
DRAFT
OPEN
CLOSED
FINALIZED
CANCELLED
```

## GraduateMembershipStatus
```text
ACTIVE
CANCELLED
COMPLETED
```

## ContractStatus
```text
PENDING_ACCEPTANCE
ACCEPTED
SUPERSEDED
CANCELLED
```

## ProductKind
Baseline semántico:
```text
BASE_PACKAGE
ADULT
CHILD
NO_DINNER
EXTRA_THERMO
OTHER
```
Los nombres visibles se configuran por evento.

## TableShape
```text
SQUARE
ROUND
```

## TableStatus
```text
AVAILABLE
BLOCKED
```

## PaymentPlanStatus
```text
ACTIVE
SETTLED
CANCELLED
```

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

## PaymentSource
```text
MERCADO_PAGO
OPENPAY
CASH
TRANSFER
DEPOSIT
```

## PaymentSubmissionStatus
```text
PENDING_REVIEW
APPROVED
REJECTED
CANCELLED
```

## PaymentTransactionStatus
```text
CONFIRMED
REVERSED
```

## AdjustmentType
```text
CREDIT
DEBIT
OBLIGATION_REDUCTION
OBLIGATION_CANCELLATION
```

## PenaltyChargeStatus
```text
PENDING
APPLIED
CANCELLED
```

## CancellationPolicyStatus
```text
DRAFT
ACTIVE
ARCHIVED
```

## CancellationQuoteStatus
```text
VALID
EXPIRED
USED
CANCELLED
```

## RefundStatus
```text
REQUESTED
PENDING
CONFIRMED
FAILED
CANCELLED
```

## ThermoStatus
```text
LOCKED
AVAILABLE
REQUESTED
IN_PRODUCTION
DELIVERED
```

---

# 4. Account

```text
Account
-------
id UUID PK
email VARCHAR NOT NULL
password_hash VARCHAR NOT NULL
full_name VARCHAR NOT NULL
phone VARCHAR NULL
role AccountRole NOT NULL
status AccountStatus NOT NULL DEFAULT ACTIVE
last_login_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraint equivalente a:

```text
UNIQUE(lower(email))
```

No hard-delete si tiene historia.

---

# 5. PasswordResetToken

```text
id UUID PK
account_id FK Account
token_hash VARCHAR UNIQUE
expires_at TIMESTAMPTZ
used_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
```

Token plano nunca se persiste.

---

# 6. Event

```text
Event
-----
id UUID PK
name VARCHAR NOT NULL
event_date DATE NOT NULL
venue VARCHAR NOT NULL
school_name VARCHAR NULL
career VARCHAR NULL
generation VARCHAR NULL
capacity INTEGER NOT NULL
timezone VARCHAR NOT NULL
status EventStatus NOT NULL DEFAULT DRAFT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

```text
CHECK(capacity > 0)
```

---

# 7. EventSettings

```text
EventSettings
-------------
id UUID PK
event_id UUID UNIQUE FK Event
places_deadline TIMESTAMPTZ NULL
table_change_deadline TIMESTAMPTZ NULL
meals_deadline TIMESTAMPTZ NULL
thermo_threshold_percent INTEGER NOT NULL
financial_config_version INTEGER NOT NULL DEFAULT 1
liquidation_due_at TIMESTAMPTZ NULL
late_fee_enabled BOOLEAN NOT NULL DEFAULT FALSE
late_grace_days INTEGER NULL
late_fee_amount DECIMAL NULL
auto_cancel_enabled BOOLEAN NOT NULL DEFAULT FALSE
auto_cancel_after_late_fee_days INTEGER NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Constraints:

```text
0 <= thermo_threshold_percent <= 100
financial_config_version >= 1
late_grace_days >= 0 when not null
late_fee_amount >= 0 when not null
auto_cancel_after_late_fee_days >= 0 when not null
```

La política de cancelación **ya no se guarda como JSONB arbitrario en EventSettings**.

---

# 8. EventProduct

```text
EventProduct
------------
id UUID PK
event_id FK Event
kind ProductKind NOT NULL
code VARCHAR NOT NULL
name VARCHAR NOT NULL
unit_amount DECIMAL NOT NULL
is_active BOOLEAN NOT NULL DEFAULT TRUE
sort_order INTEGER NOT NULL DEFAULT 0
requires_nominal_member BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Constraints:

```text
UNIQUE(event_id, code)
CHECK(unit_amount >= 0)
```

---

# 9. FinancialMilestone

```text
FinancialMilestone
------------------
id UUID PK
event_id FK Event
code VARCHAR NOT NULL
required_progress_percent INTEGER NOT NULL
required_at TIMESTAMPTZ NULL
purpose_code VARCHAR NOT NULL
is_active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

```text
UNIQUE(event_id, code)
CHECK(required_progress_percent BETWEEN 0 AND 100)
```

---

# 10. GraduateMembership

```text
GraduateMembership
------------------
id UUID PK
account_id FK Account
event_id FK Event
active_places INTEGER NOT NULL
places_confirmed_at TIMESTAMPTZ NULL
status GraduateMembershipStatus NOT NULL DEFAULT ACTIVE
cancelled_at TIMESTAMPTZ NULL
cancel_reason TEXT NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

```text
UNIQUE(account_id, event_id)
CHECK(active_places >= 1)
```

---

# 11. GraduateContract

```text
GraduateContract
----------------
id UUID PK
graduate_membership_id FK GraduateMembership
folio VARCHAR UNIQUE NOT NULL
status ContractStatus NOT NULL
terms_version VARCHAR NOT NULL
terms_snapshot JSONB NOT NULL
terms_snapshot_hash VARCHAR NOT NULL
cancellation_policy_version_id FK CancellationPolicy
accepted_at TIMESTAMPTZ NULL
accepted_by_account_id FK Account NULL
accepted_ip_value_or_hash VARCHAR NULL
accepted_user_agent_hash VARCHAR NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Reglas:

- contrato aceptado no modifica `terms_snapshot` ni policy version;
- si se requiere nueva versión contractual, crear nuevo registro/supersede controlado;
- estrategia de IP/hash se define en NFR por privacidad/legalidad.

---

# 12. ContractLineItem

```text
ContractLineItem
----------------
id UUID PK
contract_id FK GraduateContract
event_product_id FK EventProduct NULL
concept_code VARCHAR NOT NULL
label VARCHAR NOT NULL
quantity INTEGER NOT NULL
unit_amount DECIMAL NOT NULL
line_total DECIMAL NOT NULL
source VARCHAR NOT NULL
is_active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMPTZ
```

Constraints:

```text
quantity > 0
unit_amount >= 0
line_total >= 0
```

Una línea histórica con impacto financiero no se borra destructivamente.

---

# 13. GroupMember

```text
GroupMember
-----------
id UUID PK
graduate_membership_id FK GraduateMembership
event_product_id FK EventProduct NULL
full_name VARCHAR NOT NULL
is_primary BOOLEAN NOT NULL DEFAULT FALSE
is_active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Máximo un `is_primary=true` por membresía mediante índice único parcial o equivalente.

```text
COUNT(active GroupMember) <= GraduateMembership.active_places
```

---

# 14. MealOption / MealSelection

```text
MealOption
----------
id UUID PK
event_id FK Event
name VARCHAR NOT NULL
is_active BOOLEAN NOT NULL DEFAULT TRUE
sort_order INTEGER NOT NULL DEFAULT 0
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

```text
UNIQUE(event_id, normalized name)
```

```text
MealSelection
-------------
id UUID PK
group_member_id UUID UNIQUE FK GroupMember
meal_option_id FK MealOption
selected_by_account_id FK Account
selected_at TIMESTAMPTZ
override_reason TEXT NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

GroupMember y MealOption deben pertenecer al mismo evento.

---

# 15. SeatingMap / EventTable

```text
SeatingMap
----------
id UUID PK
event_id UUID UNIQUE FK Event
background_file_id FK FileAsset NULL
background_original_width INTEGER NULL
background_original_height INTEGER NULL
coordinate_mode VARCHAR NOT NULL DEFAULT NORMALIZED
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

```text
EventTable
----------
id UUID PK
event_id FK Event
seating_map_id FK SeatingMap
label VARCHAR NOT NULL
shape TableShape NOT NULL
capacity INTEGER NOT NULL
position_x DECIMAL NOT NULL
position_y DECIMAL NOT NULL
width DECIMAL NOT NULL
height DECIMAL NOT NULL
status TableStatus NOT NULL DEFAULT AVAILABLE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Constraints:

```text
UNIQUE(event_id, label)
capacity > 0
coordinates/dimensions within normalized range
```

---

# 16. TableAssignment

**Cambio respecto al baseline anterior:** la asignación pertenece a `GroupMember`, no a una cantidad agregada por membresía.

```text
TableAssignment
---------------
id UUID PK
event_id FK Event
group_member_id UUID UNIQUE FK GroupMember
table_id FK EventTable
assigned_by_account_id FK Account
assigned_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Invariantes:

```text
GroupMember.event == EventTable.event
COUNT(assignments per table) <= EventTable.capacity
1 active GroupMember -> max 1 assignment
```

No existe `seat_id`.

---

# 17. PaymentPlan

```text
PaymentPlan
-----------
id UUID PK
event_id FK Event
graduate_membership_id UUID UNIQUE FK GraduateMembership
contract_id FK GraduateContract
currency CHAR(3) NOT NULL
contracted_total DECIMAL NOT NULL
financial_terms_version INTEGER NOT NULL
is_frozen BOOLEAN NOT NULL DEFAULT FALSE
frozen_at TIMESTAMPTZ NULL
grace_period_days INTEGER NOT NULL DEFAULT 0
status PaymentPlanStatus NOT NULL DEFAULT ACTIVE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

---

# 18. Installment

```text
Installment
-----------
id UUID PK
payment_plan_id FK PaymentPlan
sequence INTEGER NOT NULL
concept_code VARCHAR NOT NULL
label VARCHAR NOT NULL
original_amount DECIMAL NOT NULL
effective_amount DECIMAL NOT NULL
due_at TIMESTAMPTZ NOT NULL
grace_period_days_snapshot INTEGER NOT NULL
status VARCHAR NOT NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

```text
UNIQUE(payment_plan_id, sequence)
amounts >= 0
```

---

# 19. PaymentAttempt

```text
id UUID PK
payment_plan_id FK PaymentPlan
graduate_membership_id FK GraduateMembership
provider PaymentSource NOT NULL
provider_preference_id VARCHAR NULL
requested_amount DECIMAL NOT NULL
currency CHAR(3) NOT NULL
status PaymentAttemptStatus NOT NULL
idempotency_key VARCHAR UNIQUE NOT NULL
expires_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Provider deberá ser electrónico en este contexto.

---

# 20. PaymentSubmission

```text
PaymentSubmission
-----------------
id UUID PK
payment_plan_id FK PaymentPlan
graduate_membership_id FK GraduateMembership
method PaymentSource NOT NULL
reported_amount DECIMAL NOT NULL
reported_paid_at TIMESTAMPTZ NOT NULL
reference VARCHAR NULL
notes TEXT NULL
evidence_file_id FK FileAsset NOT NULL
status PaymentSubmissionStatus NOT NULL DEFAULT PENDING_REVIEW
reviewed_by_account_id FK Account NULL
reviewed_at TIMESTAMPTZ NULL
review_reason TEXT NULL
payment_transaction_id UUID NULL UNIQUE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Constraints:

```text
method IN (TRANSFER, DEPOSIT)
reported_amount > 0
```

`payment_transaction_id` se establece solo al aprobar.

---

# 21. PaymentTransaction

```text
PaymentTransaction
------------------
id UUID PK
payment_plan_id FK PaymentPlan
graduate_membership_id FK GraduateMembership
source PaymentSource NOT NULL
provider_transaction_id VARCHAR NULL
payment_submission_id UUID NULL UNIQUE FK PaymentSubmission
amount DECIMAL NOT NULL
currency CHAR(3) NOT NULL
status PaymentTransactionStatus NOT NULL
confirmed_at TIMESTAMPTZ NOT NULL
registered_at TIMESTAMPTZ NOT NULL
created_by_account_id FK Account NULL
reference VARCHAR NULL
notes TEXT NULL
evidence_file_id FK FileAsset NULL
created_at TIMESTAMPTZ
```

```text
CHECK(amount > 0)
UNIQUE(source, provider_transaction_id) WHERE provider_transaction_id IS NOT NULL
```

Transacción confirmada inmutable.

---

# 22. PaymentAllocation

```text
id UUID PK
payment_transaction_id FK PaymentTransaction
installment_id FK Installment
amount DECIMAL NOT NULL
created_at TIMESTAMPTZ
```

```text
CHECK(amount > 0)
SUM(allocations per transaction) <= transaction.amount
```

---

# 23. Adjustment

```text
id UUID PK
payment_plan_id FK PaymentPlan
graduate_membership_id FK GraduateMembership
type AdjustmentType
amount DECIMAL
currency CHAR(3)
related_installment_id FK Installment NULL
related_transaction_id FK PaymentTransaction NULL
reason TEXT NOT NULL
created_by_account_id FK Account
created_at TIMESTAMPTZ
```

Append-only.

---

# 24. PenaltyCharge

```text
PenaltyCharge
-------------
id UUID PK
payment_plan_id FK PaymentPlan
graduate_membership_id FK GraduateMembership
rule_code VARCHAR NOT NULL
amount DECIMAL NOT NULL
currency CHAR(3) NOT NULL
effective_at TIMESTAMPTZ NOT NULL
status PenaltyChargeStatus NOT NULL
source_idempotency_key VARCHAR UNIQUE NOT NULL
related_installment_id FK Installment NULL
created_at TIMESTAMPTZ
```

El cargo debe estar enlazado a la obligación efectiva que genere o a mecanismo equivalente del ledger.

No duplicar por reejecución del job.

---

# 25. CancellationPolicy

```text
CancellationPolicy
------------------
id UUID PK
event_id FK Event
version INTEGER NOT NULL
status CancellationPolicyStatus NOT NULL
created_by_account_id FK Account
published_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

```text
UNIQUE(event_id, version)
```

Una política `ACTIVE` no se modifica; crear siguiente versión.

---

# 26. CancellationPolicyRange

```text
CancellationPolicyRange
-----------------------
id UUID PK
cancellation_policy_id FK CancellationPolicy
days_before_min INTEGER NOT NULL
days_before_max INTEGER NULL
penalty_percent DECIMAL NOT NULL
sort_order INTEGER NOT NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Checks:

```text
days_before_min >= 0
days_before_max >= days_before_min when not null
0 <= penalty_percent <= 100
```

No traslapes/huecos se validan transaccionalmente al publicar.

---

# 27. CancellationQuote

```text
CancellationQuote
-----------------
id UUID PK
graduate_membership_id FK GraduateMembership
contract_id FK GraduateContract
policy_version_id FK CancellationPolicy
policy_range_id FK CancellationPolicyRange
quoted_at TIMESTAMPTZ
days_before_event INTEGER
contracted_total_snapshot DECIMAL
eligible_paid_snapshot DECIMAL
penalty_percent DECIMAL
penalty_amount DECIMAL
non_refundable_minimum DECIMAL
retained_amount DECIMAL
refund_due DECIMAL
remaining_due DECIMAL
status CancellationQuoteStatus
expires_at TIMESTAMPTZ NULL
used_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
```

El quote usado para cancelar debe quedar preservado.

---

# 28. Refund

```text
Refund
------
id UUID PK
payment_plan_id FK PaymentPlan
graduate_membership_id FK GraduateMembership
payment_transaction_id FK PaymentTransaction NULL
cancellation_quote_id FK CancellationQuote NULL
amount DECIMAL NOT NULL
currency CHAR(3) NOT NULL
provider PaymentSource NULL
provider_refund_id VARCHAR NULL
manual_method VARCHAR NULL
reference VARCHAR NULL
evidence_file_id FK FileAsset NULL
status RefundStatus NOT NULL
reason TEXT NOT NULL
created_by_account_id FK Account
created_at TIMESTAMPTZ
confirmed_at TIMESTAMPTZ NULL
```

```text
confirmed refunds <= refundable amount
```

---

# 29. ThermoRequest / ThermoDelivery

```text
ThermoRequest
-------------
id UUID PK
graduate_membership_id UUID UNIQUE FK GraduateMembership
event_id FK Event
status ThermoStatus
personalization JSONB NULL
requested_at TIMESTAMPTZ NULL
production_started_at TIMESTAMPTZ NULL
delivered_at TIMESTAMPTZ NULL
updated_by_account_id FK Account NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Campos de personalization se validan contra configuración, no JSON arbitrario.

Opcional para evidencia de entrega:

```text
ThermoDelivery
--------------
id UUID PK
thermo_request_id UUID UNIQUE FK ThermoRequest
received_by_name VARCHAR NULL
signature_file_id FK FileAsset NULL
evidence_file_id FK FileAsset NULL
delivered_by_account_id FK Account
delivered_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

---

# 30. Notification

```text
id UUID PK
account_id FK Account
graduate_membership_id FK GraduateMembership NULL
event_id FK Event NULL
type VARCHAR
title VARCHAR
body TEXT
read_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
```

---

# 31. InternalNote

```text
InternalNote
------------
id UUID PK
event_id FK Event
graduate_membership_id FK GraduateMembership NULL
author_account_id FK Account
body TEXT NOT NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Solo ADMIN. Si se permite edición, AuditLog debe preservar before/after. No exponer a GRADUATE.

---

# 32. FileAsset

```text
id UUID PK
storage_provider VARCHAR
storage_key VARCHAR UNIQUE
original_name VARCHAR
mime_type VARCHAR
size_bytes BIGINT
checksum VARCHAR NULL
uploaded_by_account_id FK Account NULL
created_at TIMESTAMPTZ
```

Usos:

- fondo croquis;
- comprobante GRADUATE;
- evidencia pago/reembolso;
- firma/evidencia termo;
- exports temporales.

No guardar blobs grandes en tablas transaccionales.

---

# 33. PaymentProviderEvent

```text
id UUID PK
provider PaymentSource
external_event_id VARCHAR
event_type VARCHAR NULL
payload_hash VARCHAR NULL
received_at TIMESTAMPTZ
processed_at TIMESTAMPTZ NULL
processing_status VARCHAR
attempt_count INTEGER DEFAULT 0
last_error TEXT NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

```text
UNIQUE(provider, external_event_id)
```

---

# 34. AuditLog

```text
id UUID PK
actor_account_id FK Account NULL
actor_type VARCHAR NOT NULL DEFAULT ACCOUNT
event_id FK Event NULL
action VARCHAR NOT NULL
entity_type VARCHAR NOT NULL
entity_id UUID NOT NULL
before_data JSONB NULL
after_data JSONB NULL
reason TEXT NULL
request_id VARCHAR NULL
created_at TIMESTAMPTZ
```

Para procesos automáticos, `actor_type=SYSTEM` o estrategia equivalente inequívoca.

Append-only.

---

# 35. Invariantes inter-entidad

```text
UNIQUE(Account.email normalized)
UNIQUE(Account,event) on GraduateMembership
UNIQUE(GraduateContract.folio)
COUNT(active GroupMember) <= active_places
confirmed_places <= Event.capacity
GroupMember.event == MealOption.event
GroupMember.event == EventTable.event
UNIQUE active TableAssignment per GroupMember
COUNT(TableAssignment per table) <= EventTable.capacity
UNIQUE active PaymentPlan per membership
UNIQUE(payment_plan_id, installment.sequence)
UNIQUE external provider transaction
UNIQUE confirmed transaction per PaymentSubmission
published CancellationPolicy immutable
accepted contract policy reference immutable
refunds <= refundable amount
AuditLog append-only
```

---

# 36. Índices mínimos recomendados

```text
Event(status, event_date)
GraduateMembership(event_id, status)
GraduateContract(folio)
GroupMember(graduate_membership_id, is_active)
EventTable(event_id, status)
TableAssignment(table_id)
PaymentPlan(event_id, status)
Installment(payment_plan_id, due_at)
PaymentSubmission(status, created_at)
PaymentSubmission(event/membership via joins/indexes)
PaymentTransaction(payment_plan_id, confirmed_at)
PaymentAllocation(installment_id)
PenaltyCharge(payment_plan_id, effective_at)
CancellationPolicy(event_id, status, version)
CancellationPolicyRange(cancellation_policy_id, sort_order)
CancellationQuote(graduate_membership_id, quoted_at)
Refund(payment_plan_id, status)
InternalNote(event_id, graduate_membership_id, created_at)
AuditLog(event_id, created_at)
AuditLog(entity_type, entity_id)
Notification(account_id, read_at, created_at)
```

---

# 37. Borrado y FK

Por defecto, recursos históricos usan `ON DELETE RESTRICT` o equivalente.

No hard-delete operativo de:

- contratos aceptados;
- line items con historia financiera;
- planes congelados;
- installments con historia;
- transacciones/allocations;
- submissions revisados;
- penalties;
- políticas publicadas;
- quotes usados;
- adjustments/refunds;
- auditoría.

Usar estados/soft lifecycle.

---

# 38. Concurrencia

Operaciones que requieren transacción/lock/constraint:

- confirmar/aumentar lugares;
- asignar/reasignar GroupMember a mesa;
- confirmar pago y allocations;
- aprobar PaymentSubmission;
- congelar PaymentPlan;
- aplicar PenaltyCharge;
- confirmar cancelación usando quote;
- crear refunds concurrentes.

La DB deberá reforzar invariantes donde sea posible y los servicios deberán cubrir invariantes agregados que no puedan expresarse con un constraint simple.
