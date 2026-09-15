# Plataforma GR — Contrato de Catálogo de Croquis

**Documento:** `SEATING_CATALOG_CONTRACT.md`  
**Versión:** 1.0  
**Fecha:** 14 de septiembre de 2026  
**Estado:** REQUERIMIENTO FUNCIONAL/TÉCNICO VINCULANTE

## 1. Decisión aprobada

Por decisión del cliente, los croquis dejan de ser una superficie dinámica de carga/detección/edición. El producto utilizará un **catálogo semi-fijo de croquis precargados**, estimado inicialmente en aproximadamente 15 plantillas.

La dinámica visual será la misma del croquis precargado actual: fondo confiable + metadata geométrica versionada + objetos de mesa renderizados por la aplicación.

No existe requisito de que ADMIN construya un croquis desde cero ni cargue un plano arbitrario en runtime.

## 2. Autoridad y precedencia

Este documento reemplaza, únicamente para el origen/configuración del croquis, cualquier requisito previo de:

- carga de JPG/PNG/PDF por ADMIN;
- detección automática de mesas;
- OCR de numeración;
- OpenCV/Tesseract/PDF.js para análisis de croquis;
- importación de candidatos detectados;
- creación/bulk creation de mesas desde UI;
- edición libre de geometría del layout;
- eliminación de mesas estructurales del croquis.

Prevalece sobre `SEATING_AUTOMATION_CONTRACT.md` y sobre las secciones contradictorias de `PRODUCT_SCOPE.md`, `SRS.md`, `SEATING_MAP.md`, `API_ENDPOINT_MATRIX.md`, `API_CONTRACT.openapi.yaml` y documentación anterior.

`SEATING_QUANTITY_CONTRACT.md` conserva sus reglas de asignación/ocupación; este contrato sustituye solamente la procedencia dinámica de la geometría por catálogo precargado.

## 3. Catálogo

Cada plantilla del catálogo debe ser un recurso confiable y versionado, mantenido en el repositorio/despliegue, no contenido arbitrario suministrado por un usuario.

Modelo conceptual mínimo:

```text
SeatingTemplate
---------------
template_id        estable
template_version   entero >= 1
display_name
background_asset   SVG/PNG confiable
intrinsic_width
intrinsic_height
tables[]
```

Cada mesa de plantilla:

```text
template_key       estable dentro de la plantilla
label
shape              SQUARE | ROUND
x/y/width/height   normalizados 0..1
capacity           entero positivo para uso operativo
```

`label` no es identificador. `template_key` identifica la mesa física a través de versiones compatibles.

Una plantilla con capacidades desconocidas puede existir para preview/QA, pero **no puede activarse como croquis operativo** hasta completar capacidades verificadas.

## 4. Gestión del catálogo

El catálogo no tendrá CRUD administrativo en runtime en esta fase.

Agregar o modificar una plantilla es una operación de mantenimiento controlada:

```text
asset + metadata JSON
→ revisión visual
→ validación de schema
→ validación de claves/geometry/capacities
→ tests
→ version bump
→ deployment
```

Cambios de geometría, claves, numeración o capacidad normativa requieren nueva `template_version`.

No se aceptan SVG/JSON arbitrarios recibidos desde backend o navegador sin pertenecer al catálogo empaquetado/autorizado.

## 5. Asociación a evento

ADMIN selecciona una plantilla disponible del catálogo para el evento. El sistema persiste como mínimo:

```text
template_id
template_version
```

y materializa/relaciona las `EventTable` operativas con `template_key`.

El catálogo es fuente de **geometría base**; la fuente autoritativa de operación sigue siendo backend:

```text
SeatingMap
EventTable
TableAllocation / TableAssignment según contrato vigente
```

Ocupación, disponibilidad, bloqueo, ownership y concurrencia nunca se calculan desde el asset estático.

Cambiar de plantilla después de existir allocations/assignments no es una edición visual ordinaria: debe bloquearse o ejecutarse mediante una migración explícita y auditable definida en un contrato posterior.

## 6. Funciones conservadas

Se conservan:

- listar/mostrar plantillas precargadas en ADMIN;
- seleccionar plantilla para un evento;
- renderizar la plantilla seleccionada para ADMIN y GRADUATE;
- zoom/pan y selección visual;
- estados `AVAILABLE`/`BLOCKED` y derivados de ocupación;
- bloqueo/desbloqueo operativo de mesas;
- asignación por cantidades y/o vinculación nominal según `SEATING_QUANTITY_CONTRACT.md`;
- concurrencia y validación server-side;
- realtime agregado sin PII;
- auditoría de cambios operativos.

## 7. Funciones retiradas

Quedan **RETIRED / DO NOT IMPLEMENT / DO NOT EXPOSE**:

| operationId / capacidad anterior | Estado |
|---|---|
| `adminUploadSeatingBackground` | RETIRED |
| `adminRemoveSeatingBackground` | RETIRED |
| `adminCreateTable` | RETIRED |
| `adminBulkCreateTables` | RETIRED |
| `adminImportDetectedTables` | RETIRED |
| `adminUpdateTable` para label/geometry/capacity del croquis | RETIRED |
| `adminDeleteTable` para modificar estructura del croquis | RETIRED |
| carga arbitraria PNG/JPG/JPEG/PDF | RETIRED |
| OpenCV table detection | RETIRED |
| Tesseract/OCR de mesas | RETIRED |
| calibración de detector | RETIRED |
| review de candidatos detectados | RETIRED |

`adminBlockTable`, `adminUnblockTable`, lecturas y operaciones de asignación siguen vigentes porque son operación del evento, no edición estructural del catálogo.

`adminUpdateSeatingMap` puede conservarse únicamente con semántica de **selección/asociación de `template_id` + `template_version` y metadata permitida**, nunca como editor libre del layout.

## 8. Código legacy a retirar

Cuando se ejecute la limpieza de implementación, cualquier código dedicado exclusivamente a las capacidades retiradas se clasifica `REMOVE`, incluyendo, si no tiene otro consumidor:

- `seatingDetectionService` y helpers de detección;
- Web Worker de CV/OCR;
- `FloorplanDetectionReviewModal` o equivalente;
- flujos UI de upload/import/detect/review;
- OpenCV.js, Tesseract.js y PDF.js usados exclusivamente para análisis de croquis;
- handlers/adapters frontend de importación detectada;
- controllers/use cases backend de los operationId retirados.

La limpieza debe hacerse con búsqueda de referencias y tests; no eliminar una dependencia que tenga otro consumidor válido.

## 9. Reglas de seguridad

- El catálogo es confiable y versionado; el usuario no inyecta markup/JS.
- GRADUATE nunca elige una plantilla distinta a la asociada a su evento.
- `eventId` no concede ownership.
- El frontend no decide capacidad ni ocupación autoritativa.
- No exponer PII de terceros en el mapa/realtime.

## 10. Criterios de aceptación

1. ADMIN puede elegir entre plantillas precargadas aprobadas.
2. GRADUATE ve exactamente la plantilla asociada al evento.
3. No existe UI productiva para subir, detectar, importar, mover, redimensionar, crear o borrar mesas estructurales.
4. Una plantilla desconocida/version inválida es rechazada.
5. Todas las mesas operativas corresponden a `template_key` válido de la versión seleccionada.
6. Una plantilla sin capacidades verificadas no puede activarse en producción.
7. Bloqueo, ocupación, asignación y concurrencia siguen siendo server-side.
8. Los operationId retirados no deben ser usados por nuevas implementaciones ni clientes.

## 11. Próxima reconciliación contractual

`API_ENDPOINT_MATRIX.md`, `API_CONTRACT.openapi.yaml` y `AUTHORIZATION_MATRIX.md` conservan historial de la superficie dinámica anterior. Hasta su regeneración, este documento tiene precedencia para seating y los operationId de §7 se consideran retirados aunque aparezcan en esos artefactos históricos.
