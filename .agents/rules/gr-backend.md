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
docs/ARCHITECTURE_DELIVERABLES.md
docs/TECH_STACK.md
```

Después localizar FR/BR/AC, permisos, modelo de datos y contrato API aplicables.

## Gate contract-first

No crear un endpoint si no existe:

```text
requirement
→ use case
→ aggregate/policy
→ API_ENDPOINT_MATRIX/OpenAPI
→ authorization
→ domain invariant
→ transaction/locks
→ persistence
→ audit/effects
→ tests
```

Mientras `API_ENDPOINT_MATRIX.md` y `API_CONTRACT.openapi.yaml` estén `TODO`, no inventar contratos para hacer funcionar una pantalla.

## Dominio

- `docs/DOMAIN_MODEL.md` define aggregates, entidades, value objects, policies, ownership y límites transaccionales.
- No crear un aggregate, tabla o nueva fuente de verdad por conveniencia sin actualizar primero los artefactos normativos correspondientes.
- Los repositories devuelven tipos de dominio, no modelos Prisma hacia controllers.
- Datos derivados como saldo, ocupación, disponibilidad y progreso no se convierten en campos editables autoritativos.
- Reglas/fórmulas deben vivir en el aggregate/policy dueño; no duplicarlas entre módulos.
- Si una operación toca varios aggregates, Application coordina una `UnitOfWork` explícita.

## Arquitectura

- Backend autoritativo: NestJS.
- Persistencia: Prisma/PostgreSQL.
- Arquitectura: modular monolith.
- Nuevo código: `api -> application -> domain -> infrastructure`.
- Controllers no contienen reglas.
- Prisma no se usa directamente desde controllers.
- Un módulo no escribe tablas de otro módulo por conveniencia.
- Operaciones multi-entidad críticas usan transaction boundary explícito.
- No mantener locks DB durante llamadas externas lentas; persistir intent/resultados en transacciones separadas.
- No introducir microservicios, Redis, queue, Supabase Auth o framework adicional sin ADR.
- Frontend no accede directamente a tablas financieras ni de dominio.

## Finanzas

- `DOMAIN_MODEL.md`, `FINANCIAL_DOMAIN.md` y `DATA_MODEL.md` son obligatorios.
- Mercado Pago primario; OpenPay secundario, ambos detrás de adapter.
- Return URL no confirma pago.
- Webhooks: verificar, deduplicar, confirmar server-to-server.
- Movimientos confirmados no se editan destructivamente.
- Idempotencia no depende de memoria del proceso.
- Un pago confirmado nunca se descarta para preservar capacidad; si existe conflicto comercial se conserva el dinero y se deriva a reconciliación sin sobreventa.

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
- JWT/refresh/session según `SYSTEM_ARCHITECTURE.md` y `DOMAIN_MODEL.md`.
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
