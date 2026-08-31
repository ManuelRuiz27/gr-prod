---
description: Reglas de desarrollo backend para Codex en Plataforma GR
---

# Reglas de Backend para Plataforma GR

Aplicable principalmente a `backend/**` y `backend/prisma/**`.

## Ownership

- **Agente principal:** Codex.
- **Stack obligatorio:** `docs/TECH_STACK.md`.
- **Contratos funcionales:** `/docs` conforme al orden de `docs/INDEX.md`.
- **Código legacy:** reutilizar scaffolding útil, pero no conservar modelos o flujos que contradigan la documentación.

## Arquitectura

- Mantener NestJS como backend autoritativo.
- Mantener Prisma como ORM y mecanismo de migraciones.
- Supabase se usa como PostgreSQL administrado objetivo mediante `DATABASE_URL`; no reemplazar NestJS por acceso directo desde frontend.
- No adoptar Supabase Auth sin cambio documental explícito.
- Mantener lógica de negocio fuera de controllers y adapters de proveedor.

## Dominio financiero

- Implementar según `docs/FINANCIAL_DOMAIN.md` y `docs/DATA_MODEL.md`.
- Mercado Pago es proveedor electrónico primario; OpenPay secundario.
- Ambos deben quedar detrás de una abstracción/adapters de gateway y producir el mismo resultado de dominio.
- No continuar expandiendo el modelo legacy `Payment` como diseño final.
- Nunca almacenar PAN/CVV ni registrar tokens sensibles en logs.
- Nunca confiar en return URLs para confirmar pagos.
- Verificar notificaciones server-to-server según el mecanismo oficial del proveedor.
- Garantizar idempotencia, deduplicación, auditoría y conciliación.
- Transacciones financieras confirmadas no se editan destructivamente.

## Seguridad

- Secrets sólo mediante variables server-side/secret manager.
- No exponer credenciales de DB, `service_role` o private keys al frontend.
- DTO validation obligatoria en entradas públicas.
- Autorización debe ejecutarse server-side.
- Cambios en roles, reembolsos, ajustes y operaciones administrativas deben quedar auditables.

## Verificación

Antes de cerrar trabajo backend ejecutar, cuando aplique:

```bash
cd backend
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
npx prisma validate
```

Reportar únicamente resultados obtenidos de ejecuciones reales.
