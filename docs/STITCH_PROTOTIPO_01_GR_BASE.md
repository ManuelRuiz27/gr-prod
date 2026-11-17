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
