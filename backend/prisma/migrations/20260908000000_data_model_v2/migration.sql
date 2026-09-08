-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('ADMIN', 'GRADUATE');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'FINALIZED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventAccessCodeStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "ConfigurationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GraduateMembershipStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('PENDING_ACCEPTANCE', 'ACCEPTED', 'SUPERSEDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProductKind" AS ENUM ('BASE_PACKAGE', 'ADULT', 'CHILD', 'NO_DINNER', 'EXTRA_THERMO', 'OTHER');

-- CreateEnum
CREATE TYPE "ContractLineItemQuoteStatus" AS ENUM ('VALID', 'USED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TableShape" AS ENUM ('SQUARE', 'ROUND');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "PaymentPlanStatus" AS ENUM ('ACTIVE', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InstallmentLifecycleStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MERCADO_PAGO', 'OPENPAY');

-- CreateEnum
CREATE TYPE "PaymentSource" AS ENUM ('MERCADO_PAGO', 'OPENPAY', 'CASH', 'TRANSFER', 'DEPOSIT');

-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('CREATED', 'REDIRECTED', 'PENDING', 'CONFIRMED', 'FAILED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentSubmissionStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('CONFIRMED', 'REVERSED');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('CREDIT', 'DEBIT', 'OBLIGATION_REDUCTION', 'OBLIGATION_CANCELLATION');

-- CreateEnum
CREATE TYPE "PenaltyChargeStatus" AS ENUM ('PENDING', 'APPLIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CancellationPolicyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CancellationQuoteStatus" AS ENUM ('VALID', 'EXPIRED', 'USED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProviderEventProcessingStatus" AS ENUM ('RECEIVED', 'VERIFIED', 'PROCESSED', 'IGNORED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReconciliationCaseStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReconciliationCaseType" AS ENUM ('PAYMENT_CONFIRMED_CAPACITY_CONFLICT', 'PROVIDER_CONFIRMED_INTERNAL_TRANSACTION_MISSING', 'PAYMENT_AMOUNT_MISMATCH', 'SUBMISSION_APPROVED_TRANSACTION_MISSING', 'REFUND_PROVIDER_MISMATCH', 'OTHER');

-- CreateEnum
CREATE TYPE "ThermoOperationalStatus" AS ENUM ('REQUESTED', 'IN_PRODUCTION', 'DELIVERED');

-- CreateEnum
CREATE TYPE "ThermoPersonalizationFieldType" AS ENUM ('TEXT', 'CHOICE');

-- CreateEnum
CREATE TYPE "FileAssetStatus" AS ENUM ('PENDING_VALIDATION', 'AVAILABLE', 'QUARANTINED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FilePurpose" AS ENUM ('PAYMENT_EVIDENCE', 'SEATING_BACKGROUND', 'THERMO_SIGNATURE', 'THERMO_EVIDENCE', 'REFUND_EVIDENCE', 'EXPORT', 'OTHER_INTERNAL');

-- CreateEnum
CREATE TYPE "IdempotencyState" AS ENUM ('PROCESSING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExportJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('XLSX', 'CSV', 'PDF');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('ACCOUNT', 'SYSTEM');

-- DropForeignKey
ALTER TABLE "Graduate" DROP CONSTRAINT "Graduate_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Guest" DROP CONSTRAINT "Guest_graduate_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_graduate_id_fkey";

-- DropForeignKey
ALTER TABLE "Table" DROP CONSTRAINT "Table_event_id_fkey";

-- DropForeignKey
ALTER TABLE "TableSelection" DROP CONSTRAINT "TableSelection_graduate_id_fkey";

-- DropForeignKey
ALTER TABLE "TableSelection" DROP CONSTRAINT "TableSelection_table_id_fkey";

-- DropForeignKey
ALTER TABLE "Thermo" DROP CONSTRAINT "Thermo_graduate_id_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_graduate_id_fkey";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "Graduate";

-- DropTable
DROP TABLE "Guest";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Table";

-- DropTable
DROP TABLE "TableSelection";

-- DropTable
DROP TABLE "Thermo";

-- DropTable
DROP TABLE "Ticket";

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "email_normalized" VARCHAR(320) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "phone_e164" VARCHAR(32),
    "role" "AccountRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "user_agent" VARCHAR(500),
    "ip_hash" VARCHAR(128),
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "venue" VARCHAR(255) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'America/Mexico_City',
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_settings" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "places_deadline" TIMESTAMPTZ(3),
    "seating_deadline" TIMESTAMPTZ(3),
    "meals_deadline" TIMESTAMPTZ(3),
    "thermo_threshold" DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    "late_grace_days" INTEGER NOT NULL DEFAULT 5,
    "late_fee_amount" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "liquidation_due_date" DATE,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "event_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_access_codes" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "code_hash" VARCHAR(255) NOT NULL,
    "status" "EventAccessCodeStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMPTZ(3),
    "rotated_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_access_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_products" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "kind" "ProductKind" NOT NULL,
    "unit_price" DECIMAL(18,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "event_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_financial_configurations" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "ConfigurationStatus" NOT NULL DEFAULT 'DRAFT',
    "description" VARCHAR(255),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "event_financial_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installment_templates" (
    "id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "concept_code" VARCHAR(64) NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "due_date" DATE NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "is_initial" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "installment_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_milestones" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "target_percentage" DECIMAL(5,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "purpose" VARCHAR(100),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellation_policies" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "CancellationPolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "cancellation_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellation_policy_ranges" (
    "id" UUID NOT NULL,
    "policy_id" UUID NOT NULL,
    "days_before_min" INTEGER NOT NULL,
    "days_before_max" INTEGER,
    "penalty_percent" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cancellation_policy_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_options" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "is_vegetarian" BOOLEAN NOT NULL DEFAULT false,
    "is_vegan" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "meal_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seating_maps" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "background_file_id" UUID,
    "background_original_width" INTEGER,
    "background_original_height" INTEGER,
    "coordinate_mode" VARCHAR(32) NOT NULL DEFAULT 'NORMALIZED',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "seating_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_tables" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "label" VARCHAR(64) NOT NULL,
    "shape" "TableShape" NOT NULL DEFAULT 'ROUND',
    "capacity" INTEGER NOT NULL,
    "status" "TableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "position_x" DECIMAL(9,8) NOT NULL,
    "position_y" DECIMAL(9,8) NOT NULL,
    "width" DECIMAL(9,8) NOT NULL,
    "height" DECIMAL(9,8) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "event_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_assignments" (
    "id" UUID NOT NULL,
    "table_id" UUID NOT NULL,
    "group_member_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "table_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduate_memberships" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "status" "GraduateMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "active_places" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "graduate_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_selections" (
    "id" UUID NOT NULL,
    "group_member_id" UUID NOT NULL,
    "meal_option_id" UUID NOT NULL,
    "selected_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduate_contracts" (
    "id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "folio" VARCHAR(64) NOT NULL,
    "terms_version" VARCHAR(64) NOT NULL,
    "terms_snapshot_hash" VARCHAR(255) NOT NULL,
    "cancellation_policy_id" UUID,
    "status" "ContractStatus" NOT NULL DEFAULT 'PENDING_ACCEPTANCE',
    "accepted_at" TIMESTAMPTZ(3),
    "accepted_by_account_id" UUID,
    "accepted_ip_hash" VARCHAR(128),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "graduate_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_line_items" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "product_id" UUID,
    "concept_code" VARCHAR(64) NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_amount" DECIMAL(18,2) NOT NULL,
    "line_total" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_line_item_quotes" (
    "id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(18,2) NOT NULL,
    "additional_total" DECIMAL(18,2) NOT NULL,
    "new_contracted_total" DECIMAL(18,2) NOT NULL,
    "required_progress" DECIMAL(5,2) NOT NULL,
    "eligible_paid" DECIMAL(18,2) NOT NULL,
    "required_paid_after" DECIMAL(18,2) NOT NULL,
    "catch_up_due" DECIMAL(18,2) NOT NULL,
    "status" "ContractLineItemQuoteStatus" NOT NULL DEFAULT 'VALID',
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_line_item_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_plans" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'MXN',
    "contracted_total" DECIMAL(18,2) NOT NULL,
    "is_frozen" BOOLEAN NOT NULL DEFAULT false,
    "frozen_at" TIMESTAMPTZ(3),
    "status" "PaymentPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installments" (
    "id" UUID NOT NULL,
    "payment_plan_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "concept_code" VARCHAR(64) NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "InstallmentLifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_attempts" (
    "id" UUID NOT NULL,
    "payment_plan_id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "requested_amount" DECIMAL(18,2) NOT NULL,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'CREATED',
    "external_reference" VARCHAR(255),
    "checkout_url" TEXT,
    "expires_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_submissions" (
    "id" UUID NOT NULL,
    "payment_plan_id" UUID NOT NULL,
    "folio" VARCHAR(64) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "method" "PaymentSource" NOT NULL,
    "reference" VARCHAR(255) NOT NULL,
    "paid_at" TIMESTAMPTZ(3) NOT NULL,
    "evidence_file_id" UUID,
    "status" "PaymentSubmissionStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewed_by_account_id" UUID,
    "reviewed_at" TIMESTAMPTZ(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL,
    "payment_plan_id" UUID NOT NULL,
    "submission_id" UUID,
    "amount" DECIMAL(18,2) NOT NULL,
    "source" "PaymentSource" NOT NULL,
    "external_identifier" VARCHAR(255),
    "reference" VARCHAR(255),
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'CONFIRMED',
    "paid_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "installment_id" UUID NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocation_reversals" (
    "id" UUID NOT NULL,
    "allocation_id" UUID NOT NULL,
    "refund_id" UUID,
    "amount" DECIMAL(18,2) NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocation_reversals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjustments" (
    "id" UUID NOT NULL,
    "payment_plan_id" UUID NOT NULL,
    "installment_id" UUID,
    "type" "AdjustmentType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "created_by_account_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penalty_charges" (
    "id" UUID NOT NULL,
    "payment_plan_id" UUID NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" "PenaltyChargeStatus" NOT NULL DEFAULT 'PENDING',
    "reason" VARCHAR(255) NOT NULL,
    "applied_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penalty_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellation_quotes" (
    "id" UUID NOT NULL,
    "payment_plan_id" UUID NOT NULL,
    "contracted_total" DECIMAL(18,2) NOT NULL,
    "eligible_paid" DECIMAL(18,2) NOT NULL,
    "penalty_percent" DECIMAL(5,2) NOT NULL,
    "penalty_amount" DECIMAL(18,2) NOT NULL,
    "retained_amount" DECIMAL(18,2) NOT NULL,
    "refund_due" DECIMAL(18,2) NOT NULL,
    "remaining_due" DECIMAL(18,2) NOT NULL,
    "days_before_event" INTEGER NOT NULL,
    "policy_version" INTEGER NOT NULL,
    "status" "CancellationQuoteStatus" NOT NULL DEFAULT 'VALID',
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cancellation_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "payment_plan_id" UUID NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
    "reason" TEXT NOT NULL,
    "method" VARCHAR(64) NOT NULL,
    "external_reference" VARCHAR(255),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_sources" (
    "id" UUID NOT NULL,
    "refund_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refund_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thermo_configurations" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "ConfigurationStatus" NOT NULL DEFAULT 'DRAFT',
    "allow_customization" BOOLEAN NOT NULL DEFAULT true,
    "requires_delivery_signature" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "thermo_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thermo_personalization_fields" (
    "id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "field_type" "ThermoPersonalizationFieldType" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "max_length" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thermo_personalization_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thermo_personalization_options" (
    "id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thermo_personalization_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thermo_requests" (
    "id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "status" "ThermoOperationalStatus" NOT NULL DEFAULT 'REQUESTED',
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "production_at" TIMESTAMPTZ(3),
    "delivered_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "thermo_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thermo_personalization_values" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "value" VARCHAR(500) NOT NULL,

    CONSTRAINT "thermo_personalization_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thermo_deliveries" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "recipient_name" VARCHAR(200) NOT NULL,
    "delivered_by_account_id" UUID,
    "delivered_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signature_file_id" UUID,
    "evidence_file_id" UUID,
    "notes" TEXT,

    CONSTRAINT "thermo_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_notes" (
    "id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "author_id" UUID,
    "author_name" VARCHAR(200) NOT NULL,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_assets" (
    "id" UUID NOT NULL,
    "purpose" "FilePurpose" NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "original_filename" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(128) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "status" "FileAssetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_by_account_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" UUID NOT NULL,
    "scope" VARCHAR(128) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "request_hash" VARCHAR(64) NOT NULL,
    "state" "IdempotencyState" NOT NULL DEFAULT 'PROCESSING',
    "response_status" INTEGER,
    "response_body" JSONB,
    "resource_type" VARCHAR(64),
    "resource_id" UUID,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" UUID NOT NULL,
    "event_type" VARCHAR(128) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_jobs" (
    "id" UUID NOT NULL,
    "event_id" UUID,
    "report_type" VARCHAR(64) NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "filters" JSONB,
    "status" "ExportJobStatus" NOT NULL DEFAULT 'PENDING',
    "file_asset_id" UUID,
    "created_by_account_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "export_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "event_id" UUID,
    "actor_id" UUID,
    "actor_type" "AuditActorType" NOT NULL,
    "actor_name" VARCHAR(200) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(64) NOT NULL,
    "entity_id" VARCHAR(64) NOT NULL,
    "description" TEXT NOT NULL,
    "diff" JSONB,
    "reason" TEXT,
    "request_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_cases" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "case_type" "ReconciliationCaseType" NOT NULL,
    "status" "ReconciliationCaseStatus" NOT NULL DEFAULT 'OPEN',
    "details" JSONB NOT NULL,
    "resolution_note" TEXT,
    "resolved_by_account_id" UUID,
    "resolved_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "reconciliation_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_provider_events" (
    "id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "external_event_id" VARCHAR(255) NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "processing_status" "ProviderEventProcessingStatus" NOT NULL DEFAULT 'RECEIVED',
    "processed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_provider_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_normalized_key" ON "accounts"("email_normalized");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_refresh_token_hash_key" ON "auth_sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "auth_sessions_account_id_idx" ON "auth_sessions"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_account_id_idx" ON "password_reset_tokens"("account_id");

-- CreateIndex
CREATE INDEX "notifications_account_id_is_read_idx" ON "notifications"("account_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "event_settings_event_id_key" ON "event_settings"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_access_codes_code_hash_key" ON "event_access_codes"("code_hash");

-- CreateIndex
CREATE INDEX "event_access_codes_event_id_status_idx" ON "event_access_codes"("event_id", "status");

-- CreateIndex
CREATE INDEX "event_products_event_id_idx" ON "event_products"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_products_event_id_code_key" ON "event_products"("event_id", "code");

-- CreateIndex
CREATE INDEX "event_financial_configurations_event_id_idx" ON "event_financial_configurations"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_financial_configurations_event_id_version_key" ON "event_financial_configurations"("event_id", "version");

-- CreateIndex
CREATE INDEX "installment_templates_configuration_id_idx" ON "installment_templates"("configuration_id");

-- CreateIndex
CREATE UNIQUE INDEX "installment_templates_configuration_id_sequence_key" ON "installment_templates"("configuration_id", "sequence");

-- CreateIndex
CREATE INDEX "financial_milestones_event_id_idx" ON "financial_milestones"("event_id");

-- CreateIndex
CREATE INDEX "cancellation_policies_event_id_idx" ON "cancellation_policies"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "cancellation_policies_event_id_version_key" ON "cancellation_policies"("event_id", "version");

-- CreateIndex
CREATE INDEX "cancellation_policy_ranges_policy_id_idx" ON "cancellation_policy_ranges"("policy_id");

-- CreateIndex
CREATE INDEX "meal_options_event_id_idx" ON "meal_options"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "seating_maps_event_id_key" ON "seating_maps"("event_id");

-- CreateIndex
CREATE INDEX "event_tables_event_id_idx" ON "event_tables"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_tables_event_id_label_key" ON "event_tables"("event_id", "label");

-- CreateIndex
CREATE UNIQUE INDEX "table_assignments_group_member_id_key" ON "table_assignments"("group_member_id");

-- CreateIndex
CREATE INDEX "table_assignments_table_id_idx" ON "table_assignments"("table_id");

-- CreateIndex
CREATE INDEX "graduate_memberships_event_id_idx" ON "graduate_memberships"("event_id");

-- CreateIndex
CREATE INDEX "graduate_memberships_account_id_idx" ON "graduate_memberships"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "graduate_memberships_event_id_account_id_key" ON "graduate_memberships"("event_id", "account_id");

-- CreateIndex
CREATE INDEX "group_members_membership_id_idx" ON "group_members"("membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "meal_selections_group_member_id_key" ON "meal_selections"("group_member_id");

-- CreateIndex
CREATE INDEX "meal_selections_meal_option_id_idx" ON "meal_selections"("meal_option_id");

-- CreateIndex
CREATE UNIQUE INDEX "graduate_contracts_folio_key" ON "graduate_contracts"("folio");

-- CreateIndex
CREATE INDEX "graduate_contracts_membership_id_idx" ON "graduate_contracts"("membership_id");

-- CreateIndex
CREATE INDEX "contract_line_items_contract_id_idx" ON "contract_line_items"("contract_id");

-- CreateIndex
CREATE INDEX "contract_line_item_quotes_membership_id_idx" ON "contract_line_item_quotes"("membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_plans_membership_id_key" ON "payment_plans"("membership_id");

-- CreateIndex
CREATE INDEX "payment_plans_event_id_idx" ON "payment_plans"("event_id");

-- CreateIndex
CREATE INDEX "installments_payment_plan_id_idx" ON "installments"("payment_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "installments_payment_plan_id_sequence_key" ON "installments"("payment_plan_id", "sequence");

-- CreateIndex
CREATE INDEX "payment_attempts_payment_plan_id_idx" ON "payment_attempts"("payment_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_submissions_folio_key" ON "payment_submissions"("folio");

-- CreateIndex
CREATE INDEX "payment_submissions_payment_plan_id_idx" ON "payment_submissions"("payment_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_submission_id_key" ON "payment_transactions"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_external_identifier_key" ON "payment_transactions"("external_identifier");

-- CreateIndex
CREATE INDEX "payment_transactions_payment_plan_id_idx" ON "payment_transactions"("payment_plan_id");

-- CreateIndex
CREATE INDEX "payment_allocations_transaction_id_idx" ON "payment_allocations"("transaction_id");

-- CreateIndex
CREATE INDEX "payment_allocations_installment_id_idx" ON "payment_allocations"("installment_id");

-- CreateIndex
CREATE INDEX "payment_allocation_reversals_allocation_id_idx" ON "payment_allocation_reversals"("allocation_id");

-- CreateIndex
CREATE INDEX "adjustments_payment_plan_id_idx" ON "adjustments"("payment_plan_id");

-- CreateIndex
CREATE INDEX "penalty_charges_payment_plan_id_idx" ON "penalty_charges"("payment_plan_id");

-- CreateIndex
CREATE INDEX "cancellation_quotes_payment_plan_id_idx" ON "cancellation_quotes"("payment_plan_id");

-- CreateIndex
CREATE INDEX "refunds_payment_plan_id_idx" ON "refunds"("payment_plan_id");

-- CreateIndex
CREATE INDEX "refund_sources_refund_id_idx" ON "refund_sources"("refund_id");

-- CreateIndex
CREATE INDEX "refund_sources_transaction_id_idx" ON "refund_sources"("transaction_id");

-- CreateIndex
CREATE INDEX "thermo_configurations_event_id_idx" ON "thermo_configurations"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "thermo_configurations_event_id_version_key" ON "thermo_configurations"("event_id", "version");

-- CreateIndex
CREATE INDEX "thermo_personalization_fields_configuration_id_idx" ON "thermo_personalization_fields"("configuration_id");

-- CreateIndex
CREATE UNIQUE INDEX "thermo_personalization_fields_configuration_id_code_key" ON "thermo_personalization_fields"("configuration_id", "code");

-- CreateIndex
CREATE INDEX "thermo_personalization_options_field_id_idx" ON "thermo_personalization_options"("field_id");

-- CreateIndex
CREATE UNIQUE INDEX "thermo_personalization_options_field_id_code_key" ON "thermo_personalization_options"("field_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "thermo_requests_membership_id_key" ON "thermo_requests"("membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "thermo_personalization_values_request_id_field_id_key" ON "thermo_personalization_values"("request_id", "field_id");

-- CreateIndex
CREATE UNIQUE INDEX "thermo_deliveries_request_id_key" ON "thermo_deliveries"("request_id");

-- CreateIndex
CREATE INDEX "internal_notes_membership_id_idx" ON "internal_notes"("membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "file_assets_storage_path_key" ON "file_assets"("storage_path");

-- CreateIndex
CREATE INDEX "idempotency_records_expires_at_idx" ON "idempotency_records"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_scope_key_key" ON "idempotency_records"("scope", "key");

-- CreateIndex
CREATE INDEX "outbox_events_status_created_at_idx" ON "outbox_events"("status", "created_at");

-- CreateIndex
CREATE INDEX "export_jobs_event_id_idx" ON "export_jobs"("event_id");

-- CreateIndex
CREATE INDEX "audit_logs_event_id_created_at_idx" ON "audit_logs"("event_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "reconciliation_cases_event_id_status_idx" ON "reconciliation_cases"("event_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_provider_events_provider_external_event_id_key" ON "payment_provider_events"("provider", "external_event_id");

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_settings" ADD CONSTRAINT "event_settings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_access_codes" ADD CONSTRAINT "event_access_codes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_products" ADD CONSTRAINT "event_products_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_financial_configurations" ADD CONSTRAINT "event_financial_configurations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installment_templates" ADD CONSTRAINT "installment_templates_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "event_financial_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_milestones" ADD CONSTRAINT "financial_milestones_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellation_policies" ADD CONSTRAINT "cancellation_policies_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellation_policy_ranges" ADD CONSTRAINT "cancellation_policy_ranges_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "cancellation_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_options" ADD CONSTRAINT "meal_options_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seating_maps" ADD CONSTRAINT "seating_maps_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seating_maps" ADD CONSTRAINT "seating_maps_background_file_id_fkey" FOREIGN KEY ("background_file_id") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tables" ADD CONSTRAINT "event_tables_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_assignments" ADD CONSTRAINT "table_assignments_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "event_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_assignments" ADD CONSTRAINT "table_assignments_group_member_id_fkey" FOREIGN KEY ("group_member_id") REFERENCES "group_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduate_memberships" ADD CONSTRAINT "graduate_memberships_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduate_memberships" ADD CONSTRAINT "graduate_memberships_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "graduate_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_selections" ADD CONSTRAINT "meal_selections_group_member_id_fkey" FOREIGN KEY ("group_member_id") REFERENCES "group_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_selections" ADD CONSTRAINT "meal_selections_meal_option_id_fkey" FOREIGN KEY ("meal_option_id") REFERENCES "meal_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduate_contracts" ADD CONSTRAINT "graduate_contracts_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "graduate_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduate_contracts" ADD CONSTRAINT "graduate_contracts_cancellation_policy_id_fkey" FOREIGN KEY ("cancellation_policy_id") REFERENCES "cancellation_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_line_items" ADD CONSTRAINT "contract_line_items_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "graduate_contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_line_items" ADD CONSTRAINT "contract_line_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "event_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_line_item_quotes" ADD CONSTRAINT "contract_line_item_quotes_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "graduate_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "graduate_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_submissions" ADD CONSTRAINT "payment_submissions_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_submissions" ADD CONSTRAINT "payment_submissions_evidence_file_id_fkey" FOREIGN KEY ("evidence_file_id") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "payment_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "payment_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "installments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocation_reversals" ADD CONSTRAINT "payment_allocation_reversals_allocation_id_fkey" FOREIGN KEY ("allocation_id") REFERENCES "payment_allocations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalty_charges" ADD CONSTRAINT "penalty_charges_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellation_quotes" ADD CONSTRAINT "cancellation_quotes_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_plan_id_fkey" FOREIGN KEY ("payment_plan_id") REFERENCES "payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_sources" ADD CONSTRAINT "refund_sources_refund_id_fkey" FOREIGN KEY ("refund_id") REFERENCES "refunds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_sources" ADD CONSTRAINT "refund_sources_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "payment_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thermo_configurations" ADD CONSTRAINT "thermo_configurations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thermo_personalization_fields" ADD CONSTRAINT "thermo_personalization_fields_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "thermo_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thermo_personalization_options" ADD CONSTRAINT "thermo_personalization_options_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "thermo_personalization_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thermo_requests" ADD CONSTRAINT "thermo_requests_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "graduate_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thermo_personalization_values" ADD CONSTRAINT "thermo_personalization_values_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "thermo_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thermo_personalization_values" ADD CONSTRAINT "thermo_personalization_values_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "thermo_personalization_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thermo_deliveries" ADD CONSTRAINT "thermo_deliveries_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "thermo_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thermo_deliveries" ADD CONSTRAINT "thermo_deliveries_signature_file_id_fkey" FOREIGN KEY ("signature_file_id") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thermo_deliveries" ADD CONSTRAINT "thermo_deliveries_evidence_file_id_fkey" FOREIGN KEY ("evidence_file_id") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_notes" ADD CONSTRAINT "internal_notes_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "graduate_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_file_asset_id_fkey" FOREIGN KEY ("file_asset_id") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_cases" ADD CONSTRAINT "reconciliation_cases_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- ==========================================
-- DATA PRESERVATION: Conditional Backfill from legacy Event
-- ==========================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Event') THEN
    INSERT INTO "events" (id, name, date, venue, capacity, timezone, status, created_at, updated_at)
    SELECT id::uuid, name, date, venue, capacity, 'America/Mexico_City', 'OPEN'::"EventStatus", created_at, updated_at
    FROM "Event"
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "event_settings" (id, event_id, thermo_threshold, late_grace_days, late_fee_amount, created_at, updated_at)
    SELECT gen_random_uuid(), id::uuid, thermo_threshold, 5, 0.00, created_at, updated_at
    FROM "Event"
    ON CONFLICT (event_id) DO NOTHING;
  END IF;
END $$;

-- ==========================================
-- DOMAIN INTEGRITY & CHECK CONSTRAINTS
-- ==========================================

-- Events
ALTER TABLE "events" ADD CONSTRAINT "chk_events_capacity_positive" CHECK (capacity > 0);

-- Event Settings
ALTER TABLE "event_settings" ADD CONSTRAINT "chk_event_settings_thermo_threshold" CHECK (thermo_threshold >= 0 AND thermo_threshold <= 100);
ALTER TABLE "event_settings" ADD CONSTRAINT "chk_event_settings_late_fee" CHECK (late_fee_amount >= 0);

-- Event Products
ALTER TABLE "event_products" ADD CONSTRAINT "chk_event_products_unit_price" CHECK (unit_price >= 0);

-- Financial Milestones
ALTER TABLE "financial_milestones" ADD CONSTRAINT "chk_milestones_target_percentage" CHECK (target_percentage >= 0 AND target_percentage <= 100);

-- Cancellation Policy Ranges
ALTER TABLE "cancellation_policy_ranges" ADD CONSTRAINT "chk_cancel_ranges_min_days" CHECK (days_before_min >= 0);
ALTER TABLE "cancellation_policy_ranges" ADD CONSTRAINT "chk_cancel_ranges_max_days" CHECK (days_before_max IS NULL OR days_before_max >= days_before_min);
ALTER TABLE "cancellation_policy_ranges" ADD CONSTRAINT "chk_cancel_ranges_percent" CHECK (penalty_percent >= 0 AND penalty_percent <= 100);

-- Event Tables (Geometry 0..1 and capacity > 0)
ALTER TABLE "event_tables" ADD CONSTRAINT "chk_tables_capacity_positive" CHECK (capacity > 0);
ALTER TABLE "event_tables" ADD CONSTRAINT "chk_tables_pos_x" CHECK (position_x >= 0 AND position_x <= 1);
ALTER TABLE "event_tables" ADD CONSTRAINT "chk_tables_pos_y" CHECK (position_y >= 0 AND position_y <= 1);
ALTER TABLE "event_tables" ADD CONSTRAINT "chk_tables_width" CHECK (width > 0 AND width <= 1);
ALTER TABLE "event_tables" ADD CONSTRAINT "chk_tables_height" CHECK (height > 0 AND height <= 1);

-- Payment Plans & Money
ALTER TABLE "payment_plans" ADD CONSTRAINT "chk_plans_contracted_total" CHECK (contracted_total >= 0);
ALTER TABLE "installments" ADD CONSTRAINT "chk_installments_amount" CHECK (amount >= 0);
ALTER TABLE "payment_attempts" ADD CONSTRAINT "chk_attempts_amount" CHECK (requested_amount > 0);
ALTER TABLE "payment_submissions" ADD CONSTRAINT "chk_submissions_amount" CHECK (amount > 0);
ALTER TABLE "payment_transactions" ADD CONSTRAINT "chk_transactions_amount" CHECK (amount > 0);
ALTER TABLE "payment_allocations" ADD CONSTRAINT "chk_allocations_amount" CHECK (amount > 0);
ALTER TABLE "refunds" ADD CONSTRAINT "chk_refunds_amount" CHECK (amount > 0);
ALTER TABLE "refund_sources" ADD CONSTRAINT "chk_refund_sources_amount" CHECK (amount > 0);

-- ==========================================
-- AUDIT & TRANSACTION IMMUTABILITY GUARDS
-- ==========================================

CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only and cannot be updated or deleted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON "audit_logs";
CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON "audit_logs"
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_modification();
