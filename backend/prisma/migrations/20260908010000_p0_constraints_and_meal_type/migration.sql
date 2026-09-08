-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('STANDARD', 'VEGETARIAN', 'VEGAN', 'OTHER');

-- AlterTable
ALTER TABLE "meal_options" ADD COLUMN "type" "MealType" NOT NULL DEFAULT 'STANDARD';

-- Backfill MealType based on existing boolean flags
UPDATE "meal_options" SET "type" = 'VEGAN' WHERE "is_vegan" = true;
UPDATE "meal_options" SET "type" = 'VEGETARIAN' WHERE "is_vegetarian" = true AND "is_vegan" = false;

-- Create Partial Unique Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "idx_event_access_codes_one_active" ON "event_access_codes"("event_id") WHERE "status" = 'ACTIVE';
CREATE UNIQUE INDEX IF NOT EXISTS "idx_group_members_one_primary_active" ON "group_members"("membership_id") WHERE "is_primary" = true AND "is_active" = true;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_payment_plans_one_active" ON "payment_plans"("membership_id") WHERE "status" = 'ACTIVE';

-- Update Foreign Key Constraints on Financial Ledger to RESTRICT
ALTER TABLE "payment_plans" DROP CONSTRAINT IF EXISTS "payment_plans_membership_id_fkey";
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "graduate_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "installments" DROP CONSTRAINT IF EXISTS "installments_payment_plan_id_fkey";
ALTER TABLE "installments" ADD CONSTRAINT "installments_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payment_transactions" DROP CONSTRAINT IF EXISTS "payment_transactions_payment_plan_id_fkey";
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payment_allocations" DROP CONSTRAINT IF EXISTS "payment_allocations_transaction_id_fkey";
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "payment_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payment_allocations" DROP CONSTRAINT IF EXISTS "payment_allocations_installment_id_fkey";
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "installments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payment_allocation_reversals" DROP CONSTRAINT IF EXISTS "payment_allocation_reversals_allocation_id_fkey";
ALTER TABLE "payment_allocation_reversals" ADD CONSTRAINT "payment_allocation_reversals_allocation_id_fkey" FOREIGN KEY ("allocation_id") REFERENCES "payment_allocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "adjustments" DROP CONSTRAINT IF EXISTS "adjustments_payment_plan_id_fkey";
ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "penalty_charges" DROP CONSTRAINT IF EXISTS "penalty_charges_payment_plan_id_fkey";
ALTER TABLE "penalty_charges" ADD CONSTRAINT "penalty_charges_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cancellation_quotes" DROP CONSTRAINT IF EXISTS "cancellation_quotes_payment_plan_id_fkey";
ALTER TABLE "cancellation_quotes" ADD CONSTRAINT "cancellation_quotes_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "refunds" DROP CONSTRAINT IF EXISTS "refunds_payment_plan_id_fkey";
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "refund_sources" DROP CONSTRAINT IF EXISTS "refund_sources_refund_id_fkey";
ALTER TABLE "refund_sources" ADD CONSTRAINT "refund_sources_refund_id_fkey" FOREIGN KEY ("refund_id") REFERENCES "refunds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "refund_sources" DROP CONSTRAINT IF EXISTS "refund_sources_transaction_id_fkey";
ALTER TABLE "refund_sources" ADD CONSTRAINT "refund_sources_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "payment_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Additional Financial Domain Check Constraints
ALTER TABLE "adjustments" ADD CONSTRAINT "chk_adjustments_amount_nonzero" CHECK (amount <> 0);
ALTER TABLE "penalty_charges" ADD CONSTRAINT "chk_penalty_charges_amount_positive" CHECK (amount > 0);
