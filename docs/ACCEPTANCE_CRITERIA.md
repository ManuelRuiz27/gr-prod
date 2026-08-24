# ACCEPTANCE_CRITERIA.md

# Plataforma GR — Criterios de Aceptación

**Documento:** `ACCEPTANCE_CRITERIA.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline de QA y Definition of Done  
**Fecha:** 24 de agosto de 2026  
**Documentos fuente:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `UX_FLOWS.md`, `FINANCIAL_DOMAIN.md`, `SEATING_MAP.md`, `DATA_MODEL.md`, `API_CONTRACTS.md`, `NON_FUNCTIONAL_REQUIREMENTS.md`  
**Propósito:** Convertir los requisitos funcionales y no funcionales de Plataforma GR en condiciones objetivas, repetibles y verificables de aceptación.

---

# 1. Propósito

Este documento define qué significa que una funcionalidad esté:

```text
ACEPTADA
```

y no únicamente:

```text
IMPLEMENTADA
```

Los criterios deberán utilizarse para:

- QA manual;
- pruebas automatizadas;
- pruebas de integración;
- pruebas E2E;
- pruebas contractuales;
- pruebas de seguridad;
- pruebas de concurrencia;
- pruebas de rendimiento;
- validación de release;
- aceptación de tickets;
- Definition of Done.

Una historia, módulo o release no deberá considerarse terminado si incumple un criterio `P0` relacionado.

---

# 2. Convenciones

Formato:

```text
AC-[DOMINIO]-[NÚMERO]
```

Ejemplos:

```text
AC-AUTH-001
AC-SEAT-014
AC-FIN-022
```

Prioridades:

| Prioridad | Significado |
|---|---|
| `P0` | Crítico. Bloquea release |
| `P1` | Obligatorio para MVP |
| `P2` | Importante, no bloquea núcleo inicial salvo dependencia |

---

# 3. Formato Given / When / Then

Cada criterio deberá interpretarse como:

```text
GIVEN   contexto inicial
WHEN    acción o condición
THEN    resultado verificable
```

Ejemplo:

```text
GIVEN una mesa con 8 lugares disponibles
WHEN dos graduados de 8 lugares intentan confirmarla simultáneamente
THEN solo una operación deberá persistir
AND la otra deberá recibir TABLE_CAPACITY_CHANGED
AND la mesa nunca deberá superar su capacidad
```

---

# 4. Regla general de aceptación

Una funcionalidad se considera aceptada únicamente cuando:

1. cumple su flujo feliz;
2. cumple escenarios negativos;
3. respeta autorización;
4. respeta reglas de negocio;
5. preserva integridad bajo concurrencia cuando aplique;
6. genera auditoría cuando corresponde;
7. devuelve contratos API definidos;
8. cumple NFR P0 relacionados.

---

# 5. Autenticación

## AC-AUTH-001 — Login ADMIN

**Prioridad:** P0  
**Trazabilidad:** FR-AUTH-001

**Given** una cuenta `ADMIN` activa con credenciales válidas.  
**When** envía correo y contraseña correctos.  
**Then** el sistema autentica la cuenta.  
**And** devuelve identidad con rol `ADMIN`.  
**And** permite acceso a recursos administrativos.

---

## AC-AUTH-002 — Login GRADUATE

**Prioridad:** P0  
**Trazabilidad:** FR-AUTH-002

**Given** una cuenta `GRADUATE` activa.  
**When** envía credenciales correctas.  
**Then** obtiene una sesión válida.  
**And** no obtiene permisos administrativos.

---

## AC-AUTH-003 — Credenciales inválidas

**Prioridad:** P0

**Given** una cuenta existente.  
**When** la contraseña es incorrecta.  
**Then** la autenticación es rechazada.  
**And** la respuesta no incluye password hash ni datos internos.

---

## AC-AUTH-004 — Cuenta deshabilitada

**Prioridad:** P0

**Given** una cuenta `DISABLED`.  
**When** intenta iniciar sesión.  
**Then** la autenticación es rechazada.

---

## AC-AUTH-005 — Role escalation

**Prioridad:** P0

**Given** un GRADUATE autenticado.  
**When** envía `"role": "ADMIN"` en cualquier request.  
**Then** sus permisos no cambian.  
**And** el backend continúa tratándolo como `GRADUATE`.

---

# 6. Registro y membresía

## AC-REG-001 — Registro contextual

**Prioridad:** P0

**Given** un mecanismo de acceso válido para Evento A.  
**When** un usuario completa el registro.  
**Then** la membresía se crea para Evento A.

---

## AC-REG-002 — Evento arbitrario

**Prioridad:** P0

**Given** acceso autorizado a Evento A.  
**When** el cliente manipula el request para enviar `event_id` de Evento B.  
**Then** no se crea membresía en Evento B.

---

## AC-REG-003 — Membresía duplicada

**Prioridad:** P0

**Given** una cuenta ya vinculada a Evento A.  
**When** se intenta crear otra membresía idéntica.  
**Then** el sistema rechaza o reutiliza de forma controlada la membresía existente.  
**And** nunca existen dos membresías activas duplicadas para `account_id + event_id`.

---

## AC-REG-004 — Cuenta con múltiples eventos

**Prioridad:** P1

**Given** una misma cuenta vinculada a dos eventos diferentes.  
**When** consulta `/me/events`.  
**Then** ambos eventos aparecen.  
**And** sus datos financieros, mesas y grupos permanecen independientes.

---

# 7. Recuperación de contraseña

## AC-RESET-001

**Prioridad:** P0

**Given** una cuenta existente.  
**When** solicita recuperación.  
**Then** recibe respuesta genérica.  
**And** se genera un token temporal.

---

## AC-RESET-002

**Prioridad:** P0

**Given** un correo inexistente.  
**When** solicita recuperación.  
**Then** la respuesta pública es equivalente a la de una cuenta existente.

---

## AC-RESET-003

**Prioridad:** P0

**Given** un token válido.  
**When** se utiliza una vez.  
**Then** la contraseña cambia.  
**And** el token queda inutilizable.

---

## AC-RESET-004

**Prioridad:** P0

**Given** un token con más de 30 minutos de antigüedad.  
**When** se intenta utilizar.  
**Then** devuelve `RESET_TOKEN_EXPIRED`.

---

# 8. Eventos

## AC-EVT-001 — Crear evento

**Prioridad:** P0

**Given** un ADMIN autenticado.  
**When** crea un evento válido.  
**Then** el evento se crea en `DRAFT`.

---

## AC-EVT-002 — GRADUATE crea evento

**Prioridad:** P0

**Given** un GRADUATE autenticado.  
**When** intenta crear un evento directamente por API.  
**Then** recibe `403`.

---

## AC-EVT-003 — Abrir evento

**Prioridad:** P1

**Given** un evento `DRAFT` correctamente configurado.  
**When** ADMIN ejecuta transición `OPEN`.  
**Then** el evento queda `OPEN`.  
**And** la transición queda auditada.

---

## AC-EVT-004 — Cerrar evento

**Prioridad:** P1

**Given** un evento `OPEN`.  
**When** ADMIN lo cierra.  
**Then** cambia a `CLOSED`.  
**And** las mutaciones ordinarias GRADUATE quedan bloqueadas.

---

## AC-EVT-005 — Reabrir evento

**Prioridad:** P1

**Given** un evento `CLOSED`.  
**When** ADMIN lo reabre.  
**Then** regresa a `OPEN`.  
**And** queda registro de auditoría.

---

## AC-EVT-006 — Finalizar evento

**Prioridad:** P1

**Given** un evento operativo concluido.  
**When** ADMIN lo finaliza.  
**Then** queda `FINALIZED`.  
**And** la información permanece consultable.

---

## AC-EVT-007 — Cancelar evento

**Prioridad:** P1

**Given** un evento no cancelado.  
**When** ADMIN solicita cancelarlo sin motivo.  
**Then** el sistema rechaza la operación.

---

## AC-EVT-008

**Prioridad:** P1

**Given** un evento no cancelado.  
**When** ADMIN lo cancela con motivo válido.  
**Then** queda `CANCELLED`.  
**And** no se eliminan graduados ni pagos.  
**And** se bloquean mutaciones ordinarias GRADUATE.

---

# 9. Dashboard ADMIN

## AC-DASH-001

**Prioridad:** P1

**Given** múltiples eventos con actividad.  
**When** ADMIN abre Inicio.  
**Then** visualiza al menos:

- eventos activos;
- graduados;
- recaudado;
- pendiente;
- vencido.

---

## AC-DASH-002

**Prioridad:** P1

**Given** graduados con pagos vencidos.  
**When** abre el dashboard.  
**Then** existe una señal operativa que permite navegar a los vencidos.

---

# 10. Lugares e integrantes

## AC-PLC-001 — Integrantes no exceden lugares

**Prioridad:** P0

**Given** una membresía con 8 lugares.  
**When** ya existen 8 integrantes activos.  
**Then** no puede agregarse un noveno integrante sin aumentar lugares.

---

## AC-PLC-002 — Deadline

**Prioridad:** P0

**Given** el deadline de lugares vencido.  
**When** GRADUATE intenta agregar integrante.  
**Then** la operación es rechazada.

---

## AC-PLC-003 — Capacidad global

**Prioridad:** P0

**Given** un evento sin lugares disponibles.  
**When** se intenta confirmar un lugar adicional.  
**Then** devuelve `EVENT_CAPACITY_EXCEEDED`.

---

## AC-PLC-004 — Capacidad concurrente

**Prioridad:** P0

**Given** un evento con 5 lugares disponibles.  
**When** dos operaciones concurrentes intentan confirmar 5 lugares cada una.  
**Then** solo una puede confirmar.  
**And** la capacidad del evento nunca se excede.

---

## AC-PLC-005 — Reducción GRADUATE

**Prioridad:** P0

**Given** un GRADUATE con 8 lugares.  
**When** intenta reducir directamente su cantidad a 6 mediante API no autorizada.  
**Then** la reducción no se confirma unilateralmente.

---

## AC-PLC-006 — Reducción ADMIN

**Prioridad:** P1

**Given** una reducción autorizada.  
**When** ADMIN cambia de 8 a 6 lugares con motivo.  
**Then** la membresía refleja 6 lugares.  
**And** se conserva auditoría.  
**And** el impacto financiero respeta congelamiento.

---

# 11. Grupo

## AC-GRP-001

**Prioridad:** P1

**Given** una membresía de 8 lugares.  
**When** el GRADUATE consulta Mi grupo.  
**Then** visualiza sus integrantes y número de lugares.

---

## AC-GRP-002 — Privacidad

**Prioridad:** P0

**Given** Graduate A.  
**When** intenta acceder a los integrantes de Graduate B.  
**Then** recibe `403` o respuesta segura equivalente.

---

# 12. Croquis ADMIN

## AC-SEAT-001 — Crear mesa cuadrada

**Prioridad:** P1

**Given** un croquis editable.  
**When** ADMIN crea una mesa `SQUARE` con capacidad 10.  
**Then** se persiste correctamente.

---

## AC-SEAT-002 — Crear mesa redonda

**Prioridad:** P1

**Given** un croquis editable.  
**When** ADMIN crea una mesa `ROUND`.  
**Then** se renderiza como circular.

---

## AC-SEAT-003 — Shape inválido

**Prioridad:** P0

**Given** el MVP.  
**When** se envía `shape = VIP` o `RECTANGLE`.  
**Then** el backend rechaza el valor como no permitido.

---

## AC-SEAT-004 — Capacidad variable

**Prioridad:** P1

**Given** Mesa 1 capacidad 8 y Mesa 2 capacidad 12.  
**When** se consulta el croquis.  
**Then** cada mesa conserva su capacidad independiente.

---

## AC-SEAT-005 — Crear múltiples mesas

**Prioridad:** P1

**Given** ADMIN en el editor.  
**When** solicita 30 mesas cuadradas de capacidad 10 iniciando en 1.  
**Then** se crean 30 mesas etiquetadas consecutivamente.

---

## AC-SEAT-006 — Coordenadas normalizadas

**Prioridad:** P0

**Given** una mesa movida en el canvas.  
**When** se guarda su posición.  
**Then** `x` y `y` quedan en rango `0..1`.

---

## AC-SEAT-007 — Render multi-resolución

**Prioridad:** P1

**Given** el mismo croquis persistido.  
**When** se abre en dos resoluciones diferentes.  
**Then** las posiciones relativas se conservan.

---

## AC-SEAT-008 — Fondo

**Prioridad:** P1

**Given** un mapa con mesas existentes.  
**When** ADMIN cambia/elimina la imagen de fondo.  
**Then** las mesas permanecen.

---

## AC-SEAT-009 — Eliminar mesa ocupada

**Prioridad:** P0

**Given** una mesa con asignaciones activas.  
**When** ADMIN intenta eliminarla.  
**Then** recibe `TABLE_HAS_ASSIGNMENTS`.

---

## AC-SEAT-010 — Reducir capacidad inválida

**Prioridad:** P0

**Given** una mesa de capacidad 10 con 8 lugares ocupados.  
**When** ADMIN intenta cambiar capacidad a 6.  
**Then** recibe `TABLE_CAPACITY_BELOW_OCCUPANCY`.

---

## AC-SEAT-011 — Bloquear mesa

**Prioridad:** P1

**Given** una mesa `AVAILABLE`.  
**When** ADMIN la bloquea.  
**Then** queda `BLOCKED`.  
**And** conserva asignaciones existentes.

---

# 13. Croquis GRADUATE

## AC-SEAT-012 — Vista segura

**Prioridad:** P0

**Given** un GRADUATE consultando el croquis.  
**When** recibe la respuesta.  
**Then** puede ver capacidad, ocupación y disponibilidad.  
**And** no recibe nombres, teléfonos ni correos de otros grupos.

---

## AC-SEAT-013 — Selección exacta

**Prioridad:** P0

**Given** una mesa con 8 lugares disponibles.  
**And** un graduado con 8 lugares activos.  
**When** confirma la mesa.  
**Then** la asignación se realiza con 8 lugares.

---

## AC-SEAT-014 — Capacidad insuficiente

**Prioridad:** P0

**Given** una mesa con 7 lugares disponibles.  
**And** un graduado requiere 8.  
**When** intenta confirmarla.  
**Then** la operación se rechaza.

---

## AC-SEAT-015 — Mesa bloqueada

**Prioridad:** P0

**Given** una mesa `BLOCKED`.  
**When** GRADUATE intenta elegirla.  
**Then** recibe `TABLE_BLOCKED`.

---

## AC-SEAT-016 — Cambio dentro del deadline

**Prioridad:** P1

**Given** GRADUATE en Mesa 10.  
**And** deadline abierto.  
**And** Mesa 24 tiene capacidad suficiente.  
**When** cambia a Mesa 24.  
**Then** la nueva asignación se confirma.  
**And** la anterior se libera dentro de la misma operación lógica.

---

## AC-SEAT-017 — Cambio fuera del deadline

**Prioridad:** P0

**Given** deadline cerrado.  
**When** GRADUATE intenta cambiar de mesa.  
**Then** recibe `SEATING_DEADLINE_CLOSED`.

---

## AC-SEAT-018 — Override ADMIN

**Prioridad:** P1

**Given** deadline cerrado.  
**When** ADMIN cambia la mesa con motivo.  
**Then** la operación se permite.  
**And** queda auditada.

---

## AC-SEAT-019 — Grupo dividido

**Prioridad:** P1

**Given** una membresía de 8 lugares.  
**When** ADMIN asigna 5 lugares a Mesa 24 y 3 a Mesa 25.  
**Then** ambas asignaciones quedan activas.  
**And** el total es 8.

---

## AC-SEAT-020 — División inválida

**Prioridad:** P0

**Given** una membresía de 8 lugares.  
**When** ADMIN intenta asignar 5 + 4 lugares.  
**Then** la operación completa se rechaza.  
**And** ninguna mesa queda parcialmente modificada.

---

# 14. Concurrencia de mesas

## AC-CON-SEAT-001

**Prioridad:** P0

**Given** Mesa 24 con 8 lugares libres.  
**And** Andrea requiere 8.  
**And** Carlos requiere 8.  
**When** ambos confirman simultáneamente.  
**Then** solo uno confirma.  
**And** el otro recibe `409 TABLE_CAPACITY_CHANGED`.  
**And** ocupación final `<= capacity`.

---

## AC-CON-SEAT-002

**Prioridad:** P0

**Given** un cambio entre Mesa A y Mesa B.  
**When** ocurre concurrentemente con otra asignación.  
**Then** no existe un instante persistido final donde ambas capacidades queden violadas.

---

# 15. Platillos

## AC-MEAL-001

**Prioridad:** P1

**Given** opciones configuradas para un evento.  
**When** GRADUATE consulta platillos.  
**Then** solo recibe opciones activas de su evento.

---

## AC-MEAL-002

**Prioridad:** P1

**Given** un integrante activo.  
**When** selecciona un platillo válido.  
**Then** se guarda una única selección activa.

---

## AC-MEAL-003 — Evento cruzado

**Prioridad:** P0

**Given** integrante de Evento A.  
**When** se intenta asignar MealOption de Evento B.  
**Then** la operación se rechaza.

---

## AC-MEAL-004 — Deadline

**Prioridad:** P0

**Given** deadline de platillos cerrado.  
**When** GRADUATE intenta modificar.  
**Then** la operación se rechaza.

---

## AC-MEAL-005 — Override

**Prioridad:** P1

**Given** deadline cerrado.  
**When** ADMIN modifica la selección con motivo.  
**Then** se guarda.  
**And** la auditoría registra before/after y motivo.

---

# 16. PaymentPlan

## AC-FIN-001

**Prioridad:** P0

**Given** una membresía.  
**When** se crea su plan.  
**Then** existe un único PaymentPlan operativo para la membresía.

---

## AC-FIN-002

**Prioridad:** P0

**Given** un PaymentPlan con installments.  
**When** se consulta.  
**Then** cada obligación posee `sequence` único.

---

## AC-FIN-003 — Alta tardía

**Prioridad:** P0

**Given** un calendario con obligaciones ya vencidas.  
**When** se incorpora tarde un graduado.  
**Then** las obligaciones conservan sus fechas originales.

---

# 17. Congelamiento financiero

## AC-FIN-004

**Prioridad:** P0

**Given** un plan sin pagos confirmados.  
**When** se confirma el primer pago.  
**Then** `is_frozen = true`.  
**And** `frozen_at` queda registrado.

---

## AC-FIN-005

**Prioridad:** P0

**Given** un plan congelado.  
**When** ADMIN cambia el precio/default financiero del evento.  
**Then** el plan del graduado no cambia automáticamente.

---

# 18. Aplicación de pagos

## AC-FIN-006 — Pago exacto

**Prioridad:** P0

**Given** M1 pendiente por $2,500.  
**When** se confirma pago por $2,500.  
**Then** M1 queda cubierta.  
**And** `paid_total` aumenta $2,500.

---

## AC-FIN-007 — Pago adelantado

**Prioridad:** P1

**Given** M4 y M5 pendientes por $2,500 cada una.  
**When** se confirma $5,000.  
**Then** ambas quedan cubiertas.

---

## AC-FIN-008 — Excedente

**Prioridad:** P0

**Given** M4 pendiente por $2,500 y M5 pendiente por $2,500.  
**When** se confirma $3,000.  
**Then** M4 queda pagada.  
**And** $500 permanecen aplicados/disponibles de forma trazable.  
**And** no se pierde dinero.

---

## AC-FIN-009 — Sin PARTIALLY_PAID

**Prioridad:** P1

**Given** M5 con cobertura inferior a su monto total.  
**When** GRADUATE consulta su plan.  
**Then** no se muestra estado comercial `PARTIALLY_PAID`.

---

## AC-FIN-010 — Orden

**Prioridad:** P0

**Given** obligaciones anteriores pendientes.  
**When** se recibe un pago ordinario.  
**Then** se aplica conforme al orden financiero establecido.

---

# 19. PaymentAttempt

## AC-PAY-001

**Prioridad:** P0

**Given** GRADUATE inicia un pago.  
**When** se crea `PaymentAttempt`.  
**Then** no cambia `paid_total`.  
**And** no se marca ninguna mensualidad pagada.

---

## AC-PAY-002 — Monto manipulado

**Prioridad:** P0

**Given** una obligación de $2,500.  
**When** frontend envía monto arbitrario $1.00.  
**Then** el backend ignora/rechaza el monto como autoridad.  
**And** resuelve el monto desde el plan.

---

# 20. Mercado Pago

## AC-MP-001

**Prioridad:** P0

**Given** un intento válido.  
**When** backend crea Checkout Pro.  
**Then** devuelve URL de checkout.

---

## AC-MP-002 — Return URL

**Prioridad:** P0

**Given** usuario vuelve por una URL `success`.  
**When** backend todavía no ha confirmado la transacción.  
**Then** la UI muestra estado de verificación.  
**And** la obligación no está pagada todavía.

---

## AC-MP-003 — Confirmación

**Prioridad:** P0

**Given** proveedor confirma server-to-server una transacción válida.  
**When** backend verifica el pago.  
**Then** crea una sola PaymentTransaction.  
**And** crea allocations.  
**And** recalcula el plan.

---

## AC-MP-004 — Webhook duplicado

**Prioridad:** P0

**Given** un webhook ya procesado.  
**When** se recibe nuevamente.  
**Then** no se crea otro PaymentTransaction.  
**And** no se duplican allocations.

---

## AC-MP-005 — Pago rechazado

**Prioridad:** P1

**Given** proveedor rechaza el pago.  
**When** GRADUATE vuelve.  
**Then** no existe PaymentTransaction confirmada.  
**And** la UI muestra pago no completado.

---

## AC-MP-006 — Pendiente

**Prioridad:** P1

**Given** proveedor devuelve estado pendiente.  
**When** se consulta PaymentAttempt.  
**Then** se muestra `PENDING`.  
**And** no se incrementa `paid_total`.

---

# 21. OpenPay

## AC-OPEN-001

**Prioridad:** P2

**Given** OpenPay habilitado como alternativa.  
**When** se confirma una transacción.  
**Then** el resultado interno es PaymentTransaction + PaymentAllocation.  
**And** el PaymentPlan no depende del proveedor.

---

# 22. Pago manual

## AC-MAN-001 — Efectivo

**Prioridad:** P1

**Given** ADMIN autorizado.  
**When** registra pago `CASH`.  
**Then** se crea PaymentTransaction confirmada.  
**And** se aplica al plan.  
**And** queda auditoría.

---

## AC-MAN-002 — Transferencia

**Prioridad:** P1

**Given** ADMIN autorizado.  
**When** registra transferencia con referencia.  
**Then** se crea PaymentTransaction `TRANSFER`.

---

## AC-MAN-003 — GRADUATE

**Prioridad:** P0

**Given** GRADUATE autenticado.  
**When** intenta registrar pago manual.  
**Then** recibe `403`.

---

## AC-MAN-004 — Doble clic

**Prioridad:** P0

**Given** una Idempotency-Key.  
**When** el mismo request se envía dos veces.  
**Then** solo existe una PaymentTransaction.

---

# 23. Ajustes

## AC-ADJ-001

**Prioridad:** P1

**Given** un plan con historia.  
**When** ADMIN registra un ajuste con motivo.  
**Then** se crea entidad Adjustment.  
**And** no se modifica destructivamente la transacción original.

---

## AC-ADJ-002

**Prioridad:** P0

**Given** request sin motivo.  
**When** intenta crear Adjustment.  
**Then** es rechazado.

---

# 24. Reembolsos

## AC-REF-001

**Prioridad:** P1

**Given** un pago confirmado.  
**When** ADMIN registra refund válido.  
**Then** el pago original permanece visible.  
**And** existe Refund separado.

---

## AC-REF-002 — Exceso

**Prioridad:** P0

**Given** una transacción reembolsable por $2,500.  
**When** se intenta reembolsar $3,000.  
**Then** se rechaza con `REFUND_EXCEEDS_AVAILABLE_AMOUNT`.

---

## AC-REF-003 — Concurrencia

**Prioridad:** P0

**Given** una transacción de $2,500.  
**When** dos refunds de $2,500 se solicitan concurrentemente.  
**Then** como máximo uno puede confirmarse.

---

# 25. Cartera

## AC-CAR-001

**Prioridad:** P1

**Given** obligaciones de varios graduados.  
**When** ADMIN consulta cartera.  
**Then** puede ver pendiente, vencido y próximo pago por graduado.

---

## AC-CAR-002

**Prioridad:** P0

**Given** una obligación después de `due_date + grace`.  
**When** sigue sin cubrirse.  
**Then** aparece como vencida.

---

## AC-CAR-003

**Prioridad:** P0

**Given** una obligación vencida.  
**When** el sistema calcula cartera.  
**Then** no agrega recargo automático.

---

# 26. Conciliación

## AC-REC-001

**Prioridad:** P1

**Given** una transacción interna y provider matching.  
**When** se consulta conciliación.  
**Then** aparece `MATCHED`.

---

## AC-REC-002

**Prioridad:** P1

**Given** proveedor confirma una transacción que no pudo aplicarse internamente.  
**When** se ejecuta conciliación.  
**Then** aparece `REQUIRES_REVIEW`.

---

# 27. Termo

## AC-TH-001 — Bloqueado

**Prioridad:** P0

**Given** progreso financiero menor al umbral.  
**When** GRADUATE consulta termo.  
**Then** estado `LOCKED`.  
**And** no puede solicitarlo.

---

## AC-TH-002 — Disponible

**Prioridad:** P0

**Given** progreso financiero igual o superior al umbral.  
**When** se recalcula elegibilidad.  
**Then** el termo queda `AVAILABLE`.

---

## AC-TH-003 — Solicitud

**Prioridad:** P1

**Given** termo `AVAILABLE`.  
**When** GRADUATE envía personalización válida.  
**Then** queda `REQUESTED`.

---

## AC-TH-004 — Producción

**Prioridad:** P1

**Given** termo `REQUESTED`.  
**When** ADMIN marca producción.  
**Then** queda `IN_PRODUCTION`.

---

## AC-TH-005 — Edición bloqueada

**Prioridad:** P0

**Given** termo `IN_PRODUCTION`.  
**When** GRADUATE intenta cambiar personalización.  
**Then** recibe `THERMO_IN_PRODUCTION`.

---

## AC-TH-006 — Entrega

**Prioridad:** P1

**Given** termo en producción.  
**When** ADMIN lo marca entregado.  
**Then** queda `DELIVERED`.

---

# 28. Notificaciones

## AC-NOT-001

**Prioridad:** P1

**Given** una obligación próxima.  
**When** se ejecuta el proceso programado de recordatorios.  
**Then** se genera una notificación/correo correspondiente.

---

## AC-NOT-002

**Prioridad:** P1

**Given** un pago confirmado.  
**When** termina el commit financiero.  
**Then** la notificación puede generarse sin alterar el pago si el proveedor de correo falla.

---

## AC-NOT-003

**Prioridad:** P1

**Given** termo cambia a AVAILABLE.  
**When** se procesa el cambio.  
**Then** GRADUATE recibe notificación.

---

# 29. Reportes

## AC-REP-001 — Financiero

**Prioridad:** P1

**Given** datos financieros persistidos.  
**When** ADMIN abre reporte financiero.  
**Then** contratado, pagado, pendiente y vencido coinciden con el dominio financiero.

---

## AC-REP-002 — Mesas

**Prioridad:** P1

**Given** mesas y assignments.  
**When** se genera reporte.  
**Then** capacidad, ocupación y disponibilidad coinciden con TableAssignment.

---

## AC-REP-003 — Platillos

**Prioridad:** P1

**Given** selecciones de platillo.  
**When** se genera reporte.  
**Then** la suma por opciones coincide con selecciones activas.

---

## AC-REP-004 — Termos

**Prioridad:** P1

**Given** termos en varios estados.  
**When** se genera reporte.  
**Then** los totales por estado coinciden con ThermoRequest.

---

## AC-REP-005 — Autorización

**Prioridad:** P0

**Given** GRADUATE autenticado.  
**When** intenta acceder a reportes ADMIN.  
**Then** recibe `403`.

---

# 30. Auditoría

## AC-AUD-001

**Prioridad:** P0

**Given** ADMIN cambia mesa fuera del deadline.  
**When** la operación termina.  
**Then** existe AuditLog con actor, before, after, motivo y timestamp.

---

## AC-AUD-002

**Prioridad:** P0

**Given** ADMIN registra pago manual.  
**When** la transacción se confirma.  
**Then** existe auditoría.

---

## AC-AUD-003

**Prioridad:** P0

**Given** una entrada de AuditLog.  
**When** ADMIN intenta editarla por API.  
**Then** no existe operación permitida.

---

## AC-AUD-004

**Prioridad:** P1

**Given** movimiento gráfico de una mesa.  
**When** ADMIN hace drag.  
**Then** no se genera una entrada visible de auditoría de negocio por cada movimiento.

---

# 31. Seguridad

## AC-SEC-001 — IDOR

**Prioridad:** P0

**Given** Graduate A autenticado.  
**When** sustituye un ID por uno de Graduate B.  
**Then** nunca obtiene el recurso.

---

## AC-SEC-002 — Admin routes

**Prioridad:** P0

**Given** GRADUATE.  
**When** llama directamente `/api/v1/admin/*`.  
**Then** recibe `403`.

---

## AC-SEC-003 — CORS

**Prioridad:** P0

**Given** producción.  
**When** una request proviene de origen no autorizado.  
**Then** CORS no permite acceso desde navegador.

---

## AC-SEC-004 — Password storage

**Prioridad:** P0

**Given** una cuenta creada.  
**When** se inspecciona DB.  
**Then** no existe password en texto plano.

---

## AC-SEC-005 — Secretos frontend

**Prioridad:** P0

**Given** build de producción.  
**When** se inspecciona bundle.  
**Then** no contiene secret keys de Mercado Pago/OpenPay.

---

## AC-SEC-006 — Login rate limit

**Prioridad:** P0

**Given** más de 10 intentos fallidos en 15 minutos según la política.  
**When** se intenta otro login dentro de la ventana.  
**Then** el sistema aplica rate limiting.

---

# 32. Idempotencia

## AC-IDEM-001

**Prioridad:** P0

**Given** Idempotency-Key K y payload P.  
**When** se envía P dos veces con K.  
**Then** existe un solo efecto.

---

## AC-IDEM-002

**Prioridad:** P0

**Given** Idempotency-Key K ya utilizada con payload P1.  
**When** se envía P2 diferente con K.  
**Then** devuelve `409 IDEMPOTENCY_KEY_REUSED`.

---

# 33. Datos

## AC-DATA-001

**Prioridad:** P0

**Given** una cuenta.  
**When** participa en Evento A y B.  
**Then** existe una sola Account y dos GraduateMembership.

---

## AC-DATA-002

**Prioridad:** P0

**Given** una mesa.  
**When** se consulta ocupación.  
**Then** se deriva de TableAssignment.  
**And** no de un contador manual persistido.

---

## AC-DATA-003

**Prioridad:** P0

**Given** pago confirmado.  
**When** se intenta hard-delete.  
**Then** no existe operación normal que lo permita.

---

# 34. API Contract

## AC-API-001

**Prioridad:** P1

**Given** una respuesta monetaria.  
**When** API devuelve `amount`.  
**Then** se serializa como string decimal exacto.

Ejemplo:

```json
"2500.00"
```

---

## AC-API-002

**Prioridad:** P1

**Given** error de negocio.  
**When** API responde.  
**Then** contiene:

```text
error.code
error.message
request_id
```

cuando corresponda.

---

## AC-API-003

**Prioridad:** P0

**Given** usuario no autenticado.  
**When** solicita recurso protegido.  
**Then** recibe `401`.

---

## AC-API-004

**Prioridad:** P0

**Given** usuario autenticado sin permiso.  
**When** solicita recurso.  
**Then** recibe `403`.

---

## AC-API-005

**Prioridad:** P0

**Given** conflicto de capacidad concurrente.  
**When** la operación pierde la carrera.  
**Then** recibe `409`.

---

## AC-API-006

**Prioridad:** P1

**Given** deadline cerrado.  
**When** intenta una acción válida en estructura pero inválida por negocio.  
**Then** recibe `422`.

---

# 35. Rendimiento

## AC-PERF-001

**Prioridad:** P1

**Given** carga nominal.  
**When** se ejecutan lecturas simples.  
**Then** P95 <= 500 ms.

---

## AC-PERF-002

**Prioridad:** P1

**Given** carga nominal.  
**When** se ejecutan consultas agregadas.  
**Then** P95 <= 1 segundo.

---

## AC-PERF-003

**Prioridad:** P1

**Given** carga nominal.  
**When** se ejecutan escrituras internas.  
**Then** P95 <= 1 segundo.

---

## AC-PERF-004

**Prioridad:** P1

**Given** 300 sesiones concurrentes y 50 RPS por 10 minutos.  
**When** se ejecuta el escenario de carga representativo.  
**Then** no existe corrupción de datos.  
**And** los errores inesperados permanecen dentro de umbrales aceptables.

---

## AC-PERF-005

**Prioridad:** P1

**Given** 200 mesas en un croquis.  
**When** ADMIN navega y mueve mesas.  
**Then** la interfaz permanece utilizable y sin degradación severa.

---

# 36. Respaldo

## AC-BCK-001

**Prioridad:** P0

**Given** ambiente productivo.  
**When** se revisa configuración.  
**Then** existe backup diario automático.

---

## AC-BCK-002

**Prioridad:** P0

**Given** un backup reciente.  
**When** se restaura en entorno aislado.  
**Then** la restauración finaliza correctamente.

---

## AC-BCK-003

**Prioridad:** P1

**Given** restauración de prueba.  
**When** se validan datos.  
**Then** existen cuentas, eventos, pagos, assignments y auditoría esperados.

---

## AC-BCK-004

**Prioridad:** P1

**Given** prueba de recuperación completa.  
**When** se mide duración.  
**Then** cumple objetivo RTO <= 4 horas.

---

# 37. Observabilidad

## AC-OBS-001

**Prioridad:** P0

**Given** una request HTTP.  
**When** se procesa.  
**Then** tiene `request_id`.

---

## AC-OBS-002

**Prioridad:** P0

**Given** error inesperado 500.  
**When** ocurre.  
**Then** el cliente no recibe stack trace.  
**And** backend registra stack + request_id.

---

## AC-OBS-003

**Prioridad:** P0

**Given** webhook fallido.  
**When** se registra.  
**Then** puede encontrarse mediante provider/external_event_id/request_id.

---

## AC-OBS-004

**Prioridad:** P1

**Given** tasa 5xx > 5% durante 5 minutos con tráfico significativo.  
**When** se cruza el umbral.  
**Then** se genera alerta.

---

## AC-OBS-005

**Prioridad:** P0

**Given** 5 fallos consecutivos de webhook del mismo proveedor.  
**When** ocurre la condición.  
**Then** se genera alerta.

---

# 38. Health checks

## AC-HEALTH-001

**Prioridad:** P0

**Given** proceso backend vivo.  
**When** se consulta `/health/live`.  
**Then** responde exitosamente aun si una integración externa está caída.

---

## AC-HEALTH-002

**Prioridad:** P0

**Given** PostgreSQL no disponible.  
**When** se consulta `/health/ready`.  
**Then** readiness indica no listo.

---

# 39. Resiliencia de proveedores

## AC-REL-001

**Prioridad:** P0

**Given** Mercado Pago caído.  
**When** GRADUATE consulta su grupo o mesa.  
**Then** esos módulos continúan funcionando.

---

## AC-REL-002

**Prioridad:** P0

**Given** proveedor tarda más del timeout.  
**When** se intenta iniciar/verificar pago.  
**Then** el sistema no crea un pago confirmado ficticio.

---

# 40. Archivos

## AC-FILE-001

**Prioridad:** P1

**Given** ADMIN sube JPG/PNG válido para croquis menor a 15 MB.  
**When** el archivo pasa validación.  
**Then** se almacena y vincula al SeatingMap.

---

## AC-FILE-002

**Prioridad:** P0

**Given** archivo con extensión permitida pero MIME/contenido incompatible.  
**When** se intenta subir.  
**Then** se rechaza.

---

## AC-FILE-003

**Prioridad:** P0

**Given** evidencia financiera privada.  
**When** usuario no autorizado intenta abrir la URL.  
**Then** no obtiene acceso permanente público.

---

# 41. Accesibilidad

## AC-A11Y-001

**Prioridad:** P1

**Given** un estado de error o vencimiento.  
**When** se muestra.  
**Then** no depende exclusivamente del color para comunicar significado.

---

## AC-A11Y-002

**Prioridad:** P1

**Given** un formulario esencial.  
**When** se navega por teclado.  
**Then** foco y labels son identificables.

---

# 42. Responsive

## AC-UX-001

**Prioridad:** P1

**Given** interfaz GRADUATE a 360px de ancho.  
**When** se recorre Inicio, Grupo, Pagos y Más.  
**Then** no existe scroll horizontal estructural.

---

## AC-UX-002

**Prioridad:** P1

**Given** ADMIN a 1280px.  
**When** opera tablas, croquis y reportes.  
**Then** la experiencia es completa.

---

# 43. Estados transversales UX

## AC-STATE-001

**Prioridad:** P1

Cada módulo relevante deberá tener estado `LOADING`.

## AC-STATE-002

**Prioridad:** P1

Las listas sin datos deberán mostrar estado `EMPTY`.

## AC-STATE-003

**Prioridad:** P1

Los errores recuperables deberán mostrar acción de retry.

## AC-STATE-004

**Prioridad:** P1

Sin conexión deberá mostrarse estado específico sin fingir datos actualizados.

---

# 44. Integridad financiera

## AC-INV-FIN-001

**Prioridad:** P0

```text
SUM(PaymentAllocation)
<= PaymentTransaction.amount
```

para cada transacción.

---

## AC-INV-FIN-002

**Prioridad:** P0

```text
SUM(confirmed Refund)
<= refundable transaction amount
```

---

## AC-INV-FIN-003

**Prioridad:** P0

Un `provider_transaction_id` confirmado no genera más de una transacción.

---

## AC-INV-FIN-004

**Prioridad:** P0

Todo dinero confirmado queda:

- aplicado;
- como crédito;
- ajustado;
- o reembolsado.

Nunca desaparece del ledger.

---

# 45. Integridad de mesas

## AC-INV-SEAT-001

**Prioridad:** P0

```text
SUM(assignments by table) <= capacity
```

siempre.

---

## AC-INV-SEAT-002

**Prioridad:** P0

```text
SUM(assignments by membership) <= active_places
```

siempre.

---

## AC-INV-SEAT-003

**Prioridad:** P0

`TableAssignment.event_id`, `EventTable.event_id` y `GraduateMembership.event_id` deben coincidir.

---

# 46. Integridad de platillos

## AC-INV-MEAL-001

**Prioridad:** P0

Una MealSelection no puede relacionar GroupMember y MealOption de eventos diferentes.

---

# 47. Integridad del termo

## AC-INV-TH-001

**Prioridad:** P0

Existe como máximo un ThermoRequest activo por GraduateMembership.

---

# 48. Seguridad de logs

## AC-LOG-001

**Prioridad:** P0

Los logs no contienen passwords ni access/refresh tokens.

---

## AC-LOG-002

**Prioridad:** P0

Los logs no contienen secretos productivos de proveedores.

---

# 49. Migraciones

## AC-MIG-001

**Prioridad:** P0

**Given** una instalación limpia.  
**When** se ejecutan todas las migraciones desde cero.  
**Then** se obtiene el schema requerido sin pasos manuales.

---

## AC-MIG-002

**Prioridad:** P0

**Given** una base con schema anterior soportado.  
**When** se ejecuta el plan de migración.  
**Then** los datos se transforman sin violar invariantes.

---

## AC-MIG-003

**Prioridad:** P0

Producción no requiere `prisma db push` para desplegar cambios.

---

# 50. CI/CD

## AC-CI-001

**Prioridad:** P1

Una PR no puede considerarse técnicamente aprobada si falla:

- lint;
- typecheck;
- tests P0;
- build.

---

## AC-CI-002

**Prioridad:** P0

Un deployment no deberá continuar si la migración requerida falla.

---

# 51. Definition of Done — Ticket

Un ticket se considera `DONE` únicamente si:

```text
[ ] requisito/criterio asociado identificado
[ ] código implementado
[ ] autorización backend aplicada
[ ] reglas de negocio backend aplicadas
[ ] estados UX necesarios implementados
[ ] tests unitarios/integración correspondientes
[ ] caso E2E si afecta flujo crítico
[ ] auditoría si corresponde
[ ] API/OpenAPI actualizado
[ ] migración incluida si cambia datos
[ ] sin regressions P0
[ ] code review aprobado
[ ] documentación relevante actualizada
```

---

# 52. Definition of Done — Módulo

Un módulo se considera cerrado cuando:

1. todos sus criterios P0 están verdes;
2. todos sus criterios P1 del MVP están verdes;
3. no existen defectos abiertos `Blocker/Critical`;
4. pruebas de autorización pasan;
5. pruebas de integración pasan;
6. contrato API coincide con implementación;
7. datos legacy involucrados están migrados;
8. logs y errores son observables;
9. el flujo UX aprobado puede completarse de extremo a extremo.

---

# 53. Definition of Done — Release MVP

El MVP no puede aprobarse si falla cualquiera de estos bloques:

```text
AUTH
AUTHORIZATION / IDOR
EVENT LIFECYCLE
PLACES CAPACITY
SEATING CONCURRENCY
FINANCIAL LEDGER
PAYMENT IDEMPOTENCY
MANUAL PAYMENTS
REFUNDS / ADJUSTMENTS
THERMO RULES
AUDIT
DATABASE MIGRATIONS
BACKUPS
RESTORE TEST
OBSERVABILITY
```

---

# 54. Matriz P0 de release

| Área | Criterio |
|---|---|
| Auth | AC-AUTH-001..005 |
| Registro | AC-REG-001..003 |
| Eventos | AC-EVT-001/002/007/008 |
| Lugares | AC-PLC-001..005 |
| Privacidad | AC-GRP-002 |
| Mesas | AC-SEAT-003/006/009/010/012..017/020 |
| Concurrencia | AC-CON-SEAT-001/002 |
| Platillos | AC-MEAL-003/004 |
| Finanzas | AC-FIN-001..010 según prioridad |
| MP | AC-MP-002..004 |
| Manuales | AC-MAN-003/004 |
| Ajustes | AC-ADJ-002 |
| Refunds | AC-REF-002/003 |
| Termo | AC-TH-001/002/005 |
| Auditoría | AC-AUD-001..003 |
| Seguridad | AC-SEC-* |
| Idempotencia | AC-IDEM-* |
| Datos | AC-DATA-* |
| API | AC-API-003..005 |
| Backup | AC-BCK-001/002 |
| Observabilidad | AC-OBS-001..003/005 |
| Health | AC-HEALTH-* |
| Integridad | AC-INV-* |
| Logs | AC-LOG-* |
| Migraciones | AC-MIG-* |

---

# 55. Suite E2E mínima

La suite E2E del MVP deberá cubrir al menos:

## E2E-001 — Registro → Inicio

```text
Acceso evento
→ Registro
→ Login/sesión
→ Inicio
```

---

## E2E-002 — Grupo → Mesa

```text
Mi grupo
→ Selección de mesa
→ Confirmación
→ Mesa guardada
```

---

## E2E-003 — Conflicto de mesa

```text
2 graduados
→ misma capacidad final
→ 1 éxito
→ 1 conflicto
```

---

## E2E-004 — Platillos

```text
Mi grupo
→ Platillos
→ Selección completa
→ Guardado
```

---

## E2E-005 — Mercado Pago exitoso

```text
Mis pagos
→ intento
→ proveedor mock/sandbox
→ webhook
→ confirmación
→ PaymentTransaction
→ allocations
→ UI confirmada
```

---

## E2E-006 — Webhook duplicado

```text
mismo webhook x2
→ un solo efecto
```

---

## E2E-007 — Pago manual ADMIN

```text
Evento
→ Graduado
→ Pagos
→ Registrar transferencia
→ Aplicación
→ Auditoría
```

---

## E2E-008 — Ajuste/Reembolso

```text
Pago original
→ ajuste/refund
→ original intacto
→ saldos recalculados
```

---

## E2E-009 — Termo

```text
progreso bajo
→ LOCKED
→ nuevo pago
→ AVAILABLE
→ REQUESTED
→ IN_PRODUCTION
→ edición bloqueada
→ DELIVERED
```

---

## E2E-010 — Cancelación graduado

```text
Graduado activo
→ ADMIN cancela
→ operaciones bloqueadas
→ historia preservada
```

---

## E2E-011 — Evento cerrado

```text
OPEN
→ CLOSED
→ GRADUATE no muta
→ ADMIN REOPEN
→ mutaciones permitidas otra vez
```

---

# 56. Criterios de no regresión

Todo release posterior deberá ejecutar como mínimo:

```text
auth
authorization
table concurrency
event capacity concurrency
financial idempotency
refund limit
audit immutability
payment return != confirmation
plan freeze
thermo threshold
```

aunque el cambio no afecte directamente esos módulos.

---

# 57. Severidad de defectos

## Blocker

Impide uso del sistema o corrompe datos.

Ejemplos:

- login general roto;
- DB migration imposible;
- pagos duplicados;
- sobrecupo persistido.

---

## Critical

Viola seguridad, dinero o reglas fundamentales.

Ejemplos:

- IDOR;
- GRADUATE accede a ADMIN;
- pago marcado confirmado sin proveedor;
- refund excedido;
- tabla sobreocupada por race.

---

## Major

Flujo MVP importante no puede completarse pero no corrompe dominio.

Ejemplos:

- no guardar platillos;
- exportación requerida falla;
- termo no transiciona.

---

## Minor

Problema visual/copy no bloqueante.

---

# 58. Política de release

No se permite release productivo con:

```text
Blocker > 0
Critical > 0
```

Los `Major` deberán evaluarse contra el alcance MVP antes de aprobar.

---

# 59. Trazabilidad documental

| Área | Fuente principal |
|---|---|
| Alcance | PRODUCT_SCOPE |
| Reglas | BUSINESS_RULES |
| Requisitos | SRS |
| Autorización | ROLES_PERMISSIONS |
| UX | UX_FLOWS |
| Finanzas | FINANCIAL_DOMAIN |
| Mesas | SEATING_MAP |
| Datos | DATA_MODEL |
| API | API_CONTRACTS |
| NFR | NON_FUNCTIONAL_REQUIREMENTS |
| QA | ACCEPTANCE_CRITERIA |

---

# 60. Exclusiones de aceptación

No deberán crearse criterios de aceptación para funcionalidades fuera de alcance, incluyendo:

- invitaciones digitales;
- RSVP;
- QR/check-in;
- scanner;
- seat assignment;
- VIP;
- multi-tenant;
- planners;
- WhatsApp automatizado;
- facturación electrónica;
- reconocimiento automático de croquis.

Si aparece una prueba para una de estas funciones, no implica que el producto deba implementarla.

---

# 61. Baseline

Con esta versión se establece:

```text
ACCEPTANCE_CRITERIA_VERSION = 1.0
```

Este documento constituye el baseline de QA y Definition of Done para Plataforma GR.

Un criterio solo puede modificarse cuando cambie la regla/requisito que lo origina o se corrija formalmente una inconsistencia documental.
