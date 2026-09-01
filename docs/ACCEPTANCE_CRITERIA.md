# Plataforma GR — Criterios de Aceptación

**Documento:** `ACCEPTANCE_CRITERIA.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.2  
**Estado:** Baseline QA / Definition of Done  
**Fecha:** 31 de agosto de 2026

---

# 1. Regla de aceptación

Una funcionalidad no se considera terminada solo porque compile. Debe cumplir flujo feliz, negativos, autorización, concurrencia, auditoría, contratos API, requisitos visuales y NFR P0 aplicables.

Formato conceptual:

```text
GIVEN contexto
WHEN acción
THEN resultado
```

Prioridades: `P0` bloquea release; `P1` obligatorio MVP; `P2` posterior al núcleo.

---

# 2. Auth y ownership

## AC-AUTH-001 — Login roles
**P0.** GIVEN cuentas ADMIN y GRADUATE activas WHEN usan credenciales válidas THEN cada una obtiene su rol correcto y no permisos del otro.

## AC-AUTH-002 — Role escalation
**P0.** GIVEN GRADUATE WHEN envía `role=ADMIN` THEN permisos no cambian.

## AC-AUTH-003 — Registro contextual
**P0.** GIVEN acceso válido a Evento A WHEN manipula body con Evento B THEN solo puede crearse membresía autorizada para A.

## AC-AUTH-004 — Multi-evento
**P1.** GIVEN una cuenta con dos membresías WHEN consulta sus eventos THEN ve ambas y sus datos permanecen aislados.

## AC-AUTH-005 — IDOR membership
**P0.** GIVEN Graduate A WHEN intenta leer recursos de B mediante UUID conocido THEN recibe 403/404 seguro sin datos de B.

## AC-AUTH-006 — Cuenta disabled
**P0.** GIVEN cuenta `DISABLED` WHEN autentica THEN es rechazada.

## AC-AUTH-007 — Password reset
**P0.** GIVEN token válido WHEN se usa una vez THEN cambia contraseña y no puede reutilizarse; expirado produce error seguro.

---

# 3. Eventos

## AC-EVT-001 — Crear
**P0.** GIVEN ADMIN WHEN crea evento válido THEN queda `DRAFT`.

## AC-EVT-002 — GRADUATE no crea
**P0.** GIVEN GRADUATE WHEN llama endpoint admin de evento THEN 403.

## AC-EVT-003 — Open
**P1.** GIVEN evento DRAFT válido WHEN ADMIN abre THEN `OPEN` y auditoría.

## AC-EVT-004 — Close/reopen
**P1.** GIVEN OPEN WHEN cierra THEN GRADUATE no muta; WHEN reabre THEN vuelve a operar según reglas y ambas transiciones se auditan.

## AC-EVT-005 — Finalize
**P1.** GIVEN evento concluido WHEN finaliza THEN queda lectura histórica y correcciones financieras controladas siguen posibles.

## AC-EVT-006 — Cancel event
**P1.** GIVEN evento activo WHEN ADMIN cancela sin motivo THEN rechazo; con motivo THEN `CANCELLED` sin borrar historia.

---

# 4. Contrato

## AC-CON-001 — Folio único
**P0.** GIVEN dos contratos WHEN se crean THEN no comparten folio.

## AC-CON-002 — Contenido
**P0.** GIVEN contrato pendiente WHEN GRADUATE lo consulta THEN ve evento, productos, total, términos y versión de cancelación aplicable.

## AC-CON-003 — Aceptación
**P0.** GIVEN contrato pendiente WHEN GRADUATE confirma THEN se registra timestamp servidor, cuenta, versión/snapshot y estado ACCEPTED.

## AC-CON-004 — Idempotencia
**P0.** GIVEN contrato ya aceptado WHEN se repite misma solicitud/idempotency key THEN no se genera segunda aceptación lógica.

## AC-CON-005 — Versión cambió antes de aceptar
**P0.** GIVEN UI cargó versión A WHEN backend ya requiere B antes de confirmación THEN rechazo `CONTRACT_VERSION_CHANGED` y no acepta A silenciosamente.

## AC-CON-006 — Política posterior no retroactiva
**P0.** GIVEN contrato aceptado con Policy v1 WHEN ADMIN publica v2 THEN el contrato conserva v1.

## AC-CON-007 — Snapshot inmutable
**P0.** GIVEN contrato aceptado WHEN defaults de evento cambian THEN hash/snapshot contractual permanece sin modificación.

---

# 5. Productos, lugares e integrantes

## AC-PLC-001 — Integrantes <= lugares
**P0.** GIVEN 5 lugares y 5 integrantes activos WHEN intenta agregar sexto sin comprar lugar THEN rechazo.

## AC-PLC-002 — Tipos configurables
**P1.** GIVEN evento con Adulto/Niño/Sin cena configurados WHEN se consultan productos THEN devuelve nombres/precios del evento y no valores globales hardcodeados.

## AC-PLC-003 — Sin capacidad
**P0.** GIVEN evento lleno WHEN intenta confirmar nuevo lugar THEN `EVENT_CAPACITY_EXCEEDED`.

## AC-PLC-004 — Concurrencia capacidad
**P0.** GIVEN 1 lugar restante WHEN dos altas concurrentes intentan confirmarlo THEN solo una persiste y capacidad nunca se excede.

## AC-PLC-005 — Deadline
**P0.** GIVEN deadline vencido WHEN GRADUATE agrega producto THEN rechazo.

## AC-PLC-006 — Quote de compra
**P1.** GIVEN producto adicional WHEN solicita quote THEN backend devuelve nuevo total y catch-up calculado.

## AC-PLC-007 — Catch-up
**P0.** GIVEN nuevo total 13,500, progreso requerido 50% y pagado elegible 6,000 WHEN calcula THEN required=6,750 y catch-up=750.

## AC-PLC-008 — Quote stale
**P0.** GIVEN quote de producto WHEN capacidad/precio/estado relevante cambia antes de confirmar THEN se rechaza y recalcula.

## AC-PLC-009 — Reducción GRADUATE
**P0.** GIVEN GRADUATE WHEN intenta reducir lugares directamente THEN no se confirma.

## AC-PLC-010 — Reducción congelada
**P0.** GIVEN plan frozen WHEN ADMIN reduce THEN pagos históricos no cambian y el impacto usa movimientos explícitos.

---

# 6. Mesas

## AC-SEAT-001 — Formas
**P1.** ADMIN crea `SQUARE` y `ROUND`; forma fuera del baseline es rechazada.

## AC-SEAT-002 — Fondo independiente
**P1.** GIVEN mesas existentes WHEN cambia/elimina fondo THEN mesas y assignments permanecen.

## AC-SEAT-003 — Persona a mesa
**P0.** GIVEN un grupo de 4 WHEN asigna dos a Mesa A y dos a Mesa B THEN las cuatro personas conservan su mesa individual.

## AC-SEAT-004 — Una persona, una mesa
**P0.** GIVEN persona asignada a A WHEN se reasigna a B THEN queda una sola asignación activa.

## AC-SEAT-005 — Sin seat
**P0.** Contratos/API/schema no requieren `seat_id`, `chair_id` o `seat_number`.

## AC-SEAT-006 — Elegibilidad financiera
**P0.** GIVEN condición financiera no cumplida WHEN GRADUATE intenta asignar THEN `SEATING_NOT_FINANCIALLY_ELIGIBLE`.

## AC-SEAT-007 — Privacy
**P0.** GIVEN Graduate A WHEN consulta mapa THEN no recibe nombres/PII de B.

## AC-SEAT-008 — Member ownership
**P0.** GIVEN A WHEN envía `group_member_id` de B THEN rechazo.

## AC-SEAT-009 — Deadline
**P0.** GIVEN deadline vencido WHEN GRADUATE cambia mesa THEN rechazo; ADMIN con motivo puede override.

## AC-SEAT-010 — Concurrencia
**P0.** GIVEN 1 asiento de capacidad lógica disponible WHEN dos personas confirman simultáneamente THEN solo una persiste.

## AC-SEAT-011 — Mesa bloqueada
**P0.** GIVEN `BLOCKED` WHEN nueva asignación ordinaria THEN rechazo sin borrar assignments existentes.

## AC-SEAT-012 — Reducir capacidad
**P0.** GIVEN capacidad 10 ocupación 8 WHEN ADMIN intenta capacidad 6 THEN `TABLE_CAPACITY_BELOW_OCCUPANCY`.

## AC-SEAT-013 — Eliminar ocupada
**P0.** GIVEN assignments activos WHEN elimina THEN `TABLE_HAS_ASSIGNMENTS`.

## AC-SEAT-014 — Cancelación libera
**P0.** GIVEN membresía con personas asignadas WHEN se cancela THEN ocupación activa se libera y auditoría conserva historia.

---

# 7. Platillos

## AC-MEAL-001 — Por persona
**P1.** Cada integrante activo puede tener selección independiente.

## AC-MEAL-002 — Mismo evento
**P0.** MealOption de otro evento no puede asignarse manipulando ID.

## AC-MEAL-003 — Deadline
**P0.** GRADUATE después del deadline solo consulta.

## AC-MEAL-004 — Override ADMIN
**P1.** ADMIN después del deadline debe indicar motivo y genera auditoría.

## AC-MEAL-005 — Opción usada
**P0.** Una opción con selecciones activas no se hard-delete.

---

# 8. Plan financiero

## AC-FIN-001 — Parcialidades distintas
**P0.** GIVEN calendario con importes diferentes WHEN crea plan THEN cada installment conserva su monto/fecha.

## AC-FIN-002 — Alta tardía
**P0.** GIVEN alta después de vencimientos WHEN genera plan THEN fechas históricas no se desplazan.

## AC-FIN-003 — Freeze
**P0.** GIVEN primer pago confirmado/aplicado WHEN termina THEN `is_frozen=true`; editar defaults no modifica obligaciones existentes.

## AC-FIN-004 — Pago adelantado
**P1.** GIVEN futuras obligaciones WHEN paga suficiente THEN allocations pueden cubrirlas según prioridad.

## AC-FIN-005 — Excedente
**P0.** GIVEN pago mayor a obligación WHEN aplica THEN remanente no desaparece.

## AC-FIN-006 — Inmutabilidad
**P0.** GIVEN transaction CONFIRMED WHEN ADMIN intenta editar monto THEN operación no existe/es rechazada.

## AC-FIN-007 — Totales derivados
**P0.** Totales reportados coinciden con obligaciones/movimientos/allocations/refunds válidos.

---

# 9. Pagos electrónicos

## AC-PAY-001 — Amount backend
**P0.** GIVEN obligación 2,500 WHEN frontend envía amount 1 THEN backend ignora/rechaza valor no autorizado y no cobra 1 como obligación válida.

## AC-PAY-002 — Return URL
**P0.** GIVEN usuario regresa con parámetros `success` WHEN no existe confirmación server-to-server THEN UI/backend no marcan pagado.

## AC-PAY-003 — Webhook confirmado
**P0.** GIVEN proveedor verifica pago WHEN procesa THEN crea transaction + allocations una vez.

## AC-PAY-004 — Webhook duplicado
**P0.** GIVEN mismo evento recibido N veces THEN una sola transaction/allocation lógica.

## AC-PAY-005 — Pago pendiente
**P1.** GIVEN proveedor no confirma definitivamente THEN estado visible es pendiente/confirmando, no pagado.

---

# 10. Pagos manuales y submissions

## AC-MAN-001 — Métodos
**P1.** ADMIN puede registrar CASH, TRANSFER y DEPOSIT.

## AC-MAN-002 — Idempotencia
**P0.** Doble clic con misma key no crea dos pagos manuales.

## AC-PROOF-001 — Upload propio
**P0.** GRADUATE puede adjuntar archivo permitido a su submission; no puede reutilizar file_id ajeno.

## AC-PROOF-002 — Pending no paga
**P0.** GIVEN submission creado WHEN `PENDING_REVIEW` THEN paid_total, installments, mesa y termo no cambian.

## AC-PROOF-003 — Bandeja ADMIN
**P1.** ADMIN puede listar pendientes con filtros y abrir evidencia autorizada.

## AC-PROOF-004 — Approve
**P0.** GIVEN submission pendiente válido WHEN ADMIN aprueba THEN status APPROVED + exactamente una PaymentTransaction + allocations.

## AC-PROOF-005 — Double approve
**P0.** GIVEN submission APPROVED WHEN se repite approve concurrente/retry THEN no se crea otra transaction.

## AC-PROOF-006 — Reject
**P0.** GIVEN pendiente WHEN ADMIN rechaza sin motivo THEN rechazo del request; con motivo THEN REJECTED y saldo intacto.

## AC-PROOF-007 — GRADUATE approve
**P0.** GRADUATE intentando endpoint approve/reject recibe 403.

## AC-PROOF-008 — Notificación
**P1.** Resultado de revisión es consultable/visible al propietario.

---

# 11. Archivos

## AC-FILE-001 — MIME falso
**P0.** Archivo ejecutable renombrado `.pdf` es rechazado por validación real.

## AC-FILE-002 — Tamaño
**P0.** Archivo sobre máximo configurado es rechazado sin persistencia operativa.

## AC-FILE-003 — Storage key
**P0.** Cliente no puede elegir path/storage key arbitrario.

## AC-FILE-004 — Acceso privado
**P0.** Graduate A no puede descargar evidencia de B con URL/ID conocido.

## AC-FILE-005 — URL expirada
**P0.** URL firmada expirada deja de permitir acceso.

---

# 12. Penalización tardía

## AC-LATE-001 — Configurable
**P0.** ADMIN puede guardar días/monto válidos por evento; modificar un evento no altera otro.

## AC-LATE-002 — Aplicación
**P0.** GIVEN condición de late fee cumplida WHEN job corre THEN se genera cargo independiente y saldo se actualiza.

## AC-LATE-003 — No retro-edit
**P0.** Aplicar late fee no modifica amount de installment histórico.

## AC-LATE-004 — Job duplicado
**P0.** GIVEN fee ya aplicado WHEN job reejecuta THEN no crea segundo fee.

## AC-LATE-005 — Condición no cumplida
**P0.** GIVEN dentro de grace o deuda liquidada WHEN job corre THEN no genera fee.

---

# 13. Política de cancelación dinámica

## AC-CANPOL-001 — Draft
**P1.** ADMIN crea draft de política para evento con versión siguiente.

## AC-CANPOL-002 — Rango válido
**P0.** GIVEN rangos continuos sin traslape y porcentajes 0..100 WHEN valida THEN policy es publicable.

## AC-CANPOL-003 — Porcentaje inválido
**P0.** `-1` o `101` se rechaza.

## AC-CANPOL-004 — Traslape
**P0.** GIVEN 0–30 y 20–60 WHEN publica THEN `CANCELLATION_POLICY_OVERLAPPING_RANGES`.

## AC-CANPOL-005 — Hueco
**P0.** GIVEN 0–29 y 31+ WHEN publica THEN `CANCELLATION_POLICY_GAP`.

## AC-CANPOL-006 — Sin día 0
**P0.** Policy que comienza en día 1 no se publica.

## AC-CANPOL-007 — Sin cobertura final
**P0.** Policy con último rango cerrado y sin cobertura restante no se publica salvo máximo contractual explícito documentado.

## AC-CANPOL-008 — Publish immutability
**P0.** GIVEN ACTIVE WHEN intenta editar rangos THEN `CANCELLATION_POLICY_VERSION_IMMUTABLE`.

## AC-CANPOL-009 — Nueva versión
**P0.** GIVEN v1 ACTIVE WHEN ADMIN quiere cambios THEN crea v2 DRAFT; v1 permanece intacta.

## AC-CANPOL-010 — Contrato conserva versión
**P0.** Contrato aceptado bajo v1 sigue calculando con v1 después de publicar v2.

---

# 14. Cancelación de membresía

## AC-CAN-001 — Quote servidor
**P0.** Frontend no puede imponer `penalty_percent`; backend obtiene policy version/rango.

## AC-CAN-002 — Days before event
**P0.** Cálculo usa timezone/fecha servidor aplicable y no valor enviado por cliente.

## AC-CAN-003 — Fórmula
**P0.** GIVEN contracted=20,000, paid=10,000, penalty=30%, non_refundable=0 WHEN quote THEN penalty=6,000, retained=6,000, refund_due=4,000, remaining_due=0.

## AC-CAN-004 — Mínimo no reembolsable
**P0.** GIVEN penalty=2,000 y non_refundable_minimum=3,000 THEN retained=3,000, no 5,000 salvo regla contractual explícita.

## AC-CAN-005 — Quote stale
**P0.** GIVEN quote emitido WHEN cambia pago/saldo relevante antes de confirmar THEN `CANCELLATION_QUOTE_STALE` y no cancela con cifras viejas.

## AC-CAN-006 — Motivo
**P0.** Cancelación manual sin motivo se rechaza.

## AC-CAN-007 — Preserva historia
**P0.** Tras cancelar permanecen contract, transactions, submissions, quote y audit.

## AC-CAN-008 — No refund automático
**P0.** GIVEN refund_due > 0 WHEN cancela THEN membresía queda cancelada pero no existe Refund CONFIRMED hasta flujo separado.

## AC-CAN-009 — Auto-cancel idempotente
**P0.** GIVEN auto-cancel habilitado y condición cumplida WHEN dos workers procesan THEN una sola transición/effect set.

## AC-CAN-010 — Auto-cancel no cumplido
**P0.** Si deuda fue cubierta antes de ejecutar job, no cancela.

---

# 15. Refunds

## AC-REF-001 — Historial
**P0.** Refund confirmado no elimina payment original.

## AC-REF-002 — Límite
**P0.** Intento de reembolsar por encima del disponible se rechaza.

## AC-REF-003 — Concurrencia
**P0.** Dos refunds concurrentes no pueden exceder disponible en conjunto.

## AC-REF-004 — Estados
**P1.** REQUESTED/PENDING no reducen como confirmado hasta que la regla financiera lo determine; CONFIRMED actualiza posición neta.

## AC-REF-005 — Manual/electrónico
**P1.** Historial distingue método/proveedor.

---

# 16. Termo

## AC-TH-001 — Locked
**P0.** Progreso bajo umbral no permite solicitud.

## AC-TH-002 — Available
**P1.** Al alcanzar umbral aplicable, estado/eligibilidad se actualiza sin confiar en frontend.

## AC-TH-003 — Request
**P1.** AVAILABLE permite solicitud con personalización válida.

## AC-TH-004 — Invalid personalization
**P0.** Campo no habilitado es rechazado.

## AC-TH-005 — Production lock
**P0.** IN_PRODUCTION bloquea edición GRADUATE.

## AC-TH-006 — Delivery
**P1.** Solo ADMIN marca DELIVERED y auditoría conserva actor/fecha.

## AC-TH-007 — Extra thermo
**P2.** Cuando producto está habilitado, su compra aparece como line item y afecta finanzas conforme al motor general.

## AC-TH-008 — Evidencia entrega
**P2.** Si evento exige firma/evidencia, no completar flujo sin campos requeridos.

---

# 17. Notas internas

## AC-NOTE-001
**P1.** ADMIN crea nota con autor/fecha/contexto.

## AC-NOTE-002
**P0.** GRADUATE no puede listar/leer notas incluso con ID conocido.

## AC-NOTE-003
**P0.** Texto se trata como dato y no ejecuta XSS.

---

# 18. Reportes y cortes

## AC-REP-001 — Financiero
**P1.** Totales coinciden con ledger para conjunto de prueba conocido.

## AC-REP-002 — Filtros
**P1.** Filtros por evento/escuela/fecha/método producen subconjunto correcto.

## AC-REP-003 — Corte diario
**P1.** GIVEN movimientos del día WHEN genera corte THEN incluye solo rango civil correcto del timezone del evento y totales por método.

## AC-REP-004 — Semanal/mensual
**P1.** Agregaciones coinciden con suma del detalle.

## AC-REP-005 — Comprobantes
**P1.** Reporte distingue PENDING/APPROVED/REJECTED y reviewer/date cuando aplica.

## AC-REP-006 — Mesas
**P1.** Ocupación reportada coincide con count de assignments activos.

## AC-REP-007 — Export filtros
**P1.** XLSX/CSV respeta mismos filtros de la vista.

## AC-REP-008 — Formula injection
**P0.** GIVEN nombre/referencia comienza `=HYPERLINK(...)` WHEN exporta THEN archivo no lo ejecuta como fórmula maliciosa.

## AC-REP-009 — Export privado
**P0.** URL de export requiere autorización/expira según NFR.

---

# 19. Auditoría

## AC-AUD-001
**P0.** Operaciones críticas generan actor/origen, acción, entidad, timestamp y request_id.

## AC-AUD-002
**P0.** Procesos automáticos aparecen como SYSTEM/origen equivalente, no como ADMIN humano.

## AC-AUD-003
**P0.** No existe endpoint normal de update/delete de AuditLog.

## AC-AUD-004
**P0.** Audit no contiene password, token plano o secretos.

---

# 20. Jobs/operación

## AC-JOB-001 — Restart safe
**P0.** Reiniciar proceso durante ventana de late-fee no pierde permanentemente el trabajo ni duplica efectos.

## AC-JOB-002 — Multi-instance
**P0.** Dos instancias ejecutando scheduler no duplican late fee/auto-cancel.

## AC-JOB-003 — Error aislado
**P0.** Error procesando membresía A no revierte/corrompe una membresía B procesada en transacción separada.

---

# 21. Aceptación visual y UX

## AC-UI-001 — Paleta oficial
**P1.** GIVEN una pantalla oficial WHEN se renderiza THEN usa negro/obsidiana como base, plateado como estructura y dorado solo como acento; no existe una segunda paleta global no documentada.

## AC-UI-002 — Tipografía
**P1.** GIVEN UI administrativa o datos financieros WHEN se renderizan THEN usan Inter o fallback equivalente; Cormorant Garamond se reserva para display/títulos y no reduce legibilidad de tablas/formularios.

## AC-UI-003 — ADMIN shell
**P1.** GIVEN viewport desktop >=1280 WHEN ADMIN navega THEN existe shell consistente con navegación global, contexto y área operativa; rutas del evento no pierden contexto.

## AC-UI-004 — GRADUATE shell
**P1.** GIVEN viewport móvil 320–430 WHEN GRADUATE navega THEN controles primarios, contenido y navegación permanecen utilizables sin overflow horizontal de la página.

## AC-UI-005 — Responsive crítico
**P0.** GIVEN cualquier breakpoint soportado WHEN pantalla contiene monto, fecha, estado o CTA crítico THEN ninguno desaparece sin alternativa accesible equivalente.

## AC-UI-006 — Contraste
**P0.** Texto funcional, botones, inputs, estados y focus cumplen contraste AA o equivalente verificable; el dorado decorativo no se usa como texto de bajo contraste sobre fondos claros/medios.

## AC-UI-007 — Focus y teclado
**P0.** GIVEN navegación por teclado WHEN usuario recorre formulario/modal/drawer/acciones críticas THEN focus es visible, orden lógico y no queda atrapado incorrectamente.

## AC-UI-008 — Modal/drawer
**P0.** GIVEN modal/drawer abierto WHEN se usa teclado THEN mantiene focus trap, Escape cuando la acción es cancelable y devuelve foco al disparador al cerrar.

## AC-UI-009 — Estado no solo por color
**P0.** GIVEN estados como vencido, aprobado, rechazado, bloqueado o disponible WHEN se muestran THEN incluyen label/texto/icono además de color.

## AC-UI-010 — Reduced motion
**P1.** GIVEN `prefers-reduced-motion: reduce` WHEN se ejecutan transiciones/celebraciones THEN motion decorativo se reduce/elimina sin perder feedback funcional.

## AC-UI-011 — Loading
**P1.** GIVEN dashboard/pantalla principal cargando WHEN todavía no hay datos THEN skeleton/reserva de espacio evita cambio drástico de layout y no muestra cifras falsas.

## AC-UI-012 — Empty state
**P1.** GIVEN colección vacía WHEN se muestra THEN explica contexto y acción siguiente cuando exista; no se limita a “No data”.

## AC-UI-013 — Error recoverable
**P1.** GIVEN fallo recuperable WHEN UI lo presenta THEN mensaje es natural y ofrece retry/acción relevante sin exponer stack/error técnico.

## AC-UI-014 — CTA dominante
**P1.** GIVEN pantalla con siguiente acción natural WHEN se renderiza THEN existe máximo una CTA primaria dominante en el contexto principal.

## AC-UI-015 — Gold restraint
**P1.** GIVEN pantalla administrativa densa WHEN se revisa visualmente THEN dorado no domina tablas, iconos y bordes simultáneamente; permanece como acento.

## AC-UI-016 — Canvas alternativa
**P1.** GIVEN usuario no puede/elige no manipular canvas directamente WHEN gestiona mesa THEN dispone de listado/drawer/controles alternativos para localizar o seleccionar sin depender solo de precisión gráfica.

## AC-UI-017 — Performance assets
**P1.** GIVEN ruta operativa ADMIN WHEN carga THEN no incluye video de fondo/partículas continuas/assets celebratorios pesados no requeridos por la tarea.

## AC-UI-018 — Font loading
**P1.** GIVEN fuente display aún no cargada WHEN first paint ocurre THEN contenido funcional sigue visible con fallback; la carga de Cormorant no bloquea interacción esencial.

## AC-UI-019 — Component reuse
**P1.** GIVEN nuevo Button/Input/Card/Table equivalente WHEN se implementa THEN se reutiliza/expande primitive existente o se documenta por qué no es viable; no se crean sistemas visuales paralelos.

## AC-UI-020 — Visual regression review
**P1.** Toda pantalla intervenida en track VIS debe contar con evidencia reproducible de estados principales y revisión contra su `VS-*` y `UI_DESIGN_SYSTEM.md` antes de DONE.

---

# 22. Definition of Done

Todo ticket debe tener:

```text
[ ] FR/BR/AC citados
[ ] VS-* / AC-UI-* citados cuando toca frontend visual
[ ] autorización backend
[ ] DTO/schema validation
[ ] migration cuando cambie datos
[ ] OpenAPI actualizado
[ ] lint
[ ] typecheck
[ ] unit tests
[ ] integration tests
[ ] E2E para flujo crítico
[ ] concurrencia/idempotencia cuando aplique
[ ] auditoría cuando aplique
[ ] responsive/accesibilidad cuando aplique
[ ] NFR P0 verdes
[ ] no regresiones P0
```
