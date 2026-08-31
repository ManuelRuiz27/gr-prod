# Guía de Contribución — Plataforma GR

## 1. Fuente de verdad

Antes de modificar código:

1. leer [`docs/INDEX.md`](./docs/INDEX.md);
2. leer [`docs/TECH_STACK.md`](./docs/TECH_STACK.md);
3. consultar el documento funcional correspondiente al ticket;
4. revisar [`docs/REPOSITORY_SOURCE_OF_TRUTH.md`](./docs/REPOSITORY_SOURCE_OF_TRUTH.md) para distinguir código reutilizable de legacy.

El código existente no prevalece sobre `/docs`.

## 2. Ownership

```text
Google Antigravity → frontend/** y QA visual
Codex              → backend/**, Prisma, seguridad e integraciones server-side
```

Reglas específicas:

- `.agents/rules/gr-project.md`
- `.agents/rules/gr-frontend.md`
- `.agents/rules/gr-backend.md`

Si un cambio requiere cruzar superficies, el ticket debe autorizarlo explícitamente. No resolver un bloqueo backend simulando reglas en frontend.

## 3. Estrategia Git vigente

La estrategia actual del proyecto es:

```text
main
```

Trabajar directamente sobre `main` con cambios pequeños y commits verificables.

No crear ramas ni Pull Requests salvo instrucción explícita posterior.

## 4. Commits

Usar Conventional Commits:

```text
<tipo>(<scope>): <descripción>
```

Ejemplos:

```text
feat(frontend): add event graduate management
fix(payments): enforce idempotent provider events
docs(stack): define Supabase PostgreSQL target
refactor(auth): separate account from membership
```

Tipos habituales:

- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`

## 5. Stack obligatorio

No sustituir tecnologías sin decisión documental previa.

```text
Frontend: React + TypeScript + Vite + React Router + Tailwind
Backend:  NestJS + TypeScript + Prisma
Database: PostgreSQL; Supabase PostgreSQL como objetivo administrado
Payments: Mercado Pago primario + OpenPay secundario
```

Supabase no sustituye NestJS. Supabase Auth no forma parte del baseline vigente.

## 6. Seguridad

Antes de commit verificar:

- no existen credenciales reales;
- no existen private keys de Mercado Pago/OpenPay;
- no existe `service_role` de Supabase en frontend;
- no existen connection strings de producción;
- PAN/CVV nunca se persisten ni registran;
- reglas financieras no dependen de datos manipulables por cliente;
- webhooks y pagos se implementan conforme a la documentación financiera vigente.

## 7. Verificación frontend

```bash
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build
```

El QA visual sólo puede declararse `PASS` si Antigravity ejecutó realmente Browser sobre la ruta y viewport solicitados.

## 8. Verificación backend

```bash
cd backend
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
npx prisma validate
```

Cuando existan cambios de schema también deberán validarse las migraciones correspondientes.

## 9. Regla de cierre

Un ticket sólo debe reportar resultados realmente ejecutados. No estimar tests, warnings, errores ni validaciones visuales.
