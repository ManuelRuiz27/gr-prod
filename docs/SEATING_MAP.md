# Plataforma GR — Croquis y Selección de Mesas

**Documento:** `SEATING_MAP.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.1  
**Estado:** Baseline de dominio, UX y concurrencia  
**Fecha:** 31 de agosto de 2026  
**Fuentes:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `UX_FLOWS.md`

---

# 1. Objetivo

El módulo representa visualmente la distribución de mesas de un evento y administra asignaciones de personas nominales a mesas con capacidad suficiente.

No es:

- CAD;
- selector de silla;
- reconocimiento de planos;
- editor complejo de zonas;
- sistema de check-in.

---

# 2. Decisión funcional

Formas oficiales:

```text
SQUARE
ROUND
```

Cada mesa tiene:

- id;
- etiqueta/número;
- forma;
- capacidad;
- posición/tamaño;
- estado.

Estados persistidos:

```text
AVAILABLE
BLOCKED
```

`FULL` es derivado.

---

# 3. Reutilización técnica

Se podrá reutilizar infraestructura gráfica de `Soft-Monkey_InvitacionesPremium`:

- React Konva;
- Stage/canvas;
- zoom/pan;
- selección;
- drag & drop;
- coordenadas normalizadas;
- render de mesas.

No se reutilizan invitaciones, RSVP, check-in, seats, categorías VIP, zonas avanzadas ni dominio multi-tenant.

---

# 4. Fondo visual

ADMIN puede cargar:

```text
JPG
PNG
PDF de una página convertido a imagen
```

El fondo es solo referencia.

```text
BackgroundAsset != EventTable
```

Cambiar/eliminar fondo no destruye mesas ni asignaciones.

---

# 5. Modos

## ADMIN — EDITABLE

Puede:

- crear mesa;
- crear múltiples mesas;
- mover;
- editar etiqueta/capacidad;
- bloquear/desbloquear;
- duplicar;
- eliminar si no está ocupada;
- consultar asignaciones;
- asignar/reasignar personas.

## GRADUATE — READ_ONLY + MEMBER_TABLE_SELECTION

Puede:

- ver croquis;
- zoom/pan;
- consultar disponibilidad agregada;
- consultar sus propias personas/asignaciones;
- asignar/cambiar mesa de integrantes propios cuando esté habilitado.

No puede editar objetos del croquis ni ver PII ajena.

---

# 6. SeatingMap

```text
SeatingMap
----------
id
event_id
background_file_id nullable
background_original_width nullable
background_original_height nullable
coordinate_mode = NORMALIZED
created_at
updated_at
```

Relación:

```text
Event 1 -> 0..1 SeatingMap
```

---

# 7. EventTable

```text
EventTable
----------
id
event_id
seating_map_id
label
shape SQUARE|ROUND
capacity
position_x
position_y
width
height
status AVAILABLE|BLOCKED
created_at
updated_at
```

Constraints:

```text
UNIQUE(event_id, label)
capacity > 0
0 <= position_x <= 1
0 <= position_y <= 1
0 < width <= 1
0 < height <= 1
```

---

# 8. Unidad de asignación

La versión anterior modelaba cantidad de lugares de una membresía hacia una mesa. Ese enfoque queda reemplazado.

Modelo objetivo:

```text
GraduateMembership
  └── GroupMember[]
        └── TableAssignment -> EventTable
```

Ejemplo:

```text
Andrea (graduada)      -> Mesa 12
Invitado Adulto 1      -> Mesa 12
Invitado Adulto 2      -> Mesa 17
Invitado Niño 1        -> Mesa 12
```

Esto permite dividir un grupo entre mesas sin modelar sillas.

---

# 9. TableAssignment

```text
TableAssignment
---------------
id
event_id
group_member_id
table_id
assigned_by_account_id
assigned_at
updated_at
```

Invariantes:

```text
1 active GroupMember -> max 1 active table assignment
GroupMember.event == EventTable.event
```

Si se requiere historial detallado de reasignación, AuditLog preserva before/after; alternativamente el modelo físico puede usar vigencia/soft history siempre que el contrato API presente una única asignación activa por persona.

---

# 10. Sin silla individual

No existe requisito funcional de:

```text
seat_id
seat_number
chair_id
seat_position
```

La mesa identifica ubicación suficiente para el MVP.

---

# 11. Ocupación y disponibilidad

```text
occupied_places = COUNT(active TableAssignment for table)
available_places = table.capacity - occupied_places
```

Invariante:

```text
0 <= occupied_places <= capacity
```

No persistir contadores manuales como fuente de verdad.

---

# 12. Privacidad

Respuesta GRADUATE de una mesa puede incluir:

```json
{
  "id": "table_uuid",
  "label": "Mesa 24",
  "shape": "SQUARE",
  "capacity": 10,
  "occupied_places": 6,
  "available_places": 4,
  "status": "AVAILABLE",
  "position": {"x": 0.42, "y": 0.35}
}
```

Nunca incluir para terceros:

- nombres;
- teléfonos;
- correos;
- folios;
- relación familiar;
- finanzas;
- notas administrativas.

ADMIN sí puede consultar las personas asignadas.

---

# 13. Condición financiera de acceso

Antes de permitir selección/reasignación iniciada por GRADUATE, backend evalúa:

```text
membership ACTIVE
event OPEN
table deadline vigente
financial_seating_condition == satisfied
```

Cuando el evento utiliza pago inicial para confirmar comercialmente lugares:

```text
initial required obligation fully covered
→ places confirmed
→ seating eligible
```

La UI no decide elegibilidad usando un porcentaje calculado localmente.

---

# 14. Flujo GRADUATE

```text
Mi grupo
→ Mesas
→ validar elegibilidad
→ seleccionar persona(s) propias
→ visualizar croquis
→ elegir mesa con disponibilidad suficiente
→ confirmar
→ transacción backend
→ resultado
```

La UI puede permitir seleccionar varias personas y asignarlas en una sola operación siempre que cada una termine con una asignación activa individual.

---

# 15. Grupo distribuido

No existe requisito de mantener a todo el grupo junto.

Ejemplo válido:

```text
Membresía con 8 personas
Mesa A -> 5 personas nominales
Mesa B -> 3 personas nominales
```

La aplicación debe mostrar al GRADUATE un resumen por persona para evitar ambigüedad.

---

# 16. Flujo ADMIN

ADMIN puede asignar desde:

```text
Mesa -> Asignaciones
```

o:

```text
Graduado -> Mesa
```

Flujo:

```text
seleccionar persona(s)
→ seleccionar mesa
→ validar mismo evento
→ validar mesa AVAILABLE
→ validar capacidad
→ confirmar
→ auditar
```

Para override fuera de deadline, ADMIN debe indicar motivo cuando la regla aplicable lo requiera.

---

# 17. Reasignación

Reasignar una persona deberá tratar mesa origen y destino dentro de una sola operación transaccional.

```text
lock origen/destino en orden determinista
→ validar destino
→ actualizar assignment
→ commit
```

Si el destino perdió capacidad:

```text
409 TABLE_CAPACITY_CHANGED
```

La asignación anterior debe permanecer válida si la transacción falla.

---

# 18. Concurrencia

Escenario:

```text
Mesa tiene 1 lugar disponible.
Persona A y Persona B intentan confirmar al mismo tiempo.
```

Resultado obligatorio:

```text
solo una persiste
la otra recibe conflicto
ocupación nunca > capacidad
```

Estrategia técnica:

- PostgreSQL transaction;
- row locking o `SERIALIZABLE`;
- locks múltiples en orden determinista;
- retry limitado ante serialization failure/deadlock.

---

# 19. Bloqueo de mesa

`BLOCKED`:

- no acepta nuevas asignaciones ordinarias;
- no borra asignaciones existentes;
- puede volver a `AVAILABLE` por ADMIN.

---

# 20. Cambiar capacidad

Si:

```text
new_capacity < occupied_places
```

rechazar:

```text
TABLE_CAPACITY_BELOW_OCCUPANCY
```

No mover ni borrar personas automáticamente para aceptar una reducción.

---

# 21. Eliminar mesa

Solo si no existen asignaciones activas.

Con asignaciones:

```text
409 TABLE_HAS_ASSIGNMENTS
```

Primero se deben reasignar/liberar personas mediante flujo explícito.

---

# 22. Creación múltiple

ADMIN puede indicar:

```text
quantity
shape
capacity
start_number
```

Ejemplo:

```text
30 mesas SQUARE
capacidad 10
numeración desde 1
```

El sistema genera mesas y después ADMIN acomoda en canvas.

No se requiere editor matricial/filas-columnas.

---

# 23. Coordenadas y drag

Persistencia:

```text
NORMALIZED 0..1
```

Durante `onDragMove` la posición puede mantenerse localmente.

Persistir al terminar `onDragEnd`, no en cada frame.

---

# 24. Deadlines

GRADUATE:

```text
now <= table_change_deadline
```

para crear/cambiar asignación, además de demás reglas.

Después:

- solo lectura;
- ADMIN puede override con auditoría.

---

# 25. Cancelación/reducción

Al cancelar una membresía:

- las asignaciones activas de sus `GroupMember` se liberan;
- la historia se conserva vía auditoría/historial.

Al desactivar/remover un integrante mediante reducción autorizada:

- su asignación activa debe liberarse en la misma operación lógica o antes de completar la reducción;
- no se puede dejar ocupación fantasma.

---

# 26. Contratos API conceptuales

GRADUATE:

```http
GET /api/v1/me/events/{eventId}/seating-map
GET /api/v1/me/events/{eventId}/table-assignments
PUT /api/v1/me/events/{eventId}/table-assignments
```

Payload ejemplo:

```json
{
  "assignments": [
    {"group_member_id": "uuid-1", "table_id": "table-a"},
    {"group_member_id": "uuid-2", "table_id": "table-b"}
  ]
}
```

Backend ignora cualquier intento de asignar `group_member_id` ajeno.

ADMIN:

```http
GET /api/v1/admin/events/{eventId}/seating-map
POST /api/v1/admin/events/{eventId}/tables
POST /api/v1/admin/events/{eventId}/tables/bulk
PATCH /api/v1/admin/events/{eventId}/tables/{tableId}
DELETE /api/v1/admin/events/{eventId}/tables/{tableId}
PUT /api/v1/admin/events/{eventId}/graduates/{membershipId}/table-assignments
```

---

# 27. Errores de negocio

```text
SEATING_MAP_NOT_FOUND
SEATING_NOT_FINANCIALLY_ELIGIBLE
SEATING_DEADLINE_CLOSED
GROUP_MEMBER_NOT_FOUND
GROUP_MEMBER_NOT_OWNED
GROUP_MEMBER_ALREADY_ASSIGNED
TABLE_NOT_FOUND
TABLE_BLOCKED
TABLE_CAPACITY_CHANGED
TABLE_HAS_ASSIGNMENTS
TABLE_CAPACITY_BELOW_OCCUPANCY
TABLE_LABEL_ALREADY_EXISTS
INVALID_TABLE_SHAPE
INVALID_TABLE_POSITION
ASSIGNMENT_EVENT_MISMATCH
```

---

# 28. Criterios críticos

Debe probarse al menos:

1. integrantes del mismo grupo pueden estar en mesas diferentes;
2. una persona no puede quedar en dos mesas activas simultáneamente;
3. no existe seat selection;
4. un GRADUATE no asigna personas ajenas manipulando IDs;
5. la selección se bloquea si no cumple condición financiera;
6. deadline bloquea GRADUATE pero permite override ADMIN auditable;
7. concurrencia nunca sobrepasa capacidad;
8. reemplazar fondo no elimina mesas/asignaciones;
9. cancelar membresía libera ocupación sin borrar historia.
