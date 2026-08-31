# TECH_STACK.md

# Plataforma GR — Stack Técnico y Responsabilidades de Desarrollo

**Documento:** `TECH_STACK.md`  
**Proyecto:** Plataforma GR  
**Versión:** 1.0  
**Estado:** ACTIVO — baseline técnico objetivo  
**Fecha:** 31 de agosto de 2026  
**Repositorio:** `ManuelRuiz27/gr-prod`  
**Branch de trabajo:** `main`  

---

# 1. Propósito

Este documento fija las decisiones técnicas vigentes de Plataforma GR y evita que los agentes de desarrollo sustituyan tecnologías, dupliquen responsabilidades o conviertan componentes legacy en arquitectura definitiva.

La documentación funcional de `/docs` sigue siendo la fuente de verdad del producto. Este documento es la fuente de verdad para decisiones de stack, infraestructura y ownership técnico.

---

# 2. Arquitectura objetivo

```text
┌─────────────────────────────────────────┐
│ Frontend                                │
│ React + TypeScript + Vite               │
│ Agente principal: Google Antigravity    │
└───────────────────┬─────────────────────┘
                    │ HTTPS / JSON
                    ▼
┌─────────────────────────────────────────┐
│ Backend propio                          │
│ NestJS + TypeScript                     │
│ Agente principal: Codex                 │
│                                         │
│ - Auth / autorización                   │
│ - reglas de negocio                     │
│ - planes de pago                        │
│ - ledger / asignaciones                 │
│ - webhooks                              │
│ - conciliación                          │
│ - auditoría                             │
└──────────────┬──────────────┬───────────┘
               │              │
               │ Prisma       │ Payment adapters
               ▼              ▼
┌──────────────────────┐   ┌─────────────────────────┐
│ Supabase PostgreSQL  │   │ Mercado Pago           │
│ DB administrada      │   │ proveedor primario     │
└──────────────────────┘   ├─────────────────────────┤
                           │ OpenPay                 │
                           │ proveedor secundario    │
                           └─────────────────────────┘
```

Principio obligatorio:

```text
Frontend → NestJS → dominio / Prisma / proveedores externos
```

No se adoptará como arquitectura financiera:

```text
Frontend → Supabase Data API → tablas financieras
```

---

# 3. Frontend aprobado

El frontend existente se conserva y evoluciona; no se reconstruye desde cero.

| Componente | Tecnología objetivo |
|---|---|
| Framework | React 19 |
| Lenguaje | TypeScript 5.9+ |
| Build/dev server | Vite 7 |
| Routing | React Router DOM 7 |
| UI/CSS | Tailwind CSS 3.4 + design system propio |
| HTTP | Axios |
| Testing | Vitest + React Testing Library |

El código real al momento de este baseline utiliza React `19.2.x`, TypeScript `5.9.x`, Vite `7.2.x` y React Router DOM `7.10.x`.

## 3.1 Agente frontend

**Google Antigravity** es el agente principal autorizado para implementación y QA del frontend.

Su superficie normal de trabajo es:

```text
frontend/**
```

Debe consultar antes de implementar:

```text
docs/INDEX.md
docs/TECH_STACK.md
.agents/rules/gr-project.md
.agents/rules/gr-frontend.md
```

Para decisiones visuales debe reutilizar:

```text
frontend/src/design-system/
stitch_gr_prototype/
```

Antigravity no debe implementar reglas financieras, persistencia, autenticación server-side ni lógica de proveedores de pago dentro del frontend.

---

# 4. Backend aprobado

El backend existente también se conserva y refactoriza gradualmente.

| Componente | Tecnología objetivo |
|---|---|
| Framework | NestJS 11 |
| Lenguaje | TypeScript 5.7+ |
| ORM | Prisma 5.22+ |
| Base de datos | PostgreSQL 15+ |
| Validación | class-validator + class-transformer |
| Auth actual/objetivo inmediato | Passport JWT + bcrypt |
| Testing | Jest + Supertest |

## 4.1 Agente backend

**Codex** es el agente principal para:

```text
backend/**
backend/prisma/**
.github/workflows/** cuando el ticket lo requiera
```

Codex debe implementar el dominio conforme a `/docs`; no debe inferir comportamiento a partir del código legacy cuando contradiga la documentación vigente.

---

# 5. Supabase

Supabase se adopta como **infraestructura administrada**, no como sustituto del backend NestJS.

## 5.1 Uso aprobado

### PostgreSQL administrado

Objetivo para ambientes desplegados:

```text
Prisma
  ↓ DATABASE_URL
Supabase PostgreSQL
```

El backend seguirá usando Prisma como capa ORM y de migraciones.

Para desarrollo local se permite PostgreSQL local/Docker siempre que las migraciones sean reproducibles contra PostgreSQL compatible.

## 5.2 Acceso a datos

Las operaciones autoritativas del dominio deberán pasar por NestJS, especialmente:

- identidad y autorización;
- eventos y membresías;
- planes de pago;
- obligaciones;
- transacciones;
- aplicaciones de pago;
- ajustes;
- reembolsos;
- auditoría;
- conciliación.

No exponer `service_role`, credenciales de base de datos ni secretos de proveedores al frontend.

## 5.3 Supabase Auth

**No forma parte del baseline aprobado actual.**

La identidad seguirá bajo el backend NestJS mediante el modelo `Account` definido en `DATA_MODEL.md`, Passport/JWT y hashing de contraseña. Adoptar Supabase Auth sería una decisión arquitectónica adicional y requiere actualización documental explícita antes de implementarse.

## 5.4 Supabase Storage

Puede evaluarse cuando se implemente `FileAsset`, croquis, evidencias o archivos administrados. No se considera obligatorio hasta que el ticket correspondiente cierre política de acceso, retención y URLs firmadas.

---

# 6. Pagos

El procesamiento de pagos se mantiene fuera de la infraestructura propia.

## 6.1 Proveedores

```text
Mercado Pago = proveedor electrónico primario
OpenPay      = proveedor electrónico secundario
```

Mercado Pago utilizará como flujo principal:

```text
Checkout Pro
```

OpenPay deberá integrarse detrás de la misma abstracción de dominio y no deberá continuar como dependencia directa del modelo legacy `Payment`.

## 6.2 Backend financiero propio

NestJS será responsable de:

```text
PaymentPlan
Installment
PaymentAttempt
PaymentTransaction
PaymentAllocation
Adjustment
Refund
PaymentProviderEvent
conciliación
auditoría
```

Los proveedores procesan el dinero; Plataforma GR mantiene la verdad contractual y contable definida en `FINANCIAL_DOMAIN.md`.

## 6.3 Reglas de seguridad obligatorias

- PAN y CVV nunca se almacenan ni atraviesan la API de Plataforma GR.
- Las llaves privadas de Mercado Pago/OpenPay existen sólo en backend/secret manager del ambiente.
- El frontend sólo puede utilizar identificadores, llaves públicas o tokens expresamente diseñados por el proveedor para cliente.
- La URL de retorno del navegador nunca confirma un pago.
- La confirmación electrónica debe verificarse server-to-server.
- Todo flujo financiero debe ser idempotente y auditable.
- Los webhooks deben verificarse según el mecanismo oficial del proveedor, deduplicarse y persistirse antes de producir efectos financieros.
- Un pago confirmado no debe modificarse destructivamente; correcciones mediante ajuste, reversa o reembolso.

---

# 7. Shopify y backend propio

Shopify **no forma parte del stack de Plataforma GR**.

El modelo contractual de graduaciones, parcialidades, ajustes y conciliación permanece en el backend propio NestJS.

Tampoco se construirá una pasarela de tarjetas propia ni una wallet que custodie fondos.

---

# 8. Ownership por superficie

| Superficie | Responsable principal | Regla |
|---|---|---|
| `frontend/**` | Antigravity | Implementación frontend y QA visual |
| `backend/**` | Codex | API, seguridad y reglas de negocio |
| `backend/prisma/**` | Codex | schema, migraciones y constraints |
| `stitch_gr_prototype/**` | Referencia visual | No es fuente de reglas de negocio |
| `docs/**` | Fuente de verdad | No modificar decisiones silenciosamente |
| `.agents/rules/**` | Reglas de agentes | Deben permanecer alineadas con este documento |

Un agente no debe cruzar de superficie por conveniencia. Si un cambio frontend requiere contrato o regla backend inexistente, debe reportar el bloqueo en vez de simularlo.

---

# 9. Patrones prohibidos

No implementar:

```text
frontend → acceso directo a tablas financieras
frontend → llaves privadas de proveedor
frontend → cálculo autoritativo de deuda/saldo
Supabase service_role en Vite
PAN/CVV en logs o base de datos
Payment legacy como ledger definitivo
webhook recibido = pago confirmado sin verificación
return URL = confirmación de pago
OpenPay como única abstracción de pagos
reglas de negocio duplicadas en fixtures/UI
```

---

# 10. Estado del código legacy

La existencia actual de:

```text
backend/src/payments/openpay.service.ts
backend/src/payments/payments.service.ts
backend/prisma/schema.prisma -> Payment
```

no cambia la arquitectura objetivo.

Estos elementos son scaffolding/legacy y deberán converger gradualmente hacia `FINANCIAL_DOMAIN.md`, `DATA_MODEL.md`, `API_CONTRACTS.md` y `ROADMAP_IMPLEMENTATION.md`.

No se autoriza un rewrite completo del repositorio únicamente para adoptar este stack.

---

# 11. Deployment

El proveedor definitivo de hosting para frontend y API **no queda congelado por este documento**.

La arquitectura deberá conservar portabilidad:

```text
Frontend: build estático/edge compatible con Vite
Backend: runtime Node.js compatible con NestJS
Database: PostgreSQL administrado en Supabase
```

Un agente no debe seleccionar ni acoplar producción a Vercel, Railway, Render, Cloud Run u otro proveedor sin ticket o decisión explícita.

---

# 12. Precedencia

Para tecnología e infraestructura:

```text
docs/TECH_STACK.md
        ↓
docs/REPOSITORY_SOURCE_OF_TRUTH.md
        ↓
código existente
```

Para comportamiento funcional y reglas de negocio prevalece el orden definido en `docs/INDEX.md`.

Si existe una contradicción material entre este documento y otro documento normativo, el agente debe detener esa parte del trabajo y reportar la contradicción antes de implementar.
