---
description: Reglas de desarrollo e interfaz para el frontend de Plataforma GR
---

# Reglas de Frontend para Plataforma GR

Aplicable a `frontend/**`:

- **Reutilización:** Reutilizar el design system existente (`src/design-system`), shells y componentes antes de crear nuevos.
- **Modificaciones quirúrgicas:** No reescribir archivos completos si basta una modificación localizada.
- **Componentes:** No duplicar componentes ni variantes.
- **Lógica de negocio:** No simular reglas de negocio que corresponden al backend.
- **Vocabulario UI:** Los enums técnicos (`EventStatus`, `ThermoStatus`, `InstallmentStatus`, etc.) se usan internamente; la UI expone lenguaje natural en español sin tecnicismos.
- **Fixtures:** Únicamente representan información normativamente definida. Si falta un dato, omitir el bloque o mostrar estado vacío en lugar de inventar valores.
- **Alineación con prototipos:** Antes de modificar una pantalla, localizar su prototipo correspondiente en `stitch_gr_prototype/`.
- **Resultados verificables:** reportar cantidades de tests, errores y warnings exactamente desde la última ejecución real; nunca estimarlas.
- **QA visual:** solo reportar `Visual Browser: PASS` cuando se haya ejecutado realmente Browser sobre la ruta y viewport solicitados. Si no se ejecutó, reportar `NOT RUN`. Build/tests no equivalen a validación visual.

