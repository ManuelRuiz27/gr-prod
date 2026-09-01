# Plataforma GR — Contratos API

**Documento:** `API_CONTRACTS.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.1  
**Estado:** Baseline de contratos REST/JSON  
**Fecha:** 31 de agosto de 2026  
**API base:** `/api/v1`  
**Fuentes:** documentación normativa v1.1 previa en `/docs`

---

# 1. Convenciones

- JSON `snake_case`.
- UUID como identificadores de dominio.
- Fechas civiles `YYYY-MM-DD`; timestamps ISO-8601 UTC.
- Dinero serializado como string decimal exacto: `"2500.00"`.
- Porcentajes numéricos `0..100`.
- `Authorization: Bearer <token>`.
- `/me/*` resuelve ownership desde cuenta autenticada.
- `/admin/*` requiere `ADMIN`.
- `Idempotency-Key` obligatorio para escrituras financieras/administrativas sensibles.

Error envelope:

```json
{
  "error": {
    "code": "STABLE_CODE",
    "message": "Mensaje seguro para UI",
    "details": {},
    "request_id": "req_uuid"
  }
}
```

HTTP principales:

```text
200 lectura/update
201 creado
202 aceptado/en proceso
204 éxito sin body
400 request inválido
401 no autenticado
403 no autorizado
404 no encontrado
409 conflicto/idempotencia/concurrencia
422 regla de negocio
429 rate limit
500 interno
502/503 dependencia externa
```

---

# 2. Auth

```http
POST /api/v1/auth/login
POST /api/v1/auth/graduate/register
POST /api/v1/auth/password-reset/request
POST /api/v1/auth/password-reset/confirm
POST /api/v1/auth/logout
```

Registro conceptual:

```json
{
  "event_access": "token-or-code",
  "full_name": "Andrea Martínez",
  "email": "andrea@example.com",
  "phone": "...",
  "password": "..."
}
```

No aceptar como autoridad:

```text
role
event_id arbitrario
graduate_membership_id
```

---

# 3. Perfil y eventos GRADUATE

```http
GET   /api/v1/me/profile
PATCH /api/v1/me/profile
GET   /api/v1/me/events
GET   /api/v1/me/events/{eventId}
```

El detalle de evento debe exponer solo configuración necesaria para experiencia del graduado.

---

# 4. Contrato GRADUATE

```http
GET /api/v1/me/events/{eventId}/contract
```

Respuesta conceptual:

```json
{
  "id": "uuid",
  "folio": "GR-2027-000123",
  "status": "PENDING_ACCEPTANCE",
  "event": {
    "name": "Graduación Derecho 2027",
    "event_date": "2027-06-19"
  },
  "line_items": [
    {
      "code": "BASE_PACKAGE",
      "label": "Paquete graduado",
      "quantity": 1,
      "unit_amount": "12500.00",
      "line_total": "12500.00"
    }
  ],
  "contracted_total": "12500.00",
  "currency": "MXN",
  "terms_version": "2026-08-31",
  "cancellation_policy": {
    "version": 2,
    "summary": []
  },
  "accepted_at": null
}
```

Aceptar:

```http
POST /api/v1/me/events/{eventId}/contract/accept
Idempotency-Key: <key>
```

Request:

```json
{
  "confirmation": true
}
```

El cliente no envía versión/policy a escoger; backend acepta la versión servida/vigente validada.

Errores:

```text
CONTRACT_NOT_FOUND
CONTRACT_ALREADY_ACCEPTED
CONTRACT_VERSION_CHANGED
CONTRACT_NOT_ACCEPTABLE
```

---

# 5. Grupo/productos GRADUATE

```http
GET  /api/v1/me/events/{eventId}/group
POST /api/v1/me/events/{eventId}/group-members
PATCH /api/v1/me/events/{eventId}/group-members/{memberId}
```

Agregar producto/lugar:

```http
POST /api/v1/me/events/{eventId}/contract-line-items/quote
```

Request:

```json
{
  "event_product_id": "uuid",
  "quantity": 1
}
```

Response:

```json
{
  "product": {
    "id": "uuid",
    "name": "Adulto",
    "quantity": 1,
    "line_total": "1000.00"
  },
  "previous_contracted_total": "12500.00",
  "new_contracted_total": "13500.00",
  "required_progress_percent": 50,
  "eligible_paid": "6000.00",
  "catch_up_due": "750.00",
  "quote_id": "uuid",
  "expires_at": "..."
}
```

Confirmar adición:

```http
POST /api/v1/me/events/{eventId}/contract-line-items
Idempotency-Key: <key>
```

```json
{
  "quote_id": "uuid"
}
```

Errores:

```text
EVENT_CAPACITY_EXCEEDED
PLACES_DEADLINE_CLOSED
PRODUCT_NOT_AVAILABLE
PRODUCT_QUOTE_STALE
FINANCIAL_REQUIREMENT_NOT_MET
```

---

# 6. Platillos GRADUATE

```http
GET /api/v1/me/events/{eventId}/meals
PUT /api/v1/me/events/{eventId}/group-members/{memberId}/meal-selection
```

Request:

```json
{
  "meal_option_id": "uuid"
}
```

Errores:

```text
MEAL_OPTION_NOT_FOUND
MEAL_MEMBER_EVENT_MISMATCH
MEALS_DEADLINE_CLOSED
```

---

# 7. Croquis GRADUATE

```http
GET /api/v1/me/events/{eventId}/seating-map
GET /api/v1/me/events/{eventId}/table-assignments
PUT /api/v1/me/events/{eventId}/table-assignments
```

Request:

```json
{
  "assignments": [
    {"group_member_id": "uuid-1", "table_id": "table-12"},
    {"group_member_id": "uuid-2", "table_id": "table-17"}
  ]
}
```

Semántica del `PUT`: reemplaza las asignaciones de los integrantes incluidos en la operación de forma transaccional según contrato específico del servicio; no permite modificar integrantes ajenos.

Respuesta incluye asignación por persona propia.

Errores:

```text
SEATING_NOT_FINANCIALLY_ELIGIBLE
SEATING_DEADLINE_CLOSED
GROUP_MEMBER_NOT_OWNED
TABLE_NOT_FOUND
TABLE_BLOCKED
TABLE_CAPACITY_CHANGED
ASSIGNMENT_EVENT_MISMATCH
```

---

# 8. Plan financiero GRADUATE

```http
GET /api/v1/me/events/{eventId}/payment-plan
```

Respuesta mínima:

```json
{
  "currency": "MXN",
  "contracted_total": "12500.00",
  "paid_total": "7500.00",
  "pending_total": "5000.00",
  "overdue_total": "0.00",
  "available_credit": "0.00",
  "penalty_total": "0.00",
  "progress_percent": 60,
  "installments": [],
  "transactions": [],
  "payment_submissions": []
}
```

---

# 9. Pago electrónico GRADUATE

Crear intento:

```http
POST /api/v1/me/events/{eventId}/payment-attempts
Idempotency-Key: <key>
```

```json
{
  "installment_id": "uuid",
  "provider": "MERCADO_PAGO"
}
```

`provider` puede ser `OPENPAY` si está habilitado.

Frontend no envía monto como autoridad.

Response:

```json
{
  "payment_attempt_id": "uuid",
  "provider": "MERCADO_PAGO",
  "status": "CREATED",
  "checkout_url": "https://provider/..."
}
```

Consultar estado:

```http
GET /api/v1/me/events/{eventId}/payment-attempts/{attemptId}
```

Return URL nunca confirma.

---

# 10. Comprobante GRADUATE

Subir archivo propio mediante flujo seguro:

```http
POST /api/v1/me/files/payment-evidence
Content-Type: multipart/form-data
```

Response:

```json
{
  "file_id": "uuid",
  "original_name": "comprobante.pdf",
  "mime_type": "application/pdf"
}
```

Crear submission:

```http
POST /api/v1/me/events/{eventId}/payment-submissions
Idempotency-Key: <key>
```

```json
{
  "method": "TRANSFER",
  "reported_amount": "2500.00",
  "reported_paid_at": "2027-03-10T18:00:00Z",
  "reference": "SPEI-123",
  "notes": null,
  "evidence_file_id": "uuid"
}
```

Métodos válidos:

```text
TRANSFER
DEPOSIT
```

Response `201`:

```json
{
  "id": "uuid",
  "status": "PENDING_REVIEW",
  "reported_amount": "2500.00"
}
```

Consultar:

```http
GET /api/v1/me/events/{eventId}/payment-submissions
GET /api/v1/me/events/{eventId}/payment-submissions/{submissionId}
```

Errores:

```text
PAYMENT_SUBMISSION_EVIDENCE_REQUIRED
INVALID_PAYMENT_SUBMISSION_METHOD
PAYMENT_SUBMISSION_NOT_OWNED
```

---

# 11. Termo GRADUATE

```http
GET   /api/v1/me/events/{eventId}/thermo
POST  /api/v1/me/events/{eventId}/thermo/request
PATCH /api/v1/me/events/{eventId}/thermo
```

La respuesta incluye estado, progreso, umbral, personalización y permisos derivados.

Termo adicional, si se habilita, se compra mediante `EventProduct/ContractLineItem`, no mediante un endpoint financiero improvisado.

---

# 12. Notificaciones GRADUATE

```http
GET   /api/v1/me/notifications
PATCH /api/v1/me/notifications/{notificationId}
```

Ownership estricto.

---

# 13. ADMIN — Dashboard

```http
GET /api/v1/admin/dashboard
```

Debe incluir como mínimo:

```json
{
  "events_active": 0,
  "graduates_total": 0,
  "financial": {
    "contracted_total": "0.00",
    "paid_total": "0.00",
    "pending_total": "0.00",
    "overdue_total": "0.00"
  },
  "alerts": {
    "payment_submissions_pending": 0,
    "graduates_overdue": 0,
    "graduates_at_cancellation_risk": 0,
    "graduates_without_table": 0,
    "meals_pending": 0,
    "thermos_requested": 0
  }
}
```

---

# 14. ADMIN — Eventos

```http
GET  /api/v1/admin/events
POST /api/v1/admin/events
GET  /api/v1/admin/events/{eventId}
PATCH /api/v1/admin/events/{eventId}
POST /api/v1/admin/events/{eventId}/transitions
```

Crear evento debe aceptar estructura coherente con:

- datos generales;
- productos;
- financial defaults/installments;
- deadlines/milestones;
- late fee config;
- policy reference/draft;
- meals;
- thermo.

Puede implementarse como creación base + subrecursos en varias llamadas si la arquitectura lo prefiere, pero los contratos finales OpenAPI deben reflejarlo sin contradecir el wizard.

Transiciones:

```text
OPEN
CLOSE
REOPEN
FINALIZE
CANCEL
```

`CANCEL` requiere motivo.

---

# 15. ADMIN — Productos y milestones

```http
GET  /api/v1/admin/events/{eventId}/products
POST /api/v1/admin/events/{eventId}/products
PATCH /api/v1/admin/events/{eventId}/products/{productId}

GET  /api/v1/admin/events/{eventId}/financial-milestones
PUT  /api/v1/admin/events/{eventId}/financial-milestones
```

No hard-delete de productos usados; desactivar.

---

# 16. ADMIN — Graduados

```http
GET /api/v1/admin/events/{eventId}/graduates
GET /api/v1/admin/events/{eventId}/graduates/{membershipId}
PATCH /api/v1/admin/events/{eventId}/graduates/{membershipId}/places
```

Filtros:

```text
search
folio
financial_status
table_status
meal_status
thermo_status
membership_status
school
page
page_size
```

Expediente consolida perfil, contrato, grupo, finanzas, mesas, platillos y termo.

---

# 17. ADMIN — Contrato

```http
GET /api/v1/admin/events/{eventId}/graduates/{membershipId}/contract
```

No endpoint de update destructivo de un contrato aceptado.

Si se implementa supersede/adenda, deberá ser un endpoint explícito posterior con audit trail; no `PATCH` genérico sobre snapshot aceptado.

---

# 18. ADMIN — Pagos manuales

```http
POST /api/v1/admin/events/{eventId}/graduates/{membershipId}/payments/manual
Idempotency-Key: <key>
```

```json
{
  "method": "DEPOSIT",
  "amount": "2500.00",
  "paid_at": "2027-03-10T18:00:00Z",
  "reference": "DEP-123",
  "notes": "Validado en caja",
  "evidence_file_id": "uuid"
}
```

Métodos:

```text
CASH
TRANSFER
DEPOSIT
```

---

# 19. ADMIN — Payment submissions

Lista:

```http
GET /api/v1/admin/payment-submissions
```

o ámbito de evento:

```http
GET /api/v1/admin/events/{eventId}/payment-submissions
```

Filtros:

```text
status
event_id
school
method
date_from
date_to
search
page
page_size
```

Detalle:

```http
GET /api/v1/admin/payment-submissions/{submissionId}
```

Aprobar:

```http
POST /api/v1/admin/payment-submissions/{submissionId}/approve
Idempotency-Key: <key>
```

Body opcional solo para parámetros explícitamente permitidos; el backend usa el contexto del submission y plan.

Response:

```json
{
  "submission_id": "uuid",
  "status": "APPROVED",
  "payment_transaction_id": "uuid",
  "applied_amount": "2500.00"
}
```

Rechazar:

```http
POST /api/v1/admin/payment-submissions/{submissionId}/reject
Idempotency-Key: <key>
```

```json
{
  "reason": "La referencia no corresponde al depósito reportado."
}
```

Errores:

```text
PAYMENT_SUBMISSION_NOT_FOUND
PAYMENT_SUBMISSION_ALREADY_REVIEWED
PAYMENT_SUBMISSION_TRANSACTION_EXISTS
PAYMENT_SUBMISSION_AMOUNT_INVALID
```

---

# 20. ADMIN — Ajustes y refund

```http
POST /api/v1/admin/payment-plans/{planId}/adjustments
POST /api/v1/admin/payment-transactions/{transactionId}/refunds
GET  /api/v1/admin/events/{eventId}/refunds
```

Toda escritura usa `Idempotency-Key` y motivo.

---

# 21. ADMIN — Penalización tardía

Configuración en evento:

```http
PATCH /api/v1/admin/events/{eventId}/late-payment-policy
```

Request:

```json
{
  "liquidation_due_at": "2027-05-31T05:59:59Z",
  "late_fee_enabled": true,
  "late_grace_days": 7,
  "late_fee_amount": "500.00",
  "auto_cancel_enabled": false,
  "auto_cancel_after_late_fee_days": null
}
```

Los valores son ejemplo; API acepta configuración válida, no constantes.

Lectura:

```http
GET /api/v1/admin/events/{eventId}/late-payment-policy
```

Aplicación de penalty es proceso backend; si se ofrece acción manual de reparación, debe ser endpoint de reconciliación explícito e idempotente, no `POST fee` libre.

---

# 22. ADMIN — Política de cancelación

Listar versiones:

```http
GET /api/v1/admin/events/{eventId}/cancellation-policies
```

Crear draft:

```http
POST /api/v1/admin/events/{eventId}/cancellation-policies
```

Response con nueva versión draft.

Editar rangos de draft:

```http
PUT /api/v1/admin/cancellation-policies/{policyId}/ranges
```

```json
{
  "ranges": [
    {"days_before_min": 0, "days_before_max": 29, "penalty_percent": 100},
    {"days_before_min": 30, "days_before_max": 60, "penalty_percent": 75},
    {"days_before_min": 61, "days_before_max": null, "penalty_percent": 50}
  ]
}
```

Los números son datos de request, no defaults globales.

Validar draft:

```http
POST /api/v1/admin/cancellation-policies/{policyId}/validate
```

Publicar:

```http
POST /api/v1/admin/cancellation-policies/{policyId}/publish
Idempotency-Key: <key>
```

Una política publicada no acepta `PUT /ranges`.

Errores:

```text
CANCELLATION_POLICY_NOT_FOUND
CANCELLATION_POLICY_NOT_DRAFT
CANCELLATION_POLICY_OVERLAPPING_RANGES
CANCELLATION_POLICY_GAP
CANCELLATION_POLICY_INVALID_PERCENT
CANCELLATION_POLICY_INCOMPLETE_COVERAGE
CANCELLATION_POLICY_VERSION_IMMUTABLE
```

---

# 23. ADMIN — Cotización/cancelación de graduado

Cotizar:

```http
POST /api/v1/admin/events/{eventId}/graduates/{membershipId}/cancellation-quote
```

Backend no acepta `penalty_percent` del frontend.

Response:

```json
{
  "quote_id": "uuid",
  "quoted_at": "...",
  "days_before_event": 64,
  "policy": {"version": 2, "range_id": "uuid"},
  "contracted_total": "20000.00",
  "eligible_paid": "10000.00",
  "penalty_percent": 50,
  "penalty_amount": "10000.00",
  "non_refundable_minimum": "0.00",
  "retained_amount": "10000.00",
  "refund_due": "0.00",
  "remaining_due": "0.00",
  "expires_at": "..."
}
```

Confirmar cancelación:

```http
POST /api/v1/admin/events/{eventId}/graduates/{membershipId}/cancel
Idempotency-Key: <key>
```

```json
{
  "quote_id": "uuid",
  "reason": "Cancelación solicitada y autorizada"
}
```

Backend revalida quote/estado.

Errores:

```text
CANCELLATION_QUOTE_NOT_FOUND
CANCELLATION_QUOTE_STALE
CANCELLATION_POLICY_NOT_APPLICABLE
GRADUATE_ALREADY_CANCELLED
```

---

# 24. ADMIN — Croquis/mesas

```http
GET    /api/v1/admin/events/{eventId}/seating-map
PUT    /api/v1/admin/events/{eventId}/seating-map
POST   /api/v1/admin/events/{eventId}/seating-map/background
DELETE /api/v1/admin/events/{eventId}/seating-map/background
POST   /api/v1/admin/events/{eventId}/tables
POST   /api/v1/admin/events/{eventId}/tables/bulk
GET    /api/v1/admin/events/{eventId}/tables/{tableId}
PATCH  /api/v1/admin/events/{eventId}/tables/{tableId}
DELETE /api/v1/admin/events/{eventId}/tables/{tableId}
PUT    /api/v1/admin/events/{eventId}/graduates/{membershipId}/table-assignments
```

ADMIN assignment request:

```json
{
  "assignments": [
    {"group_member_id": "member-a", "table_id": "table-12"},
    {"group_member_id": "member-b", "table_id": "table-17"}
  ],
  "reason": "Distribución operativa"
}
```

---

# 25. ADMIN — Platillos

```http
GET   /api/v1/admin/events/{eventId}/meal-options
POST  /api/v1/admin/events/{eventId}/meal-options
PATCH /api/v1/admin/events/{eventId}/meal-options/{mealOptionId}
GET   /api/v1/admin/events/{eventId}/meals/summary
GET   /api/v1/admin/events/{eventId}/graduates/{membershipId}/meals
PUT   /api/v1/admin/events/{eventId}/group-members/{memberId}/meal-selection
```

Motivo obligatorio si override posterior al deadline.

---

# 26. ADMIN — Termos

```http
GET  /api/v1/admin/events/{eventId}/thermos
GET  /api/v1/admin/events/{eventId}/thermos/{thermoId}
POST /api/v1/admin/events/{eventId}/thermos/{thermoId}/transitions
POST /api/v1/admin/events/{eventId}/thermos/{thermoId}/delivery
```

Transiciones permitidas según estado.

Delivery request opcional:

```json
{
  "received_by_name": "Andrea Martínez",
  "signature_file_id": "uuid",
  "evidence_file_id": null
}
```

---

# 27. ADMIN — Notas internas

```http
GET  /api/v1/admin/events/{eventId}/graduates/{membershipId}/notes
POST /api/v1/admin/events/{eventId}/graduates/{membershipId}/notes
```

No existe endpoint `/me` equivalente.

---

# 28. ADMIN — Reportes y cortes

```http
GET /api/v1/admin/events/{eventId}/reports/financial
GET /api/v1/admin/events/{eventId}/reports/portfolio
GET /api/v1/admin/events/{eventId}/reports/payments
GET /api/v1/admin/events/{eventId}/reports/payment-submissions
GET /api/v1/admin/events/{eventId}/reports/tables
GET /api/v1/admin/events/{eventId}/reports/meals
GET /api/v1/admin/events/{eventId}/reports/thermos
GET /api/v1/admin/events/{eventId}/reports/cash-cuts
```

Filtros según reporte:

```text
date_from
date_to
school
method
status
graduate/search
```

Cortes deben permitir granularidad conceptual:

```text
DAILY
WEEKLY
MONTHLY
```

Puede implementarse con query params:

```text
?period=daily&date=...
?period=weekly&date_from=...
?period=monthly&month=...
```

---

# 29. Exportaciones

```http
POST /api/v1/admin/events/{eventId}/exports
```

Request:

```json
{
  "report": "PAYMENTS",
  "format": "XLSX",
  "filters": {
    "date_from": "2027-03-01",
    "date_to": "2027-03-31",
    "method": null,
    "school": null
  }
}
```

`report` mínimo:

```text
FINANCIAL
PORTFOLIO
PAYMENTS
PAYMENT_SUBMISSIONS
TABLES
MEALS
THERMOS
CASH_CUTS
```

`format`:

```text
XLSX
CSV
PDF
```

No todas las combinaciones son obligatorias; las habilitadas se documentan en OpenAPI.

---

# 30. ADMIN — Auditoría y cuentas

```http
GET   /api/v1/admin/events/{eventId}/audit
GET   /api/v1/admin/accounts
POST  /api/v1/admin/accounts
PATCH /api/v1/admin/accounts/{accountId}
```

No endpoints de update/delete para AuditLog.

---

# 31. Archivos ADMIN

```http
POST /api/v1/admin/files
Content-Type: multipart/form-data
```

Para evidencia administrativa, refund, termo y otros usos permitidos.

El backend controla storage key y acceso.

---

# 32. Webhooks

```http
POST /api/v1/webhooks/mercado-pago
POST /api/v1/webhooks/openpay
```

Deben:

1. validar autenticidad conforme a contrato oficial vigente;
2. deduplicar `PaymentProviderEvent`;
3. verificar transacción server-to-server;
4. correlacionar intento;
5. crear/obtener `PaymentTransaction` exactamente una vez;
6. aplicar allocations;
7. congelar plan si aplica;
8. ejecutar efectos derivados idempotentemente;
9. responder según requerimiento del proveedor.

---

# 33. Jobs internos

No son endpoints públicos, pero forman contrato operativo:

```text
installment.overdue recalculation
late-fee application
optional automatic membership cancellation
notification reminders
report/export cleanup
```

Cada job financiero debe ser idempotente y observable.

---

# 34. Códigos globales nuevos/actualizados

## Contrato
```text
CONTRACT_NOT_FOUND
CONTRACT_ALREADY_ACCEPTED
CONTRACT_VERSION_CHANGED
CONTRACT_NOT_ACCEPTABLE
```

## Productos/lugares
```text
PRODUCT_NOT_FOUND
PRODUCT_NOT_AVAILABLE
PRODUCT_QUOTE_STALE
EVENT_CAPACITY_EXCEEDED
ACTIVE_PLACES_EXCEEDED
PLACES_DEADLINE_CLOSED
```

## Mesas
```text
SEATING_NOT_FINANCIALLY_ELIGIBLE
SEATING_DEADLINE_CLOSED
GROUP_MEMBER_NOT_OWNED
TABLE_NOT_FOUND
TABLE_BLOCKED
TABLE_CAPACITY_CHANGED
TABLE_HAS_ASSIGNMENTS
TABLE_CAPACITY_BELOW_OCCUPANCY
ASSIGNMENT_EVENT_MISMATCH
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
DUPLICATE_MANUAL_PAYMENT
RECONCILIATION_REQUIRED
```

## Submission
```text
PAYMENT_SUBMISSION_NOT_FOUND
PAYMENT_SUBMISSION_NOT_OWNED
PAYMENT_SUBMISSION_EVIDENCE_REQUIRED
PAYMENT_SUBMISSION_ALREADY_REVIEWED
PAYMENT_SUBMISSION_TRANSACTION_EXISTS
INVALID_PAYMENT_SUBMISSION_METHOD
```

## Penalización/cancelación
```text
LATE_FEE_ALREADY_APPLIED
CANCELLATION_POLICY_NOT_FOUND
CANCELLATION_POLICY_NOT_DRAFT
CANCELLATION_POLICY_OVERLAPPING_RANGES
CANCELLATION_POLICY_GAP
CANCELLATION_POLICY_INVALID_PERCENT
CANCELLATION_POLICY_INCOMPLETE_COVERAGE
CANCELLATION_POLICY_VERSION_IMMUTABLE
CANCELLATION_QUOTE_NOT_FOUND
CANCELLATION_QUOTE_STALE
GRADUATE_ALREADY_CANCELLED
```

## Refund
```text
REFUND_EXCEEDS_AVAILABLE_AMOUNT
```

## Idempotencia
```text
IDEMPOTENCY_KEY_REQUIRED
IDEMPOTENCY_KEY_REUSED
```

---

# 35. Pruebas contractuales P0

Debe demostrarse:

1. GRADUATE A no accede a recursos de B.
2. Body `role=ADMIN` no eleva privilegios.
3. Cambiar `eventId` no rompe ownership.
4. Contrato aceptado no puede vincularse silenciosamente a nueva policy version.
5. Quote de producto/cancelación stale es rechazado.
6. Asignación concurrente de mesa nunca sobrepasa capacidad.
7. GRADUATE no asigna `GroupMember` ajeno.
8. Return URL no confirma pago.
9. Webhook duplicado no duplica transaction/allocation.
10. Submission `PENDING_REVIEW` no cambia saldo.
11. Aprobar submission dos veces produce una sola transaction.
12. GRADUATE no aprueba/rechaza submission.
13. Policy con huecos/traslapes no se publica.
14. Policy publicada no se modifica.
15. Penalización tardía duplicada no se crea.
16. Refund concurrente no excede monto disponible.
17. GRADUATE no accede a notas, reportes o archivos de terceros.

---

# 36. OpenAPI

La implementación deberá generar/mantener OpenAPI consistente con este documento, incluyendo schemas, auth, enums, errores, idempotencia, uploads, webhooks y permisos.
