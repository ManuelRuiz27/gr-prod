# Prototipo 1 — Plataforma GR sin control de acceso

**Diseñar todas las pantallas y escenas descritas a continuación.** El resultado debe ser una aplicación navegable para administrador y graduado, desde la creación de la graduación hasta el cierre comercial. No agregar funciones de QR ni escaneo.

# Propuesta de interfaz: Plataforma GR — Graduación completa

**Objetivo de diseño:** construir una aplicación completa, clara y navegable que permita organizar una graduación desde la creación del evento hasta la operación posterior. Las pantallas deben mostrar acciones reales, el antes y después de cada decisión y cómo se relacionan los usuarios que intervienen.

## Actores

**Administrador de GR.** Organiza graduaciones, establece reglas comerciales, revisa contratos, valida pagos, gestiona mesas, platillos y termos, atiende incidencias y genera reportes. Puede operar todos los eventos autorizados.

**Graduado titular.** Tiene una cuenta y un contrato propio por graduación. Consulta y acepta su contrato, contrata lugares, registra integrantes de su grupo, abona, distribuye mesas, selecciona platillos y solicita termo cuando corresponde. Puede participar en más de una graduación, sin mezclar contratos.

**Integrantes o invitados.** Pertenecen al grupo de un graduado; no necesitan una cuenta propia de GR. Al registrar una persona en el grupo, su nombre es obligatorio. Un lugar comprado aún sin nombre permanece como **lugar disponible**, no como invitado registrado.

**Regla de este diseño:** no hay módulo de pases QR ni check-in. El flujo termina en la operación comercial, logística y cierre de la graduación.

## Navegación general

**Administrador — escritorio prioritario:** Inicio · Eventos · Reportes. Al abrir un evento: Resumen · Graduados · Pagos · Mesas · Platillos · Termos · Más (Configuración, Política de cancelación, Reportes del evento e Historial).

**Graduado — teléfono prioritario:** Inicio · Mi grupo · Pagos · Más. Dentro de «Más»: Mi contrato, Mesa, Platillos, Termo, Contacto y Cerrar sesión. Si el usuario pertenece a varias graduaciones, puede seleccionar la actual. El navegador no debe mezclar información entre ellas.

**Estética y composición:** negro/obsidiana, plata para jerarquía y dorado sólo como acento; tipografía legible, espacios amplios donde ayuden y tablas compactas cuando haya volumen. No hacer un panel de seis tarjetas por cada pantalla. Cada acción relevante tiene una respuesta clara; los datos sensibles o secundarios aparecen en detalle o panel lateral. Adaptar administrador a tablet y móvil, y graduado también a escritorio.

---

## Flujo 1. El administrador crea la graduación

**Entrada:** la persona administradora inicia sesión y abre **Inicio**.

### Pantalla 1. Inicio de administración
Se ve una búsqueda central «Buscar graduado, folio o escuela», una lista breve de graduaciones y tareas que necesitan atención: pagos vencidos, comprobantes por revisar y fechas relevantes. Acciones principales: «Crear graduación», «Abrir evento», «Registrar abono» y «Revisar comprobantes». Buscar un folio abre directamente el expediente del graduado dentro del evento correspondiente. Si no hay graduaciones, se muestra una invitación sencilla para crear la primera.

### Pantalla 2. Mis graduaciones
Tabla con nombre de evento, escuela, carrera/generación cuando aplique, fecha, sede, estado y señal de cobranza. Permite buscar, ordenar y abrir la graduación elegida. «Nueva graduación» abre el asistente. Un evento en preparación muestra «Borrador»; no aparece como abierto para registros.

### Pantalla 3. Nueva graduación: datos
Primer paso de un asistente de cuatro etapas. Formulario de nombre, escuela/institución, carrera, generación, fecha, sede/salón, capacidad y zona horaria. Acciones: «Siguiente» y «Guardar borrador». Los campos obligatorios faltantes se señalan junto al campo; los datos introducidos se conservan al volver.

### Pantalla 4. Nueva graduación: boletos y precios
Segundo paso. Filas editables con tipos de lugar disponibles (por ejemplo, Adulto, Niño, Sin cena), etiqueta comercial, precio y cantidad/capacidad según configuración. Mostrar un resumen discreto del aforo. No convertir ejemplos de precios en reglas fijas. Acción: «Continuar» o «Volver».

### Pantalla 5. Nueva graduación: plan de pagos
Tercer paso. Capturar pago inicial, calendario de abonos, fecha e importe de cada parcialidad; las cantidades pueden ser distintas. Mostrar una vista previa comprensible de obligaciones y condiciones. Incluir ajustes de gracia y vencimientos cuando corresponda. No forzar un pago exactamente igual al importe de una mensualidad.

### Pantalla 6. Nueva graduación: operación y confirmación
Cuarto paso. Configurar fechas límite para contratación, mesas y platillos, liquidación, reglas de mora/cancelación, opciones de platillo y condiciones del termo. Antes de guardar, mostrar un resumen de configuración con «Editar sección» y «Crear graduación». **Resultado:** el evento queda en borrador y abre su pantalla de resumen; no se publica automáticamente.

### Pantalla 7. Configuración general de la graduación
Formulario continuo, organizado por subtítulos: datos del evento, productos y precios, pagos, fechas límite, platillos, termo y políticas. El administrador puede revisar o cambiar únicamente lo permitido. Antes de guardar cambios que sólo afectan futuras contrataciones, explicar su alcance sin alterar contratos previamente aceptados.

### Pantalla 8. Política de cancelación
Tabla de rangos de días anteriores al evento y porcentaje de penalización. Acciones: añadir rango, editar, revisar y publicar. Mostrar errores si existen periodos sin cobertura o periodos superpuestos. Al publicar, la política queda aplicada a los contratos futuros según las reglas del evento; el historial anterior se mantiene.

### Pantalla 9. Elegir croquis del salón
Galería/lista de **plantillas de croquis ya disponibles**, cada una con nombre y vista previa. El administrador abre una plantilla, inspecciona las mesas y su capacidad y la asocia a la graduación. No se ofrece subir planos, dibujar mesas, reconocimiento de imágenes ni numeración de sillas. La selección confirmada se muestra en la pantalla de Mesas.

### Pantalla 10. Resumen del evento y apertura
Cabecera con nombre, fecha, sede y estado «Borrador». Debajo, cobranza resumida y asuntos que necesitan atención. Menú de operación: «Abrir inscripciones», «Cerrar temporalmente», «Reabrir», «Finalizar» o «Cancelar», sólo cuando el estado y las reglas lo permitan. Para abrir, mostrar confirmación y advertir campos pendientes. **Resultado:** pasa a «Abierto» y los graduados ya pueden registrarse.

**Salida del flujo:** graduación abierta, catálogo comercial configurado y croquis asociado.

---

## Flujo 2. El graduado se registra y acepta su contrato

### Pantalla 11. Acceso a mi graduación
Portada sencilla donde el graduado introduce el código de acceso entregado para su evento. Tras validarlo se muestra el nombre de la graduación y dos caminos: «Registrarme» o «Ya tengo cuenta». Un código inválido, caducado o revocado produce un mensaje y opción de reintento; no se muestran otras graduaciones privadas.

### Pantalla 12. Registro
Formulario con los datos de identidad/contacto y contraseña admitidos para el graduado, junto al contexto de su evento. No hay selector de rol ni de graduación arbitraria. Al enviar con éxito, se crea su vinculación con la graduación y se abre el contrato para lectura. Si ya existe la cuenta, ofrecer inicio de sesión.

### Pantalla 13. Inicio de sesión y recuperar contraseña
Login con correo y contraseña; acceso al proceso de recuperación con mensaje de confirmación seguro. Al entrar, si tiene varias graduaciones, aparece la pantalla de selección; si tiene una, entra directamente en ella.

### Pantalla 14. Elegir graduación
Lista de las graduaciones en las que participa el usuario, con fecha y estado. Seleccionar una cambia el contexto completo: contrato, grupo, pagos, mesas y termo. No mezclar saldos o integrantes de distintos eventos.

### Pantalla 15. Mi contrato
Se presenta como **documento**, no como dashboard: folio, titular, datos de graduación, conceptos contratados, cantidades, importes, condiciones y términos. Al final, casilla «He leído y acepto» y botón «Aceptar contrato». Sin la casilla no se habilita la confirmación. Después, el estado cambia a «Contrato aceptado», con posibilidad de consultarlo de nuevo sin volver a aceptarlo. Si cambian los términos antes de confirmar, la persona debe revisar la nueva versión.

### Pantalla 16. Inicio del graduado
Encabezado breve con el nombre de la graduación y **una siguiente acción útil**: completar integrantes, pagar el próximo abono, seleccionar mesa o elegir platillos. Mostrar saldo/vencimiento relevante y alertas de plazo sin repetir el mismo dato en tarjetas. Todas las acciones dirigen a su pantalla correspondiente.

**Salida del flujo:** el graduado tiene cuenta, membresía propia, folio y contrato aceptado.

---

## Flujo 3. El graduado contrata lugares y administra su grupo

### Pantalla 17. Mi grupo
Lista de personas registradas. El graduado titular aparece como integrante principal. Cada renglón muestra nombre y tipo cuando corresponda. Arriba: «4 de 6 lugares registrados», por ejemplo. Las cantidades ya compradas que todavía no tengan persona asociada se muestran como «Lugar disponible», con acción «Registrar persona». Al abrirla se pide **nombre obligatorio** y los demás datos permitidos. El administrador no sustituye ese requisito ni la interfaz crea personas ficticias.

### Pantalla 18. Registrar o editar persona
Formulario sencillo que se abre desde «Mi grupo»: nombre obligatorio, tipo/categoría aplicable y campos permitidos. Guardar actualiza la lista. Si ya están registrados tantos integrantes como lugares vigentes, impedir una persona adicional e indicar cómo contratar más lugares.

### Pantalla 19. Agregar boleto
Desde «Mi grupo», botón «Agregar boleto». Hoja inferior en móvil o panel contextual en escritorio con productos, precios, cantidades, total nuevo y abono adicional exigible cuando aplique. Paso 1: elegir producto y cantidad. Paso 2: **Revisar cotización**. Paso 3: «Confirmar compra». Si el aforo se agotó, venció el plazo o la cotización dejó de ser válida, mostrar el motivo sin registrar la compra. El graduado no dispone de eliminación libre de lugares cuando la reducción exige intervención administrativa.

### Pantalla 20. Graduados del evento — ADMIN
Tabla por folio, nombre, número de personas, total contratado, abonado, saldo, mesa y alerta. Buscador por folio, nombre o teléfono; filtros para saldo vencido, comprobante pendiente y grupo sin mesa. Seleccionar una persona abre su expediente.

### Pantalla 21. Expediente del graduado — ADMIN
Vista de una página: nombre/folio/contacto, abonado y pendiente, próximo vencimiento, integrantes, lugares contratados, distribución de mesas, platillos, termo y contrato. Principal acción «Registrar abono». En menú secundario: editar campos permitidos, atender mesa, modificar platillo, reducir lugares conforme regla, cancelar contrato y consultar historial. No dividir la información en nueve pestañas.

**Salida del flujo:** cantidad de lugares y personas registradas son conceptos diferentes; todas las personas creadas tienen nombre, pero puede haber lugares comprados todavía sin nombre.

---

## Flujo 4. El graduado paga y el administrador valida

### Pantalla 22. Mis pagos — GRADUATE
Mostrar de inmediato cuánto ha abonado, cuánto resta, próximo mínimo, fecha exigible, calendario de parcialidades e historial de movimientos. Acción principal «Abonar». Si hay atraso, advertencia contextual de mora o penalización aplicable. Un comprobante enviado y aún no aprobado no se muestra como dinero recibido.

### Pantalla 23. Elegir monto y método de pago
Primero el importe a abonar, mínimo actual y saldo pendiente. Después elegir Mercado Pago o OpenPay si están habilitados, o la opción de reportar transferencia/depósito. Confirmación del importe antes de salir. Si el usuario regresa de la pasarela, mostrar «Confirmando pago» hasta tener la confirmación real; variantes visible de éxito, pendiente y fallido. No capturar tarjeta completa dentro de GR.

### Pantalla 24. Reportar transferencia o depósito
Formulario: monto, fecha, referencia y comprobante (archivo o imagen) con vista previa. Botón «Enviar para revisión». Después aparece «Comprobante en revisión» y su detalle; el saldo aún no cambia. Una vez revisado por ADMIN, pasa a «Aprobado» o «Rechazado», mostrando motivo cuando corresponda.

### Pantalla 25. Cartera — ADMIN
Tabla compacta de folio, graduado, abonado, saldo, mínimo actual, próximo vencimiento y estado. Filtros por mora, vencimiento y búsqueda. Botón «Registrar abono», sin panel de gráficas que oculte las operaciones.

### Pantalla 26. Registrar abono — ADMIN
Identificación del contrato, saldo y mínimo exigible. Campo **monto recibido editable**, método Efectivo/Transferencia/Depósito, fecha, referencia/comprobante cuando aplique y persona que recibió efectivo cuando corresponda. Confirmar crea un movimiento; no obliga a elegir una mensualidad exacta y no edita abonos anteriores.

### Pantalla 27. Comprobantes por revisar — ADMIN
Bandeja cuyo estado inicial es «Pendientes». Lista de graduados/folios con monto y fecha. Al seleccionar uno, se abre el comprobante en visor amplio con datos y acciones «Aprobar» y «Rechazar». Aprobar cambia el saldo únicamente una vez; rechazar exige motivo. Ambos resultados se reflejan en «Mis pagos» del graduado.

### Pantalla 28. Movimientos y correcciones — ADMIN
Lista de cobros confirmados y su detalle, con fecha, importe, método, referencia y origen. Desde una acción contextual se registra ajuste o reembolso como **operación independiente**, con motivo y estado propio. No presentar opción «Editar pago confirmado» o «Borrar pago».

**Salida del flujo:** pagos reales aplicados modifican deuda; transferencias reportadas y retornos de pasarela no bastan para marcar liquidado. Mesa y termo se desbloquean con sus condiciones financieras propias.

---

## Flujo 5. Distribuir lugares entre mesas

### Pantalla 29. Mi mesa — GRADUATE
Si aún no cumple la condición financiera de mesa, mostrar el motivo y «Ver mis pagos»; se puede visualizar el salón en modo lectura cuando corresponda. Si es elegible, el croquis precargado ocupa la mayor parte de la pantalla, con zoom y desplazamiento. Arriba un resumen pequeño: «6 lugares confirmados; 3 ubicados; 3 sin ubicar».

### Pantalla 30. Seleccionar mesa y cantidad
El graduado toca una mesa del croquis y abre una hoja inferior/panel con nombre o número, lugares disponibles y selector de **cantidad de lugares** a ubicar. Antes de guardar ve el resumen de distribución, incluso si su grupo ocupa más de una mesa. Al confirmar, la disponibilidad se actualiza. Si otra persona ocupó los últimos lugares entre consulta y confirmación, informar «El cupo cambió» y pedir una nueva elección, sin sobrecupo ni pérdida silenciosa de la distribución previa.

### Pantalla 31. Relacionar integrantes con sus mesas
En el detalle de una cantidad ya ubicada, se muestran los nombres **registrados** del grupo disponibles para asociarse. El graduado selecciona quién quedará identificado en esa mesa. Una persona no puede quedar en dos mesas activas. Asociar un nombre **no suma otro lugar**; los lugares previamente distribuidos pueden existir sin nombre hasta que el graduado registre a la persona. Los invitados sin cena no necesitan mesa.

### Pantalla 32. Mesas — ADMIN
Vista del croquis del evento a gran escala y un inspector con la mesa seleccionada, cupo, lugares ocupados y libres; búsqueda por mesa o contrato. El administrador puede hacer correcciones permitidas y bloquear mesas sin borrar ocupación anterior. Opción útil para destacar ubicaciones de niños cuando existan nombres vinculados. No hay dibujo de mesas, subida de plano, sillas individuales ni aprobación especial obligatoria por repartir cantidades entre varias mesas.

**Salida del flujo:** todos los lugares asignados se reflejan por cantidades; su ocupación no se cuenta dos veces al registrar nombres.

---

## Flujo 6. Elegir platillos

### Pantalla 33. Mis platillos — GRADUATE
Lista de integrantes elegibles, cada uno con opciones de menú disponibles: normal, vegetariano, vegano u otras definidas para esa graduación. La selección es por persona, no por contrato completo. Botón «Guardar cambios» y aviso visible del último día de modificación. Después del plazo, mostrar las selecciones en lectura e indicar que las correcciones requieren contacto con ADMIN.

### Pantalla 34. Platillos — ADMIN
Tabla de personas/folio/tipo/platillo/mesa con filtros «Todos», «Especiales» y «Pendientes», más totales compactos por opción. ADMIN puede corregir selecciones después del plazo cuando su autorización lo permita, con motivo. No ocultar la tarea principal tras métricas decorativas.

**Salida del flujo:** se conoce qué comida corresponde a cada integrante registrado que tenga derecho a ella y cuáles casos requieren atención.

---

## Flujo 7. Solicitar, producir y entregar termo

### Pantalla 35. Mi termo — GRADUATE
Tres representaciones de una misma pantalla: **Bloqueado** (muestra el avance financiero necesario y «Ver pagos»), **Disponible** (captura de personalización autorizada y botón «Solicitar termo») y **Solicitado/en producción/entregado** (estado, personalización y fecha/información disponible). En producción ya no se permiten cambios en grabado. La condición para termo no debe confundirse con la condición de mesas.

### Pantalla 36. Termos — ADMIN
Tabla de folio, nombre, mesa, grabado, estado y entrega. Filtros para «Pendientes», «Producción», «Entregados». Al abrir un renglón puede realizar transiciones válidas a producción o entrega, registrar evidencia/conformidad si corresponde e imprimir la **lista de entrega** con mesa, folio, nombre, personalización y espacio para firma.

**Salida del flujo:** la graduación conoce solicitudes, producción y entregas sin simular un módulo externo de fabricación.

---

## Flujo 8. Atender incidencias, cancelar y consultar reportes

### Pantalla 37. Cancelar contrato — ADMIN
Se abre desde expediente. Antes de confirmar, mostrar una cotización: total contratado, monto pagado, rango/porcentaje de penalización vigente, retención, importe estimado de devolución y posible saldo. Solicitar motivo. «Confirmar cancelación» inactiva la membresía según las reglas; **no realiza automáticamente un reembolso**. Si hay devolución, abrir un flujo separado con forma, importe y estado. El graduado ve el contrato/membresía como inactivo y no puede seguir comprando lugares o cambiando mesas.

### Pantalla 38. Reportes y cortes — ADMIN
Filtros de graduación, escuela, fecha/periodo, método de pago y tipo de reporte; tabla de movimientos con total del periodo. Acciones «Exportar Excel» y CSV; resumen PDF cuando aplique. Vista de operación con cantidades por mesa, platillos, termos y saldos. Mostrar estado de preparación del archivo cuando sea necesario.

### Pantalla 39. Historial y cuentas — ADMIN
Pantalla secundaria de actividad: actor, fecha, operación, entidad y motivo de cada cambio relevante, sin opción de borrar. También existe una vista secundaria para crear, consultar y deshabilitar cuentas ADMIN con los **mismos permisos**, sin inventar jerarquías de administración. Las notas internas son exclusivas de ADMIN y no ocupan una pestaña principal.

### Pantalla 40. Cierre comercial
El administrador entra en el resumen de graduación y, desde su menú de estado, elige cerrar operaciones ordinarias, reabrir si corresponde, finalizar o cancelar el evento. Cada acción muestra confirmación y consecuencias. El graduado conserva consulta de la información autorizada, pero ve bloqueadas las operaciones que ya no proceden. No borrar contratos ni movimientos por terminar la graduación.

---

## Escenas entre actores que deben funcionar al hacer clic

1. **Transferencia:** graduado envía comprobante → ve «En revisión» → ADMIN lo aprueba → graduado ve saldo actualizado → si cumple el umbral correspondiente puede elegir mesa.
2. **Última mesa:** dos graduados ven un lugar libre → uno confirma → el segundo recibe «Cupo actualizado» y debe elegir otra mesa.
3. **Compra adicional:** graduado cotiza dos lugares nuevos → confirma → se actualizan lugares disponibles en Mi grupo, obligaciones en Pagos y cantidades que puede distribuir en Mesas; no aparecen invitados con nombres inventados.
4. **Termo:** graduado alcanza umbral → personaliza y solicita → ADMIN pasa a producción → ADMIN confirma entrega → graduado ve «Entregado».
5. **Cancelación:** ADMIN calcula retención y confirma → desaparece la capacidad activa cuando corresponde, se conserva el historial de pagos y un eventual reembolso se registra por separado.

## Estados y detalles a diseñar

En todas las pantallas donde corresponda, incluir: cargando; sin datos; validación en campos; éxito confirmado; operación pendiente; cupo agotado; fecha límite vencida; error de red; sesión caducada; falta de permisos; estado de solo lectura; conflicto porque otra persona cambió los datos.

Los botones principales deben funcionar en el prototipo y llevar a la siguiente escena; cuando una acción pide confirmación debe aparecer el diálogo y su resultado. Usar datos ficticios coherentes en todo el recorrido (mismo evento, folio, familia, saldo y mesas).

**No incluir** en esta versión: QR, check-in, panel de puertas, cuentas de invitados, personal de escaneo, selección de sillas, editor de planos, notificaciones por WhatsApp obligatorias o módulos financieros que permitan cambiar pagos confirmados.
