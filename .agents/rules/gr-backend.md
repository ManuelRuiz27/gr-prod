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
docs/ARCHITECTURE_DELIVERABLES.md
docs/TECH_STACK.md
```

Después localizar FR/BR, permisos, dominio, modelo y contrato API aplicables.

## Gate contract-first

No crear un endpoint si no existe:

```text
requirement
→ use case
→ API_ENDPOINT_MATRIX/OpenAPI
→ authorization
→ domain invariant
→ transaction
→ persistence
→ audit/effects
→ tests
```

Mientras `API_ENDPOINT_MATRIX.md` y `API_CONTRACT.openapi.yaml` estén `TODO`, no inventar contratos para hacer funcionar una pantalla.

## Arquitectura

- Backend autoritativo: NestJS.
- Persistencia: Prisma/PostgreSQL.
- Arquitectura: modular monolith.
- Nuevo código: `api -> application -> domain -> infrastructure`.
- Controllers no contienen reglas.
- Prisma no se usa directamente desde controllers.
- Un módulo no escribe tablas de otro módulo por conveniencia.
- Operaciones multi-entidad críticas usan transaction boundary explícito.
- No introducir microservicios, Redis, queue, Supabase Auth o framework adicional sin ADR.
- Frontend no accede directamente a tablas financieras ni de dominio.

## Finanzas

- `FINANCIAL_DOMAIN.md` y `DATA_MODEL.md` son obligatorios.
- Mercado Pago primario; OpenPay secundario, ambos detrás de adapter.
- Return URL no confirma pago.
- Webhooks: verificar, deduplicar, confirmar server-to-server.
- Movimientos confirmados no se editan destructivamente.
- Idempotencia no depende de memoria del proceso.

## Seating

- `GroupMember -> EventTable`.
- Sin silla.
- Ocupación derivada.
- Concurrencia protegida por DB.
- Auto-detección de croquis sigue `SEATING_AUTOMATION_CONTRACT.md`.
- El análisis CV/OCR es propuesta frontend; publicación final se revalida y persiste server-side.
- Payload realtime público no incluye PII de terceros.

## Seguridad

- Secrets server-side.
- JWT/refresh/session según `SYSTEM_ARCHITECTURE.md`.
- DTO whitelist.
- AuthZ/ownership server-side.
- Evidencias en storage privado.
- Audit append-only.
- Nunca loggear passwords, tokens, PAN/CVV o secrets.

## Verificación

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

También deben pasar contract/concurrency/security tests definidos para el ticket.

Reportar únicamente ejecuciones reales.
