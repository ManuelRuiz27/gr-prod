# Plataforma GR — Validación de Foundation Contract-First y Persistencia

**Documento:** `FOUNDATION_VALIDATION.md`  
**Versión:** 1.0  
**Fecha:** 8 de septiembre de 2026  
**Estado:** VERIFICADO Y CERRADO (100% PASS)  
**Alcance:** Foundation Contract-First (OpenAPI 3.1) y Persistencia Data Model 2.0 (PostgreSQL + Prisma)

---

## 1. Resumen Ejecutivo

Este documento certifica el cierre formal y exhaustivo de la **foundation contract-first y de persistencia** para Plataforma GR. La cadena normativa se encuentra verificada y reconciliada:

$$\text{API\_ENDPOINT\_MATRIX} \longrightarrow \text{API\_CONTRACT.openapi.yaml} \longrightarrow \text{DATA\_MODEL} \longrightarrow \text{schema.prisma} \longrightarrow \text{PostgreSQL Migrations} \longrightarrow \text{Database Seed}$$

Todas las pruebas de verificación fueron ejecutadas tanto sobre la base de datos de desarrollo (`plataforma_gr`) como sobre una base de datos desechable completamente virgen (`plataforma_gr_verify`), garantizando reproducibilidad determinista desde cero.

---

## 2. Auditoría Contract-First: Matriz Canónica vs OpenAPI 3.1

Se ejecutó la auditoría estricta de paridad entre [`docs/API_ENDPOINT_MATRIX.md`](file:///docs/API_ENDPOINT_MATRIX.md) y [`docs/API_CONTRACT.openapi.yaml`](file:///docs/API_CONTRACT.openapi.yaml).

### Métricas de Contrato

| Métrica | Requerido | Obtenido | Estado |
|---|:---:|:---:|:---:|
| Filas totales en Matriz Canónica | 136 | 136 | PASS |
| Operaciones HTTP Canónicas | 129 | 129 | PASS |
| Jobs/Crons de fondo (sin endpoint HTTP) | 7 | 7 | PASS |
| Operaciones HTTP en OpenAPI 3.1 | 129 | 129 | PASS |
| Unicidad de `operationId` | 100% | 100% | PASS (0 duplicados) |
| Unicidad de pares `Method + Path` | 100% | 100% | PASS (0 colisiones) |
| Parámetros de ruta declarados con `in: path` | 100% | 100% | PASS (0 faltantes) |
| Header `Idempotency-Key` en operaciones `REQ` | 100% | 100% | PASS (0 faltantes) |
| Schemas globales con `additionalProperties: true` laxo | 0 | 0 | PASS |

### Jobs de Fondo Documentados (Sin Controller HTTP Público)
Los siguientes 7 procesos operan exclusivamente vía cron/workers de backend:
1. `jobApplyLatePenalties`
2. `jobEvaluateAutoCancellation`
3. `jobDispatchOutbox`
4. `jobProcessExports`
5. `jobCleanupExports`
6. `jobPaymentReconciliationRepair`
7. `jobNotificationReminders`

---

## 3. Reconciliación Data Model 2.0 vs Prisma Schema (49 Entidades)

Todas las 49 entidades canónicas definidas en las secciones 8 a 56 de [`docs/DATA_MODEL.md`](file:///docs/DATA_MODEL.md) cuentan con un modelo homólogo exacto en [`backend/prisma/schema.prisma`](file:///backend/prisma/schema.prisma), mapeado a tablas PostgreSQL en snake_case:

| # | Entidad en DATA_MODEL | Modelo en Prisma Schema | Tabla PostgreSQL | Estado |
|---:|---|---|---|:---:|
| 8 | `Account` | `Account` | `accounts` | MATCH |
| 9 | `AuthSession` | `AuthSession` | `auth_sessions` | MATCH |
| 10 | `PasswordResetToken` | `PasswordResetToken` | `password_reset_tokens` | MATCH |
| 11 | `Event` | `Event` | `events` | MATCH |
| 12 | `EventSettings` | `EventSettings` | `event_settings` | MATCH |
| 13 | `EventAccessCode` | `EventAccessCode` | `event_access_codes` | MATCH |
| 14 | `EventFinancialConfiguration` | `EventFinancialConfiguration` | `event_financial_configurations` | MATCH |
| 15 | `InstallmentTemplate` | `InstallmentTemplate` | `installment_templates` | MATCH |
| 16 | `FinancialMilestone` | `FinancialMilestone` | `financial_milestones` | MATCH |
| 17 | `ThermoConfiguration` | `ThermoConfiguration` | `thermo_configurations` | MATCH |
| 18 | `ThermoPersonalizationField` | `ThermoPersonalizationField` | `thermo_personalization_fields` | MATCH |
| 19 | `ThermoPersonalizationOption` | `ThermoPersonalizationOption` | `thermo_personalization_options` | MATCH |
| 20 | `EventProduct` | `EventProduct` | `event_products` | MATCH |
| 21 | `GraduateMembership` | `GraduateMembership` | `graduate_memberships` | MATCH |
| 22 | `GroupMember` | `GroupMember` | `group_members` | MATCH |
| 23 | `GraduateContract` | `GraduateContract` | `graduate_contracts` | MATCH |
| 24 | `ContractLineItem` | `ContractLineItem` | `contract_line_items` | MATCH |
| 25 | `ContractLineItemQuote` | `ContractLineItemQuote` | `contract_line_item_quotes` | MATCH |
| 26 | `PaymentPlan` | `PaymentPlan` | `payment_plans` | MATCH |
| 27 | `Installment` | `Installment` | `installments` | MATCH |
| 28 | `PaymentAttempt` | `PaymentAttempt` | `payment_attempts` | MATCH |
| 29 | `PaymentSubmission` | `PaymentSubmission` | `payment_submissions` | MATCH |
| 30 | `PaymentTransaction` | `PaymentTransaction` | `payment_transactions` | MATCH |
| 31 | `PaymentAllocation` | `PaymentAllocation` | `payment_allocations` | MATCH |
| 32 | `PaymentAllocationReversal` | `PaymentAllocationReversal` | `payment_allocation_reversals` | MATCH |
| 33 | `Adjustment` | `Adjustment` | `adjustments` | MATCH |
| 34 | `PenaltyCharge` | `PenaltyCharge` | `penalty_charges` | MATCH |
| 35 | `CancellationPolicy` | `CancellationPolicy` | `cancellation_policies` | MATCH |
| 36 | `CancellationPolicyRange` | `CancellationPolicyRange` | `cancellation_policy_ranges` | MATCH |
| 37 | `CancellationQuote` | `CancellationQuote` | `cancellation_quotes` | MATCH |
| 38 | `Refund` | `Refund` | `refunds` | MATCH |
| 39 | `RefundSource` | `RefundSource` | `refund_sources` | MATCH |
| 40 | `PaymentProviderEvent` | `PaymentProviderEvent` | `payment_provider_events` | MATCH |
| 41 | `ReconciliationCase` | `ReconciliationCase` | `reconciliation_cases` | MATCH |
| 42 | `SeatingMap` | `SeatingMap` | `seating_maps` | MATCH |
| 43 | `EventTable` | `EventTable` | `event_tables` | MATCH |
| 44 | `TableAssignment` | `TableAssignment` | `table_assignments` | MATCH |
| 45 | `MealOption` | `MealOption` | `meal_options` | MATCH |
| 46 | `MealSelection` | `MealSelection` | `meal_selections` | MATCH |
| 47 | `ThermoRequest` | `ThermoRequest` | `thermo_requests` | MATCH |
| 48 | `ThermoPersonalizationValue` | `ThermoPersonalizationValue` | `thermo_personalization_values` | MATCH |
| 49 | `ThermoDelivery` | `ThermoDelivery` | `thermo_deliveries` | MATCH |
| 50 | `FileAsset` | `FileAsset` | `file_assets` | MATCH |
| 51 | `Notification` | `Notification` | `notifications` | MATCH |
| 52 | `InternalNote` | `InternalNote` | `internal_notes` | MATCH |
| 53 | `AuditLog` | `AuditLog` | `audit_logs` | MATCH |
| 54 | `IdempotencyRecord` | `IdempotencyRecord` | `idempotency_records` | MATCH |
| 55 | `OutboxEvent` | `OutboxEvent` | `outbox_events` | MATCH |
| 56 | `ExportJob` | `ExportJob` | `export_jobs` | MATCH |

---

## 4. Clasificación Canónica de Platillos (`MealType`)

Se implementó el enum semántico `MealType`:
- Valores: `STANDARD`, `VEGETARIAN`, `VEGAN`, `OTHER`.
- Default: `STANDARD`.
- Sincronizado en:
  - `DATA_MODEL.md` (Sección 7 Enums y Sección 45 `MealOption`).
  - `API_CONTRACT.openapi.yaml` (Schemas `MealType`, `MealOption`, `MealOptionCreateInput`, `MealOptionUpdateInput`, `MealSelection`).
  - `backend/prisma/schema.prisma` (`enum MealType` y campo `type` en `MealOption`).
  - DTOs de backend (`CreateMealOptionDto`, `UpdateMealOptionDto` con validación `@IsEnum(MealType)`).
  - Migración SQL `20260908010000_p0_constraints_and_meal_type` con backfill automático.

---

## 5. Endurecimiento de Constraints en PostgreSQL (P0)

### 5.1 Índices Únicos Parciales
Se crearon e inspeccionaron los índices únicos condicionales en el motor PostgreSQL:

1. **Un solo código de acceso activo por evento:**
   ```sql
   CREATE UNIQUE INDEX idx_event_access_codes_one_active 
   ON event_access_codes (event_id) 
   WHERE (status = 'ACTIVE');
   ```
2. **Un solo integrante principal activo por graduado:**
   ```sql
   CREATE UNIQUE INDEX idx_group_members_one_primary_active 
   ON group_members (membership_id) 
   WHERE (is_primary = true AND is_active = true);
   ```
3. **Un solo plan de pagos activo por graduado:**
   ```sql
   CREATE UNIQUE INDEX idx_payment_plans_one_active 
   ON payment_plans (membership_id) 
   WHERE (status = 'ACTIVE');
   ```

### 5.2 Protección del Ledger Financiero (FK RESTRICT)
Se configuraron llaves foráneas con regla `ON DELETE RESTRICT` (PostgreSQL `confdeltype = 'r'`) para impedir borrados en cascada que destruyan asientos contables o de auditoría:
- `payment_plans` $\rightarrow$ `graduate_memberships`
- `installments` $\rightarrow$ `payment_plans`
- `payment_transactions` $\rightarrow$ `payment_plans`
- `payment_allocations` $\rightarrow$ `payment_transactions`
- `payment_allocations` $\rightarrow$ `installments`
- `payment_allocation_reversals` $\rightarrow$ `payment_allocations`
- `adjustments` $\rightarrow$ `payment_plans`
- `penalty_charges` $\rightarrow$ `payment_plans`
- `cancellation_quotes` $\rightarrow$ `payment_plans`
- `refunds` $\rightarrow$ `payment_plans`
- `refund_sources` $\rightarrow$ `refunds`
- `refund_sources` $\rightarrow$ `payment_transactions`

### 5.3 CHECK Constraints Activas (23 Constraints)
Todas las invariantes de dominio fueron verificadas con `pg_constraint`:
- **Capacidad positiva:** `capacity > 0` en `events` y `event_tables`.
- **Geometría normalizada:** `position_x BETWEEN 0 AND 1`, `position_y BETWEEN 0 AND 1`, `width BETWEEN 0 AND 1`, `height BETWEEN 0 AND 1` en `event_tables`.
- **Valores monetarios:** `contracted_total >= 0`, `amount >= 0` en `installments`, `amount > 0` en `payment_transactions`, `payment_allocations`, `refunds`, etc.
- **Porcentajes:** `thermo_threshold BETWEEN 0 AND 100`, `penalty_percent BETWEEN 0 AND 100`, `target_percentage BETWEEN 0 AND 100`.

### 5.4 Inmutabilidad de Auditoría
Trigger de PostgreSQL activo: `trg_audit_logs_immutable` sobre la tabla `audit_logs`, que aborta cualquier intento de `UPDATE` o `DELETE` con excepción `AuditLog is append-only and cannot be updated or deleted`.

---

## 6. Evidencia de Reproducibilidad en Base Virgen (`plataforma_gr_verify`)

Para garantizar que ningún estado residual de desarrollo enmascarara defectos, se ejecutó el ciclo completo sobre una base de datos vacía:

```bash
# 1. Creación de base virgen
docker exec plataforma_gr_db psql -U postgres -c "DROP DATABASE IF EXISTS plataforma_gr_verify;" -c "CREATE DATABASE plataforma_gr_verify;"

# 2. Despliegue secuencial de migraciones
DATABASE_URL="postgresql://postgres:postgres123@localhost:5433/plataforma_gr_verify?schema=public" npx prisma migrate deploy
# Output:
# Applying migration `20260824000000_init`
# Applying migration `20260908000000_data_model_v2`
# Applying migration `20260908010000_p0_constraints_and_meal_type`
# All migrations have been successfully applied. (Exit Code 0)

# 3. Seed canónico
DATABASE_URL="postgresql://postgres:postgres123@localhost:5433/plataforma_gr_verify?schema=public" npx prisma db seed
# Output:
# 🌱 Seeding database with Data Model 2.0...
# ✅ Accounts created: Admin and Graduate
# ✅ Seed completed successfully! (Exit Code 0)

# 4. Verificación de rechazo ante violación de constraint
docker exec plataforma_gr_db psql -U postgres -d plataforma_gr_verify -c \
  "INSERT INTO event_tables (id, event_id, label, position_x, position_y, width, height, capacity, updated_at) \
   VALUES (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', 'Mesa Inválida', 1.5, 0.5, 0.1, 0.1, 10, NOW());"
# Output:
# ERROR: new row for relation "event_tables" violates check constraint "chk_tables_pos_x"
```

---

## 7. Compilación y Salud de Código

- **Prisma Schema Validation:** `npx prisma validate` $\rightarrow$ OK.
- **Prisma Schema Format:** `npx prisma format` $\rightarrow$ Formatted in 66ms.
- **TypeScript Typecheck:** `npm run typecheck` (`tsc --noEmit`) $\rightarrow$ Exit Code 0.
- **NestJS Production Build:** `npm run build` (`nest build`) $\rightarrow$ Exit Code 0.

---

## 8. Conclusión

La **foundation contract-first y de persistencia** queda formalmente sellada y aprobada. Los siguientes módulos (autorización, ledger financiero, lógica de croquis/OCR, platillos y reportes) cuentan ahora con una base estricta, probada y reproducible.
