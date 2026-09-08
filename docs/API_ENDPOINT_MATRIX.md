# Plataforma GR — Matriz Canónica de Endpoints API

**Documento:** `API_ENDPOINT_MATRIX.md`  
**Versión:** 1.0  
**Estado:** BASELINE CONTRACT-FIRST — listo para OpenAPI 3.1  
**Fecha:** 7 de septiembre de 2026  
**Base:** `/api/v1`  
**Baseline inspeccionado:** `a63fcaf2b09bf9a4ac72b09766f8d11a7e6ddbb8`

Fuentes: `SYSTEM_ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `DATA_MODEL.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `API_CONTRACTS.md`, frontend aprobado y `SEATING_AUTOMATION_CONTRACT.md`.

---

## 1. Regla de autoridad

Esta matriz es el inventario canónico de operaciones HTTP. Un endpoint que no aparezca aquí **no debe implementarse**.

```text
UI/acción → operationId → HTTP → use case → owner → DB/locks
→ idempotencia → audit/outbox → errores → pruebas
```

`API_CONTRACT.openapi.yaml` deberá materializar exactamente estas operaciones.

---

## 2. Convenciones

Actores: `PUBLIC`, `GRADUATE`, `ADMIN`, `PROVIDER`. Fases: `MVP`, `OPS`, `DEFER`.

Idempotencia:

```text
REQ = Idempotency-Key persistido en IdempotencyRecord
EXT = dedupe por identificador externo + constraints
—   = no aplica
```

Transacción:

```text
RO   = lectura
TX   = transacción ordinaria
LOCK = transacción + lock explícito
EXT2 = persist intent → commit → llamada externa → nueva TX
```

Reglas globales:

- JSON `snake_case`.
- UUID.
- dinero como decimal string.
- timestamps UTC ISO-8601.
- `/me/*` deriva cuenta de sesión.
- `/admin/*` exige `ADMIN`.
- `eventId` nunca concede ownership.
- rutas legacy no crean contratos.
- GET no audita salvo acceso sensible explícito.

Errores globales: `INVALID_REQUEST`, `UNAUTHENTICATED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `EVENT_NOT_FOUND`, `EVENT_NOT_OPERABLE`, `OWNERSHIP_MISMATCH`, `IDEMPOTENCY_KEY_REQUIRED`, `IDEMPOTENCY_KEY_REUSED`, `CONCURRENT_MODIFICATION`, `RATE_LIMITED`, `DEPENDENCY_UNAVAILABLE`, `INTERNAL_ERROR`.

---

## 3. Identity / Auth

| operationId | Fase | Actor / UI | HTTP | Use case / datos | TX | Idem | Audit/event | Errores/test clave |
|---|---|---|---|---|---|---|---|---|
| `authResolveEventAccess` | MVP | PUBLIC `/access` | `POST /auth/event-access/resolve` | `ResolveEventAccess`; EventAccessCode+Event | RO | — | security log | invalid/revoked/expired; no `event_id` arbitrario |
| `authRegisterGraduate` | MVP | PUBLIC `/register` | `POST /auth/graduate/register` | `RegisterGraduate`; Account+Membership+primary member+initial contract/plan | LOCK Event cuando confirme lugares | REQ | `membership.created` | no account takeover; capacity; contexto firmado obligatorio |
| `authLogin` | MVP | `/login`,`/admin/login` | `POST /auth/login` | `Login`; Account+AuthSession | TX | — | security log | INVALID_CREDENTIALS; DISABLED; role server-side |
| `authRefreshSession` | OPS | sesión SPA | `POST /auth/refresh` | `RefreshSession`; AuthSession | LOCK | REQ | security log | rotate hash; old token/revoked/expired fails |
| `authLogout` | MVP | sesión | `POST /auth/logout` | `Logout`; AuthSession | TX | REQ | security log | replay estable |
| `authRequestPasswordReset` | MVP | forgot password | `POST /auth/password-reset/request` | token hash + mail outbox | TX/EXT2 | — | security log | respuesta uniforme; rate limit |
| `authConfirmPasswordReset` | MVP | reset | `POST /auth/password-reset/confirm` | consume token, password, revoke sessions | LOCK | REQ | security log | used/expired token |

`/forgot-password/sent` no tiene API.

---

## 4. GRADUATE — perfil/evento

| operationId | Fase | HTTP | Use case/datos | TX | Idem | Test clave |
|---|---|---|---|---|---|---|
| `graduateGetProfile` | MVP | `GET /me/profile` | Account propio | RO | — | sin hashes/role mutable |
| `graduateUpdateProfile` | MVP | `PATCH /me/profile` | profile permitido | TX | — | no role/status arbitrario |
| `graduateListEvents` | MVP | `GET /me/events` | Membership+Event projection | RO | — | solo memberships propias |
| `graduateGetEvent` | MVP | `GET /me/events/{eventId}` | contexto event/membership | RO | — | IDOR eventId |
| `graduateGetEventSummary` | MVP | `GET /me/events/{eventId}/summary` | home projection Contract+Finance+Seating+Meals+Thermo | RO | — | no PII ajena |

---

## 5. GRADUATE — contrato/grupo/productos

| operationId | Fase | HTTP | Use case / writes | TX | Idem | Audit/event | Errores/test clave |
|---|---|---|---|---|---|---|---|
| `graduateGetContract` | MVP | `GET /me/events/{eventId}/contract` | current Contract+LineItems | RO | — | — | CONTRACT_NOT_FOUND; ownership |
| `graduateAcceptContract` | MVP | `POST /me/events/{eventId}/contract/accept` | `AcceptContract`; immutable acceptance | LOCK Contract | REQ | `CONTRACT_ACCEPTED`, `contract.accepted` | version changed; double click = one acceptance |
| `graduateGetGroup` | MVP | `GET /me/events/{eventId}/group` | Membership+GroupMembers | RO | — | — | own group only |
| `graduateAddGroupMember` | MVP | `POST /me/events/{eventId}/group-members` | add member | LOCK Membership | REQ | group audit | active count<=places; deadline/event |
| `graduateUpdateGroupMember` | MVP | `PATCH /me/events/{eventId}/group-members/{memberId}` | allowed nominal fields | LOCK Membership | — | audit if changed | no product/primary/status escalation |
| `graduateListAvailableProducts` | MVP | `GET /me/events/{eventId}/products` | active purchasable products+eligibility | RO | — | — | read does not reserve capacity |
| `graduateQuoteContractLineItem` | MVP | `POST /me/events/{eventId}/contract-line-items/quote` | create ContractLineItemQuote | TX | — | — | catch-up exact; product/deadline/capacity |
| `graduateConfirmContractLineItem` | MVP | `POST /me/events/{eventId}/contract-line-items` | append line item+places+obligations | LOCK quote+Event+Membership+Contract+Plan | REQ | `membership.places_changed` | stale quote/capacity race; all-or-nothing |

No endpoint GRADUATE para reducir lugares (`BR-PLC-008`).

---

## 6. GRADUATE — meals/seating

| operationId | Fase | HTTP | Use case | TX | Idem | Audit/event | Errores/test clave |
|---|---|---|---|---|---|---|---|
| `graduateGetMeals` | MVP | `GET /me/events/{eventId}/meals` | options + own selections | RO | — | — | no PII ajena |
| `graduateSetMealSelection` | MVP | `PUT /me/events/{eventId}/group-members/{memberId}/meal-selection` | `SelectMeal` | TX | REQ | `meal.selection.changed` | ownership, same event, deadline |
| `graduateGetSeatingMap` | MVP | `GET /me/events/{eventId}/seating-map` | map+tables+derived availability | RO | — | — | no assignment identities ajenas |
| `graduateGetTableAssignments` | MVP | `GET /me/events/{eventId}/table-assignments` | own assignments | RO | — | — | ownership |
| `graduateAssignTableMembers` | MVP | `PUT /me/events/{eventId}/table-assignments` | batch replace included members | LOCK tables ordered | REQ | assignment audit/event | financial eligibility, deadline, block, capacity race |

No V1 endpoint de hold. `SELECTED/HOVER` es UI.

---

## 7. GRADUATE — finance/payments

| operationId | Fase | HTTP | Use case / autoridad | TX | Idem | Audit/event | Errores/test clave |
|---|---|---|---|---|---|---|---|
| `graduateGetPaymentPlan` | MVP | `GET /me/events/{eventId}/payment-plan` | derived financial read model | RO | — | — | estados installment derivados |
| `graduateCreatePaymentAttempt` | MVP | `POST /me/events/{eventId}/payment-attempts` | create Attempt then gateway; request=`provider`,`requested_amount`,`installment_id?`; server valida monto | EXT2 | REQ | `payment.attempt.created` | partial payment allowed if rules permit; frontend amount not authority |
| `graduateGetPaymentAttempt` | MVP | `GET /me/events/{eventId}/payment-attempts/{attemptId}` | attempt status | RO | — | — | return URL no confirma |
| `graduateUploadPaymentEvidence` | MVP | `POST /me/files/payment-evidence` multipart | private FileAsset | EXT2 | REQ | file log optional | MIME/size/purpose |
| `graduateCreatePaymentSubmission` | MVP | `POST /me/events/{eventId}/payment-submissions` | create PENDING_REVIEW | TX | REQ | `payment.submission.created` | evidence own+AVAILABLE; TRANSFER/DEPOSIT; no saldo change |
| `graduateListPaymentSubmissions` | MVP | `GET /me/events/{eventId}/payment-submissions` | own list | RO | — | — | ownership |
| `graduateGetPaymentSubmission` | MVP | `GET /me/events/{eventId}/payment-submissions/{submissionId}` | own detail + short evidence URL | RO | — | — | ownership |

---

## 8. GRADUATE — thermo / notifications

| operationId | Fase | HTTP | Use case | TX | Idem | Audit/event | Test clave |
|---|---|---|---|---|---|---|---|
| `graduateGetThermo` | MVP | `GET /me/events/{eventId}/thermo` | derived eligibility + config/request | RO | — | — | LOCKED/AVAILABLE derived |
| `graduateRequestThermo` | MVP | `POST /me/events/{eventId}/thermo/request` | revalidate finance + create Request/values | TX | REQ | `thermo.requested` | not eligible/duplicate/invalid fields |
| `graduateUpdateThermoPersonalization` | MVP | `PATCH /me/events/{eventId}/thermo` | update values before production | TX | REQ | thermo audit | edit locked, option/field invalid |
| `graduateListNotifications` | DEFER | `GET /me/notifications` | own notifications | RO | — | — | screen no active route |
| `graduateMarkNotificationRead` | DEFER | `PATCH /me/notifications/{notificationId}` | mark read | TX | — | — | ownership |

---

## 9. ADMIN — dashboard/event lifecycle

| operationId | Fase | HTTP | Use case / writes | TX | Idem | Audit/event | Test clave |
|---|---|---|---|---|---|---|---|
| `adminGetDashboard` | MVP | `GET /admin/dashboard` | platform read projection | RO | — | — | derived totals only |
| `adminListEvents` | MVP | `GET /admin/events` | event list/selectors | RO | — | — | pagination/filter |
| `adminCreateEvent` | MVP | `POST /admin/events` | **atomic composite wizard**: Event DRAFT+settings+products+financial config/templates+milestones+thermo config+meal options+policy draft | TX | REQ | `EVENT_CREATED` | whole request validated; no partial event; access code plaintext returned once |
| `adminGetEvent` | MVP | `GET /admin/events/{eventId}` | configuration read model | RO | — | — | — |
| `adminGetEventSummary` | MVP | `GET /admin/events/{eventId}/summary` | operational summary | RO | — | — | derived |
| `adminUpdateEvent` | MVP | `PATCH /admin/events/{eventId}` | general info/deadlines/capacity only | LOCK Event if capacity | REQ for capacity | `EVENT_UPDATED` | no versioned config mutation; new capacity >= confirmed |
| `adminTransitionEvent` | MVP | `POST /admin/events/{eventId}/transitions` | OPEN/CLOSE/REOPEN/FINALIZE/CANCEL | LOCK Event/readiness | REQ | lifecycle audit+outbox | valid transition; CANCEL reason; OPEN readiness |
| `adminRotateEventAccessCode` | OPS | `POST /admin/events/{eventId}/access-code/rotate` | revoke active+insert new hash | LOCK | REQ | audit | plaintext new code returned once; no GET plaintext |

**Decisión:** el wizard usa una sola operación `adminCreateEvent`; no seis PATCH parciales.

---

## 10. ADMIN — products / financial config

| operationId | Fase | HTTP | Use case | TX | Idem | Audit | Test clave |
|---|---|---|---|---|---|---|---|
| `adminListProducts` | MVP | `GET /admin/events/{eventId}/products` | list | RO | — | — | — |
| `adminCreateProduct` | MVP | `POST /admin/events/{eventId}/products` | create | TX | REQ | product audit | code unique, amount>=0 |
| `adminUpdateProduct` | MVP | `PATCH /admin/events/{eventId}/products/{productId}` | rename/price/order/active | TX | REQ | product audit | historical snapshots unchanged |
| `adminListFinancialConfigurations` | OPS | `GET /admin/events/{eventId}/financial-configurations` | versions | RO | — | — | — |
| `adminCreateFinancialConfigurationDraft` | OPS | `POST /admin/events/{eventId}/financial-configurations` | next DRAFT | TX | REQ | audit | version unique |
| `adminUpdateFinancialConfigurationDraft` | OPS | `PUT /admin/financial-configurations/{configurationId}` | replace DRAFT+templates | LOCK | REQ | audit | DRAFT only |
| `adminPublishFinancialConfiguration` | OPS | `POST /admin/financial-configurations/{configurationId}/publish` | publish | LOCK versions | REQ | publish audit | one ACTIVE/event; used version immutable |
| `adminGetFinancialMilestones` | MVP | `GET /admin/events/{eventId}/financial-milestones` | list | RO | — | — | — |
| `adminReplaceFinancialMilestones` | MVP | `PUT /admin/events/{eventId}/financial-milestones` | replace config | TX | REQ | audit | 0..100; no hardcodes |
| `adminGetLatePaymentPolicy` | MVP | `GET /admin/events/{eventId}/late-payment-policy` | read settings | RO | — | — | — |
| `adminUpdateLatePaymentPolicy` | MVP | `PATCH /admin/events/{eventId}/late-payment-policy` | update settings | TX | REQ | audit | no fee application in same endpoint |

---

## 11. ADMIN — thermo config / meal options / cancellation policies

| operationId | Fase | HTTP | Use case | TX | Idem | Test clave |
|---|---|---|---|---|---|---|
| `adminListThermoConfigurations` | OPS | `GET /admin/events/{eventId}/thermo-configurations` | versions | RO | — | — |
| `adminCreateThermoConfigurationDraft` | OPS | `POST /admin/events/{eventId}/thermo-configurations` | DRAFT | TX | REQ | version unique |
| `adminUpdateThermoConfigurationDraft` | OPS | `PUT /admin/thermo-configurations/{configurationId}` | fields/options/evidence | LOCK | REQ | DRAFT only; schema valid |
| `adminPublishThermoConfiguration` | OPS | `POST /admin/thermo-configurations/{configurationId}/publish` | publish | LOCK | REQ | one ACTIVE/event |
| `adminListMealOptions` | MVP | `GET /admin/events/{eventId}/meal-options` | list | RO | — | — |
| `adminCreateMealOption` | MVP | `POST /admin/events/{eventId}/meal-options` | create | TX | REQ | normalized unique |
| `adminUpdateMealOption` | MVP | `PATCH /admin/events/{eventId}/meal-options/{mealOptionId}` | rename/order/active | TX | REQ | used option not hard-delete |
| `adminListCancellationPolicies` | MVP | `GET /admin/events/{eventId}/cancellation-policies` | versions | RO | — | — |
| `adminCreateCancellationPolicyDraft` | MVP | `POST /admin/events/{eventId}/cancellation-policies` | next DRAFT | TX | REQ | unique version |
| `adminReplaceCancellationPolicyRanges` | MVP | `PUT /admin/cancellation-policies/{policyId}/ranges` | replace DRAFT ranges | LOCK | REQ | DRAFT only |
| `adminValidateCancellationPolicy` | MVP | `POST /admin/cancellation-policies/{policyId}/validate` | pure validation | RO | — | gap/overlap/coverage errors |
| `adminPublishCancellationPolicy` | MVP | `POST /admin/cancellation-policies/{policyId}/publish` | immutable ACTIVE | LOCK Event/policies | REQ | one ACTIVE; ranges valid |

---

## 12. ADMIN — graduates / contract / notes / cancellation

| operationId | Fase | HTTP | Use case | TX | Idem | Audit/event | Test clave |
|---|---|---|---|---|---|---|---|
| `adminListGraduates` | MVP | `GET /admin/events/{eventId}/graduates` | event portfolio | RO | — | — | filters/pagination |
| `adminGetGraduate` | MVP | `GET /admin/events/{eventId}/graduates/{membershipId}` | consolidated record | RO | — | — | same event |
| `adminGetGraduateContract` | MVP | `GET /admin/events/{eventId}/graduates/{membershipId}/contract` | contract read | RO | — | — | accepted contract read-only |
| `adminReduceMembershipPlaces` | MVP | `PATCH /admin/events/{eventId}/graduates/{membershipId}/places` | `ReducePlaces`; target count + explicit member IDs + reason | LOCK Membership+Contract+Plan+assignments | REQ | place reduction audit/outbox | **solo reducción**; no elegir personas automáticamente |
| `adminListInternalNotes` | MVP | `GET /admin/events/{eventId}/graduates/{membershipId}/notes` | list | RO | — | — | ADMIN only |
| `adminCreateInternalNote` | MVP | `POST /admin/events/{eventId}/graduates/{membershipId}/notes` | append note | TX | REQ | audit | non-empty |
| `adminQuoteMembershipCancellation` | MVP | `POST /admin/events/{eventId}/graduates/{membershipId}/cancellation-quote` | backend quote | TX | — | — | percent/days server-side |
| `adminCancelMembership` | MVP | `POST /admin/events/{eventId}/graduates/{membershipId}/cancel` | use quote; cancel membership/release assignments | LOCK quote+Membership+Plan+assignments | REQ | `MEMBERSHIP_CANCELLED` | stale quote; reason; no auto refund |

La acción “Registrar Graduado” de la pantalla global antigua queda `NO CONTRACT`; alta administrativa futura requiere requisito explícito.

---

## 13. ADMIN — portfolio/payments/refunds/reconciliation

| operationId | Fase | HTTP | Use case / writes | TX | Idem | Audit/event | Test clave |
|---|---|---|---|---|---|---|---|
| `adminGetEventPortfolio` | MVP | `GET /admin/events/{eventId}/portfolio` | derived portfolio | RO | — | — | pagination; exact ledger |
| `adminGetGraduatePaymentPlan` | MVP | `GET /admin/events/{eventId}/graduates/{membershipId}/payment-plan` | plan detail | RO | — | — | same event |
| `adminListPaymentTransactions` | MVP | `GET /admin/events/{eventId}/payment-transactions` | movements | RO | — | — | filters/pagination |
| `adminCreateManualPayment` | MVP | `POST /admin/events/{eventId}/graduates/{membershipId}/payments/manual` | Transaction+Allocations+freeze; `amount`,`method`,`paid_at`,`installment_id?`,`reference?`,`received_by?`,`evidence_file_id?` | LOCK Plan/Installments | REQ | manual payment + payment event | allocation server-side; no duplicate |
| `adminListPaymentSubmissions` | MVP | `GET /admin/payment-submissions` | canonical queue; `event_id` optional filter | RO | — | — | no duplicate event-list route |
| `adminGetPaymentSubmission` | MVP | `GET /admin/payment-submissions/{submissionId}` | detail + short evidence URL | RO | — | — | ADMIN |
| `adminApprovePaymentSubmission` | MVP | `POST /admin/payment-submissions/{submissionId}/approve` | Transaction+Allocation+freeze | LOCK submission+Plan+Installments | REQ | approve+payment events | max one tx/submission |
| `adminRejectPaymentSubmission` | MVP | `POST /admin/payment-submissions/{submissionId}/reject` | reject | LOCK submission | REQ | reject audit | reason; no ledger change |
| `adminCreateAdjustment` | MVP | `POST /admin/payment-plans/{planId}/adjustments` | append Adjustment | LOCK relevant Plan/Installment | REQ | audit | amount>0; reason |
| `adminCreateRefund` | MVP | `POST /admin/payment-plans/{planId}/refunds` | Refund+RefundSource; provider/manual workflow | LOCK sources when confirm / EXT2 | REQ | refund events | may be multi-source; no original tx/allocation overwrite |
| `adminListRefunds` | MVP | `GET /admin/events/{eventId}/refunds` | list | RO | — | — | filters |
| `adminListReconciliationCases` | OPS | `GET /admin/reconciliation-cases` | incidents | RO | — | — | filters |
| `adminResolveReconciliationCase` | OPS | `POST /admin/reconciliation-cases/{caseId}/resolve` | resolve note only | LOCK case | REQ | audit | resolution itself moves no money/capacity |

No se usa una ruta refund ligada obligatoriamente a una sola transaction: `RefundSource[]` permite múltiples cobros.

---

## 14. ADMIN — seating/croquis

| operationId | Fase | HTTP | Use case | TX | Idem | Audit/event | Test clave |
|---|---|---|---|---|---|---|---|
| `adminGetSeatingMap` | MVP | `GET /admin/events/{eventId}/seating-map` | full admin read model | RO | — | — | occupancy derived |
| `adminUpdateSeatingMap` | MVP | `PUT /admin/events/{eventId}/seating-map` | create/update metadata | TX | REQ | layout audit/event | NORMALIZED only |
| `adminUploadSeatingBackground` | MVP | `POST /admin/events/{eventId}/seating-map/background` multipart | FileAsset+attach | EXT2 | REQ | background changed | PNG/JPG/JPEG/PDF one-page; private |
| `adminRemoveSeatingBackground` | MVP | `DELETE /admin/events/{eventId}/seating-map/background` | detach | TX | REQ | background changed | tables survive |
| `adminCreateTable` | MVP | `POST /admin/events/{eventId}/tables` | create | TX | REQ | `table.created` | label/capacity/geometry |
| `adminBulkCreateTables` | MVP | `POST /admin/events/{eventId}/tables/bulk` | batch create | TX all-or-nothing | REQ | layout event | no partial subset |
| `adminImportDetectedTables` | MVP | `POST /admin/events/{eventId}/tables/import` | publish reviewed CV/OCR candidates | TX all-or-nothing | REQ | import audit+events | source file, duplicate label, geometry; return `client_ref -> id` |
| `adminGetTable` | MVP | `GET /admin/events/{eventId}/tables/{tableId}` | detail | RO | — | — | same event |
| `adminUpdateTable` | MVP | `PATCH /admin/events/{eventId}/tables/{tableId}` | label/move/resize/capacity | LOCK if capacity | REQ for semantic edits | `table.updated` | capacity>=occupancy; status not set here |
| `adminBlockTable` | MVP | `POST /admin/events/{eventId}/tables/{tableId}/block` | block | LOCK | REQ | `table.blocked` | existing assignments stay |
| `adminUnblockTable` | MVP | `POST /admin/events/{eventId}/tables/{tableId}/unblock` | unblock | TX | REQ | `table.unblocked` | — |
| `adminDeleteTable` | MVP | `DELETE /admin/events/{eventId}/tables/{tableId}` | delete unused | LOCK | REQ | `table.deleted` | TABLE_HAS_ASSIGNMENTS |
| `adminAssignTableMembers` | MVP | `PUT /admin/events/{eventId}/graduates/{membershipId}/table-assignments` | admin batch assignment | LOCK ordered tables | REQ | assignment audit/event | capacity/event; reason on override |

OpenCV/Tesseract/PDF.js corren en frontend Web Worker. **No existe endpoint de análisis OCR**.

---

## 15. ADMIN — operational meals/thermos

| operationId | Fase | HTTP | Use case | TX | Idem | Audit/event | Test clave |
|---|---|---|---|---|---|---|---|
| `adminGetEventMeals` | MVP | `GET /admin/events/{eventId}/meals` | person/graduate/summary read model | RO | — | — | dynamic options |
| `adminGetGraduateMeals` | MVP | `GET /admin/events/{eventId}/graduates/{membershipId}/meals` | group detail | RO | — | — | same event |
| `adminSetMealSelection` | MVP | `PUT /admin/events/{eventId}/group-members/{memberId}/meal-selection` | ADMIN override | TX | REQ | `MEAL_OVERRIDE` | reason after deadline; same-event FK |
| `adminListThermos` | MVP | `GET /admin/events/{eventId}/thermos` | derived eligibility+requests list | RO | — | — | LOCKED/AVAILABLE derived |
| `adminGetThermo` | MVP | `GET /admin/events/{eventId}/thermos/{thermoId}` | detail | RO | — | — | same event |
| `adminTransitionThermo` | MVP | `POST /admin/events/{eventId}/thermos/{thermoId}/transitions` | START_PRODUCTION | LOCK Request | REQ | `thermo.production_started` | no arbitrary status setter |
| `adminDeliverThermo` | MVP | `POST /admin/events/{eventId}/thermos/{thermoId}/delivery` | validate evidence+delivery | LOCK Request | REQ | `thermo.delivered` | configuration evidence requirements |

Delivery no se reduce a `MARK_DELIVERED` genérico porque puede exigir nombre/firma/evidencia.

---

## 16. ADMIN — reports

Todas las operaciones son `RO`, `ADMIN`, no idempotency/audit.

| operationId | Fase | HTTP | Read model |
|---|---|---|---|
| `adminGetOperationalReport` | MVP | `GET /admin/events/{eventId}/reports/operational` | tabla aprobada: mesa, folio, nombre, adultos, niños, sin cena, abonos, total, pagado, saldo, platillos, datos del evento |
| `adminGetFinancialReport` | MVP | `GET /admin/events/{eventId}/reports/financial` | contracted/collected/applied/refunded/pending/overdue/penalties |
| `adminGetPortfolioReport` | MVP | `GET /admin/events/{eventId}/reports/portfolio` | cartera por membership |
| `adminGetPaymentsReport` | MVP | `GET /admin/events/{eventId}/reports/payments` | confirmed transactions |
| `adminGetPaymentSubmissionsReport` | MVP | `GET /admin/events/{eventId}/reports/payment-submissions` | submissions history |
| `adminGetTablesReport` | MVP | `GET /admin/events/{eventId}/reports/tables` | capacity/occupied/available/blocked |
| `adminGetMealsReport` | MVP | `GET /admin/events/{eventId}/reports/meals` | selections/pending por option |
| `adminGetThermosReport` | MVP | `GET /admin/events/{eventId}/reports/thermos` | eligibility/request/production/delivery |
| `adminGetCashCutsReport` | MVP | `GET /admin/events/{eventId}/reports/cash-cuts` | DAILY/WEEKLY/MONTHLY confirmed movements con timezone del evento |

Sin N+1; filtros no cambian fuente autoritativa.

---

## 17. ADMIN — exports

| operationId | Fase | HTTP | Use case | TX | Idem | Test clave |
|---|---|---|---|---|---|---|
| `adminCreateExport` | MVP | `POST /admin/events/{eventId}/exports` | ExportJob PENDING + Outbox | TX | REQ | whitelist report/format/filter; formula injection handled at generation |
| `adminGetExport` | MVP | `GET /admin/exports/{exportId}` | status/result metadata | RO | — | ADMIN |
| `adminGetExportDownload` | MVP | `GET /admin/exports/{exportId}/download` | short signed URL | EXT2/RO | — | COMPLETED only; private storage |

El XLSX generado solo en navegador es demo; producción usa este flujo.

---

## 18. ADMIN — audit/accounts/files

| operationId | Fase | HTTP | Use case | TX | Idem | Test clave |
|---|---|---|---|---|---|---|
| `adminListAudit` | MVP | `GET /admin/audit` | canonical audit query; `event_id?`, actor/action/entity/date/search | RO | — | global y event screen reutilizan esta ruta |
| `adminListAccounts` | OPS | `GET /admin/accounts` | list | RO | — | no hashes/secrets |
| `adminCreateAdminAccount` | OPS | `POST /admin/accounts` | create ADMIN | TX | REQ | email unique; role not request-selectable beyond this use case |
| `adminDisableAccount` | OPS | `POST /admin/accounts/{accountId}/disable` | disable+revoke sessions | LOCK | REQ | no generic role/status PATCH |
| `adminUploadFile` | MVP | `POST /admin/files` multipart | internal evidence FileAsset | EXT2 | REQ | purpose/event/MIME private |

No UPDATE/DELETE de AuditLog.

---

## 19. Provider webhooks

| operationId | Fase | HTTP | Pipeline | Idem | Test clave |
|---|---|---|---|---|---|
| `webhookMercadoPago` | MVP | `POST /webhooks/mercado-pago` | inbox → verify authenticity → server-to-server payment lookup → Transaction/Allocation/freeze → effects | EXT | duplicate event/tx one result; return URL irrelevant |
| `webhookOpenPay` | MVP | `POST /webhooks/openpay` | mismo pipeline vía adapter | EXT | provider independence |

Si proveedor confirma dinero pero la capacidad comercial ya se agotó: conservar Transaction válida, no sobrepasar `Event.capacity`, crear `ReconciliationCase(PAYMENT_CONFIRMED_CAPACITY_CONFLICT)`, sin refund/cancel automático.

---

## 20. Jobs internos — no controllers públicos

| jobId | Fase | Persistencia/regla |
|---|---|---|
| `jobApplyLatePenalties` | OPS | lock Plan/Installment; PenaltyCharge idempotente + obligación + audit/outbox |
| `jobEvaluateAutoCancellation` | OPS | solo si policy/config explícita; usa caso de uso auditable |
| `jobDispatchOutbox` | OPS | claim `OutboxEvent FOR UPDATE SKIP LOCKED`; retry/backoff |
| `jobProcessExports` | MVP | claim ExportJob; produce FileAsset |
| `jobCleanupExports` | OPS | TTL solo archivos/jobs temporales |
| `jobPaymentReconciliationRepair` | OPS | provider lookup + ReconciliationCase; no inventa money |
| `jobNotificationReminders` | DEFER | Notification/Outbox; failure no afecta negocio |

`OVERDUE` es derivado; no existe job que escriba `Installment.status=OVERDUE`.

---

## 21. Frontend → operaciones

| Superficie | Contratos |
|---|---|
| `/access` | `authResolveEventAccess` |
| `/register` | `authRegisterGraduate` |
| `/login`, `/admin/login` | `authLogin` |
| `/graduate/events` | `graduateListEvents` |
| `/graduate` | `graduateGetEventSummary` |
| `/graduate/group` | group + products + quote/confirm |
| `/graduate/payments` | payment plan + attempt + evidence/submissions |
| `/graduate/contract` | get/accept contract |
| `/graduate/table` | seating map/assignments |
| `/graduate/meals` | meals/select |
| `/graduate/thermo` | thermo read/request/update |
| `/graduate/more` | profile |
| `/admin` | dashboard |
| `/admin/events` | list events |
| `/admin/events/new` | atomic `adminCreateEvent` |
| `/admin/events/:eventId` | event+summary+transition |
| `.../graduates` | event graduates |
| `.../graduates/:id` | consolidated graduate + commands |
| `.../payments` | portfolio/movements/submissions/plan/pay/refund |
| `.../tables` | seating CRUD/import/assign |
| `.../meals` | operational meals/options/override |
| `.../thermos` | thermos operations |
| `.../reports` | reports+exports |
| `.../settings` | event/config reads + lifecycle |
| cancellation policy | policy operations |
| global/event audit | `adminListAudit` |
| global payments/thermos/reports/more | list/select event, luego operación event-scoped; sin APIs duplicadas |

---

## 22. Legacy / orphan decisions

| Superficie/código | Decisión |
|---|---|
| `/dashboard`, `/layout`, `/meals`, `/payments`, `/thermo`, `/summary` | `LEGACY / NO CONTRACT` |
| `frontend/src/services/api.ts`, `layoutAPI.ts`, `paymentsAPI.ts`, etc. | legacy; reemplazar por cliente OpenAPI/adapters |
| `frontend/src/demo/*`, fixtures | demo/test; no autoridad |
| `/showcase` | sin API |
| `/forgot-password/sent` | sin API |
| `GraduateNotificationsScreen` no montada | `DEFER` |
| global old “Registrar Graduado” | `NO CONTRACT` hasta requisito explícito |
| OCR/CV analysis | local Web Worker; sin endpoint |
| BroadcastChannel/mock realtime | demo; producción V1 polling |

---

## 23. Request semantics que OpenAPI debe fijar

### Pago parcial

`requested_amount`/`amount` es intención. Backend valida Decimal >0 y reglas del plan; allocations son server-side. Nunca recibir como autoridad `paid_total`, `pending_total`, `progress_percent` ni allocations finales.

### Reducción de lugares

`adminReduceMembershipPlaces` exige `active_places`, `deactivate_group_member_ids[]` y `reason`. No selecciona personas automáticamente.

### Overrides ADMIN

Fuera de deadline/corrección requiere `reason` cuando la regla lo indica.

### Batch

Assignments, table bulk/import y policy ranges son all-or-nothing.

---

## 24. Error codes preliminares

`ERROR_CONTRACT.md` será autoridad final.

```text
EVENT_ACCESS_INVALID EVENT_ACCESS_EXPIRED EVENT_ACCESS_CONTEXT_INVALID
ACCOUNT_REAUTHENTICATION_REQUIRED INVALID_CREDENTIALS ACCOUNT_DISABLED
SESSION_REVOKED SESSION_EXPIRED PASSWORD_RESET_TOKEN_INVALID
PASSWORD_RESET_TOKEN_EXPIRED PASSWORD_RESET_TOKEN_USED EMAIL_ALREADY_EXISTS
EVENT_CAPACITY_EXCEEDED EVENT_TRANSITION_INVALID EVENT_NOT_READY
PRODUCT_NOT_FOUND PRODUCT_NOT_AVAILABLE PLACES_DEADLINE_CLOSED
ACTIVE_PLACES_EXCEEDED CONTRACT_NOT_FOUND CONTRACT_ALREADY_ACCEPTED
CONTRACT_VERSION_CHANGED CONTRACT_NOT_ACCEPTABLE PRODUCT_QUOTE_STALE
FINANCIAL_REQUIREMENT_NOT_MET GROUP_MEMBER_NOT_OWNED
SEATING_NOT_FINANCIALLY_ELIGIBLE SEATING_DEADLINE_CLOSED TABLE_NOT_FOUND
TABLE_BLOCKED TABLE_CAPACITY_CHANGED TABLE_HAS_ASSIGNMENTS
TABLE_CAPACITY_BELOW_OCCUPANCY ASSIGNMENT_EVENT_MISMATCH
SEATING_IMPORT_INVALID SEATING_IMPORT_DUPLICATE_LABEL
MEAL_OPTION_NOT_FOUND MEAL_MEMBER_EVENT_MISMATCH MEALS_DEADLINE_CLOSED
MEAL_OVERRIDE_REASON_REQUIRED THERMO_NOT_ELIGIBLE THERMO_REQUEST_EXISTS
THERMO_INVALID_TRANSITION THERMO_EDIT_LOCKED THERMO_PERSONALIZATION_INVALID
THERMO_DELIVERY_EVIDENCE_REQUIRED PAYMENT_PLAN_NOT_FOUND FINANCIAL_PLAN_FROZEN
INSTALLMENT_NOT_FOUND INSTALLMENT_NOT_PAYABLE INVALID_PAYMENT_AMOUNT
PAYMENT_ATTEMPT_NOT_FOUND PAYMENT_ALREADY_PROCESSED PAYMENT_PENDING_CONFIRMATION
PROVIDER_TRANSACTION_MISMATCH PAYMENT_SUBMISSION_NOT_FOUND
PAYMENT_SUBMISSION_NOT_OWNED PAYMENT_SUBMISSION_EVIDENCE_REQUIRED
PAYMENT_SUBMISSION_ALREADY_REVIEWED PAYMENT_SUBMISSION_TRANSACTION_EXISTS
INVALID_PAYMENT_SUBMISSION_METHOD LATE_FEE_ALREADY_APPLIED
REFUND_EXCEEDS_AVAILABLE_AMOUNT REFUND_SOURCE_INVALID RECONCILIATION_REQUIRED
CONFIGURATION_NOT_DRAFT CONFIGURATION_VERSION_IMMUTABLE
CANCELLATION_POLICY_NOT_FOUND CANCELLATION_POLICY_NOT_DRAFT
CANCELLATION_POLICY_OVERLAPPING_RANGES CANCELLATION_POLICY_GAP
CANCELLATION_POLICY_INVALID_PERCENT CANCELLATION_POLICY_INCOMPLETE_COVERAGE
CANCELLATION_POLICY_VERSION_IMMUTABLE CANCELLATION_QUOTE_NOT_FOUND
CANCELLATION_QUOTE_STALE GRADUATE_ALREADY_CANCELLED CANCELLATION_REASON_REQUIRED
```

---

## 25. Contract tests mínimos

1. `operationId` único y OpenAPI coincide con método/ruta.
2. actor incorrecto rechazado.
3. GRADUATE A no accede a B; cambiar `eventId` no cruza evento.
4. body `role`, ownership o total no eleva autoridad.
5. toda operación `REQ`: falta key falla; replay mismo hash no duplica; distinto payload con misma key falla.
6. quote stale de producto/cancelación falla.
7. races de último lugar evento/mesa no sobreasignan.
8. webhook duplicado crea una sola transaction/allocation.
9. return URL no confirma.
10. submission PENDING no cambia saldo; double approve = una transaction.
11. refund concurrente no excede refundable ni reescribe historia.
12. ACTIVE config/policy y accepted contract no se reescriben.
13. AuditLog no update/delete.
14. OCR import inválido revierte lote completo.
15. signed URLs expiran y storage permanece privado.
16. global admin surfaces no requieren endpoints duplicados.

---

## 26. Protocolo para agentes

Antes de crear controller:

```text
1. localizar operationId aquí
2. leer use case/owner en DOMAIN_MODEL
3. leer tablas/constraints/locks en DATA_MODEL
4. leer OpenAPI cuando esté READY
5. leer AUTHORIZATION_MATRIX y ERROR_CONTRACT cuando estén READY
6. implementar DTO desde OpenAPI, no desde pantalla
7. aplicar idempotencia/audit/outbox indicados
8. crear contract/integration/concurrency tests
```

Prohibido: alias de ruta por comodidad, endpoint desde fixture, controller→Prisma, PATCH genérico de estados críticos, fallback mock productivo o duplicar ruta global/event-scoped.

---

## 27. Definition of Ready para OpenAPI

```text
[READY] superficies oficiales
[READY] operationId únicos
[READY] métodos/rutas canónicas
[READY] actores/fases
[READY] use cases y autoridad
[READY] transaction/locks
[READY] idempotencia
[READY] audit/outbox
[READY] errores preliminares
[READY] contract tests
[READY] webhooks/jobs
[READY] OCR import
[READY] async exports
[READY] reconciliation
[READY] legacy/orphan decisions
```

OpenAPI añadirá schemas exactos, query/path params, status codes, security schemes, examples y error components sin inventar operaciones nuevas.

---

## 28. Regla final

```text
UI puede cambiar composición
operationId se reutiliza entre pantallas
ruta no se duplica por conveniencia UI
backend implementa caso de uso, no componente
```

Nueva acción sin `operationId`:

```text
STOP → cerrar requisito → actualizar DOMAIN/DATA si aplica
→ actualizar matriz → actualizar OpenAPI → implementar
```
