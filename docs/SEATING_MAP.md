# SEATING_MAP.md

# Plataforma GR — Croquis y Selección de Mesas

**Documento:** `SEATING_MAP.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline de dominio, concurrencia y contratos conceptuales  
**Fecha:** 24 de agosto de 2026  
**Documentos fuente:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `UX_FLOWS.md`  
**Referencia técnica reutilizable:** `ManuelRuiz27/Soft-Monkey_InvitacionesPremium`  
**Propósito:** Formalizar la decisión ya aprobada para el croquis operativo de Plataforma GR: modelo simplificado de mesas, asignaciones, concurrencia, persistencia y endpoints.

---

# 1. Propósito

El módulo de croquis de Plataforma GR tiene un objetivo específico:

> Representar visualmente la distribución de mesas de un evento y permitir asignar los lugares de un graduado a una mesa con capacidad suficiente.

El módulo **no** pretende ser:

- un editor CAD;
- un constructor arquitectónico;
- un sistema de asientos numerados;
- un sistema de reconocimiento automático de planos;
- un editor avanzado de zonas;
- una réplica completa del croquis de InvitacionesPremium.

La prioridad es mantener la operación del cliente simple, rápida y segura.

---

# 2. Decisión de producto cerrada

La implementación de Plataforma GR utilizará un croquis simplificado con:

```text
MESAS
├── SQUARE
└── ROUND
```

Cada mesa tendrá:

- identificador;
- etiqueta/número;
- forma;
- capacidad;
- posición;
- estado operativo.

La capacidad puede variar por mesa.

Ejemplo:

```text
Mesa 24
Forma: SQUARE
Capacidad: 10
Ocupados: 2
Disponibles: 8
```

---

# 3. Caso real que origina la decisión

Los planos operativos del cliente tienden a representar:

- mesas circulares;
- mesas cuadradas;
- números de mesa;
- distribución espacial simple;
- capacidades variables.

Por lo tanto, Plataforma GR no necesita modelar mobiliario complejo ni reconstruir el salón con precisión arquitectónica.

La utilidad del croquis consiste en:

```text
ver ubicación
+
ver disponibilidad
+
seleccionar/asignar mesa
```

---

# 4. Reutilización de Soft-Monkey_InvitacionesPremium

Plataforma GR reutilizará **infraestructura gráfica y patrones técnicos**, no el dominio completo de InvitacionesPremium.

Componentes/conceptos reutilizables:

- React Konva;
- Stage/canvas;
- zoom;
- pan;
- selección de objetos;
- drag & drop;
- renderizado de mesas;
- coordenadas normalizadas;
- transformación entre coordenadas normalizadas y mundo;
- cálculo visual de ocupación;
- separación entre fondo y objetos operativos.

---

# 5. Evidencia técnica del motor reutilizable

El módulo existente de `Soft-Monkey_InvitacionesPremium` ya utiliza un `Stage` de React Konva con:

- viewport;
- escala;
- drag del canvas;
- wheel;
- pointer/touch;
- capa de render.

Ruta de referencia:

```text
apps/web-organizer/src/features/floorplan/canvas/FloorplanCanvas.tsx
```

El `TableLayer` existente ya soporta:

- `Circle`;
- `Rect`;
- selección;
- hover;
- drag;
- ocupación;
- capacidad;
- conversión a coordenadas normalizadas.

Ruta:

```text
apps/web-organizer/src/features/floorplan/canvas/TableLayer.tsx
```

El motor técnico declara actualmente:

```text
round
square
rectangle
```

como formas posibles.

Para Plataforma GR, la interfaz expondrá únicamente:

```text
round
square
```

---

# 6. Elementos de InvitacionesPremium que NO se trasladan

No forman parte del alcance de GR:

- `rectangle` como opción visible inicial;
- imperial;
- horseshoe;
- custom;
- couple table;
- VIP;
- zonas;
- pista;
- barra;
- baños;
- escenario;
- sillas;
- seat assignment;
- invitaciones;
- RSVP;
- check-in;
- scanner;
- estados de invitados de InvitacionesPremium;
- reconocimiento automático;
- preflight de InvitacionesPremium;
- multi-tenant.

La reutilización será exclusivamente de componentes/patrones que ayuden al croquis simplificado.

---

# 7. Principio del fondo visual

La imagen del plano:

```text
NO ES EL CROQUIS OPERATIVO
```

Es únicamente una referencia visual.

El croquis operativo está compuesto por entidades persistidas de mesa y asignación.

Por tanto:

```text
Imagen de fondo
≠
Mesas del sistema
```

Cambiar o sustituir la imagen no deberá destruir:

- mesas;
- capacidades;
- asignaciones.

---

# 8. Fondo permitido

El ADMIN podrá utilizar como referencia:

```text
JPG
PNG
PDF convertido a imagen
```

El archivo deberá mostrarse conservando su proporción.

La imagen se utilizará como capa de fondo bloqueada.

No se implementará reconocimiento automático del contenido.

---

# 9. Modos del croquis

El módulo tendrá dos modos funcionales.

## 9.1 ADMIN

```text
EDITABLE
```

Permite:

- crear mesas;
- crear varias mesas;
- mover mesas;
- editar etiqueta;
- editar capacidad;
- bloquear;
- desbloquear;
- duplicar;
- eliminar cuando sea válido;
- consultar asignaciones;
- asignar/cambiar graduados.

---

## 9.2 GRADUATE

```text
READ_ONLY + TABLE_SELECTION
```

Permite:

- ver croquis;
- hacer zoom/pan;
- consultar disponibilidad;
- seleccionar una mesa;
- confirmar selección;
- cambiar selección antes del deadline.

No permite editar objetos del croquis.

---

# 10. Formas soportadas

Enum funcional:

```text
TableShape
----------
SQUARE
ROUND
```

La API no deberá aceptar otras formas como parte del MVP oficial.

---

# 11. Estados de mesa

Estado persistido:

```text
AVAILABLE
BLOCKED
```

No se deberá persistir:

```text
FULL
```

como estado manual.

`FULL` es un estado derivado de:

```text
available_places == 0
```

Esto evita inconsistencias entre:

- estado;
- capacidad;
- asignaciones.

---

# 12. Capacidad

Toda mesa deberá tener:

```text
capacity > 0
```

La capacidad es independiente por mesa.

No se utilizará una capacidad global fija para todas las mesas.

---

# 13. Ocupación

La ocupación no deberá almacenarse como contador editable.

Se calculará:

```text
occupied_places =
SUM(active_assignment.places_assigned)
```

---

# 14. Disponibilidad

```text
available_places =
table.capacity
- occupied_places
```

Invariante:

```text
available_places >= 0
```

---

# 15. Modelo de datos conceptual

El módulo utilizará cuatro conceptos principales:

```text
SeatingMap
EventTable
TableAssignment
BackgroundAsset
```

`BackgroundAsset` puede materializarse posteriormente como parte de un modelo genérico de archivos.

---

# 16. SeatingMap

## Propósito

Representar la configuración gráfica del croquis de un evento.

Relación:

```text
Event
  1
  │
  0..1
SeatingMap
```

---

## Modelo conceptual

```text
SeatingMap
----------
id
event_id

background_file_id
background_original_width
background_original_height

coordinate_mode

created_at
updated_at
```

---

## coordinate_mode

Valor oficial:

```text
NORMALIZED
```

No se utilizarán píxeles de dispositivo como formato de persistencia definitivo.

---

# 17. EventTable

Modelo conceptual:

```text
EventTable
----------
id
event_id
seating_map_id

label
shape
capacity

position_x
position_y

width
height

status

created_at
updated_at
```

---

## 17.1 label

Ejemplos:

```text
Mesa 1
Mesa 24
Mesa 58
```

Debe ser única dentro del evento.

Constraint conceptual:

```text
UNIQUE(event_id, label)
```

---

## 17.2 shape

```text
SQUARE
ROUND
```

---

## 17.3 capacity

Número entero positivo.

Ejemplo:

```text
8
10
12
```

---

## 17.4 position_x / position_y

Valores normalizados:

```text
0.0 <= x <= 1.0
0.0 <= y <= 1.0
```

---

## 17.5 width / height

Valores normalizados respecto al espacio del croquis.

El tamaño visual no determina la capacidad.

Una mesa visualmente más grande no implica automáticamente más lugares.

---

# 18. TableAssignment

## Propósito

Representar la cantidad de lugares de una membresía/graduado asignada a una mesa.

Modelo conceptual:

```text
TableAssignment
---------------
id
event_id
graduate_membership_id
table_id

places_assigned

assigned_by_account_id
assigned_at
updated_at
```

---

# 19. Razón para usar TableAssignment

El modelo anterior del repositorio GR contiene una relación:

```text
Graduate
→ TableSelection
→ Table
```

con:

```text
graduate_id UNIQUE
```

Ese modelo limita al graduado a una sola mesa.

El baseline actual del producto ya establece que el dominio debe soportar que un grupo pueda dividirse entre mesas cuando la operación lo requiera.

Por ello, el modelo objetivo será:

```text
GraduateMembership
    │
    ├── TableAssignment → Mesa A
    └── TableAssignment → Mesa B
```

cuando exista división administrativa.

---

# 20. Asignación normal del graduado

El flujo de autoservicio MVP priorizará:

```text
1 graduado/grupo
→
1 mesa
```

Si la mesa posee capacidad suficiente para todos sus lugares:

```text
places_assigned =
graduate.active_places
```

---

# 21. Grupo dividido

El dominio permitirá:

```text
Graduado: 8 lugares

Mesa 24 → 5
Mesa 25 → 3
```

Invariante:

```text
SUM(assignments.places_assigned)
<= graduate.active_places
```

Para el MVP:

- el autoservicio GRADUATE prioriza una sola mesa;
- la división extraordinaria será operada por ADMIN;
- no se diseña selección silla por silla.

---

# 22. Sin asiento individual

No deberá existir requisito funcional de:

```text
seat_id
seat_number
chair_id
seat_position
```

La unidad mínima de asignación es:

```text
places_assigned
```

dentro de una mesa.

---

# 23. Coordenadas normalizadas

Las posiciones se persistirán como valores relativos:

```text
x:      0.0 → 1.0
y:      0.0 → 1.0
width:  0.0 → 1.0
height: 0.0 → 1.0
```

---

# 24. Conversión gráfica

El frontend podrá convertir:

```text
normalized
→ world/canvas coordinates
```

para renderizar.

Y al mover una mesa:

```text
canvas coordinates
→ normalized
```

antes de persistir.

Este patrón ya existe en el motor reutilizable mediante funciones equivalentes a:

```text
toWorld()
toNormalized()
```

---

# 25. Persistencia durante drag

Durante:

```text
onDragMove
```

la posición deberá mantenerse localmente en el motor gráfico.

La persistencia/backend deberá actualizarse al finalizar:

```text
onDragEnd
```

Esto evita escrituras innecesarias durante el arrastre.

---

# 26. Vista GRADUATE

Cada mesa podrá exponer:

```json
{
  "id": "table_24",
  "label": "Mesa 24",
  "shape": "SQUARE",
  "capacity": 10,
  "occupied_places": 2,
  "available_places": 8,
  "status": "AVAILABLE",
  "position": {
    "x": 0.42,
    "y": 0.35
  }
}
```

---

# 27. Privacidad GRADUATE

La respuesta no deberá incluir:

- nombres de otros graduados;
- teléfonos;
- correos;
- integrantes;
- información financiera;
- motivo de asignación;
- notas administrativas.

El graduado únicamente necesita conocer:

```text
capacidad
ocupación agregada
disponibilidad
estado
posición
```

---

# 28. Vista ADMIN

ADMIN podrá obtener adicionalmente:

- asignaciones;
- graduado/grupo;
- lugares asignados;
- ocupación;
- disponibilidad;
- historial administrativo necesario.

---

# 29. Flujo ADMIN — Crear croquis

```text
Evento
→ Mesas
→ Editar croquis
```

Si no existe croquis:

```text
Crear croquis
```

Opcionalmente:

```text
Subir imagen de referencia
```

Después:

```text
Agregar mesas
→ acomodar
→ guardar
```

---

# 30. Crear una mesa

Campos:

```text
label
shape
capacity
```

Valores iniciales de posición/tamaño podrán asignarse por frontend dentro del espacio visible.

La mesa podrá moverse después.

---

# 31. Crear varias mesas

Función aprobada:

```text
Crear varias mesas
```

Campos mínimos:

```text
quantity
shape
capacity
start_number
```

Ejemplo:

```text
Cantidad: 30
Forma: SQUARE
Capacidad: 10
Comenzar en: 1
```

Resultado:

```text
Mesa 1
...
Mesa 30
```

El ADMIN posteriormente acomoda los objetos en el canvas.

No se requiere editor de matrices, filas/columnas ni algoritmo avanzado de distribución como requisito base.

---

# 32. Duplicar mesa

ADMIN puede duplicar una mesa.

Se copian:

- forma;
- capacidad;
- tamaño visual.

Debe generarse:

- nuevo `id`;
- nueva etiqueta válida;
- posición desplazada para evitar superposición exacta.

La etiqueta final deberá respetar unicidad.

---

# 33. Editar capacidad

ADMIN puede modificar capacidad si:

```text
new_capacity >= occupied_places
```

Si:

```text
new_capacity < occupied_places
```

la operación deberá ser rechazada.

---

# 34. Bloquear mesa

ADMIN puede cambiar:

```text
AVAILABLE
→ BLOCKED
```

Una mesa bloqueada:

- permanece visible;
- conserva asignaciones existentes;
- no acepta nuevas asignaciones GRADUATE.

---

# 35. Desbloquear mesa

ADMIN puede cambiar:

```text
BLOCKED
→ AVAILABLE
```

La disponibilidad se recalcula con base en asignaciones.

---

# 36. Eliminar mesa

Una mesa puede eliminarse únicamente si:

```text
active_assignments == 0
```

Si existen asignaciones:

```text
DELETE
→ reject
```

El ADMIN deberá reasignar/liberar primero.

---

# 37. Selección GRADUATE

Flujo:

```text
Mi grupo
→ Ver mesas
→ Seleccionar Mesa 24
→ Revisar
→ Confirmar
```

Antes de confirmar, la UI podrá mostrar:

```text
Mesa 24
Capacidad: 10
Disponibles: 8
Tu grupo requiere: 8
```

---

# 38. Validaciones antes de selección

El backend deberá verificar:

1. cuenta autenticada;
2. rol `GRADUATE`;
3. membresía pertenece a la cuenta;
4. membresía activa;
5. evento `OPEN`;
6. deadline de mesa vigente;
7. mesa pertenece al mismo evento;
8. mesa `AVAILABLE`;
9. lugares activos del graduado;
10. capacidad suficiente.

---

# 39. Selección de mesa completa

Para el autoservicio normal:

```text
required_places =
graduate.active_places
```

Si ya existen asignaciones propias que serán reemplazadas, deberán considerarse correctamente dentro de la operación.

---

# 40. Cambio de mesa GRADUATE

Dentro del deadline:

```text
Mesa actual
→ nueva mesa
```

La operación deberá ser atómica.

No deberá liberar definitivamente la mesa anterior antes de garantizar la nueva asignación.

---

# 41. Cambio de mesa ADMIN

ADMIN puede cambiar mesa incluso después del deadline.

Debe registrar:

```text
previous_table
new_table
reason
admin
timestamp
```

---

# 42. División ADMIN

ADMIN podrá crear varias asignaciones para la misma membresía.

Ejemplo:

```json
{
  "graduate_membership_id": "gm_123",
  "assignments": [
    {
      "table_id": "table_24",
      "places": 5
    },
    {
      "table_id": "table_25",
      "places": 3
    }
  ],
  "reason": "Distribución operativa del grupo"
}
```

Reglas:

```text
SUM(places) <= active_places
```

y para cada mesa:

```text
available_places >= requested_places
```

---

# 43. Concurrencia — principio

La disponibilidad mostrada en frontend:

```text
NO ES UNA RESERVA
```

Solo el backend puede confirmar una asignación.

---

# 44. Riesgo identificado en el repositorio actual

La implementación existente de GR realiza:

```text
leer mesa
→ calcular ocupación
→ validar
→ eliminar selección anterior
→ crear selección nueva
```

dentro de una transacción.

Sin embargo, una transacción por sí sola no garantiza que dos solicitudes concurrentes no lean la misma capacidad disponible antes de escribir.

El baseline objetivo deberá corregir esta condición de carrera.

---

# 45. Estrategia de concurrencia requerida

La operación de selección/asignación deberá utilizar una estrategia equivalente a:

```text
SERIALIZABLE transaction
```

o:

```text
row-level locks
```

sobre las mesas afectadas.

La implementación concreta se decidirá según Prisma/PostgreSQL, pero el resultado funcional es obligatorio.

---

# 46. Algoritmo de selección concurrente

Conceptualmente:

```text
BEGIN TRANSACTION

1. Resolver membresía autenticada.
2. Validar evento/deadline.
3. Bloquear/serializar mesa objetivo.
4. Leer asignaciones vigentes dentro de la transacción.
5. Recalcular occupied_places.
6. Calcular available_places.
7. Validar capacidad.
8. Reemplazar/crear asignación.
9. Validar invariantes.
10. COMMIT
```

---

# 47. Cambio entre dos mesas

Al mover asignación:

```text
Mesa A
→
Mesa B
```

la operación deberá proteger ambas mesas cuando sea necesario.

Para minimizar deadlocks, si se utilizan locks explícitos, deberán adquirirse en un orden determinista.

Ejemplo:

```text
ORDER BY table_id
```

---

# 48. Conflicto concurrente

Escenario:

```text
Mesa 24
Disponibles: 8

Andrea requiere 8.
Carlos requiere 8.

Ambos confirman al mismo tiempo.
```

Resultado obligatorio:

```text
una operación confirma
la otra falla
```

Nunca:

```text
ocupados = 16
capacidad = 10
```

---

# 49. Respuesta por conflicto

Código HTTP recomendado:

```text
409 Conflict
```

Código de negocio:

```text
TABLE_CAPACITY_CHANGED
```

Mensaje UX:

```text
Esta mesa acaba de cambiar.
Ya no hay suficientes lugares disponibles para tu grupo.
```

---

# 50. Polling

Para el MVP no se requiere WebSocket.

La UI podrá refrescar disponibilidad mediante polling periódico.

Referencia ya definida:

```text
3–5 segundos
```

cuando el usuario se encuentre en la vista de selección activa.

La disponibilidad definitiva seguirá siendo backend-authoritative.

---

# 51. Concurrencia al editar capacidad

ADMIN intenta reducir:

```text
capacity: 10 → 6
```

mientras existen:

```text
occupied_places: 8
```

Resultado:

```text
reject
```

Código de negocio recomendado:

```text
TABLE_CAPACITY_BELOW_OCCUPANCY
```

---

# 52. Concurrencia al eliminar

Antes de eliminar:

```text
lock/read assignments
```

Si aparece una asignación concurrente:

```text
DELETE
→ reject
```

---

# 53. Concurrencia en división de grupo

Cuando ADMIN divide un grupo entre varias mesas:

todas las mesas involucradas deberán validarse dentro de una sola operación transaccional.

Debe cumplirse simultáneamente:

```text
SUM(group_assignments) <= active_places
```

y:

```text
table_1_occupancy <= capacity
table_2_occupancy <= capacity
...
```

---

# 54. Invariantes

## SEAT-INV-001

```text
SUM(active assignments on table)
<= table.capacity
```

---

## SEAT-INV-002

```text
SUM(active assignments for graduate membership)
<= graduate.active_places
```

---

## SEAT-INV-003

```text
table.capacity > 0
```

---

## SEAT-INV-004

```text
table.event_id
==
assignment.event_id
==
graduate_membership.event_id
```

---

## SEAT-INV-005

```text
BLOCKED table
accepts no new graduate assignment
```

---

## SEAT-INV-006

```text
table with active assignments
cannot be deleted
```

---

## SEAT-INV-007

```text
table capacity
cannot be reduced below occupancy
```

---

## SEAT-INV-008

```text
graduate cannot mutate another graduate's assignment
```

---

## SEAT-INV-009

```text
persisted coordinates
are resolution independent
```

---

## SEAT-INV-010

```text
background replacement
does not delete tables/assignments
```

---

# 55. Endpoints — principios

Los contratos finales se formalizarán posteriormente en:

```text
API_CONTRACTS.md
```

Este documento fija los recursos y operaciones que deberán existir.

Se separan:

```text
ADMIN
GRADUATE
```

para evitar exponer información administrativa al graduado.

---

# 56. ADMIN — Obtener croquis

```http
GET /admin/events/{eventId}/seating-map
```

Debe devolver:

- configuración de mapa;
- fondo;
- mesas;
- ocupación;
- disponibilidad;
- asignaciones administrativas.

---

# 57. ADMIN — Crear/configurar croquis

```http
PUT /admin/events/{eventId}/seating-map
```

Crea el mapa si no existe o actualiza su configuración permitida.

---

# 58. ADMIN — Subir fondo

```http
POST /admin/events/{eventId}/seating-map/background
Content-Type: multipart/form-data
```

Campo:

```text
file
```

Formatos:

```text
JPG
PNG
PDF
```

Si es PDF:

```text
PDF 1 página
→ imagen
```

La conversión técnica se definirá posteriormente.

---

# 59. ADMIN — Quitar fondo

```http
DELETE /admin/events/{eventId}/seating-map/background
```

Eliminar el fondo no elimina:

- mesas;
- asignaciones.

---

# 60. ADMIN — Crear mesa

```http
POST /admin/events/{eventId}/tables
```

Body conceptual:

```json
{
  "label": "Mesa 24",
  "shape": "SQUARE",
  "capacity": 10,
  "position": {
    "x": 0.42,
    "y": 0.35
  },
  "size": {
    "width": 0.08,
    "height": 0.08
  }
}
```

---

# 61. ADMIN — Crear varias mesas

```http
POST /admin/events/{eventId}/tables/bulk
```

Body:

```json
{
  "quantity": 30,
  "shape": "SQUARE",
  "capacity": 10,
  "start_number": 1
}
```

Resultado:

```text
Mesa 1 ... Mesa 30
```

---

# 62. ADMIN — Editar mesa

```http
PATCH /admin/events/{eventId}/tables/{tableId}
```

Campos permitidos:

```text
label
capacity
shape
position
size
status
```

Toda modificación deberá validar invariantes.

---

# 63. ADMIN — Eliminar mesa

```http
DELETE /admin/events/{eventId}/tables/{tableId}
```

Si hay asignaciones:

```text
409 TABLE_HAS_ASSIGNMENTS
```

---

# 64. ADMIN — Detalle de mesa

```http
GET /admin/events/{eventId}/tables/{tableId}
```

Debe incluir:

- capacidad;
- ocupación;
- disponibles;
- asignaciones;
- estado.

---

# 65. ADMIN — Asignar graduado/grupo

```http
PUT /admin/events/{eventId}/graduates/{graduateMembershipId}/table-assignments
```

Caso simple:

```json
{
  "assignments": [
    {
      "table_id": "table_24",
      "places": 8
    }
  ],
  "reason": "Asignación administrativa"
}
```

Caso dividido:

```json
{
  "assignments": [
    {
      "table_id": "table_24",
      "places": 5
    },
    {
      "table_id": "table_25",
      "places": 3
    }
  ],
  "reason": "Distribución operativa"
}
```

La operación reemplaza el conjunto de asignaciones vigentes del graduado dentro de una transacción.

---

# 66. GRADUATE — Obtener croquis

```http
GET /me/events/{eventId}/seating-map
```

Debe devolver una proyección segura:

- mesas;
- posiciones;
- capacidad;
- ocupación agregada;
- disponibilidad;
- estado;
- asignación propia.

No devuelve PII de terceros.

---

# 67. GRADUATE — Seleccionar mesa

```http
PUT /me/events/{eventId}/table-selection
```

Body:

```json
{
  "table_id": "table_24"
}
```

El backend resuelve:

```text
graduate membership
active places
current assignments
deadline
availability
```

No se acepta:

```text
graduate_id
places
event ownership
```

como valores confiables provenientes del frontend.

---

# 68. GRADUATE — Consultar asignación propia

```http
GET /me/events/{eventId}/table-selection
```

Respuesta conceptual:

```json
{
  "assignments": [
    {
      "table_id": "table_24",
      "table_label": "Mesa 24",
      "places": 8
    }
  ],
  "total_assigned_places": 8
}
```

---

# 69. GRADUATE — Cambio de mesa

El mismo:

```http
PUT /me/events/{eventId}/table-selection
```

podrá reemplazar la selección actual cuando el deadline permanezca abierto.

No es necesario exponer un endpoint independiente de “change” para el flujo normal.

---

# 70. Errores de negocio

Códigos conceptuales:

```text
SEATING_MAP_NOT_FOUND
TABLE_NOT_FOUND
TABLE_BLOCKED
TABLE_CAPACITY_CHANGED
TABLE_HAS_ASSIGNMENTS
TABLE_CAPACITY_BELOW_OCCUPANCY
TABLE_LABEL_ALREADY_EXISTS
INVALID_TABLE_SHAPE
INVALID_TABLE_CAPACITY
INVALID_TABLE_POSITION
SEATING_DEADLINE_CLOSED
EVENT_NOT_OPEN
GRADUATE_CANCELLED
ASSIGNMENT_EXCEEDS_GRADUATE_PLACES
ASSIGNMENT_EVENT_MISMATCH
```

---

# 71. Mapeo HTTP recomendado

| Caso | HTTP |
|---|---:|
| No autenticado | 401 |
| Rol/ownership incorrecto | 403 |
| No encontrado | 404 |
| Conflicto de capacidad concurrente | 409 |
| Mesa con asignaciones | 409 |
| Label duplicado | 409 |
| Deadline cerrado | 422 |
| Mesa bloqueada | 422 |
| Capacidad inválida | 422 |
| Shape inválido | 422 |

Los payloads definitivos se fijarán en `API_CONTRACTS.md`.

---

# 72. Auditoría

Deberán auditarse al menos:

- cambio de mesa realizado por ADMIN;
- división de grupo;
- modificación de capacidad con impacto;
- bloqueo/desbloqueo;
- eliminación de mesa;
- cambio administrativo fuera del deadline.

Cada auditoría deberá conservar:

```text
actor
event
graduate/table
before
after
reason when required
timestamp
```

---

# 73. Operaciones que no requieren auditoría de negocio

Movimientos puramente gráficos de una mesa:

```text
position_x
position_y
```

podrán persistirse sin generar una entrada visible en el historial administrativo de negocio.

Esto evita llenar el historial con cambios de diseño.

Los logs técnicos podrán conservarse según observabilidad.

---

# 74. Compatibilidad con el repositorio GR actual

El repositorio actual ya contiene:

```text
GET /events/:eventId/layout/overview
POST /graduates/me/layout/selection
```

y entidades:

```text
Table
TableSelection
```

La implementación actual calcula:

```text
availableSeats = capacity - occupiedSeats
```

lo cual conceptualmente puede reutilizarse.

Sin embargo, el baseline nuevo requiere refactor en varios puntos.

---

# 75. Refactor requerido — Table

El modelo actual posee:

```text
label
capacity
position_x
position_y
status
```

El objetivo deberá añadir/formalizar:

```text
shape
normalized coordinates
visual size
status AVAILABLE/BLOCKED
```

La condición `FULL` deberá ser derivada.

---

# 76. Refactor requerido — TableSelection

El modelo actual:

```text
graduate_id UNIQUE
table_id
```

debe migrar al concepto:

```text
TableAssignment
```

con:

```text
graduate_membership_id
table_id
places_assigned
```

para soportar:

- arquitectura Account/Membership;
- asignación explícita de lugares;
- grupo dividido;
- cálculo correcto de ocupación.

---

# 77. Refactor requerido — tickets_count

La ocupación del croquis no deberá depender en el futuro de:

```text
graduate.tickets[0].tickets_count
```

como lookup indirecto.

La fuente deberá ser:

```text
active places
+
TableAssignment.places_assigned
```

según el modelo definitivo de lugares.

---

# 78. Refactor requerido — concurrencia

La transacción actual deberá reforzarse con:

- serialización;
- o locking explícito;

porque el patrón:

```text
read occupancy
→ validate
→ write
```

puede sufrir race condition bajo concurrencia.

---

# 79. Refactor requerido — autenticación

El endpoint actual usa el usuario autenticado como si:

```text
user.id == graduate.id
```

El modelo objetivo será:

```text
JWT.sub = Account.id
→ resolve GraduateMembership by Account + Event
```

No se deberá confiar en IDs del graduado recibidos desde frontend.

---

# 80. Reutilización de frontend

Se recomienda reutilizar/adaptar del motor de InvitacionesPremium:

```text
FloorplanCanvas
TableLayer
coordinate utilities
table illustration primitives
viewport handling
```

No copiar directamente lógica de:

- invitados;
- RSVP;
- zonas;
- seats;
- wedding-planner domain.

---

# 81. Flujo de render ADMIN

```text
API seating-map
→ SeatingMap state
→ Background Layer
→ Table Layer
→ selection state
```

Al arrastrar:

```text
drag move
→ local canvas state

drag end
→ normalized coordinates
→ PATCH table
```

---

# 82. Flujo de render GRADUATE

```text
GET /me/events/{eventId}/seating-map
→ read-only canvas
→ render tables
→ show aggregate availability
→ tap table
→ detail/confirmation
```

---

# 83. Estado visual de una mesa

La UI deberá diferenciar al menos:

```text
AVAILABLE
FULL (derived)
BLOCKED
SELECTED_BY_ME
```

`FULL` y `SELECTED_BY_ME` son estados visuales derivados, no necesariamente estados persistidos de `EventTable`.

---

# 84. Selección visual

Al tocar una mesa disponible:

```text
highlight
→ panel/detail
```

Mostrar:

- mesa;
- capacidad;
- disponibles;
- lugares requeridos.

---

# 85. Mesa completa

Si:

```text
available_places == 0
```

se mostrará como:

```text
Completa
```

No tendrá CTA de selección.

---

# 86. Mesa bloqueada

Se mostrará como:

```text
No disponible
```

No deberá confundirse con mesa completa.

---

# 87. Mesa con capacidad insuficiente

Si:

```text
available_places > 0
```

pero:

```text
available_places < graduate.active_places
```

el autoservicio no permitirá seleccionar esa mesa para el grupo completo.

Puede mostrarse como no elegible para ese graduado.

---

# 88. Deadline cerrado

Cuando el deadline termine:

```text
GRADUATE
→ read-only
```

La asignación existente permanece visible.

ADMIN mantiene la capacidad de override con motivo.

---

# 89. Evento cerrado/finalizado/cancelado

Para GRADUATE:

```text
no table mutation
```

La consulta podrá mantenerse según el estado del evento.

---

# 90. Casos de prueba obligatorios

## SEAT-TEST-001

Crear mesa circular.

## SEAT-TEST-002

Crear mesa cuadrada.

## SEAT-TEST-003

Crear varias mesas con numeración consecutiva.

## SEAT-TEST-004

Mover mesa y persistir coordenadas normalizadas.

## SEAT-TEST-005

Renderizar el mismo croquis en dos resoluciones diferentes.

## SEAT-TEST-006

Bloquear mesa.

## SEAT-TEST-007

Intentar seleccionar mesa bloqueada.

## SEAT-TEST-008

Seleccionar mesa con capacidad exacta.

## SEAT-TEST-009

Rechazar mesa con capacidad insuficiente.

## SEAT-TEST-010

Dos graduados compiten por los últimos lugares.

## SEAT-TEST-011

Solo uno gana la operación concurrente.

## SEAT-TEST-012

Cambiar mesa antes del deadline.

## SEAT-TEST-013

Graduado no puede cambiar mesa después del deadline.

## SEAT-TEST-014

ADMIN cambia mesa después del deadline con motivo.

## SEAT-TEST-015

ADMIN divide grupo entre dos mesas.

## SEAT-TEST-016

Rechazar división cuyo total excede lugares del graduado.

## SEAT-TEST-017

Rechazar asignación que sobrecarga cualquiera de las mesas.

## SEAT-TEST-018

Rechazar reducción de capacidad debajo de ocupación.

## SEAT-TEST-019

Rechazar eliminación de mesa con asignaciones.

## SEAT-TEST-020

Quitar fondo no elimina mesas.

## SEAT-TEST-021

Graduado no recibe PII de otros grupos.

## SEAT-TEST-022

Graduate A no puede modificar asignación de Graduate B.

## SEAT-TEST-023

Evento CLOSED bloquea selección GRADUATE.

## SEAT-TEST-024

Asignaciones continúan siendo coherentes después de cambiar cantidad de lugares mediante flujo autorizado.

---

# 91. Decisiones cerradas

Quedan congeladas para el baseline 1.0:

1. Croquis simple, no CAD.
2. Formas visibles: `SQUARE` y `ROUND`.
3. Capacidad variable por mesa.
4. Fondo JPG/PNG/PDF como referencia opcional.
5. Fondo independiente de las mesas operativas.
6. React Konva reutilizado como motor gráfico.
7. Zoom y pan.
8. ADMIN puede drag & drop.
9. GRADUATE usa vista read-only para navegación/selección.
10. Coordenadas normalizadas.
11. Persistencia de posición en `dragEnd`, no durante cada movimiento.
12. Ocupación derivada de asignaciones.
13. `FULL` es derivado.
14. Estado persistido mínimo: `AVAILABLE/BLOCKED`.
15. No existen asientos individuales.
16. El dominio soporta grupo dividido.
17. Autoservicio prioriza grupo completo en una mesa.
18. División extraordinaria es operación ADMIN en MVP.
19. No se elimina una mesa con asignaciones.
20. No se reduce capacidad por debajo de ocupación.
21. Backend es autoridad de disponibilidad.
22. Selección concurrente debe serializar/lockear.
23. Conflicto concurrente devuelve `409`.
24. Polling MVP es suficiente; no se exige WebSocket.
25. No existe reconocimiento automático.
26. No se reutilizan zonas/VIP/RSVP/check-in de InvitacionesPremium.

---

# 92. Fuera de alcance

No implementar:

- silla por silla;
- `seat_id`;
- mapas 3D;
- CAD;
- reconocimiento de mesas por IA;
- auto-vectorización;
- zonas VIP;
- mesas VIP;
- mesa de novios;
- herraduras;
- zonas complejas;
- pista/barra/baños como entidades editables;
- check-in;
- scanner;
- RSVP;
- asignación por silla;
- recomendaciones automáticas de acomodo.

Cualquier incorporación requerirá Change Request.

---

# 93. TBD técnicos

Estos puntos no modifican el negocio y deberán cerrarse posteriormente:

1. dimensiones default de objetos `SQUARE/ROUND`;
2. tamaño máximo de imagen de fondo;
3. resolución máxima;
4. pipeline exacto de PDF → imagen;
5. estrategia concreta Prisma/PostgreSQL para locks;
6. isolation level exacto;
7. política de retry ante serialization failure;
8. cadencia final de polling dentro del rango aprobado;
9. límites máximos de mesas para pruebas de rendimiento;
10. estrategia de caché si llegara a requerirse.

No deberán introducirse como reglas de producto.

---

# 94. Trazabilidad

| Tema | BUSINESS_RULES | SRS | UX |
|---|---|---|---|
| Croquis simple | BR-SEAT-001 | FR-SEAT-001/003 | UX-A-SEAT |
| Formas | BR-SEAT-002 | FR-SEAT-004 | Admin/Graduate Mesa |
| Capacidad | BR-SEAT-003 | FR-SEAT-006 | Detalle de mesa |
| Fondo | BR-SEAT-004/005 | FR-SEAT-002 | Editor Admin |
| Coordenadas | BR-SEAT-006 | FR-SEAT-008 | Canvas |
| Ocupación | BR-SEAT-007/008 | FR-SEAT-014 | Disponibilidad |
| Selección | BR-SEAT-009 | FR-SEAT-015/016 | UX-G-SEAT |
| Grupo dividido | BR-SEAT-010 | FR-SEAT-020 | UX-G-SEAT-007 |
| Sin silla | BR-SEAT-011 | FR-SEAT-021 | Todo el flujo |
| Deadline | BR-SEAT-012/013 | FR-SEAT-018/019 | UX-G-SEAT-006 |
| Concurrencia | BR-SEAT-014 | FR-SEAT-017/022 | UX-G-SEAT-005 |
| Eliminación | BR-SEAT-015 | FR-SEAT-013 | Admin |
| Bloqueo | BR-SEAT-016 | FR-SEAT-011 | Admin/Graduate |
| Capacidad editada | BR-SEAT-017 | FR-SEAT-012 | Editar Mesa |
| Creación múltiple | BR-SEAT-018 | FR-SEAT-010 | Crear varias mesas |

---

# 95. Referencias de implementación existentes

## Soft-Monkey_InvitacionesPremium

```text
apps/web-organizer/src/features/floorplan/canvas/FloorplanCanvas.tsx
apps/web-organizer/src/features/floorplan/canvas/TableLayer.tsx
apps/web-organizer/src/features/floorplan/types.ts
docs/croquis-editor-manual-asistido.md
```

Utilizar como referencia de motor gráfico.

---

## Plataforma GR actual

```text
backend/src/layout/layout.controller.ts
backend/src/layout/layout.service.ts
backend/prisma/schema.prisma
```

Utilizar como referencia de funcionalidad existente a refactorizar.

No tratar el modelo actual como fuente final de verdad cuando contradiga este baseline.

---

# 96. Documentos siguientes

Este documento deberá alimentar directamente:

1. `DATA_MODEL.md`
2. `API_CONTRACTS.md`
3. `NON_FUNCTIONAL_REQUIREMENTS.md`
4. `ACCEPTANCE_CRITERIA.md`
5. `ROADMAP_IMPLEMENTATION.md`

---

# 97. Baseline

Con esta versión se establece:

```text
SEATING_MAP_VERSION = 1.0
```

La decisión de croquis queda congelada como baseline de implementación hasta que un Change Request aprobado modifique explícitamente su alcance.
