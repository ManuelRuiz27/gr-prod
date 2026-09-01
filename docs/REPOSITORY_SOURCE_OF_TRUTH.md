# Repository Source of Truth — Plataforma GR

**Documento:** `REPOSITORY_SOURCE_OF_TRUTH.md`  
**Proyecto:** Plataforma GR  
**Baseline auditado:** 1.2 (Funcional 1.1 + Visual 1.0)
**Commit auditado:** `1b4b05499ecb270f6a8dbf0a06eae06b96fbbd55`
**Fecha del audit:** 31 de agosto de 2026
**Repositorio oficial:** `https://github.com/ManuelRuiz27/gr-prod.git`
**Branch:** `main`
**Ticket:** `GR-00-12`

---

## 1. Propósito y Alcance del Audit

Este documento establece la radiografía técnica exhaustiva y verificable del estado REAL del repositorio de **Plataforma GR** (`ManuelRuiz27/gr-prod`), auditado contra el **Baseline Normativo 1.2**.

Define qué código existe, dónde reside, qué componentes pueden reutilizarse (`REUSE`), adaptarse (`ADAPT`), reemplazarse (`REPLACE`), retirarse (`REMOVE`) o están ausentes (`MISSING`), estableciendo la estrategia oficial de migración para los milestones subsecuentes.

---

## A. Runtime Real

### A.1 Stack Tecnológico Real
- **Monorepo / Workspace:** Directorios independientes `backend/` y `frontend/` sin orquestador monorepo (e.g. Turborepo/Nx).
- **Backend Runtime:** Node.js (>= 18.0.0, target LTS), NestJS 11.0.1, TypeScript 5.7.3, Express 5.0.0 platform.
- **ORM / Persistencia:** Prisma ORM 5.22.0 con `@prisma/client` 5.22.0. Base de datos PostgreSQL (local dev / Supabase target).
- **Autenticación Backend:** Passport 0.7.0, `passport-jwt` 4.0.1, `@nestjs/jwt` 11.0.2, `bcrypt` 6.0.0.
- **Validación DTO Backend:** `class-validator` 0.14.3, `class-transformer` 0.5.1.
- **Pasarelas Backend:** SDK `openpay` 1.0.5 instalado; Mercado Pago SDK NO instalado en backend.
- **Testing Backend:** Jest 30.0.0, Supertest 7.0.0, `ts-jest` 29.2.5.
- **Frontend Runtime:** React 19.2.0, Vite 7.2.4, TypeScript 5.9.3.
- **Enrutamiento Frontend:** React Router DOM 7.10.1 (`BrowserRouter`, `Routes`, `Route`).
- **Canvas / Croquis:** `konva` 10.3.2, `react-konva` 19.2.5.
- **Estilos Frontend:** Tailwind CSS 3.4.18, PostCSS 8.5.6, Autoprefixer 10.4.22.
- **Cliente HTTP Frontend:** Axios 1.13.2.
- **Testing Frontend:** Vitest 4.1.11, `@testing-library/react` 16.3.2, `@testing-library/jest-dom` 7.0.1, `jsdom` 29.1.1.

### A.2 Estructura Física del Repositorio
```text
.
├── .agents/
│   ├── rules/                             # Reglas operativas para agentes
│   └── skills/                            # Habilidades especializadas
├── .github/
│   └── workflows/
│       └── ci.yml                         # Pipeline CI (Lint, Typecheck, Test, Build)
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   └── 20260824000000_init/
│   │   │       └── migration.sql          # Migración inicial única legacy
│   │   ├── schema.prisma                  # Modelo Prisma legacy (8 modelos)
│   │   └── seed.ts                        # Seed de desarrollo legacy
│   ├── src/
│   │   ├── auth/                          # Autenticación acoplada a Graduate
│   │   ├── common/                        # Filtro AllExceptions y RequestIdMiddleware
│   │   ├── graduates/                     # Lógica legacy de boletos, invitados y termo
│   │   ├── layout/                        # Selección legacy de mesa agregada
│   │   ├── payments/                      # Pagos y webhooks OpenPay legacy
│   │   ├── prisma/                        # PrismaService / PrismaModule
│   │   ├── app.controller.ts              # Health check /
│   │   ├── app.module.ts                  # Módulo raíz
│   │   └── main.ts                        # Bootstrap (/api/v1)
│   └── test/
│       ├── app.e2e-spec.ts
│       └── jest-e2e.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/                    # Componentes legacy / wizard
│   │   ├── context/                       # AuthContext (basado en Graduate JWT)
│   │   ├── design-system/                 # Primitives, tokens navy y estados UI
│   │   ├── fixtures/                      # Mock fixtures usados por pantallas nuevas
│   │   ├── lib/                           # Helpers de storage y presentación
│   │   ├── pages/
│   │   │   ├── admin/                     # Pantallas ADMIN (operan con fixtures)
│   │   │   ├── auth/                      # Pantallas de login/registro
│   │   │   ├── graduate/                  # Pantallas GRADUATE nuevas (operan con fixtures)
│   │   │   ├── showcase/                  # Showcase de componentes
│   │   │   └── *.tsx                      # Pantallas legacy (Dashboard, Layout, etc.)
│   │   ├── services/                      # Clientes Axios acoplados a backend legacy
│   │   ├── shells/                        # AdminLayout y GraduateLayout
│   │   ├── test/                          # Tests de integración UI con fixtures
│   │   ├── App.tsx                        # Árbol de rutas
│   │   └── main.tsx                       # Bootstrap React
│   ├── index.html                         # Inclusión de fuentes y OpenPay SDK
│   ├── tailwind.config.js                 # Configuración de tokens y temas
│   └── vite.config.ts
├── docs/                                  # 19 archivos de especificación normativa 1.2
└── stitch_gr_prototype/                   # Prototipos de referencia
```

---

## B. Mapa Backend

| Área | Existe | Ruta Física | Clasificación | Gap Principal | Documento Fuente |
|---|---|---|---|---|---|
| **Bootstrap & Config** | Sí | `backend/src/main.ts`, `app.module.ts` | `ADAPT` | Prefijo `/api/v1` existe; requiere configurar validación uniforme de DTOs y CORS restringido. | `TECH_STACK.md` |
| **Middlewares / Filters** | Sí | `backend/src/common/` | `REUSE` | `AllExceptionsFilter` y `RequestIdMiddleware` implementan base sólida con `request_id`. Adaptar envelope a contrato exacto. | `API_CONTRACTS.md`, `NFR.md` |
| **Prisma Foundation** | Sí | `backend/src/prisma/` | `REUSE` | `PrismaService` y `PrismaModule` operativos; requiere apuntar a Supabase PostgreSQL. | `TECH_STACK.md` |
| **Identidad / Auth** | Sí | `backend/src/auth/` | `REPLACE` | Autentica contra modelo `Graduate`. No existe `Account`, no hay roles `ADMIN`/`GRADUATE`, no hay guards de ownership ni recuperación de contraseña. | `ROLES_PERMISSIONS.md`, `DATA_MODEL.md` |
| **Eventos / Settings** | Parcial | `backend/src/graduates/`, `prisma/` | `REPLACE` | Modelo `Event` plano. No existe `EventSettings`, ni ciclo de vida DRAFT/OPEN, ni catálogos de escuela/carrera en evento. | `DATA_MODEL.md`, `SRS.md` |
| **Contratos / Boletos** | Parcial | `backend/src/graduates/graduates.service.ts` | `REPLACE` | Maneja boletos mediante entidad `Ticket` agregada. No existe `GraduateContract`, folio único, aceptación contractual ni `ContractLineItem`. | `DATA_MODEL.md`, `BUSINESS_RULES.md` |
| **Productos / Integrantes** | Parcial | `backend/src/graduates/dto/guest.dto.ts` | `REPLACE` | Usa `Guest` con `seat_number`. No existe catálogo `EventProduct` (Adulto, Niño, Sin cena), ni `GroupMember`, ni cotizador de adición con catch-up. | `DATA_MODEL.md`, `SRS.md` |
| **Núcleo Financiero** | Sí | `backend/src/payments/payments.service.ts` | `REPLACE` | Modelo `Payment` plano mutable que mezcla obligación, intento y transacción. No existe `PaymentPlan`, `Installment`, `PaymentAllocation` ni ledger inmutable. | `FINANCIAL_DOMAIN.md`, `DATA_MODEL.md` |
| **Pagos Manuales** | No | — | `MISSING` | No existe soporte para pagos `CASH`, `TRANSFER`, `DEPOSIT` registrados por ADMIN con idempotencia y evidencia. | `FINANCIAL_DOMAIN.md`, `API_CONTRACTS.md` |
| **PaymentSubmissions** | No | — | `MISSING` | No existe entidad ni endpoints para que GRADUATE suba comprobante -> `PENDING_REVIEW` -> ADMIN `APPROVE`/`REJECT`. | `FINANCIAL_DOMAIN.md`, `DATA_MODEL.md` |
| **Pasarela Mercado Pago** | No | — | `MISSING` | No existe integración con Mercado Pago Checkout Pro, webhooks ni idempotencia de eventos. | `TECH_STACK.md`, `API_CONTRACTS.md` |
| **Pasarela OpenPay** | Sí | `backend/src/payments/openpay.service.ts` | `ADAPT` | SDK OpenPay y webhooks funcionales, pero acoplados al modelo legacy `Payment`. Deben aislarse tras interfaz de pasarela. | `TECH_STACK.md`, `FINANCIAL_DOMAIN.md` |
| **Mora y Penalización** | No | — | `MISSING` | No existe `PenaltyCharge`, configuración de recargos ni job idempotente. | `BUSINESS_RULES.md`, `FINANCIAL_DOMAIN.md` |
| **Políticas Cancelación** | No | — | `MISSING` | No existen entidades `CancellationPolicy`, `CancellationPolicyRange`, versionado, `CancellationQuote` ni `Refund`. | `BUSINESS_RULES.md`, `DATA_MODEL.md` |
| **Croquis y Mesas** | Sí | `backend/src/layout/` | `REPLACE` | Asigna mesas mediante `TableSelection` 1:1 `Graduate <-> Table` sumando boletos. Contradice el modelo objetivo `GroupMember -> TableAssignment -> EventTable`. | `SEATING_MAP.md`, `DATA_MODEL.md` |
| **Platillos** | Parcial | `backend/src/graduates/graduates.service.ts` | `REPLACE` | Campo de texto `meal_type` en `Guest` ('traditional'/'vegan'). No hay catálogo `MealOption` ni `MealSelection` por integrante. | `DATA_MODEL.md`, `SRS.md` |
| **Termos** | Parcial | `backend/src/graduates/` | `REPLACE` | Modelo `Thermo` 1:1 con campos en `Graduate`. Desbloqueo basado en cálculo simple de pagos. No hay `ThermoRequest` estructurado ni `ThermoDelivery`. | `DATA_MODEL.md`, `SRS.md` |
| **Reportes y Cortes** | No | — | `MISSING` | No existen endpoints de reportes financieros, cartera, cortes de caja ni exportación CSV/XLSX/PDF. | `SRS.md`, `API_CONTRACTS.md` |
| **Notas y Auditoría** | No | — | `MISSING` | No existen entidades `InternalNote` ni `AuditLog` en backend. | `DATA_MODEL.md`, `ROLES_PERMISSIONS.md` |
| **Gestión de Archivos** | No | — | `MISSING` | No existe `FileAsset` ni almacenamiento privado con URLs firmadas para comprobantes. | `DATA_MODEL.md`, `NFR.md` |

---

## C. Modelo de Datos (`DATA_MODEL.md` vs `backend/prisma/schema.prisma`)

| Entidad Objetivo | Estado en Repo | Equivalente Legacy | Clasificación | Gap / Acción Requerida |
|---|---|---|---|---|
| `Account` | `MISSING` | `Graduate` (parcial) | `REPLACE` | Crear tabla `Account` con roles (`ADMIN`, `GRADUATE`), status, hash de password y email único case-insensitive. |
| `PasswordResetToken` | `MISSING` | — | `MISSING` | Crear entidad con token hasheado y expiración. |
| `Event` | `PARTIAL` | `Event` | `ADAPT` | Adaptar modelo: agregar timezone, school_name, career, generation, status enum (`DRAFT`, `OPEN`, etc.); retirar precios planos. |
| `EventSettings` | `MISSING` | Campos en `Event` | `REPLACE` | Extraer configuraciones de deadlines, threshold de termo, mora y auto-cancelación a `EventSettings`. |
| `EventProduct` | `MISSING` | `Event.ticket_price` | `REPLACE` | Crear catálogo de productos por evento (`BASE_PACKAGE`, `ADULT`, `CHILD`, `NO_DINNER`, `EXTRA_THERMO`). |
| `FinancialMilestone` | `MISSING` | `Event.thermo_threshold` | `REPLACE` | Crear hitos financieros configurables por evento. |
| `GraduateMembership` | `MISSING` | `Graduate` (parcial) | `REPLACE` | Separar la participación en un evento de la cuenta de usuario; soporte multi-evento. |
| `GraduateContract` | `MISSING` | `Ticket` | `REPLACE` | Crear entidad de contrato con folio único inmutable, snapshot de términos y hash de aceptación. |
| `ContractLineItem` | `MISSING` | `Ticket` | `REPLACE` | Desglose de conceptos contratados vinculados a `EventProduct`. |
| `GroupMember` | `MISSING` | `Guest` | `REPLACE` | Crear integrantes nominales (`is_primary`, producto asignado, estado activo). Retirar `seat_number`. |
| `MealOption` | `MISSING` | `Guest.meal_type` (hardcoded) | `REPLACE` | Catálogo de platillos dinámicos por evento. |
| `MealSelection` | `MISSING` | `Guest.meal_type` | `REPLACE` | Selección 1:1 de platillo por `GroupMember` con override de ADMIN. |
| `SeatingMap` | `MISSING` | `Table` | `REPLACE` | Entidad de configuración de croquis vinculada al evento y fondo `FileAsset`. |
| `EventTable` | `PARTIAL` | `Table` | `ADAPT` | Renombrar/adaptar `Table` para incluir `seating_map_id`, `shape`, `width`, `height` y coordenadas normalizadas. |
| `TableAssignment` | `LEGACY_CONFLICT` | `TableSelection` | `REPLACE` | Sustituir `TableSelection` (asignación agregada por graduado) por `TableAssignment` (1:1 `GroupMember` a `EventTable`). |
| `PaymentPlan` | `MISSING` | `Event.months_duration` | `REPLACE` | Crear plan financiero con total contratado, versión de términos y congelamiento. |
| `Installment` | `MISSING` | `Payment.month_number` | `REPLACE` | Calendario de obligaciones/mensualidades con vencimientos y gracia. |
| `PaymentAttempt` | `MISSING` | `Payment` | `REPLACE` | Registro de intentos de pago electrónico con pasarelas. |
| `PaymentSubmission` | `MISSING` | — | `MISSING` | Entidad para comprobantes de transferencia/depósito enviados por graduados. |
| `PaymentTransaction` | `MISSING` | `Payment` | `REPLACE` | Ledger inmutable de transacciones confirmadas (`CASH`, `TRANSFER`, `DEPOSIT`, pasarelas). |
| `PaymentAllocation` | `MISSING` | — | `MISSING` | Aplicación secuencial de transacciones hacia cuotas (`Installment`). |
| `Adjustment` | `MISSING` | — | `MISSING` | Registro append-only de créditos/débitos administrativos. |
| `PenaltyCharge` | `MISSING` | — | `MISSING` | Cargo idempotente por mora. |
| `CancellationPolicy` | `MISSING` | — | `MISSING` | Versiones inmutables de políticas de cancelación por evento. |
| `CancellationPolicyRange` | `MISSING` | — | `MISSING` | Rangos de días y porcentaje de penalización. |
| `CancellationQuote` | `MISSING` | — | `MISSING` | Cotizaciones de cancelación preservadas. |
| `Refund` | `MISSING` | — | `MISSING` | Entidad de reembolsos (electrónicos o manuales). |
| `ThermoRequest` | `LEGACY_CONFLICT` | `Thermo` / `Graduate` | `REPLACE` | Solicitud y personalización estructurada de termo ligada a `GraduateMembership`. |
| `ThermoDelivery` | `MISSING` | — | `MISSING` | Evidencia y firma de entrega de termo. |
| `Notification` | `MISSING` | — | `MISSING` | Notificaciones del sistema por usuario/membresía. |
| `InternalNote` | `MISSING` | — | `MISSING` | Notas internas exclusivas de ADMIN. |
| `FileAsset` | `MISSING` | — | `MISSING` | Registro de archivos privados (comprobantes, fondos, firmas). |
| `PaymentProviderEvent` | `MISSING` | — | `MISSING` | Bitácora de webhooks recibidos para idempotencia de pasarelas. |
| `AuditLog` | `MISSING` | — | `MISSING` | Bitácora de auditoría append-only con before/after y `request_id`. |

---

## D. API Actual vs Contratos `/api/v1`

### D.1 Endpoints Existentes en Backend Legacy
- `GET /api/v1/` — Health check básico público: `REUSE`.
- `POST /api/v1/auth/graduates/register` — Registro de graduado legacy: `REPLACE` (converger a `POST /api/v1/auth/graduate/register` con `event_access`).
- `POST /api/v1/auth/graduates/login` — Login legacy: `REPLACE` (converger a `POST /api/v1/auth/login` unificado).
- `GET /api/v1/graduates/me` — Perfil legacy: `REPLACE` (converger a `GET /api/v1/me/profile`).
- `GET /api/v1/graduates/me/dashboard` — Dashboard legacy: `REPLACE` (sustituir por `GET /api/v1/me/events/{eventId}` y plan financiero).
- `POST /api/v1/graduates/me/tickets` — Selección de boletos legacy: `REPLACE` (sustituir por aceptación de contrato `POST /api/v1/me/events/{eventId}/contract/accept`).
- `GET /api/v1/graduates/me/guests` — Invitados legacy: `REPLACE` (sustituir por `GET /api/v1/me/events/{eventId}/group`).
- `POST /api/v1/graduates/me/guests` — Agregar invitados legacy con recálculo empírico: `REPLACE` (sustituir por flujo de quote + confirmación de `ContractLineItem`).
- `PATCH /api/v1/graduates/me/guests/:guestId` — Actualizar invitado legacy: `REPLACE` (sustituir por `PATCH /api/v1/me/events/{eventId}/group-members/{memberId}`).
- `GET /api/v1/graduates/me/meals` — Platillos legacy: `REPLACE` (sustituir por `GET /api/v1/me/events/{eventId}/meals`).
- `PATCH /api/v1/graduates/me/meals/:guestId` — Selección platillo legacy: `REPLACE` (sustituir por `PUT /api/v1/me/events/{eventId}/group-members/{memberId}/meal-selection`).
- `GET /api/v1/graduates/me/thermo` — Estado termo legacy: `REPLACE` (sustituir por `GET /api/v1/me/events/{eventId}/thermo`).
- `POST /api/v1/graduates/me/thermo` — Personalizar termo legacy: `REPLACE` (sustituir por `POST /api/v1/me/events/{eventId}/thermo/request`).
- `DELETE /api/v1/graduates/me/tickets` — Reset de boletos (utilitario inseguro): `REMOVE`.
- `GET /api/v1/events/:eventId/layout/overview` — Croquis legacy: `REPLACE` (sustituir por `GET /api/v1/me/events/{eventId}/seating-map` y `GET /api/v1/admin/events/{eventId}/seating-map`).
- `POST /api/v1/graduates/me/layout/selection` — Selección mesa agregada: `REPLACE` (sustituir por `PUT /api/v1/me/events/{eventId}/table-assignments`).
- `GET /api/v1/payments/config` — Llaves públicas OpenPay: `REPLACE` (sustituir por configuración de pasarelas o intent session).
- `GET /api/v1/payments/summary` — Resumen pagos legacy: `REPLACE` (sustituir por `GET /api/v1/me/events/{eventId}/payment-plan`).
- `GET /api/v1/payments/history` — Historial pagos legacy: `REPLACE` (incluido en `payment-plan`).
- `POST /api/v1/payments/charge` — Cargo OpenPay legacy: `REPLACE` (sustituir por `POST /api/v1/me/events/{eventId}/payment-attempts`).
- `POST /api/v1/webhooks/openpay` — Webhook OpenPay: `ADAPT` (adaptar para registrar `PaymentProviderEvent` y conciliar con `PaymentTransaction`).

### D.2 Endpoints Normados Faltantes (`MISSING` en Backend)
- **Auth:** `POST /api/v1/auth/password-reset/request`, `POST /password-reset/confirm`, `POST /logout`.
- **Contratos:** `GET /api/v1/me/events/{eventId}/contract`, `POST /contract/accept`.
- **Grupo y Quotes:** `POST /group-members`, `POST /contract-line-items/quote`, `POST /contract-line-items`.
- **Submissions:** `POST /api/v1/me/files/payment-evidence`, `POST /me/events/{eventId}/payment-submissions`, `GET /submissions`, `GET /submissions/{id}`.
- **Notificaciones:** `GET /api/v1/me/notifications`, `PATCH /me/notifications/{id}`.
- **ADMIN Dashboard:** `GET /api/v1/admin/dashboard`.
- **ADMIN Eventos:** `GET/POST /api/v1/admin/events`, `GET/PATCH /admin/events/{id}`, `POST /transitions`.
- **ADMIN Productos y Milestones:** `GET/POST/PATCH /products`, `GET/PUT /financial-milestones`.
- **ADMIN Graduados:** `GET /admin/events/{id}/graduates`, `GET/PATCH /graduates/{id}`, `GET /contract`.
- **ADMIN Pagos Manuales:** `POST /admin/events/{id}/graduates/{id}/payments/manual` (`CASH`, `TRANSFER`, `DEPOSIT`).
- **ADMIN Submissions:** `GET /admin/payment-submissions`, `GET /submissions/{id}`, `POST /approve`, `POST /reject`.
- **ADMIN Ajustes / Refunds:** `POST /adjustments`, `POST /refunds`, `GET /refunds`.
- **ADMIN Mora y Penalización:** `GET/PATCH /admin/events/{id}/late-payment-policy`.
- **ADMIN Políticas Cancelación:** `GET/POST /cancellation-policies`, `PUT /ranges`, `POST /validate`, `POST /publish`.
- **ADMIN Cancelaciones:** `POST /cancellation-quotes`, `POST /cancel`.
- **ADMIN Mesas:** `GET/PUT /seating-map`, `POST/PATCH/DELETE /tables`, `PUT /table-assignments`.
- **ADMIN Platillos:** `GET/POST /meal-options`, `PUT /meal-overrides`.
- **ADMIN Termos:** `GET/PATCH /thermos`, `POST /delivery`.
- **ADMIN Reportes / Export:** `GET /reports/*`, `GET /exports/*`.
- **ADMIN Notas:** `GET/POST /internal-notes`.
- **ADMIN Auditoría:** `GET /audit-logs`.
- **Webhooks:** `POST /api/v1/webhooks/mercadopago`.

---

## E. Mapa Frontend

| Pantalla | Ruta URL Real | Implementación / Archivo | Clasificación | Gap Principal vs Baseline 1.2 |
|---|---|---|---|---|
| **Access / Portal** | `/access` | `src/pages/auth/GraduateAccessScreen.tsx` | `ADAPT` | Operativo con fixtures; requiere adaptar al tema Obsidian/Silver/Gold y conectar con backend. |
| **Login Graduado** | `/login` | `src/pages/auth/GraduateLoginScreen.tsx` | `ADAPT` | Formulario funcional; requiere conectar con `POST /api/v1/auth/login` y unificar tokens. |
| **Registro Graduado** | `/register` | `src/pages/auth/GraduateRegisterScreen.tsx` | `ADAPT` | Requiere flujo de token de acceso al evento (`event_access`) en lugar de registro abierto. |
| **Forgot Password** | `/forgot-password`, `/sent` | `src/pages/auth/ForgotPasswordScreen.tsx` | `ADAPT` | Vistas creadas; requieren endpoint real de recuperación. |
| **Selector Evento** | `/graduate/events` | `src/pages/auth/GraduateEventSelectorScreen.tsx` | `ADAPT` | Vista creada para graduados multi-evento; requiere conectar con `GET /api/v1/me/events`. |
| **Login Admin** | `/admin/login` | `src/pages/auth/AdminLoginScreen.tsx` | `ADAPT` | Login independiente; requiere autenticación de roles en backend. |
| **Admin Shell** | `/admin/*` | `src/shells/admin/AdminLayout.tsx` | `ADAPT` | Sidebar y topbar funcionales; requiere adaptar a tokens Obsidian y responsive drawer (< 1024px). |
| **Admin Dashboard** | `/admin` | `src/pages/admin/AdminDashboardScreen.tsx` | `ADAPT` | KPIs y alertas renderizadas desde fixtures; requiere conectar con `GET /admin/dashboard`. |
| **Admin Eventos Lista** | `/admin/events` | `src/pages/admin/AdminEventsScreen.tsx` | `ADAPT` | Tabla con búsqueda y filtros; requiere datos reales y transiciones de estado. |
| **Admin Crear Evento** | `/admin/events/new` | `src/pages/admin/event-create/CreateEventWizardScreen.tsx` | `ADAPT` | Wizard de 5 pasos; falta incorporar pasos de política de cancelación y productos. |
| **Admin Resumen Evento**| `/admin/events/:id` | `src/pages/admin/AdminEventOverviewScreen.tsx` | `ADAPT` | Métricas y lifecycle dialog con fixtures; requiere conectar API de evento. |
| **Admin Graduados** | `/admin/events/:id/graduates`| `src/pages/admin/graduates/AdminEventGraduatesListScreen.tsx` | `ADAPT` | Tabla con filtros; requiere conectar con `GET /admin/events/{id}/graduates`. |
| **Admin Expediente** | `.../graduates/:gradId` | `src/pages/admin/graduates/AdminGraduateOverviewScreen.tsx` | `ADAPT` | Pestañas de resumen, pagos, mesas, comidas, termo. Falta pestaña de contrato y notas internas. |
| **Admin Pagos Cartera** | `/admin/events/:id/payments` | `src/pages/admin/AdminEventPaymentsScreen.tsx` | `ADAPT` | Pestañas de resumen, cartera y conciliación. Modal de pago manual requiere método `DEPOSIT`. |
| **Admin Bandeja Review**| — | `MISSING` | `MISSING` | Falta bandeja `VS-A-PROOF-001` para revisión de comprobantes con preview y motivo de rechazo. |
| **Admin Editor Política**| — | `MISSING` | `MISSING` | Falta editor `VS-A-CANPOL-001` para rangos dinámicos de cancelación. |
| **Admin Mesas Croquis** | `/admin/events/:id/tables` | `src/pages/admin/AdminEventTablesScreen.tsx` | `ADAPT` | Canvas React Konva funcional; requiere migrar panel de asignación a personas individuales (`GroupMember`). |
| **Admin Platillos** | `/admin/events/:id/meals` | `src/pages/admin/AdminEventMealsScreen.tsx` | `ADAPT` | Tabla y resumen funcional; falta soporte para catálogo dinámico y override de ADMIN. |
| **Admin Termos** | `/admin/events/:id/thermos` | `src/pages/admin/AdminEventThermosScreen.tsx` | `ADAPT` | Tabla y timeline funcional; falta soporte para evidencia/firma de entrega. |
| **Admin Reportes** | `/admin/events/:id/reports` | `src/pages/admin/AdminEventReportsScreen.tsx` | `ADAPT` | Vistas de reportes y cortes de caja operativas con fixtures; falta descarga de archivos. |
| **Admin Auditoría** | `/admin/events/:id/audit` | `src/pages/admin/AdminEventAuditScreen.tsx` | `ADAPT` | Timeline y lista de auditoría; requiere conectar con `GET /admin/events/{id}/audit-logs`. |
| **Graduate Shell** | `/graduate/*` | `src/shells/graduate/GraduateLayout.tsx` | `ADAPT` | BottomNav y Header mobile-first; requiere adaptar a tokens Obsidian y targets de 44px. |
| **Graduate Home** | `/graduate` | `src/pages/graduate/GraduateHomeScreen.tsx` | `ADAPT` | Context card, KPIs y progreso con fixtures; requiere conectar API de inicio. |
| **Graduate Contrato** | — | `MISSING` | `MISSING` | Falta pantalla `VS-G-CON-001` de lectura y aceptación contractual con folio. |
| **Graduate Mi Grupo** | `/graduate/group` | `src/pages/graduate/GraduateGroupScreen.tsx` | `ADAPT` | Lista de invitados acoplada a modelo legacy `Guest`. Requiere cotizador de adición y productos. |
| **Graduate Pagos** | `/graduate/payments` | `src/pages/graduate/GraduatePaymentsScreen.tsx` | `ADAPT` | Calendario e historial de pagos; falta flujo de reportar comprobante (`PaymentSubmission`). |
| **Graduate Mesa** | `/graduate/table` | `src/pages/graduate/GraduateTableScreen.tsx` | `ADAPT` | Selección de mesa acoplada a asignar todo el grupo a una sola mesa. Requiere asignación por persona. |
| **Graduate Platillos** | `/graduate/meals` | `src/pages/graduate/GraduateMealsScreen.tsx` | `ADAPT` | Selección por invitado (tradicional/vegano); requiere catálogo de `MealOption`. |
| **Graduate Termo** | `/graduate/thermo` | `src/pages/graduate/GraduateThermoScreen.tsx` | `ADAPT` | Personalización de termo funcional; requiere conectar a `POST /thermo/request`. |
| **Graduate Notificaciones**| `/graduate/notifications` | `src/pages/graduate/GraduateNotificationsScreen.tsx` | `ADAPT` | Lista de notificaciones con fixtures; requiere conectar API. |
| **Graduate Más** | `/graduate/more` | `src/pages/graduate/GraduateMoreScreen.tsx` | `ADAPT` | Menú de perfil y ayuda operativo. |
| **Legacy Pages** | `/dashboard`, `/layout`, etc. | `src/pages/{Dashboard,Layout,Meals,Payments,Thermo,Summary}.tsx` | `REMOVE` | Pantallas legacy acopladas a endpoints antiguos. Deben retirarse tras converger shells. |

---

## F. Visual Baseline Audit (Baseline 1.2)

### F.1 Design Foundation & Tokens
- **Tokens Actuales (`src/design-system/tokens/index.ts`):** Utiliza paleta primaria `navy` (`#020d20` a `#E6EEFF`), superficies claras (`#F8F9FA`, `#FFFFFF`) y dorado tenue.
- **Tokens Normativos 1.2 (`UI_DESIGN_SYSTEM.md`):** Exige base Negro/Obsidiana (`--color-bg-950: #08090A`, `--color-bg-900: #0D0F12`, `--color-bg-850: #12151A`, `--color-bg-800: #181C22`), Plateados metálicos (`--color-silver-100: #F1F3F5` a `--color-silver-800: #292F37`) y Dorado escaso de acento (`--color-gold-400: #C6A85B`).
- **Clasificación:** `REPLACE` para los valores de tokens de color; actualizar `tokens/index.ts` y `tailwind.config.js`.

### F.2 Tipografía
- **Tipografía Actual:** En `index.html` y `tailwind.config.js` está configurada `Playfair Display` como display, `Inter` como sans y `JetBrains Mono` como mono.
- **Tipografía Normativa 1.2:** Exige `Cormorant Garamond` para display/ceremonial e `Inter` para UI/datos/tablas.
- **Clasificación:** `Cormorant Garamond` está `MISSING`; `Playfair Display` debe ser `REPLACE`. `Inter` y `JetBrains Mono` son `REUSE`.

### F.3 Primitives UI (`src/design-system/components/`)
- `Button`: `ADAPT` (variantes existentes: primary, secondary, ghost, danger, success; adaptar a estética dorado/plateado y estados focus).
- `Input`, `Select`, `TextArea`, `Checkbox`: `ADAPT` (adaptar fondos oscuros `bg-850`, bordes plateados y focus dorado).
- `Card`: `ADAPT` (adaptar a superficies `bg-850` / `bg-800` y variante `card-premium`).
- `Badge`: `ADAPT` (ajustar tokens semánticos: success, warning, danger, info).
- `Table`: `ADAPT` (adaptar headers, hover neutro `bg-750` y densidad).
- `Modal`: `ADAPT` (adaptar backdrop oscuro, WAI-ARIA dialog y focus trap).
- `Search`: `MISSING` como componente primitive reutilizable (implementado ad-hoc en vistas).
- `KPI Card`: `MISSING` como primitive reutilizable (implementado ad-hoc).
- `Drawer`: `MISSING` como primitive reutilizable (requerido para filtros y detalle).
- `Tabs`: `MISSING` como primitive reutilizable (implementado ad-hoc).
- `Toast`: `MISSING` como primitive formal en design system.
- `Skeleton`: `MISSING` como componente estructural; actualmente usa spinners globales o bloques CSS ad-hoc.
- `EmptyState`, `ErrorState`, `LoadingState`, `ActionSuccessState`: `REUSE` / `ADAPT` (base sólida en `src/design-system/states/`).

### F.4 Shells & Navegación
- **ADMIN Shell (`VS-A-SHELL-001`):** `ADAPT`. Navegación global (Inicio, Eventos, Graduados, Pagos, Reportes, Más) y contextual de evento implementadas en `src/shells/admin/`. Falta drawer responsive para < 1024px y persistencia visual del selector de evento.
- **GRADUATE Shell (`VS-G-SHELL-001`):** `ADAPT`. Navegación inferior (Inicio, Mi grupo, Pagos, Más) implementada en `src/shells/graduate/`. Falta afinar safe areas y touch targets mínimos de 44x44px.

### F.5 Matriz de Pantallas Visuales (VS Matrix)

| VS ID | Pantalla / Ruta Real | Estado en Código | Clasificación | Gap Principal |
|---|---|---|---|---|
| `VS-A-AUTH-001` | `/admin/login` | Implementada | `ADAPT` | Conectar a auth real con roles. |
| `VS-A-DASH-001` | `/admin` | Implementada | `ADAPT` | Reemplazar fixtures con `GET /admin/dashboard`. |
| `VS-A-EVT-001` | `/admin/events` | Implementada | `ADAPT` | Conectar tabla a backend y filtros de estado. |
| `VS-A-EVT-002` | `/admin/events/new` | Implementada | `ADAPT` | Agregar pasos de política de cancelación y productos. |
| `VS-A-EVT-003` | `/admin/events/:id` | Implementada | `ADAPT` | Conectar métricas y lifecycle de evento. |
| `VS-A-GRAD-001` | `.../events/:id/graduates` | Implementada | `ADAPT` | Conectar tabla y filtros de expediente. |
| `VS-A-GRAD-002` | `.../graduates/:gradId` | Implementada | `ADAPT` | Agregar pestañas de contrato y notas internas. |
| `VS-A-PAY-001` | `.../events/:id/payments` | Implementada | `ADAPT` | Conectar cartera, resumen y conciliación. |
| `VS-A-PAY-002` | Modal Pago Manual | Implementada | `ADAPT` | Agregar soporte a método `DEPOSIT` y evidencia. |
| `VS-A-PROOF-001` | Bandeja Validar Pagos | No implementada | `MISSING` | Crear vista de revisión con preview y rechazo con motivo. |
| `VS-A-CANPOL-001`| Editor Política Cancelación | No implementada | `MISSING` | Crear editor de rangos dinámicos y validación de huecos. |
| `VS-A-CAN-001` | Simulador Cancelación | No implementada | `MISSING` | Crear modal/vista de cotización y cancelación. |
| `VS-A-SEAT-001` | `.../events/:id/tables` | Implementada | `ADAPT` | Migrar asignación a integrantes nominales individuales. |
| `VS-A-MEAL-001` | `.../events/:id/meals` | Implementada | `ADAPT` | Conectar catálogo dinámico y override de ADMIN. |
| `VS-A-TH-001` | `.../events/:id/thermos` | Implementada | `ADAPT` | Conectar estados reales y evidencia de entrega. |
| `VS-A-REP-001` | `.../events/:id/reports` | Implementada | `ADAPT` | Conectar cortes de caja y descargas XLSX/CSV/PDF. |
| `VS-A-AUD-001` | `.../events/:id/audit` | Implementada | `ADAPT` | Conectar bitácora de auditoría con `request_id`. |
| `VS-G-AUTH-001` | `/access`, `/login`, `/register` | Implementada | `ADAPT` | Integrar token de acceso al evento y unificar tema. |
| `VS-G-CON-001` | Contrato Graduado | No implementada | `MISSING` | Crear pantalla de lectura y aceptación contractual. |
| `VS-G-HOME-001` | `/graduate` | Implementada | `ADAPT` | Conectar inicio con datos derivados del contrato y plan. |
| `VS-G-GROUP-001`| `/graduate/group` | Implementada | `ADAPT` | Migrar a integrantes nominales y cotizador de lugares. |
| `VS-G-PAY-001` | `/graduate/payments` | Implementada | `ADAPT` | Conectar calendario, pasarelas y botón de comprobante. |
| `VS-G-PROOF-001`| Reportar Transferencia/Depósito| No implementada | `MISSING` | Crear flujo de subida de comprobante y aviso no vinculante. |
| `VS-G-SEAT-001` | `/graduate/table` | Implementada | `ADAPT` | Permitir asignar cada integrante a su mesa respectiva. |
| `VS-G-MEAL-001` | `/graduate/meals` | Implementada | `ADAPT` | Conectar selección a catálogo `MealOption`. |
| `VS-G-TH-001` | `/graduate/thermo` | Implementada | `ADAPT` | Conectar solicitud de termo a regla de progreso. |
| `VS-G-MORE-001` | `/graduate/more` | Implementada | `ADAPT` | Conectar perfil y acciones secundarias. |
| `VS-G-NOT-001` | `/graduate/notifications` | Implementada | `ADAPT` | Conectar notificaciones a backend. |

### F.6 Accesibilidad & Performance Visual
- **WCAG AA Contraste:** `PARTIAL`. Vistas oscuras en `index.css` cumplen en textos principales, pero componentes del design system usan variantes claras/navy que requieren unificación.
- **Focus Visible:** `PARTIAL`. Existen clases `focus:ring` en algunos inputs, pero falta estándar uniforme de foco dorado.
- **Modal Focus Trap:** `PARTIAL`. `Modal.tsx` captura `Escape`, pero no implementa focus trap completo ni retorno de foco al elemento disparador.
- **Targets Táctiles:** `PARTIAL`. En móvil, algunos elementos interactivos miden menos de 44x44px.
- **`prefers-reduced-motion`:** `NOT_VERIFIED`. No existen directivas `motion-reduce` en Tailwind ni en animaciones CSS.
- **Accesibilidad Canvas:** `PARTIAL`. El croquis Konva requiere vista alternativa tabular accesible para selección de mesas.
- **Performance de Fuentes & SDKs:** OpenPay JS cargado sincrónicamente en `<head>`; debe cargarse diferido o bajo demanda. Falta incluir `Cormorant Garamond`.

---

## G. Inventario Legacy / Deprecated (Para Retirar)

Los siguientes componentes, tablas y archivos pertenecen al legacy y deben retirarse o sustituirse formalmente durante las migraciones:

1. **Rutas y Controladores Backend Legacy:**
   - `src/graduates/graduates.controller.ts` y `graduates.service.ts`: Lógica monolítica acoplada a `Graduate`, `Ticket` y `Guest`.
   - `src/layout/layout.controller.ts` y `layout.service.ts`: Asignación agregada de mesas 1:1 `Graduate <-> Table`.
   - `src/payments/payments.controller.ts`: Endpoints planos `/payments/charge`, `/summary`, `/history`.
   - Endpoint `DELETE /api/v1/graduates/me/tickets`: Utilitario destructivo de pruebas.

2. **Modelos Prisma Legacy (`schema.prisma`):**
   - `model Graduate`: Reemplazar por `Account` + `GraduateMembership`.
   - `model Ticket`: Reemplazar por `GraduateContract` + `ContractLineItem`.
   - `model Guest`: Reemplazar por `GroupMember` (eliminar columna `seat_number`).
   - `model TableSelection`: Reemplazar por `TableAssignment`.
   - `model Payment`: Reemplazar por `PaymentPlan`, `Installment`, `PaymentTransaction`, `PaymentAllocation`.
   - `model Thermo`: Reemplazar por `ThermoRequest`.

3. **Pantallas Frontend Legacy:**
   - `src/pages/Dashboard.tsx`, `Layout.tsx`, `Meals.tsx`, `Payments.tsx`, `Thermo.tsx`, `Summary.tsx`: Pantallas de la versión inicial acopladas a la API legacy.
   - `src/services/api.ts` (métodos legacy `authAPI`, `graduateAPI`), `layoutAPI.ts`, `mealsAPI.ts`, `paymentsAPI.ts`, `thermoAPI.ts`.

4. **Documentación Legacy:**
   - `ENDPOINTS.md`, `OPENPAY_SETUP.md`, `GUIA_PRUEBAS.md`, `RESULTADOS_PRUEBAS.md`, `NGROK_SETUP.md` (declarados como `REFERENCE ONLY` en `INDEX.md`).

---

## H. Candidatos para Reutilización (`REUSE`)

Componentes y módulos con base sólida que se conservan prácticamente intactos:

1. **Backend Infrastructure:**
   - `backend/src/prisma/prisma.service.ts` y `prisma.module.ts`: Servicio ORM limpio y reutilizable.
   - `backend/src/common/filters/all-exceptions.filter.ts`: Base de captura de excepciones con `request_id`.
   - `backend/src/common/middleware/request-id.middleware.ts`: Generación y propagación de UUID `X-Request-Id`.
   - `backend/src/auth/jwt-auth.guard.ts` y `public.decorator.ts`: Base de guards NestJS (adaptar payload JWT a `AccountRole`).

2. **Frontend Foundation & States:**
   - `frontend/src/design-system/states/StateBoundary.tsx`: Manejo declarativo de estados (`LoadingState`, `EmptyState`, `ErrorState`, `OfflineState`, `ActionSuccessState`).
   - `frontend/src/context/AuthContext.tsx`: Estructura de contexto de autenticación (adaptar para soportar roles `ADMIN` y `GRADUATE`).
   - `frontend/src/lib/storage.ts`: Utilidades seguras de `localStorage` con fallback en memoria.
   - `frontend/src/pages/admin/tables/SeatingMapCanvas.tsx`: Motor de renderizado y arrastre Konva para mesas (adaptar a coordenadas normalizadas y persistencia en drag-end).

---

## I. Estrategia de Migración y Refactor

### 1. ¿Qué entidades pueden migrarse incrementalmente?
- `Event`: Se pueden añadir columnas (`school_name`, `career`, `generation`, `timezone`, `status`) y relaciones a `EventSettings`, `EventProduct`, `FinancialMilestone` y `MealOption` sin destruir los eventos existentes.
- `EventTable` (actual `Table`): Puede migrarse agregando `shape`, `width`, `height`, `seating_map_id` preservando las mesas existentes.
- `GroupMember` (actual `Guest`): Puede crearse migrando los registros de `Guest` vinculados a la nueva `GraduateMembership`.

### 2. ¿Qué entidades requieren reemplazo directo?
- `Graduate` → Reemplazar por `Account` (credenciales) + `GraduateMembership` (participación en evento).
- `Ticket` → Reemplazar por `GraduateContract` + `ContractLineItem`.
- `TableSelection` → Reemplazar por `TableAssignment` (1:1 por `GroupMember`).
- `Payment` → Reemplazar por `PaymentPlan` + `Installment` + `PaymentTransaction` + `PaymentAllocation`.
- `Thermo` → Reemplazar por `ThermoRequest`.

### 3. ¿Qué relaciones legacy deben coexistir temporalmente?
- Durante la transición de endpoints, la tabla `Graduate` puede mantenerse temporalmente con foreign keys a `Account` y `GraduateMembership` hasta que todas las pantallas consuman `/api/v1/me/*` y `/api/v1/admin/*`.
- La tabla `Payment` legacy puede mantenerse en modo lectura durante el backfill hacia `PaymentTransaction` y `PaymentAllocation`.

### 4. ¿Qué datos existentes necesitan transformación?
- **Usuarios:** Migrar `email`, `password_hash`, `full_name`, `phone` de `Graduate` hacia `Account` con `role = 'GRADUATE'`.
- **Membresías:** Crear `GraduateMembership` vinculando `Account.id` y `Event.id` con `active_places = Ticket.tickets_count`.
- **Contratos:** Generar `GraduateContract` con folio `GR-{YEAR}-{SEQ}` y `ContractLineItem` inicial con `kind = 'BASE_PACKAGE'`.
- **Transacciones:** Para cada `Payment` con `status = 'paid'`, generar `PaymentPlan`, `Installments` según `months_duration`, crear `PaymentTransaction` con `status = 'CONFIRMED'` y `PaymentAllocation` aplicando el importe a las cuotas correspondientes.
- **Integrantes:** Para cada `Guest`, crear `GroupMember` asignando `is_primary = true` al primer integrante.
- **Mesas:** Para cada `TableSelection`, crear registros `TableAssignment` vinculando cada `GroupMember` del graduado a la mesa seleccionada.

### 5. ¿Qué cambios deben ser destructivos únicamente después de la migración?
- Eliminación de tablas legacy: `TableSelection`, `Ticket`, `Payment`, `Thermo`, `Guest`.
- Eliminación de columnas legacy en `Event` (`ticket_price`, `initial_payment`, `months_duration`, `thermo_threshold`, `meals_deadline`).
- Eliminación de rutas legacy en controllers (`/graduates/me/*`, `/layout/*`, `/payments/*`).

### 6. Orden Secuencial de Migraciones
1. **Paso 1 (Schema Expand):** Aplicar migración Prisma con todas las entidades nuevas de `DATA_MODEL.md` sin eliminar tablas legacy.
2. **Paso 2 (Data Backfill):** Ejecutar script idempotente de migración de datos transformando `Graduate`, `Ticket`, `Payment`, `Guest`, `TableSelection` a la nueva estructura.
3. **Paso 3 (Service Switch):** Desplegar nuevos módulos NestJS para identidad (`M1`), eventos/productos (`M2`), finanzas/ledger (`M3`), submissions (`M4`), mesas (`M5`), platillos/termos (`M6`).
4. **Paso 4 (Reconciliación):** Ejecutar tests de conciliación financiera e invariantes inter-entidad.
5. **Paso 5 (Frontend Cutover):** Conectar shells y páginas React a los nuevos endpoints `/api/v1`.
6. **Paso 6 (Schema Contract):** Eliminar tablas y columnas legacy en migración final post-estabilización.

### 7. Riesgos y Plan de Rollback
- **Riesgo de Divergencia Financiera:** Si el sistema acepta pagos en el modelo antiguo y nuevo en paralelo, el ledger se desincronizará. Mitigación: Congelar escrituras legacy antes de activar nuevos endpoints.
- **Riesgo de Concurrencia en Mesas:** Asignaciones concurrentes por persona pueden exceder la capacidad de la mesa si no se utiliza `SELECT FOR UPDATE` o transacciones serializables en `TableAssignment`.
- **Rollback Plan:** Mantener snapshots diarios de PostgreSQL y scripts de reversión SQL por migración; las nuevas tablas son aditivas y permiten rollback sin pérdida de datos históricos.

---

## J. Matriz de Gaps (Gap Matrix)

### Gaps P0 (Críticos / Bloqueantes de Dominio)
- **GAP-P0-01:** Falta modelo `Account`, autenticación ADMIN, roles y guards de ownership en backend.
- **GAP-P0-02:** Modelo `Payment` legacy monolítico sin ledger, cuotas (`Installment`), aplicaciones (`Allocation`) ni pagos manuales (`DEPOSIT`).
- **GAP-P0-03:** Ausencia de `GraduateContract`, folios inmutables, aceptación versionada y `ContractLineItem`.
- **GAP-P0-04:** Ausencia de flujo `PaymentSubmission` para validación de comprobantes de transferencia/depósito.
- **GAP-P0-05:** Modelo de asignación de mesas agrega boletos por graduado en vez de asignar individualmente por `GroupMember`.
- **GAP-P0-06:** Falta catálogo `EventProduct` (Adulto, Niño, Sin cena, Termo extra) y cotizador con catch-up.
- **GAP-P0-07:** Falta módulo de políticas de cancelación versionadas con rangos dinámicos, `CancellationQuote` y `Refund`.
- **GAP-P0-08:** Integración con pasarela Mercado Pago ausente; OpenPay acoplado a modelo legacy.
- **GAP-P0-09:** Ausencia de entidades `AuditLog`, `FileAsset` e `InternalNote` en base de datos.
- **GAP-P0-10:** Tokens visuales frontend usan paleta navy/light y `Playfair Display` en lugar de Negro/Obsidiana + Plateado + Dorado y `Cormorant Garamond`.

### Gaps P1 (Importantes / Arquitectura y Flujo)
- **GAP-P1-01:** Pantallas frontend ADMIN y GRADUATE nuevas operan sobre mock fixtures estáticos en lugar de consumir API.
- **GAP-P1-02:** Faltan primitives formales en el design system: `Search`, `KPI Card`, `Drawer`, `Tabs`, `Toast`, `Skeleton`.
- **GAP-P1-03:** Falta soporte para `prefers-reduced-motion` y focus trap accesible en modales y croquis.
- **GAP-P1-04:** Catálogos de platillos hardcodeados a 'tradicional'/'vegano' sin configuración por evento.

### Gaps P2 (Mejoras / Optimización)
- **GAP-P2-01:** Carga síncrona de SDKs de OpenPay en `<head>`.
- **GAP-P2-02:** Falta sanitización contra inyección de fórmulas en exportaciones CSV/XLSX.
- **GAP-P2-03:** Adaptación responsive en drawer para sidebar ADMIN en pantallas < 1024px.

---

## K. Secuencia de Tickets Recomendada

Conforme a [`ROADMAP_IMPLEMENTATION.md`](./ROADMAP_IMPLEMENTATION.md), el orden de ejecución es:

1. **`GR-00-13` — Revalidar CI/migrations:** Ejecutar validación técnica de pipelines, lint, typecheck, tests y builds (Próximo ticket técnico).
2. **`VIS-01` — Tokens y Primitives:** Implementar paleta Obsidian/Silver/Gold, Cormorant Garamond, y primitives base (`Button`, `Input`, `Card`, `Table`, `Modal`, `Drawer`, `Tabs`, `Skeleton`) en frontend.
3. **`GR-01-01` a `GR-01-07` (M1):** Implementar `Account`, `GraduateMembership`, guards de ownership, `GraduateContract`, folio y aceptación contractual.
4. **`VIS-02` y `VIS-03`:** Consolidar shells ADMIN (`VS-A-SHELL-001`) y GRADUATE (`VS-G-SHELL-001`).
5. **`GR-02-01` a `GR-02-08` (M2):** `EventSettings`, `EventProduct`, `FinancialMilestone`, `GroupMember` y cotizador de compras adicionales.
6. **`GR-03-01` a `GR-03-05` (M3):** Núcleo financiero (`PaymentPlan`, `Installment`, `PaymentTransaction`, `PaymentAllocation`, pagos manuales ADMIN).
7. **`GR-04-01` a `GR-04-07` (M4):** `FileAsset` privado, `PaymentSubmission` schema y APIs de revisión ADMIN / envío GRADUATE.
8. **`GR-05-01` a `GR-05-08` (M5):** `SeatingMap`, `EventTable`, migración a `TableAssignment` por persona y canvas Konva integrado.
9. **`GR-06-01` a `GR-06-05` (M6):** `MealOption`/`MealSelection`, `ThermoRequest` y `ThermoDelivery`.
10. **`GR-07-01` a `GR-07-05` (M7):** Mercado Pago Checkout Pro, webhook idempotency y adapter OpenPay.
11. **`GR-08-01` a `GR-08-09` (M8):** Mora, recargos (`PenaltyCharge`), `CancellationPolicy` versionada, `CancellationQuote` y `Refund`.
12. **`GR-09-*` / `GR-10-*` / `GR-11-*` (M9, M10, M11):** Integración E2E ADMIN, GRADUATE, reportes, notas y auditoría.
13. **`GR-12-*` / `GR-13-*` (M12, M13):** Hardening, NFRs, migración destructiva legacy y release.

---

## 10. Conclusión del Audit

El repositorio cuenta con una base arquitectónica funcional (NestJS 11 + Prisma 5 en backend; React 19 + Vite 7 + Tailwind CSS en frontend) y una estructura visual avanzada desarrollada en componentes y shells. Sin embargo, existe una desconexión crítica entre los modelos de datos legacy / endpoints planos actuales y el modelo normativo multidimensional fijado en el **Baseline 1.2**.

La ejecución de **GR-00-12** concluye exitosamente con el diagnóstico y la ruta de migración definidos. No se realizaron modificaciones en código de producción durante este ticket.
