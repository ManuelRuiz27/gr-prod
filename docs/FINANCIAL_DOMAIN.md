# Plataforma GR — Dominio Financiero

**Documento:** `FINANCIAL_DOMAIN.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.1  
**Estado:** Baseline financiero vinculante  
**Fecha:** 31 de agosto de 2026  
**Fuentes:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `UX_FLOWS.md`

---

# 1. Principio rector

La deuda pertenece a Plataforma GR, no al proveedor de pagos.

Modelo conceptual:

```text
GraduateMembership
│
├── GraduateContract
│   └── ContractLineItem[]
│
└── PaymentPlan
    ├── Installment[]
    ├── PaymentAttempt[]
    ├── PaymentSubmission[]
    ├── PaymentTransaction[]
    │   └── PaymentAllocation[]
    ├── Adjustment[]
    ├── PenaltyCharge[]
    ├── CancellationQuote[]
    └── Refund[]
```

El sistema debe separar siempre:

```text
CONTRATO
OBLIGACIÓN
INTENTO
COMPROBANTE REPORTADO
DINERO CONFIRMADO
APLICACIÓN
AJUSTE
PENALIZACIÓN
CANCELACIÓN
REEMBOLSO
```

---

# 2. Moneda y precisión

Baseline:

```text
MXN
```

Persistencia mediante `DECIMAL/NUMERIC` exacto o enteros en centavos. Nunca `float` binario.

Toda suma deberá mantener igualdad contable entre movimientos y aplicaciones.

---

# 3. GraduateContract y ContractLineItem

`GraduateContract` representa las condiciones contractuales aceptadas por una membresía.

Campos conceptuales:

```text
GraduateContract
----------------
id
folio
graduate_membership_id
terms_version
terms_snapshot_hash
cancellation_policy_version_id
accepted_at
accepted_by_account_id
accepted_ip_hash_or_value_per_nfr
status
created_at
```

`ContractLineItem` explica el total contratado.

```text
ContractLineItem
----------------
id
contract_id
product_type_id nullable
concept_code
label
quantity
unit_amount
line_total
source
status
created_at
```

Ejemplos de conceptos:

```text
BASE_PACKAGE
ADULT
CHILD
NO_DINNER
EXTRA_THERMO
LATE_FEE (si contractualmente procede como obligación posterior, no necesariamente line item original)
OTHER_AUTHORIZED
```

Reglas:

- el total contratado deberá ser explicable mediante line items vigentes + ajustes contractuales permitidos;
- no se sobrescribe una línea histórica pagada para corregirla;
- una adición posterior genera nueva línea y obligaciones relacionadas;
- el contrato conserva la versión de cancelación aplicable.

---

# 4. PaymentPlan

Representa el compromiso financiero operativo de la membresía.

```text
PaymentPlan
-----------
id
event_id
graduate_membership_id
contract_id
currency
contracted_total
financial_terms_version
is_frozen
frozen_at
grace_period_days
status
created_at
updated_at
```

Estados mínimos:

```text
ACTIVE
SETTLED
CANCELLED
```

Invariante:

```text
1 active GraduateMembership -> max 1 active PaymentPlan
```

---

# 5. Congelamiento financiero

Antes del primer pago confirmado/aplicado:

```text
is_frozen = false
```

Al confirmar/aplicar el primer pago válido:

```text
is_frozen = true
frozen_at = confirmed_at
```

Después del congelamiento, cambios de defaults del evento no alteran:

- total histórico;
- importes de obligaciones existentes;
- vencimientos ya comprometidos;
- política contractual ya vinculada.

Correcciones posteriores usan movimientos explícitos.

---

# 6. Installment

```text
Installment
-----------
id
payment_plan_id
sequence
concept_code
label
original_amount
effective_amount
due_at
grace_period_days_snapshot
status
created_at
updated_at
```

El calendario permite importes diferentes por parcialidad.

Estados conceptuales:

```text
FUTURE
UPCOMING
DUE
OVERDUE
PAID
CANCELLED
```

No es obligatorio exponer `PARTIALLY_PAID` al usuario. La cobertura parcial puede existir internamente mediante allocations.

Una obligación se considera `PAID` solo cuando la cobertura neta válida alcanza su `effective_amount`.

---

# 7. Calendario fijo y altas tardías

Los vencimientos pertenecen al evento/contrato.

Si un graduado se incorpora después de uno o más vencimientos:

- las obligaciones conservan fechas originales;
- el estado se calcula contra fecha + gracia;
- no se desplaza automáticamente el calendario.

---

# 8. Pago inicial

El evento puede configurar:

```text
initial_payment_required
initial_payment_amount
initial_payment_label
```

Cuando el pago inicial constituye condición comercial de reserva:

```text
PaymentTransaction CONFIRMED
+ Allocation cubre obligación inicial
+ validación atómica de capacidad
→ lugares confirmados
→ mesa habilitable según configuración
```

El registro sin pago no equivale a confirmación comercial cuando existe obligación inicial requerida.

---

# 9. Milestones financieros

El evento puede definir hitos configurables:

```text
FinancialMilestone
------------------
required_progress_percent
required_at
purpose_code
```

Ejemplos de uso:

- alerta de mantenimiento de reserva;
- elegibilidad de operaciones;
- cálculo de catch-up para productos agregados.

Valores como 50% o 75% solo se usarán cuando estén configurados para el evento.

El incumplimiento de un milestone por sí solo no libera automáticamente mesa salvo una regla contractual explícita futura.

---

# 10. Compra adicional y catch-up

Cuando se agrega un nuevo `ContractLineItem`:

```text
new_contracted_total = previous_effective_total + new_line_total
```

Si existe un porcentaje mínimo de avance aplicable a la fecha:

```text
required_paid_after_addition = new_contracted_total * required_progress
eligible_paid = net applied eligible payments
catch_up_due = max(required_paid_after_addition - eligible_paid, 0)
```

El sistema deberá mostrar el catch-up antes de confirmar la operación.

El catch-up puede materializarse como obligación inmediata o combinación de obligaciones según la configuración del evento, pero no como importe calculado solo en frontend.

---

# 11. PaymentAttempt

Representa un intento de cobro electrónico.

```text
PaymentAttempt
--------------
id
payment_plan_id
graduate_membership_id
provider
provider_preference_id
requested_amount
currency
status
idempotency_key
created_at
expires_at
updated_at
```

Estados:

```text
CREATED
REDIRECTED
PENDING
CONFIRMED
FAILED
EXPIRED
CANCELLED
```

Crear un intento no cambia saldo, lugares, mesa ni termo.

---

# 12. PaymentSubmission — comprobante reportado

Representa una declaración de GRADUATE de que realizó una transferencia/depósito fuera de la pasarela.

```text
PaymentSubmission
-----------------
id
payment_plan_id
graduate_membership_id
method                TRANSFER | DEPOSIT
reported_amount
reported_paid_at
reference
notes
evidence_file_id
status
reviewed_by_account_id
reviewed_at
review_reason
payment_transaction_id nullable
created_at
updated_at
```

Estados:

```text
PENDING_REVIEW
APPROVED
REJECTED
CANCELLED
```

Reglas:

- `PENDING_REVIEW` no altera ningún saldo;
- `APPROVED` puede relacionar exactamente una transacción confirmada;
- `REJECTED` requiere motivo;
- aprobación repetida debe ser idempotente;
- el importe reportado no obliga al ADMIN a alterar contabilidad si el comprobante no corresponde;
- el backend determina la allocation final.

---

# 13. PaymentTransaction

Movimiento monetario confirmado.

Fuentes:

```text
MERCADO_PAGO
OPENPAY
CASH
TRANSFER
DEPOSIT
```

Modelo:

```text
PaymentTransaction
------------------
id
payment_plan_id
graduate_membership_id
source
provider nullable
provider_transaction_id nullable
payment_submission_id nullable
amount
currency
status
confirmed_at
registered_at
created_by_account_id nullable
reference
notes
evidence_file_id nullable
created_at
```

Estados de cobro:

```text
CONFIRMED
REVERSED
```

Transacción confirmada es inmutable.

Unicidad externa:

```text
UNIQUE(source/provider, provider_transaction_id)
```

cuando exista identificador externo.

Para submission aprobado:

```text
UNIQUE(payment_submission_id)
```

cuando no sea null.

---

# 14. PaymentAllocation

Representa cuánto dinero confirmado cubre una obligación.

```text
PaymentAllocation
-----------------
id
payment_transaction_id
installment_id
amount
created_at
```

Invariantes:

```text
SUM(allocations per transaction) <= transaction.amount
```

La cobertura neta de una obligación no puede inflar su estado `PAID` por encima de su importe efectivo.

---

# 15. Algoritmo estándar de aplicación

Por defecto:

```text
1. Obtener obligaciones activas.
2. Ordenar por exigibilidad/vencimiento ascendente y secuencia.
3. Cubrir primero la obligación exigible más antigua.
4. Continuar a la siguiente mientras exista saldo.
5. Conservar cualquier remanente como allocation/crédito trazable.
6. No marcar PAID hasta cobertura completa.
```

Una operación administrativa explícita puede modificar el destino permitido, pero nunca romper invariantes.

---

# 16. Crédito no aplicado

```text
available_credit = confirmed collections - allocated amount - applicable reversals/refunds
```

Ningún remanente se descarta.

Debe permanecer visible en cálculos internos y, cuando corresponda, en el expediente.

---

# 17. Pagos manuales ADMIN

ADMIN puede registrar:

```text
CASH
TRANSFER
DEPOSIT
```

Datos mínimos:

- membresía/evento;
- concepto/intención;
- importe;
- fecha;
- método;
- actor;
- referencia/nota/evidencia cuando aplique.

Tras confirmación produce `PaymentTransaction` y allocations mediante el mismo motor contable.

Debe usar idempotencia para doble clic/retry.

---

# 18. Mercado Pago

Flujo:

```text
GRADUATE selecciona pago
→ backend calcula importe válido
→ crea PaymentAttempt
→ crea preferencia Checkout Pro
→ redirect
→ proveedor procesa
→ webhook/notificación
→ backend verifica server-to-server
→ deduplica evento/transacción
→ crea PaymentTransaction
→ crea allocations
→ congela plan si aplica
→ actualiza lugares/eligibilidad derivada
→ frontend consulta estado
```

Return URL no confirma.

---

# 19. OpenPay

Proveedor alternativo.

Debe conservar el mismo dominio:

```text
PaymentAttempt
→ PaymentTransaction
→ PaymentAllocation
```

La verificación/autenticación de webhooks sigue contrato oficial vigente del proveedor.

---

# 20. Vencimiento ordinario

Una obligación está `OVERDUE` cuando:

```text
now > due_at + grace_period
AND remaining_amount > 0
```

El estado vencido por sí mismo no crea un cargo, salvo regla de penalización tardía configurada.

---

# 21. PenaltyCharge

La penalización tardía es un cargo independiente.

Configuración del evento:

```text
liquidation_due_at
late_grace_days
late_fee_amount
late_fee_enabled
```

Modelo conceptual:

```text
PenaltyCharge
-------------
id
payment_plan_id
graduate_membership_id
rule_code
amount
currency
effective_at
status
source_event_idempotency_key
related_installment_id nullable
created_at
```

Estados:

```text
PENDING
APPLIED
CANCELLED
```

Al aplicarse deberá materializar el saldo exigible de forma trazable, por ejemplo mediante obligación/cargo vinculado.

Nunca modifica una mensualidad histórica.

Idempotencia:

```text
UNIQUE(membership/plan + rule_code + effective period)
```

o equivalente.

---

# 22. Cancelación automática por mora

Configuración opcional:

```text
auto_cancel_enabled
auto_cancel_after_late_fee_days / explicit condition
```

Proceso:

```text
job durable
→ recalcula condición
→ verifica membership ACTIVE
→ verifica que deuda aplicable siga incumplida
→ crea motivo de sistema
→ ejecuta cancelación transaccional
→ libera asignaciones operativas
→ conserva contrato/finanzas
→ audita
```

No crea refund automáticamente.

Debe ser idempotente.

---

# 23. CancellationPolicy y rangos

```text
CancellationPolicy
------------------
id
event_id
version
status DRAFT|ACTIVE|ARCHIVED
created_by_account_id
published_at
created_at
```

```text
CancellationPolicyRange
-----------------------
id
policy_id
days_before_min
days_before_max nullable
penalty_percent
sort_order
```

Reglas de publicación:

```text
0 <= penalty_percent <= 100
days_before_min >= 0
sin traslapes
sin huecos
cobertura desde día 0
último rango abierto o cobertura final explícita
```

Una política `ACTIVE` publicada no se edita. Una modificación produce nueva versión.

Los contratos aceptados siguen apuntando a su versión original.

---

# 24. Cálculo de cancelación

El backend calcula:

```text
days_before_event
→ obtiene policy version del contrato
→ selecciona rango aplicable
→ penalty_percent
```

Fórmula baseline:

```text
penalty_amount = effective_contracted_total * penalty_percent
retained_amount = max(penalty_amount, non_refundable_minimum)
refund_due = max(eligible_paid - retained_amount, 0)
remaining_due = max(retained_amount - eligible_paid, 0)
```

Donde:

- `effective_contracted_total` incluye line items/ajustes contractuales aplicables a la cancelación;
- `eligible_paid` son cobros netos elegibles, descontando refunds/reversos ya confirmados;
- `non_refundable_minimum` es 0 salvo cláusula contractual explícita.

No sumar el pago inicial sobre la penalización porcentual de forma implícita.

---

# 25. CancellationQuote

Antes de una cancelación manual se crea/recalcula una cotización efímera o persistida para trazabilidad.

```text
CancellationQuote
-----------------
id
graduate_membership_id
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
expires_at/status
```

La confirmación deberá revalidar que el quote sigue vigente y que no cambió el estado financiero relevante.

---

# 26. Cancelación confirmada

La cancelación:

- cambia la membresía a `CANCELLED`;
- conserva contrato y ledger;
- libera asignaciones operativas activas cuando corresponda;
- registra política/rango/cálculo usado;
- no elimina obligaciones/transacciones;
- puede cancelar/reducir obligaciones futuras mediante movimientos explícitos;
- no marca un reembolso como confirmado.

---

# 27. Adjustment

```text
Adjustment
----------
id
payment_plan_id
graduate_membership_id
type
amount
currency
related_installment_id nullable
related_transaction_id nullable
reason
created_by_account_id
created_at
```

Tipos conceptuales:

```text
CREDIT
DEBIT
OBLIGATION_REDUCTION
OBLIGATION_CANCELLATION
```

Append-only.

---

# 28. Refund

```text
Refund
------
id
payment_plan_id
graduate_membership_id
payment_transaction_id nullable
cancellation_quote_id nullable
amount
currency
method/provider
provider_refund_id nullable
reference nullable
evidence_file_id nullable
status
reason
created_by_account_id
created_at
confirmed_at
```

Estados:

```text
REQUESTED
PENDING
CONFIRMED
FAILED
CANCELLED
```

Un refund confirmado reduce posición neta, pero no elimina el cobro original.

Invariante:

```text
SUM(confirmed refunds) <= refundable amount
```

---

# 29. Saldos derivados

El sistema debe poder calcular:

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
```

No utilizar un único campo mutable como fuente de verdad.

---

# 30. Progreso financiero para termo/milestones

Conceptualmente:

```text
financial_progress = eligible_net_applied / eligible_total
```

`eligible_total` y qué ajustes/penalizaciones participan deben definirse por regla del evento/concepto; una penalización tardía no deberá desbloquear beneficios por sí sola salvo configuración explícita.

Para flujo ordinario, `eligible_net_applied` son pagos netos aplicados a obligaciones elegibles.

---

# 31. Concurrencia e idempotencia

Operaciones críticas:

- confirmación de pago electrónico;
- aprobación de `PaymentSubmission`;
- pago manual;
- allocation;
- freeze del plan;
- aplicación de penalty;
- cancellation quote/confirm;
- refund.

Deben ejecutarse transaccionalmente y soportar reintentos seguros.

Claves/invariantes mínimos:

```text
provider + external_event_id unique
provider/source + provider_transaction_id unique
payment_submission_id unique on confirmed transaction
administrative Idempotency-Key
late penalty logical key unique
```

---

# 32. Conciliación

Comparar:

```text
obligaciones internas
vs transacciones internas
vs proveedor
vs submissions aprobados
```

Estados conceptuales:

```text
MATCHED
PENDING_CONFIRMATION
REQUIRES_REVIEW
```

Casos de revisión:

- proveedor confirma y falta transacción interna;
- monto no coincide;
- payment submission aprobado sin transacción;
- pago manual duplicado;
- refund externo faltante;
- submission duplicado/reutilizado sospechoso.

---

# 33. Eventos de dominio recomendados

```text
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
membership.cancelled
payment.refund.requested
payment.refund.confirmed
financial.progress.changed
thermo.eligibility.changed
```

No implica event sourcing.

---

# 34. Respuestas/códigos de negocio sugeridos

```text
PAYMENT_PLAN_NOT_FOUND
PAYMENT_ALREADY_PROCESSED
PAYMENT_PENDING_CONFIRMATION
INVALID_PAYMENT_AMOUNT
INSTALLMENT_NOT_PAYABLE
FINANCIAL_PLAN_FROZEN
PAYMENT_SUBMISSION_NOT_FOUND
PAYMENT_SUBMISSION_ALREADY_REVIEWED
PAYMENT_SUBMISSION_EVIDENCE_REQUIRED
DUPLICATE_MANUAL_PAYMENT
LATE_FEE_ALREADY_APPLIED
CANCELLATION_POLICY_INVALID
CANCELLATION_POLICY_VERSION_IMMUTABLE
CANCELLATION_QUOTE_STALE
REFUND_EXCEEDS_AVAILABLE_AMOUNT
RECONCILIATION_REQUIRED
EVENT_CAPACITY_EXCEEDED
```
