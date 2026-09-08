# Plataforma GR — Modelo de Dominio

**Documento:** `DOMAIN_MODEL.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** BASELINE DE DOMINIO NORMATIVO — listo para derivar modelo de datos, servicios de aplicación y código  
**Fecha:** 7 de septiembre de 2026  
**Fuentes:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `FINANCIAL_DOMAIN.md`, `SEATING_MAP.md`, `SEATING_AUTOMATION_CONTRACT.md`, `SYSTEM_ARCHITECTURE.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`, `ACCEPTANCE_CRITERIA.md`

---

## 1. Propósito

Este documento define el modelo semántico y las fronteras de consistencia de Plataforma GR.

Su objetivo es permitir que un agente convierta un requerimiento aprobado en código sin deducir por conveniencia:

- qué entidad es autoridad;
- qué datos son hechos y cuáles son derivados;
- qué agregado debe modificarse;
- qué operación requiere transacción;
- qué regla pertenece a una policy/domain service;
- qué estados pueden mutarse;
- qué información debe permanecer inmutable;
- qué módulo es dueño de cada concepto;
- qué eventos internos pueden producirse;
- qué restricciones deben reforzarse en PostgreSQL.

Cadena obligatoria:

```text
BR / FR
→ use case
→ aggregate root / domain service
→ invariant
→ transaction boundary
→ repository port
→ persistence constraint
→ domain event/audit
→ API result
→ test
```

Este documento no sustituye `STATE_MACHINES.md`, `DATA_MODEL.md` ni OpenAPI. Les entrega una semántica cerrada que no deben reinterpretar.

---

## 2. Autoridad y precedencia

Para reglas funcionales siguen prevaleciendo:

```text
PRODUCT_SCOPE
→ BUSINESS_RULES
→ SRS
→ ROLES_PERMISSIONS
→ documentos de dominio especializados
```

Este documento:

- no agrega módulos comerciales no aprobados;
- no cambia roles;
- no agrega selección de silla;
- no cambia fórmulas financieras aprobadas;
- no convierte mocks/UI en fuente de verdad;
- no autoriza acceso directo del frontend a DB;
- sí cierra decisiones de modelado necesarias para implementar reglas existentes.

Cuando `DATA_MODEL.md` o código legacy contradigan este modelo semántico, deberán reconciliarse en el entregable siguiente antes de producir backend definitivo.

---

## 3. Principios del dominio

### DM-GEN-001 — Single tenant

No existe `Tenant`, `Organization` ni `Workspace` como entidad de negocio.

### DM-GEN-002 — Dos identidades funcionales

```text
ADMIN
GRADUATE
```

No existen subroles ni ACL configurables.

### DM-GEN-003 — El evento es contexto, no tenant

Cada recurso operativo debe poder resolverse inequívocamente hacia un `Event`.

### DM-GEN-004 — Cuenta != participación

```text
Account != GraduateMembership
```

Una cuenta GRADUATE puede participar en múltiples eventos.

### DM-GEN-005 — Hechos antes que contadores

No usar como autoridad campos manuales equivalentes a:

```text
paid_total
pending_total
overdue_total
occupied_places
available_places
financial_progress
```

Son derivados de hechos persistidos.

### DM-GEN-006 — Historia financiera/contractual no destructiva

Los siguientes recursos no se corrigen mediante overwrite destructivo:

- contrato aceptado;
- line item con historia;
- transacción confirmada;
- allocation;
- ajuste;
- penalización aplicada;
- refund;
- cancelación;
- policy publicada;
- auditoría.

### DM-GEN-007 — El frontend expresa intención

Ningún aggregate acepta como autoridad valores enviados por cliente para:

```text
role
saldo
paid_total
amount autoritativo
occupied
available
financial_progress
penalty_percent
days_before_event
membership ownership
```

### DM-GEN-008 — Tiempo servidor

Deadlines, aceptación, pago, cancelación y transiciones usan reloj servidor. Las reglas civiles consideran timezone del evento.

---

## 4. Lenguaje ubicuo

| Término | Significado |
|---|---|
| `Account` | identidad autenticable global |
| `GraduateMembership` | participación de una cuenta GRADUATE dentro de un evento |
| `GraduateContract` | contrato individual versionado de una membresía |
| `ContractLineItem` | concepto contratado con cantidad/precio snapshot |
| `active_places` | cantidad vigente de lugares contractuales de la membresía |
| `confirmed places` | lugares comercialmente confirmados conforme a condición financiera del evento |
| `GroupMember` | persona nominal que ocupa uno de los lugares vigentes |
| `PaymentPlan` | compromiso financiero de una membresía |
| `Installment` | obligación financiera calendarizada |
| `PaymentAttempt` | intento de cobro electrónico; no dinero confirmado |
| `PaymentSubmission` | comprobante reportado por GRADUATE; no dinero confirmado |
| `PaymentTransaction` | movimiento monetario confirmado |
| `PaymentAllocation` | aplicación de dinero confirmado a una obligación |
| `Adjustment` | movimiento correctivo no destructivo |
| `PenaltyCharge` | cargo tardío independiente |
| `CancellationPolicy` | versión de reglas de penalización por fecha de cancelación |
| `CancellationQuote` | snapshot calculado previo a cancelar |
| `Refund` | devolución independiente del cobro original |
| `SeatingMap` | configuración visual del croquis |
| `EventTable` | mesa con geometría/capacidad |
| `TableAssignment` | relación activa `GroupMember -> EventTable` |
| `MealOption` | opción de platillo configurada por evento |
| `MealSelection` | selección de platillo de una persona |
| `ThermoRequest` | ciclo operativo del termo de una membresía |
| `FileAsset` | metadata de archivo privado administrado por backend |
| `AuditLog` | evidencia append-only de operación crítica |
| `DomainEvent` | hecho interno de aplicación; no implica event sourcing |

---

## 5. Bounded contexts / módulos

El monolito modular usa los siguientes límites:

```text
Identity
Events
Catalog
Memberships
Contracts
Finance
Payments
Seating
Meals
Thermos
Files
Reports
Notifications
Audit
Jobs
Common
```

### Regla de ownership

Un módulo puede referenciar IDs de otro módulo, pero no mutar su persistencia directamente salvo caso de uso coordinado dentro de una `UnitOfWork` explícita.

Ejemplo correcto:

```text
ApprovePaymentSubmission
Payments Application
  -> PaymentSubmissionRepository
  -> Finance Application/Domain
  -> UnitOfWork
```

Ejemplo prohibido:

```text
PaymentsService
  -> prisma.paymentPlan.update(...)
```

---

## 6. Mapa de aggregates

| Módulo | Aggregate root | Entidades / objetos internos principales |
|---|---|---|
| Identity | `Account` | perfil/rol/status |
| Identity | `AuthSession` | sesión refresh rotatoria |
| Identity | `PasswordResetToken` | token hasheado de un uso |
| Events | `Event` | `EventSettings`, configuración de deadlines/operación |
| Events | `EventAccessCode` | acceso contextual de registro |
| Catalog | `EventProduct` | producto/precio/configuración nominal |
| Catalog | `FinancialMilestone` | condición porcentual/fecha/purpose |
| Events/Finance Config | `EventFinancialConfiguration` | versión financiera + `InstallmentTemplate[]` |
| Memberships | `GraduateMembership` | `GroupMember[]` |
| Memberships | `InternalNote` | nota administrativa |
| Contracts | `GraduateContract` | `ContractLineItem[]` |
| Contracts | `ContractLineItemQuote` | snapshot de adición/catch-up |
| Finance | `PaymentPlan` | `Installment[]` |
| Finance | `PaymentTransaction` | `PaymentAllocation[]` |
| Finance | `Adjustment` | movimiento append-only |
| Finance | `PenaltyCharge` | cargo tardío |
| Finance | `CancellationPolicy` | `CancellationPolicyRange[]` |
| Finance | `CancellationQuote` | cálculo snapshot |
| Finance | `Refund` | devolución |
| Payments | `PaymentAttempt` | intento electrónico |
| Payments | `PaymentSubmission` | comprobante reportado |
| Payments | `PaymentProviderEvent` | inbox/deduplicación de proveedor |
| Seating | `SeatingMap` | fondo/metadata canvas |
| Seating | `EventTable` | geometría/capacidad/status |
| Seating | `TableAssignment` | asignación activa por persona |
| Meals | `MealOption` | catálogo de evento |
| Meals | `MealSelection` | selección por persona |
| Thermos | `ThermoRequest` | `ThermoDelivery` |
| Files | `FileAsset` | metadata de objeto privado |
| Notifications | `Notification` | lectura propia |
| Audit | `AuditLog` | record append-only |
| Reports | `ExportJob` si se activa async | resultado `FileAsset` |

`IdempotencyRecord` es infraestructura de aplicación/Common, no aggregate comercial.

---

## 7. Identificadores

Todos los aggregates usan identificadores opacos.

Objetivo:

```text
UUID
```

En código se recomienda branded typing para evitar intercambiar IDs accidentalmente:

```ts
type EventId = Brand<string, 'EventId'>;
type MembershipId = Brand<string, 'MembershipId'>;
type GroupMemberId = Brand<string, 'GroupMemberId'>;
type EventTableId = Brand<string, 'EventTableId'>;
```

No usar números consecutivos como autoridad pública de recursos.

---

## 8. Value Objects comunes

### 8.1 Money

```text
Money
-----
amount Decimal >= 0
currency ISO-4217
```

Baseline de negocio:

```text
MXN
```

Operaciones:

```text
add
subtract
multiply(percent/quantity)
compare
min/max
```

Reglas:

- misma currency para operaciones;
- nunca float binario;
- API serializa amount como decimal string.

### 8.2 Percentage

```text
0 <= value <= 100
```

No asumir enteros si la política futura permite decimales; persistencia debe soportar precisión controlada.

### 8.3 Folio

Valor no vacío, normalizado y único globalmente.

Una vez asociado a contrato, no se reutiliza.

### 8.4 NormalizedCoordinate

```text
0 <= value <= 1
```

### 8.5 TableGeometry

```text
x 0..1
y 0..1
width > 0 && <= 1
height > 0 && <= 1
shape ROUND | SQUARE
```

`SQUARE` es primitive rectangular:

```text
width == height -> cuadrado
width != height -> rectángulo
```

### 8.6 Capacity

Entero positivo.

### 8.7 PlaceCount

Entero positivo para cantidad contractual; operaciones de reducción no pueden producir menos de 1 mientras la membresía siga activa, salvo que el flujo de cancelación cierre la membresía.

### 8.8 DeadlineSet

```text
places_deadline?
table_change_deadline?
meals_deadline?
```

Se evalúa mediante timezone del evento.

### 8.9 FinancialProgress

```text
eligible_net_applied / eligible_total
```

No es campo editable.

### 8.10 ContractSnapshot

Contenido contractual serializable e inmutable + hash criptográfico.

### 8.11 CancellationRange

```text
days_before_min >= 0
days_before_max null | >= min
penalty_percent 0..100
```

### 8.12 CancellationCalculation

```text
contracted_total
eligible_paid
penalty_percent
penalty_amount
non_refundable_minimum
retained_amount
refund_due
remaining_due
```

### 8.13 AllocationInstruction

```text
installment_id
amount > 0
```

El total no puede superar dinero disponible de la transacción.

---

# 9. Identity context

## 9.1 Account — aggregate root

Estados:

```text
ACTIVE
DISABLED
```

Datos de dominio:

```text
id
email
password_hash
full_name
phone?
role ADMIN|GRADUATE
status
last_login_at?
```

Invariantes:

```text
DM-AUTH-001 email normalizado único
DM-AUTH-002 role nunca proviene del cliente
DM-AUTH-003 DISABLED no crea nuevas sesiones
DM-AUTH-004 no hard-delete con historia relacionada
```

Métodos de dominio mínimos:

```text
changeProfile(allowedFields)
disable(actor, at)
recordLogin(at)
```

No exponer:

```text
setRoleFromRequest()
setStatusArbitrary()
```

Cambio de rol no forma parte del flujo ordinario.

## 9.2 AuthSession — aggregate root técnico

Permite múltiples dispositivos.

Estado técnico:

```text
ACTIVE
REVOKED
```

Expiración se deriva de `expires_at`.

Invariantes:

```text
refresh token plano nunca se persiste
rotation invalida el token anterior
logout revoca la sesión actual
DISABLED revoca sesiones activas
```

Operaciones:

```text
rotate(newHash, newExpiry)
revoke(reason, at)
isUsable(now)
```

## 9.3 PasswordResetToken

Invariantes:

```text
hash único
expires_at futuro al crear
used_at null para poder consumir
un solo uso
```

Operación:

```text
consume(now)
```

No revelar existencia de cuenta mediante respuestas externas.

---

## 10. Event context

## 10.1 Event — aggregate root

Estados funcionales:

```text
DRAFT
OPEN
CLOSED
FINALIZED
CANCELLED
```

Atributos principales:

```text
id
name
event_date
venue
school_name?
career?
generation?
capacity
timezone
status
settings
```

### Invariantes

```text
DM-EVT-001 capacity > 0
DM-EVT-002 timezone válido
DM-EVT-003 evento nuevo inicia DRAFT
DM-EVT-004 DRAFT no autoriza operación financiera real GRADUATE
DM-EVT-005 CLOSED/FINALIZED/CANCELLED bloquean mutaciones ordinarias GRADUATE
DM-EVT-006 transición requiere policy, actor y audit
DM-EVT-007 CANCELLED no destruye dependencias
```

No implementar:

```text
event.status = body.status
```

Usar commands explícitos:

```text
open()
close()
reopen()
finalize()
cancel(reason)
```

Las transiciones exactas permitidas se congelarán en `STATE_MACHINES.md`; no crear transiciones adicionales antes de ese documento.

## 10.2 EventSettings — entidad del aggregate Event

Contiene configuración operativa de baja cardinalidad:

```text
deadlines
thermo_configuration
late_payment_configuration
auto_cancel_configuration
financial_configuration_version reference
```

### ThermoConfiguration

Debe modelar al menos:

```text
unlock_percent
allowed_personalization_fields[]
delivery_evidence requirements cuando aplique
```

`DATA_MODEL.md` deberá incorporar este contrato; hoy solo conserva el threshold.

## 10.3 EventAccessCode — aggregate root

No es password ni identidad permanente.

Datos conceptuales:

```text
id
event_id
code_hash
status ACTIVE|REVOKED
expires_at?
created_at
rotated_at?
```

Invariantes:

```text
código plano nunca persistido
REVOKED no resuelve acceso
expired no resuelve acceso
resolver código solo produce contexto temporal del event_id
```

Rotar código no elimina membresías ya creadas.

---

## 11. Configuración financiera del evento

El baseline funcional requiere calendario, pago inicial e importes configurables, mientras `PaymentPlan.financial_terms_version` exige una versión reproducible.

Por ello existe conceptualmente:

## 11.1 EventFinancialConfiguration — aggregate root

```text
id
event_id
version
currency
initial_payment_required
initial_payment_amount
initial_payment_label
default_grace_period_days
installment_templates[]
created_at
```

### InstallmentTemplate

```text
sequence
concept_code
label
amount
due_at
grace_period_days
```

### Invariantes

```text
DM-FCFG-001 version única por evento
DM-FCFG-002 currency consistente
DM-FCFG-003 amounts >= 0
DM-FCFG-004 sequence única
DM-FCFG-005 due_at definido por calendario del evento
DM-FCFG-006 configuración nueva no reescribe PaymentPlan existente/frozen
```

La implementación de edición puede crear nueva versión en lugar de mutar una versión ya usada por planes. `DATA_MODEL.md` debe cerrar persistencia exacta en el siguiente entregable.

No almacenar simplemente el calendario como comportamiento implícito del wizard frontend.

---

## 12. Catalog context

## 12.1 EventProduct — aggregate root

```text
id
event_id
kind BASE_PACKAGE|ADULT|CHILD|NO_DINNER|EXTRA_THERMO|OTHER
code
name
unit_amount
is_active
sort_order
requires_nominal_member
```

Invariantes:

```text
code único por event
unit_amount >= 0
producto usado no hard-delete
inactive no puede usarse en nueva compra ordinaria
```

Cambiar precio no altera `ContractLineItem.unit_amount` histórico.

## 12.2 FinancialMilestone — aggregate root

```text
id
event_id
code
required_progress_percent
required_at?
purpose_code
is_active
```

No libera mesa/cancela por sí solo salvo regla aprobada explícita.

---

## 13. Membership context

## 13.1 GraduateMembership — aggregate root

Representa participación, no login.

```text
id
account_id
event_id
active_places
places_confirmed_at?
status ACTIVE|CANCELLED|COMPLETED
cancelled_at?
cancel_reason?
group_members[]
```

### Invariantes

```text
DM-MEM-001 UNIQUE(account_id,event_id)
DM-MEM-002 active_places >= 1 mientras ACTIVE
DM-MEM-003 active GroupMember count <= active_places
DM-MEM-004 exactamente un primary GroupMember por membresía activa
DM-MEM-005 CANCELLED no admite mutaciones ordinarias
DM-MEM-006 places_confirmed_at solo se establece tras condición comercial válida
DM-MEM-007 cancelar no elimina cuenta/contrato/ledger
```

### Métodos

```text
increasePlaces(quantity)
reducePlaces(quantity, reason)
addGroupMember(...)
updateGroupMember(...)
deactivateGroupMember(...)
markPlacesConfirmed(at)
cancel(reason, at)
complete(at)
```

`reducePlaces` no modifica finanzas por sí mismo. El application use case debe coordinar Finance/Seating.

## 13.2 GroupMember — entidad del aggregate

```text
id
event_product_id?
full_name
is_primary
is_active
```

Reglas:

- pertenece a una sola membership;
- su evento se obtiene por membership;
- `is_primary` no puede duplicarse;
- desactivar integrante no borra historia de mesa/platillo;
- una asignación de mesa activa debe liberarse al desactivar/reducir.

No contiene:

```text
seat_id
seat_number
chair_id
```

## 13.3 Confirmed places

No persistir un contador editable `event.confirmed_places` como autoridad.

Conceptualmente:

```text
confirmed_places(event)
= SUM(active_places de memberships comercialmente confirmadas y activas)
```

La confirmación se protege mediante lock/transacción sobre el evento y membresía.

---

## 14. InternalNote

Aggregate root operacional administrado por Memberships.

```text
id
event_id
graduate_membership_id?
author_account_id
body
created_at
```

MVP requerido:

```text
create
read ADMIN
```

No existe obligación funcional de edición/delete. Si se agrega posteriormente, requiere audit before/after.

GRADUATE nunca recibe este recurso.

---

## 15. Contracts context

## 15.1 GraduateContract — aggregate root

```text
id
graduate_membership_id
folio
status PENDING_ACCEPTANCE|ACCEPTED|SUPERSEDED|CANCELLED
terms_version
terms_snapshot
terms_snapshot_hash
cancellation_policy_version_id
accepted_at?
accepted_by_account_id?
line_items[]
```

### Invariantes

```text
DM-CON-001 folio global único y estable
DM-CON-002 contrato aceptado conserva snapshot/hash
DM-CON-003 policy version de contrato aceptado es inmutable
DM-CON-004 aceptación solo por cuenta propietaria GRADUATE
DM-CON-005 accepted_at usa reloj servidor
DM-CON-006 cambios posteriores son append/addenda, no overwrite silencioso
DM-CON-007 una línea histórica con impacto financiero no se elimina
```

### Métodos

```text
accept(acceptanceEvidence)
appendLineItem(lineItem)
supersede(replacementContractId) // solo flujo contractual explícito futuro/autorizado
cancelReference(reason)          // no cancela membership por sí solo
```

No implementar `updateAcceptedContract(dto)`.

## 15.2 ContractLineItem — entidad

```text
id
event_product_id?
concept_code
label
quantity
unit_amount
line_total
source
is_active
created_at
```

Regla:

```text
line_total = quantity * unit_amount
```

con aritmética decimal exacta.

---

## 16. ContractLineItemQuote

El API ya usa `quote_id` y `expires_at`; por ello el quote debe existir como concepto de dominio verificable.

Aggregate root:

```text
id
membership_id
contract_id
event_product_id
quantity
previous_contracted_total_snapshot
new_contracted_total_snapshot
required_progress_percent
eligible_paid_snapshot
catch_up_due
product_price_snapshot
capacity_basis/version cuando aplique
quoted_at
expires_at
status VALID|USED|EXPIRED|CANCELLED
```

### Invariantes

```text
DM-QUOTE-001 quote pertenece a misma membership/contract/event
DM-QUOTE-002 quantity > 0
DM-QUOTE-003 no puede usarse expirado
DM-QUOTE-004 solo se usa una vez
DM-QUOTE-005 confirmación revalida precio/product/event/deadline/capacidad/finanzas
DM-QUOTE-006 cambio material produce PRODUCT_QUOTE_STALE
```

Fórmula:

```text
required_paid_after_addition = new_contracted_total * required_progress
catch_up_due = max(required_paid_after_addition - eligible_paid, 0)
```

La persistencia exacta deberá agregarse a `DATA_MODEL.md`.

---

## 17. PaymentPlan aggregate

`PaymentPlan` es la raíz del compromiso financiero de una membership.

```text
id
event_id
graduate_membership_id
contract_id
currency
contracted_total
financial_terms_version
is_frozen
frozen_at?
grace_period_days
status ACTIVE|SETTLED|CANCELLED
installments[]
```

### Invariantes

```text
DM-PLAN-001 max 1 plan vigente por membership
DM-PLAN-002 contracted_total usa Money exacto
DM-PLAN-003 financial_terms_version referencia configuración usada
DM-PLAN-004 primer pago confirmado/aplicado congela plan
DM-PLAN-005 defaults posteriores no reescriben obligaciones comprometidas
DM-PLAN-006 calendario de alta tardía conserva due dates originales
DM-PLAN-007 no existe saldo manual autoritativo
```

### Métodos de dominio

```text
freeze(at)
addInstallment(...)
applyContractIncrease(...)
applyContractReduction(...)
markCancelled(...)
```

Estos métodos nunca reciben `paid_total` desde frontend.

---

## 18. Installment — entidad del PaymentPlan

```text
id
sequence
concept_code
label
original_amount
effective_amount
due_at
grace_period_days_snapshot
```

### Estado semántico

```text
FUTURE
UPCOMING
DUE
OVERDUE
PAID
CANCELLED
```

`FUTURE/UPCOMING/DUE/OVERDUE/PAID` deben derivarse de:

```text
clock
remaining amount
due_at
grace
```

`CANCELLED` sí representa un hecho explícito.

Si `DATA_MODEL` persiste `status`, los estados temporales serán proyección/cache no autoritativa y deberán poder recalcularse.

Una obligación parcialmente cubierta conserva remaining amount sin necesidad de exponer un estado comercial `PARTIALLY_PAID`.

---

## 19. PaymentTransaction aggregate

Representa dinero confirmado.

```text
id
payment_plan_id
graduate_membership_id
source MERCADO_PAGO|OPENPAY|CASH|TRANSFER|DEPOSIT
provider_transaction_id?
payment_submission_id?
amount
currency
status CONFIRMED|REVERSED
confirmed_at
registered_at
created_by_account_id?
reference?
notes?
evidence_file_id?
allocations[]
```

### Invariantes

```text
DM-TXN-001 amount > 0
DM-TXN-002 source/provider transaction ID único cuando existe
DM-TXN-003 max 1 transaction por approved submission
DM-TXN-004 atributos monetarios de CONFIRMED son inmutables
DM-TXN-005 sum allocations <= transaction.amount
DM-TXN-006 currency == payment plan currency
```

Una reversa cambia la posición mediante flujo explícito; nunca se borra la transacción original.

---

## 20. PaymentAllocation — entidad

```text
payment_transaction_id
installment_id
amount
```

### AllocationPolicy

Por defecto:

```text
1. obligaciones activas
2. exigible/vencimiento ascendente
3. sequence ascendente
4. cubrir hasta agotar dinero
5. remanente queda crédito trazable
```

Invariantes:

```text
allocation > 0
same PaymentPlan
no inventar dinero
no perder remanente
```

---

## 21. Adjustment — aggregate root append-only

```text
id
payment_plan_id
membership_id
type CREDIT|DEBIT|OBLIGATION_REDUCTION|OBLIGATION_CANCELLATION
amount
currency
related_installment_id?
related_transaction_id?
reason
created_by_account_id
created_at
```

Requiere:

- ADMIN;
- motivo;
- idempotencia cuando API command;
- audit.

No edita el movimiento original.

---

## 22. PenaltyCharge — aggregate root

```text
id
payment_plan_id
membership_id
rule_code
amount
currency
effective_at
status PENDING|APPLIED|CANCELLED
source_idempotency_key
related_installment_id?
```

### Invariantes

```text
DM-LATE-001 una condición lógica genera máximo un fee
DM-LATE-002 fee no modifica amount original de installment
DM-LATE-003 no se aplica si obligación relevante ya fue cubierta
DM-LATE-004 amount/config proviene del evento, no constante
```

`APPLIED` debe materializar saldo exigible mediante obligación/mecanismo financiero trazable.

---

## 23. CancellationPolicy aggregate

```text
id
event_id
version
status DRAFT|ACTIVE|ARCHIVED
ranges[]
published_at?
created_by_account_id
```

### Métodos

```text
replaceDraftRanges(ranges)
validateForPublish()
publish(at)
archive(at)
```

### Invariantes al publicar

```text
DM-CANPOL-001 percentages 0..100
DM-CANPOL-002 comienza día 0
DM-CANPOL-003 sin traslapes
DM-CANPOL-004 sin huecos
DM-CANPOL-005 cobertura final completa/open ended
DM-CANPOL-006 ACTIVE es inmutable
DM-CANPOL-007 version única por event
```

No editar rangos de una policy ACTIVE.

---

## 24. CancellationQuote aggregate

Snapshot calculado por backend.

```text
id
membership_id
contract_id
policy_version_id
policy_range_id
quoted_at
days_before_event
contracted_total_snapshot
eligible_paid_snapshot
penalty_percent
penalty_amount
non_refundable_minimum
retained_amount
refund_due
remaining_due
status VALID|EXPIRED|USED|CANCELLED
expires_at?
used_at?
```

### Fórmula baseline

```text
penalty_amount = effective_contracted_total * penalty_percent
retained_amount = max(penalty_amount, non_refundable_minimum)
refund_due = max(eligible_paid - retained_amount, 0)
remaining_due = max(retained_amount - eligible_paid, 0)
```

### Invariantes

```text
frontend no envía penalty_percent como autoridad
policy version proviene del contrato
confirmación revalida estado financiero
quote stale no se consume
consume máximo una vez
```

---

## 25. Refund aggregate

```text
id
payment_plan_id
membership_id
payment_transaction_id?
cancellation_quote_id?
amount
currency
provider?
provider_refund_id?
manual_method?
reference?
evidence_file_id?
status REQUESTED|PENDING|CONFIRMED|FAILED|CANCELLED
reason
created_by_account_id
confirmed_at?
```

### Invariantes

```text
DM-REF-001 amount > 0
DM-REF-002 sum confirmed refunds <= refundable amount
DM-REF-003 refund no elimina transaction original
DM-REF-004 manual/provider claramente distinguibles
DM-REF-005 concurrencia debe revalidar refundable amount bajo lock
```

---

## 26. FinancialPosition — read model/value result

No es aggregate ni tabla obligatoria.

Debe poder calcular:

```text
contracted_total
confirmed_collections_total
allocated_total
refunded_total
adjustment_net
penalty_total
outstanding_total
overdue_total
available_credit
next_due_at
financial_progress
```

Se deriva de ledger/obligaciones.

Cualquier cache debe poder reconstruirse.

---

## 27. Payments context

## 27.1 PaymentAttempt — aggregate root

```text
id
payment_plan_id
membership_id
provider MERCADO_PAGO|OPENPAY
requested_amount
currency
provider_preference_id?
status CREATED|REDIRECTED|PENDING|CONFIRMED|FAILED|EXPIRED|CANCELLED
expires_at?
```

Crear attempt:

- no cambia saldo;
- no confirma lugares;
- no desbloquea mesa;
- no desbloquea termo.

El backend calcula `requested_amount`.

Transiciones concretas se cerrarán en `STATE_MACHINES.md`.

## 27.2 PaymentSubmission — aggregate root

```text
id
payment_plan_id
membership_id
method TRANSFER|DEPOSIT
reported_amount
reported_paid_at
reference?
notes?
evidence_file_id
status PENDING_REVIEW|APPROVED|REJECTED|CANCELLED
reviewed_by?
reviewed_at?
review_reason?
payment_transaction_id?
```

### Métodos

```text
approve(transactionId, adminId, at)
reject(reason, adminId, at)
cancel(...)
```

### Invariantes

```text
PENDING_REVIEW no altera finanzas
APPROVED requiere exactly one PaymentTransaction
REJECTED requiere reason
reviewer es ADMIN
approve concurrente produce máximo una transaction
```

## 27.3 PaymentProviderEvent — aggregate root técnico/inbox

```text
provider
external_event_id
event_type?
payload_hash?
received_at
processed_at?
processing_status
attempt_count
last_error?
```

Invariante:

```text
UNIQUE(provider, external_event_id)
```

Recibir el evento no equivale a pago confirmado.

---

## 28. Confirmed external payment vs capacity conflict

Caso límite P0:

```text
checkout válido
→ proveedor confirma dinero
→ antes de procesar webhook se consume la última capacidad comercial
```

Dos invariantes simultáneas:

```text
1. dinero externo confirmado no puede desaparecer
2. confirmed_places nunca puede exceder Event.capacity
```

Comportamiento de dominio obligatorio:

1. persistir/deduplicar la confirmación monetaria válida;
2. crear `PaymentTransaction` y allocations conforme a reglas financieras;
3. intentar `PlaceConfirmationPolicy` bajo lock;
4. si ya no existe capacidad, **no** sobreasignar lugares;
5. la membership permanece sin nueva confirmación comercial correspondiente;
6. registrar estado operacional/reconciliación `REQUIRES_REVIEW` o mecanismo equivalente;
7. no realizar refund ni cancelación automática sin regla explícita/ADMIN.

No es válido resolver el conflicto haciendo rollback y fingiendo que el pago externo nunca ocurrió.

`DATA_MODEL`/`INTEGRATIONS` deberán definir dónde se persiste la incidencia de reconciliación.

---

## 29. Seating context

## 29.1 SeatingMap — aggregate root

```text
id
event_id
background_file_id?
background_original_width?
background_original_height?
coordinate_mode NORMALIZED
```

Cambiar fondo:

```text
NO elimina EventTable
NO elimina TableAssignment
```

Un evento tiene máximo un mapa activo baseline.

## 29.2 EventTable — aggregate root

```text
id
event_id
seating_map_id
label
geometry
capacity
status AVAILABLE|BLOCKED
```

### Invariantes

```text
DM-SEAT-001 label único por event
DM-SEAT-002 capacity > 0
DM-SEAT-003 geometry normalized
DM-SEAT-004 BLOCKED no acepta nuevas asignaciones ordinarias
DM-SEAT-005 capacity no baja de occupancy
DM-SEAT-006 mesa con assignments no se elimina
```

Métodos:

```text
rename(label)
move(geometry)
changeCapacity(newCapacity, currentOccupancy)
block()
unblock()
```

`FULL` y `PARTIAL` no son status persistidos de negocio.

## 29.3 TableAssignment — aggregate root relacional

```text
id
event_id
group_member_id
table_id
assigned_by_account_id
assigned_at
updated_at
```

### Invariantes

```text
DM-SEAT-007 max 1 active assignment per GroupMember
DM-SEAT-008 GroupMember.event == EventTable.event
DM-SEAT-009 active assignment count <= table.capacity
DM-SEAT-010 group members pueden distribuirse entre mesas
DM-SEAT-011 no existe seat/chair
```

No cargar todos los assignments dentro del objeto `EventTable` para mutar. La consistencia se garantiza mediante `SeatingAssignmentPolicy` + transaction locks.

---

## 30. SeatingAssignmentPolicy

Servicio de dominio/aplicación para asignación múltiple.

Input conceptual:

```text
actor
membership/event
[{groupMemberId, targetTableId}]
now
reason? admin override
```

Validaciones:

1. event permitido;
2. membership ACTIVE;
3. todos los GroupMember pertenecen al event/ownership válido;
4. condición financiera satisfecha para GRADUATE;
5. deadline vigente para GRADUATE;
6. target tables AVAILABLE;
7. capacidad suficiente considerando batch completo;
8. locks de origen/destino en orden determinista;
9. reemplazar assignment de cada persona;
10. audit before/after;
11. commit único.

Si falla cualquier destino:

```text
no se mueve ningún miembro del batch
```

Error de capacidad concurrente:

```text
TABLE_CAPACITY_CHANGED
```

---

## 31. Seating import automation

Los candidatos detectados por OpenCV/OCR **no son entidades de dominio persistidas**.

Son draft frontend:

```text
DetectedTableCandidate
```

solo hasta revisión ADMIN.

Al publicar se convierten en `EventTable` mediante command:

```text
ImportDetectedTables
```

Invariantes:

- ADMIN;
- source `FileAsset` autorizado;
- batch limitado;
- labels únicos;
- geometría válida;
- capacity válida;
- all-or-nothing;
- idempotencia;
- audit.

`client_ref` es correlación de request, no ID de dominio.

---

## 32. Meals context

## 32.1 MealOption — aggregate root

```text
id
event_id
name
is_active
sort_order
```

Una opción utilizada no se hard-delete.

Inactive:

- permanece visible históricamente cuando ya fue seleccionada;
- no se ofrece para nuevas selecciones ordinarias.

## 32.2 MealSelection — aggregate root

```text
id
group_member_id
meal_option_id
selected_by_account_id
selected_at
override_reason?
```

Invariantes:

```text
max 1 selección vigente por GroupMember
member y option pertenecen al mismo event
member activo
GRADUATE respeta deadline
ADMIN override posterior requiere reason
```

Cambiar selección actualiza la relación vigente; AuditLog preserva before/after cuando aplica.

---

## 33. Thermos context

## 33.1 ThermoRequest — aggregate root

Estados visibles:

```text
LOCKED
AVAILABLE
REQUESTED
IN_PRODUCTION
DELIVERED
```

`LOCKED` y `AVAILABLE` dependen de elegibilidad financiera. Aun si se materializan en persistencia/cache, nunca autorizan por sí solos una solicitud: el command debe recalcular la policy financiera.

```text
REQUESTED
IN_PRODUCTION
DELIVERED
```

son hechos operativos explícitos.

Datos:

```text
membership_id
event_id
status
personalization
requested_at?
production_started_at?
delivered_at?
updated_by?
delivery?
```

### Invariantes

```text
DM-TH-001 eligibility usa FinancialProgress autoritativo
DM-TH-002 solo elegible/AVAILABLE solicita ordinariamente
DM-TH-003 personalization solo contiene fields permitidos
DM-TH-004 IN_PRODUCTION bloquea edición GRADUATE
DM-TH-005 solo ADMIN inicia producción/entrega
DM-TH-006 DELIVERED no regresa a estado ordinario sin flujo correctivo explícito
```

## 33.2 ThermoDelivery — entidad

```text
received_by_name?
signature_file_id?
evidence_file_id?
delivered_by_account_id
delivered_at
```

Si la configuración del evento exige evidencia, no completar entrega sin ella.

---

## 34. Files context

## FileAsset — aggregate root técnico

Metadata:

```text
id
storage_provider
storage_key
original_name
mime_type
size_bytes
checksum?
uploaded_by_account_id?
created_at
```

El blob vive fuera de PostgreSQL.

Invariantes:

```text
storage_key generado por backend
MIME/contenido validado
size policy aplicada
bucket privado
acceso siempre autorizado o URL firmada corta
```

`FileAsset` no decide por sí mismo quién puede verlo; el recurso propietario determina authorization scope.

Ejemplos:

```text
PaymentSubmission.evidence -> solo propietario + ADMIN
SeatingMap.background -> según permisos croquis
ThermoDelivery.signature -> ADMIN / propietario si contrato lo permite
Export -> ADMIN
```

---

## 35. Notification aggregate

```text
id
account_id
membership_id?
event_id?
type
title
body
read_at?
created_at
```

Método:

```text
markRead(at)
```

Ownership estricto por account.

Las notificaciones derivan de hechos confirmados; no deben declarar “pago confirmado” a partir de return URL o PaymentAttempt.

---

## 36. AuditLog

Record append-only, conceptualmente raíz propia.

```text
actor_account_id?
actor_type ACCOUNT|SYSTEM
event_id?
action
entity_type
entity_id
before_data?
after_data?
reason?
request_id?
created_at
```

No tiene métodos de update/delete.

El application layer construye audit entries después de que el dominio valida la operación y dentro de la misma transacción cuando la operación crítica lo permite.

---

## 37. Reports context

Reports no es dueño de hechos de negocio.

Produce read models:

```text
EventFinancialReport
PortfolioReport
PaymentsReport
PaymentSubmissionsReport
TablesReport
MealsReport
ThermosReport
CashCutReport
EventOperationalWorkbook
```

Puede usar queries optimizadas que crucen módulos.

No puede ejecutar commands de mutación.

### EventOperationalWorkbook

Debe poder incluir:

```text
datos generales del evento
mesa
folio/numero de contrato
nombre
adultos
niños
sin cena
detalle de abonos
total a pagar
total abonado
saldo pendiente
platillos vegetarianos
platillos veganos
```

Los conceptos visibles de platillo se derivan del catálogo/configuración real, no de nombres hardcodeados salvo layout contractual específico.

---

## 38. ExportJob

Solo se requiere persistencia cuando export sea async.

Estado técnico:

```text
PENDING
RUNNING
COMPLETED
FAILED
```

Datos conceptuales:

```text
id
requested_by_account_id
event_id
report_type
format
filters_snapshot
status
result_file_id?
error_code?
created_at
started_at?
completed_at?
expires_at?
```

No duplica la información del reporte; conserva request/resultado.

---

## 39. Domain services / policies

Las siguientes reglas no pertenecen correctamente a una sola entidad y deben implementarse como servicios/policies puros o application-domain coordinators.

### EventCapacityPolicy

```text
canConfirmPlaces(eventId, requestedPlaces)
```

Usa count autoritativo bajo lock.

### PlaceConfirmationPolicy

Decide si la condición comercial requerida quedó cubierta y puede marcar `places_confirmed_at` sin exceder capacidad.

### ProductPurchasePolicy

Valida:

```text
event OPEN
product active
places deadline
capacity
membership ACTIVE
financial catch-up
```

### CatchUpPolicy

Implementa fórmula aprobada.

### PaymentAllocationPolicy

Aplica dinero por prioridad.

### FinancialPositionCalculator

Calcula saldo/progreso desde hechos.

### SeatingEligibilityPolicy

Valida:

```text
membership ACTIVE
event OPEN
places confirmed/financial rule
deadline
```

### SeatingAssignmentPolicy

Coordina batch y capacidad.

### MealSelectionPolicy

Valida ownership, event, active option/member y deadline.

### CancellationPolicyValidator

Valida continuidad/rangos.

### CancellationCalculator

Implementa fórmula de quote.

### RefundabilityPolicy

Determina monto máximo reembolsable bajo lock.

### ThermoEligibilityPolicy

Usa progreso financiero real + event configuration.

### EventMutationPolicy

Responde si una mutación GRADUATE está permitida según lifecycle.

---

## 40. Infrastructure/application ports

El dominio no importa Prisma/NestJS/SDK.

Repositories mínimos conceptuales:

```text
AccountRepository
AuthSessionRepository
EventRepository
EventAccessCodeRepository
EventFinancialConfigurationRepository
EventProductRepository
FinancialMilestoneRepository
MembershipRepository
InternalNoteRepository
ContractRepository
ContractLineItemQuoteRepository
PaymentPlanRepository
PaymentTransactionRepository
AdjustmentRepository
PenaltyChargeRepository
CancellationPolicyRepository
CancellationQuoteRepository
RefundRepository
PaymentAttemptRepository
PaymentSubmissionRepository
PaymentProviderEventRepository
SeatingMapRepository
EventTableRepository
TableAssignmentRepository
MealOptionRepository
MealSelectionRepository
ThermoRequestRepository
FileAssetRepository
NotificationRepository
AuditLogRepository
ExportJobRepository
```

Query ports separados cuando una lectura agregada no requiere reconstruir aggregate:

```text
FinancialQueryService
PortfolioQueryService
SeatingAvailabilityQuery
ReportQueryService
```

Infra ports:

```text
UnitOfWork
Clock
IdGenerator
PasswordHasher
TokenSigner
PaymentGateway
ObjectStoragePort
MailPort
JobDispatcherPort cuando exista
```

---

## 41. Repository rules

Un repository:

- recibe/devuelve entidades/aggregates del dominio;
- no devuelve Prisma models a controllers;
- no decide autorización HTTP;
- puede ofrecer métodos de lock explícitos para casos críticos;
- no contiene reglas comerciales que pertenezcan a policy.

Ejemplos:

```text
EventRepository.lockById(eventId, tx)
EventTableRepository.lockManySorted(ids, tx)
PaymentSubmissionRepository.lockById(id, tx)
RefundRepository.sumConfirmedForScope(..., tx)
```

---

## 42. Commands / use cases principales

### Identity

```text
ResolveEventAccess
RegisterGraduate
Login
RefreshSession
Logout
RequestPasswordReset
ConfirmPasswordReset
CreateAdminAccount
DisableAdminAccount
```

### Events/Catalog

```text
CreateEvent
UpdateEventConfiguration
PublishFinancialConfigurationVersion
TransitionEvent
RotateEventAccessCode
CreateEventProduct
UpdateEventProduct
ConfigureFinancialMilestones
```

### Memberships/Contracts

```text
CreateMembership
AcceptContract
AddGroupMember
UpdateGroupMember
QuoteContractLineItem
ConfirmContractLineItem
ReducePlaces
CreateInternalNote
```

### Finance/Payments

```text
GetPaymentPlan
CreatePaymentAttempt
ProcessProviderEvent
CreatePaymentSubmission
ApprovePaymentSubmission
RejectPaymentSubmission
CreateManualPayment
CreateAdjustment
ApplyLatePenalty
QuoteMembershipCancellation
CancelMembership
RequestRefund
ProcessRefundResult
```

### Seating

```text
CreateSeatingMap
SetSeatingBackground
CreateTable
BulkCreateTables
ImportDetectedTables
UpdateTable
DeleteTable
AssignTableMembers
```

### Meals

```text
CreateMealOption
UpdateMealOption
SelectMeal
AdminOverrideMeal
```

### Thermos

```text
RequestThermo
UpdateThermoPersonalization
StartThermoProduction
DeliverThermo
```

### Reports

```text
GetFinancialReport
GetPortfolioReport
GetCashCut
CreateExport
GetExportStatus
```

---

## 43. Transaction boundaries críticas

### 43.1 AcceptContract

```text
lock contract
→ verificar PENDING_ACCEPTANCE + ownership
→ revalidar version/policy
→ persist snapshot/hash/acceptance
→ audit
→ commit
```

Idempotency required.

### 43.2 ConfirmContractLineItem

```text
lock quote
→ lock event
→ lock membership
→ lock contract
→ lock payment plan
→ revalidar quote
→ revalidar deadline/product/capacity/financial condition
→ append line item
→ increase active_places cuando corresponda
→ actualizar obligaciones/catch-up de forma explícita
→ mark quote USED
→ audit
→ commit
```

No confirmar subconjunto.

### 43.3 ReducePlaces

```text
lock membership/contract/plan
→ identificar GroupMember afectados explícitamente
→ validar reducción
→ liberar TableAssignment de miembros desactivados
→ desactivar miembros
→ actualizar line item/obligaciones mediante movimientos permitidos
→ crear Adjustment/refund request si corresponde según decisión administrativa
→ audit
→ commit
```

Nunca elegir automáticamente qué persona remover sin input explícito.

### 43.4 ApprovePaymentSubmission

```text
lock submission
→ validar PENDING_REVIEW
→ lock plan/installments requeridos
→ crear PaymentTransaction
→ calcular/crear allocations
→ freeze plan si primer pago
→ mark submission APPROVED + transaction_id
→ evaluar PlaceConfirmationPolicy/eligibilidades derivadas
→ audit
→ commit
```

Max 1 transaction.

### 43.5 CreateManualPayment

```text
validate ADMIN + idempotency
→ lock plan/installments
→ create PaymentTransaction
→ allocations
→ freeze
→ effects derivados
→ audit
→ commit
```

### 43.6 ProcessProviderEvent

```text
persist/dedupe provider event
→ verify provider server-to-server
→ if not confirmed: update inbox/attempt only
→ if confirmed:
   lock attempt/plan
   unique provider transaction
   create PaymentTransaction
   allocations
   freeze
   evaluate commercial effects
   audit/system origin
→ commit
```

Si existe conflicto de capacidad comercial usar regla de §28; nunca perder la transacción confirmada.

### 43.7 AssignTableMembers

```text
resolve members + assignments
→ lock origin/destination tables sorted
→ revalidate eligibility/capacity
→ replace assignments batch
→ audit
→ commit
```

### 43.8 PublishCancellationPolicy

```text
lock policy
→ require DRAFT
→ validate all ranges
→ ensure event/version consistency
→ publish ACTIVE
→ audit
→ commit
```

### 43.9 CancelMembership

```text
lock membership
→ lock cancellation quote
→ lock contract/payment plan
→ revalidate quote
→ mark quote USED
→ cancel membership
→ release active table assignments
→ represent future obligation impact explicitly
→ preserve ledger
→ audit
→ commit
```

No confirmed refund automático.

### 43.10 Refund

```text
lock plan/refundable source
→ recompute refundable amount
→ ensure total requested/confirmed within limit
→ create/update Refund state
→ provider/manual workflow
→ audit
→ commit
```

Provider call puede requerir patrón request/pending/confirm en commits separados; nunca mantener una DB transaction abierta durante una llamada externa lenta.

### 43.11 ImportDetectedTables

```text
lock seating map/event namespace
→ validate entire batch
→ reject duplicate labels/invalid geometry/capacity
→ create all tables
→ audit import
→ commit
```

All-or-nothing.

---

## 44. Regla de llamadas externas y DB transactions

No mantener locks DB mientras se espera una llamada remota salvo necesidad excepcional documentada.

Patrón:

```text
1. persist intent/state
2. commit
3. call provider
4. persist normalized result in new transaction
```

Excepción conceptual: ningún proveedor puede decidir directamente la mutación final del ledger sin verificación backend.

---

## 45. Domain events

Son hechos internos para desacoplar side effects. No implican event sourcing ni broker.

Eventos recomendados:

```text
account.disabled
event.opened
event.closed
event.reopened
event.finalized
event.cancelled
membership.created
membership.places_confirmed
membership.places_changed
membership.cancelled
contract.accepted
contract.line_item.added
payment.plan.frozen
installment.overdue
payment.attempt.created
payment.transaction.confirmed
payment.submission.created
payment.submission.approved
payment.submission.rejected
payment.penalty.applied
membership.cancellation.quoted
payment.refund.requested
payment.refund.confirmed
table.created
table.updated
table.assignment.changed
seating.layout.updated
meal.selection.changed
financial.progress.changed
thermo.eligibility.changed
thermo.requested
thermo.production_started
thermo.delivered
```

### Emisión

- eventos de hecho solo se publican después de commit exitoso o mediante mecanismo transaccional equivalente;
- un rollback no emite hecho externo;
- handler no puede violar aggregate ownership;
- handlers deben ser idempotentes si provocan efectos persistentes;
- notificación/email fallida no revierte un pago confirmado.

---

## 46. Audit vs DomainEvent

No son equivalentes.

```text
AuditLog = evidencia durable orientada a investigación/operación
DomainEvent = señal interna para efectos derivados
```

Un command puede producir ambos.

Ejemplo:

```text
ApprovePaymentSubmission
→ AuditLog PAYMENT_SUBMISSION_APPROVED
→ DomainEvent payment.submission.approved
→ DomainEvent payment.transaction.confirmed
```

---

## 47. Datos derivados vs persistidos

| Concepto | Autoridad |
|---|---|
| `Event.capacity` | persistido |
| confirmed places total | derivado de memberships confirmadas |
| `active_places` | persistido |
| active GroupMember count | derivado |
| table capacity | persistido |
| table occupied/available | derivado |
| table FULL/PARTIAL | derivado |
| contracted line items | persistido |
| payment transaction | persistido |
| allocations | persistido |
| paid/applied/pending/overdue | derivado |
| available credit | derivado |
| financial progress | derivado |
| termo LOCKED/AVAILABLE eligibility | derivado/autorización recalculada |
| contract snapshot | persistido inmutable |
| cancellation quote | persistido snapshot |
| days_before_event | calculado server-side y snapshot en quote |
| report totals | derivados |

Nunca crear una segunda fuente manual para acelerar UI.

---

## 48. Concurrencia

### Lock ordering

Cuando se bloqueen múltiples registros del mismo tipo:

```text
sort by stable UUID/string order
```

Ejemplos:

- mesas origen/destino;
- installments;
- refund sources.

### Retry

Hasta 3 reintentos para deadlock/serialization failure recuperable conforme NFR.

No reintentar automáticamente errores de negocio.

### Operaciones P0

```text
confirm places
confirm product addition
assign/reassign table
payment confirm/allocation/freeze
approve submission
apply penalty
cancel membership
refund
```

---

## 49. Autorización como precondición

El dominio no conoce HTTP, pero los application commands reciben un `ActorContext` validado:

```text
actor_account_id
role ADMIN|GRADUATE
request_id
```

Policies verifican:

```text
ADMIN scope global de instancia
GRADUATE -> membership.account_id == actor.id
```

No confiar en `actor_account_id` enviado en DTO público; proviene de sesión.

---

## 50. Ownership de GroupMember

Para GRADUATE:

```text
actor Account
→ GraduateMembership(event)
→ GroupMember membership_id
```

Para ADMIN:

```text
role ADMIN
→ same event invariant
```

Manipular UUID no concede acceso.

---

## 51. Membership cancellation side effects

Al cancelar:

Obligatorio:

```text
membership status CANCELLED
release active TableAssignment
block ordinary GRADUATE mutations
preserve contract
preserve ledger
preserve submissions/files
preserve meal history
preserve thermo history
preserve audit
```

No obligatorio/automático:

```text
refund
hard delete
account disable
event cancellation
```

La liberación de mesa se realiza dentro del mismo commit lógico de cancelación cuando sea posible.

---

## 52. Event cancellation semantics

Cancelar `Event`:

- bloquea operación ordinaria;
- conserva memberships;
- no equivale automáticamente a cancelar individualmente cada membership;
- no crea refunds automáticos;
- no borra contratos/mesas/pagos;
- requiere motivo/audit.

Cualquier proceso masivo financiero por cancelación de evento requiere caso de uso explícito posterior; no inferirlo.

---

## 53. Product removal semantics

Un producto ya usado:

```text
NO hard delete
```

Debe desactivarse.

Line items históricos conservan nombre/precio snapshot aunque el catálogo cambie.

---

## 54. Meal history semantics

Al desactivar GroupMember:

- `MealSelection` histórica no necesita borrarse;
- los reportes operativos activos deben excluir miembros inactivos cuando corresponda;
- auditoría conserva cambios.

No reutilizar una `MealSelection` para otro GroupMember.

---

## 55. Seating history semantics

El contrato API presenta máximo una asignación activa por persona.

Historial puede conservarse mediante:

```text
AuditLog before/after
```

o modelo físico de vigencia si `DATA_MODEL` lo decide.

No es necesario agregar entidad `Seat`.

---

## 56. Thermo personalization schema

`personalization` no es JSON arbitrario.

El `ThermoConfiguration` del evento define claves permitidas y constraints.

Concepto:

```text
PersonalizationField
--------------------
key
label
type TEXT|CHOICE
required
max_length?
options[]?
```

No se agrega un constructor de formularios general; solo configuración necesaria para termo.

Persistencia exacta se cerrará en `DATA_MODEL`.

---

## 57. Validation layers

### DTO validation

Forma/sintaxis:

```text
UUID
enum
required
string length
decimal format
```

### Domain validation

Semántica:

```text
ownership
event state
deadline
capacity
financial eligibility
state transition
immutability
```

### DB constraints

Última defensa:

```text
unique
check
FK
not null
partial unique index
transaction locks
```

No sustituir una capa con otra.

---

## 58. Error semantics

El dominio lanza/retorna errores estables conceptuales, no HTTP.

Ejemplos:

```text
ContractAlreadyAccepted
ProductQuoteStale
EventCapacityExceeded
SeatingNotFinanciallyEligible
TableCapacityChanged
PaymentSubmissionAlreadyReviewed
CancellationQuoteStale
RefundExceedsAvailableAmount
```

La capa API traduce posteriormente según `ERROR_CONTRACT.md`.

No lanzar mensajes de Prisma/SDK hacia UI.

---

## 59. Estructura de código recomendada por aggregate

Ejemplo:

```text
modules/contracts/
├── api/
│   ├── contracts.controller.ts
│   └── dto/
├── application/
│   ├── accept-contract.use-case.ts
│   ├── quote-line-item.use-case.ts
│   └── confirm-line-item.use-case.ts
├── domain/
│   ├── aggregates/
│   │   ├── graduate-contract.ts
│   │   └── contract-line-item-quote.ts
│   ├── entities/
│   │   └── contract-line-item.ts
│   ├── value-objects/
│   ├── policies/
│   ├── events/
│   ├── errors/
│   └── ports/
└── infrastructure/
    └── prisma/
```

No es obligatorio crear carpetas vacías. Crear solo lo que use el módulo.

---

## 60. Forma de aggregate en TypeScript

Patrón recomendado:

```ts
class EventTable {
  private constructor(private props: EventTableProps) {}

  static create(input: CreateEventTable): Result<EventTable, DomainError> {
    // invariants
  }

  changeCapacity(newCapacity: number, occupied: number): Result<void, DomainError> {
    // no bajar de occupancy
  }

  block(): void {
    // valid state mutation
  }

  toPrimitives(): EventTablePrimitives {
    // explicit mapping
  }
}
```

No usar setters públicos para invariantes.

No acoplar aggregate a `Prisma.EventTable`.

---

## 61. Result / exceptions

Se permiten dos estilos coherentes:

```text
Result<T, DomainError>
```

o exceptions de dominio tipadas.

Elegir uno por backend y mantenerlo consistente. No mezclar errores de HTTP dentro de domain.

La decisión exacta puede cerrarse en foundation; no afecta semántica de este documento.

---

## 62. Factories

Usar factories cuando crear una entidad implique más que asignar campos.

Ejemplos:

```text
GraduateContractFactory
PaymentPlanFactory
CancellationQuoteFactory
PaymentTransactionFactory
```

Factories reciben datos ya autorizados y policies requeridas; no acceden a controllers.

---

## 63. Factories y defaults

No leer defaults globales ocultos desde una entity.

Ejemplo correcto:

```text
PaymentPlanFactory.create(membership, contract, eventFinancialConfiguration)
```

Incorrecto:

```text
PaymentPlan.create() -> lee process.env o Event singleton
```

---

## 64. Application orchestration

Application layer es responsable de:

- cargar aggregates;
- ejecutar guards/policies de scope;
- iniciar UoW;
- ordenar locks;
- llamar métodos de dominio;
- persistir;
- registrar audit;
- almacenar idempotency result;
- publicar eventos post-commit;
- mapear resultado a DTO interno.

No debe duplicar fórmulas ya encapsuladas en policies.

---

## 65. IdempotencyRecord

No es aggregate de negocio, pero todo agente debe considerar su uso en commands sensibles.

```text
scope
key
request_hash
response_status
response_body
resource_type?
resource_id?
expires_at
```

Usos mínimos:

- accept contract;
- confirm line item;
- manual payment;
- approve/reject submission;
- adjustment;
- publish policy;
- cancel membership;
- refund;
- table import;
- otros commands con riesgo de duplicación.

`DATA_MODEL` deberá incorporarlo.

---

## 66. Registration ownership edge case

Una `EventAccessCode` válida demuestra acceso al evento, **no propiedad de una Account existente**.

Si el email ya pertenece a una cuenta existente:

```text
NO crear segunda Account con mismo email
NO adjuntar membership solo por conocer email + event code
```

Se debe exigir prueba de control de la cuenta existente mediante autenticación/reautenticación o flujo seguro equivalente.

La forma HTTP exacta se cerrará en `API_ENDPOINT_MATRIX`/OpenAPI.

Esto protege multi-evento sin introducir takeover por registro contextual.

---

## 67. Aggregate invariants matrix

| Invariante | Owner principal | Ref |
|---|---|---|
| email único | Identity/DB | BR-AUTH / AC-AUTH |
| membership única account/event | Memberships/DB | BR-AUTH-002 |
| contract folio único | Contracts/DB | BR-CONTRACT-002 |
| snapshot aceptado inmutable | Contracts | BR-CONTRACT-005/006 |
| active members <= active_places | Memberships | BR-PLC-004/005 |
| confirmed places <= event capacity | EventCapacityPolicy + DB transaction | BR-PLC-001/007 |
| product quote catch-up correcto | Contracts/Finance policy | BR-PLC-011 |
| payment plan frozen tras primer pago | Finance | BR-FIN-004 |
| confirmed tx append-only | Finance | BR-FIN-007 |
| allocation <= tx amount | Finance | BR-FIN-010/011 |
| approved submission -> max 1 tx | Payments + Finance + DB | BR-PROOF-005/007 |
| provider transaction única | Payments/Finance DB | BR-PAY-006 |
| late fee única | Finance/DB | BR-LATE-006 |
| policy continua/inmutable | Finance | BR-CANPOL-* |
| refund <= refundable | Finance locks/DB | BR-REF-002 |
| one table assignment/member | Seating/DB | BR-SEAT-007/014 |
| table occupancy <= capacity | Seating locks | BR-SEAT-010/014 |
| GroupMember event == EventTable event | Seating/Membership | BR-SEAT-007 |
| meal member == option event | Meals | BR-MEAL-* |
| thermo personalization allowed | Thermos/Events | BR-THERMO-004 |
| audit append-only | Audit | BR-AUD-003 |

---

## 68. Data model reconciliation required next

`DATA_MODEL.md` v1.1 deberá revisarse contra este documento antes de marcarse `READY`.

Gaps explícitos a incorporar/evaluar:

1. `AuthSession`;
2. `EventAccessCode`;
3. `IdempotencyRecord`;
4. `EventFinancialConfiguration`;
5. `InstallmentTemplate`;
6. configuración estructurada de personalización/evidencia de termo;
7. `ContractLineItemQuote`;
8. persistencia/proyección de incidencia de reconciliación para payment-confirmed/capacity-conflict;
9. `ExportJob` si export async se habilita;
10. aclarar `Installment.status` derivado vs autoritativo;
11. aclarar `ThermoStatus LOCKED/AVAILABLE` como elegibilidad recalculada;
12. constraints/índices para todos los invariantes P0.

Ninguno de estos gaps autoriza implementar una tabla ad hoc antes del siguiente entregable.

---

## 69. API endpoint matrix derivation

Cada fila futura de `API_ENDPOINT_MATRIX.md` deberá nombrar:

```text
use_case
aggregate root(s)
domain policy
authorization rule
transaction boundary
lock strategy
idempotency
audit action
domain events
errors
```

Ejemplo conceptual:

```text
adminApprovePaymentSubmission
Aggregate: PaymentSubmission + PaymentPlan + PaymentTransaction
Policy: PaymentAllocationPolicy
Tx: single UoW
Lock: submission + plan/installments
Idempotency: REQUIRED
Audit: PAYMENT_SUBMISSION_APPROVED
Events: payment.submission.approved, payment.transaction.confirmed
```

---

## 70. Tests derivados del dominio

Todo aggregate/policy con P0 debe tener unit tests de invariantes.

### Identity

- disabled account no autentica;
- reset token un solo uso;
- refresh rotation revoca token anterior;
- event code no adjunta membership a account ajena.

### Membership/Contracts

- members no exceden places;
- folio único vía DB test;
- accepted snapshot inmutable;
- stale product quote rechazado;
- catch-up exacto.

### Finance

- allocation priority;
- remanente conservado;
- freeze;
- double provider event;
- double submission approve;
- late fee idempotente;
- cancellation formula;
- stale cancellation quote;
- concurrent refund.

### Seating

- one member/one table;
- concurrent last capacity;
- blocked table;
- capacity reduction under occupancy;
- batch rollback completo;
- imported geometry validation.

### Meals/Thermos

- cross-event meal rejection;
- deadline/override;
- thermo threshold;
- invalid personalization;
- production edit lock.

---

## 71. Anti-patterns prohibidos

```text
Prisma model como domain entity
controller -> prisma
frontend calcula saldo autoritativo
frontend calcula eligibility autoritativa
EventTable.occupied editable
PaymentPlan.paid_total editable
contract accepted PATCH genérico
PaymentSubmission APPROVED sin transaction
provider webhook -> paid sin verificación
refund borra payment
cancel membership borra history
mesa contiene seat/chair
OCR crea EventTable sin revisión/import command
GroupMember UUID enviado = ownership asumido
status setters genéricos
catch-up duplicado en frontend/backend
```

---

## 72. Regla para agentes

Antes de implementar un use case:

```text
1. localizar BR/FR/AC
2. identificar aggregate root de este documento
3. identificar policy/domain service
4. listar invariantes DM-* aplicables
5. definir locks/UoW
6. identificar hechos derivados
7. identificar idempotencia
8. identificar audit/domain events
9. revisar DATA_MODEL
10. revisar API_ENDPOINT_MATRIX/OpenAPI
11. implementar
12. ejecutar tests
```

Si el agente necesita inventar un nuevo aggregate, modificar ownership o introducir una nueva fuente de verdad:

```text
STOP esa parte
→ documentar gap/ADR según corresponda
```

No crear el modelo silenciosamente en Prisma.

---

## 73. Definition of Ready para DATA_MODEL

Este `DOMAIN_MODEL.md` queda listo como input del siguiente entregable porque define:

```text
[READY] bounded contexts
[READY] aggregate roots
[READY] entities
[READY] value objects
[READY] derived values
[READY] invariants
[READY] domain services/policies
[READY] transaction boundaries P0
[READY] concurrency principles
[READY] domain events
[READY] repository ports
[READY] cross-module ownership
[READY] explicit data-model gaps
```

`DATA_MODEL.md` no debe agregar reglas comerciales nuevas; debe expresar en PostgreSQL/Prisma lo definido aquí.

---

## 74. Regla final

La unidad de diseño no es la pantalla ni el endpoint.

Es:

```text
business invariant
+ aggregate authority
+ transactional consistency
```

La implementación correcta sigue:

```text
UI expresa intención
→ Application orquesta
→ Domain valida
→ PostgreSQL refuerza
→ Audit conserva evidencia
→ UI refleja el resultado
```

Nunca:

```text
UI decide verdad
→ controller copia DTO
→ Prisma guarda estado inválido
```
