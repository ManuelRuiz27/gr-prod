# Plataforma GR — Croquis precargado y asignación por cantidades

**Documento:** `SEATING_QUANTITY_CONTRACT.md`  
**Versión:** 2.0  
**Fecha:** 14 de septiembre de 2026  
**Estado:** contrato funcional vigente; backend de cantidades puede seguir pendiente según tracker

## 1. Decisión vigente

La selección de mesas se construye sobre un **catálogo semi-fijo de croquis precargados** definido en `SEATING_CATALOG_CONTRACT.md`.

El croquis `taller-2560` actualmente existente pasa a ser una plantilla más del catálogo. El cliente estima aproximadamente 15 croquis habituales.

No existe carga/detección/edición dinámica del layout en runtime.

## 2. Catálogo y selección de plantilla

Cada plantilla tiene:

```text
template_id
template_version
display_name
background_asset
intrinsic dimensions
tables[]
```

Cada mesa incluye `template_key`, label, shape, geometría normalizada y capacidad operativa.

ADMIN podrá seleccionar una plantilla disponible para un evento. GRADUATE nunca selecciona la plantilla: recibe la asociada a su evento.

No se requiere un CRUD de catálogo para ADMIN. Nuevos croquis se incorporan mediante mantenimiento versionado del producto.

Plantillas incompletas (por ejemplo, con `capacity: null`) solo pueden usarse en preview/QA y no como mapa operativo.

## 3. Funciones eliminadas del flujo

Quedan fuera:

- upload de JPG/PNG/PDF para generar croquis;
- OpenCV/Tesseract/OCR;
- detección automática;
- candidatos/review/importación;
- creación manual/bulk de mesas estructurales;
- drag/resize persistente de geometría del catálogo;
- eliminación estructural de mesas.

La interacción visual puede conservar zoom, pan, hover, focus y selección operacional.

## 4. Lectura de mapa

El mapa autoritativo entrega, como mínimo:

```text
event_id
template_id
template_version
eligibility
tables[]
```

Cada `EventTable` de lectura incluye:

```text
id
template_key
label
shape
x/y/width/height
capacity
occupied
available
status AVAILABLE|BLOCKED
```

`available = capacity - occupied` expresa cupo físico. `BLOCKED` impide incrementos aunque exista cupo.

La geometría debe corresponder exactamente a la versión de plantilla seleccionada.

## 5. Unidad de asignación por cantidades

La evolución aprobada permite ubicar primero cantidades confirmadas y vincular nombres después.

Modelo objetivo:

```text
GraduateMembership
  └── TableAllocation[]
        ├── EventTable
        └── quantity
```

Los `GroupMember` pueden vincularse posteriormente sin duplicar ocupación.

Invariantes:

```text
SUM(allocation.quantity) <= confirmed_places
named_quantity <= allocation.quantity
occupied(table) = SUM(active allocation.quantity)
```

No sumar nuevamente `TableAssignment` si ya está representado por `TableAllocation`.

## 6. Contratos de máquina aprobados

Rutas relativas a `/api/v1`:

| Método / ruta | Propósito |
|---|---|
| GET `/me/events/{eventId}/seating-map` | mapa agregado y plantilla del evento, sin PII ajena |
| GET `/admin/events/{eventId}/seating-map` | mismo snapshot geométrico/operativo con autorización ADMIN |
| GET `/me/events/{eventId}/table-allocations` | distribución propia, versión y lugares confirmados/ubicados/pendientes |
| PUT `/me/events/{eventId}/table-allocations` | reemplazo atómico de la distribución propia completa |

El selector de plantilla ADMIN debe reutilizar la configuración de seating existente; no se introduce un endpoint de upload/import.

`adminUpdateSeatingMap`, cuando se reconcilie el contrato canónico, queda limitado a asociar `template_id` + `template_version` y metadata permitida.

## 7. Confirmación de cantidades

El PUT lleva:

```text
Idempotency-Key
expected_version
allocations: [{ table_id, quantity }]
```

Reglas:

- cantidades enteras positivas;
- no repetir mesa;
- array vacío libera la distribución sin cancelar lugares comerciales;
- mesas omitidas quedan sin cantidad para esa membresía;
- reintento idéntico conserva el mismo resultado lógico;
- misma clave + payload distinto se rechaza;
- ownership se valida también al recuperar una respuesta idempotente.

## 8. Concurrencia

Para confirmar:

```text
autorizar actor
→ lock membership
→ lock mesas origen/destino en orden estable
→ revalidar evento/deadline/elegibilidad/version
→ restar distribución previa propia
→ validar cupo final
→ persistir distribución completa
→ audit/outbox
→ COMMIT
```

Si cualquier validación falla, conservar toda la distribución previa.

Una mesa `BLOCKED` puede conservar/reducir cantidad existente, pero no incrementarla.

## 9. Relación nominal

Los endpoints nominales, cuando se conserven, solo vinculan integrantes dentro de cantidades ya ubicadas.

No pueden crear ocupación adicional por fuera de `TableAllocation`.

```text
1 GroupMember -> max 1 mesa activa
named_quantity <= quantity
```

Antes de reducir una cantidad bajo integrantes identificados, se debe resolver su reasignación nominal.

## 10. Cancelación y reducción comercial

Cancelar/reducir lugares debe liberar o adaptar cantidades de forma transaccional y aumentar la versión de la distribución.

No se debe dejar ocupación fantasma ni inventar asistentes.

## 11. Realtime y privacidad

Cada cambio publica disponibilidad agregada de las mesas afectadas, sin PII:

```text
table_id
occupied
available
status
```

GRADUATE no recibe nombres, teléfonos, correos, folios ni finanzas ajenas.

## 12. Errores principales

```text
SEATING_NOT_FINANCIALLY_ELIGIBLE
SEATING_DEADLINE_CLOSED
TABLE_NOT_FOUND
TABLE_BLOCKED
TABLE_CAPACITY_CHANGED
ALLOCATION_VERSION_CHANGED
ALLOCATION_BELOW_NAMED_QUANTITY
ALLOCATION_EXCEEDS_CONFIRMED_PLACES
ASSIGNMENT_EVENT_MISMATCH
SEATING_TEMPLATE_NOT_FOUND
SEATING_TEMPLATE_VERSION_INVALID
SEATING_TEMPLATE_NOT_OPERATIONAL
```

Ante conflicto, refrescar snapshot y exigir nueva confirmación.

## 13. Operaciones estructurales retiradas

No usar ni ampliar:

```text
adminUploadSeatingBackground
adminRemoveSeatingBackground
adminCreateTable
adminBulkCreateTables
adminImportDetectedTables
adminUpdateTable para geometry/label/capacity estructural
adminDeleteTable para estructura del catálogo
```

Ver `SEATING_CATALOG_CONTRACT.md` para precedencia y limpieza de código.

## 14. Criterios de aceptación

- ADMIN puede elegir entre plantillas precargadas aprobadas.
- GRADUATE ve la plantilla seleccionada para su evento.
- No existe upload/OCR/detección/import/editor estructural en producción.
- Plantilla sin capacidades completas no se activa.
- Cantidades pueden distribuirse entre varias mesas.
- Pago/elegibilidad habilita selección pero no ocupa automáticamente una mesa.
- Backend revalida cupo, versión y ownership al confirmar.
- Carrera por último lugar nunca produce sobrecupo.
- Asignaciones nominales no duplican ocupación.
- No se expone PII de terceros.
