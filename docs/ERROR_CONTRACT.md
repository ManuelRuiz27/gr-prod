# Plataforma GR — Contrato Único de Errores (Error Contract)

**Documento:** `ERROR_CONTRACT.md`  
**Versión:** 1.0  
**Fecha:** 8 de septiembre de 2026  
**Estado:** BASELINE NORMATIVO APROBADO  
**Documentos Padre:** `SYSTEM_ARCHITECTURE.md`, `API_ENDPOINT_MATRIX.md`, `API_CONTRACT.openapi.yaml`, `AUTHORIZATION_MATRIX.md`, `STATE_MACHINES.md`, `BUSINESS_RULES.md`

---

## 1. Principios Fundamentales y Propósito

Este documento establece la normativa técnica definitiva para la gestión, serialización y sanitización de errores en **Plataforma GR**.

Su objetivo es garantizar:
1. **Consistencia Absoluta:** Todas las 129 operaciones de la API y cualquier fallo del servidor responden con una estructura JSON idéntica y predecible.
2. **Seguridad Defensiva y Sanitización (Zero-Leakage):** Ningún detalle interno (SQL, errores de Prisma, stack traces, secretos de pasarela, rutas de archivos en disco o hashes) puede ser expuesto al cliente.
3. **Idoneidad para IDOR:** En operaciones con identificadores no autorizados, el sistema no revela la existencia previa de recursos ajenos.
4. **Trazabilidad de Auditoría:** Toda respuesta de error incluye un identificador único (`request_id`) que correlaciona de forma biyectiva los logs privados del servidor con el reporte del usuario.

---

## 2. El Envelope Canónico de Error

Toda respuesta con código HTTP $ge 400$ emitida por Plataforma GR debe utilizar de forma estricta y exclusiva la siguiente estructura JSON (definida en OpenAPI como `ErrorEnvelope` y `ErrorObject`):

```json
{
  "error": {
    "code": "TABLE_CAPACITY_CHANGED",
    "message": "La disponibilidad de la mesa ha cambiado. Por favor actualiza el croquis e intenta nuevamente.",
    "request_id": "9c58c2b7-8494-4d16-953e-2bfa91d34c11",
    "details": {}
  }
}
```

### Especificación de Campos del `ErrorObject`:

| Campo | Tipo | Requerido | Descripción y Reglas de Contenido |
|---|---|---|---|
| `code` | `string` | **MUST** | Código canónico, en mayúsculas sostenidas con guiones bajos (`SCREAMING_SNAKE_CASE`). Debe pertenecer al catálogo único oficial. |
| `message` | `string` | **MUST** | Mensaje público redactado en lenguaje natural claro y seguro para su despliegue directo en la interfaz de usuario. Nunca contiene excepciones crudas de librerías ni rutas. |
| `request_id` | `string (UUID)` | **MUST** | Identificador único de la petición. Coincide exactamente con el valor del encabezado HTTP `X-Request-Id`. |
| `details` | `object` | **MUST** | Objeto con información contextual no confidencial útil para que el cliente corrija la petición (ej. lista de campos inválidos). Si no aplica, debe enviarse como objeto vacío `{}`. |

---

## 3. Taxonomía de Códigos de Estado HTTP

Plataforma GR clasifica los errores en las siguientes categorías canónicas:

```text
400 Bad Request           -> Sintaxis inválida, payload corrupto, campos requeridos faltantes.
401 Unauthorized          -> Acceso anónimo a rutas protegidas o credenciales incorrectas.
403 Forbidden             -> Actor autenticado sin privilegios, cuenta desactivada o IDOR.
404 Not Found             -> Recurso no existe o es ajeno (protección IDOR-safe).
409 Conflict              -> Carrera de concurrencia, idempotencia reusada o transición ilegal.
422 Unprocessable Entity  -> Invariante de negocio rota, regla temporal o financiera no satisfecha.
429 Too Many Requests     -> Exceso de tasa de llamadas (Rate limiting).
500 Internal Server Error -> Fallo inesperado en servidor (sanitizado al 100%).
503 Service Unavailable   -> Servicio externo o base de datos no disponible temporalmente.
```

---

## 4. Catálogo Único de Códigos Canónicos

A continuación se define el catálogo oficial y cerrado de códigos de error de Plataforma GR. Está terminantemente prohibido inventar códigos ad-hoc en controllers si ya existe un equivalente funcional en este catálogo.

### 4.1 Autenticación y Autorización (401 / 403)

| Código Canónico | HTTP | Descripción de Uso | Mensaje Público Seguro |
|---|---|---|---|
| `UNAUTHENTICATED` | 401 | Petición a endpoint protegido sin token JWT o con token malformado. | "Acceso no autenticado. Inicie sesión para continuar." |
| `INVALID_CREDENTIALS` | 401 | Correo o contraseña incorrectos en `/auth/login`. | "Credenciales de acceso incorrectas." |
| `TOKEN_EXPIRED` | 401 | Token de acceso o refresh ha caducado. | "La sesión ha expirado. Por favor ingrese nuevamente." |
| `TOKEN_REVOKED` | 401 | Sesión invalidada explícitamente o por detección de reúso de refresh token. | "Sesión no válida o revocada." |
| `FORBIDDEN` | 403 | El rol del usuario (`GRADUATE`) no posee permisos para el endpoint (ej. módulo `/admin`). | "No cuenta con los privilegios requeridos para esta operación." |
| `ACCOUNT_DISABLED` | 403 | La cuenta del usuario se encuentra en estado `DISABLED`. | "Esta cuenta ha sido deshabilitada. Contacte a soporte." |
| `OWNERSHIP_MISMATCH` | 403 | El usuario intenta acceder a un recurso operativo de un evento para el cual no tiene membresía. | "No cuenta con acceso a los recursos de este evento." |

### 4.2 Validación y Petición (400)

| Código Canónico | HTTP | Descripción de Uso | Mensaje Público Seguro |
|---|---|---|---|
| `INVALID_REQUEST` | 400 | El cuerpo de la petición no cumple con la estructura requerida o tipos esperados. | "Los datos enviados en la solicitud no son válidos." |
| `VALIDATION_ERROR` | 400 | Error reportado por los validadores de DTO (`class-validator`). | "Uno o más campos de la solicitud no cumplen las reglas de formato." |
| `IDEMPOTENCY_KEY_REQUIRED` | 400 | La operación de mutación sensible requiere el encabezado `Idempotency-Key` y no fue enviado. | "Se requiere el encabezado 'Idempotency-Key' para esta operación." |
| `PAYMENT_ATTEMPT_INVALID` | 400 | Intento de pago electrónico mal configurado o proveedor no soportado. | "Parámetros de intento de pago no válidos." |
| `CANNOT_PERSIST_DERIVED_STATE` | 400 | Intento de almacenar directamente un estado derivado (`PAID`, `OVERDUE`, `FULL`, `PARTIAL`, `LOCKED`, `AVAILABLE`). | "Operación rechazada: el estado solicitado es derivado y no admite persistencia directa." |

### 4.3 Recursos y Protección IDOR (404)

| Código Canónico | HTTP | Descripción de Uso | Mensaje Público Seguro |
|---|---|---|---|
| `RESOURCE_NOT_FOUND` | 404 | El recurso solicitado mediante UUID no existe en la base de datos. | "El recurso solicitado no fue encontrado." |
| `EVENT_NOT_FOUND` | 404 | El evento indicado por `eventId` no existe. | "El evento especificado no fue encontrado." |
| `CONTRACT_NOT_FOUND` | 404 | La membresía no cuenta con un contrato emitido. | "No existe contrato asociado a la membresía." |
| `TABLE_NOT_FOUND` | 404 | La mesa indicada no existe en el croquis del evento. | "La mesa indicada no existe." |
| `MEAL_OPTION_NOT_FOUND` | 404 | La opción de platillo no existe o no pertenece al evento. | "La opción de platillo no fue encontrada." |

> **Regla IDOR-Safe:** Si un usuario `GRADUATE` intenta consultar un recurso existente cuyo propietario es otro graduado (ej. `/me/contracts/:contractId`), el backend responderá `404 RESOURCE_NOT_FOUND` en lugar de `403`, impidiendo ataques de enumeración que confirmen la existencia de folios o identidades ajenas.

### 4.4 Concurrencia, Bloqueo y Máquinas de Estado (409)

| Código Canónico | HTTP | Descripción de Uso | Mensaje Público Seguro |
|---|---|---|---|
| `CONFLICT` | 409 | Conflicto general de estado con la base de datos (ej. registro único duplicado). | "La operación entra en conflicto con el estado actual del registro." |
| `CONCURRENT_MODIFICATION` | 409 | Conflicto de escritura concurrente detectado bajo lock de base de datos. | "El registro fue modificado concurrentemente por otra operación. Reintente." |
| `TABLE_CAPACITY_CHANGED` | 409 | La capacidad de la mesa cambió durante el proceso de reserva/asignación concurrente. | "La disponibilidad de la mesa cambió. Actualiza el croquis e intenta nuevamente." |
| `EVENT_CAPACITY_EXCEEDED` | 409 | La venta de lugares excede la capacidad total configurada para el evento. | "No hay cupo disponible suficiente en el evento para completar la solicitud." |
| `INVALID_STATE_TRANSITION` | 409 | Intento de realizar un salto de estado no permitido según `STATE_MACHINES.md`. | "La transición de estado solicitada no es permitida desde el estado actual." |
| `TERMINAL_STATE_VIOLATION` | 409 | Intento de mutar una entidad que se encuentra en estado terminal irreversible. | "No es posible modificar una entidad en estado terminal." |
| `IDEMPOTENCY_KEY_REUSED` | 409 | Se reutilizó un `Idempotency-Key` previo pero con un payload o parámetros distintos. | "La clave de idempotencia ya fue utilizada con una solicitud distinta." |
| `IDEMPOTENCY_IN_PROGRESS` | 409 | Petición idéntica concurrente ejecutándose en este mismo instante. | "Una solicitud idéntica se encuentra en procesamiento. Espere un momento." |
| `CONTRACT_ALREADY_ACCEPTED` | 409 | Intento de alterar o refirmar un contrato que ya se encuentra aceptado e inmutable. | "El contrato ya ha sido aceptado y no admite modificaciones." |

### 4.5 Invariantes de Negocio (422)

| Código Canónico | HTTP | Descripción de Uso | Mensaje Público Seguro |
|---|---|---|---|
| `BUSINESS_INVARIANT_VIOLATION` | 422 | Violación de una regla de negocio aprobada en `BUSINESS_RULES.md`. | "La operación no cumple con las políticas de negocio del evento." |
| `EVENT_NOT_OPERABLE` | 422 | El evento se encuentra en `DRAFT`, `CLOSED` o `CANCELLED` para una operación que requiere `OPEN`. | "El evento no se encuentra en un estado operable para esta acción." |
| `QUOTE_EXPIRED` | 422 | Se intenta aplicar una cotización de adición de lugares cuyo TTL ha caducado. | "La cotización de compra ha expirado. Por favor cotice nuevamente." |
| `QUOTE_ALREADY_USED` | 422 | Se intenta aplicar una cotización que ya fue aplicada con anterioridad. | "La cotización ya fue consumida previamente." |
| `PAYMENT_SUBMISSION_ALREADY_REVIEWED` | 422 | Intento de aprobar o rechazar un comprobante que ya fue dictaminado. | "El comprobante de pago ya fue revisado con anterioridad." |
| `REFUND_NOT_ALLOWED` | 422 | El monto de reembolso excede el cobro neto elegible o no cumple la política. | "El reembolso solicitado excede el monto elegible disponible." |
| `MEAL_OPTION_CLASSIFICATION_IMMUTABLE` | 422 | Intento de mutar o eliminar una opción de platillo que ya posee selecciones activas. | "No es posible eliminar ni cambiar drásticamente una opción de platillo ya seleccionada." |
| `DEADLINE_EXCEEDED` | 422 | Se intenta modificar lugares, platillos o mesas fuera de la fecha límite establecida. | "El periodo para realizar modificaciones ha concluido." |

### 4.6 Tasa Límite, Infraestructura y Servidor (429 / 500 / 503)

| Código Canónico | HTTP | Descripción de Uso | Mensaje Público Seguro |
|---|---|---|---|
| `RATE_LIMITED` | 429 | El cliente excedió el número máximo permitido de peticiones por minuto. | "Límite de solicitudes alcanzado. Por favor intente más tarde." |
| `INTERNAL_ERROR` | 500 | Excepción no controlada en runtime. Error crudo registrado en logs pero oculto al cliente. | "Ha ocurrido un error interno en el servidor." |
| `DEPENDENCY_UNAVAILABLE` | 503 | Fallo de conexión o timeout con base de datos o pasarela de pagos. | "Servicio temporalmente no disponible. Intente nuevamente en unos minutos." |

---

## 5. Política de Sanitización Estricta (Zero-Leakage Policy)

Para salvaguardar la seguridad del sistema y prevenir la fuga de información sensible, el backend implementa una sanitización obligatoria y automatizada a través de un interceptor / filtro global:

### 5.1 Reglas de Sanitización:
1. **Errores de Prisma y Base de Datos:**
   - Errores de clave duplicada (`P2002`) se transforman automáticamente en código `CONFLICT` con mensaje amigable; nunca se expone el nombre de la tabla o índice.
   - Errores de registro no encontrado (`P2025`) se transforman en `RESOURCE_NOT_FOUND`.
   - Errores de concurrencia (`P2034`) se transforman en `CONCURRENT_MODIFICATION`.
   - Errores de conexión o sintaxis de PostgreSQL (`P1001`, `P2010`) se transforman en `INTERNAL_ERROR` o `DEPENDENCY_UNAVAILABLE` con código HTTP 500/503.
2. **Stack Traces y Rutas Internas:**
   - Los objetos `stack` se envían exclusivamente al logger interno del servidor (`logger.error`), indexados bajo el `request_id`.
   - **NUNCA** se incluye la traza de ejecución en la propiedad `error.message` ni en `error.details`.
3. **Secretos y Credenciales:**
   - Contraseñas en texto plano, hashes bcrypt/SHA, tokens JWT completos, claves privadas de Mercado Pago/OpenPay y certificados están estrictamente prohibidos en cualquier parte del payload.
4. **Campo `details` Controlado:**
   - En errores `400 VALIDATION_ERROR`, `details` únicamente puede contener un arreglo de mensajes amigables de validación (`validation_errors: string[]`).

---

## 6. Arquitectura del Error Mapping en NestJS

La implementación del contrato de errores se organiza en:

```text
backend/src/common/errors/
├── error-codes.ts           # Catálogo único de constantes ErrorCode
├── domain-exceptions.ts     # Excepciones tipadas de negocio que extienden HttpException
├── error-sanitizer.util.ts  # Utilidad de detección y sanitización de Prisma, SQL y runtime
└── index.ts                 # Exportación unificada

backend/src/common/filters/
└── all-exceptions.filter.ts # Filtro global @Catch() que garantiza el ErrorEnvelope canónico
```

Toda petición saliente con fallo garantiza los siguientes encabezados:
- `Content-Type: application/json`
- `X-Request-Id: <request_id>`
