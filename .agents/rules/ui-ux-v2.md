# Plataforma GR — Regla vinculante UI/UX v2

Todo agente que modifique frontend debe leer, en este orden:

1. `docs/UI_DESIGN_SYSTEM.md`
2. `docs/SCREEN_VISUAL_SPECIFICATIONS.md`
3. `docs/UI_REFACTOR_ACCEPTANCE.md`
4. `docs/UI_REFACTOR_ROADMAP.md`
5. `docs/UX_FLOWS.md`
6. `docs/ROLES_PERMISSIONS.md`
7. `docs/BUSINESS_RULES.md` cuando corresponda

## Reglas obligatorias

- No usar `KpiCard` para nueva UI.
- No usar `Card` como contenedor predeterminado.
- No crear navegación basada en cards o mosaicos de accesos rápidos.
- No repetir información en título + subtítulo + supporting text.
- No mostrar enums/estados técnicos si existe etiqueta natural aprobada.
- ADMIN usa tablas/listas para densidad operativa.
- GRADUATE usa listas simples y controles táctiles.
- El evento es el contexto principal de las superficies ADMIN de operación.
- Mesas/croquis debe tratarse como workspace visual, no dashboard.
- Switch solo para configuración binaria reversible.
- No cambiar reglas de negocio, API, permisos o modelo de datos para resolver un problema visual.
- No crear un segundo design system.

## Referencia externa

Puede consultarse `https://ui-ux-pro-max-skill.com/` para heurísticas de UX, accesibilidad, responsive y React/Tailwind. La documentación local prevalece ante cualquier conflicto.

## Test de salida

Si la pantalla parece una plantilla de CRM/ERP/fintech al quitar el logo, el trabajo no está terminado.