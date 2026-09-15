---
description: Reglas de desarrollo e interfaz para Google Antigravity en el frontend de Plataforma GR
---

# Reglas de Frontend para Plataforma GR

Aplicable principalmente a `frontend/**`.

## Ownership

- **Agente principal:** Google Antigravity.
- Consultar `docs/TECH_STACK.md` antes de cambiar dependencias o arquitectura cliente.
- Superficie normal: `frontend/**`.
- No modificar backend/Prisma/contratos para desbloquear una pantalla salvo autorización explícita.
- Si falta contrato backend, reportar bloqueo; no simular una regla autoritativa en cliente.

## Implementación

- Reutilizar design system, shells y componentes existentes antes de crear nuevos.
- Preferir modificaciones quirúrgicas.
- No duplicar componentes/variantes.
- No trasladar lógica de negocio autoritativa al cliente.
- Integración productiva: `Frontend → NestJS`; no acceso directo a tablas financieras.
- Nunca incluir secrets en `VITE_*`, bundle o código cliente.
- El frontend nunca confirma pagos.
- Fixtures solo representan datos normativamente definidos; nunca son fallback productivo silencioso.
- Antes de modificar una pantalla, localizar referencia visual aplicable en `stitch_gr_prototype/` y audits UX.

## Seating / croquis — decisión vigente

Leer obligatoriamente:

```text
docs/SEATING_CATALOG_CONTRACT.md
docs/SEATING_QUANTITY_CONTRACT.md
docs/SEATING_MAP.md
```

`SEATING_AUTOMATION_CONTRACT.md` es histórico/RETIRED.

Reglas:

- Los croquis provienen de un catálogo semi-fijo de plantillas precargadas/versionadas (aprox. 15 esperadas por cliente).
- ADMIN puede seleccionar una plantilla aprobada para el evento; GRADUATE solo visualiza la asociada a su evento.
- No crear UI productiva para subir PNG/JPG/PDF, detectar mesas, OCR, calibrar, importar candidatos o editar la geometría estructural.
- No reintroducir OpenCV/Tesseract/PDF.js para análisis de croquis.
- No permitir mover/redimensionar/crear/eliminar mesas estructurales desde la UI productiva.
- El asset/JSON de plantilla es confiable y versionado; no renderizar SVG/markup arbitrario proveniente de usuario.
- `template_id`, `template_version` y `template_key` son referencias estables; `label` no es ID.
- Plantillas sin capacidades verificadas son preview/QA, no operativas.
- Ocupación, disponibilidad, elegibilidad, block/unblock y concurrencia vienen del backend.
- La selección por cantidades sigue `SEATING_QUANTITY_CONTRACT.md`.
- Código de detection/upload/import que quede en repo se considera `REMOVE`; no ampliarlo. Eliminarlo solo con búsqueda de referencias y tests del ticket de limpieza.

## Verificación

- Reportar tests/errores/warnings exactamente desde la última ejecución real.
- Solo reportar QA visual PASS si Browser fue ejecutado realmente.
- Cuando aplique:

```bash
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build
```
