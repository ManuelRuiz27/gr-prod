# FINANCIAL_DOMAIN.md

# Plataforma GR — Dominio Financiero

**Documento:** `FINANCIAL_DOMAIN.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline de dominio financiero para modelo de datos, API e implementación  
**Fecha:** 24 de agosto de 2026  
**Documentos fuente:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `UX_FLOWS.md`  
**Propósito:** Formalizar el modelo financiero de Plataforma GR y separar obligaciones, intentos de pago, transacciones confirmadas, pagos manuales, ajustes y reembolsos.

---

# 1. Propósito

El dominio financiero de Plataforma GR debe resolver de forma consistente:

- cuánto debe un graduado;
- por qué lo debe;
- cuándo vence;
- qué obligaciones ya fueron cubiertas;
- qué pagos fueron confirmados;
- por qué medio se pagó;
- qué parte de un pago se aplicó a cada obligación;
- qué correcciones se realizaron;
- qué reembolsos se emitieron;
- qué saldo permanece pendiente;
- qué saldo está vencido;
- qué transacciones requieren conciliación.

El sistema deberá mantener una separación estricta entre:

```text
OBLIGACIÓN
PAGO
APLICACIÓN
AJUSTE
REEMBOLSO
PROVEEDOR
```

La pasarela de pago no es la fuente de verdad de la deuda.

---

# 2. Principio rector

El modelo financiero base será:

```text
GraduateMembership
        │
        └── PaymentPlan
                │
                ├── Installment[]
                │
                ├── PaymentAttempt[]
                │
                ├── PaymentTransaction[]
                │
                ├── PaymentAllocation[]
                │
                ├── Adjustment[]
                │
                └── Refund[]
```

La relación simplificada solicitada:

```text
PaymentPlan
    ↓
Installment
    ↓
PaymentTransaction
```

deberá implementarse sin acoplar directamente una mensualidad a una sola transacción, porque:

- un pago puede cubrir varias mensualidades;
- una mensualidad puede recibir cobertura acumulada;
- un pago puede generar excedente;
- pueden existir ajustes o reembolsos posteriores.

Por ello se requiere una entidad de aplicación/intermediación:

```text
PaymentAllocation
```

---

# 3. Moneda

## FIN-MONEY-001

La moneda base del producto será:

```text
MXN
```

El modelo deberá conservar un campo `currency`.

En el MVP, todos los conceptos financieros del mismo plan deberán operar en una única moneda.

---

## FIN-MONEY-002

Los importes deberán persistirse usando:

- enteros en centavos;

o:

- un tipo decimal exacto soportado por la base de datos.

Nunca se utilizará `float` binario para cálculos monetarios.

---

# 4. Entidad PaymentPlan

## 4.1 Propósito

`PaymentPlan` representa el compromiso financiero vigente de una membresía de graduado dentro de un evento.

Un graduado puede participar en varios eventos y por tanto tener varios planes independientes.

---

## 4.2 Modelo conceptual

```text
PaymentPlan
-----------
id
event_id
graduate_membership_id

currency

base_amount
contracted_total

financial_terms_version
is_frozen
frozen_at

initial_payment_required
initial_payment_amount

grace_period_days

status

created_at
updated_at
```

Los nombres definitivos se fijarán en `DATA_MODEL.md`.

---

## 4.3 Invariante

Una membresía activa deberá tener como máximo un plan financiero operativo vigente:

```text
1 GraduateMembership → 1 active PaymentPlan
```

---

## 4.4 Estado del plan

Estados conceptuales mínimos:

```text
ACTIVE
SETTLED
CANCELLED
```

El plan no deberá usar estados de proveedor como:

- approved;
- rejected;
- pending.

Esos pertenecen a intentos/transacciones.

---

# 5. Congelamiento financiero

## FIN-PLAN-001 — Antes del primer pago

Antes del primer pago confirmado:

```text
payment_plan.is_frozen = false
```

El ADMIN puede regenerar o corregir condiciones según las reglas del evento.

---

## FIN-PLAN-002 — Primer pago confirmado

Cuando se confirma y aplica el primer pago financiero válido:

```text
payment_plan.is_frozen = true
payment_plan.frozen_at = confirmed_at
```

---

## FIN-PLAN-003 — Efecto del congelamiento

Después de congelarse el plan:

cambiar la configuración general del evento no debe modificar automáticamente:

- total contratado;
- número de obligaciones;
- importes;
- fechas;
- condiciones ya aplicables al graduado.

---

## FIN-PLAN-004 — Correcciones posteriores

Si un plan congelado requiere corrección, el sistema deberá utilizar movimientos explícitos y auditados.

No deberá reescribir silenciosamente la historia financiera.

---

# 6. Entidad Installment

## 6.1 Propósito

`Installment` representa una obligación financiera individual dentro del plan.

Ejemplos:

```text
Mensualidad 1
Mensualidad 2
Mensualidad 3
```

La etiqueta visible puede ser configurable, pero la obligación debe conservar identidad propia.

---

## 6.2 Modelo conceptual

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

due_date
grace_period_days_snapshot

status

created_at
updated_at
```

---

## 6.3 Orden

Cada obligación deberá tener un orden inequívoco:

```text
sequence = 1, 2, 3...
```

El sistema no debe inferir el siguiente pago únicamente contando obligaciones pagadas.

---

# 7. Estados de Installment

Los estados visibles deberán derivarse de datos financieros y tiempo.

Estados conceptuales:

```text
FUTURE
UPCOMING
DUE
OVERDUE
PAID
CANCELLED
```

No se utilizará:

```text
PARTIALLY_PAID
```

como estado comercial del MVP.

---

## 7.1 PAID

Una obligación se considera `PAID` cuando su monto efectivo ha sido completamente cubierto por aplicaciones financieras válidas.

---

## 7.2 OVERDUE

Será `OVERDUE` cuando:

```text
now > due_date + grace_period
```

y todavía exista saldo exigible.

---

## 7.3 CANCELLED

Una obligación puede quedar cancelada únicamente mediante una operación administrativa explícita compatible con política de cancelación/ajuste.

La obligación no debe eliminarse físicamente.

---

# 8. Calendario fijo

## FIN-CAL-001

Las fechas de vencimiento pertenecen al calendario del evento.

Ejemplo conceptual:

```text
Mensualidad 1 → 15 Dic 2026
Mensualidad 2 → 15 Ene 2027
Mensualidad 3 → 15 Feb 2027
Mensualidad 4 → 15 Mar 2027
Mensualidad 5 → 15 Abr 2027
```

---

## FIN-CAL-002 — Alta tardía

Si un graduado se registra el 20 de febrero de 2027:

no se deberán mover las mensualidades a:

```text
20 Feb
20 Mar
20 Abr
...
```

El plan conserva el calendario original.

---

## FIN-CAL-003 — Obligaciones ya vencidas al alta

Las obligaciones cuyo vencimiento ya ocurrió deberán generarse con su fecha original.

Su estado será calculado según:

- fecha;
- gracia;
- cobertura financiera.

---

# 9. Obligación inicial

## FIN-INIT-001

El evento podrá configurar una obligación inicial.

Ejemplos conceptuales:

```text
Abono inicial
Apartado
Primer pago
```

El nombre visible será configurable.

---

## FIN-INIT-002

El importe de la obligación inicial no será global.

Dependerá de la configuración del evento.

---

## FIN-INIT-003

Cuando exista obligación inicial requerida, la confirmación de dicha obligación es el evento financiero que confirma comercialmente los lugares.

---

## FIN-INIT-004

La confirmación del pago inicial deberá ejecutarse junto con una validación de capacidad del evento cuando esta confirmación convierta lugares solicitados en confirmados.

---

# 10. PaymentAttempt

## 10.1 Propósito

`PaymentAttempt` representa un intento de realizar un pago.

No significa que haya dinero confirmado.

---

## 10.2 Modelo conceptual

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

---

## 10.3 Estados conceptuales

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

## 10.4 Regla

Crear un `PaymentAttempt` no debe:

- incrementar `total_paid`;
- marcar una obligación como pagada;
- desbloquear el termo;
- confirmar lugares.

---

# 11. PaymentTransaction

## 11.1 Propósito

`PaymentTransaction` representa un movimiento monetario confirmado o registrado de manera válida.

Puede originarse por:

```text
MERCADO_PAGO
OPENPAY
CASH
TRANSFER
```

---

## 11.2 Modelo conceptual

```text
PaymentTransaction
------------------
id
payment_plan_id
graduate_membership_id

source
provider
provider_transaction_id

amount
currency

status

confirmed_at
registered_at

created_by_account_id
reference
notes
evidence_file_id

created_at
```

---

## 11.3 Estado conceptual

Para movimientos de cobro:

```text
CONFIRMED
REVERSED
```

Los intentos fallidos no deberán convertirse en `PaymentTransaction` confirmado.

---

## 11.4 Inmutabilidad

Una `PaymentTransaction` confirmada:

- no puede editarse;
- no puede eliminarse;
- no debe cambiar de monto;
- no debe cambiar de graduado.

Las correcciones se realizan mediante otras entidades.

---

# 12. PaymentAllocation

## 12.1 Propósito

`PaymentAllocation` representa cuánto de una transacción fue aplicado a una obligación específica.

Es necesaria para soportar:

- pagos anticipados;
- pagos que cubren varias obligaciones;
- excedentes;
- conciliación;
- reembolsos;
- ajustes.

---

## 12.2 Modelo conceptual

```text
PaymentAllocation
-----------------
id
payment_transaction_id
installment_id

amount

created_at
```

---

## 12.3 Invariante

Para una transacción:

```text
SUM(allocation.amount)
<= payment_transaction.amount
```

---

## 12.4 Invariante por obligación

Para una obligación:

```text
SUM(valid allocations)
- applicable refunds/negative adjustments
<= effective_installment_amount
```

salvo que exista crédito temporal no aplicado, que deberá quedar explícitamente representado y nunca inflar el estado `PAID`.

---

# 13. Crédito no aplicado

Cuando una transacción tenga remanente después de cubrir obligaciones completas:

```text
unapplied_credit =
transaction.amount
- allocated_amount
```

Este monto deberá permanecer trazable.

No puede perderse.

---

# 14. Algoritmo estándar de aplicación de pago

El comportamiento por defecto será:

```text
1. Obtener obligaciones activas.
2. Ordenar por:
   a. vencimiento ascendente
   b. sequence ascendente
3. Aplicar primero a la obligación exigible más antigua no cubierta.
4. Si queda saldo:
   continuar a la siguiente.
5. Si queda saldo insuficiente para liquidar la siguiente:
   registrar la aplicación/crédito.
6. No marcar la obligación siguiente como PAID hasta quedar completamente cubierta.
```

---

# 15. Ejemplo — Pago exacto

Plan:

```text
M1 $2,500 pendiente
M2 $2,500 pendiente
```

Pago:

```text
$2,500
```

Resultado:

```text
M1 → PAID
M2 → pendiente
```

---

# 16. Ejemplo — Pago anticipado

Plan:

```text
M1 $2,500 pagada
M2 $2,500 pagada
M3 $2,500 pagada
M4 $2,500 próxima
M5 $2,500 futura
```

Pago:

```text
$5,000
```

Resultado:

```text
M4 → PAID
M5 → PAID
```

---

# 17. Ejemplo — Excedente

Pendiente:

```text
M4 = $2,500
M5 = $2,500
```

Pago:

```text
$3,000
```

Resultado financiero:

```text
M4 = cubierta
$500 = crédito aplicado/no aplicado hacia M5
```

Resultado visible MVP:

```text
M4 → Pagada
M5 → Pendiente
```

No mostrar:

```text
M5 → Parcialmente pagada
```

si se mantiene la regla comercial vigente de no exponer estado parcial.

El saldo total sí debe reflejar los $500 correctamente.

---

# 18. Pago de obligación específica

La UI puede permitir al graduado seleccionar:

```text
Mensualidad 4
```

como intención de pago.

Sin embargo, el backend deberá validar:

- que la obligación pertenece al plan;
- que el monto es válido;
- si existen obligaciones anteriores exigibles;
- cómo aplicar el pago conforme a las reglas del plan.

El frontend no decide la contabilidad final.

---

# 19. Mercado Pago

## 19.1 Rol

Proveedor electrónico primario.

Modalidad:

```text
Checkout Pro
```

---

## 19.2 Flujo

```text
GRADUATE
→ selecciona obligación / pago
→ backend crea PaymentAttempt
→ backend crea preferencia Mercado Pago
→ backend devuelve init_point
→ frontend redirige
→ usuario paga en Mercado Pago
→ proveedor envía notificación
→ backend verifica
→ crea/confirma PaymentTransaction
→ aplica PaymentAllocation
→ recalcula plan
→ UI consulta estado actualizado
```

---

## 19.3 Regla de retorno

El retorno del navegador:

```text
success_url
pending_url
failure_url
```

no es evidencia financiera definitiva.

---

## 19.4 Confirmación

El backend deberá confirmar mediante:

- notificación del proveedor;
- consulta server-to-server;
- validación del identificador recibido.

---

## 19.5 Idempotencia

Debe existir unicidad lógica sobre:

```text
provider + provider_transaction_id
```

La misma transacción no puede producir dos `PaymentTransaction`.

---

## 19.6 Intentos duplicados

El sistema podrá tener varios `PaymentAttempt` para una misma obligación.

Solo las transacciones realmente confirmadas producirán efecto financiero.

---

# 20. OpenPay

## 20.1 Rol

Proveedor secundario.

---

## 20.2 Regla de independencia

OpenPay deberá producir el mismo resultado de dominio:

```text
PaymentTransaction
+ PaymentAllocation
```

que Mercado Pago.

La estructura de obligaciones no debe depender del proveedor.

---

## 20.3 Integración

El flujo técnico específico deberá documentarse en `API_CONTRACTS.md`.

No deberán reutilizarse mecanismos de webhook no compatibles con la documentación oficial del proveedor.

---

# 21. Pago manual — Efectivo

## FIN-MAN-001

Solo ADMIN puede registrar:

```text
source = CASH
```

---

## FIN-MAN-002

Campos mínimos:

- graduado;
- evento;
- concepto/obligación;
- monto;
- fecha;
- ADMIN responsable.

---

## FIN-MAN-003

Después de confirmarse:

```text
PaymentTransaction(source=CASH)
```

se aplicará mediante el mismo motor `PaymentAllocation`.

---

# 22. Pago manual — Transferencia

## FIN-MAN-004

Solo ADMIN puede registrar:

```text
source = TRANSFER
```

---

## FIN-MAN-005

Debe permitir capturar:

- referencia;
- nota;
- evidencia.

La evidencia podrá ser opcional o requerida por configuración/política futura.

---

## FIN-MAN-006

Una transferencia registrada y aceptada por ADMIN produce una `PaymentTransaction` confirmada.

El graduado no puede auto-confirmar un comprobante.

---

# 23. Evidencias

Archivos de evidencia no deberán persistirse dentro del registro financiero como blob principal.

El dominio deberá conservar una referencia:

```text
evidence_file_id
```

o equivalente.

La política exacta de almacenamiento y retención será definida en requisitos técnicos.

---

# 24. Ajustes

## 24.1 Propósito

Un `Adjustment` modifica el resultado financiero sin alterar una transacción original.

Ejemplos:

- corrección autorizada de saldo;
- descuento excepcional;
- cancelación parcial;
- crédito administrativo.

---

## 24.2 Modelo conceptual

```text
Adjustment
----------
id
payment_plan_id
graduate_membership_id

type
amount
currency

related_installment_id
related_transaction_id

reason

created_by_account_id
created_at
```

---

## 24.3 Tipos conceptuales

```text
CREDIT
DEBIT
OBLIGATION_REDUCTION
OBLIGATION_CANCELLATION
```

Los nombres definitivos deberán cerrarse en `DATA_MODEL.md`.

---

## 24.4 Inmutabilidad

Un ajuste confirmado deberá conservarse en el historial.

No se utilizará para reescribir transacciones antiguas.

---

# 25. Reembolsos

## 25.1 Propósito

`Refund` representa la devolución de dinero previamente cobrado.

---

## 25.2 Modelo conceptual

```text
Refund
------
id
payment_plan_id
graduate_membership_id

payment_transaction_id

amount
currency

method
provider_refund_id

status

reason

created_by_account_id
created_at
confirmed_at
```

---

## 25.3 Regla

Un reembolso no elimina el pago original.

La historia debe mostrar:

```text
Pago original
+
Reembolso
```

---

# 26. Estados de reembolso

Estados conceptuales:

```text
REQUESTED
PENDING
CONFIRMED
FAILED
CANCELLED
```

Para reembolsos manuales, el flujo podrá ser más simple, pero deberá conservar trazabilidad.

---

# 27. Reembolso electrónico

Cuando el proveedor permita ejecutar reembolso por API:

```text
ADMIN
→ registra motivo
→ backend solicita refund al proveedor
→ Refund = PENDING
→ proveedor confirma
→ Refund = CONFIRMED
→ saldos se recalculan
```

---

# 28. Reembolso manual

Si la devolución se ejecuta fuera de la pasarela:

```text
ADMIN
→ registra reembolso manual
→ método
→ monto
→ fecha
→ referencia
→ evidencia cuando aplique
```

El sistema deberá diferenciarlo de un refund procesado electrónicamente.

---

# 29. Límite de reembolso

La suma de reembolsos confirmados asociados a una transacción no deberá exceder el importe efectivamente reembolsable de dicha transacción.

---

# 30. Cancelación de graduado

Cancelar una membresía:

```text
NO implica reembolso automático
```

La política de evento determina si procede:

- sin reembolso;
- parcial;
- total;
- ajuste;
- saldo retenido.

Cuando corresponda, se generarán movimientos separados.

---

# 31. Reducción de lugares

## Antes del congelamiento

El plan puede regenerarse conforme a la nueva cantidad autorizada.

---

## Después del congelamiento

No se deben editar destructivamente:

- obligaciones pagadas;
- transacciones;
- historia.

El impacto deberá modelarse con:

- ajuste;
- cancelación de obligaciones futuras;
- reembolso;

según política.

---

# 32. Saldos calculados

El dominio deberá poder calcular en cualquier momento:

```text
contracted_total
paid_total
refunded_total
adjustment_net
outstanding_total
overdue_total
available_credit
```

---

# 33. Total pagado

Definición conceptual:

```text
paid_total =
confirmed collections
- confirmed refunds
+/- applicable adjustments
```

La fórmula exacta deberá separar correctamente:

- dinero recibido;
- saldo contractual;
- crédito;
- devoluciones.

No se deberá usar un único campo mutable como fuente de verdad.

---

# 34. Saldo pendiente

Conceptualmente:

```text
outstanding_total =
effective_obligations
- net_applied_value
```

Debe derivarse del ledger y aplicaciones.

---

# 35. Saldo vencido

```text
overdue_total =
SUM(
  remaining_amount
  for installments
  where due_date + grace < now
)
```

---

# 36. Progreso financiero para termo

La métrica deberá derivarse del plan.

Modelo conceptual:

```text
financial_progress =
eligible_net_paid / eligible_total
```

Debe permanecer consistente aunque existan:

- pagos adelantados;
- ajustes;
- reembolsos.

---

## 36.1 TBD financiero

La definición exacta de `eligible_net_paid` deberá cerrarse antes de implementar casos especiales de:

- créditos administrativos;
- reembolsos parciales;
- cancelaciones parciales.

Para el flujo ordinario:

```text
eligible_net_paid = pagos netos aplicados
```

---

# 37. Reserva de lugares y pago inicial

Cuando exista obligación inicial:

```text
PaymentTransaction confirmed
→ Allocation covers required initial obligation
→ validate event capacity
→ confirm places
```

La confirmación de lugares y la aplicación financiera deberán diseñarse para no dejar estados inconsistentes.

---

# 38. Condición de carrera en pago inicial

Escenario:

```text
Evento tiene 5 lugares restantes.

Graduado A solicita 5.
Graduado B solicita 5.

Ambos pagan casi simultáneamente.
```

El backend debe impedir:

```text
confirmed_places > event.capacity
```

La estrategia exacta deberá definirse mediante transacción/lock/serialización en arquitectura.

---

# 39. Idempotencia

## FIN-IDEMP-001 — Mercado Pago/OpenPay

La clave primaria de idempotencia externa debe considerar al menos:

```text
provider
provider_transaction_id
```

---

## FIN-IDEMP-002 — Operaciones manuales

Registrar un pago manual deberá soportar un `idempotency_key` o mecanismo equivalente para evitar duplicados por doble clic/reintento.

---

## FIN-IDEMP-003 — Ajustes/reembolsos

Operaciones administrativas sensibles deberán soportar protección equivalente contra reintentos.

---

# 40. Conciliación

## 40.1 Objetivo

Comparar:

```text
obligaciones internas
vs
transacciones internas
vs
transacciones del proveedor
```

---

## 40.2 Estados conceptuales

```text
MATCHED
PENDING_CONFIRMATION
REQUIRES_REVIEW
```

---

## 40.3 Casos de revisión

Ejemplos:

- proveedor confirma pero no existe transacción interna;
- transacción interna está pendiente demasiado tiempo;
- monto del proveedor no coincide;
- pago manual duplicado;
- refund externo no reflejado internamente.

---

# 41. Ledger financiero

El sistema deberá comportarse conceptualmente como un ledger append-only.

Movimientos que alteran posición financiera:

```text
PaymentTransaction
Adjustment
Refund
PaymentAllocation
```

No se deberá depender de editar valores históricos.

---

# 42. Reglas de borrado

No se permitirá hard-delete operativo de:

- PaymentPlan congelado;
- Installment con historia;
- PaymentTransaction confirmada;
- PaymentAllocation confirmada;
- Adjustment;
- Refund.

Cuando sea necesario ocultar/cancelar una entidad, se utilizarán estados o movimientos compensatorios.

---

# 43. Auditoría financiera

Toda operación ADMIN deberá registrar:

- actor;
- fecha/hora;
- graduado;
- evento;
- tipo de operación;
- importe;
- motivo cuando aplique;
- referencia a entidad financiera.

Obligatorias:

- pago manual;
- ajuste;
- reembolso;
- cancelación con impacto financiero;
- reducción de lugares con impacto;
- corrección de plan permitida.

---

# 44. Permisos

## GRADUATE

Puede:

- consultar su plan;
- consultar sus obligaciones;
- consultar sus pagos;
- iniciar pago electrónico propio.

No puede:

- crear PaymentTransaction manual;
- confirmar un pago;
- crear Adjustment;
- crear Refund;
- cambiar montos;
- editar obligaciones.

---

## ADMIN

Puede:

- consultar todos los planes;
- registrar pagos manuales;
- registrar ajustes;
- registrar reembolsos;
- consultar conciliación.

No puede:

- editar destructivamente una transacción confirmada;
- eludir invariantes contables.

---

# 45. Eventos financieros de dominio

Eventos conceptuales recomendados:

```text
payment.plan.created
payment.plan.frozen

installment.created
installment.paid
installment.overdue

payment.attempt.created
payment.attempt.pending
payment.attempt.failed

payment.transaction.confirmed

payment.manual.registered

payment.adjustment.created
payment.refund.requested
payment.refund.confirmed

payment.reconciled

graduate.financial_progress.changed
thermo.eligibility.changed
```

No implica adoptar arquitectura event-sourcing.

Son eventos conceptuales útiles para integración/notificaciones.

---

# 46. Notificaciones derivadas

Podrán generarse notificaciones cuando:

- un pago se confirme;
- un pago quede pendiente;
- un pago falle;
- una obligación se aproxime a vencimiento;
- una obligación quede vencida;
- el avance financiero alcance el umbral del termo.

---

# 47. Estado visible después de pagar

## Confirmando

```text
Estamos confirmando tu pago
```

Corresponde a:

```text
PaymentAttempt = PENDING
```

No a `PaymentTransaction` confirmada.

---

## Confirmado

```text
Pago confirmado
```

Solo cuando exista una `PaymentTransaction` confirmada y aplicada.

---

## Fallido

```text
No pudimos completar el pago
```

No genera movimiento financiero confirmado.

---

# 48. Respuestas de negocio recomendadas

Los contratos API deberán contemplar códigos internos equivalentes a:

```text
PAYMENT_ATTEMPT_NOT_FOUND
PAYMENT_ALREADY_PROCESSED
PAYMENT_PENDING_CONFIRMATION
PROVIDER_TRANSACTION_MISMATCH
INVALID_PAYMENT_AMOUNT
INSTALLMENT_NOT_PAYABLE
FINANCIAL_PLAN_FROZEN
REFUND_EXCEEDS_AVAILABLE_AMOUNT
DUPLICATE_MANUAL_PAYMENT
RECONCILIATION_REQUIRED
EVENT_CAPACITY_EXCEEDED
```

---

# 49. Contratos conceptuales — Lectura del plan

```http
GET /me/events/{eventId}/payment-plan
```

Respuesta conceptual:

```json
{
  "plan_id": "plan_123",
  "currency": "MXN",
  "contracted_total": 12500,
  "paid_total": 7500,
  "pending_total": 5000,
  "overdue_total": 0,
  "progress_percentage": 60,
  "installments": [
    {
      "id": "ins_1",
      "sequence": 1,
      "label": "Mensualidad 1",
      "amount": 2500,
      "status": "PAID"
    }
  ]
}
```

Los importes reales en API deberán seguir la estrategia monetaria definida.

---

# 50. Contrato conceptual — Crear intento Mercado Pago

```http
POST /me/events/{eventId}/payments/attempts
```

Body conceptual:

```json
{
  "installment_id": "ins_4"
}
```

El frontend no deberá ser fuente definitiva de:

```text
amount
currency
graduate_id
```

---

# 51. Contrato conceptual — Respuesta del intento

```json
{
  "payment_attempt_id": "attempt_123",
  "provider": "MERCADO_PAGO",
  "status": "CREATED",
  "checkout_url": "https://..."
}
```

---

# 52. Contrato conceptual — Registrar pago manual

```http
POST /admin/events/{eventId}/graduates/{graduateId}/payments/manual
```

Body:

```json
{
  "installment_id": "ins_4",
  "method": "TRANSFER",
  "amount": 2500,
  "paid_at": "2027-03-10",
  "reference": "SPEI-123",
  "notes": "Pago validado",
  "evidence_file_id": "file_123"
}
```

---

# 53. Contrato conceptual — Ajuste

```http
POST /admin/payment-plans/{planId}/adjustments
```

Body:

```json
{
  "type": "CREDIT",
  "amount": 500,
  "reason": "Ajuste autorizado"
}
```

---

# 54. Contrato conceptual — Reembolso

```http
POST /admin/payment-transactions/{transactionId}/refunds
```

Body:

```json
{
  "amount": 2500,
  "reason": "Cancelación autorizada"
}
```

Los contratos finales se definirán en `API_CONTRACTS.md`.

---

# 55. Constraints de base de datos recomendados

Deberán evaluarse, como mínimo:

```text
UNIQUE(provider, provider_transaction_id)

UNIQUE(payment_plan_id, installment.sequence)

CHECK(amount > 0)

CHECK(allocation.amount > 0)

CHECK(refund.amount > 0)
```

Y constraints adicionales para evitar duplicados lógicos.

---

# 56. Transacciones de base de datos críticas

Deberán ejecutarse de manera atómica:

## Pago confirmado

```text
1. validar transacción externa
2. crear/obtener PaymentTransaction
3. aplicar allocations
4. actualizar/derivar estados
5. congelar plan si es primer pago
6. validar/confirmar lugares si aplica
7. emitir auditoría/eventos
```

---

## Pago manual

```text
1. validar autorización
2. validar plan
3. validar idempotencia
4. crear PaymentTransaction
5. aplicar allocations
6. congelar plan si corresponde
7. auditar
```

---

## Reembolso

```text
1. validar monto reembolsable
2. crear Refund
3. ejecutar proveedor si aplica
4. confirmar
5. recalcular cobertura/saldos
6. auditar
```

---

# 57. Casos de prueba obligatorios

## FIN-TEST-001

Pago exacto de una mensualidad.

## FIN-TEST-002

Pago adelantado de dos mensualidades.

## FIN-TEST-003

Pago con excedente.

## FIN-TEST-004

Pago con remanente inferior a la siguiente mensualidad.

## FIN-TEST-005

Alta tardía con mensualidades vencidas.

## FIN-TEST-006

Cambio de configuración después del primer pago no modifica plan congelado.

## FIN-TEST-007

Webhook duplicado no duplica pago.

## FIN-TEST-008

Dos PaymentAttempt no generan dos cargos internos si solo una transacción fue confirmada.

## FIN-TEST-009

Pago manual por efectivo.

## FIN-TEST-010

Pago manual por transferencia con evidencia.

## FIN-TEST-011

Doble clic en pago manual no duplica movimiento.

## FIN-TEST-012

Ajuste conserva pago original.

## FIN-TEST-013

Reembolso conserva pago original.

## FIN-TEST-014

Refund no puede superar importe reembolsable.

## FIN-TEST-015

Pago confirmado actualiza progreso del termo.

## FIN-TEST-016

Reembolso reduce correctamente el progreso financiero cuando corresponda.

## FIN-TEST-017

Cancelación de graduado no elimina pagos.

## FIN-TEST-018

Cambio de lugares después del congelamiento no reescribe pagos previos.

## FIN-TEST-019

Proveedor confirma pago y el sistema lo reconcilia tras reintento.

## FIN-TEST-020

Un GRADUATE no puede registrar pago manual.

---

# 58. Invariantes financieros

## FIN-INV-001

```text
confirmed provider transaction is unique
```

---

## FIN-INV-002

```text
confirmed PaymentTransaction is immutable
```

---

## FIN-INV-003

```text
SUM(allocations for transaction)
<= transaction.amount
```

---

## FIN-INV-004

```text
refund_total
<= refundable_transaction_amount
```

---

## FIN-INV-005

```text
frozen plan
does not mutate from event default changes
```

---

## FIN-INV-006

```text
no confirmed money is lost
```

Todo importe confirmado debe estar:

- aplicado;
- como crédito;
- ajustado;
- o reembolsado.

---

## FIN-INV-007

```text
overdue amount is derived
```

No se establece manualmente.

---

## FIN-INV-008

```text
payment return URL != payment confirmation
```

---

## FIN-INV-009

```text
manual payment requires ADMIN
```

---

## FIN-INV-010

```text
financial correction preserves history
```

---

# 59. Decisiones cerradas

Quedan establecidas para baseline 1.0:

1. `PaymentPlan → Installment[]`.
2. `PaymentTransaction` se separa de obligación.
3. Se utilizará `PaymentAllocation` para aplicación.
4. Mercado Pago es proveedor primario.
5. Checkout Pro será el flujo principal.
6. OpenPay es proveedor secundario.
7. Return URL no confirma pago.
8. Confirmación electrónica es server-to-server.
9. Pagos manuales: efectivo y transferencia.
10. Pago confirmado es inmutable.
11. Ajustes y reembolsos son movimientos independientes.
12. No hay recargos automáticos.
13. El calendario de vencimientos es fijo.
14. El plan se congela después del primer pago confirmado.
15. Se permiten pagos anticipados.
16. Los excedentes no se pierden.
17. Una mensualidad no expone estado comercial parcial en MVP.
18. Cancelar graduado no reembolsa automáticamente.
19. Ledger y conciliación son append-only en espíritu.
20. Idempotencia es obligatoria en cobros electrónicos y operaciones financieras sensibles.

---

# 60. TBD técnicos pendientes

No deben inventarse durante implementación.

Pendientes:

1. representación exacta de moneda en API:
   - centavos enteros;
   - decimal serializado.
2. política exacta de expiración de `PaymentAttempt`.
3. tiempo máximo antes de clasificar un intento como expirado.
4. duración de polling de confirmación.
5. estrategia exacta de reintento de webhooks.
6. ventana de deduplicación para pagos manuales.
7. tipos finales de Adjustment.
8. política de evidencia obligatoria por método.
9. operación exacta de refund en OpenPay.
10. definición contable final de progreso de termo después de refunds/credits excepcionales.
11. política de retención financiera/documental.
12. reglas de timezone para `confirmed_at`, `paid_at`, `due_date`.
13. si el ADMIN podrá elegir una obligación distinta al orden estándar de aplicación.
14. tratamiento visual de `available_credit`.

Estos puntos deberán cerrarse en `API_CONTRACTS.md`, `DATA_MODEL.md` y `NON_FUNCTIONAL_REQUIREMENTS.md` según corresponda.

---

# 61. Fuera de alcance financiero

No forman parte del MVP:

- facturación electrónica;
- CFDI;
- IVA/desglose fiscal;
- intereses;
- recargos automáticos;
- cobranza judicial;
- financiamiento externo;
- meses sin intereses administrados por GR;
- split payments entre empresas;
- marketplace;
- wallet del graduado;
- saldo transferible entre graduados;
- criptomonedas;
- pagos recurrentes automáticos de tarjeta;
- domiciliación bancaria;
- edición destructiva del ledger.

---

# 62. Documentos siguientes

Este documento deberá utilizarse como fuente directa para:

1. `SEATING_MAP.md`
2. `DATA_MODEL.md`
3. `API_CONTRACTS.md`
4. `NON_FUNCTIONAL_REQUIREMENTS.md`
5. `ACCEPTANCE_CRITERIA.md`
6. `ROADMAP_IMPLEMENTATION.md`

Especialmente:

```text
DATA_MODEL.md
```

deberá convertir estas entidades conceptuales en relaciones y constraints concretos.

Y:

```text
API_CONTRACTS.md
```

deberá especificar idempotencia, webhooks, payloads y errores.

---

# 63. Baseline

Con esta versión se establece:

```text
FINANCIAL_DOMAIN_VERSION = 1.0
```

El dominio financiero queda congelado como baseline de diseño hasta que un Change Request aprobado modifique explícitamente alguna regla económica o de proveedor.
