> **SUPERADO PARA EL HANDOFF DE STITCH (2026-11-16):** este brief sólo cubría la extensión de accesos. El encargo vigente es **rehacer TODA la interfaz en DOS prototipos completos**: [STITCH_PROTOTIPO_01_GR_BASE.md](STITCH_PROTOTIPO_01_GR_BASE.md) y [STITCH_PROTOTIPO_02_GR_MONKAVIA.md](STITCH_PROTOTIPO_02_GR_MONKAVIA.md), coordinados por [STITCH_DOS_PROTOTIPOS_README.md](STITCH_DOS_PROTOTIPOS_README.md). Conservar este archivo únicamente como antecedente técnico. No utilizarlo para limitar el Prototipo 02 a nuevas pantallas.

# GR ↔ Monkavia — Brief de maquetación para Stitch

**Estado:** propuesta de UX para revisión, no prototipo publicado. **Ámbito:** únicamente la extensión de accesos. **No modifica el flujo GR, `GroupMember`, pagos, productos, croquis ni roles.**
**OpenAPI:** `docs/GR_ACCESS_INTEGRATION.openapi.yaml` (15 operaciones nuevas). Monkavia: `invitacionespremium@monkavia-gr/docs/04-tecnico/GR_PRIVATE_API.openapi.yaml` v2 (18 operaciones privadas).
**Decisiones aprobadas:** Q1=C (horario automático + contingencia), contingencia B (ACTIVATE/PAUSE/RESUME fuera de horario con motivo y nueva hora límite), Q2=A (FAMILY requiere mesas completas), independencia NO_DINNER al liquidar, 5,000 derechos/evento. **Q3 multimesa: pendiente de autorización del CEO; no agregar bloqueo ni pantalla de aprobación.**

## 1. Reglas de conservación

1. El flujo actual de GR se mantiene: crear graduación → contratar lugares → pagar → asignar mesas → emitir accesos (extensión) → check-in en Monkavia. Los primeros cuatro pasos y sus pantallas preexistentes no se rediseñan.
2. Roles de GR existentes: `ADMIN` y `GRADUATE`. El personal Staff se administra/escanea desde integración Monkavia, no como nuevo rol GR.
3. `GroupMember.full_name` permanece obligatorio; ningún formulario nuevo reemplaza ni duplica integrantes de GR.
4. Una membresía/contrato corresponde a un graduado principal. FAMILY: un QR por membresía, incluye al titular, admite entradas parciales. NO_DINNER: un QR individual por derecho, impreso y distribuido por ADMIN GR; GRADUATE no obtiene esos PDF.
5. El QR contiene una credencial vinculada a derechos en Monkavia; no embebe ni expone listado nominal íntegro. No regenerar QR familiar por cambios de mesa/nombre pendientes.
6. Pago neto 100% confirmado por backend GR es condición de ambos scopes. FAMILY requiere además que todos los derechos con cena tengan mesa asignada. NO_DINNER no depende de mesas.
7. Q3 multimesa no genera solicitudes, badges de aprobación ni bloqueos hasta recibir decisión del CEO.

## 2. Ubicación dentro de navegación GR existente

- **ADMIN (desktop-first)**: en un evento, `Más ▾ → Accesos` para no agregar otra pestaña global ni rehacer el shell. Integrar con contexto visible del evento; tablas/listas para operaciones masivas.
- **GRADUATE (mobile-first)**: navegación existente `Inicio | Mi grupo | Pagos | Más`; agregar `Mis accesos` dentro de `Más`, sin una quinta pestaña.
- **Staff**: adaptaciones dentro del scanner de Monkavia. No hay pantalla de escaneo nueva en GR.

Referencias visuales: `docs/UI_DESIGN_SYSTEM.md`, `docs/GRADUATE_UX_SIMPLIFICATION_AUDIT.md`, `docs/ADMIN_UX_SIMPLIFICATION_AUDIT.md`. Identidad obsidian/plata, dorado restringido, Inter y Cormorant Garamond sólo para encabezados ceremoniales; sin KPI cards ni navegación en mosaicos.

## 3. Pantallas a maquetar

| ID | Actor y superficie | Elementos y acción principal | OpenAPI GR |
|---|---|---|---|
| A01 | ADMIN · Accesos / resumen | Estado de operación, horario, sincronización, aforo 0–5,000, derechos preparados/liberados/consumidos y avisos en tabla. Acción contextual: Configurar | `adminGetAdmissionStatus`, `adminListAccessMemberships` |
| A02 | ADMIN · Configuración | Ventana de inicio/fin, zona horaria del evento en lectura, información de elegibilidad; guardar sin modificar fecha/estado comercial de GR | `adminGetAccessConfiguration`, `adminUpdateAccessConfiguration` |
| A03 | ADMIN · Operar admisión | ACTIVATE, PAUSE, RESUME, CLOSE; confirmación auditable. ACTIVATE/RESUME fuera de ventana exige motivo y nueva fecha/hora límite; PAUSE bloquea nuevos check-in pero mantiene QR/Staff; CLOSE terminal y advertencia explícita | `adminControlAdmission` |
| A04 | ADMIN · Solicitar/preparar accesos | Tabla contratos y tipos: con cena / sin cena, pendientes de sincronización, mesajes de error; acción Preparar; sin permitir editar `GroupMember` aquí | `adminPrepareAccesses`, `adminListAccessMemberships` |
| A05 | ADMIN · Impresión sin cena | Selección filtrada de contratos/derechos sin cena, plantilla de impresión, generación/consulta/descarga privada de PDF; sólo credenciales liberadas | `adminCreateNoDinnerPrintJob`, `adminGetNoDinnerPrintJob`, `adminDownloadNoDinnerPrintJob` |
| A06 | ADMIN · Personal de acceso | Lista de Staff, emisión de acceso temporal con entrega controlada del token, expiración; máximo 15 simultáneos | `adminListAccessStaff`, `adminCreateAccessStaff`, `adminExpireAccessStaff` |
| A07 | ADMIN · Asistencia | Contador y tabla por contrato/mesa/derecho, ingresos parciales, uso único, estados de operación; sin PII ajena en scanner | `adminGetAccessAttendance` |
| G01 | GRADUATE · Mis accesos bloqueados | Estado y motivo específico: pago pendiente, mesa con cena pendiente o sincronización. No mostrar QR anticipado | `graduateGetAccesses` |
| G02 | GRADUATE · Mi QR familiar | QR grande, folio/evento, accesos familiares totales/utilizados/restantes, referencia de mesas propias cuando disponible, instrucción de compartir captura. Un mismo QR para entradas parciales; no QR sin cena | `graduateGetAccesses`, `graduateGetFamilyQr` |
| M01 | Monkavia · Scanner FAMILY | Scan → derechos pendientes en lista agrupada por mesa cuando aplique → selección de 1..N pendientes → confirmar ingreso atómico. Estados bloqueado/usado/sin conexión/pausado | `grScannerScan`, `grScannerCheckIn` (Monkavia) |
| M02 | Monkavia · Scanner NO_DINNER | Scan individual → verificar derecho pendiente → confirmar una vez → mostrar ingresado/no utilizable; no indicar lugar de cena | `grScannerScan`, `grScannerCheckIn` (Monkavia) |

## 4. Casos de prueba de UX obligatorios

1. Titular solo, sin invitados: existe un derecho FAMILY.
2. Contrato liquidado con 6 derechos con cena en varias mesas: sólo mostrar disponibilidad de QR conforme al requisito de mesa completa; no crear aprobación Q3.
3. Contrato liquidado con FAMILY pendiente de mesa y 2 NO_DINNER: FAMILY bloqueado, ADMIN puede imprimir 2 NO_DINNER.
4. FAMILY con 8 derechos: primero ingresan 5, después 3; el mismo QR y sin duplicación.
5. Horario programado vigente: operación automática cuando el backend cumple requisitos; UI no cambia `Event.status`.
6. Pausa durante horario activo: nuevos ingresos bloqueados inmediatamente, sin borrar registros ni invalidar permanentemente Staff.
7. Apertura fuera de horario: formulario exige motivo y nueva hora límite futura; mostrar límite y confirmación con actor.
8. Vence excepción manual fuera de la ventana regular: no admite nuevos ingresos aun con lease vigente. Si la ventana regular sigue vigente, conserva autorización ordinaria.
9. Sin conexión, lease de 30 s caducado o outbox crítico pendiente: error/fail-closed sin prometer ingreso.
10. Aforo de 5,000 aceptado por contrato; el derecho 5,001 debe producir bloqueo de sincronización y mensaje accionable, nunca sobreventa.

## 5. Prompt listo para Stitch

> Diseña sólo la extensión **Accesos** de una plataforma mexicana de graduaciones existente llamada Plataforma GR, integrada a un motor externo Monkavia. No rediseñes el producto ni las pantallas de contratos, pagos o mesas. Crea las 11 pantallas/estados especificados en este documento: A01–A07 (ADMIN desktop-first), G01–G02 (GRADUATE mobile-first) y M01–M02 (scanner Monkavia). Mantén navegación ADMIN en evento «Más → Accesos» y GRADUATE «Más → Mis accesos». Jerarquía por tipografía/espacios, listas/tablas para operaciones, sin mosaicos de cards ni KPIs decorativos. Identidad negro obsidian, plata, acento dorado restringido, Inter y Cormorant Garamond sólo en encabezados ceremoniales. Respeta exactamente los estados de QR: FAMILY sólo después de liquidar y asignar mesa a todos los derechos con cena; NO_DINNER imprimible sólo por ADMIN al liquidar e independiente de mesas. Un QR familiar por contrato; admite entradas parciales. Staff escanea únicamente en Monkavia. Permite ACTIVATE, PAUSE, RESUME y CLOSE; excepciones fuera de horario requieren motivo y nueva hora límite. Incluye empty/loading/error/success, accesibilidad, confirmaciones irreversibles y vista móvil del graduado. No inventes un rol GR Staff, no modifiques GroupMember, no implementes aprobaciones de múltiples mesas (Q3 pendiente del CEO). Entrega componentes reutilizables y vista completa de cada flujo.

## 6. Gates antes de implementación

- Validar visualmente contra los UX audits vinculantes de GR.
- Aprobar maquetas con negocio sin tratar Q3 como confirmado.
- Revisar OpenAPI, autorización y errores; generar pruebas de contrato y seguridad en ambos repositorios.
- Monitorear reconciliación, lease y pausas fuera de horario. No declarar implementación sólo por haber generado el prototipo.
