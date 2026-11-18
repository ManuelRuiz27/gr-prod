# B1 — ADR de arquitectura del backend GR y frontera Monkavia

**Estado:** DISEÑO PARA IMPLEMENTACIÓN; sujeto a gate de producto/CEO y revisión de seguridad.  
**Fecha:** 2026-11-18. **Rama documental:** `gr-prod@integration/monkavia-gr-access`; destino final: repositorio backend GR independiente aún no creado.  
**Fuentes:** `GR_MONKAVIA_BACKEND_BASELINE_V1.md`, `GR_BACKEND_TRACEABILITY_MATRIX.md`, GR-app/main y `invitacionespremium@monkavia-gr/docs/04-tecnico/GR_PRIVATE_API.openapi.yaml` **v2.1.0 (diseño)**.

## ADR-001 — Fronteras de despliegue y autoridad

**Decisión propuesta:** API GR en un solo servicio NestJS modular y una base PostgreSQL propia. El frontend GR-app se conecta exclusivamente a GR. API Monkavia y su PostgreSQL permanecen independientes, sin acceso cruzado a tablas.

| Dominio | Escribe en | Autoridad |
| --- | --- | --- |
| Identity, Membership, Contract, Commercial, Finance, Meal, Thermo, Grouping | GR PostgreSQL | GR |
| Per-right `rightId`, QR FAMILY/NO_DINNER, StaffToken, acomodación operativa, CheckIn | Monkavia PostgreSQL | Monkavia |
| Elegibilidad por pago y reglas comerciales | GR | GR publica decisión versionada; Monkavia sólo la ejecuta como restricción de ingreso |
| Proyección de asistencia para reportes GR | GR read model / cache | Monkavia sigue siendo fuente; no permite mutar check-ins |
| Archivos privados de contratos, comprobantes, PDFs administrativos | Storage privado gobernado por GR | GR autoriza cada lectura/descarga |

No habrá microservicios GR independientes de entrada, broker obligatorio ni base compartida. Se permite extraer workers del mismo repositorio más adelante, con las mismas transacciones y módulos de dominio.

## ADR-002 — Módulos NestJS y contratos internos

```text
apps/api (NestJS)
 ├─ platform/       request-id, validation, authz, error filter, audit, idempotency
 ├─ identity/       auth, sesiones, recuperación, códigos de evento, enrollment
 ├─ events/         lifecycle GR, configuraciones, productos, políticas, croquis de lectura
 ├─ memberships/    cuenta 1:N eventos, grupo nominal, folio
 ├─ contracts/      snapshots legales, versiones y aceptación
 ├─ commercial/     cotizaciones, compras, reducción y cancelación
 ├─ grouping/       cantidades por mesa según reglas GR; NO acomodo individual Monkavia
 ├─ finance/        intentos, comprobantes, ledger, aplicación, ajustes, reembolsos
 ├─ meals-thermos/  elecciones y producción
 ├─ operations/     auditoría, notificaciones, exports, reportes
 ├─ monkavia/       traducción GR↔V2.1, HMAC, cursores, sincronización y elegibilidad
 └─ jobs/           outbox, reconciliation, lease y limpieza
```

Cada módulo expone casos de uso y repositorios tipados; controllers no deben llamar directamente a Prisma ni a Monkavia fuera del módulo `monkavia`. El API externo conserva `/api/v1`. La aplicación no replica `app_user`/roles de Monkavia; ADMIN y GRADUATE son los únicos roles humanos en GR.

## ADR-003 — GR agrupa cantidades; Monkavia acomoda y emite derechos

**Decisión de producto confirmada:** no crear `AccessUnit` ni `TableAllocation` como nuevos modelos comerciales obligatorios de GR. GR guarda y consulta únicamente las agrupaciones por mesa que necesita su flujo y sus reglas comerciales. Monkavia conserva el acomodo operativo y genera internamente `rightId` para cada derecho.

**Contrato de salida de GR:** un snapshot completo por evento con `externalMembershipId` y grupos de `{productKind, externalTableId|null, quantity}`. `NO_DINNER` no exige mesa; no mandar nombre ni UUID ficticio por boleto. El identificador de mesa es sólo referencia opaca del agrupamiento GR, nunca identidad de asiento. `externalTableId` sólo se usa si la regla comercial GR y el estado de agrupación lo requieren.

**Brecha técnica heredada:** `TableAssignment` histórico tiene `group_member_id UNIQUE` y es nominal, incapaz de representar 6 lugares con 5 personas registradas. El cambio mínimo para almacenar agrupaciones no puede determinarse copiando esa tabla sin auditar servicios y datos. La implementación seleccionará un adaptador de persistencia compatible con el flujo de GR y migrará las asignaciones nominales existentes de manera verificable, **sin exigir identidad individual de acceso ni duplicar croquis/acondicionamiento operativo de Monkavia**.

Monkavia conserva las identidades al reconcililiar deltas de cantidad. Si GR envía un cambio incompatible con check-ins históricos, Monkavia retorna conflicto técnico y deniega nueva admisión mientras se reconcilia; la API GR NO inventa una nueva prohibición de negocio ni revierte un pago.

## ADR-004 — Consistencia eventual sin transacción distribuida

**Patrón adoptado:** transactional outbox en GR + API HMAC privada + receipts idempotentes en Monkavia + reconciliación por versiones. Nunca usar 2PC, cross-database FK ni HTTP a Monkavia dentro de la transacción SQL GR.

1. Una transacción de GR confirma pago/contrato/agrupación y registra, en esa **misma transacción**, el evento de dominio/outbox y la nueva revisión, si afecta elegibilidad/derechos.
2. Worker envía primero snapshot de grupos a `grSyncRights` cuando corresponde; entonces entrega `grSetRelease` con `expectedSyncVersion`, `releaseVersion` por membresía y `eligibilityRevision` contigua global por evento.
3. Monkavia valida firma, tenant, secuencia e idempotencia; commit de actualización y receipt es atómico. GR marca entrega confirmada **sólo** al recibir receipt o recuperar estado remoto.
4. Respuesta perdida: misma operación/idempotency, nueva firma/nonce (no reusar nonce HMAC); consultar `grGetSyncState` para resolución de incertidumbre.
5. Si el evento tiene outbox crítico pendiente, gap de versión, conflicto de conciliación o saldo no confiable, **no renovar lease**. Operación de admisión se detiene al expirar el lease vigente.
6. Lease Monkavia dura 30 s y GR lo renueva normalmente cada 10 s. No declarar bloqueo financiero remoto instantáneo: la ventana residual es hasta 30 s desde la última renovación confirmada.
7. `PAUSE` Monkavia deniega ingresos inmediatamente incluso con lease vigente; `CLOSE/CANCEL` terminales. No confundir con `EventStatus.CLOSED` comercial de GR, que permite reabrir inscripciones bajo reglas GR.

**Orden de despacho**: serializar por eventId (o garantizar un único cursor CAS por evento); persistir secuencia total de cambios de elegibilidad y versiones separadas para metadata/snapshot/release. Un retry no altera el orden ni duplica operaciones.

## ADR-005 — Identidad, autorización y aceptación

- JWT access de corta duración; refresh token rotado y revocable almacenando sólo su digest. La decisión entre cookie HttpOnly + CSRF vs bearer en memoria es un ADR de infraestructura pendiente; **localStorage de credenciales no permitido**.
- Para recursos GRADUATE, autorizar por la relación real `account_id + event_id + membership_id` en servidor. Un eventId o un código no prueba ownership.
- Código de evento válido sirve para identificar el evento; `auth/graduate/register` de cuenta nueva sólo en GR `OPEN`. Para cuenta existente, requerir login antes de crear **una membresía** nueva; UNIQUE `(event_id, account_id)`, operación idempotente, y nunca duplicar Account o GroupMember principal.
- GET contrato devuelve texto íntegro y versión de política legible congelados para esa oferta. La aceptación verifica CAS de `terms_version`, `policy_version` y hash; si alguno cambió, 409 y lectura nueva. La prueba legal requiere revisión jurídica; no se habilita en producción hasta tener documentos aprobados.
- La cuenta técnica GR→Monkavia no usa sesión humana. GR ADMIN autoriza operación de Staff; el worker firma HMAC con secretos server-only, rotados, sin exposición en navegador/QR/logs.

## ADR-006 — Versiones y deprecación de endpoints

El `API_CONTRACT.openapi.yaml` histórico define **129** `operationId`; el anexo GR_ACCESS define **15**; Monkavia V2.1 define **18** privados. **No sumar automáticamente 129+15 como alcance final:** hay rutas históricas de OCR, upload/editor de croquis y asignación nominal que contradicen `SEATING_QUANTITY_CONTRACT` y el alcance de negocio actual.

Congelar una matriz de disposición por operationId: `REUSE | ADAPT | DEPRECATE | ADD`. No publicar una nueva ruta sin caso de uso; los nuevos endpoints de enrolamiento de cuenta existente y documento legal se especifican como **candidatos**, pendientes del gate de producto. Mantener 15 endpoints de fachada GR_ACCESS como integración aditiva, sin proxy público a los 18 endpoints privados Monkavia.

## ADR-007 — Reglas de interoperabilidad y errores

- DTO público GR en su convención actual `snake_case`; traductor privado a `camelCase` Monkavia V2.1.
- Errores GR usan envelope `{error:{code,message,request_id,details}}` y `X-Request-Id`, incluyendo fallas 409/503 de dependencia. No filtrar error interno/QR/PII/secretos Monkavia.
- `grSyncRights` lleva `memberships[].groups[]`: `productKind` `ADULT|CHILD|NO_DINNER`, `externalTableId|null`, `quantity:1..5000`. IDs de derecho sólo en las respuestas internas de Monkavia; no se exigen ni almacenan en GR.
- Los 5,000 derechos son techo de integración `GR_ACCESS`; aforo comercial y reglas de venta GR se conservan según producto/CEO, no se reemplazan por 5,000 indiscriminadamente.
- Q3 multimesa sigue sin gate especial; no crear permisos o aprobaciones adicionales.

## Riesgos y gates

| Riesgo | Mitigación obligatoria | Bloquea |
| --- | --- | --- |
| Modelo histórico nominal vs agrupación GR | Auditar servicios y escoger persistencia mínima de cantidades; pruebas de migración sobre fixtures | Implementar agrupación sobre DB productiva |
| Snapshot por cantidades frente a check-ins irreversibles | Algoritmo determinista de reconciliation y conflictos, pruebas de concurrencia en Monkavia | Lanzar scanner GR |
| Documentos legales faltantes | Snapshot legible legal, versionado y revisión jurídica | POST accept real |
| Registro de cuenta existente sin contrato actual | Diseño idempotente + ownership + QA de doble registro | Enrolamiento productivo |
| CEO no aprobó mocks/DEC | Aprobación documentada antes de conectar API real a interfaz | Integración frontend real |
| API HMAC V2.1 todavía es diseño | DDL, DTO, tests RED/GREEN, revisión L3, regresión M01 | Activar ingresos GR_ACCESS |

**Resultado B1 ADR:** topología, responsabilidad, interoperabilidad y patrón de consistencia especificados; ninguna modificación productiva ejecutada.
