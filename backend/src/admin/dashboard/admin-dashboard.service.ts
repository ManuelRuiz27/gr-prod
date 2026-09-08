import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventStatus, GraduateMembershipStatus, PaymentSubmissionStatus } from '@prisma/client';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary() {
    const [eventsCount, activeEventsCount, graduatesCount, pendingSubmissionsCount, plans] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.event.count({ where: { status: EventStatus.OPEN } }),
      this.prisma.graduateMembership.count({ where: { status: GraduateMembershipStatus.ACTIVE } }),
      this.prisma.paymentSubmission.count({ where: { status: PaymentSubmissionStatus.PENDING_REVIEW } }),
      this.prisma.paymentPlan.findMany({
        select: {
          contracted_total: true,
          transactions: {
            where: { status: 'CONFIRMED' },
            select: { amount: true },
          },
        },
      }),
    ]);

    let totalContracted = 0;
    let totalCollected = 0;
    for (const plan of plans) {
      const total = Number(plan.contracted_total);
      const collected = plan.transactions.reduce((acc, t) => acc + Number(t.amount), 0);
      totalContracted += total;
      totalCollected += collected;
    }

    const recentEvents = await this.prisma.event.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        _count: {
          select: { memberships: true, event_tables: true },
        },
      },
    });

    return {
      metrics: {
        totalEvents: eventsCount,
        activeEvents: activeEventsCount,
        totalGraduates: graduatesCount,
        pendingSubmissions: pendingSubmissionsCount,
        totalContractedAmount: totalContracted.toFixed(2),
        totalCollectedAmount: totalCollected.toFixed(2),
        collectionPercentage: totalContracted > 0 ? ((totalCollected / totalContracted) * 100).toFixed(2) : '0.00',
      },
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        name: e.name,
        date: e.date,
        venue: e.venue,
        status: e.status,
        graduatesCount: e._count.memberships,
        tablesCount: e._count.event_tables,
      })),
    };
  }
}
