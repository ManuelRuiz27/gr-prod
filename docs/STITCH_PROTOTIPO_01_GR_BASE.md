# Stitch — Prototipo 01: Plataforma GR completa, SIN Monkavia

**Estado:** especificación de maquetación UX/UI; NO autorización para alterar negocio, contratos, API o DB.  
**Objetivo:** **rehacer TODA la interfaz GR** —ADMIN y GRADUATE— manteniendo el producto aprobado por el CEO y mostrando la experiencia más simple posible.  
**Entrega solicitada a Stitch:** prototipo visual navegable completo, desktop/tablet/mobile, con estados y flujos interactivos. No construir backend ficticio ni afirmar que las APIs documentadas están implementadas.  
**Rama del brief:** `integration/monkavia-gr-access`. **NO publicar los rediseños en `main` ni cambiar `GroupMember`.**

## 0. Autoridad y lectura obligatoria

1. **Negocio:** [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md) → [BUSINESS_RULES.md](BUSINESS_RULES.md) → [SRS.md](SRS.md) → [ROLES_PERMISSIONS.md](ROLES_PERMISSIONS.md) → [FINANCIAL_DOMAIN.md](FINANCIAL_DOMAIN.md).
2. **UX vigente:** [GRADUATE_UX_SIMPLIFICATION_AUDIT.md](GRADUATE_UX_SIMPLIFICATION_AUDIT.md) y [ADMIN_UX_SIMPLIFICATION_AUDIT.md](ADMIN_UX_SIMPLIFICATION_AUDIT.md) prevalecen en composición/navegación → [UI_DESIGN_SYSTEM.md](UI_DESIGN_SYSTEM.md) → [SCREEN_VISUAL_SPECIFICATIONS.md](SCREEN_VISUAL_SPECIFICATIONS.md) → [UX_FLOWS.md](UX_FLOWS.md) histórico si no contradice lo anterior.
3. **Mesas vigentes:** [SEATING_QUANTITY_CONTRACT.md](SEATING_QUANTITY_CONTRACT.md) + [SEATING_CATALOG_CONTRACT.md](SEATING_CATALOG_CONTRACT.md) + [SEATING_QUANTITY.openapi.yaml](SEATING_QUANTITY.openapi.yaml); superseden las partes nominales/estructurales antiguas de PRODUCT_SCOPE, UX_FLOWS y API general.
4. **API:** [API_ENDPOINT_MATRIX.md](API_ENDPOINT_MATRIX.md) y [API_CONTRACT.openapi.yaml](API_CONTRACT.openapi.yaml); no tomar automáticamente como vigentes las operaciones de seating explícitamente retiradas. [FRONTEND_BACKEND_TRACEABILITY.md](FRONTEND_BACKEND_TRACEABILITY.md) identifica rutas de UI actuales, pero no autoriza implementar legados.
5. **Sin Monkavia en este prototipo:** NO mostrar QR, pases digitales, Staff, check-in, autorizaciones de accesos, impresión de entradas ni tab `Accesos`. Es el producto GR de origen.

### Invariantes que ninguna maqueta puede cambiar

- Solamente roles `ADMIN` y `GRADUATE` en GR, mismo nivel de permisos para cuentas ADMIN.
- Una cuenta GRADUATE puede estar en varios eventos; cada `GraduateMembership` mantiene su propio contrato/folio/plan/mesas.
- Un contrato individual por membresía, aceptado explícitamente y versionado; no alterar aceptación, folio ni términos por rediseño.
- `GroupMember.full_name` es **obligatorio**, tiene `is_primary`, no inventar miembros anónimos como registros `GroupMember` ni cambiar sus reglas.
- `GraduateMembership.active_places` y `ContractLineItem.quantity` representan capacidad/compra; personas nominales no pueden superar lugares vigentes. Un producto/lugar no es un `GroupMember`.
- El croquis comercial usa **plantillas precargadas** y `TableAllocation(membership,table,quantity)`. Se pueden ubicar cantidades primero y vincular `GroupMember` después; vincular nombres no duplica ocupación.
- **Nunca dibujar/elegir silla individual**. Una membresía puede distribuir cantidades en varias mesas por reglas GR, sin aprobación especial en este baseline; Q3 pendiente del CEO no se introduce.
- Los productos equivalentes `ADULT`, `CHILD`, `NO_DINNER` y sus precios son configurados por evento; NO_DINNER no obliga a ocupar mesa.
- Un comprobante `PENDING_REVIEW` no abona saldo. Solo `PaymentTransaction` confirmada y aplicada cuenta, por proveedor validado o ADMIN.
- El pago inicial puede habilitar mesas según configuración. El termo usa umbral configurable propio. No requerir 100% para estos pasos por el hecho de que el Prototipo 02 añade QR al liquidar.
- Los campos ejemplo de precio, plazo o avance son **datos de maqueta**, nunca defaults funcionales.

## 1. Dirección artística, experiencia y responsive

**Marca GR:** profesional, sobria y ceremonial. Base obsidian/negro, jerarquía plata, acento dorado restringido; Inter para UI/datos y Cormorant Garamond sólo donde contribuya a la identidad. No es un SaaS genérico ni un sistema ERP de tarjetas.

- Jerarquía: título claro → tarea → datos → CTA; usar espacios, tablas, separación tipográfica y drawers/bottom sheets. **No** mosaicos de tarjetas, barra de KPIs en todas las pantallas, iconos por decoración, gradientes gratuitos o varias CTA primarias simultáneas.
- ADMIN: **desktop-first** y alta densidad operativa, tablas con búsqueda; tablet adapta panel a drawer; móvil usa filas/resúmenes y bottom sheet, no solo tabla con scroll horizontal.
- GRADUATE: **mobile-first**, objetivos táctiles ≥44 px, bottom navigation, una acción visible, montos y deadlines comprensibles. Tablet/desktop amplían espacio sin duplicar menús o contexto.
- Estados obligatorios por pantalla: `loading`, `empty`, `ready`, `success`, `validation_error`, `not_eligible`, `concurrency_conflict`, `closed/deadline`, `offline/dependency_error`, `read_only` cuando apliquen.
- Validación visual WCAG AA, focus visible, labels persistentes, errores junto al campo y mensajes accionables; confirmación para acciones financieras/cancelaciones/irreversibles.
- **Sin demo chrome:** retirar `Showcase`, `DemoControls`, textos «modo mock», valores estáticos presentados como reales, perfiles inventados por sistema y pantallas de navegación duplicadas.
- Diseñar **2 shells compartidos** (ADMIN y GRADUATE) y componentes reutilizables: data table, search, status inline, amount input, evidence viewer, confirmation dialog, drawer, toast, selection, timeline, map canvas y bottom sheet.

## 2. Mapa de navegación completo

```text
PÚBLICO
├─ /access                      Código contextual de evento
├─ /register                    Alta graduado en ese evento
├─ /login                       Ingreso graduado
├─ /forgot-password             Recuperar contraseña
└─ /admin/login                 Ingreso ADMIN

GRADUATE (bottom-nav: Inicio | Mi grupo | Pagos | Más)
├─ /graduate/events             Selector SOLO si cuenta tiene varios eventos
├─ /graduate                    Inicio / siguiente paso
├─ /graduate/group              Mi grupo; personas nominales; agregar boleto
├─ /graduate/payments           Mis pagos; abonar; comprobantes
├─ /graduate/table              Croquis por cantidades (plantilla)
├─ /graduate/meals              Platillos por GroupMember
├─ /graduate/thermo             Termo / personalización
├─ /graduate/contract           Contrato y aceptación
└─ /graduate/more               Enlaces secundarios y salir

ADMIN (sidebar: Inicio | Eventos | Reportes)
├─ /admin                       Bandeja operativa + búsqueda global por folio
├─ /admin/events                Lista de eventos
├─ /admin/events/new            Wizard de creación (4 pasos UX)
├─ /admin/events/:eventId       Resumen del evento
├─ /admin/events/:eventId/graduates
│  └─ /:graduateId              Expediente en una sola página, no 9 tabs
├─ /admin/events/:eventId/payments
│  ├─ Cartera                    Subvista interna, no ruta obligatoria
│  ├─ Movimientos
│  └─ Comprobantes
├─ /admin/events/:eventId/tables
├─ /admin/events/:eventId/meals
├─ /admin/events/:eventId/thermos
├─ /admin/events/:eventId/reports
├─ /admin/events/:eventId/settings
│  └─ /cancellation-policy
└─ /admin/events/:eventId/audit   Histórico bajo «Más», NO tab primaria
```

**Contexto del evento ADMIN:** `Resumen | Graduados | Pagos | Mesas | Platillos | Termos | Más ▾`, donde Más = Reportes, Configuración, Historial. `/admin/reports` es vista global útil. Rutas globales legacy `/admin/graduates`, `/admin/payments`, `/admin/thermos`, `/admin/audit`, `/admin/more` no deben convertirse en pantallas duplicadas. El «Cobro rápido por folio» global es una **oportunidad UX**, no un requisito backend adicional. Notificaciones son feedback contextual y backend existente; centro/campana `DEFER UI`.

## 3. Journey maestro de negocio (GR puro)

```text
ADMIN configura graduación DRAFT
  → catálogo de lugares/precios + calendario de pagos + fechas límite
  → política cancelación, platillos y termo; elegir plantilla de croquis
  → abre evento OPEN
GRADUATE entra por código de evento → registro / login
  → membresía + contrato/folio → revisa y acepta
  → contrata lugares y registra integrantes (GroupMember nominales)
  → paga inicial/abonos (pasarela o comprobante sujeto a aprobación)
  → se confirma capacidad/eligibilidad → distribuye cantidades por mesas
  → vincula integrantes nominales dentro de distribución sin duplicar cupo
  → selecciona platillos por persona, mientras deadline vigente
  → alcanza umbral termo → solicita/personaliza
  → continúa pagos, consultas y posibles compras adicionales
ADMIN supervisa cartera, comprobantes, mesas, platillos, termos,
  → reportes/cortes, ajustes, cancelaciones y entregas
  → cierra/finaliza evento comercial según su máquina de estados.
```

**Nota de secuencia:** pagos, integrantes, mesas, platillos y termo no son un wizard irreversiblemente lineal: hay deadlines, bloqueos financieros, compra adicional, reintentos y cambios autorizados. La UI debe permitir volver a cada módulo desde Inicio/Más; el contrato aceptado se muestra sin forzar reaceptación.

## 3A. Guion de pantallas: qué ve y hace cada actor durante una graduación

**Instrucción principal a Stitch:** cada apartado es un **escenario de uso real con escenas visuales**, no un listado de módulos. Dibujar las pantallas descritas con contenido creíble, habilitar sus interacciones y mostrar cómo cambia la misma pantalla tras cada acción. No reducir todo a un dashboard ni a una única pantalla de seis botones. La **entrada, tarea y resultado** de cada escena son obligatorios.

### Etapa 1 — ADMIN prepara la graduación antes de invitar a nadie

**Actor:** ADMIN GR. **Pantallas de entrada:** Inicio (A01) → Eventos (A02) → Crear graduación (A03).

**A01 · Inicio administrativo.** Al iniciar sesión, la propietaria necesita encontrar un graduado o una graduación sin navegar un ERP. Mostrar encabezado compacto, búsqueda por nombre/folio y acciones prioritarias para registrar un abono y revisar comprobantes. Debajo, lista de eventos con fecha, escuela y alertas que requieren acción. Buscar un folio abre el expediente correcto (A08) dentro de su evento; seleccionar una graduación abre su resumen (A04). Sin eventos, pantalla vacía con acción «Crear graduación». **No** cuatro tarjetas de estadísticas como navegación.

**A02 · Lista de graduaciones.** Se muestra una tabla de nombre, institución/generación, fecha, estatus comercial y señales operativas. ADMIN filtra por evento y abre una fila. La acción «Nueva graduación» inicia el asistente. Un evento `DRAFT` puede ser editado pero no se presenta como abierto a graduados.

**A03 · Crear graduación, paso 1: Datos.** Formulario limpio con nombre de la graduación, escuela, carrera/generación cuando aplique, fecha, salón/sede, zona horaria y capacidad. Mostrar validación debajo de cada campo y navegación «Siguiente». No solicitar QR, personal Staff, pasarelas en modo técnico ni un plano para subir. Si hay datos incompletos, permanecer en el paso y señalar exactamente cuál.

**A03 · Paso 2: Boletos y precios.** Tabla editable de tipos de lugar (equivalentes a adulto, niño y sin cena), etiqueta comercial y precio por evento. Resumen discreto del aforo. La persona debe poder configurar importes reales sin que Stitch fije $X como requisito del producto. Regresar al paso anterior no pierde las capturas.

**A03 · Paso 3: Plan de pagos.** Configurar pago inicial, fechas de vencimiento e importes de cada parcialidad; éstas pueden ser distintas. Añadir/quitar renglones, configurar condiciones permitidas y revisar una vista previa de calendario. No exigir que cada futuro abono equivalga a una mensualidad exacta.

**A03 · Paso 4: Operación.** Configurar fechas límite de compra, mesas, platillos y liquidación; penalización/gracia cuando corresponda, catálogo de platillos, umbral/condiciones del termo y política de cancelación según flujo aprobado. Pantalla de revisión antes de «Guardar graduación». **Resultado:** el evento aparece como `DRAFT`, no se abre automáticamente.

**A05/A06 · Configurar y publicar condiciones.** En el detalle de la graduación, ADMIN revisa un formulario continuo con secciones de producto, dinero, plazos, termo y platillos. La política de cancelación se ve como tabla de rangos de días y porcentajes, con revisión de huecos/traslapes; publicar fija versión, sin reescribir contratos ya aceptados. Guardar cambios posteriores puede requerir mostrar advertencia de no retroactividad.

**A14 · Seleccionar croquis aprobado.** Antes de que los graduados asignen, ADMIN abre Mesas y elige una **plantilla precargada** del catálogo. Ver previsualización real del salón: distribución, mesas identificadas, cupos y estado de bloqueo. Confirmar asociación al evento. No proporcionar carga PNG/PDF, autodetección, dibujo libre de mesas o edición CAD; esos flujos quedaron retirados.

**A21/A04 · Abrir la graduación.** En el resumen de evento aparecen fecha/sede, cobros y asuntos pendientes en texto compacto. Desde menú de estado, ADMIN revisa una confirmación de `DRAFT → OPEN` cuando las condiciones estén completas. Después de confirmar, se habilita el acceso contextual de los graduados. Si la configuración está incompleta, mostrar motivo y enlazar al campo faltante. Las transiciones de cierre/finalización son operaciones posteriores, no un paso del wizard.

**Salida visual de la etapa:** evento abierto y configurado; el sistema puede admitir registros. **No existe todavía derecho de entrada física o QR.**

### Etapa 2 — El graduado entra, se identifica y acepta su contrato

**Actores:** GRADUATE; ADMIN solamente puede consultar luego su expediente. **Pantallas:** G00 → G01/G02 → G03 si aplica → G05 → G04.

**G00 · Acceso a graduación.** Pantalla pública enfocada en introducir/validar el código entregado para una graduación. Tras resolverlo, mostrar contexto mínimo verificado —nombre de evento, institución y fecha— y dos caminos: «Soy nuevo» e «Ingresar». Código vencido/revocado/incorrecto produce un estado seguro sin listar eventos ajenos. Este código es de **alta contextual**, no un QR de entrada física.

**G01 · Registro.** Formulario de identidad/cuenta del graduado vinculado al evento resuelto, sin permitirle elegir rol ni evento ajeno. Tras alta válida se crea su membresía/expediente según backend y se presenta el contrato individual con folio. Usuario existente no debe duplicar su cuenta; ofrecer inicio de sesión. Capacidad agotada/evento cerrado debe tener explicación propia.

**G02 · Ingreso y recuperación.** Pantalla de email/contraseña y flujo de contraseña olvidada, con mensajes seguros. Si la cuenta pertenece a varias graduaciones, ir a G03; si solo una, entrar en la membresía correspondiente.

**G03 · Seleccionar mi graduación.** Lista de eventos **propios** con institución, fecha y estatus. Elegir uno cambia el contexto de contrato, grupo, pagos y mesas, nunca mezcla datos de dos eventos. No convertir esta lista en un selector público de graduaciones.

**G05 · Contrato individual.** Presentar un documento legible a página completa: folio, nombre del titular, graduación, conceptos y cantidades contratadas, total, términos y política aplicable. Al final, checkbox «He leído y acepto» seguido de «Aceptar contrato». Sin checkbox, la acción permanece deshabilitada. Tras confirmar, mostrar «Contrato aceptado» con fecha y posibilidad de lectura/descarga permitida, no obligar a aceptar otra vez al regresar. Si la versión cambió antes de confirmar, cargar el texto nuevo y solicitar confirmación de esa versión.

**G04 · Inicio del graduado.** Un encabezado de su evento y una recomendación útil para su momento: «Aceptar contrato», «Completar mi grupo», «Abonar» o «Elegir mesa», según lo que de verdad falta. Mostrar próxima fecha/alerta financiera cuando corresponda. Un aviso de mora desplaza información secundaria. Desde aquí navegar al módulo correcto; no crear una pantalla con seis grandes tarjetas de acceso rápido.

### Etapa 3 — Contratar lugares, registrar personas y consultar el expediente

**Actores:** GRADUATE compra y administra sus integrantes; ADMIN supervisa y realiza reducciones autorizadas. **Pantallas:** G06/G07 ↔ A07/A08.

**G06 · Mi grupo.** Mostrar la persona principal primero y una lista simple de `GroupMember` existentes con **nombre obligatorio**, tipo/carácter de lugar cuando corresponda y controles permitidos de edición. Encabezado «X de N lugares registrados» basado en lugares vigentes, con renglones «Lugar disponible» para cantidades compradas todavía no vinculadas a un nombre; un renglón vacío **no es** un `GroupMember`. «Registrar persona» abre un formulario de nombre y datos permitidos; guardar añade persona si queda lugar y el backend acepta. Nunca crear un invitado anónimo en `GroupMember`.

**G07 · Agregar boleto/lugar.** Desde Mi grupo, un bottom sheet lista productos activos con precio del evento y cantidad. Elegir producto muestra un **resumen de cotización antes de confirmar**: lugares nuevos, total actualizado y pago/catch-up exigible hoy si aplica. Confirmar genera el cambio comercial autorizado; cupo agotado, deadline o cotización vencida lo bloquean sin modificar cantidades. No presentar «Eliminar boleto» como libre cancelación de saldo: la reducción está restringida a ADMIN.

**A07 · Lista de graduados.** ADMIN ve tabla orientada a atención: folio, nombre, número/tipos de lugares, total, abonado, saldo, mesa y alerta. Buscar por nombre/folio/teléfono y filtrar «Saldo vencido», «Comprobante por revisar», «Sin mesa». Abrir un renglón conduce al expediente. No mostrar una ficha/tarjeta por graduado.

**A08 · Expediente operativo del graduado.** Encabezado folio y contacto; debajo un resumen legible de saldo/último/próximo abono. Luego secciones en la misma página: lugares e integrantes (nombre/tipo), mesas, platillos especiales, termo, contrato aceptado y acciones ADMIN. Botón principal «Registrar abono» y menú contextual para cambios permitidos, cancelación, reducción y historial. Toda decisión financiera respeta ledger/contrato; no multiplicar el expediente en nueve pestañas.

**Salida visual:** los lugares comerciales y los `GroupMember` quedan diferenciados; ambos actores identifican quién pertenece a qué contrato sin alterar reglas.

### Etapa 4 — Pagar a plazos y validar comprobantes

**Actores:** GRADUATE inicia operaciones propias; ADMIN registra pagos manuales y valida evidencias; la pasarela confirma por servidor, no por botón del graduado. **Pantallas:** G08/G09/G10 ↔ A09/A10/A11/A12/A13.

**G08 · Mis pagos.** En primer plano: «Has abonado $X de $Y», «Restan $Z», próximo mínimo/fecha y CTA «Abonar». Debajo calendario con mensualidades, historial de movimientos confirmados y acceso a comprobantes. No sustituir información por gráficos de progreso repetitivos. Si hay saldo vencido, mostrar cargo/gracia/política efectivamente aplicable. Debe poder pagar importe superior al mínimo cuando backend lo permita.

**G09 · ¿Cuánto y cómo deseas abonar?** Primer estado: campo de importe, mínimo permitido, saldo y validación. Segundo estado: métodos disponibles (Mercado Pago Checkout Pro u OpenPay, según configuración) y confirmación de salida. Tercer estado: al volver del proveedor, mostrar **«Estamos confirmando tu pago»** mientras backend verifica; sólo después señalar cobro confirmado y actualizar saldo. Falla, pendiente y reintento son pantallas/estados distintos. No pedir tarjeta bancaria completa dentro de GR.

**G10 · Reportar transferencia/depósito.** Formulario con monto, fecha, referencia y archivo de comprobante; previsualización antes de enviar. Tras envío mostrar «En revisión» con folio y texto explícito «Este envío aún no se ha aplicado a tu saldo». Cuando ADMIN aprueba, aparece aprobado y saldo nuevo; cuando rechaza, razón e indicación de qué corregir. No equiparar subir evidencia con pagar.

**A09 · Cartera.** Tabla de graduados/folios con abonado, saldo, mínimo próximo, vencimiento y estado. Filtros por vencidos/pendientes; fila abre expediente. Resumen de cobros en una línea, no dashboard financiero paralelo.

**A10 · Registrar abono.** En drawer o pantalla enfocada: encabezado de contrato/folio, saldo y mínimo actual; **campo de monto libre**, método Efectivo/Transferencia/Depósito, fecha, «Recibido por» si efectivo y referencia/evidencia cuando aplique. Previsualizar impacto y confirmar. El motor contable aplica el importe a obligaciones; el operador no elige obligatoriamente una cuota exacta. Éxito muestra movimiento registrable e historial, fallo conserva borrador sin duplicar transacción.

**A12 · Validar comprobantes.** Bandeja por defecto «Pendientes» con nombre/folio/importe/fecha. Al seleccionar uno, PDF o imagen ocupa la región principal y junto a ella se ven datos reportados y botones «Aprobar» / «Rechazar». Aprobar requiere confirmación y genera **una sola** transacción; rechazar requiere motivo. Una segunda aprobación de misma evidencia no duplica abonos.

**A11/A13 · Movimientos, ajustes y reembolsos.** Pantalla de movimientos ordenados, fecha, método, referencia, actor y monto. Cualquier corrección se abre como movimiento compensatorio separado con motivo y límites; en un reembolso se ve estado de solicitud/proceso/confirmación/falla. No ofrecer «Editar pago confirmado» ni eliminar historial.

**Salida visual:** la cobranza y el saldo se actualizan únicamente con confirmaciones autorizadas; desbloqueos de otros módulos obedecen sus reglas propias.

### Etapa 5 — Elegir mesa y ubicar los lugares confirmados

**Actores:** GRADUATE distribuye cantidades de su membresía; ADMIN seleccionó antes la plantilla y puede atender cambios autorizados. **Pantallas:** G11/G12 ↔ A14.

**G11 · Mi mesa, estado bloqueado.** Si falta el pago exigido, hay fecha límite vencida o evento no operativo, mostrar encabezado «Mesa», motivo concreto y CTA «Ver mis pagos» cuando corresponda; el mapa puede verse en modo lectura si está permitido, pero no simular una asignación confirmada. **No** bloquear por exigir liquidación 100%: mesa tiene su propia elegibilidad comercial.

**G11 · Croquis interactivo.** Mostrar el plano precargado como elemento dominante. Cada mesa está identificada por etiqueta y **lugares libres**, sin nombres de familias ajenas. Una franja compacta indica «Tienes N lugares confirmados, X ubicados, Y por ubicar». El graduado selecciona cuántos lugares asignar, toca mesa y abre bottom sheet «Mesa 12 — quedan 4 espacios — quieres ubicar 3», confirma. El sistema guarda la distribución **completa por cantidades**; éxito actualiza el mapa y resumen. Puede distribuir entre varias mesas por la regla GR vigente. Si otro usuario ocupó lugares antes, mostrar «Cupo cambió; revisa la distribución» y refrescar sin perder silenciosamente la asignación anterior.

**G12 · Asociar personas a mesas (cuando hay nombres).** En la distribución ya confirmada, un detalle de mesa permite vincular un `GroupMember` existente a uno de los lugares de esa mesa. Elegir nombre desde lista de integrantes propios, nunca desde una lista global. La selección **no suma otro lugar** a la ocupación; cada `GroupMember` puede vincularse como máximo a una mesa activa. Pueden quedar cantidades asignadas sin nombre hasta completar registro; no cambiar `full_name` de integrantes ya creados. Si la reducción de cantidades chocaría con nombres vinculados, mostrar conflicto y pedir resolver esa distribución antes.

**A14 · Supervisión ADMIN del salón.** Misma plantilla del evento, canvas grande + inspector lateral. ADMIN busca mesa/contrato, observa ocupación derivada, puede consultar integrantes nominales propios de la operación y realizar cambios permitidos con motivo/auditoría. Mostrar «Destacar niños» cuando exista dato nominal. Mesa bloqueada no acepta incrementos; reducir capacidad bajo ocupación no es permitido. Sin herramientas de dibujo/importación de planos.

**Salida visual:** mesa asignada a las **cantidades contratadas**. La localización nominal es una segunda asociación; no se ha emitido entrada física alguna.

### Etapa 6 — Elegir platillos y preparar necesidades especiales

**Actores:** GRADUATE para su grupo; ADMIN define catálogo y atiende correcciones/producción. **Pantallas:** G13 ↔ A05/A15.

**G13 · Mis platillos.** Mostrar por nombre de integrante elegible, debajo las opciones del evento como radio/selector, agrupadas de manera compacta. Un ejemplo: «Andrea — Normal / Vegetariano / Vegano». CTA «Guardar cambios» para selección autorizada; mostrar deadline próximo. Si ya venció, la misma pantalla pasa a lectura sin permitir fingir cambios, con indicación de contacto administrativo. No mostrar un plato por QR o por mesa; asociar selección al integrante conforme reglas vigentes.

**A15 · Platillos de la graduación.** Lista compacta de personas/graduado/tipo/platillo/mesa, filtros «Especiales» y «Pendientes», totales por opción en una sola línea. ADMIN puede corregir platillo después de plazo con motivo. Los cambios alimentan reportes/producción. No esconder la lista operativa tras cards de estadísticas.

### Etapa 7 — Personalizar, producir y entregar termo

**Actores:** GRADUATE solicita y personaliza cuando es elegible; ADMIN opera producción/entrega. **Pantallas:** G14 ↔ A16.

**G14 · Mi termo bloqueado.** Mostrar «Podrás solicitarlo al alcanzar el avance configurado», progreso real y CTA «Ver pagos». Este umbral es **independiente** de la condición financiera de mesa o de la liquidación para QR del prototipo integrado.

**G14 · Disponible.** Mostrar campos de grabado/personalización autorizados, vista previa de texto y «Solicitar termo». Tras solicitar, mostrar nombre grabado, estado y cambios permitidos. En `IN_PRODUCTION` bloquear edición; en `DELIVERED` mostrar estado final sin formulario. Errores de personalización se comunican en campo.

**A16 · Producción y entrega.** Tabla «Folio | Graduado | Mesa | Grabado | Estado | Entrega» con búsqueda y filtros por pendiente/en producción/entregado. ADMIN abre fila, marca transición válida a producción, registra entrega y evidencia/firma cuando esa configuración aplica. Vista «Imprimir lista de entrega» organiza mesa, folio, nombre, personalización y espacio para firma. No inventar proceso de manufactura o inventario externo.

### Etapa 8 — Administrar incidencias, cancelar, reportar y cerrar

**Actores:** ADMIN dirige la operación; GRADUATE consulta su propio estado. **Pantallas:** A18/A17/A19/A20/A21 ↔ G04/G08/G16.

**A18 · Cancelar contrato de un graduado.** Desde expediente seleccionar «Cancelar» → pantalla de **cotización previa** con contrato, pagado, rango/porcentaje contractual vigente, retención, posible devolución y saldo adicional; pedir motivo. Confirmación separa «Cancelar membresía» de «Registrar/procesar reembolso». Al completar, mantener folio, movimientos e historial visibles. No devolver fondos de forma automática por confirmar cancelación. GRADUATE ve su membresía inactiva y no puede seguir comprando/asignando.

**A17 · Reportes y cortes.** Filtros de evento/escuela, periodo (diario, semanal, mensual o personalizado) y método; tabla de movimientos y total derivado. «Exportar Excel/CSV» y descarga PDF resumen cuando exista ese formato en el reporte. Vista de concentración por mesa/contrato/cena/abonos/saldos/platillos/termos. Si la exportación está preparando archivo, mostrar progreso/estado; nunca presentar un Excel ficticio como generado.

**A19 · Historial/auditoría.** Acceso secundario desde menú o expediente. Lista con quién hizo qué, cuándo y motivo, por ejemplo aprobación de comprobante, reasignación, cambio de platillo o cancelación. Solo ADMIN ve notas internas y datos sensibles autorizados. Historial no editable.

**A20 · Cuentas administrativas.** Vista secundaria de cuentas ADMIN existentes, estado y operaciones autorizadas de alta/deshabilitación. Dos cuentas ADMIN tienen los mismos permisos definidos; no inventar roles «superadmin», «operador de mesa» ni matriz configurable.

**A21 · Cierre/finalización comercial.** Desde resumen del evento, ADMIN puede cerrar operación ordinaria del graduado, reabrir dentro de reglas, finalizar o cancelar evento con confirmación. Mostrar estados antes/después, reglas y consecuencias; conservar datos históricos y correcciones financieras controladas. No crear un botón `Check-in` ni suponer que la fecha del evento ejecuta automáticamente `FINALIZED`.

**G15/G16 · Navegación secundaria y estados de cuenta.** En «Más», el graduado encuentra Mi contrato, Mesa, Platillos, Termo y contacto real disponible. Si evento está CLOSED, dejar consultar lo permitido y explicar bloqueo de nuevas acciones; si cuenta está suspendida o sesión vence, mostrar camino válido de recuperación. No permitir acceso a notas de ADMIN ni a la cartera de otro graduado.

### Etapa 9 — Qué ocurre cuando intervienen varios actores a la vez

**Escena A · Un graduado paga por transferencia, ADMIN no ha aprobado.** En G10 figura «En revisión» y saldo anterior; en A12 aparece la evidencia; ADMIN aprueba; el estado del graduado cambia a aprobado y se actualiza elegibilidad de mesa si corresponde. Mostrar ambas perspectivas de la **misma operación**.

**Escena B · Dos graduados intentan llenar la última mesa.** En G11 ambos ven cupo previo; uno confirma primero; el segundo recibe conflicto con cupo actualizado y debe elegir otra distribución. En A14 nunca aparece ocupación mayor a capacidad.

**Escena C · Un graduado compra dos lugares adicionales tarde.** En G07 se muestra costo nuevo y catch-up aplicable; si lo confirma, G06 enseña dos lugares aún sin personas nominales, G08 refleja nueva obligación, G11 permite distribuir solo cuando reglas lo autorizan. Ninguna escena crea personas ficticias.

**Escena D · Un graduado cancela.** En A18 se ve la cotización, en A11 el historial anterior intacto y en G04/G08 el estado de membresía/finanzas según autorizaciones. La cantidad de mesa/capacidad se libera o adapta mediante la operación GR, sin intervención Monkavia en este prototipo.

### Pantallas y estados que Stitch NO debe inventar

NO incluir: app para invitados sin cuenta, verificación de identidad de comensales, tarjetas «mesas de mis amigos», aprobación administrativa de distribución multimesa (Q3 pendiente CEO), facturación CFDI, RSVP, QR de acceso, scanner, Staff, chat, entregas WhatsApp automáticas, edición CAD del croquis, selección de silla, pantalla global de estadísticas por cada módulo, perfil de «organizador externo» o estados de pago controlados por el navegador.

---

## 4. Inventario de pantallas — GRADUATE

| ID | Pantalla/ruta real | Contenido y jerarquía | CTA, variaciones y salida |
|---|---|---|---|
| G00 | `/access` | Marca y contexto «Accede a tu graduación»; código contextual, no selector libre | Validar código → registro/login del evento; vencido/incorrecto sin revelar otros eventos |
| G01 | `/register` | Identidad y datos permitidos del graduado, evento resuelto | Registrar → membresía/contrato; error duplicado, capacidad y evento cerrado |
| G02 | `/login`, `/forgot-password` | Email/contraseña; recuperación con confirmación genérica | Login → un evento: Inicio; varios: Mis eventos; ADMIN no entra por este flujo |
| G03 | `/graduate/events` | Lista de membresías propias con nombre/fecha/estado, sin datos ajenos | Elegir evento → `/graduate`; ocultar selector si sólo uno |
| G04 | `/graduate` | Inicio orientado a «siguiente pendiente» y progreso pequeño: contrato, grupo, pago, mesa, platillos, termo | Una tarea primaria contextual; avisos de mora/deadline sustituyen CTA irrelevantes |
| G05 | `/graduate/contract` | Documento continuo: folio, identidad, lugares, importes, términos, versión aplicable | Aceptar explícitamente con checkbox; estado aceptado = solo lectura |
| G06 | `/graduate/group` | Personas registradas, titular primero, conteo «X de N lugares», pendientes de registro | Registrar persona (nombre obligatorio); actualizar; agregar boleto; sin cabecera KPI |
| G07 | `/graduate/group` → sheet Agregar boleto | Productos ADULT/CHILD/NO_DINNER, precios reales, nuevo total y catch-up calculado | Cotizar → confirmar adición; errores cupo, deadline, quote vencida o pago requerido; no reducir directamente |
| G08 | `/graduate/payments` | Abonado / falta / próximo mínimo, calendario, histórico y comprobantes | `Abonar` importe permitido; CTA contextual no mensualidad exacta forzosa |
| G09 | Pagos → abono electrónico | Monto, método Mercado Pago u OpenPay según evento, aviso salida proveedor | Intento → retorno «Confirmando pago» → éxito sólo tras confirmación servidor |
| G10 | Pagos → reportar transferencia/depósito | Monto/fecha/referencia/comprobante, previsualización evidencia | Enviar → `En revisión`; aprobación cambia saldo; rechazo muestra motivo |
| G11 | `/graduate/table` | Croquis plantilla, ocupación agregada, cantidades propias ubicadas y pendientes, menú/lista accesible | Si elegible: elegir cantidad y mesa, revisar cupo, confirmar; concurrency 409 reintentar sobre snapshot |
| G12 | `/graduate/table` → vincular nombres | Desde distribución confirmada, asociar `GroupMember` existente a cantidad de mesa | Una persona máximo una mesa vigente; vínculo no incrementa `occupied`; no inventar campos nuevos `GroupMember` |
| G13 | `/graduate/meals` | Lista de `GroupMember` activos y opciones de platillo del evento | Elegir una opción por integrante; al vencer deadline, lectura + aviso contacto |
| G14 | `/graduate/thermo` | Progreso financiero elegible, campos autorizados de personalización y estado | LOCKED → AVAILABLE → REQUESTED → IN_PRODUCTION → DELIVERED; solo editar antes de producción |
| G15 | `/graduate/more` | Mesa, Platillos, Termo, Mi contrato, contacto real si está configurado, cerrar sesión | Sin «Ayuda» sin contenido ni enlaces a páginas fantasma; perfil solo si pantalla real |
| G16 | Sesión/error/contexto | Expiración sesión, evento CLOSED/CANCELLED, membresía inactiva, falla red, acceso de otro usuario | Mantener consulta autorizada, bloquear mutaciones y mostrar vuelta al evento/login |

### Microflujos GRADUATE a diseñar enlazados

**FG-01 — Alta y contrato:** código válido → registro → resumen del evento → documento de contrato → checkbox de aceptación → confirmar → inicio. Estado alterno: usuario existente inicia sesión; varias membresías muestran selector. Si cambia versión de términos antes de aceptar, recargar documento, no confirmar la versión antigua.

**FG-02 — Lugares y grupo:** contrato con N lugares → registro nominal del titular `is_primary` y de invitados hasta N → «Lugar disponible» si falta registrar → cotización adicional por producto → detalle precio/importe exigido hoy → confirmar → plan actualizado. No crear identidades ficticias para lugares aún sin nombre; no permitir el N+1 GroupMember.

**FG-03 — Pagos:** `Abonar` → monto válido según backend → electrónico (redirect y confirmación asincrónica) **o** reporte con evidencia `PENDING_REVIEW` → abono confirmado y aplicado → actualizar saldo y elegibilidad de mesas/termo. Variantes: proveedor pendiente, doble webhook, comprobante rechazado, pago adelantado o mayor al mínimo, vencimiento/gracia, crédito.

**FG-04 — Mesas:** si falta pago inicial requerido mostrar bloqueo y link a Pagos; si elegible mostrar mapa precargado y cantidad sin ubicar → seleccionar mesa → asignar X lugares en una transacción con expected_version e idempotencia → confirmación → opcional vinculación de `GroupMember` nominales. Permitir distribuir entre varias mesas; no forzar autorización multimesa (Q3 no aprobada), no mezclar ubicación por cantidades con consumo duplicado.

**FG-05 — Platillos/termo:** lista de nombres reales → seleccionar platillo solo para integrantes/condiciones permitidas; termo se desbloquea por avance configurado independiente del de mesa; la solicitud conserva personalización y después de producción la edición desaparece.

## 5. Inventario de pantallas — ADMIN

| ID | Pantalla/ruta | Contenido/decisión central | Acción y estados |
|---|---|---|---|
| A00 | `/admin/login` | Identidad y acceso ADMIN | Login, recuperación según esquema, session expired |
| A01 | `/admin` | Búsqueda global por folio/nombre, acceso directo a registrar abono y comprobantes pendientes, eventos recientes | Buscar → expediente contextual, no 4 cards KPI |
| A02 | `/admin/events` | Lista de graduaciones: institución, fecha, cobranzas, estado, alertas | Abrir fila/crear evento; filtros útiles, vacío/error |
| A03 | `/admin/events/new` | Wizard UX de **4 pasos**: Datos → Boletos/precios → Plan pagos → Operación | Guardar DRAFT, validar, publicar/abrir después; no lifecycle dentro de wizard |
| A04 | `/admin/events/:eventId` | Cabecera nombre/fecha/sede, cobranza resumida y «Necesita atención» | Abrir casos urgentes; transiciones evento en menú contextual |
| A05 | Evento → Configuración | Formulario continuo: datos, productos, calendario, milestones, deadlines, platillos, termo, penalización, política | Guardar cambios autorizados; informar si no son retroactivos para contratos aceptados |
| A06 | Evento → Más → Política cancelación | Tabla editable de rangos días/porcentaje, validación cobertura y publicación | Draft → validar → publicar versión; no alterar política aceptada |
| A07 | Evento → Graduados | Búsqueda folio/nombre/teléfono, tabla Folio/Nombre/Personas/Total/Abonado/Saldo/Mesa/Alerta | Abrir expediente; filtros: saldo vencido, comprobante, sin mesa |
| A08 | Evento → Graduados → expediente | Identidad/folio/contacto, saldo/último/próximo pago, grupo, mesas, platillos especiales, termo, contrato | `Registrar abono` principal; menú ··· editar/cambiar mesa/platillo/cancelar/historial |
| A09 | Evento → Pagos / Cartera | Tabla folio, graduado, abonado, saldo, mínimo, fecha, estado; indicadores de cobro en línea | Fila → expediente; `Registrar abono` |
| A10 | Pagos → registrar abono | Contrato/folio, saldo, mínimo, **monto libre**, método CASH/TRANSFER/DEPOSIT, fecha y evidencia condicional | Confirmar con resumen; backend aplica allocation; sin editar pagos históricos |
| A11 | Pagos → Movimientos | Transacciones inmutables confirmadas, detalles y referencias | Filtrar, ver movimiento, generar compensación/ajuste separado si autorizado |
| A12 | Pagos → Comprobantes | Pendientes por default, lista + visor amplio de evidencia PDF/imagen | Aprobar → una transacción; rechazar con motivo; historial secundario |
| A13 | Pagos → ajustes/reembolsos | Contexto del plan y movimientos origen, importe permitido y motivo | Confirmar ajuste o refund independiente; no reescribir mensualidades/pagos |
| A14 | Evento → Mesas | Selector de plantilla aprobada, canvas dominante, ocupación derivada, inspector mesa, filtro «Mostrar niños» donde existan nombres | Asociar plantilla; supervisar, bloquear/cambiar asignaciones por cantidades según capacidad/fechas. Sin upload/import/CRUD libre de layout |
| A15 | Evento → Platillos | Totales compactos por opción, tabla persona/contrato/tipo/platillo/mesa | Filtrar especiales/pendientes; override con motivo después del deadline |
| A16 | Evento → Termos | Lista folio/nombre/mesa/grabado/estado/entrega y búsqueda | Producción, entrega con evidencia si aplica; vista imprimible de entrega/firma |
| A17 | Evento → Reportes | Cortes diarios/semanales/mensuales, filtros escuela/evento/periodo/método, tabla de cobros | Exportar XLSX/CSV y PDF resumen cuando aplique; exportación asíncrona/descarga autorizada |
| A18 | Evento → Cancelar graduado | Cotización con total/pagado/penalización/retención/reembolso estimado | Motivo, confirmación ADMIN; reembolso no automático; conserva historia |
| A19 | Evento → Más → Historial | Auditoría de cambios críticos por actor/acción/fecha, detalle autorizado | Lectura y filtros; no borrar auditoría |
| A20 | Cuenta ADMIN / administración | Altas/deshabilitaciones de cuentas ADMIN existentes según roles GR, sin permisos personalizados | Acciones administrativas protegidas y auditadas, navegación secundaria |
| A21 | Evento → estado | Control DRAFT→OPEN→CLOSED→FINALIZED o CANCELLED conforme guardas; CLOSED→OPEN si procede | Confirmación/motivo; sin borrar datos; no exponer como wizard |

### Wizard «Crear evento» — detalle paso a paso

1. **Datos:** escuela/institución, nombre/carrera/generación cuando aplique, fecha, salón/sede, capacidad, zona horaria.
2. **Boletos y precios:** productos Adulto, Niño, Sin cena (etiquetas configurables), precio por producto y capacidad.
3. **Plan de pagos:** pago inicial requerido/opcional, fechas e importes de abonos **variables**, periodo de gracia y milestones cuando aplique.
4. **Operación:** deadlines (lugares, mesas, platillos, liquidación), termo/umbral, platillos y política de cancelación; **asociación de plantilla de croquis se hace después** desde Mesas. Salida: evento DRAFT, abrir en acción posterior cuando configuración esté lista.

### Microflujos ADMIN a diseñar enlazados

**FA-01 — Configurar graduación:** Inicio → Eventos → Crear → 4 pasos → ver DRAFT → seleccionar croquis de catálogo → completar condiciones y publicar políticas → abrir OPEN. El estado OPEN sólo cuando cumpla guardas; no asumir que crear = abierto.

**FA-02 — Supervisar contratos:** Graduados → búsqueda → expediente → contrato/estado/folio → consultar integrantes/lugares, mesa y platillos → registrar abono o corrección. Reducción/cancelación es operación ADMIN con impacto financiero y auditoría, no botón «Eliminar lugar» unilateral del graduado.

**FA-03 — Cobranza:** Pagos → Cartera → filtrar vencidos → seleccionar graduado → abono libre en CASH/TRANSFER/DEPOSIT → confirmar → ledger actualizado; comprobante GRADUATE pendiente → previsualizar → aprobar/rechazar → solo tras aprobación saldo cambia. Historial y reporte deben reflejar una transacción efectiva, sin duplicación.

**FA-04 — Operación del evento:** Mesas (plantilla, cantidades/cupo, cambios administrativos auditados) → Platillos (especiales y pendientes) → Termos (producir/imprimir lista/entregar) → Reportes (cortes, Excel) → cerrar/finalizar con conservación de historial.

**FA-05 — Incumplimiento/cancelación:** cuotas vencidas → periodo de gracia/política vigente → cargo penalización separado, si corresponde → eventual cancelación automática configurada o cotización previa ADMIN → confirmación → si aplica, reembolso independiente. No simular reembolso inmediato al pulsar «Cancelar».

## 6. Máquina de estados de UI y variantes visuales

| Dominio | Estados ejemplares visibles | Comportamiento visual y bloqueo |
|---|---|---|
| Evento | DRAFT / OPEN / CLOSED / FINALIZED / CANCELLED | DRAFT config; OPEN operaciones; CLOSED lectura para graduado; FINALIZED historia; CANCELLED sin nuevas operaciones |
| Contrato | PENDING_ACCEPTANCE / ACCEPTED / SUPERSEDED / CANCELLED | Documento aceptable sólo pendiente; aceptación capturada con evidencias y términos inmutables |
| Compras | Cotización actual/vencida, cupo disponible/agotado, deadlines | Precio/catch-up calculado por backend; error stale no cobra ni agrega |
| Comprobantes | PENDING_REVIEW / APPROVED / REJECTED / CANCELLED | Pendiente nunca aumenta pagado; aprobado actualiza ledger; rechazo con motivo |
| Cobro electrónico | pendiente proveedor / confirmado / fallido | Nunca declarar confirmado por simple regreso al navegador |
| Mesa | ELIGIBLE / PAYMENT_REQUIRED / DEADLINE_CLOSED / EVENT_CLOSED / MEMBERSHIP_INACTIVE | Cantidades, no asientos; al conflicto recargar snapshot; sin mostrar PII ajena |
| Termo | LOCKED / AVAILABLE / REQUESTED / IN_PRODUCTION / DELIVERED | Hitos distintos de mesa; edición bloqueada al entrar en producción |
| Refund | REQUESTED / PENDING / CONFIRMED / FAILED / CANCELLED | Histórico y estado separado del contrato/cancelación |

## 7. Recorridos enlazados obligatorios en el prototipo

1. **Administración crea y abre evento**, con la transición DRAFT→OPEN y croquis de catálogo.
2. **Graduado nuevo**: código de evento→registro→contrato→aceptación→grupo→primera obligación de pago.
3. **Graduado con varias membresías**: login→selector de eventos→flujo aislado por evento.
4. **Compra adicional** después de plan creado: cotización con catch-up→confirmación→saldo nuevo; denegar si plazo/cupo no permite.
5. **Pago electrónico**: intento→redirigir→retorno «Confirmando»→servidor confirma; mostrar fallido/pendiente.
6. **Comprobante transferido**: enviar→en revisión→ADMIN aprueba→saldo/mesa se actualizan; variante rechazo.
7. **Mesas**: antes de pago bloqueada; tras pago autorizado asignación por cantidades (incluida distribución multimesa)→vincular nombre sin sobrecupo; conflicto de concurrencia.
8. **Platillos y termo**: seleccionar por persona→deadline lectura; termo bloqueo/solicitud/producción/entrega.
9. **ADMIN**: cartera vencida→registrar abono variable→revisar comprobante→exportar corte.
10. **Cancelación**: simulación cotización→confirmación motivo→afecta capacidad pero no borra pagos→refund separado.
11. **Cerrar evento**: operaciones ordinarias GRADUATE bloqueadas; histórico permanece.

## 8. Datos ficticios permitidos para la demostración de Stitch

Usar un evento `Graduación Derecho 2027` (ejemplo ficticio), un contrato `GR-00429` y una cuenta graduada `Andrea Martínez` únicamente como fixture visual. Demostrar 1 titular + invitados; cantidades con y sin cena; una familia con saldo, otra liquidada; una mesa con 3 lugares de un contrato y 2 del otro, sin revelar nombres de terceros. Los montos y porcentajes son ejemplos explícitos, no defaults.

**Prototipo interactivo, no mock de autoridad:** botones conectados entre pantallas, modales, cálculos ilustrativos claramente etiquetados y escenarios alternos; no afirmar guardado real, cobro real o integración con pasarelas. Permitir reiniciar escenarios y comparar mobile/desktop.

## 9. Instrucción final para Stitch (copiar íntegra)

> **Diseña un prototipo NUEVO, navegable y completo de Plataforma GR SIN Monkavia.** Rehaz todas las interfaces de ADMIN y GRADUATE según este documento y sus referencias normativas. Prioriza operación de graduaciones, sin cardificación ni KPIs gratuitos, usando identidad obsidian/plata con dorado mínimo. ADMIN desktop-first; GRADUATE mobile-first. Mantén exactamente el negocio y todos los estados, el contrato y `GroupMember` del CEO; usa croquis de plantilla precargada y asignación por cantidades, no editor de fondos/OCR ni sillas. Construye pantallas G00–G16 y A00–A21 con sus microflujos, validaciones, errores, confirmaciones y rutas; conecta todos los pasos mediante navegación interactiva. Incluye controles de P0 y superficies P1 y secundarias sin destacarlas artificialmente. **PROHIBIDO mostrar QR, emisión de accesos, Staff, Scanner o check-in.** Entrega versiones desktop/tablet/mobile y componentes reutilizables.

## 10. Criterios de aceptación del prototipo 01

- [ ] Existe un recorrido click-through end-to-end de ADMIN y otro de GRADUATE; toda CTA principal tiene destino.
- [ ] GR conserva sus 2 roles, `GroupMember` nominal obligatorio y contrato aceptado por versión.
- [ ] Los flujos comerciales vigentes y excepciones son navegables; no se confundió compra, persona, mesa o pago.
- [ ] Croquis precargado y `TableAllocation.quantity`, no mesas CRUD/imagen/OCR/seat.
- [ ] Móvil GRADUATE y desktop ADMIN son legibles y no forman una colección de dashboard cards.
- [ ] Estados vacío, bloqueado, error de red, error financiero, cupo y deadline visibles.
- [ ] El prototipo 01 **no contiene** ninguna interfaz Monkavia.
