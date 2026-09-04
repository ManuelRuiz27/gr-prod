# Plataforma GR — Guía de Ejecución Visual para Antigravity

**Versión:** 2.0  
**Estado:** Vinculante  
**Fecha:** 3 de septiembre de 2026

## 1. Orden de lectura obligatorio

Antes de proponer o generar UI:

1. `docs/UI_DESIGN_SYSTEM.md`;
2. `docs/SCREEN_VISUAL_SPECIFICATIONS.md`;
3. `docs/UI_REFACTOR_ACCEPTANCE.md`;
4. `docs/UX_FLOWS.md`;
5. `docs/ROLES_PERMISSIONS.md`;
6. `docs/BUSINESS_RULES.md` cuando la pantalla toque estados o reglas operativas.

## 2. Dirección visual

La interfaz debe ser:

- limpia;
- sobria;
- especializada en graduaciones;
- orientada a evento;
- operativa;
- de baja carga cognitiva;
- sin apariencia de plantilla SaaS genérica.

No introducir un patrón por familiaridad técnica si no está respaldado por el baseline.

## 3. Anti-patrones prohibidos

No generar:

- grids de KPI cards;
- card por métrica;
- card por opción navegable;
- card por registro;
- mosaicos de “accesos rápidos”;
- iconos dentro de cajas decorativas;
- subtítulos que repiten el título;
- badges para estados ya evidentes;
- textos tipo “panorama general”, “módulos”, “operaciones clave” o “gestión operativa”;
- dashboards intercambiables con CRM/ERP/fintech;
- glassmorphism o gradients como estructura de información.

## 4. Patrones preferidos

- inline metrics;
- tablas/listas;
- filas clicables;
- drawers contextuales;
- tabs de evento;
- hairline dividers;
- whitespace;
- jerarquía tipográfica;
- switches para configuración binaria reversible;
- segmented controls para opciones cortas;
- radio/select para selección de platillo;
- canvas dominante para croquis.

## 5. Referencias de modelo mental

Las referencias externas sirven para entender interacción, no para copiar estilo:

- Canva: manipulación directa y lienzo;
- Aisle Planner: evento como contexto;
- HoneyBook: excepciones y flujo operativo;
- Planning Pod: relación croquis/mesas/personas;
- herramientas tipo Sheets: densidad operativa y edición masiva.

## 6. UI UX Pro Max Skill

Puede usarse `https://ui-ux-pro-max-skill.com/` como apoyo para heurísticas de UX, accesibilidad, responsive, React/Tailwind y revisión de anti-patterns. El sitio describe reglas y generadores de diseño, pero **no sustituye** las decisiones específicas de Plataforma GR. La documentación local tiene prioridad.

Para este proyecto, cualquier recomendación externa que proponga card-heavy dashboard, glassmorphism o una estética SaaS genérica debe descartarse.

## 7. Reglas por rol

### ADMIN

- desktop-first;
- alta densidad controlada;
- evento como contexto;
- tablas antes que cards;
- drawer antes que nueva página cuando el detalle sea contextual;
- números financieros visibles sin cajas decorativas.

### GRADUATE

- mobile-first;
- una acción dominante;
- lectura vertical;
- navegación corta;
- listas simples;
- targets táctiles amplios;
- cards no son menú.

## 8. Criterio final

Antes de aprobar un mock, responder:

1. ¿Se reconoce que es una plataforma de graduaciones sin leer el logo?
2. ¿Hay alguna caja que pueda quitarse sin perder significado?
3. ¿Hay texto que explica una UI que debería explicarse sola?
4. ¿La acción principal es evidente?
5. ¿Se preserva el contexto del evento?
6. ¿Un planner entendería la pantalla usando modelos mentales conocidos?

Si 1 es `no` o cualquiera de 2–5 es `sí`, el mock no está aprobado.