# ROLES_PERMISSIONS.md

# Plataforma GR — Roles y Permisos

**Documento:** `ROLES_PERMISSIONS.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline de autorización para diseño técnico e implementación  
**Fecha:** 24 de agosto de 2026  
**Documentos fuente:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`  
**Propósito:** Definir de forma inequívoca los roles del sistema, su ámbito de acceso, permisos por recurso y reglas de autorización.

---

# 1. Propósito

Este documento define:

- roles válidos;
- alcance de cada rol;
- recursos accesibles;
- operaciones permitidas;
- operaciones prohibidas;
- ownership de datos;
- validaciones de autorización;
- acciones que requieren auditoría;
- restricciones que deben aplicarse en backend.

Este documento deberá utilizarse como fuente para:

- guards/middlewares de autorización;
- claims de sesión/JWT;
- contratos API;
- diseño de endpoints;
- frontend;
- pruebas de autorización;
- QA;
- auditoría.

---

# 2. Principios de autorización

## RP-PRINCIPLE-001 — Solo dos roles

Los únicos roles funcionales válidos son:

```text
ADMIN
GRADUATE
```

No existen:

- Super Admin;
- Owner;
- Manager;
- Planner;
- Organizer;
- Staff;
- Scanner;
- Hostess;
- Coordinador;
- Cajero;
- Soporte;
- permisos personalizados;
- subroles administrativos.

---

## RP-PRINCIPLE-002 — Backend como autoridad

La autorización deberá ejecutarse en backend.

Ocultar un botón o una sección en frontend no constituye una medida de autorización suficiente.

---

## RP-PRINCIPLE-003 — Rol no confiable desde frontend

El backend no deberá aceptar como fuente de autoridad:

```text
role
graduate_id
event_id
account_id
```

cuando estos valores provengan únicamente del frontend.

Los recursos solicitados deberán validarse contra la identidad autenticada y las relaciones persistidas.

---

## RP-PRINCIPLE-004 — Principio de mínimo acceso

Cada rol deberá recibir únicamente los datos necesarios para la operación autorizada.

---

## RP-PRINCIPLE-005 — Ownership del graduado

Una cuenta `GRADUATE` solo puede operar recursos asociados a sus propias membresías autorizadas.

---

## RP-PRINCIPLE-006 — Alcance global del ADMIN

Un `ADMIN` puede operar todos los eventos de la instancia single-tenant.

---

# 3. Modelo de identidad recomendado

La identidad autenticable deberá modelarse separando cuenta de perfil de dominio.

Modelo conceptual:

```text
Account
-------
id
email
password_hash
role
status

role:
- ADMIN
- GRADUATE
```

Para graduados:

```text
GraduateMembership
------------------
id
account_id
event_id
status
...
```

Una cuenta GRADUATE puede tener una o más membresías válidas en eventos diferentes.

---

# 4. Claims de autenticación

El token/sesión autenticada deberá contener únicamente información suficiente para identificar la cuenta.

Modelo conceptual recomendado:

```json
{
  "sub": "account_id",
  "role": "ADMIN"
}
```

o:

```json
{
  "sub": "account_id",
  "role": "GRADUATE"
}
```

No es recomendable utilizar como fuente permanente de autorización dentro del token:

- `graduate_id`;
- `event_id`;
- lista de permisos;
- estado financiero;
- mesa actual;
- datos operativos susceptibles de cambiar.

Dichos datos deberán resolverse contra la base de datos cuando la operación lo requiera.

---

# 5. Estados de cuenta

Estados mínimos recomendados:

```text
ACTIVE
DISABLED
```

Una cuenta `DISABLED` no podrá iniciar nuevas sesiones ni ejecutar operaciones autenticadas.

El refinamiento de estados de identidad podrá formalizarse posteriormente en `DATA_MODEL.md`.

---

# 6. Rol ADMIN

## 6.1 Definición

`ADMIN` representa a una persona autorizada por la empresa operadora para administrar Plataforma GR.

Puede haber múltiples cuentas ADMIN.

Todas tienen el mismo rol funcional.

---

## 6.2 Alcance

ADMIN puede operar:

- configuración global permitida;
- cuentas administrativas;
- todos los eventos;
- todos los graduados;
- lugares;
- mesas;
- platillos;
- termos;
- pagos;
- ajustes;
- reembolsos;
- conciliación;
- reportes;
- auditoría.

---

## 6.3 Restricciones

Aunque ADMIN tiene acceso operativo amplio, no podrá:

- editar destructivamente pagos confirmados;
- eliminar auditoría;
- generar sobrecupo;
- reducir capacidad de mesa por debajo de asignaciones existentes;
- violar invariantes financieros;
- modificar silenciosamente planes congelados;
- eliminar físicamente información histórica cuando exista una regla de preservación.

El rol no omite reglas de negocio.

---

# 7. Rol GRADUATE

## 7.1 Definición

`GRADUATE` representa al graduado que participa en uno o más eventos autorizados.

---

## 7.2 Alcance

GRADUATE puede operar únicamente:

- su perfil;
- sus membresías;
- sus lugares;
- integrantes de su grupo;
- su selección de mesa;
- sus platillos;
- su plan financiero;
- sus intentos de pago;
- su historial financiero visible;
- su termo;
- sus notificaciones.

---

## 7.3 Restricciones

GRADUATE no puede consultar ni modificar:

- otros graduados;
- otros grupos;
- PII de terceros;
- pagos de terceros;
- configuración de eventos;
- capacidad global del evento;
- configuración de mesas;
- croquis administrativo editable;
- reportes;
- auditoría;
- ajustes;
- reembolsos;
- pagos manuales;
- cuentas ADMIN;
- estados administrativos de termo;
- secretos de proveedores.

---

# 8. Matriz global de permisos

Leyenda:

| Símbolo | Significado |
|---|---|
| ✅ | Permitido |
| ⚠️ | Permitido bajo reglas/condiciones |
| ❌ | Prohibido |

| Recurso / acción | ADMIN | GRADUATE |
|---|---:|---:|
| Iniciar sesión | ✅ | ✅ |
| Cerrar sesión | ✅ | ✅ |
| Recuperar contraseña | ✅ | ✅ |
| Crear cuenta ADMIN | ✅ | ❌ |
| Configurar permisos personalizados | ❌ | ❌ |
| Crear evento | ✅ | ❌ |
| Editar evento | ✅ | ❌ |
| Abrir evento | ✅ | ❌ |
| Cerrar evento | ✅ | ❌ |
| Reabrir evento | ✅ | ❌ |
| Finalizar evento | ✅ | ❌ |
| Cancelar evento | ✅ | ❌ |
| Ver todos los eventos | ✅ | ❌ |
| Ver eventos propios autorizados | ✅ | ✅ |
| Ver todos los graduados | ✅ | ❌ |
| Ver expediente de otro graduado | ✅ | ❌ |
| Ver expediente propio | ✅ | ✅ |
| Agregar integrante | ✅ | ⚠️ |
| Editar integrante | ✅ | ⚠️ |
| Autorizar reducción de lugares | ✅ | ❌ |
| Aumentar lugares | ✅ | ⚠️ |
| Editar croquis | ✅ | ❌ |
| Crear mesa | ✅ | ❌ |
| Mover mesa | ✅ | ❌ |
| Cambiar capacidad de mesa | ✅ | ❌ |
| Bloquear mesa | ✅ | ❌ |
| Ver croquis operativo | ✅ | ✅ |
| Ver PII de otros grupos en croquis | ✅ | ❌ |
| Elegir mesa propia | ✅ | ⚠️ |
| Cambiar mesa propia dentro de deadline | ✅ | ⚠️ |
| Cambiar mesa fuera de deadline | ✅ | ❌ |
| Dividir grupo entre mesas | ✅ | ⚠️ |
| Configurar platillos | ✅ | ❌ |
| Elegir platillos propios | ✅ | ⚠️ |
| Modificar platillos tras deadline | ✅ | ❌ |
| Ver plan financiero propio | ✅ | ✅ |
| Ver plan financiero de terceros | ✅ | ❌ |
| Iniciar pago electrónico propio | ❌* | ✅ |
| Registrar efectivo/transferencia | ✅ | ❌ |
| Confirmar manualmente pago propio | ❌ | ❌ |
| Editar pago confirmado | ❌ | ❌ |
| Crear ajuste | ✅ | ❌ |
| Crear reembolso | ✅ | ❌ |
| Ver conciliación | ✅ | ❌ |
| Ver cartera global | ✅ | ❌ |
| Solicitar termo propio | ✅ | ⚠️ |
| Marcar termo en producción | ✅ | ❌ |
| Marcar termo entregado | ✅ | ❌ |
| Cancelar participación de graduado | ✅ | ❌ |
| Ver reportes | ✅ | ❌ |
| Exportar reportes | ✅ | ❌ |
| Ver historial de auditoría | ✅ | ❌ |
| Editar/eliminar auditoría | ❌ | ❌ |

\* ADMIN puede visualizar y gestionar el expediente financiero, pero el flujo ordinario de Checkout Pro pertenece al GRADUATE. Cualquier flujo ADMIN que inicie un pago electrónico deberá definirse explícitamente antes de implementarse.

---

# 9. Permisos — Eventos

## RP-EVT-001 — Crear

```text
ADMIN: ALLOW
GRADUATE: DENY
```

---

## RP-EVT-002 — Leer evento

### ADMIN

Puede consultar cualquier evento de la instancia.

### GRADUATE

Puede consultar únicamente eventos para los que exista una membresía autorizada asociada a su cuenta.

---

## RP-EVT-003 — Editar configuración

```text
ADMIN: ALLOW
GRADUATE: DENY
```

La autorización no omite reglas sobre planes financieros congelados.

---

## RP-EVT-004 — Cambiar ciclo de vida

Solo ADMIN puede:

- abrir;
- cerrar;
- reabrir;
- finalizar;
- cancelar.

---

## RP-EVT-005 — Evento no operativo

Si un evento se encuentra:

```text
CLOSED
FINALIZED
CANCELLED
```

el rol GRADUATE no puede realizar mutaciones ordinarias, aunque técnicamente posea membresía.

---

# 10. Permisos — Graduados

## RP-GRAD-001 — Listado

```text
ADMIN: ALLOW
GRADUATE: DENY
```

GRADUATE no deberá disponer de un endpoint que liste graduados del evento.

---

## RP-GRAD-002 — Detalle

### ADMIN

Puede consultar cualquier graduado.

### GRADUATE

Solo puede consultar su propia membresía/perfil.

---

## RP-GRAD-003 — Búsqueda

La búsqueda de graduados es exclusiva de ADMIN.

---

## RP-GRAD-004 — Cancelación

Solo ADMIN puede cancelar una membresía de graduado.

La operación requiere motivo y auditoría.

---

# 11. Permisos — Grupo e integrantes

## RP-GROUP-001 — Leer grupo

### ADMIN

Puede consultar cualquier grupo.

### GRADUATE

Puede consultar únicamente su grupo.

---

## RP-GROUP-002 — Agregar integrante

### GRADUATE

Permitido únicamente si:

- evento `OPEN`;
- deadline vigente;
- capacidad disponible;
- lugares vigentes suficientes;
- reglas financieras satisfechas.

### ADMIN

Puede realizar la operación bajo reglas de negocio y auditoría cuando corresponda.

---

## RP-GROUP-003 — Modificar integrante

GRADUATE puede modificar únicamente integrantes de su propio grupo dentro de las condiciones habilitadas.

ADMIN puede realizar modificaciones administrativas autorizadas.

---

## RP-GROUP-004 — Reducir lugares

GRADUATE no confirma reducciones por sí mismo.

Solo ADMIN puede aprobar/aplicar una reducción.

---

# 12. Permisos — Croquis y mesas

## RP-SEAT-001 — Editar croquis

```text
ADMIN: ALLOW
GRADUATE: DENY
```

---

## RP-SEAT-002 — Crear/editar/eliminar mesa

Solo ADMIN puede:

- crear;
- duplicar;
- mover;
- cambiar capacidad;
- bloquear;
- eliminar cuando sea válido.

---

## RP-SEAT-003 — Consultar croquis como graduado

GRADUATE puede consultar:

- etiqueta de mesa;
- forma;
- capacidad;
- disponibilidad;
- estado.

No puede consultar:

- nombres de otros graduados;
- teléfonos;
- correos;
- montos;
- integrantes de otros grupos.

---

## RP-SEAT-004 — Elegir mesa

GRADUATE puede intentar seleccionar mesa si:

- evento `OPEN`;
- deadline vigente;
- mesa disponible;
- capacidad suficiente;
- membresía activa.

La autorización definitiva depende del backend.

---

## RP-SEAT-005 — Cambio después de deadline

```text
ADMIN: ALLOW
GRADUATE: DENY
```

ADMIN debe indicar motivo.

---

## RP-SEAT-006 — División de grupo

ADMIN puede distribuir lugares entre múltiples mesas.

GRADUATE podrá utilizar un flujo de división solo si este queda expresamente habilitado por UX/reglas de evento.

En ausencia de dicho flujo, deberá escalarse a ADMIN.

---

# 13. Permisos — Platillos

## RP-MEAL-001 — Configurar catálogo

```text
ADMIN: ALLOW
GRADUATE: DENY
```

---

## RP-MEAL-002 — Seleccionar

GRADUATE puede seleccionar platillos únicamente para integrantes de su propio grupo.

---

## RP-MEAL-003 — Deadline

Después del deadline:

```text
GRADUATE: READ_ONLY
ADMIN: WRITE_WITH_AUDIT
```

---

## RP-MEAL-004 — Override administrativo

ADMIN puede modificar una selección fuera de deadline.

Debe registrar motivo y auditoría.

---

# 14. Permisos — Finanzas

## RP-FIN-001 — Ver plan financiero

### ADMIN

Puede consultar cualquier plan.

### GRADUATE

Puede consultar únicamente su plan dentro del evento seleccionado.

---

## RP-FIN-002 — Configurar condiciones financieras

Solo ADMIN puede configurar las condiciones financieras del evento.

---

## RP-FIN-003 — Modificar plan congelado

Ningún rol puede modificar destructivamente un plan congelado.

ADMIN deberá utilizar:

- ajustes;
- cancelaciones;
- reembolsos;
- movimientos compensatorios;

cuando la regla aplicable lo requiera.

---

## RP-FIN-004 — Historial propio

GRADUATE puede consultar su historial financiero visible.

---

## RP-FIN-005 — Historial de terceros

Solo ADMIN puede consultar pagos y obligaciones de otros graduados.

---

# 15. Permisos — Pagos electrónicos

## RP-PAY-001 — Iniciar Checkout Pro

El flujo ordinario pertenece al GRADUATE autenticado para sus propias obligaciones.

Condiciones:

- membresía activa;
- obligación válida;
- monto permitido;
- evento compatible con la operación.

---

## RP-PAY-002 — Monto no confiable

El backend no deberá aceptar como definitivo un monto arbitrario enviado por GRADUATE.

Debe resolver el importe válido a partir del plan y operación solicitada.

---

## RP-PAY-003 — Confirmación

Ningún rol puede declarar un pago electrónico como confirmado manualmente desde frontend.

La confirmación se deriva de backend/proveedor.

---

## RP-PAY-004 — Proveedor

GRADUATE no puede consultar:

- secretos;
- access tokens;
- payloads internos;
- credenciales;
- metadata sensible.

---

# 16. Permisos — Pagos manuales

## RP-MAN-001 — Registrar

```text
ADMIN: ALLOW
GRADUATE: DENY
```

---

## RP-MAN-002 — Adjuntar evidencia

Solo ADMIN podrá registrar la evidencia asociada al movimiento manual en el flujo administrativo.

---

## RP-MAN-003 — Validación

ADMIN no puede eludir reglas contables por el hecho de registrar un pago manual.

El motor financiero continúa siendo autoridad sobre aplicación y saldos.

---

# 17. Permisos — Ajustes y reembolsos

## RP-ADJ-001 — Crear ajuste

```text
ADMIN: ALLOW
GRADUATE: DENY
```

---

## RP-ADJ-002 — Crear reembolso

```text
ADMIN: ALLOW
GRADUATE: DENY
```

---

## RP-ADJ-003 — Motivo

ADMIN deberá proporcionar motivo.

No existe bypass por rol.

---

## RP-ADJ-004 — Edición destructiva

```text
ADMIN: DENY
GRADUATE: DENY
```

para editar/eliminar un pago confirmado.

---

# 18. Permisos — Cartera y conciliación

## RP-CAR-001 — Cartera global

Solo ADMIN puede consultar:

- saldo de todos los graduados;
- cartera;
- vencidos;
- próximos.

---

## RP-REC-001 — Conciliación

Solo ADMIN puede consultar y operar la vista de conciliación.

---

# 19. Permisos — Termo

## RP-TH-001 — Consultar propio

GRADUATE puede consultar únicamente el estado de su termo.

---

## RP-TH-002 — Solicitar

GRADUATE puede solicitar su termo si:

```text
status == AVAILABLE
```

---

## RP-TH-003 — Editar personalización

GRADUATE puede modificar la personalización únicamente mientras el estado permita edición.

En:

```text
IN_PRODUCTION
DELIVERED
```

no puede modificarla.

---

## RP-TH-004 — Cambiar a producción

```text
ADMIN: ALLOW
GRADUATE: DENY
```

---

## RP-TH-005 — Marcar entrega

```text
ADMIN: ALLOW
GRADUATE: DENY
```

---

# 20. Permisos — Reportes

## RP-REP-001 — Consultar

Todos los reportes administrativos son exclusivos de ADMIN.

---

## RP-REP-002 — Exportar

Solo ADMIN puede exportar:

- Excel;
- CSV;
- PDF.

---

## RP-REP-003 — Datos sensibles

Los endpoints de reportes no deberán ser accesibles por GRADUATE aunque la UI no los muestre.

---

# 21. Permisos — Auditoría

## RP-AUD-001 — Consultar auditoría

```text
ADMIN: ALLOW
GRADUATE: DENY
```

---

## RP-AUD-002 — Crear auditoría

Los registros son generados por el sistema como efecto de operaciones auditables.

No deberán existir endpoints públicos de creación arbitraria de auditoría.

---

## RP-AUD-003 — Modificar/eliminar

```text
ADMIN: DENY
GRADUATE: DENY
```

La auditoría no es editable mediante operación normal.

---

# 22. Permisos — Perfil

## RP-PROF-001 — Perfil propio

Cada cuenta puede consultar sus propios datos de perfil permitidos.

---

## RP-PROF-002 — Edición GRADUATE

GRADUATE puede modificar únicamente campos personales habilitados.

No puede modificar:

- rol;
- event_id;
- graduate_id;
- plan;
- pagos;
- lugares confirmados;
- mesa por endpoint de perfil;
- termo por endpoint de perfil.

---

## RP-PROF-003 — Edición ADMIN

ADMIN puede modificar sus propios datos personales permitidos.

No existe una configuración de permisos desde perfil.

---

# 23. Reglas de ownership

## RP-OWN-001 — Membresía

Una membresía pertenece a:

```text
account_id + event_id
```

La autorización GRADUATE debe validar dicha relación.

---

## RP-OWN-002 — Integrante

Un integrante pertenece a una membresía de graduado.

GRADUATE solo puede operar integrantes de membresías propias.

---

## RP-OWN-003 — Plan financiero

El `PaymentPlan` pertenece a una membresía concreta.

---

## RP-OWN-004 — Intento de pago

Un `PaymentAttempt` debe relacionarse con:

- cuenta;
- membresía;
- plan;
- obligaciones objetivo.

---

## RP-OWN-005 — Termo

El termo pertenece a una membresía de graduado dentro del evento.

---

## RP-OWN-006 — Notificación

GRADUATE solo puede leer/modificar el estado de lectura de sus propias notificaciones.

---

# 24. Validaciones de autorización backend

Toda petición protegida deberá aplicar, según corresponda:

```text
1. Autenticar cuenta.
2. Verificar estado ACTIVE.
3. Resolver role.
4. Resolver recurso.
5. Verificar ownership o alcance ADMIN.
6. Verificar estado del evento.
7. Verificar deadline.
8. Verificar reglas de negocio.
9. Ejecutar operación.
10. Generar auditoría si corresponde.
```

La autorización no deberá mezclarse con valores arbitrarios provenientes de UI.

---

# 25. Respuestas esperadas de autorización

## No autenticado

La petición deberá rechazarse como autenticación requerida.

Código HTTP recomendado:

```text
401 Unauthorized
```

---

## Autenticado sin permiso

La petición deberá rechazarse.

Código HTTP recomendado:

```text
403 Forbidden
```

---

## Autorizado pero conflicto de negocio

Ejemplos:

- mesa sin capacidad;
- evento sin capacidad;
- recurso modificado concurrentemente.

Código recomendado:

```text
409 Conflict
```

---

## Autorizado pero regla no satisfecha

Ejemplos:

- deadline vencido;
- termo bloqueado;
- datos incompatibles con regla.

Código recomendado:

```text
422 Unprocessable Entity
```

La codificación definitiva se formalizará en `API_CONTRACTS.md`.

---

# 26. Escenarios críticos de autorización

## AUTH-AC-001 — Acceso por ID

Dado un GRADUATE autenticado A y una membresía de otro GRADUATE B:

```text
GET /graduates/{B}
```

deberá ser rechazado aunque A conozca el identificador.

---

## AUTH-AC-002 — Pagos ajenos

Un GRADUATE no podrá consultar ni pagar una obligación que no pertenezca a una de sus membresías.

---

## AUTH-AC-003 — Croquis

Un GRADUATE puede ver disponibilidad de mesa, pero no datos de grupos asignados.

---

## AUTH-AC-004 — Cambio de evento

Modificar `event_id` manualmente en request no deberá otorgar acceso a otro evento.

---

## AUTH-AC-005 — Escalación de rol

Enviar:

```json
{
  "role": "ADMIN"
}
```

desde frontend no deberá modificar permisos ni identidad.

---

## AUTH-AC-006 — Operación ADMIN

Un GRADUATE que llame directamente a un endpoint administrativo deberá recibir rechazo independientemente de la UI.

---

## AUTH-AC-007 — Deadline

Un GRADUATE autenticado y dueño del recurso tampoco puede eludir el deadline.

Ownership no implica permiso ilimitado.

---

## AUTH-AC-008 — Pago confirmado

Ni ADMIN ni GRADUATE pueden alterar directamente el estado de un pago externo a `CONFIRMED`.

---

## AUTH-AC-009 — Auditoría

Ni ADMIN ni GRADUATE pueden eliminar una entrada de auditoría desde la operación normal.

---

# 27. Acciones que requieren auditoría

La autorización exitosa de las siguientes operaciones deberá generar auditoría:

| Operación | Auditoría |
|---|---:|
| Crear evento | Sí |
| Abrir/cerrar/reabrir evento | Sí |
| Finalizar evento | Sí |
| Cancelar evento | Sí |
| Cambio de capacidad del evento | Sí |
| Reducción administrativa de lugares | Sí |
| Cambio de mesa por ADMIN | Sí |
| Bloqueo de mesa | Sí |
| Cambio de capacidad de mesa con impacto | Sí |
| Override de platillo | Sí |
| Registrar pago manual | Sí |
| Registrar ajuste | Sí |
| Registrar reembolso | Sí |
| Cancelar graduado | Sí |
| Marcar termo en producción | Sí |
| Marcar termo entregado | Sí |
| Cambios financieros sensibles | Sí |

La lista podrá ampliarse en `AUDIT`/`DATA_MODEL`, pero no reducirse sin Change Request.

---

# 28. Recursos y scopes internos recomendados

No constituyen roles configurables.

Pueden utilizarse internamente para organizar código/políticas:

```text
events:read
events:write

graduates:read
graduates:write

seating:read
seating:write

payments:read
payments:write
payments:adjust

meals:read
meals:write

thermos:read
thermos:write

reports:read

audit:read

admins:read
admins:write
```

Estos scopes son una abstracción interna opcional.

No deberán exponerse como un sistema de permisos configurable por ADMIN.

---

# 29. Tabla de endpoints conceptuales por rol

| Endpoint conceptual | ADMIN | GRADUATE |
|---|---:|---:|
| `/admin/*` | ✅ | ❌ |
| `/events` listado global | ✅ | ❌ |
| `/events/{id}` | ✅ | ⚠️ membresía requerida |
| `/events/{id}/graduates` | ✅ | ❌ |
| `/graduates/{id}` | ✅ | ⚠️ solo propio |
| `/me/events` | ✅ | ✅ |
| `/me/profile` | ✅ | ✅ |
| `/me/group` | ❌ | ✅ |
| `/me/payments` | ❌ | ✅ |
| `/me/table` | ❌ | ✅ |
| `/me/meals` | ❌ | ✅ |
| `/me/thermo` | ❌ | ✅ |
| `/events/{id}/seating-map/admin` | ✅ | ❌ |
| `/events/{id}/seating-map/public` | ✅ | ⚠️ membresía requerida |
| `/payments/manual` | ✅ | ❌ |
| `/payments/adjustments` | ✅ | ❌ |
| `/payments/refunds` | ✅ | ❌ |
| `/reports/*` | ✅ | ❌ |
| `/audit/*` | ✅ | ❌ |

Los paths son conceptuales. Los contratos definitivos se establecerán en `API_CONTRACTS.md`.

---

# 30. Diseño recomendado de políticas

La autorización puede estructurarse conceptualmente como:

```text
authenticate()
requireRole()
loadResource()
authorizeOwnershipOrAdmin()
validateBusinessRules()
execute()
audit()
```

Ejemplo conceptual:

```text
selectTable(account, event, table):

  authenticate(account)

  requireRole(GRADUATE)

  membership =
      loadMembership(account.id, event.id)

  require(membership.active)

  require(event.status == OPEN)

  require(table.event_id == event.id)

  require(deadline_open)

  validateCapacityAtomically()

  persistAssignment()
```

---

# 31. Separación autorización vs regla de negocio

Ejemplo:

Andrea intenta seleccionar Mesa 24.

### Autorización

Preguntas:

- ¿Está autenticada?
- ¿Es GRADUATE?
- ¿La membresía pertenece a Andrea?
- ¿Mesa 24 pertenece a su evento?

### Regla de negocio

Preguntas:

- ¿Está abierto el evento?
- ¿Sigue abierto el deadline?
- ¿Mesa 24 está bloqueada?
- ¿Hay capacidad suficiente?

Ambas capas deben satisfacerse.

No deberán mezclarse todos los errores como `403`.

---

# 32. Privacidad por respuesta

## GRADUATE — mesa

Respuesta permitida:

```json
{
  "id": "table_24",
  "label": "Mesa 24",
  "capacity": 10,
  "available_places": 8,
  "status": "AVAILABLE"
}
```

Respuesta no permitida:

```json
{
  "assigned_graduates": [
    {
      "name": "Otro Graduado",
      "phone": "...",
      "email": "..."
    }
  ]
}
```

---

## GRADUATE — pagos

Puede recibir:

- obligaciones propias;
- montos propios;
- estados propios;
- transacciones propias visibles.

No deberá recibir datos de conciliación interna de otros usuarios.

---

# 33. Seguridad contra IDOR

Todos los endpoints que acepten IDs deberán considerarse susceptibles a Insecure Direct Object Reference.

Para recursos de GRADUATE:

```text
resource.owner_account_id == authenticated_account.id
```

o:

```text
resource.membership.account_id == authenticated_account.id
```

deberá verificarse en backend.

Nunca debe asumirse que un UUID difícil de adivinar es un mecanismo de autorización.

---

# 34. Restricciones del frontend

El frontend deberá:

- ocultar acciones no correspondientes al rol;
- impedir navegación accidental a módulos no permitidos;
- no enviar selectors de roles;
- no almacenar secretos;
- manejar 401/403/409/422;
- refrescar el contexto tras conflictos;
- mostrar mensajes de negocio naturales.

Sin embargo, ninguna de estas medidas sustituye las restricciones backend.

---

# 35. Matriz de trazabilidad

| Área | BUSINESS_RULES | SRS | ROLES_PERMISSIONS |
|---|---|---|---|
| Roles | BR-GEN | FR-AUTH / FR-ADM | §2–7 |
| Eventos | BR-EVT | FR-EVT | §9 |
| Graduados | BR-GEN / BR-CAN | FR-GRAD | §10 |
| Grupo | BR-PLC | FR-PLC | §11 |
| Mesas | BR-SEAT | FR-SEAT | §12 |
| Platillos | BR-MEAL | FR-MEAL | §13 |
| Finanzas | BR-FIN | FR-FIN | §14 |
| Pagos electrónicos | BR-PAY | FR-MP | §15 |
| Manuales | BR-MAN | FR-MAN | §16 |
| Ajustes | BR-ADJ | FR-ADJ | §17 |
| Cartera | BR-REP | FR-CAR | §18 |
| Termo | BR-THERMO | FR-TH | §19 |
| Reportes | BR-REP | FR-REP | §20 |
| Auditoría | BR-AUD | FR-AUD | §21 |
| Privacidad | BR-SEC | NFR-SEC / NFR-PRIV | §23, §32–33 |

---

# 36. Pruebas mínimas obligatorias

Las siguientes pruebas deberán existir en QA automatizado o integración.

## RP-TEST-001

GRADUATE A no puede consultar GRADUATE B.

## RP-TEST-002

GRADUATE no puede acceder a `/admin/*`.

## RP-TEST-003

Modificar `event_id` no permite acceder a un evento sin membresía.

## RP-TEST-004

Enviar `role=ADMIN` desde frontend no eleva privilegios.

## RP-TEST-005

GRADUATE no puede registrar pagos manuales.

## RP-TEST-006

GRADUATE no puede crear ajustes/reembolsos.

## RP-TEST-007

GRADUATE no puede ver reportes.

## RP-TEST-008

GRADUATE no puede modificar platillos después del deadline.

## RP-TEST-009

ADMIN sí puede modificar platillos después del deadline con auditoría.

## RP-TEST-010

GRADUATE no puede cambiar mesa después del deadline.

## RP-TEST-011

ADMIN puede cambiar mesa después del deadline con motivo.

## RP-TEST-012

GRADUATE no puede marcar termo en producción.

## RP-TEST-013

ADMIN no puede eliminar un pago confirmado.

## RP-TEST-014

ADMIN no puede eliminar auditoría desde una operación normal.

## RP-TEST-015

La respuesta del croquis GRADUATE no contiene PII de otros grupos.

---

# 37. Decisiones expresamente cerradas

Se consideran cerradas para baseline 1.0:

1. solo existen `ADMIN` y `GRADUATE`;
2. múltiples cuentas ADMIN comparten el mismo rol;
3. no existen permisos configurables;
4. ADMIN tiene alcance global dentro de la instancia;
5. GRADUATE tiene acceso restringido por ownership/membresía;
6. las validaciones de autorización son backend;
7. el rol no se toma del frontend;
8. endpoints administrativos no son accesibles por GRADUATE;
9. auditoría no es editable;
10. pagos confirmados no son destructivamente editables.

---

# 38. Fuera de alcance

Este documento no autoriza:

- RBAC dinámico;
- ABAC configurable por usuario;
- permisos por evento para ADMIN;
- subroles;
- responsables regionales;
- coordinadores;
- acceso de salones;
- planners;
- staff;
- scanner;
- permisos temporales;
- impersonation;
- delegación de cuenta;
- acceso de soporte externo.

Cualquiera de estos elementos requerirá Change Request.

---

# 39. Documentos siguientes

Este documento deberá utilizarse como entrada para:

1. `UX_FLOWS.md`
2. `FINANCIAL_DOMAIN.md`
3. `SEATING_MAP.md`
4. `DATA_MODEL.md`
5. `API_CONTRACTS.md`
6. `NON_FUNCTIONAL_REQUIREMENTS.md`
7. `ACCEPTANCE_CRITERIA.md`

---

# 40. Baseline

Con esta versión se establece:

```text
ROLES_PERMISSIONS_VERSION = 1.0
```

La matriz de autorización queda congelada como baseline hasta que un Change Request aprobado modifique explícitamente alguno de sus permisos o alcances.
