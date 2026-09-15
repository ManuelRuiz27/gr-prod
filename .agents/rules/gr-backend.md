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
docs/API_CONTRACT.openapi.yaml
docs/AUTHORIZATION_MATRIX.md
docs/STATE_MACHINES.md
docs/ERROR_CONTRACT.md
docs/ARCHITECTURE_DELIVERABLES.md
docs/TECH_STACK.md
```

Para seating leer además, en este orden:

```text
docs/SEATING_CATALOG_CONTRACT.md
docs/SEATING_QUANTITY_CONTRACT.md
docs/SEATING_MAP.md
```

`SEATING_AUTOMATION_CONTRACT.md` es histórico/RETIRED.

## Gate contract-first

No crear endpoint si no existe la cadena:

```text
requirement
→ use case
→ aggregate/policy
→ DATA_MODEL tables/constraints
→ API contract
→ authorization
→ transaction/locks
→ audit/outbox
→ tests
```

Los contratos canónicos están READY, salvo en seating donde `SEATING_CATALOG_CONTRACT.md` es una adenda posterior y tiene precedencia sobre las operaciones dinámicas retiradas que aún puedan aparecer en artefactos históricos.

## API

- No crear aliases por comodidad.
- `/me/*` obtiene account/ownership de sesión.
- `/admin/*` exige `ADMIN`.
- `eventId` en URL no concede ownership.
- Operaciones `REQ` exigen `Idempotency-Key`; no persistir tokens/códigos/signed URLs en replay.
- Webhooks usan dedupe externo.
- Fixtures/mocks/componentes no crean endpoints.

### Seating — superficie vigente

Se conservan lectura, selección de plantilla, block/unblock y asignación/allocations.

Quedan **RETIRED / DO NOT IMPLEMENT / DO NOT EXPAND**:

```text
adminUploadSeatingBackground
adminRemoveSeatingBackground
adminCreateTable
adminBulkCreateTables
adminImportDetectedTables
adminUpdateTable para geometry/label/capacity estructural
adminDeleteTable para modificar estructura del catálogo
```

Si código legacy de esas operaciones sigue presente, no se usa como fuente contractual y debe clasificarse `REMOVE` en la limpieza correspondiente.

`adminUpdateSeatingMap` solo puede asociar `template_id` + `template_version` y metadata expresamente permitida; no es editor de layout.

## Dominio

- `DOMAIN_MODEL.md` define aggregates, policies, ownership e invariantes.
- No crear una fuente de verdad por conveniencia.
- Repositories devuelven tipos de dominio, no Prisma a controllers.
- Datos derivados como saldo, ocupación, disponibilidad y estados visuales no son editables autoritativamente.
- Operaciones multi-aggregate usan transacción/UnitOfWork explícita.

## Persistencia

- `DATA_MODEL.md` define schema objetivo.
- Dinero: `NUMERIC/Decimal`, nunca Float.
- Geometría: normalizada `0..1`.
- No persistir `Table FULL/PARTIAL`, `Installment PAID/OVERDUE` o `Thermo LOCKED/AVAILABLE` como verdad mutable.
- Same-event constraints, partial indexes, CHECKs y triggers siguen siendo obligatorios aunque Prisma no los exprese.
- No usar `prisma db push` para producción.
- No hard-delete historia contractual/financiera/audit.

## Arquitectura

- Backend autoritativo: NestJS.
- Persistencia: Prisma/PostgreSQL.
- Arquitectura: modular monolith.
- Nuevo código: `api -> application -> domain -> infrastructure`.
- Controllers no contienen reglas ni Prisma directo.
- No mantener locks DB durante llamadas externas lentas.
- No introducir microservicios, Redis, broker o framework adicional sin ADR.

## Finanzas

- Mercado Pago primario; OpenPay secundario detrás de adapter.
- Return URL no confirma pago.
- Webhooks: verificar, deduplicar, confirmar server-to-server.
- Movimientos confirmados no se editan destructivamente.
- Idempotencia usa `IdempotencyRecord`.
- Pago externo confirmado no se descarta para preservar capacidad; conservar dinero y abrir reconciliación sin sobreventa.

## Seating

- El origen del layout es un catálogo semi-fijo/versionado de plantillas precargadas.
- No existe upload arbitrario de croquis en runtime.
- No existe OCR/CV/detección/importación automática.
- No existe editor estructural de mesas en runtime.
- El catálogo define `template_id`, `template_version`, `template_key`, asset y geometría base.
- Plantilla sin capacidades verificadas no puede activarse operativamente.
- Backend valida plantilla/version y materializa/relaciona `EventTable`.
- Ocupación/disponibilidad son backend-authoritative.
- Asignación por cantidades sigue `SEATING_QUANTITY_CONTRACT.md`.
- Sin silla individual.
- Concurrencia protegida por locks DB.
- Realtime público no incluye PII de terceros.
- Cambiar plantilla con ocupación existente requiere migración explícita; nunca edición silenciosa.

## Seguridad

- Secrets server-side.
- DTO whitelist.
- AuthZ/ownership server-side.
- Evidencias privadas.
- Audit append-only.
- Nunca loggear passwords, tokens, PAN/CVV o secrets.

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

Reportar únicamente ejecuciones reales.
