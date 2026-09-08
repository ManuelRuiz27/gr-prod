import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  AccountRole,
  AccountStatus,
  GraduateMembershipStatus,
  TableShape,
  TableStatus,
  Prisma,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('Seating Concurrency P0 (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  const eventId = 'e0000000-0000-0000-0000-000000000001';
  let testTableId: string;
  let accountAId: string;
  let accountBId: string;
  let membershipAId: string;
  let membershipBId: string;
  let memberAId: string;
  let memberBId: string;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwt = moduleFixture.get<JwtService>(JwtService);

    // 1. Create a 1-seat test table
    const table = await prisma.eventTable.create({
      data: {
        event_id: eventId,
        label: 'TEST-CONC-' + Date.now().toString().slice(-4),
        shape: TableShape.ROUND,
        capacity: 1,
        status: TableStatus.AVAILABLE,
        position_x: new Prisma.Decimal(0.5),
        position_y: new Prisma.Decimal(0.5),
        width: new Prisma.Decimal(0.1),
        height: new Prisma.Decimal(0.1),
      },
    });
    testTableId = table.id;

    const pwHash = await bcrypt.hash('Secret123!', 10);

    // 2. Create Graduate Account A
    const accA = await prisma.account.create({
      data: {
        email: 'conc_a_' + Date.now() + '@test.com',
        email_normalized: 'conc_a_' + Date.now() + '@test.com',
        password_hash: pwHash,
        full_name: 'Concurrent Graduate A',
        role: AccountRole.GRADUATE,
        status: AccountStatus.ACTIVE,
      },
    });
    accountAId = accA.id;

    const memA = await prisma.graduateMembership.create({
      data: {
        event_id: eventId,
        account_id: accA.id,
        status: GraduateMembershipStatus.ACTIVE,
        active_places: 1,
      },
    });
    membershipAId = memA.id;

    const gmA = await prisma.groupMember.create({
      data: {
        membership_id: memA.id,
        full_name: 'Concurrent Graduate A',
        is_primary: true,
        is_active: true,
      },
    });
    memberAId = gmA.id;

    tokenA = jwt.sign(
      { sub: accA.id, email: accA.email, role: accA.role },
      { secret: process.env.JWT_SECRET || 'plataforma-gr-secret-key-production-ready' },
    );

    // 3. Create Graduate Account B
    const accB = await prisma.account.create({
      data: {
        email: 'conc_b_' + Date.now() + '@test.com',
        email_normalized: 'conc_b_' + Date.now() + '@test.com',
        password_hash: pwHash,
        full_name: 'Concurrent Graduate B',
        role: AccountRole.GRADUATE,
        status: AccountStatus.ACTIVE,
      },
    });
    accountBId = accB.id;

    const memB = await prisma.graduateMembership.create({
      data: {
        event_id: eventId,
        account_id: accB.id,
        status: GraduateMembershipStatus.ACTIVE,
        active_places: 1,
      },
    });
    membershipBId = memB.id;

    const gmB = await prisma.groupMember.create({
      data: {
        membership_id: memB.id,
        full_name: 'Concurrent Graduate B',
        is_primary: true,
        is_active: true,
      },
    });
    memberBId = gmB.id;

    tokenB = jwt.sign(
      { sub: accB.id, email: accB.email, role: accB.role },
      { secret: process.env.JWT_SECRET || 'plataforma-gr-secret-key-production-ready' },
    );
  });

  afterAll(async () => {
    try {
      if (testTableId) {
        await prisma.tableAssignment.deleteMany({ where: { table_id: testTableId } });
        await prisma.eventTable.delete({ where: { id: testTableId } }).catch(() => null);
      }
      if (membershipAId) {
        await prisma.groupMember.deleteMany({ where: { membership_id: membershipAId } });
        await prisma.graduateMembership.delete({ where: { id: membershipAId } }).catch(() => null);
      }
      if (membershipBId) {
        await prisma.groupMember.deleteMany({ where: { membership_id: membershipBId } });
        await prisma.graduateMembership.delete({ where: { id: membershipBId } }).catch(() => null);
      }
      if (accountAId) {
        await prisma.account.delete({ where: { id: accountAId } }).catch(() => null);
      }
      if (accountBId) {
        await prisma.account.delete({ where: { id: accountBId } }).catch(() => null);
      }
    } finally {
      if (app) {
        await app.close();
      }
    }
  });

  it('should enforce deterministic row lock: exactly 1 wins (200) and 1 is rejected (409 TABLE_CAPACITY_CHANGED)', async () => {
    const reqA = request(app.getHttpServer())
      .put('/api/v1/me/events/' + eventId + '/table-assignments')
      .set('Authorization', 'Bearer ' + tokenA)
      .send({
        table_id: testTableId,
        member_ids: [memberAId],
      });

    const reqB = request(app.getHttpServer())
      .put('/api/v1/me/events/' + eventId + '/table-assignments')
      .set('Authorization', 'Bearer ' + tokenB)
      .send({
        table_id: testTableId,
        member_ids: [memberBId],
      });

    const [resA, resB] = await Promise.all([reqA, reqB]);

    const statuses = [resA.status, resB.status].sort();
    expect(statuses).toEqual([200, 409]);

    const successRes = resA.status === 200 ? resA : resB;
    const conflictRes = resA.status === 409 ? resA : resB;

    expect(successRes.body).toHaveProperty('tableId', testTableId);
    expect(successRes.body).toHaveProperty('assignedCount', 1);
    expect(successRes.body).toHaveProperty('remainingSeats', 0);

    expect(conflictRes.body.code).toBe('TABLE_CAPACITY_CHANGED');

    const assignments = await prisma.tableAssignment.findMany({
      where: { table_id: testTableId },
    });
    expect(assignments).toHaveLength(1);
    const assignedMemberId = assignments[0].group_member_id;
    expect([memberAId, memberBId]).toContain(assignedMemberId);
  });
});