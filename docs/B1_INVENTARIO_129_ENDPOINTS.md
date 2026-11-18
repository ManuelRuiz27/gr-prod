# B1 — Inventario de 129 operaciones históricas (disposición para GR-app)

**Origen auditado:** `gr-prod/main/docs/API_CONTRACT.openapi.yaml` OpenAPI 3.1.0, exactamente **129 operationIds únicos**. Este archivo es un inventario de **decisiones de revisión**, no un mapa de rutas ya implementadas/aptas para producción.  
**Fechas:** 2026-11-18. **Nuevo backend:** repositorio independiente pendiente. **Prototipos:** pendiente aprobación CEO.

## Códigos de disposición

- **REUSE-CANDIDATE:** el caso sigue vigente en GR; reutilización sujeta a DTO, reglas, QA y aprobación.
- **REVIEW:** analizar contrato técnico frente a casos y servicio real; no marcar terminado.
- **ADAPT:** la intención del flujo sigue, el contrato heredado requiere ajuste explícito.
- **HARDEN:** lógica existente necesita prueba de validación/seguridad/atomicidad; no asumir runtime seguro.
- **DEPRECATE:** la operación contradice la UX actual (OCR, editor, upload, alta/borrado de mesas). No implementarla en el nuevo backend como ruta de edición.
- **RESTRICT:** conservar sólo subconjunto aprobado de operación, sin extender autorizaciones.
- **BLOCKED:** prohibir uso funcional hasta resolver dependencia legal o de producto.

**Nota:** `SEATING_QUANTITY.openapi.yaml` (4 operaciones) es un **anexo adicional histórico aún no desplegado**, no está entre las 129. La ruta nombrada `table-allocations` describe agrupación comercial; **no exige** un modelo de negocio nuevo `TableAllocation` por nombre. `GR_ACCESS_INTEGRATION.openapi.yaml` (15 operaciones) y Monkavia privado V2.1 (18) son contratos adicionales independientes.

## Inventario completo

| # | operationId | HTTP / ruta legacy | Disposición inicial |
| ---: | --- | --- | --- |
| 1 | `authResolveEventAccess` | `POST /auth/event-access/resolve` | ADAPT (sólo OPEN / anti-enumeración) |
| 2 | `authRegisterGraduate` | `POST /auth/graduate/register` | ADAPT (cuenta nueva + idempotencia) |
| 3 | `authLogin` | `POST /auth/login` | REVIEW (auth/security) |
| 4 | `authRefreshSession` | `POST /auth/refresh` | HARDEN (rotación/revocación) |
| 5 | `authLogout` | `POST /auth/logout` | HARDEN (revocar sesión) |
| 6 | `authRequestPasswordReset` | `POST /auth/password-reset/request` | HARDEN (anti-enumeración) |
| 7 | `authConfirmPasswordReset` | `POST /auth/password-reset/confirm` | HARDEN (uso único) |
| 8 | `graduateGetProfile` | `GET /me/profile` | REUSE-CANDIDATE (verificar UC/DTO) |
| 9 | `graduateUpdateProfile` | `PATCH /me/profile` | REUSE-CANDIDATE (verificar UC/DTO) |
| 10 | `graduateListEvents` | `GET /me/events` | REUSE-CANDIDATE (verificar UC/DTO) |
| 11 | `graduateGetEvent` | `GET /me/events/{eventId}` | REUSE-CANDIDATE (verificar UC/DTO) |
| 12 | `graduateGetEventSummary` | `GET /me/events/{eventId}/summary` | REUSE-CANDIDATE (verificar UC/DTO) |
| 13 | `graduateGetContract` | `GET /me/events/{eventId}/contract` | ADAPT (documento legal íntegro) |
| 14 | `graduateAcceptContract` | `POST /me/events/{eventId}/contract/accept` | BLOCKED (texto legal y CAS) |
| 15 | `graduateGetGroup` | `GET /me/events/{eventId}/group` | REUSE-CANDIDATE (verificar UC/DTO) |
| 16 | `graduateAddGroupMember` | `POST /me/events/{eventId}/group-members` | REUSE-CANDIDATE (verificar UC/DTO) |
| 17 | `graduateUpdateGroupMember` | `PATCH /me/events/{eventId}/group-members/{memberId}` | REUSE-CANDIDATE (verificar UC/DTO) |
| 18 | `graduateListAvailableProducts` | `GET /me/events/{eventId}/products` | REUSE-CANDIDATE (verificar UC/DTO) |
| 19 | `graduateQuoteContractLineItem` | `POST /me/events/{eventId}/contract-line-items/quote` | REVIEW (finanzas/contrato) |
| 20 | `graduateConfirmContractLineItem` | `POST /me/events/{eventId}/contract-line-items` | REVIEW (finanzas/contrato) |
| 21 | `graduateGetMeals` | `GET /me/events/{eventId}/meals` | REUSE-CANDIDATE (verificar UC/DTO) |
| 22 | `graduateSetMealSelection` | `PUT /me/events/{eventId}/group-members/{memberId}/meal-selection` | REUSE-CANDIDATE (verificar UC/DTO) |
| 23 | `graduateGetSeatingMap` | `GET /me/events/{eventId}/seating-map` | ADAPT (agrupación GR, no acomodo Monkavia) |
| 24 | `graduateGetTableAssignments` | `GET /me/events/{eventId}/table-assignments` | ADAPT (cantidades GR; no nominal) |
| 25 | `graduateAssignTableMembers` | `PUT /me/events/{eventId}/table-assignments` | ADAPT (contrato de agrupación; evitar doble ocupación) |
| 26 | `graduateGetPaymentPlan` | `GET /me/events/{eventId}/payment-plan` | REVIEW (finanzas/contrato) |
| 27 | `graduateCreatePaymentAttempt` | `POST /me/events/{eventId}/payment-attempts` | REVIEW (finanzas/contrato) |
| 28 | `graduateGetPaymentAttempt` | `GET /me/events/{eventId}/payment-attempts/{attemptId}` | REVIEW (finanzas/contrato) |
| 29 | `graduateUploadPaymentEvidence` | `POST /me/files/payment-evidence` | REVIEW (finanzas/contrato) |
| 30 | `graduateCreatePaymentSubmission` | `POST /me/events/{eventId}/payment-submissions` | REVIEW (finanzas/contrato) |
| 31 | `graduateListPaymentSubmissions` | `GET /me/events/{eventId}/payment-submissions` | REVIEW (finanzas/contrato) |
| 32 | `graduateGetPaymentSubmission` | `GET /me/events/{eventId}/payment-submissions/{submissionId}` | REVIEW (finanzas/contrato) |
| 33 | `graduateGetThermo` | `GET /me/events/{eventId}/thermo` | REUSE-CANDIDATE (verificar UC/DTO) |
| 34 | `graduateUpdateThermoPersonalization` | `PATCH /me/events/{eventId}/thermo` | REUSE-CANDIDATE (verificar UC/DTO) |
| 35 | `graduateRequestThermo` | `POST /me/events/{eventId}/thermo/request` | REUSE-CANDIDATE (verificar UC/DTO) |
| 36 | `graduateListNotifications` | `GET /me/notifications` | REUSE-CANDIDATE (verificar UC/DTO) |
| 37 | `graduateMarkNotificationRead` | `PATCH /me/notifications/{notificationId}` | REUSE-CANDIDATE (verificar UC/DTO) |
| 38 | `adminGetDashboard` | `GET /admin/dashboard` | REUSE-CANDIDATE (verificar UC/DTO) |
| 39 | `adminListEvents` | `GET /admin/events` | REUSE-CANDIDATE (verificar UC/DTO) |
| 40 | `adminCreateEvent` | `POST /admin/events` | REUSE-CANDIDATE (verificar UC/DTO) |
| 41 | `adminGetEvent` | `GET /admin/events/{eventId}` | REVIEW (estado/cambios aprobados) |
| 42 | `adminUpdateEvent` | `PATCH /admin/events/{eventId}` | REUSE-CANDIDATE (verificar UC/DTO) |
| 43 | `adminGetEventSummary` | `GET /admin/events/{eventId}/summary` | REUSE-CANDIDATE (verificar UC/DTO) |
| 44 | `adminTransitionEvent` | `POST /admin/events/{eventId}/transitions` | ADAPT (máquina comercial GR, no PAUSE Monkavia) |
| 45 | `adminGetEventAccessCodeStatus` | `GET /admin/events/{eventId}/access-code` | REUSE-CANDIDATE (verificar UC/DTO) |
| 46 | `adminRotateEventAccessCode` | `POST /admin/events/{eventId}/access-code/rotate` | REUSE-CANDIDATE (verificar UC/DTO) |
| 47 | `adminListProducts` | `GET /admin/events/{eventId}/products` | REUSE-CANDIDATE (verificar UC/DTO) |
| 48 | `adminCreateProduct` | `POST /admin/events/{eventId}/products` | REUSE-CANDIDATE (verificar UC/DTO) |
| 49 | `adminUpdateProduct` | `PATCH /admin/events/{eventId}/products/{productId}` | REUSE-CANDIDATE (verificar UC/DTO) |
| 50 | `adminListFinancialConfigurations` | `GET /admin/events/{eventId}/financial-configurations` | REUSE-CANDIDATE (verificar UC/DTO) |
| 51 | `adminCreateFinancialConfigurationDraft` | `POST /admin/events/{eventId}/financial-configurations` | REUSE-CANDIDATE (verificar UC/DTO) |
| 52 | `adminUpdateFinancialConfigurationDraft` | `PUT /admin/financial-configurations/{configurationId}` | REUSE-CANDIDATE (verificar UC/DTO) |
| 53 | `adminPublishFinancialConfiguration` | `POST /admin/financial-configurations/{configurationId}/publish` | REUSE-CANDIDATE (verificar UC/DTO) |
| 54 | `adminGetFinancialMilestones` | `GET /admin/events/{eventId}/financial-milestones` | REUSE-CANDIDATE (verificar UC/DTO) |
| 55 | `adminReplaceFinancialMilestones` | `PUT /admin/events/{eventId}/financial-milestones` | REUSE-CANDIDATE (verificar UC/DTO) |
| 56 | `adminGetLatePaymentPolicy` | `GET /admin/events/{eventId}/late-payment-policy` | REVIEW (finanzas/contrato) |
| 57 | `adminUpdateLatePaymentPolicy` | `PATCH /admin/events/{eventId}/late-payment-policy` | REVIEW (finanzas/contrato) |
| 58 | `adminListThermoConfigurations` | `GET /admin/events/{eventId}/thermo-configurations` | REUSE-CANDIDATE (verificar UC/DTO) |
| 59 | `adminCreateThermoConfigurationDraft` | `POST /admin/events/{eventId}/thermo-configurations` | REUSE-CANDIDATE (verificar UC/DTO) |
| 60 | `adminUpdateThermoConfigurationDraft` | `PUT /admin/thermo-configurations/{configurationId}` | REUSE-CANDIDATE (verificar UC/DTO) |
| 61 | `adminPublishThermoConfiguration` | `POST /admin/thermo-configurations/{configurationId}/publish` | REUSE-CANDIDATE (verificar UC/DTO) |
| 62 | `adminListMealOptions` | `GET /admin/events/{eventId}/meal-options` | REUSE-CANDIDATE (verificar UC/DTO) |
| 63 | `adminCreateMealOption` | `POST /admin/events/{eventId}/meal-options` | REUSE-CANDIDATE (verificar UC/DTO) |
| 64 | `adminUpdateMealOption` | `PATCH /admin/events/{eventId}/meal-options/{mealOptionId}` | REUSE-CANDIDATE (verificar UC/DTO) |
| 65 | `adminListCancellationPolicies` | `GET /admin/events/{eventId}/cancellation-policies` | REUSE-CANDIDATE (verificar UC/DTO) |
| 66 | `adminCreateCancellationPolicyDraft` | `POST /admin/events/{eventId}/cancellation-policies` | REUSE-CANDIDATE (verificar UC/DTO) |
| 67 | `adminReplaceCancellationPolicyRanges` | `PUT /admin/cancellation-policies/{policyId}/ranges` | REUSE-CANDIDATE (verificar UC/DTO) |
| 68 | `adminValidateCancellationPolicy` | `POST /admin/cancellation-policies/{policyId}/validate` | REUSE-CANDIDATE (verificar UC/DTO) |
| 69 | `adminPublishCancellationPolicy` | `POST /admin/cancellation-policies/{policyId}/publish` | REUSE-CANDIDATE (verificar UC/DTO) |
| 70 | `adminListGraduates` | `GET /admin/events/{eventId}/graduates` | REUSE-CANDIDATE (verificar UC/DTO) |
| 71 | `adminGetGraduate` | `GET /admin/events/{eventId}/graduates/{membershipId}` | REUSE-CANDIDATE (verificar UC/DTO) |
| 72 | `adminGetGraduateContract` | `GET /admin/events/{eventId}/graduates/{membershipId}/contract` | REUSE-CANDIDATE (verificar UC/DTO) |
| 73 | `adminReduceMembershipPlaces` | `PATCH /admin/events/{eventId}/graduates/{membershipId}/places` | REUSE-CANDIDATE (verificar UC/DTO) |
| 74 | `adminListInternalNotes` | `GET /admin/events/{eventId}/graduates/{membershipId}/notes` | REUSE-CANDIDATE (verificar UC/DTO) |
| 75 | `adminCreateInternalNote` | `POST /admin/events/{eventId}/graduates/{membershipId}/notes` | REUSE-CANDIDATE (verificar UC/DTO) |
| 76 | `adminQuoteMembershipCancellation` | `POST /admin/events/{eventId}/graduates/{membershipId}/cancellation-quote` | REUSE-CANDIDATE (verificar UC/DTO) |
| 77 | `adminCancelMembership` | `POST /admin/events/{eventId}/graduates/{membershipId}/cancel` | REUSE-CANDIDATE (verificar UC/DTO) |
| 78 | `adminGetEventPortfolio` | `GET /admin/events/{eventId}/portfolio` | REUSE-CANDIDATE (verificar UC/DTO) |
| 79 | `adminGetGraduatePaymentPlan` | `GET /admin/events/{eventId}/graduates/{membershipId}/payment-plan` | REVIEW (finanzas/contrato) |
| 80 | `adminListPaymentTransactions` | `GET /admin/events/{eventId}/payment-transactions` | REVIEW (finanzas/contrato) |
| 81 | `adminCreateManualPayment` | `POST /admin/events/{eventId}/graduates/{membershipId}/payments/manual` | HARDEN (ledger+idempotencia) |
| 82 | `adminListPaymentSubmissions` | `GET /admin/payment-submissions` | REVIEW (finanzas/contrato) |
| 83 | `adminGetPaymentSubmission` | `GET /admin/payment-submissions/{submissionId}` | REVIEW (finanzas/contrato) |
| 84 | `adminApprovePaymentSubmission` | `POST /admin/payment-submissions/{submissionId}/approve` | HARDEN (una aprobación efectiva) |
| 85 | `adminRejectPaymentSubmission` | `POST /admin/payment-submissions/{submissionId}/reject` | REVIEW (finanzas/contrato) |
| 86 | `adminCreateAdjustment` | `POST /admin/payment-plans/{planId}/adjustments` | REVIEW (finanzas/contrato) |
| 87 | `adminCreateRefund` | `POST /admin/payment-plans/{planId}/refunds` | HARDEN (ledger append-only) |
| 88 | `adminListRefunds` | `GET /admin/events/{eventId}/refunds` | REVIEW (finanzas/contrato) |
| 89 | `adminListReconciliationCases` | `GET /admin/reconciliation-cases` | REVIEW (finanzas/contrato) |
| 90 | `adminResolveReconciliationCase` | `POST /admin/reconciliation-cases/{caseId}/resolve` | REVIEW (finanzas/contrato) |
| 91 | `adminGetSeatingMap` | `GET /admin/events/{eventId}/seating-map` | ADAPT (visor/croquis precargado) |
| 92 | `adminUpdateSeatingMap` | `PUT /admin/events/{eventId}/seating-map` | DEPRECATE (edición dinámica) |
| 93 | `adminUploadSeatingBackground` | `POST /admin/events/{eventId}/seating-map/background` | DEPRECATE (upload plano) |
| 94 | `adminRemoveSeatingBackground` | `DELETE /admin/events/{eventId}/seating-map/background` | DEPRECATE (upload plano) |
| 95 | `adminCreateTable` | `POST /admin/events/{eventId}/tables` | DEPRECATE (crear geometría) |
| 96 | `adminBulkCreateTables` | `POST /admin/events/{eventId}/tables/bulk` | DEPRECATE (crear geometría) |
| 97 | `adminImportDetectedTables` | `POST /admin/events/{eventId}/tables/import` | DEPRECATE (OCR/import) |
| 98 | `adminGetTable` | `GET /admin/events/{eventId}/tables/{tableId}` | REUSE-CANDIDATE (verificar UC/DTO) |
| 99 | `adminUpdateTable` | `PATCH /admin/events/{eventId}/tables/{tableId}` | RESTRICT (no cambiar geometría; reglas GR) |
| 100 | `adminDeleteTable` | `DELETE /admin/events/{eventId}/tables/{tableId}` | DEPRECATE (borrar mesa estructural) |
| 101 | `adminBlockTable` | `POST /admin/events/{eventId}/tables/{tableId}/block` | REUSE-CANDIDATE (verificar UC/DTO) |
| 102 | `adminUnblockTable` | `POST /admin/events/{eventId}/tables/{tableId}/unblock` | REUSE-CANDIDATE (verificar UC/DTO) |
| 103 | `adminAssignTableMembers` | `PUT /admin/events/{eventId}/graduates/{membershipId}/table-assignments` | ADAPT (nominal histórico; agrupar por cantidades) |
| 104 | `adminGetEventMeals` | `GET /admin/events/{eventId}/meals` | REUSE-CANDIDATE (verificar UC/DTO) |
| 105 | `adminGetGraduateMeals` | `GET /admin/events/{eventId}/graduates/{membershipId}/meals` | REUSE-CANDIDATE (verificar UC/DTO) |
| 106 | `adminSetMealSelection` | `PUT /admin/events/{eventId}/group-members/{memberId}/meal-selection` | REUSE-CANDIDATE (verificar UC/DTO) |
| 107 | `adminListThermos` | `GET /admin/events/{eventId}/thermos` | REUSE-CANDIDATE (verificar UC/DTO) |
| 108 | `adminGetThermo` | `GET /admin/events/{eventId}/thermos/{thermoId}` | REUSE-CANDIDATE (verificar UC/DTO) |
| 109 | `adminTransitionThermo` | `POST /admin/events/{eventId}/thermos/{thermoId}/transitions` | REUSE-CANDIDATE (verificar UC/DTO) |
| 110 | `adminDeliverThermo` | `POST /admin/events/{eventId}/thermos/{thermoId}/delivery` | REUSE-CANDIDATE (verificar UC/DTO) |
| 111 | `adminGetOperationalReport` | `GET /admin/events/{eventId}/reports/operational` | REUSE-CANDIDATE (verificar UC/DTO) |
| 112 | `adminGetFinancialReport` | `GET /admin/events/{eventId}/reports/financial` | REUSE-CANDIDATE (verificar UC/DTO) |
| 113 | `adminGetPortfolioReport` | `GET /admin/events/{eventId}/reports/portfolio` | REUSE-CANDIDATE (verificar UC/DTO) |
| 114 | `adminGetPaymentsReport` | `GET /admin/events/{eventId}/reports/payments` | REVIEW (finanzas/contrato) |
| 115 | `adminGetPaymentSubmissionsReport` | `GET /admin/events/{eventId}/reports/payment-submissions` | REVIEW (finanzas/contrato) |
| 116 | `adminGetTablesReport` | `GET /admin/events/{eventId}/reports/tables` | REUSE-CANDIDATE (verificar UC/DTO) |
| 117 | `adminGetMealsReport` | `GET /admin/events/{eventId}/reports/meals` | REUSE-CANDIDATE (verificar UC/DTO) |
| 118 | `adminGetThermosReport` | `GET /admin/events/{eventId}/reports/thermos` | REUSE-CANDIDATE (verificar UC/DTO) |
| 119 | `adminGetCashCutsReport` | `GET /admin/events/{eventId}/reports/cash-cuts` | REUSE-CANDIDATE (verificar UC/DTO) |
| 120 | `adminCreateExport` | `POST /admin/events/{eventId}/exports` | REUSE-CANDIDATE (verificar UC/DTO) |
| 121 | `adminGetExport` | `GET /admin/exports/{exportId}` | REUSE-CANDIDATE (verificar UC/DTO) |
| 122 | `adminGetExportDownload` | `GET /admin/exports/{exportId}/download` | REUSE-CANDIDATE (verificar UC/DTO) |
| 123 | `adminListAudit` | `GET /admin/audit` | REUSE-CANDIDATE (verificar UC/DTO) |
| 124 | `adminListAccounts` | `GET /admin/accounts` | REUSE-CANDIDATE (verificar UC/DTO) |
| 125 | `adminCreateAdminAccount` | `POST /admin/accounts` | REUSE-CANDIDATE (verificar UC/DTO) |
| 126 | `adminDisableAccount` | `POST /admin/accounts/{accountId}/disable` | REUSE-CANDIDATE (verificar UC/DTO) |
| 127 | `adminUploadFile` | `POST /admin/files` | REUSE-CANDIDATE (verificar UC/DTO) |
| 128 | `webhookMercadoPago` | `POST /webhooks/mercado-pago` | HARDEN (verificar firma+dedup) |
| 129 | `webhookOpenPay` | `POST /webhooks/openpay` | HARDEN (verificar firma+dedup) |

## Resultado del filtrado

- ADAPT: 9 operaciones
- REVIEW: 24 operaciones
- HARDEN: 9 operaciones
- REUSE-CANDIDATE: 78 operaciones
- BLOCKED: 1 operaciones
- DEPRECATE: 7 operaciones
- RESTRICT: 1 operaciones

Ninguna disposición `REUSE-CANDIDATE` constituye autorización automática de publicar la ruta. El controlador/DTO de GR definitivo se fijará cuando G2 OpenAPI/CEO/seguridad se satisfagan. Los endpoints `DEPRECATE` deben tener tests que impidan su reaparición inadvertida.

## P0 de reconciliación

1. Resolver correctamente DRAFT en código de evento, textos legales íntegros, multi-evento seguro y refresh.
2. Sustituir contrato nominal histórico de mesa por agrupación conforme GR, sin motor de acomodo ni IDs individuales en GR.
3. Mantener GR finances como ledger único e integrar Monkavia sólo por outbox/versiones/HMAC.
4. No publicar OCR/editor/mesas dinámicas, y preservar el catálogo precargado.
5. La capa API privada Monkavia V2.1 es diseño sin despliegue; no documentar como endpoint productivo.
