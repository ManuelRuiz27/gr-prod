# Dos prototipos de interfaz para una plataforma de graduaciones

**Instrucción al diseñador:** crear dos prototipos navegables independientes. En ambos, el usuario debe poder recorrer una graduación real, no sólo ver un conjunto de pantallas sueltas. Diseñar desde el punto de vista de las personas que participan.

## Prototipo 1 — Plataforma GR

**Actores:** administrador de GR y graduado titular. Los integrantes del grupo son personas registradas dentro del contrato del graduado y no necesitan cuenta propia.

**Recorrido del administrador:** Iniciar sesión → Inicio operativo → Lista de graduaciones → Crear graduación en cuatro pasos (Datos, Boletos y precios, Plan de pagos, Operación) → Configuración → Elegir croquis precargado → Abrir evento → Consultar graduados y expedientes → Revisar cartera → Registrar pagos → Aprobar o rechazar comprobantes → Supervisar mesas → Revisar platillos → Gestionar termo → Cancelar contratos con cotización → Reportes y cortes → Cerrar/finalizar graduación.

**Recorrido del graduado:** Introducir código de graduación → Registrarse o iniciar sesión → Elegir evento si participa en varios → Leer y aceptar contrato → Inicio con siguiente tarea pendiente → Mi grupo (registrar integrantes con nombre obligatorio) → Agregar boletos con cotización → Mis pagos (abonar o enviar comprobante) → Mesa (distribuir cantidades sobre croquis y después asociar nombres registrados) → Platillos por integrante → Mi termo según progreso de pago → Consultar contrato y estado hasta cierre.

**Pantallas esenciales:** accesos/login, registro, inicio del graduado, contrato, grupo, registrar integrante, comprar lugares, pagos, abonar, evidencia de transferencia, mapa y selección por cantidad, asociación nominal, platillos, termo; para administrador, inicio, lista de graduaciones, asistente de alta, configuración, política de cancelación, croquis, expediente, cartera, abono manual, revisión de comprobantes, movimientos, ajustes/reembolsos, termos, reportes, auditoría y cierre.

**Estados a visualizar:** campos incompletos, contrato por aceptar o aceptado, cupo agotado, saldo pendiente, comprobante en revisión o rechazado, pago confirmado, mesa bloqueada por regla financiera, cupo cambiado por concurrencia, plazo vencido, termo bloqueado/disponible/en producción/entregado, cancelación y solo lectura.

**Importante:** no hay QR ni escaneo en esta variante. Las mesas son un croquis seleccionado de plantillas existentes; la ubicación se realiza por cantidad de lugares, sin elegir sillas ni crear personas anónimas dentro del grupo.

## Prototipo 2 — Plataforma GR con Monkavia

**Actores:** administrador GR, graduado titular, invitados con cena, invitados sin cena y personal de puerta de Monkavia.

**Recorrido comercial:** conservar **todo** el recorrido del Prototipo 1: creación de graduación, contratos, compras, integrantes, pagos, mesas, platillos, termos, administración, cancelaciones, reportes y cierre. No omitir pantallas de GR al diseñar esta segunda aplicación.

**Recorrido de accesos del administrador:** Evento → Accesos → Consultar contratos y elegibilidad → Preparar pases → Configurar horario de recepción → Imprimir los pases individuales sin cena → Crear accesos temporales para personal de puerta → Activar/pausar/reanudar admisión → Consultar asistencia → Cerrar recepción.

**Recorrido de accesos del graduado:** Inicio → Más → Mis accesos → Ver causa de bloqueo si no ha liquidado o faltan mesas → Mostrar **un QR familiar** cuando cumpla requisitos → Compartir captura con invitados con cena → Consultar cuántos ingresaron y cuántos faltan. No recibe la plantilla de pases sin cena.

**Recorrido de invitados y personal de puerta:** el invitado con cena llega con captura del QR familiar, o el invitado sin cena llega con pase individual que entregó ADMIN. El personal abre Monkavia mediante acceso temporal, escanea y visualiza los derechos disponibles. Si es QR familiar selecciona los que ingresan ahora; confirma sin consumir a los ausentes. Si es sin cena registra un único ingreso y bloquea un segundo uso del mismo pase.

**Pantallas adicionales a diseñar:** resumen de Accesos, preparación y elegibilidad por contrato, Mis accesos del graduado, QR familiar, impresiones sin cena, horario, operación de recepción, pausa, apertura excepcional con motivo y nueva hora límite, cierre definitivo, personal de puerta, inicio del scanner, cámara QR, selección familiar, confirmación de ingresos parciales, pase individual, estados de rechazo, asistencia y seguimiento.

**Reglas que deben verse en el diseño:** los dos tipos de pase exigen contrato liquidado; el familiar requiere que todos los derechos con cena tengan mesa; los pases sin cena se pueden liberar aunque falten mesas con cena. Los invitados no crean cuentas en GR. El QR familiar es único por contrato y puede usarse en varias llegadas. El personal de puerta no es usuario administrador GR. La recepción puede funcionar por horario o con una excepción autorizada y caducable; PAUSAR no es CERRAR. Sin conexión válida no se registran ingresos.

## Estilo común y calidad de entrega

Diseñar administrador principalmente para escritorio y graduado para teléfono. Priorizar tablas operativas y formularios legibles, no mosaicos de tarjetas. Mantener identidad negra/obsidiana con plata y dorado discreto. Preparar navegación completa, botones que lleven a la siguiente pantalla y estados de éxito, error, bloqueo y carga. Los datos del prototipo son ficticios pero consistentes a lo largo de todo el recorrido.

**Resultado esperado:** dos experiencias completas, cada una comprensible sin materiales externos, y claramente diferenciadas por la presencia o ausencia de la recepción física de invitados.
