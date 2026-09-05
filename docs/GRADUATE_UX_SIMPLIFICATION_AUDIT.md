# Plataforma GR — Auditoría y correcciones UX GRADUATE

**Fecha:** 5 de septiembre de 2026  
**Estado:** VINCULANTE para la siguiente iteración de frontend  
**Objetivo:** corregir la sobrecarga visual, dashboardización, cardificación residual y falta de responsive real del flujo GRADUATE.

> [!IMPORTANT]
> Este documento corrige la **composición, prioridad de información, navegación visible y responsive** del baseline visual anterior. No cambia reglas de negocio, permisos, contratos API ni invariantes financieras. Si existe contradicción visual con `UX_FLOWS.md`, `SCREEN_VISUAL_SPECIFICATIONS.md`, `UI_REFACTOR_*` o la implementación actual, prevalece este documento para GRADUATE.

---

## 1. Problema detectado

La interfaz GRADUATE sigue presentando demasiada información simultánea y varias pantallas se comportan como pequeños dashboards. El refactor anterior redujo el uso literal de `Card`, pero no redujo suficientemente:

- métricas no necesarias para la tarea inmediata;
- secciones redundantes;
- badges decorativos;
- líneas divisorias invasivas;
- navegación y contexto repetidos;
- paneles técnicos de demo;
- layouts móviles simplemente ensanchados en tablet/desktop.

La experiencia objetivo debe responder primero a:

```text
¿Qué tengo que hacer ahora?
¿Cuánto debo / cuál es mi próximo abono?
¿Quién integra mi grupo?
¿Dónde están mis lugares?
¿Qué platillo tiene cada persona?
¿Mi termo ya está disponible?
```

No debe intentar mostrar el estado completo de la membresía en cada pantalla.

---

# 2. Reglas transversales obligatorias

## 2.1 Progressive disclosure real

Mostrar solo información necesaria para la tarea de la pantalla. Datos secundarios deben ir a detalle, drawer, bottom sheet o pantalla específica.

## 2.2 Cards

- `Card` no es layout.
- No convertir cada persona, mesa, estado o resumen en card.
- Una card solo es válida para un objeto autónomo real: documento, comprobante, evidencia o preview.

## 2.3 Líneas y bordes

Nueva regla:

> Una línea solo existe si ayuda a distinguir dos objetos que el usuario necesita comparar o escanear.

No usar como sistema general de layout:

```text
border-x
border-y
border-t
border-b
divide-y
<hr>
```

Priorizar espacio, tipografía, alineación y jerarquía.

## 2.4 Demo técnica

`DemoFlowPanel`, `DemoControls`, estados técnicos y textos como “modo visual”, “backend”, `BR-*`, fixtures o preview técnico NO deben aparecer en la experiencia que ve el cliente.

Si se necesitan para QA:

```text
/showcase
?debugDemo=1
modo interno equivalente
```

## 2.5 Responsive

### Mobile < 640 px
- full-width;
- gutters ~16 px;
- bottom navigation;
- CTA principal accesible con pulgar;
- drawers → bottom sheets cuando sea más natural;
- tablas → listas densas, no cards.

### Tablet 640–1023 px
- contenido hasta ~760–840 px según tarea;
- formularios pueden usar 2 columnas;
- mapas/croquis usan casi todo el viewport;
- paneles auxiliares como drawer.

### Desktop >= 1024 px
- no renderizar un “teléfono gigante” centrado;
- contenido útil hasta ~960–1100 px;
- permitir layouts de 2 zonas para contrato/pagos/mapa cuando aporte valor;
- bottom-nav puede cambiar a navegación horizontal/rail compacto.

---

# 3. Shell y navegación — P0

## Estado actual

El shell se limita a crecer `max-w-md → max-w-xl → max-w-2xl`, conserva bottom-nav móvil y agrega bordes persistentes.

## Corrección

Navegación principal obligatoria:

```text
Inicio | Mi grupo | Pagos | Más
```

No usar `Mi graduación` como sustituto de `Mi grupo`.

### Header

En subpantallas:

```text
‹   Platillos
```

No repetir simultáneamente:
- nombre del evento;
- nombre del graduado;
- mesa;
- perfil;
- título de pantalla;
- subtítulo del evento.

Eliminar borde lateral general del shell.

---

# 4. Inicio `/graduate` — P0

## Objetivo

Responder “qué tengo que hacer ahora”.

## Mantener

- saludo;
- evento + fecha + lugar;
- un siguiente paso prioritario;
- lista breve de estado de grupo/mesa/platillos/termo.

## Quitar

- dashboard financiero detallado;
- múltiples métricas simultáneas;
- información repetida de `Pagos`;
- badges innecesarios;
- porcentajes si no provocan una acción.

## Composición objetivo

```text
Hola, Andrea

Graduación Derecho 2027
19 junio · Centro de Convenciones

Próximo pendiente
Abono de $2,500
15 septiembre                         Abonar

Mi grupo                  5 de 6 →
Mesa                      Pendiente →
Platillos                 5 de 6 →
Termo                     Bloqueado →
```

Si existe mora, esa alerta sustituye al próximo pendiente normal.

---

# 5. Mi grupo `/graduate/group` — P0

## Problema

Actualmente muestra indicadores de capacidad, asignados, registrados, pendientes, explicación, badges, políticas y acciones redundantes.

## Corrección

La pantalla debe mostrar directamente personas/lugares.

```text
Mi grupo

5 de 6 lugares registrados

Andrea Martínez
Adulto

Laura Martínez
Adulto

Carlos Martínez
Niño

Lugar disponible
+ Registrar persona

+ Agregar boleto
```

### Acciones principales

- `Agregar integrante`
- `Agregar boleto`

### Agregar boleto

Bottom sheet/modal compacto:

```text
Agregar boleto

Adulto          $X
Niño            $X
Sin cena        $X

Debes abonar hoy
$X

Nuevo total
$X

Continuar
```

El catch-up/importe requerido se obtiene del backend.

### Eliminar

- `DemoFlowPanel`;
- 3 KPI de capacidad;
- “Capacidad de tu membresía”;
- “Integrantes nominales” como heading técnico;
- textos permanentes de política de reducción;
- referencias `BR-*`;
- copy “modo visual/backend”.

---

# 6. Pagos `/graduate/payments` — P0

## Objetivo

Que el graduado entienda rápidamente:

- cuánto ha abonado;
- cuánto resta;
- mínimo actual;
- próxima fecha;
- historial.

## Composición objetivo

```text
Mis pagos

Has abonado
$12,500 de $18,500

Restan $6,000

Próximo abono
15 septiembre
Mínimo: $2,500

                         Abonar

Plan de pagos
15 sep     $2,500     Pendiente
15 ago     $2,000     Pagado
15 jul     $2,000     Pagado

Historial y comprobantes
```

## Regla funcional de UX

El CTA debe ser preferentemente `Abonar`, no asumir “pagar mensualidad exacta”.

El flujo debe permitir:

```text
¿Cuánto quieres abonar?
Mínimo actual        $2,500
[ $________ ]
```

Luego método disponible.

Efectivo no es auto-confirmable por GRADUATE; se registra administrativamente.

## Eliminar

- grid redundante `Total contratado / Abonado / Pendiente / Vencido` si ya se explicó arriba;
- duplicación `Saldo pendiente` + `Restan`;
- dashboardización financiera.

---

# 7. Mesa `/graduate/table` — P0

## Objetivo

El croquis es el protagonista.

Flujo:

```text
1. seleccionar integrante(s)
2. tocar mesa en croquis
3. revisar cupo
4. confirmar asignación
```

## Mobile

- pan/zoom;
- integrantes seleccionados en barra/chips compactos;
- tocar mesa → bottom sheet;
- CTA sticky.

## Desktop/tablet

- mapa 70–80%;
- panel lateral con integrantes/mesa seleccionada.

## Lista

Debe ser fallback accesible:

```text
Ver como lista
```

No default.

## Eliminar

- cards por mesa;
- resumen/KPI previo al croquis;
- descripciones repetitivas;
- badges innecesarios;
- forma de mesa si no ayuda a identificarla;
- capacidad total si “lugares libres” resuelve la tarea.

## Caso niños

Si se selecciona un menor, mostrar recordatorio contextual para verificar su mesa.

---

# 8. Platillos `/graduate/meals` — P0

## Objetivo

Persona → opción.

```text
Platillos

Puedes modificar opciones especiales hasta el 15 de mayo.

Andrea
● Cena normal
○ Vegetariano
○ Vegano

Laura
● Cena normal
○ Vegetariano
○ Vegano

Guardar cambios
```

## Reglas

- usar radio/segmented/touch choices cuando existan pocas opciones;
- separar personas principalmente con espacio;
- tras deadline: lectura + contacto/aviso.

## Eliminar

- catálogo inferior que repite opciones;
- `Integrantes en tu grupo` + contador si ya se ve la lista;
- badge `Seleccionado/Pendiente` si el selector ya lo comunica;
- exceso de divisores;
- `DemoFlowPanel`.

---

# 9. Termo `/graduate/thermo` — P1

## Bloqueado

```text
Mi termo

Disponible al alcanzar 60%
Llevas 45%

[progreso]

Ver pagos
```

## Disponible

```text
Mi termo

Ya puedes personalizarlo

Nombre para grabado
[ Andrea Martínez ]

Solicitar termo
```

## Solicitado / producción / entregado

Estado + personalización, sin repetir información financiera.

## Eliminar

- copy técnico;
- `DemoFlowPanel`;
- datos de taller innecesarios para GRADUATE;
- status + heading redundantes.

## Bug a corregir

`Ver mis pagos` debe navegar directamente mediante `Link`/`useNavigate`; no depender de una prop opcional que `App.tsx` no suministra.

---

# 10. Contrato `/graduate/contract` — P1

## Objetivo

Debe sentirse como documento, no dashboard contractual.

```text
Contrato CT-2027-0042

Andrea Martínez
Facultad de Derecho
Generación 2027

6 lugares
Total: $18,500

TÉRMINOS Y CONDICIONES
...
```

Al final:

```text
☐ He leído y acepto los términos

Aceptar contrato
```

## Eliminar

- dashboard de resumen contractual;
- cards de metadatos;
- repetición de total/lugares/versión en múltiples bloques;
- scroll interno `max-h-* overflow-y-auto` para términos;
- `DemoFlowPanel`;
- modal de confirmación que vuelva a repetir todos los datos.

El documento debe usar scroll natural de página.

---

# 11. Notificaciones — P2 / DEFER UI

No debe ser superficie primaria del MVP mientras no exista requerimiento cliente confirmado para un centro de notificaciones interno.

Los avisos deben aparecer en contexto:

- pago próximo → Inicio/Pagos;
- deadline platillos → Platillos;
- termo disponible → Inicio/Termo.

Ocultar por ahora:
- campana;
- badge “nuevo”;
- navegación dedicada.

No eliminar infraestructura/backend si existe.

---

# 12. Más `/graduate/more` — P1

## Objetivo MVP

```text
Más

Mi contrato                →
Mi termo                   →
Platillos                  →
Mesa                       →

Contacto GR                →
Cerrar sesión
```

`Mis datos` solo si existe pantalla real. `Ayuda` solo si existe contenido real.

No enrutar `/profile` y `/help` de regreso a la misma `GraduateMoreScreen`.

Eliminar duplicación del contexto del evento y perfil completo.

---

# 13. Arquitectura objetivo GRADUATE

```text
GRADUATE
│
├── Inicio
│   ├── siguiente pendiente
│   └── estado breve grupo/mesa/platillo/termo
│
├── Mi grupo
│   ├── personas
│   └── agregar boleto
│
├── Pagos
│   ├── abonado/saldo
│   ├── próximo mínimo
│   ├── calendario
│   └── comprobantes
│
└── Más
    ├── Mesa
    ├── Platillos
    ├── Termo
    ├── Contrato
    ├── Contacto
    └── Cerrar sesión
```

---

# 14. Prioridad de implementación

## P0 — antes de próxima demo cliente

1. Shell responsive real.
2. Reducir bordes/divisores.
3. Eliminar `DemoFlowPanel` de experiencia cliente.
4. Rehacer composición de Inicio.
5. Simplificar Mi grupo.
6. Simplificar Pagos y CTA `Abonar`.
7. Rehacer Mesa con canvas dominante.
8. Simplificar Platillos.

## P1

9. Termo.
10. Contrato.
11. Más.
12. Corregir rutas/acciones muertas.

## P2

13. Ocultar Notificaciones del MVP hasta confirmación.

---

# 15. Criterios de aceptación GRADUATE

Una pantalla GRADUATE NO está terminada si ocurre cualquiera de estos puntos:

- parece dashboard sin que la tarea sea analítica;
- aparecen más de 1–2 cifras protagonistas sin necesidad;
- usa cards para personas/mesas/opciones simples;
- usa líneas para estructurar toda la página;
- repite evento/usuario/título en header y contenido;
- muestra términos técnicos de demo/backend;
- desktop es solo una versión más ancha del móvil;
- una acción primaria no es evidente en menos de 3 segundos;
- la información presentada no responde a un requerimiento o tarea real.
