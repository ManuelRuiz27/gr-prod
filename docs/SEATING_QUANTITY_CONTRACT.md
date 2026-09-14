# Croquis precargado y asignación por cantidades

Fecha: 2026-09-14. Estado: **frontend de vista previa implementado; contrato de backend aprobado, pendiente de implementación**.

Este documento registra el cambio autorizado de selección nominal a cantidades. Prevalece para esta evolución sobre las reglas anteriores de `GroupMember → EventTable`. No declara desplegadas las rutas nuevas ni cambia el dominio financiero.

## Entrega frontend

- Plantilla `taller-2560`, versión `1`, en `frontend/src/assets/seating/taller-2560.v1.json` y fondo SVG compañero. 100 mesas, renumeradas por filas, con claves físicas estables `r01-c01`…; etiquetas no son identificadores de persistencia.
- Capacidades `null`: BR-SEAT-003 exige capacidad positiva pero no documenta el aforo de este salón. El ejemplo de 30 mesas con capacidad 10 en SEATING_MAP no es el aforo del croquis. Ninguna ocupación o disponibilidad se infiere de la fotografía ni de fixtures.
- SVG estático del salón y objetos Konva independientes. Coordenadas centrales normalizadas; dimensiones físicas del dibujo 1540 × 1000, en horizontal, con pista y escenario arriba. Se corrigió la orientación girando 90° a la izquierda, conservando claves y números de mesa. El visor escala uniformemente ambos ejes. Los mocks guardados con la orientación anterior se adaptan al leerlos, sin perder cantidades ni respuestas idempotentes.
- Graduado y administrador consultan la misma plantilla por defecto. No se crea un evento ni una membresía ficticia al abrirla. No hay creación, importación, OCR, edición o selector de catálogo visibles.
- `capacity: null` solo existe en la plantilla de preview. No modificar la restricción positiva de `EventTable` ni sembrar este plano como mesas operativas hasta disponer de capacidades verificadas.
- El modo predeterminado no llama endpoints de seating ni permite confirmar cantidades. Los fixtures operativos comparten `src/mocks/seatingQuantityScenarios.ts`, importado exclusivamente desde pruebas y la ruta DEV de QA; no desde el adaptador normal ni las pantallas productivas.

### Mocks y revisión local

Con Vite en desarrollo, `/__qa/seating` permite probar 10 casos: preview sin capacidades, disponibles, parcial, completas, bloqueadas, pago pendiente, fecha cerrada, pérdida de cupo, conflicto de versión y falla de red con reintento. El selector cambia el mock aislado y permite vista de graduado o administrador. Ejemplo: `/__qa/seating?scenario=partial`.

La página muestra permanentemente que las capacidades son simuladas. Está excluida del build de producción mediante `import.meta.env.DEV`. El adaptador de prueba no usa red ni guarda datos; simula idempotencia, movimientos atómicos y errores para verificar la UX. No acredita concurrencia ni seguridad del backend real. Las rutas normales continúan en preview.

## Activación e interfaces

`VITE_SEATING_SOURCE=http` habilita explícitamente el adaptador HTTP **solo después** de desplegar el contrato y registrar el mapa del evento con capacidades reales. La ausencia de la variable conserva preview. No hay fallback automático desde un error HTTP a datos simulados.

El graduado usa membresías de AuthContext, `event_id` de la URL si pertenece al usuario, o su única membresía. Si falta contexto solicita elegir entre sus eventos. ADMIN toma `eventId` de la ruta. El backend sigue autorizando cada petición, sin confiar en IDs del cliente.

Contrato de máquina: `SEATING_QUANTITY.openapi.yaml`. Rutas relativas a `/api/v1`:

| Método / ruta | Contenido |
|---|---|
| GET `/me/events/{eventId}/seating-map` | Nuevo snapshot geométrico y agregado, sin identidades ajenas |
| GET `/admin/events/{eventId}/seating-map` | Mismo snapshot público para el visor; detalle nominal sigue en consultas administrativas autorizadas |
| GET `/me/events/{eventId}/table-allocations` | Distribución propia, cantidades identificadas, versión y lugares confirmados/ubicados/pendientes |
| PUT `/me/events/{eventId}/table-allocations` | Reemplazo atómico de la distribución propia completa |

Los GET del mapa cambian de forma respecto al servicio actual; coordinar su publicación con el adaptador, no activar un cliente nuevo contra el payload nominal antiguo. `template_key` es la asociación estable de cada EventTable con una mesa del catálogo, única por mapa. `template_id` y `template_version` seleccionan un recurso precargado confiable; no se ejecuta SVG arbitrario recibido del servidor.

El mapa entrega geometría completa (`x`, `y`, `width`, `height`, `shape`, `label`), capacidad positiva, `occupied`, `available` y `AVAILABLE|BLOCKED`. `available = capacity - occupied` expresa espacio físico; `BLOCKED` impide nuevos lugares aunque queden libres. Deben corresponder exactamente las claves de la versión del croquis. Si falta una mesa, capacidad o dimensión, el cliente bloquea la operación.

Elegibilidad: `ELIGIBLE`, `PAYMENT_REQUIRED`, `DEADLINE_CLOSED`, `EVENT_CLOSED`, `MEMBERSHIP_INACTIVE`. Se deriva en el servidor, nunca de porcentajes o importes calculados por el frontend. `confirmed_places` solo incluye lugares comerciales confirmados que consumen capacidad de mesa; no productos sin lugar. La condición financiera sigue siendo la del evento, no necesariamente liquidación total.

El PUT lleva `Idempotency-Key` y `{ expected_version, allocations: [{ table_id, quantity }] }`. Cantidades enteras positivas; mesas omitidas quedan sin cantidad para esa membresía. Array vacío libera su distribución de mesas, sin cancelar lugares contratados ni generar reembolsos. No repetir mesa. Confirmar devuelve `{ map, allocation_state }`, ambos del resultado transaccional. El cliente no modifica ocupación por seleccionar o revisar.

## Persistencia y concurrencia pendientes de backend

1. Añadir `TableAllocation(id, membership_id, table_id, quantity, created_at, updated_at)` y versión monotónica de distribución por membresía. Cantidad positiva; relación única membresía/mesa; mismo evento. Mantener historial/auditoría de cambios y liberaciones.
2. Migrar las asignaciones nominales agrupando miembros activos por membresía/mesa. Vincular `TableAssignment` con su allocation; conservar identidad, mesa y trazabilidad. Ocupación autoritativa = SUM de cantidades activas, **no** suma adicional de asignaciones nominales.
3. Los endpoints nominales existentes pasan a vincular/reasignar integrantes dentro de cantidades ya ubicadas. No pueden crear ocupación al margen de TableAllocation. Un miembro mantiene como máximo una asignación activa. `named_quantity <= quantity` siempre.
4. Para confirmar: autorizar actor, bloquear membresía y todas las mesas de origen/destino en orden estable; revalidar evento, fecha, elegibilidad, versión y lugares confirmados dentro de la transacción. Restar las cantidades propias anteriores antes de calcular el cupo final. Mover cantidades es una operación única; si falla, conservar toda la distribución anterior.
5. No permitir reducir por debajo de integrantes identificados. Su reasignación nominal debe resolverse antes. Una mesa bloqueada admite conservar o reducir la cantidad existente; no incrementarla. No eliminar mesas con allocations activas ni reducir capacidad bajo su suma.
6. Cancelaciones y reducciones comerciales deben liberar/adaptar cantidades e incrementar la versión, preservando historia y reglas financieras. Reportes administrativos distinguen `quantity`, `named_quantity` y pendientes de identificar sin inventar asistentes.
7. Idempotencia vinculada a actor/evento/clave y hash del payload: repetir solicitud idéntica devuelve el mismo resultado; distinta carga con misma clave se rechaza. Validar propiedad también al recuperar respuestas guardadas.
8. Cada cambio de cantidades publica disponibilidad agregada para todas las mesas afectadas, sin PII; actualizar productores de `table_assignment.changed.v1` para incluir este caso. El frontend usa REST cada 5 segundos mientras la pestaña está visible, al recuperar foco y tras guardar. Cancela lecturas antiguas y peticiones al desmontar/cambiar evento.

## Errores

Conservar envelope estándar `{ error: { code, message, ... } }`. El adaptador acepta también el envelope legacy plano para mostrar códigos conocidos sin exponer mensajes internos.

- `SEATING_NOT_FINANCIALLY_ELIGIBLE`, `SEATING_DEADLINE_CLOSED`, `TABLE_NOT_FOUND`, `TABLE_BLOCKED`, `ASSIGNMENT_EVENT_MISMATCH`: mantener semántica documentada.
- 409 `TABLE_CAPACITY_CHANGED`: cupo insuficiente al confirmar.
- 409 `ALLOCATION_VERSION_CHANGED`: distribución modificada por otra sesión.
- 409 `ALLOCATION_BELOW_NAMED_QUANTITY`: reducción incompatible con integrantes identificados.
- 409 `ALLOCATION_EXCEEDS_CONFIRMED_PLACES`: excede los lugares comerciales confirmados.

Ante conflicto: refrescar snapshot, conservar los lugares confirmados del servidor, mostrar causa y exigir revisión y confirmación nuevas. Ante respuesta incompleta o sin conexión: deshabilitar confirmación hasta recuperar lectura válida. El mismo intento reintentado con igual cuerpo conserva su clave de idempotencia.

## Criterios de aceptación

Los escenarios también se pueden probar con las cuentas locales existentes de Andrea y Administrador Principal desde sus pantallas de mesas. Ver [accesos y flujo de prueba](DEMO_MOCK.md#croquis-pruebas-con-los-usuarios-correspondientes). Es una simulación de desarrollo con almacenamiento local compartido por evento/caso, separada del adaptador HTTP y sin cambios de backend.

- Preview conserva 100 posiciones y claves únicas, capacidades pendientes, ninguna cifra comercial ni mutación.
- Disponible/parcial/completa/bloqueada y forma circular funcionan con fixtures de prueba; selección añade contorno sin cambiar estado real.
- Cantidades se distribuyen en varias mesas; los nombres son opcionales al ubicar; límites de cupo, total propio e integrantes vinculados se respetan antes de enviar y se revalidan en servidor.
- Dinero confirmado no equivale a mesa asignada: el pago habilita elección, la confirmación de allocation ocupa la mesa.
- Backend pendiente: carrera por el último lugar, movimientos atómicos, cancelación, doble envío y reintento, migración sin doble conteo, aislamiento entre membresías y exclusión de identidades ajenas.
- La actual respuesta backend de graduado incluye nombres ajenos: **debe corregirse en origen antes de activar HTTP**. Sanitización cliente no sustituye esa corrección.
