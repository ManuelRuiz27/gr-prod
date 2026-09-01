# Plataforma GR — Software Requirements Specification

**Documento:** `SRS.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.1  
**Estado:** Baseline funcional trazable para diseño e implementación  
**Fecha:** 31 de agosto de 2026  
**Fuentes normativas:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`

---

# 1. Propósito

Este SRS especifica los requisitos verificables de Plataforma GR. Todo comportamiento implementado deberá poder trazarse a uno o más `FR-*` y a reglas `BR-*`.

Prioridades:

- `P0`: integridad, seguridad o flujo esencial.
- `P1`: obligatorio para MVP.
- `P2`: importante posterior al núcleo.

Roles válidos:

```text
ADMIN
GRADUATE
```

---

# 2. Alcance resumido

Plataforma GR administra eventos de graduación, membresías, contratos, productos/lugares, personas, pagos, comprobantes, cartera, penalizaciones, cancelaciones, mesas, platillos, termos, reportes y auditoría.

No incluye invitaciones digitales, RSVP, QR/check-in, scanner, selección individual de silla, multi-tenant ni facturación CFDI.

---

# 3. Autenticación e identidad

## FR-AUTH-001 — Login ADMIN
**P0.** Permitir autenticación de cuentas ADMIN activas.

## FR-AUTH-002 — Login GRADUATE
**P0.** Permitir autenticación de cuentas GRADUATE activas.

## FR-AUTH-003 — Registro contextual
**P0.** El alta de GRADUATE deberá originarse desde un mecanismo asociado a un evento; el usuario no podrá elegir arbitrariamente otro evento.

## FR-AUTH-004 — Recuperación de contraseña
**P1.** Permitir recuperación mediante token temporal enviado por correo.

## FR-AUTH-005 — Logout
**P1.** Permitir cerrar sesión.

## FR-AUTH-006 — Cuenta multi-evento
**P1.** Una cuenta GRADUATE podrá tener múltiples membresías y seleccionar el contexto de evento.

## FR-AUTH-007 — Rol backend
**P0.** El backend determinará el rol y no confiará en valores enviados por frontend.

## FR-AUTH-008 — Protección ownership
**P0.** Todos los recursos `/me` deberán resolverse contra la cuenta autenticada y su membresía.

---

# 4. Cuentas ADMIN

## FR-ADM-001 — Listar administradores
**P1.** ADMIN podrá consultar las cuentas administrativas.

## FR-ADM-002 — Crear/invitar administrador
**P1.** ADMIN podrá crear una cuenta administrativa con nombre, correo y estado.

## FR-ADM-003 — Rol único
**P0.** No existirán subroles ni permisos personalizados.

## FR-ADM-004 — Deshabilitar cuenta
**P1.** ADMIN podrá deshabilitar otra cuenta administrativa sin borrar historia.

---

# 5. Eventos

## FR-EVT-001 — Crear evento
**P0.** ADMIN podrá crear un evento en estado `DRAFT`.

## FR-EVT-002 — Configuración general
**P1.** Configurar nombre, fecha, lugar, escuela/institución, carrera/generación cuando aplique, capacidad y timezone.

## FR-EVT-003 — Configuración financiera
**P0.** Configurar moneda, productos/precios, pago inicial, calendario/importes de parcialidades, gracia, milestones, penalización tardía y reglas de liquidación.

## FR-EVT-004 — Deadlines
**P1.** Configurar fechas límite independientes para lugares/productos, mesas y platillos.

## FR-EVT-005 — Configuración de termo
**P1.** Configurar umbral y campos de personalización permitidos.

## FR-EVT-006 — Configuración de cancelación
**P0.** Asociar una política de cancelación versionada y administrable.

## FR-EVT-007 — Abrir
**P1.** ADMIN podrá transicionar `DRAFT → OPEN` cuando la configuración requerida sea válida.

## FR-EVT-008 — Cerrar/reabrir
**P1.** ADMIN podrá `OPEN → CLOSED → OPEN` con auditoría.

## FR-EVT-009 — Finalizar
**P1.** ADMIN podrá marcar `FINALIZED`; la información seguirá disponible en lectura y correcciones financieras controladas.

## FR-EVT-010 — Cancelar evento
**P1.** ADMIN podrá cancelar con motivo sin eliminar registros.

## FR-EVT-011 — Dashboard de evento
**P1.** Mostrar graduados, lugares, contratado, cobrado, pendiente, vencido, ocupación y alertas.

---

# 6. Contrato y folio

## FR-CON-001 — Generar contrato
**P0.** El sistema deberá generar/registrar un contrato individual por membresía.

## FR-CON-002 — Folio único
**P0.** Cada contrato deberá tener un folio único y estable.

## FR-CON-003 — Contenido contractual
**P0.** El contrato deberá reflejar evento, identidad, productos/lugares, total, calendario/condiciones financieras y política de cancelación aplicable.

## FR-CON-004 — Visualizar contrato
**P1.** GRADUATE podrá consultar su contrato vigente.

## FR-CON-005 — Aceptar términos
**P0.** GRADUATE deberá poder aceptar expresamente términos/contrato.

## FR-CON-006 — Evidencia de aceptación
**P0.** Registrar cuenta, versión, timestamp e información técnica de evidencia definida por NFR.

## FR-CON-007 — Versionado
**P0.** Un contrato aceptado deberá conservar la versión/snapshot de términos y política de cancelación.

## FR-CON-008 — Cambios posteriores
**P1.** Adiciones posteriores deberán aparecer como line items/adendas trazables sin reescribir historia.

---

# 7. Graduados, productos, lugares e integrantes

## FR-PLC-001 — Expediente
**P1.** ADMIN podrá consultar expediente consolidado del graduado.

## FR-PLC-002 — Productos del evento
**P1.** ADMIN podrá configurar productos equivalentes a Adulto, Niño y Sin cena, con nombre/precio/estado.

## FR-PLC-003 — Lugares contratados
**P0.** Cada membresía deberá mantener cantidad vigente y detalle de line items/productos contratados.

## FR-PLC-004 — Integrantes nominales
**P1.** Registrar personas del grupo, incluyendo integrante principal.

## FR-PLC-005 — Límite de integrantes
**P0.** Integrantes activos no podrán exceder lugares vigentes.

## FR-PLC-006 — Agregar producto/lugar
**P1.** GRADUATE podrá agregar productos/lugares cuando evento, deadline, capacidad y finanzas lo permitan.

## FR-PLC-007 — Capacidad global atómica
**P0.** La operación que confirme lugares deberá impedir `confirmed_places > event.capacity` bajo concurrencia.

## FR-PLC-008 — Catch-up financiero
**P0.** Una compra adicional deberá calcular el importe de regularización requerido para alcanzar el avance financiero exigible a la fecha, si existe.

## FR-PLC-009 — Reducción administrativa
**P1.** Solo ADMIN podrá reducir lugares/productos con motivo y evaluación de impacto financiero.

## FR-PLC-010 — No destrucción financiera
**P0.** Una reducción posterior al congelamiento no editará pagos históricos.

---

# 8. Croquis y mesas

## FR-SEAT-001 — Crear croquis
**P1.** ADMIN podrá crear/configurar croquis por evento.

## FR-SEAT-002 — Fondo
**P1.** Permitir JPG/PNG/PDF de una página como referencia visual.

## FR-SEAT-003 — Formas
**P1.** Soportar `SQUARE` y `ROUND`.

## FR-SEAT-004 — Mesa individual
**P1.** Crear/editar etiqueta, capacidad, posición y estado.

## FR-SEAT-005 — Creación masiva
**P1.** Crear múltiples mesas indicando cantidad, forma, capacidad y numeración inicial.

## FR-SEAT-006 — Coordenadas normalizadas
**P0.** Persistir posición/tamaño independiente de resolución.

## FR-SEAT-007 — Ocupación derivada
**P0.** Calcular ocupación desde asignaciones activas.

## FR-SEAT-008 — Asignación por persona
**P0.** Permitir `GroupMember → EventTable`, de modo que integrantes del mismo grupo puedan estar en mesas distintas.

## FR-SEAT-009 — Sin silla
**P0.** No implementar selección individual de silla.

## FR-SEAT-010 — Desbloqueo financiero
**P0.** Bloquear selección GRADUATE mientras no se cumpla la condición financiera configurada.

## FR-SEAT-011 — Privacidad
**P0.** GRADUATE solo verá capacidad/disponibilidad y sus propias asignaciones, nunca PII ajena.

## FR-SEAT-012 — Cambio GRADUATE
**P1.** Permitir cambios propios antes del deadline y con capacidad suficiente.

## FR-SEAT-013 — Override ADMIN
**P1.** Permitir reasignación administrativa fuera de fecha con motivo.

## FR-SEAT-014 — Concurrencia
**P0.** La asignación deberá ser atómica y rechazar sobrecupo.

## FR-SEAT-015 — Integridad de mesa
**P0.** No eliminar mesa ocupada ni reducir capacidad bajo ocupación.

---

# 9. Platillos

## FR-MEAL-001 — Catálogo
**P1.** ADMIN podrá crear, ordenar y desactivar opciones por evento.

## FR-MEAL-002 — Selección por integrante
**P1.** GRADUATE podrá elegir una opción para cada integrante propio.

## FR-MEAL-003 — Completitud
**P1.** Mostrar completos/pendientes.

## FR-MEAL-004 — Deadline
**P0.** Tras el deadline, GRADUATE solo consulta.

## FR-MEAL-005 — Override ADMIN
**P1.** ADMIN podrá modificar después del deadline con motivo y auditoría.

---

# 10. Plan financiero y obligaciones

## FR-FIN-001 — Plan por membresía
**P0.** Crear un `PaymentPlan` independiente por membresía.

## FR-FIN-002 — Parcialidades configurables
**P0.** Cada obligación podrá tener secuencia, concepto, importe y vencimiento propios; no se asumirá importe uniforme.

## FR-FIN-003 — Calendario fijo
**P0.** Las fechas pertenecen al evento/contrato y no se desplazan por alta tardía.

## FR-FIN-004 — Pago inicial
**P0.** Soportar obligación inicial configurable.

## FR-FIN-005 — Congelamiento
**P0.** Congelar condiciones al primer pago confirmado/aplicado.

## FR-FIN-006 — Totales derivados
**P0.** Calcular contratado, cobrado, aplicado, pendiente, vencido, crédito, reembolsos y penalizaciones desde movimientos válidos.

## FR-FIN-007 — Pago adelantado
**P1.** Permitir cubrir obligaciones futuras.

## FR-FIN-008 — Excedente
**P0.** Mantener todo excedente aplicado o como crédito trazable.

## FR-FIN-009 — Historial inmutable
**P0.** No editar/eliminar transacciones confirmadas.

## FR-FIN-010 — Ajustes
**P1.** ADMIN podrá crear ajustes no destructivos con motivo.

---

# 11. Pagos electrónicos

## FR-PAY-001 — Mercado Pago
**P0.** Integrar Mercado Pago Checkout Pro como proveedor primario.

## FR-PAY-002 — OpenPay
**P1.** Mantener OpenPay como proveedor alternativo.

## FR-PAY-003 — Intento
**P0.** Crear `PaymentAttempt` antes de redirección sin modificar saldos.

## FR-PAY-004 — Return URL
**P0.** El retorno del navegador no confirmará pago.

## FR-PAY-005 — Webhook/verificación
**P0.** Confirmar server-to-server y de forma idempotente.

## FR-PAY-006 — Allocation
**P0.** Aplicar transacción confirmada a obligaciones conforme al motor financiero.

## FR-PAY-007 — Estado visible
**P1.** Mostrar `confirmando`, `confirmado`, `pendiente` o `fallido` según estado backend.

---

# 12. Pagos manuales y comprobantes

## FR-MAN-001 — Pago ADMIN
**P0.** ADMIN podrá registrar `CASH`, `TRANSFER` y `DEPOSIT`.

## FR-MAN-002 — Evidencia
**P1.** Permitir referencia, nota y archivo cuando corresponda.

## FR-PROOF-001 — Reportar transferencia/depósito
**P1.** GRADUATE podrá crear un `PaymentSubmission` propio indicando método, importe, fecha/referencia y comprobante.

## FR-PROOF-002 — Estado pendiente
**P0.** Un submission nuevo quedará `PENDING_REVIEW` y no afectará saldo.

## FR-PROOF-003 — Bandeja ADMIN
**P1.** ADMIN podrá listar/filtrar comprobantes pendientes y consultar detalle/archivo.

## FR-PROOF-004 — Aprobar
**P0.** ADMIN podrá aprobar; la operación generará exactamente una transacción confirmada y allocations.

## FR-PROOF-005 — Rechazar
**P0.** ADMIN podrá rechazar indicando motivo; no se generará transacción confirmada.

## FR-PROOF-006 — Idempotencia
**P0.** Reintentos/doble clic no podrán duplicar la transacción.

## FR-PROOF-007 — Notificación
**P1.** GRADUATE podrá consultar/recibir feedback del resultado de revisión.

---

# 13. Cartera, vencimientos y penalización

## FR-LATE-001 — Vencido
**P0.** Calcular atraso según vencimiento + gracia.

## FR-LATE-002 — Configuración tardía
**P0.** ADMIN podrá configurar fecha de liquidación, días de gracia tardía e importe de penalización.

## FR-LATE-003 — Aplicar penalización
**P0.** Al cumplirse la condición, generar un cargo/obligación independiente una sola vez.

## FR-LATE-004 — Mostrar impacto
**P1.** Reflejar penalización en saldo, expediente y reportes.

## FR-LATE-005 — Cancelación automática opcional
**P1.** Cuando esté habilitada y se cumpla su condición, cancelar membresía de forma idempotente, auditable y sin borrado.

---

# 14. Política de cancelación

## FR-CANPOL-001 — Crear política
**P0.** ADMIN podrá crear una política por evento en estado editable.

## FR-CANPOL-002 — Rangos dinámicos
**P0.** ADMIN podrá agregar, editar, ordenar y eliminar rangos antes de publicación usando `days_before_min`, `days_before_max` y `penalty_percent`.

## FR-CANPOL-003 — Validación
**P0.** No permitir porcentajes fuera de 0..100, traslapes, huecos ni cobertura incompleta.

## FR-CANPOL-004 — Publicar
**P0.** Una política válida podrá publicarse y quedará inmutable.

## FR-CANPOL-005 — Nueva versión
**P0.** Editar una política publicada creará una nueva versión sin alterar contratos anteriores.

## FR-CANPOL-006 — Consultar historial
**P1.** ADMIN podrá consultar versiones publicadas/archivadas.

---

# 15. Cancelación de graduado

## FR-CAN-001 — Cotización
**P0.** Antes de cancelar manualmente, calcular una cotización con días previos, política/version/rango, total contratado, pagado, porcentaje, penalización, retenido, reembolso estimado y saldo adicional cuando exista.

## FR-CAN-002 — Confirmación ADMIN
**P0.** Requerir motivo y confirmación administrativa.

## FR-CAN-003 — Bloqueo
**P0.** La membresía cancelada no podrá realizar operaciones ordinarias.

## FR-CAN-004 — Liberación
**P0.** Liberar asignaciones operativas activas preservando historia.

## FR-CAN-005 — Reembolso separado
**P0.** La cancelación no generará por sí sola un refund confirmado.

## FR-CAN-006 — Historia
**P0.** Conservar contrato, pagos, documentos, cotización y auditoría.

---

# 16. Reembolsos

## FR-REF-001 — Crear solicitud/registro
**P1.** ADMIN podrá registrar/iniciar reembolso relacionado con transacciones previas.

## FR-REF-002 — Estados
**P1.** Soportar `REQUESTED`, `PENDING`, `CONFIRMED`, `FAILED`, `CANCELLED`.

## FR-REF-003 — Límite
**P0.** Impedir reembolsar más del monto reembolsable.

## FR-REF-004 — Manual/electrónico
**P1.** Diferenciar devolución manual de refund por proveedor.

## FR-REF-005 — Auditoría
**P0.** Conservar motivo, actor, referencia y evidencia cuando aplique.

---

# 17. Termo

## FR-TH-001 — Estado y elegibilidad
**P1.** Mostrar `LOCKED/AVAILABLE/REQUESTED/IN_PRODUCTION/DELIVERED` y avance financiero.

## FR-TH-002 — Solicitud
**P1.** GRADUATE podrá solicitar cuando esté `AVAILABLE`.

## FR-TH-003 — Personalización
**P1.** Capturar solo campos habilitados por evento.

## FR-TH-004 — Producción
**P1.** ADMIN marcará `IN_PRODUCTION`, bloqueando edición del graduado.

## FR-TH-005 — Entrega
**P1.** ADMIN marcará `DELIVERED`.

## FR-TH-006 — Termo adicional
**P2.** Soportar compra de termo adicional como producto/line item cuando se habilite.

## FR-TH-007 — Evidencia/firma de entrega
**P2.** Permitir registro de conformidad de entrega según configuración.

---

# 18. Notificaciones

## FR-NOT-001 — In-app
**P1.** GRADUATE podrá consultar notificaciones propias.

## FR-NOT-002 — Email
**P1.** Soportar correo para avisos configurados.

## FR-NOT-003 — Vencimientos
**P1.** Soportar recordatorio previo y posterior.

## FR-NOT-004 — Pagos/comprobantes
**P1.** Generar feedback por pago confirmado y submission aprobado/rechazado.

## FR-NOT-005 — Termo
**P2.** Notificar disponibilidad/cambio relevante.

---

# 19. Reportes y cortes

## FR-REP-001 — Reporte financiero
**P1.** Contratado, cobrado, pendiente, vencido, penalizaciones, reembolsos y movimientos.

## FR-REP-002 — Cartera
**P1.** Por graduado: folio, saldo, próximo vencimiento, atraso y estado.

## FR-REP-003 — Pagos
**P1.** Fecha, graduado, concepto, importe, método, referencia, estado y actor validador cuando aplique.

## FR-REP-004 — Comprobantes
**P1.** Pendientes/aprobados/rechazados.

## FR-REP-005 — Mesas
**P1.** Capacidad, ocupación, disponibilidad y personas asignadas.

## FR-REP-006 — Platillos
**P1.** Totales, pendientes y detalle.

## FR-REP-007 — Termos
**P1.** Estado, personalización y entrega.

## FR-REP-008 — Corte diario
**P1.** Generar vista de movimientos/cobranza por día.

## FR-REP-009 — Semanal/mensual
**P1.** Agrupar y filtrar por periodo, evento/escuela y método.

## FR-REP-010 — Exportaciones
**P1.** Exportar XLSX/CSV y PDF resumen donde corresponda.

---

# 20. Notas internas y auditoría

## FR-NOTE-001 — Crear nota
**P1.** ADMIN podrá registrar notas internas vinculadas a evento/membresía.

## FR-NOTE-002 — Privacidad
**P0.** GRADUATE no podrá leer notas internas.

## FR-AUD-001 — AuditLog
**P0.** Registrar acciones críticas definidas por reglas de negocio.

## FR-AUD-002 — Inmutabilidad
**P0.** No existirán operaciones normales de update/delete de auditoría.

## FR-AUD-003 — Consulta
**P1.** ADMIN podrá filtrar historial por evento, entidad, actor, acción y fecha.

---

# 21. Requisitos no funcionales vinculantes

Los requisitos técnicos medibles de seguridad, concurrencia, almacenamiento, idempotencia, rendimiento, observabilidad, backups y retención se definen en `NON_FUNCTIONAL_REQUIREMENTS.md` y forman parte del criterio de aceptación de todos los FR P0/P1 relacionados.

---

# 22. Invariantes de aceptación global

Toda implementación deberá demostrar:

```text
confirmed_places <= event.capacity
assigned_members_per_table <= table.capacity
active_group_members <= active_places
published contract/policy versions are immutable
approved PaymentSubmission creates at most one PaymentTransaction
confirmed financial history is append-only
late penalties are idempotent
refunds never exceed refundable amount
GRADUATE cannot access another membership's private resources
```
