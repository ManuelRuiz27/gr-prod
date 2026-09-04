# Plataforma GR — Roadmap de Refactor UI v2

**Fecha:** 3 de septiembre de 2026  
**Estado:** READY

## Objetivo

Transformar la UI actual de una composición SaaS genérica y card-heavy a una interfaz limpia, domain-first y orientada a evento, sin alterar reglas de negocio ni backend.

## Fase UI-01 — Baseline y shell

- actualizar componentes base del design system;
- marcar `KpiCard` como deprecated;
- crear patrones `InlineMetric`, `FlatSection`, `SettingsRow`, `ActionRow` si realmente reducen duplicación;
- ajustar ADMIN shell a navegación global mínima + contexto del evento;
- ajustar GRADUATE shell a navegación corta y mobile-first.

**No borrar Card todavía**: primero migrar consumidores.

## Fase UI-02 — ADMIN global

Pantallas:

- `AdminDashboardScreen.tsx`;
- `AdminEventsScreen.tsx`;
- creación/edición de evento.

Objetivos:

- eliminar KPI cards;
- eliminar accesos rápidos;
- eliminar Card exterior de tablas/listas;
- reducir copy redundante;
- convertir filas en navegación directa.

## Fase UI-03 — ADMIN evento

Pantallas:

- `AdminEventOverviewScreen.tsx`;
- `AdminEventGraduatesScreen.tsx`;
- `AdminEventPaymentsScreen.tsx`;
- validación de comprobantes;
- `AdminEventMealsScreen.tsx`;
- `AdminEventThermosScreen.tsx`.

Objetivos:

- contexto persistente;
- métricas inline;
- tablas/listas planas;
- drawers para detalle contextual;
- menos badges e iconografía decorativa.

## Fase UI-04 — Croquis

Pantalla:

- `AdminEventTablesScreen.tsx` y componentes asociados.

Objetivos:

- canvas dominante;
- toolbar compacta;
- inventario/asignaciones fuera de cards;
- drawer contextual;
- conservar accesibilidad alternativa;
- no modificar reglas de capacidad/asignación.

## Fase UI-05 — Reportes y configuración

Pantallas:

- `AdminEventReportsScreen.tsx`;
- `AdminEventSettingsScreen.tsx`;
- auditoría.

Objetivos:

- reportes como filas agrupadas, no catálogo de cards;
- configuración por secciones/divisores;
- switches solo para booleanos reversibles;
- reducir responsabilidad visual del archivo de reportes sin alterar salidas.

## Fase UI-06 — GRADUATE

Pantallas:

- `GraduateHomeScreen.tsx`;
- `GraduatePaymentsScreen.tsx`;
- `GraduateGroupScreen.tsx`;
- `GraduateTableScreen.tsx`;
- `GraduateMealsScreen.tsx`;
- `GraduateThermoScreen.tsx`;
- `GraduateContractScreen.tsx`;
- `GraduateNotificationsScreen.tsx`;
- `GraduateMoreScreen.tsx`.

Objetivos:

- quitar cards de navegación;
- quitar copy duplicado;
- próximo pago/progreso inline;
- listas simples;
- controles táctiles claros;
- preservar identidad premium sin decorarla en exceso.

## Fase UI-07 — Limpieza del design system

Después de migrar consumidores:

- buscar usos de `KpiCard`, `SkeletonKpi`, `Card` y `SkeletonCard`;
- eliminar componentes sin consumidores;
- mantener Card solo si existen usos semánticos aprobados;
- eliminar tokens/sombras/radius exclusivos de cardification si quedaron huérfanos;
- evitar crear un segundo set de componentes duplicados.

## Fase UI-08 — QA visual y regresión

Validar:

- build;
- tests;
- desktop ADMIN;
- tablet ADMIN;
- mobile GRADUATE;
- keyboard/focus;
- loading/empty/error;
- navegación;
- flujos financieros existentes;
- sin cambios API/backend.

Usar `docs/UI_REFACTOR_ACCEPTANCE.md` como Definition of Done.

## Orden de commits recomendado

```text
refactor(ui): simplify shared visual primitives
refactor(admin): simplify global administration surfaces
refactor(admin): simplify event operational surfaces
refactor(seating): make canvas the primary workspace
refactor(graduate): simplify graduate experience
chore(ui): remove deprecated card-heavy primitives
test(ui): cover clean UI regression states
```

Cada commit debe ser revisable y no mezclar cambios de negocio.