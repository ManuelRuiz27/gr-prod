# Plataforma GR — Flujos UX/UI

**Documento:** `UX_FLOWS.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.1  
**Estado:** Baseline UX para implementación y E2E  
**Fecha:** 31 de agosto de 2026  
**Fuentes:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`

---

# 1. Principios UX

1. Lenguaje natural; no exponer IDs, webhooks, locks o estados técnicos.
2. Backend es autoridad: toda mutación crítica puede ser rechazada por capacidad, deadline, autorización o estado financiero.
3. Progressive disclosure: mostrar solo lo necesario para la tarea actual.
4. Contexto persistente: evento y, en ADMIN, graduado actual siempre visibles.
5. Una acción primaria dominante por pantalla cuando exista siguiente paso natural.
6. Acciones destructivas requieren confirmación.
7. Estados transversales: `LOADING`, `READY`, `EMPTY`, `ERROR`, `OFFLINE`, `ACTION_SUCCESS`.

---

# 2. Navegación GRADUATE

Mobile-first:

```text
Inicio | Mi grupo | Pagos | Más
```

Rutas secundarias:

```text
Mi contrato
Mesas
Platillos
Termo
Notificaciones
Perfil
Ayuda
Cambiar evento
```

---

# 3. Navegación ADMIN

Desktop-first:

```text
Inicio
Eventos
Graduados
Pagos
Reportes
Más
```

Contexto de evento:

```text
Resumen
Graduados
Pagos
Mesas
Platillos
Termos
Reportes
Configuración
```

Configuración de evento:

```text
Información
Productos y precios
Plan financiero
Fechas límite
Penalización tardía
Cancelaciones
Platillos
Termo
```

---

# 4. GRADUATE — Acceso e identidad

## UX-G-AUTH-001 — Entrada contextual

```text
Accede a tu graduación
→ Registro
```

o:

```text
→ Iniciar sesión
```

El usuario no elige evento arbitrariamente.

## UX-G-AUTH-002 — Registro

Captura datos de cuenta permitidos y confirma el evento resuelto por el acceso.

```text
Registro exitoso
→ resolver contrato/membresía
```

## UX-G-AUTH-003 — Login

```text
Login
→ 1 membresía: Inicio
→ varias membresías: Mis eventos
```

## UX-G-AUTH-004 — Recuperación

```text
Login
→ Recuperar contraseña
→ Revisa tu correo
→ Login
```

Respuesta genérica para evitar enumeración.

---

# 5. GRADUATE — Contrato

## UX-G-CON-001 — Contrato pendiente

Cuando la membresía requiera aceptación:

Pantalla:

```text
Tu contrato
```

Mostrar:

- folio;
- evento;
- identidad;
- productos/lugares contratados;
- total;
- esquema de pagos;
- política de cancelación aplicable;
- términos vigentes.

CTA:

```text
Aceptar contrato
```

No permitir al usuario elegir otra versión.

## UX-G-CON-002 — Confirmación

Antes de aceptar:

```text
Revisa y confirma que aceptas las condiciones mostradas.
```

CTA primario:

```text
Aceptar y continuar
```

Resultado:

```text
Contrato aceptado
→ Inicio
```

## UX-G-CON-003 — Contrato aceptado

Modo lectura:

- folio;
- fecha de aceptación;
- condiciones/snapshot aplicable;
- acceso a consulta/descarga cuando se implemente.

---

# 6. GRADUATE — Inicio

Mostrar:

- evento, fecha y lugar;
- folio;
- avance financiero;
- pagado, pendiente y vencido;
- próximo pago;
- lugares/integrantes;
- estado de mesa;
- platillos;
- termo;
- alertas.

Estados destacados:

```text
Pago próximo
Pago vencido
Comprobante en revisión
Mesa pendiente
Platillos pendientes
Termo disponible
```

---

# 7. GRADUATE — Mi grupo y productos

## UX-G-GROUP-001 — Resumen

Mostrar:

- productos/lugares contratados;
- integrantes;
- principal;
- mesas asignadas;
- platillos.

## UX-G-GROUP-002 — Agregar integrante

Validar:

- evento `OPEN`;
- deadline;
- lugares vigentes;
- capacidad.

## UX-G-GROUP-003 — Agregar producto/lugar

Entrada:

```text
Mi grupo
→ Agregar lugar
```

Mostrar productos habilitados, por ejemplo:

```text
Adulto
Niño
Sin cena
```

con nombre/precio real del evento.

Al seleccionar:

```text
Resumen de compra
precio
nuevo total contratado
importe requerido hoy / catch-up si aplica
saldo futuro
```

CTA:

```text
Confirmar y continuar al pago
```

No presentar un valor fijo de catch-up; se obtiene del backend.

## UX-G-GROUP-004 — Sin capacidad/deadline

Mostrar mensaje operativo y no CTA de confirmación.

## UX-G-GROUP-005 — Reducción

GRADUATE puede solicitar contacto/revisión, pero no confirmar la reducción unilateralmente.

---

# 8. GRADUATE — Mesas por persona

## UX-G-SEAT-001 — Estado bloqueado

Si no se cumple condición financiera:

```text
La selección de mesa aún no está disponible.
Completa el pago requerido para continuar.
```

CTA:

```text
Ver mis pagos
```

## UX-G-SEAT-002 — Croquis

Cuando esté habilitado:

Mostrar:

- plano en lectura;
- etiquetas de mesa;
- disponibilidad agregada;
- estado.

Nunca mostrar PII ajena.

## UX-G-SEAT-003 — Seleccionar persona

Antes de asignar mesa, mostrar integrantes propios:

```text
¿A quién quieres asignar?
```

Permitir selección de una o varias personas propias que aún requieran mesa.

## UX-G-SEAT-004 — Seleccionar mesa

Detalle:

- mesa;
- capacidad;
- lugares disponibles;
- número de personas seleccionadas.

CTA:

```text
Asignar a esta mesa
```

## UX-G-SEAT-005 — Confirmación

```text
Se asignarán [personas] a Mesa X.
```

## UX-G-SEAT-006 — Éxito

Mostrar por persona:

```text
Andrea → Mesa 12
Invitado 1 → Mesa 12
Invitado 2 → Mesa 17
```

## UX-G-SEAT-007 — Concurrencia

Si disponibilidad cambió:

```text
Esta mesa acaba de cambiar y ya no tiene espacio suficiente.
```

CTA `Ver mesas disponibles`.

## UX-G-SEAT-008 — Deadline cerrado

Modo lectura; no mostrar CTA de cambio.

---

# 9. GRADUATE — Platillos

## UX-G-MEAL-001 — Resumen

Lista de integrantes + selección + pendientes.

## UX-G-MEAL-002 — Selección

Mostrar opciones activas del evento y guardar por integrante.

## UX-G-MEAL-003 — Revisión

Resumen antes de confirmar cambios cuando aplique.

## UX-G-MEAL-004 — Deadline

Tras cierre:

```text
La selección de platillos ya cerró.
```

Modo lectura y opción de contactar al organizador.

---

# 10. GRADUATE — Mis pagos

## UX-G-PAY-001 — Resumen

Mostrar:

- total contratado;
- pagado;
- pendiente;
- vencido;
- penalizaciones;
- progreso;
- obligaciones;
- historial visible;
- submissions/comprobantes recientes.

## UX-G-PAY-002 — Obligación

Mostrar concepto, importe, vencimiento, estado y CTA `Pagar ahora` cuando sea pagable.

## UX-G-PAY-003 — Selección de método

Opciones según evento:

```text
Mercado Pago
OpenPay
Reportar transferencia
Reportar depósito
```

No mostrar `efectivo` como método auto-confirmable por GRADUATE.

---

# 11. GRADUATE — Mercado Pago/OpenPay

## UX-G-EPAY-001 — Confirmación previa

Mostrar concepto e importe calculado por backend.

## UX-G-EPAY-002 — Salida

Comunicar que el usuario irá al proveedor.

## UX-G-EPAY-003 — Retorno

Siempre iniciar en:

```text
Estamos confirmando tu pago
```

No declarar éxito por parámetros del navegador.

## UX-G-EPAY-004 — Confirmado

Mostrar importe, concepto y nuevo avance financiero.

## UX-G-EPAY-005 — Pendiente/fallido

Mensajes naturales y opción segura de volver/reintentar.

---

# 12. GRADUATE — Reportar transferencia/depósito

## UX-G-PROOF-001 — Formulario

Entrada desde método alternativo.

Campos:

- método: transferencia o depósito;
- importe reportado;
- fecha;
- referencia opcional/obligatoria según configuración;
- comprobante;
- nota opcional.

CTA:

```text
Enviar comprobante
```

## UX-G-PROOF-002 — En revisión

Resultado:

```text
Comprobante enviado
Estamos revisando tu pago.
```

Badge:

```text
En revisión
```

El saldo no cambia todavía.

## UX-G-PROOF-003 — Aprobado

```text
Comprobante aprobado
Pago registrado
```

Mostrar nuevo saldo/avance.

## UX-G-PROOF-004 — Rechazado

Mostrar motivo administrativo seguro y CTA para enviar uno nuevo cuando el flujo lo permita.

---

# 13. GRADUATE — Penalización/mora

Si existe cargo tardío aplicado:

Mostrarlo como concepto separado:

```text
Penalización por liquidación tardía
```

con importe y fecha.

No ocultarlo dentro de una mensualidad original.

Si la membresía está en riesgo de cancelación automática, mostrar aviso claro sin asegurar una cancelación antes de que backend la ejecute.

---

# 14. GRADUATE — Termo

Estados:

```text
Bloqueado
Disponible
Solicitado
En producción
Entregado
```

Flujos:

```text
Bloqueado → Ver pagos
Disponible → Solicitar
Solicitado → Editar si permitido
En producción → Solo lectura
Entregado → Solo lectura
```

Si el evento permite termo adicional:

```text
Mi termo
→ Agregar termo adicional
→ resumen de precio/catch-up si aplica
→ pago
```

---

# 15. GRADUATE — Más

```text
Mi contrato
Mi perfil
Notificaciones
Ayuda
Cambiar evento
Cerrar sesión
```

---

# 16. ADMIN — Dashboard global

Mostrar:

- eventos activos;
- graduados;
- recaudado;
- pendiente;
- vencido;
- comprobantes por revisar;
- cancelaciones/mora que requieren atención;
- alertas operativas.

Accesos rápidos:

```text
Abrir evento
Crear evento
Pagos por validar
Cartera
Reportes
```

---

# 17. ADMIN — Crear evento

Wizard objetivo:

```text
1. Información general
2. Productos y precios
3. Plan financiero
4. Fechas límite y milestones
5. Penalización tardía
6. Política de cancelación
7. Platillos
8. Termo
9. Revisar
```

## Paso 1

Nombre, fecha, lugar, escuela/institución, carrera/generación cuando aplique, capacidad, timezone.

## Paso 2

Crear productos/tipos de lugar, al menos compatibles con Adulto/Niño/Sin cena.

## Paso 3

Moneda, pago inicial, parcialidades con importes/fechas independientes, periodo de gracia.

## Paso 4

Deadlines + milestones de avance financiero cuando existan.

## Paso 5

Fecha de liquidación, días de gracia tardía, importe de penalización y cancelación automática opcional.

## Paso 6

Seleccionar política existente compatible o crear draft de rangos dinámicos.

## Paso 7

Opciones de platillo.

## Paso 8

Umbral y personalización de termo.

## Paso 9

Resumen; crear en `DRAFT`.

---

# 18. ADMIN — Ciclo de vida

```text
DRAFT → OPEN
OPEN → CLOSED
CLOSED → OPEN
OPEN/CLOSED → FINALIZED
DRAFT/OPEN/CLOSED → CANCELLED según reglas
```

Cancelación requiere motivo. Todas las transiciones muestran confirmación y producen auditoría.

---

# 19. ADMIN — Graduados y expediente

Listado con búsqueda/filtros por:

- nombre;
- folio;
- escuela;
- estado financiero;
- estado de mesa;
- platillos;
- termo;
- membresía.

Expediente:

```text
Resumen
Contrato
Grupo/productos
Pagos
Comprobantes
Mesas
Platillos
Termo
Notas
Historial
```

---

# 20. ADMIN — Contrato

Mostrar:

- folio;
- estado de aceptación;
- fecha;
- términos/versiones;
- line items;
- política de cancelación vinculada.

No ofrecer edición destructiva de snapshot aceptado.

---

# 21. ADMIN — Productos/lugares

## Agregar/modificar

Mostrar impacto en capacidad, integrantes y finanzas.

## Reducción

```text
Grupo/productos
→ Reducir
→ Impacto
→ Motivo
→ Confirmar
```

Si plan congelado, explicar que se generarán ajustes/reembolsos/cancelaciones de obligaciones, no edición retroactiva.

---

# 22. ADMIN — Pagos del graduado

Mostrar:

- contratado;
- pagado;
- pendiente;
- vencido;
- crédito;
- penalizaciones;
- obligaciones;
- transacciones;
- adjustments/refunds.

Acciones:

```text
Registrar pago
Crear ajuste
Iniciar reembolso
Ver comprobantes
```

---

# 23. ADMIN — Registrar pago manual

Campos:

```text
método: Efectivo | Transferencia | Depósito
concepto
importe
fecha
referencia
nota
evidencia
```

Confirmación muestra que el pago será contabilizado inmediatamente como movimiento confirmado.

---

# 24. ADMIN — Pagos por validar

## UX-A-PROOF-001 — Bandeja

Filtros:

- evento;
- escuela;
- fecha;
- método;
- estado.

Mostrar:

- graduado;
- folio;
- importe reportado;
- método;
- fecha;
- referencia;
- antigüedad.

## UX-A-PROOF-002 — Detalle

Mostrar comprobante en visor seguro + contexto financiero del graduado.

Acciones:

```text
Aprobar
Rechazar
```

## UX-A-PROOF-003 — Aprobar

Confirmación:

```text
Al aprobar se registrará un pago confirmado y se aplicará al plan.
```

No permitir editar arbitrariamente la deuda desde este modal.

## UX-A-PROOF-004 — Rechazar

Motivo obligatorio. Resultado visible para el graduado sin exponer notas internas.

---

# 25. ADMIN — Cartera y penalización

Pantalla Cartera:

Filtros:

- al día;
- próximos;
- vencidos;
- penalizados;
- riesgo de cancelación;
- escuela/evento.

Mostrar próximo pago, saldo, días de atraso y penalización separada.

La aplicación automática de penalización no necesita botón manual ordinario; ADMIN puede consultar su origen/fecha y corregir mediante flujo autorizado si corresponde.

---

# 26. ADMIN — Política de cancelación

## UX-A-CANPOL-001 — Listado/versiones

Mostrar:

```text
Versión
Estado: Borrador | Activa | Archivada
Fecha de publicación
Contratos vinculados
```

## UX-A-CANPOL-002 — Editor de rangos

Tabla/formulario editable:

| Desde días | Hasta días | Penalización % |
|---:|---:|---:|
| campo | campo/opcional | campo |

Acciones:

```text
Agregar rango
Eliminar rango
Guardar borrador
Validar
Publicar
```

La UI debe marcar:

- huecos;
- traslapes;
- porcentajes inválidos;
- rango final incompleto.

## UX-A-CANPOL-003 — Política publicada

Modo lectura. CTA:

```text
Crear nueva versión
```

Nunca `Editar versión activa`.

---

# 27. ADMIN — Cancelar graduado

Entrada:

```text
Expediente
→ Cancelar participación
```

Paso 1: obtener cotización backend.

Mostrar:

- fecha del evento;
- días restantes;
- versión/rango aplicado;
- total contratado;
- pagado;
- porcentaje de penalización;
- monto retenido;
- reembolso estimado;
- saldo adicional cuando exista;
- asignaciones que serán liberadas.

Paso 2:

- motivo obligatorio;
- confirmación.

Resultado:

```text
Participación cancelada
```

Si corresponde reembolso:

CTA:

```text
Programar reembolso
```

No mostrarlo como ya devuelto hasta confirmación financiera.

---

# 28. ADMIN — Reembolso

Flujo:

```text
Cancelación / pago
→ Iniciar reembolso
→ método/proveedor
→ importe permitido
→ motivo
→ evidencia/referencia si manual
→ Confirmar
```

Estados visibles:

```text
Solicitado
En proceso
Confirmado
Fallido
Cancelado
```

---

# 29. ADMIN — Mesas/croquis

Editor:

- fondo;
- crear/mover/editar/bloquear mesas;
- creación masiva;
- ocupación/disponibilidad.

Detalle de mesa muestra **personas asignadas**, no solo un contador por graduado.

Asignación administrativa:

```text
Mesa / Graduado
→ seleccionar persona(s)
→ nueva mesa
→ validar capacidad
→ motivo si override
→ confirmar
```

---

# 30. ADMIN — Platillos

Panel:

- totales por opción;
- pendientes;
- detalle por persona.

Override fuera de deadline:

```text
Modificar
→ motivo
→ guardar
```

---

# 31. ADMIN — Termos

Panel por estado:

```text
Bloqueados
Disponibles
Solicitados
En producción
Entregados
```

Detalle:

- avance financiero;
- personalización;
- timeline;
- termo adicional si existe.

Acciones:

```text
Marcar en producción
Marcar entregado
```

Entrega puede capturar receptor/firma/evidencia cuando esté habilitado.

---

# 32. ADMIN — Notas internas

En expediente:

```text
Notas
→ Agregar nota
```

Mostrar autor/fecha/texto. No hacerlas visibles para GRADUATE.

---

# 33. ADMIN — Reportes y cortes

Pantalla principal:

```text
Cobranza
Cartera
Pagos
Comprobantes
Mesas
Platillos
Termos
```

Filtros transversales:

- evento;
- escuela;
- rango de fechas;
- método de pago;
- estado cuando aplique.

## Corte diario

Movimientos del día + totales por método.

## Semanal/mensual

Tendencias/resumen del periodo con drill-down al detalle.

## Exportar

```text
XLSX
CSV
PDF resumen cuando aplique
```

La exportación debe respetar filtros activos.

---

# 34. ADMIN — Auditoría

Vista en lenguaje natural con filtros por fecha, módulo, actor, evento y entidad.

No mostrar JSON crudo como interfaz primaria.

---

# 35. Errores por flujo

| Flujo | Condición | UX |
|---|---|---|
| Registro | acceso inválido | Acceso no disponible |
| Contrato | versión inválida | Actualizar/recargar contrato |
| Producto | sin capacidad | Sin lugares disponibles |
| Producto | catch-up cambió | Actualizar resumen de compra |
| Mesa | no cumple condición financiera | Selección bloqueada |
| Mesa | capacidad cambió | Elegir otra mesa |
| Mesa | deadline vencido | Solo lectura |
| Pago | retorno proveedor | Estamos confirmando |
| Pago | rechazado | No pudimos completar el pago |
| Comprobante | pendiente | En revisión |
| Comprobante | rechazado | Mostrar motivo seguro |
| Platillo | deadline | Selección cerrada |
| Cancelación | política inválida/no publicable | Corregir rangos |
| Cancelación | quote desactualizada | Recalcular antes de confirmar |
| Refund | supera disponible | Ajustar importe |
| Global | red/offline | Reintentar |

---

# 36. Mapas principales

## GRADUATE

```text
Acceso
→ Registro/Login
→ Contrato pendiente (si aplica)
→ Inicio
   ├── Mi grupo
   │   ├── Integrantes
   │   ├── Agregar producto
   │   ├── Mesas por persona
   │   └── Platillos
   ├── Pagos
   │   ├── Mercado Pago/OpenPay
   │   └── Reportar transferencia/depósito
   ├── Termo
   └── Más
```

## ADMIN

```text
Login
→ Dashboard
→ Evento
   ├── Resumen
   ├── Graduados
   │   └── Expediente
   │       ├── Contrato
   │       ├── Grupo/productos
   │       ├── Pagos/comprobantes
   │       ├── Mesas
   │       ├── Platillos
   │       ├── Termo
   │       ├── Notas
   │       └── Historial
   ├── Pagos por validar
   ├── Cartera
   ├── Mesas
   ├── Platillos
   ├── Termos
   ├── Reportes/cortes
   └── Configuración
       ├── Productos/precios
       ├── Plan financiero
       ├── Penalización
       └── Cancelaciones/versiones
```
