# Plataforma GR — Arquitectura del Sistema

**Documento:** `SYSTEM_ARCHITECTURE.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** BASELINE ARQUITECTÓNICO NORMATIVO — listo para derivar diseño detallado y código  
**Fecha:** 7 de septiembre de 2026  
**Repositorio:** `ManuelRuiz27/gr-prod`  
**Baseline de código inspeccionado:** `da04f79e887f3afc0840ec24c8493dd52795e9ff`

---

## 1. Propósito

Este documento define la arquitectura objetivo de Plataforma GR antes de producir el backend definitivo.

Su función es impedir que la implementación se construya endpoint por endpoint a partir de pantallas, fixtures o código legacy sin una estructura común. Todo trabajo backend deberá poder trazarse mediante:

```text
pantalla/acción
→ caso de uso
→ autorización
→ operación API
→ módulo de aplicación
→ invariantes de dominio
→ transacción
→ persistencia
→ auditoría/efectos derivados
→ respuesta/error
→ prueba
```

Si una acción visible no puede recorrer esa cadena, el requerimiento técnico no está cerrado y no debe implementarse por inferencia.

Este documento no sustituye reglas funcionales. Organiza cómo se implementan.

---

## 2. Autoridad documental y precedencia

Para comportamiento funcional:

```text
PRODUCT_SCOPE.md
→ BUSINESS_RULES.md
→ SRS.md
→ ROLES_PERMISSIONS.md
→ documentos de dominio especializados
```

Para arquitectura técnica:

```text
SYSTEM_ARCHITECTURE.md
→ TECH_STACK.md
→ DATA_MODEL.md
→ API_CONTRACTS.md
→ NON_FUNCTIONAL_REQUIREMENTS.md
→ REPOSITORY_SOURCE_OF_TRUTH.md
→ código existente
```

`SEATING_AUTOMATION_CONTRACT.md` es una ampliación funcional aprobada posterior al baseline 1.3 y prevalece únicamente sobre frases anteriores que declaren que el reconocimiento automático de croquis está fuera de alcance.

Los fixtures, mocks, pantallas legacy, prototipos y servicios frontend actuales **no crean requisitos ni contratos por sí solos**.

---

## 3. Objetivos arquitectónicos

### 3.1 Objetivos obligatorios

1. Mantener una única fuente transaccional de verdad.
2. Evitar reglas de negocio duplicadas entre frontend, backend y proveedor de pagos.
3. Garantizar ownership y autorización server-side.
4. Garantizar exactitud financiera, idempotencia y auditoría.
5. Evitar sobrecupo de evento o mesa incluso bajo concurrencia.
6. Permitir evolución por módulos sin introducir microservicios prematuramente.
7. Poder sustituir proveedores externos mediante adapters.
8. Mantener el frontend aprobado y reemplazar progresivamente sus fixtures por clientes API.
9. Permitir que un agente convierta un requisito cerrado en código sin inventar arquitectura.
10. Mantener despliegue portable mientras no exista ADR de proveedor de hosting definitivo.

### 3.2 No objetivos

No forman parte de esta arquitectura:

- microservicios;
- CQRS distribuido;
- event sourcing;
- multi-tenant;
- roles dinámicos;
- acceso frontend directo a tablas PostgreSQL;
- Supabase Auth;
- captura propia de PAN/CVV;
- selección de silla;
- invitaciones, RSVP o check-in;
- motor CAD;
- entrenamiento de modelos ML para analizar croquis;
- lógica financiera en frontend.

---

## 4. Decisión estructural principal: modular monolith

El backend objetivo es un **monolito modular NestJS**.

Razones:

- una sola empresa operadora;
- volumen operativo inicial acotado;
- reglas altamente transaccionales entre contrato, pagos, lugares y mesas;
- despliegue/observabilidad más simples;
- evita consistencia distribuida innecesaria;
- permite extraer módulos posteriormente sin romper contratos si un límite demuestra necesidad real.

```text
React SPA
   │
   │ HTTPS JSON / multipart
   ▼
NestJS API
   │
   ├── Identity
   ├── Events
   ├── Memberships / Contracts / Group
   ├── Finance
   ├── Payments
   ├── Seating
   ├── Meals
   ├── Thermos
   ├── Files
   ├── Reports / Exports
   ├── Notifications
   ├── Audit
   └── Jobs
   │
   ├── Prisma
   ▼
PostgreSQL (Supabase managed)
```

Los proveedores externos entran únicamente mediante adapters.

---

## 5. Topología de runtime

### 5.1 Frontend

```text
React 19 + TypeScript + Vite
React Router
Tailwind / design system
Axios
React-Konva para croquis
```

Responsabilidades:

- render;
- captura de intención;
- estado de formulario;
- navegación;
- optimismo visual solo cuando sea reversible;
- sanitización visual adicional;
- análisis local asistido de croquis;
- consumo de contratos API.

No es autoridad de:

- saldo;
- capacidad;
- ownership;
- deadlines;
- estados contractuales/financieros;
- confirmación de pago;
- asignación definitiva de mesa.

### 5.2 API

```text
NestJS 11
TypeScript
Passport JWT
class-validator/class-transformer
Prisma
```

Responsabilidades:

- autenticación;
- autorización;
- orquestación de casos de uso;
- invariantes;
- transacciones;
- idempotencia;
- integración externa;
- auditoría;
- jobs;
- emisión de read models API.

### 5.3 Persistencia

PostgreSQL es la fuente transaccional.

Target administrado:

```text
Supabase PostgreSQL
```

Regla de seguridad:

```text
Frontend != Supabase Data API
Frontend -> NestJS -> PostgreSQL
```

Las tablas de dominio no deberán concederse a `anon`/`authenticated` ni exponerse como API alternativa. Si un schema llegara a exponerse, RLS se considera defensa en profundidad, no sustituto de autorización NestJS.

### 5.4 Archivos

Se define `ObjectStoragePort`.

Target productivo:

```text
Supabase Storage
```

Uso exclusivamente server-side para operaciones privilegiadas.

Buckets privados separados lógicamente por propósito:

```text
payment-evidence
seating-assets
thermo-evidence
exports
```

La API entrega URLs firmadas de vida corta después de validar autorización. No se expone `service_role` al navegador.

---

## 6. Capas backend

Cada módulo nuevo debe respetar:

```text
API
↓
Application
↓
Domain
↓
Infrastructure
```

### API

Controllers, DTOs, guards, pipes, serialización HTTP.

No contiene reglas de negocio.

### Application

Casos de uso y orquestación.

Ejemplos:

```text
AssignMembersToTables
ApprovePaymentSubmission
AcceptContract
CreateManualPayment
PublishCancellationPolicy
TransitionThermo
ImportDetectedTables
```

### Domain

Invariantes, policies, value objects y reglas puras.

No importa NestJS, Prisma, HTTP ni SDKs.

### Infrastructure

Prisma repositories, almacenamiento, gateway de pagos, correo y mecanismos externos.

---

## 7. Regla de dependencias entre módulos

Un módulo no modifica tablas propiedad de otro módulo “por conveniencia”.

Interacción permitida:

1. servicio de aplicación público del módulo dueño;
2. policy/query explícita;
3. transacción coordinada por un caso de uso de aplicación;
4. lectura de proyección definida para reporting.

Prohibido:

```text
PaymentsService -> prisma.installment.update(...) arbitrario
SeatingService  -> prisma.groupMember.update(...) arbitrario
ReportsService  -> mutar tablas de negocio
Controller      -> prisma.*
```

Los casos de uso que requieren varias entidades usan un `UnitOfWork`/transaction boundary explícito y reciben un Prisma transaction client común.

---

## 8. Módulos y ownership

| Módulo | Es dueño de | No es dueño de |
|---|---|---|
| Identity | Account, AuthSession, reset tokens | Membership, pagos |
| Events | Event, EventSettings, access code, lifecycle | contratos individuales |
| Catalog | EventProduct, milestones | deuda individual |
| Memberships | GraduateMembership, GroupMember | ledger |
| Contracts | GraduateContract, ContractLineItem | transacciones |
| Finance | PaymentPlan, Installment, PaymentTransaction, PaymentAllocation, Adjustment, PenaltyCharge, CancellationQuote, Refund | SDK de gateway |
| Payments | PaymentAttempt, PaymentSubmission, PaymentProviderEvent y adapters de cobro | reglas contractuales/ledger |
| Seating | SeatingMap, EventTable, TableAssignment | GroupMember identity |
| Meals | MealOption, MealSelection | GroupMember lifecycle |
| Thermos | ThermoRequest, ThermoDelivery | cálculo financiero fuente |
| Files | FileAsset + storage access | semántica del recurso consumidor |
| Reports | queries/exports | mutaciones |
| Notifications | Notification | cálculo de eventos de negocio |
| Audit | AuditLog | mutaciones del dominio auditado |
| Jobs | ejecución durable/claims | reglas que dispara |
| Common | error envelope, request id, idempotency helpers | reglas específicas |

`Catalog` puede implementarse inicialmente dentro de `Events` si conserva las mismas fronteras lógicas.

---

## 9. Estructura física objetivo

La migración será incremental. No se autoriza rewrite completo.

```text
backend/src/
├── common/
│   ├── auth/
│   ├── errors/
│   ├── idempotency/
│   ├── request-context/
│   └── database/
├── modules/
│   ├── identity/
│   ├── events/
│   ├── memberships/
│   ├── contracts/
│   ├── finance/
│   ├── payments/
│   ├── seating/
│   ├── meals/
│   ├── thermos/
│   ├── files/
│   ├── reports/
│   ├── notifications/
│   └── audit/
├── integrations/
│   ├── mercado-pago/
│   ├── openpay/
│   ├── storage/
│   └── mail/
└── jobs/
```

Dentro de cada módulo:

```text
api/
application/
domain/
infrastructure/
```

El código legacy se clasifica `REUSE`, `ADAPT`, `REPLACE` o `REMOVE` según `REPOSITORY_SOURCE_OF_TRUTH.md`.

---

## 10. Identidad y sesiones

### 10.1 Modelo

```text
Account
 └── AuthSession[]
```

Se mantiene:

```text
role = ADMIN | GRADUATE
status = ACTIVE | DISABLED
```

### 10.2 Sesión

Decisión cerrada:

- access token JWT de vida corta;
- refresh token rotatorio;
- refresh token plano nunca se persiste;
- se persiste hash de refresh/session;
- logout revoca sesión;
- deshabilitar cuenta revoca sesiones activas;
- `role` se obtiene del backend, nunca del body.

`AuthSession` debe incorporarse al siguiente endurecimiento de `DATA_MODEL.md`.

### 10.3 Registro contextual

El código ingresado en `/access` debe resolver un evento autorizado y no aceptar `event_id` arbitrario.

Se requiere un registro server-side equivalente a:

```text
EventAccessCode
---------------
id
event_id
code_hash
status
expires_at nullable
created_at
rotated_at nullable
```

El código plano no se almacena.

El flujo:

```text
POST /auth/event-access/resolve
→ token contextual corto de registro
POST /auth/graduate/register
→ consume contexto
→ crea/adjunta Account
→ crea GraduateMembership
```

No se usa el texto del código como autorización permanente.

Este recurso debe incorporarse a `DATA_MODEL.md` y OpenAPI antes de implementar auth productivo.

---

## 11. Autorización

### 11.1 Política ADMIN

`ADMIN` puede operar todos los eventos de la instancia, pero no saltar invariantes.

### 11.2 Política GRADUATE

Todo endpoint:

```text
/me/events/{eventId}/...
```

resuelve:

```text
JWT account_id
→ GraduateMembership(account_id,event_id)
→ resource ownership
```

Nunca:

```text
request.body.account_id
request.body.membership_id
request.body.role
```

como autoridad.

### 11.3 IDOR

Los siguientes IDs siempre requieren validación relacional:

```text
event_id
membership_id
group_member_id
table_id
file_id
payment_plan_id
installment_id
submission_id
transaction_id
refund_id
thermo_id
```

`404` puede preferirse a `403` cuando revelar existencia del recurso incremente exposición.

---

## 12. Modelo transaccional

### 12.1 Regla general

Una operación de negocio crítica tiene **un único commit lógico**.

Ejemplos:

```text
aprobar submission
= lock submission
+ validar estado
+ crear transaction
+ crear allocations
+ actualizar estado derivable necesario
+ audit
+ commit
```

```text
reasignar mesa
= lock mesas origen/destino en orden determinista
+ validar miembros
+ validar capacidad
+ reemplazar assignments
+ audit
+ commit
```

### 12.2 Isolation/locking

Usar:

- constraints PostgreSQL;
- `SELECT ... FOR UPDATE` cuando el agregado lo requiera;
- orden determinista de locks;
- `SERIALIZABLE` solo donde aporte valor;
- hasta 3 retries con backoff+jitter ante conflictos recuperables.

### 12.3 Dinero

Persistencia:

```text
NUMERIC/DECIMAL
```

API:

```json
"2500.00"
```

Nunca `number` JS como fuente contable.

---

## 13. Idempotencia

Se requiere una infraestructura común para commands sensibles.

Entidad técnica requerida:

```text
IdempotencyRecord
-----------------
scope
key
request_hash
response_status
response_body
resource_type nullable
resource_id nullable
expires_at
created_at
```

Constraint:

```text
UNIQUE(scope,key)
```

Semántica:

- misma clave + mismo payload → mismo resultado lógico;
- misma clave + payload diferente → `409 IDEMPOTENCY_KEY_REUSED`;
- no usar memoria de proceso;
- webhooks tienen además deduplicación por ID externo.

Debe añadirse al modelo de datos antes del backend financiero productivo.

---

## 14. API contract-first

Base:

```text
/api/v1
```

Reglas:

- JSON `snake_case`;
- UUID;
- timestamps UTC ISO-8601;
- dinero decimal string;
- paginación obligatoria en colecciones administrativas;
- DTO whitelist;
- errores mediante código estable;
- `Idempotency-Key` en commands sensibles;
- OpenAPI es contrato ejecutable, no documentación decorativa.

### 14.1 Nombres de operaciones

Cada operación OpenAPI tendrá `operationId` estable:

```text
authLogin
graduateGetPaymentPlan
adminApprovePaymentSubmission
adminAssignTableMembers
adminImportDetectedTables
```

El frontend generado/manualmente tipado debe referenciar estas operaciones, no construir rutas ad hoc.

### 14.2 Commands explícitos

Cambios de estado se modelan como commands cuando `PATCH` ocultaría reglas:

```text
POST /events/{id}/transitions
POST /payment-submissions/{id}/approve
POST /cancellation-policies/{id}/publish
POST /thermos/{id}/transitions
```

---

## 15. Contrato de errores

Envelope único:

```json
{
  "error": {
    "code": "TABLE_CAPACITY_CHANGED",
    "message": "La disponibilidad cambió. Actualiza el croquis.",
    "details": {},
    "request_id": "req_uuid"
  }
}
```

Clasificación:

| HTTP | Uso |
|---|---|
| 400 | DTO/request inválido |
| 401 | no autenticado |
| 403 | autenticado sin permiso |
| 404 | recurso no visible/no existe |
| 409 | concurrencia, estado o idempotencia |
| 422 | regla de negocio no satisfecha |
| 429 | rate limit |
| 500 | fallo interno |
| 502/503 | dependencia externa |

Nunca enviar stack traces, SQL, secretos o payload de proveedor a UI.

---

## 16. Pagos

### 16.1 Separación

```text
Finance = verdad contractual/contable
Payments = cobro e ingreso de movimientos
Provider = procesador externo
```

Mercado Pago es primario; OpenPay secundario.

Interfaz:

```text
PaymentGateway
- createCheckout()
- getPaymentStatus()
- refund()
- verifyWebhook()
- normalizeEvent()
```

Cada adapter transforma proveedor → modelo interno.

### 16.2 Flujo electrónico

```text
GRADUATE inicia intento
→ backend calcula monto pagable
→ PaymentAttempt CREATED
→ gateway crea checkout
→ navegador redirige
→ webhook llega
→ verificar autenticidad
→ persistir/deduplicar ProviderEvent
→ consultar proveedor server-to-server
→ crear PaymentTransaction una vez
→ allocations
→ efectos financieros
```

La return URL nunca confirma pago.

### 16.3 Pago manual/submission

`PaymentSubmission` no cambia saldo hasta `APPROVED`.

Pagos confirmados son append-only; correcciones mediante Adjustment/Refund/Reversal permitido.

---

## 17. Archivos

### 17.1 Flujo

```text
cliente multipart
→ NestJS valida auth/ownership
→ valida tamaño/MIME real
→ genera storage key
→ guarda en bucket privado
→ crea FileAsset
→ devuelve file_id
```

Descarga:

```text
GET recurso
→ ownership/ADMIN scope
→ URL firmada corta
```

### 17.2 Prohibiciones

- path elegido por cliente;
- bucket público para comprobantes;
- URL permanente a evidencia;
- extensión como única validación;
- blobs binarios en tablas de dominio.

---

## 18. Croquis: arquitectura autoritativa

El croquis conserva:

```text
SeatingMap
EventTable
TableAssignment
```

Persistencia:

- coordenadas `0..1`;
- `ROUND` y `SQUARE`;
- `SQUARE` representa el primitive rectangular actual; `width == height` produce cuadrado y `width != height` rectángulo;
- no se introduce un tercer enum únicamente para distinguir proporción visual;
- capacidad > 0;
- estado persistido `AVAILABLE | BLOCKED`;
- `FULL` y `PARTIAL` son derivados;
- `SELECTED/HOVER/FOCUSED` son estado frontend.

Asignación:

```text
GroupMember -> EventTable
```

No existe seat/chair.

---

## 19. Automatización del croquis

### 19.1 Objetivo

Al cargar:

```text
PNG
JPG/JPEG
PDF de una página
```

la UI propone mesas detectadas sobre el plano y, cuando sea posible, su numeración.

La detección **no crea mesas definitivas sin revisión humana**.

### 19.2 Pipeline

```text
archivo
→ normalización/rasterización
→ detección geométrica
→ OCR
→ combinación geometría + texto
→ normalización 0..1
→ propuesta editable
→ revisión ADMIN
→ importación transaccional
```

Tecnología objetivo frontend:

```text
PDF.js       rasterización PDF
OpenCV.js    contornos/círculos/geometría
Tesseract.js OCR
Web Worker   aislamiento de CPU
React-Konva  revisión/edición visual
```

No se requiere servicio ML ni modelo entrenado para V1.

### 19.3 Authority boundary

Los resultados locales son **propuestas no confiables**.

Backend valida al publicar:

- evento;
- `FileAsset` asociado;
- número máximo de mesas por importación;
- etiqueta única;
- shape permitido;
- capacidad;
- geometría normalizada;
- duplicados;
- ownership ADMIN;
- estado del evento cuando aplique.

### 19.4 Publicación

Contrato arquitectónico obligatorio:

```http
POST /api/v1/admin/events/{eventId}/tables/import
Idempotency-Key: <key>
```

Body conceptual:

```json
{
  "source_file_id": "uuid",
  "tables": [
    {
      "client_ref": "det-1",
      "label": "Mesa 12",
      "shape": "ROUND",
      "capacity": 10,
      "position_x": "0.42",
      "position_y": "0.35",
      "width": "0.08",
      "height": "0.08"
    }
  ]
}
```

Semántica:

```text
all-or-nothing
```

Si una propuesta es inválida, no se publica un subconjunto silenciosamente.

Response debe mapear:

```text
client_ref -> event_table_id
```

para reconciliar canvas.

El análisis CV/OCR no necesita endpoint backend en V1.

### 19.5 Revisión humana

Estados frontend transitorios:

```text
IDLE
PROCESSING
REVIEW
PUBLISHING
FAILED
```

No se persisten como estado de dominio.

ADMIN puede:

- borrar falso positivo;
- agregar mesa no detectada;
- mover/redimensionar;
- corregir número;
- cambiar capacidad;
- cambiar forma;
- publicar.

La confianza OCR nunca es autoridad.

---

## 20. Concurrencia de mesas

El frontend puede mostrar disponibilidad casi en tiempo real, pero el commit es server-side.

Caso:

```text
capacidad disponible = 1
A confirma
B confirma simultáneamente
```

Solo una asignación persiste.

Error del segundo:

```text
409 TABLE_CAPACITY_CHANGED
```

No se permite `occupied > capacity`.

---

## 21. Realtime

### 21.1 Decisión V1

REST es la autoridad.

La sincronización productiva inicial de mesas usa polling controlado de 3–5 s mientras la pantalla está activa, conforme a NFR.

Esto evita introducir infraestructura de WebSocket/pubsub sin necesidad demostrada.

El frontend ya posee un adapter de eventos; en producción ese adapter debe alimentarse del backend y **no simular éxito**.

### 21.2 Envelope compatible

Tipos mínimos:

```text
table.created
table.updated
table.deleted
table.blocked
table.unblocked
table.assignment.changed
seating.layout.updated
```

Payload público de asignación:

```json
{
  "table_id": "uuid",
  "occupied": 6,
  "available": 4,
  "status": "AVAILABLE"
}
```

Nunca incluye PII ajena.

### 21.3 Evolución

SSE/WebSocket solo se introduce mediante ADR cuando:

- polling genere carga medible;
- se necesite latencia menor;
- exista mecanismo cross-instance confiable.

El dominio y contratos de mutación no cambian por el transporte realtime.

---

## 22. Platillos

`MealOption` pertenece a evento.

`MealSelection` pertenece a `GroupMember`.

Backend valida:

- mismo evento;
- miembro activo;
- opción activa;
- deadline;
- ownership o ADMIN override;
- motivo en override.

No hardcodear `traditional/vegan`.

---

## 23. Termos

Estado:

```text
LOCKED
AVAILABLE
REQUESTED
IN_PRODUCTION
DELIVERED
```

La elegibilidad se consulta al dominio financiero; Thermo no recalcula deuda por su cuenta.

Transiciones inválidas se rechazan server-side.

Al entrar `IN_PRODUCTION`, campos no permitidos dejan de ser editables.

Entrega es operación ADMIN auditable.

---

## 24. Reportes y exports

### 24.1 Read side

Reports es read-only respecto al dominio.

Puede consultar múltiples tablas mediante queries optimizadas/proyecciones, pero no alterar entidades.

### 24.2 Excel requerido por evento

El export operativo debe poder derivar, como mínimo:

```text
mesa
número de contrato/folio
nombre
adultos
niños
sin cena
detalle/total de abonos
total a pagar
total abonado
saldo pendiente
platillos vegetarianos
platillos veganos
datos generales del evento
```

Los valores derivan de fuente transaccional, no de estado UI.

### 24.3 ExportJob

Exports rápidos pueden responder síncronos.

Cuando el volumen supere la ventana HTTP, usar:

```text
ExportJob
PENDING -> RUNNING -> COMPLETED | FAILED
```

El archivo resultante vive en storage privado con TTL.

`ExportJob` debe añadirse al modelo de datos si se activa modo async.

Mitigar formula injection en XLSX/CSV.

---

## 25. Auditoría

`AuditLog` es append-only.

Una operación sensible registra:

```text
actor
actor_type
event_id
action
entity_type
entity_id
before
after
reason
request_id
timestamp
```

Para operaciones críticas, el audit se escribe en la misma transacción cuando sea técnicamente viable.

Debe auditarse como mínimo:

- aceptación contractual;
- cambios contractuales/lugares;
- pagos manuales;
- approve/reject submission;
- ajustes;
- refunds;
- penalizaciones;
- cancelaciones;
- cambios de policy;
- asignación/reasignación de mesa;
- importación de croquis;
- override de platillo;
- transiciones/entrega de termo;
- estados de evento;
- cambios ADMIN sensibles.

Nunca auditar secretos o password/token plano.

---

## 26. Jobs

Procesos:

```text
overdue recalculation
late fee application
auto cancellation
notification reminders
export processing/cleanup
payment reconciliation repair
```

No dependen de `setTimeout` de una instancia web.

Arquitectura V1:

```text
trigger cron del entorno
→ endpoint interno/runner no público
→ claim/lock PostgreSQL
→ procesamiento idempotente
```

No se requiere Redis/queue para iniciar.

Si se introduce una cola posteriormente, debe implementarse detrás de `JobDispatcherPort` y conservar la misma semántica idempotente.

---

## 27. Observabilidad

### 27.1 Request context

Cada request obtiene:

```text
request_id
actor_id cuando exista
route
method
status
latency
```

### 27.2 Logs

JSON estructurado.

Prohibido loggear:

- passwords;
- JWT/refresh completos;
- PAN/CVV;
- service keys;
- payloads de evidencia;
- PII innecesaria.

### 27.3 Métricas mínimas

- latency/error rate API;
- conexiones DB;
- deadlocks/serialization retries;
- webhooks recibidos/duplicados/fallidos;
- provider reconciliation failures;
- submissions pendientes;
- jobs fallidos;
- export jobs fallidos;
- errores de asignación por capacidad.

### 27.4 Alertas P0

- webhook/payment processing sostenidamente fallando;
- jobs financieros fallando;
- DB inaccesible;
- tasa anormal de 5xx;
- backup/restore verification fallida.

---

## 28. Backups y DR

DB:

- backup automático;
- baseline diario;
- retención mínima 30 días;
- restore test antes de producción;
- RPO/RTO según NFR.

Storage:

- política de retención por clase de archivo;
- evidencias financieras no se borran ad hoc;
- exports temporales sí pueden expirar.

Un backup sin prueba de restauración no satisface readiness.

---

## 29. Frontend → backend: superficies oficiales

Las rutas siguientes constituyen inventario de superficies aprobadas. No toda ruta implica un endpoint 1:1; una pantalla puede componer varias queries.

| Superficie | Módulos backend |
|---|---|
| `/access` | Identity / Events |
| `/register` | Identity / Memberships |
| `/login` | Identity |
| `/forgot-password*` | Identity |
| `/graduate/events` | Memberships / Events |
| `/graduate` | Memberships + read summary |
| `/graduate/group` | Memberships / Contracts |
| `/graduate/payments` | Finance / Payments / Files |
| `/graduate/contract` | Contracts |
| `/graduate/table` | Seating |
| `/graduate/meals` | Meals |
| `/graduate/thermo` | Thermos / Finance policy |
| `/graduate/more` | Identity / Notifications |
| `/admin` | Reports/read summary |
| `/admin/events` | Events |
| `/admin/events/new` | Events / Catalog / Finance config / Meals / Thermo |
| `/admin/events/:eventId` | Events + read summary |
| `/admin/events/:eventId/graduates*` | Memberships / Contracts / Finance |
| `/admin/events/:eventId/payments` | Finance / Payments |
| `/admin/events/:eventId/tables` | Seating / Files / seating automation |
| `/admin/events/:eventId/meals` | Meals |
| `/admin/events/:eventId/thermos` | Thermos |
| `/admin/events/:eventId/reports` | Reports / Exports |
| `/admin/events/:eventId/settings` | Events |
| `/admin/events/:eventId/settings/cancellation-policy` | Finance cancellation policy |
| `/admin/events/:eventId/audit` | Audit |

Las rutas legacy `/dashboard`, `/layout`, `/meals`, `/payments`, `/thermo`, `/summary` no pueden originar nuevos contratos. Deben converger a las superficies oficiales o retirarse según el roadmap.

---

## 30. Regla para eliminar endpoints sueltos

Antes de crear cualquier controller route, debe existir una fila en `API_ENDPOINT_MATRIX.md` con:

```text
operation_id
actor
frontend_surface
use_case
HTTP method/path
request schema
response schema
domain owner
authorization policy
transaction boundary
idempotency requirement
audit action
errors
tests
```

Un endpoint sin fila:

```text
NO IMPLEMENT
```

Una acción frontend sin operación o caso de uso:

```text
GAP
```

No se resuelve inventando una llamada en el componente.

---

## 31. Estado frontend actual y migración

Actualmente existen:

- fixtures;
- servicios Axios legacy;
- `seatingStore` in-memory;
- adapter realtime simulado;
- rutas legacy.

Regla de migración:

1. conservar frontend visual aprobado;
2. introducir cliente tipado por contrato;
3. sustituir fixture por adapter API feature a feature;
4. mantener mock provider solo bajo flag/entorno demo explícito;
5. nunca hacer fallback silencioso a mock en producción;
6. errores API deben reflejar estado real.

Ejemplo:

```text
SeatingRepository interface
├── MockSeatingRepository (demo/test)
└── HttpSeatingRepository (production)
```

La UI no conoce cuál persiste; configuración de entorno lo decide.

---

## 32. API compatibility y versionado

`/api/v1` es estable.

Cambios no breaking permitidos:

- campo response opcional;
- endpoint nuevo;
- enum nuevo solo si consumidores toleran desconocidos o se coordina versión.

Breaking:

- borrar/renombrar campo;
- cambiar semántica;
- convertir nullable a required;
- cambiar unidad/dinero;
- reutilizar error code con otro significado.

Breaking change requiere:

- actualización OpenAPI;
- frontend coordinado;
- contract tests;
- ADR si modifica frontera arquitectónica.

---

## 33. Database migration strategy

No se migra el schema legacy “en lugar”.

Secuencia:

1. crear nuevas tablas objetivo;
2. backfill si existen datos reales a preservar;
3. adaptar módulos;
4. dual-read únicamente si un ticket lo justifica y con fecha de retiro;
5. cortar legacy;
6. eliminar columna/modelo solo tras verificar referencias.

Migraciones:

- reproducibles desde DB vacía;
- forward-safe;
- revisión de constraints/indexes;
- `prisma validate`;
- test de migración en CI.

No hacer `db push` como mecanismo productivo.

---

## 34. Constraints que deben existir en DB

La aplicación valida primero; PostgreSQL vuelve a proteger.

Mínimos:

- email normalizado único;
- membership única por account/event;
- folio único;
- una asignación activa por GroupMember;
- label de mesa única por evento;
- amounts positivos;
- provider transaction única;
- una transaction por submission;
- policy version única;
- idempotency scope/key único;
- event access code hash único;
- estados históricos con FK restrictiva.

Capacidad de mesa/evento es invariante agregada y requiere transacción/lock además de constraints simples.

---

## 35. Seguridad de Supabase

Supabase se usa como infraestructura, no como segundo backend.

Reglas:

- Data API no es superficie del frontend;
- `service_role`/secret key solo backend;
- tablas de negocio no se conceden a roles públicos;
- buckets de evidencia privados;
- URLs firmadas cortas;
- si una tabla/schema se expone, RLS debe habilitarse y probarse;
- views de un schema expuesto requieren `security_invoker` o aislamiento/revocación equivalente;
- cambios de Supabase deben verificarse contra documentación/changelog vigente al implementarse.

---

## 36. Entornos

Mínimos:

```text
local
preview/demo
production
```

Aislamiento:

- DB;
- storage;
- payment credentials;
- webhook secrets;
- email;
- JWT/refresh secrets.

`preview/demo` puede utilizar mocks frontend, pero debe indicarlo explícitamente y nunca mezclar credenciales productivas.

---

## 37. Configuración

Variables server-side tipadas y validadas al boot.

Fallo de configuración crítica:

```text
fail fast
```

No arrancar con:

- DB URL faltante;
- JWT secret faltante;
- proveedor habilitado sin credenciales;
- storage habilitado sin credenciales.

El frontend solo recibe variables públicas explícitas.

---

## 38. Testing architecture

Pirámide:

### Unit

- policies;
- money/calculations;
- state transitions;
- cancellation ranges;
- seating geometry validators.

### Application integration

- casos de uso con DB real PostgreSQL de test;
- transaction rollback;
- idempotency;
- concurrency.

### API contract

- OpenAPI;
- status/errors;
- ownership;
- DTO rejection.

### Provider integration

- adapters con sandbox/mocks controlados;
- webhook verification;
- normalization.

### E2E

Flujos:

```text
registro contextual
→ contrato
→ grupo
→ pago
→ desbloqueos
→ mesa
→ platillos
→ termo
→ reportes ADMIN
```

### P0 concurrency/security

- 2 usuarios / 1 lugar de mesa;
- 2 requests / último lugar de evento;
- webhook duplicado;
- approve submission duplicado;
- refund concurrente;
- IDOR;
- role escalation;
- file ownership;
- idempotency key reuse.

---

## 39. Definition of Done backend

Un ticket backend está `DONE` únicamente si:

- tiene requisito/caso de uso identificable;
- aparece en matriz de endpoints si expone API;
- DTO validado;
- guard/policy aplicado;
- invariantes implementadas;
- transacción definida;
- constraints/migration cuando aplica;
- idempotencia cuando aplica;
- auditoría cuando aplica;
- error codes estables;
- tests unit/integration/contract;
- OpenAPI actualizado;
- no rompe frontend aprobado;
- lint/typecheck/test/build pasan.

---

## 40. Protocolo obligatorio para agentes

Antes de escribir código:

```text
1. leer docs/INDEX.md
2. leer docs/SYSTEM_ARCHITECTURE.md
3. localizar FR/BR/role aplicable
4. localizar pantalla/acción
5. localizar operationId en API_ENDPOINT_MATRIX/OpenAPI
6. localizar entidad/invariante
7. definir transaction boundary
8. listar errores
9. listar audit/event side effects
10. implementar
11. probar
12. actualizar trazabilidad
```

El agente debe detener **solo la parte afectada** si encuentra contradicción normativa; no debe elegir arbitrariamente una versión.

Prohibido al agente:

- crear endpoint para “hacer funcionar la UI” sin contrato;
- usar fixture como requisito;
- agregar tabla por conveniencia sin modelo;
- meter Prisma en controller;
- duplicar cálculo financiero en otro módulo;
- introducir Redis, microservicio, queue, Supabase Auth o framework nuevo sin ADR;
- cambiar enum/semántica pública silenciosamente.

---

## 41. Secuencia de producción del backend

### Fase A — cierre contract-first

1. `DOMAIN_MODEL.md`
2. endurecer `DATA_MODEL.md`
3. `API_ENDPOINT_MATRIX.md`
4. `API_CONTRACT.openapi.yaml`
5. `AUTHORIZATION_MATRIX.md`
6. `STATE_MACHINES.md`
7. `ERROR_CONTRACT.md`

No implementar módulos de negocio productivos antes de cerrar A.

### Fase B — foundation

- config;
- request context;
- errors;
- Prisma;
- auth/session;
- idempotency;
- audit;
- files.

### Fase C — core comercial

- events;
- catalog;
- memberships;
- contracts;
- group.

### Fase D — finance/payments

- plans/installments;
- submissions/manual;
- Mercado Pago;
- OpenPay adapter;
- penalties/cancellations/refunds.

### Fase E — operación

- seating + import automatizado;
- meals;
- thermos.

### Fase F — reporting/operations

- reports;
- exports;
- notifications;
- jobs;
- reconciliation.

### Fase G — hardening

- concurrency;
- security;
- load;
- DR;
- observability;
- E2E;
- production readiness.

---

## 42. Decisiones arquitectónicas cerradas

| Decisión | Resultado |
|---|---|
| arquitectura backend | modular monolith NestJS |
| DB | PostgreSQL administrado en Supabase vía Prisma |
| acceso DB frontend | prohibido |
| Auth | NestJS JWT + refresh sessions propias |
| Supabase Auth | fuera |
| storage | adapter backend, target Supabase Storage privado |
| pagos | Mercado Pago primario, OpenPay secundario |
| ledger | propio, inmutable por movimientos |
| croquis | React-Konva + coordenadas normalizadas |
| auto croquis V1 | PDF.js + OpenCV.js + Tesseract.js en Web Worker |
| publicación detección | revisión humana + import transaccional |
| realtime V1 | REST + polling 3–5s |
| queue/Redis | no requerido inicialmente |
| jobs | durable trigger + DB claim/idempotencia |
| microservicios | no |
| API | REST `/api/v1`, contract-first/OpenAPI |
| mocks | solo demo/test explícito |

---

## 43. Gaps de diseño detectados que ya no deben quedar implícitos

El baseline previo no modelaba explícitamente:

1. sesión/refresh revocable;
2. persistencia de idempotency keys;
3. mecanismo seguro del código contextual de evento;
4. job persistente para export async si se habilita;
5. importación final de detección de mesas;
6. frontera production/mock del realtime frontend.

Este documento cierra la arquitectura de dichos puntos. Los documentos especializados deberán incorporar sus schemas/operaciones exactas antes de comenzar su módulo.

---

## 44. Criterio “Backend Ready”

La arquitectura del sistema está definida por este documento, pero el repositorio **no estará listo para empezar implementación masiva del backend** hasta que el tracker `ARCHITECTURE_DELIVERABLES.md` marque como `READY`:

```text
DOMAIN_MODEL
DATA_MODEL
API_ENDPOINT_MATRIX
OpenAPI
AUTHORIZATION_MATRIX
STATE_MACHINES
ERROR_CONTRACT
EVENTS_REALTIME_CONTRACT
INTEGRATIONS
AUDIT_LOG_CONTRACT
BACKEND_TEST_STRATEGY
BACKEND_READY_CHECKLIST
```

Esto evita convertir decisiones pendientes en deuda de código.

---

## 45. Regla final

La arquitectura debe favorecer integridad antes que conveniencia de UI:

```text
backend rejects invalid state
database protects invariants
frontend explains the result
```

Nunca:

```text
frontend assumes success
backend trusts client
database merely stores the assumption
```
