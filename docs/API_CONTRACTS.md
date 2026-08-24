# API_CONTRACTS.md

# Plataforma GR — Contratos API

**Documento:** `API_CONTRACTS.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline de contratos para backend, frontend, integraciones y QA  
**Fecha:** 24 de agosto de 2026  
**Documentos fuente:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `UX_FLOWS.md`, `FINANCIAL_DOMAIN.md`, `SEATING_MAP.md`, `DATA_MODEL.md`  
**API base propuesta:** `/api/v1`  
**Estilo:** REST/JSON  
**Propósito:** Definir recursos, rutas, payloads, respuestas, errores, autorización, idempotencia y contratos de integración de Plataforma GR.

---

# 1. Propósito

Este documento fija el contrato que deberán respetar:

- backend;
- frontend ADMIN;
- frontend GRADUATE;
- integraciones de pago;
- pruebas de integración;
- pruebas E2E;
- documentación OpenAPI;
- futuras migraciones del API legacy.

No define lógica nueva de negocio.

Toda operación deberá respetar:

```text
PRODUCT_SCOPE
→ BUSINESS_RULES
→ SRS
→ ROLES_PERMISSIONS
→ DATA_MODEL
→ API_CONTRACTS
```

---

# 2. Principios generales

## API-P-001 — Versionado

Todos los endpoints funcionales deberán publicarse bajo:

```text
/api/v1
```

Ejemplo:

```text
/api/v1/me/events
```

Cambios incompatibles futuros requerirán una versión nueva.

---

## API-P-002 — JSON

El formato principal será:

```http
Content-Type: application/json
```

Excepto:

- carga de archivos;
- descargas/exportaciones;
- webhooks cuando el proveedor utilice otro content type.

---

## API-P-003 — UTF-8

Toda respuesta textual utilizará UTF-8.

---

## API-P-004 — Backend authority

Los campos enviados por frontend nunca sustituyen las validaciones de:

- ownership;
- rol;
- evento;
- deadline;
- capacidad;
- saldo;
- monto;
- estado financiero.

---

# 3. Convenciones de nombres

Los payloads JSON utilizarán:

```text
snake_case
```

Ejemplo:

```json
{
  "event_id": "uuid",
  "active_places": 8,
  "created_at": "2026-08-24T21:00:00Z"
}
```

---

# 4. Identificadores

Los identificadores públicos del dominio utilizarán UUID.

Ejemplo:

```text
550e8400-e29b-41d4-a716-446655440000
```

Los UUID no constituyen autorización.

---

# 5. Fechas y horas

## Fecha civil

Formato:

```text
YYYY-MM-DD
```

Ejemplo:

```text
2027-06-19
```

---

## Timestamp

Formato:

```text
ISO 8601 UTC
```

Ejemplo:

```text
2027-03-15T18:25:43Z
```

---

## Timezone

Cuando sea relevante:

```text
America/Mexico_City
```

o el timezone configurado para el evento/plataforma.

---

# 6. Contrato monetario

Para evitar pérdida de precisión en JavaScript, los importes monetarios deberán serializarse como **strings decimales exactos**.

Ejemplo:

```json
{
  "amount": "2500.00",
  "currency": "MXN"
}
```

No devolver:

```json
{
  "amount": 2499.999999
}
```

La base de datos utilizará `Decimal/Numeric`.

---

# 7. Porcentajes

Los porcentajes enteros configurables podrán representarse como número:

```json
{
  "thermo_threshold_percent": 70,
  "financial_progress_percent": 60
}
```

Rango:

```text
0..100
```

---

# 8. Autenticación

El API utilizará un token autenticado en:

```http
Authorization: Bearer <token>
```

El token debe identificar:

```text
Account.id
Account.role
```

No deberá utilizarse como fuente de verdad para:

- event membership;
- graduate membership id;
- estados financieros;
- mesa.

---

# 9. Roles

Valores válidos:

```text
ADMIN
GRADUATE
```

Cualquier otro rol deberá considerarse inválido para baseline 1.0.

---

# 10. Respuesta exitosa

Para recursos únicos se utilizará directamente el objeto:

```json
{
  "id": "uuid",
  "name": "..."
}
```

Para colecciones paginadas:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 25,
    "total_items": 0,
    "total_pages": 0
  }
}
```

---

# 11. Error envelope

Toda respuesta de error de negocio deberá seguir:

```json
{
  "error": {
    "code": "TABLE_CAPACITY_CHANGED",
    "message": "Esta mesa ya no tiene suficientes lugares disponibles.",
    "details": {},
    "request_id": "req_..."
  }
}
```

Campos:

```text
code        estable para frontend/tests
message     lenguaje seguro y comprensible
details     datos adicionales no sensibles
request_id  correlación técnica
```

---

# 12. Códigos HTTP

| HTTP | Uso |
|---|---|
| `200` | Lectura/actualización exitosa |
| `201` | Recurso creado |
| `202` | Operación aceptada aún en proceso |
| `204` | Éxito sin body |
| `400` | Request malformado |
| `401` | No autenticado |
| `403` | Sin autorización |
| `404` | Recurso no encontrado |
| `409` | Conflicto de estado/concurrencia/idempotencia |
| `422` | Regla de negocio o validación semántica |
| `429` | Rate limit |
| `500` | Error interno no esperado |
| `502/503` | Dependencia externa no disponible cuando corresponda |

---

# 13. Paginación

Query params:

```text
page
page_size
```

Defaults propuestos:

```text
page = 1
page_size = 25
```

Máximo exacto:

```text
TBD técnico en NON_FUNCTIONAL_REQUIREMENTS.md
```

---

# 14. Orden y filtros

Convención:

```text
sort
order=asc|desc
```

Ejemplo:

```text
?sort=due_date&order=asc
```

Filtros específicos se definen por endpoint.

---

# 15. Idempotency-Key

Operaciones sensibles deberán aceptar:

```http
Idempotency-Key: <unique-client-key>
```

Obligatorio para:

- pago manual;
- ajustes;
- reembolsos;
- operaciones financieras administrativas que puedan duplicarse por retry.

Para pagos electrónicos se combinará con identificadores del proveedor.

---

# 16. Reglas de Idempotency-Key

La misma clave con el mismo payload:

```text
→ mismo resultado lógico
```

La misma clave con payload diferente:

```text
→ 409 IDEMPOTENCY_KEY_REUSED
```

El periodo de retención exacto se definirá en `NON_FUNCTIONAL_REQUIREMENTS.md`.

---

# 17. Recursos `/me`

Los endpoints:

```text
/me/*
```

resuelven recursos a partir de:

```text
authenticated Account
+
event membership
```

El frontend no deberá enviar `graduate_id`.

---

# 18. Recursos `/admin`

Los endpoints:

```text
/admin/*
```

requieren:

```text
role == ADMIN
```

No basta con ocultarlos en frontend.

---

# 19. Auth — Login

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "andrea.martinez@ejemplo.com",
  "password": "********"
}
```

Response `200`:

```json
{
  "access_token": "...",
  "account": {
    "id": "uuid",
    "full_name": "Andrea Martínez",
    "email": "andrea.martinez@ejemplo.com",
    "role": "GRADUATE"
  }
}
```

La estrategia exacta de refresh token se cerrará en `NON_FUNCTIONAL_REQUIREMENTS.md`.

---

# 20. Auth — Registro GRADUATE

```http
POST /api/v1/auth/graduate/register
```

Request conceptual:

```json
{
  "event_access": "token-o-codigo-del-evento",
  "full_name": "Andrea Martínez",
  "email": "andrea.martinez@ejemplo.com",
  "phone": "...",
  "password": "********"
}
```

El `event_access` debe resolver un evento autorizado.

El usuario no envía:

```text
role
event_id arbitrario
graduate_membership_id
```

como fuente de autoridad.

Response `201`:

```json
{
  "account": {
    "id": "uuid",
    "full_name": "Andrea Martínez",
    "email": "andrea.martinez@ejemplo.com",
    "role": "GRADUATE"
  },
  "membership": {
    "id": "uuid",
    "event_id": "uuid",
    "status": "ACTIVE"
  }
}
```

---

# 21. Auth — Solicitar recuperación

```http
POST /api/v1/auth/password-reset/request
```

Request:

```json
{
  "email": "andrea.martinez@ejemplo.com"
}
```

Response siempre genérica:

```json
{
  "message": "Si existe una cuenta asociada, recibirás instrucciones por correo."
}
```

No revelar enumeración de cuentas.

---

# 22. Auth — Confirmar recuperación

```http
POST /api/v1/auth/password-reset/confirm
```

Request:

```json
{
  "token": "...",
  "new_password": "********"
}
```

Response:

```json
{
  "message": "Contraseña actualizada."
}
```

Errores:

```text
RESET_TOKEN_INVALID
RESET_TOKEN_EXPIRED
RESET_TOKEN_ALREADY_USED
```

---

# 23. Perfil actual

```http
GET /api/v1/me/profile
```

Response:

```json
{
  "id": "uuid",
  "full_name": "Andrea Martínez",
  "email": "andrea.martinez@ejemplo.com",
  "phone": "...",
  "role": "GRADUATE"
}
```

---

# 24. Editar perfil

```http
PATCH /api/v1/me/profile
```

Campos permitidos:

```json
{
  "full_name": "Andrea Martínez",
  "phone": "..."
}
```

No aceptar:

```text
role
status
event_id
financial data
```

---

# 25. Mis eventos

```http
GET /api/v1/me/events
```

Response:

```json
{
  "data": [
    {
      "membership_id": "uuid",
      "event": {
        "id": "uuid",
        "name": "Graduación Facultad de Derecho 2027",
        "event_date": "2027-06-19",
        "venue": "Centro de Convenciones",
        "status": "OPEN"
      },
      "membership_status": "ACTIVE"
    }
  ]
}
```

---

# 26. Resumen de mi evento

```http
GET /api/v1/me/events/{eventId}/summary
```

Response conceptual:

```json
{
  "event": {
    "id": "uuid",
    "name": "Graduación Facultad de Derecho 2027",
    "event_date": "2027-06-19",
    "venue": "Centro de Convenciones",
    "status": "OPEN"
  },
  "group": {
    "active_places": 8,
    "members_count": 8
  },
  "seating": {
    "assigned_places": 8,
    "tables": [
      {
        "id": "uuid",
        "label": "Mesa 24",
        "places": 8
      }
    ]
  },
  "meals": {
    "complete": true,
    "selected_count": 8,
    "pending_count": 0
  },
  "financial": {
    "currency": "MXN",
    "contracted_total": "12500.00",
    "paid_total": "7500.00",
    "pending_total": "5000.00",
    "overdue_total": "0.00",
    "progress_percent": 60
  },
  "thermo": {
    "status": "LOCKED",
    "threshold_percent": 70
  }
}
```

---

# 27. Mi grupo

```http
GET /api/v1/me/events/{eventId}/group
```

Response:

```json
{
  "membership_id": "uuid",
  "active_places": 8,
  "members": [
    {
      "id": "uuid",
      "full_name": "Andrea Martínez",
      "is_primary": true
    }
  ],
  "deadlines": {
    "places_deadline": "2027-03-31T05:59:59Z",
    "can_modify": true
  }
}
```

---

# 28. Agregar integrante

```http
POST /api/v1/me/events/{eventId}/group/members
```

Request:

```json
{
  "full_name": "Carlos Martínez"
}
```

Response `201`:

```json
{
  "id": "uuid",
  "full_name": "Carlos Martínez",
  "is_primary": false
}
```

Errores:

```text
EVENT_NOT_OPEN
DEADLINE_CLOSED
EVENT_CAPACITY_EXCEEDED
ACTIVE_PLACES_EXCEEDED
GRADUATE_CANCELLED
```

---

# 29. Editar integrante

```http
PATCH /api/v1/me/events/{eventId}/group/members/{memberId}
```

Request:

```json
{
  "full_name": "Carlos Martínez"
}
```

Ownership obligatorio.

---

# 30. Solicitar reducción de lugares

El baseline establece que GRADUATE no confirma una reducción unilateralmente.

Contrato:

```http
POST /api/v1/me/events/{eventId}/place-reduction-requests
```

Request:

```json
{
  "requested_places": 6,
  "reason": "Solicitud de ajuste del grupo"
}
```

Response `202`:

```json
{
  "status": "PENDING_ADMIN_REVIEW",
  "requested_places": 6
}
```

**Nota:** si en implementación se decide resolver esta interacción fuera del sistema y que solo ADMIN ejecute la reducción, este endpoint podrá omitirse. La regla obligatoria es que GRADUATE no confirme la reducción. No crear workflow adicional si producto decide no requerirlo.

---

# 31. Croquis GRADUATE

```http
GET /api/v1/me/events/{eventId}/seating-map
```

Response:

```json
{
  "map": {
    "background_url": "https://...",
    "coordinate_mode": "NORMALIZED"
  },
  "tables": [
    {
      "id": "uuid",
      "label": "Mesa 24",
      "shape": "SQUARE",
      "capacity": 10,
      "occupied_places": 2,
      "available_places": 8,
      "availability_state": "AVAILABLE",
      "position": {
        "x": 0.42,
        "y": 0.35
      },
      "size": {
        "width": 0.08,
        "height": 0.08
      },
      "is_selected_by_me": false
    }
  ],
  "my_assignments": []
}
```

No incluir PII de terceros.

---

# 32. Seleccionar/cambiar mesa GRADUATE

```http
PUT /api/v1/me/events/{eventId}/table-selection
```

Request:

```json
{
  "table_id": "uuid"
}
```

El backend resuelve:

- membership;
- `active_places`;
- deadline;
- mesa;
- capacidad;
- asignaciones actuales.

Response `200`:

```json
{
  "assignments": [
    {
      "table_id": "uuid",
      "table_label": "Mesa 24",
      "places": 8
    }
  ],
  "total_assigned_places": 8
}
```

Errores:

```text
TABLE_NOT_FOUND
TABLE_BLOCKED
TABLE_CAPACITY_CHANGED
SEATING_DEADLINE_CLOSED
EVENT_NOT_OPEN
GRADUATE_CANCELLED
```

`TABLE_CAPACITY_CHANGED`:

```http
409 Conflict
```

---

# 33. Mi selección de mesa

```http
GET /api/v1/me/events/{eventId}/table-selection
```

Response:

```json
{
  "assignments": [
    {
      "table_id": "uuid",
      "table_label": "Mesa 24",
      "places": 8
    }
  ],
  "total_assigned_places": 8,
  "active_places": 8,
  "can_change": true,
  "change_deadline": "2027-04-30T05:59:59Z"
}
```

---

# 34. Platillos GRADUATE

```http
GET /api/v1/me/events/{eventId}/meals
```

Response:

```json
{
  "options": [
    {
      "id": "uuid",
      "name": "Tradicional"
    },
    {
      "id": "uuid",
      "name": "Vegetariano"
    },
    {
      "id": "uuid",
      "name": "Vegano"
    }
  ],
  "members": [
    {
      "member_id": "uuid",
      "full_name": "Andrea Martínez",
      "meal_selection": {
        "meal_option_id": "uuid",
        "meal_option_name": "Tradicional"
      }
    }
  ],
  "deadline": "2027-05-01T05:59:59Z",
  "can_modify": true
}
```

---

# 35. Guardar platillo

```http
PUT /api/v1/me/events/{eventId}/group/members/{memberId}/meal-selection
```

Request:

```json
{
  "meal_option_id": "uuid"
}
```

Response:

```json
{
  "member_id": "uuid",
  "meal_option": {
    "id": "uuid",
    "name": "Tradicional"
  },
  "selected_at": "2027-02-10T20:00:00Z"
}
```

Errores:

```text
MEAL_OPTION_NOT_FOUND
MEAL_MEMBER_EVENT_MISMATCH
DEADLINE_CLOSED
EVENT_NOT_OPEN
```

---

# 36. Mi plan financiero

```http
GET /api/v1/me/events/{eventId}/payment-plan
```

Response:

```json
{
  "id": "uuid",
  "currency": "MXN",
  "status": "ACTIVE",
  "is_frozen": true,
  "contracted_total": "12500.00",
  "paid_total": "7500.00",
  "pending_total": "5000.00",
  "overdue_total": "0.00",
  "available_credit": "0.00",
  "progress_percent": 60,
  "installments": [
    {
      "id": "uuid",
      "sequence": 1,
      "label": "Mensualidad 1",
      "amount": "2500.00",
      "remaining_amount": "0.00",
      "due_date": "2026-12-15",
      "status": "PAID"
    },
    {
      "id": "uuid",
      "sequence": 4,
      "label": "Mensualidad 4",
      "amount": "2500.00",
      "remaining_amount": "2500.00",
      "due_date": "2027-03-15",
      "status": "UPCOMING"
    }
  ],
  "next_installment": {
    "id": "uuid",
    "sequence": 4,
    "label": "Mensualidad 4",
    "amount": "2500.00",
    "due_date": "2027-03-15"
  }
}
```

---

# 37. Historial de pagos GRADUATE

```http
GET /api/v1/me/events/{eventId}/payments
```

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "source": "MERCADO_PAGO",
      "amount": "2500.00",
      "currency": "MXN",
      "confirmed_at": "2027-02-14T19:20:00Z",
      "allocations": [
        {
          "installment_id": "uuid",
          "installment_label": "Mensualidad 3",
          "amount": "2500.00"
        }
      ]
    }
  ]
}
```

No devolver metadata sensible del proveedor.

---

# 38. Crear intento de pago

```http
POST /api/v1/me/events/{eventId}/payment-attempts
```

Headers:

```http
Idempotency-Key: <key>
```

Request:

```json
{
  "installment_id": "uuid",
  "provider": "MERCADO_PAGO"
}
```

El backend determina el monto válido.

No aceptar como autoridad:

```text
amount
currency
graduate_id
status
```

Response `201`:

```json
{
  "payment_attempt_id": "uuid",
  "provider": "MERCADO_PAGO",
  "requested_amount": "2500.00",
  "currency": "MXN",
  "status": "CREATED",
  "checkout_url": "https://...",
  "expires_at": null
}
```

---

# 39. Consultar intento de pago

```http
GET /api/v1/me/events/{eventId}/payment-attempts/{attemptId}
```

Response pending:

```json
{
  "id": "uuid",
  "status": "PENDING",
  "message": "Estamos confirmando tu pago."
}
```

Response confirmed:

```json
{
  "id": "uuid",
  "status": "CONFIRMED",
  "transaction_id": "uuid",
  "message": "Pago confirmado."
}
```

---

# 40. OpenPay como alternativa

El mismo endpoint de creación podrá aceptar:

```json
{
  "installment_id": "uuid",
  "provider": "OPENPAY"
}
```

El response dependerá del tipo de integración final de OpenPay, pero deberá conservar:

```text
PaymentAttempt
→ PaymentTransaction
→ PaymentAllocation
```

La experiencia exacta de checkout OpenPay se implementará conforme a su contrato oficial vigente.

---

# 41. Mi termo

```http
GET /api/v1/me/events/{eventId}/thermo
```

Response:

```json
{
  "status": "LOCKED",
  "financial_progress_percent": 60,
  "threshold_percent": 70,
  "can_request": false,
  "can_edit_personalization": false,
  "personalization": null
}
```

---

# 42. Solicitar termo

```http
POST /api/v1/me/events/{eventId}/thermo/request
```

Request:

```json
{
  "personalization": {
    "...": "..."
  }
}
```

Los atributos permitidos se validarán contra la configuración vigente del evento.

Response `201`:

```json
{
  "status": "REQUESTED",
  "requested_at": "2027-03-20T18:00:00Z",
  "personalization": {
    "...": "..."
  }
}
```

Errores:

```text
THERMO_LOCKED
THERMO_ALREADY_REQUESTED
INVALID_THERMO_PERSONALIZATION
```

---

# 43. Editar personalización

```http
PATCH /api/v1/me/events/{eventId}/thermo
```

Permitido únicamente antes de:

```text
IN_PRODUCTION
```

Error:

```text
THERMO_IN_PRODUCTION
```

---

# 44. Mis notificaciones

```http
GET /api/v1/me/notifications
```

Response paginada.

---

# 45. Marcar notificación leída

```http
PATCH /api/v1/me/notifications/{notificationId}
```

Request:

```json
{
  "read": true
}
```

Solo ownership propio.

---

# 46. ADMIN — Dashboard

```http
GET /api/v1/admin/dashboard
```

Response:

```json
{
  "events_active": 12,
  "graduates_total": 1450,
  "financial": {
    "currency": "MXN",
    "contracted_total": "0.00",
    "paid_total": "0.00",
    "pending_total": "0.00",
    "overdue_total": "0.00"
  },
  "alerts": {
    "graduates_overdue": 0,
    "graduates_without_table": 0,
    "meals_pending": 0,
    "thermos_requested": 0
  }
}
```

Los valores demo del prototipo no son contrato.

---

# 47. ADMIN — Listar eventos

```http
GET /api/v1/admin/events
```

Query params:

```text
status
search
page
page_size
sort
order
```

Response paginada.

---

# 48. ADMIN — Crear evento

```http
POST /api/v1/admin/events
```

Request:

```json
{
  "name": "Graduación Facultad de Derecho 2027",
  "event_date": "2027-06-19",
  "venue": "Centro de Convenciones",
  "capacity": 500,
  "timezone": "America/Mexico_City",
  "financial": {
    "currency": "MXN",
    "base_amount": "12500.00",
    "initial_payment_required": false,
    "initial_payment_amount": null,
    "grace_period_days": 0,
    "installments": [
      {
        "sequence": 1,
        "label": "Mensualidad 1",
        "amount": "2500.00",
        "due_date": "2026-12-15"
      }
    ]
  },
  "deadlines": {
    "places_deadline": null,
    "table_change_deadline": null,
    "meals_deadline": null
  },
  "thermo_threshold_percent": 70
}
```

Response `201`:

```json
{
  "id": "uuid",
  "status": "DRAFT"
}
```

---

# 49. ADMIN — Detalle de evento

```http
GET /api/v1/admin/events/{eventId}
```

Debe devolver:

- datos;
- configuración;
- estado;
- indicadores derivados.

---

# 50. ADMIN — Editar evento

```http
PATCH /api/v1/admin/events/{eventId}
```

No se deberá asumir que modificar defaults financieros modifica planes congelados.

Campos concretos se validarán según estado del evento y dominio.

---

# 51. ADMIN — Cambiar estado del evento

Se utilizará un endpoint explícito:

```http
POST /api/v1/admin/events/{eventId}/transitions
```

Request:

```json
{
  "action": "CLOSE",
  "reason": null
}
```

Acciones permitidas:

```text
OPEN
CLOSE
REOPEN
FINALIZE
CANCEL
```

Para `CANCEL`:

```json
{
  "action": "CANCEL",
  "reason": "Motivo obligatorio"
}
```

Response:

```json
{
  "event_id": "uuid",
  "previous_status": "OPEN",
  "status": "CANCELLED"
}
```

---

# 52. ADMIN — Listar graduados

```http
GET /api/v1/admin/events/{eventId}/graduates
```

Filtros:

```text
search
financial_status
table_status
meal_status
thermo_status
membership_status
page
page_size
```

Response conceptual:

```json
{
  "data": [
    {
      "membership_id": "uuid",
      "account": {
        "full_name": "Andrea Martínez",
        "email": "andrea.martinez@ejemplo.com"
      },
      "active_places": 8,
      "table_summary": "Mesa 24",
      "financial": {
        "paid_total": "7500.00",
        "pending_total": "5000.00",
        "overdue_total": "0.00"
      },
      "thermo_status": "LOCKED"
    }
  ],
  "pagination": {}
}
```

---

# 53. ADMIN — Expediente graduado

```http
GET /api/v1/admin/events/{eventId}/graduates/{membershipId}
```

Debe consolidar:

- perfil;
- membresía;
- grupo;
- mesas;
- platillos;
- finanzas;
- termo.

No necesariamente todo el historial financiero detallado si existen endpoints especializados.

---

# 54. ADMIN — Modificar lugares

```http
PATCH /api/v1/admin/events/{eventId}/graduates/{membershipId}/places
```

Headers:

```http
Idempotency-Key: <key>
```

Request:

```json
{
  "active_places": 6,
  "reason": "Reducción autorizada"
}
```

El backend deberá resolver:

- capacidad;
- integrantes;
- asignaciones;
- plan congelado;
- impacto financiero.

Si requiere movimientos financieros adicionales, la operación no deberá reescribir historia.

---

# 55. ADMIN — Cancelar graduado

```http
POST /api/v1/admin/events/{eventId}/graduates/{membershipId}/cancel
```

Request:

```json
{
  "reason": "Cancelación solicitada y autorizada"
}
```

Response:

```json
{
  "membership_id": "uuid",
  "status": "CANCELLED",
  "cancelled_at": "2027-02-10T20:00:00Z"
}
```

No implica reembolso automático.

---

# 56. ADMIN — Platillos del evento

```http
GET /api/v1/admin/events/{eventId}/meal-options
```

---

# 57. ADMIN — Crear opción de platillo

```http
POST /api/v1/admin/events/{eventId}/meal-options
```

Request:

```json
{
  "name": "Tradicional",
  "sort_order": 1
}
```

---

# 58. ADMIN — Editar opción

```http
PATCH /api/v1/admin/events/{eventId}/meal-options/{mealOptionId}
```

Request:

```json
{
  "name": "Tradicional",
  "is_active": true,
  "sort_order": 1
}
```

No hard-delete de una opción usada.

---

# 59. ADMIN — Panel de platillos

```http
GET /api/v1/admin/events/{eventId}/meals/summary
```

Response:

```json
{
  "total_members": 0,
  "selected": 0,
  "pending": 0,
  "by_option": [
    {
      "meal_option_id": "uuid",
      "name": "Tradicional",
      "count": 0
    }
  ]
}
```

---

# 60. ADMIN — Platillos del graduado

```http
GET /api/v1/admin/events/{eventId}/graduates/{membershipId}/meals
```

---

# 61. ADMIN — Override de platillo

```http
PUT /api/v1/admin/events/{eventId}/group-members/{memberId}/meal-selection
```

Request:

```json
{
  "meal_option_id": "uuid",
  "reason": "Cambio autorizado después del cierre"
}
```

`reason` será obligatorio si el deadline ya venció.

---

# 62. ADMIN — Obtener croquis

```http
GET /api/v1/admin/events/{eventId}/seating-map
```

Response incluye:

- fondo;
- mesas;
- ocupación;
- disponibilidad;
- asignaciones con datos administrativos.

---

# 63. ADMIN — Crear/configurar croquis

```http
PUT /api/v1/admin/events/{eventId}/seating-map
```

Response:

```json
{
  "id": "uuid",
  "event_id": "uuid",
  "coordinate_mode": "NORMALIZED"
}
```

---

# 64. ADMIN — Subir fondo

```http
POST /api/v1/admin/events/{eventId}/seating-map/background
Content-Type: multipart/form-data
```

Campo:

```text
file
```

Formatos permitidos:

```text
image/jpeg
image/png
application/pdf
```

Solo PDF de una página en baseline.

---

# 65. ADMIN — Quitar fondo

```http
DELETE /api/v1/admin/events/{eventId}/seating-map/background
```

Response:

```http
204 No Content
```

No elimina mesas ni asignaciones.

---

# 66. ADMIN — Crear mesa

```http
POST /api/v1/admin/events/{eventId}/tables
```

Request:

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

Response `201`:

```json
{
  "id": "uuid",
  "label": "Mesa 24",
  "shape": "SQUARE",
  "capacity": 10,
  "status": "AVAILABLE"
}
```

---

# 67. ADMIN — Crear varias mesas

```http
POST /api/v1/admin/events/{eventId}/tables/bulk
```

Request:

```json
{
  "quantity": 30,
  "shape": "SQUARE",
  "capacity": 10,
  "start_number": 1
}
```

Response:

```json
{
  "created_count": 30,
  "tables": [
    {
      "id": "uuid",
      "label": "Mesa 1"
    }
  ]
}
```

No se define matriz de filas/columnas como requisito.

---

# 68. ADMIN — Detalle de mesa

```http
GET /api/v1/admin/events/{eventId}/tables/{tableId}
```

Response:

```json
{
  "id": "uuid",
  "label": "Mesa 24",
  "shape": "SQUARE",
  "capacity": 10,
  "occupied_places": 8,
  "available_places": 2,
  "status": "AVAILABLE",
  "assignments": [
    {
      "membership_id": "uuid",
      "graduate_name": "Andrea Martínez",
      "places": 8
    }
  ]
}
```

---

# 69. ADMIN — Editar mesa

```http
PATCH /api/v1/admin/events/{eventId}/tables/{tableId}
```

Request parcial:

```json
{
  "capacity": 12,
  "position": {
    "x": 0.44,
    "y": 0.36
  }
}
```

Errores:

```text
TABLE_CAPACITY_BELOW_OCCUPANCY
INVALID_TABLE_POSITION
TABLE_LABEL_ALREADY_EXISTS
```

---

# 70. ADMIN — Eliminar mesa

```http
DELETE /api/v1/admin/events/{eventId}/tables/{tableId}
```

Si hay asignaciones:

```http
409 Conflict
```

```json
{
  "error": {
    "code": "TABLE_HAS_ASSIGNMENTS",
    "message": "La mesa tiene lugares asignados y no puede eliminarse."
  }
}
```

---

# 71. ADMIN — Reemplazar asignaciones de un graduado

```http
PUT /api/v1/admin/events/{eventId}/graduates/{membershipId}/table-assignments
```

Headers:

```http
Idempotency-Key: <key>
```

Request simple:

```json
{
  "assignments": [
    {
      "table_id": "uuid",
      "places": 8
    }
  ],
  "reason": "Asignación administrativa"
}
```

Request dividido:

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

Operación transaccional.

---

# 72. ADMIN — Plan financiero del graduado

```http
GET /api/v1/admin/events/{eventId}/graduates/{membershipId}/payment-plan
```

Devuelve detalle completo autorizado:

- plan;
- installments;
- transactions;
- allocations;
- adjustments;
- refunds.

La respuesta podrá separarse en subrecursos si el volumen lo exige.

---

# 73. ADMIN — Registrar pago manual

```http
POST /api/v1/admin/events/{eventId}/graduates/{membershipId}/payments/manual
```

Headers:

```http
Idempotency-Key: <required>
```

Request:

```json
{
  "installment_id": "uuid",
  "method": "TRANSFER",
  "amount": "2500.00",
  "paid_at": "2027-03-10T18:00:00Z",
  "reference": "SPEI-123",
  "notes": "Pago validado",
  "evidence_file_id": "uuid"
}
```

`method`:

```text
CASH
TRANSFER
```

Response `201`:

```json
{
  "transaction_id": "uuid",
  "source": "TRANSFER",
  "amount": "2500.00",
  "currency": "MXN",
  "status": "CONFIRMED",
  "allocations": [
    {
      "installment_id": "uuid",
      "amount": "2500.00"
    }
  ]
}
```

---

# 74. ADMIN — Crear ajuste

```http
POST /api/v1/admin/payment-plans/{planId}/adjustments
```

Headers:

```http
Idempotency-Key: <required>
```

Request:

```json
{
  "type": "CREDIT",
  "amount": "500.00",
  "currency": "MXN",
  "related_installment_id": null,
  "related_transaction_id": null,
  "reason": "Ajuste autorizado"
}
```

Response `201`.

---

# 75. ADMIN — Solicitar/registrar reembolso

```http
POST /api/v1/admin/payment-transactions/{transactionId}/refunds
```

Headers:

```http
Idempotency-Key: <required>
```

Request:

```json
{
  "amount": "2500.00",
  "reason": "Cancelación autorizada",
  "mode": "PROVIDER"
}
```

`mode` conceptual:

```text
PROVIDER
MANUAL
```

Para manual:

```json
{
  "amount": "2500.00",
  "reason": "Cancelación autorizada",
  "mode": "MANUAL",
  "manual_method": "TRANSFER",
  "reference": "SPEI-REF-123",
  "evidence_file_id": "uuid"
}
```

Response electrónico posible `202`:

```json
{
  "refund_id": "uuid",
  "status": "PENDING"
}
```

Response manual confirmado:

```json
{
  "refund_id": "uuid",
  "status": "CONFIRMED"
}
```

---

# 76. ADMIN — Cartera

```http
GET /api/v1/admin/events/{eventId}/portfolio
```

Filtros:

```text
status=all|current|upcoming|overdue
search
page
page_size
```

Response:

```json
{
  "summary": {
    "currency": "MXN",
    "pending_total": "0.00",
    "overdue_total": "0.00"
  },
  "data": [
    {
      "membership_id": "uuid",
      "graduate_name": "Andrea Martínez",
      "pending_total": "5000.00",
      "overdue_total": "0.00",
      "next_installment": {
        "label": "Mensualidad 4",
        "amount": "2500.00",
        "due_date": "2027-03-15"
      }
    }
  ],
  "pagination": {}
}
```

---

# 77. ADMIN — Conciliación

```http
GET /api/v1/admin/events/{eventId}/payments/reconciliation
```

Filtros:

```text
provider
status
date_from
date_to
page
page_size
```

Estados:

```text
MATCHED
PENDING_CONFIRMATION
REQUIRES_REVIEW
```

---

# 78. ADMIN — Termos resumen

```http
GET /api/v1/admin/events/{eventId}/thermos/summary
```

Response:

```json
{
  "LOCKED": 0,
  "AVAILABLE": 0,
  "REQUESTED": 0,
  "IN_PRODUCTION": 0,
  "DELIVERED": 0
}
```

---

# 79. ADMIN — Listar termos

```http
GET /api/v1/admin/events/{eventId}/thermos
```

Filtros:

```text
status
search
page
page_size
```

---

# 80. ADMIN — Detalle de termo

```http
GET /api/v1/admin/events/{eventId}/graduates/{membershipId}/thermo
```

---

# 81. ADMIN — Cambiar estado de termo

```http
POST /api/v1/admin/events/{eventId}/graduates/{membershipId}/thermo/transitions
```

Request:

```json
{
  "action": "START_PRODUCTION"
}
```

o:

```json
{
  "action": "MARK_DELIVERED"
}
```

Transiciones válidas conforme a `ThermoStatus`.

---

# 82. ADMIN — Reportes

Hub conceptual:

```http
GET /api/v1/admin/events/{eventId}/reports
```

Puede devolver disponibilidad/metadatos, pero los datos se obtienen por endpoints especializados.

---

# 83. Reporte financiero

```http
GET /api/v1/admin/events/{eventId}/reports/financial
```

---

# 84. Reporte de mesas

```http
GET /api/v1/admin/events/{eventId}/reports/tables
```

---

# 85. Reporte de platillos

```http
GET /api/v1/admin/events/{eventId}/reports/meals
```

---

# 86. Reporte de termos

```http
GET /api/v1/admin/events/{eventId}/reports/thermos
```

---

# 87. Exportaciones

Patrón:

```http
POST /api/v1/admin/events/{eventId}/exports
```

Request:

```json
{
  "report": "FINANCIAL",
  "format": "XLSX"
}
```

Valores de `report`:

```text
FINANCIAL
PORTFOLIO
TABLES
MEALS
THERMOS
```

Valores de `format`:

```text
XLSX
CSV
PDF
```

No todas las combinaciones tienen que estar habilitadas.

Response sincronizada pequeña:

```json
{
  "file_id": "uuid",
  "download_url": "https://..."
}
```

Si el procesamiento requiere async:

```http
202 Accepted
```

La estrategia exacta dependerá de rendimiento.

---

# 88. ADMIN — Auditoría

```http
GET /api/v1/admin/events/{eventId}/audit
```

Filtros:

```text
actor_account_id
entity_type
entity_id
action
date_from
date_to
page
page_size
```

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "actor": {
        "id": "uuid",
        "full_name": "Mariana López"
      },
      "action": "TABLE_ASSIGNMENT_CHANGED",
      "entity_type": "GraduateMembership",
      "entity_id": "uuid",
      "reason": "Cambio solicitado",
      "created_at": "2027-03-01T18:00:00Z",
      "display_message": "Mariana cambió la asignación de mesa de Andrea Martínez."
    }
  ],
  "pagination": {}
}
```

No endpoints de update/delete.

---

# 89. ADMIN — Administradores

```http
GET /api/v1/admin/accounts
```

Solo devuelve cuentas `ADMIN`.

---

# 90. ADMIN — Crear administrador

```http
POST /api/v1/admin/accounts
```

Request:

```json
{
  "full_name": "Mariana López",
  "email": "mariana@ejemplo.com"
}
```

No aceptar:

```text
role selector
permissions
scopes
```

El backend establece:

```text
role = ADMIN
```

El mecanismo de activación/invitación de contraseña deberá cerrarse técnicamente sin crear roles adicionales.

---

# 91. ADMIN — Actualizar estado administrador

```http
PATCH /api/v1/admin/accounts/{accountId}
```

Request permitido:

```json
{
  "status": "DISABLED"
}
```

o datos administrativos permitidos.

No modificar rol.

---

# 92. Carga de evidencias

Patrón:

```http
POST /api/v1/admin/files
Content-Type: multipart/form-data
```

Uso:

- evidencia de pago;
- evidencia de reembolso.

Response:

```json
{
  "file_id": "uuid",
  "original_name": "comprobante.pdf",
  "mime_type": "application/pdf"
}
```

Los tipos/tamaños máximos se cerrarán en NFR.

---

# 93. Webhook Mercado Pago

Endpoint:

```http
POST /api/v1/webhooks/mercado-pago
```

No requiere JWT de usuario.

Debe:

1. validar autenticidad conforme a documentación oficial vigente del proveedor;
2. extraer identificador de evento/transacción;
3. registrar/deduplicar `PaymentProviderEvent`;
4. consultar server-to-server el pago cuando corresponda;
5. correlacionar con `PaymentAttempt`;
6. crear/obtener `PaymentTransaction`;
7. aplicar `PaymentAllocation`;
8. congelar `PaymentPlan` si es primer pago;
9. actualizar elegibilidad de termo;
10. auditar/eventos internos según corresponda;
11. responder idempotentemente.

---

# 94. Respuesta webhook

El endpoint deberá responder rápidamente una vez que el evento quede aceptado para procesamiento.

Si el procesamiento es síncrono y exitoso:

```http
200
```

o el status requerido por el proveedor.

Si se utiliza procesamiento asíncrono interno:

```text
registrar evento primero
→ responder proveedor
→ procesar de manera durable
```

La decisión exacta se cerrará en arquitectura/NFR.

---

# 95. Webhook OpenPay

Endpoint:

```http
POST /api/v1/webhooks/openpay
```

Debe implementar el mecanismo oficial vigente de autenticación/verificación del proveedor.

No reutilizar un esquema criptográfico improvisado de implementaciones legacy.

Debe asumir entrega repetida de eventos.

---

# 96. Idempotencia de webhooks

Invariantes:

```text
UNIQUE(provider, external_event_id)
```

y:

```text
UNIQUE(source, provider_transaction_id)
```

cuando exista transaction ID.

Un webhook duplicado:

```text
→ no duplica PaymentTransaction
→ no duplica PaymentAllocation
→ no vuelve a congelar de forma dañina
→ no duplica lugares confirmados
```

---

# 97. Estado del pago tras retorno

El frontend deberá usar:

```http
GET /api/v1/me/events/{eventId}/payment-attempts/{attemptId}
```

No deberá interpretar parámetros del navegador como confirmación definitiva.

---

# 98. Error codes globales

## Auth

```text
AUTH_REQUIRED
INVALID_CREDENTIALS
ACCOUNT_DISABLED
RESET_TOKEN_INVALID
RESET_TOKEN_EXPIRED
RESET_TOKEN_ALREADY_USED
```

## Autorización

```text
NOT_AUTHORIZED
RESOURCE_NOT_OWNED
EVENT_MEMBERSHIP_REQUIRED
```

## Eventos

```text
EVENT_NOT_FOUND
EVENT_NOT_OPEN
INVALID_EVENT_TRANSITION
EVENT_CAPACITY_EXCEEDED
```

## Graduados/lugares

```text
GRADUATE_NOT_FOUND
GRADUATE_CANCELLED
ACTIVE_PLACES_EXCEEDED
PLACE_REDUCTION_REQUIRES_ADMIN
```

## Mesas

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
ASSIGNMENT_EXCEEDS_GRADUATE_PLACES
ASSIGNMENT_EVENT_MISMATCH
```

## Platillos

```text
MEAL_OPTION_NOT_FOUND
MEAL_MEMBER_EVENT_MISMATCH
MEALS_DEADLINE_CLOSED
```

## Finanzas

```text
PAYMENT_PLAN_NOT_FOUND
FINANCIAL_PLAN_FROZEN
INSTALLMENT_NOT_FOUND
INSTALLMENT_NOT_PAYABLE
INVALID_PAYMENT_AMOUNT
PAYMENT_ATTEMPT_NOT_FOUND
PAYMENT_ALREADY_PROCESSED
PAYMENT_PENDING_CONFIRMATION
PROVIDER_TRANSACTION_MISMATCH
REFUND_EXCEEDS_AVAILABLE_AMOUNT
DUPLICATE_MANUAL_PAYMENT
RECONCILIATION_REQUIRED
```

## Termo

```text
THERMO_LOCKED
THERMO_ALREADY_REQUESTED
THERMO_IN_PRODUCTION
INVALID_THERMO_TRANSITION
INVALID_THERMO_PERSONALIZATION
```

## Idempotencia

```text
IDEMPOTENCY_KEY_REQUIRED
IDEMPOTENCY_KEY_REUSED
```

---

# 99. Error — mesa concurrente

```http
409 Conflict
```

```json
{
  "error": {
    "code": "TABLE_CAPACITY_CHANGED",
    "message": "Esta mesa acaba de cambiar. Ya no hay suficientes lugares disponibles para tu grupo.",
    "details": {
      "table_id": "uuid",
      "available_places": 2
    },
    "request_id": "req_..."
  }
}
```

---

# 100. Error — deadline

```http
422 Unprocessable Entity
```

```json
{
  "error": {
    "code": "SEATING_DEADLINE_CLOSED",
    "message": "El periodo para cambiar de mesa ya terminó.",
    "details": {
      "deadline": "2027-04-30T05:59:59Z"
    }
  }
}
```

---

# 101. Error — pago pendiente

No necesariamente se devuelve como error.

Consulta de intento:

```http
200
```

```json
{
  "id": "uuid",
  "status": "PENDING",
  "message": "Tu pago todavía está siendo procesado."
}
```

---

# 102. Validación de DTOs

Todo request deberá rechazar:

- campos desconocidos sensibles;
- enums inválidos;
- montos malformados;
- UUID inválidos;
- strings vacíos obligatorios;
- fechas inválidas.

La política `whitelist/forbidNonWhitelisted` o equivalente deberá configurarse en backend.

---

# 103. Optimistic concurrency

No se exige un mecanismo global `ETag`/version para todos los recursos.

Para mesas y finanzas la autoridad será transaccional en backend.

Podrá agregarse un campo `version` a recursos específicos si durante implementación se demuestra necesario.

No es requisito de negocio baseline.

---

# 104. Auditoría de request

Operaciones críticas deberán propagar un:

```text
request_id
```

para correlación con:

- logs;
- auditoría;
- provider events;
- errores.

---

# 105. Seguridad de archivos

Nunca aceptar del frontend como destino persistente:

```text
filesystem path
storage_key arbitrario
URL externa arbitraria
```

El backend deberá generar/controlar la referencia.

---

# 106. Seguridad de reportes

Todos los endpoints:

```text
/admin/*/reports
/admin/*/exports
```

requieren `ADMIN`.

Un GRADUATE que conozca la URL deberá recibir:

```http
403
```

---

# 107. Matriz de autorización resumida

| Endpoint | ADMIN | GRADUATE |
|---|---:|---:|
| `/auth/*` | según flujo | según flujo |
| `/me/profile` | ✅ propio | ✅ propio |
| `/me/events` | ✅ | ✅ |
| `/me/events/{id}/group` | ❌ flujo admin separado | ✅ propio |
| `/me/events/{id}/seating-map` | ✅ posible | ✅ propio |
| `/me/events/{id}/payment-plan` | ❌ flujo admin separado | ✅ propio |
| `/me/events/{id}/payment-attempts` | ❌ ordinariamente | ✅ propio |
| `/me/events/{id}/thermo` | ❌ flujo admin separado | ✅ propio |
| `/admin/*` | ✅ | ❌ |
| `/webhooks/*` | proveedor | proveedor |

---

# 108. Compatibilidad con API legacy — Layout

El repositorio actual contiene:

```text
GET /events/:eventId/layout/overview
POST /graduates/me/layout/selection
```

El contrato objetivo los sustituye por:

```text
GET /api/v1/me/events/{eventId}/seating-map
PUT /api/v1/me/events/{eventId}/table-selection
```

Razones:

- ownership por `Account + GraduateMembership`;
- soporte multi-evento por cuenta;
- soporte de grupo dividido a nivel de dominio;
- payload seguro para GRADUATE;
- versionado explícito.

---

# 109. Compatibilidad legacy — Payment

Los endpoints actuales que trabajen sobre una entidad `Payment` única deberán considerarse candidatos a reemplazo por:

```text
PaymentPlan
Installment
PaymentAttempt
PaymentTransaction
PaymentAllocation
Adjustment
Refund
```

No mantener un endpoint legacy si obliga a volver a mezclar:

```text
obligación + transacción
```

---

# 110. Estrategia de migración API

Durante refactor podrán coexistir temporalmente:

```text
legacy routes
/api/v1 routes
```

solo en desarrollo.

Antes de release:

1. frontend oficial deberá consumir exclusivamente `/api/v1`;
2. rutas legacy deberán retirarse o quedar explícitamente deprecated;
3. pruebas E2E deberán ejecutarse contra `/api/v1`;
4. documentación vieja no deberá mantenerse como fuente de verdad.

---

# 111. OpenAPI

La implementación deberá generar o mantener una especificación OpenAPI derivada de estos contratos.

Debe documentar:

- auth;
- schemas;
- responses;
- errors;
- enums;
- headers de idempotencia;
- uploads;
- webhooks cuando sea viable.

La especificación OpenAPI implementada no podrá contradecir este baseline.

---

# 112. Contratos de concurrencia

## Selección de mesa

```text
request
→ transaction/lock
→ validate capacity
→ write assignments
→ commit
```

Conflict:

```text
409 TABLE_CAPACITY_CHANGED
```

---

## Lugares

```text
request
→ transaction/lock event capacity
→ validate
→ update
→ commit
```

Conflict:

```text
409 EVENT_CAPACITY_EXCEEDED
```

---

## Pago

```text
provider event
→ deduplicate
→ verify
→ transaction
→ PaymentTransaction
→ allocations
→ plan freeze
→ commit
```

---

# 113. Timeouts de proveedor

Si Mercado Pago/OpenPay no responde durante creación/verificación:

el sistema no deberá inventar éxito.

Respuesta temporal posible:

```http
503 Service Unavailable
```

o estado `PENDING` si ya existe un intento persistido.

El comportamiento exacto depende del punto de fallo.

---

# 114. Reintentos frontend

El frontend puede reintentar lecturas.

Para escrituras sensibles:

- deberá reutilizar `Idempotency-Key`;
- no deberá generar múltiples acciones por doble clic;
- deberá esperar resultado o resolver el estado actual.

---

# 115. Caché

No cachear respuestas financieras o de disponibilidad como fuente autoritativa.

Podrá utilizarse caché de lectura con invalidación/TTL si se demuestra necesario, pero:

```text
write validation
→ siempre contra estado transaccional actual
```

---

# 116. Pruebas contractuales obligatorias

## API-TEST-001
GRADUATE A no puede consultar recursos de B.

## API-TEST-002
GRADUATE no puede acceder a `/admin`.

## API-TEST-003
`role=ADMIN` en body no eleva privilegios.

## API-TEST-004
Cambiar `eventId` no permite acceder a evento sin membresía.

## API-TEST-005
Mesa concurrente devuelve un ganador y un `409`.

## API-TEST-006
Mesa bloqueada devuelve `422 TABLE_BLOCKED`.

## API-TEST-007
Mesa con assignments no se elimina.

## API-TEST-008
Pago electrónico ignora `amount` arbitrario enviado por frontend.

## API-TEST-009
Return URL no confirma pago.

## API-TEST-010
Webhook duplicado no duplica transacción.

## API-TEST-011
Webhook duplicado no duplica allocation.

## API-TEST-012
Pago manual sin ADMIN devuelve `403`.

## API-TEST-013
Pago manual sin Idempotency-Key devuelve error.

## API-TEST-014
Misma Idempotency-Key + mismo payload no duplica pago.

## API-TEST-015
Misma Idempotency-Key + distinto payload devuelve `409`.

## API-TEST-016
Adjustment requiere motivo.

## API-TEST-017
Refund sobre monto reembolsable devuelve `422`.

## API-TEST-018
Pago confirmado no tiene endpoint de edición destructiva.

## API-TEST-019
Meal override post-deadline requiere ADMIN + motivo.

## API-TEST-020
GRADUATE no recibe PII de otros grupos en seating-map.

## API-TEST-021
Termo LOCKED no puede solicitarse.

## API-TEST-022
Termo IN_PRODUCTION no puede editarse.

## API-TEST-023
Evento CLOSED bloquea mutaciones GRADUATE.

## API-TEST-024
Evento FINALIZED permite lectura histórica.

## API-TEST-025
Evento CANCELLED conserva datos históricos.

---

# 117. Endpoints que NO deben existir

No crear:

```text
POST /payments/{id}/mark-paid
PATCH /payments/{id}/amount
DELETE /payments/{id}

POST /graduates/{id}/become-admin

GET /events/{id}/graduates
```

sin namespace ADMIN/autorización apropiada.

Tampoco:

```text
/seat-selection
/check-in
/rsvp
/invitations
/vip-zones
```

porque están fuera del alcance.

---

# 118. Tabla maestra de endpoints

## Auth

```text
POST   /auth/login
POST   /auth/graduate/register
POST   /auth/password-reset/request
POST   /auth/password-reset/confirm
```

## Me

```text
GET    /me/profile
PATCH  /me/profile
GET    /me/events
GET    /me/events/{eventId}/summary

GET    /me/events/{eventId}/group
POST   /me/events/{eventId}/group/members
PATCH  /me/events/{eventId}/group/members/{memberId}

GET    /me/events/{eventId}/seating-map
GET    /me/events/{eventId}/table-selection
PUT    /me/events/{eventId}/table-selection

GET    /me/events/{eventId}/meals
PUT    /me/events/{eventId}/group/members/{memberId}/meal-selection

GET    /me/events/{eventId}/payment-plan
GET    /me/events/{eventId}/payments
POST   /me/events/{eventId}/payment-attempts
GET    /me/events/{eventId}/payment-attempts/{attemptId}

GET    /me/events/{eventId}/thermo
POST   /me/events/{eventId}/thermo/request
PATCH  /me/events/{eventId}/thermo

GET    /me/notifications
PATCH  /me/notifications/{notificationId}
```

## Admin — global

```text
GET    /admin/dashboard
GET    /admin/accounts
POST   /admin/accounts
PATCH  /admin/accounts/{accountId}
GET    /admin/events
POST   /admin/events
GET    /admin/events/{eventId}
PATCH  /admin/events/{eventId}
POST   /admin/events/{eventId}/transitions
```

## Admin — graduates

```text
GET    /admin/events/{eventId}/graduates
GET    /admin/events/{eventId}/graduates/{membershipId}
PATCH  /admin/events/{eventId}/graduates/{membershipId}/places
POST   /admin/events/{eventId}/graduates/{membershipId}/cancel
```

## Admin — meals

```text
GET    /admin/events/{eventId}/meal-options
POST   /admin/events/{eventId}/meal-options
PATCH  /admin/events/{eventId}/meal-options/{mealOptionId}
GET    /admin/events/{eventId}/meals/summary
GET    /admin/events/{eventId}/graduates/{membershipId}/meals
PUT    /admin/events/{eventId}/group-members/{memberId}/meal-selection
```

## Admin — seating

```text
GET    /admin/events/{eventId}/seating-map
PUT    /admin/events/{eventId}/seating-map
POST   /admin/events/{eventId}/seating-map/background
DELETE /admin/events/{eventId}/seating-map/background

POST   /admin/events/{eventId}/tables
POST   /admin/events/{eventId}/tables/bulk
GET    /admin/events/{eventId}/tables/{tableId}
PATCH  /admin/events/{eventId}/tables/{tableId}
DELETE /admin/events/{eventId}/tables/{tableId}

PUT    /admin/events/{eventId}/graduates/{membershipId}/table-assignments
```

## Admin — finance

```text
GET    /admin/events/{eventId}/graduates/{membershipId}/payment-plan
POST   /admin/events/{eventId}/graduates/{membershipId}/payments/manual
POST   /admin/payment-plans/{planId}/adjustments
POST   /admin/payment-transactions/{transactionId}/refunds
GET    /admin/events/{eventId}/portfolio
GET    /admin/events/{eventId}/payments/reconciliation
```

## Admin — thermos

```text
GET    /admin/events/{eventId}/thermos/summary
GET    /admin/events/{eventId}/thermos
GET    /admin/events/{eventId}/graduates/{membershipId}/thermo
POST   /admin/events/{eventId}/graduates/{membershipId}/thermo/transitions
```

## Admin — reports/audit

```text
GET    /admin/events/{eventId}/reports
GET    /admin/events/{eventId}/reports/financial
GET    /admin/events/{eventId}/reports/tables
GET    /admin/events/{eventId}/reports/meals
GET    /admin/events/{eventId}/reports/thermos
POST   /admin/events/{eventId}/exports
GET    /admin/events/{eventId}/audit
```

## Files

```text
POST   /admin/files
```

## Webhooks

```text
POST   /webhooks/mercado-pago
POST   /webhooks/openpay
```

Todos bajo:

```text
/api/v1
```

---

# 119. Decisiones cerradas por este contrato

Quedan fijadas para baseline 1.0:

1. API REST versionada en `/api/v1`.
2. JSON `snake_case`.
3. UUID para IDs del dominio.
4. montos monetarios como strings decimales exactos en API.
5. timestamps ISO 8601 UTC.
6. `/me/*` resuelve ownership por cuenta autenticada.
7. `/admin/*` exige `ADMIN`.
8. no se envía `graduate_id` en operaciones `/me`.
9. errores usan `error.code` estable.
10. `401/403/409/422` se separan semánticamente.
11. `Idempotency-Key` obligatorio en operaciones financieras administrativas sensibles.
12. Mercado Pago usa `PaymentAttempt` y retorno no confirma pago.
13. confirmación electrónica ocurre backend/provider.
14. webhooks son idempotentes.
15. OpenPay produce el mismo modelo financiero.
16. pagos manuales solo ADMIN.
17. pagos confirmados no tienen endpoints destructivos.
18. ajustes/reembolsos son endpoints separados.
19. mesa GRADUATE se confirma con operación backend transaccional.
20. soporte de grupo dividido se expone a ADMIN.
21. Graduate seating-map no expone PII de terceros.
22. deadlines retornan `422`, concurrencia de capacidad `409`.
23. reportes y auditoría son ADMIN-only.
24. no se exponen roles/permisos configurables.
25. API legacy será migrada y no determina el contrato objetivo.

---

# 120. TBD técnicos restantes

No son decisiones de negocio pendientes.

1. estrategia de refresh token;
2. TTL exacto de access token;
3. límites `page_size`;
4. rate limits;
5. tamaño/tipos exactos de evidencias;
6. límites de imagen de croquis;
7. signed URL vs proxy para FileAsset;
8. expiración exacta de `PaymentAttempt`;
9. retención de `Idempotency-Key`;
10. procesamiento webhook síncrono vs cola durable;
11. retry/backoff interno de provider events;
12. combinación exacta de formatos disponibles por reporte;
13. si exportaciones pesadas se ejecutan sync o async;
14. contrato exacto del `personalization` de termo;
15. schema exacto de política de cancelación;
16. mecanismo técnico exacto de activación de nuevas cuentas ADMIN.

Estos puntos se cerrarán en `NON_FUNCTIONAL_REQUIREMENTS.md` y diseño de implementación, sin alterar las reglas de dominio.

---

# 121. Documentos siguientes

Este documento deberá alimentar:

1. `NON_FUNCTIONAL_REQUIREMENTS.md`
2. `ACCEPTANCE_CRITERIA.md`
3. `ROADMAP_IMPLEMENTATION.md`

El backend deberá producir una especificación OpenAPI compatible con este baseline.

---

# 122. Baseline

Con esta versión se establece:

```text
API_CONTRACTS_VERSION = 1.0
```

Los contratos quedan congelados como baseline de implementación hasta que un Change Request aprobado modifique explícitamente el dominio o se documente una corrección contractual compatible.
