# Repository Source of Truth — Plataforma GR

**Documento:** `REPOSITORY_SOURCE_OF_TRUTH.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.3  
**Estado:** Activo — Baseline M0 Cerrado  
**Fecha:** 26 de agosto de 2026  
**Repositorio oficial:** `https://github.com/ManuelRuiz27/gr-prod.git`  
**Commit histórico auditado:** `5986eb963c0ef66ccec84e5ba4c504617768cc34`  
**Commit de cierre baseline M0:** `42ca9f193cb98e4f5a342ae4efb8d4f4051a80ee`  

---

## 1. Propósito

Este documento establece la radiografía técnica oficial del repositorio existente de **Plataforma GR**, describiendo su stack real, estructura de directorios, módulos y endpoints legados existentes, y clasificando de forma precisa el destino técnico de cada componente frente a la arquitectura objetivo definida en la documentación normativa.

---

## 2. Stack Tecnológico Real

### 2.1 Backend
- **Framework:** NestJS 11
- **Lenguaje:** TypeScript (v5.7+)
- **ORM / Base de Datos:** Prisma 5.22 / PostgreSQL 15+
- **Autenticación / Seguridad:** Passport JWT, `@nestjs/jwt`, `bcrypt`
- **Validación:** `class-validator`, `class-transformer`
- **Pasarela Legacy Actual:** OpenPay Node SDK
- **Testing:** Jest, Supertest, ts-jest

### 2.2 Frontend
- **Framework / Runtime:** React 19
- **Build Tool:** Vite 7
- **Lenguaje:** TypeScript (v5.9+)
- **Enrutamiento:** React Router DOM 7
- **Estilos:** Tailwind CSS 3.4, PostCSS, Autoprefixer
- **Cliente HTTP:** Axios
- **Testing:** Vitest / React Testing Library

---

## 3. Estructura del Repositorio

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml                 # Pipeline CI (Lint, Typecheck, Test, Integration, Build, Migrate)
├── backend/                       # API NestJS + Prisma ORM
│   ├── prisma/
│   │   ├── migrations/            # Migraciones SQL reproducibles
│   │   │   └── 20260824000000_init/migration.sql
│   │   ├── schema.prisma          # Modelo de datos Prisma legacy
│   │   └── seed.ts                # Semilla de desarrollo
│   ├── src/
│   │   ├── auth/                  # Autenticación legacy de graduados
│   │   ├── common/                # Filtros globales (AllExceptionsFilter), middleware (RequestIdMiddleware)
│   │   ├── graduates/             # Gestión de graduados, boletos, invitados, platillos, termo
│   │   ├── layout/                # Croquis y selección de mesas
│   │   ├── payments/              # Pagos y webhooks OpenPay legacy
│   │   ├── prisma/                # PrismaService
│   │   ├── app.controller.ts      # Health check raíz
│   │   ├── app.module.ts          # Módulo raíz NestJS
│   │   └── main.ts                # Bootstrap de aplicación (/api/v1)
│   └── test/                      # Pruebas e2e / integración
├── frontend/                      # Aplicación SPA React + Vite
│   ├── src/
│   │   ├── assets/
│   │   ├── components/            # Componentes UI
│   │   ├── context/               # AuthContext
│   │   ├── lib/                   # Clientes y utilidades
│   │   ├── pages/                 # Páginas (Dashboard, Layout, Login, Meals, Payments, Register, Summary, Thermo)
│   │   ├── services/              # Clientes de API Axios
│   │   ├── App.tsx
│   │   ├── App.test.tsx           # Suite de pruebas unitarias
│   │   └── main.tsx
├── docs/                          # Documentación del proyecto (14 archivos físicos en total)
│   ├── ACCEPTANCE_CRITERIA.md     # Normativo (11)
│   ├── API_CONTRACTS.md           # Normativo (9)
│   ├── BUSINESS_RULES.md          # Normativo (2)
│   ├── DATA_MODEL.md              # Normativo (8)
│   ├── FINANCIAL_DOMAIN.md        # Normativo (6)
│   ├── INDEX.md                   # Índice normativo
│   ├── NON_FUNCTIONAL_REQUIREMENTS.md # Normativo (10)
│   ├── PRODUCT_SCOPE.md           # Normativo (1)
│   ├── REPOSITORY_SOURCE_OF_TRUTH.md  # Radiografía técnica (este documento)
│   ├── ROADMAP_IMPLEMENTATION.md  # Normativo (12)
│   ├── ROLES_PERMISSIONS.md       # Normativo (4)
│   ├── SEATING_MAP.md             # Normativo (7)
│   ├── SRS.md                     # Normativo (3)
│   └── UX_FLOWS.md                # Normativo (5)
└── stitch_gr_prototype/           # Prototipos UI exportados de Stitch
```

---

## 4. Endpoints Reales del Backend Legacy (Actuales)

> [!WARNING]
> Las siguientes rutas HTTP corresponden **exclusivamente al código legacy existente** inventariado en `backend/src/`. No deben interpretarse como los contratos de API finales especificados en [`API_CONTRACTS.md`](./API_CONTRACTS.md).

### 4.1 Root (`src/app.controller.ts`)
- `GET /api/v1/` — Health check básico público.

### 4.2 Auth (`src/auth/auth.controller.ts`)
- `POST /api/v1/auth/graduates/register` — Registro de graduado legacy (público).
- `POST /api/v1/auth/graduates/login` — Autenticación de graduado y emisión de JWT (público).

### 4.3 Graduates (`src/graduates/graduates.controller.ts`)
- `GET /api/v1/graduates/me` — Perfil del graduado autenticado.
- `GET /api/v1/graduates/me/dashboard` — Resumen del estado de pasos del wizard.
- `POST /api/v1/graduates/me/tickets` — Creación del registro inicial de boletos e invitados.
- `GET /api/v1/graduates/me/guests` — Listado de invitados asociados al graduado.
- `POST /api/v1/graduates/me/guests` — Adición de invitados adicionales.
- `PATCH /api/v1/graduates/me/guests/:guestId` — Actualización de nombre y/o platillo de invitado.
- `GET /api/v1/graduates/me/meals` — Resumen de platillos seleccionados.
- `PATCH /api/v1/graduates/me/meals/:guestId` — Actualización del tipo de platillo de un invitado.
- `GET /api/v1/graduates/me/thermo` — Estado del termo personalizado.
- `POST /api/v1/graduates/me/thermo` — Personalización de texto y prefijo de termo.
- `DELETE /api/v1/graduates/me/tickets` — Endpoint utilitario para reset de boletos.

### 4.4 Layout (`src/layout/layout.controller.ts`)
- `GET /api/v1/events/:eventId/layout/overview` — Vista general del croquis y disponibilidad de mesas.
- `POST /api/v1/graduates/me/layout/selection` — Selección/cambio de mesa asignada al graduado.

### 4.5 Payments (`src/payments/payments.controller.ts` & `src/payments/webhooks.controller.ts`)
- `GET /api/v1/payments/config` — Obtención de llaves públicas de OpenPay.
- `GET /api/v1/payments/summary` — Resumen de saldo pagado, pendiente y porcentaje de avance.
- `GET /api/v1/payments/history` — Historial de transacciones de pago del graduado.
- `POST /api/v1/payments/charge` — Creación de cargo con tarjeta vía OpenPay.
- `POST /api/v1/webhooks/openpay` — Webhook de confirmación de eventos de OpenPay (público con validación de firma).

---

## 5. Modelos Prisma Legacy Actuales vs Modelos Objetivo

### 5.1 Modelos Legacy en `backend/prisma/schema.prisma` (Actuales)
- `Event`: Entidad evento básica con precios fijos.
- `Graduate`: Graduado como usuario autenticable, contiene campos de progreso wizard y termo.
- `Table`: Mesa con coordenadas básicas (position_x, position_y, capacity).
- `TableSelection`: Relación 1:1 entre Graduate y Table.
- `Ticket`: Registro del conteo de boletos y precio base.
- `Guest`: Invitado con `meal_type` y campo opcional `seat_number`.
- `Payment`: Registro simple de pago asociado a OpenPay.
- `Thermo`: Registro 1:1 de personalización de termo.

### 5.2 Modelos Objetivo Normados en `docs/DATA_MODEL.md` (Para Milestones M1 a M11)
El refactor gradual por milestones reemplazará el modelo legacy por las entidades normadas:
- **Identidad:** `Account`, `AccountRole` (`ADMIN`, `GRADUATE`), `AccountStatus`, `GraduateMembership`.
- **Evento y Configuración:** `Event`, `EventSettings`, `GroupMember`.
- **Platillos:** `MealOption`, `MealSelection`.
- **Croquis y Mesas:** `SeatingMap`, `EventTable`, `TableAssignment` (asignación de lugares por grupo/graduado según `SEATING_MAP.md`, sin asignación individual de asientos).
- **Financiero:** `PaymentPlan`, `Installment`, `PaymentAttempt`, `PaymentTransaction`, `PaymentAllocation`, `Adjustment`, `Refund`, `PaymentProviderEvent`.
- **Operación y Soporte:** `ThermoRequest`, `Notification`, `FileAsset`, `AuditLog`.

---

## 6. Clasificación del Código Existente

La siguiente tabla resume el estado y la acción futura de cada módulo del código inspeccionado conforme al plan de evolución definido en [`ROADMAP_IMPLEMENTATION.md`](./ROADMAP_IMPLEMENTATION.md) y [`DATA_MODEL.md`](./DATA_MODEL.md):

| Área/Módulo | Estado | Acción futura | Milestone |
|---|---|---|---|
| **NestJS bootstrap** (`main.ts`, `app.module.ts`, `app.controller.ts`) | Activo con middleware `X-Request-Id` y `AllExceptionsFilter` | `ADAPT` | M0 / M1 |
| **PrismaService** (`src/prisma/prisma.service.ts`) | Activo (gestión de conexión ORM a PostgreSQL) | `REUSE` | M0 / M1 |
| **Auth legacy** (`src/auth/`) | Deuda técnica (autenticación ligada directamente al modelo `Graduate`) | `REFACTOR` | M1 |
| **Graduates legacy** (`src/graduates/`) | Deuda técnica (mezcla perfil, boletos, invitados, platillos y termo) | `REFACTOR` | M2 / M5 |
| **Layout legacy** (`src/layout/`) | Deuda técnica (mesas con `TableSelection` 1:1 sin modelo formal de croquis) | `REPLACE` | M4 |
| **Payments legacy core** (`src/payments/payments.*`) | Deuda técnica (modelo plano `Payment` sin planes de pago, parcialidades ni ledger) | `REPLACE` | M3 |
| **OpenPay gateway legacy** (`src/payments/openpay.*`, `webhooks.*`) | Deuda técnica (integración directa legacy y webhooks sin reconciliación) | `REPLACE` | M6 |
| **React / Vite foundation** (`App.tsx`, `main.tsx`, `vite.config.ts`, Tailwind) | Activo (infraestructura SPA moderna en React 19) | `REUSE` | M0 / M7 |
| **Frontend routing & services** (`services/api.ts`, `AuthContext.tsx`) | Deuda técnica (rutas y contratos acoplados al backend legacy) | `ADAPT` | M1 / M7 |
| **Frontend Graduate UI existente** (`pages/`, `components/`) | Deuda técnica (wizard legacy sin validación de reglas de negocio actuales) | `ADAPT` | M7 / M8 |

---

## 7. Riesgos Legacy y Desviaciones Técnicas Identificadas

1. **Pasarela de Pagos (OpenPay):** La integración actual con OpenPay es una implementación legacy provisional. Su mecanismo directo no representa el contrato objetivo transaccional ni de webhooks definido en [`FINANCIAL_DOMAIN.md`](./FINANCIAL_DOMAIN.md) (será reemplazado en M6).
2. **Dominio Financiero:** El modelo `Payment` actual no soporta `PaymentPlan`, `Installment` ni `PaymentAllocation`, por lo que será sustituido íntegramente en el Milestone M3.
3. **Identidad Acoplada:** El modelo `Graduate` actúa actualmente como usuario autenticable, mezclando identidad global con membresía a un evento. En M1 se desacoplará hacia `Account` (identidad y credenciales) y `GraduateMembership` (participación en evento).
4. **Asignación de Mesas:** El modelo `TableSelection` actual asume una relación 1:1 entre graduado y mesa completa, lo cual contradice el modelo normativo de asignación de lugares (`TableAssignment`) especificado en [`SEATING_MAP.md`](./SEATING_MAP.md).
5. **Rutas de API:** Ninguna ruta inventariada en la sección 4 debe asumirse como final; todas convergerán hacia los contratos formales documentados en [`API_CONTRACTS.md`](./API_CONTRACTS.md).

---

## 8. Documentación Vigente y Orden Normativo

El directorio `/docs/` contiene exactamente **14 archivos físicos**:
- **12 documentos normativos** (con orden de precedencia formal establecido por `INDEX.md`):
  1. `PRODUCT_SCOPE.md`
  2. `BUSINESS_RULES.md`
  3. `SRS.md`
  4. `ROLES_PERMISSIONS.md`
  5. `UX_FLOWS.md`
  6. `FINANCIAL_DOMAIN.md`
  7. `SEATING_MAP.md`
  8. `DATA_MODEL.md`
  9. `API_CONTRACTS.md`
  10. `NON_FUNCTIONAL_REQUIREMENTS.md`
  11. `ACCEPTANCE_CRITERIA.md`
  12. `ROADMAP_IMPLEMENTATION.md`
- **1 documento de índice normativo:** `INDEX.md`
- **1 documento de radiografía técnica y Source of Truth del repositorio:** `REPOSITORY_SOURCE_OF_TRUTH.md` (este documento).

*Nota:* Archivos descriptivos o de pruebas en la raíz del repositorio (`ENDPOINTS.md`, `GUIA_PRUEBAS.md`, etc.) son considerados **LEGACY / REFERENCE ONLY** y no invalidan la documentación normativa.

---

## 9. Guía de Ejecución y Desarrollo

### 9.1 Requisitos Previos
- Node.js >= 18.0.0 (Recomendado LTS v20+)
- PostgreSQL >= 15
- npm >= 9.0.0

### 9.2 Configuración de Variables de Entorno

**Backend (`backend/.env`):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gr_prod_db?schema=public"
JWT_SECRET="super-secret-jwt-key"
PORT=3000
NODE_ENV=development
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 9.3 Comandos de Ejecución

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## 10. Guía de Verificación y Testing

### 10.1 Backend
```bash
npm run lint             # Análisis estático ESLint (sin mutación, type-aware)
npm run lint:fix         # Corrección automática ESLint
npm run typecheck        # Verificación estricta TypeScript (tsc --noEmit)
npm run test             # Pruebas unitarias Jest
npm run test:integration # Pruebas de integración
npm run build            # Compilación NestJS
npx prisma validate      # Validación de sintaxis schema.prisma
```

### 10.2 Frontend
```bash
npm run lint             # Análisis estático ESLint
npm run typecheck        # Verificación estricta TypeScript (tsc -b --noEmit)
npm run test             # Pruebas unitarias Vitest
npm run build            # Compilación de producción Vite
```
