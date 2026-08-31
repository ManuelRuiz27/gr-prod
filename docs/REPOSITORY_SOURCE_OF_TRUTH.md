# Repository Source of Truth — Plataforma GR

**Documento:** `REPOSITORY_SOURCE_OF_TRUTH.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.4  
**Estado:** Activo — Baseline M0 Cerrado  
**Fecha:** 31 de agosto de 2026  
**Repositorio oficial:** `https://github.com/ManuelRuiz27/gr-prod.git`  
**Commit histórico auditado:** `5986eb963c0ef66ccec84e5ba4c504617768cc34`  
**Commit de cierre baseline M0:** `42ca9f1` (R2) / `e4afe4c` (R3 definitivo)  

---

## 1. Propósito

Este documento establece la radiografía técnica oficial del repositorio existente de **Plataforma GR**, describiendo su stack real, estructura de directorios, módulos y endpoints legados existentes, y clasificando de forma precisa el destino técnico de cada componente frente a la arquitectura objetivo definida en la documentación vigente.

La arquitectura técnica objetivo y el ownership de agentes se fijan en [`TECH_STACK.md`](./TECH_STACK.md). Este documento describe principalmente **qué existe hoy** y cómo se clasifica.

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

### 2.3 Arquitectura objetivo vigente

Sin sustituir el backend existente, el stack convergerá a:

```text
Frontend React/Vite
        ↓
Backend NestJS
        ↓
Prisma
        ↓
Supabase PostgreSQL
```

Integraciones financieras objetivo:

```text
Mercado Pago = proveedor electrónico primario
OpenPay      = proveedor electrónico secundario
```

Supabase se adopta como infraestructura PostgreSQL administrada; no sustituye a NestJS ni autoriza acceso directo del frontend a tablas financieras.

### 2.4 Ownership de desarrollo

```text
Google Antigravity → frontend/** y QA visual
Codex              → backend/**, Prisma, seguridad e integraciones server-side
```

Las restricciones completas se encuentran en [`TECH_STACK.md`](./TECH_STACK.md) y `.agents/rules/`.

---

## 3. Estructura del Repositorio

```text
.
├── .agents/
│   └── rules/                     # Reglas de alcance para agentes
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
│   │   ├── common/                # Filtros globales y middleware
│   │   ├── graduates/             # Gestión legacy de graduados
│   │   ├── layout/                # Croquis y selección legacy de mesas
│   │   ├── payments/              # Pagos y webhooks OpenPay legacy
│   │   ├── prisma/                # PrismaService
│   │   ├── app.controller.ts      # Health check raíz
│   │   ├── app.module.ts          # Módulo raíz NestJS
│   │   └── main.ts                # Bootstrap de aplicación (/api/v1)
│   └── test/                      # Pruebas e2e / integración
├── frontend/                      # Aplicación SPA React + Vite
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── design-system/         # Design system reutilizable
│   │   ├── fixtures/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── shells/
│   │   ├── App.tsx
│   │   └── main.tsx
├── docs/                          # Documentación vigente (15 archivos físicos)
│   ├── ACCEPTANCE_CRITERIA.md     # Normativo (11)
│   ├── API_CONTRACTS.md           # Normativo (9)
│   ├── BUSINESS_RULES.md          # Normativo (2)
│   ├── DATA_MODEL.md              # Normativo (8)
│   ├── FINANCIAL_DOMAIN.md        # Normativo (6)
│   ├── INDEX.md                   # Índice y precedencia documental
│   ├── NON_FUNCTIONAL_REQUIREMENTS.md # Normativo (10)
│   ├── PRODUCT_SCOPE.md           # Normativo (1)
│   ├── REPOSITORY_SOURCE_OF_TRUTH.md  # Radiografía técnica
│   ├── ROADMAP_IMPLEMENTATION.md  # Normativo (12)
│   ├── ROLES_PERMISSIONS.md       # Normativo (4)
│   ├── SEATING_MAP.md             # Normativo (7)
│   ├── SRS.md                     # Normativo (3)
│   ├── TECH_STACK.md              # Baseline técnico vinculante
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
- `GET /api/v1/payments/config` — Obtención de llaves públicas de OpenPay legacy.
- `GET /api/v1/payments/summary` — Resumen legacy de saldo pagado, pendiente y porcentaje de avance.
- `GET /api/v1/payments/history` — Historial legacy de pagos del graduado.
- `POST /api/v1/payments/charge` — Creación de cargo legacy vía OpenPay.
- `POST /api/v1/webhooks/openpay` — Webhook OpenPay legacy.

Estos endpoints deberán converger a `API_CONTRACTS.md`; la integración Mercado Pago primaria todavía no está presente en el código backend auditado.

---

## 5. Modelos Prisma Legacy Actuales vs Modelos Objetivo

### 5.1 Modelos Legacy en `backend/prisma/schema.prisma` (Actuales)
- `Event`: Entidad evento básica con precios fijos.
- `Graduate`: Graduado como usuario autenticable, contiene campos de progreso wizard y termo.
- `Table`: Mesa con coordenadas básicas (`position_x`, `position_y`, `capacity`).
- `TableSelection`: Relación 1:1 entre Graduate y Table.
- `Ticket`: Registro del conteo de boletos y precio base.
- `Guest`: Invitado con `meal_type` y campo opcional `seat_number`.
- `Payment`: Registro simple de pago asociado a OpenPay.
- `Thermo`: Registro 1:1 de personalización de termo.

### 5.2 Modelos Objetivo Normados en `docs/DATA_MODEL.md`
El refactor gradual por milestones reemplazará el modelo legacy por las entidades normadas:
- **Identidad:** `Account`, `AccountRole` (`ADMIN`, `GRADUATE`), `AccountStatus`, `GraduateMembership`.
- **Evento y Configuración:** `Event`, `EventSettings`, `GroupMember`.
- **Platillos:** `MealOption`, `MealSelection`.
- **Croquis y Mesas:** `SeatingMap`, `EventTable`, `TableAssignment`.
- **Financiero:** `PaymentPlan`, `Installment`, `PaymentAttempt`, `PaymentTransaction`, `PaymentAllocation`, `Adjustment`, `Refund`, `PaymentProviderEvent`.
- **Operación y Soporte:** `ThermoRequest`, `Notification`, `FileAsset`, `AuditLog`.

---

## 6. Clasificación del Código Existente

La siguiente tabla resume el estado y la acción futura de cada módulo del código inspeccionado conforme a [`ROADMAP_IMPLEMENTATION.md`](./ROADMAP_IMPLEMENTATION.md), [`DATA_MODEL.md`](./DATA_MODEL.md) y [`TECH_STACK.md`](./TECH_STACK.md):

| Área/Módulo | Estado | Acción futura | Milestone |
|---|---|---|---|
| **NestJS bootstrap** (`main.ts`, `app.module.ts`, `app.controller.ts`) | Activo con middleware `X-Request-Id` y `AllExceptionsFilter` | `ADAPT` | M0 / M1 |
| **PrismaService** (`src/prisma/prisma.service.ts`) | Activo | `REUSE`; apuntar por `DATABASE_URL` a Supabase PostgreSQL en ambientes desplegados | M0 / M1 |
| **Auth legacy** (`src/auth/`) | Deuda técnica, identidad ligada a `Graduate` | `REFACTOR` hacia `Account` + `GraduateMembership` | M1 |
| **Graduates legacy** (`src/graduates/`) | Deuda técnica | `REFACTOR` | M2 / M5 |
| **Layout legacy** (`src/layout/`) | Deuda técnica | `REPLACE` | M4 |
| **Payments legacy core** (`src/payments/payments.*`) | Modelo plano `Payment` sin dominio financiero objetivo | `REPLACE` | M3 |
| **OpenPay gateway legacy** (`src/payments/openpay.*`, `webhooks.*`) | Integración directa legacy | `REPLACE` detrás de abstracción de gateway | M6 |
| **Mercado Pago** | No implementado en backend auditado | `BUILD` como proveedor electrónico primario | M6 |
| **React / Vite foundation** | Activo | `REUSE`; desarrollo principal con Antigravity | M0 / M7 |
| **Frontend routing & services** | Contratos acoplados al backend legacy | `ADAPT` | M1 / M7 |
| **Frontend UI existente** | Parcialmente alineado con prototipos/documentación | `ADAPT` mediante tickets Antigravity | M7 / M8 |

---

## 7. Riesgos Legacy y Desviaciones Técnicas Identificadas

1. **Pasarela actual:** OpenPay existe como implementación provisional, pero el objetivo es Mercado Pago primario + OpenPay secundario bajo contratos equivalentes de dominio.
2. **Dominio financiero:** `Payment` actual no soporta `PaymentPlan`, `Installment`, `PaymentAllocation`, ajustes, reembolsos ni conciliación.
3. **Identidad acoplada:** `Graduate` actúa como usuario autenticable; debe migrar a `Account` + `GraduateMembership`.
4. **Asignación de mesas:** `TableSelection` legacy contradice el modelo normativo de `TableAssignment`.
5. **Rutas API:** las rutas inventariadas no son contratos finales.
6. **Persistencia desplegada:** PostgreSQL local es válido para desarrollo, pero el objetivo administrado es Supabase PostgreSQL sin eliminar Prisma/NestJS.
7. **Separación de agentes:** Antigravity no debe solucionar bloqueos backend mediante lógica simulada de cliente; Codex no debe rediseñar frontend fuera de su ticket.

---

## 8. Documentación Vigente y Orden Normativo

El directorio `/docs/` contiene **15 archivos físicos**:

- **12 documentos normativos funcionales** con el orden definido en `INDEX.md`.
- **1 índice:** `INDEX.md`.
- **1 baseline técnico vinculante:** `TECH_STACK.md`.
- **1 radiografía técnica:** `REPOSITORY_SOURCE_OF_TRUTH.md`.

Para comportamiento funcional prevalece el orden de `INDEX.md`.

Para tecnología e infraestructura:

```text
TECH_STACK.md
        ↓
REPOSITORY_SOURCE_OF_TRUTH.md
        ↓
código existente
```

Los documentos de configuración y pruebas antiguos en la raíz (`ENDPOINTS.md`, `OPENPAY_SETUP.md`, `GUIA_PRUEBAS.md`, `RESULTADOS_PRUEBAS.md`, etc.) son **LEGACY / REFERENCE ONLY** cuando contradicen este baseline.

---

## 9. Guía de Ejecución y Desarrollo

### 9.1 Requisitos Previos
- Node.js >= 18.0.0; recomendado LTS vigente compatible con dependencias.
- PostgreSQL >= 15 para desarrollo local o conexión a Supabase PostgreSQL.
- npm >= 9.0.0.

### 9.2 Configuración de Variables de Entorno

**Backend local (`backend/.env`):**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gr_prod_db?schema=public"
JWT_SECRET="development-only-secret"
PORT=3000
NODE_ENV=development
```

**Backend desplegado:**

```env
DATABASE_URL="<Supabase PostgreSQL connection string from secret manager>"
JWT_SECRET="<secret managed by deployment environment>"
NODE_ENV=production
```

Nunca commitear credenciales reales, `service_role`, llaves privadas de Mercado Pago/OpenPay o connection strings de producción.

**Frontend (`frontend/.env`):**

```env
VITE_API_URL=http://localhost:3000/api/v1
```

No colocar secretos server-side en variables `VITE_*`.

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
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build
npx prisma validate
```

### 10.2 Frontend

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

QA visual del frontend debe reportarse únicamente después de una ejecución real del navegador conforme a `.agents/rules/gr-frontend.md`.
