# Plataforma GR — Especificaciones Visuales por Pantalla

**Documento:** `SCREEN_VISUAL_SPECIFICATIONS.md`  
**Versión:** 2.0  
**Estado:** Baseline vinculante  
**Fecha:** 3 de septiembre de 2026

## 1. Reglas globales

Toda pantalla debe cumplir:

- no cardification por defecto;
- no subtítulos redundantes;
- no KPIs dentro de cards;
- no navegación mediante mosaicos de cards;
- no términos técnicos visibles si existe lenguaje natural;
- una acción primaria clara por zona;
- listas/tablas para volumen;
- drawers para detalle contextual;
- espacio, tipografía y divisores como estructura principal.

Estados obligatorios cuando apliquen: `READY`, `LOADING`, `EMPTY`, `ERROR`, `ACTION_SUCCESS`, `DISABLED/LOCKED`, `RESPONSIVE`.

## 2. ADMIN — Shell

### Navegación global

```text
Inicio
Eventos
```

### Contexto de evento

```text
← Eventos
Derecho · UASLP
Generación 2027                                      Activo

Resumen  Graduados  Pagos  Mesas  Platillos  Termos  Reportes  ···
```

El nombre, institución, generación y estado no deben repetirse dentro de cada subpantalla.

## 3. ADMIN — Inicio

### Quitar

- `KpiCard`;
- card de alertas;
- card de eventos;
- card de pagos;
- card de accesos rápidos;
- supporting text de KPIs;
- `Plataforma GR • vX`;
- conteo de módulos;
- frases tipo “Panorama general...”.

### Composición

```text
Buenas tardes

3 eventos activos                                  + Nuevo evento

$1,248,000 cobrado   $182,000 pendiente   $25,000 vencido
────────────────────────────────────────────────────────────
Requieren atención
8 pagos por revisar                                      →

Próximos eventos
Derecho 2027       UASLP       18 jun      142 personas  →
Administración     UASLP       26 jun       96 personas  →
```

## 4. ADMIN — Eventos

### Quitar

- Card exterior;
- botón `Administrar` por fila;
- descripciones obvias;
- badges no necesarios.

### Composición

```text
Eventos                                         + Nuevo evento
Buscar...                         Activos ▾   2027 ▾

Nombre                 Fecha       Personas      Estado
──────────────────────────────────────────────────────
Derecho UASLP          18 jun        142         Activo  →
```

Toda la fila abre el evento.

## 5. ADMIN — Crear/editar evento

Mantener wizard/progressive disclosure.

### Reglas

- un tema complejo por paso;
- indicador de avance discreto;
- summary compacto en desktop solo si aporta validación;
- no cards por sección;
- labels persistentes;
- switches solo para configuración binaria reversible;
- segmented controls para opciones cortas.

## 6. ADMIN — Resumen del evento

### Quitar

- KPI cards;
- cards de preparación;
- accesos rápidos;
- iconos decorativos.

### Composición

```text
142 graduados

Pagos
$1,248,000 cobrado de $1,430,000
████████████████████░░ 87%
$182,000 pendientes                    12 con atraso →

────────────────────────────────────────────
Preparación
Graduados        142 / 150
Mesas             18 / 20
Platillos        128 / 142
Termos            86 / 142

────────────────────────────────────────────
Pendientes
12 pagos vencidos                         Revisar
14 personas sin platillo                  Revisar
```

## 7. ADMIN — Graduados

Patrón: tabla + filtros + drawer.

### Tabla mínima

```text
Nombre | Grupo | Pagado | Pendiente | Estado
```

La fila abre drawer o expediente. Acciones secundarias en menú contextual.

No usar cards por graduado.

## 8. ADMIN — Pagos

### Composición

```text
Pagos

$1,248,000 cobrado   $182,000 pendiente   $25,000 vencido
87% ███████████████████░░

Todos   Por revisar 8   Vencidos 12
Buscar persona...
──────────────────────────────────────────────
Persona | Último pago | Pendiente | Estado
```

Los tabs/segmentos con conteo pueden ser accionables. No usar cards por estado o transacción.

## 9. ADMIN — Validación de comprobantes

Usar lista/tabla + drawer de evidencia.

El drawer muestra:

- evidencia;
- persona;
- monto;
- referencia;
- saldo antes/después;
- aprobar;
- rechazar con motivo.

No ocultar consecuencias financieras.

## 10. ADMIN — Mesas / croquis

Superficie especializada.

```text
Mesas                         142 / 160 lugares asignados
[ + Mesa ] [ Etiqueta ]              ↶  ↷  Ajustar vista
────────────────────────────────────────────────────────
|                                                        |
|                       CROQUIS                          |
|       ○ 01      ○ 02         ○ 03                    |
|             ○ 04       ○ 05                          |
|                                                        |
────────────────────────────────────────────────────────
Sin asignar 18                                          ↑
```

Selección de mesa abre drawer lateral. El canvas domina la superficie.

## 11. ADMIN — Platillos

```text
Platillos
128 de 142 personas eligieron

Pollo             68
Res               42
Vegetariano       18
Sin elegir        14 →

────────────────────────────
Persona | Selección | Estado
```

No usar KPI cards ni cards de opción.

## 12. ADMIN — Termos

```text
Termos
86 personalizados   32 disponibles   24 bloqueados
────────────────────────────────────────────
Persona | Estado | Personalización | Entrega
```

No usar cards por estado.

## 13. ADMIN — Reportes

No catálogo de cards.

```text
Reportes

Finanzas
──────────────────────────────
Estado de cuenta                 Descargar ↓
Pagos vencidos                   Descargar ↓
Corte del evento                 Descargar ↓

Operación
──────────────────────────────
Graduados                        Descargar ↓
Platillos                        Descargar ↓
Termos                           Descargar ↓
Mesas                            Descargar ↓
```

Charts solo cuando responden una pregunta que un número o tabla no resuelve mejor.

## 14. ADMIN — Configuración

Usar grupos con divisores y switches.

```text
Configuración

Pagos
──────────────────────────────
Permitir pagos en línea                     ●
Aceptar transferencias                      ●
Permitir pago después de vencimiento        ○

Graduados
──────────────────────────────
Permitir cambios de platillo                 ●
Permitir cambios de invitados                ○
```

Acciones críticas no son switches.

## 15. ADMIN — Auditoría

Tabla/timeline sobrio. No cards por evento de auditoría. No JSON crudo por defecto.

## 16. GRADUATE — Shell

Mobile-first. Navegación primaria corta.

```text
Inicio
Pagos
Mi graduación
Más
```

`Mi graduación` agrupa invitados, mesa, platillos y termo sin convertirlos en cards.

## 17. GRADUATE — Inicio

### Quitar

- `Bienvenido(a)` + `Hola` duplicados;
- badge `Graduando`;
- Event Context Card;
- card `Tu siguiente paso`;
- card de progreso financiero;
- `Tu preparación`;
- `4 módulos`;
- cards para Grupo/Mesa/Platillos/Termo;
- icon-boxes decorativos.

### Composición

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

## 18. GRADUATE — Pagos

```text
Mis pagos
$12,500 de $18,500
████████████████░░░░ 68%
Restan $6,000

Próximo pago
$2,500 · 15 septiembre                     Pagar

────────────────────────────────────
Historial
03 ago      $2,500      Pagado
03 jul      $2,500      Pagado
```

## 19. GRADUATE — Grupo

Lista simple. No cards por persona.

```text
Mis invitados
8 de 10 registrados

Ana Torres                                  Editar
Carlos Torres                               Editar
────────────────────────────────────────────
+ Agregar persona
```

## 20. GRADUATE — Mesa

Croquis/read-only como elemento protagonista. Mostrar mesa y personas propias. No nombres de terceros.

## 21. GRADUATE — Platillos

Para una selección simple usar radio/segmented control táctil, no cards.

```text
Platillo de Ana
○ Pechuga rellena
● Filete de res
○ Opción vegetariana
                                      Guardar
```

## 22. GRADUATE — Termo

```text
Tu termo
Disponible para personalizar

Nombre
[ Manuel Ruiz ]
                                      Personalizar
```

Bloqueado: explicar requisito + progreso + monto faltante. Sin card.

## 23. GRADUATE — Contrato

El documento es protagonista. Metadatos y aceptación fuera de cards decorativas. La acción de aceptación debe permanecer inequívoca.

## 24. GRADUATE — Notificaciones

Lista cronológica simple con estado leído/no leído. No cards.

## 25. GRADUATE — Más

```text
Contrato             →
Notificaciones       →
Mis datos            →
Ayuda                →

Cerrar sesión
```

## 26. Responsive

La eliminación de cards no autoriza layouts frágiles.

- ADMIN: desktop-first, tablas con scroll/adaptación por prioridad;
- GRADUATE: mobile-first;
- controles táctiles >= 44px recomendados;
- evitar dos columnas en móvil salvo controles cortos;
- no ocultar acciones críticas por overflow.

## 27. Regla de validación visual

Una pantalla falla revisión si:

1. puede quitarse una card sin perder semántica y no se quitó;
2. repite título/subtítulo/supporting text;
3. usa badges como decoración;
4. presenta módulos como mosaico de accesos rápidos;
5. muestra lenguaje técnico innecesario;
6. parece una plantilla SaaS intercambiable con otro dominio.