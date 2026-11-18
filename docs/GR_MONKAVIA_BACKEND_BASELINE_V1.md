# Plataforma GR + Monkavia — Baseline consolidada de requerimientos backend

**Estado:** baseline de análisis para el repositorio backend independiente, **NO implementado ni autorizado para despliegue**.  
**Fecha:** 18-11-2026.  
**Alcance:** GR completo + conector privado GR_ACCESS V2 hacia la API Monkavia, sin rehacer el SaaS Monkavia.  
**Versiones de interfaz:** GR pública, anexo aditivo OpenAPI **0.3.0-draft** (15 operaciones); Monkavia privada OpenAPI **2.1.0** (diseño, no desplegada) (18 operaciones). No usar el diseño privado V1 / 1,800 como fuente vigente.  
**Fuentes primarias:**
- GR-app/main: docs/ARCHITECTURE.md, docs/API_COMPATIBILITY.md, docs/USE_CASES_GR_MOCKS.md, docs/MOCK_SCENARIOS_GR.md, docs/CEO_APPROVAL_GR_MOCKS.md.
- GR histórico: docs/SEATING_QUANTITY_CONTRACT.md, docs/FINANCIAL_DOMAIN.md, docs/NON_FUNCTIONAL_REQUIREMENTS.md y docs/ERROR_CONTRACT.md, sujetos a reconciliación con código actual.
- GR lado API: este repositorio, docs/GR_ACCESS_INTEGRATION.openapi.yaml.
- Monkavia: ManuelRuiz27/invitacionespremium, rama monkavia-gr, docs/04-tecnico/GR_PRIVATE_API.openapi.yaml, docs/04-tecnico/GR_ACCESS_V2_CONCILIATION.md y diseño SQL V2 corregido.

## 1. Topología y autoridad (definición consolidada)

**NO unir bases ni mover gestión de accesos a la DB de GR.**
- Frontend GR-app -> API GR NestJS -> PostgreSQL GR (actualmente Supabase, despliegue API pendiente de decidir).
- API GR -> HMAC HTTPS servidor-a-servidor -> API Monkavia / integrations/gr -> PostgreSQL de Monkavia.
- Scanner Monkavia -> API Scanner Monkavia mediante StaffToken; jamás usa JWT GR o HMAC desde el navegador.
- GR opera como producto **single-tenant** con eventos y membresías aisladas; Monkavia mantiene su tenancy y el cliente técnico GR queda limitado a los eventos vinculados. Evento GR no equivale a tenant.
- Un único repositorio futuro para backend GR y su conector; implementación sugerida monolito modular NestJS, sin microservicios adicionales por defecto. Monkavia sigue teniendo repositorio/runtime independientes.

**Propiedad por dominio:**
| GR (autoridad) | Monkavia (autoridad) |
| --- | --- |
| Cuenta ADMIN/GRADUATE, membresía, contrato, términos versionados | Evento técnico vinculado y readiness GR_ACCESS |
| Productos ADULT/CHILD/NO_DINNER, lugar comprado, capacidad comercial | Identidades de derecho sincronizadas, QR FAMILY/NO_DINNER |
| Ledger, pago neto, cancelación, reversión, elegibilidad | Estado de liberación informado y versionado, no saldos |
| Agrupación comercial de cantidades por mesa conforme a reglas GR; grupo y contratos | Acomodo por mesa, QR, consumos y control operativo del acceso |
| Autorización del ADMIN para operar accesos y Staff | StaffToken, validador, check-in, entradas irreversibles y asistencia |

Nunca duplicar el ledger, inventar personas para lugares sin nombre, emitir un QR por mesa o tratar GR_ACCESS como producto comercial de Monkavia.

## 2. Precedencia ante contradicciones

1. Para GR_ACCESS: **OpenAPI Monkavia 2.1.0 + GR_ACCESS_V2_CONCILIATION** prevalecen sobre V1 (1,800, releaseState singular, sin PAUSE).
2. Para fachada GR: **GR_ACCESS_INTEGRATION.openapi.yaml 0.3.0-draft** define 15 endpoints aditivos; su implementación requiere acuerdo de DTO, seguridad y compatibilidad con el API GR existente.
3. Para el flujo GR: casos y escenarios de **GR-app/main** destinados a aprobación CEO. No confundir 40 mocks con aceptación técnica ni legal.
4. Mesas: **GR agrupa por mesa y cantidades según sus reglas de negocio**; Monkavia cuenta con el acomodo por mesa. Los documentos históricos que proponen TableAllocation o vinculación técnica por lugar no autorizan crear esas estructuras como nuevos módulos GR. Sólo reutilizar estructuras GR existentes y adaptar mínimos requeridos para la interfaz privada.
5. Q3, aprobación especial multimesa, permanece **pendiente del CEO**; no añadir pantalla, validación o rechazo especial. La distribución de cantidades en varias mesas sí está prevista.
6. El hosting final, la persistencia de sesión web, el enrolamiento de cuenta existente en otra graduación y el texto legal definitivo no están aprobados: no completar con supuestos.

## 3. Inventario de dominios GR (requerimientos de backend)

| ID | Módulo | Comandos/consultas y reglas esenciales | Prueba de aceptación |
| --- | --- | --- | --- |
| GR-01 | Identity/Auth | Registro contextual por código SOLO si evento OPEN; login/logout, refresh rotado/revocable, reset de un uso; ADMIN/GRADUATE exclusivos | DRAFT/CLOSED, token manipulado, login bruteforce y token reutilizado denegados |
| GR-02 | Memberships | Cuenta puede tener varias membresías; cada GET/command exige ownership y evento correcto; alta contextual sin duplicados | IDOR entre eventos/cuentas rechazada |
| GR-03 | Eventos | CRUD/configuración y transiciones DRAFT/OPEN/CLOSED/FINALIZED/CANCELLED con fechas, capacidad, política y timezone | Transiciones inválidas y cierre con obligaciones pendientes denegados |
| GR-04 | Contratos | Términos íntegros versionados + política legible + hash/snapshot inmutable + aceptación explícita CAS | No aceptar sin documento/versión visible ni aceptar términos que cambiaron |
| GR-05 | Commercial | Catálogo por evento, cotización con vencimiento, compras/ajustes de lugares, aforo y catch-up atómicos | Doble click o carreras no sobrecontratan ni duplican cargo |
| GR-06 | Group | GroupMember.full_name obligatorio; integrante principal nominal; los lugares adquiridos aún sin nombre son unidades, no personas | Nombrar no compra lugar; sin lugar no registrar persona adicional |
| GR-07 | Finance | Plan, cuotas, monto libre, pagos electrónicos confirmados server-to-server, abonos ADMIN y submissions pendientes | Retorno web/comprobante pendiente NO aumenta abono; no editar pago confirmado |
| GR-08 | Reconciliación | Webhook auténtico e idempotente, ajustes/reversos separados, cartera, vencimiento, penalización, cancelación y refund aparte | Un webhook duplicado no cobra dos veces; refund <= monto permitido |
| GR-09 | Agrupación por mesas | GR conserva la agrupación comercial de lugares por mesa y sus reglas de negocio existentes; Monkavia resuelve el acomodo, sin duplicar su modelo en GR | Rechazar únicamente operaciones que violen reglas comerciales GR aprobadas y preservar integridad de agrupaciones |
| GR-10 | Meals/Thermo | Platillos por persona con cena; override ADMIN motivado; termo con milestone separado y estados de producción/entrega | NO_DINNER sin platillo; edición de termo congelada en producción |
| GR-11 | Ops/Reports | Padrón, cartera, reportes/cortes, exports asíncronos, auditoría inmutable, notas internas, cierre | Sólo ADMIN exporta PII autorizada; evidencias protegidas |
| GR-12 | Access integration | Conector HMAC, outbox, control de elegibilidad y lease, datos mínimos y PDFs ADMIN; sincronización por cantidades agrupadas | Monkavia crea sus rightId, nunca los solicita a GR |

Cada requisito GR debe trazar a UC-ADM-01..15 / UC-GRA-01..12 y ESC-01..10. Aún no implica implementación terminada.

## 4. Delimitación definitiva: GR agrupa por mesa; Monkavia realiza el acomodo

**Corrección de producto (18-11-2026):** GR únicamente agrupa lugares por mesa según sus reglas de negocio. Monkavia ya cuenta con acomodo por mesa. Se **descarta** crear `AccessUnit` y `TableAllocation` como nuevos módulos o entidades obligatorias de negocio en GR; no reconstruir asiento por asiento, ni imponer validaciones adicionales de mesas, bloqueo de cambios o aprobaciones que GR no tenga aprobadas.

- GR transmite al adaptador su evento, contrato/membresía, cantidades, categorías de producto, agrupación por mesa y estado autoritativo de elegibilidad.
- Monkavia conserva la lógica y persistencia del acomodo por mesa, credenciales QR, Staff, verificaciones operativas de ingreso y consumo irreversible.
- **Contrato V2.1 corregido:** GR envía cantidades agregadas por membresía, tipo de producto y mesa (cuando corresponda). Monkavia **genera y conserva** el `rightId` individual y su historial. GR no genera `externalPlaceId`, no conserva un mapeo por boleto y no necesita nuevos módulos `AccessUnit` ni `TableAllocation`.
- Los límites de contratación, disponibilidad por mesa y cambios administrativos los determinan únicamente reglas aprobadas de GR. Monkavia valida exclusivamente la integridad de su propio acomodo y check-in según contrato.
- GR y Monkavia conservan bases independientes y sincronización por mensajes versionados, idempotencia y reconciliación. Nunca compartir tablas ni crear FKs entre bases.

## 5. Reglas GR_ACCESS V2 (consolidadas)

- Una graduación GR corresponde a un evento técnico GR_ACCESS; no es la entidad Event comercial GR.
- **5,000 derechos máximo por evento GR_ACCESS**, contando derechos vigentes aunque BLOCKED y derechos consumidos. Sólo una revocación jamás consumida libera aforo. El derecho 5,001 aborta atómicamente.
- **FAMILY:** una credencial QR vigente por membresía, incluye al titular y derechos ADULT/CHILD, sin nombres ficticios; permite ingresar subconjuntos 1..N en visitas distintas. No requiere QR nuevo al editar nombre/mesa pendiente.
- **NO_DINNER:** un QR distinto por derecho técnico de Monkavia, de un solo uso; lo imprime y entrega ADMIN GR. No aparece su SVG/PDF en el portal GRADUATE ni requiere mesa.
- **Libera GR, no Monkavia:** GR verifica 100 % neto aplicable de los lugares vigentes y membresía activa. familyState=RELEASED exige además que TODOS los derechos con cena vigentes tengan mesa válida en snapshot coherente. noDinnerState=RELEASED exige el mismo pago completo, pero no mesa. Decisión por membresía y **ambos estados en una transacción** con revision contigua. Si paidInFull=false, ambos BLOCKED; reversión/cancelación bloquea pendientes sin borrar ingresos.
- **Operación:** ventana propia de admisión y estados SCHEDULED/OPEN/PAUSED/CLOSED, independiente de GR.Event.status. ACTIVATE/PAUSE/RESUME/CLOSE vía ADMIN GR; CANCEL sólo por flujo técnico autorizado. ACTIVATE/RESUME fuera de ventana requieren motivo, adminDecisionRef y overrideEndsAt futura. PAUSE deniega al instante; cierre y cancelación son terminales; fin de ventana NO equivale a cierre terminal.
- **Lease:** renovación backend GR prevista cada 10 s, TTL 30 s en Monkavia DB. GR no renueva si hay outbox financiero crítico pendiente, inconsistencia de deuda o revisión no aplicada; replay de idempotencia no lo extiende. Scanner evalúa cada entrada según horario/override/pausa, lease, estado, Staff, derecho y QR. No hay check-in offline. **Riesgo residual máximo contractual de hasta 30 s** por desconexión entre DB, no prometer revocación remota instantánea.
- **Staff:** máximo 15 tokens activos en GR_ACCESS; otros servicios Monkavia conservan límite 3. El rol humano GR sigue siendo ADMIN/GRADUATE; Staff es identidad efímera exclusiva de Monkavia.
- **Check-in:** token firmado por propósito/evento, Staff válido, derecho pendiente, misma transacción y reloj DB, recibo idempotente e historial inmutable. FAMILY: seleccionar 1..N, batch todo-o-nada. NO_DINNER: exactamente uno. Dos scanners nunca consumen el mismo derecho dos veces.

## 6. Matriz de emparejamiento de 15 endpoints GR con 18 operaciones Monkavia

| Endpoint GR (operationId) | Operación privada Monkavia (operationId) | Responsabilidad de GR |
| --- | --- | --- |
| adminGetAccessConfiguration | grGetEvent | Leer la ventana local y el evento técnico; no mezclar versiones |
| adminUpdateAccessConfiguration | grUpdateEvent | Persistir horario GR versionado, proyectar metadatos/CAS vía outbox |
| adminGetAdmissionStatus | grGetEvent, grGetSyncState | Conciliar estado, horario, lease, progreso y drift |
| adminControlAdmission | grTransitionEvent | Autorizar/auditar ADMIN; convertir snake_case a camelCase, aportar expectedMetadataVersion, expectedSyncVersion y adminDecisionRef |
| adminPrepareAccesses | grCreateEvent, grGetEventByExternalId, grSyncRights, grPrepareCredentials, grSetRelease | Crear/vincular, sincronizar `groups[]` con cantidades por membresía/tipo/mesa, preparar bloqueados, liberar sólo tras elegibilidad; Monkavia genera rightId |
| adminListAccessMemberships | grGetSyncState, grListCredentials | Unir folio GR, elegibilidad y proyección Monkavia sin listar tokens |
| adminCreateNoDinnerPrintJob | grListCredentials, grCredentialSvg | PDF seguro, sólo QR individuales liberados, operación ADMIN auditada |
| adminGetNoDinnerPrintJob | — | Estado del job y ownership en GR |
| adminDownloadNoDinnerPrintJob | — | PDF privado desde GR Storage; no URL pública, no cache |
| adminListAccessStaff | grListStaff | Resumen GR ADMIN, nunca mostrar tokens ya emitidos |
| adminCreateAccessStaff | grCreateStaff | Entregar token una sola vez y proteger replay sin secreto |
| adminExpireAccessStaff | grExpireStaff | Expiración irreversible y auditoría |
| adminGetAccessAttendance | grAttendance | Proyección segura por evento y scope ADMIN |
| graduateGetAccesses | grListCredentials (en servidor) | Sólo membresía propia, estado/cifras FAMILY; nunca pase NO_DINNER |
| graduateGetFamilyQr | grCredentialSvg | Autorización ownership + pago + mesa + release; SVG privado no-cache |

**Las operaciones privadas restantes NO necesitan endpoint público espejo:** grRenewAdmissionLease (job/heartbeat GR), grScannerScan y grScannerCheckIn (Scanner Monkavia con StaffToken). grGetEvent y grGetSyncState son consultas internas reutilizadas. 15 endpoints visibles no equivalen a 15 llamadas síncronas punto-a-punto: varias operaciones son sagas y pueden devolver QUEUED/PENDING.

**Mapeo obligatorio de nombres y versiones:** facade GR usa snake_case y JWT de ADMIN/GRADUATE; integración Monkavia usa camelCase y HMAC. GR expected_version identifica su recurso local; no es automáticamente expectedMetadataVersion de Monkavia. Persistir versiones remotas y calcular expectedSyncVersion desde SyncCursor, nunca desde el navegador. Las idempotency keys se scopian por operación/actor/recurso y el replay revalida autorización.

## 7. Seguridad, protección de datos y continuidad P0

| Control | Invariante y prueba |
| --- | --- |
| Web sessions | JWT de vida corta, refresh rotatorio/revocable; decidir cookies HttpOnly + CSRF antes de persistencia productiva; no guardar tokens en localStorage |
| Authz | RBAC ADMIN/GRADUATE más ownership en servidor, IDOR entre eventId/membershipId/referencia de integración/fileId denegado |
| Entrada y salida | DTO whitelist y reject unknown fields, validación de dinero decimal exacto, tamaños, UUID, enums, fechas UTC+timezone y sanitización de errores |
| HMAC privado | X-GR-Key-Id, Timestamp, Nonce, Signature, Idempotency-Key, SHA-256 de bytes raw; ±300 s, antirreplay 600 s, secret manager, rotación, TLS, comparación constante, tenant scope |
| Transacciones | Locks/transacciones según operaciones y reglas GR (cantidades, cupos, pagos, ajustes); en Monkavia se mantiene unicidad transaccional del check-in; sin locks en memoria |
| Idempotencia | clave+hash payload, misma petición = mismo efecto, clave+payload distinto = conflicto; recibos persistidos; webhooks deduplicados |
| Storage | Comprobantes/contratos/PDF en storage privado, MIME real, tamaño, escaneo, URLs cortas o download autorizado, auditoría |
| Pagos | Sólo webhook firmado/consulta confiable confirma; ledger inmutable, corrección reversa; no duplicar saldos en Monkavia |
| Eventos asíncronos | Outbox en la misma transacción GR, worker con backoff y DLQ, cursors monotónicos, reconciliación, bloqueo de heartbeat si hay pendiente crítico |
| Observabilidad | requestId/traceId/correlationId, auditoría actor real, métricas de lag, reintentos, lease, drift, deadlocks; cero QR/token/HMAC, comprobantes o PII en logs |
| Operación | Jobs idempotentes, ambientes separados, migraciones reversibles con backup, pruebas restauración y alarma por fallos de reconciliación |
| QA | SQL directo contra constraints/triggers, tests de contrato OpenAPI, auth negativa, cross-tenant, carrera de último cupo/scan, carga 5k y regresión legacy |

La entidad técnica no puede autenticarse por login web; jamás impersona ADMIN GR o Planner. El token temporal Staff en URL es sensible: redacción en proxies, logs, traces y referrer obligatoria.

## 8. Desajustes corregidos documentalmente vs pendientes técnicos

| ID | Incongruencia / brecha | Resolución de contrato | Estado |
| --- | --- | --- | --- |
| AL-01 | 1,800/1,801 en documentos V1 Monkavia | V2: 5,000/5,001 sólo GR_ACCESS | Corregido en baseline SQL y pruebas V2; V1 marcado antecedente |
| AL-02 | releaseState singular | V2: familyState y noDinnerState atómicos, paidInFull y seatingComplete | Corregido en baseline SQL/pruebas; sin migración |
| AL-03 | Horarios y PAUSE ausentes del SQL V1 | Estado de admisión independiente, override temporal, lease 30 s, PAUSE prioridad | Corregido en diseño; sin DDL |
| AL-04 | OpenAPI privado titulado/status V1 y exigía UUID individual desde GR | V2.1: Monkavia administra rightId, GR sincroniza cantidades agrupadas | Documental, implementación pendiente |
| AL-05 | SHA Monkavia anterior en anexo GR | Referencia a commit V2 actualizada | Documental |
| AL-06 | Se propusieron AccessUnit/TableAllocation y `externalPlaceId` emitido por GR | Retirados: GR sólo sincroniza cantidades por contrato/tipo/mesa y Monkavia crea los IDs por derecho | **Decisión de producto confirmada; OpenAPI V2.1 actualizado** |
| AL-07 | Emisión QR depende de balances distribuidos | GR autoridad financiera, outbox + revision contigua + lease fail-closed | Diseño V2; falta prueba entre ambas DB |
| AL-08 | GR.Event.status vs admisión Monkavia | Dos máquinas de estado independientes con guardas | Diseño armonizado |
| AL-09 | API GR actual resuelve DRAFT | Registros SOLO OPEN, rechazo también en backend | **P0 por corregir** |
| AL-10 | GET contrato no trae texto íntegro/policy | Acceptance disabled hasta contenido/hashes versionados y CAS | **P0 por implementar** |
| AL-11 | Cuenta existente con nuevo código de evento | Flujo de enrolamiento seguro aún sin regla decidida | **Decisión producto pendiente** |
| AL-12 | Q3 multimesa | No inventar gate ni permisos hasta CEO; multimesa operativo sí | **Decisión CEO pendiente** |
| AL-13 | Actualización de agrupación GR durante acceso Monkavia | No añadir reglas comerciales ni prohibiciones automáticas; aplicar reglas GR y dejar a Monkavia verificar el ingreso histórico; reconciliación si hay inconsistencia técnica | **Pruebas de frontera pendientes** |
| AL-14 | Persistencia segura de sesiones y hosting API | ADR de auth/infra con pruebas antes del despliegue | **P0 técnico pendiente** |

## 9. Gates para comenzar el backend independiente

**Gate REQ (ahora):** esta baseline identifica decisiones cerradas, diferencias heredadas y puntos abiertos. No implica que el CEO haya aprobado los 27 casos y 40 mocks ni que el API haya pasado QA.

**Gate CONTRACT:** validar ambos OpenAPI con parser/linter 3.1 y diff semántico; firmar una matriz operación->actor->DTO->estados->errores->idempotencia; congelar versión. Excluir de GR toda generación o custodia de IDs individuales de derecho; validar el DTO agregado `memberships[].groups[]` de Monkavia V2.1.

**Gate DATA:** diseñar nuevo Prisma/SQL y migración desde gr-prod reutilizando agrupación de mesas existente y reglas comerciales GR. Crear outbox, cursores e idempotencia; sincronizar agregados por membresía/tipo/mesa, sin mapa de IDs por boleto y sin nuevos modelos AccessUnit/TableAllocation. Evitar cross-database FK.

**Gate SECURITY:** threat modeling STRIDE/OWASP API Top 10, autorización negativa/IDOR, HMAC runtime, cookies/CSRF, rate limits y logs sin secretos; plan de backups/DR/RTO-RPO.

**Gate TDD:** publicar pruebas RED y contrato de alcance, validar fallos funcionales y GREEN dirigido; para seguridad/finanzas/QR L3 exigir SQL directo, E2E de ambos repos, regresión de Monkavia M01 y benchmark 5k. No declarar PASS sin pruebas ejecutadas.

**Gate PRODUCT:** obtener visto bueno explícito del CEO para los mocks y las decisiones DEC-01, DEC-02, Q3 y demás aprobaciones correspondientes antes de conectar los módulos comerciales reales o activar producción.

## 10. Siguiente etapa propuesta

**Etapa B1 — Diseño contractual y de datos P0 del nuevo backend GR:** crear repositorio independiente bajo la propiedad del usuario, preparar ADR de límites, esquema inicial PostgreSQL/Prisma, OpenAPI público GR consolidado, matriz RBAC/ownership, y modelos técnicos Outbox + SyncCursor + adaptador de cantidades para Monkavia. Mantener en GR la agrupación por mesas y sus validaciones comerciales; acomodo y check-in permanecen en Monkavia. No activar operaciones reales hasta los gates previos.

**Primer entregable B1:** especificación de invariantes con SQL orientativo, diagramas de aggregates y matriz de endpoints/códigos de error, todo trazado a UC/ESC y ambos contratos OpenAPI. 
