# NON_FUNCTIONAL_REQUIREMENTS.md

# Plataforma GR — Requisitos No Funcionales

**Documento:** `NON_FUNCTIONAL_REQUIREMENTS.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Baseline técnico para implementación, infraestructura y QA  
**Fecha:** 24 de agosto de 2026  
**Documentos fuente:** `PRODUCT_SCOPE.md`, `BUSINESS_RULES.md`, `SRS.md`, `ROLES_PERMISSIONS.md`, `FINANCIAL_DOMAIN.md`, `SEATING_MAP.md`, `DATA_MODEL.md`, `API_CONTRACTS.md`  
**Stack de referencia:** Node.js / NestJS / PostgreSQL / Prisma / React  
**Propósito:** Definir los requisitos técnicos medibles de seguridad, idempotencia, concurrencia, rendimiento, auditoría, respaldo, observabilidad, resiliencia y operación de Plataforma GR.

---

# 1. Propósito

Este documento especifica las propiedades que el sistema deberá cumplir independientemente de la funcionalidad visible.

Los NFR definidos aquí deberán utilizarse como fuente para:

- arquitectura;
- configuración de infraestructura;
- seguridad;
- CI/CD;
- QA;
- pruebas de carga;
- monitoreo;
- backups;
- logs;
- alertas;
- operación de producción;
- revisión técnica antes de release.

Los requisitos se identifican como:

```text
NFR-[DOMINIO]-[NÚMERO]
```

---

# 2. Prioridades

| Prioridad | Significado |
|---|---|
| `P0` | Bloquea producción si no se cumple |
| `P1` | Obligatorio para MVP operativo |
| `P2` | Requerido para madurez operativa, puede implementarse después del núcleo |
| `P3` | Mejora futura |

---

# 3. Principios técnicos

## NFR-GEN-001 — Backend como autoridad

**Prioridad:** P0

Las reglas críticas deberán validarse en backend.

Esto incluye:

- autorización;
- capacidad de evento;
- capacidad de mesas;
- deadlines;
- aplicación financiera;
- confirmación de pagos;
- idempotencia;
- cambios administrativos críticos.

---

## NFR-GEN-002 — PostgreSQL como fuente transaccional

**Prioridad:** P0

PostgreSQL será la fuente autoritativa de:

- cuentas;
- eventos;
- membresías;
- asignaciones;
- obligaciones;
- movimientos financieros;
- auditoría.

La caché, frontend o proveedor externo no sustituirán a la base de datos como fuente final de estado interno.

---

## NFR-GEN-003 — Stateless API

**Prioridad:** P1

La API deberá ser stateless respecto a sesiones de negocio.

Las instancias backend podrán escalar horizontalmente sin depender de memoria local para:

- autenticación;
- locks;
- idempotencia;
- estado de pagos;
- asignaciones.

---

# 4. Seguridad — Transporte

## NFR-SEC-001 — HTTPS obligatorio

**Prioridad:** P0

Toda comunicación de producción deberá utilizar HTTPS.

HTTP plano deberá redirigirse o rechazarse.

---

## NFR-SEC-002 — TLS

**Prioridad:** P0

El entorno de producción deberá soportar como mínimo:

```text
TLS 1.2
```

y preferentemente TLS 1.3 cuando la plataforma de hosting lo soporte.

No se deberán habilitar protocolos obsoletos.

---

# 5. Seguridad — Autenticación

## NFR-SEC-003 — Hash de contraseñas

**Prioridad:** P0

Las contraseñas deberán almacenarse exclusivamente como hash adaptativo.

Para continuidad con el stack existente:

```text
bcrypt
```

es aceptable.

Cost factor mínimo baseline:

```text
12
```

La implementación podrá migrar a Argon2id en una revisión técnica posterior sin cambiar el dominio.

---

## NFR-SEC-004 — Contraseña nunca recuperable

**Prioridad:** P0

No deberá almacenarse:

- contraseña en texto plano;
- contraseña cifrada reversible;
- contraseña en logs;
- contraseña en auditoría.

---

## NFR-SEC-005 — Access token

**Prioridad:** P0

La sesión autenticada deberá usar token de acceso de vida corta.

Baseline:

```text
15 minutos
```

---

## NFR-SEC-006 — Refresh token

**Prioridad:** P0

Si se implementa refresh token, deberá:

- tener expiración;
- poder revocarse;
- rotarse al utilizarse;
- invalidarse al cerrar sesión cuando corresponda.

Baseline de duración:

```text
7 días
```

La renovación podrá extender la sesión mediante rotación.

---

## NFR-SEC-007 — Revocación

**Prioridad:** P1

La plataforma deberá permitir invalidar sesiones cuando:

- una cuenta sea deshabilitada;
- se restablezca la contraseña;
- exista un incidente de seguridad;
- se cierre sesión según la estrategia adoptada.

---

# 6. Seguridad — Password reset

## NFR-SEC-008 — Token temporal

**Prioridad:** P0

Los tokens de recuperación deberán expirar.

Baseline:

```text
30 minutos
```

---

## NFR-SEC-009 — Un solo uso

**Prioridad:** P0

Un token utilizado deberá invalidarse inmediatamente.

---

## NFR-SEC-010 — Token almacenado como hash

**Prioridad:** P0

El token de recuperación plano no deberá persistirse.

---

# 7. Seguridad — Autorización

## NFR-SEC-011 — Verificación server-side

**Prioridad:** P0

Cada endpoint protegido deberá verificar:

```text
Account
→ role
→ resource ownership / ADMIN scope
```

---

## NFR-SEC-012 — Protección IDOR

**Prioridad:** P0

Cambiar manualmente:

```text
event_id
membership_id
table_id
payment_id
```

no deberá otorgar acceso a recursos no autorizados.

---

## NFR-SEC-013 — GRADUATE isolation

**Prioridad:** P0

Un GRADUATE no deberá obtener PII ni información financiera de otros graduados.

---

# 8. Seguridad — Validación de entrada

## NFR-SEC-014 — DTO validation

**Prioridad:** P0

Todos los payloads deberán validarse mediante DTO/schema.

Se recomienda configurar NestJS con comportamiento equivalente a:

```text
whitelist = true
forbidNonWhitelisted = true
transform = true
```

---

## NFR-SEC-015 — Sanitización

**Prioridad:** P0

Las entradas de texto deberán tratarse como datos, no como código.

El sistema deberá protegerse contra:

- SQL injection;
- XSS almacenado/reflejado;
- command injection;
- path traversal.

---

# 9. Seguridad — CORS

## NFR-SEC-016 — CORS restringido

**Prioridad:** P0

Producción no deberá utilizar:

```text
Access-Control-Allow-Origin: *
```

El backend aceptará únicamente orígenes configurados.

---

# 10. Seguridad — Rate limiting

## NFR-SEC-017 — Login

**Prioridad:** P0

Baseline por IP/cuenta:

```text
10 intentos / 15 minutos
```

Cuando se supere:

```http
429 Too Many Requests
```

---

## NFR-SEC-018 — Password reset

**Prioridad:** P0

Baseline:

```text
5 solicitudes / hora / identidad-origen
```

sin revelar existencia de cuenta.

---

## NFR-SEC-019 — API autenticada

**Prioridad:** P1

Baseline general inicial:

```text
120 requests / minuto / cuenta
```

Las operaciones de polling podrán tener reglas específicas.

---

## NFR-SEC-020 — Webhooks

**Prioridad:** P1

Los webhooks no deberán compartir el rate limit ordinario de usuarios.

Se deberá priorizar:

- autenticidad;
- idempotencia;
- protección ante abuso;
- límites compatibles con el proveedor.

---

# 11. Seguridad — Headers

## NFR-SEC-021

**Prioridad:** P1

La plataforma web deberá configurar headers compatibles con buenas prácticas modernas:

- `Content-Security-Policy`;
- `X-Content-Type-Options`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- protección contra framing mediante CSP `frame-ancestors` o equivalente;
- HSTS en producción.

---

# 12. Seguridad — Secretos

## NFR-SEC-022 — Variables de entorno

**Prioridad:** P0

No deberán existir secretos productivos en:

- repositorio;
- frontend;
- commits;
- archivos de ejemplo con valores reales.

---

## NFR-SEC-023 — Separación de credenciales

**Prioridad:** P0

Producción y desarrollo deberán usar credenciales distintas para:

- PostgreSQL;
- Mercado Pago;
- OpenPay;
- correo;
- almacenamiento.

---

# 13. Seguridad — Pagos

## NFR-SEC-024 — Sin captura directa de tarjeta

**Prioridad:** P0

El flujo principal Mercado Pago Checkout Pro no deberá capturar datos completos de tarjeta en Plataforma GR.

---

## NFR-SEC-025 — Return URL no confiable

**Prioridad:** P0

Parámetros de retorno del navegador no podrán confirmar pagos.

---

## NFR-SEC-026 — Webhook verificado

**Prioridad:** P0

Cada integración deberá validar notificaciones conforme al mecanismo oficial vigente del proveedor.

---

# 14. Idempotencia

## NFR-IDEM-001 — Webhook

**Prioridad:** P0

Procesar la misma notificación varias veces deberá producir el mismo efecto lógico que procesarla una vez.

---

## NFR-IDEM-002 — Transacción externa única

**Prioridad:** P0

Deberá existir unicidad sobre:

```text
provider + provider_transaction_id
```

---

## NFR-IDEM-003 — Evento proveedor único

**Prioridad:** P0

Deberá existir unicidad sobre:

```text
provider + external_event_id
```

---

## NFR-IDEM-004 — Idempotency-Key

**Prioridad:** P0

Operaciones financieras administrativas sensibles deberán exigir:

```http
Idempotency-Key
```

---

## NFR-IDEM-005 — Reuso mismo payload

**Prioridad:** P0

Misma clave + mismo payload:

```text
→ mismo resultado lógico
```

---

## NFR-IDEM-006 — Reuso distinto payload

**Prioridad:** P0

Misma clave + payload diferente:

```http
409 Conflict
```

Código:

```text
IDEMPOTENCY_KEY_REUSED
```

---

## NFR-IDEM-007 — Retención

**Prioridad:** P1

Baseline de retención de claves financieras:

```text
24 horas
```

Para webhooks, la deduplicación histórica mediante IDs de proveedor deberá mantenerse mientras exista el movimiento financiero relacionado.

---

# 15. Concurrencia — principios

## NFR-CON-001 — Integridad antes que disponibilidad aparente

**Prioridad:** P0

La plataforma deberá rechazar una operación antes que producir:

- sobrecupo;
- doble pago;
- doble asignación;
- saldo corrupto.

---

## NFR-CON-002 — Backend authoritative

**Prioridad:** P0

Los datos mostrados en UI pueden quedar temporalmente desactualizados.

Toda escritura crítica deberá recalcular el estado dentro de la transacción.

---

# 16. Concurrencia — mesas

## NFR-CON-003 — Selección atómica

**Prioridad:** P0

La selección/cambio de mesa deberá ejecutarse dentro de una transacción que serialice el acceso a las mesas afectadas.

---

## NFR-CON-004 — Estrategia PostgreSQL

**Prioridad:** P0

Se deberá utilizar una de las siguientes estrategias:

```text
SERIALIZABLE
```

o:

```text
SELECT ... FOR UPDATE / row lock equivalente
```

La implementación deberá probar que previene el sobrecupo.

---

## NFR-CON-005 — Deadlocks

**Prioridad:** P0

Cuando una operación necesite bloquear varias mesas, los locks deberán adquirirse en orden determinista.

---

## NFR-CON-006 — Retry transaccional

**Prioridad:** P1

Ante serialization failure/deadlock recuperable:

```text
máximo 3 reintentos
```

con backoff corto y jitter.

Si continúa fallando:

```text
409
```

o error transitorio seguro según caso.

---

# 17. Concurrencia — capacidad del evento

## NFR-CON-007

**Prioridad:** P0

La confirmación/aumento de lugares deberá ejecutarse de forma que:

```text
confirmed_places <= event.capacity
```

sea invariante incluso bajo concurrencia.

---

# 18. Concurrencia — finanzas

## NFR-CON-008 — Confirmación de pago

**Prioridad:** P0

Crear:

```text
PaymentTransaction
PaymentAllocation
PaymentPlan.freeze
```

deberá ejecutarse atómicamente.

---

## NFR-CON-009 — Refund

**Prioridad:** P0

Dos solicitudes concurrentes de refund no podrán superar el importe reembolsable.

---

## NFR-CON-010 — Manual payment

**Prioridad:** P0

Doble clic/retry no deberá crear dos pagos manuales.

---

# 19. Polling

## NFR-CON-011 — Mesas

**Prioridad:** P1

En selección activa de mesa, el frontend podrá refrescar disponibilidad mediante polling cada:

```text
3–5 segundos
```

---

## NFR-CON-012 — Pago en confirmación

**Prioridad:** P1

Después del retorno del proveedor, el frontend podrá consultar el intento cada:

```text
3 segundos
```

durante una ventana inicial máxima de:

```text
60 segundos
```

Después deberá degradar a una frecuencia menor o mostrar estado pendiente.

No se deberá mantener polling agresivo indefinidamente.

---

# 20. Auditoría

## NFR-AUD-001 — Append-only

**Prioridad:** P0

Los registros de auditoría no serán editables/eliminables desde operaciones normales del producto.

---

## NFR-AUD-002 — Actor

**Prioridad:** P0

Todo evento auditado deberá identificar:

```text
actor_account_id
```

o un actor de sistema inequívoco cuando el cambio provenga de integración automática.

---

## NFR-AUD-003 — Timestamp

**Prioridad:** P0

Toda entrada deberá contener timestamp UTC generado por backend/DB.

---

## NFR-AUD-004 — Contexto

**Prioridad:** P0

Deberá incluir:

- acción;
- entidad;
- ID;
- evento cuando corresponda;
- before;
- after;
- motivo cuando sea obligatorio.

---

## NFR-AUD-005 — Request correlation

**Prioridad:** P1

La auditoría deberá poder correlacionarse con un:

```text
request_id
```

cuando la acción provenga de una request HTTP.

---

## NFR-AUD-006 — Acciones mínimas

**Prioridad:** P0

Se auditarán como mínimo:

- cambios de estado de evento;
- cambios de lugares;
- cancelación de graduado;
- cambios administrativos de mesa;
- división de grupo;
- bloqueo de mesa;
- cambios de capacidad con impacto;
- override de platillo;
- pago manual;
- ajuste;
- reembolso;
- cambios de termo a producción/entregado.

---

## NFR-AUD-007 — No ruido gráfico

**Prioridad:** P1

Mover una mesa visualmente no deberá crear una entrada visible de auditoría de negocio por cada `dragEnd`, salvo requerimiento posterior.

---

# 21. Retención de auditoría

## NFR-AUD-008

**Prioridad:** P1

Baseline:

```text
mínimo 24 meses
```

La retención podrá ampliarse según requerimientos legales/operativos.

No deberá reducirse por debajo de la vida útil del evento y su periodo razonable de revisión administrativa.

---

# 22. Rendimiento — objetivos API

## NFR-PERF-001 — Lecturas simples

**Prioridad:** P1

Bajo carga nominal, objetivo:

```text
P95 <= 500 ms
```

para endpoints simples de lectura no dependientes de proveedores externos.

Ejemplos:

- perfil;
- resumen básico;
- detalle de mesa;
- plan financiero precomputable por query eficiente.

---

## NFR-PERF-002 — Lecturas agregadas

**Prioridad:** P1

Objetivo:

```text
P95 <= 1,000 ms
```

para:

- dashboard;
- cartera;
- reportes interactivos;
- croquis con disponibilidad.

---

## NFR-PERF-003 — Escrituras ordinarias

**Prioridad:** P1

Objetivo:

```text
P95 <= 1,000 ms
```

para operaciones internas sin dependencia externa:

- guardar platillo;
- mover mesa;
- asignar mesa;
- actualizar perfil.

---

## NFR-PERF-004 — Operaciones de proveedor

**Prioridad:** P1

Las llamadas a Mercado Pago/OpenPay no deberán bloquear indefinidamente.

Timeout de request externo baseline:

```text
10 segundos
```

Después de ese tiempo se deberá:

- marcar estado seguro;
- permitir retry;
- o devolver error transitorio.

Nunca inventar éxito.

---

# 23. Rendimiento — carga objetivo inicial

Las siguientes cifras son **baseline técnico de prueba**, no límites comerciales.

## NFR-PERF-005 — Usuarios concurrentes

**Prioridad:** P1

El sistema deberá superar una prueba inicial de al menos:

```text
300 sesiones concurrentes activas
```

sin pérdida de integridad.

---

## NFR-PERF-006 — Requests sostenidas

**Prioridad:** P1

Objetivo inicial de prueba:

```text
50 requests/segundo sostenidas
```

durante:

```text
10 minutos
```

para una mezcla representativa de lecturas/escrituras.

---

## NFR-PERF-007 — Picos

**Prioridad:** P1

Deberá tolerar un pico temporal de:

```text
100 requests/segundo
```

durante:

```text
60 segundos
```

sin corrupción de datos.

Puede existir degradación controlada de latencia.

---

# 24. Rendimiento — croquis

## NFR-PERF-008

**Prioridad:** P1

El croquis deberá manejar como baseline:

```text
200 mesas
```

en un solo evento sin degradación severa de interacción.

---

## NFR-PERF-009

**Prioridad:** P1

Durante drag local:

```text
objetivo visual cercano a 60 FPS
```

en hardware de escritorio moderno.

No se deberán hacer escrituras backend en cada frame.

---

# 25. Base de datos

## NFR-DB-001 — Índices

**Prioridad:** P0

Todos los foreign keys y campos utilizados frecuentemente en:

- ownership;
- filtros;
- joins;
- deadlines;
- conciliación;

deberán contar con índices apropiados.

---

## NFR-DB-002 — Query plan

**Prioridad:** P1

Queries críticas deberán revisarse con:

```text
EXPLAIN ANALYZE
```

antes de considerar cerrada una optimización.

---

## NFR-DB-003 — N+1

**Prioridad:** P1

Los endpoints de listas y reportes no deberán producir patrones N+1 evidentes.

---

## NFR-DB-004 — Migrations

**Prioridad:** P0

Todo cambio de esquema deberá tener una migración versionada y reproducible.

Producción no deberá depender de:

```text
prisma db push
```

como mecanismo de release.

---

# 26. Respaldo

## NFR-BCK-001 — Backup automático

**Prioridad:** P0

La base de datos productiva deberá contar con backups automáticos.

Baseline:

```text
backup diario
```

---

## NFR-BCK-002 — Retención diaria

**Prioridad:** P0

Baseline:

```text
30 días
```

---

## NFR-BCK-003 — Retención mensual

**Prioridad:** P1

Mantener al menos:

```text
1 snapshot mensual durante 6 meses
```

---

## NFR-BCK-004 — Point-in-time recovery

**Prioridad:** P1

Cuando el proveedor PostgreSQL lo soporte, deberá habilitarse:

```text
PITR
```

con una ventana mínima objetivo de:

```text
7 días
```

---

# 27. RPO / RTO

## NFR-BCK-005 — RPO

**Prioridad:** P1

Objetivo:

```text
RPO <= 24 horas
```

como mínimo con backups diarios.

Con PITR activo, objetivo operativo:

```text
RPO <= 15 minutos
```

---

## NFR-BCK-006 — RTO

**Prioridad:** P1

Objetivo inicial:

```text
RTO <= 4 horas
```

para restauración del servicio ante pérdida total de base de datos.

---

# 28. Pruebas de restauración

## NFR-BCK-007

**Prioridad:** P1

Deberá ejecutarse una prueba de restauración al menos:

```text
trimestralmente
```

---

## NFR-BCK-008

**Prioridad:** P0

Un backup no se considerará válido únicamente porque el job reportó éxito.

Deberá existir evidencia de restaurabilidad.

---

# 29. Archivos y respaldos

## NFR-BCK-009

**Prioridad:** P1

Los archivos críticos almacenados externamente deberán contar con:

- redundancia del proveedor;
- política de retención;
- referencia persistente;
- mecanismo de recuperación.

---

# 30. Observabilidad — logs

## NFR-OBS-001 — Structured logging

**Prioridad:** P0

Los logs de backend deberán utilizar formato estructurado.

Preferencia:

```json
{
  "timestamp": "...",
  "level": "info",
  "request_id": "...",
  "route": "...",
  "account_id": "...",
  "event_id": "...",
  "message": "..."
}
```

---

## NFR-OBS-002 — No secretos

**Prioridad:** P0

No registrar:

- passwords;
- access tokens;
- refresh tokens;
- credenciales;
- datos completos de tarjeta;
- secretos de webhooks.

---

## NFR-OBS-003 — PII mínima

**Prioridad:** P1

Los logs técnicos deberán evitar PII cuando un identificador interno sea suficiente.

---

# 31. Correlation IDs

## NFR-OBS-004

**Prioridad:** P0

Cada request deberá disponer de:

```text
request_id
```

generado o validado por backend.

Deberá propagarse en:

- logs;
- errores;
- llamadas internas;
- auditoría cuando aplique.

---

# 32. Observabilidad — métricas

## NFR-OBS-005

**Prioridad:** P1

Deberán medirse al menos:

### HTTP

```text
request_count
request_duration
error_count
4xx_count
5xx_count
```

### DB

```text
db_query_duration
db_pool_usage
db_errors
```

### Pagos

```text
payment_attempt_created
payment_confirmed
payment_failed
webhook_received
webhook_duplicate
webhook_processing_failed
reconciliation_required
```

### Operación

```text
table_assignment_conflict
event_capacity_conflict
```

---

# 33. Observabilidad — errores

## NFR-OBS-006

**Prioridad:** P1

Las excepciones no controladas deberán enviarse a una herramienta de error tracking o sistema equivalente.

Debe incluir:

- stack trace backend;
- request_id;
- release/version;
- entorno.

No secretos.

---

# 34. Alertas

## NFR-OBS-007 — 5xx

**Prioridad:** P1

Generar alerta cuando la tasa de errores `5xx` supere:

```text
5% durante 5 minutos
```

en tráfico significativo.

---

## NFR-OBS-008 — Webhooks

**Prioridad:** P0

Generar alerta cuando existan:

```text
>= 5 fallos consecutivos
```

de procesamiento de webhook del mismo proveedor o degradación equivalente.

---

## NFR-OBS-009 — Base de datos

**Prioridad:** P0

Alertar ante:

- DB no disponible;
- agotamiento crítico de conexiones;
- storage próximo a saturación;
- fallos repetidos de backup.

---

## NFR-OBS-010 — Reconciliación

**Prioridad:** P1

Los casos:

```text
REQUIRES_REVIEW
```

deberán ser visibles para ADMIN aunque no generen una alerta técnica externa.

---

# 35. Health checks

## NFR-OBS-011 — Liveness

**Prioridad:** P0

El backend deberá exponer un endpoint técnico de liveness.

Ejemplo:

```http
GET /health/live
```

No deberá depender de DB.

---

## NFR-OBS-012 — Readiness

**Prioridad:** P0

Debe existir readiness:

```http
GET /health/ready
```

que valide al menos:

- proceso backend;
- conexión a PostgreSQL.

No deberá depender de Mercado Pago/OpenPay para declarar la API core lista.

---

# 36. Disponibilidad

## NFR-REL-001

**Prioridad:** P1

Objetivo de disponibilidad mensual inicial:

```text
99.5%
```

excluyendo mantenimiento programado comunicado.

---

# 37. Resiliencia a proveedores

## NFR-REL-002

**Prioridad:** P0

Una caída de Mercado Pago/OpenPay no deberá impedir:

- consultar eventos;
- consultar grupo;
- consultar mesas;
- consultar pagos ya registrados;
- usar módulos operativos no dependientes de la pasarela.

---

## NFR-REL-003

**Prioridad:** P0

Si el proveedor falla al iniciar un pago:

```text
no crear PaymentTransaction confirmada
```

---

## NFR-REL-004

**Prioridad:** P1

Los eventos de proveedor no procesados deberán poder reintentarse sin duplicar efectos.

---

# 38. Retry de proveedores

## NFR-REL-005

**Prioridad:** P1

Llamadas server-to-server idempotentes podrán reintentarse usando backoff exponencial con jitter.

Baseline:

```text
3 intentos
```

No reintentar automáticamente operaciones no idempotentes sin protección explícita.

---

# 39. Email

## NFR-REL-006

**Prioridad:** P1

Un fallo temporal del proveedor de correo no deberá revertir una transacción financiera correctamente confirmada.

Las notificaciones deberán desacoplarse del commit financiero.

---

# 40. Uploads

## NFR-FILE-001 — Fondo croquis

**Prioridad:** P1

Formatos:

```text
JPG
PNG
PDF de 1 página
```

---

## NFR-FILE-002 — Tamaño fondo

**Prioridad:** P1

Baseline máximo:

```text
15 MB
```

por archivo antes de procesamiento.

---

## NFR-FILE-003 — Evidencias

**Prioridad:** P1

Formatos permitidos baseline:

```text
JPG
PNG
PDF
```

---

## NFR-FILE-004 — Tamaño evidencia

**Prioridad:** P1

Máximo baseline:

```text
10 MB
```

---

## NFR-FILE-005 — MIME validation

**Prioridad:** P0

El backend deberá validar:

- extensión;
- MIME;
- contenido reconocible cuando sea posible.

No confiar solo en nombre de archivo.

---

## NFR-FILE-006 — Storage privado

**Prioridad:** P0

Evidencias financieras no deberán ser públicamente accesibles mediante URLs permanentes sin autorización.

Preferir:

- signed URLs temporales;
- proxy autenticado.

---

# 41. Retención de archivos

## NFR-FILE-007

**Prioridad:** P1

Evidencias financieras deberán conservarse al menos mientras exista el registro financiero asociado y durante la ventana de auditoría definida.

---

# 42. Accesibilidad

## NFR-A11Y-001

**Prioridad:** P1

Objetivo baseline:

```text
WCAG 2.1 AA
```

para flujos esenciales.

---

## NFR-A11Y-002

**Prioridad:** P1

No depender exclusivamente de color para comunicar:

- error;
- vencido;
- mesa disponible;
- mesa bloqueada;
- pago confirmado.

---

## NFR-A11Y-003

**Prioridad:** P1

Formularios deberán contar con:

- labels;
- errores asociados;
- foco visible;
- navegación por teclado donde aplique.

---

# 43. Navegadores

## NFR-COMP-001

**Prioridad:** P1

Soporte objetivo:

- últimas 2 versiones estables de Chrome;
- últimas 2 versiones estables de Edge;
- últimas 2 versiones estables de Safari;
- últimas 2 versiones estables de Firefox.

---

# 44. Responsive

## NFR-COMP-002 — GRADUATE

**Prioridad:** P1

Mobile-first.

Baseline de validación:

```text
360px
390px
430px
768px
```

de ancho.

No deberá existir scroll horizontal estructural.

---

## NFR-COMP-003 — ADMIN

**Prioridad:** P1

Desktop-first.

Baseline:

```text
1280px+
```

Tablet deberá ser usable a partir de:

```text
768px
```

Mobile ADMIN no es objetivo de operación completa.

---

# 45. Seguridad del frontend

## NFR-FE-001

**Prioridad:** P0

No almacenar:

- secretos;
- claves de proveedor;
- credentials productivas.

---

## NFR-FE-002

**Prioridad:** P1

Evitar exponer información sensible en:

- localStorage;
- logs del navegador;
- query params.

La estrategia final de almacenamiento del token deberá revisarse antes de producción.

Preferencia de seguridad:

```text
httpOnly secure cookies
```

cuando la arquitectura elegida lo permita.

---

# 46. Reproducibilidad

## NFR-MNT-001

**Prioridad:** P0

Un entorno nuevo deberá poder reproducir:

- instalación;
- build;
- base de datos;
- migraciones;
- seeds de desarrollo;
- tests.

mediante documentación versionada.

---

## NFR-MNT-002

**Prioridad:** P0

La rama principal no deberá depender de cambios de schema sin migración registrada.

---

# 47. CI

## NFR-CI-001

**Prioridad:** P1

Toda PR/merge deberá ejecutar al menos:

```text
lint
typecheck
unit tests
integration tests críticas
build
```

---

## NFR-CI-002

**Prioridad:** P0

No se deberá desplegar una versión cuyo:

- build falle;
- migración falle;
- suite P0 falle.

---

# 48. Pruebas de seguridad mínimas

## NFR-TEST-SEC-001

GRADUATE A no accede a B mediante IDOR.

## NFR-TEST-SEC-002

GRADUATE no accede a `/admin`.

## NFR-TEST-SEC-003

Manipular `role` no eleva privilegios.

## NFR-TEST-SEC-004

Secretos no aparecen en bundle frontend.

## NFR-TEST-SEC-005

Login respeta rate limit.

## NFR-TEST-SEC-006

Reset token expira y es single-use.

---

# 49. Pruebas de concurrencia mínimas

## NFR-TEST-CON-001

100 intentos concurrentes sobre una mesa con capacidad insuficiente no producen sobrecupo.

## NFR-TEST-CON-002

Cambios simultáneos entre dos mesas preservan capacidades.

## NFR-TEST-CON-003

Confirmaciones concurrentes de lugares no superan capacidad del evento.

## NFR-TEST-CON-004

Webhooks duplicados no duplican pagos.

## NFR-TEST-CON-005

Refunds concurrentes no exceden monto reembolsable.

---

# 50. Pruebas de rendimiento

## NFR-TEST-PERF-001

Ejecutar carga nominal:

```text
300 sesiones concurrentes
50 RPS
10 minutos
```

---

## NFR-TEST-PERF-002

Verificar:

```text
P95 lectura simple <= 500 ms
P95 agregada <= 1,000 ms
P95 escritura interna <= 1,000 ms
```

---

## NFR-TEST-PERF-003

Probar croquis con:

```text
200 mesas
```

en frontend.

---

# 51. Pruebas de backup

## NFR-TEST-BCK-001

Restaurar backup en un entorno aislado.

## NFR-TEST-BCK-002

Validar:

- esquema;
- migraciones;
- cuentas;
- pagos;
- asignaciones;
- auditoría.

## NFR-TEST-BCK-003

Registrar duración total para verificar RTO.

---

# 52. Pruebas de observabilidad

## NFR-TEST-OBS-001

Cada error `500` debe producir:

- log;
- request_id;
- evento de error tracking.

## NFR-TEST-OBS-002

Webhook fallido debe ser localizable por:

```text
provider
external_event_id
request_id
```

## NFR-TEST-OBS-003

Pago confirmado debe poder correlacionarse con:

```text
PaymentAttempt
PaymentTransaction
provider_transaction_id
```

---

# 53. Protección de logs

## NFR-LOG-001

**Prioridad:** P1

Los logs de aplicación deberán retenerse baseline:

```text
30 días
```

---

## NFR-LOG-002

**Prioridad:** P1

Logs de seguridad/incidentes relevantes podrán conservarse por:

```text
90 días
```

o más según proveedor/política.

---

# 54. Deployments

## NFR-DEP-001

**Prioridad:** P1

Los despliegues deberán ser repetibles.

No deberán requerir modificaciones manuales no documentadas en producción.

---

## NFR-DEP-002

**Prioridad:** P0

Las migraciones productivas deberán ejecutarse con estrategia segura respecto a:

- compatibilidad;
- locks;
- rollback lógico;
- backups.

---

## NFR-DEP-003

**Prioridad:** P1

Antes de migraciones destructivas deberá existir backup reciente verificable.

---

# 55. Ambientes

## NFR-ENV-001

**Prioridad:** P1

Como mínimo:

```text
development
staging
production
```

con configuración separada.

---

## NFR-ENV-002

**Prioridad:** P0

Staging no deberá utilizar credenciales productivas de pago salvo sandbox/configuración expresamente diseñada para ello.

---

# 56. Datos de prueba

## NFR-ENV-003

**Prioridad:** P0

Datos demo o seeds no deberán ejecutarse accidentalmente en producción.

---

# 57. Monitoreo de integridad financiera

## NFR-FIN-001

**Prioridad:** P0

Deberán existir checks/reports capaces de detectar:

```text
allocations > transaction amount
refunds > refundable amount
duplicate provider transaction
orphan transactions
orphan allocations
```

---

## NFR-FIN-002

**Prioridad:** P1

La conciliación administrativa deberá poder detectar diferencias entre:

- proveedor;
- PaymentTransaction;
- PaymentAllocation;
- PaymentPlan.

---

# 58. Monitoreo de integridad de mesas

## NFR-SEAT-001

**Prioridad:** P0

Deberá existir una consulta/health check operativo capaz de detectar:

```text
table occupancy > capacity
graduate assignments > active_places
event mismatch
```

Cualquier resultado debe considerarse anomalía crítica de datos.

---

# 59. Protección de operaciones destructivas

## NFR-SAFE-001

**Prioridad:** P0

Acciones sensibles deberán requerir confirmación UX y validación backend.

Ejemplos:

- cancelar evento;
- cancelar graduado;
- refund;
- reducir lugares;
- bloquear mesa con impacto.

---

## NFR-SAFE-002

**Prioridad:** P0

No deberá existir endpoint de hard-delete para pagos confirmados y auditoría.

---

# 60. Manejo de errores

## NFR-ERR-001

**Prioridad:** P0

Errores inesperados no deberán devolver stack traces al cliente.

---

## NFR-ERR-002

**Prioridad:** P1

El cliente deberá recibir:

```text
error.code
message
request_id
```

---

## NFR-ERR-003

**Prioridad:** P0

Errores de proveedor no deberán convertirse en estados financieros confirmados.

---

# 61. Timezone

## NFR-TIME-001

**Prioridad:** P0

Persistir timestamps en UTC.

---

## NFR-TIME-002

**Prioridad:** P1

Evaluar deadlines y mostrar fechas según timezone operativo del evento.

---

## NFR-TIME-003

**Prioridad:** P0

No utilizar hora local del navegador como fuente autoritativa para decidir:

- vencimiento;
- deadline;
- estado del evento.

---

# 62. Disponibilidad offline

## NFR-OFF-001

**Prioridad:** P2

La app podrá mostrar el estado:

```text
Sin conexión
```

pero no se requiere operación offline con sincronización diferida para el MVP.

---

# 63. Escalabilidad

## NFR-SCALE-001

**Prioridad:** P1

La arquitectura deberá permitir aumentar capacidad backend mediante múltiples instancias sin alterar el dominio.

---

## NFR-SCALE-002

**Prioridad:** P1

Locks críticos no deberán implementarse únicamente mediante memoria de proceso.

---

# 64. Criterios P0 de salida a producción

El release no podrá aprobarse si falla cualquiera de estos puntos:

```text
1. Auth backend correcta.
2. GRADUATE isolation/IDOR.
3. HTTPS y secretos correctos.
4. CORS restringido.
5. Migrations reproducibles.
6. Mesa sin race condition.
7. Capacidad de evento sin race condition.
8. Webhooks idempotentes.
9. PaymentTransaction externa única.
10. Pago confirmado inmutable.
11. Refund limitado.
12. Auditoría crítica append-only.
13. Backup automático activo.
14. Restauración probada.
15. Logs/request_id.
16. Alertas de DB y webhook.
17. No datos productivos de tarjeta en GR.
```

---

# 65. SLO baseline inicial

## Disponibilidad

```text
99.5% mensual
```

## Latencia API core

```text
P95 lectura simple <= 500 ms
P95 agregada <= 1 s
P95 escritura interna <= 1 s
```

## Integridad

```text
0 sobrecupos confirmados por race condition
0 pagos duplicados por webhook/retry
0 acceso cruzado GRADUATE
```

Estos tres objetivos de integridad son absolutos y no probabilísticos.

---

# 66. Trazabilidad

| Dominio | Documento previo | NFR |
|---|---|---|
| Auth | ROLES_PERMISSIONS / API | NFR-SEC |
| Pagos | FINANCIAL_DOMAIN / API | NFR-SEC / NFR-IDEM / NFR-CON |
| Mesas | SEATING_MAP | NFR-CON / NFR-SEAT |
| Auditoría | BUSINESS_RULES / DATA_MODEL | NFR-AUD |
| DB | DATA_MODEL | NFR-DB |
| Backups | SRS | NFR-BCK |
| Observabilidad | SRS / API | NFR-OBS |
| Rendimiento | SRS TBD | NFR-PERF |
| Archivos | DATA_MODEL / API | NFR-FILE |
| Compatibilidad | UX_FLOWS | NFR-COMP |
| Accesibilidad | SRS | NFR-A11Y |

---

# 67. Decisiones técnicas cerradas en este baseline

1. HTTPS obligatorio.
2. TLS 1.2 mínimo.
3. bcrypt cost ≥ 12 aceptado como baseline.
4. access token de 15 min.
5. refresh token baseline 7 días con rotación/revocación.
6. password reset token de 30 min y un solo uso.
7. CORS restringido.
8. rate limits base definidos.
9. `Idempotency-Key` para operaciones financieras sensibles.
10. retención base de idempotencia 24 h.
11. selección de mesa con serialización/row locking.
12. máximo 3 retries transaccionales.
13. polling mesas 3–5 s.
14. polling pago inicial 3 s por máximo 60 s antes de degradar.
15. auditoría append-only.
16. auditoría baseline 24 meses.
17. P95 API simple 500 ms.
18. P95 agregada/escritura 1 s.
19. carga baseline: 300 sesiones / 50 RPS sostenidas.
20. pico baseline: 100 RPS por 60 s.
21. croquis baseline de rendimiento: 200 mesas.
22. backup diario.
23. retención diaria 30 días.
24. snapshot mensual 6 meses.
25. PITR objetivo 7 días cuando el proveedor lo permita.
26. RPO <=24h mínimo / <=15min con PITR.
27. RTO <=4h.
28. restore test trimestral.
29. structured logging.
30. request_id obligatorio.
31. health live/ready.
32. alerta 5xx >5%/5min.
33. evidencia financiera en storage privado.
34. WCAG 2.1 AA como objetivo.
35. staging separado de producción.
36. no operación offline compleja en MVP.

---

# 68. Aspectos aún dependientes de proveedor/infraestructura

No alteran las reglas del producto y deberán resolverse al seleccionar hosting:

1. proveedor final de PostgreSQL;
2. mecanismo concreto de PITR;
3. storage de FileAsset;
4. servicio de error tracking;
5. servicio de métricas;
6. plataforma de logs;
7. proveedor de email;
8. mecanismo exacto de secret management;
9. autoscaling disponible;
10. estrategia concreta de colas si se requiere procesamiento durable de webhooks.

Estos puntos son decisiones de infraestructura, no huecos funcionales.

---

# 69. Documentos siguientes

Este documento deberá utilizarse como fuente para:

1. `ACCEPTANCE_CRITERIA.md`
2. `ROADMAP_IMPLEMENTATION.md`
3. arquitectura técnica;
4. configuración CI/CD;
5. plan de QA;
6. pruebas de carga y resiliencia.

---

# 70. Baseline

Con esta versión se establece:

```text
NON_FUNCTIONAL_REQUIREMENTS_VERSION = 1.0
```

Los requisitos no funcionales quedan establecidos como baseline técnico para implementación y release de Plataforma GR.
