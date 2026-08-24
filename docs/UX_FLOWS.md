# UX_FLOWS.md

# Plataforma GR — Flujos UX/UI

**Documento:** `UX_FLOWS.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline UX para implementación  
**Fecha:** 24 de agosto de 2026  
**Documentos fuente:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`  
**Referencia visual:** Prototipos aprobados en Google Stitch para roles ADMIN y GRADUATE  
**Propósito:** Formalizar los recorridos de usuario, navegación, estados, decisiones y transiciones entre pantallas.

---

# 1. Propósito

Este documento define **cómo se recorre Plataforma GR**.

No pretende describir pixel-perfect UI ni sustituir:

- `SRS.md`;
- `BUSINESS_RULES.md`;
- `ROLES_PERMISSIONS.md`;
- `API_CONTRACTS.md`.

Su función es:

- traducir requisitos a recorridos;
- vincular pantallas con acciones;
- definir estados alternativos;
- establecer entradas y salidas de cada proceso;
- evitar botones sin destino;
- evitar flujos contradictorios;
- servir como referencia para frontend, QA y pruebas E2E.

---

# 2. Principios UX

## UX-P-001 — Lenguaje natural

La interfaz deberá utilizar términos operativos comprensibles.

Preferir:

- Pagos vencidos
- Mesa confirmada
- Estamos confirmando tu pago
- Tu termo ya está disponible
- La selección de platillos ya cerró

Evitar:

- 409 Conflict
- webhook pendiente
- payment intent
- transaction failed
- RBAC
- status code

---

## UX-P-002 — Autoridad backend

El frontend puede anticipar estados, pero toda operación crítica deberá asumir que el backend puede rechazarla por:

- capacidad;
- concurrencia;
- deadline;
- autorización;
- estado del evento;
- estado financiero.

---

## UX-P-003 — No exponer complejidad técnica

El usuario no deberá conocer:

- IDs internos;
- proveedor transaction IDs;
- tokens;
- webhooks;
- locks;
- concurrencia;
- detalles de infraestructura.

---

## UX-P-004 — Contexto visible

Toda pantalla de operación deberá dejar claro el contexto:

- evento;
- graduado, cuando aplique;
- módulo actual.

---

## UX-P-005 — Progressive disclosure

Las operaciones administrativas complejas deberán mostrar solo la información necesaria para la tarea actual.

Ejemplo:

```text
Evento
→ Graduados
→ Andrea Martínez
→ Pagos
```

en lugar de presentar toda la información del sistema en una sola vista.

---

# 3. Estructura de navegación

# 3.1 Navegación GRADUATE

Enfoque:

```text
Mobile-first
```

Navegación inferior fija:

```text
Inicio | Mi grupo | Pagos | Más
```

Rutas secundarias accesibles desde contenido:

- Mesa
- Platillos
- Termo
- Notificaciones
- Mi perfil
- Ayuda
- Selector de evento

---

# 3.2 Navegación ADMIN

Enfoque:

```text
Desktop-first
```

Navegación global:

```text
Inicio
Eventos
Graduados
Pagos
Reportes
Más
```

Dentro de un evento:

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

La navegación global y la contextual no deberán mezclarse conceptualmente.

---

# 4. Modelo de estados visuales

Todas las áreas deberán contemplar, cuando aplique:

```text
LOADING
READY
EMPTY
ERROR
OFFLINE
ACTION_SUCCESS
```

Los flujos de negocio pueden agregar estados específicos.

---

# 5. Flujo GRADUATE — Acceso

## UX-G-AUTH-001 — Entrada al evento

Pantalla:

```text
Accede a tu graduación
```

Objetivo:

Permitir iniciar el proceso mediante el mecanismo de acceso asociado al evento.

Acciones:

- continuar;
- ir a login si ya tiene cuenta.

Transición:

```text
Accede a tu graduación
→ Registro
```

o:

```text
Accede a tu graduación
→ Login
```

---

## UX-G-AUTH-002 — Registro

Pantalla:

```text
Registro
```

El usuario captura los datos de cuenta y confirma el contexto del evento.

Resultado esperado:

```text
Cuenta creada
+ membresía al evento
```

Transición principal:

```text
Registro
→ Inicio
```

Reglas relacionadas:

- BR-AUTH-001
- BR-AUTH-002
- FR-AUTH-003

---

## UX-G-AUTH-003 — Login

Pantalla:

```text
Iniciar sesión
```

Acciones:

- iniciar sesión;
- recuperar contraseña;
- volver al acceso por evento.

Resultado:

```text
Login
→ Resolver membresías
```

Si tiene una sola:

```text
→ Inicio
```

Si tiene varias:

```text
→ Mis eventos
```

---

## UX-G-AUTH-004 — Recuperación de contraseña

Flujo:

```text
Login
→ Recuperar contraseña
→ Revisa tu correo
→ Login
```

La pantalla no deberá revelar si un correo pertenece o no a una cuenta mediante mensajes que faciliten enumeración.

---

# 6. Flujo GRADUATE — Selector de evento

## UX-G-EVT-001 — Mis eventos

Condición:

La cuenta tiene más de una membresía válida.

Pantalla:

```text
Mis eventos
```

Cada tarjeta/fila muestra:

- nombre;
- fecha;
- lugar;
- estado visible.

Acción:

```text
Abrir evento
```

Transición:

```text
Mis eventos
→ Inicio del evento seleccionado
```

---

# 7. Flujo GRADUATE — Inicio

## UX-G-HOME-001 — Estado normal

Pantalla:

```text
Inicio
```

Contenido mínimo:

- evento;
- fecha;
- lugar;
- avance financiero;
- pagado;
- pendiente;
- próximo pago;
- lugares;
- mesa;
- platillos;
- termo.

Accesos rápidos:

- Mi grupo;
- Ver mesa;
- Platillos;
- Mis pagos;
- Termo.

---

## UX-G-HOME-002 — Pago próximo

Variante:

```text
Inicio — Pago próximo
```

Debe destacar:

- monto;
- fecha;
- CTA `Pagar ahora`.

No deberá ocultar el resto del contexto del evento.

---

## UX-G-HOME-003 — Pago vencido

Variante:

```text
Inicio — Pago vencido
```

Mensaje:

```text
Tienes un pago pendiente.
La fecha de pago ya pasó.
```

CTA:

```text
Ver pago
```

No mostrar recargos automáticos.

---

# 8. Flujo GRADUATE — Mi grupo

## UX-G-GROUP-001 — Resumen del grupo

Pantalla:

```text
Mi grupo
```

Mostrar:

- lugares contratados;
- integrantes activos;
- capacidad disponible para agregar, cuando aplique;
- mesa actual;
- estado de platillos.

Acciones:

- agregar integrante;
- solicitar modificación de lugares;
- ir a mesa;
- ir a platillos.

---

## UX-G-GROUP-002 — Agregar integrante

Entrada:

```text
Mi grupo
→ Agregar invitado
```

Validaciones previas:

- evento `OPEN`;
- deadline vigente;
- lugares disponibles;
- capacidad global.

Resultado:

```text
Integrante agregado
→ Mi grupo actualizado
```

---

## UX-G-GROUP-003 — Sin capacidad

Estado alternativo:

```text
Sin capacidad disponible
```

Mensaje:

```text
Por ahora no hay lugares disponibles para agregar a tu grupo.
```

Acción:

```text
Volver a mi grupo
```

---

## UX-G-GROUP-004 — Reducción de lugares

Entrada:

```text
Mi grupo
→ Solicitar reducción de lugares
```

La interfaz deberá dejar claro que:

```text
la reducción requiere revisión/acción administrativa
```

No deberá simular una reducción inmediata si todavía requiere autorización.

---

# 9. Flujo GRADUATE — Mesa

## UX-G-SEAT-001 — Selección de mesa

Entrada:

```text
Mi grupo
→ Ver mesas
```

Pantalla:

```text
Selección de mesa
```

Mostrar croquis en modo lectura.

Cada mesa deberá permitir identificar:

- etiqueta;
- disponibilidad;
- estado.

No mostrar PII de terceros.

---

## UX-G-SEAT-002 — Detalle de mesa

Entrada:

```text
Selección de mesa
→ Mesa 24
```

Pantalla:

```text
Mesa 24
```

Mostrar:

- capacidad;
- disponibles;
- lugares requeridos por el grupo.

CTA:

```text
Elegir esta mesa
```

---

## UX-G-SEAT-003 — Confirmación

Flujo:

```text
Mesa 24
→ Confirmar Mesa 24
```

Mensaje:

```text
Se asignarán tus lugares a esta mesa.
```

CTA:

```text
Confirmar mesa
```

---

## UX-G-SEAT-004 — Éxito

Resultado:

```text
Mesa confirmada
```

Mostrar:

```text
Tu grupo está en Mesa 24.
```

Transición:

```text
→ Mi grupo
```

o siguiente tarea recomendada.

---

## UX-G-SEAT-005 — Disponibilidad cambió

Caso:

La capacidad cambió antes de confirmar.

Estado:

```text
Esta mesa acaba de cambiar
```

Mensaje:

```text
Ya no hay suficientes lugares disponibles para tu grupo.
```

CTA:

```text
Ver mesas disponibles
```

Reglas:

- BR-SEAT-014
- BR-CON-003
- FR-SEAT-022

---

## UX-G-SEAT-006 — Deadline cerrado

Estado:

```text
Tu mesa está confirmada
```

Mensaje:

```text
El periodo para realizar cambios ya terminó.
Si necesitas ayuda, contacta al organizador.
```

No mostrar CTA de cambio.

---

## UX-G-SEAT-007 — Grupo dividido

Cuando el grupo no pueda ubicarse completo en una sola mesa y el proceso requiera división:

```text
GRADUATE
→ recibe propuesta/estado de distribución
```

La edición avanzada se prioriza para ADMIN.

El autoservicio no deberá obligar al graduado a administrar múltiples asignaciones complejas salvo que el flujo sea expresamente habilitado.

---

# 10. Flujo GRADUATE — Platillos

## UX-G-MEAL-001 — Resumen

Pantalla:

```text
Platillos
```

Mostrar:

- integrantes;
- selección actual;
- pendientes;
- avance de completitud.

---

## UX-G-MEAL-002 — Seleccionar platillo

Entrada:

```text
Platillos
→ Integrante
```

Mostrar opciones configuradas por evento.

Acción:

```text
Guardar
```

---

## UX-G-MEAL-003 — Revisión

Flujo:

```text
Selecciones
→ Revisar tus platillos
```

Mostrar resumen por integrante y conteos.

CTA:

```text
Confirmar
```

---

## UX-G-MEAL-004 — Guardado

Feedback:

```text
Platillos guardados
```

Puede representarse mediante:

- toast;
- estado de confirmación;
- badge de completitud.

---

## UX-G-MEAL-005 — Deadline cerrado

Estado:

```text
La selección de platillos ya cerró
```

El graduado puede consultar, no editar.

CTA opcional:

```text
Contactar al organizador
```

---

# 11. Flujo GRADUATE — Pagos

## UX-G-PAY-001 — Mis pagos

Pantalla:

```text
Mis pagos
```

Mostrar:

- total contratado;
- pagado;
- pendiente;
- avance;
- listado de mensualidades/obligaciones;
- estado de cada una;
- historial.

---

## UX-G-PAY-002 — Detalle de obligación

Entrada:

```text
Mis pagos
→ Mensualidad 4
```

Mostrar:

- concepto;
- monto;
- fecha;
- estado;
- saldo relacionado.

CTA:

```text
Pagar ahora
```

---

## UX-G-PAY-003 — Confirmación previa

Pantalla:

```text
Vas a pagar
```

Mostrar:

- concepto;
- monto;
- proveedor principal.

CTA principal:

```text
Continuar con Mercado Pago
```

Alternativa:

```text
Otros métodos de pago
```

---

# 12. Flujo GRADUATE — Mercado Pago

## UX-G-MP-001 — Salida al proveedor

Estado conceptual:

```text
Continuando a Mercado Pago
```

El sistema deberá comunicar que el usuario saldrá temporalmente de Plataforma GR.

---

## UX-G-MP-002 — Retorno / verificación

Al volver:

```text
Estamos confirmando tu pago
```

No mostrar éxito aún.

El frontend deberá consultar el estado backend.

---

## UX-G-MP-003 — Pago confirmado

Estado:

```text
Pago confirmado
```

Mostrar:

- concepto;
- monto;
- nuevo avance financiero.

Acciones:

- volver a Mis pagos;
- continuar al termo si el umbral se alcanzó.

---

## UX-G-MP-004 — Pago fallido

Estado:

```text
No pudimos completar el pago
```

Texto:

```text
No se realizó ningún cargo confirmado.
```

Acciones:

- intentar nuevamente;
- elegir otro método.

---

## UX-G-MP-005 — Pago pendiente

Estado:

```text
Pago pendiente
```

Mensaje:

```text
Tu pago todavía está siendo procesado.
```

CTA:

```text
Volver a mis pagos
```

---

## UX-G-MP-006 — Otros métodos

Pantalla:

```text
Otros métodos de pago
```

Mostrar:

- OpenPay como alternativa;
- información sobre pagos registrados directamente por ADMIN.

El GRADUATE no podrá marcar un pago como realizado manualmente.

---

# 13. Flujo GRADUATE — Termo

## UX-G-TH-001 — Bloqueado

Pantalla:

```text
Mi termo
```

Estado:

```text
Bloqueado
```

Mostrar progreso hacia el umbral.

CTA recomendado:

```text
Ver mis pagos
```

---

## UX-G-TH-002 — Disponible

Cuando el umbral se alcanza:

```text
Mi termo — Disponible
```

CTA:

```text
Solicitar mi termo
```

---

## UX-G-TH-003 — Solicitud

Pantalla:

```text
Solicitar mi termo
```

Capturar únicamente la personalización habilitada.

CTA:

```text
Enviar solicitud
```

---

## UX-G-TH-004 — Solicitado

Estado:

```text
Solicitado
```

Si todavía se permite edición:

```text
Editar datos
```

---

## UX-G-TH-005 — En producción

Estado:

```text
En producción
```

Mensaje:

```text
Tu termo ya está en producción y no puede modificarse.
```

No mostrar CTA de edición.

---

## UX-G-TH-006 — Entregado

Estado final:

```text
Entregado
```

Modo consulta.

---

# 14. Flujo GRADUATE — Resumen y cierre

## UX-G-SUM-001 — Mi graduación

Pantalla:

```text
Mi graduación
```

Mostrar:

- grupo;
- mesa;
- platillos;
- pagos;
- termo.

---

## UX-G-SUM-002 — Todo listo

Estado:

```text
Todo listo para tu graduación
```

Debe indicar que las tareas principales están completas.

---

## UX-G-SUM-003 — Evento finalizado

Estado:

```text
Tu evento ha finalizado
```

Toda la información relevante permanece disponible en modo lectura.

---

# 15. Flujo GRADUATE — Más

Pantalla:

```text
Más
```

Opciones:

- Mi perfil;
- Notificaciones;
- Ayuda;
- Cambiar evento;
- Cerrar sesión.

---

# 16. Flujo GRADUATE — Notificaciones

Pantalla:

```text
Notificaciones
```

Tipos esperados:

- pago próximo;
- pago confirmado;
- pago vencido;
- termo disponible;
- cambio de mesa;
- cambio relevante del evento.

Estado vacío:

```text
Aún no tienes notificaciones
```

---

# 17. Flujo GRADUATE — Perfil

Pantalla:

```text
Mi perfil
```

El GRADUATE puede editar únicamente campos personales permitidos.

No mostrar controles para:

- rol;
- evento;
- pagos;
- mesa;
- reglas financieras.

---

# 18. Flujo GRADUATE — Ayuda

Pantalla:

```text
¿Necesitas ayuda?
```

Opciones MVP:

- contactar al organizador;
- preguntas frecuentes.

No incluir:

- chatbot;
- chat en vivo;
- tickets de soporte;

salvo Change Request.

---

# 19. Flujo ADMIN — Login

Pantalla:

```text
Plataforma GR — Administración
```

Campos:

- correo;
- contraseña.

Acciones:

- iniciar sesión;
- recuperar contraseña.

Resultado:

```text
→ Dashboard
```

---

# 20. Flujo ADMIN — Dashboard global

## UX-A-DASH-001 — Inicio

Pantalla:

```text
Inicio
```

Mostrar:

- eventos activos;
- graduados;
- total recaudado;
- pendiente;
- vencido;
- alertas.

Acciones:

- abrir evento;
- crear evento;
- navegar a Graduados;
- navegar a Pagos;
- navegar a Reportes.

---

# 21. Flujo ADMIN — Eventos

## UX-A-EVT-001 — Listado

Pantalla:

```text
Eventos
```

Filtros:

- todos;
- borrador;
- abierto;
- cerrado;
- finalizado;
- cancelado.

CTA:

```text
Crear evento
```

---

## UX-A-EVT-002 — Crear evento

Wizard:

```text
Paso 1 — Información
Paso 2 — Plan financiero
Paso 3 — Fechas límite
Paso 4 — Termo
Paso 5 — Revisar
```

---

## UX-A-EVT-003 — Paso 1

Campos:

- nombre;
- fecha;
- lugar;
- capacidad.

---

## UX-A-EVT-004 — Paso 2

Campos:

- precio/total base;
- obligación inicial;
- número/calendario de pagos;
- primer vencimiento;
- periodo de gracia.

---

## UX-A-EVT-005 — Paso 3

Campos:

- fecha límite para lugares;
- fecha límite para cambio de mesa;
- fecha límite de platillos.

---

## UX-A-EVT-006 — Paso 4

Campo:

```text
Porcentaje para desbloquear el termo
```

---

## UX-A-EVT-007 — Paso 5

Mostrar resumen y CTA:

```text
Crear evento
```

Resultado:

```text
→ Resumen del evento
```

---

# 22. Flujo ADMIN — Resumen del evento

Pantalla:

```text
Resumen
```

Mostrar:

- estado;
- fecha;
- lugar;
- graduados;
- lugares;
- recaudado;
- pendiente;
- vencido;
- ocupación;
- tareas que requieren atención.

Navegación contextual:

```text
Graduados
Pagos
Mesas
Platillos
Termos
Reportes
Configuración
```

---

# 23. Flujo ADMIN — Ciclo de vida del evento

## UX-A-EVT-STATE-001 — Cerrar

```text
Resumen
→ Cerrar evento
→ Confirmación
→ CLOSED
```

---

## UX-A-EVT-STATE-002 — Reabrir

```text
CLOSED
→ Reabrir evento
→ OPEN
```

---

## UX-A-EVT-STATE-003 — Finalizar

```text
Resumen
→ Finalizar evento
→ Confirmación
→ FINALIZED
```

---

## UX-A-EVT-STATE-004 — Cancelar

```text
Resumen
→ Cancelar evento
→ Motivo obligatorio
→ Confirmación destructiva
→ CANCELLED
```

---

# 24. Flujo ADMIN — Graduados

## UX-A-GRAD-001 — Listado

Pantalla:

```text
Graduados
```

Búsqueda:

- nombre;
- correo;
- teléfono cuando corresponda.

Filtros:

- todos;
- al día;
- pendientes;
- vencidos;
- sin mesa;
- platillos incompletos;
- termo disponible/estado.

---

## UX-A-GRAD-002 — Abrir expediente

Flujo:

```text
Graduados
→ Andrea Martínez
```

---

# 25. Flujo ADMIN — Expediente del graduado

Pantalla:

```text
Andrea Martínez
```

Secciones:

```text
Resumen
Grupo
Pagos
Mesa
Platillos
Termo
Historial
```

El ADMIN debe poder saltar entre estas áreas sin perder contexto del graduado.

---

# 26. Flujo ADMIN — Grupo

Pantalla:

```text
Grupo de Andrea Martínez
```

Mostrar:

- lugares;
- integrantes;
- estado.

Acciones:

- agregar integrante;
- editar integrante;
- reducir lugares.

---

## UX-A-GROUP-001 — Reducción

Flujo:

```text
Grupo
→ Reducir lugares
→ Mostrar impacto
→ Motivo
→ Confirmar
```

Si existe plan congelado, no representar la operación como simple edición de precio.

---

# 27. Flujo ADMIN — Cancelar graduado

Entrada:

```text
Andrea Martínez
→ Cancelar participación
```

Mostrar:

- lugares;
- mesa;
- pagado;
- pendiente;
- política de cancelación.

Requerir:

```text
Motivo
```

Resultado:

```text
Membresía cancelada
```

Sin eliminar historia.

---

# 28. Flujo ADMIN — Pagos del graduado

Pantalla:

```text
Pagos de Andrea Martínez
```

Mostrar:

- contratado;
- pagado;
- pendiente;
- vencido;
- calendario de obligaciones.

Acciones:

- registrar pago;
- registrar ajuste/reembolso;
- ver historial.

---

# 29. Flujo ADMIN — Registrar pago manual

Entrada:

```text
Pagos de Andrea
→ Registrar pago
```

Campos:

- concepto;
- monto;
- fecha;
- método;
- referencia/nota;
- evidencia opcional.

Métodos:

```text
Efectivo
Transferencia
```

Resultado:

```text
Pago registrado
```

---

# 30. Flujo ADMIN — Pago registrado

Pantalla/estado:

```text
Pago registrado
```

Mostrar:

- graduado;
- concepto;
- monto;
- método;
- fecha.

CTA:

```text
Volver a pagos
```

---

# 31. Flujo ADMIN — Pago vencido

Entrada:

```text
Cartera
→ Pago vencido
```

Mostrar:

- graduado;
- obligación;
- monto;
- fecha;
- estado.

Acciones:

- registrar pago;
- ver graduado.

---

# 32. Flujo ADMIN — Ajuste / reembolso

Entrada:

```text
Pagos
→ Registrar ajuste
```

Selector:

- ajuste;
- reembolso.

Mostrar:

- movimiento relacionado;
- monto;
- fecha;
- motivo.

Mensaje:

```text
El pago original permanecerá en el historial.
```

---

# 33. Flujo ADMIN — Cartera

Pantalla:

```text
Cartera
```

Filtros:

- todos;
- al día;
- próximos;
- vencidos.

Mostrar por graduado:

- próximo pago;
- fecha;
- pendiente;
- estado.

---

# 34. Flujo ADMIN — Conciliación

Pantalla:

```text
Conciliación de pagos
```

Estados:

- sin diferencias;
- revisión necesaria;
- pendiente de confirmación.

Filtros:

- Mercado Pago;
- OpenPay.

La UI no deberá exponer detalles técnicos innecesarios.

---

# 35. Flujo ADMIN — Mesas / Croquis

## UX-A-SEAT-001 — Croquis

Pantalla:

```text
Mesas
```

Mostrar:

- plano;
- mesas;
- ocupación;
- disponibilidad.

Herramientas:

- crear;
- mover;
- editar;
- bloquear;
- duplicar;
- crear varias mesas.

---

## UX-A-SEAT-002 — Crear varias mesas

Flujo:

```text
Mesas
→ Crear varias mesas
```

Campos:

- cantidad;
- forma;
- capacidad;
- número inicial.

Resultado:

```text
Mesas generadas
→ acomodar en canvas
```

---

## UX-A-SEAT-003 — Detalle de mesa

Flujo:

```text
Mesas
→ Mesa 24
```

Mostrar:

- capacidad;
- ocupados;
- disponibles;
- asignaciones.

Acciones:

- editar;
- asignar graduado;
- bloquear.

---

## UX-A-SEAT-004 — Editar mesa

Pantalla/modal:

```text
Editar Mesa 24
```

Campos:

- nombre/número;
- capacidad.

Si la capacidad propuesta es inválida, no permitir confirmar.

---

## UX-A-SEAT-005 — Asignar graduado

Flujo:

```text
Mesa 24
→ Asignar graduado
→ Buscar
→ Seleccionar graduado
→ Validar capacidad
→ Confirmar
```

---

## UX-A-SEAT-006 — Cambiar mesa de graduado

Flujo:

```text
Andrea
→ Mesa
→ Cambiar mesa
→ Nueva mesa
→ Motivo
→ Confirmar
```

Debe quedar auditado.

---

# 36. Flujo ADMIN — Platillos

## UX-A-MEAL-001 — Panel

Pantalla:

```text
Platillos
```

Mostrar:

- totales por opción;
- pendientes;
- lista por graduado.

---

## UX-A-MEAL-002 — Detalle graduado

```text
Platillos
→ Andrea Martínez
```

Mostrar integrantes y selección.

---

## UX-A-MEAL-003 — Override después del deadline

Si el deadline ya venció:

```text
Modificar selección
→ Motivo obligatorio
→ Guardar
```

---

# 37. Flujo ADMIN — Termos

## UX-A-TH-001 — Panel

Pantalla:

```text
Termos
```

Mostrar estados:

- bloqueados;
- disponibles;
- solicitados;
- en producción;
- entregados.

---

## UX-A-TH-002 — Detalle

```text
Termos
→ Andrea Martínez
```

Mostrar:

- avance financiero;
- personalización;
- estado;
- timeline.

---

## UX-A-TH-003 — Marcar en producción

```text
Detalle
→ Marcar en producción
→ Confirmar
→ IN_PRODUCTION
```

---

## UX-A-TH-004 — Marcar entregado

```text
Detalle
→ Marcar como entregado
→ Confirmar
→ DELIVERED
```

---

# 38. Flujo ADMIN — Reportes

Pantalla:

```text
Reportes
```

Opciones:

- Cobranza;
- Cartera;
- Mesas;
- Platillos;
- Termos.

---

## UX-A-REP-001 — Financiero

Mostrar:

- contratado;
- recaudado;
- pendiente;
- vencido.

Acciones:

- exportar Excel/CSV;
- generar PDF cuando aplique.

---

## UX-A-REP-002 — Mesas

Mostrar:

- mesas;
- capacidad;
- ocupación;
- disponibles.

---

## UX-A-REP-003 — Platillos

Mostrar:

- totales por opción;
- pendientes.

---

## UX-A-REP-004 — Termos

Mostrar:

- totales por estado.

---

# 39. Flujo ADMIN — Configuración

Pantalla:

```text
Configuración
```

Secciones:

- Información;
- Plan financiero;
- Fechas límite;
- Termo;
- Cancelaciones;
- Platillos.

La UI deberá distinguir entre:

```text
defaults del evento
```

y:

```text
planes ya congelados
```

No debe sugerir que editar la configuración cambiará automáticamente obligaciones históricas.

---

# 40. Flujo ADMIN — Administradores

Pantalla:

```text
Administradores
```

Mostrar:

- nombre;
- correo;
- estado;
- último acceso.

CTA:

```text
Agregar administrador
```

---

## UX-A-ADM-001 — Agregar administrador

Campos:

- nombre;
- correo.

No mostrar:

- selector de rol;
- permisos;
- scopes.

---

# 41. Flujo ADMIN — Historial

Pantalla:

```text
Historial de cambios
```

Mostrar en lenguaje natural:

```text
Mariana cambió a Andrea Martínez de Mesa 18 a Mesa 24.
```

Filtros opcionales:

- fecha;
- módulo;
- administrador;
- evento.

No exponer JSON o logs técnicos.

---

# 42. Flujo ADMIN — Más

Opciones:

- Administradores;
- Mi perfil;
- Historial de cambios;
- Ayuda;
- Cerrar sesión.

---

# 43. Estados transversales ADMIN

## UX-A-STATE-001 — Loading

Usar skeletons en:

- cards;
- tablas;
- encabezados.

---

## UX-A-STATE-002 — Sin resultados

Ejemplo:

```text
No encontramos graduados con esos filtros.
```

CTA:

```text
Limpiar filtros
```

---

## UX-A-STATE-003 — Error

```text
No pudimos cargar esta información.
```

CTA:

```text
Intentar de nuevo
```

---

## UX-A-STATE-004 — Sin conexión

```text
Parece que no tienes conexión.
```

CTA:

```text
Reintentar
```

---

## UX-A-STATE-005 — Acción completada

Feedback no intrusivo:

- Pago registrado;
- Cambios guardados;
- Mesa actualizada;
- Estado del termo actualizado.

---

# 44. Mapa principal GRADUATE

```text
Acceso
├── Registro
│   └── Inicio
├── Login
│   ├── Recuperar contraseña
│   └── Inicio / Mis eventos
│
Inicio
├── Mi grupo
│   ├── Agregar integrante
│   ├── Mesa
│   │   ├── Selección
│   │   ├── Detalle
│   │   ├── Confirmación
│   │   └── Éxito / Conflicto
│   └── Platillos
│       ├── Selección
│       ├── Revisión
│       └── Guardado
│
├── Mis pagos
│   ├── Detalle obligación
│   ├── Confirmación previa
│   ├── Mercado Pago
│   ├── Confirmando
│   └── Éxito / Fallo / Pendiente
│
├── Termo
│   ├── Bloqueado
│   ├── Disponible
│   ├── Solicitado
│   ├── En producción
│   └── Entregado
│
└── Más
    ├── Perfil
    ├── Notificaciones
    ├── Ayuda
    ├── Cambiar evento
    └── Cerrar sesión
```

---

# 45. Mapa principal ADMIN

```text
Login
└── Inicio
    ├── Eventos
    │   ├── Crear evento
    │   └── Evento
    │       ├── Resumen
    │       ├── Graduados
    │       │   └── Graduado
    │       │       ├── Grupo
    │       │       ├── Pagos
    │       │       ├── Mesa
    │       │       ├── Platillos
    │       │       ├── Termo
    │       │       └── Historial
    │       ├── Pagos
    │       │   ├── Cartera
    │       │   ├── Manual
    │       │   ├── Ajuste/Reembolso
    │       │   └── Conciliación
    │       ├── Mesas
    │       │   ├── Croquis
    │       │   ├── Mesa
    │       │   └── Asignaciones
    │       ├── Platillos
    │       ├── Termos
    │       ├── Reportes
    │       └── Configuración
    │
    ├── Graduados
    ├── Pagos
    ├── Reportes
    └── Más
        ├── Administradores
        ├── Perfil
        ├── Historial
        ├── Ayuda
        └── Cerrar sesión
```

---

# 46. Manejo de errores por flujo

| Flujo | Condición | Estado UX |
|---|---|---|
| Registro | Evento inválido | Acceso no disponible |
| Agregar lugar | Sin capacidad | Sin capacidad disponible |
| Mesa | Capacidad cambió | Esta mesa acaba de cambiar |
| Mesa | Deadline vencido | Cambios de mesa cerrados |
| Platillos | Deadline vencido | Selección cerrada |
| Pago | Retorno proveedor | Estamos confirmando |
| Pago | Rechazado | No pudimos completar el pago |
| Pago | Pendiente | Pago pendiente |
| Termo | Umbral no alcanzado | Bloqueado |
| Termo | En producción | Edición bloqueada |
| Admin | Sin permiso | Acceso no autorizado |
| Admin | Sin resultados | Estado vacío |
| Global | Error de red | Error / Sin conexión |

---

# 47. Reglas de CTAs

## CTA primario

Cada pantalla deberá tener como máximo una acción primaria claramente dominante cuando exista una siguiente acción natural.

Ejemplos:

- Elegir esta mesa;
- Confirmar mesa;
- Pagar ahora;
- Solicitar mi termo;
- Registrar pago;
- Guardar cambios.

---

## CTA secundario

Utilizar para:

- cancelar;
- volver;
- ver alternativas;
- elegir otro método.

---

## Acciones destructivas

Acciones como:

- cancelar evento;
- cancelar graduado;
- bloquear mesa;

deberán requerir confirmación.

---

# 48. Persistencia de contexto

Al navegar dentro de:

```text
Evento
→ Graduado
→ Pagos
```

la UI deberá conservar visualmente:

- evento actual;
- graduado actual.

Evitar que el usuario pierda el contexto y confunda información de eventos simultáneos.

---

# 49. Navegación tras mutaciones

Después de una operación exitosa:

### Crear evento

```text
→ Resumen del evento
```

### Confirmar mesa

```text
→ Mesa confirmada / Mi grupo
```

### Guardar platillos

```text
→ Resumen de platillos
```

### Pago confirmado

```text
→ Mis pagos / Termo si corresponde
```

### Registrar pago ADMIN

```text
→ Pago registrado
→ Pagos del graduado
```

### Cambiar mesa ADMIN

```text
→ Mesa del graduado actualizada
```

### Termo a producción

```text
→ Detalle del termo actualizado
```

---

# 50. Navegación tras conflicto

Una operación rechazada por disponibilidad no deberá sacar al usuario del contexto.

Ejemplo:

```text
Mesa 24
→ confirmar
→ TABLE_CAPACITY_CHANGED
→ Esta mesa acaba de cambiar
→ Ver mesas disponibles
```

---

# 51. Datos visibles por rol

## GRADUATE

Puede ver:

- su información;
- disponibilidad agregada;
- sus montos;
- sus integrantes;
- su mesa;
- sus platillos;
- su termo.

No puede ver:

- nombres de terceros en mesa;
- pagos de terceros;
- configuración admin;
- auditoría.

---

## ADMIN

Puede ver:

- información operativa global;
- expedientes;
- reportes;
- auditoría;
- configuración.

La interfaz ADMIN deberá evitar exponer secretos técnicos aunque el rol tenga privilegios operativos.

---

# 52. Referencia del prototipo

Los prototipos aprobados en Stitch se consideran referencia visual y de navegación.

Sin embargo:

- nombres demo no son necesariamente reglas;
- montos demo no son necesariamente globales;
- copy puede ajustarse para consistencia;
- ninguna pantalla puede contradecir `BUSINESS_RULES.md`;
- el prototipo no sustituye validaciones backend.

Cuando exista conflicto:

```text
Business Rules / SRS
> Prototype
```

---

# 53. Trazabilidad

| Flujo UX | SRS principal | Roles/Permisos |
|---|---|---|
| Acceso GRADUATE | FR-AUTH | §3–7 |
| Selector evento | FR-AUTH-007 | RP-EVT |
| Mi grupo | FR-PLC | RP-GROUP |
| Mesa | FR-SEAT | RP-SEAT |
| Platillos | FR-MEAL | RP-MEAL |
| Pagos GRADUATE | FR-FIN / FR-MP | RP-FIN / RP-PAY |
| Termo | FR-TH | RP-TH |
| Dashboard ADMIN | FR-DASH | ADMIN |
| Eventos | FR-EVT | RP-EVT |
| Graduados | FR-GRAD | RP-GRAD |
| Pagos ADMIN | FR-MAN / FR-ADJ / FR-CAR | RP-MAN / RP-ADJ |
| Mesas ADMIN | FR-SEAT | RP-SEAT |
| Reportes | FR-REP | RP-REP |
| Auditoría | FR-AUD | RP-AUD |

---

# 54. Pruebas E2E mínimas derivadas

## UX-E2E-001 — Registro y entrada

```text
Acceso → Registro → Inicio
```

---

## UX-E2E-002 — Selección de mesa

```text
Inicio → Mi grupo → Mesas → Mesa → Confirmar → Éxito
```

---

## UX-E2E-003 — Conflicto de mesa

```text
Mesa → Confirmar → Conflicto → Volver a mesas
```

---

## UX-E2E-004 — Platillos

```text
Mi grupo → Platillos → Seleccionar → Revisar → Guardar
```

---

## UX-E2E-005 — Pago exitoso

```text
Mis pagos
→ Mensualidad
→ Confirmación
→ Mercado Pago
→ Confirmando
→ Pago confirmado
```

---

## UX-E2E-006 — Pago pendiente

```text
Mercado Pago
→ Confirmando
→ Pago pendiente
```

---

## UX-E2E-007 — Desbloqueo de termo

```text
Pago confirmado
→ progreso supera umbral
→ Termo disponible
→ Solicitar
```

---

## UX-E2E-008 — Admin registra pago

```text
Admin
→ Evento
→ Graduado
→ Pagos
→ Registrar pago
→ Pago registrado
```

---

## UX-E2E-009 — Admin cambia mesa

```text
Admin
→ Graduado
→ Mesa
→ Cambiar mesa
→ Motivo
→ Confirmar
```

---

## UX-E2E-010 — Admin finaliza evento

```text
Evento
→ Finalizar
→ Confirmar
→ Evento en consulta
```

---

# 55. Decisiones UX cerradas

Se consideran baseline:

1. GRADUATE mobile-first;
2. ADMIN desktop-first;
3. navegación GRADUATE inferior `Inicio | Mi grupo | Pagos | Más`;
4. navegación ADMIN global + contexto por evento;
5. Mercado Pago mediante salida/redirección;
6. estado intermedio `Estamos confirmando tu pago`;
7. croquis GRADUATE solo lectura;
8. croquis ADMIN editable;
9. selección de mesa por grupo, no por silla;
10. modificaciones administrativas sensibles con motivo;
11. deadlines bloquean GRADUATE, no necesariamente ADMIN;
12. estados transversales de loading/error/offline/empty;
13. no exponer términos técnicos;
14. no usar VIP/Premium como categorías;
15. la historia financiera no se edita destructivamente.

---

# 56. Fuera de alcance UX

No diseñar flujos para:

- invitaciones digitales;
- RSVP;
- QR;
- check-in;
- scanner;
- hostess;
- álbum;
- marketplace;
- planners;
- salones;
- roles configurables;
- selección de asiento;
- reconocimiento automático del croquis;
- chat en vivo;
- WhatsApp automatizado.

---

# 57. Documentos siguientes

Este documento deberá alimentar:

1. `FINANCIAL_DOMAIN.md`
2. `SEATING_MAP.md`
3. `DATA_MODEL.md`
4. `API_CONTRACTS.md`
5. `NON_FUNCTIONAL_REQUIREMENTS.md`
6. `ACCEPTANCE_CRITERIA.md`
7. `ROADMAP_IMPLEMENTATION.md`

---

# 58. Baseline

Con esta versión se establece:

```text
UX_FLOWS_VERSION = 1.0
```

Los flujos aquí definidos constituyen el baseline de navegación y comportamiento UX para implementación.
