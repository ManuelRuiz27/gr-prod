# Stitch — Prototipo 02: Plataforma GR completa CON integración Monkavia

**Estado:** especificación de maquetación de **TODA la aplicación**, no sólo del módulo de accesos. Sin implementación/despliegue.  
**Objetivo:** rehacer desde cero la interfaz de ADMIN GR y GRADUATE conservando **exactamente** el negocio del CEO, y adicionar la experiencia de acceso basada en Monkavia. Debe producir un prototipo navegable integral y autocontenido, **distinto del Prototipo 01**.  
**Rama de integración:** `ManuelRuiz27/gr-prod@integration/monkavia-gr-access`. **Ningún cambio** a `GroupMember`, contrato, pagos, lugares o croquis comercial. Q3 multimesa no aprobado por CEO.

## 0. Fuentes y precedencia

- **GR comercial obligatorio:** [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md), [BUSINESS_RULES.md](BUSINESS_RULES.md), [SRS.md](SRS.md), [ROLES_PERMISSIONS.md](ROLES_PERMISSIONS.md), [FINANCIAL_DOMAIN.md](FINANCIAL_DOMAIN.md), [SEATING_QUANTITY_CONTRACT.md](SEATING_QUANTITY_CONTRACT.md), [SEATING_CATALOG_CONTRACT.md](SEATING_CATALOG_CONTRACT.md).
- **Rediseño completo de GR:** [STITCH_PROTOTIPO_01_GR_BASE.md](STITCH_PROTOTIPO_01_GR_BASE.md) define cada pantalla base G00–G16 y A00–A21 y sus acciones; **se incluyen todas** en este segundo prototipo, aun cuando estén intactas en apariencia. Las auditorías vinculantes siguen siendo [GRADUATE_UX_SIMPLIFICATION_AUDIT.md](GRADUATE_UX_SIMPLIFICATION_AUDIT.md), [ADMIN_UX_SIMPLIFICATION_AUDIT.md](ADMIN_UX_SIMPLIFICATION_AUDIT.md) y [UI_DESIGN_SYSTEM.md](UI_DESIGN_SYSTEM.md).
- **Contrato API GR+accesos:** [GR_ACCESS_INTEGRATION.openapi.yaml](GR_ACCESS_INTEGRATION.openapi.yaml) (15 operaciones nuevas, aditivas). Las 129 operaciones históricas de `API_CONTRACT.openapi.yaml` no son autorización para rescatar endpoints de seating retirados; prevalece `SEATING_QUANTITY.openapi.yaml` para cantidades.
- **Monkavia:** `ManuelRuiz27/invitacionespremium@monkavia-gr/docs/04-tecnico/GR_PRIVATE_API.openapi.yaml` v2 y `GR_ACCESS_V2_CONCILIATION.md` (18 operaciones privadas). Las rutas HMAC son **backend-to-backend**, NUNCA invocadas directamente por navegador.
- Este documento **reemplaza para alcance de Stitch** al brief estrecho `GR_ACCESS_STITCH_HANDOFF.md`, que sólo describía pantallas nuevas. Si Stitch recibe ambos, seguir éste.

### División invariable de responsabilidades

| Tema | GR — autoridad comercial | Monkavia — autoridad de acceso |
|---|---|---|
| Evento | Escuela, contrato, fecha, capacidad, productos, operación comercial | Evento técnico GR_ACCESS vinculado, ventana de admisión y estado de check-in |
| Personas | `GraduateMembership`, titular y `GroupMember` nominales con `full_name` obligatorio | Snapshot mínimo de derechos; no nueva cuenta para invitados |
| Lugares | `ContractLineItem.quantity`, capacidad y tipología ADULT/CHILD/NO_DINNER | `GrAccessRight` individual por lugar, UUID inmutable `externalPlaceId` |
| Mesas | Catálogo de croquis, `TableAllocation.quantity`, vinculación nominal sin doble cupo | Snapshot `externalTableId` del derecho pendiente, no edición de croquis |
| Pagos | Ledger, confirmación, reversos, liquidación 100% neta aplicable | Recibe decisión versionada `familyState`/`noDinnerState`; no calcula dinero |
| Credenciales | Portal del graduado / PDF ADMIN a través de backend GR | Emite y verifica QR FAMILY/NO_DINNER; tokens Staff, ingresos únicos e inmutables |
| Staff | ADMIN GR solicita/entrega acceso temporal de operación | Staff usa scanner Monkavia; **no existe tercer rol GR** |

**Norma decisiva:** los derechos pueden tener `displayName` vacío si el lugar comercial aún no está vinculado a una persona; esto **NO** convierte `GroupMember.full_name` en opcional ni inventa `GroupMember`. El graduado titular siempre tiene un derecho FAMILY (incluso si no agrega invitados). Las asignaciones multimesa permitidas por GR no se someten a una aprobación adicional en este diseño; **Q3 pendiente del CEO**.

## 1. Arquitectura visual para dos prototipos coherentes

Reutilizar **exactamente** el sistema de diseño y shells del Prototipo 01: obsidian/negro, plata, dorado restringido, Inter; Cormorant Garamond sólo para identidad ceremonial; estructuras por tipografía y espacio, sin dashboards de tarjetas.

- **ADMIN GR**, desktop-first: sidebar `Inicio | Eventos | Reportes`; dentro de evento, `Resumen | Graduados | Pagos | Mesas | Platillos | Termos | Más ▾`. Añadir en `Más` la entrada `Accesos` sin rediseñar las otras.
- **GRADUATE**, mobile-first: bottom-nav `Inicio | Mi grupo | Pagos | Más`; dentro de `Más` añadir `Mis accesos`. No quinta pestaña, no nueva ruta principal de contratación.
- **Monkavia Scanner**: tercera **superficie técnica independiente**, usable en teléfono/tablet por Staff con enlace/token temporal. No es una pantalla `/admin/*` ni `/graduate/*`, no comparte login ni permisos de GR.
- Estados y componentes compartidos en ambos prototipos: loading, empty, ready, blocked, sync pending, authorization expired, failure, success, drawer, bottom sheet, tabla, confirmación de acción, búsqueda y soporte táctil ≥44 px.

## 2. Navegación COMPLETA del Prototipo 02

```text
PÚBLICO GR: /access → /register o /login → /forgot-password
GRADUATE (Inicio | Mi grupo | Pagos | Más)
├─ /graduate/events              Selector cuando hay varias membresías
├─ /graduate                     Inicio
├─ /graduate/contract            Documento y aceptación
├─ /graduate/group               Contratación y GroupMember
├─ /graduate/payments            Abonos, intentos y comprobantes
├─ /graduate/table               Croquis plantilla + cantidades
├─ /graduate/meals               Platillos por persona
├─ /graduate/thermo              Termo
├─ /graduate/more                Navegación secundaria
└─ /graduate/more → Mis accesos  [NUEVA VISTA, ruta frontend a fijar]
   ├─ Estado de elegibilidad
   └─ Mi QR familiar (FAMILY)    [NO impresión NO_DINNER]

ADMIN (Inicio | Eventos | Reportes)
├─ /admin                        Operación y búsqueda
├─ /admin/events                 Eventos
├─ /admin/events/new             Wizard cuatro pasos
└─ /admin/events/:eventId        Resumen
   ├─ Graduados → Expediente
   ├─ Pagos → Cartera | Movimientos | Comprobantes
   ├─ Mesas
   ├─ Platillos
   ├─ Termos
   └─ Más
      ├─ Reportes
      ├─ Configuración
      ├─ Historial
      └─ Accesos                [NUEVA SECCIÓN, ruta frontend a fijar]
         ├─ Resumen y elegibilidad por contrato
         ├─ Configuración de horario
         ├─ Operación: activar/pausar/reanudar/cerrar
         ├─ Preparar accesos
         ├─ Imprimir pases sin cena
         ├─ Personal Staff
         └─ Asistencia

MONKAVIA SCANNER (sitio separado; rutas visuales conceptuales)
├─ Abrir enlace/token temporal de Staff
├─ Seleccionar/confirmar evento autorizado
├─ Escanear QR FAMILY → seleccionar derechos 1..N → confirmar ingreso
├─ Escanear QR NO_DINNER → confirmar derecho único
└─ Resultado / pausa / fuera horario / sin conexión / agotado
```

**Las nuevas subrutas de frontend son propuestas de navegación**, no endpoints declarados ni autorizaciones para cambiar `App.tsx`. La API aditiva está en `/api/v1/admin/events/{eventId}/accesses/*` y `/api/v1/me/events/{eventId}/accesses/*`.

## 3. Journey maestro de negocio — GR + Monkavia, de inicio a cierre

```text
ADMIN GR:
  Crear graduación DRAFT → configurar productos, calendario, políticas, termos,
  platillos y plantilla de croquis → abrir evento comercial OPEN
      │
      ├─ [INTEGRACIÓN] preparar vínculo técnico evento GR_ACCESS en Monkavia
      │                y configurar horario separado de ingreso
      ▼
GRADUATE:
  Código de evento → registrarse/login → contrato individual → aceptación
  → adquirir lugares ADULT/CHILD/NO_DINNER → GroupMember nominales cuando aplica
  → pagar inicial/abonos → elegir cantidades por mesa en GR
  → vincular nombres de GroupMember sin ocupar dos veces
      │
      ├─ [INTEGRACIÓN] GR proyecta una AccessUnit UUID estable por lugar,
      │                sincroniza producto, nombre opcional y mesa a Monkavia
      ├─ [INTEGRACIÓN] Monkavia prepara un QR FAMILY/membresía,
      │                QR NO_DINNER/derecho; nacen BLOCKED
      │
      ├─ GR confirma liquidación 100% neta
      │     ├─ todos los derechos con cena tienen mesa
      │     │      → FAMILY RELEASED
      │     ├─ falta alguna mesa con cena
      │     │      → FAMILY BLOCKED
      │     └─ derechos NO_DINNER y contrato liquidado
      │            → NO_DINNER RELEASED independientemente de mesas
      ▼
GRADUATE ve «Mi QR familiar» (sólo si RELEASED); puede compartir captura
ADMIN GR genera PDF de QR individuales NO_DINNER liberados y los distribuye
      │
      ▼
ADMIN GR activa operación de admisión por horario o manualmente:
  puede PAUSE/RESUME; fuera horario ACTIVATE/RESUME con motivo y nueva hora límite
      │
      ▼
Staff en MONKAVIA:
  escanea → verifica ventana + Staff + lease + QR + derecho pendiente
  → FAMILY selecciona 1..N, NO_DINNER uno → check-in irreversible
  → futuros escaneos muestran restantes; nunca doble ingreso
      │
      ▼
ADMIN GR consulta asistencia; Monkavia conserva histórico de entradas;
  GR conserva cartera, contrato, mesas, reportes y su ciclo comercial original.
```

**Las etapas GR no se secuencian artificialmente:** el graduado puede pagar en parcialidades, agregar lugares, modificar distribución dentro de reglas y solicitar termo según umbral configurado. Accesos reaccionan a los hechos de GR; no reescriben el proceso.

## 3A. Guion visual completo: cómo viven la graduación todos los actores

**Instrucción principal a Stitch:** este segundo prototipo debe presentar el **recorrido entero de la graduación**, con pantallas comerciales GR y, cuando llega la etapa de ingreso, la interacción con Monkavia. El scanner es una superficie independiente. **No** dibujar únicamente un módulo de QR. El diseño tiene que mostrar qué ve una persona en el momento en que debe decidir o actuar.

### Actores de esta variante y responsabilidades visibles

| Actor real | ¿Tiene sesión? | ¿Qué hace en la graduación? | En qué pantallas interviene |
|---|---|---|---|
| **ADMIN GR** | Sí, rol ADMIN de GR | Crea graduación, precios, contratos, plazos, valida dinero, coordina mesas, platillos y termos, solicita/emite accesos y controla operación de entrada | Panel GR completo + «Accesos» |
| **GRADUATE titular** | Sí, rol GRADUATE de GR | Acepta su contrato, adquiere/gestiona lugares, registra `GroupMember` con nombre, paga, distribuye mesas, selecciona platillos, consulta su único QR FAMILY | Portal GR completo + «Mis accesos» |
| **Invitado con cena** | **No** requiere cuenta GR propia | Asiste con un derecho ADULT/CHILD de la membresía; puede presentar captura del mismo QR familiar, el Staff selecciona el derecho pendiente que ingresa | No se crea portal de invitado; comparece físicamente ante Scanner Monkavia |
| **Invitado sin cena** | **No** requiere cuenta GR propia | ADMIN GR le distribuye un pase individual impreso desde plantilla; presenta ese QR de un único uso | No se crea portal; Scanner Monkavia |
| **Staff de puerta Monkavia** | Acceso temporal de Monkavia, **no rol GR** | Presenta scanner, identifica derechos disponibles y registra ingresos parciales/individuales | Interfaz móvil de scanner Monkavia |
| **Pasarela / servicios automáticos** | Integración servidor-servidor | Confirman pago, sincronizan derechos, autorizan admisión y entregan asistencia | Se reflejan en estados de pantalla; no tienen un panel humano nuevo |

### Escena 1 — ADMIN crea la graduación; todavía no existen QR

**Quién:** ADMIN GR. **Pantallas:** A01 Inicio → A02 Eventos → A03 Crear (Datos, boletos, pagos, operación) → A05 Configuración → A14 Mesas → A21 Abrir evento.

**Lo que ve:** exactamente los cuatro pasos del asistente comercial: datos de evento/salón/fecha/aforo; tarifas por tipo de lugar; pago inicial y parcialidades con fechas/importes distintos; deadlines, platillos, termo y cancelaciones. El evento queda `DRAFT`, ADMIN asocia una plantilla de croquis del catálogo y, cuando todo lo comercial está listo, lo pasa a `OPEN`.

**Acciones y respuesta de la interfaz:** «Siguiente», «Guardar borrador», «Elegir plantilla», «Abrir evento». Mostrar validaciones sin cambios a los contratos originales. Al abrir, el evento aparece disponible para el código contextual de registro. **No añadir QR ni Staff como paso obligatorio del wizard**, ni cambiar `Event.status` para activar entradas físicas.

**Paso posterior independiente de integración:** al configurarse admisión, el backend GR podrá crear/vincular el evento técnico `GR_ACCESS` de Monkavia mediante API privada. Se enseña sólo como estado de sincronización en A22, no como segunda «graduación comercial».

### Escena 2 — GRADUATE se registra, acepta contrato y adquiere lugares

**Quién:** GRADUATE titular. **Pantallas:** G00 Código → G01 Registro / G02 Login → G03 Selección si varios eventos → G05 Contrato → G04 Inicio → G06 Mi grupo → G07 Comprar más lugares.

**Lo que ve:** código de la graduación, sus datos y el documento de contrato con folio, conceptos, importes y términos. Después ve lista de integrantes **nominales**: titular primero, invitados registrados y renglones «Lugar disponible» para derechos comprados aún no asociados a `GroupMember`; registrar persona exige nombre. Agregar un boleto muestra precio real y, en compras tardías, posible catch-up calculado por GR.

**Acciones y respuesta:** validar código, crear cuenta o ingresar, aceptar contrato explícitamente, registrar nombres, cotizar y confirmar productos. Si falta capacidad/deadline, mostrar bloqueo comercial. Las reglas y pantallas son **las mismas** que en Prototipo 01; Monkavia no dicta cuántos integrantes se pueden crear ni convierte nombres obligatorios en opcionales.

**Qué pasa en paralelo sin nueva pantalla comercial:** cada lugar vigente debe poder proyectarse hacia Monkavia como un derecho técnico con UUID estable. La proyección no crea otro `GroupMember`, no compra otro lugar y no cambia el contrato.

### Escena 3 — GRADUATE paga; ADMIN verifica y resuelve evidencias

**Quién:** GRADUATE / ADMIN GR / pasarela. **Pantallas:** G08 Pagos, G09 Abonar, G10 Comprobante; A09 Cartera, A10 Abono manual, A12 Revisar comprobante, A11 Movimientos, A13 Ajustes/refunds.

**Lo que ve GRADUATE:** abonado, saldo, mínimo exigible, fecha siguiente, acciones de abono electrónico o reportar transferencia/depósito. Si envía comprobante ve «En revisión», no «Pagado». Un regreso del proveedor muestra «Confirmando pago» hasta que servidor autoriza.

**Lo que ve ADMIN:** folios con cartera, evidencia visible en panel grande, «Aprobar» o «Rechazar con motivo», opción de registrar un abono de monto libre en efectivo/transferencia/depósito. Ajustes y devoluciones aparecen como movimientos separados; no se editan pagos pasados.

**Qué cambia en accesos después de la operación financiera:** si no hay liquidación **100% neta aplicada**, ambos tipos de QR permanecen bloqueados. Si alcanza 100%, se evalúan **por separado** mesa familiar y pases sin cena. En las pantallas de pago no aparece un botón manual «Marcar liquidado para QR»; el servidor deriva esa elegibilidad de los datos GR.

### Escena 4 — El titular distribuye mesas y registra platillos; Monkavia observa, no administra

**Quién:** GRADUATE, ADMIN GR. **Pantallas:** G11 Croquis, G12 Vincular nombre, A14 Supervisión de mesas, G13/A15 Platillos.

**Lo que ve GRADUATE:** la plantilla de salón precargada y la disponibilidad por mesa; una indicación «X lugares confirmados, Y ubicados». Selecciona **cantidad de lugares**, mesa y confirma. Puede ubicar parte de su grupo en distintas mesas, conforme a GR. Cuando hay nombre, puede vincular un `GroupMember` existente sin ocupar dos veces el lugar. Si no hay nombre aún, la cantidad sigue asignada. Nadie puede elegir una silla individual.

**Lo que ve ADMIN:** el mismo croquis con disponibilidad y datos permitidos de contratos, cambios por cantidad y excepciones administrativas. El módulo Platillos muestra opciones por integrante elegible, pendientes y especiales.

**Consecuencia precisa para acceso:** cada derecho **con cena** debe estar representado en el snapshot de Monkavia con una mesa GR válida antes de liberar FAMILY. **No** significa que haya que completar nombres de todos los lugares comprados para emitir el QR; los `GroupMember` que sí existen siguen obligados a tener nombre. Esta comprobación de acceso no cambia el desbloqueo ni el flujo de mesas de GR. La aprobación extra por distribuir en varias mesas **Q3 sigue pendiente del CEO**: no dibujar cola de solicitudes ni estados «Por autorizar» por este motivo.

### Escena 5 — Termos, reportes y cancelaciones siguen siendo 100% GR

**Quién:** GRADUATE y ADMIN GR. **Pantallas:** G14 Mi termo, A16 Termos, A17 Reportes, A18 Cancelar membresía, A19 Historial, A21 Estado evento.

**Lo que ve:** un graduado consulta el avance configurado para solicitar/personalizar termo; ADMIN prepara producción, imprime lista para entrega y registra conformidad si aplica. Reportes muestran corte, cobranzas, cantidades, platillos y mesas. Una cancelación requiere cotización, motivo y, si procede, un reembolso **separado**. Ninguna de estas pantallas de GR se reemplaza por la de Monkavia.

**Relación técnica visible sólo cuando importa:** cancelar un contrato o revertir un pago bloquea los **derechos de acceso pendientes** sincronizados; los ingresos ya consumidos permanecen registrados en Monkavia. Mostrar un estado «Sincronizando suspensión» si hay retraso; no prometer revocación entre servidores instantánea con redes caídas.

### Escena 6 — ADMIN prepara los QR desde el módulo Accesos

**Quién:** ADMIN GR. **Pantallas:** A22 Resumen de accesos → A25 Preparar/sincronizar.

**A22 · Resumen de acceso.** Se ingresa por `Evento → Más → Accesos`. Encabezado con graduación, fecha y un **estado técnico de admisión** distinto del estado `OPEN` comercial. En primer plano, lista de contratos por folio y columnas legibles: «Familiar», «Pases sin cena», «Ingresados», «Pendientes», «Última sincronización». Arriba, horario y alertas; no grid de KPI decorativos. Una fila abre detalle con lugares con cena y su mesa, lugares sin cena, liberación y causa de bloqueo. El botón principal contextual puede ser «Preparar accesos» o «Revisar sincronización».

**A25 · Preparar los derechos.** El ADMIN selecciona contratos/pase(s) autorizados en lista. Puede filtrar «Pendiente», «Sincronizado», «Error». Al pulsar «Preparar», se muestra estado `QUEUED/SYNCED` de backend; Monkavia genera una credencial FAMILY por contrato y una NO_DINNER por derecho sin cena **inicialmente bloqueadas**. La preparación no implica cobro ni autoriza check-in. Un error de versión/HMAC/outbox/aforo aparece como incidente con folio y «Reintentar sincronización». Nunca dibujar un editor de nombres, productos o mesas dentro de este módulo.

**Acción que sucede automáticamente entre escenas:** con datos comerciales confirmados, GR sincroniza snapshot y decide liberación versión por versión. ADMIN puede consultar resultado, pero **no** sobreescribe el saldo para liberar QR.

### Escena 7 — La liberación se divide en FAMILY y NO_DINNER

**Quién:** backend GR decide; ADMIN consulta e imprime; GRADUATE consulta sólo FAMILY. **Pantallas:** A22/A26 ↔ G17/G18/G19/G20.

**Situación A: contrato no liquidado.** En A22, fila de folio con «Familiar: pendiente por pago» y «Sin cena: pendiente por pago». G17 del graduado dice «Tu código familiar estará disponible cuando liquides el contrato» y ofrece «Ver mis pagos». No hay QR legible.

**Situación B: contrato 100% pagado, pero faltan mesas para derechos con cena.** En A22, «Familiar: faltan X ubicaciones de mesa» y «Pases sin cena: listos para imprimir». En G19, «Asigna los lugares pendientes de tu grupo en el croquis para activar tu QR familiar», con CTA «Ver mesas». **ADMIN sí puede imprimir/entregar los pases individuales sin cena**. Mostrar ambas condiciones a la vez en la misma fila; no un estado único de contrato que bloquee todo.

**Situación C: 100% pagado y todos los derechos con cena ubicados.** En G18 aparece un QR familiar grande, solo uno por contrato, encabezado con nombre de evento y folio, número de accesos familiares que representa y nota breve «Puedes compartir una captura; los accesos disponibles se contabilizan al ingresar». El QR puede representar **solo al graduado titular** cuando no hay invitados. No dibujar un QR diferente por mesa, persona con cena o dispositivo.

**Situación D: se registran ingresos parciales.** G20 conserva el mismo QR y actualiza indicador «5 de 8 ingresaron; quedan 3» según respuesta autorizada. Si todos están consumidos, mostrar «Todos los accesos familiares utilizados» en vez de otro QR. El graduado no ejecuta check-in en GR.

**A26 · Imprimir pases sin cena.** ADMIN entra a `Accesos → Pases sin cena`. Lista de contratos con pases liberados, filtro por folio y contador de pases individuales; casillas de selección. Después elige **plantilla de impresión** (según templates configurados), vista previa y «Generar PDF». Mostrar progreso `En cola → Preparando → Listo`, botón «Descargar archivo», o reintento si falló. Cada boleto impreso corresponde a **un derecho NO_DINNER de un solo uso**. El titular no obtiene esa plantilla desde su portal; la entrega física o distribución de los impresos la realiza ADMIN. No inventar interfaz para invitado.

### Escena 8 — ADMIN programa y opera la admisión del día del evento

**Quién:** ADMIN GR; backend GR y Monkavia aplican la autorización. **Pantallas:** A23 Configuración → A24 Operar admisión → A22 Estado.

**A23 · Horario de ingreso.** Formulario dentro de Accesos, separado de la fecha comercial del evento: «Inicio de recepción», «Fin de recepción», timezone del evento en lectura y mensaje de hora local. ADMIN guarda un rango válido. Un panel discreto anticipa «Programado», «Ingreso habilitado dentro de ventana» o «Fuera de horario». La configuración no cambia `Event.status` ni los vencimientos contractuales.

**A24 · Estado de admisión y controles.** Vista de operador con una línea central «Admisión programada/abierta/pausada/cerrada», horario, lease/sincronización y botones **contextuales** `Activar`, `Pausar`, `Reanudar`, `Cerrar definitivamente`. No habilitar cuatro botones indiscriminados; depender del estado real y permisos.

**A24 · Pausa.** Al elegir «Pausar», modal solicita **motivo** y confirmación; después aparece «Ingresos suspendidos» con el momento y causa permitida. Aunque los QR estén liberados y exista lease anterior, nuevos ingresos quedan denegados. Credenciales y Staff no se destruyen por una pausa.

**A24 · Reanudación normal.** En horario vigente, «Reanudar» solicita confirmación, verifica condiciones y espera al backend. No se marca abierto si aún falta lease o hay suspensión crítica pendiente.

**A24 · Apertura extraordinaria fuera de horario.** ADMIN elige «Activar» o «Reanudar» y aparece un formulario específico con **motivo detallado**, código/razón, y «Nueva hora límite» futura. Debajo: «Esta excepción no modifica el horario normal ni cambia contratos o pagos». Guardar crea decisión administrativa auditada; estado de pantalla muestra «Extensión de ingreso hasta HH:MM». Si vence la excepción y la ventana normal no está vigente, se deniega el ingreso. Si la ventana normal sí está vigente, se aplica su regla independiente, salvo PAUSE/CLOSE/lease inválido.

**A24 · Cierre definitivo.** Solicitar confirmación fuerte con explicación «Los ingresos se detendrán y no se podrán reanudar mediante una pausa». `CLOSE` es terminal, distinto de que se cumpla simplemente la hora final del horario programado. Historial permanece.

**A29 · Incidentes.** Mostrar en el contexto de Accesos alertas concretas: «No se pudo sincronizar el folio», «Lease vencido», «El acceso está pausado», «La excepción ya terminó», «No puedes emitir el Staff número 16», «Límite 5,000 derechos alcanzado». Cada incidencia con acción real: reintentar sólo si es seguro, revisar datos, cambiar horario autorizado o contactar operación. Nunca mostrar secretos HMAC.

### Escena 9 — ADMIN habilita personal de puerta; Staff no entra en GR

**Quién:** ADMIN GR administra credenciales; Staff utiliza Monkavia. **Pantallas:** A27 → M00/M01.

**A27 · Personal de entrada.** En `Accesos → Personal`, ADMIN ve tabla «Alias | Emitido | Vigencia | Estado» y CTA «Crear acceso de personal». Un formulario pide alias operativo; tras éxito se muestra **una sola vez** enlace/token para transmitirlo por canal seguro al Staff, con aviso explícito de que no se podrá volver a consultar. Desde lista se puede expirar un token activo. Limitar a **15** accesos Staff simultáneos para GR_ACCESS; el 16.º se rechaza con mensaje. No crear cuentas de usuario Staff en GR.

**M00 · Identificación Staff.** El operador abre el enlace temporal a Monkavia. Una pantalla sencilla muestra alias, evento y estado de su sesión, sin pedir usuario/contraseña de GR. Token inválido o expirado muestra «Tu acceso de personal ya no está disponible. Solicita uno nuevo al organizador». No mostrar datos financieros ni lista completa de graduados.

**M01 · Cámara preparada.** Pantalla centrada en cámara, guía de enfoque y mensaje compacto «Escanea un pase». Estado de evento/admisión visible sin saturar. Si está pausado, fuera de horario, sin conexión o con lease vencido, reemplazar CTA por «Ingresos temporalmente no disponibles», no permitir registrar entradas offline.

### Escena 10 — Un QR familiar permite entradas parciales incluso si llegan separados

**Actores:** GRADUATE titular/invitados con cena presentan captura; Staff ejecuta check-in. **Pantallas:** G18 (consulta) → M01 escaneo → M02 pendientes → M03 confirmar → M04 resultado → G20 actualización.

**Escena concreta:** un contrato tiene **8 derechos familiares con cena**, todos con mesa válida; se presentan 5 personas primero. Al escanear, M02 muestra «Contrato GR-00429 — 8 accesos disponibles» y una lista seleccionable de 8 derechos pendientes, con nombre cuando exista y **mesa correspondiente**. Pueden existir derechos sin nombre sin generar `GroupMember` anónimo; Staff identifica operacionalmente el derecho elegido conforme al dato disponible. Selecciona **5 derechos**, M03 revisa «Ingresarán 5 personas» y confirma.

**Resultado:** M04 muestra «Ingreso confirmado: 5 · Restan: 3», sin emitir nuevas credenciales. Más tarde otra persona presenta una captura del **mismo QR**. M02 sólo muestra 3 pendientes; Staff confirma los 3 y M04 muestra «Todos los accesos utilizados». G20 refleja consumos/restantes sin aceptar escaneo propio.

**Errores y seguridad:** si otra puerta consumió uno de los seleccionados, mostrar conflicto y actualizar lista; la operación parcial original se rechaza **de manera atómica** y no ingresa silenciosamente los restantes. Reintentar con misma clave no duplica consumos. Una captura del QR **no prueba identidad del portador**; no dibujar verificación obligatoria de identificación oficial ni permisos de «transferir 2 accesos» sin nueva decisión de negocio. Ningún derecho puede ingresar dos veces.

### Escena 11 — Un pase sin cena se imprime y se consume una sola vez

**Actores:** ADMIN GR imprime/entrega; invitado sin cena presenta pase; Staff valida. **Pantallas:** A26 → M01 → M05.

**Escena concreta:** dos personas sin cena pertenecen a un contrato liquidado cuyas mesas familiares aún no están completas. ADMIN ve en A26 «2 pases listos», genera PDF y entrega cada pase impreso. Una persona se presenta en puerta, Staff escanea y M05 muestra «Pase sin cena — 1 ingreso disponible»; confirma y recibe «Ingreso registrado». Si alguien presenta una copia del mismo impreso después, el scanner muestra «Pase utilizado» y **no** crea segundo ingreso. No mostrar invitado en mesa ni habilitar menú de platillos por esa credencial.

### Escena 12 — ADMIN sigue la asistencia; todos cierran la operación

**Actor:** ADMIN GR observa; Staff continúa puerta en Monkavia; backend sincroniza datos. **Pantallas:** A28 Asistencia, A22 Estado, A24 Cierre, A17 Reportes comerciales.

**A28 · Asistencia.** Vista de operación con total de derechos reservados, ingresados y pendientes, junto a tabla filtrable por folio/tipo/mesa. En un contrato familiar que entró 5 de 8, reflejar 5 consumidos y 3 pendientes. El histórico no debe tener botón «Deshacer ingreso». Mostrar hora del último snapshot y estado de sincronización; esta pantalla informa pero no es el origen de verdad del escaneo.

**Cuando ocurre PAUSE o cierre:** Staff ve M07 suspendido; ADMIN ve A24 pausado/cerrado y A28 mantiene el conteo histórico intacto. `CLOSE` termina la admisión técnica; **no implica cambiar a `FINALIZED` el evento comercial de GR**. Posteriormente ADMIN continúa sus cortes, pagos, devoluciones y cierre contractual normales desde las mismas pantallas base.

### Escena 13 — Cruces de actores que el prototipo debe permitir recorrer

**Caso 1 — Pago pendiente:** G10 «Transferencia en revisión» → A12 ADMIN la aprueba → G08 saldo liquidado → G19 familiar bloqueado si falta mesa → A26 pases sin cena imprimibles.

**Caso 2 — Se terminan de ubicar mesas:** G11 ubica cantidades faltantes → GR actualiza distribución → A25/Monkavia sincronizan snapshot → G18 aparece QR familiar; no se generó otro `GroupMember`.

**Caso 3 — Dos grupos llegan por distintas puertas:** un STAFF confirma 5 de 8; otro escanea después y sólo quedan 3. Ambos pueden haber recibido la misma captura; ningún Staff obtiene información financiera de GR.

**Caso 4 — Incidente de puerta:** A24 ADMIN pulsa PAUSE → M07 Staff no puede confirmar nuevos ingresos → ADMIN RESUME tras validar elegibilidad/lease → M01 vuelve a escanear. Si es fuera de horario, obliga motivo y hora límite.

**Caso 5 — Reverso financiero:** A13 corrección/reembolso o membresía cancelada → GR ordena bloquear pendientes → G19 suspende QR y M06 rechaza nuevo ingreso cuando Monkavia aplica bloqueo o caduca lease; entradas anteriores quedan en A28. Con partición entre servidores la revocación financiera no es instantánea; mostrar «Sincronización pendiente» cuando corresponda.

**Caso 6 — Comensales de varias mesas:** G11 GR permite distribuir por cantidades en mesa A y B. En M02 cada derecho con cena muestra mesa del snapshot; un mismo QR FAMILY cubre ambas mesas. **No** inventar aprobación especial Q3, nombres obligatorios fuera de `GroupMember` ni QR separado para cada mesa.

**Caso 7 — Límite y concurrencia:** 5,000 derechos técnicos de evento pueden existir; el 5,001 muestra error en A25, no un nuevo lugar comprado en GR. El último lugar comercial, por su parte, sigue validado por el aforo de GR. No equiparar ambos máximos ni modificar capacidad financiera por límites de escaneo.

### Escenas y pantallas NO autorizadas

No dibujar «Invitado crea cuenta», «Admin asigna boletos sin cena desde el contrato», «Staff edita mesa», «Graduado envía QR sin cena desde Mis accesos», «Graduado aprueba sus propios comprobantes», «Staff abre portal GR», «Asiento numerado», «QR por mesa», «Ingreso offline», «Deshacer check-in», «Transferir derecho a otro contrato», «Autorización multimesa obligatoria» ni diálogos que piden nombres para lugares comerciales que todavía no constituyen `GroupMember`.

---

## 4. Inventario COMPLETO reutilizado de GR, presente en este prototipo

Stitch debe **renderizar y enlazar** todas las pantallas siguientes, no limitarse a diseñar Accesos. Se aplican íntegramente sus pantallas, microflujos, reglas y variantes definidas en `STITCH_PROTOTIPO_01_GR_BASE.md`.

### 4.1 GRADUATE — pantallas existentes completas

| ID | Pantalla | Acciones interactivas |
|---|---|---|
| G00 | Acceso contextual a graduación | Código válido/expirado → registrarse o ingresar |
| G01 | Registro | Identidad, evento resuelto, crear membresía |
| G02 | Login y recuperar contraseña | Login seguro, recuperar, salida |
| G03 | Selector de eventos propios | Aparece sólo si varias membresías |
| G04 | Inicio | Siguiente tarea prioritaria y avisos contextuales |
| G05 | Contrato | Documento scroll natural, folio y aceptar términos |
| G06 | Mi grupo | Titular `GroupMember`, personas nominales, lugares restantes |
| G07 | Agregar boleto | ADULT/CHILD/NO_DINNER, cotización/catch-up, confirmar |
| G08 | Mis pagos | Abonado/falta, próximo mínimo, calendario e historial |
| G09 | Pago electrónico | Mercado Pago/OpenPay, retorno «Confirmando», resultado backend |
| G10 | Reportar transferencia/depósito | Evidencia, pendiente de revisión, aprobación/rechazo |
| G11 | Croquis | Plantilla, cantidades por mesa, disponibilidad/conflicto |
| G12 | Vincular nombres a cantidades | `GroupMember` existente, no nueva ocupación |
| G13 | Platillos | Opciones por persona, deadline y lectura |
| G14 | Mi termo | Umbral configurable, personalización, producción/entrega |
| G15 | Más | Mesa, platillos, termo, contrato, contacto y Mis accesos nuevo |
| G16 | Sesión/errores/cierre | Estados de expiración, sin permiso, evento inactivo |

### 4.2 ADMIN — pantallas existentes completas

| ID | Pantalla | Acciones interactivas |
|---|---|---|
| A00 | Login ADMIN | Acceso administrativo |
| A01 | Inicio operativo | Buscar folio, registrar abono, comprobantes pendientes |
| A02 | Eventos | Listar/buscar y abrir graduación |
| A03 | Crear evento | Cuatro pasos: Datos, boletos/precios, pagos, operación |
| A04 | Resumen de evento | Cobranza, alertas, transiciones en menú secundario |
| A05 | Configuración | Formulario continuo, cambios no retroactivos |
| A06 | Política cancelación | Rangos, validación sin huecos/traslapes, publicar versión |
| A07 | Graduados | Tabla, filtros, búsqueda y expediente |
| A08 | Expediente | Folio, contrato, pago, grupo, mesa, platillos, termo |
| A09 | Cartera | Saldos, vencimientos, mínimos |
| A10 | Registrar abono | Monto variable, efectivo/transferencia/depósito |
| A11 | Movimientos | Ledger inmutable y detalles |
| A12 | Revisar comprobantes | Evidencia dominante, aprobar/rechazar |
| A13 | Ajustes y reembolsos | Historial y operación independiente |
| A14 | Mesas | Plantilla precargada, cantidades, inspector y ocupación |
| A15 | Platillos | Producción, excepciones, pendientes y overrides |
| A16 | Termos | Grabado, producción, entrega, lista imprimible |
| A17 | Reportes/cortes | Diario/semanal/mensual, Excel/CSV/PDF autorizado |
| A18 | Cancelación de membresía | Cotización, motivo, refund separado |
| A19 | Historial | Auditoría contextual, sin tab global protagonista |
| A20 | Cuentas ADMIN | Alta/deshabilitación, sin roles nuevos |
| A21 | Estado comercial de evento | DRAFT/OPEN/CLOSED/FINALIZED/CANCELLED, independiente de admisión |

**Reglas de conservación visibles:** contrato individual, `GroupMember.full_name` obligatorio, titular como principal, compras y catch-up, comprobantes no confirmados no liquidan, mesas por cantidades con plantilla, platillos por persona, termo por avance propio, reembolsos/ajustes con historial separado. En este Prototipo 02, **ninguna** pantalla previa adquiere requisitos Monkavia que cambien su lógica.

## 5. Módulo NUEVO — ADMIN GR «Accesos» (desktop-first)

| ID | Pantalla nueva | Datos mostrados y comportamiento | Acción/OpenAPI GR |
|---|---|---|---|
| A22 | Accesos — resumen | Estado técnico de admisión separado de OPEN/CLOSED comercial; próximo horario; último sync; lease; 5,000 capacidad máxima; tabla de contratos con estados FAMILY/NO_DINNER y asistencias | `adminGetAdmissionStatus`, `adminListAccessMemberships` |
| A23 | Configuración de admisión | Inicio/fin en timezone del evento, previsualización local y validación de fechas; no altera fecha GR, no configura mesas/pagos | `adminGetAccessConfiguration`, `adminUpdateAccessConfiguration` |
| A24 | Operar admisión | ACTIVATE, PAUSE, RESUME, CLOSE con estado actual; motivo obligatorio para contingencias; ACTIVAR/REANUDAR fuera de ventana pide motivo ≥10 caracteres, código y nueva hora límite futura | `adminControlAdmission` |
| A25 | Preparar/sincronizar accesos | Tabla por folio/membresía, derechos FAMILY y NO_DINNER, errores y pendientes; seleccionar contratos y «Preparar» (no liberar automáticamente por preparar) | `adminPrepareAccesses`, `adminListAccessMemberships` |
| A26 | Impresión de pases NO_DINNER | Filtrar/seleccionar contratos con pases sin cena `RELEASED`, elegir `template_id` de impresión, generar job, revisar y descargar PDF privado | `adminCreateNoDinnerPrintJob`, `adminGetNoDinnerPrintJob`, `adminDownloadNoDinnerPrintJob` |
| A27 | Staff de ingreso | Lista alias/estado, crear acceso temporal, mostrar token/enlace una sola vez para entrega controlada, expirar token | `adminListAccessStaff`, `adminCreateAccessStaff`, `adminExpireAccessStaff` |
| A28 | Asistencia | Conteos de reservados, ingresados, pendientes, filtros por folio/mesa/tipo y registro histórico de ingresos sin controles de reversión | `adminGetAccessAttendance` |
| A29 | Estados de contingencia | Falla sync, lease caducado, PAUSED, fuera ventana, 5,001 derechos, token Staff vencido | Estados de A22–A28; no nuevos endpoints |

**A22 — Layout recomendado:** cabecera del evento y etiqueta de estado operativo, acciones `Configurar horario` / `Controlar ingreso`, métrica inline útil (no KPI cards), búsqueda por folio, tabla compacta: `Folio | Familiar | Sin cena | Pendientes | Ingresados | Última sync | Acción`. Seleccionar fila abre panel contextual, NO edita `GroupMember`.

**A24 — Modal de contingencia, variantes:**

- `ACTIVATE` dentro de horario configurado: confirmación y transición según condiciones operativas.
- `PAUSE`: solicitar motivo, confirmar, mostrar «Ingresos suspendidos»; ni el QR ni los Staff se eliminan por pausar.
- `RESUME` dentro de horario: requiere elegibilidad, versiones/lease; el estado visible sólo cambia tras confirmación backend.
- `ACTIVATE/RESUME` fuera de horario: motivo detallado, código y nueva fecha/hora límite `override_ends_at`. Explicar que la prórroga **no cambia la ventana regular** y expira. Guardar `adminDecisionRef` por backend.
- `CLOSE`: confirmación explícita «Cierre definitivo. No podrás reanudar con esta credencial/evento técnico»; no confundir con fin de horario, que no es cierre terminal.
- Una pausa prevalece aunque el horario esté en curso. Una excepción vencida no habilita ingresos fuera de ventana aunque quede lease; si la ventana normal está vigente se aplica su propia regla.

**A25–A26 — Preparación/impresión:** el backend puede sincronizar automáticamente mediante outbox; el botón `Preparar` no significa que el ADMIN sea dueño de los saldos ni que deba hacer doble captura. Un PDF puede quedar `QUEUED → PROCESSING → READY` o `FAILED`; permitir reintento seguro. Sólo imprimir pases sin cena liberados. Nunca exportar QR familiar masivo como si fueran pases individuales.

**A27 — Staff:** máximo 15 tokens activos para `GR_ACCESS`; no ampliar los 3 activos de eventos legacy Monkavia. Token/enlace se muestra **una vez** tras crear, no en GET/listado ni en historial; expirar requiere confirmar. STAFF opera por Monkavia, no inicia sesión con rol GR.

## 6. NUEVO — GRADUATE «Mis accesos» (mobile-first)

| ID | Pantalla | Situación y contenido | Acción |
|---|---|---|---|
| G17 | Mis accesos — estado | Folio, evento y elegibilidad del QR familiar; acceso visible desde `Más` | `graduateGetAccesses` |
| G18 | Mi QR familiar | QR FAMILY grande, legible y compartible por captura; referencia a derechos y entradas restantes, folio/evento | `graduateGetFamilyQr` |
| G19 | Mis accesos — estados no elegibles | `PAYMENT_REQUIRED`, `SEATING_INCOMPLETE`, `SYNC_PENDING`, `SUSPENDED`, `CONSUMED` | Mostrar CTA `Ver pagos`, `Ver mesas` o `Intentar de nuevo` conforme causa; sin QR |
| G20 | Mis accesos — resultado de ingreso | `READY` con derechos restantes tras check-in parcial o `CONSUMED` agotado | Actualizar, no regenerar credencial ni permitir registrar entradas en GR |

Reglas visuales: cuando `familyState=BLOCKED` no entregar SVG, aunque `noDinnerState=RELEASED`. El graduado **no** recibe los PDF NO_DINNER; los imprime ADMIN. Copiar o capturar QR familiar no transfiere propiedad de derechos ni valida identidad por sí mismo; Staff selecciona los derechos pendientes en el scanner. No exigir documento de identidad sin regla aprobada adicional.

**Casos familiares de ejemplo:**

- Titular solo y cero invitados: FAMILY contiene **un derecho**. No inventar cupo extra por mostrar avatar del graduado.
- 6 derechos con cena y 2 NO_DINNER, contrato pagado y 6 mesas ubicadas conforme distribución: FAMILY disponible, 2 pases individuales disponibles para ADMIN.
- Mismo contrato liquidado pero faltan 2 ubicaciones con cena: FAMILY bloqueado (`SEATING_INCOMPLETE`), ambos NO_DINNER liberados e imprimibles por ADMIN.
- FAMILY con 8 derechos, 5 ingresan primero y 3 después: el **mismo QR** sigue representando los 3 derechos restantes.
- Se añade producto/lugar o revierte un pago: recalcular elegibilidad, bloquear pendientes según nueva deuda, mantener consumidos inmutables y sin reentrada.

## 7. NUEVO — Scanner Monkavia (prototipo de superficie separada)

| ID | Pantalla | Interacción y resultado | API privada Monkavia |
|---|---|---|---|
| M00 | Sesión Staff | Pantalla móvil sencilla con alias/evento y token temporal recibido por enlace seguro; error token caducado o evento distinto | StaffToken de Monkavia, no `/auth/login` GR |
| M01 | Cámara/escaneo | Abrir cámara, feedback compacto, linterna si está disponible, fallback conforme plataforma; offline y lease inválido suspenden admisión | `grScannerScan` |
| M02 | QR FAMILY — derechos pendientes | Mostrar lista de derechos no usados `displayName` cuando existe o referencia operativa, `externalTableId` visible, selección 1..N; algunos derechos pueden no tener nombre | `grScannerScan` |
| M03 | Confirmación FAMILY | Resumen `Ingresarán N`, mesa(s), derechos seleccionados; botón «Confirmar ingreso» una vez; si algún derecho ya fue usado, operación entera falla sin consumir demás | `grScannerCheckIn` |
| M04 | Resultado parcial / completo | Mostrar `N ingresados, M restantes`, fecha y posibilidad de nuevo escaneo con mismo QR, sin acción `Revertir ingreso` | `grScannerCheckIn` |
| M05 | QR NO_DINNER | Un solo derecho/pase, confirmar ingreso único; reescaneo → `Ya utilizado`; nunca dar derecho a cena ni exigir mesa | `grScannerScan`, `grScannerCheckIn` |
| M06 | QR inválido o bloqueado | Explicación no sensible: bloqueo financiero, derecho agotado, evento incorrecto, Staff sin autorización o token inválido | Errores/estados GR |
| M07 | Admisión suspendida | Operación `PAUSED`, horario vencido, override vencido, lease caducado, caída de integración | Denegar nuevas entradas; acceso online únicamente |
| M08 | Ingreso concurrente | Dos operadores seleccionan derecho idéntico; sólo uno confirma; el otro recibe conflicto y refresca pendientes | Idempotencia + consumo único |

**No diseñar:** módulo de pagos/contratos para Staff, cuentas de invitados, RSVP, QR por mesa, silla asignada, ingreso offline, reversión de ingreso, botones para editar derechos desde el scanner. El scanner no contiene el listado bancario, nombres completos de terceros en logs ni QR/token crudo en historial.

## 8. Flujos de integración detallados y casos de excepción

### FX-01 — Sincronización y preparación

```text
GR Event + GraduateMembership + ContractLineItems + TableAllocation
 → backend GR genera AccessUnit.id estable para cada derecho comercial
 → guarda referencia por contrato/producto/membresía
 → outbox + HMAC privada a Monkavia
 → Monkavia crea EventBinding y GrAccessRight (BLOCKED por defecto)
 → grPrepareCredentials genera FAMILY y NO_DINNER sin liberar
 → GR consulta estado sincronizado y referencia; UI «Preparado» ≠ «Liberado»
```

Nunca enviar de GR a Monkavia una mesa inexistente o UUID de un derecho regenerado por retry. No usar `GroupMember.id` como identificador del lugar comercial: la identidad de derecho debe ser independiente y estable.

### FX-02 — Liberación por liquidación y mesas (dos scopes)

| 100% neto confirmado GR | Todos los ADULT/CHILD vigentes con mesa | familyState | noDinnerState |
|---|---|---|---|
| No | No o sí | BLOCKED | BLOCKED |
| Sí | No | BLOCKED | RELEASED si hay pases NO_DINNER |
| Sí | Sí | RELEASED | RELEASED si hay pases NO_DINNER |
| Reverso financiero posterior | Cualquiera | BLOCKED para pendientes | BLOCKED para pendientes |

La decisión es **atómica, versionada por membresía y ordenada por revisión del evento**; no son dos acciones manuales que el operador deba recordar. En la UI los estados son independientes y sus causas se muestran sin exponer reglas contables en Monkavia.

### FX-03 — Horario programado y contingencias

```text
Configurar ventana de admisión (separada de Event.status GR)
 → backend registra horario y zona horaria
 → al abrir ventana, autorización operativa sólo si readiness/lease son válidos
 → Staff admite usuarios mientras no haya PAUSE/CLOSE
    ├─ PAUSE: bloquea inmediatamente nuevos ingresos, conserva QR y Staff
    ├─ RESUME: renueva controles, versiones y lease antes de reabrir
    ├─ ACTIVATE/RESUME fuera horario: motivo+referencia+overrideEndsAt futura
    ├─ override vencido: dejar de autorizar FUERA de la ventana regular
    └─ CLOSE: cierre técnico terminal, expira Staff
```

Fin automático de horario **no** equivale a `CLOSE`; el ADMIN puede extender operativamente mediante excepción aprobada. El respaldo financiero del derecho continúa siendo autoridad de GR. Ingresos confirmados nunca se borran por pause/cancel.

### FX-04 — Check-in FAMILY parcial y reintentos

1. Staff presenta la cámara y escanea QR FAMILY.
2. Monkavia verifica firma, evento, Staff, credencial, tipo, estado `RELEASED`, no revocación/no consumo, horario o excepción vigente y lease.
3. Devuelve derechos pendientes (nombre opcional y mesa por derecho) sin consumir.
4. Staff selecciona N derechos reales que ingresan ahora; confirma.
5. Transacción atómica: un derecho → como máximo un `GrAccessEntry`; `N` confirmados, resto pendientes.
6. Mismo QR se puede presentar más tarde para otro subconjunto. Reintentar misma clave no duplica; intento de derecho ya consumido crea conflicto, no reingreso.
7. ADMIN GR ve asistencia agregada con retrasos de sincronización correctamente indicados, sin mover la autoridad de check-in a GR.

### FX-05 — Impresión NO_DINNER

```text
Contrato liquidado → NO_DINNER RELEASED (sin depender de mesas)
 → ADMIN GR → Accesos → Pases sin cena
 → filtrar/seleccionar membresías, elegir plantilla de impresión
 → crear job QUEUED → PROCESSING → READY
 → descargar PDF privado, imprimir y distribuir físicamente
 → Staff escanea cada QR individual → check-in una vez
```

El graduado no obtiene un centro de distribución de estos pases; el PDF no es un recibo de pago ni el QR sin cena concede mesa por sí mismo.

### FX-06 — Fallos/contingencias fail-closed

| Causa | Efecto en acceso/UX |
|---|---|
| Moneda/pago/comprobante sin confirmar | Credenciales pendientes bloqueadas, sin pedir a Monkavia validar el saldo |
| Cambio financiero crítico no sincronizado / outbox pendiente | No renovar autorización de admisión; mostrar incidencia, reintentar seguro |
| Lease sin renovar 30 s / pérdida de comunicación | Scanner deniega nuevas entradas; no modo offline |
| Contrato cancelado | Bloquear pendientes; entradas ya realizadas permanecen en histórico |
| Derecho ya consumido | No segunda entrada; mostrar usado y restantes de forma segura |
| Cambio de mesa de derecho pendiente | Actualizar snapshot sin regenerar QR; consumido mantiene mesa histórica |
| ID/versión de sync no coincide | Error/reconciliación, no duplicar derechos ni liberar acceso obsoleto |
| Más de 5,000 derechos aforo GR_ACCESS | Error de capacidad sin sobreventa ni emisión parcial |
| 16.º Staff activo | Rechazar, conservar 15 activos |
| Q3 (distribución multimesa) | Ninguna aprobación/bloqueo extra hasta autorización CEO |

**Advertencia para maqueta:** el lease de 30 s reduce exposición de fallos entre bases, pero no promete revocación financiera con latencia cero. No escribir «bloqueo inmediato garantizado en todas las puertas» para reversos remotos.

## 9. Estados UI diferenciales del Prototipo 02

| Ámbito | Estados visibles | Operación permitida |
|---|---|---|
| GR comercial | DRAFT/OPEN/CLOSED/FINALIZED/CANCELLED | Igual que Prototipo 01; no mezclar con estado de admisión |
| GR contrato/finance/mesas | Idénticos al 01 | Igual |
| FAMILY | PAYMENT_REQUIRED / SEATING_INCOMPLETE / SYNC_PENDING / READY / CONSUMED / SUSPENDED | Mostrar QR sólo READY / RELEASED efectivo |
| NO_DINNER | BLOCKED / RELEASED / CONSUMED | PDF sólo ADMIN si RELEASED |
| Sync | QUEUED / SYNCED / ERROR | No prometer que acción fue aceptada sin acuse |
| Impresión | QUEUED / PROCESSING / READY / FAILED | Descargar sólo READY |
| Admisión | SCHEDULED / OPEN / PAUSED / CLOSED + override temporal | PAUSE/RESUME manual con guardas; horario normal automático |
| Staff | ACTIVE / EXPIRED | Crear hasta 15 GR_ACCESS, expirar voluntariamente |
| Escaneo | AVAILABLE / NO_PENDING / BLOCKED + error seguro | Confirmar sólo derecho disponible, online |

## 10. Datos de demostración y recorridos click-through

**Escenario común a ambos prototipos:** `Graduación Derecho 2027` y contrato ficticio `GR-00429`, con términos, pagos, titulares y mesas iguales. Debe poder compararse visualmente pantalla con pantalla **sin que Monkavia cambie los números financieros comerciales de GR**.

Recorridos obligatorios de variante integrada:

1. Reproducir íntegramente el flujo del Prototipo 01: crear evento (4 pasos), código/registro, contrato, productos, abono electrónico o comprobante, mesas, platillos, termo, cartera, reportes, cancelación.
2. ADMIN prepara credenciales de contratos sin cambios de `GroupMember`, pero no las libera aún.
3. Titular solo con un derecho FAMILY y sin invitados: caso válido.
4. Contrato con 6 con cena + 2 NO_DINNER, liquidado y todas las mesas completas: FAMILY accesible al graduado, ADMIN imprime 2 individuales.
5. Contrato liquidado con mesas con cena incompletas: FAMILY bloqueado, PDF de los NO_DINNER sigue disponible al ADMIN.
6. Contrato no liquidado: ambos tipos bloqueados sin importar mesas.
7. Mismo QR familiar: primera llegada 5 de 8, segunda 3 de 8; check-in idempotente y exacto.
8. Cambio de mesa de derecho pendiente: QR no cambia; historial consumido inmutable.
9. Horario automático: al iniciar ventana se admite con lease, al finalizar no se admite sin override; no modificar ciclo GR.
10. ADMIN suspende: PAUSE bloquea nuevos ingresos; RESUME requiere elegibilidad y lease.
11. ADMIN reactiva fuera de ventana: motivo detallado + nueva hora límite; caduca y vuelve a bloquear fuera de horario.
12. Fallo red/lease expirado, Staff sin autorización, escaneo duplicado, QR no liberado, 5,001 derechos y 16.º Staff; todos deben dar estado seguro y acción de recuperación.

**No ampliar los datos de demo como requisito de producto.** Los valores se declaran explícitamente como ficticios, sin cobros reales, creación real de credenciales o escritura directa al backend.

## 11. Instrucción final para Stitch (copiar íntegra)

> **Genera un SEGUNDO PROTOTIPO COMPLETO y navegable de Plataforma GR con integración Monkavia.** No generes solo pantallas de QR. Duplica y rediseña **todas** las pantallas comerciales de ADMIN y GRADUATE del Prototipo 01 (G00–G16, A00–A21, con todas sus excepciones), conserva la navegación, las reglas del CEO, `GroupMember` nominal obligatorio, el ledger, contratos y croquis precargado por cantidades. Además crea A22–A29, G17–G20 y M00–M08 de este documento, interconectados. ADMIN GR accede a `Más → Accesos`; GRADUATE a `Más → Mis accesos`; el scanner es superficie independiente de Monkavia. Debe verse el caso de FAMILY bloqueado por mesa y NO_DINNER liberado al estar liquidado, la impresión individual administrativa, la elección de 1..N derechos con un QR familiar, los estados de horario automático, PAUSE/RESUME, la excepción con motivo y fecha límite, fail-closed y asistencia. Diseño visual coherente obsidian/plata/dorado mínimo, Inter y Cormorant ceremonial, responsive y accesible; no tarjetas/KPIs decorativos, no duplicar menús. **NO implementar Q3 multimesa, ni crear tercer rol GR, QR por mesa, invitados con cuenta, RSVP, asientos individuales, escaneo offline o reversión de entradas.** Prototipo visual interactivo, sin representar integración real.

## 12. Criterios de aceptación del Prototipo 02

- [ ] Incluye TODO el flujo comercial de GR equivalente al Prototipo 01, no una extensión fragmentaria.
- [ ] El contraste visual 01/02 demuestra que GR y `GroupMember` permanecen idénticos en reglas y tareas.
- [ ] ADMIN genera PDF/plantilla NO_DINNER y GRADUATE sólo consulta QR FAMILY.
- [ ] FAMILY tiene un derecho incluso para titular solo; check-in parcial funciona con el mismo QR.
- [ ] Pago completo libera NO_DINNER aunque FAMILY esté pendiente por mesa; si no está liquidado ninguno se libera.
- [ ] Horario automático y controles manuales con motivo, override caducable, PAUSE y CLOSE terminal distinguibles.
- [ ] Staff reside en Monkavia; sin login tercer rol GR; límite 15 y capacidad 5,000 visibles donde importan.
- [ ] Privacidad y seguridad: no se expone HMAC, token completo en listas, QR de otros contratos, ni PII ajena.
- [ ] Estados de loading/error/offline/lease/sync/concurrencia e ingresos ya consumidos representados.
- [ ] Q3 multimesa está marcado **pendiente CEO**, nunca como permiso/validación aprobada.
