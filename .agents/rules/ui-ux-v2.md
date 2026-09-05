# Plataforma GR — Regla vinculante UI/UX baseline 1.3

Todo agente que modifique frontend debe leer, en este orden:

1. `docs/PRODUCT_SCOPE.md`
2. `docs/BUSINESS_RULES.md`
3. `docs/ROLES_PERMISSIONS.md`
4. `docs/GRADUATE_UX_SIMPLIFICATION_AUDIT.md` si toca GRADUATE
5. `docs/ADMIN_UX_SIMPLIFICATION_AUDIT.md` si toca ADMIN
6. `docs/CODEX_UX_SIMPLIFICATION_PLAN.md` si ejecuta esta iniciativa
7. `docs/UX_FLOWS.md`
8. `docs/UI_DESIGN_SYSTEM.md`
9. `docs/SCREEN_VISUAL_SPECIFICATIONS.md`
10. `docs/FINANCIAL_DOMAIN.md` / `docs/SEATING_MAP.md` cuando corresponda

## Precedencia

Para composición, prioridad de información, navegación visible, cards, bordes/divisores y responsive:

```text
GRADUATE_UX_SIMPLIFICATION_AUDIT.md
ADMIN_UX_SIMPLIFICATION_AUDIT.md
        ↓ prevalecen sobre
UX_FLOWS.md
SCREEN_VISUAL_SPECIFICATIONS.md
UI_REFACTOR_ACCEPTANCE.md
UI_REFACTOR_ROADMAP.md
CODEX_UI_REFACTOR_PROMPT.md
frontend actual
```

La precedencia visual no autoriza cambiar reglas de negocio, permisos, API, Prisma o modelo de datos.

## Reglas obligatorias

- No usar `KpiCard` para nueva UI.
- No usar `Card` como contenedor predeterminado.
- No reemplazar `Card` por `div` conservando la misma composición tipo dashboard.
- No crear navegación basada en cards/mosaicos.
- No mostrar datos solo porque existen en el modelo.
- No repetir información en título + subtítulo + header + breadcrumb.
- No mostrar enums/estados técnicos si existe etiqueta natural aprobada.
- No mostrar `DemoFlowPanel`, `DemoControls`, `Showcase`, `BR-*`, nombres de fixtures o lenguaje backend en experiencia cliente.
- ADMIN usa tablas/listas para densidad operacional, pero mobile no puede depender solo de `overflow-x-auto`.
- GRADUATE usa listas simples y controles táctiles; desktop no puede ser solo un móvil más ancho.
- El evento es el contexto principal de las superficies ADMIN; no repetir identidad del evento en cada nivel.
- Mesas/croquis es workspace visual y el canvas debe dominar.
- Switch solo para configuración binaria reversible.
- Las líneas/bordes no son sistema de layout; usarlas solo cuando mejoren escaneo o delimiten un control/tabla/workspace.
- No inventar métricas para llenar espacio.
- Funciones `DEFER UI` pueden permanecer implementadas técnicamente, pero no deben dominar navegación MVP.
- No crear un segundo design system.

## Reglas específicas GRADUATE

- Navegación principal: `Inicio | Mi grupo | Pagos | Más`.
- Inicio prioriza un siguiente paso, no dashboard.
- Pagos usa concepto `Abonar` cuando corresponda y no fuerza una mensualidad exacta desde UI.
- Mesa: canvas protagonista; lista es fallback.
- Platillos: persona → opción, sin catálogo duplicado.
- Contrato: documento continuo, sin scroll interno de términos.
- Notificaciones no son superficie MVP prioritaria hasta confirmación.

## Reglas específicas ADMIN

- Inicio es bandeja operativa + búsqueda, no dashboard global.
- EventNav máximo 6 destinos principales + `Más`.
- Expediente de graduado no usa 9 tabs; debe ser ficha operacional.
- Pagos MVP: `Cartera | Movimientos | Comprobantes`.
- `Registrar abono` no obliga a seleccionar cuota exacta si el negocio permite monto mayor al mínimo.
- Conciliación queda fuera de navegación MVP mientras su modelo no esté alineado al dominio real.
- Termos prioriza producción/entrega y lista de entrega.
- Reportes prioriza cortes semanal/mensual y exportación del evento, no catálogo de report cards.
- Auditoría se conserva como historial secundario, no tab primario.

## Responsive gate

No aceptar DONE sin inspección real en navegador.

Mínimos:

```text
390×844
768×1024
1024×768
1440×900
```

Falla responsive si:

- tabs/navegación requieren scroll horizontal permanente en tablet;
- botones salen de viewport;
- desktop es una columna mobile ensanchada;
- tablas móviles solo se resuelven con scroll horizontal;
- canvas pierde protagonismo;
- aparecen cards apiladas para convertir una tabla en móvil.

## Referencia externa

Puede consultarse `https://ui-ux-pro-max-skill.com/` para heurísticas. La documentación local vigente prevalece.

## Test de salida

Si al quitar el logo la pantalla parece una plantilla genérica de CRM/ERP/fintech, o si muestra más información de la necesaria para ejecutar la tarea, el trabajo no está terminado.
