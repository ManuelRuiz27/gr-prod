# Plataforma GR — Reglas de Negocio

**Documento:** `BUSINESS_RULES.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.1  
**Estado:** Baseline normativo aprobado  
**Fecha:** 31 de agosto de 2026  
**Documento padre:** `PRODUCT_SCOPE.md`

---

# 1. Autoridad y convenciones

Las reglas usan el formato:

```text
BR-[DOMINIO]-[NÚMERO]
```

Niveles:

- **MUST**: obligatorio.
- **SHOULD**: esperado salvo justificación documentada.
- **MAY**: permitido.

Cuando exista discrepancia, el backend es autoridad definitiva para autorización, capacidad, deadlines, saldos, pagos, contratos y transiciones.

---

# 2. Reglas globales

## BR-GEN-001 — Single-tenant
**MUST.** Plataforma GR opera para una sola empresa y no utiliza tenants/organizaciones como dominio de negocio.

## BR-GEN-002 — Roles permitidos
**MUST.** Los únicos roles son `ADMIN` y `GRADUATE`.

## BR-GEN-003 — Administradores equivalentes
**MUST.** Puede haber múltiples ADMIN; todos poseen el mismo rol lógico.

## BR-GEN-004 — Aislamiento por evento
**MUST.** Todo recurso operativo deberá estar inequívocamente vinculado al evento/membresía correspondiente.

## BR-GEN-005 — No hardcodear datos demo
**MUST.** Precios, porcentajes, fechas, nombres de platillos, montos de penalización y rangos de cancelación usados en ejemplos no son constantes globales.

## BR-GEN-006 — Historia no destructiva
**MUST.** Contratos aceptados, pagos confirmados, reembolsos, cancelaciones y auditoría no se eliminan para corregir una operación.

---

# 3. Identidad y membresía

## BR-AUTH-001 — Registro contextual
**MUST.** GRADUATE solo puede registrarse mediante un mecanismo válido asociado a un evento.

## BR-AUTH-002 — Cuenta multi-evento
**MUST.** Una cuenta GRADUATE puede participar en varios eventos mediante membresías independientes.

## BR-AUTH-003 — Ownership
**MUST.** El backend verifica que la cuenta autenticada posee la membresía del evento solicitado; un `event_id` recibido no concede acceso.

## BR-AUTH-004 — Rol no seleccionable
**MUST.** El frontend nunca determina el rol.

## BR-AUTH-005 — Recuperación segura
**MUST.** Password reset utiliza token temporal, expirable, invalidable y de un solo uso.

## BR-AUTH-006 — Múltiples dispositivos
**MAY.** GRADUATE puede mantener sesiones válidas en más de un dispositivo.

---

# 4. Ciclo de vida del evento

Estados:

```text
DRAFT
OPEN
CLOSED
FINALIZED
CANCELLED
```

## BR-EVT-001 — Estado inicial
**MUST.** Todo evento inicia `DRAFT`.

## BR-EVT-002 — DRAFT
**MUST.** No acepta operación financiera real de GRADUATE.

## BR-EVT-003 — OPEN
**MUST.** Es el estado de operación ordinaria.

## BR-EVT-004 — CLOSED
**MUST.** Bloquea mutaciones ordinarias de GRADUATE; ADMIN puede reabrir.

## BR-EVT-005 — FINALIZED
**MUST.** Conserva históricos y permite correcciones financieras administrativas no destructivas.

## BR-EVT-006 — CANCELLED
**MUST.** Bloquea operación ordinaria sin borrar registros.

## BR-EVT-007 — Transiciones auditadas
**MUST.** Toda transición registra actor, estado anterior/nuevo, timestamp y motivo cuando aplique.

## BR-EVT-008 — Deadlines configurables
**MUST.** El evento puede definir deadlines independientes para lugares/productos, cambio de mesa y platillos.

## BR-EVT-009 — Timezone
**MUST.** Deadlines y cálculo de días previos al evento usan la zona horaria configurada.

---

# 5. Contrato individual

## BR-CONTRACT-001 — Un contrato por membresía
**MUST.** Cada `GraduateMembership` tendrá un contrato vigente identificable por folio único dentro del sistema.

## BR-CONTRACT-002 — Folio único
**MUST.** El folio no puede reutilizarse para otra membresía/contrato.

## BR-CONTRACT-003 — Contenido contractual
**MUST.** El contrato conserva como mínimo identidad, evento, productos/lugares, total, términos financieros aplicables y política de cancelación aplicable.

## BR-CONTRACT-004 — Aceptación explícita
**MUST.** La aceptación requiere una acción explícita de GRADUATE y debe registrar versión de términos, fecha/hora, cuenta e información técnica permitida para evidencia/auditoría.

## BR-CONTRACT-005 — Snapshot/versionado
**MUST.** La aceptación referencia versiones inmutables o snapshots verificables de las condiciones aplicables.

## BR-CONTRACT-006 — No retroactividad
**MUST.** Cambiar defaults del evento no modifica un contrato ya aceptado ni una versión de política ya vinculada.

## BR-CONTRACT-007 — Cambios posteriores
**MUST.** Productos/lugares añadidos después de la aceptación deben quedar como line items/adendas/movimientos trazables; no se reescribe silenciosamente el contrato original.

---

# 6. Productos, lugares e integrantes

## BR-PLC-001 — Capacidad del evento
**MUST.** La suma de lugares comercialmente confirmados no excede `Event.capacity`.

## BR-PLC-002 — Catálogo por evento
**MUST.** El evento puede definir tipos de producto/lugar; baseline contempla equivalentes a `ADULT`, `CHILD` y `NO_DINNER`.

## BR-PLC-003 — Precio configurable
**MUST.** Cada tipo puede tener precio y reglas propias configuradas por evento.

## BR-PLC-004 — Integrantes nominales
**MUST.** Los lugares activos se representan mediante personas nominales cuando el flujo requiere mesa/platillo.

## BR-PLC-005 — Integrante principal
**MUST.** Cada membresía identifica al graduado titular como integrante principal.

## BR-PLC-006 — Incremento
**MUST.** Agregar productos/lugares requiere evento operativo, deadline vigente, capacidad y condiciones financieras satisfechas.

## BR-PLC-007 — Validación atómica
**MUST.** La capacidad se revalida en backend dentro de la operación que confirma el incremento.

## BR-PLC-008 — Reducción
**MUST.** Solo ADMIN confirma una reducción de lugares/productos.

## BR-PLC-009 — Reducción con plan congelado
**MUST.** Después del primer pago confirmado no se reescriben pagos u obligaciones históricas; el impacto se representa mediante ajuste, cancelación de obligaciones futuras y/o reembolso.

## BR-PLC-010 — Confirmación comercial
**MUST.** Cuando el evento requiere pago inicial, los lugares quedan comercialmente confirmados al confirmarse/aplicarse dicha obligación y verificarse capacidad.

## BR-PLC-011 — Compra adicional y catch-up
**MUST.** Si se agrega un producto cuando el plan debería llevar un porcentaje mínimo de avance, el sistema calcula el importe necesario para que el nuevo total contratado alcance dicho avance exigible.

Fórmula conceptual:

```text
required_paid_after_addition = new_contracted_total * required_progress
catch_up_due = max(required_paid_after_addition - eligible_paid, 0)
```

El `required_progress` proviene de la configuración/regla vigente del evento, no de un número hardcodeado.

---

# 7. Croquis y mesas

## BR-SEAT-001 — Croquis simple
**MUST.** Es herramienta de mesas; no CAD.

## BR-SEAT-002 — Formas MVP
**MUST.** Solo `SQUARE` y `ROUND` son formas funcionales oficiales.

## BR-SEAT-003 — Capacidad individual
**MUST.** Cada mesa tiene capacidad propia > 0.

## BR-SEAT-004 — Fondo de referencia
**MAY.** ADMIN puede usar JPG/PNG/PDF convertido a imagen sin convertirlo en fuente de verdad.

## BR-SEAT-005 — Persistencia independiente
**MUST.** Mesas/asignaciones sobreviven al reemplazo/eliminación del fondo.

## BR-SEAT-006 — Ocupación derivada
**MUST.** La ocupación se calcula desde asignaciones de personas activas.

## BR-SEAT-007 — Unidad de asignación
**MUST.** La unidad funcional es:

```text
GroupMember → EventTable
```

## BR-SEAT-008 — Sin silla individual
**MUST.** No existe selección funcional de `seat_id`, `chair_id` o `seat_number`.

## BR-SEAT-009 — Grupo distribuible
**MUST.** Personas de una misma membresía pueden estar en mesas distintas.

## BR-SEAT-010 — Disponibilidad
**MUST.** `available_capacity = table.capacity - active_member_assignments`.

## BR-SEAT-011 — Privacidad
**MUST.** GRADUATE no recibe identidad/PII de personas ajenas al consultar disponibilidad.

## BR-SEAT-012 — Desbloqueo financiero
**MUST.** La selección de mesa por GRADUATE requiere cumplir la condición financiera definida por el evento. Cuando el evento use pago inicial como confirmación, no se permite selección antes de su confirmación.

## BR-SEAT-013 — Cambio de mesa
**MUST.** GRADUATE puede cambiar su propia asignación antes del deadline y con capacidad suficiente; ADMIN puede hacerlo fuera de fecha con motivo/auditoría.

## BR-SEAT-014 — Concurrencia
**MUST.** Dos operaciones no pueden sobreasignar una mesa; solo las que validen capacidad dentro de transacción persisten.

## BR-SEAT-015 — Mesa ocupada
**MUST.** No se elimina una mesa con asignaciones activas.

## BR-SEAT-016 — Capacidad no reducible bajo ocupación
**MUST.** ADMIN no puede reducir capacidad por debajo de ocupación actual.

## BR-SEAT-017 — Bloqueo
**MUST.** Una mesa `BLOCKED` no acepta nuevas asignaciones sin borrar las existentes.

---

# 8. Platillos

## BR-MEAL-001 — Catálogo por evento
**MUST.** Las opciones pertenecen al evento y pueden activarse/desactivarse.

## BR-MEAL-002 — Selección por persona
**MUST.** Cada integrante activo puede tener una selección.

## BR-MEAL-003 — Deadline
**MUST.** Después del deadline GRADUATE queda en lectura.

## BR-MEAL-004 — Override ADMIN
**MUST.** ADMIN puede modificar después del deadline con motivo y auditoría.

## BR-MEAL-005 — Opción utilizada
**MUST.** Una opción usada no se borra destructivamente; se desactiva o migra controladamente.

---

# 9. Dominio financiero base

## BR-FIN-001 — Separación de conceptos
**MUST.** Diferenciar `PaymentPlan`, `Installment`, `PaymentAttempt`, `PaymentSubmission`, `PaymentTransaction`, `PaymentAllocation`, `Adjustment`, `PenaltyCharge` y `Refund`.

## BR-FIN-002 — Plan por membresía
**MUST.** Cada membresía tiene un plan financiero independiente.

## BR-FIN-003 — Calendario del evento
**MUST.** Los vencimientos pertenecen al calendario configurado; el alta tardía no desplaza fechas históricas.

## BR-FIN-004 — Congelamiento
**MUST.** Las condiciones financieras se congelan al primer pago confirmado/aplicado.

## BR-FIN-005 — Antes del congelamiento
**MAY.** ADMIN puede regenerar condiciones aún no comprometidas, con trazabilidad.

## BR-FIN-006 — Totales derivados
**MUST.** El sistema calcula contratado, cobrado, aplicado, pendiente, vencido, reembolsado, penalizaciones y crédito; no depende de totales manuales.

## BR-FIN-007 — Historial inmutable
**MUST.** Una transacción confirmada no se edita ni elimina.

## BR-FIN-008 — Correcciones separadas
**MUST.** Toda corrección posterior se registra como ajuste/reembolso/movimiento compensatorio.

## BR-FIN-009 — Pagos adelantados
**MUST.** Se permite cubrir obligaciones futuras.

## BR-FIN-010 — Aplicación por prioridad
**MUST.** Por defecto, el dinero se aplica primero a obligaciones exigibles más antiguas y después a futuras, salvo operación administrativa explícita permitida.

## BR-FIN-011 — Excedente trazable
**MUST.** Ningún monto confirmado se pierde; todo queda aplicado, como crédito, ajustado o reembolsado.

## BR-FIN-012 — Estado parcial
**MUST.** El ledger puede acumular cobertura parcial de una obligación, aunque la UI no necesita exponer `PARTIALLY_PAID` como estado comercial.

## BR-FIN-013 — Moneda
**MUST.** Baseline MXN y aritmética decimal exacta/centavos; nunca float binario.

---

# 10. Pago inicial y milestones

## BR-INIT-001 — Pago inicial configurable
**MUST.** Importe, obligatoriedad y etiqueta se configuran por evento.

## BR-INIT-002 — Efecto comercial
**MUST.** Cuando sea requerido, su cobertura confirma comercialmente la participación/lugares y puede desbloquear mesa.

## BR-MILE-001 — Milestones configurables
**MAY.** El evento puede definir hitos de avance financiero asociados a fechas o capacidades operativas.

Ejemplos de negocio como 50% o 75% se almacenan como configuración cuando sean requeridos; no son constantes globales.

## BR-MILE-002 — Incumplimiento
**MUST.** Un milestone incumplido genera estado/alerta operativa conforme a la política del evento. No libera automáticamente mesa ni elimina contrato salvo que exista una regla explícita aprobada que lo ordene.

---

# 11. Proveedores electrónicos

## BR-PAY-001 — Mercado Pago primario
**MUST.** El flujo principal usa Mercado Pago Checkout Pro.

## BR-PAY-002 — OpenPay alternativo
**MUST.** OpenPay permanece como proveedor secundario.

## BR-PAY-003 — Sin captura propia de tarjeta
**MUST.** Plataforma GR no captura datos completos de tarjeta en el flujo principal.

## BR-PAY-004 — Retorno no confirma
**MUST.** Return URL nunca marca por sí sola una obligación como pagada.

## BR-PAY-005 — Verificación backend
**MUST.** La confirmación financiera proviene de verificación server-to-server.

## BR-PAY-006 — Idempotencia
**MUST.** Webhooks/eventos repetidos no duplican transacciones, allocations, lugares ni efectos.

## BR-PAY-007 — Independencia
**MUST.** Cambiar proveedor no altera el dominio de obligaciones.

---

# 12. Pagos manuales y comprobantes

## BR-MAN-001 — Métodos administrativos
**MUST.** ADMIN puede registrar pagos `CASH`, `TRANSFER` y `DEPOSIT`.

## BR-MAN-002 — Datos mínimos
**MUST.** Registrar graduado/membresía, evento, importe, fecha, método, concepto y ADMIN actor; referencia/evidencia cuando aplique.

## BR-MAN-003 — Mismo motor contable
**MUST.** Un pago manual confirmado usa las mismas reglas de allocation que un pago electrónico confirmado.

## BR-PROOF-001 — Envío por GRADUATE
**MUST.** GRADUATE puede reportar una transferencia/depósito propio y adjuntar comprobante.

## BR-PROOF-002 — Submission no es transacción
**MUST.** Crear `PaymentSubmission` no incrementa pagado, no liquida obligaciones, no confirma lugares y no desbloquea termo/mesa.

## BR-PROOF-003 — Estados
**MUST.** Estados mínimos: `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `CANCELLED`.

## BR-PROOF-004 — Aprobación exclusiva ADMIN
**MUST.** Solo ADMIN puede aprobar/rechazar.

## BR-PROOF-005 — Aprobación produce movimiento
**MUST.** `APPROVED` crea/relaciona exactamente una `PaymentTransaction` confirmada y su allocation correspondiente.

## BR-PROOF-006 — Rechazo
**MUST.** `REJECTED` requiere motivo y no genera movimiento monetario confirmado.

## BR-PROOF-007 — Idempotencia
**MUST.** Repetir la aprobación no puede crear más de una transacción.

## BR-PROOF-008 — Auditoría
**MUST.** Envío, aprobación/rechazo y actor administrativo quedan trazables.

---

# 13. Vencimientos y penalización tardía

## BR-LATE-001 — Periodo de gracia ordinario
**MUST.** El evento puede definir gracia para obligaciones.

## BR-LATE-002 — Estado vencido
**MUST.** Una obligación está vencida cuando supera vencimiento + gracia y conserva saldo exigible.

## BR-LATE-003 — Penalización configurable
**MUST.** Una regla de liquidación tardía se configura por evento mediante al menos:

```text
liquidation_due_date
late_grace_days
late_fee_amount
```

## BR-LATE-004 — No hardcodear
**MUST.** Días e importe son campos administrativos. Ningún ejemplo de levantamiento se convierte en constante.

## BR-LATE-005 — Cargo independiente
**MUST.** La penalización se registra como obligación/cargo separado y auditable; no modifica el monto original de una mensualidad.

## BR-LATE-006 — Ejecución idempotente
**MUST.** El job que aplica penalización no puede generarla dos veces para la misma condición.

## BR-LATE-007 — Cancelación por mora
**MAY.** El evento puede configurar cancelación automática posterior a un periodo adicional de incumplimiento.

## BR-LATE-008 — Cancelación automática segura
**MUST.** Si se habilita, requiere condición inequívoca, ejecución idempotente, motivo de sistema y auditoría; no implica reembolso automático.

---

# 14. Política de cancelación dinámica

## BR-CANPOL-001 — Configurable por evento
**MUST.** La política se administra por evento y no se codifica como porcentajes fijos.

## BR-CANPOL-002 — Rangos
**MUST.** Cada rango define:

```text
days_before_min
days_before_max nullable
penalty_percent
```

## BR-CANPOL-003 — Validación porcentual
**MUST.** `0 <= penalty_percent <= 100`.

## BR-CANPOL-004 — Sin traslapes
**MUST.** Dos rangos activos no pueden cubrir el mismo número de días.

## BR-CANPOL-005 — Sin huecos
**MUST.** Una política publicable debe cubrir de manera continua todo el periodo aplicable desde día 0.

## BR-CANPOL-006 — Cobertura final
**MUST.** El último rango debe ser abierto (`days_before_max = null`) o cubrir explícitamente el máximo definido por negocio.

## BR-CANPOL-007 — Versionado
**MUST.** Una política publicada es inmutable. Editarla implica crear/publicar una nueva versión.

## BR-CANPOL-008 — Contrato fija versión
**MUST.** Un contrato aceptado conserva la versión de política vigente en su aceptación/actualización contractual aplicable.

## BR-CANPOL-009 — Cálculo de días
**MUST.** `days_before_event` se calcula usando la fecha efectiva de cancelación y timezone del evento; no se confía en un valor enviado por frontend.

---

# 15. Cancelación de graduado

## BR-CAN-001 — Acción ADMIN
**MUST.** La cancelación voluntaria/administrativa de una membresía se confirma por ADMIN salvo cancelación automática expresamente habilitada.

## BR-CAN-002 — Motivo
**MUST.** Toda cancelación conserva motivo y actor/origen.

## BR-CAN-003 — No borrar
**MUST.** No elimina cuenta, contrato, membresía histórica, pagos, plan, documentos ni auditoría.

## BR-CAN-004 — Bloqueo operativo
**MUST.** Una membresía cancelada no inicia nuevas operaciones ordinarias de lugares, mesas, platillos, pagos o termo.

## BR-CAN-005 — Liberación operativa
**MUST.** Libera asignaciones/capacidad activa cuando corresponda, preservando historia.

## BR-CAN-006 — Cotización previa
**MUST.** Antes de confirmar cancelación manual, el sistema calcula y muestra una `CancellationQuote` con política/version/rango aplicados, total contratado, total pagado, penalización, monto retenido, reembolso estimado y saldo adicional si existiera.

## BR-CAN-007 — Fórmula baseline
**MUST.** Salvo política futura expresamente distinta:

```text
penalty_amount = effective_contracted_total * penalty_percent
retained_amount = max(penalty_amount, non_refundable_minimum)
refund_due = max(eligible_paid - retained_amount, 0)
remaining_due = max(retained_amount - eligible_paid, 0)
```

`non_refundable_minimum` será 0 cuando no exista un concepto contractual explícitamente no reembolsable.

## BR-CAN-008 — No doble penalización implícita
**MUST.** Un pago inicial no reembolsable funciona como mínimo retenido cuando así esté configurado; no se suma automáticamente encima de la penalización porcentual salvo regla contractual explícita diferente.

## BR-CAN-009 — Cancelar no reembolsa automáticamente
**MUST.** El reembolso es un movimiento separado con su propio estado/confirmación.

---

# 16. Ajustes y reembolsos

## BR-ADJ-001 — Append-only
**MUST.** Ajustes no reescriben la transacción original.

## BR-ADJ-002 — Motivo y autoría
**MUST.** Todo ajuste/reembolso administrativo registra motivo y ADMIN.

## BR-REF-001 — Reembolso separado
**MUST.** `Refund` conserva relación con cobros previos.

## BR-REF-002 — Límite
**MUST.** La suma de reembolsos confirmados no supera el importe reembolsable.

## BR-REF-003 — Manual/electrónico
**MUST.** El sistema distingue refund procesado por proveedor de devolución ejecutada manualmente.

## BR-REF-004 — Estados
**MUST.** Estados mínimos: `REQUESTED`, `PENDING`, `CONFIRMED`, `FAILED`, `CANCELLED`.

---

# 17. Termo

Estados:

```text
LOCKED
AVAILABLE
REQUESTED
IN_PRODUCTION
DELIVERED
```

## BR-THERMO-001 — Umbral configurable
**MUST.** El porcentaje de desbloqueo pertenece al evento.

## BR-THERMO-002 — Avance real
**MUST.** Elegibilidad usa pagos netos aplicables y total financiero aplicable.

## BR-THERMO-003 — Solicitud
**MUST.** Solo `AVAILABLE` permite solicitud ordinaria de GRADUATE.

## BR-THERMO-004 — Personalización
**MUST.** Solo captura campos habilitados por el evento.

## BR-THERMO-005 — Producción
**MUST.** Solo ADMIN cambia a `IN_PRODUCTION`; desde ese momento GRADUATE no edita personalización.

## BR-THERMO-006 — Entrega
**MUST.** Solo ADMIN confirma `DELIVERED`.

## BR-THERMO-007 — Termo adicional
**MAY.** Si el evento lo habilita, un termo adicional se modela como producto/line item con impacto financiero independiente.

## BR-THERMO-008 — Evidencia de entrega
**MAY.** La entrega puede requerir nombre/firma/evidencia de conformidad según configuración operativa.

## BR-THERMO-009 — Auditoría
**MUST.** Producción, entrega y cambios administrativos quedan auditados.

---

# 18. Notificaciones

## BR-NOT-001 — Canales base
**MUST.** In-app + correo electrónico.

## BR-NOT-002 — Recordatorios
**MUST.** Debe soportar avisos previos y posteriores al vencimiento.

## BR-NOT-003 — Pagos
**SHOULD.** Pago confirmado, submission aprobado/rechazado y pago pendiente generan feedback/notificación.

## BR-NOT-004 — Termo
**SHOULD.** Elegibilidad/cambios relevantes pueden notificar al graduado.

## BR-NOT-005 — WhatsApp
**MUST.** Automatización WhatsApp no es requisito base del MVP.

---

# 19. Reportes y cortes

## BR-REP-001 — Fuente transaccional
**MUST.** Reportes se derivan del dominio persistido; no hay totales manuales paralelos.

## BR-REP-002 — Financiero
**MUST.** Por evento/escuela debe obtenerse contratado, cobrado, pendiente, vencido, penalizaciones y reembolsos.

## BR-REP-003 — Cartera
**MUST.** Por graduado: folio, saldo, próximo vencimiento, atraso y estado.

## BR-REP-004 — Pagos
**MUST.** Reportar fecha, graduado, concepto, importe, método, referencia y estado.

## BR-REP-005 — Comprobantes
**MUST.** Identificar pendientes, aprobados y rechazados con actor/fecha de revisión.

## BR-REP-006 — Mesas
**MUST.** Reportar mesa, capacidad, ocupación, disponibilidad y personas asignadas.

## BR-REP-007 — Platillos
**MUST.** Totales por opción, pendientes y detalle autorizado.

## BR-REP-008 — Termos
**MUST.** Estado, personalización relevante y entrega.

## BR-REP-009 — Cortes
**MUST.** Soportar corte diario y vistas semanales/mensuales con filtros por evento/escuela/método.

## BR-REP-010 — Exportación
**MUST.** Soportar XLSX/CSV donde corresponda y PDF resumen en reportes ejecutivos definidos.

---

# 20. Notas internas

## BR-NOTE-001 — Solo ADMIN
**MUST.** Las notas internas de seguimiento son visibles/gestionables por ADMIN y no por GRADUATE.

## BR-NOTE-002 — Contexto
**MUST.** Toda nota se vincula a evento y, cuando aplique, membresía.

## BR-NOTE-003 — Autoría
**MUST.** Conserva autor y timestamp.

---

# 21. Auditoría

## BR-AUD-001 — Operaciones mínimas
**MUST.** Auditar cambios de evento, contrato/aceptación, lugares/productos, mesas, overrides de platillo, pagos manuales, comprobantes, ajustes, reembolsos, cancelaciones, políticas de cancelación, penalizaciones sensibles, termo y entrega.

## BR-AUD-002 — Datos mínimos
**MUST.** Actor/origen, timestamp, acción, entidad/id, before/after cuando aplique y motivo requerido.

## BR-AUD-003 — Append-only
**MUST.** AuditLog no es editable/eliminable por operación normal.

## BR-AUD-004 — Lenguaje administrativo
**MUST.** La UI puede presentar auditoría en lenguaje natural sin exponer logs técnicos.

---

# 22. Invariantes críticos resumidos

```text
confirmed_places <= event.capacity
assigned_active_members <= table.capacity
active_group_members <= active_places
1 accepted contract references immutable terms/policy version
1 approved payment submission -> max 1 confirmed transaction
provider transaction is unique per provider
confirmed payment history is append-only
published cancellation policy version is immutable
refunds <= refundable amount
late fee job is idempotent
GRADUATE never reads another membership's private data
```
