# Plataforma GR — Modelo de Datos

**Documento:** `DATA_MODEL.md`  
**Proyecto:** Plataforma GR  
**Versión:** 2.0  
**Estado:** BASELINE DE DATOS NORMATIVO — listo para derivar `schema.prisma`, migraciones y repositories  
**Fecha:** 7 de septiembre de 2026  
**Persistencia objetivo:** PostgreSQL administrado en Supabase + Prisma  
**Baseline de código inspeccionado:** `e8905f9dfddfdfba7f8f9e799ce60bc52abf1ded`  
**Fuentes:** `SYSTEM_ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `FINANCIAL_DOMAIN.md`, `SEATING_MAP.md`, `SEATING_AUTOMATION_CONTRACT.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `ACCEPTANCE_CRITERIA.md`

---

## 1. Propósito

Este documento convierte el modelo de dominio aprobado en un modelo relacional implementable en PostgreSQL/Prisma.

Debe permitir que un agente implemente persistencia sin inventar:

- tablas;
- relaciones;
- cardinalidades;
- tipos;
- índices;
- claves únicas;
- restricciones;
- reglas de borrado;
- estados persistidos vs derivados;
- locks requeridos;
- estrategia de migración desde el schema legacy;
- límites de uso de JSONB;
- decisiones de seguridad específicas de Supabase/PostgreSQL.

Cadena esperada:

```text
DOMAIN_MODEL
→ DATA_MODEL
→ Prisma schema
→ SQL migrations
→ repositories
→ integration/concurrency tests
```

Este documento no autoriza endpoints. Los endpoints se cerrarán en `API_ENDPOINT_MATRIX.md` y OpenAPI.

---

## 2. Decisión de migración: schema objetivo nuevo

El `backend/prisma/schema.prisma` vigente es legacy y **no** debe convertirse al modelo final mediante cambios incrementales improvisados.

Problemas del schema legacy:

```text
Graduate mezcla Account + Membership
Payment mezcla intento/obligación/transacción
Table persiste full como status
Table usa Float para geometría
TableSelection pertenece a Graduate, no GroupMember
Guest conserva seat_number
meal_type está hardcodeado
Thermo está embebido al modelo anterior
OpenPay aparece como único identificador de pago
no existe contrato/folio/ledger/audit/submission/refund/policy
```

Estrategia:

```text
legacy tables
→ nuevas tablas objetivo en paralelo
→ backfill validado cuando exista información real
→ adapters/repositories nuevos
→ corte de lectura/escritura legacy
→ eliminación posterior solo con verificación
```

No usar `prisma db push` como mecanismo de migración productiva.

---

## 3. Schema PostgreSQL

Objetivo recomendado:

```text
app
```

Las tablas de Plataforma GR deberán residir en un schema privado de aplicación, preferentemente `app`, no como API de datos pública.

Principio:

```text
Frontend -> NestJS -> Prisma -> PostgreSQL app.*
```

No:

```text
Frontend -> Supabase Data API -> app.*
```

Si por despliegue se usa un schema expuesto, RLS pasa a ser obligatorio como defensa adicional. El diseño base asume que el schema de dominio no está expuesto a `anon`/`authenticated`.

---

## 4. Convenciones físicas

### 4.1 Naming

PostgreSQL:

```text
snake_case
plural o singular consistente; baseline recomendado: singular mapeado desde Prisma
```

Prisma:

```text
PascalCase model
camelCase field interno opcional
@@map / @map para nombres SQL
```

### 4.2 Identificadores

```text
UUID
```

Prisma:

```text
String @id @default(uuid()) @db.Uuid
```

### 4.3 Timestamps

```text
TIMESTAMPTZ(3)
```

Persistencia UTC.

Fecha civil del evento:

```text
DATE
```

### 4.4 Dinero

```text
NUMERIC(18,2)
```

Nunca `FLOAT/DOUBLE`.

### 4.5 Porcentajes

```text
NUMERIC(5,2)
```

Rango `0..100`.

### 4.6 Geometría normalizada

```text
NUMERIC(9,8)
```

Rango `0..1`.

### 4.7 Hashes

Usar `VARCHAR(255)` o tamaño explícito compatible con algoritmo elegido.

Nunca persistir token/secret plano cuando el contrato exige hash.

### 4.8 JSONB permitido

JSONB queda limitado a:

- snapshots contractuales inmutables;
- audit before/after;
- respuesta idempotente sanitizada;
- payload mínimo de outbox;
- metadata operativa de reconciliación;
- filtros snapshot de export;
- metadata no relacional explícitamente aprobada.

No usar JSONB para sustituir:

- productos;
- parcialidades;
- platillos;
- mesas;
- asignaciones;
- políticas de cancelación;
- campos configurables de termo.

---

## 5. Principios de integridad

```text
DB constraint cuando sea posible
+ domain validation
+ transaction/lock para invariantes agregadas
```

No toda invariante puede expresarse con `CHECK`.

Ejemplos:

```text
email único                    -> UNIQUE
1 mesa por persona             -> UNIQUE
ocupación <= capacidad         -> transaction + lock
confirmed_places <= capacity   -> transaction + lock Event
refund total <= refundable     -> transaction + lock
allocation sum <= transaction  -> transaction + lock
```

---

## 6. Modelo relacional global

```text
Account
├── AuthSession[]
├── PasswordResetToken[]
├── Notification[]
├── AuditLog[] as actor
└── GraduateMembership[]

Event
├── EventSettings
├── EventAccessCode[]
├── EventFinancialConfiguration[]
│   └── InstallmentTemplate[]
├── FinancialMilestone[]
├── ThermoConfiguration[]
│   └── ThermoPersonalizationField[]
│       └── ThermoPersonalizationOption[]
├── EventProduct[]
├── CancellationPolicy[]
│   └── CancellationPolicyRange[]
├── MealOption[]
├── SeatingMap
│   └── EventTable[]
├── GraduateMembership[]
├── FileAsset[] by relations
├── ReconciliationCase[]
└── AuditLog[]

GraduateMembership
├── GroupMember[]
├── GraduateContract[]
│   └── ContractLineItem[]
├── ContractLineItemQuote[]
├── PaymentPlan
│   ├── Installment[]
│   ├── PaymentAttempt[]
│   ├── PaymentSubmission[]
│   ├── PaymentTransaction[]
│   │   └── PaymentAllocation[]
│   │       └── PaymentAllocationReversal[]
│   ├── Adjustment[]
│   ├── PenaltyCharge[]
│   ├── CancellationQuote[]
│   └── Refund[]
│       └── RefundSource[]
├── ThermoRequest
│   ├── ThermoPersonalizationValue[]
│   └── ThermoDelivery
└── InternalNote[]

GroupMember
├── TableAssignment?
└── MealSelection?

PaymentProviderEvent
IdempotencyRecord
OutboxEvent
ExportJob
```

`PaymentAllocationReversal`, `RefundSource` y `OutboxEvent` son detalles físicos necesarios para conservar historia y consistencia; no crean nuevos productos ni flujos de negocio.

---

## 7. Enums persistidos

### AccountRole

```text
ADMIN
GRADUATE
```

### AccountStatus

```text
ACTIVE
DISABLED
```

### EventStatus

```text
DRAFT
OPEN
CLOSED
FINALIZED
CANCELLED
```

### EventAccessCodeStatus

```text
ACTIVE
REVOKED
```

### ConfigurationStatus

Usado por configuraciones versionadas:

```text
DRAFT
ACTIVE
ARCHIVED
```

### GraduateMembershipStatus

```text
ACTIVE
CANCELLED
COMPLETED
```

### ContractStatus

```text
PENDING_ACCEPTANCE
ACCEPTED
SUPERSEDED
CANCELLED
```

### ProductKind

```text
BASE_PACKAGE
ADULT
CHILD
NO_DINNER
EXTRA_THERMO
OTHER
```

### ContractLineItemQuoteStatus

```text
VALID
USED
EXPIRED
CANCELLED
```

### TableShape

```text
SQUARE
ROUND
```

`SQUARE` sigue siendo el primitive rectangular aprobado.

### TableStatus

```text
AVAILABLE
BLOCKED
```

No persistir:

```text
FULL
PARTIAL
SELECTED
HOVER
FOCUSED
```

### PaymentPlanStatus

```text
ACTIVE
SETTLED
CANCELLED
```

### InstallmentLifecycleStatus

Solo hechos persistidos:

```text
ACTIVE
CANCELLED
```

Los estados visibles `FUTURE/UPCOMING/DUE/OVERDUE/PAID` son derivados.

### PaymentProvider

```text
MERCADO_PAGO
OPENPAY
```

### PaymentSource

```text
MERCADO_PAGO
OPENPAY
CASH
TRANSFER
DEPOSIT
```

### PaymentAttemptStatus

```text
CREATED
REDIRECTED
PENDING
CONFIRMED
FAILED
EXPIRED
CANCELLED
```

### PaymentSubmissionStatus

```text
PENDING_REVIEW
APPROVED
REJECTED
CANCELLED
```

### PaymentTransactionStatus

```text
CONFIRMED
REVERSED
```

### AdjustmentType

```text
CREDIT
DEBIT
OBLIGATION_REDUCTION
OBLIGATION_CANCELLATION
```

### PenaltyChargeStatus

```text
PENDING
APPLIED
CANCELLED
```

### CancellationPolicyStatus

```text
DRAFT
ACTIVE
ARCHIVED
```

### CancellationQuoteStatus

```text
VALID
EXPIRED
USED
CANCELLED
```

### RefundStatus

```text
REQUESTED
PENDING
CONFIRMED
FAILED
CANCELLED
```

### ProviderEventProcessingStatus

```text
RECEIVED
VERIFIED
PROCESSED
IGNORED
FAILED
```

### ReconciliationCaseStatus

```text
OPEN
RESOLVED
DISMISSED
```

### ReconciliationCaseType

```text
PAYMENT_CONFIRMED_CAPACITY_CONFLICT
PROVIDER_CONFIRMED_INTERNAL_TRANSACTION_MISSING
PAYMENT_AMOUNT_MISMATCH
SUBMISSION_APPROVED_TRANSACTION_MISSING
REFUND_PROVIDER_MISMATCH
OTHER
```

### ThermoOperationalStatus

Persistido solo después de solicitar:

```text
REQUESTED
IN_PRODUCTION
DELIVERED
```

`LOCKED/AVAILABLE` se derivan cuando aún no existe solicitud.

### ThermoPersonalizationFieldType

```text
TEXT
CHOICE
```

### FileAssetStatus

```text
PENDING_VALIDATION
AVAILABLE
QUARANTINED
ARCHIVED
```

### FilePurpose

```text
PAYMENT_EVIDENCE
SEATING_BACKGROUND
THERMO_SIGNATURE
THERMO_EVIDENCE
REFUND_EVIDENCE
EXPORT
OTHER_INTERNAL
```

### IdempotencyState

```text
PROCESSING
COMPLETED
```

### OutboxStatus

```text
PENDING
PROCESSING
PUBLISHED
FAILED
```

### ExportJobStatus

```text
PENDING
RUNNING
COMPLETED
FAILED
```

### ExportFormat

```text
XLSX
CSV
PDF
```

### AuditActorType

```text
ACCOUNT
SYSTEM
```

---

# 8. Account

```text
Account
-------
id UUID PK
email VARCHAR(320) NOT NULL
email_normalized VARCHAR(320) NOT NULL
password_hash VARCHAR(255) NOT NULL
full_name VARCHAR(200) NOT NULL
phone_e164 VARCHAR(32) NULL
role AccountRole NOT NULL
status AccountStatus NOT NULL DEFAULT ACTIVE
last_login_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(email_normalized)
CHECK(length(email_normalized) > 3)
```

`email_normalized` se calcula server-side mediante política única y no se acepta como valor independiente del frontend.

Borrado:

```text
RESTRICT / no hard-delete ordinario
```

Índices:

```text
UNIQUE(email_normalized)
(status)
```

---

# 9. AuthSession

```text
AuthSession
-----------
id UUID PK
account_id UUID NOT NULL FK Account
refresh_token_hash VARCHAR(255) NOT NULL
rotation_counter INTEGER NOT NULL DEFAULT 0
expires_at TIMESTAMPTZ NOT NULL
last_used_at TIMESTAMPTZ NULL
revoked_at TIMESTAMPTZ NULL
revoke_reason VARCHAR(200) NULL
user_agent_hash VARCHAR(255) NULL
ip_value_or_hash VARCHAR(255) NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(refresh_token_hash)
CHECK(rotation_counter >= 0)
```

Invariantes de aplicación:

- una rotación bloquea la fila;
- hash anterior deja de ser válido;
- `revoked_at != null` impide refresh;
- `expires_at <= now` impide refresh;
- deshabilitar Account revoca sesiones activas.

Índice:

```text
(account_id, revoked_at, expires_at)
```

No persistir refresh token plano.

---

# 10. PasswordResetToken

```text
PasswordResetToken
------------------
id UUID PK
account_id UUID NOT NULL FK Account
token_hash VARCHAR(255) NOT NULL
expires_at TIMESTAMPTZ NOT NULL
used_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(token_hash)
```

Índice:

```text
(account_id, expires_at)
```

No persistir token plano.

---

# 11. Event

```text
Event
-----
id UUID PK
name VARCHAR(200) NOT NULL
event_date DATE NOT NULL
venue VARCHAR(250) NOT NULL
school_name VARCHAR(250) NULL
career VARCHAR(250) NULL
generation VARCHAR(120) NULL
capacity INTEGER NOT NULL
timezone VARCHAR(100) NOT NULL
status EventStatus NOT NULL DEFAULT DRAFT
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
CHECK(capacity > 0)
```

Índices:

```text
(status, event_date)
(event_date)
```

Cambiar `capacity` requiere lock de Event y validación contra confirmed places derivado.

---

# 12. EventSettings

```text
EventSettings
-------------
id UUID PK
event_id UUID NOT NULL UNIQUE FK Event
places_deadline TIMESTAMPTZ NULL
table_change_deadline TIMESTAMPTZ NULL
meals_deadline TIMESTAMPTZ NULL
liquidation_due_at TIMESTAMPTZ NULL
late_fee_enabled BOOLEAN NOT NULL DEFAULT FALSE
late_grace_days INTEGER NULL
late_fee_amount NUMERIC(18,2) NULL
auto_cancel_enabled BOOLEAN NOT NULL DEFAULT FALSE
auto_cancel_after_late_fee_days INTEGER NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
CHECK(late_grace_days IS NULL OR late_grace_days >= 0)
CHECK(late_fee_amount IS NULL OR late_fee_amount >= 0)
CHECK(auto_cancel_after_late_fee_days IS NULL OR auto_cancel_after_late_fee_days >= 0)
CHECK(late_fee_enabled = FALSE OR (late_grace_days IS NOT NULL AND late_fee_amount IS NOT NULL))
```

La configuración financiera y del termo ya no se guarda como enteros/JSON sueltos en esta tabla; se versiona en tablas propias.

---

# 13. EventAccessCode

```text
EventAccessCode
---------------
id UUID PK
event_id UUID NOT NULL FK Event
code_hash VARCHAR(255) NOT NULL
status EventAccessCodeStatus NOT NULL DEFAULT ACTIVE
expires_at TIMESTAMPTZ NULL
rotated_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(code_hash)
```

Índice parcial requerido:

```text
UNIQUE(event_id) WHERE status = 'ACTIVE'
```

Rotar:

```text
lock active code
→ REVOKED
→ insert new ACTIVE
```

El código plano nunca se persiste.

---

# 14. EventFinancialConfiguration

```text
EventFinancialConfiguration
---------------------------
id UUID PK
event_id UUID NOT NULL FK Event
version INTEGER NOT NULL
status ConfigurationStatus NOT NULL DEFAULT DRAFT
currency CHAR(3) NOT NULL DEFAULT 'MXN'
initial_payment_required BOOLEAN NOT NULL DEFAULT FALSE
initial_payment_amount NUMERIC(18,2) NOT NULL DEFAULT 0
initial_payment_label VARCHAR(150) NULL
default_grace_period_days INTEGER NOT NULL DEFAULT 0
created_by_account_id UUID NOT NULL FK Account
published_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(event_id, version)
UNIQUE(id, event_id)
CHECK(version >= 1)
CHECK(initial_payment_amount >= 0)
CHECK(default_grace_period_days >= 0)
CHECK(initial_payment_required = FALSE OR initial_payment_amount > 0)
CHECK(currency = upper(currency))
```

Índice parcial:

```text
UNIQUE(event_id) WHERE status = 'ACTIVE'
```

Una versión `ACTIVE` usada por planes es inmutable en términos económicos. Cambios crean una nueva versión DRAFT y luego ACTIVE.

---

# 15. InstallmentTemplate

```text
InstallmentTemplate
-------------------
id UUID PK
event_financial_configuration_id UUID NOT NULL FK EventFinancialConfiguration
sequence INTEGER NOT NULL
concept_code VARCHAR(100) NOT NULL
label VARCHAR(180) NOT NULL
amount NUMERIC(18,2) NOT NULL
due_at TIMESTAMPTZ NOT NULL
grace_period_days INTEGER NOT NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(event_financial_configuration_id, sequence)
CHECK(sequence >= 1)
CHECK(amount >= 0)
CHECK(grace_period_days >= 0)
```

Los templates representan parcialidades programadas posteriores al pago inicial. Si el pago inicial es obligatorio, `PaymentPlanFactory` crea esa obligación primero y después asigna secuencia final a las parcialidades sin reutilizar el sequence técnico del template como regla comercial visible.

La suma/compatibilidad con el contrato se valida al crear `PaymentPlan`; no se asume que un template global define por sí solo el total de todos los contratos.

---

# 16. FinancialMilestone

Los milestones son configuración operativa del evento y permanecen como aggregate independiente, conforme a `DOMAIN_MODEL.md`.

```text
FinancialMilestone
------------------
id UUID PK
event_id UUID NOT NULL FK Event
code VARCHAR(100) NOT NULL
required_progress_percent NUMERIC(5,2) NOT NULL
required_at TIMESTAMPTZ NULL
purpose_code VARCHAR(100) NOT NULL
is_active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(event_id, code)
CHECK(required_progress_percent BETWEEN 0 AND 100)
```

Índice:

```text
(event_id, is_active, required_at)
```

No hardcodear 50/75/etc. Un quote/catch-up debe snapshotear el porcentaje aplicado para ser verificable.

---

# 17. ThermoConfiguration

Configuración versionada del termo.

```text
ThermoConfiguration
-------------------
id UUID PK
event_id UUID NOT NULL FK Event
version INTEGER NOT NULL
status ConfigurationStatus NOT NULL DEFAULT DRAFT
unlock_percent NUMERIC(5,2) NOT NULL
delivery_requires_received_by_name BOOLEAN NOT NULL DEFAULT FALSE
delivery_requires_signature BOOLEAN NOT NULL DEFAULT FALSE
delivery_requires_evidence BOOLEAN NOT NULL DEFAULT FALSE
created_by_account_id UUID NOT NULL FK Account
published_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(event_id, version)
UNIQUE(id, event_id)
CHECK(version >= 1)
CHECK(unlock_percent BETWEEN 0 AND 100)
```

Índice parcial:

```text
UNIQUE(event_id) WHERE status = 'ACTIVE'
```

Una configuración activa referenciada por solicitudes no se edita destructivamente.

---

# 18. ThermoPersonalizationField

```text
ThermoPersonalizationField
--------------------------
id UUID PK
thermo_configuration_id UUID NOT NULL FK ThermoConfiguration
field_key VARCHAR(80) NOT NULL
label VARCHAR(150) NOT NULL
field_type ThermoPersonalizationFieldType NOT NULL
is_required BOOLEAN NOT NULL DEFAULT FALSE
max_length INTEGER NULL
sort_order INTEGER NOT NULL DEFAULT 0
is_active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(thermo_configuration_id, field_key)
UNIQUE(id, thermo_configuration_id)
CHECK(max_length IS NULL OR max_length > 0)
```

No es constructor de formularios general.

---

# 19. ThermoPersonalizationOption

```text
ThermoPersonalizationOption
---------------------------
id UUID PK
field_id UUID NOT NULL FK ThermoPersonalizationField
value VARCHAR(120) NOT NULL
label VARCHAR(150) NOT NULL
sort_order INTEGER NOT NULL DEFAULT 0
is_active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(field_id, value)
```

Solo válido para fields `CHOICE`; la aplicación valida el tipo del padre.

---

# 20. EventProduct

```text
EventProduct
------------
id UUID PK
event_id UUID NOT NULL FK Event
kind ProductKind NOT NULL
code VARCHAR(100) NOT NULL
code_normalized VARCHAR(100) NOT NULL
name VARCHAR(180) NOT NULL
unit_amount NUMERIC(18,2) NOT NULL
is_active BOOLEAN NOT NULL DEFAULT TRUE
sort_order INTEGER NOT NULL DEFAULT 0
requires_nominal_member BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(event_id, code_normalized)
UNIQUE(id, event_id)
CHECK(unit_amount >= 0)
```

Un producto utilizado se desactiva; no se hard-delete.

---

# 21. GraduateMembership

```text
GraduateMembership
------------------
id UUID PK
account_id UUID NOT NULL FK Account
event_id UUID NOT NULL FK Event
active_places INTEGER NOT NULL
places_confirmed_at TIMESTAMPTZ NULL
status GraduateMembershipStatus NOT NULL DEFAULT ACTIVE
cancelled_at TIMESTAMPTZ NULL
cancel_reason TEXT NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(account_id, event_id)
UNIQUE(id, event_id)
CHECK(active_places >= 1)
CHECK(status <> 'CANCELLED' OR cancelled_at IS NOT NULL)
```

Índices:

```text
(event_id, status)
(event_id, places_confirmed_at) WHERE status = 'ACTIVE'
(account_id, status)
```

Invariantes agregadas:

```text
active GroupMember count <= active_places
confirmed_places(event) <= Event.capacity
```

Ambas requieren lock/transacción.

---

# 22. GroupMember

`event_id` se repite intencionalmente para reforzar aislamiento y FKs compuestas; nunca es una segunda fuente libre.

```text
GroupMember
-----------
id UUID PK
graduate_membership_id UUID NOT NULL
event_id UUID NOT NULL
event_product_id UUID NULL
full_name VARCHAR(200) NOT NULL
is_primary BOOLEAN NOT NULL DEFAULT FALSE
is_active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

FKs:

```text
(graduate_membership_id, event_id)
  -> GraduateMembership(id, event_id)

(event_product_id, event_id)
  -> EventProduct(id, event_id)
  cuando event_product_id no sea null
```

Constraints/índices:

```text
UNIQUE(id, event_id)
UNIQUE(graduate_membership_id) WHERE is_primary = TRUE AND is_active = TRUE
INDEX(graduate_membership_id, is_active)
INDEX(event_id, is_active)
INDEX(event_product_id, is_active)
```

La DB garantiza máximo un primary activo; la existencia de al menos uno para membership activa se valida en dominio/transacción.

No existe:

```text
seat_number
seat_id
chair_id
```

---

# 23. GraduateContract

```text
GraduateContract
----------------
id UUID PK
graduate_membership_id UUID NOT NULL
event_id UUID NOT NULL
folio VARCHAR(100) NOT NULL
status ContractStatus NOT NULL DEFAULT PENDING_ACCEPTANCE
terms_version VARCHAR(100) NOT NULL
terms_snapshot JSONB NOT NULL
terms_snapshot_hash VARCHAR(255) NOT NULL
cancellation_policy_version_id UUID NOT NULL
accepted_at TIMESTAMPTZ NULL
accepted_by_account_id UUID NULL FK Account
accepted_ip_value_or_hash VARCHAR(255) NULL
accepted_user_agent_hash VARCHAR(255) NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

FKs compuestas:

```text
(graduate_membership_id, event_id)
  -> GraduateMembership(id, event_id)

(cancellation_policy_version_id, event_id)
  -> CancellationPolicy(id, event_id)
```

Constraints:

```text
UNIQUE(folio)
UNIQUE(id, event_id)
```

Índice parcial:

```text
UNIQUE(graduate_membership_id)
WHERE status IN ('PENDING_ACCEPTANCE','ACCEPTED')
```

Inmutabilidad P0:

cuando `status=ACCEPTED` no deben cambiar:

```text
folio
terms_version
terms_snapshot
terms_snapshot_hash
cancellation_policy_version_id
accepted_at
accepted_by_account_id
```

El trigger/guard SQL de inmutabilidad debe implementarse en migración o equivalente probado.

---

# 24. ContractLineItem

```text
ContractLineItem
----------------
id UUID PK
contract_id UUID NOT NULL
event_id UUID NOT NULL
event_product_id UUID NULL
concept_code VARCHAR(100) NOT NULL
label VARCHAR(180) NOT NULL
quantity INTEGER NOT NULL
unit_amount NUMERIC(18,2) NOT NULL
line_total NUMERIC(18,2) NOT NULL
source_code VARCHAR(100) NOT NULL
is_active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMPTZ NOT NULL
```

FKs:

```text
(contract_id, event_id) -> GraduateContract(id, event_id)
(event_product_id, event_id) -> EventProduct(id, event_id)
```

Constraints:

```text
CHECK(quantity > 0)
CHECK(unit_amount >= 0)
CHECK(line_total >= 0)
```

Aplicación debe validar exactamente:

```text
line_total == quantity * unit_amount
```

No recalcular precio histórico desde EventProduct.

Una reducción post-freeze no reescribe dinero histórico; usa `Adjustment`/obligaciones y estado operativo correspondiente.

---

# 25. ContractLineItemQuote

```text
ContractLineItemQuote
---------------------
id UUID PK
event_id UUID NOT NULL
graduate_membership_id UUID NOT NULL
contract_id UUID NOT NULL
event_product_id UUID NOT NULL
quantity INTEGER NOT NULL
product_unit_amount_snapshot NUMERIC(18,2) NOT NULL
line_total_snapshot NUMERIC(18,2) NOT NULL
previous_contracted_total_snapshot NUMERIC(18,2) NOT NULL
new_contracted_total_snapshot NUMERIC(18,2) NOT NULL
required_progress_percent NUMERIC(5,2) NOT NULL
eligible_paid_snapshot NUMERIC(18,2) NOT NULL
catch_up_due NUMERIC(18,2) NOT NULL
basis_hash VARCHAR(255) NOT NULL
status ContractLineItemQuoteStatus NOT NULL DEFAULT VALID
quoted_at TIMESTAMPTZ NOT NULL
expires_at TIMESTAMPTZ NOT NULL
used_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ NOT NULL
```

FKs:

```text
(graduate_membership_id, event_id) -> GraduateMembership(id, event_id)
(contract_id, event_id) -> GraduateContract(id, event_id)
(event_product_id, event_id) -> EventProduct(id, event_id)
```

Constraints:

```text
CHECK(quantity > 0)
CHECK(product_unit_amount_snapshot >= 0)
CHECK(line_total_snapshot >= 0)
CHECK(previous_contracted_total_snapshot >= 0)
CHECK(new_contracted_total_snapshot >= 0)
CHECK(eligible_paid_snapshot >= 0)
CHECK(catch_up_due >= 0)
CHECK(required_progress_percent BETWEEN 0 AND 100)
CHECK(expires_at > quoted_at)
```

Índices:

```text
(graduate_membership_id, status, expires_at)
(contract_id, status)
```

Confirmar quote requiere lock de quote y recalcular `basis_hash`/precondiciones.

---

# 26. PaymentPlan

```text
PaymentPlan
-----------
id UUID PK
event_id UUID NOT NULL
graduate_membership_id UUID NOT NULL UNIQUE
contract_id UUID NOT NULL
event_financial_configuration_id UUID NOT NULL
financial_terms_version INTEGER NOT NULL
currency CHAR(3) NOT NULL
contracted_total NUMERIC(18,2) NOT NULL
is_frozen BOOLEAN NOT NULL DEFAULT FALSE
frozen_at TIMESTAMPTZ NULL
default_grace_period_days INTEGER NOT NULL
status PaymentPlanStatus NOT NULL DEFAULT ACTIVE
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

FKs:

```text
(graduate_membership_id, event_id) -> GraduateMembership(id, event_id)
(contract_id, event_id) -> GraduateContract(id, event_id)
(event_financial_configuration_id, event_id)
  -> EventFinancialConfiguration(id, event_id)
```

Constraints:

```text
UNIQUE(id, event_id)
CHECK(contracted_total >= 0)
CHECK(default_grace_period_days >= 0)
CHECK(is_frozen = FALSE OR frozen_at IS NOT NULL)
```

`contracted_total` es estado agregado del plan y debe poder reconciliarse con contrato/ajustes; no sustituye el ledger.

---

# 27. Installment

```text
Installment
-----------
id UUID PK
payment_plan_id UUID NOT NULL
event_id UUID NOT NULL
sequence INTEGER NOT NULL
concept_code VARCHAR(100) NOT NULL
label VARCHAR(180) NOT NULL
original_amount NUMERIC(18,2) NOT NULL
effective_amount NUMERIC(18,2) NOT NULL
due_at TIMESTAMPTZ NOT NULL
grace_period_days_snapshot INTEGER NOT NULL
lifecycle_status InstallmentLifecycleStatus NOT NULL DEFAULT ACTIVE
cancelled_at TIMESTAMPTZ NULL
cancel_reason TEXT NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

FKs:

```text
(payment_plan_id, event_id) -> PaymentPlan(id, event_id)
```

Constraints:

```text
UNIQUE(payment_plan_id, sequence)
UNIQUE(id, payment_plan_id)
CHECK(sequence >= 1)
CHECK(original_amount >= 0)
CHECK(effective_amount >= 0)
CHECK(grace_period_days_snapshot >= 0)
CHECK(lifecycle_status <> 'CANCELLED' OR cancelled_at IS NOT NULL)
```

Índices:

```text
(payment_plan_id, lifecycle_status, due_at)
(event_id, due_at)
```

No persistir como autoridad:

```text
FUTURE
UPCOMING
DUE
OVERDUE
PAID
```

Estos estados se calculan desde `due_at`, gracia y cobertura efectiva.

---

# 28. PaymentAttempt

```text
PaymentAttempt
--------------
id UUID PK
payment_plan_id UUID NOT NULL
event_id UUID NOT NULL
graduate_membership_id UUID NOT NULL
provider PaymentProvider NOT NULL
provider_preference_id VARCHAR(255) NULL
provider_payment_id VARCHAR(255) NULL
requested_amount NUMERIC(18,2) NOT NULL
currency CHAR(3) NOT NULL
status PaymentAttemptStatus NOT NULL DEFAULT CREATED
expires_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

FKs compuestas:

```text
(payment_plan_id, event_id) -> PaymentPlan(id, event_id)
(graduate_membership_id, event_id) -> GraduateMembership(id, event_id)
```

Constraints:

```text
CHECK(requested_amount > 0)
```

Índices:

```text
(payment_plan_id, created_at DESC)
(graduate_membership_id, created_at DESC)
(provider, provider_payment_id)
```

Idempotencia del command se controla en `IdempotencyRecord`, no mediante memoria ni una key única accidental dentro de Attempt.

---

# 29. PaymentSubmission

```text
PaymentSubmission
-----------------
id UUID PK
payment_plan_id UUID NOT NULL
event_id UUID NOT NULL
graduate_membership_id UUID NOT NULL
method PaymentSource NOT NULL
reported_amount NUMERIC(18,2) NOT NULL
reported_paid_at TIMESTAMPTZ NOT NULL
reference VARCHAR(255) NULL
notes TEXT NULL
evidence_file_id UUID NOT NULL
status PaymentSubmissionStatus NOT NULL DEFAULT PENDING_REVIEW
reviewed_by_account_id UUID NULL FK Account
reviewed_at TIMESTAMPTZ NULL
review_reason TEXT NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

FKs:

```text
(payment_plan_id, event_id) -> PaymentPlan(id, event_id)
(graduate_membership_id, event_id) -> GraduateMembership(id, event_id)
(evidence_file_id, event_id) -> FileAsset(id, event_id)
```

Constraints:

```text
CHECK(method IN ('TRANSFER','DEPOSIT'))
CHECK(reported_amount > 0)
CHECK(status NOT IN ('APPROVED','REJECTED') OR (reviewed_by_account_id IS NOT NULL AND reviewed_at IS NOT NULL))
CHECK(status <> 'REJECTED' OR review_reason IS NOT NULL)
```

No guardar `payment_transaction_id` duplicado aquí. La relación aprobada se obtiene desde `PaymentTransaction.payment_submission_id UNIQUE`.

Índices:

```text
(status, created_at)
(event_id, status, created_at)
(graduate_membership_id, created_at DESC)
```

---

# 30. PaymentTransaction

```text
PaymentTransaction
------------------
id UUID PK
payment_plan_id UUID NOT NULL
event_id UUID NOT NULL
graduate_membership_id UUID NOT NULL
source PaymentSource NOT NULL
payment_attempt_id UUID NULL UNIQUE FK PaymentAttempt
payment_submission_id UUID NULL UNIQUE FK PaymentSubmission
provider_transaction_id VARCHAR(255) NULL
amount NUMERIC(18,2) NOT NULL
currency CHAR(3) NOT NULL
status PaymentTransactionStatus NOT NULL DEFAULT CONFIRMED
confirmed_at TIMESTAMPTZ NOT NULL
registered_at TIMESTAMPTZ NOT NULL
created_by_account_id UUID NULL FK Account
reference VARCHAR(255) NULL
notes TEXT NULL
evidence_file_id UUID NULL
created_at TIMESTAMPTZ NOT NULL
```

FKs:

```text
(payment_plan_id, event_id) -> PaymentPlan(id, event_id)
(graduate_membership_id, event_id) -> GraduateMembership(id, event_id)
(evidence_file_id, event_id) -> FileAsset(id, event_id) when evidence_file_id not null
```

Constraints:

```text
UNIQUE(id, payment_plan_id)
UNIQUE(id, event_id)
CHECK(amount > 0)
UNIQUE(source, provider_transaction_id)
  WHERE provider_transaction_id IS NOT NULL
CHECK(
  (source IN ('MERCADO_PAGO','OPENPAY') AND provider_transaction_id IS NOT NULL)
  OR
  (source IN ('CASH','TRANSFER','DEPOSIT') AND provider_transaction_id IS NULL)
)
```

Campos monetarios y referencias de origen quedan inmutables después de crear CONFIRMED. `status` puede cambiar a `REVERSED` mediante command controlado sin reescribir amount/source/id externo.

Índices:

```text
(payment_plan_id, confirmed_at DESC)
(event_id, confirmed_at DESC)
(graduate_membership_id, confirmed_at DESC)
(source, confirmed_at DESC)
```

---

# 31. PaymentAllocation

```text
PaymentAllocation
-----------------
id UUID PK
payment_plan_id UUID NOT NULL
payment_transaction_id UUID NOT NULL
installment_id UUID NOT NULL
amount NUMERIC(18,2) NOT NULL
created_at TIMESTAMPTZ NOT NULL
```

FKs compuestas:

```text
(payment_transaction_id, payment_plan_id)
  -> PaymentTransaction(id, payment_plan_id)

(installment_id, payment_plan_id)
  -> Installment(id, payment_plan_id)
```

Constraints:

```text
UNIQUE(payment_transaction_id, installment_id)
CHECK(amount > 0)
```

Índices:

```text
(payment_transaction_id)
(installment_id)
(payment_plan_id, installment_id)
```

Invariantes que requieren lock:

```text
SUM(allocations tx) <= transaction.amount
SUM(effective allocations installment) <= installment.effective_amount
```

---

# 32. PaymentAllocationReversal

Detalle físico append-only para que refunds parciales no obliguen a editar/eliminar allocations históricas.

```text
PaymentAllocationReversal
-------------------------
id UUID PK
payment_allocation_id UUID NOT NULL FK PaymentAllocation
refund_id UUID NOT NULL FK Refund
amount NUMERIC(18,2) NOT NULL
reason_code VARCHAR(100) NOT NULL
created_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(payment_allocation_id, refund_id)
CHECK(amount > 0)
```

Invariante bajo lock:

```text
SUM(reversals per allocation) <= allocation.amount
```

Cobertura efectiva:

```text
effective_allocation
= PaymentAllocation.amount
- SUM(PaymentAllocationReversal.amount)
```

Un refund puede consumir primero crédito no aplicado de sus `RefundSource` y solo requiere reversals por la parte que deba reabrir obligaciones. Por eso:

```text
SUM(reversals per refund) <= Refund.amount
```

Si `PaymentTransaction.status = REVERSED`, sus allocations cuentan como cobertura efectiva 0 aunque se preserve historia.

---

# 33. Adjustment

```text
Adjustment
----------
id UUID PK
payment_plan_id UUID NOT NULL
event_id UUID NOT NULL
graduate_membership_id UUID NOT NULL
type AdjustmentType NOT NULL
amount NUMERIC(18,2) NOT NULL
currency CHAR(3) NOT NULL
related_installment_id UUID NULL FK Installment
related_transaction_id UUID NULL FK PaymentTransaction
reason TEXT NOT NULL
created_by_account_id UUID NOT NULL FK Account
created_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
CHECK(amount > 0)
```

Append-only.

Si un adjustment modifica obligación, el use case actualiza `Installment.effective_amount/lifecycle_status` en la misma transacción y el Adjustment conserva la razón/historia.

No editar Adjustment una vez creado.

---

# 34. PenaltyCharge

```text
PenaltyCharge
-------------
id UUID PK
payment_plan_id UUID NOT NULL
event_id UUID NOT NULL
graduate_membership_id UUID NOT NULL
rule_code VARCHAR(100) NOT NULL
amount NUMERIC(18,2) NOT NULL
currency CHAR(3) NOT NULL
effective_at TIMESTAMPTZ NOT NULL
status PenaltyChargeStatus NOT NULL
source_idempotency_key VARCHAR(255) NOT NULL
trigger_installment_id UUID NULL FK Installment
generated_installment_id UUID NULL UNIQUE FK Installment
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(source_idempotency_key)
CHECK(amount > 0)
CHECK(status <> 'APPLIED' OR generated_installment_id IS NOT NULL)
```

No modifica el amount histórico del installment que originó la mora.

---

# 35. CancellationPolicy

```text
CancellationPolicy
------------------
id UUID PK
event_id UUID NOT NULL FK Event
version INTEGER NOT NULL
status CancellationPolicyStatus NOT NULL DEFAULT DRAFT
created_by_account_id UUID NOT NULL FK Account
published_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(event_id, version)
UNIQUE(id, event_id)
CHECK(version >= 1)
```

Índice parcial:

```text
UNIQUE(event_id) WHERE status = 'ACTIVE'
```

Una policy ACTIVE es inmutable. Crear nueva versión para cambios.

---

# 36. CancellationPolicyRange

```text
CancellationPolicyRange
-----------------------
id UUID PK
cancellation_policy_id UUID NOT NULL FK CancellationPolicy
days_before_min INTEGER NOT NULL
days_before_max INTEGER NULL
penalty_percent NUMERIC(5,2) NOT NULL
sort_order INTEGER NOT NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
CHECK(days_before_min >= 0)
CHECK(days_before_max IS NULL OR days_before_max >= days_before_min)
CHECK(penalty_percent BETWEEN 0 AND 100)
UNIQUE(cancellation_policy_id, sort_order)
```

No traslape/sin huecos/cobertura completa se valida transaccionalmente al publicar.

Ranges de policy ACTIVE son inmutables mediante guard de aplicación + SQL trigger/constraint trigger equivalente.

---

# 37. CancellationQuote

```text
CancellationQuote
-----------------
id UUID PK
event_id UUID NOT NULL
graduate_membership_id UUID NOT NULL
contract_id UUID NOT NULL
policy_version_id UUID NOT NULL
policy_range_id UUID NOT NULL
quoted_at TIMESTAMPTZ NOT NULL
days_before_event INTEGER NOT NULL
contracted_total_snapshot NUMERIC(18,2) NOT NULL
eligible_paid_snapshot NUMERIC(18,2) NOT NULL
penalty_percent NUMERIC(5,2) NOT NULL
penalty_amount NUMERIC(18,2) NOT NULL
non_refundable_minimum NUMERIC(18,2) NOT NULL
retained_amount NUMERIC(18,2) NOT NULL
refund_due NUMERIC(18,2) NOT NULL
remaining_due NUMERIC(18,2) NOT NULL
basis_hash VARCHAR(255) NOT NULL
status CancellationQuoteStatus NOT NULL DEFAULT VALID
expires_at TIMESTAMPTZ NULL
used_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ NOT NULL
```

FKs:

```text
(graduate_membership_id, event_id) -> GraduateMembership(id, event_id)
(contract_id, event_id) -> GraduateContract(id, event_id)
(policy_version_id, event_id) -> CancellationPolicy(id, event_id)
policy_range_id -> CancellationPolicyRange(id), validando que pertenezca a policy_version_id
```

Constraints:

```text
CHECK(days_before_event >= 0)
CHECK(penalty_percent BETWEEN 0 AND 100)
CHECK(contracted_total_snapshot >= 0)
CHECK(eligible_paid_snapshot >= 0)
CHECK(penalty_amount >= 0)
CHECK(non_refundable_minimum >= 0)
CHECK(retained_amount >= 0)
CHECK(refund_due >= 0)
CHECK(remaining_due >= 0)
```

Índices:

```text
(graduate_membership_id, status, quoted_at DESC)
(contract_id, quoted_at DESC)
```

Confirmar cancelación recalcula `basis_hash`/estado; quote stale no se consume.

---

# 38. Refund

`Refund` puede representar una devolución manual o por proveedor. Las fuentes monetarias se conservan en `RefundSource`.

```text
Refund
------
id UUID PK
payment_plan_id UUID NOT NULL
event_id UUID NOT NULL
graduate_membership_id UUID NOT NULL
cancellation_quote_id UUID NULL FK CancellationQuote
amount NUMERIC(18,2) NOT NULL
currency CHAR(3) NOT NULL
provider PaymentProvider NULL
provider_refund_id VARCHAR(255) NULL
manual_method PaymentSource NULL
reference VARCHAR(255) NULL
evidence_file_id UUID NULL
status RefundStatus NOT NULL DEFAULT REQUESTED
reason TEXT NOT NULL
created_by_account_id UUID NOT NULL FK Account
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
confirmed_at TIMESTAMPTZ NULL
```

FKs:

```text
(payment_plan_id, event_id) -> PaymentPlan(id, event_id)
(graduate_membership_id, event_id) -> GraduateMembership(id, event_id)
(evidence_file_id, event_id) -> FileAsset(id, event_id) when evidence_file_id not null
```

Constraints:

```text
CHECK(amount > 0)
CHECK(manual_method IS NULL OR manual_method IN ('CASH','TRANSFER','DEPOSIT'))
CHECK((provider IS NOT NULL) <> (manual_method IS NOT NULL))
UNIQUE(provider, provider_refund_id)
  WHERE provider_refund_id IS NOT NULL
```

Al confirmar:

```text
SUM(RefundSource.amount) == Refund.amount
SUM(all confirmed refunds relevant) <= refundable amount
```

---

# 39. RefundSource

Relaciona refund con uno o más cobros previos sin perder trazabilidad.

```text
RefundSource
------------
id UUID PK
refund_id UUID NOT NULL FK Refund
payment_transaction_id UUID NOT NULL FK PaymentTransaction
amount NUMERIC(18,2) NOT NULL
created_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(refund_id, payment_transaction_id)
CHECK(amount > 0)
```

Para refund de proveedor normalmente existirá un único source correspondiente al cobro que el proveedor permite reembolsar. Para devolución manual pueden existir varios sources si el importe proviene de varios cobros.

No crea dinero nuevo; la suma de sources debe igualar el refund al confirmar.

---

# 40. PaymentProviderEvent

Inbox durable para deduplicación y retry.

```text
PaymentProviderEvent
--------------------
id UUID PK
provider PaymentProvider NOT NULL
external_event_id VARCHAR(255) NOT NULL
external_object_id VARCHAR(255) NULL
event_type VARCHAR(150) NULL
payload_hash VARCHAR(255) NULL
processing_status ProviderEventProcessingStatus NOT NULL DEFAULT RECEIVED
signature_verified_at TIMESTAMPTZ NULL
received_at TIMESTAMPTZ NOT NULL
processed_at TIMESTAMPTZ NULL
attempt_count INTEGER NOT NULL DEFAULT 0
next_attempt_at TIMESTAMPTZ NULL
last_error_code VARCHAR(120) NULL
last_error_message TEXT NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(provider, external_event_id)
CHECK(attempt_count >= 0)
```

No es necesario persistir payload completo del proveedor si puede verificarse/refrescarse server-to-server mediante identificadores normalizados.

---

# 41. ReconciliationCase

Persistencia de incidencias que no deben resolverse destruyendo hechos financieros.

```text
ReconciliationCase
------------------
id UUID PK
event_id UUID NOT NULL FK Event
graduate_membership_id UUID NULL FK GraduateMembership
payment_plan_id UUID NULL FK PaymentPlan
payment_transaction_id UUID NULL FK PaymentTransaction
payment_provider_event_id UUID NULL FK PaymentProviderEvent
type ReconciliationCaseType NOT NULL
status ReconciliationCaseStatus NOT NULL DEFAULT OPEN
summary VARCHAR(250) NOT NULL
details JSONB NULL
opened_at TIMESTAMPTZ NOT NULL
resolved_at TIMESTAMPTZ NULL
resolved_by_account_id UUID NULL FK Account
resolution_note TEXT NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Las referencias que tengan `event_id` deben validarse con FKs compuestas cuando el parent disponga de `UNIQUE(id,event_id)`.

Índices:

```text
(status, opened_at)
(event_id, status, opened_at)
(graduate_membership_id, status)
(payment_transaction_id)
```

Caso P0 explícito:

```text
PAYMENT_CONFIRMED_CAPACITY_CONFLICT
```

No hacer rollback del dinero confirmado para preservar capacidad.

---

# 42. SeatingMap

```text
SeatingMap
----------
id UUID PK
event_id UUID NOT NULL UNIQUE FK Event
background_file_id UUID NULL
background_original_width INTEGER NULL
background_original_height INTEGER NULL
coordinate_mode VARCHAR(30) NOT NULL DEFAULT 'NORMALIZED'
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

FK:

```text
(background_file_id, event_id) -> FileAsset(id, event_id) when background_file_id not null
```

Constraints:

```text
CHECK(coordinate_mode = 'NORMALIZED')
CHECK(background_original_width IS NULL OR background_original_width > 0)
CHECK(background_original_height IS NULL OR background_original_height > 0)
```

Cambiar/eliminar background no elimina mesas/asignaciones.

---

# 43. EventTable

```text
EventTable
----------
id UUID PK
event_id UUID NOT NULL FK Event
seating_map_id UUID NOT NULL FK SeatingMap
label VARCHAR(120) NOT NULL
label_normalized VARCHAR(120) NOT NULL
shape TableShape NOT NULL
capacity INTEGER NOT NULL
position_x NUMERIC(9,8) NOT NULL
position_y NUMERIC(9,8) NOT NULL
width NUMERIC(9,8) NOT NULL
height NUMERIC(9,8) NOT NULL
status TableStatus NOT NULL DEFAULT AVAILABLE
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(event_id, label_normalized)
UNIQUE(id, event_id)
CHECK(capacity > 0)
CHECK(position_x BETWEEN 0 AND 1)
CHECK(position_y BETWEEN 0 AND 1)
CHECK(width > 0 AND width <= 1)
CHECK(height > 0 AND height <= 1)
```

No persistir ocupación/full.

Índices:

```text
(event_id, status)
(seating_map_id)
```

Modificar capacidad/eliminar requiere lock de EventTable y count de assignments.

---

# 44. TableAssignment

Representa únicamente la asignación vigente. Historial se conserva en AuditLog.

```text
TableAssignment
---------------
id UUID PK
event_id UUID NOT NULL
group_member_id UUID NOT NULL
table_id UUID NOT NULL
assigned_by_account_id UUID NOT NULL FK Account
assigned_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

FKs compuestas:

```text
(group_member_id, event_id) -> GroupMember(id, event_id)
(table_id, event_id) -> EventTable(id, event_id)
```

Constraints:

```text
UNIQUE(group_member_id)
```

Índices:

```text
(table_id)
(event_id, table_id)
```

No existe seat/chair.

Reasignación: update transaccional del row actual; liberación por cancelación/desactivación puede eliminar el row actual porque AuditLog conserva la historia.

---

# 45. MealOption

```text
MealOption
----------
id UUID PK
event_id UUID NOT NULL FK Event
name VARCHAR(180) NOT NULL
name_normalized VARCHAR(180) NOT NULL
is_active BOOLEAN NOT NULL DEFAULT TRUE
sort_order INTEGER NOT NULL DEFAULT 0
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(event_id, name_normalized)
UNIQUE(id, event_id)
```

Una opción utilizada se desactiva; no hard-delete.

---

# 46. MealSelection

```text
MealSelection
-------------
id UUID PK
event_id UUID NOT NULL
group_member_id UUID NOT NULL
meal_option_id UUID NOT NULL
selected_by_account_id UUID NOT NULL FK Account
selected_at TIMESTAMPTZ NOT NULL
override_reason TEXT NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

FKs compuestas:

```text
(group_member_id, event_id) -> GroupMember(id, event_id)
(meal_option_id, event_id) -> MealOption(id, event_id)
```

Constraint:

```text
UNIQUE(group_member_id)
```

Índices:

```text
(meal_option_id)
(event_id, meal_option_id)
```

---

# 47. ThermoRequest

No se crea fila al registrar la membership. Mientras no exista request, el estado visible se deriva:

```text
eligible=false -> LOCKED
eligible=true  -> AVAILABLE
```

Al solicitar:

```text
ThermoRequest
-------------
id UUID PK
event_id UUID NOT NULL
graduate_membership_id UUID NOT NULL UNIQUE
thermo_configuration_id UUID NOT NULL
status ThermoOperationalStatus NOT NULL DEFAULT REQUESTED
requested_at TIMESTAMPTZ NOT NULL
production_started_at TIMESTAMPTZ NULL
delivered_at TIMESTAMPTZ NULL
updated_by_account_id UUID NULL FK Account
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

FKs:

```text
(graduate_membership_id, event_id) -> GraduateMembership(id, event_id)
(thermo_configuration_id, event_id) -> ThermoConfiguration(id, event_id)
```

Constraints:

```text
UNIQUE(id, event_id)
UNIQUE(id, thermo_configuration_id)
```

Persistido:

```text
REQUESTED
IN_PRODUCTION
DELIVERED
```

No persistir `LOCKED/AVAILABLE` como autoridad.

El producto `EXTRA_THERMO` es line item financiero P2; no crea automáticamente una segunda solicitud operativa sin requisito adicional.

---

# 48. ThermoPersonalizationValue

```text
ThermoPersonalizationValue
--------------------------
id UUID PK
thermo_request_id UUID NOT NULL
thermo_configuration_id UUID NOT NULL
field_id UUID NOT NULL
text_value VARCHAR(500) NULL
option_id UUID NULL FK ThermoPersonalizationOption
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

FKs compuestas:

```text
(thermo_request_id, thermo_configuration_id)
  -> ThermoRequest(id, thermo_configuration_id)

(field_id, thermo_configuration_id)
  -> ThermoPersonalizationField(id, thermo_configuration_id)
```

Constraints:

```text
UNIQUE(thermo_request_id, field_id)
CHECK((text_value IS NOT NULL) <> (option_id IS NOT NULL))
```

El use case valida:

- field activo;
- tipo TEXT/CHOICE;
- max length;
- opción pertenece al field;
- required fields completos.

No aceptar claves JSON arbitrarias.

---

# 49. ThermoDelivery

```text
ThermoDelivery
--------------
id UUID PK
event_id UUID NOT NULL
thermo_request_id UUID NOT NULL UNIQUE
received_by_name VARCHAR(200) NULL
signature_file_id UUID NULL
evidence_file_id UUID NULL
delivered_by_account_id UUID NOT NULL FK Account
delivered_at TIMESTAMPTZ NOT NULL
created_at TIMESTAMPTZ NOT NULL
```

FKs:

```text
(thermo_request_id, event_id) -> ThermoRequest(id, event_id)
(signature_file_id, event_id) -> FileAsset(id, event_id) when signature_file_id not null
(evidence_file_id, event_id) -> FileAsset(id, event_id) when evidence_file_id not null
```

Requisitos obligatorios dependen del `ThermoConfiguration` snapshot del request.

---

# 50. FileAsset

```text
FileAsset
---------
id UUID PK
event_id UUID NOT NULL FK Event
storage_provider VARCHAR(50) NOT NULL
storage_key VARCHAR(500) NOT NULL
purpose FilePurpose NOT NULL
status FileAssetStatus NOT NULL DEFAULT PENDING_VALIDATION
original_name VARCHAR(255) NOT NULL
mime_type VARCHAR(120) NOT NULL
size_bytes BIGINT NOT NULL
checksum_sha256 VARCHAR(64) NULL
uploaded_by_account_id UUID NULL FK Account
validated_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
UNIQUE(storage_provider, storage_key)
UNIQUE(id, event_id)
CHECK(size_bytes > 0)
```

Índices:

```text
(event_id, purpose, created_at DESC)
(status, created_at)
```

`FileAsset` no concede acceso. La entidad propietaria determina authorization.

No guardar blob en PostgreSQL.

---

# 51. Notification

```text
Notification
------------
id UUID PK
account_id UUID NOT NULL FK Account
graduate_membership_id UUID NULL FK GraduateMembership
event_id UUID NULL FK Event
type VARCHAR(100) NOT NULL
title VARCHAR(200) NOT NULL
body TEXT NOT NULL
deduplication_key VARCHAR(255) NULL
read_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ NOT NULL
```

Cuando `graduate_membership_id` no sea null, aplicar FK compuesta `(graduate_membership_id,event_id)` y requerir `event_id` no null en ese caso.

Índices:

```text
(account_id, read_at, created_at DESC)
UNIQUE(account_id, deduplication_key)
  WHERE deduplication_key IS NOT NULL
```

No generar “pago confirmado” desde return URL.

---

# 52. InternalNote

```text
InternalNote
------------
id UUID PK
event_id UUID NOT NULL FK Event
graduate_membership_id UUID NULL FK GraduateMembership
author_account_id UUID NOT NULL FK Account
body TEXT NOT NULL
created_at TIMESTAMPTZ NOT NULL
```

Cuando membership exista:

```text
(graduate_membership_id,event_id) -> GraduateMembership(id,event_id)
```

Índices:

```text
(event_id, created_at DESC)
(graduate_membership_id, created_at DESC)
```

MVP: append/create-read. GRADUATE no accede.

---

# 53. AuditLog

```text
AuditLog
--------
id UUID PK
actor_account_id UUID NULL FK Account
actor_type AuditActorType NOT NULL
event_id UUID NULL FK Event
action VARCHAR(150) NOT NULL
entity_type VARCHAR(120) NOT NULL
entity_id UUID NOT NULL
before_data JSONB NULL
after_data JSONB NULL
reason TEXT NULL
request_id VARCHAR(120) NULL
created_at TIMESTAMPTZ NOT NULL
```

Índices:

```text
(event_id, created_at DESC)
(entity_type, entity_id, created_at DESC)
(actor_account_id, created_at DESC)
(request_id)
```

DB guard obligatorio:

```text
UPDATE AuditLog -> reject
DELETE AuditLog -> reject
```

No almacenar passwords/tokens/secrets en before/after.

---

# 54. IdempotencyRecord

```text
IdempotencyRecord
-----------------
id UUID PK
scope VARCHAR(180) NOT NULL
key VARCHAR(255) NOT NULL
request_hash VARCHAR(255) NOT NULL
state IdempotencyState NOT NULL DEFAULT PROCESSING
response_status INTEGER NULL
response_body JSONB NULL
resource_type VARCHAR(120) NULL
resource_id UUID NULL
processing_expires_at TIMESTAMPTZ NOT NULL
expires_at TIMESTAMPTZ NOT NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
completed_at TIMESTAMPTZ NULL
```

Constraints:

```text
UNIQUE(scope, key)
CHECK(processing_expires_at <= expires_at)
```

Índices:

```text
(expires_at)
(state, processing_expires_at)
```

Semántica:

```text
same key + same hash + COMPLETED -> replay logical result
same key + different hash        -> IDEMPOTENCY_KEY_REUSED
same key + PROCESSING + valid lease -> conflict/wait policy
same key + PROCESSING + expired lease -> reclaim under row lock
```

No almacenar response con secretos.

---

# 55. OutboxEvent

Outbox PostgreSQL para no perder efectos derivados después del commit.

```text
OutboxEvent
-----------
id UUID PK
event_name VARCHAR(180) NOT NULL
aggregate_type VARCHAR(120) NOT NULL
aggregate_id UUID NOT NULL
event_id UUID NULL
payload JSONB NOT NULL
status OutboxStatus NOT NULL DEFAULT PENDING
occurred_at TIMESTAMPTZ NOT NULL
next_attempt_at TIMESTAMPTZ NOT NULL
attempt_count INTEGER NOT NULL DEFAULT 0
processing_started_at TIMESTAMPTZ NULL
processing_expires_at TIMESTAMPTZ NULL
published_at TIMESTAMPTZ NULL
last_error_code VARCHAR(120) NULL
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Constraints:

```text
CHECK(attempt_count >= 0)
```

Índice de claim:

```text
(status, next_attempt_at, occurred_at)
```

Procesamiento recomendado:

```text
SELECT ... FOR UPDATE SKIP LOCKED
```

Un row `PROCESSING` con `processing_expires_at < now` puede reclamarse bajo lock.

Outbox no implica Kafka/Redis/event sourcing.

Se inserta en la misma transacción del hecho principal.

Payload mínimo; evitar PII innecesaria.

---

# 56. ExportJob

Se puede crear desde el inicio aunque el flujo síncrono siga habilitado; solo se usa cuando export requiere job.

```text
ExportJob
---------
id UUID PK
requested_by_account_id UUID NOT NULL FK Account
event_id UUID NOT NULL FK Event
report_type VARCHAR(100) NOT NULL
format ExportFormat NOT NULL
filters_snapshot JSONB NOT NULL
status ExportJobStatus NOT NULL DEFAULT PENDING
result_file_id UUID NULL
attempt_count INTEGER NOT NULL DEFAULT 0
next_attempt_at TIMESTAMPTZ NULL
lease_expires_at TIMESTAMPTZ NULL
error_code VARCHAR(120) NULL
created_at TIMESTAMPTZ NOT NULL
started_at TIMESTAMPTZ NULL
completed_at TIMESTAMPTZ NULL
expires_at TIMESTAMPTZ NULL
```

FK:

```text
(result_file_id,event_id) -> FileAsset(id,event_id) when result_file_id not null
```

Constraints:

```text
CHECK(attempt_count >= 0)
```

Índices:

```text
(status, next_attempt_at, created_at)
(requested_by_account_id, created_at DESC)
(event_id, created_at DESC)
```

No guarda datos del reporte; solo request/resultado.

---

# 57. Same-event composite FK pattern

Para evitar cross-event IDOR por errores internos, varias tablas repiten `event_id` y lo refuerzan con FKs compuestas.

Patrón:

```text
Parent:
UNIQUE(id, event_id)

Child:
FOREIGN KEY(parent_id, event_id)
REFERENCES Parent(id, event_id)
```

Aplicar al menos en:

```text
GraduateMembership -> GroupMember
GraduateMembership -> GraduateContract
GraduateMembership -> PaymentPlan
GraduateMembership -> PaymentAttempt
GraduateMembership -> PaymentSubmission
GraduateMembership -> ThermoRequest
EventProduct -> GroupMember
EventProduct -> ContractLineItem
EventProduct -> ContractLineItemQuote
CancellationPolicy -> GraduateContract
GroupMember -> TableAssignment
EventTable -> TableAssignment
GroupMember -> MealSelection
MealOption -> MealSelection
FileAsset -> event-scoped evidence/background/export relations
```

Prisma puede requerir claves `@@unique([id, eventId])` y relaciones nombradas explícitamente.

No confiar en `event_id` duplicado sin FK que lo haga consistente.

---

# 58. Invariantes P0 y mecanismo de enforcement

| Invariante | DB simple | Transaction/domain |
|---|---:|---:|
| email único | UNIQUE | normalización |
| account/event membership única | UNIQUE | — |
| un primary activo máximo | partial UNIQUE | asegurar existencia |
| active members <= active_places | — | lock membership |
| confirmed places <= event.capacity | — | lock Event + suma memberships |
| folio único | UNIQUE | — |
| current contract único | partial UNIQUE | lifecycle |
| accepted snapshot inmutable | trigger/guard | use case |
| quote one-use | status + lock | basis revalidation |
| 1 plan/membership | UNIQUE | — |
| installment sequence | UNIQUE | plan factory |
| provider event único | UNIQUE | verification |
| provider tx única | partial UNIQUE | payment processor |
| approved submission -> 1 tx | UNIQUE(payment_submission_id) | transaction |
| allocations <= tx | — | lock transaction |
| allocation <= installment | — | lock installment |
| late fee única | UNIQUE source key | job |
| active cancellation policy única | partial UNIQUE | publish transaction |
| policy ranges válidos | CHECK parcial | policy validator |
| refund <= refundable | — | lock sources/plan |
| refund sources sum == refund | — | confirm transaction |
| reversal <= allocation | — | lock allocation |
| table label única | UNIQUE normalized | — |
| one table/member | UNIQUE | — |
| occupancy <= capacity | — | lock tables |
| meal same event | composite FK | policy |
| thermo config/value consistency | composite FK | policy |
| audit append-only | trigger | — |
| idempotency scope/key | UNIQUE | request hash/lease |

---

# 59. Confirmed places concurrency

No persistir contador autoritativo `Event.confirmed_places`.

Cálculo:

```text
SUM(GraduateMembership.active_places)
WHERE event_id = ?
AND status = 'ACTIVE'
AND places_confirmed_at IS NOT NULL
```

Command que confirma/aumenta capacidad comercial:

```text
BEGIN
SELECT Event FOR UPDATE
SELECT Membership FOR UPDATE
recalcular confirmed_places
validar current + requested <= capacity
mutar membership/contract/plan
COMMIT
```

Editar `Event.capacity` usa el mismo lock y debe asegurar:

```text
new_capacity >= confirmed_places
```

Índice crítico:

```text
GraduateMembership(event_id, status, places_confirmed_at)
```

---

# 60. GroupMember count concurrency

Antes de agregar/reactivar integrante o reducir `active_places`:

```text
lock GraduateMembership
count active GroupMember
validate <= active_places
```

No usar contador cache como autoridad.

---

# 61. Table capacity concurrency

Asignación/reasignación:

```text
lock origin/destination EventTable rows in deterministic ID order
count current assignments per target
include full batch delta
validate <= capacity
write assignments
```

Índice:

```text
TableAssignment(table_id)
```

No persistir `occupied`.

---

# 62. Financial allocation concurrency

Antes de crear allocations:

```text
lock PaymentTransaction
lock affected Installments in deterministic order
sum existing effective allocations
validate transaction remaining
validate installment remaining
insert allocations
```

Refund reversal:

```text
lock Refund/RefundSource transactions
lock affected PaymentAllocation rows
insert PaymentAllocationReversal
```

No update/delete allocations históricos.

---

# 63. Refund concurrency

Antes de crear/confirmar refund:

```text
lock source PaymentTransaction rows
lock existing pending/confirmed Refund rows in scope
recalculate refundable amount
validate requested total
persist refund/source/reversals
```

Dos refunds concurrentes no pueden exceder disponible.

---

# 64. Installment state derivation

Persistido:

```text
lifecycle_status ACTIVE|CANCELLED
```

Calculado:

```text
coverage = SUM(PaymentAllocation.amount - reversals)
           excluding REVERSED transactions

remaining = max(effective_amount - coverage, 0)
```

Vista:

```text
if lifecycle_status=CANCELLED -> CANCELLED
else if remaining=0           -> PAID
else if now > due_at + grace  -> OVERDUE
else if now >= due_at         -> DUE
else if within upcoming window defined by read model -> UPCOMING
else -> FUTURE
```

`UPCOMING` es presentación/read model; no es estado DB obligatorio ni regla financiera.

---

# 65. Financial position derivation

No crear columnas autoritativas:

```text
paid_total
pending_total
overdue_total
available_credit
financial_progress
```

Derivar desde:

```text
ContractLineItem/PaymentPlan
Installment
PaymentTransaction
PaymentAllocation
PaymentAllocationReversal
Adjustment
PenaltyCharge
Refund
```

Caches/materialized views pueden añadirse después con ADR/performance evidence, pero deben ser reconstruibles.

---

# 66. Thermo visible state derivation

```text
ThermoRequest exists?

NO:
  ThermoEligibilityPolicy false -> LOCKED
  ThermoEligibilityPolicy true  -> AVAILABLE

YES:
  REQUESTED      -> REQUESTED
  IN_PRODUCTION  -> IN_PRODUCTION
  DELIVERED      -> DELIVERED
```

Nunca autorizar request únicamente porque UI/cache diga AVAILABLE.

---

# 67. File ownership

`FileAsset` no incluye `owner_membership_id` genérico porque ownership depende del recurso que lo referencia.

Resolver mediante relación:

```text
PaymentSubmission.evidence_file_id
PaymentTransaction.evidence_file_id
Refund.evidence_file_id
SeatingMap.background_file_id
ThermoDelivery.signature_file_id
ThermoDelivery.evidence_file_id
ExportJob.result_file_id
```

No aceptar un `file_id` en un command sin validar que:

- purpose esperado coincide;
- uploader/scope permitido;
- event coincide;
- status AVAILABLE.

---

# 68. Borrado / FK policy

Default:

```text
ON DELETE RESTRICT
```

No hard-delete:

- Account con historia;
- Event;
- GraduateMembership;
- GraduateContract aceptado;
- ContractLineItem histórico;
- PaymentPlan;
- Installment con historia;
- PaymentTransaction;
- PaymentAllocation/Reversal;
- reviewed PaymentSubmission;
- Adjustment;
- applied PenaltyCharge;
- CancellationPolicy ACTIVE/ARCHIVED;
- used CancellationQuote;
- Refund;
- AuditLog;
- ReconciliationCase.

Cascades permitidos solo para hijos estrictos de un aggregate borrable **antes de publicación/uso**, por ejemplo:

- `InstallmentTemplate` de financial config DRAFT;
- `CancellationPolicyRange` de policy DRAFT;
- thermo personalization fields/options de config DRAFT;
- tokens/sessions técnicos cuando una limpieza explícita segura los elimine.

La aplicación debe impedir borrar parent histórico aunque el FK físico use cascade en hijos draft.

---

# 69. Immutability guards SQL

Además de application services, las migraciones deberán incluir protección DB para operaciones cuya corrupción sería P0.

### AuditLog

```text
reject UPDATE
reject DELETE
```

### GraduateContract ACCEPTED

Bloquear cambios a:

```text
folio
terms_version
terms_snapshot
terms_snapshot_hash
cancellation_policy_version_id
accepted_at
accepted_by_account_id
```

### PaymentTransaction

Después de insertar:

```text
amount
currency
source
provider_transaction_id
payment_attempt_id
payment_submission_id
confirmed_at
```

no se alteran.

`status` puede pasar `CONFIRMED -> REVERSED` por flujo controlado.

### CancellationPolicy ACTIVE

No modificar datos/version ni ranges.

### Active financial/thermo configuration usada

No modificar términos económicos/esquema; crear nueva versión.

Si la versión de Prisma no puede declarar estas reglas, se implementan mediante SQL en `prisma/migrations/*/migration.sql`.

---

# 70. Índices obligatorios

### Identity

```text
Account UNIQUE(email_normalized)
AuthSession UNIQUE(refresh_token_hash)
AuthSession(account_id, revoked_at, expires_at)
PasswordResetToken(token_hash UNIQUE)
```

### Event

```text
Event(status, event_date)
EventAccessCode UNIQUE active per event
EventFinancialConfiguration(event_id, status, version)
InstallmentTemplate(config_id, sequence)
FinancialMilestone(event_id, is_active, required_at)
ThermoConfiguration(event_id, status, version)
EventProduct(event_id, is_active, sort_order)
```

### Membership/Contracts

```text
GraduateMembership(event_id, status)
GraduateMembership(account_id, status)
GroupMember(membership_id, is_active)
GroupMember(event_id, is_active)
GraduateContract(folio UNIQUE)
GraduateContract(membership_id, status)
ContractLineItem(contract_id, created_at)
ContractLineItem(event_product_id)
ContractLineItemQuote(membership_id, status, expires_at)
```

### Finance/Payments

```text
PaymentPlan(event_id, status)
Installment(payment_plan_id, lifecycle_status, due_at)
PaymentAttempt(payment_plan_id, created_at)
PaymentSubmission(event_id, status, created_at)
PaymentTransaction(payment_plan_id, confirmed_at)
PaymentTransaction(event_id, confirmed_at)
PaymentAllocation(transaction_id)
PaymentAllocation(installment_id)
PaymentAllocationReversal(allocation_id)
Adjustment(payment_plan_id, created_at)
PenaltyCharge(payment_plan_id, effective_at)
CancellationPolicy(event_id, status, version)
CancellationQuote(membership_id, status, quoted_at)
Refund(payment_plan_id, status, created_at)
RefundSource(transaction_id)
PaymentProviderEvent(provider, external_event_id UNIQUE)
ReconciliationCase(status, opened_at)
```

### Operations

```text
EventTable(event_id, status)
TableAssignment(table_id)
MealOption(event_id, is_active)
MealSelection(meal_option_id)
ThermoRequest(event_id, status)
Notification(account_id, read_at, created_at)
InternalNote(event_id, created_at)
AuditLog(event_id, created_at)
AuditLog(entity_type, entity_id, created_at)
FileAsset(event_id, purpose, created_at)
OutboxEvent(status, next_attempt_at, occurred_at)
ExportJob(status, next_attempt_at, created_at)
```

Todo FK usado frecuentemente para join/filtro debe revisarse: PostgreSQL no crea índice automáticamente para todos los FKs.

---

# 71. Partial indexes / SQL migration requirements

Necesarios al menos:

```text
one ACTIVE EventAccessCode per Event
one ACTIVE EventFinancialConfiguration per Event
one ACTIVE ThermoConfiguration per Event
one active primary GroupMember per Membership
one current Contract per Membership
one ACTIVE CancellationPolicy per Event
unique provider transaction when external id is not null
unique provider refund when provider_refund_id is not null
unique Notification dedupe key when not null
```

Si Prisma no representa un índice parcial en el schema usado, el índice sigue siendo obligatorio en PostgreSQL y se crea en migration SQL.

No eliminarlo porque `prisma schema` no lo muestre como annotation.

---

# 72. Check constraints / SQL migration requirements

Prisma models no sustituyen checks DB.

Crear checks para:

```text
money >= 0 / > 0 según entidad
percent 0..100
capacity > 0
active_places >= 1
coordinates 0..1
width/height >0..1
days >= 0
sequence >= 1
refund provider/manual XOR
submission method subset
thermo personalization exactly one value type
reviewed submission state consistency
payment source/provider transaction consistency
```

Cada constraint debe tener nombre estable para diagnosticar errores y mapearlos a domain errors.

Ejemplo de naming:

```text
ck_event_capacity_positive
uq_membership_account_event
ck_table_position_x_normalized
uq_provider_transaction
```

---

# 73. RLS / Supabase

Baseline:

```text
backend-only schema
```

Si `app` no está expuesto a PostgREST:

- NestJS/Prisma aplica AuthZ;
- no se depende de RLS para flujo ordinario.

Si por cambio de infraestructura se expone el schema:

```text
RLS MUST be enabled before exposure
```

No crear políticas `SELECT true` para resolver rápidamente errores.

`service_role`/secret key nunca llega al frontend.

Storage mantiene buckets privados.

---

# 74. Connection management

Producción debe usar pooling compatible con proveedor administrado y Prisma.

Reglas:

- no abrir conexión por request;
- dimensionar pool según runtime/instancias;
- evitar multiplicar conexiones por workers sin límite;
- jobs/reports pesados deben reutilizar configuración de pool controlada;
- observar saturación y queries lentas antes de escalar.

El tamaño exacto se fija al configurar el entorno productivo; no se hardcodea en este documento.

---

# 75. Transaction isolation / locks

Baseline:

```text
READ COMMITTED + explicit FOR UPDATE
```

Usar `SERIALIZABLE` solo donde simplifique una invariante crítica y existan retries controlados.

Operaciones con locks P0:

```text
confirm places
change event capacity
confirm contract line item
reduce places
approve payment submission
manual payment
process confirmed provider payment
create allocations
apply late fee
cancel membership
refund
assign/reassign table
reduce/delete table
publish policy/config
```

Hasta 3 retries ante deadlock/serialization failure recuperable.

No reintentar domain errors.

---

# 76. Deterministic lock ordering

Cuando se bloqueen múltiples filas equivalentes:

```text
ORDER BY id ASC
```

o orden estable equivalente.

Aplicar a:

- EventTable origen/destino;
- Installments;
- PaymentTransactions de refund;
- PaymentAllocations de reversal.

---

# 77. External calls and DB

Nunca mantener transaction/lock PostgreSQL abierto mientras se espera Mercado Pago/OpenPay/email/storage si la operación puede dividirse.

Patrón:

```text
persist intent
COMMIT
call external provider
BEGIN
persist verified/normalized result
COMMIT
```

Webhook confirmado se deduplica con `PaymentProviderEvent` y provider transaction unique.

---

# 78. Outbox processing

Para efectos derivados confiables:

```text
business transaction
+ AuditLog
+ OutboxEvent
COMMIT
```

Worker interno:

```text
claim PENDING with FOR UPDATE SKIP LOCKED
→ PROCESSING + processing_expires_at
→ execute handler
→ PUBLISHED
```

Error:

```text
attempt_count++
next_attempt_at = backoff
status PENDING/FAILED according retry policy
```

Un fallo de email/notificación no revierte payment confirmado.

---

# 79. Reporting queries

Reports es read-only.

No crear tablas paralelas autoritativas para totales.

Consultas deben derivar:

### financiero

```text
contracted
collected
allocated
refunded
pending
overdue
penalties
credit
```

### operativo por evento

```text
mesa
folio
nombre
adultos
niños
sin cena
abonos
total a pagar
total abonado
saldo pendiente
platillos por opción
thermo status
```

Índices se optimizan usando `EXPLAIN ANALYZE` con dataset representativo antes de introducir caches/materialized views.

---

# 80. Excel/report formula injection

No es una regla de DB, pero afecta el read model.

Campos libres como:

```text
full_name
reference
note
label
```

se almacenan como texto original sanitizado para seguridad de aplicación; el exporter debe escapar valores que comiencen con caracteres de fórmula (`=`, `+`, `-`, `@`) según `AC-REP-008`.

No mutar permanentemente el dato para resolver un problema del formato de export.

---

# 81. Legacy -> target mapping

## Event legacy

```text
Event.name        -> Event.name
Event.date        -> Event.event_date (revisar semántica hora)
Event.venue       -> Event.venue
Event.capacity    -> Event.capacity
Event.initial_payment -> EventFinancialConfiguration.initial_payment_amount
Event.thermo_threshold -> ThermoConfiguration.unlock_percent
Event.meals_deadline -> EventSettings.meals_deadline
```

No migrar automáticamente:

```text
ticket_price
months_duration
layout_version
```

sin transformarlos a productos/configuración financiera explícita.

## Graduate legacy

Separar:

```text
email/password/profile -> Account
participación event    -> GraduateMembership
full_name              -> primary GroupMember
```

No conservar wizard step fields como dominio.

## Table legacy

```text
Table -> EventTable
```

Revisar `position_x/position_y` antes de migrar: legacy usa Float y puede contener pixels/no-normalized.

`status=full` no se migra como status; se deriva de assignments.

## TableSelection legacy

Solo contiene Graduate -> Table.

Migración posible:

```text
Graduate primary GroupMember -> TableAssignment
```

No asignar automáticamente todos los guests a esa mesa.

## Ticket legacy

Puede servir como evidencia para construir:

```text
ContractLineItem
active_places
PaymentPlan
```

pero requiere regla de backfill validada; no asumir que cada ticket equivale a Adult/Child/No Dinner.

## Guest legacy

```text
Guest -> GroupMember
```

No migrar `seat_number`.

`meal_type` legacy `traditional/vegan` solo se mapea si existe un `MealOption` explícito equivalente aprobado; no crear catálogo global por el valor legacy.

## Payment legacy

No migrar `Payment.status=paid` directamente a ledger sin conciliación.

Proceso:

```text
revisar amount/type/payment_date/openpay_tx_id
→ crear PaymentTransaction solo cuando hecho confirmado sea verificable
→ crear allocations según obligaciones migradas
```

Pending/failed deben clasificarse antes de decidir si se convierten en Attempt o simplemente historia legacy.

## Thermo legacy

```text
requested -> ThermoRequest REQUESTED
produced  -> IN_PRODUCTION solo si significado coincide
delivered -> DELIVERED + ThermoDelivery cuando exista evidencia
```

No inferir configuración de campos para todo el sistema desde `prefix/name` legacy.

---

# 82. Migration phases

### M0 — freeze/read inventory

- snapshot DB legacy;
- contar filas por tabla;
- detectar datos reales vs demo;
- respaldar;
- no eliminar nada.

### M1 — create target schema

Crear enums/tablas/constraints/índices sin cambiar tráfico productivo.

### M2 — foundation backfill

```text
Account
Event
EventSettings
EventFinancialConfiguration
ThermoConfiguration
EventProduct
```

### M3 — membership/contract backfill

```text
GraduateMembership
GroupMember
GraduateContract
ContractLineItem
PaymentPlan
Installment
```

No inventar aceptación contractual si no existe evidencia.

### M4 — operation backfill

```text
SeatingMap/EventTable/TableAssignment
MealOption/MealSelection
ThermoRequest
```

### M5 — financial reconciliation

```text
legacy payments
→ verify
→ PaymentTransaction
→ PaymentAllocation
```

Generar `ReconciliationCase` para inconsistencias.

### M6 — cutover

- frontend/API nuevo escribe solo target;
- reads migran a target;
- legacy pasa read-only.

### M7 — retire legacy

Solo después de:

- reconciliation completa;
- QA;
- backup/restore verificado;
- no referencias de código;
- ticket explícito.

---

# 83. Prisma implementation rules

El agente que traduzca este documento a `schema.prisma` debe:

1. usar `Decimal` con `@db.Decimal(18,2)` para dinero;
2. usar UUID nativo cuando corresponda;
3. mapear `DATE` para `event_date`;
4. mapear timestamps a timezone-aware PostgreSQL;
5. declarar todas las relaciones con nombres explícitos cuando haya múltiples FKs al mismo model;
6. incluir `@@index` para FKs/filtros definidos aquí;
7. incluir `@@unique` requeridos para FKs compuestas;
8. no intentar sustituir partial indexes/checks/triggers omitidos por Prisma;
9. crear migration SQL adicional para constraints que Prisma no represente;
10. no introducir models legacy en módulos nuevos.

---

# 84. Prisma migration rules

Después de editar `schema.prisma`:

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev --name <meaningful_name>
```

Después revisar `migration.sql` manualmente y añadir:

- partial indexes;
- CHECK constraints;
- immutable guards/triggers;
- schema creation/hardening cuando corresponda.

Producción:

```text
prisma migrate deploy
```

No usar `db push` para sustituir migrations versionadas.

---

# 85. Database tests obligatorios

Antes de considerar implementación del schema `DONE`:

### Constraint tests

- email duplicado falla;
- membership account/event duplicada falla;
- segundo primary activo falla;
- folio duplicado falla;
- segunda transaction por submission falla;
- provider tx duplicada falla;
- active policy duplicada falla;
- label mesa duplicada normalizada falla;
- seat/chair no existe en schema nuevo;
- money negativo falla;
- coordinate fuera 0..1 falla.

### Transaction tests

- dos confirmaciones compiten por último lugar;
- dos personas por último lugar de mesa;
- double approve submission;
- webhook duplicado;
- two refunds competing;
- late fee duplicate;
- quote stale;
- cancellation stale;
- batch table import rollback.

### Immutability tests

- accepted contract snapshot no cambia;
- confirmed payment amount no cambia;
- ACTIVE cancellation policy/ranges no cambian;
- AuditLog no update/delete.

---

# 86. Security tests DB

- frontend credentials no acceden al schema de dominio;
- `anon/authenticated` no obtienen acceso accidental cuando Supabase lo exponga;
- service secret no aparece en frontend env;
- signed file access expira;
- cross-event composite FK rechaza enlaces imposibles;
- no se puede asociar MealOption/Table/FileAsset de otro event mediante IDs válidos.

---

# 87. Performance review rules

Antes de producción:

- cargar dataset representativo;
- `EXPLAIN ANALYZE` para portfolio, financial report, seating availability y pending submissions;
- verificar índices realmente usados;
- eliminar índices redundantes solo con evidencia;
- vigilar N+1 desde Prisma;
- paginar listas administrativas;
- no cargar aggregates completos para reportes.

No optimizar con caches manuales antes de medir.

---

# 88. Query patterns esperados

### Membership ownership

```text
Account.id
+ GraduateMembership(account_id,event_id)
```

Índice único cubre lookup.

### Seating availability

```text
EventTable
LEFT JOIN count(TableAssignment)
GROUP BY table
```

### Pending submissions

```text
WHERE status='PENDING_REVIEW'
ORDER BY created_at
```

### Portfolio

```text
Membership + Contract + PaymentPlan
+ Installment
+ effective allocations
+ refunds
```

### Event workbook

Leer proyecciones por batch; no ejecutar query por graduado.

---

# 89. Data retention

No hardcodear una fecha de eliminación sin política legal aprobada.

Mínimos técnicos:

- AuditLog: conservar según política institucional/operativa;
- contratos/pagos/refunds/evidencias: mientras exista obligación histórica/legal;
- PasswordResetToken expirado: elegible para limpieza;
- AuthSession revocada/expirada: elegible según política;
- IdempotencyRecord administrativo: baseline NFR 24h salvo registros financieros externos;
- OutboxEvent publicado: retención operacional limitada configurable;
- ExportJob/FileAsset export: TTL;
- PaymentProviderEvent: conservar mientras sirva a reconciliación/auditoría financiera.

---

# 90. PII

PII mínima:

```text
Account email/phone/name
GroupMember full_name
contract acceptance evidence
payment references/evidence
thermo delivery/persona receptora
```

No duplicar PII en:

- realtime payload;
- Outbox payload salvo imprescindible;
- ReconciliationCase details salvo necesidad;
- logs técnicos.

Reportes ADMIN sí pueden proyectar PII autorizada.

---

# 91. Stable DB constraint naming

Los nombres de constraints son parte de diagnósticos internos.

Convención:

```text
pk_<table>
fk_<table>_<relation>
uq_<table>_<fields>
ck_<table>_<rule>
ix_<table>_<fields>
trg_<table>_<rule>
```

El error mapper puede mapear constraints conocidas a domain errors estables; nunca enviar nombre SQL bruto al frontend.

---

# 92. No cascade business effects

Un `ON DELETE CASCADE` de DB nunca sustituye un use case de negocio.

Ejemplos prohibidos:

```text
delete Membership -> cascade payments
delete Event -> cascade contracts
delete Table -> cascade assignments para “liberar” capacidad
```

Los efectos de cancelación/reducción/reasignación son commands auditables.

---

# 93. Data ownership por módulo

| Tabla | Owner |
|---|---|
| Account/AuthSession/PasswordResetToken | Identity |
| Event/EventSettings/EventAccessCode | Events |
| EventFinancialConfiguration/InstallmentTemplate | Events/Finance Config |
| FinancialMilestone | Catalog/Events |
| ThermoConfiguration/Fields/Options | Events/Thermos config |
| EventProduct | Catalog |
| GraduateMembership/GroupMember/InternalNote | Memberships |
| GraduateContract/ContractLineItem/ContractLineItemQuote | Contracts |
| PaymentPlan/Installment/Transaction/Allocation/Reversal/Adjustment/Penalty/Policy/Quote/Refund/RefundSource | Finance |
| PaymentAttempt/Submission/ProviderEvent/ReconciliationCase | Payments/Finance orchestration |
| SeatingMap/EventTable/TableAssignment | Seating |
| MealOption/MealSelection | Meals |
| ThermoRequest/Value/Delivery | Thermos |
| FileAsset | Files |
| Notification | Notifications |
| AuditLog | Audit |
| IdempotencyRecord | Common |
| OutboxEvent | Common/Jobs |
| ExportJob | Reports |

Un repository de otro módulo no debe mutar estas tablas directamente por conveniencia.

---

# 94. Models that must not exist in target schema

No crear modelos nuevos equivalentes a:

```text
Tenant
Organization
Workspace
Seat
Chair
SeatAssignment
RSVP
Invitation
QRCheckIn
Scanner
PaidTotal
TableOccupancyCounter
GraduateWizardState
Credits
```

Legacy `Graduate`, `Ticket`, `Guest`, `Payment`, `TableSelection`, `Thermo` no son modelos objetivo.

---

# 95. Data model -> API matrix contract

Cada futura fila de `API_ENDPOINT_MATRIX.md` que muta estado deberá referenciar:

```text
primary tables
secondary tables
db constraints
lock rows
idempotency scope
audit/outbox writes
```

Ejemplo:

```text
adminApprovePaymentSubmission
Primary: PaymentSubmission
Writes: PaymentTransaction, PaymentAllocation, PaymentPlan freeze, AuditLog, OutboxEvent
Locks: PaymentSubmission, PaymentPlan, Installment[]
DB uniqueness: payment_submission_id unique
```

---

# 96. Agent implementation checklist

Antes de crear/modificar una tabla:

```text
[ ] existe aggregate/entity en DOMAIN_MODEL o detalle físico expresamente permitido por DATA_MODEL
[ ] tabla owner identificado
[ ] tipos exactos definidos aquí
[ ] FK y delete policy definidos
[ ] same-event FK aplicada cuando corresponde
[ ] unique/check definido
[ ] índices definidos
[ ] derived values NO persistidos como autoridad
[ ] lock strategy definida para invariantes agregadas
[ ] audit/outbox considerados
[ ] migration forward-safe revisada
[ ] integration test preparado
```

Si falta cualquiera y el dato afecta una invariante P0:

```text
NO improvisar schema
```

---

# 97. Definition of Ready para API_ENDPOINT_MATRIX

Este `DATA_MODEL.md` queda listo como input del siguiente entregable porque cierra:

```text
[READY] entities/tables
[READY] exact data types
[READY] enums
[READY] PK/FK/cardinalities
[READY] same-event integrity
[READY] unique/check constraints
[READY] partial indexes requirements
[READY] immutable history guards
[READY] derived vs persisted states
[READY] financial deallocation/refund persistence
[READY] idempotency persistence
[READY] event access persistence
[READY] financial configuration versioning
[READY] thermo configuration schema
[READY] product quote persistence
[READY] payment/capacity reconciliation persistence
[READY] outbox durability
[READY] export job persistence
[READY] locking rules
[READY] indexes
[READY] legacy migration strategy
[READY] Prisma translation rules
[READY] DB test requirements
```

`API_ENDPOINT_MATRIX.md` no deberá inventar una tabla o estado para hacer viable un endpoint; debe usar este modelo.

---

# 98. Correcciones explícitas respecto a DATA_MODEL 1.1

Se reemplaza:

```text
EventSettings.financial_config_version
→ EventFinancialConfiguration + InstallmentTemplate
```

Se reemplaza:

```text
EventSettings.thermo_threshold_percent
→ ThermoConfiguration versionada + fields/options
```

Se agrega:

```text
AuthSession
EventAccessCode
ContractLineItemQuote
IdempotencyRecord
ReconciliationCase
ExportJob
OutboxEvent
```

Se corrige:

```text
Installment.status temporal persistido
→ lifecycle_status ACTIVE/CANCELLED + estado visible derivado
```

Se corrige:

```text
ThermoStatus LOCKED/AVAILABLE persistido
→ elegibilidad derivada; Request solo REQUESTED/IN_PRODUCTION/DELIVERED
```

Se corrige doble relación:

```text
PaymentSubmission.payment_transaction_id
+ PaymentTransaction.payment_submission_id
```

por una sola FK autoritativa:

```text
PaymentTransaction.payment_submission_id UNIQUE
```

Se agrega `PaymentAllocationReversal` para conservar exactitud tras refunds parciales sin editar allocations históricas.

Se agrega `RefundSource` para relacionar devolución con uno o varios cobros previos.

---

# 99. Revisión contra schema legacy

Clasificación:

| Legacy | Resultado |
|---|---|
| `Event` | REPLACE/ADAPT hacia Event + configs |
| `Graduate` | REPLACE por Account + GraduateMembership + GroupMember |
| `Table` | REPLACE por SeatingMap/EventTable |
| `TableSelection` | REPLACE por TableAssignment |
| `Ticket` | REPLACE por ContractLineItem + plan |
| `Guest` | REPLACE por GroupMember |
| `Payment` | REPLACE por Finance/Payments ledger |
| `Thermo` | REPLACE por ThermoRequest/config/delivery |

No generar migrations destructivas sobre estas tablas hasta inventariar si contienen datos reales.

---

# 100. Regla final

PostgreSQL no es un espejo de las pantallas.

Debe almacenar hechos e invariantes suficientes para que cualquier pantalla pueda reconstruirse de forma consistente.

Modelo correcto:

```text
Domain intention
→ transaction
→ normalized facts
→ DB constraints
→ derived read model
```

Modelo prohibido:

```text
UI state
→ controller
→ mutable counters/status strings
→ datos imposibles de reconciliar
```
