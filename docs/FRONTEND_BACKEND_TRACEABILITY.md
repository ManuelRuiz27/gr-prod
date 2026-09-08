# Plataforma GR — Matriz de Trazabilidad Frontend ↔ Backend

**Documento:** FRONTEND_BACKEND_TRACEABILITY.md  
**Versión:** 1.0  
**Fecha:** 8 de septiembre de 2026  
**Estado:** BASELINE DE INTEGRACIÓN CONTRACT-FIRST  
**Fuentes:** frontend/src/App.tsx, docs/API_ENDPOINT_MATRIX.md, docs/API_CONTRACT.openapi.yaml

---

## 1. Convenciones de Estado

- IMPLEMENTED: Acción productiva conectada o con adapter HTTP correspondiente y use case en backend.
- DEFER_EXPLICIT: Capacidad de dominio o de sistema deliberadamente no expuesta en la navegación MVP oficial (ej. lectura de notificaciones in-app).
- NO_CONTRACT_LEGACY: Rutas previas no oficiales sustituidas por el baseline actual (ej. /dashboard, /layout).

---

## 2. Inventario de Rutas Oficiales y Acciones

| Ruta Frontend | Acción de Usuario / Evento | operationId Canónico | Método / Path | Backend Use Case | Estado |
|---|---|---|---|---|---|
| /access | Validar código de acceso al evento | authResolveEventAccess | POST /auth/event-access/resolve | ResolveEventAccess | IMPLEMENTED |
| /login | Iniciar sesión de graduado | authLogin | POST /auth/login | Login | IMPLEMENTED |
| /admin/login | Iniciar sesión de administrador | authLogin | POST /auth/login | Login | IMPLEMENTED |
| /register | Registrar graduado con token de acceso | authRegisterGraduate | POST /auth/graduate/register | RegisterGraduate | IMPLEMENTED |
| /forgot-password | Solicitar restablecimiento de contraseña | authRequestPasswordReset | POST /auth/password-reset/request | RequestPasswordReset | IMPLEMENTED |
| /forgot-password (token) | Confirmar nueva contraseña | authConfirmPasswordReset | POST /auth/password-reset/confirm | ConfirmPasswordReset | IMPLEMENTED |
| /forgot-password/sent | Pantalla de confirmación informativa | — | — | N/A (UI state only) | IMPLEMENTED |
| /graduate/events | Consultar lista de eventos del graduado | graduateListEvents | GET /me/events | ListGraduateEvents | IMPLEMENTED |
| /graduate | Visualizar resumen de graduación (Home) | graduateGetEventSummary | GET /me/events/{eventId}/summary | GetGraduateEventSummary | IMPLEMENTED |
| /graduate/group | Consultar integrantes y lugares contratados | graduateGetGroup | GET /me/events/{eventId}/group | GetGroup | IMPLEMENTED |
| /graduate/group | Agregar integrante nominal | graduateAddGroupMember | POST /me/events/{eventId}/group-members | AddGroupMember | IMPLEMENTED |
| /graduate/group | Actualizar nombre de integrante | graduateUpdateGroupMember | PATCH /me/events/{eventId}/group-members/{memberId} | UpdateGroupMember | IMPLEMENTED |
| /graduate/group | Consultar catálogo de productos adicionales | graduateListAvailableProducts | GET /me/events/{eventId}/products | ListAvailableProducts | IMPLEMENTED |
| /graduate/group | Cotizar compra de lugar adicional (catch-up) | graduateQuoteContractLineItem | POST /me/events/{eventId}/contract-line-items/quote | QuoteContractLineItem | IMPLEMENTED |
| /graduate/group | Confirmar compra de lugar adicional | graduateConfirmContractLineItem | POST /me/events/{eventId}/contract-line-items | ConfirmContractLineItem | IMPLEMENTED |
| /graduate/payments | Consultar estado de cuenta y parcialidades | graduateGetPaymentPlan | GET /me/events/{eventId}/payment-plan | GetPaymentPlan | IMPLEMENTED |
| /graduate/payments | Iniciar intento de pago electrónico | graduateCreatePaymentAttempt | POST /me/events/{eventId}/payment-attempts | CreatePaymentAttempt | IMPLEMENTED |
| /graduate/payments | Consultar estado de intento de pago | graduateGetPaymentAttempt | GET /me/events/{eventId}/payment-attempts/{attemptId} | GetPaymentAttempt | IMPLEMENTED |
| /graduate/payments | Cargar comprobante de pago (evidencia) | graduateUploadPaymentEvidence | POST /me/files/payment-evidence | UploadPaymentEvidence | IMPLEMENTED |
| /graduate/payments | Reportar comprobante de pago | graduateCreatePaymentSubmission | POST /me/events/{eventId}/payment-submissions | CreatePaymentSubmission | IMPLEMENTED |
| /graduate/payments | Listar comprobantes propios | graduateListPaymentSubmissions | GET /me/events/{eventId}/payment-submissions | ListPaymentSubmissions | IMPLEMENTED |
| /graduate/payments | Consultar detalle de comprobante propio | graduateGetPaymentSubmission | GET /me/events/{eventId}/payment-submissions/{submissionId} | GetPaymentSubmission | IMPLEMENTED |
| /graduate/contract | Consultar contrato vigente y términos | graduateGetContract | GET /me/events/{eventId}/contract | GetContract | IMPLEMENTED |
| /graduate/contract | Aceptar contrato formalmente | graduateAcceptContract | POST /me/events/{eventId}/contract/accept | AcceptContract | IMPLEMENTED |
| /graduate/table | Consultar croquis seguro del evento | graduateGetSeatingMap | GET /me/events/{eventId}/seating-map | GetSeatingMap | IMPLEMENTED |
| /graduate/table | Consultar asignaciones propias de mesa | graduateGetTableAssignments | GET /me/events/{eventId}/table-assignments | GetTableAssignments | IMPLEMENTED |
| /graduate/table | Asignar/cambiar integrantes a mesa | graduateAssignTableMembers | PUT /me/events/{eventId}/table-assignments | AssignTableMembers | IMPLEMENTED |
| /graduate/meals | Consultar opciones de platillos y selecciones | graduateGetMeals | GET /me/events/{eventId}/meals | GetMeals | IMPLEMENTED |
| /graduate/meals | Seleccionar platillo por integrante | graduateSetMealSelection | PUT /me/events/{eventId}/group-members/{memberId}/meal-selection | SetMealSelection | IMPLEMENTED |
| /graduate/thermo | Consultar estado/elegibilidad del termo | graduateGetThermo | GET /me/events/{eventId}/thermo | GetThermo | IMPLEMENTED |
| /graduate/thermo | Solicitar termo personalizado | graduateRequestThermo | POST /me/events/{eventId}/thermo/request | RequestThermo | IMPLEMENTED |
| /graduate/thermo | Actualizar personalización de termo | graduateUpdateThermoPersonalization | PATCH /me/events/{eventId}/thermo | UpdateThermoPersonalization | IMPLEMENTED |
| /graduate/more | Consultar perfil propio | graduateGetProfile | GET /me/profile | GetProfile | IMPLEMENTED |
| /graduate/more | Actualizar datos permitidos de perfil | graduateUpdateProfile | PATCH /me/profile | UpdateProfile | IMPLEMENTED |
| /graduate/more | Cerrar sesión | authLogout | POST /auth/logout | Logout | IMPLEMENTED |
| /admin | Consultar métricas de plataforma | adminGetDashboard | GET /admin/dashboard | GetAdminDashboard | IMPLEMENTED |
| /admin/events | Listar eventos | adminListEvents | GET /admin/events | ListEvents | IMPLEMENTED |
| /admin/events/new | Crear nuevo evento completo (wizard) | adminCreateEvent | POST /admin/events | CreateEvent | IMPLEMENTED |
| /admin/events/:eventId | Consultar detalle de evento | adminGetEvent | GET /admin/events/{eventId} | GetEvent | IMPLEMENTED |
| /admin/events/:eventId | Consultar resumen operacional de evento | adminGetEventSummary | GET /admin/events/{eventId}/summary | GetEventSummary | IMPLEMENTED |
| /admin/events/:eventId | Transicionar estado del evento | adminTransitionEvent | POST /admin/events/{eventId}/transitions | TransitionEvent | IMPLEMENTED |
| /admin/events/:eventId/graduates | Listar graduados del evento | adminListGraduates | GET /admin/events/{eventId}/graduates | ListGraduates | IMPLEMENTED |
| /admin/events/:eventId/graduates/:id | Consultar expediente consolidado | adminGetGraduate | GET /admin/events/{eventId}/graduates/{membershipId} | GetGraduate | IMPLEMENTED |
| /admin/events/:eventId/graduates/:id | Consultar contrato de graduado | adminGetGraduateContract | GET /admin/events/{eventId}/graduates/{membershipId}/contract | GetGraduateContract | IMPLEMENTED |
| /admin/events/:eventId/graduates/:id | Reducir lugares de membresía | adminReduceMembershipPlaces | PATCH /admin/events/{eventId}/graduates/{membershipId}/places | ReduceMembershipPlaces | IMPLEMENTED |
| /admin/events/:eventId/graduates/:id | Listar notas internas | adminListInternalNotes | GET /admin/events/{eventId}/graduates/{membershipId}/notes | ListInternalNotes | IMPLEMENTED |
| /admin/events/:eventId/graduates/:id | Registrar nota interna | adminCreateInternalNote | POST /admin/events/{eventId}/graduates/{membershipId}/notes | CreateInternalNote | IMPLEMENTED |
| /admin/events/:eventId/graduates/:id | Cotizar cancelación de membresía | adminQuoteMembershipCancellation | POST /admin/events/{eventId}/graduates/{membershipId}/cancellation-quote | QuoteCancellation | IMPLEMENTED |
| /admin/events/:eventId/graduates/:id | Confirmar cancelación de membresía | adminCancelMembership | POST /admin/events/{eventId}/graduates/{membershipId}/cancel | CancelMembership | IMPLEMENTED |
| /admin/events/:eventId/payments | Consultar cartera de pagos del evento | adminGetEventPortfolio | GET /admin/events/{eventId}/portfolio | GetEventPortfolio | IMPLEMENTED |
| /admin/events/:eventId/payments | Listar movimientos / transacciones | adminListPaymentTransactions | GET /admin/events/{eventId}/payment-transactions | ListPaymentTransactions | IMPLEMENTED |
| /admin/events/:eventId/payments | Registrar pago administrativo (CASH/etc) | adminCreateManualPayment | POST /admin/events/{eventId}/graduates/{membershipId}/payments/manual | CreateManualPayment | IMPLEMENTED |
| /admin/events/:eventId/payments | Listar comprobantes por revisar | adminListPaymentSubmissions | GET /admin/payment-submissions | ListPaymentSubmissions | IMPLEMENTED |
| /admin/events/:eventId/payments | Aprobar comprobante de pago | adminApprovePaymentSubmission | POST /admin/payment-submissions/{submissionId}/approve | ApprovePaymentSubmission | IMPLEMENTED |
| /admin/events/:eventId/payments | Rechazar comprobante de pago | adminRejectPaymentSubmission | POST /admin/payment-submissions/{submissionId}/reject | RejectPaymentSubmission | IMPLEMENTED |
| /admin/events/:eventId/payments | Registrar ajuste a plan de pagos | adminCreateAdjustment | POST /admin/payment-plans/{planId}/adjustments | CreateAdjustment | IMPLEMENTED |
| /admin/events/:eventId/payments | Crear orden de reembolso | adminCreateRefund | POST /admin/payment-plans/{planId}/refunds | CreateRefund | IMPLEMENTED |
| /admin/events/:eventId/payments | Listar reembolsos del evento | adminListRefunds | GET /admin/events/{eventId}/refunds | ListRefunds | IMPLEMENTED |
| /admin/events/:eventId/tables | Consultar croquis de administración | adminGetSeatingMap | GET /admin/events/{eventId}/seating-map | GetAdminSeatingMap | IMPLEMENTED |
| /admin/events/:eventId/tables | Actualizar metadata del croquis | adminUpdateSeatingMap | PUT /admin/events/{eventId}/seating-map | UpdateSeatingMap | IMPLEMENTED |
| /admin/events/:eventId/tables | Cargar fondo del croquis | adminUploadSeatingBackground | POST /admin/events/{eventId}/seating-map/background | UploadSeatingBackground | IMPLEMENTED |
| /admin/events/:eventId/tables | Eliminar fondo del croquis | adminRemoveSeatingBackground | DELETE /admin/events/{eventId}/seating-map/background | RemoveSeatingBackground | IMPLEMENTED |
| /admin/events/:eventId/tables | Crear mesa individual | adminCreateTable | POST /admin/events/{eventId}/tables | CreateTable | IMPLEMENTED |
| /admin/events/:eventId/tables | Crear múltiples mesas | adminBulkCreateTables | POST /admin/events/{eventId}/tables/bulk | BulkCreateTables | IMPLEMENTED |
| /admin/events/:eventId/tables | Importar mesas detectadas por CV/OCR | adminImportDetectedTables | POST /admin/events/{eventId}/tables/import | ImportDetectedTables | IMPLEMENTED |
| /admin/events/:eventId/tables | Modificar mesa (geometría/capacidad) | adminUpdateTable | PATCH /admin/events/{eventId}/tables/{tableId} | UpdateTable | IMPLEMENTED |
| /admin/events/:eventId/tables | Bloquear mesa | adminBlockTable | POST /admin/events/{eventId}/tables/{tableId}/block | BlockTable | IMPLEMENTED |
| /admin/events/:eventId/tables | Desbloquear mesa | adminUnblockTable | POST /admin/events/{eventId}/tables/{tableId}/unblock | UnblockTable | IMPLEMENTED |
| /admin/events/:eventId/tables | Eliminar mesa no ocupada | adminDeleteTable | DELETE /admin/events/{eventId}/tables/{tableId} | DeleteTable | IMPLEMENTED |
| /admin/events/:eventId/tables | Asignar integrante por administración | adminAssignTableMembers | PUT /admin/events/{eventId}/graduates/{membershipId}/table-assignments | AdminAssignTableMembers | IMPLEMENTED |
| /admin/events/:eventId/meals | Consultar reporte de platillos | adminGetEventMeals | GET /admin/events/{eventId}/meals | GetEventMeals | IMPLEMENTED |
| /admin/events/:eventId/meals | Override administrativo de platillo | adminSetMealSelection | PUT /admin/events/{eventId}/group-members/{memberId}/meal-selection | AdminSetMealSelection | IMPLEMENTED |
| /admin/events/:eventId/meals | Listar catálogo de platillos | adminListMealOptions | GET /admin/events/{eventId}/meal-options | ListMealOptions | IMPLEMENTED |
| /admin/events/:eventId/meals | Crear opción de platillo | adminCreateMealOption | POST /admin/events/{eventId}/meal-options | CreateMealOption | IMPLEMENTED |
| /admin/events/:eventId/meals | Actualizar opción de platillo | adminUpdateMealOption | PATCH /admin/events/{eventId}/meal-options/{mealOptionId} | UpdateMealOption | IMPLEMENTED |
| /admin/events/:eventId/thermos | Listar estado de termos | adminListThermos | GET /admin/events/{eventId}/thermos | ListThermos | IMPLEMENTED |
| /admin/events/:eventId/thermos | Consultar detalle de termo | adminGetThermo | GET /admin/events/{eventId}/thermos/{thermoId} | GetThermo | IMPLEMENTED |
| /admin/events/:eventId/thermos | Iniciar producción de termo | adminTransitionThermo | POST /admin/events/{eventId}/thermos/{thermoId}/transitions | TransitionThermo | IMPLEMENTED |
| /admin/events/:eventId/thermos | Registrar entrega de termo | adminDeliverThermo | POST /admin/events/{eventId}/thermos/{thermoId}/delivery | DeliverThermo | IMPLEMENTED |
| /admin/events/:eventId/reports | Consultar reporte operativo general | adminGetOperationalReport | GET /admin/events/{eventId}/reports/operational | GetOperationalReport | IMPLEMENTED |
| /admin/events/:eventId/reports | Consultar reporte financiero | adminGetFinancialReport | GET /admin/events/{eventId}/reports/financial | GetFinancialReport | IMPLEMENTED |
| /admin/events/:eventId/reports | Consultar cortes de caja | adminGetCashCutsReport | GET /admin/events/{eventId}/reports/cash-cuts | GetCashCutsReport | IMPLEMENTED |
| /admin/events/:eventId/reports | Solicitar exportación asíncrona | adminCreateExport | POST /admin/events/{eventId}/exports | CreateExport | IMPLEMENTED |
| /admin/events/:eventId/settings | Actualizar datos generales de evento | adminUpdateEvent | PATCH /admin/events/{eventId} | UpdateEvent | IMPLEMENTED |
| /admin/events/:eventId/settings | Consultar estado del código de acceso | adminGetEventAccessCodeStatus | GET /admin/events/{eventId}/access-code | GetAccessCodeStatus | IMPLEMENTED |
| /admin/events/:eventId/settings | Rotar código de acceso al evento | adminRotateEventAccessCode | POST /admin/events/{eventId}/access-code/rotate | RotateAccessCode | IMPLEMENTED |
| /admin/events/:eventId/settings | Listar productos del evento | adminListProducts | GET /admin/events/{eventId}/products | ListProducts | IMPLEMENTED |
| /admin/events/:eventId/settings | Crear producto en evento | adminCreateProduct | POST /admin/events/{eventId}/products | CreateProduct | IMPLEMENTED |
| /admin/events/:eventId/settings | Actualizar producto | adminUpdateProduct | PATCH /admin/events/{eventId}/products/{productId} | UpdateProduct | IMPLEMENTED |
| /admin/events/:eventId/settings | Listar versiones de política cancelación | adminListCancellationPolicies | GET /admin/events/{eventId}/cancellation-policies | ListCancellationPolicies | IMPLEMENTED |
| /admin/events/:eventId/settings | Crear borrador de política cancelación | adminCreateCancellationPolicyDraft | POST /admin/events/{eventId}/cancellation-policies | CreateCancellationDraft | IMPLEMENTED |
| /admin/events/:eventId/settings | Guardar rangos de política cancelación | adminReplaceCancellationPolicyRanges | PUT /admin/cancellation-policies/{policyId}/ranges | ReplaceCancellationRanges | IMPLEMENTED |
| /admin/events/:eventId/settings | Validar política de cancelación | adminValidateCancellationPolicy | POST /admin/cancellation-policies/{policyId}/validate | ValidateCancellationPolicy | IMPLEMENTED |
| /admin/events/:eventId/settings | Publicar política de cancelación | adminPublishCancellationPolicy | POST /admin/cancellation-policies/{policyId}/publish | PublishCancellationPolicy | IMPLEMENTED |
| /admin/events/:eventId/audit | Consultar auditoría del evento | adminListAudit | GET /admin/audit | ListAudit | IMPLEMENTED |
| /dashboard | Ruta legacy de prueba | — | — | — | NO_CONTRACT_LEGACY |
| /layout | Ruta legacy de croquis inicial | — | — | — | NO_CONTRACT_LEGACY |
| /meals | Ruta legacy de platillos | — | — | — | NO_CONTRACT_LEGACY |
| /payments | Ruta legacy de pagos | — | — | — | NO_CONTRACT_LEGACY |
| /thermo | Ruta legacy de termo | — | — | — | NO_CONTRACT_LEGACY |
| /summary | Ruta legacy de resumen | — | — | — | NO_CONTRACT_LEGACY |

---

## 3. Estado de Cumplimiento

- **Total de acciones auditadas:** 102
- **Acciones IMPLEMENTED:** 95
- **Acciones DEFER_EXPLICIT:** 1 (Notificaciones in-app diferidas)
- **Rutas NO_CONTRACT_LEGACY:** 6
- **TODOs silenciosos restantes:** 0
- **Fallbacks silenciosos a mocks:** 0
