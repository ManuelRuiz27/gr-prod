---
description: Reglas de desarrollo backend para Codex en Plataforma GR
---

# Reglas de Backend para Plataforma GR

Aplicable a `backend/**` y `backend/prisma/**`.

## Lectura obligatoria

Antes de implementar:

```text
docs/INDEX.md
docs/SYSTEM_ARCHITECTURE.md
docs/DOMAIN_MODEL.md
docs/DATA_MODEL.md
docs/API_ENDPOINT_MATRIX.md
docs/ARCHITECTURE_DELIVERABLES.md
docs/TECH_STACK.md
```

Después localizar FR/BR/AC, permisos y contrato OpenAPI aplicables.

## Gate contract-first

No crear endpoint si no existe la cadena:

```text
requirement
→ use case
→ aggregate/policy
→ DATA_MODEL tables/constraints
→ API_ENDPOINT_MATRIX operationId
→ OpenAPI operationId
→ authorization
→ transaction/locks
→ audit/outbox
→ tests
```

`API_ENDPOINT_MATRIX.md` está `READY`. Mientras `API_CONTRACT.openapi.yaml` esté `TODO`, no implementar controllers/rutas productivas ni congelar request/response schemas por inferencia.

## API

- `docs/API_ENDPOINT_MATRIX.md` es la fuente canónica de rutas/operationId hasta que OpenAPI materialice exactamente esas operaciones.
- No crear aliases por comodidad.
- No duplicar una operación en variantes global/event-scoped si la matriz eligió una sola ruta.
- No implementar rutas de `API_CONTRACTS.md` que contradigan la matriz.
- Un componente, fixture o mock no crea endpoint.
- `/me/*` obtiene account/ownership de sesión.
- `/admin/*` exige `ADMIN`.
- `eventId` en URL no concede ownership.
- Operaciones `REQ` exigen `Idempotency-Key`; no persistir tokens, códigos secretos o signed URLs en respuesta idempotente.
- Webhooks usan dedupe externo, no `Idempotency-Key` del cliente.
- OCR/CV no tiene analysis endpoint; solo `adminImportDetectedTables` publica el resultado revisado.
- Rutas legacy `/dashboard`, `/layout`, `/meals`, `/payments`, `/thermo`, `/summary` son `NO CONTRACT`.

## Dominio

- `docs/DOMAIN_MODEL.md` define aggregates, entidades, value objects, policies, ownership y límites transaccionales.
- No crear un aggregate o nueva fuente de verdad por conveniencia.
- Repositories devuelven tipos de dominio, no modelos Prisma hacia controllers.
- Datos derivados como saldo, ocupación, disponibilidad, installment visual state y progreso no son campos editables autoritativos.
- Reglas/fórmulas viven en el aggregate/policy dueño.
- Operaciones multi-aggregate usan `UnitOfWork` explícita.

## Persistencia

- `docs/DATA_MODEL.md` 2.0 es la fuente de verdad para el schema objetivo.
- `backend/prisma/schema.prisma` actual es legacy hasta migración controlada.
- PostgreSQL target: schema privado de aplicación; frontend nunca accede directamente.
- Dinero: `NUMERIC/Decimal`, nunca Float.
- Geometría: decimal normalizado `0..1`.
- No persistir `Table FULL/PARTIAL`, `Installment PAID/OVERDUE` o `Thermo LOCKED/AVAILABLE` como verdad mutable.
- Same-event FKs/constraints deben reforzar aislamiento cuando `DATA_MODEL` lo exige.
- Partial indexes, CHECK constraints y triggers SQL siguen siendo obligatorios aunque Prisma no los exprese.
- No usar `prisma db push` para producción.
- No hard-delete historia contractual/financiera/audit.
- No usar `ON DELETE CASCADE` para efectos de negocio.

## Migración legacy

No reescribir destructivamente el schema actual.

```text
create target schema/tables
→ inventory/backfill validado
→ repositories nuevos
→ cutover
→ legacy read-only
→ retire después de reconciliación/QA/backup
```

No inferir aceptación contractual, clasificación de productos, pagos confirmados, meal catalog ni assignments desde legacy sin evidencia/regla.

## Arquitectura

- Backend autoritativo: NestJS.
- Persistencia: Prisma/PostgreSQL.
- Arquitectura: modular monolith.
- Nuevo código: `api -> application -> domain -> infrastructure`.
- Controllers no contienen reglas.
- Prisma no se usa directamente desde controllers.
- Un módulo no escribe tablas de otro módulo por conveniencia.
- No mantener locks DB durante llamadas externas lentas.
- No introducir microservicios, Redis, queue, Supabase Auth o framework adicional sin ADR.
- Outbox PostgreSQL no implica broker externo ni event sourcing.

## Finanzas

- `DOMAIN_MODEL.md`, `FINANCIAL_DOMAIN.md`, `DATA_MODEL.md` y `API_ENDPOINT_MATRIX.md` son obligatorios.
- Mercado Pago primario; OpenPay secundario, detrás de adapter.
- Return URL no confirma pago.
- Webhooks: verificar, deduplicar, confirmar server-to-server.
- Movimientos confirmados no se editan destructivamente.
- Idempotencia usa `IdempotencyRecord`, no memoria.
- Refunds preservan cobro/allocation original mediante `RefundSource` y `PaymentAllocationReversal`.
- `requested_amount`/`amount` del cliente son intención; backend valida y asigna.
- Pago externo confirmado nunca se descarta para preservar capacidad; conservar dinero y abrir reconciliación sin sobreventa.

## Seating

- `GroupMember -> EventTable`.
- Sin silla.
- Ocupación derivada desde `TableAssignment`.
- Concurrencia protegida por locks DB.
- Auto-detección sigue `SEATING_AUTOMATION_CONTRACT.md`.
- CV/OCR es propuesta frontend; publicación final se revalida server-side.
- Payload realtime público no incluye PII de terceros.

## Seguridad

- Secrets server-side.
- JWT/refresh/session según Architecture/Domain/Data Model.
- DTO whitelist.
- AuthZ/ownership server-side.
- Evidencias en storage privado.
- Audit append-only con guard DB.
- Nunca loggear passwords, tokens, PAN/CVV o secrets.

## Verificación de schema

Cuando se implemente persistencia:

```bash
cd backend
npx prisma format
npx prisma validate
npx prisma migrate dev --name <meaningful_name>
```

Revisar `migration.sql`; incluir manualmente partial indexes, CHECK constraints, immutable guards/triggers y schema hardening cuando aplique.

## Verificación general

Antes de DONE, cuando aplique:

```bash
cd backend
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
npx prisma validate
```

También deben pasar DB constraint/concurrency/security/contract tests del `operationId` correspondiente.

Reportar únicamente ejecuciones reales.
