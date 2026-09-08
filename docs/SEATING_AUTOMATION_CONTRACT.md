# Plataforma GR — Contrato de Automatización de Croquis

**Documento:** `SEATING_AUTOMATION_CONTRACT.md`  
**Versión:** 1.0  
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

## 3. Pipeline V1

```text
archivo
→ PDF.js cuando aplique
→ OpenCV.js
→ Tesseract.js
→ correlación geometría/OCR
→ coordenadas normalizadas
→ overlay React-Konva
→ revisión manual ADMIN
→ publicación
```

El procesamiento debe ejecutarse fuera del main thread mediante Web Worker.

No se requiere ML entrenado ni proveedor cloud OCR para V1.

## 4. Revisión humana obligatoria

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

## 5. Persistencia

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

## 6. Privacidad

El plano/fondo se gestiona como `FileAsset`.

No incluir PII de graduados en payloads de detección o eventos realtime.

## 7. Estados visuales de mesa

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

## 8. Precedencia

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
