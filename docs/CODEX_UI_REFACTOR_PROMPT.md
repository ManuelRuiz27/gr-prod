# Codex Prompt — Plataforma GR UI Refactor v2

## Objetivo

Refactorizar la interfaz de Plataforma GR para pasar de una composición SaaS genérica/card-heavy a una interfaz limpia, especializada en graduaciones, orientada a evento y consistente con el baseline UI/UX v2.

## Lectura obligatoria antes de tocar código

Lee en este orden:

1. `docs/UI_DESIGN_SYSTEM.md`
2. `docs/SCREEN_VISUAL_SPECIFICATIONS.md`
3. `docs/UI_REFACTOR_ACCEPTANCE.md`
4. `docs/UI_REFACTOR_ROADMAP.md`
5. `.agents/rules/ui-ux-v2.md`
6. `docs/UX_FLOWS.md`
7. `docs/ROLES_PERMISSIONS.md`
8. `docs/BUSINESS_RULES.md`
9. `docs/API_CONTRACTS.md`
10. `docs/REPOSITORY_SOURCE_OF_TRUTH.md`

Si existe otra regla de frontend, léela también. En caso de conflicto visual, el baseline UI/UX v2 anterior tiene prioridad; en reglas de negocio, permisos, API y datos prevalecen sus documentos de dominio.

## Restricción principal

Este ticket es un **refactor de presentación e interacción**.

NO modificar:

- reglas de negocio;
- cálculos financieros;
- contratos API;
- endpoints;
- permisos;
- modelo de datos;
- estados de dominio;
- fixtures para ocultar fallas;
- comportamiento backend.

Si una necesidad visual pareciera requerir alguno de esos cambios, detente en esa parte, documenta el bloqueo y continúa con el resto del refactor.

## Dirección UI obligatoria

La nueva UI debe:

- sentirse específica para operación de graduaciones;
- usar el evento como contexto principal;
- presentar información directamente sobre la página;
- usar tipografía, whitespace, alineación y divisores para jerarquía;
- usar listas/tablas para densidad;
- usar drawers para detalle contextual cuando corresponda;
- usar canvas dominante en croquis;
- usar controles amigables: botones, switches, radio y segmented controls según semántica;
- conservar identidad obsidian/plata/dorado sin decoración excesiva;
- mantener responsive, accesibilidad, loading, empty, error y success states.

## Anti-patterns prohibidos

No introducir ni conservar por comodidad:

- grids de KPI cards;
- `KpiCard` para métricas;
- `Card` como contenedor universal;
- cards para navegación;
- cards por registro;
- mosaicos de accesos rápidos;
- icon-boxes decorativos;
- badges redundantes;
- subtítulos que repiten el título;
- supporting text sin valor;
- textos como `Panorama general`, `Operaciones clave`, `Módulos directos`, `En gestión operativa`;
- lenguaje técnico visible al usuario cuando exista lenguaje natural;
- glassmorphism o gradients como estructura principal.

No elimines `Card` del design system hasta migrar todos sus consumidores y confirmar qué usos semánticos siguen siendo válidos.

## Orden de ejecución

Sigue `docs/UI_REFACTOR_ROADMAP.md`.

### Fase 1 — Shared UI + shells

Audita primero:

- `frontend/src/design-system/**`
- ADMIN shell
- GRADUATE shell

Marca `KpiCard` como deprecated y crea únicamente primitives realmente reutilizables. No construyas un segundo design system.

### Fase 2 — ADMIN global

Refactoriza:

- `frontend/src/pages/admin/AdminDashboardScreen.tsx`
- `frontend/src/pages/admin/AdminEventsScreen.tsx`
- flujo create/edit event

Dashboard esperado conceptualmente:

```text
3 eventos activos                         + Nuevo evento

$1,248,000 cobrado   $182,000 pendiente   $25,000 vencido
────────────────────────────────────────────────────────
Requieren atención
8 pagos por revisar                                  →

Próximos eventos
Derecho 2027      UASLP      18 jun      142 personas →
```

Sin KPI cards ni Accesos rápidos.

### Fase 3 — ADMIN evento

Refactoriza:

- `AdminEventOverviewScreen.tsx`
- `AdminEventGraduatesScreen.tsx`
- `AdminEventPaymentsScreen.tsx`
- validación de comprobantes
- `AdminEventMealsScreen.tsx`
- `AdminEventThermosScreen.tsx`

El contexto del evento debe permanecer visible en shell y no repetirse en cada pantalla.

### Fase 4 — Mesas / croquis

Refactoriza:

- `AdminEventTablesScreen.tsx`
- componentes asociados

El canvas debe dominar. Toolbar compacta + drawer contextual + listado alternativo accesible. No modificar reglas de capacidad o asignación.

### Fase 5 — Reportes / configuración / auditoría

Refactoriza:

- `AdminEventReportsScreen.tsx`
- `AdminEventSettingsScreen.tsx`
- auditoría

Reportes: filas agrupadas, no cards. Configuración: secciones con divisores y switches solo para booleanos reversibles.

### Fase 6 — GRADUATE

Refactoriza:

- `GraduateHomeScreen.tsx`
- `GraduatePaymentsScreen.tsx`
- `GraduateGroupScreen.tsx`
- `GraduateTableScreen.tsx`
- `GraduateMealsScreen.tsx`
- `GraduateThermoScreen.tsx`
- `GraduateContractScreen.tsx`
- `GraduateNotificationsScreen.tsx`
- `GraduateMoreScreen.tsx`

Inicio esperado conceptualmente:

```text
Hola, Manuel

Derecho · UASLP
Generación 2027
18 de junio

Próximo pago
$2,500
15 de septiembre
██████████████░░░░░ 68%
$12,500 de $18,500
                                      Pagar ahora

──────────────────────────────
Mi graduación
Invitados               8 de 10  →
Mesa                    Mesa 12  →
Platillos            Completado  →
Termo                 Disponible →
```

No cards de navegación.

## UI UX Pro Max

Puedes consultar `https://ui-ux-pro-max-skill.com/` como apoyo para heurísticas de UX, accesibilidad, responsive y React/Tailwind. No copies una plantilla generada. Si una recomendación contradice la documentación local o devuelve una UI SaaS card-heavy, descártala.

## QA obligatorio

Usa `docs/UI_REFACTOR_ACCEPTANCE.md` como Definition of Done.

Antes de terminar:

1. ejecuta build frontend;
2. ejecuta tests existentes;
3. corrige regresiones causadas por este refactor;
4. revisa ADMIN desktop/tablet;
5. revisa GRADUATE mobile/desktop;
6. valida navegación y rutas;
7. valida loading/empty/error/success;
8. valida focus/keyboard/labels;
9. busca usos restantes de `KpiCard`, `SkeletonKpi`, `Card`, `SkeletonCard`;
10. elimina componentes deprecated solo cuando no queden consumidores o sus usos restantes sean innecesarios.

## Evidencia de cierre

Devuelve:

- resumen ejecutivo de cambios;
- lista de pantallas modificadas;
- lista de componentes modificados/deprecated/eliminados;
- archivos modificados;
- resultado de build;
- resultado de tests;
- regresiones encontradas/corregidas;
- usos restantes de `Card` y justificación semántica de cada categoría;
- confirmación de que no modificaste backend, API, permisos, modelo de datos ni reglas financieras;
- commit o commits realizados.

## Criterio final

Haz esta prueba visual:

> Si quitamos el logo, ¿la pantalla sigue pareciendo inequívocamente una herramienta para operar graduaciones?

Si la respuesta es no, no está terminada.

No pidas aprobación intermedia salvo que encuentres un conflicto real entre documentación vinculante o un cambio que necesariamente implique reglas de negocio. En cualquier otro caso, aplica el criterio documentado y completa el refactor.