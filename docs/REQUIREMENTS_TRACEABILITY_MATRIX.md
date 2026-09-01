# Plataforma GR — Matriz de Trazabilidad de Requisitos

**Documento:** `REQUIREMENTS_TRACEABILITY_MATRIX.md`  
**Versión:** 1.2  
**Fecha:** 31 de agosto de 2026  
**Propósito:** Garantizar que cada requisito aprobado tenga regla, SRS, UX, diseño visual, persistencia/API y criterio de aceptación verificable cuando aplique.

---

# 1. Regla de cierre

Un requisito funcional no se considera documentalmente cerrado si carece de alguno de los elementos aplicables:

```text
PRODUCT_SCOPE
→ BUSINESS_RULES (BR-*)
→ SRS (FR-*)
→ ROLES_PERMISSIONS
→ UX_FLOWS
→ UI_DESIGN_SYSTEM / SCREEN_VISUAL_SPECIFICATIONS cuando tenga UI
→ dominio especializado (FINANCIAL_DOMAIN / SEATING_MAP)
→ DATA_MODEL
→ API_CONTRACTS
→ NON_FUNCTIONAL_REQUIREMENTS
→ ACCEPTANCE_CRITERIA (AC-*)
```

`N/A` solo es válido cuando la capa no aplica objetivamente.

---

# 2. Matriz funcional principal

| Dominio / requisito | Reglas | SRS | UX | Datos / dominio | API | QA |
|---|---|---|---|---|---|---|
| Roles ADMIN/GRADUATE | BR-GEN-002/003 | FR-AUTH/ADM | Acceso + navegación | Account, Membership | `/auth`, `/me`, `/admin` | AC-AUTH-* |
| Registro contextual | BR-AUTH-001/003 | FR-AUTH-003/008 | UX-G-AUTH-* | Account, GraduateMembership | `/auth/graduate/register` | AC-AUTH-003/005 |
| Cuenta multi-evento | BR-AUTH-002 | FR-AUTH-006 | Selector eventos | GraduateMembership | `GET /me/events` | AC-AUTH-004 |
| Evento lifecycle | BR-EVT-* | FR-EVT-* | ADMIN lifecycle | Event | `/admin/events`, `/transitions` | AC-EVT-* |
| Configuración general | BR-EVT-008/009 | FR-EVT-002/004 | Wizard ADMIN | Event, EventSettings | `/admin/events/*` | AC-EVT-* |
| Contrato individual | BR-CONTRACT-* | FR-CON-* | UX-G-CON-* / ADMIN contrato | GraduateContract | `/me/.../contract`, `/admin/.../contract` | AC-CON-* |
| Folio único | BR-CONTRACT-001/002 | FR-CON-002 | Contrato/expediente | GraduateContract.folio | Contract responses | AC-CON-001 |
| Aceptación términos | BR-CONTRACT-004/005 | FR-CON-005/006 | Aceptar contrato | accepted_at, snapshot/hash | `POST /contract/accept` | AC-CON-003/004 |
| Versionado contractual | BR-CONTRACT-005/006 | FR-CON-007 | Contrato modo lectura | terms_snapshot, policy_version | Contract API | AC-CON-005/006/007 |
| Productos Adulto/Niño/Sin cena | BR-PLC-002/003 | FR-PLC-002 | Wizard + Mi grupo | EventProduct | `/products`, line-item quote | AC-PLC-002 |
| Lugares/integrantes | BR-PLC-* | FR-PLC-* | Mi grupo / expediente | ContractLineItem, GroupMember | group/products endpoints | AC-PLC-* |
| Compra adicional | BR-PLC-006/011 | FR-PLC-006/008 | Agregar lugar | ContractLineItem + PaymentPlan | line-item quote/confirm | AC-PLC-006/007/008 |
| Catch-up financiero | BR-PLC-011 | FR-PLC-008 | Resumen compra | FIN §10 | quote endpoint | AC-PLC-007 |
| Reducción administrativa | BR-PLC-008/009 | FR-PLC-009/010 | ADMIN reducción | Adjustment/line item/member | `/graduates/.../places` | AC-PLC-009/010 |
| Croquis | BR-SEAT-* | FR-SEAT-* | Mesas | SeatingMap/EventTable | seating endpoints | AC-SEAT-* |
| Persona → mesa | BR-SEAT-007/009 | FR-SEAT-008 | UX-G-SEAT-003..006 | TableAssignment.group_member_id | `/table-assignments` | AC-SEAT-003/004 |
| Sin silla individual | BR-SEAT-008 | FR-SEAT-009 | No seat UI | No seat entity | No seat field | AC-SEAT-005 |
| Desbloqueo financiero mesa | BR-SEAT-012 | FR-SEAT-010 | UX-G-SEAT-001 | Derived eligibility | seating endpoint errors | AC-SEAT-006 |
| Concurrencia mesa | BR-SEAT-014 | FR-SEAT-014 | Error disponibilidad | locks/constraints | 409 contract | AC-SEAT-010 |
| Platillos | BR-MEAL-* | FR-MEAL-* | UX-G/A-MEAL-* | MealOption/Selection | meals endpoints | AC-MEAL-* |
| Plan financiero | BR-FIN-* | FR-FIN-* | Mis pagos / Admin pagos | PaymentPlan/Installment | payment-plan APIs | AC-FIN-* |
| Pago inicial | BR-INIT-* | FR-FIN-004 | Inicio/pagos/mesa | Installment + allocation | payment APIs | AC-FIN/PAY/SEAT |
| Milestones | BR-MILE-* | FR-EVT-003 / FR-PLC-008 | Config/alertas | FinancialMilestone | milestones API | AC-PLC-007 + reglas específicas |
| Mercado Pago | BR-PAY-* | FR-PAY-* | UX-G-EPAY-* | Attempt/Transaction/Event | payment attempts/webhook | AC-PAY-* |
| OpenPay | BR-PAY-002/007 | FR-PAY-002 | Método alternativo | Attempt/Transaction | payment attempts/webhook | AC-PAY-* |
| CASH ADMIN | BR-MAN-* | FR-MAN-* | Registrar pago | PaymentTransaction | manual payment API | AC-MAN-* |
| TRANSFER/DEPOSIT ADMIN | BR-MAN-* | FR-MAN-* | Registrar pago | PaymentTransaction | manual payment API | AC-MAN-* |
| Comprobante GRADUATE | BR-PROOF-* | FR-PROOF-* | UX-G-PROOF-* | PaymentSubmission/FileAsset | `/me/.../payment-submissions` | AC-PROOF-* |
| Revisión ADMIN | BR-PROOF-004..008 | FR-PROOF-003..006 | UX-A-PROOF-* | PaymentSubmission→Transaction | approve/reject endpoints | AC-PROOF-003..007 |
| Vencimientos | BR-LATE-001/002 | FR-LATE-001 | Pagos/cartera | Installment derived state | plan/reports | AC-FIN + AC-LATE |
| Penalización tardía | BR-LATE-003..006 | FR-LATE-002..004 | Config + cartera | PenaltyCharge | late-policy API + job | AC-LATE-* |
| Cancelación automática mora | BR-LATE-007/008 | FR-LATE-005 | alertas/estado | Membership + job | internal job | AC-CAN-009/010 + AC-JOB |
| Política cancelación dinámica | BR-CANPOL-* | FR-CANPOL-* | UX-A-CANPOL-* | CancellationPolicy/Range | policy endpoints | AC-CANPOL-* |
| Rangos/porcentajes dinámicos | BR-CANPOL-002..006 | FR-CANPOL-002/003 | Editor campos | PolicyRange | `PUT /ranges`, validate | AC-CANPOL-002..007 |
| Versionado policy | BR-CANPOL-007/008 | FR-CANPOL-004..006 | versiones | CancellationPolicy.version | publish/list APIs | AC-CANPOL-008..010 |
| Cotización cancelación | BR-CAN-006..008 | FR-CAN-001 | UX cancelación | CancellationQuote | `/cancellation-quote` | AC-CAN-001..005 |
| Cancelar membresía | BR-CAN-* | FR-CAN-002..006 | UX-A Cancelar | Membership + Quote | `/graduates/.../cancel` | AC-CAN-006..010 |
| Refund | BR-REF-* | FR-REF-* | UX-A Refund | Refund | refund APIs | AC-REF-* |
| Termo | BR-THERMO-* | FR-TH-* | UX-G/A Termo | ThermoRequest | thermo APIs | AC-TH-* |
| Termo extra | BR-THERMO-007 | FR-TH-006 | Agregar termo | EventProduct/LineItem | general product flow | AC-TH-007 |
| Entrega/firma termo | BR-THERMO-008/009 | FR-TH-005/007 | ADMIN entrega | ThermoDelivery | `/thermos/.../delivery` | AC-TH-006/008 |
| Notificaciones | BR-NOT-* | FR-NOT-* | Notificaciones | Notification | `/me/notifications` | AC vinculados a flujo |
| Notas internas | BR-NOTE-* | FR-NOTE-* | ADMIN notas | InternalNote | notes endpoints | AC-NOTE-* |
| Reporte financiero | BR-REP-001/002 | FR-REP-001 | Reportes | projections ledger | `/reports/financial` | AC-REP-001 |
| Cartera | BR-REP-003 | FR-REP-002 | Cartera | projections | `/reports/portfolio` | AC-REP-* |
| Pagos/comprobantes report | BR-REP-004/005 | FR-REP-003/004 | Reportes | transactions/submissions | report endpoints | AC-REP-002/005 |
| Mesas report | BR-REP-006 | FR-REP-005 | Reportes | assignments | `/reports/tables` | AC-REP-006 |
| Platillos report | BR-REP-007 | FR-REP-006 | Reportes | selections | `/reports/meals` | AC-REP-* |
| Termos report | BR-REP-008 | FR-REP-007 | Reportes | thermo | `/reports/thermos` | AC-REP-* |
| Corte diario | BR-REP-009 | FR-REP-008 | Cash cuts | ledger projection | `/reports/cash-cuts` | AC-REP-003 |
| Semanal/mensual | BR-REP-009 | FR-REP-009 | Reportes periodo | projections | report filters | AC-REP-004 |
| XLSX/CSV/PDF | BR-REP-010 | FR-REP-010 | Exportar | FileAsset temp | `/exports` | AC-REP-007..009 |
| Auditoría | BR-AUD-* | FR-AUD-* | Historial | AuditLog | `/audit` | AC-AUD-* |

---

# 3. Trazabilidad visual principal

| Experiencia | UX fuente | Visual spec | Design system | NFR | QA visual |
|---|---|---|---|---|---|
| Shell ADMIN | UX navegación ADMIN | VS-A-SHELL-001 | DS-P-004, layout/components | NFR-UI-001/002/003/004 | AC-UI-003/005/006/007 |
| Shell GRADUATE | UX navegación GRADUATE | VS-G-SHELL-001 | DS-P-004, mobile/touch | NFR-UI-002/003/004/012 | AC-UI-004/005/006/007 |
| Dashboard ADMIN | UX-A-DASH-* | VS-A-DASH-001 | KPI/Table/States | NFR-UI-001/009 | AC-UI-011/012/014/019 |
| Eventos ADMIN | UX-A-EVT-* | VS-A-EVT-001..003 | Form/Table/Stepper | NFR-UI-001/002 | AC-UI-003/005/019 |
| Graduados/expediente | UX-A-GRAD-* | VS-A-GRAD-001/002 | Table/Tabs/Drawer | NFR-UI-001/002/003 | AC-UI-005/006/019 |
| Pagos ADMIN | UX-A-PAY-* | VS-A-PAY-001/002 | Financial clarity | NFR-UI-003/005 | AC-UI-005/006/009/014 |
| Comprobantes ADMIN | UX-A-PROOF-* | VS-A-PROOF-001 | Table/preview/modal | NFR-UI-003/004 | AC-UI-006/007/008/009 |
| Cancelaciones | UX-A-CAN* | VS-A-CANPOL-001, VS-A-CAN-001 | Form/Table/Danger | NFR-UI-003/004/005 | AC-UI-005..009/014 |
| Croquis ADMIN | UX-A-SEAT-* | VS-A-SEAT-001 | Canvas + accessible list | NFR-UI-004/011 | AC-UI-007/009/016 |
| Reportes | UX-A-REP-* | VS-A-REP-001 | KPI/Table/Export | NFR-UI-001/003 | AC-UI-005/006/019 |
| Contrato GRADUATE | UX-G-CON-* | VS-G-CON-001 | Premium card/Typography | NFR-UI-003/004/007 | AC-UI-002/005/006/007/018 |
| Home GRADUATE | UX-G-HOME-* | VS-G-HOME-001 | Card/Progress/CTA | NFR-UI-002/009/012 | AC-UI-004/011/012/014 |
| Grupo/productos | UX-G-GROUP-* | VS-G-GROUP-001 | Card/Form/Quote | NFR-UI-002/003 | AC-UI-004/005/006 |
| Pagos GRADUATE | UX-G-PAY-* | VS-G-PAY-001 | Financial hierarchy | NFR-UI-002/003/005 | AC-UI-004/005/006/009 |
| Submission GRADUATE | UX-G-PROOF-* | VS-G-PROOF-001 | Upload/States | NFR-UI-002/004/012 | AC-UI-004/007/009/013 |
| Mesa GRADUATE | UX-G-SEAT-* | VS-G-SEAT-001 | Canvas/List/Drawer | NFR-UI-002/004/011/012 | AC-UI-004/007/016 |
| Platillos GRADUATE | UX-G-MEAL-* | VS-G-MEAL-001 | Per-member controls | NFR-UI-002/004/012 | AC-UI-004/007 |
| Termo GRADUATE | UX-G-TH-* | VS-G-TH-001 | Progress/Premium states | NFR-UI-005/006 | AC-UI-009/010/015 |
| Estados transversales | UX states | VS-X-* | DS components/states | NFR-UI-003..010 | AC-UI-005..020 |

---

# 4. Trazabilidad NFR transversal

| Riesgo | NFR | QA |
|---|---|---|
| IDOR/ownership | NFR-AUTHZ-* | AC-AUTH-005, AC-SEAT-008, AC-PROOF-001, AC-NOTE-002 |
| Payment idempotency | NFR-IDEM-001..007 | AC-PAY-004, AC-MAN-002, AC-PROOF-005 |
| Late fee duplicado | NFR-IDEM-008, NFR-JOB-* | AC-LATE-004, AC-JOB-* |
| Auto-cancel duplicada | NFR-IDEM-009, NFR-JOB-* | AC-CAN-009, AC-JOB-* |
| Concurrencia capacidad evento | NFR-CON-002 | AC-PLC-004 |
| Concurrencia mesa | NFR-CON-003..005 | AC-SEAT-010 |
| Refund concurrente | NFR-CON-008 | AC-REF-003 |
| Quote stale | NFR-CON-009 | AC-CAN-005 |
| Archivos maliciosos | NFR-FILE-* | AC-FILE-* |
| Snapshot contractual | NFR-CONTRACT-* | AC-CON-003..007 |
| Export injection | NFR-REP-006 | AC-REP-008 |
| Export privado | NFR-REP-002/003 | AC-REP-009 |
| Auditoría sensible | NFR-AUD-* | AC-AUD-* |
| Contraste/focus | NFR-UI-003/004 | AC-UI-006/007/008 |
| Responsive/touch | NFR-UI-002/012 | AC-UI-004/005 |
| Motion | NFR-UI-006/013 | AC-UI-010 |
| Performance visual | NFR-UI-007..010 | AC-UI-017/018/019 |

---

# 5. Reglas para cambios futuros

Toda nueva funcionalidad o patrón visual global deberá actualizar esta matriz en el mismo Change Request documental.

No se permite:

- agregar endpoint sin FR/BR asociado;
- agregar campo financiero sin definir impacto en ledger;
- agregar pantalla con mutación sin permiso y AC correspondiente;
- cambiar policy contractual sin especificar versionado;
- crear patrón visual global sin `UI_DESIGN_SYSTEM.md`/AC-UI cuando aplique;
- considerar ticket DONE si la fila de trazabilidad correspondiente tiene una capa requerida ausente.

---

# 6. Estado del baseline 1.2

La matriz cubre los flujos funcionales 1.1 y agrega cobertura visual 1.2 para:

```text
ADMIN shell
GRADUATE shell
paleta/tipografía
responsive
accesibilidad
performance visual
dashboards
expedientes
pagos/comprobantes
cancelaciones
croquis
reportes
contrato/home/grupo/pagos/mesa/platillos/termo GRADUATE
estados loading/empty/error/success
```

El baseline visual no modifica cálculos, permisos, API ni dominio. Cualquier comportamiento funcional fuera de la matriz sigue requiriendo Change Request.