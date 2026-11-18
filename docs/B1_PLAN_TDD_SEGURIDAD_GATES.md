# B1 — Plan TDD, seguridad y gates para construir el backend independiente GR

**Estado:** plan de implementación; NO existen pruebas RED/GREEN del nuevo backend. **Fecha:** 2026-11-18.  
**Fuentes:** `B1_ADR_ARQUITECTURA_BACKEND_GR.md`, `B1_MODELO_DATOS_MIGRACION.md`, `B1_MATRIZ_API_VALIDACIONES.md`, 27 UC GR + 10 ESC, Monkavia private OpenAPI 2.1.

## 1. Política de avance

- Primera entrega funcional **GR completo**; Monkavia progresiva, sin modificar directamente el código existente de su SaaS hasta la tarea autorizada.
- Todo código nuevo de backend se alojará en un **repositorio independiente aún no suministrado/creado**. Estos documentos residen temporalmente en `gr-prod@integration/monkavia-gr-access`, sólo como handoff.
- Para GR-app **únicamente main, sin ramas/PR automáticos**, pero esta política no autoriza crear rama nueva ni tocar UI durante B1. La rama histórica `monkavia-gr` de InvitacionesPremium se usa para sus contratos.
- CEO debe aprobar GR-app/main (27 UC, 40 mocks, 10 escenas) antes de conectar las rutas comerciales reales; B1 diseño/TDD de requisitos puede anteceder esa aprobación, pero no homologación productiva.
- Para cada implementación crítica crear pruebas RED por comportamiento ausente y contrato de alcance; pasar GREEN en fixture controlado; revisión L3 independiente (finanzas, legal, identidad, HMAC, QR, SQL), CI exacto y regresiones.
- No hacer escrituras en DB productiva, no usar datos personales reales, no generar tokens/QR en logs, no declarar PASS sin evidencia.

## 2. Secuencia de trabajo recomendada y dependencias

| Orden | Paquete | Entregable verificable | Dependencia crítica |
| --- | --- | --- | --- |
| P0-01 | Foundation API | NestJS, Prisma, DI, config, request-id, error envelope, validation pipe y test harness SQL | Repo independiente y baseline CI |
| P0-02 | Auth & ownership | JWT/refresh rotatorio, eventos OPEN, registro nuevo, membership multi-evento | ADR cookie/bearer, decisión DEC-02 para ruta de enroll |
| P0-03 | Contract legal | Snapshot íntegro versionado y CAS accept | Documento legal aprobado DEC-01 antes de habilitar |
| P0-04 | Commercial/Finance | Ofertas, pagos, comprobantes, ledger y refunds idempotentes | Reglas GR, límites/eventos validados |
| P0-05 | Grouping GR | Persistencia mínima de agrupación por mesa; no AccessUnit ni TableAllocation comercial | Auditoría TableAssignment nominal y contrato UI GR |
| P0-06 | Monkavia adapter | Outbox, cursors, HMAC, grSyncRights agrupado V2.1, release dual y lease | Contract test real contra Monkavia V2.1 implementado |
| P0-07 | Operations | Staff ADMIN, PDF NO_DINNER privado, FAMILY QR, lectura asistencia | GR/Monkavia reconciliados |
| P0-08 | Security/Performance gate | Concurrencia, SQL directo, benchmarking, restauración, alertas y rollback | Todos anteriores, CEO y decisión de despliegue |

No introducir servicio separado de mensajería si outbox de PostgreSQL y worker resultan suficientes en pruebas de carga. Evitar construir scanner en GR: Scanner ya pertenece a Monkavia.

## 3. Suite RED de autenticación y multi-evento

| ID | Estímulo | Resultado requerido |
| --- | --- | --- |
| AUTH-01 | Resolver código de evento DRAFT/CLOSED/CANCELLED o expirado | No revelar token de alta válido; no puede crear membership |
| AUTH-02 | Registrar correo ya existente con password diferente | No crear segunda Account ni revelar secretos; instruir login |
| AUTH-03 | Cuenta autenticada + token válido de segundo evento OPEN | Crear sólo membership/contrato pendientes; no alterar primero |
| AUTH-04 | 20 enroll simultáneos sobre mismo (event, account) | Una membership, un principal, un contrato; replay idempotente |
| AUTH-05 | Event token para evento A usado con URL B; token adulterado/revocado | 401/404, ninguna asociación |
| AUTH-06 | Cuenta deshabilitada o refresh reutilizado | Sesiones revocadas, denegar acceso y registrar auditoría mínima |
| AUTH-07 | Usuario A consulta contrato, grupo, PDF o pagos de B | 404/403 sin confirmar existencia ni devolver PII |
| AUTH-08 | Doble reset de contraseña / token reset usado | Una sola modificación; revocación de sesiones previas |

## 4. Suite RED de aceptación legal

| ID | Caso | Resultado requerido |
| --- | --- | --- |
| LEGAL-01 | GET contrato sin terms/policy aprobados | No habilitar POST de aceptación real |
| LEGAL-02 | GET presenta términos/política íntegros e identificador de snapshot | Igualdad hash SHA256 del documento persistido |
| LEGAL-03 | Publicar nueva versión entre GET y POST accept | 409 CAS, no aceptación y exigir relectura |
| LEGAL-04 | Doble POST accept con misma idempotency | Una evidencia, un cambio de estado, respuesta estable |
| LEGAL-05 | Usuario ajeno intenta aceptar contrato | 404/403, no mutación |
| LEGAL-06 | Contrato aceptado intenta mutarse directamente | UPDATE prohibido o transición a adenda, histórico conservado |
| LEGAL-07 | Recuperar texto que se aceptó meses después | Mismos bytes canónicos/versiones y checksum; no depende de última plantilla |

## 5. Suite RED comercial, agrupación y pagos

| ID | Caso | Resultado requerido |
| --- | --- | --- |
| BUS-01 | Compra simultánea por último cupo | Un commit, otro conflicto; no sobreventa según aforo GR |
| BUS-02 | Nombre añadido sin nuevo contrato; lugar comprado aún sin nombre | Cantidad y nombre no se duplican ni inventan personas |
| BUS-03 | Contrato 6 lugares y 5 personas; agrupación por mesa | Persistir estado completo sin identidad individual por boleto |
| BUS-04 | Reabrir evento comercial CLOSED según transición GR | No confundir con PAUSE/CLOSE terminal de admisión Monkavia |
| BUS-05 | Comprobante PENDING y vuelta de pasarela success sin webhook | Saldos sin confirmar |
| BUS-06 | Aprobación duplicada/race de comprobante | Exactamente un PaymentTransaction/Allocation efectivo |
| BUS-07 | Reembolso/cancelación | Ledger inmutable, compensación y elegibilidad/outbox críticos |
| BUS-08 | Reducir/agregar lugares conforme a regla GR | Grouping comercial consistente y outbox versionado; no validaciones inventadas |
| BUS-09 | Editor OCR/mesas legacy invocado desde API nueva | Endpoint retirado/denegado; no reintroducir funciones fuera de alcance |
| BUS-10 | Mesas/grupos entre dos eventos distintos | No mezcla de agrupaciones, pagos ni nombres |

## 6. Suite RED de integración Monkavia V2.1

| ID | Caso | Resultado requerido |
| --- | --- | --- |
| INT-01 | GR envía dos grupos 4 ADULT+2 NO_DINNER sin externalPlaceId | Monkavia materializa 6 rightId internos, GR nunca entrega UUID por boleto |
| INT-02 | Reintentar mismo snapshot, orden diferente, respuesta HTTP perdida | No nuevos derechos ni cambio de ID ya usado; response receipt estable |
| INT-03 | Cambiar cantidades 5→7→4, algunos derechos usados | Delta y preservación histórica según conciliación Monkavia, sin doble ingreso |
| INT-04 | Reducción incoherente con derechos ya consumidos | 409 técnico, no borrar check-in ni revertir operación financiera GR |
| INT-05 | 5,000 derechos y solicitud que rebasa a 5,001 | Rechazo atómico; datos previos intactos |
| INT-06 | Liquidado pero FAMILY sin mesas y 2 NO_DINNER | FAMILY BLOCKED y NO_DINNER RELEASED, sin QR NO_DINNER en portal GRA |
| INT-07 | Reverso financiero mientras hay un lease previo | Outbox pendiente impide nuevos heartbeats; a 30 s desde último éxito se deniega |
| INT-08 | Conexión restablecida después de gap y retries | Cursors reconciliados y release en orden; ninguna revision vieja reabre |
| INT-09 | Firma HMAC alterada, timestamp fuera ±300s, nonce en replay | 401 sin mutación; secretos no aparecen en error ni log |
| INT-10 | Familia entra 4/6 y luego 2/6; dos scanners colisionan | Recibos atómicos, no reingreso, únicos rightId internos |
| INT-11 | PAUSE en ventana válida; override vencido con lease fresco | Scanner deniega inmediatamente según estado/clock DB |
| INT-12 | 15 Staff GR y 4º Staff legacy; fetch de token antiguo | 16º GR y 4º legacy denegados; secreto retornado una sola vez |
| INT-13 | PDF NO_DINNER descargado por otro graduado o URL pública | 404/403, privado/no-cache, sin QR en logs |
| INT-14 | DB Monkavia caída y API GR sigue activa | Pagos y contratos GR consistentes; QR/scan denegados por fail-closed |
| INT-15 | Scanner intenta hacer check-in en otra graduación o tenant | 401/404, ningún ingreso ni datos de otro evento |

**Importante:** estas pruebas requieren la implementación real Monkavia 2.1. Una suite aislada con mocks no demuestra garantías entre bases.

## 7. Pruebas SQL directas y arquitectura de datos

- CREATE/INSERT indebidos por SQL sobre membership ya existente y referencias de otro evento: UNIQUE/FK impiden duplicación/cross-event.
- Mutación directa de contrato aceptado o evidencia inmutable: barrera DB o servicio con permisos SQL mínimos, audit.
- Doble efecto de webhook, pago manual, refund y submit: constraint/idempotency sobre identificador externo y receipt.
- Worker muere después de confirmar transacción de negocio pero antes de HTTP; el outbox conserva un evento durable.
- Worker muere después de Monkavia commit pero antes de ack GR; replay recupera efecto existente sin duplicado.
- Encolar revisiones concurrentes sobre una graduación: monotonicidad de `syncVersion`, `eligibilityRevision` y `releaseVersion`; nunca permitir inversión de orden.
- SQL test de grouping al migrar desde asignaciones nominales previas; rechazar backfill ambiguo, sin crear nombres/asientos ficticios.
- Contraste desde DB recién creada y actualización con datos legacy controlados; copia de respaldo y ensayo de restauración.

## 8. Threat model y observabilidad

**Superficies de ataque:** auth/event-access (enumeración/código filtrado), IDOR de membership/file/contrato, webhook forjado, SQL race por cupo, evidencia de pago maliciosa, XSS/CSRF de sesión, secret HMAC en browser, replay HMAC, QR/Staff en logs, token de scanner en URL, PDF NO_DINNER compartido, outage/lease con expiración.

**Controles:** DTO whitelist, strict schema, límites de payload/archivo, MIME real, storage privado, anti-CSRF si cookie, claves server-only, rotación de refresh y HMAC, rate limits y throttling por IP/cuenta/evento, hashing de contraseñas robusto, no SQL ad-hoc sin parametrización, request/correlation IDs y audit actor real.

**Métricas mínimas:** lag oldest critical outbox, deliveries/retries, revision mismatches, lease freshness, event attendance count, duplicate-right conflicts, checked-in uniqueness, payment webhook duplicates, 409/503 por operación, deadlocks, DB CPU/locks. Alertar sobre heartbeat detenido y diferencia financiera/snapshot; no registrar tokens, hashes de contraseñas, QR completos ni PII sin política.

## 9. Gates y criterios de salida verificables

| Gate | Condición | Estado al redactar |
| --- | --- | --- |
| G0 — Requerimientos | 27 casos, 10 escenas y extensión reconciliados; no inventar reglas; aprobación CEO documentada | Documentados; CEO pendiente |
| G1 — Repo/CI | Repositorio backend GR independiente, workflow lint/typecheck/tests, secret manager y envs | Pendiente |
| G2 — OpenAPI | GR base consolidada, 15 fachada y Monkavia V2.1 validados con parser OpenAPI 3.1 y diff; sin schema refs rotos | Parcial: contratos documentados, suite/linter sin ejecutar |
| G3 — DB | Modelo Prisma, migraciones desde cero y upgrade, tests SQL de invariantes | Pendiente |
| G4 — Autorización/Legal | Auth/IDOR tests NEGATIVE PASS, aceptación con documento jurídico final versionado | Pendiente |
| G5 — Reconciliación | E2E real GR ↔ Monkavia, outbox/lease/replay/QR dual y regresión M01 | Pendiente |
| G6 — Capacidad | Pruebas 5,000 derechos + 3 puertas / 6 scanners con p95/p99 registrados; SLO firmado por negocio | Pendiente |
| G7 — Despliegue | Hosting API, DB/cifrado, backups/restore, observabilidad, aprobación CEO y rollback | Pendiente |

**No declarar B1 implementado:** esta etapa produce documentación contractual y matriz de aceptación. La implementación inicia en el nuevo repositorio bajo G1 y con alcance acordado; producto y seguridad deben pasar sus gates antes de producción.

## 10. Siguiente etapa tras B1

**B2 — Esqueleto ejecutable del backend GR (foundation + contrato base):** crear repositorio independiente, inicializar NestJS/TypeScript/Prisma/PostgreSQL, integrar OpenAPI/DTO, guards de ownership, idempotency middleware, outbox, auditoría, herramientas de migración y CI con tests RED. Primero auth/contrato comercial GR; interop Monkavia V2.1 sólo después de su implementación y contrato validado, sin conexión al frontend real hasta aprobación CEO.
