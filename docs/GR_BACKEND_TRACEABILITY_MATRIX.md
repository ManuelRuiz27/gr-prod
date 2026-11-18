# Trazabilidad backend — 27 casos GR, 10 escenarios, accesos Monkavia V2

**Estado:** especificación de pruebas para diseño; aún no existe API nueva ni evidencia de PASS.  
**Fuentes:** GR-app/main docs/USE_CASES_GR_MOCKS.md y docs/MOCK_SCENARIOS_GR.md, más GR_MONKAVIA_BACKEND_BASELINE_V1.md en esta rama.  
**Regla:** nombres de suites propuestos NO son rutas HTTP nuevas; las rutas reales requieren contrato OpenAPI GR congelado.  

## 1. Casos de uso -> responsabilidades -> pruebas

| Caso | Actor | Contexto backend | Operación | Validación/negativa obligatoria | Suite de prueba propuesta |
| --- | --- | --- | --- | --- | --- |
| UC-ADM-01 | ADMIN | Eventos | Lista/búsqueda, aislamiento, paginación | ADMIN; filtros por evento; cero resultados | ADM-LIST |
| UC-ADM-02 | ADMIN | Events/Commercial | Alta borrador, catálogo, calendario | Capacidad/fecha/precio validado; no OPEN implícito | ADM-CREATE |
| UC-ADM-03 | ADMIN | Policies | Editar configuración, publicar política | Rangos no solapados; snapshot anterior inmutable | POLICY-V |
| UC-ADM-04 | ADMIN | Seating | Seleccionar plantilla precargada versionada | No plantilla incompleta ni cambio destructivo con ocupación | SEAT-TPL |
| UC-ADM-05 | ADMIN | Events | DRAFT/OPEN/CLOSED (reabrible)/FINALIZED/CANCELLED; sin PAUSE GR | Máquinas de estado y obligaciones, audit trail | EVENT-ST |
| UC-ADM-06 | ADMIN | Memberships | Padrón y expediente por evento | No filtración interevento, acceso ADMIN solamente | ADMIN-PROFILE |
| UC-ADM-07 | ADMIN | Finance | Cartera, abono manual libre permitido | Contabilidad exacta, monto válido, idempotencia | FIN-MAN |
| UC-ADM-08 | ADMIN | Payment submissions | Aprobar o rechazar comprobante | 1 aprobación=1 transacción; carreras y doble envío | FIN-PROOF |
| UC-ADM-09 | ADMIN | Finance/Refunds | Movimientos, ajustes, reversión/reembolso | Historial original inmutable; no refund excesivo | FIN-REV |
| UC-ADM-10 | ADMIN | Agrupación GR | Revisar y corregir agrupaciones por mesa permitidas | Sólo validaciones de negocio GR y autorización ADMIN | SEAT-ADM |
| UC-ADM-11 | ADMIN | Meals | Reporte, override de platillo con motivo | Por persona elegible, auditado después de deadline | MEAL-ADM |
| UC-ADM-12 | ADMIN | Thermos | Producción, entrega, evidencia | Sin cambios tardíos al grabado, transición válida | THERMO-ADM |
| UC-ADM-13 | ADMIN | Cancellation | Cotización, cancelar, refund separado | Cotización vigente; preservar transacciones y entradas | CANCEL-ADM |
| UC-ADM-14 | ADMIN | Reports | Cortes, filtros, exportaciones | Scope ADMIN, job idempotente, descarga privada | REPORTS |
| UC-ADM-15 | ADMIN | Audit/Admin | Auditoría, notas, administración cuentas | Actor real; no borrar auditoría; deshabilitación efectiva | AUDIT |
| UC-GRA-01 | GRADUATE | Identity | Código, registro, login, reset | Sólo OPEN, token contextual y llave idempotente; cuenta existente | AUTH-GRA |
| UC-GRA-02 | GRADUATE | Memberships | Elegir graduación propia | Membership ownership/IDOR y cambio de contexto | OWN-EVENT |
| UC-GRA-03 | GRADUATE | Contracts | Leer y aceptar términos completos | Snapshot/hash/CAS antes de aceptación; aún bloqueado | CONTRACT |
| UC-GRA-04 | GRADUATE | Read model | Inicio con próxima acción | Proyección del servidor sin decisiones financieras en UI | HOME |
| UC-GRA-05 | GRADUATE | Group | Registrar/editar nombres sin comprar derechos | Nombre obligatorio, principal protegido, cupo nominal | GROUP |
| UC-GRA-06 | GRADUATE | Commercial | Cotizar y contratar adicional | No sobrecupo, quote expirada, catch-up, atomicidad | BUY |
| UC-GRA-07 | GRADUATE | Payments | Consultar saldo e iniciar abono | No CONFIRMED desde navegador, amount exacto | PAY |
| UC-GRA-08 | GRADUATE | Payment submissions | Enviar comprobante, consultar revisión | Upload privado, no cambiar saldo PENDING | PROOF-GRA |
| UC-GRA-09 | GRADUATE | Agrupación GR | Agrupar cantidades por mesa conforme al flujo GR | Límites y requisitos únicamente según negocio GR aprobado | SEAT-QTY |
| UC-GRA-10 | GRADUATE | Group/Seating | Consultar integrantes y agrupación comercial | No crear duplicados comerciales; acomodo operativo lo gestiona Monkavia | SEAT-LINK |
| UC-GRA-11 | GRADUATE | Meals | Elegir platillo por integrante | NO_DINNER sin comida, deadline, option active | MEAL-GRA |
| UC-GRA-12 | GRADUATE | Thermos | Solicitar/personalizar termo | Milestone independiente, production freeze | THERMO-GRA |

## 2. Escenarios E2E como pruebas de integración

| Escenario | Trayectoria | Aserción para backend |
| --- | --- | --- |
| ESC-01 | Crear borrador, política, plantilla, OPEN | Sin alta pública en DRAFT, fecha/capacidad válidas, transición auditada |
| ESC-02 | Código, registro, contrato, login multi-evento | Token contextual, idempotencia, OWNERSHIP, términos versionados, no aceptación legal mock |
| ESC-03 | 6 derechos/5 nombres, alta nominal y compra 2 | Contratación y grupo conforme a GR, sin personas ficticias; el conector resuelve referencias de acceso mínimas |
| ESC-04 | Transferencia $1,500 PENDING -> APPROVED | Exactamente una transacción, importe correcto, elegibilidad recalculada, outbox |
| ESC-05 | 3 derechos mesa M01 + 2 mesa M02 | GR envía grupos M01=3/M02=2; Monkavia crea y conserva 5 rightId, sin modelo duplicado en GR |
| ESC-06 | Carrera por último cupo M03 | Un commit, otro 409, distribución vieja intacta |
| ESC-07 | Selección de platillos; NO_DINNER excluido | Deadline y override motivado; sin platillo sin cena |
| ESC-08 | Abono y umbral de termo | Milestone separado de mesa; estados REQUESTED -> IN_PRODUCTION -> DELIVERED |
| ESC-09 | Cancelación y devolución separadas | Cálculo versión de policy, cancelación no crea refund automático, histórico conservado |
| ESC-10 | Cartera, pagos manuales, ajustes, reportes, auditoría, cierre | Totales consistentes e inmutables; export privado por ADMIN |

**Las cifras de estos ESC son fixtures mock, no umbrales comerciales normativos.** La suite backend debe usar fixtures propios con precios/reglas configurables.

## 3. Escenarios nuevos obligatorios para GR_ACCESS V2

| Escenario | Resultado esperado |
| --- | --- |
| ACC-01 | 5,000 derechos sincronizables; el 5,001 no modifica el estado ni el histórico |
| ACC-02 | FAMILY bloqueado por una mesa pendiente y NO_DINNER liberado por liquidación total |
| ACC-03 | QR familiar de 6 derechos admite 4 ingresos, luego 2; mismo QR, consumos únicos |
| ACC-04 | Dos scanners intentan consumir el mismo NO_DINNER; un solo COMMIT |
| ACC-05 | Reverso financiero genera outbox y bloquea heartbeat; falla cerrado a los 30 s sin acuse |
| ACC-06 | PAUSE detiene check-in inmediatamente sin destruir Staff ni QR |
| ACC-07 | ACTIVATE fuera de horario exige motivo y override futuro; expiración deniega aunque lease siga vigente |
| ACC-08 | 15 Staff GR permitidos; 16º denegado; 4º en M01 legacy denegado |
| ACC-09 | Retiro de derecho consumido conserva entrada histórica y capacidad; UUID no se recicla |
| ACC-10 | GR reenvía cantidades sin IDs de boleto; Monkavia genera y conserva rightId en reintentos, sin inventar GroupMember ni AccessUnit comercial GR |
| ACC-11 | Escaneo sin conexión o JWT/HMAC/Staff/token equivocado niega acceso y no filtra PII |
| ACC-12 | Actualización de agrupación GR sincronizada conforme a negocio; Monkavia impide doble ingreso con su propio histórico, sin imponer bloqueo comercial nuevo |

## 4. Gates de aceptación

1. **REQ:** CEO aprueba casos y mocks, decide Q3 y enrolamiento de cuenta existente; legal aprueba documento/versión.
2. **API:** OpenAPI GR base, anexo GR v0.3-draft y Monkavia privado v2.1.0 comparados/validados, endpoints cubiertos por controlador y contrato.
3. **DOMAIN/SQL:** validar esquema y reglas comerciales de GR para agrupación, dinero y outbox; derechos, sus rightId y acomodo operativo se validan en Monkavia; no existen IDs de acceso que GR deba generar.
4. **SECURITY:** matriz RBAC+ownership negativa, antirreplay HMAC, refresh rotatorio, token Staff/QR redacted, rate limit y upload privado.
5. **INTEROP:** E2E ambos runtimes (sin DB compartida), versiones monotónicas, reconciliación tras corte de red, bloqueo al vencer lease, regresión M01.
6. **LOAD/OPS:** 5,000 derechos, 3 puertas/6 scanners, p95/p99, restoration test y alarmas; umbrales de SLA a definir antes de certificar.

**No confundir test definido con test ejecutado; ninguna suite de esta matriz ha sido ejecutada.**
