# SRS.md

# Plataforma GR — Software Requirements Specification

**Documento:** `SRS.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline funcional para diseño técnico e implementación  
**Fecha:** 24 de agosto de 2026  
**Documentos fuente:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`  
**Propósito:** Especificar de forma trazable los requisitos funcionales y no funcionales de Plataforma GR.

---

# 1. Introducción

## 1.1 Propósito

Este documento define los requisitos del sistema Plataforma GR.

Debe utilizarse como fuente de verdad para:

- diseño de arquitectura;
- modelo de datos;
- contratos API;
- implementación frontend;
- implementación backend;
- integración con proveedores de pago;
- QA;
- criterios de aceptación;
- estimaciones;
- roadmap de desarrollo.

Toda funcionalidad implementada deberá poder trazarse a uno o más requisitos de este documento.

---

## 1.2 Alcance del sistema

Plataforma GR es una aplicación web single-tenant destinada a la administración operativa y financiera de eventos de graduación.

El sistema será utilizado por:

```text
ADMIN
GRADUATE
```

No incluye:

- invitaciones digitales;
- RSVP;
- QR/check-in;
- scanner;
- organizaciones multi-tenant;
- planners;
- staff;
- categorías VIP;
- selección individual de silla;
- facturación electrónica;
- recargos automáticos.

---

## 1.3 Documentos normativos

Este SRS deriva de:

1. `PRODUCT_SCOPE.md`
2. `BUSINESS_RULES.md`

En caso de conflicto:

1. una regla `BR-*` aprobada prevalece sobre una interpretación del requisito;
2. el SRS deberá corregirse para restaurar trazabilidad;
3. el código no podrá utilizarse como fuente normativa para cambiar el negocio.

---

## 1.4 Convenciones

### Requisitos funcionales

```text
FR-[DOMINIO]-[NÚMERO]
```

### Requisitos no funcionales

```text
NFR-[DOMINIO]-[NÚMERO]
```

### Prioridades

| Prioridad | Significado |
|---|---|
| P0 | Crítico para integridad, seguridad o flujo esencial |
| P1 | Obligatorio para el MVP |
| P2 | Importante, pero puede programarse después del núcleo P0/P1 |

---

# 2. Descripción general

## 2.1 Modelo conceptual

```text
Plataforma GR
│
├── ADMIN
│
├── Eventos
│   ├── Configuración
│   ├── Graduados
│   │   ├── Grupo / lugares
│   │   ├── Mesa
│   │   ├── Platillos
│   │   ├── Plan financiero
│   │   └── Termo
│   ├── Mesas / Croquis
│   ├── Pagos
│   ├── Platillos
│   ├── Termos
│   ├── Reportes
│   └── Auditoría
│
└── GRADUATE
    └── Autoservicio limitado a su(s) evento(s)
```

---

## 2.2 Roles

### ADMIN

Puede administrar la instancia completa, eventos, graduados, pagos, mesas, platillos, termos, reportes y auditoría.

Todos los administradores poseen el mismo rol lógico.

### GRADUATE

Puede operar exclusivamente la información correspondiente a sus propias membresías autorizadas.

---

# 3. Requisitos funcionales — Autenticación y cuentas

## FR-AUTH-001 — Inicio de sesión ADMIN

**Prioridad:** P0  
**Trazabilidad:** BR-GEN-002, BR-GEN-003

El sistema deberá permitir a una cuenta ADMIN autenticarse mediante credenciales válidas.

---

## FR-AUTH-002 — Inicio de sesión GRADUATE

**Prioridad:** P0  
**Trazabilidad:** BR-AUTH-002, BR-AUTH-007

El sistema deberá permitir a una cuenta GRADUATE autenticarse mediante credenciales válidas.

---

## FR-AUTH-003 — Registro contextual al evento

**Prioridad:** P0  
**Trazabilidad:** BR-AUTH-001

El sistema deberá permitir el registro de GRADUATE únicamente mediante un mecanismo asociado a un evento específico.

El usuario no podrá seleccionar arbitrariamente cualquier evento del sistema durante el registro.

---

## FR-AUTH-004 — Recuperación de contraseña

**Prioridad:** P1  
**Trazabilidad:** BR-AUTH-005

El sistema deberá permitir solicitar recuperación de contraseña mediante correo electrónico y token temporal.

---

## FR-AUTH-005 — Cierre de sesión

**Prioridad:** P1

El sistema deberá permitir cerrar la sesión activa desde la interfaz.

---

## FR-AUTH-006 — Múltiples dispositivos

**Prioridad:** P1  
**Trazabilidad:** BR-AUTH-006

Una cuenta GRADUATE deberá poder mantener sesiones válidas en múltiples dispositivos.

---

## FR-AUTH-007 — Selector de evento del graduado

**Prioridad:** P1  
**Trazabilidad:** BR-AUTH-002, BR-AUTH-003

Cuando una cuenta GRADUATE tenga más de una membresía autorizada, deberá poder seleccionar el evento que desea consultar u operar.

---

## FR-AUTH-008 — Rol determinado por backend

**Prioridad:** P0  
**Trazabilidad:** BR-AUTH-007, BR-SEC-005

El sistema no deberá aceptar un rol suministrado por frontend como fuente de autorización.

---

# 4. Requisitos funcionales — Administración de cuentas

## FR-ADM-001 — Listado de administradores

**Prioridad:** P1  
**Trazabilidad:** BR-GEN-003

El ADMIN deberá poder consultar las cuentas administrativas existentes.

---

## FR-ADM-002 — Crear administrador

**Prioridad:** P1

El ADMIN deberá poder crear/invitar una nueva cuenta administrativa con:

- nombre;
- correo electrónico;
- estado.

---

## FR-ADM-003 — Rol administrativo único

**Prioridad:** P0  
**Trazabilidad:** BR-GEN-002, BR-GEN-003

El sistema no deberá ofrecer configuración de subroles o permisos individualizados para cuentas ADMIN.

---

# 5. Requisitos funcionales — Dashboard global

## FR-DASH-001 — Dashboard ADMIN

**Prioridad:** P1

El sistema deberá presentar un dashboard global al ADMIN con, al menos:

- eventos activos;
- graduados registrados;
- total recaudado;
- saldo pendiente;
- saldo vencido;
- alertas operativas.

---

## FR-DASH-002 — Acceso a eventos desde dashboard

**Prioridad:** P1

El ADMIN deberá poder abrir un evento desde el dashboard global.

---

## FR-DASH-003 — Atención requerida

**Prioridad:** P1

El dashboard deberá permitir identificar y navegar a elementos que requieren atención, como:

- pagos vencidos;
- graduados sin mesa;
- platillos pendientes;
- termos en estados operativos pendientes.

---

# 6. Requisitos funcionales — Eventos

## FR-EVT-001 — Crear evento

**Prioridad:** P0  
**Trazabilidad:** BR-EVT-001

El ADMIN deberá poder crear un evento nuevo.

Todo evento nuevo deberá iniciar en estado:

```text
DRAFT
```

---

## FR-EVT-002 — Datos básicos del evento

**Prioridad:** P1

El sistema deberá permitir configurar:

- nombre;
- fecha;
- lugar;
- capacidad.

---

## FR-EVT-003 — Configuración financiera

**Prioridad:** P0

El ADMIN deberá poder configurar por evento:

- total/precio base aplicable;
- obligación inicial cuando aplique;
- número de obligaciones;
- fechas de vencimiento;
- periodo de gracia.

---

## FR-EVT-004 — Fechas límite

**Prioridad:** P1  
**Trazabilidad:** BR-EVT-010

El ADMIN deberá poder configurar fechas límite independientes para:

- agregar lugares/integrantes;
- cambiar mesa;
- seleccionar/modificar platillos.

---

## FR-EVT-005 — Umbral de termo

**Prioridad:** P1

El ADMIN deberá poder configurar el porcentaje financiero requerido para desbloquear el termo.

---

## FR-EVT-006 — Política de cancelación

**Prioridad:** P1

El ADMIN deberá poder configurar la política de cancelación/reembolso aplicable al evento.

---

## FR-EVT-007 — Abrir evento

**Prioridad:** P0  
**Trazabilidad:** BR-EVT-003

El sistema deberá permitir cambiar un evento correctamente configurado a estado:

```text
OPEN
```

---

## FR-EVT-008 — Cerrar evento

**Prioridad:** P1  
**Trazabilidad:** BR-EVT-004

El ADMIN deberá poder cambiar un evento `OPEN` a:

```text
CLOSED
```

El sistema deberá bloquear nuevas mutaciones ordinarias iniciadas por GRADUATE.

---

## FR-EVT-009 — Reabrir evento

**Prioridad:** P1  
**Trazabilidad:** BR-EVT-005

El ADMIN deberá poder cambiar un evento `CLOSED` a `OPEN`.

---

## FR-EVT-010 — Finalizar evento

**Prioridad:** P1  
**Trazabilidad:** BR-EVT-006, BR-EVT-007

El ADMIN deberá poder marcar el evento como:

```text
FINALIZED
```

La información deberá conservarse para consulta e históricos.

---

## FR-EVT-011 — Cancelar evento

**Prioridad:** P1  
**Trazabilidad:** BR-EVT-008

El ADMIN deberá poder cancelar un evento mediante motivo obligatorio.

---

## FR-EVT-012 — Auditar ciclo de vida

**Prioridad:** P0  
**Trazabilidad:** BR-EVT-009

Las transiciones administrativas relevantes del evento deberán quedar registradas en auditoría.

---

# 7. Requisitos funcionales — Graduados y membresías

## FR-GRAD-001 — Listar graduados

**Prioridad:** P1

El ADMIN deberá poder consultar los graduados asociados a un evento.

---

## FR-GRAD-002 — Buscar graduados

**Prioridad:** P1

El ADMIN deberá poder buscar graduados por datos operativos permitidos, incluyendo nombre y correo.

---

## FR-GRAD-003 — Filtrar graduados

**Prioridad:** P1

El sistema deberá permitir filtros operativos por estados relevantes, incluyendo:

- al día;
- pagos vencidos;
- sin mesa;
- platillos pendientes;
- termo disponible/estado.

---

## FR-GRAD-004 — Expediente administrativo

**Prioridad:** P0

El ADMIN deberá poder consultar un expediente consolidado del graduado con:

- información personal;
- lugares;
- integrantes;
- mesa(s);
- platillos;
- estado financiero;
- termo;
- historial administrativo relevante.

---

## FR-GRAD-005 — Aislamiento por evento

**Prioridad:** P0  
**Trazabilidad:** BR-GEN-005, BR-AUTH-002

Cada membresía de graduado deberá pertenecer inequívocamente a un evento.

---

## FR-GRAD-006 — Cancelar participación

**Prioridad:** P1  
**Trazabilidad:** BR-CAN-001 a BR-CAN-007

El ADMIN deberá poder cancelar la participación de un graduado indicando un motivo.

La operación no deberá eliminar su historia.

---

# 8. Requisitos funcionales — Lugares e integrantes

## FR-PLC-001 — Lugares vigentes

**Prioridad:** P0  
**Trazabilidad:** BR-PLC-002

El sistema deberá mantener la cantidad vigente de lugares de cada membresía de graduado.

---

## FR-PLC-002 — Integrantes nominales

**Prioridad:** P1  
**Trazabilidad:** BR-PLC-003

El sistema deberá permitir registrar integrantes nominales del grupo.

---

## FR-PLC-003 — Validar cantidad de integrantes

**Prioridad:** P0

La cantidad de integrantes activos no deberá exceder la cantidad de lugares vigentes.

---

## FR-PLC-004 — Agregar integrante/lugar

**Prioridad:** P1  
**Trazabilidad:** BR-PLC-004

El GRADUATE podrá agregar integrante/lugar únicamente cuando:

- el evento esté abierto;
- no haya vencido el deadline;
- exista capacidad global;
- se satisfagan condiciones financieras.

---

## FR-PLC-005 — Validación atómica de capacidad global

**Prioridad:** P0  
**Trazabilidad:** BR-PLC-005, BR-PLC-010

La confirmación de nuevos lugares deberá realizarse mediante una operación backend que impida exceder la capacidad global del evento bajo concurrencia.

---

## FR-PLC-006 — Solicitud/reducción de lugares

**Prioridad:** P1  
**Trazabilidad:** BR-PLC-006

La reducción de lugares no deberá ser confirmada unilateralmente por GRADUATE.

Requerirá acción/autorización ADMIN.

---

## FR-PLC-007 — Impacto financiero de reducción

**Prioridad:** P0  
**Trazabilidad:** BR-PLC-007, BR-PLC-008

El sistema deberá aplicar la reducción de lugares sin reescribir destructivamente obligaciones o pagos ya congelados.

---

## FR-PLC-008 — Confirmación comercial de lugares

**Prioridad:** P0  
**Trazabilidad:** BR-PLC-009, BR-INIT-001 a BR-INIT-004

Cuando el evento requiera una obligación inicial, los lugares se considerarán comercialmente confirmados al confirmarse dicha obligación.

---

# 9. Requisitos funcionales — Croquis y mesas

## FR-SEAT-001 — Croquis por evento

**Prioridad:** P1

Cada evento deberá poder contar con un croquis operativo independiente.

---

## FR-SEAT-002 — Fondo de referencia

**Prioridad:** P1  
**Trazabilidad:** BR-SEAT-004, BR-SEAT-005

El ADMIN podrá cargar como referencia:

- JPG;
- PNG;
- PDF convertido a imagen.

La imagen no constituirá la fuente de datos de las mesas.

---

## FR-SEAT-003 — Editor basado en canvas

**Prioridad:** P1

El editor administrativo deberá permitir:

- zoom;
- pan;
- selección;
- drag & drop de mesas.

---

## FR-SEAT-004 — Formas de mesa del MVP

**Prioridad:** P0  
**Trazabilidad:** BR-SEAT-002

La interfaz deberá permitir únicamente:

```text
SQUARE
ROUND
```

como formas oficiales del MVP.

---

## FR-SEAT-005 — Crear mesa

**Prioridad:** P1

El ADMIN deberá poder crear una mesa indicando:

- etiqueta/número;
- forma;
- capacidad;
- posición inicial.

---

## FR-SEAT-006 — Capacidad individual

**Prioridad:** P0  
**Trazabilidad:** BR-SEAT-003

Cada mesa deberá aceptar una capacidad independiente.

---

## FR-SEAT-007 — Mover mesa

**Prioridad:** P1

El ADMIN deberá poder cambiar la posición visual de una mesa mediante drag & drop.

---

## FR-SEAT-008 — Persistencia independiente de resolución

**Prioridad:** P1  
**Trazabilidad:** BR-SEAT-006

El sistema deberá persistir posiciones de forma que el croquis pueda renderizarse correctamente en diferentes resoluciones.

---

## FR-SEAT-009 — Duplicar mesa

**Prioridad:** P2

El ADMIN deberá poder duplicar una mesa para acelerar la construcción del croquis.

---

## FR-SEAT-010 — Crear múltiples mesas

**Prioridad:** P1  
**Trazabilidad:** BR-SEAT-018

El ADMIN deberá poder generar múltiples mesas indicando al menos:

- cantidad;
- forma;
- capacidad;
- número inicial.

---

## FR-SEAT-011 — Bloquear mesa

**Prioridad:** P1  
**Trazabilidad:** BR-SEAT-016

El ADMIN deberá poder bloquear una mesa para impedir nuevas selecciones.

---

## FR-SEAT-012 — Editar capacidad

**Prioridad:** P0  
**Trazabilidad:** BR-SEAT-017

El ADMIN podrá cambiar la capacidad de una mesa siempre que la nueva capacidad no sea inferior a los lugares ya asignados.

---

## FR-SEAT-013 — Eliminar mesa

**Prioridad:** P1  
**Trazabilidad:** BR-SEAT-015

El sistema no deberá permitir eliminación directa de una mesa con asignaciones activas.

---

## FR-SEAT-014 — Calcular ocupación

**Prioridad:** P0  
**Trazabilidad:** BR-SEAT-007, BR-SEAT-008

La ocupación y disponibilidad de una mesa deberán calcularse a partir de asignaciones vigentes.

---

## FR-SEAT-015 — Ver mesas como GRADUATE

**Prioridad:** P1  
**Trazabilidad:** BR-SEAT-009, BR-SEC-003

El GRADUATE deberá poder consultar el croquis en modo lectura y visualizar por mesa:

- etiqueta;
- capacidad;
- disponibilidad;
- estado.

No deberá visualizar PII de otros graduados.

---

## FR-SEAT-016 — Seleccionar mesa

**Prioridad:** P0

El GRADUATE deberá poder intentar asignar sus lugares a una mesa con capacidad suficiente.

---

## FR-SEAT-017 — Confirmar selección en backend

**Prioridad:** P0  
**Trazabilidad:** BR-SEAT-014

La asignación deberá confirmarse únicamente después de una validación backend atómica de capacidad.

---

## FR-SEAT-018 — Cambiar mesa dentro de deadline

**Prioridad:** P1  
**Trazabilidad:** BR-SEAT-012

El GRADUATE podrá cambiar mesa antes de la fecha límite si la nueva mesa posee capacidad suficiente.

---

## FR-SEAT-019 — Cambio administrativo de mesa

**Prioridad:** P1  
**Trazabilidad:** BR-SEAT-013

El ADMIN deberá poder cambiar asignaciones después del deadline registrando motivo.

---

## FR-SEAT-020 — Distribuir grupo entre mesas

**Prioridad:** P1  
**Trazabilidad:** BR-SEAT-010

El dominio deberá soportar asignar los lugares de un graduado entre más de una mesa.

El autoservicio deberá priorizar una sola mesa cuando sea posible.

---

## FR-SEAT-021 — Sin selección de silla

**Prioridad:** P0  
**Trazabilidad:** BR-SEAT-011

El sistema no deberá requerir selección individual de asiento/silla.

---

## FR-SEAT-022 — Conflicto concurrente

**Prioridad:** P0  
**Trazabilidad:** BR-SEAT-014, BR-CON-003

Cuando la mesa pierda capacidad suficiente antes de confirmar, el backend deberá rechazar la asignación y el frontend deberá solicitar una nueva selección.

---

# 10. Requisitos funcionales — Platillos

## FR-MEAL-001 — Configurar opciones por evento

**Prioridad:** P1  
**Trazabilidad:** BR-MEAL-001

El ADMIN deberá poder configurar opciones de platillo por evento.

---

## FR-MEAL-002 — Selección por integrante

**Prioridad:** P1  
**Trazabilidad:** BR-MEAL-002

El GRADUATE deberá poder seleccionar una opción para cada integrante activo.

---

## FR-MEAL-003 — Estado de completitud

**Prioridad:** P1  
**Trazabilidad:** BR-MEAL-003

El sistema deberá indicar si la selección del grupo está completa o tiene pendientes.

---

## FR-MEAL-004 — Bloqueo por deadline

**Prioridad:** P0  
**Trazabilidad:** BR-MEAL-004

Después de la fecha límite, el GRADUATE no deberá poder modificar selecciones.

---

## FR-MEAL-005 — Override ADMIN

**Prioridad:** P1  
**Trazabilidad:** BR-MEAL-005

El ADMIN podrá modificar una selección fuera de deadline con motivo obligatorio y auditoría.

---

## FR-MEAL-006 — No eliminar opción usada destructivamente

**Prioridad:** P1  
**Trazabilidad:** BR-MEAL-006

El sistema deberá impedir eliminar destructivamente una opción que tenga selecciones activas asociadas.

---

# 11. Requisitos funcionales — Dominio financiero

## FR-FIN-001 — Plan financiero por membresía

**Prioridad:** P0  
**Trazabilidad:** BR-FIN-001, BR-FIN-002

Cada membresía deberá contar con un `PaymentPlan` independiente.

---

## FR-FIN-002 — Obligaciones

**Prioridad:** P0

El plan deberá contener obligaciones `Installment` con:

- concepto;
- monto;
- fecha de vencimiento;
- estado derivado;
- orden.

---

## FR-FIN-003 — Calendario fijo del evento

**Prioridad:** P0  
**Trazabilidad:** BR-FIN-003

Las obligaciones deberán conservar las fechas de calendario configuradas para el evento.

---

## FR-FIN-004 — Alta tardía

**Prioridad:** P0  
**Trazabilidad:** BR-FIN-004

Al incorporar un graduado después de uno o más vencimientos, el sistema deberá generar las obligaciones aplicables con sus fechas originales.

---

## FR-FIN-005 — Congelamiento tras primer pago

**Prioridad:** P0  
**Trazabilidad:** BR-FIN-005

Una vez confirmado el primer pago, el plan deberá quedar congelado frente a cambios posteriores de defaults financieros del evento.

---

## FR-FIN-006 — Reconfiguración antes del primer pago

**Prioridad:** P1  
**Trazabilidad:** BR-FIN-006

Antes del primer pago confirmado, el ADMIN podrá regenerar/ajustar condiciones según reglas vigentes.

---

## FR-FIN-007 — Saldos derivados

**Prioridad:** P0  
**Trazabilidad:** BR-FIN-007, BR-FIN-008

El sistema deberá calcular:

- total contratado;
- total pagado;
- total pendiente;
- total vencido.

---

## FR-FIN-008 — Sin estado parcial de mensualidad

**Prioridad:** P0  
**Trazabilidad:** BR-FIN-009

Una obligación no deberá exponerse con estado comercial `PARTIALLY_PAID`.

---

## FR-FIN-009 — Pagos adelantados

**Prioridad:** P1  
**Trazabilidad:** BR-FIN-010

El graduado podrá liquidar obligaciones futuras antes de su vencimiento.

---

## FR-FIN-010 — Aplicación de pagos

**Prioridad:** P0  
**Trazabilidad:** BR-FIN-011 a BR-FIN-014

El motor financiero deberá aplicar montos confirmados sin perder excedentes y respetando el orden de aplicación definido.

---

## FR-FIN-011 — Periodo de gracia

**Prioridad:** P1  
**Trazabilidad:** BR-FIN-015

El cálculo de vencimiento deberá considerar el periodo de gracia configurado.

---

## FR-FIN-012 — Determinación de vencido

**Prioridad:** P0  
**Trazabilidad:** BR-FIN-016

El sistema deberá derivar automáticamente el estado vencido con base en fecha, gracia y cobertura financiera.

---

## FR-FIN-013 — Sin recargos automáticos

**Prioridad:** P0  
**Trazabilidad:** BR-FIN-017

El sistema no deberá generar cargos adicionales automáticamente por atraso.

---

## FR-FIN-014 — Historial financiero inmutable

**Prioridad:** P0  
**Trazabilidad:** BR-FIN-018, BR-FIN-019

Un pago confirmado no podrá editarse ni eliminarse directamente.

---

# 12. Requisitos funcionales — Mercado Pago

## FR-MP-001 — Proveedor primario

**Prioridad:** P0  
**Trazabilidad:** BR-PAY-001

Mercado Pago deberá operar como proveedor electrónico primario.

---

## FR-MP-002 — Checkout Pro

**Prioridad:** P0  
**Trazabilidad:** BR-PAY-002, BR-PAY-003

El flujo principal deberá utilizar Checkout Pro mediante redirección.

---

## FR-MP-003 — Crear intento/preferencia

**Prioridad:** P0  
**Trazabilidad:** BR-PAY-004

El backend deberá crear un intento/preferencia asociado a:

- cuenta;
- membresía;
- obligación(es);
- monto;
- identificador interno de intento.

---

## FR-MP-004 — Redirección

**Prioridad:** P1

El frontend deberá redirigir al usuario usando la URL entregada por el backend/proveedor.

---

## FR-MP-005 — Retorno no definitivo

**Prioridad:** P0  
**Trazabilidad:** BR-PAY-005

El frontend no deberá marcar el pago como confirmado únicamente por la URL de retorno.

---

## FR-MP-006 — Confirmación backend

**Prioridad:** P0  
**Trazabilidad:** BR-PAY-006

El backend deberá verificar la transacción con Mercado Pago antes de crear/aplicar un pago confirmado.

---

## FR-MP-007 — Estado de verificación

**Prioridad:** P1  
**Trazabilidad:** BR-PAY-007, BR-UX-003

El frontend deberá soportar el estado:

```text
Estamos confirmando tu pago
```

mientras el backend resuelve la confirmación.

---

## FR-MP-008 — Pago pendiente

**Prioridad:** P1

El sistema deberá soportar visualmente un pago pendiente de confirmación.

---

## FR-MP-009 — Pago rechazado/fallido

**Prioridad:** P1

El sistema deberá mostrar un estado de operación no completada sin declarar un cargo confirmado.

---

## FR-MP-010 — Idempotencia de webhook

**Prioridad:** P0  
**Trazabilidad:** BR-PAY-008, BR-PAY-009

La misma transacción externa no podrá producir más de un pago confirmado.

---

# 13. Requisitos funcionales — OpenPay

## FR-OPEN-001 — Proveedor secundario

**Prioridad:** P2  
**Trazabilidad:** BR-PAY-010

El sistema deberá permitir integrar OpenPay como proveedor electrónico secundario/alternativo.

---

## FR-OPEN-002 — Independencia del plan

**Prioridad:** P0  
**Trazabilidad:** BR-PAY-011

El uso de OpenPay no deberá modificar la estructura del plan financiero ni sus reglas.

---

# 14. Requisitos funcionales — Pagos manuales

## FR-MAN-001 — Registrar pago manual

**Prioridad:** P1  
**Trazabilidad:** BR-MAN-001 a BR-MAN-006

El ADMIN deberá poder registrar un pago mediante:

- efectivo;
- transferencia.

---

## FR-MAN-002 — Datos del pago manual

**Prioridad:** P1

La operación deberá registrar:

- graduado;
- evento;
- concepto;
- monto;
- fecha;
- método;
- ADMIN responsable.

---

## FR-MAN-003 — Referencia/nota

**Prioridad:** P1

El ADMIN deberá poder registrar referencia o nota.

---

## FR-MAN-004 — Evidencia

**Prioridad:** P2

El sistema deberá permitir adjuntar evidencia documental cuando corresponda.

---

## FR-MAN-005 — GRADUATE no confirma manualmente

**Prioridad:** P0  
**Trazabilidad:** BR-MAN-002

El GRADUATE no deberá poder marcar una obligación como pagada mediante flujo manual.

---

# 15. Requisitos funcionales — Ajustes y reembolsos

## FR-ADJ-001 — Registrar ajuste

**Prioridad:** P1

El ADMIN deberá poder crear un ajuste financiero relacionado con uno o más movimientos existentes.

---

## FR-ADJ-002 — Registrar reembolso

**Prioridad:** P1

El ADMIN deberá poder registrar un reembolso mediante movimiento independiente.

---

## FR-ADJ-003 — Motivo obligatorio

**Prioridad:** P0  
**Trazabilidad:** BR-ADJ-003

Todo ajuste/reembolso deberá contener motivo.

---

## FR-ADJ-004 — Preservar movimiento original

**Prioridad:** P0  
**Trazabilidad:** BR-ADJ-001, BR-ADJ-002

La operación original deberá permanecer inmutable y consultable.

---

## FR-ADJ-005 — Recalcular saldos

**Prioridad:** P0  
**Trazabilidad:** BR-ADJ-005

Los saldos deberán recalcularse considerando el conjunto vigente de movimientos.

---

# 16. Requisitos funcionales — Cartera y conciliación

## FR-CAR-001 — Cartera por evento

**Prioridad:** P1

El ADMIN deberá poder consultar la cartera de un evento.

---

## FR-CAR-002 — Estados de cartera

**Prioridad:** P1

La vista deberá distinguir al menos:

- al día;
- próximos;
- vencidos.

---

## FR-CAR-003 — Datos por graduado

**Prioridad:** P1

La cartera deberá mostrar por graduado:

- próximo pago;
- fecha;
- pendiente total;
- estado.

---

## FR-REC-001 — Conciliación

**Prioridad:** P1

El ADMIN deberá poder consultar discrepancias entre:

- obligaciones;
- pagos registrados;
- pagos confirmados por proveedor.

---

## FR-REC-002 — Estados de conciliación

**Prioridad:** P1

El sistema deberá soportar:

- sin diferencias;
- revisión necesaria;
- pendiente de confirmación.

---

## FR-REC-003 — Filtro de proveedor

**Prioridad:** P2

La conciliación deberá poder filtrarse por proveedor electrónico.

---

# 17. Requisitos funcionales — Termo

## FR-TH-001 — Estado de termo por membresía

**Prioridad:** P1

Cada membresía elegible deberá mantener un único flujo activo de termo.

---

## FR-TH-002 — Calcular elegibilidad

**Prioridad:** P0  
**Trazabilidad:** BR-THERMO-001 a BR-THERMO-004

El sistema deberá determinar `LOCKED` o `AVAILABLE` conforme al avance financiero y umbral del evento.

---

## FR-TH-003 — Solicitar termo

**Prioridad:** P1

El GRADUATE podrá solicitar el termo únicamente cuando se encuentre `AVAILABLE`.

---

## FR-TH-004 — Personalización

**Prioridad:** P1

El GRADUATE podrá capturar únicamente los atributos de personalización configurados/habilitados.

---

## FR-TH-005 — Marcar en producción

**Prioridad:** P1

Solo ADMIN podrá cambiar el estado a:

```text
IN_PRODUCTION
```

---

## FR-TH-006 — Bloquear edición en producción

**Prioridad:** P0  
**Trazabilidad:** BR-THERMO-008

La personalización no podrá modificarse por GRADUATE cuando el termo esté `IN_PRODUCTION`.

---

## FR-TH-007 — Marcar entregado

**Prioridad:** P1

Solo ADMIN podrá cambiar el estado a:

```text
DELIVERED
```

---

## FR-TH-008 — Auditar cambios de estado

**Prioridad:** P1

Las transiciones administrativas deberán quedar auditadas.

---

# 18. Requisitos funcionales — Notificaciones

## FR-NOT-001 — Centro de notificaciones

**Prioridad:** P1

El GRADUATE deberá contar con notificaciones visibles dentro de la plataforma.

---

## FR-NOT-002 — Notificaciones por correo

**Prioridad:** P1

El sistema deberá poder enviar notificaciones por correo electrónico.

---

## FR-NOT-003 — Recordatorio previo

**Prioridad:** P1  
**Trazabilidad:** BR-NOT-003

El sistema deberá soportar recordatorios automáticos antes de un vencimiento.

---

## FR-NOT-004 — Recordatorio posterior

**Prioridad:** P1  
**Trazabilidad:** BR-NOT-004

El sistema deberá soportar recordatorios posteriores cuando una obligación permanezca vencida.

---

## FR-NOT-005 — Pago confirmado

**Prioridad:** P1

El sistema deberá informar al graduado cuando un pago quede confirmado.

---

## FR-NOT-006 — Termo disponible

**Prioridad:** P1

El sistema deberá informar al graduado cuando su termo cambie a `AVAILABLE`.

---

# 19. Requisitos funcionales — Reportes

## FR-REP-001 — Hub de reportes

**Prioridad:** P1

El ADMIN deberá contar con acceso centralizado a reportes.

---

## FR-REP-002 — Reporte financiero

**Prioridad:** P1

Deberá mostrar por evento:

- total contratado;
- recaudado;
- pendiente;
- vencido.

---

## FR-REP-003 — Reporte de cartera

**Prioridad:** P1

Deberá mostrar por graduado:

- saldo;
- próximo vencimiento;
- estado.

---

## FR-REP-004 — Reporte de mesas

**Prioridad:** P1

Deberá mostrar:

- mesa;
- capacidad;
- ocupados;
- disponibles;
- asignaciones.

---

## FR-REP-005 — Reporte de platillos

**Prioridad:** P1

Deberá mostrar:

- totales por opción;
- pendientes;
- detalle operativo.

---

## FR-REP-006 — Reporte de termos

**Prioridad:** P1

Deberá mostrar:

- bloqueados;
- disponibles;
- solicitados;
- en producción;
- entregados.

---

## FR-REP-007 — Exportar Excel/CSV

**Prioridad:** P1

Los reportes operativos definidos deberán poder exportarse en formato Excel o CSV según corresponda.

---

## FR-REP-008 — Resumen PDF

**Prioridad:** P2

El sistema deberá poder generar reportes ejecutivos en PDF para los reportes que se definan como resumibles.

---

# 20. Requisitos funcionales — Auditoría

## FR-AUD-001 — Registrar operaciones críticas

**Prioridad:** P0  
**Trazabilidad:** BR-AUD-001

El sistema deberá generar auditoría para operaciones críticas definidas en reglas de negocio.

---

## FR-AUD-002 — Datos de auditoría

**Prioridad:** P0  
**Trazabilidad:** BR-AUD-002

Cada registro deberá almacenar al menos:

- actor;
- fecha/hora;
- acción;
- entidad;
- identificador;
- valores relevantes;
- motivo cuando aplique.

---

## FR-AUD-003 — Historial administrativo

**Prioridad:** P1

El ADMIN deberá poder consultar el historial en lenguaje operacional.

---

## FR-AUD-004 — No editar auditoría

**Prioridad:** P0  
**Trazabilidad:** BR-AUD-003

Los registros de auditoría no deberán ser editables desde la operación normal.

---

# 21. Requisitos funcionales — Perfil GRADUATE

## FR-PROF-001 — Consultar perfil

**Prioridad:** P1

El GRADUATE deberá poder consultar sus datos personales.

---

## FR-PROF-002 — Editar datos permitidos

**Prioridad:** P1

El GRADUATE podrá editar únicamente campos personales explícitamente permitidos.

No podrá modificar:

- rol;
- evento;
- plan financiero;
- pagos;
- capacidades;
- condiciones administrativas.

---

# 22. Requisitos funcionales — Resumen GRADUATE

## FR-SUM-001 — Inicio consolidado

**Prioridad:** P1

El inicio del GRADUATE deberá presentar:

- evento;
- fecha;
- lugar;
- avance financiero;
- saldo;
- próximo vencimiento;
- lugares;
- mesa;
- platillos;
- termo;
- alertas relevantes.

---

## FR-SUM-002 — Resumen final

**Prioridad:** P1

El GRADUATE deberá poder consultar una vista consolidada del estado de preparación de su graduación.

---

## FR-SUM-003 — Evento finalizado

**Prioridad:** P1

Cuando el evento esté `FINALIZED`, el GRADUATE deberá poder consultar su información histórica en modo lectura.

---

# 23. Requisitos no funcionales — Seguridad

## NFR-SEC-001 — Autorización backend

**Prioridad:** P0  
**Trazabilidad:** BR-SEC-005

Toda operación protegida deberá ser autorizada en backend.

---

## NFR-SEC-002 — Aislamiento de PII

**Prioridad:** P0  
**Trazabilidad:** BR-SEC-001 a BR-SEC-003

El sistema deberá impedir que un GRADUATE obtenga PII o información financiera de otros graduados.

---

## NFR-SEC-003 — Secretos de proveedores

**Prioridad:** P0

Credenciales de Mercado Pago, OpenPay, correo y otros servicios deberán permanecer fuera del frontend y repositorios públicos.

---

## NFR-SEC-004 — Contraseñas

**Prioridad:** P0

Las contraseñas deberán almacenarse mediante un algoritmo de hashing adaptativo reconocido para credenciales.

La selección exacta se fijará en arquitectura técnica.

---

## NFR-SEC-005 — Tokens de recuperación

**Prioridad:** P0

Los tokens de recuperación deberán:

- expirar;
- ser de un solo uso o invalidables;
- no almacenarse de forma recuperable si la arquitectura permite evitarlo.

---

## NFR-SEC-006 — Validación de entrada

**Prioridad:** P0

Toda entrada externa deberá validarse y normalizarse en backend.

---

## NFR-SEC-007 — Rate limiting

**Prioridad:** P1

Los endpoints sensibles de autenticación y operaciones susceptibles de abuso deberán contar con limitación de frecuencia.

Los límites numéricos se definirán en `NON_FUNCTIONAL_REQUIREMENTS.md`.

---

# 24. Requisitos no funcionales — Concurrencia e integridad

## NFR-CON-001 — Operaciones transaccionales

**Prioridad:** P0  
**Trazabilidad:** BR-CON-001

Las operaciones que afecten:

- capacidad del evento;
- capacidad de mesas;
- pagos;
- ajustes;

deberán ejecutarse con garantías transaccionales suficientes para preservar invariantes.

---

## NFR-CON-002 — Selección de mesa concurrente

**Prioridad:** P0

Dos solicitudes concurrentes no deberán producir sobrecupo.

---

## NFR-CON-003 — Capacidad de evento concurrente

**Prioridad:** P0

Dos operaciones concurrentes de incremento/confirmación de lugares no deberán superar la capacidad global.

---

## NFR-CON-004 — Idempotencia de proveedor

**Prioridad:** P0

La misma notificación externa podrá procesarse repetidamente sin duplicar efectos financieros.

---

## NFR-CON-005 — Idempotencia administrativa

**Prioridad:** P1

Las operaciones administrativas financieras sensibles deberán contar con una estrategia para evitar duplicados por reintento.

---

# 25. Requisitos no funcionales — Rendimiento

## NFR-PERF-001 — Uso concurrente

**Prioridad:** P1

El sistema deberá soportar múltiples ADMIN y GRADUATE conectados simultáneamente sin pérdida de integridad.

---

## NFR-PERF-002 — Operaciones de lectura

**Prioridad:** P1

Las vistas principales deberán cargar con tiempos compatibles con una aplicación web interactiva bajo la carga objetivo acordada.

**Métrica exacta:** TBD técnico antes de pruebas de carga.

---

## NFR-PERF-003 — Operaciones críticas

**Prioridad:** P1

Las operaciones de confirmación de mesa y aplicación de pago deberán devolver un resultado definitivo o estado de procesamiento sin bloquear la UI indefinidamente.

---

## NFR-PERF-004 — Croquis

**Prioridad:** P1

El editor deberá mantener una interacción fluida con decenas o cientos de mesas dentro de los tamaños de evento objetivo.

**Límite de prueba exacto:** TBD técnico en `SEATING_MAP.md`.

---

# 26. Requisitos no funcionales — Disponibilidad y resiliencia

## NFR-REL-001 — Persistencia transaccional

**Prioridad:** P0

Una operación confirmada al usuario no deberá perderse por una actualización posterior de interfaz.

---

## NFR-REL-002 — Reintento seguro

**Prioridad:** P0

Los reintentos por errores de red no deberán generar duplicados en operaciones financieras.

---

## NFR-REL-003 — Webhooks duplicados

**Prioridad:** P0

El backend deberá asumir que un proveedor puede reenviar notificaciones.

---

## NFR-REL-004 — Recuperación ante proveedor

**Prioridad:** P1

Si una confirmación de proveedor no puede procesarse temporalmente, el sistema deberá conservar información suficiente para reintentar/reconciliar posteriormente.

---

# 27. Requisitos no funcionales — UX y dispositivos

## NFR-UX-001 — ADMIN desktop-first

**Prioridad:** P1

La interfaz ADMIN se diseñará principalmente para escritorio y deberá funcionar en tablet.

---

## NFR-UX-002 — GRADUATE mobile-first

**Prioridad:** P1

La interfaz GRADUATE se diseñará principalmente para dispositivos móviles.

---

## NFR-UX-003 — Lenguaje natural

**Prioridad:** P1  
**Trazabilidad:** BR-UX-001

La UI deberá utilizar lenguaje operacional y no términos técnicos innecesarios.

---

## NFR-UX-004 — Estados transversales

**Prioridad:** P1

Las interfaces deberán contemplar al menos:

- loading;
- vacío;
- error;
- sin conexión;
- acción completada.

---

## NFR-UX-005 — Prevención de acciones inválidas

**Prioridad:** P1

La UI deberá deshabilitar u ocultar acciones no disponibles cuando pueda determinarlo de forma segura, sin sustituir la validación backend.

---

# 28. Requisitos no funcionales — Accesibilidad

## NFR-A11Y-001 — Navegación

**Prioridad:** P1

Las acciones esenciales deberán poder operarse sin depender exclusivamente de color o gestos no evidentes.

---

## NFR-A11Y-002 — Contraste y legibilidad

**Prioridad:** P1

La interfaz deberá utilizar contraste y tamaños de texto compatibles con prácticas modernas de accesibilidad.

**Nivel WCAG objetivo:** TBD técnico en `NON_FUNCTIONAL_REQUIREMENTS.md`.

---

## NFR-A11Y-003 — Formularios

**Prioridad:** P1

Los formularios deberán incluir etiquetas, mensajes de error comprensibles y foco identificable.

---

# 29. Requisitos no funcionales — Auditoría y observabilidad

## NFR-OBS-001 — Logs técnicos

**Prioridad:** P1

El backend deberá generar logs técnicos suficientes para diagnosticar errores sin exponer secretos.

---

## NFR-OBS-002 — Correlación de pagos

**Prioridad:** P0

Los intentos y confirmaciones de pago deberán poder correlacionarse entre:

- request interno;
- proveedor;
- transacción;
- aplicación financiera.

---

## NFR-OBS-003 — Errores de webhook

**Prioridad:** P0

Los fallos de procesamiento de webhooks deberán quedar registrados para diagnóstico y reintento.

---

# 30. Requisitos no funcionales — Datos y almacenamiento

## NFR-DATA-001 — Base de datos relacional

**Prioridad:** P0

El dominio transaccional deberá utilizar persistencia capaz de soportar:

- relaciones;
- restricciones;
- transacciones;
- unicidad;
- concurrencia.

---

## NFR-DATA-002 — Restricciones de integridad

**Prioridad:** P0

Siempre que sea posible, invariantes como unicidad de transacción externa deberán reforzarse mediante restricciones de base de datos además de validación de aplicación.

---

## NFR-DATA-003 — Archivos

**Prioridad:** P1

Los archivos como:

- fondos de croquis;
- evidencias de pago;

deberán almacenarse fuera de los registros transaccionales principales, conservando referencias seguras.

---

# 31. Requisitos no funcionales — Portabilidad del croquis

## NFR-MAP-001 — Coordenadas normalizadas

**Prioridad:** P1

La persistencia del croquis no deberá depender de dimensiones CSS/píxeles del dispositivo utilizado para editarlo.

---

## NFR-MAP-002 — Reutilización gráfica

**Prioridad:** P1

La implementación podrá reutilizar el motor React-Konva del proyecto `Soft-Monkey_InvitacionesPremium`, siempre que el dominio resultante respete las restricciones funcionales de Plataforma GR.

---

## NFR-MAP-003 — Separación dominio/render

**Prioridad:** P1

Las entidades de mesa y asignación deberán ser independientes del componente gráfico utilizado para renderizarlas.

---

# 32. Requisitos no funcionales — Compatibilidad

## NFR-COMP-001 — Navegadores modernos

**Prioridad:** P1

El sistema deberá funcionar en versiones modernas soportadas de navegadores basados en Chromium y navegadores equivalentes utilizados por los usuarios objetivo.

La matriz exacta se definirá antes de QA de compatibilidad.

---

## NFR-COMP-002 — Responsive GRADUATE

**Prioridad:** P1

La experiencia GRADUATE deberá adaptarse a anchos móviles comunes sin scroll horizontal estructural.

---

# 33. Requisitos no funcionales — Mantenibilidad

## NFR-MNT-001 — Separación por dominio

**Prioridad:** P1

El código deberá separar claramente dominios como:

- autenticación;
- eventos;
- graduados;
- mesas;
- finanzas;
- pagos;
- platillos;
- termos;
- reportes;
- auditoría.

---

## NFR-MNT-002 — Configuración externa

**Prioridad:** P0

Secretos, URLs de proveedores y configuraciones sensibles no deberán estar hardcodeadas en frontend.

---

## NFR-MNT-003 — Migraciones reproducibles

**Prioridad:** P0

Toda modificación de esquema de base de datos deberá contar con migraciones reproducibles y versionadas.

---

## NFR-MNT-004 — Pruebas automatizadas de invariantes

**Prioridad:** P0

Los invariantes críticos definidos en `BUSINESS_RULES.md` deberán contar con pruebas automatizadas.

---

# 34. Requisitos no funcionales — Privacidad

## NFR-PRIV-001 — Minimización de datos

**Prioridad:** P1

Cada interfaz y endpoint deberá retornar únicamente los datos necesarios para la operación solicitada.

---

## NFR-PRIV-002 — Croquis sin PII

**Prioridad:** P0

La vista de croquis para GRADUATE no deberá exponer PII de otros grupos.

---

## NFR-PRIV-003 — Reportes ADMIN

**Prioridad:** P1

Los reportes con datos personales o financieros deberán estar restringidos a ADMIN.

---

# 35. Requisitos de integración

## INT-001 — Mercado Pago

La integración deberá soportar:

- creación de preferencias/intentos;
- redirección;
- identificación de intento;
- recepción de notificaciones;
- verificación server-to-server;
- idempotencia;
- conciliación.

---

## INT-002 — OpenPay

La integración secundaria deberá integrarse sin modificar el modelo central de obligaciones.

---

## INT-003 — Correo electrónico

El sistema deberá disponer de un proveedor de correo para:

- recuperación de contraseña;
- recordatorios;
- notificaciones operativas.

---

## INT-004 — Almacenamiento de archivos

El sistema deberá disponer de un mecanismo de almacenamiento para:

- croquis;
- evidencias;
- archivos exportados temporales cuando corresponda.

---

# 36. Requisitos de estados de negocio

## 36.1 Evento

```text
DRAFT
OPEN
CLOSED
FINALIZED
CANCELLED
```

## 36.2 Termo

```text
LOCKED
AVAILABLE
REQUESTED
IN_PRODUCTION
DELIVERED
```

## 36.3 Mesa

Como mínimo:

```text
AVAILABLE
BLOCKED
```

La ocupación/completitud será derivada de capacidad y asignaciones.

## 36.4 Obligación financiera

Los estados concretos deberán formalizarse en `FINANCIAL_DOMAIN.md`, conservando como mínimo la capacidad de representar:

- futura;
- próxima;
- pendiente;
- vencida;
- pagada;
- cancelada/ajustada.

---

# 37. Requisitos de errores de negocio

Los contratos API deberán contemplar categorías equivalentes a:

```text
NOT_AUTHORIZED
EVENT_NOT_OPEN
DEADLINE_CLOSED
EVENT_CAPACITY_EXCEEDED
TABLE_CAPACITY_CHANGED
TABLE_BLOCKED
FINANCIAL_PLAN_FROZEN
PAYMENT_ALREADY_PROCESSED
PAYMENT_PENDING_CONFIRMATION
INVALID_INSTALLMENT_AMOUNT
THERMO_LOCKED
THERMO_IN_PRODUCTION
GRADUATE_CANCELLED
```

La codificación HTTP y payload final se definirá en `API_CONTRACTS.md`.

---

# 38. Matriz de trazabilidad de alto nivel

| Dominio | PRODUCT_SCOPE | BUSINESS_RULES | SRS |
|---|---|---|---|
| Roles | §6–7 | BR-GEN / BR-AUTH | FR-AUTH / FR-ADM |
| Eventos | §8 | BR-EVT | FR-EVT |
| Lugares | §8.6 | BR-PLC | FR-PLC |
| Mesas | §9 | BR-SEAT | FR-SEAT |
| Platillos | §10 | BR-MEAL | FR-MEAL |
| Finanzas | §11–14 | BR-FIN / BR-INIT | FR-FIN |
| Mercado Pago | §12 | BR-PAY | FR-MP |
| OpenPay | §12.3 | BR-PAY | FR-OPEN |
| Manuales | §11.4 | BR-MAN | FR-MAN |
| Ajustes | §11.5 | BR-ADJ | FR-ADJ |
| Termo | §15 | BR-THERMO | FR-TH |
| Notificaciones | §19 | BR-NOT | FR-NOT |
| Reportes | §16 | BR-REP | FR-REP |
| Auditoría | §17 | BR-AUD | FR-AUD |
| Seguridad | §20 | BR-SEC | NFR-SEC / NFR-PRIV |
| Concurrencia | §21 | BR-CON | NFR-CON |

---

# 39. Criterios de aceptación sistémicos mínimos

El sistema no podrá considerarse funcionalmente aceptable si cualquiera de los siguientes escenarios falla:

### AC-SYS-001

Dos graduados no pueden provocar sobrecupo de una mesa mediante solicitudes concurrentes.

### AC-SYS-002

Dos confirmaciones concurrentes de lugares no pueden superar la capacidad del evento.

### AC-SYS-003

Un webhook duplicado no puede duplicar un pago.

### AC-SYS-004

Un GRADUATE no puede consultar información de otro graduado cambiando IDs o rutas.

### AC-SYS-005

Modificar defaults financieros del evento no cambia un plan congelado.

### AC-SYS-006

Un pago confirmado no puede eliminarse desde una operación normal.

### AC-SYS-007

Un termo no puede solicitarse antes de cumplir el umbral.

### AC-SYS-008

Una personalización no puede modificarse después de `IN_PRODUCTION`.

### AC-SYS-009

Un graduado no puede modificar mesa después del deadline, pero ADMIN sí puede hacerlo con auditoría.

### AC-SYS-010

Una mesa no puede reducir su capacidad por debajo de los lugares ya asignados.

---

# 40. Requisitos pendientes de cuantificación técnica

Los siguientes elementos no están definidos como decisiones de negocio y deberán cerrarse en `NON_FUNCTIONAL_REQUIREMENTS.md` o arquitectura antes de producción:

1. tiempo objetivo de respuesta P95/P99;
2. concurrencia objetivo para prueba de carga;
3. número máximo soportado de mesas por croquis;
4. límites de tamaño para imágenes/PDF;
5. expiración exacta del token de recuperación;
6. rate limits numéricos;
7. política de retención de logs;
8. estrategia y RPO/RTO de backups;
9. nivel WCAG objetivo;
10. matriz exacta de navegadores;
11. política de retención de evidencias de pago;
12. duración/estrategia de polling para estados de pago y disponibilidad.

Estos puntos se consideran **TBD técnicos**, no huecos de negocio.

---

# 41. Exclusiones normativas

El SRS no autoriza la implementación de:

- invitaciones digitales;
- invitaciones premium;
- RSVP;
- QR/check-in;
- scanner;
- hostess;
- wedding planners;
- organizaciones;
- multi-tenant;
- marketplace;
- selección individual de silla;
- reconocimiento automático de croquis;
- categorías VIP;
- paquetes premium;
- venta de fotografías;
- facturación electrónica;
- recargos automáticos;
- WhatsApp automatizado;
- permisos administrativos configurables;
- aplicación móvil nativa.

Cualquier incorporación requiere un Change Request y actualización de este documento.

---

# 42. Documentos derivados

El siguiente nivel de documentación deberá continuar con:

1. `ROLES_PERMISSIONS.md`
2. `UX_FLOWS.md`
3. `FINANCIAL_DOMAIN.md`
4. `SEATING_MAP.md`
5. `DATA_MODEL.md`
6. `API_CONTRACTS.md`
7. `NON_FUNCTIONAL_REQUIREMENTS.md`
8. `ACCEPTANCE_CRITERIA.md`
9. `ROADMAP_IMPLEMENTATION.md`

---

# 43. Baseline

Con esta versión se establece:

```text
SRS_VERSION = 1.0
```

El SRS se considera baseline funcional para iniciar diseño detallado de dominio, datos, APIs y arquitectura.

