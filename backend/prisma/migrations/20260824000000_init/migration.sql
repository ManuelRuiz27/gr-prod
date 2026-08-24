-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "ticket_price" DECIMAL(10,2) NOT NULL,
    "months_duration" INTEGER NOT NULL DEFAULT 6,
    "initial_payment" DECIMAL(10,2) NOT NULL,
    "thermo_threshold" INTEGER NOT NULL DEFAULT 70,
    "meals_deadline" TIMESTAMP(3) NOT NULL,
    "layout_version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Graduate" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "career" TEXT NOT NULL,
    "generation" TEXT NOT NULL,
    "group" TEXT,
    "password_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "tickets_step" TEXT NOT NULL DEFAULT 'pending',
    "layout_step" TEXT NOT NULL DEFAULT 'pending',
    "meals_step" TEXT NOT NULL DEFAULT 'pending',
    "payments_step" TEXT NOT NULL DEFAULT 'pending',
    "thermo_step" TEXT NOT NULL DEFAULT 'locked',
    "thermo_prefix" TEXT,
    "thermo_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Graduate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "position_x" DOUBLE PRECISION NOT NULL,
    "position_y" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableSelection" (
    "id" TEXT NOT NULL,
    "graduate_id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "selected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TableSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "graduate_id" TEXT NOT NULL,
    "tickets_count" INTEGER NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "graduate_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "seat_number" TEXT,
    "meal_type" TEXT NOT NULL DEFAULT 'traditional',
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "graduate_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_date" TIMESTAMP(3),
    "openpay_tx_id" TEXT,
    "month_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thermo" (
    "id" TEXT NOT NULL,
    "graduate_id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thermo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Graduate_email_key" ON "Graduate"("email");
CREATE INDEX "Graduate_event_id_idx" ON "Graduate"("event_id");
CREATE INDEX "Graduate_email_idx" ON "Graduate"("email");

-- CreateIndex
CREATE INDEX "Table_event_id_idx" ON "Table"("event_id");
CREATE UNIQUE INDEX "Table_event_id_label_key" ON "Table"("event_id", "label");

-- CreateIndex
CREATE UNIQUE INDEX "TableSelection_graduate_id_key" ON "TableSelection"("graduate_id");
CREATE INDEX "TableSelection_table_id_idx" ON "TableSelection"("table_id");

-- CreateIndex
CREATE INDEX "Ticket_graduate_id_idx" ON "Ticket"("graduate_id");

-- CreateIndex
CREATE INDEX "Guest_graduate_id_idx" ON "Guest"("graduate_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_openpay_tx_id_key" ON "Payment"("openpay_tx_id");
CREATE INDEX "Payment_graduate_id_idx" ON "Payment"("graduate_id");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Thermo_graduate_id_key" ON "Thermo"("graduate_id");

-- AddForeignKey
ALTER TABLE "Graduate" ADD CONSTRAINT "Graduate_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableSelection" ADD CONSTRAINT "TableSelection_graduate_id_fkey" FOREIGN KEY ("graduate_id") REFERENCES "Graduate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableSelection" ADD CONSTRAINT "TableSelection_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_graduate_id_fkey" FOREIGN KEY ("graduate_id") REFERENCES "Graduate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_graduate_id_fkey" FOREIGN KEY ("graduate_id") REFERENCES "Graduate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_graduate_id_fkey" FOREIGN KEY ("graduate_id") REFERENCES "Graduate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thermo" ADD CONSTRAINT "Thermo_graduate_id_fkey" FOREIGN KEY ("graduate_id") REFERENCES "Graduate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
