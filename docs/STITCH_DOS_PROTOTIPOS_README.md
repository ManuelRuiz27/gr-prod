# Stitch — Entrega de dos prototipos COMPLETOS de Plataforma GR

**Fecha:** 16-nov-2026  
**Estado:** handoff de UX/UI, no ejecución de Stitch, ni implementación productiva.  
**Rama:** `ManuelRuiz27/gr-prod@integration/monkavia-gr-access`.

## Qué debe entender Stitch antes de diseñar

**El entregable son descripciones de pantallas dentro de una graduación real**, no únicamente una lista de rutas, operationId, componentes o conteos. Los dos documentos rectores contienen un bloque `Guion de pantallas` donde cada escena explica: **actor involucrado → situación del evento/contrato → pantalla que aparece → datos visibles → acción posible → respuesta/estado → siguiente pantalla → intervención de otro actor**. Comenzar el diseño con ese guion y usar los inventarios de ID sólo para verificar cobertura.

**Secuencia humana que Stitch debe representar:**

| Momento de la graduación | ADMIN GR | GRADUATE | Invitados y Staff (sólo variante con Monkavia) |
|---|---|---|---|
| Antes de contratar | Crea y abre evento, configura precios, plan y plantilla de mesas | Se registra en el evento, acepta contrato | Sin intervención |
| Contratación | Revisa expedientes, controla capacidad y excepciones | Contrata lugares, registra nombres de `GroupMember` | Invitados no necesitan cuenta |
| Pagos | Verifica comprobantes, registra abonos y ajustes | Paga parcialidades, reporta transferencias | Sin intervención |
| Preparación de evento | Supervisa distribución, platillos y termos | Ubica cantidades por mesa, selecciona platillos y termo según elegibilidad | Sin intervención |
| Emisión de accesos (solo variante integrada) | Prepara QR, imprime pases individuales sin cena; programa ingreso | Consulta su único QR familiar cuando es elegible | Invitados reciben captura familiar o pase individual de ADMIN |
| Día del evento (solo variante integrada) | Activa/pausa/reanuda/cierra admisión y consulta asistencia | Presenta/comparte su QR FAMILY | Staff de Monkavia escanea e ingresa derechos parciales o individuales |
| Después | Cortes, reportes, eventuales reembolsos, finalización contractual | Consulta datos autorizados de su graduación | Monkavia conserva historial inmutable de ingresos |

**Prototipo 01:** leer el guion `## 3A. Guion de pantallas: qué ve y hace cada actor durante una graduación` de `STITCH_PROTOTIPO_01_GR_BASE.md`.

**Prototipo 02:** leer el guion `## 3A. Guion visual completo: cómo viven la graduación todos los actores` de `STITCH_PROTOTIPO_02_GR_MONKAVIA.md`, **además** del 01 para el contenido comercial íntegro. El segundo es otra interfaz completa, no sólo las pantallas de QR.

**Diseño visual:** el objetivo es que se comprenda claramente qué debe hacer cada actor en cada momento, no añadir un módulo para cada operación técnica del backend. Una escena puede producir varias pantallas y estados; una pantalla puede participar en múltiples escenarios.

## Entregables para importar como BASE en Stitch

| Proyecto de Stitch (crear DOS proyectos independientes) | Documento rector | Qué debe producir |
|---|---|---|
| **GR · Solo plataforma** | [STITCH_PROTOTIPO_01_GR_BASE.md](STITCH_PROTOTIPO_01_GR_BASE.md) | Rediseño **completo** de ADMIN + GRADUATE, todos los flujos comerciales del CEO, sin QR/check-in |
| **GR · Plataforma + Monkavia** | [STITCH_PROTOTIPO_02_GR_MONKAVIA.md](STITCH_PROTOTIPO_02_GR_MONKAVIA.md) | **Otro rediseño completo** de ADMIN + GRADUATE con mismas reglas base **más** Accesos y superficie Monkavia Scanner |

**Importante:** no pedir a Stitch «amplía sólo las pantallas de acceso» en el segundo proyecto: debe incluir todas las pantallas del GR base y ser utilizable de manera independiente. Es válido reutilizar el mismo sistema de diseño y componentes entre ambos, pero el resultado esperado son **dos prototipos distintos y completos**.

## Restricciones de autoridad

1. **GR CEO:** el producto comercial no se altera. Respetar `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `FINANCIAL_DOMAIN.md`. `GroupMember` permanece nominal con `full_name` obligatorio.
2. **UX:** obedecer `GRADUATE_UX_SIMPLIFICATION_AUDIT.md` y `ADMIN_UX_SIMPLIFICATION_AUDIT.md`. Debe rehacerse UI/navegación, no reglas de dominio.
3. **Mesas:** únicamente catálogo de croquis/plantillas precargadas y cantidades `TableAllocation`. La descripción histórica de editor/imagen/CRUD dinámico queda retirada. No introducir sillas individuales ni permiso especial multimesa no aprobado.
4. **Accesos (sólo Prototipo 02):** usar `GR_ACCESS_INTEGRATION.openapi.yaml` y `invitacionespremium@monkavia-gr/docs/04-tecnico/GR_PRIVATE_API.openapi.yaml` v2. Separación GR vs Monkavia; no reescribir finanzas ni mesas de GR.
5. **Q3:** aprobación de distribuciones multimesa pendiente del CEO. No inventar flujo ni gate.
6. Son **prototipos UX**, no certificados de integración. Las operaciones descritas contract-first pueden estar aún pendientes de backend y pruebas.

## Cómo entregar materiales a Stitch

**Proyecto 01:** proporcionar primero `STITCH_PROTOTIPO_01_GR_BASE.md`. Como anexos de reglas y estilo adjuntar/enlazar `INDEX.md`, `GRADUATE_UX_SIMPLIFICATION_AUDIT.md`, `ADMIN_UX_SIMPLIFICATION_AUDIT.md`, `UI_DESIGN_SYSTEM.md`, `SEATING_QUANTITY_CONTRACT.md`.

**Proyecto 02:** proporcionar primero `STITCH_PROTOTIPO_02_GR_MONKAVIA.md`; después `STITCH_PROTOTIPO_01_GR_BASE.md` para detalle comercial y `GR_ACCESS_INTEGRATION.openapi.yaml` para operación GR. Para contratos privados Monkavia añadir `GR_PRIVATE_API.openapi.yaml` v2 de rama `monkavia-gr`. No usar V1/1,800/releaseState único como estado actual.

El prompt final para cada proyecto aparece en el apartado `Instrucción final para Stitch` del documento correspondiente. **Construir un proyecto por prompt**.

## Comparación visual y funcional obligatoria

| Dominio | Prototipo 01: GR | Prototipo 02: GR + Monkavia |
|---|---|---|
| Acceso, registro, login, selección de evento | Completo | Idéntico funcionalmente |
| Crear evento/configuración/estado comercial | Completo | Idéntico funcionalmente |
| Contrato, folio, `GroupMember`, grupo y compras | Completo | Idéntico funcionalmente |
| Mercado Pago/OpenPay, transferencias, comprobantes, cartera, ajustes, refunds | Completo | Idéntico funcionalmente |
| Croquis precargado, cantidades, vínculo nominal, platillos y termo | Completo | Idéntico funcionalmente |
| Reportes/cortes, políticas cancelación y auditoría | Completo | Idéntico funcionalmente |
| Elegibilidad y emisión de QR | No aparece | FAMILY por contrato + NO_DINNER individual |
| Impresión de QR sin cena por ADMIN | No aparece | Sí, plantilla + PDF |
| Operación de admisión y staff | No aparece | Configuración, horario, pause/resume, Staff |
| Escaneo e ingresos | No aparece | Monkavia Scanner independiente |
| Capacidad técnica derechos | No aplica | 5,000 por evento GR_ACCESS, pendiente certificación |
| Aprobación distribución multimesa Q3 | No añadida | No añadida (CEO pendiente) |

## Matriz de pantallas y criterios de entrega

- Prototipo 01: 17 pantallas/estados **G00–G16**, 22 **A00–A21** (39 identificadores; varios son subflujos/sheets, no necesariamente rutas).
- Prototipo 02: **las 39 superficies anteriores** más 4 **G17–G20**, 8 **A22–A29**, 9 **M00–M08** (60 identificadores totales; no todas son páginas independientes).
- Cada identificador debe tener entrada, salida, CTA principal y casos alternos; algunos se resuelven como modal, drawer o estado de una página, no creando navegación espuria.
- ADMIN desktop-first y GRADUATE mobile-first, Staff scanner touch-first. Desktop/tablet/mobile adaptados sin duplicar menús.
- Componentes visuales consistentes y estados vacíos, fallas, permisos, deadlines, confirmaciones, concurrencia y éxito.
- Datos sintéticos etiquetados como demo. No registrar pagos reales ni QR válidos; no afirmar conexión real a API.

## Checklist de revisión y aceptación

- [ ] ¿Stitch generó DOS proyectos completos, uno por documento?
- [ ] ¿El prototipo 02 incluye toda la operación GR, no sólo Accesos?
- [ ] ¿La variante base omite totalmente QR y check-in?
- [ ] ¿Los dos preservan `GroupMember`, contratos, pagos y croquis vigente?
- [ ] ¿Los dos usan el sistema visual y simplificación UX de GR?
- [ ] ¿En la variante Monkavia están los pases NO_DINNER impresos sólo por ADMIN, FAMILY compartido y check-in parcial?
- [ ] ¿La operación de admisión distingue ventana normal, PAUSE, RESUME, override auditado y CLOSE irreversible?
- [ ] ¿No se añadió aprobación Q3 ni Staff como rol GR?
