# Plataforma GR — Automatización de Croquis (RETIRED)

**Documento:** `SEATING_AUTOMATION_CONTRACT.md`  
**Versión:** 2.0  
**Fecha:** 14 de septiembre de 2026  
**Estado:** RETIRED / HISTÓRICO

## Decisión vigente

La automatización dinámica de croquis fue retirada por decisión del cliente.

La solución vigente es:

```text
catálogo semi-fijo de croquis precargados
→ ADMIN selecciona plantilla
→ backend asocia template_id/template_version al evento
→ frontend renderiza asset + mesas versionadas
→ operación de ocupación/asignación permanece dinámica
```

La especificación normativa actual es:

- `SEATING_CATALOG_CONTRACT.md`
- `SEATING_QUANTITY_CONTRACT.md`
- `SEATING_MAP.md`

## Funciones retiradas

No implementar ni reactivar:

- carga arbitraria de PNG/JPG/JPEG/PDF para construir croquis;
- OpenCV.js para detección de mesas;
- Tesseract.js/OCR de numeración;
- PDF.js para análisis/detección del layout;
- Web Worker de CV/OCR;
- calibración por mesa de referencia;
- candidatos detectados y review previo a importación;
- importación automática de mesas detectadas.

Los operationId retirados están enumerados en `SEATING_CATALOG_CONTRACT.md`.

## Código histórico

El código existente dedicado exclusivamente a detección/OCR/upload/import se considera `REMOVE` y no debe recibir nuevas funcionalidades. Debe eliminarse de manera controlada cuando se ejecute la limpieza del módulo seating y después de verificar referencias/tests.

## Motivo

El cliente confirmó que opera con un conjunto pequeño y relativamente estable de croquis (aprox. 15). Mantener un pipeline de visión/OCR añade complejidad, falsos positivos y costo de mantenimiento sin valor proporcional frente a precargar y versionar las plantillas reales.

Este archivo se conserva únicamente para registrar la decisión histórica y evitar que futuros agentes reintroduzcan la solución retirada.
