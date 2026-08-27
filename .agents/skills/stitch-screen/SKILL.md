---
name: stitch-screen
description: Guía de implementación y alineación visual de pantallas a partir de los prototipos Stitch y la documentación normativa
---

# Procedimiento de Implementación de Pantallas con Stitch

1. **Localización:** Localizar la pantalla equivalente en `stitch_gr_prototype/`.
2. **Inspección:** Inspeccionar su `code.html` y los assets asociados.
3. **Diseño Visual:** Tomar de Stitch el layout, jerarquía, spacing, navegación y apariencia visual.
4. **Dominio Normativo:** Tomar de `/docs` el comportamiento funcional, contenido permitido y reglas de negocio.
5. **Implementación:** Implementar utilizando el design system React existente en `frontend/src/design-system/`.
6. **No duplicación:** No copiar HTML crudo ni crear sistemas de diseño paralelos.
7. **Verificación visual:** Comparar el resultado visual contra Stitch y corregir desviaciones evidentes.
