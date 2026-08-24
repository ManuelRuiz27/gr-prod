# BUSINESS_RULES.md

# Plataforma GR — Reglas de Negocio

**Documento:** `BUSINESS_RULES.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline funcional para SRS e implementación  
**Fecha:** 24 de agosto de 2026  
**Documento padre:** `PRODUCT_SCOPE.md`  
**Propósito:** Formalizar las reglas que gobiernan el comportamiento del producto, sus invariantes, autorizaciones, estados y restricciones operativas.

---

## 1. Propósito

Este documento convierte el alcance definido en `PRODUCT_SCOPE.md` en reglas verificables.

Las reglas aquí definidas deberán utilizarse como fuente normativa para:

- `SRS.md`;
- `ROLES_PERMISSIONS.md`;
- `FINANCIAL_DOMAIN.md`;
- `SEATING_MAP.md`;
- `DATA_MODEL.md`;
- `API_CONTRACTS.md`;
- `ACCEPTANCE_CRITERIA.md`;
- pruebas automatizadas;
- validaciones backend;
- QA funcional.

Una pantalla, endpoint o implementación que contradiga una regla aprobada en este documento deberá considerarse incorrecta, incluso si técnicamente funciona.

---

## 2. Convenciones

### 2.1 Identificadores

Las reglas utilizan el formato:

```text
BR-[DOMINIO]-[NÚMERO]
```

Ejemplos:

```text
BR-EVT-001
BR-FIN-014
BR-SEAT-008
```

---

### 2.2 Prioridad normativa

Se utilizarán tres niveles:

| Nivel | Significado |
|---|---|
| `MUST` | Obligatorio. No puede omitirse en el producto definido. |
| `SHOULD` | Esperado salvo justificación documentada. |
| `MAY` | Permitido pero no obligatorio. |

---

### 2.3 Principio de autoridad

Cuando exista discrepancia entre frontend y backend:

> **el backend es la autoridad definitiva.**

El frontend puede anticipar validaciones, pero no puede garantizar por sí mismo:

- disponibilidad;
- capacidad;
- autorización;
- saldo;
- confirmación financiera;
- vencimiento;
- estado definitivo de una operación.

---

# 3. Reglas globales del producto

## BR-GEN-001 — Modelo single-tenant

**MUST**

Plataforma GR opera para una sola empresa.

No existe `tenant_id` como concepto de negocio visible ni separación entre múltiples empresas clientes.

---

## BR-GEN-002 — Roles permitidos

**MUST**

Los únicos roles funcionales son:

```text
ADMIN
GRADUATE
```

No deberán crearse subroles ni permisos personalizados sin un Change Request aprobado.

---

## BR-GEN-003 — Múltiples administradores

**MUST**

La plataforma puede tener múltiples cuentas `ADMIN`.

Todas poseen el mismo rol lógico y las mismas capacidades funcionales.

---

## BR-GEN-004 — Múltiples eventos simultáneos

**MUST**

La plataforma puede operar múltiples eventos en paralelo.

La información de un evento no deberá mezclarse con la de otro.

---

## BR-GEN-005 — Aislamiento por evento

**MUST**

Toda entidad operativa asociada a un evento deberá estar inequívocamente vinculada al evento correspondiente.

Esto incluye al menos:

- graduados;
- planes de pago;
- obligaciones;
- mesas;
- asignaciones;
- platillos;
- termos;
- reportes;
- auditoría.

---

## BR-GEN-006 — Datos demo no son reglas globales

**MUST**

Datos usados en prototipos como:

- Andrea Martínez;
- Mesa 24;
- $12,500 MXN;
- cinco mensualidades;
- umbral del 70%;
- Tradicional / Vegetariano / Vegano;

no deberán hardcodearse como valores globales salvo que una regla específica así lo determine.

---

# 4. Cuentas, acceso y membresía a eventos

## BR-AUTH-001 — Registro por evento

**MUST**

Un graduado no debe poder registrarse seleccionando libremente cualquier evento.

El acceso inicial deberá originarse mediante un enlace, código o mecanismo específico asociado a un evento autorizado.

---

## BR-AUTH-002 — Asociación del graduado

**MUST**

La relación operativa de un graduado es siempre contextual a un evento.

La misma identidad de cuenta podrá participar en más de un evento cuando exista una membresía válida para cada uno.

Cada membresía conservará de forma separada:

- lugares;
- plan financiero;
- mesa;
- platillos;
- termo;
- estado operativo.

---

## BR-AUTH-003 — Selector de evento

**MUST**

Cuando una cuenta GRADUATE tenga acceso a más de un evento, deberá poder seleccionar el contexto del evento antes de operar información específica.

---

## BR-AUTH-004 — No confiar en el evento enviado por frontend

**MUST**

El backend no deberá autorizar acceso basándose únicamente en un `event_id` recibido desde el cliente.

Debe verificar que la cuenta posee una relación autorizada con dicho evento.

---

## BR-AUTH-005 — Recuperación de contraseña

**MUST**

La recuperación de contraseña se realizará mediante un token temporal enviado por correo electrónico.

El token deberá ser:

- de uso limitado;
- invalidable;
- con expiración.

La duración exacta se definirá en requisitos técnicos.

---

## BR-AUTH-006 — Sesiones en múltiples dispositivos

**MUST**

Una cuenta GRADUATE puede iniciar sesión desde más de un dispositivo.

No existe restricción de una sola sesión activa por cuenta en el MVP.

---

## BR-AUTH-007 — Rol no seleccionable

**MUST**

El usuario no elige su rol desde la interfaz.

El rol es determinado por la cuenta autenticada.

---

# 5. Ciclo de vida del evento

Estados funcionales:

```text
DRAFT
OPEN
CLOSED
FINALIZED
CANCELLED
```

---

## BR-EVT-001 — Estado inicial

**MUST**

Todo evento nuevo inicia en:

```text
DRAFT
```

---

## BR-EVT-002 — Evento DRAFT

**MUST**

Mientras el evento está `DRAFT`:

- el ADMIN puede configurarlo;
- no debe considerarse operativo para graduados;
- no debe aceptarse operación financiera real de graduados.

---

## BR-EVT-003 — Evento OPEN

**MUST**

`OPEN` es el estado operativo normal.

Solo en este estado el graduado puede realizar acciones de autoservicio permitidas por fechas límite y reglas particulares.

---

## BR-EVT-004 — Cierre temporal

**MUST**

Al pasar a `CLOSED`:

- se bloquean nuevas mutaciones iniciadas por GRADUATE;
- el ADMIN puede continuar tareas administrativas permitidas;
- el evento puede ser reabierto por ADMIN.

---

## BR-EVT-005 — Reapertura

**MUST**

Un evento `CLOSED` puede volver a `OPEN` mediante acción ADMIN.

La reapertura deberá quedar auditada.

---

## BR-EVT-006 — Finalización

**MUST**

`FINALIZED` representa un evento concluido operacionalmente.

El evento se mantiene disponible para consulta e históricos.

Las operaciones ordinarias del graduado quedan bloqueadas.

---

## BR-EVT-007 — Correcciones financieras post-finalización

**MUST**

La finalización no puede impedir registrar posteriormente, mediante flujo administrativo controlado:

- ajustes;
- reembolsos;
- correcciones contables no destructivas;

cuando sean necesarias para preservar la integridad financiera.

---

## BR-EVT-008 — Cancelación del evento

**MUST**

Un evento `CANCELLED`:

- bloquea operaciones ordinarias de graduados;
- conserva todos los registros existentes;
- no elimina pagos, graduados ni auditoría;
- requiere motivo administrativo.

---

## BR-EVT-009 — Transiciones auditadas

**MUST**

Toda transición entre:

```text
OPEN
CLOSED
FINALIZED
CANCELLED
```

deberá registrar:

- administrador;
- estado anterior;
- estado nuevo;
- fecha;
- motivo cuando aplique.

---

## BR-EVT-010 — Fechas límite por evento

**MUST**

Cada evento puede configurar fechas límite independientes para al menos:

- agregar lugares/integrantes;
- cambiar mesa;
- seleccionar o modificar platillos.

---

## BR-EVT-011 — Hora efectiva del deadline

**MUST**

Las fechas límite deberán evaluarse utilizando la zona horaria operativa configurada para la plataforma/evento.

La definición técnica exacta de timezone deberá fijarse en requisitos no funcionales.

---

# 6. Capacidad del evento y lugares

## BR-PLC-001 — Capacidad máxima del evento

**MUST**

Un evento puede definir una capacidad máxima de lugares.

La suma de lugares confirmados no deberá exceder esta capacidad.

---

## BR-PLC-002 — Lugares del graduado

**MUST**

Cada membresía de graduado tendrá una cantidad vigente de lugares contratados/asignados.

---

## BR-PLC-003 — Integrantes nominales

**MUST**

Los integrantes del grupo deberán registrarse nominalmente cuando el flujo así lo requiera.

La cantidad de integrantes activos no deberá exceder la cantidad de lugares vigentes.

---

## BR-PLC-004 — Incremento de lugares

**MUST**

El graduado podrá solicitar/agregar lugares únicamente si:

1. el evento lo permite;
2. no ha vencido la fecha límite;
3. existe capacidad global suficiente;
4. se satisfacen las condiciones financieras aplicables.

---

## BR-PLC-005 — Validación atómica de capacidad

**MUST**

La capacidad disponible debe revalidarse en backend al confirmar cualquier incremento de lugares.

Dos operaciones concurrentes no podrán provocar que la capacidad del evento sea superada.

---

## BR-PLC-006 — Reducción de lugares

**MUST**

La reducción de lugares requiere autorización administrativa.

No será una operación unilateral del graduado.

---

## BR-PLC-007 — Reducción antes del congelamiento financiero

**MUST**

Si aún no existe un primer pago confirmado y las condiciones financieras no están congeladas, una reducción autorizada puede recalcular el plan conforme a la configuración vigente.

---

## BR-PLC-008 — Reducción después del congelamiento financiero

**MUST**

Después de congelarse el plan financiero, una reducción de lugares no deberá reescribir destructivamente obligaciones o pagos históricos.

Cualquier impacto monetario deberá representarse mediante:

- ajuste;
- cancelación parcial;
- reembolso;
- movimiento compensatorio;

según la política aplicable.

---

## BR-PLC-009 — Reserva comercial de lugares

**MUST**

Los lugares se consideran comercialmente confirmados cuando se confirma la obligación inicial requerida por el evento.

El registro por sí solo no constituye confirmación financiera definitiva.

---

## BR-PLC-010 — Capacidad como invariante

**MUST**

La confirmación de lugares nunca debe dejar al evento con:

```text
confirmed_places > event.capacity
```

La estrategia técnica para garantizar este invariante se definirá en arquitectura y contratos transaccionales.

---

# 7. Croquis y mesas

## BR-SEAT-001 — Croquis simplificado

**MUST**

El croquis de GR es una herramienta operativa de mesas, no un editor CAD.

---

## BR-SEAT-002 — Formas MVP

**MUST**

Las formas expuestas en el MVP serán:

```text
SQUARE
ROUND
```

No deberán exponerse como opciones oficiales:

- VIP;
- herradura;
- mesa de novios;
- polígonos personalizados;
- categorías premium.

---

## BR-SEAT-003 — Capacidad independiente por mesa

**MUST**

Cada mesa posee su propia capacidad configurable.

No se asumirá una capacidad uniforme para todas las mesas.

---

## BR-SEAT-004 — Fondo de referencia

**MAY**

El ADMIN puede cargar una imagen/PDF convertido a imagen como guía visual del croquis.

El archivo de fondo no constituye la fuente operativa de mesas.

---

## BR-SEAT-005 — Objetos persistidos

**MUST**

Las mesas deberán persistirse como objetos independientes del fondo visual.

Mover, cambiar o eliminar la imagen no debe destruir las entidades de mesa.

---

## BR-SEAT-006 — Posiciones normalizadas

**SHOULD**

Las posiciones y dimensiones gráficas deberán persistirse de forma independiente a la resolución de pantalla, preferentemente mediante coordenadas normalizadas.

---

## BR-SEAT-007 — Ocupación calculada

**MUST**

La ocupación de una mesa no será un contador editable manualmente.

Se calculará a partir de las asignaciones vigentes.

---

## BR-SEAT-008 — Disponibilidad

**MUST**

Para cada mesa:

```text
available_capacity =
table.capacity
- assigned_places
```

---

## BR-SEAT-009 — Selección del graduado

**MUST**

La selección normal del graduado intentará colocar su grupo en una mesa con capacidad suficiente.

La interfaz deberá mostrar la capacidad/disponibilidad sin revelar datos personales de otros graduados.

---

## BR-SEAT-010 — Grupo dividido

**MUST**

El dominio permitirá distribuir los lugares de un mismo graduado entre más de una mesa cuando la operación lo requiera.

El flujo de autoservicio priorizará una sola mesa cuando exista capacidad suficiente.

Las divisiones extraordinarias podrán ser gestionadas o confirmadas por ADMIN.

---

## BR-SEAT-011 — Sin selección de silla

**MUST**

Plataforma GR no maneja selección individual de asiento.

No existe una obligación funcional de `seat_id`.

---

## BR-SEAT-012 — Cambio de mesa por graduado

**MUST**

El graduado puede cambiar mesa únicamente:

- mientras el evento esté `OPEN`;
- antes de la fecha límite de cambio;
- si la nueva asignación satisface capacidad.

---

## BR-SEAT-013 — Cambio administrativo fuera de fecha

**MUST**

El ADMIN puede realizar un cambio de mesa después de la fecha límite.

Debe registrar:

- motivo;
- mesa anterior;
- mesa nueva;
- administrador;
- fecha.

---

## BR-SEAT-014 — Conflicto concurrente

**MUST**

Si dos usuarios intentan utilizar simultáneamente los últimos lugares de una mesa:

- solo las asignaciones cuya capacidad pueda confirmarse deberán persistir;
- las demás deberán fallar por conflicto;
- la UI deberá actualizar disponibilidad y pedir seleccionar otra opción.

---

## BR-SEAT-015 — Eliminación de mesa con asignaciones

**MUST**

Una mesa con asignaciones activas no puede eliminarse directamente.

Primero deberán:

- reasignarse los lugares;
- cancelarse/liberarse conforme a regla;
- o ejecutarse un flujo administrativo explícito que preserve trazabilidad.

---

## BR-SEAT-016 — Bloqueo de mesa

**MUST**

Una mesa `BLOCKED` no estará disponible para nuevas selecciones del graduado.

Las asignaciones existentes no deberán desaparecer por el simple hecho de bloquearla.

---

## BR-SEAT-017 — Cambiar capacidad de mesa

**MUST**

El ADMIN no podrá reducir la capacidad de una mesa por debajo de sus lugares ya asignados sin resolver previamente el conflicto.

---

## BR-SEAT-018 — Generación múltiple

**SHOULD**

El ADMIN podrá crear múltiples mesas en una sola operación indicando, al menos:

- cantidad;
- forma;
- capacidad;
- numeración inicial.

Esta función reduce operación repetitiva en planos con decenas de mesas.

---

# 8. Platillos

## BR-MEAL-001 — Catálogo por evento

**MUST**

Las opciones de platillo pertenecen al evento.

No existe un catálogo global inmutable obligatorio.

---

## BR-MEAL-002 — Selección por integrante

**MUST**

Cada integrante activo del grupo deberá poder tener una selección de platillo cuando el evento habilite este módulo.

---

## BR-MEAL-003 — Completitud

**MUST**

El estado de platillos del grupo deberá diferenciar entre:

- completos;
- pendientes.

---

## BR-MEAL-004 — Deadline del graduado

**MUST**

Después de la fecha límite:

- el GRADUATE no puede crear/modificar selecciones;
- puede consultarlas.

---

## BR-MEAL-005 — Override administrativo

**MUST**

El ADMIN puede modificar una selección después de la fecha límite.

La operación debe registrar:

- valor anterior;
- valor nuevo;
- integrante;
- motivo;
- administrador;
- fecha.

---

## BR-MEAL-006 — Eliminación de opción usada

**MUST**

Una opción de platillo ya utilizada por selecciones activas no deberá eliminarse de forma destructiva.

Deberá desactivarse para nuevas selecciones o migrarse mediante un flujo explícito.

---

# 9. Modelo financiero

## BR-FIN-001 — Separación de conceptos

**MUST**

El sistema deberá diferenciar conceptualmente:

```text
PaymentPlan
Installment
PaymentAttempt
PaymentTransaction
Adjustment
Refund
```

Una transacción del proveedor no sustituye al plan financiero.

---

## BR-FIN-002 — Plan por membresía/evento

**MUST**

Cada graduado tendrá un plan financiero independiente dentro de cada evento.

---

## BR-FIN-003 — Calendario del evento

**MUST**

Las fechas de vencimiento se determinan mediante un calendario fijo configurado para el evento.

No se recalcula el calendario individual desplazando meses a partir de la fecha de registro tardío.

---

## BR-FIN-004 — Alta tardía

**MUST**

Cuando un graduado se incorpora después de que algunas obligaciones del calendario ya vencieron:

- dichas obligaciones deberán existir en su plan;
- se considerarán exigibles conforme a la fecha original;
- su estado de vencimiento dependerá del calendario y periodo de gracia.

El alta tardía no mueve las fechas históricas del evento.

---

## BR-FIN-005 — Congelamiento financiero

**MUST**

Las condiciones financieras del graduado quedan congeladas después del primer pago confirmado.

Después de ese momento no deberán alterarse retroactivamente por cambios generales en la configuración del evento.

---

## BR-FIN-006 — Cambios antes del primer pago

**MAY**

Antes del primer pago confirmado, el ADMIN puede ajustar o regenerar condiciones del plan conforme a reglas vigentes del evento.

La operación deberá ser coherente con cualquier compromiso ya generado.

---

## BR-FIN-007 — Total contratado

**MUST**

El plan deberá permitir determinar en todo momento:

```text
total_contracted
total_paid
total_pending
total_overdue
```

---

## BR-FIN-008 — Estado derivado

**MUST**

Los saldos no deberán depender de valores manualmente editables si pueden derivarse de obligaciones y movimientos financieros.

---

## BR-FIN-009 — Obligaciones sin estado parcial

**MUST**

Una obligación individual no tendrá un estado comercial `PARTIALLY_PAID` en el MVP.

Será, según corresponda:

- pendiente;
- próxima;
- vencida;
- pagada;
- cancelada/ajustada mediante operación administrativa.

---

## BR-FIN-010 — Pagos adelantados

**MUST**

El sistema permite pagar obligaciones futuras antes de su fecha de vencimiento.

---

## BR-FIN-011 — Aplicación secuencial

**MUST**

Salvo una instrucción administrativa explícita permitida, los pagos se aplicarán primero a las obligaciones exigibles más antiguas y posteriormente a obligaciones futuras.

---

## BR-FIN-012 — Excedente

**MUST**

Si una transacción excede el monto necesario para liquidar la obligación objetivo, el excedente deberá aplicarse a las siguientes obligaciones del plan.

---

## BR-FIN-013 — Excedente insuficiente para liquidar siguiente obligación

**MUST**

Si el remanente no alcanza a liquidar completamente la siguiente obligación:

- se conserva como crédito/aplicación financiera;
- la obligación siguiente no se marca como `PAID` hasta quedar cubierta totalmente.

No se expondrá al graduado un estado comercial de pago parcial de mensualidad.

---

## BR-FIN-014 — No perder excedentes

**MUST**

Ningún monto confirmado puede descartarse por no coincidir exactamente con una mensualidad.

Toda cantidad debe quedar conciliada como:

- aplicada;
- disponible para aplicación;
- ajustada;
- reembolsada.

---

## BR-FIN-015 — Periodo de gracia

**MUST**

El evento puede definir un periodo de gracia aplicable a vencimientos.

---

## BR-FIN-016 — Estado vencido

**MUST**

Una obligación será considerada vencida cuando:

```text
current_time >
due_date + grace_period
```

y no se encuentre totalmente cubierta/cancelada.

---

## BR-FIN-017 — Sin recargo automático

**MUST**

El estado vencido no genera automáticamente:

- penalización;
- interés;
- recargo;
- comisión adicional.

---

## BR-FIN-018 — Historial financiero inmutable

**MUST**

Los pagos confirmados no pueden editarse ni eliminarse destructivamente.

---

## BR-FIN-019 — Corrección por movimiento separado

**MUST**

Cualquier corrección a un pago confirmado deberá representarse mediante una nueva entidad/movimiento, por ejemplo:

- ajuste;
- reembolso.

---

## BR-FIN-020 — Trazabilidad monetaria

**MUST**

Todo movimiento financiero deberá poder relacionarse con:

- graduado;
- evento;
- importe;
- moneda;
- fecha;
- origen;
- concepto;
- actor cuando aplique;
- referencia externa cuando aplique.

---

# 10. Pago inicial y confirmación de lugares

## BR-INIT-001 — Pago inicial configurable

**MUST**

Un evento puede requerir una obligación inicial para confirmar comercialmente la participación/lugares.

Su importe no se hardcodeará globalmente.

---

## BR-INIT-002 — Confirmación de reserva

**MUST**

La confirmación financiera de la obligación inicial requerida es el evento que convierte los lugares solicitados en lugares comercialmente confirmados.

---

## BR-INIT-003 — Capacidad al confirmar

**MUST**

Al confirmar la obligación inicial, el sistema deberá garantizar que los lugares confirmados no excedan la capacidad del evento.

---

## BR-INIT-004 — Registro sin pago inicial

**MUST**

Si el evento no requiere obligación inicial, la regla específica de confirmación de lugares deberá derivarse de la configuración del evento y documentarse en el plan generado.

---

# 11. Mercado Pago y OpenPay

## BR-PAY-001 — Proveedor principal

**MUST**

Mercado Pago será el proveedor primario del flujo de pago electrónico.

---

## BR-PAY-002 — Checkout Pro

**MUST**

El flujo principal utilizará Mercado Pago Checkout Pro con experiencia preconstruida/redirección.

---

## BR-PAY-003 — Sin captura propia de tarjeta

**MUST**

Plataforma GR no deberá capturar directamente datos completos de tarjeta en el flujo primario de Mercado Pago.

---

## BR-PAY-004 — Preferencia por intento

**MUST**

Cada intento electrónico deberá poder asociarse a una preferencia/intento identificable sin convertir la preferencia en obligación financiera.

---

## BR-PAY-005 — Retorno no confirma pago

**MUST**

El regreso del navegador desde Mercado Pago no deberá marcar por sí solo una obligación como pagada.

---

## BR-PAY-006 — Confirmación servidor a servidor

**MUST**

La confirmación financiera deberá derivarse de una notificación/verificación backend con el proveedor.

---

## BR-PAY-007 — Estado de confirmación

**MUST**

Mientras el proveedor no confirme definitivamente una transacción, la UI puede mostrar:

```text
Pago pendiente
Estamos confirmando tu pago
```

pero no `Pagado`.

---

## BR-PAY-008 — Webhook idempotente

**MUST**

La recepción repetida de la misma notificación del proveedor no podrá generar pagos duplicados.

---

## BR-PAY-009 — Transacción única por proveedor

**MUST**

Una transacción externa confirmada deberá registrarse una sola vez en el dominio financiero.

---

## BR-PAY-010 — OpenPay secundario

**MUST**

OpenPay permanece como proveedor electrónico secundario/alternativo.

---

## BR-PAY-011 — Independencia del proveedor

**MUST**

Cambiar el proveedor de pago no deberá alterar:

- plan;
- mensualidades;
- vencimientos;
- saldos;
- reglas de cartera.

---

# 12. Pagos manuales

## BR-MAN-001 — Métodos manuales

**MUST**

El ADMIN podrá registrar pagos realizados mediante:

```text
CASH
TRANSFER
```

---

## BR-MAN-002 — Solo ADMIN

**MUST**

El graduado no puede marcar una obligación como pagada manualmente.

---

## BR-MAN-003 — Datos mínimos

**MUST**

Un pago manual deberá registrar al menos:

- graduado;
- evento;
- monto;
- fecha;
- método;
- concepto;
- administrador que lo registró.

---

## BR-MAN-004 — Referencia y evidencia

**SHOULD**

Para transferencias y cuando la operación lo requiera, deberá poder registrarse:

- referencia/nota;
- evidencia documental.

---

## BR-MAN-005 — Pago manual auditado

**MUST**

Todo pago manual genera auditoría.

---

## BR-MAN-006 — Mismas reglas de aplicación

**MUST**

Una vez validado, un pago manual se aplica al plan bajo las mismas reglas contables de asignación que un pago electrónico confirmado.

---

# 13. Ajustes y reembolsos

## BR-ADJ-001 — Ajuste no destructivo

**MUST**

Un ajuste no modifica ni elimina el registro original que lo originó.

---

## BR-ADJ-002 — Reembolso separado

**MUST**

Un reembolso será un movimiento independiente relacionado con uno o más movimientos previos.

---

## BR-ADJ-003 — Motivo obligatorio

**MUST**

Todo ajuste/reembolso administrativo debe registrar motivo.

---

## BR-ADJ-004 — Autoría

**MUST**

Todo ajuste/reembolso debe registrar el ADMIN responsable.

---

## BR-ADJ-005 — Impacto recalculable

**MUST**

Después de un ajuste/reembolso, los saldos deberán recalcularse a partir del ledger/movimientos vigentes, sin sobrescribir la historia.

---

# 14. Cancelación del graduado

## BR-CAN-001 — Acción administrativa

**MUST**

La cancelación de la participación de un graduado es una acción ADMIN.

---

## BR-CAN-002 — Motivo obligatorio

**MUST**

La cancelación requiere motivo.

---

## BR-CAN-003 — No eliminar datos

**MUST**

Cancelar a un graduado no elimina:

- cuenta;
- membresía histórica;
- pagos;
- plan;
- auditoría;
- documentos asociados.

---

## BR-CAN-004 — Bloqueo operativo

**MUST**

Una membresía cancelada no podrá realizar nuevas operaciones de:

- lugares;
- mesa;
- platillos;
- pagos ordinarios;
- termo.

---

## BR-CAN-005 — Liberación operativa

**MUST**

Una vez efectiva la cancelación, sus asignaciones operativas activas deberán liberarse cuando corresponda, incluyendo capacidad de mesa y lugares activos del evento.

La historia de dichas asignaciones deberá conservarse.

---

## BR-CAN-006 — Política configurable

**MUST**

La política económica de cancelación será configurable por evento.

Puede determinar, según el caso:

- sin reembolso;
- reembolso parcial;
- reembolso total;
- ajuste administrativo;
- saldo retenido.

---

## BR-CAN-007 — Cancelación no implica reembolso automático

**MUST**

Cancelar la participación no genera por sí solo un reembolso financiero.

Si corresponde, el reembolso deberá registrarse como operación separada.

---

# 15. Termo

Estados válidos:

```text
LOCKED
AVAILABLE
REQUESTED
IN_PRODUCTION
DELIVERED
```

---

## BR-THERMO-001 — Umbral por evento

**MUST**

El porcentaje necesario para desbloquear el termo es configurable por evento.

---

## BR-THERMO-002 — Cálculo de avance

**MUST**

El desbloqueo se determina usando avance financiero real del plan.

La fórmula deberá ser consistente con:

```text
progress = applicable_paid_amount / applicable_total_amount
```

La definición exacta de montos aplicables se fijará en `FINANCIAL_DOMAIN.md`.

---

## BR-THERMO-003 — Estado LOCKED

**MUST**

Mientras el avance sea inferior al umbral:

```text
LOCKED
```

El graduado no puede solicitar el termo.

---

## BR-THERMO-004 — Estado AVAILABLE

**MUST**

Al alcanzar o superar el umbral, el termo pasa a:

```text
AVAILABLE
```

Esto significa “disponible para solicitar”, no “listo para entrega”.

---

## BR-THERMO-005 — Solicitud

**MUST**

El graduado puede pasar de `AVAILABLE` a `REQUESTED` mediante el flujo de solicitud.

---

## BR-THERMO-006 — Personalización

**MUST**

La solicitud puede contener la personalización permitida por el evento.

No deberán inventarse atributos no configurados.

---

## BR-THERMO-007 — Producción

**MUST**

Solo ADMIN puede marcar un termo:

```text
IN_PRODUCTION
```

---

## BR-THERMO-008 — Bloqueo de edición

**MUST**

Una vez en `IN_PRODUCTION`, el graduado ya no puede modificar la personalización.

---

## BR-THERMO-009 — Entrega

**MUST**

Solo ADMIN puede marcar:

```text
DELIVERED
```

---

## BR-THERMO-010 — Transiciones auditadas

**MUST**

Las transiciones administrativas de termo deberán quedar auditadas.

---

# 16. Notificaciones

## BR-NOT-001 — Canales MVP

**MUST**

Los canales base son:

- notificación dentro de plataforma;
- correo electrónico.

---

## BR-NOT-002 — WhatsApp fuera del MVP

**MUST**

El envío automatizado por WhatsApp no forma parte del MVP.

---

## BR-NOT-003 — Recordatorio previo

**MUST**

El sistema deberá soportar al menos un recordatorio automático antes del vencimiento de una obligación.

---

## BR-NOT-004 — Recordatorio posterior

**MUST**

El sistema deberá soportar al menos un recordatorio después del vencimiento cuando la obligación siga pendiente.

---

## BR-NOT-005 — Pago confirmado

**SHOULD**

Una confirmación de pago deberá generar feedback/notificación al graduado.

---

## BR-NOT-006 — Termo disponible

**SHOULD**

Cuando el termo pase a `AVAILABLE`, el graduado deberá ser notificado.

---

## BR-NOT-007 — Cambios administrativos relevantes

**SHOULD**

Cambios realizados por ADMIN que afecten la operación del graduado, por ejemplo mesa o estado de termo, podrán generar una notificación visible.

---

# 17. Reportes y cortes

## BR-REP-001 — Datos derivados de fuente transaccional

**MUST**

Los reportes deben derivarse de los datos persistidos del sistema.

No deberán mantenerse totales manuales independientes que puedan divergir del dominio.

---

## BR-REP-002 — Reporte financiero

**MUST**

Debe poder obtenerse por evento al menos:

- total contratado;
- recaudado;
- pendiente;
- vencido.

---

## BR-REP-003 — Cartera

**MUST**

Debe poder identificarse por graduado:

- saldo;
- próximo vencimiento;
- estado;
- vencido cuando aplique.

---

## BR-REP-004 — Mesas

**MUST**

Debe poder reportarse:

- mesa;
- capacidad;
- ocupados;
- disponibles;
- asignaciones.

---

## BR-REP-005 — Platillos

**MUST**

Debe poder reportarse:

- cantidades por opción;
- pendientes;
- detalle operativo cuando corresponda.

---

## BR-REP-006 — Termos

**MUST**

Debe poder reportarse la cantidad y detalle por estado:

- bloqueados;
- disponibles;
- solicitados;
- en producción;
- entregados.

---

## BR-REP-007 — Exportación

**MUST**

Los reportes operativos deberán soportar exportación en Excel o CSV según el caso.

El sistema deberá soportar un PDF resumen para reportes ejecutivos definidos.

---

# 18. Auditoría

## BR-AUD-001 — Operaciones auditables

**MUST**

Se auditarán al menos:

- cambios de lugares;
- cambios de mesa;
- cambios administrativos de platillo posteriores al deadline;
- pagos manuales;
- ajustes;
- reembolsos;
- cancelaciones;
- cambios de estado del evento;
- cambios de estado del termo;
- modificaciones financieras sensibles.

---

## BR-AUD-002 — Datos mínimos de auditoría

**MUST**

Cada registro deberá identificar:

- actor;
- fecha/hora;
- acción;
- entidad;
- identificador de entidad;
- valores relevantes antes/después cuando aplique;
- motivo cuando sea obligatorio.

---

## BR-AUD-003 — Auditoría inmutable

**MUST**

Los registros de auditoría no deberán ser editables desde la operación normal del producto.

---

## BR-AUD-004 — Lenguaje administrativo

**MUST**

La UI podrá presentar el historial en lenguaje natural.

Ejemplo:

```text
Mariana cambió a Andrea Martínez de Mesa 18 a Mesa 24.
```

La implementación técnica subyacente puede conservar metadatos adicionales.

---

# 19. Privacidad y autorización

## BR-SEC-001 — GRADUATE solo ve su dominio

**MUST**

El GRADUATE solo puede consultar información correspondiente a sus propias membresías autorizadas.

---

## BR-SEC-002 — Datos de terceros

**MUST**

Un graduado no puede obtener PII de otros graduados a través del croquis, endpoints, búsquedas o errores.

---

## BR-SEC-003 — Mesa sin PII

**MUST**

La disponibilidad de una mesa para GRADUATE puede mostrar:

- capacidad;
- ocupación;
- disponibilidad;
- estado;

pero no nombres, teléfonos, correos o datos financieros de otros grupos.

---

## BR-SEC-004 — ADMIN global

**MUST**

El ADMIN puede operar todos los eventos dentro de esta instancia single-tenant.

---

## BR-SEC-005 — Autorización backend

**MUST**

Las autorizaciones se evaluarán en backend.

No basta con ocultar controles en frontend.

---

## BR-SEC-006 — Datos de proveedor

**MUST**

Credenciales, secretos, tokens internos y metadatos sensibles de proveedores de pago no deben exponerse al GRADUATE.

---

# 20. Concurrencia e idempotencia

## BR-CON-001 — Operaciones críticas

**MUST**

Las siguientes operaciones requieren protección contra condiciones de carrera:

- confirmación de lugares;
- aumento de lugares;
- selección/cambio de mesa;
- registro/aplicación de pagos;
- confirmación de proveedor;
- ajustes financieros;
- cambios administrativos que alteren capacidad.

---

## BR-CON-002 — Base de datos como autoridad

**MUST**

La disponibilidad mostrada en UI es informativa hasta que el backend confirme la operación.

---

## BR-CON-003 — Conflicto de disponibilidad

**MUST**

Cuando una operación falle porque la disponibilidad cambió concurrentemente, no deberá sobrescribirse al ganador ni forzar sobrecupo.

La operación perdedora debe recibir una respuesta de conflicto de negocio.

---

## BR-CON-004 — Idempotencia de pago

**MUST**

Reintentar una confirmación del mismo pago no puede generar dos movimientos financieros.

---

## BR-CON-005 — Idempotencia administrativa sensible

**SHOULD**

Operaciones como registro manual de pago y ajustes deberán soportar mecanismos de prevención de duplicados por reintento.

---

## BR-CON-006 — Lecturas refrescables

**MAY**

Para el MVP, la UI puede refrescar disponibilidad mediante polling periódico.

No se requiere WebSocket como condición de alcance.

---

# 21. Fechas y vencimientos

## BR-DATE-001 — Fecha vs estado

**MUST**

Los estados `UPCOMING` y `OVERDUE` se derivan de fechas y gracia; no deben asignarse arbitrariamente.

---

## BR-DATE-002 — Calendario fijo

**MUST**

Modificar la fecha actual o la fecha de alta de un graduado no debe reescribir los vencimientos históricos ya definidos para el evento.

---

## BR-DATE-003 — Cambiar calendario futuro

**MUST**

Si el ADMIN modifica el calendario general del evento, el impacto sobre planes no congelados y congelados deberá respetar `BR-FIN-005`.

---

## BR-DATE-004 — Plan congelado

**MUST**

Un plan congelado no cambia automáticamente ante modificaciones posteriores del calendario global.

Cualquier excepción requiere operación administrativa explícita y auditada.

---

# 22. Reglas de integridad de datos

## BR-DATA-001 — No duplicar membresía

**MUST**

Una misma cuenta no debe tener dos membresías activas duplicadas para el mismo evento salvo que exista una razón de dominio explícita aprobada.

---

## BR-DATA-002 — No duplicar obligación

**MUST**

Una misma obligación lógica no debe generarse dos veces para el mismo plan y periodo/concepto.

---

## BR-DATA-003 — No duplicar transacción externa

**MUST**

Un identificador de transacción del proveedor no puede producir múltiples registros financieros confirmados.

---

## BR-DATA-004 — Asignaciones de mesa coherentes

**MUST**

La suma de lugares asignados de un graduado entre mesas no debe exceder sus lugares activos.

---

## BR-DATA-005 — Capacidad de mesa coherente

**MUST**

La suma de lugares activos asignados a una mesa no debe exceder su capacidad.

---

## BR-DATA-006 — Platillo solo para integrante activo

**MUST**

No debe existir una selección activa de platillo para un integrante cancelado/eliminado del grupo activo.

La historia puede preservarse.

---

## BR-DATA-007 — Termo único por membresía

**MUST**

Cada membresía elegible tendrá como máximo un flujo activo de termo dentro del evento, salvo que una futura regla comercial disponga lo contrario.

---

# 23. Reglas de interfaz derivadas del negocio

## BR-UX-001 — Lenguaje natural

**MUST**

La UI no deberá mostrar al usuario final:

- códigos HTTP;
- nombres de tablas;
- claves internas;
- `webhook`;
- `transaction_id`;
- excepciones técnicas.

---

## BR-UX-002 — Conflicto de mesa

**MUST**

Ante conflicto concurrente de mesa, la UI deberá presentar un mensaje equivalente a:

```text
Esta mesa acaba de cambiar.
Ya no hay suficientes lugares disponibles para tu grupo.
```

---

## BR-UX-003 — Pago en verificación

**MUST**

Después de volver del checkout y antes de confirmación backend, deberá existir un estado equivalente a:

```text
Estamos confirmando tu pago.
```

---

## BR-UX-004 — Sin recargo

**MUST**

La UI no debe afirmar que existen recargos por atraso mientras dicha regla no exista.

---

## BR-UX-005 — Termo

**MUST**

Al alcanzar el umbral, el mensaje será equivalente a:

```text
Tu termo ya está disponible para solicitar.
```

No:

```text
Tu termo está listo para entrega.
```

---

# 24. Respuestas de negocio esperadas

Esta sección no define aún contratos HTTP, pero establece categorías que deberán mapearse posteriormente.

| Categoría | Significado |
|---|---|
| `NOT_AUTHORIZED` | La cuenta no tiene autorización para la operación. |
| `EVENT_NOT_OPEN` | El evento no permite esa mutación. |
| `DEADLINE_CLOSED` | La fecha límite para el graduado ya venció. |
| `EVENT_CAPACITY_EXCEEDED` | No existen lugares suficientes en el evento. |
| `TABLE_CAPACITY_CHANGED` | La mesa ya no tiene espacio suficiente. |
| `TABLE_BLOCKED` | La mesa no admite nuevas asignaciones. |
| `FINANCIAL_PLAN_FROZEN` | La operación intenta alterar destructivamente condiciones congeladas. |
| `PAYMENT_ALREADY_PROCESSED` | El movimiento ya fue procesado. |
| `PAYMENT_PENDING_CONFIRMATION` | El proveedor aún no confirma. |
| `INVALID_INSTALLMENT_AMOUNT` | La operación no satisface reglas de aplicación. |
| `THERMO_LOCKED` | No se alcanzó el umbral requerido. |
| `THERMO_IN_PRODUCTION` | La personalización ya no puede modificarse. |
| `GRADUATE_CANCELLED` | La membresía no admite nuevas operaciones. |

Los códigos definitivos se establecerán en `API_CONTRACTS.md`.

---

# 25. Matriz resumida de autoridad

| Operación | GRADUATE | ADMIN |
|---|---:|---:|
| Crear evento | No | Sí |
| Configurar evento | No | Sí |
| Ver su propio evento | Sí | Sí |
| Ver todos los graduados | No | Sí |
| Agregar integrante dentro de reglas | Sí | Sí |
| Reducir lugares unilateralmente | No | No |
| Autorizar reducción | No | Sí |
| Elegir mesa dentro de deadline | Sí | Sí |
| Cambiar mesa después de deadline | No | Sí |
| Editar croquis | No | Sí |
| Seleccionar platillos dentro de deadline | Sí | Sí |
| Modificar platillos fuera de deadline | No | Sí |
| Iniciar pago electrónico propio | Sí | No necesario |
| Registrar efectivo/transferencia | No | Sí |
| Editar pago confirmado | No | No |
| Registrar ajuste/reembolso | No | Sí |
| Solicitar termo disponible | Sí | Sí |
| Marcar termo en producción | No | Sí |
| Marcar termo entregado | No | Sí |
| Cancelar graduado | No | Sí |
| Cerrar/finalizar/cancelar evento | No | Sí |
| Ver reportes globales | No | Sí |

La matriz completa se definirá en `ROLES_PERMISSIONS.md`.

---

# 26. Invariantes críticos del producto

Los siguientes invariantes deben convertirse en pruebas automatizadas de alta prioridad.

### INV-001

```text
confirmed_event_places <= event.capacity
```

### INV-002

```text
assigned_places_to_table <= table.capacity
```

### INV-003

```text
sum(active_table_assignments_for_graduate) <= graduate.active_places
```

### INV-004

```text
confirmed_provider_transaction is unique
```

### INV-005

```text
confirmed_payment_history is not destructively editable
```

### INV-006

```text
graduate cannot mutate another graduate's data
```

### INV-007

```text
frozen_financial_plan does not change because event defaults changed
```

### INV-008

```text
thermo.status == AVAILABLE
only if financial_progress >= event.thermo_threshold
or an explicitly authorized administrative correction makes it eligible
```

### INV-009

```text
meal_selection belongs to an active member of the same graduate/event context
```

### INV-010

```text
cancelled graduate cannot create new ordinary operational mutations
```

---

# 27. Reglas expresamente descartadas

Las siguientes reglas NO existen en el baseline 1.0:

- recargo automático por atraso;
- penalización automática;
- selección individual de silla;
- mesa VIP;
- paquete premium;
- pago del termo como concepto independiente obligatorio;
- facturación electrónica;
- invitaciones digitales;
- RSVP;
- QR/check-in;
- roles administrativos configurables;
- reconocimiento automático del croquis;
- WhatsApp automatizado;
- eliminación destructiva de pagos confirmados.

Su implementación requerirá Change Request.

---

# 28. Parámetros configurables por evento

El modelo deberá permitir que cada evento configure, según corresponda:

| Parámetro | Configurable |
|---|---:|
| Nombre | Sí |
| Fecha | Sí |
| Lugar | Sí |
| Capacidad global | Sí |
| Precio/total base | Sí |
| Obligación inicial | Sí |
| Número/calendario de obligaciones | Sí |
| Fechas de vencimiento | Sí |
| Periodo de gracia | Sí |
| Fecha límite para lugares | Sí |
| Fecha límite para mesa | Sí |
| Fecha límite para platillos | Sí |
| Opciones de platillo | Sí |
| Umbral de termo | Sí |
| Política de cancelación/reembolso | Sí |
| Croquis y mesas | Sí |

Los valores precisos pertenecen a la configuración de cada evento, no al código.

---

# 29. Dependencias documentales

Las reglas aquí descritas deberán desglosarse de la siguiente forma:

### `SRS.md`
Convertirá cada regla relevante en requisitos funcionales y no funcionales trazables.

### `ROLES_PERMISSIONS.md`
Detallará autorización por operación/recurso.

### `FINANCIAL_DOMAIN.md`
Formalizará:
- ledger;
- aplicación de pagos;
- estados de obligaciones;
- congelamiento;
- Mercado Pago/OpenPay;
- ajustes;
- reembolsos.

### `SEATING_MAP.md`
Formalizará:
- modelo gráfico;
- asignaciones;
- grupos divididos;
- concurrencia;
- endpoints;
- reutilización de React-Konva.

### `API_CONTRACTS.md`
Mapeará reglas a:
- endpoints;
- payloads;
- estados;
- errores;
- idempotency keys.

### `ACCEPTANCE_CRITERIA.md`
Transformará los invariantes y reglas en escenarios verificables.

---

# 30. Control de cambios

Una regla de este documento solo podrá considerarse modificada cuando:

1. se identifique el `BR-*` afectado;
2. se documente el cambio;
3. se evalúe impacto en:
   - SRS;
   - UX;
   - datos;
   - API;
   - QA;
4. se incremente la versión correspondiente;
5. se actualicen documentos derivados.

No deberá modificarse una regla únicamente desde código.

---

# 31. Baseline

Con esta versión se establece:

```text
BUSINESS_RULES_VERSION = 1.0
```

El documento se considera baseline funcional para continuar con la especificación formal del sistema.

