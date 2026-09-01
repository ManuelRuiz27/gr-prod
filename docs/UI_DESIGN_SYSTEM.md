# Plataforma GR — Sistema de Diseño Visual

**Documento:** `UI_DESIGN_SYSTEM.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline visual vinculante para frontend  
**Fecha:** 31 de agosto de 2026  
**Fuentes:** `PRODUCT_SCOPE.md`, `UX_FLOWS.md`, `ROLES_PERMISSIONS.md`  
**Propósito:** Definir identidad visual, tokens, componentes, responsive, motion, accesibilidad y criterios de performance para ADMIN y GRADUATE.

---

# 1. Dirección visual

Plataforma GR debe comunicar simultáneamente:

```text
elegancia
+ celebración
+ formalidad
+ control operativo
```

La referencia conceptual es una **noche de graduación premium**: negro y plateado como estructura, dorado como acento escaso y festivo.

No debe parecer:

- banca/fintech fría;
- dashboard SaaS genérico;
- invitación recargada;
- casino, antro o interfaz con glitter excesivo;
- producto infantil o caricaturesco.

La decoración nunca compite con montos, fechas, estados, formularios o CTAs.

---

# 2. Principios

## DS-P-001 — Elegancia sobria
Fondos oscuros, superficies limpias, contraste metálico y detalles dorados selectivos.

## DS-P-002 — Fiesta controlada
El carácter celebratorio aparece en momentos de progreso/éxito y superficies de bienvenida, no en cada componente.

## DS-P-003 — Información primero
En pagos, cancelaciones, reportes, contratos y configuración, la jerarquía de información prevalece sobre la decoración.

## DS-P-004 — Dos densidades

### ADMIN
- desktop-first;
- alta densidad controlada;
- tablas, filtros, KPIs y acciones rápidas;
- navegación persistente.

### GRADUATE
- mobile-first;
- baja carga cognitiva;
- cards, progreso y CTAs claros;
- una tarea principal por pantalla cuando sea posible.

## DS-P-005 — Sin deuda visual
No crear componentes únicos por pantalla si un patrón reutilizable resuelve el caso.

---

# 3. Paleta oficial

## 3.1 Base

| Token | Valor | Uso |
|---|---:|---|
| `--color-bg-950` | `#08090A` | fondo raíz |
| `--color-bg-900` | `#0D0F12` | fondo principal |
| `--color-bg-850` | `#12151A` | superficies |
| `--color-bg-800` | `#181C22` | superficies elevadas |
| `--color-bg-750` | `#20252C` | hover/selected neutro |

## 3.2 Plateados

| Token | Valor | Uso |
|---|---:|---|
| `--color-silver-100` | `#F1F3F5` | texto principal |
| `--color-silver-200` | `#E1E5E9` | títulos secundarios |
| `--color-silver-300` | `#C8CDD3` | elementos metálicos |
| `--color-silver-400` | `#A5ADB7` | texto secundario |
| `--color-silver-500` | `#7E8792` | texto muted |
| `--color-silver-700` | `#3A414A` | bordes fuertes |
| `--color-silver-800` | `#292F37` | bordes/superficies |

## 3.3 Dorado de acento

| Token | Valor | Uso |
|---|---:|---|
| `--color-gold-200` | `#E8D49A` | highlight suave |
| `--color-gold-300` | `#D9BF73` | hover/acento |
| `--color-gold-400` | `#C6A85B` | acento oficial |
| `--color-gold-500` | `#A98A42` | pressed/borde |
| `--color-gold-700` | `#6D5728` | fondos tonales |

El dorado no debe cubrir grandes áreas. Debe reservarse para:

- CTA primario;
- foco activo;
- progreso importante;
- detalles decorativos;
- estados celebratorios;
- pequeños separators/borders premium.

No usar dorado para todos los íconos, títulos o bordes.

## 3.4 Semánticos

| Token | Valor |
|---|---:|
| `--color-success` | `#4F9B73` |
| `--color-warning` | `#C28A36` |
| `--color-danger` | `#B85656` |
| `--color-info` | `#6E8FB8` |

Los estados nunca dependen únicamente del color: incluir texto/icono/label.

---

# 4. Tipografía

## 4.1 Familias

### Display / títulos ceremoniales

```text
Cormorant Garamond
```

Uso restringido a:

- H1/H2 seleccionados;
- bienvenida GRADUATE;
- contrato/folio;
- momentos celebratorios;
- headers de evento donde mejore la identidad.

### UI / datos / formularios

```text
Inter
```

Uso obligatorio para:

- tablas;
- labels;
- inputs;
- montos;
- fechas;
- botones;
- navegación;
- body;
- reportes.

Fallback:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Display fallback:

```css
font-family: "Cormorant Garamond", Georgia, "Times New Roman", serif;
```

## 4.2 Performance tipográfica

- cargar únicamente pesos realmente usados;
- preferir variable font cuando la estrategia del proyecto lo soporte;
- `font-display: swap`;
- no bloquear first paint esperando fuente decorativa;
- no usar Cormorant en tablas ni body denso;
- evitar múltiples familias adicionales sin Change Request visual.

## 4.3 Escala

### Desktop

| Rol | Size / Line |
|---|---|
| Display | `40 / 48` |
| H1 | `32 / 40` |
| H2 | `24 / 32` |
| H3 | `20 / 28` |
| Body L | `18 / 28` |
| Body | `16 / 24` |
| Body S | `14 / 20` |
| Caption | `12 / 16` |

### Mobile

| Rol | Size / Line |
|---|---|
| Display | `32 / 40` |
| H1 | `28 / 36` |
| H2 | `22 / 30` |
| H3 | `18 / 26` |
| Body | `16 / 24` |
| Body S | `14 / 20` |
| Caption | `12 / 16` |

---

# 5. Spacing, radius y layout

## 5.1 Spacing scale

```text
4, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

No introducir valores arbitrarios salvo necesidad demostrada.

## 5.2 Radius

```text
input/control: 12px
card:          18–20px
drawer/modal:  22–24px
pill/badge:    999px
```

## 5.3 ADMIN grid

- 12 columnas;
- sidebar persistente >= 1200px;
- contenido máximo recomendado 1440px;
- tablas priorizan ancho útil sobre decoración.

## 5.4 GRADUATE grid

- mobile-first, 4 columnas;
- lectura vertical;
- gutters mínimos 16px móvil / 24px tablet;
- contenido principal centrado en pantallas amplias.

## 5.5 Breakpoints de referencia

```text
sm: 640
md: 768
lg: 1024
xl: 1280
2xl: 1536
```

Se pueden mapear a breakpoints existentes del proyecto; no duplicar sistemas.

---

# 6. Superficies

## DS-SURF-001 — Card base

- fondo `bg-850`;
- borde 1px `silver-800`;
- sombra sutil;
- sin glassmorphism excesivo.

## DS-SURF-002 — Card premium

Uso limitado a evento principal, contrato, liquidado o momentos destacados.

Puede usar:

- borde/gradient dorado muy tenue;
- glow controlado;
- serif display.

## DS-SURF-003 — Decoración

Se permiten:

- gradientes CSS oscuros;
- líneas metálicas;
- halos dorados muy suaves;
- bokeh abstracto estático muy discreto.

Evitar:

- video de fondo en pantallas operativas;
- partículas permanentes;
- canvas decorativo continuo;
- assets pesados sin justificación.

---

# 7. Componentes base

## DS-CMP-001 — Button

Variantes:

```text
primary
secondary
ghost
danger
```

`primary`: dorado, texto oscuro, una acción dominante por zona/pantalla.

## DS-CMP-002 — Input

- label persistente;
- fondo oscuro elevado;
- foco dorado sutil;
- error semántico;
- helper text cuando aplique.

## DS-CMP-003 — Select / Date / Search
Mismo lenguaje visual y altura que Input.

## DS-CMP-004 — KPI Card
Contenido mínimo:

```text
label
value
supporting text/status
optional icon
```

El valor domina; no usar charts si un número basta.

## DS-CMP-005 — Table

ADMIN:

- header legible;
- densidad media/compacta;
- hover tenue;
- acciones alineadas;
- sticky header cuando tabla larga;
- paginación/filtros consistentes;
- responsive con horizontal scroll controlado o adaptación por prioridad de columnas.

## DS-CMP-006 — Badge
Variantes semánticas y neutrales. El badge no sustituye texto explicativo en estados críticos.

## DS-CMP-007 — Modal
Para confirmaciones, revisión, cancelación, aprobación/rechazo y detalle corto. No usar para formularios multipaso extensos.

## DS-CMP-008 — Drawer
Preferido para filtros, detalle lateral, notas y edición contextual sin perder listado.

## DS-CMP-009 — Tabs
Estado activo con dorado restringido; evitar tabs decorativos sin función clara.

## DS-CMP-010 — Skeleton
Usar estructura cercana al contenido final; no spinners globales cuando puede renderizarse skeleton.

## DS-CMP-011 — Empty state
Debe explicar:

```text
qué falta
por qué está vacío
qué acción existe, si aplica
```

## DS-CMP-012 — Toast
Feedback breve; nunca única confirmación para cambios financieros críticos.

---

# 8. Estados financieros y operativos

## Financiero visible

```text
Al corriente
Pago próximo
Pago vencido
Liquidado
Pendiente de validación
Pago confirmado
Pago rechazado
```

`Liquidado` puede usar tratamiento celebratorio controlado con dorado + success.

`Vencido` prioriza warning/danger, nunca dorado celebratorio.

## Mesas

```text
Disponible
Parcialmente ocupada
Llena (derivado)
Bloqueada
```

## Termo

```text
Bloqueado
Disponible
Solicitado
En producción
Entregado
```

---

# 9. Motion

## DS-MOT-001
Microinteracción: 150–220 ms.

## DS-MOT-002
Overlay/sección: 220–320 ms.

## DS-MOT-003
Usar easing consistente; no spring exagerado en ADMIN.

## DS-MOT-004
Respetar `prefers-reduced-motion`.

## DS-MOT-005
Celebración puntual permitida en éxito importante, pero debe:

- durar poco;
- no bloquear operación;
- no repetir indefinidamente;
- degradar a feedback estático con reduced motion.

---

# 10. Accesibilidad

## DS-A11Y-001
Contraste WCAG AA para texto funcional y controles principales.

## DS-A11Y-002
Focus visible con teclado.

## DS-A11Y-003
Targets táctiles mínimos recomendados 44x44 CSS px en GRADUATE.

## DS-A11Y-004
No comunicar estado solo por color.

## DS-A11Y-005
Labels de formulario asociados y errores anunciables.

## DS-A11Y-006
Modal/drawer con focus trap, Escape y retorno de foco.

## DS-A11Y-007
Canvas de mesas debe acompañarse de alternativa/listado accesible para acciones críticas.

---

# 11. Performance visual

## DS-PERF-001
No introducir librerías de animación o componentes duplicados si CSS/componentes existentes resuelven el caso.

## DS-PERF-002
Imágenes decorativas optimizadas y lazy-loaded fuera del above-the-fold.

## DS-PERF-003
No cargar assets de celebración pesados en rutas ADMIN ordinarias.

## DS-PERF-004
Evitar blur/backdrop-filter masivo en grandes superficies/tablas.

## DS-PERF-005
Canvas: posición local durante drag; persistencia al terminar interacción conforme `SEATING_MAP.md`.

## DS-PERF-006
La tipografía display no debe bloquear contenido funcional.

---

# 12. Regla de consistencia

Antes de crear un componente nuevo, Antigravity/frontend debe verificar:

1. si ya existe equivalente reusable;
2. si el componente pertenece al design system;
3. si el cambio afecta ambos shells;
4. si introduce un token nuevo;
5. si contradice `SCREEN_VISUAL_SPECIFICATIONS.md`.

Un cambio de color, tipografía, spacing system o patrón global requiere actualización de este documento antes de consolidarse como estándar.