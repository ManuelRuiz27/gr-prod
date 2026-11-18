# B1 — Matriz de API, autorización y validaciones GR ↔ Monkavia

**Estado:** diseño contract-first; no se han creado controladores. **Fecha:** 2026-11-18.  
**Fuentes de rutas verificadas:** `gr-prod/main/docs/API_CONTRACT.openapi.yaml` (129 operationIds, OpenAPI 3.1), `gr-prod/main/docs/SEATING_QUANTITY.openapi.yaml` (4 operaciones de cantidades, no desplegadas), `docs/GR_ACCESS_INTEGRATION.openapi.yaml` (15 operaciones GR) e `invitacionespremium@monkavia-gr/docs/04-tecnico/GR_PRIVATE_API.openapi.yaml` v2.1 (18 operaciones privadas, no desplegadas).

**Política:** mantener `/api/v1`, errores GR con `error.code`, `error.request_id`, `X-Request-Id`; autenticación y ownership siempre en backend. Los endpoints legacy son **inventario**, no 129 requisitos nuevos.

## 1. Decisión por superficie de API

| Superficie / operationId verificado | Clasificación | Actor y auth | Validación P0 |
| --- | --- | --- | --- |
| `POST /auth/event-access/resolve` (`authResolveEventAccess`) | **ADAPT** | PUBLIC + código de evento | No devolver evento elegible si `Event.status!=OPEN`, código expirado/revocado, rate limit y anti-enumeración |
| `POST /auth/graduate/register` (`authRegisterGraduate`) | **REUSE+HARDEN** | PUBLIC + event token | Cuenta nueva; idempotencia; evento OPEN; un único principal nominal |
| `POST /auth/login`, `/auth/refresh`, `/auth/logout` | **REUSE+HARDEN** | PUBLIC/SESSION | Refresh rotado/revocable/hashed; reuse detection; cuenta disabled; rate limit |
| `POST /auth/password-reset/request|confirm` | **REUSE+HARDEN** | PUBLIC | Respuesta anti-enumeración, token de un uso y revocación de sesiones |
| `POST /me/events/{eventId}/enroll` | **CANDIDATO ADD** | GRADUATE autenticado + event token | Cuenta existente; no duplicar Account; UNIQUE(event,account); evento OPEN; no reactivar cancelado implícitamente; aprobación DEC-02 |
| `GET /me/events`, `GET /me/events/{eventId}` | **REUSE** | GRADUATE + membership ownership | Sólo eventos propios; no permitir consultar evento arbitrario por ID |
| `GET /me/events/{eventId}/contract` | **ADAPT** | GRADUATE propietario | Mostrar texto legal íntegro y versión/cancelación congelados, no sólo hash |
| `POST /me/events/{eventId}/contract/accept` | **ADAPT/BLOCKED** | GRADUATE + idempotency + CAS | Aceptar exclusivamente snapshot legible vigente y verificado; bloqueo hasta texto legal aprobado |
| `GET/POST/PATCH /me/events/{eventId}/group*` | **REUSE/ADAPT** | GRADUATE propio | Nombre obligatorio, principal, relación con cantidad contratada; no lugar ficticio |
| `GET /me/events/{eventId}/products`, `POST /.../contract-line-items/quote`, `POST /.../contract-line-items` | **REUSE** | GRADUATE propio | Precio/versiones desde backend, vigencia cotización, aforo comercial, idempotencia y transacción |
| `GET /me/events/{eventId}/payment-plan`, `POST /.../payment-attempts` | **REUSE** | GRADUATE propio | Monto decimal exacto; retorno web no confirma pago; consultar webhook s2s |
| `POST /me/events/{eventId}/payment-submissions` | **REUSE** | GRADUATE propio | Archivo privado, importe/referencia válidos; PENDING no altera deuda |
| `POST /admin/payment-submissions/{submissionId}/approve|reject` | **REUSE+HARDEN** | ADMIN | Aprobación única, concurrencia, motivo rechazo, emisión atómica de transacción |
| `POST /admin/events/{eventId}/graduates/{membershipId}/payments/manual` | **REUSE** | ADMIN | Importe libre pero válido, actor real y recibo idempotente |
| `POST /admin/payment-plans/{planId}/adjustments|refunds` | **REUSE** | ADMIN | Ledger append-only, motivos, no reembolso > neto elegible |
| `GET /me/events/{eventId}/seating-map`, `GET /admin/events/{eventId}/seating-map` | **ADAPT** | GRADUATE propio / ADMIN | GR expone agrupación comercial/visor de mesas; no motor de acomodo Monkavia |
| `GET/PUT /me/events/{eventId}/table-allocations` (anexo histórico 0.1) | **COMPATIBILITY REVIEW** | GRADUATE propio | Nombre de ruta legado no obliga a crear modelo `TableAllocation`; representa sólo agrupación de cantidades; revisar contra UI GR y CEO |
| `PUT /me/events/{eventId}/table-assignments`, `PUT /admin/events/{eventId}/graduates/{membershipId}/table-assignments` | **DEPRECATE/ADAPT** | GRADUATE/ADMIN | Rutas nominales antiguas no pueden seguir como fuente de ocupación; evitar contar doble |
| `POST /admin/events/{eventId}/seating-map/background`, `DELETE .../background` | **DEPRECATE** | ADMIN | No OCR/upload de plano ni editor dinámico por evento |
| `POST /admin/events/{eventId}/tables[/bulk|/import]` | **DEPRECATE** | ADMIN | Catálogo versionado precargado; no CRUD de geometría por usuario |
| `GET/PUT /me/events/{eventId}/group-members/{memberId}/meal-selection` y menú admin | **REUSE** | GRADUATE/ADMIN | Elegibilidad con cena, deadline, cambios admin auditados |
| `GET/PATCH/POST /me/events/{eventId}/thermo*` y endpoints admin | **REUSE** | GRADUATE/ADMIN | Milestone independiente, estados operativos y producción inmutable |
| `GET/POST /admin/events/{eventId}/reports*|exports*` | **REUSE** | ADMIN | Export autorizado, async y download privado |
| `POST /webhooks/mercado-pago`, `POST /webhooks/openpay` | **REUSE+HARDEN** | PROVIDER | Verificación firma e identidad remota, idempotencia, ledger, rate/size |

**Criterio para cada uno de los 129**: conservar sólo si un UC aprobado necesita la operación y su DTO/estado no contradice reglas actuales. Los restantes deberán marcarse en un inventario automatizado final, no retirarse sin revisar referencias de UI. `table-allocations` es un nombre de **ruta de compatibilidad histórica**, no decisión de persistencia.

## 2. Fachada GR_ACCESS (15 operaciones verificadas)

| GR operationId | Actor | Monkavia o dominio interno | Obligación de seguridad |
| --- | --- | --- | --- |
| `adminGetAccessConfiguration` | ADMIN | `grGetEvent` / configuración de GR | evento autorizado, versiones correctas |
| `adminUpdateAccessConfiguration` | ADMIN | `grUpdateEvent` | CAS, idempotencia, timezone, horario válido |
| `adminGetAdmissionStatus` | ADMIN | `grGetEvent` + `grGetSyncState` | no presentar lease obsoleto como estado confiable |
| `adminControlAdmission` | ADMIN | `grTransitionEvent` | auditoría del ADMIN; PAUSE inmediato, override con motivo/futuro y reference |
| `adminPrepareAccesses` | ADMIN | `grCreateEvent`, `grGetEventByExternalId`, `grSyncRights`, `grPrepareCredentials`, `grSetRelease` | snapshot completo y cantidades; sin IDs individuales enviados por GR; jobs versionados |
| `adminListAccessMemberships` | ADMIN | `grGetSyncState`, `grListCredentials` | listar estados, no secretos QR ni tokens |
| `adminCreateNoDinnerPrintJob` | ADMIN | `grListCredentials`, `grCredentialSvg` | filtrar sólo NO_DINNER liberados; archivo/PDF privado |
| `adminGetNoDinnerPrintJob` | ADMIN | Job local GR | scope evento/ADMIN, progreso sin links públicos |
| `adminDownloadNoDinnerPrintJob` | ADMIN | Storage privado GR | download autenticado, no-cache, audit |
| `adminListAccessStaff` | ADMIN | `grListStaff` | metadata; nunca token temporal ya emitido |
| `adminCreateAccessStaff` | ADMIN | `grCreateStaff` | token sólo una entrega; máximo 15 GR; sin exponer HMAC |
| `adminExpireAccessStaff` | ADMIN | `grExpireStaff` | irreversibilidad, audit y ownership |
| `adminGetAccessAttendance` | ADMIN | `grAttendance` | consulta read-only, proyección sin escritura |
| `graduateGetAccesses` | GRADUATE | estado local + `grListCredentials` por servidor | exclusivamente propia membership, sólo FAMILY |
| `graduateGetFamilyQr` | GRADUATE | `grCredentialSvg` | pago GR, reglas GR de mesa, release confirmado, no-cache |

**Operaciones privadas sin ruta pública GR equivalente:** `grRenewAdmissionLease` es job del servidor; `grScannerScan` y `grScannerCheckIn` pertenecen al Scanner Monkavia con StaffToken. Las restantes `grUpdateEvent/grSyncRights/grSetRelease` se consumen exclusivamente por el adapter.

## 3. Contrato de sincronización GR → Monkavia V2.1

```json
{
  "syncVersion": 17,
  "memberships": [
    {
      "externalMembershipId": "00000000-0000-4000-8000-000000000001",
      "groups": [
        {
          "productKind": "ADULT",
          "externalTableId": "00000000-0000-4000-8000-000000000010",
          "quantity": 4
        },
        {
          "productKind": "CHILD",
          "externalTableId": null,
          "quantity": 1
        },
        {
          "productKind": "NO_DINNER",
          "externalTableId": null,
          "quantity": 2
        }
      ]
    }
  ],
  "tables": [
    {
      "externalTableId": "00000000-0000-4000-8000-000000000010",
      "capacity": 10,
      "status": "AVAILABLE"
    }
  ]
}
```

**Ejemplo de DTO, no datos reales ni propuesta de reglas de pago:** GR envía **4+1+2 cantidades** agrupadas (7 derechos) y Monkavia crea los 7 `rightId` internos. En caso de reintento o cambio de orden, no puede generar siete nuevos. La ausencia de mesa del CHILD mantiene la liberación FAMILY sujeta a la regla vigente de elegibilidad; NO_DINNER puede liberarse con pago total aunque FAMILY permanezca bloqueada.

### Contrato de elegibilidad (V2.1 sin cambio)

GR, tras verificar el 100% del saldo neto aplicable y las reglas de GR:
- `paidInFull=false`: `familyState=BLOCKED` y `noDinnerState=BLOCKED`.
- `paidInFull=true`, familia con mesa incompleta: `familyState=BLOCKED` y `noDinnerState=RELEASED` si existen derechos NO_DINNER elegibles.
- `paidInFull=true`, familia conforme a regla de agrupación de mesa: `familyState=RELEASED` y `noDinnerState=RELEASED`.
- Todo comando contiene `releaseVersion` por membership, `eligibilityRevision` contigua global y `expectedSyncVersion` remota; el navegador no envía estas decisiones.

El motor comercial GR sigue siendo autoridad de esta decisión; Monkavia no consulta ni replica saldo.

## 4. Códigos HTTP y errores

| Situación | HTTP GR | Respuesta pública |
| --- | --- | --- |
| Anónimo en endpoint protegido / JWT inválido | 401 | `UNAUTHENTICATED`, sin exponer token |
| Recurso eventId/contract ajeno | 404 preferida | `RESOURCE_NOT_FOUND` no revela existencia |
| Auth válido sin rol ADMIN | 403 | `FORBIDDEN` |
| Payload inválido o campo adicional | 400 | `VALIDATION_ERROR` |
| Token de código inválido/expirado | 404 o 401 según ruta | Código canónico vigente sin enumerar usuario |
| Documento legal versión vieja | 409 | `CONFLICT`/código canónico de versión pendiente de reconciliar |
| Cotización vencida, conflicto de cantidad o idempotencia | 409/422 según catálogo GR | `error` canónico; no alterar saldo |
| Pago gateway pendiente | 200/202 de consulta de estado | Nunca tratarlo como dinero confirmado |
| Monkavia sin red / versión inconsistente | 503/409 | `DEPENDENCY_UNAVAILABLE` o código canónico mapeado; revisión formal del catálogo requerida |
| QR ya usado / Staff inválido | 409/401 (Monkavia) | El Scanner gestiona error privado; no hacer proxy de secretos por GR |

**Nota de contrato:** los códigos exactos introducidos en esta matriz para el nuevo adapter requieren reconciliación con `ERROR_CONTRACT.md` y linter. No agregar códigos ad-hoc a producción.

## 5. Autorización horizontal, estados y controles comunes

| Prueba / regla | Público | GRADUATE | ADMIN | SYSTEM | Monkavia Scanner |
| --- | --- | --- | --- | --- | --- |
| Resolver código OPEN | Validación segura | N/A | N/A | N/A | N/A |
| Leer contrato/membership | No | Sólo propia | Evento autorizado | Reconciliación acotada | No |
| Aceptar contrato | No | Sólo propia + snapshot | No como graduado | No | No |
| Registrar abono manual / aprobar comprobante | No | No | Sí, auditado | Webhook/worker separado | No |
| Agrupar por mesa | No | Según reglas GR y ownership | Según reglas GR | No salvo operación prevista | No |
| Preparar/liberar QR / crear Staff | No | Sólo recuperar QR FAMILY liberado | Sí mediante GR API | Adapter HMAC servidor | No |
| Scan/check-in | No | No | No | No | Sólo StaffToken y evento Monkavia |
| Descargar PDF NO_DINNER | No | No | Sí, temporal y privado | Worker de impresión | No |

**Definición de completitud contractual:** rutas y operationIds de esta matriz se convierten en una especificación OpenAPI GR consolidada validada; cada endpoint tiene autorización, DTO, transiciones, errores, idempotencia, cancelación/replay y pruebas negativas. La existencia de una ruta en documentos antiguos no implica que esté implementada ni aprobada.
