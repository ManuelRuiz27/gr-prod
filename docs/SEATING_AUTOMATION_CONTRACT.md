# Plataforma GR — Contrato de Automatización de Croquis

**Documento:** `SEATING_AUTOMATION_CONTRACT.md`  
**Versión:** 1.1
**Estado:** REQUERIMIENTO FUNCIONAL/TÉCNICO VINCULANTE  
**Fecha:** 7 de septiembre de 2026

## 1. Alcance

ADMIN podrá cargar un plano y recibir una propuesta automática de mesas superpuestas sobre el croquis.

Entradas:

```text
PNG
JPG/JPEG
PDF de una página
```

La propuesta debe intentar detectar:

- mesas circulares;
- mesas cuadradas;
- mesas rectangulares;
- número/etiqueta mediante OCR cuando el plano lo contenga.

## 2. Compatibilidad con el dominio existente

El dominio persistido conserva:

```text
TableShape = ROUND | SQUARE
```

`SQUARE` es el primitive rectangular de render existente:

```text
width == height  → cuadrado
width != height  → rectángulo
```

Esto evita un breaking change de enum y conserva geometría real.

## 3. Regla de existencia de mesa

> **Geometry determines table existence; OCR only proposes labels.**

La existencia y el conteo de mesas se determinan exclusivamente por geometría. OCR:

- no crea mesas;
- no elimina mesas;
- no participa en el conteo;
- no descarta un candidato si falla o tiene confianza baja;
- únicamente propone `label_candidate` y `ocr_confidence` para revisión humana.

## 4. Pipeline V1

```text
archivo
→ PDF.js cuando aplique
→ OpenCV.js
→ escala de grises y threshold
→ contornos geométricos cerrados
→ filtro de cuadriláteros rectangulares por área, tamaño, aspect ratio y alineación
→ agrupación por familia de dimensiones dominante
→ deduplicación de contornos interior/exterior
→ TableCandidate[]
→ Tesseract.js opcional sobre una ROI por candidato
→ coordenadas normalizadas
→ overlay React-Konva
→ revisión manual ADMIN
→ publicación
```

La detección OpenCV.js y el reconocimiento Tesseract.js deben ejecutarse fuera del main thread mediante Web Worker. La detección geométrica debe funcionar aunque OCR esté deshabilitado, no esté disponible o falle.

Las responsabilidades se mantienen separadas de forma equivalente a:

```ts
detectTables(image): TableCandidate[]
recognizeTableLabels(image, candidates): TableCandidate[]
```

`recognizeTableLabels` debe conservar la cantidad, identidad y geometría de los candidatos recibidos.

No se requiere ML entrenado ni proveedor cloud OCR para V1.

### 4.1 Parámetros geométricos

Los umbrales se expresan como proporciones del raster, no como píxeles fijos. La configuración debe exponer tolerancias razonables para:

- lado y área mínimos/máximos;
- aspect ratio;
- rectangularidad y desviación angular;
- similitud de width/height/aspect-ratio/area dentro de la familia dominante;
- IoU/distancia de centro para deduplicación;
- similitud respecto a una mesa seleccionada como calibración opcional.

La familia dominante requiere repetición; no existe fallback que invente una cuadrícula ni se hardcodea el número esperado de mesas.

Defaults V1 expuestos en `DEFAULT_TABLE_DETECTION_PARAMETERS`:

| Grupo | Default | Motivo |
|---|---:|---|
| lado corto | `1%..22%` del lado menor | excluye glifos/ruido y recintos arquitectónicos grandes sin depender de DPI |
| área | `0.008%..4%` del raster | segunda guarda ante líneas, escenario y marco del plano |
| aspect ratio | `0.45..2.20` | admite cuadrados y rectángulos comunes sin aceptar líneas alargadas |
| rectangularidad | `>= 0.72` | tolera escaneo/compresión y rechaza rombos o trazos irregulares |
| desviación de ejes | `<= 15°` | tolera una captura ligeramente inclinada y rechaza diamantes |
| familia dominante | `28%` dimensiones, `24%` aspect ratio, `42%` área; mínimo `3` | agrupa variación de impresión/escala y exige repetición real |
| deduplicación | `IoU >= 0.68` o centros/tamaños equivalentes | une los contornos interior y exterior del mismo borde |
| calibración | `20%` dimensiones, `16%` aspect ratio, `32%` área | una referencia explícita permite una selección más estricta |

## 5. Revisión humana obligatoria

La detección nunca publica automáticamente.

ADMIN deberá poder:

- eliminar falsos positivos;
- añadir mesas omitidas;
- corregir número/label;
- mover/redimensionar;
- cambiar forma;
- establecer capacidad;
- revisar el resultado antes de publicar.

La confianza de OCR/detección es informativa y nunca autoridad de negocio.

## 6. Persistencia

Las propuestas son estado frontend transitorio.

La fuente de verdad tras publicación continúa siendo:

```text
SeatingMap
EventTable
TableAssignment
```

Publicación requerida:

```http
POST /api/v1/admin/events/{eventId}/tables/import
Idempotency-Key: <key>
```

Debe ser transaccional `all-or-nothing`.

El backend valida:

- ADMIN;
- evento;
- source file;
- label único;
- capacidad;
- shape;
- geometría 0..1;
- límites de cantidad/payload;
- duplicados.

## 7. Privacidad

El plano/fondo se gestiona como `FileAsset`.

No incluir PII de graduados en payloads de detección o eventos realtime.

## 8. Estados visuales de mesa

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

La disponibilidad deriva de asignaciones reales.

## 9. Precedencia

Este documento reemplaza únicamente las afirmaciones previas de `PRODUCT_SCOPE.md` y `SEATING_MAP.md` que indiquen:

```text
reconocimiento de planos fuera de alcance
fondo exclusivamente manual sin asistencia automática
```

Siguen vigentes:

- no CAD;
- no selección de silla;
- `GroupMember -> EventTable`;
- backend como autoridad;
- revisión de capacidad y concurrencia;
- coordenadas normalizadas.
