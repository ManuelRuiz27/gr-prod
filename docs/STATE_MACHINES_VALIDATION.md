# Plataforma GR — Validación de Máquinas de Estado del Dominio

**Documento:** `STATE_MACHINES_VALIDATION.md`  
**Versión:** 1.0  
**Fecha:** 8 de septiembre de 2026  
**Entregable:** 8 (`STATE_MACHINES.md` + Guards + Tests)  
**Estado:** VALIDADO Y CERRADO (READY)

---

## 1. Resumen Ejecutivo

En esta fase se cerró la especificación e implementación contract-first de las **13 máquinas de estado del dominio** de Plataforma GR, eliminando la dispersión de transiciones ad-hoc y centralizando la validación de invariantes en el backend.

Se alcanzaron los siguientes hitos verificables:
1. **Normativa Formal:** Creación de `docs/STATE_MACHINES.md` con diagramas Mermaid, tablas exhaustivas de transición, precondiciones, actores permitidos, efectos colaterales, terminalidad y matrices de transiciones prohibidas.
2. **Guards de Dominio:** Implementación centralizada en `backend/src/common/state-machines/` (`DomainStateGuardService`, definiciones tipadas y catálogo de excepciones de dominio).
3. **Integración en Servicios:** Conexión del guard en `AdminEventsService`, `AdminGraduatesService`, `AdminFinanceService` y `MeService`, garantizando que ninguna transición de estado ocurra sin validación previa.
4. **Verificación Automatizada:**
   - **47 pruebas unitarias** pasando limpiamente (`npm run test -- --runInBand`), incluyendo 43 pruebas dedicadas de transiciones.
   - **26 pruebas de integración E2E** pasando limpiamente (`npm run test:integration -- --runInBand`).
   - **0 errores de lint** (`npm run lint`).
   - **Compilación exitosa** (`npm run build`).

---

## 2. Cobertura de las 13 Máquinas de Estado

| # | Entidad | Estados Persistidos | Estados Derivados Prohibidos | Actores Autorizados | Terminales Irreversibles | Reversibles / Reabribles |
|---|---|---|---|---|---|---|
| 1 | **`Event`** | `DRAFT`, `OPEN`, `CLOSED`, `FINALIZED`, `CANCELLED` | Ninguno | `ADMIN` | `FINALIZED`, `CANCELLED` | `CLOSED` -> `OPEN` |
| 2 | **`GraduateMembership`** | `ACTIVE`, `CANCELLED`, `COMPLETED` | Ninguno | `ADMIN`, `SYSTEM` | `CANCELLED`, `COMPLETED` | Ninguno |
| 3 | **`GraduateContract`** | `PENDING_ACCEPTANCE`, `ACCEPTED`, `SUPERSEDED`, `CANCELLED` | Ninguno | `GRADUATE` (accept), `ADMIN`, `SYSTEM` | `ACCEPTED` (inmutable), `SUPERSEDED`, `CANCELLED` | Ninguno |
| 4 | **`ContractLineItemQuote`** | `VALID`, `USED` (alias `APPLIED`), `EXPIRED`, `CANCELLED` | Ninguno | `GRADUATE`, `ADMIN`, `SYSTEM` | `USED`, `EXPIRED`, `CANCELLED` | Ninguno |
| 5 | **`PaymentPlan`** | `ACTIVE`, `SETTLED` (alias `COMPLETED`), `CANCELLED` | Ninguno | `SYSTEM`, `ADMIN` | `CANCELLED` | `SETTLED` -> `ACTIVE` |
| 6 | **`PaymentAttempt`** | `CREATED`, `REDIRECTED`, `PENDING`, `CONFIRMED`, `FAILED`, `EXPIRED`, `CANCELLED` | Ninguno | `GRADUATE`, `GATEWAY_WEBHOOK`, `SYSTEM` | `CONFIRMED`, `FAILED`, `EXPIRED`, `CANCELLED` | Ninguno |
| 7 | **`PaymentSubmission`** | `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `CANCELLED` | Ninguno | `ADMIN` (review), `GRADUATE` (cancel) | `APPROVED`, `REJECTED`, `CANCELLED` | Ninguno |
| 8 | **`CancellationPolicy`** | `DRAFT`, `ACTIVE`, `ARCHIVED` | Ninguno | `ADMIN`, `SYSTEM` | `ACTIVE` (inmutable), `ARCHIVED` | Ninguno |
| 9 | **`CancellationQuote`** | `VALID`, `USED`, `EXPIRED`, `CANCELLED` | Ninguno | `ADMIN`, `GRADUATE`, `SYSTEM` | `USED`, `EXPIRED`, `CANCELLED` | Ninguno |
| 10 | **`Refund`** | `REQUESTED`, `PENDING`, `CONFIRMED`, `FAILED`, `CANCELLED` | Ninguno | `ADMIN`, `GATEWAY_WEBHOOK`, `SYSTEM` | `CONFIRMED`, `FAILED`, `CANCELLED` | Ninguno |
| 11 | **`ThermoRequest`** | `REQUESTED`, `IN_PRODUCTION`, `DELIVERED` | `LOCKED`, `AVAILABLE` | `GRADUATE` (request), `ADMIN` | `DELIVERED` | Ninguno |
| 12 | **`ExportJob`** | `PENDING`, `RUNNING`, `COMPLETED`, `FAILED` | Ninguno | `SYSTEM` | `COMPLETED`, `FAILED` | Ninguno |
| 13 | **`ReconciliationCase`** | `OPEN`, `INVESTIGATING`, `RESOLVED`, `DISMISSED` | Ninguno | `ADMIN` | Ninguno | `RESOLVED` -> `OPEN`, `DISMISSED` -> `OPEN` |

---

## 3. Verificación de Invariantes Críticos

### 3.1 Prohibición de Persistencia de Estados Derivados
- Se verificó que `Installment` (`PAID`, `OVERDUE`, `PARTIALLY_PAID`), `EventTable` (`FULL`, `PARTIAL`, `EMPTY`) y `ThermoRequest` (`LOCKED`, `AVAILABLE`) sean estrictamente interceptados y rechazados con `DerivedStatePersistAttemptException` si se intenta invocarlos como `targetState`.
- **Evidencia en tests:** `state-machines.spec.ts` ("Prohibited Derived States Enforcement" — 4 tests aprobados).

### 3.2 Invariante de Retorno de Pasarela (BR-PAY-004)
- Se verificó que llamadas originadas desde `FRONTEND_RETURN_URL` hacia `CONFIRMED` en un `PaymentAttempt` son bloqueadas inmediatamente con `ReturnUrlCannotConfirmPaymentException`.
- Solo `GATEWAY_WEBHOOK` y verificación server-to-server directa pueden asentar transacciones confirmadas.
- **Evidencia en tests:** `state-machines.spec.ts` (test "strictly prohibits FRONTEND_RETURN_URL from confirming PaymentAttempt").

### 3.3 Aprobación Idempotente y Única de Comprobantes (BR-PROOF-005 / BR-PROOF-007)
- La transición a `APPROVED` en `PaymentSubmission` produce atómicamente a lo más una `PaymentTransaction`.
- Las llamadas repetidas con estado `APPROVED` se resuelven como `isIdempotent: true`, retornando el identificador de la transacción preexistente sin duplicar movimientos contables ni allocations.
- **Evidencia en tests:** `state-machines.spec.ts` (test "allows ADMIN to approve submission and handles idempotency").

### 3.4 Historial Contable Inmutable en Reembolsos (BR-FIN-007 / BR-REF-001)
- Las devoluciones (`Refund`) se registran como transacciones compensatorias append-only en el ledger; nunca eliminan ni mutan las `PaymentTransaction` originales.
- Las transiciones fuera de `CONFIRMED` en `Refund` son bloqueadas por violación de estado terminal.
- **Evidencia en tests:** `state-machines.spec.ts` (test "blocks modifying CONFIRMED refund (append-only ledger)").

---

## 4. Evidencia de Ejecución de Tests

### 4.1 Unit Tests (`npm run test -- --runInBand`)
```text
PASS src/common/state-machines/state-machines.spec.ts (7.271 s)
PASS src/app.controller.spec.ts
PASS src/common/middleware/request-id.middleware.spec.ts
PASS src/common/filters/all-exceptions.filter.spec.ts

Test Suites: 4 passed, 4 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        8.734 s
Ran all test suites.
```

### 4.2 Integration Tests (`npm run test:integration -- --runInBand`)
```text
PASS test/auth-foundation.e2e-spec.ts (15.47 s)
PASS test/seating-concurrency.e2e-spec.ts
PASS test/app.e2e-spec.ts

Test Suites: 3 passed, 3 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        18.567 s
Ran all test suites.
```

### 4.3 Lint & Build Verification
```text
> eslint "{src,apps,libs,test}/**/*.ts"
✖ 17 problems (0 errors, 17 warnings)

> nest build
[Exit code: 0]
```

---

## 5. Próximo Paso en el Roadmap

Conforme a `docs/ARCHITECTURE_DELIVERABLES.md`:
- `STATE_MACHINES.md` -> **READY**
- `ERROR_CONTRACT.md` -> **NEXT**
