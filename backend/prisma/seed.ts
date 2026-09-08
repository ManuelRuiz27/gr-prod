import { PrismaClient, AccountRole, AccountStatus, EventStatus, ProductKind, TableShape, TableStatus, PaymentPlanStatus, InstallmentLifecycleStatus, ContractStatus, MealType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Data Model 2.0...');

  // 1. Accounts
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 12);
  const graduatePasswordHash = await bcrypt.hash('GraduatePass123!', 12);

  const adminAccount = await prisma.account.upsert({
    where: { email_normalized: 'admin@plataformagr.com' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000001',
      email: 'admin@plataformagr.com',
      email_normalized: 'admin@plataformagr.com',
      password_hash: adminPasswordHash,
      full_name: 'Administrador Principal',
      phone_e164: '+525500000001',
      role: AccountRole.ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });

  const graduateAccount = await prisma.account.upsert({
    where: { email_normalized: 'andrea.martinez@ejemplo.com' },
    update: {},
    create: {
      id: 'a0000000-0000-0000-0000-000000000002',
      email: 'andrea.martinez@ejemplo.com',
      email_normalized: 'andrea.martinez@ejemplo.com',
      password_hash: graduatePasswordHash,
      full_name: 'Andrea Martínez',
      phone_e164: '+525500000002',
      role: AccountRole.GRADUATE,
      status: AccountStatus.ACTIVE,
    },
  });

  console.log('✅ Accounts created: Admin and Graduate');

  // 2. Canonical Event
  const eventId = 'e0000000-0000-0000-0000-000000000001';
  const event = await prisma.event.upsert({
    where: { id: eventId },
    update: {},
    create: {
      id: eventId,
      name: 'Graduación Facultad de Derecho 2027',
      date: new Date('2027-07-15T00:00:00.000Z'),
      venue: 'Salón Bellavista',
      capacity: 500,
      timezone: 'America/Mexico_City',
      status: EventStatus.OPEN,
      settings: {
        create: {
          thermo_threshold: 70.00,
          late_grace_days: 5,
          late_fee_amount: 500.00,
          places_deadline: new Date('2027-06-01T23:59:59.000Z'),
          seating_deadline: new Date('2027-06-15T23:59:59.000Z'),
          meals_deadline: new Date('2027-06-20T23:59:59.000Z'),
          liquidation_due_date: new Date('2027-06-30T00:00:00.000Z'),
        },
      },
    },
  });

  // Event Access Code
  let accessCode = await prisma.eventAccessCode.findFirst({
    where: { event_id: event.id, status: 'ACTIVE' },
  });
  if (!accessCode) {
    const accessCodeHash = await bcrypt.hash('DER2027', 10);
    accessCode = await prisma.eventAccessCode.create({
      data: {
        event_id: event.id,
        code_hash: accessCodeHash,
      },
    });
  }

  // 3. Event Products
  const productAdult = await prisma.eventProduct.upsert({
    where: { event_id_code: { event_id: event.id, code: 'ADULT' } },
    update: {},
    create: {
      event_id: event.id,
      code: 'ADULT',
      name: 'Boleto Adulto (Cena formal 4 tiempos)',
      kind: ProductKind.ADULT,
      unit_price: 1500.00,
      display_order: 1,
    },
  });

  await prisma.eventProduct.upsert({
    where: { event_id_code: { event_id: event.id, code: 'CHILD' } },
    update: {},
    create: {
      event_id: event.id,
      code: 'CHILD',
      name: 'Boleto Infantil (Menú infantil)',
      kind: ProductKind.CHILD,
      unit_price: 850.00,
      display_order: 2,
    },
  });

  await prisma.eventProduct.upsert({
    where: { event_id_code: { event_id: event.id, code: 'NO_DINNER' } },
    update: {},
    create: {
      event_id: event.id,
      code: 'NO_DINNER',
      name: 'Entrada Sin Cena (Brindis y trasnochada)',
      kind: ProductKind.NO_DINNER,
      unit_price: 650.00,
      display_order: 3,
    },
  });

  // 4. Meal Options
  let mealOpt1 = await prisma.mealOption.findFirst({
    where: { event_id: event.id, display_order: 1 },
  });
  if (!mealOpt1) {
    mealOpt1 = await prisma.mealOption.create({
      data: {
        event_id: event.id,
        name: 'Filete Mignon en reducción de vino tinto',
        description: 'Acompañado de puré trufado y espárragos glaseados',
        type: MealType.STANDARD,
        is_vegetarian: false,
        is_vegan: false,
        display_order: 1,
      },
    });
  }

  let mealOpt2 = await prisma.mealOption.findFirst({
    where: { event_id: event.id, display_order: 2 },
  });
  if (!mealOpt2) {
    mealOpt2 = await prisma.mealOption.create({
      data: {
        event_id: event.id,
        name: 'Salmón a las finas hierbas con costra de pistache',
        description: 'Con risotto de quinoa y vegetales salteados',
        type: MealType.STANDARD,
        is_vegetarian: false,
        is_vegan: false,
        display_order: 2,
      },
    });
  }

  let mealOpt3 = await prisma.mealOption.findFirst({
    where: { event_id: event.id, display_order: 3 },
  });
  if (!mealOpt3) {
    mealOpt3 = await prisma.mealOption.create({
      data: {
        event_id: event.id,
        name: 'Risotto de hongos silvestres (Vegetariano/Vegano)',
        description: 'Con aceite de trufa blanca y queso parmesano vegetal',
        type: MealType.VEGAN,
        is_vegetarian: true,
        is_vegan: true,
        display_order: 3,
      },
    });
  }

  // 5. Cancellation Policy
  let policy = await prisma.cancellationPolicy.findFirst({
    where: { event_id: event.id, status: 'ACTIVE' },
  });
  if (!policy) {
    policy = await prisma.cancellationPolicy.create({
      data: {
        event_id: event.id,
        version: 1,
        status: 'ACTIVE',
        ranges: {
          create: [
            { days_before_min: 0, days_before_max: 29, penalty_percent: 100.00 },
            { days_before_min: 30, days_before_max: 60, penalty_percent: 75.00 },
            { days_before_min: 61, days_before_max: 90, penalty_percent: 50.00 },
            { days_before_min: 91, days_before_max: null, penalty_percent: 30.00 },
          ],
        },
      },
    });
  }

  // 6. Seating Map & Tables
  await prisma.seatingMap.upsert({
    where: { event_id: event.id },
    update: {},
    create: {
      event_id: event.id,
      coordinate_mode: 'NORMALIZED',
    },
  });

  // Create 12 initial tables
  const createdTables = [];
  for (let i = 1; i <= 12; i++) {
    const row = Math.floor((i - 1) / 4);
    const col = (i - 1) % 4;
    const posX = (0.15 + col * 0.22).toFixed(4);
    const posY = (0.20 + row * 0.25).toFixed(4);

    const tbl = await prisma.eventTable.upsert({
      where: { event_id_label: { event_id: event.id, label: `Mesa ${i}` } },
      update: {},
      create: {
        event_id: event.id,
        label: `Mesa ${i}`,
        shape: i % 2 === 0 ? TableShape.ROUND : TableShape.SQUARE,
        capacity: 10,
        status: TableStatus.AVAILABLE,
        position_x: posX,
        position_y: posY,
        width: '0.0800',
        height: '0.0800',
      },
    });
    createdTables.push(tbl);
  }

  // 7. Graduate Membership, Contract & Group Members
  const membership = await prisma.graduateMembership.upsert({
    where: { event_id_account_id: { event_id: event.id, account_id: graduateAccount.id } },
    update: {},
    create: {
      event_id: event.id,
      account_id: graduateAccount.id,
      active_places: 10,
    },
  });

  // Primary Member
  let primaryMember = await prisma.groupMember.findFirst({
    where: { membership_id: membership.id, is_primary: true },
  });
  if (!primaryMember) {
    primaryMember = await prisma.groupMember.create({
      data: {
        membership_id: membership.id,
        full_name: 'Andrea Martínez',
        is_primary: true,
        meal_selection: {
          create: {
            meal_option_id: mealOpt1.id,
          },
        },
        table_assignment: {
          create: {
            table_id: createdTables[0].id,
          },
        },
      },
    });

    // Secondary Members
    const memberNames = [
      'Roberto Martínez (Papá)',
      'Carmen Flores (Mamá)',
      'Sofía Martínez (Hermana)',
      'Alejandro Martínez (Hermano)',
      'Elena Ruiz (Tía)',
      'Carlos Ruiz (Tío)',
      'Lucía Mendoza (Prima)',
      'Mateo Díaz (Invitado)',
      'Camila Torres (Invitada)',
    ];

    for (let idx = 0; idx < memberNames.length; idx++) {
      await prisma.groupMember.create({
        data: {
          membership_id: membership.id,
          full_name: memberNames[idx],
          is_primary: false,
          meal_selection: {
            create: {
              meal_option_id: idx % 2 === 0 ? mealOpt2.id : mealOpt3.id,
            },
          },
          table_assignment: {
            create: {
              table_id: createdTables[0].id,
            },
          },
        },
      });
    }
  }

  // Contract
  let contract = await prisma.graduateContract.findFirst({
    where: { membership_id: membership.id },
  });
  if (!contract) {
    contract = await prisma.graduateContract.create({
      data: {
        membership_id: membership.id,
        folio: 'GR-2027-DER-0001',
        terms_version: 'v1.0-2026',
        terms_snapshot_hash: 'sha256_mock_terms_hash_andrea',
        cancellation_policy_id: policy.id,
        status: ContractStatus.ACCEPTED,
        accepted_at: new Date('2026-09-01T12:00:00.000Z'),
        accepted_by_account_id: graduateAccount.id,
        line_items: {
          create: [
            {
              product_id: productAdult.id,
              concept_code: 'ADULT',
              label: '10 Boletos Adulto (Mesa Completa)',
              quantity: 10,
              unit_amount: 1500.00,
              line_total: 15000.00,
            },
          ],
        },
      },
    });
  }

  // 8. Payment Plan & Installments
  let plan = await prisma.paymentPlan.findFirst({
    where: { membership_id: membership.id },
    include: { installments: true },
  });
  if (!plan) {
    plan = await prisma.paymentPlan.create({
      data: {
        event_id: event.id,
        membership_id: membership.id,
        contracted_total: 15000.00,
        is_frozen: true,
        frozen_at: new Date('2026-09-02T10:00:00.000Z'),
        status: PaymentPlanStatus.ACTIVE,
        installments: {
          create: [
            { sequence: 1, concept_code: 'INITIAL', label: 'Pago Inicial de Confirmación', amount: 3000.00, due_date: new Date('2026-09-15T00:00:00.000Z') },
            { sequence: 2, concept_code: 'MONTHLY_1', label: 'Parcialidad 1 de 4', amount: 3000.00, due_date: new Date('2026-11-15T00:00:00.000Z') },
            { sequence: 3, concept_code: 'MONTHLY_2', label: 'Parcialidad 2 de 4', amount: 3000.00, due_date: new Date('2027-01-15T00:00:00.000Z') },
            { sequence: 4, concept_code: 'MONTHLY_3', label: 'Parcialidad 3 de 4', amount: 3000.00, due_date: new Date('2027-03-15T00:00:00.000Z') },
            { sequence: 5, concept_code: 'MONTHLY_4', label: 'Liquidación Final', amount: 3000.00, due_date: new Date('2027-05-15T00:00:00.000Z') },
          ],
        },
      },
      include: { installments: true },
    });

    // 1 Confirmed Payment Transaction of $3,000 for Initial Payment
    await prisma.paymentTransaction.create({
      data: {
        payment_plan_id: plan.id,
        amount: 3000.00,
        source: 'TRANSFER',
        reference: 'BBVA-TR-84920491',
        status: 'CONFIRMED',
        paid_at: new Date('2026-09-02T10:00:00.000Z'),
        allocations: {
          create: [
            {
              installment_id: plan.installments[0].id,
              amount: 3000.00,
            },
          ],
        },
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('   Admin: admin@plataformagr.com / AdminPass123!');
  console.log('   Graduate: andrea.martinez@ejemplo.com / GraduatePass123!');
  console.log('   Event: Graduación Facultad de Derecho 2027 (ID:', event.id, ')');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
