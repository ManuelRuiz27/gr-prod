---
description: Reglas fundamentales de dominio, alcance y flujo de trabajo para Plataforma GR
---

# Reglas del Proyecto Plataforma GR

- **Fuente de verdad funcional:** `/docs` manda sobre cualquier suposición, código legacy o prototipo.
- **Fuente de verdad visual:** `stitch_gr_prototype/` es la referencia para layout, jerarquía, spacing y apariencia.
- **Código legacy:** El código preexistente nunca prevalece sobre `/docs`.
- **Integridad de dominio:** No inventar entidades, estados, campos, reglas de negocio, datos ficticios ni flujos no aprobados.
- **Estrategia Git:** Trabajar siempre directamente sobre `main`. No crear ramas ni Pull Requests.
- **Economía de cambios:** Preferir el diff mínimo y modificaciones quirúrgicas.
- **Documentación auxiliar:** No crear `implementation_plan.md`, `walkthrough.md` ni reportes salvo que el ticket lo solicite explícitamente.
