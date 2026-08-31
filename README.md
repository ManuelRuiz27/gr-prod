# Plataforma GR

Sistema para la operación de graduaciones: eventos, graduados, lugares, platillos, planes de pago, cobros, conciliación, reportes y operación administrativa.

> La fuente de verdad del proyecto está en [`docs/INDEX.md`](./docs/INDEX.md). El código legacy no prevalece sobre la documentación vigente.

## Stack objetivo

### Frontend

- React 19
- TypeScript
- Vite 7
- React Router DOM 7
- Tailwind CSS
- Axios
- Vitest + React Testing Library
- Agente principal de desarrollo: **Google Antigravity**

### Backend

- NestJS 11
- TypeScript
- Prisma
- PostgreSQL
- Passport JWT + bcrypt
- Jest + Supertest
- Agente principal de desarrollo: **Codex**

### Infraestructura

- **Supabase PostgreSQL** como base de datos administrada objetivo para ambientes desplegados.
- Prisma permanece como ORM y mecanismo de migraciones.
- NestJS permanece como backend autoritativo.
- Supabase Auth no forma parte del baseline actual.

### Pagos

- **Mercado Pago:** proveedor electrónico primario, con Checkout Pro como flujo principal.
- **OpenPay:** proveedor electrónico secundario.
- El módulo OpenPay existente en `backend/src/payments/` es legacy/provisional y deberá converger al dominio financiero documentado.

No se almacenan datos de tarjeta en Plataforma GR y no se construirá una pasarela o wallet propia.

## Arquitectura

```text
React / Vite
     ↓
NestJS API
     ↓
Prisma
     ↓
Supabase PostgreSQL

NestJS
 ├── Mercado Pago
 └── OpenPay
```

El frontend no debe acceder directamente a tablas financieras ni contener secretos server-side.

## Ownership de agentes

```text
Google Antigravity → frontend/** + QA visual
Codex              → backend/** + Prisma + seguridad + integraciones server-side
```

Reglas:

- [`docs/TECH_STACK.md`](./docs/TECH_STACK.md)
- [`docs/REPOSITORY_SOURCE_OF_TRUTH.md`](./docs/REPOSITORY_SOURCE_OF_TRUTH.md)
- [`.agents/rules/gr-project.md`](./.agents/rules/gr-project.md)
- [`.agents/rules/gr-frontend.md`](./.agents/rules/gr-frontend.md)
- [`.agents/rules/gr-backend.md`](./.agents/rules/gr-backend.md)

## Estado del repositorio

El repositorio parte de un Alpha/prototipo funcional. La estrategia es **reutilizar y refactorizar**, no reconstruir desde cero.

Elementos legacy relevantes:

- autenticación ligada directamente a `Graduate`;
- modelo financiero plano `Payment`;
- integración directa OpenPay;
- contratos frontend acoplados al backend legacy;
- croquis/mesas anteriores al modelo normativo vigente.

La evolución se ejecuta conforme a [`docs/ROADMAP_IMPLEMENTATION.md`](./docs/ROADMAP_IMPLEMENTATION.md).

## Desarrollo local

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Verificación

### Backend

```bash
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
npx prisma validate
```

### Frontend

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Documentación

Comenzar siempre por [`docs/INDEX.md`](./docs/INDEX.md). Para decisiones de stack e infraestructura consultar [`docs/TECH_STACK.md`](./docs/TECH_STACK.md).
