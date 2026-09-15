# Plataforma GR — Croquis y Selección de Mesas

**Documento:** `SEATING_MAP.md`  
**Versión:** 2.0  
**Fecha:** 14 de septiembre de 2026  
**Estado:** Baseline vigente de catálogo + operación

> La geometría del croquis proviene exclusivamente del catálogo precargado definido en `SEATING_CATALOG_CONTRACT.md`. La asignación/ocupación vigente sigue `SEATING_QUANTITY_CONTRACT.md` cuando exista conflicto con el baseline nominal anterior.

## 1. Objetivo

El módulo representa visualmente la distribución de mesas de un evento y permite operar ocupación/asignaciones sobre un croquis aprobado.

No es:

- CAD;
- editor libre de planos;
- selector de silla;
- reconocimiento de imágenes;
- OCR;
- sistema de check-in.

## 2. Origen del croquis

Cada evento referencia una plantilla versionada del catálogo:

```text
template_id
template_version
```

La plantilla contiene asset visual confiable y geometría base de sus mesas. El catálogo es semi-fijo y mantenido fuera del runtime administrativo; se espera inicialmente un conjunto aproximado de 15 croquis.

ADMIN selecciona una plantilla disponible. No carga archivos arbitrarios ni construye/modifica el layout en producción.

## 3. Mesa de plantilla

Cada mesa del catálogo define:

```text
template_key
label
shape SQUARE|ROUND
x
y
width
height
capacity
```

Geometría normalizada `0..1`.

`template_key` es estable dentro de la versión y no se infiere desde `label`.

Una plantilla sin capacidad positiva verificada para todas sus mesas puede usarse en preview/QA, pero no activarse como mapa operativo.

## 4. Persistencia operacional

El backend conserva:

```text
SeatingMap
EventTable
TableAllocation / TableAssignment según contrato vigente
```

`EventTable` se relaciona con la mesa de catálogo mediante `template_key`.

El asset de plantilla no es fuente de ocupación ni permisos.

## 5. Estados

Persistidos:

```text
AVAILABLE
BLOCKED
```

Derivados:

```text
PARTIAL
FULL
```

Transitorios UI:

```text
SELECTED
HOVER
FOCUSED
```

No persistir `PARTIAL`/`FULL` como autoridad.

## 6. Funciones ADMIN vigentes

ADMIN puede:

- seleccionar la plantilla de catálogo para el evento antes de operación;
- consultar el croquis operativo;
- bloquear/desbloquear mesas;
- consultar ocupación/disponibilidad;
- operar asignaciones autorizadas;
- consultar detalle administrativo permitido;
- auditar cambios operativos.

ADMIN no puede desde la aplicación:

- subir fondo arbitrario;
- crear mesas estructurales;
- crear mesas en bulk;
- mover/redimensionar mesas;
- cambiar label/shape/geometry del catálogo;
- eliminar mesas estructurales;
- ejecutar OCR/CV/importación automática.

Cambiar de plantilla con allocations/assignments existentes requiere migración explícita; no es una edición ordinaria.

## 7. Funciones GRADUATE

GRADUATE puede:

- ver únicamente la plantilla asociada a su evento;
- zoom/pan;
- consultar disponibilidad agregada sin PII ajena;
- operar su distribución/asignaciones cuando sea elegible;
- recibir actualización agregada de disponibilidad.

No puede elegir otra plantilla ni modificar estructura del croquis.

## 8. Ocupación

La fuente de verdad depende del contrato de asignación vigente. Para la evolución por cantidades:

```text
occupied_places = SUM(active TableAllocation.quantity)
available_places = capacity - occupied_places
```

Las vinculaciones nominales no pueden duplicar la ocupación ya representada por cantidades.

Invariante:

```text
0 <= occupied_places <= capacity
```

## 9. Elegibilidad

Antes de una mutación iniciada por GRADUATE, backend valida:

```text
membership ACTIVE
event OPEN
deadline vigente
financial seating condition satisfied
```

La UI no decide elegibilidad a partir de porcentajes o dinero calculado localmente.

## 10. Privacidad

El mapa para GRADUATE puede exponer por mesa:

```text
id
template_key
label
shape
capacity
occupied
available
status
geometry
```

Nunca PII de otros graduados, integrantes, folios, finanzas o notas.

## 11. Concurrencia

Toda confirmación de ocupación debe revalidar capacidad en backend bajo transacción/locks.

Escenario P0:

```text
queda 1 lugar
→ dos confirmaciones simultáneas
→ una persiste
→ la otra recibe TABLE_CAPACITY_CHANGED
→ ocupación nunca supera capacidad
```

## 12. Bloqueo

`BLOCKED`:

- impide nuevos incrementos ordinarios;
- no destruye ocupación existente;
- puede volver a `AVAILABLE` por ADMIN.

## 13. Contratos API conceptuales vigentes

Lectura:

```http
GET /api/v1/me/events/{eventId}/seating-map
GET /api/v1/admin/events/{eventId}/seating-map
```

Configuración del evento:

```text
adminUpdateSeatingMap
```

solo puede asociar una plantilla/version permitida y metadata explícitamente autorizada. No es editor de geometría.

Operación de cantidades y asignaciones sigue `SEATING_QUANTITY_CONTRACT.md` y sus contratos aprobados.

## 14. Operaciones retiradas

Se consideran fuera de la superficie vigente:

```text
adminUploadSeatingBackground
adminRemoveSeatingBackground
adminCreateTable
adminBulkCreateTables
adminImportDetectedTables
adminUpdateTable (geometry/label/capacity structural editing)
adminDeleteTable (structural catalog editing)
```

Aunque aparezcan en artefactos API históricos, `SEATING_CATALOG_CONTRACT.md` tiene precedencia hasta la regeneración contractual.

## 15. Criterios críticos

Debe probarse al menos:

1. una plantilla desconocida/version inválida se rechaza;
2. GRADUATE ve únicamente el catálogo seleccionado por su evento;
3. ninguna UI productiva permite upload/detección/import/edición estructural;
4. `template_key` se mantiene estable para las mesas materializadas;
5. ocupación/disponibilidad provienen del backend, no del JSON estático;
6. concurrencia nunca sobrepasa capacidad;
7. bloqueos no eliminan ocupación existente;
8. no existe selección individual de silla;
9. PII ajena no aparece en mapa/realtime;
10. cambio de plantilla con ocupación existente no ocurre silenciosamente.
