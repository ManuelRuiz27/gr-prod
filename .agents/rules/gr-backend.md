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
docs/ARCHITECTURE_DELIVERABLES.md
docs/TECH_STACK.md
```

Después localizar FR/BR/AC, permisos y contrato API aplicables.

## Gate contract-first

No crear un endpoint si no existe:

```text
requirement
→ use case
→ aggregate/policy
→ DATA_MODEL tables/constraints
→ API_ENDPOINT_MATRIX/OpenAPI
→ authorization
→ transaction/locks
→ audit/outbox
→ tests
```

Mientras `API_ENDPOINT_MATRIX.md` y `API_CONTRACT.openapi.yaml` estén `TODO`, no inventar contratos para hacer funcionar una pantalla.

## Dominio

- `docs/DOMAIN_MODEL.md` define aggregates, entidades, value objects, policies, ownership y límites transaccionales.
- No crear un aggregate o nueva fuente de verdad por conveniencia.
- Los repositories devuelven tipos de dominio, no modelos Prisma hacia controllers.
- Datos derivados como saldo, ocupación, disponibilidad, installment visual state y progreso no se convierten en campos editables autoritativos.
- Reglas/fórmulas viven en el aggregate/policy dueño; no duplicarlas entre módulos.
- Si una operación toca varios aggregates, Application coordina una `UnitOfWork` explícita.

## Persistencia

- `docs/DATA_MODEL.md` 2.0 es la fuente de verdad para el schema objetivo.
- El `backend/prisma/schema.prisma` actual es legacy hasta migración controlada; no usarlo para deducir dominio nuevo.
- PostgreSQL target: schema privado de aplicación; frontend nunca accede directamente.
- Dinero: `NUMERIC/Decimal`, nunca Float.
- Geometría de croquis: decimal normalizado `0..1`, nunca Float como fuente final.
- No persistir `Table FULL/PARTIAL`, `Installment PAID/OVERDUE` o `Thermo LOCKED/AVAILABLE` como verdad mutable.
- Same-event FKs/constraints deben reforzar aislamiento cuando `DATA_MODEL` lo exige.
- Partial indexes, CHECK constraints y triggers SQL siguen siendo obligatorios aunque Prisma no los pueda expresar como annotation.
- No usar `prisma db push` para producción.
- No hard-delete historia contractual/financiera/audit.
- No usar `ON DELETE CASCADE` para ejecutar efectos de negocio.

## Migración legacy

No reescribir destructivamente el schema actual.

Secuencia:

```text
create target schema/tables
→ inventory/backfill validado
→ repositories nuevos
→ cutover
→ legacy read-only
→ retire solo después de reconciliación/QA/backup
```

No inferir:

- aceptación contractual;
- clasificación de productos;
- pagos confirmados;
- meal catalog;
- assignments de todos los invitados;

a partir de campos legacy sin evidencia/regla.

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
- Outbox PostgreSQL definido por `DATA_MODEL` no implica broker externo ni event sourcing.

## Finanzas

- `DOMAIN_MODEL.md`, `FINANCIAL_DOMAIN.md` y `DATA_MODEL.md` son obligatorios.
- Mercado Pago primario; OpenPay secundario, ambos detrás de adapter.
- Return URL no confirma pago.
- Webhooks: verificar, deduplicar, confirmar server-to-server.
- Movimientos confirmados no se editan destructivamente.
- Idempotencia usa `IdempotencyRecord`, no memoria del proceso.
- Refunds preservan cobro/allocation original; usar `RefundSource` y `PaymentAllocationReversal` según modelo.
- Un pago externo confirmado nunca se descarta para preservar capacidad; si existe conflicto comercial se conserva el dinero y se abre reconciliación sin sobreventa.

## Seating

- `GroupMember -> EventTable`.
- Sin silla.
- Ocupación derivada desde `TableAssignment`.
- Concurrencia protegida por locks DB.
- Auto-detección de croquis sigue `SEATING_AUTOMATION_CONTRACT.md`.
- El análisis CV/OCR es propuesta frontend; publicación final se revalida y persiste server-side.
- Payload realtime público no incluye PII de terceros.

## Seguridad

- Secrets server-side.
- JWT/refresh/session según `SYSTEM_ARCHITECTURE.md`, `DOMAIN_MODEL.md` y `DATA_MODEL.md`.
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

Revisar el SQL generado antes de considerar la migration válida.

Debe incluir manualmente cuando corresponda:

```text
partial unique indexes
CHECK constraints
immutable guards/triggers
schema hardening
```

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

También deben pasar DB constraint/concurrency/security/contract tests definidos para el ticket.

Reportar únicamente ejecuciones reales.
