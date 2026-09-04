# Plataforma GR — Sistema de Diseño Visual

**Documento:** `UI_DESIGN_SYSTEM.md`  
**Versión:** 2.0  
**Estado:** Baseline visual vinculante  
**Fecha:** 3 de septiembre de 2026  
**Aplica a:** ADMIN y GRADUATE

## 1. Dirección

Plataforma GR debe sentirse como una herramienta especializada para operar graduaciones, no como un dashboard SaaS genérico.

Principios obligatorios:

- información directamente sobre la página;
- jerarquía por tipografía, espacio y alineación;
- contenedores solo cuando tengan función semántica;
- contexto del evento persistente;
- acciones expresadas con lenguaje del negocio;
- progressive disclosure;
- densidad alta donde existe operación masiva;
- interacción simple y táctil en GRADUATE.

Queda explícitamente prohibido usar cards, KPIs, badges, iconos o subtítulos como decoración o relleno visual.

## 2. Regla anti-cardification

`Card` deja de ser el contenedor predeterminado.

### No usar Card para

- métricas;
- navegación;
- accesos rápidos;
- filas de listas;
- resumen financiero;
- selección de platillos;
- estados simples;
- bloques de configuración;
- reportes disponibles;
- opciones de menú.

### Card permitida únicamente cuando el contenido es un objeto autocontenido

Ejemplos:

- recibo o comprobante;
- preview documental;
- contrato;
- preview de evidencia;
- modal/drawer con entidad propia;
- superficie excepcional cuya separación semántica sea necesaria.

`KpiCard` queda **deprecated** para nueva implementación.

## 3. Jerarquía visual

Orden preferido:

1. título o contexto;
2. dato principal;
3. acción primaria;
4. información secundaria;
5. detalle operativo.

Usar separadores de 1px, whitespace y agrupación tipográfica antes que cajas.

No repetir el mismo concepto en título + subtítulo + supporting text.

Ejemplo incorrecto:

```text
Resumen general
Panorama general de eventos, cartera y operaciones activas
Eventos activos
En gestión operativa
```

Ejemplo correcto:

```text
3 eventos activos
$1,248,000 cobrado   $182,000 pendiente   $25,000 vencido
```

## 4. Lenguaje

Priorizar lenguaje de operación real:

```text
Evento
Graduados
Pagos
Mesas
Platillos
Termos
Reportes
Configuración
```

Evitar texto de interfaz sin valor:

```text
Panorama general
Operaciones clave
Módulos directos
En gestión operativa
Padrón registrado
Recaudación acumulada
```

Los estados técnicos no se muestran al usuario cuando existe una traducción natural.

## 5. Componentes base

### Button

Usar cuando existe una acción explícita.

Variantes:

- primary;
- secondary;
- ghost;
- danger.

Una acción primaria dominante por zona.

### Switch

Usar exclusivamente para una preferencia binaria cuyo cambio tenga efecto inmediato y reversible.

Ejemplo:

```text
Permitir pagos en línea    ●
```

No usar switch para acciones irreversibles, navegación o confirmaciones financieras.

### Segmented control

Usar para 2–4 opciones mutuamente excluyentes de cambio inmediato de vista o configuración simple.

### Table / data list

Patrón principal para ADMIN cuando existe volumen.

- sin Card exterior;
- header discreto;
- filas clicables cuando toda la fila abre detalle;
- acciones secundarias en menú contextual;
- sticky header cuando aplique;
- filtros compactos;
- drawer para edición contextual cuando evita perder contexto.

### Drawer

Preferido para:

- expediente rápido;
- filtros;
- detalle de pago;
- asignación de mesa;
- notas;
- configuración contextual.

### Badge

Solo para estados que requieren reconocimiento rápido. No repetir un estado que ya está claro por contexto.

### Inline metric

Sustituye KPI cards.

```text
$1,248,000 cobrado
$182,000 pendiente
$25,000 vencido
```

Puede acompañarse con una barra de progreso cuando exista relación parte/total.

### Progress

Se usa cuando existe avance real medible. Sin card obligatoria.

### Empty state

Debe ser corto:

- qué falta;
- acción disponible.

Evitar párrafos explicativos si un botón y una frase bastan.

## 6. ADMIN

### Arquitectura

La unidad de contexto principal es el evento.

Global:

```text
Inicio
Eventos
```

Dentro de evento:

```text
Resumen
Graduados
Pagos
Mesas
Platillos
Termos
Reportes
Configuración
Auditoría
```

Evitar navegación global duplicada hacia dominios que dependen de un evento seleccionado.

### Densidad

ADMIN es desktop-first y puede ser denso. La limpieza no significa desperdiciar espacio ni convertir tablas en tarjetas.

## 7. GRADUATE

Mobile-first.

Preferir:

- listas simples;
- números grandes;
- una acción clara;
- controles táctiles;
- navegación corta;
- progreso financiero directo;
- texto natural.

Prohibido convertir cada opción navegable en card.

## 8. Croquis

El módulo de mesas es una superficie especializada y no debe parecer una página de dashboard.

Patrón:

```text
toolbar compacta
+ canvas dominante
+ drawer contextual
+ lista accesible alternativa
```

Las mesas se manipulan como objetos visuales directos. Evitar cards dentro del canvas.

## 9. Paleta y tipografía

Se conserva la identidad existente:

- obsidian/negro como base;
- plata para jerarquía y bordes;
- dorado como acento restringido;
- Inter para UI/datos;
- Cormorant Garamond solo para momentos ceremoniales o encabezados donde aporte identidad.

No usar dorado como borde o icono universal.

## 10. Accesibilidad

- WCAG AA en texto funcional;
- focus visible;
- target táctil recomendado >= 44x44 px en GRADUATE;
- no depender solo del color;
- labels persistentes en formularios;
- canvas acompañado por alternativa navegable.

## 11. Reglas para agentes

Antes de modificar UI, el agente debe leer:

1. `docs/UI_DESIGN_SYSTEM.md`;
2. `docs/SCREEN_VISUAL_SPECIFICATIONS.md`;
3. `docs/UI_REFACTOR_ACCEPTANCE.md`;
4. `docs/UX_FLOWS.md`;
5. `docs/ROLES_PERMISSIONS.md`.

Como referencia externa de heurísticas puede usarse UI UX Pro Max Skill (`ui-ux-pro-max-skill.com`), especialmente sus reglas de UX, accesibilidad, responsive y patrones React/Tailwind. Esa referencia no puede sustituir las reglas específicas de Plataforma GR.

## 12. Regla de cierre

Si una pantalla puede conservar la misma claridad quitando una caja, subtítulo, badge o icono, se quita.

Si una pantalla parece intercambiable con un CRM/ERP/fintech genérico, no cumple este baseline.