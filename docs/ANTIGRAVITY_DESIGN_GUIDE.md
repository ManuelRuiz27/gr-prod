# Plataforma GR — Guía de Ejecución Visual para Antigravity

**Documento:** `ANTIGRAVITY_DESIGN_GUIDE.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Guía operativa vinculante para trabajo visual  
**Fecha:** 31 de agosto de 2026  
**Propósito:** Permitir que Antigravity diseñe/implemente frontend visual sin asumir rol de Product Manager ni modificar dominio.

---

# 1. Alcance de Antigravity

Antigravity puede:

- construir/refactorizar layouts;
- aplicar design tokens;
- crear/reutilizar componentes visuales;
- mejorar jerarquía, spacing y responsive;
- implementar estados loading/empty/error/success;
- implementar microinteracciones permitidas;
- mejorar accesibilidad visual/interactiva;
- adaptar pantallas existentes al baseline visual.

Antigravity no puede:

- inventar reglas de negocio;
- crear roles/permisos;
- modificar contratos API;
- cambiar estados funcionales;
- alterar cálculos financieros;
- decidir condiciones de cancelación/pagos/mesas;
- cambiar modelo de datos;
- agregar módulos no documentados;
- usar fixtures como fuente normativa.

Si encuentra contradicción entre UI existente y documentación, debe reportarla y respetar documentación normativa.

---

# 2. Lectura obligatoria antes de cada tarea

Orden mínimo:

```text
1. docs/INDEX.md
2. docs/UX_FLOWS.md
3. docs/UI_DESIGN_SYSTEM.md
4. docs/SCREEN_VISUAL_SPECIFICATIONS.md
5. docs/ROLES_PERMISSIONS.md
6. documento específico del dominio afectado
7. docs/ACCEPTANCE_CRITERIA.md (AC-UI y AC del flujo)
```

Para croquis:

```text
docs/SEATING_MAP.md
```

Para pagos/cancelaciones:

```text
docs/FINANCIAL_DOMAIN.md
```

---

# 3. Dirección visual obligatoria

```text
Base: negro / obsidiana
Estructura: plateado
Acento: dorado limitado
Display: Cormorant Garamond
UI/datos: Inter
```

La experiencia debe sentirse:

```text
elegante
premium
celebratoria
ordenada
confiable
```

No debe convertirse en:

```text
fintech fría
SaaS genérico
glitter permanente
casino
invitación sobrecargada
```

---

# 4. Ownership visual

## ADMIN

```text
desktop-first
alta densidad controlada
tables + filters + KPIs
acciones operativas rápidas
```

## GRADUATE

```text
mobile-first
baja carga cognitiva
cards + progreso + CTA
una tarea dominante por contexto
```

No usar exactamente la misma composición para ambos roles solo por reutilizar componentes.

---

# 5. Secuencia visual autorizada

El track visual debe avanzar en este orden salvo ticket explícito:

```text
VIS-01 — tokens + primitives
VIS-02 — ADMIN shell
VIS-03 — GRADUATE shell
VIS-04 — ADMIN dashboard
VIS-05 — GRADUATE home
VIS-06 — ADMIN event/list/detail
VIS-07 — ADMIN graduates/record
VIS-08 — payments/submissions
VIS-09 — contract/group
VIS-10 — seating
VIS-11 — meals/thermo
VIS-12 — cancellation/reports/audit
VIS-13 — responsive/accessibility/polish
```

El roadmap técnico sigue siendo independiente; una pantalla visual basada en fixture no implica que backend relacionado esté DONE.

---

# 6. Regla de implementación

Antes de crear componente nuevo:

1. buscar equivalente existente;
2. verificar si puede adaptarse sin romper contrato;
3. extraer token/primitive si el patrón se repite;
4. evitar duplicar sistemas de Button/Input/Card/Table;
5. preservar rutas y datos salvo ticket que autorice cambio funcional.

---

# 7. Reglas sobre dependencias

- no instalar librerías de UI/animación por conveniencia sin justificar necesidad;
- preferir stack existente;
- no agregar librería pesada para un componente simple;
- no agregar otra fuente tipográfica;
- no introducir icon sets múltiples;
- no sustituir canvas/arquitectura de croquis desde una tarea meramente visual.

---

# 8. Reglas sobre fixtures y mocks

Fixtures sirven para demostrar estados visuales.

No pueden:

- crear campos que no existan en contratos/documentación;
- inventar estados;
- convertir un valor demo en regla global;
- modificar dominio para simplificar una pantalla.

Si falta un dato necesario para renderizar una especificación aprobada:

```text
reportar gap
→ mock tipado temporal compatible con contrato objetivo
→ no inventar API definitiva
```

---

# 9. Estados mínimos por entrega

Cada pantalla intervenida debe cubrir, cuando aplique:

```text
normal
loading
empty
error
success
locked/disabled
responsive
keyboard/focus
```

No aprobar una pantalla solo con happy path de screenshot.

---

# 10. Performance visual

Antigravity debe:

- minimizar assets decorativos;
- evitar blur masivo;
- evitar animación infinita;
- usar lazy loading para assets no críticos;
- mantener fonts con `font-display: swap`;
- no introducir render loops innecesarios;
- preservar estrategia `onDragEnd` del canvas;
- revisar bundle impact cuando agregue dependencia.

---

# 11. Accesibilidad

Obligatorio:

- foco visible;
- teclado en controles y modales;
- targets táctiles adecuados;
- contraste funcional;
- label/error asociado a inputs;
- estados con texto/icono además de color;
- `prefers-reduced-motion`;
- alternativa accesible para acciones de canvas.

---

# 12. Definition of Done visual

```text
[ ] VS-* citado
[ ] UX-* correspondiente respetado
[ ] no regla funcional inventada
[ ] design tokens usados
[ ] componentes reutilizados antes de duplicar
[ ] desktop/mobile según rol
[ ] loading/empty/error resueltos
[ ] focus/keyboard revisado
[ ] reduced motion revisado
[ ] responsive revisado
[ ] lint
[ ] typecheck
[ ] tests existentes verdes
[ ] AC-UI-* aplicables verdes
[ ] sin regresión funcional intencional
```

---

# 13. Plantilla de prompt para Antigravity

```text
Trabaja exclusivamente la capa visual de Plataforma GR para [SCREEN_ID / TICKET].

Antes de modificar código lee, en este orden:
1. docs/INDEX.md
2. docs/UX_FLOWS.md
3. docs/UI_DESIGN_SYSTEM.md
4. docs/SCREEN_VISUAL_SPECIFICATIONS.md
5. docs/ROLES_PERMISSIONS.md
6. [documento de dominio si aplica]
7. docs/ACCEPTANCE_CRITERIA.md

Objetivo:
[objetivo visual exacto]

Pantalla/especificación:
[VS-*]

Restricciones:
- No cambies reglas de negocio.
- No cambies contratos API.
- No agregues estados, roles o módulos.
- No uses fixtures como fuente de verdad.
- Reutiliza primitives existentes antes de duplicar.
- Respeta negro/plateado con dorado como acento.
- Cormorant Garamond solo para display; Inter para UI/datos.
- ADMIN desktop-first; GRADUATE mobile-first.
- Incluye loading, empty, error, responsive, focus y reduced-motion cuando aplique.

Entrega:
1. archivos modificados;
2. decisiones visuales;
3. estados cubiertos;
4. evidencia de lint/typecheck/tests;
5. cualquier gap documental/funcional detectado sin resolverlo por tu cuenta.
```

---

# 14. Regla final

Antigravity decide **cómo se presenta una experiencia ya aprobada**.

No decide **qué hace el negocio**.