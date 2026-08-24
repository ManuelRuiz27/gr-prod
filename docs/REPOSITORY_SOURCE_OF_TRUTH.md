# Repository Source of Truth — Plataforma GR

**Documento:** `REPOSITORY_SOURCE_OF_TRUTH.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** Activo  
**Fecha:** 24 de agosto de 2026  
**Repositorio oficial:** `https://github.com/ManuelRuiz27/gr-prod.git`  
**Commit base auditado:** `5986eb963c0ef66ccec84e5ba4c504617768cc34`  

---

## 1. Propósito

Este documento establece la radiografía técnica oficial del repositorio de **Plataforma GR**, describiendo su stack real, estructura de directorios, módulos existentes, componentes reusables y obsoletos, así como los lineamientos para su ejecución, pruebas y evolución técnica.

---

## 2. Stack Tecnológico Real

### 2.1 Backend
- **Framework:** NestJS 11
- **Lenguaje:** TypeScript (v5.7+)
- **ORM / Base de Datos:** Prisma 5.22 / PostgreSQL 15+
- **Autenticación / Seguridad:** Passport JWT, `@nestjs/jwt`, `bcrypt`
- **Validación:** `class-validator`, `class-transformer`
- **Pasarela Legacy:** OpenPay Node SDK
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
│       └── ci.yml                 # Pipeline de integración continua
├── backend/                       # API NestJS + Prisma ORM
│   ├── prisma/
│   │   ├── migrations/            # Migraciones SQL reproducibles
│   │   ├── schema.prisma          # Modelo de datos Prisma
│   │   └── seed.ts                # Semillas de desarrollo
│   ├── src/
│   │   ├── auth/                  # Autenticación y Guards
│   │   ├── common/                # Filtros globales, middleware, interceptores
│   │   ├── graduates/             # Gestión de graduados y recursos asociados
│   │   ├── layout/                # Croquis y asignación de mesas
│   │   ├── payments/              # Procesamiento de pagos y webhooks
│   │   ├── prisma/                # Servicio de base de datos Prisma
│   │   ├── app.module.ts          # Módulo raíz
│   │   └── main.ts                # Bootstrap de la aplicación (/api/v1)
│   └── test/                      # Pruebas e2e e integración
├── frontend/                      # Aplicación SPA React + Vite
│   ├── src/
│   │   ├── assets/
│   │   ├── components/            # Componentes UI reutilizables
│   │   ├── pages/                 # Vistas / Pantallas
│   │   ├── services/              # Clientes de API Axios
│   │   ├── App.tsx
│   │   └── main.tsx
├── docs/                          # Fuente de verdad documental normativa (13 documentos)
│   ├── ACCEPTANCE_CRITERIA.md
│   ├── API_CONTRACTS.md
│   ├── BUSINESS_RULES.md
│   ├── DATA_MODEL.md
│   ├── FINANCIAL_DOMAIN.md
│   ├── INDEX.md
│   ├── NON_FUNCTIONAL_REQUIREMENTS.md
│   ├── PRODUCT_SCOPE.md
│   ├── REPOSITORY_SOURCE_OF_TRUTH.md
│   ├── ROADMAP_IMPLEMENTATION.md
│   ├── ROLES_PERMISSIONS.md
│   ├── SEATING_MAP.md
│   ├── SRS.md
│   └── UX_FLOWS.md
└── stitch_gr_prototype/           # Diseños y prototipos de pantallas Stitch
```

---

## 4. Módulos Backend Existentes y Rutas

| Módulo | Directorio | Endpoints Principales | Estado |
|---|---|---|---|
| **Auth** | `src/auth` | `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/profile` | Requiere refactor (M1: Account) |
| **Graduates** | `src/graduates` | `/api/v1/graduates/*` (tickets, guests, meals, thermo) | Requiere refactor (M2, M5) |
| **Layout** | `src/layout` | `/api/v1/layout/tables`, `/api/v1/layout/select-table` | Requiere refactor (M4: SeatingMap) |
| **Payments** | `src/payments` | `/api/v1/payments/charges`, `/api/v1/payments/webhook` | Requiere refactor (M3, M6: Mercado Pago) |
| **Prisma** | `src/prisma` | Módulo interno `PrismaService` | Reutilizable |

---

## 5. Clasificación del Código Existente

### 5.1 Código Reutilizable
- Estructura de bootstrap de NestJS y pipelines de validación global (`ValidationPipe`).
- Integración de PrismaService con lifecycle hooks de base de datos.
- Hashing seguro de contraseñas con `bcrypt`.
- Estrategias de autenticación JWT y decorators (`@GetUser()`, `@Public()`).
- Base de UI en React 19 + Vite con configuración de Tailwind CSS.
- Conceptos de croquis y coordenadas interactivas adaptables a Konva.

### 5.2 Código Deprecated / Modelo a Reemplazar
- **Graduate como identidad:** Reemplazar por modelo desacoplado `Account` + `GraduateMembership`.
- **Ticket como mezcla de paquete/lugares:** Reemplazar por `PaymentPlan` + `Installment` + `Package` + asignación de lugares.
- **Guest.seat_number embebido:** Reemplazar por modelo formal de asignación de mesa/asiento (`TableAssignment`).
- **TableSelection única:** Reemplazar por soporte de selección por grupo/lugares configurados.
- **Payment monolítico:** Reemplazar por libro mayor (`PaymentTransaction`, `PaymentAllocation`, `Adjustment`, `Refund`).
- **OpenPay exclusivo:** Refactorizar hacia arquitectura multi-pasarela con **Mercado Pago** como proveedor principal.

---

## 6. Documentación Vigente y Orden Normativo

La documentación ubicada en `/docs` constituye la **única fuente de verdad autoritativa**:

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

*Nota:* Archivos descriptivos o de pruebas en la raíz del repositorio (`ENDPOINTS.md`, `GUIA_PRUEBAS.md`, etc.) son considerados **LEGACY / REFERENCE ONLY** y no invalidan la documentación en `/docs`.

---

## 7. Guía de Ejecución y Desarrollo

### 7.1 Requisitos Previos
- Node.js >= 18.0.0 (Recomendado LTS v20+)
- PostgreSQL >= 15
- npm >= 9.0.0

### 7.2 Configuración de Variables de Entorno

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

### 7.3 Comandos de Ejecución

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

## 8. Guía de Verificación y Testing

### 8.1 Backend
```bash
npm run lint          # Análisis estático ESLint (sin mutación)
npm run lint:fix      # Corrección automática ESLint
npm run typecheck     # Verificación estricta TypeScript (tsc --noEmit)
npm run test          # Pruebas unitarias Jest
npm run test:integration # Pruebas de integración
npm run build         # Compilación NestJS
```

### 8.2 Frontend
```bash
npm run lint          # Análisis estático ESLint
npm run typecheck     # Verificación estricta TypeScript (tsc --noEmit)
npm run test          # Pruebas unitarias
npm run build         # Compilación de producción Vite
```
