import { describe, it, expect } from 'vitest';
import { getEventOverviewMetrics } from '../pages/admin/event-overview/eventOverviewMetrics';
import type { GraduateMock, TableMock } from '../fixtures';

describe('Event Overview Metrics Unit Tests (FRONTEND-03C-R1)', () => {
  it('correctly filters metrics strictly to the requested eventId without counting other events', () => {
    const syntheticGraduates: GraduateMock[] = [
      {
        id: 'grad-a-1',
        eventId: 'event-a',
        fullName: 'Graduado A1',
        email: 'a1@test.com',
        career: 'Derecho',
        generation: '2027',
        ticketCount: 4,
        tableNumber: 1,
        thermoStatus: 'AVAILABLE',
        thermoThreshold: 70,
        guests: [],
      },
      {
        id: 'grad-b-1',
        eventId: 'event-b',
        fullName: 'Graduado B1',
        email: 'b1@test.com',
        career: 'Medicina',
        generation: '2027',
        ticketCount: 10,
        tableNumber: 2,
        thermoStatus: 'LOCKED',
        thermoThreshold: 70,
        guests: [],
      },
    ];

    const syntheticTables: TableMock[] = [
      {
        id: 'tbl-a-1',
        eventId: 'event-a',
        number: 1,
        shape: 'ROUND',
        capacity: 10,
        occupied: 4,
        available: 6,
        status: 'AVAILABLE',
      },
      {
        id: 'tbl-b-1',
        eventId: 'event-b',
        number: 2,
        shape: 'SQUARE',
        capacity: 20,
        occupied: 10,
        available: 10,
        status: 'AVAILABLE',
      },
    ];

    const metricsA = getEventOverviewMetrics('event-a', syntheticGraduates, syntheticTables);

    expect(metricsA.graduateCount).toBe(1);
    expect(metricsA.contractedPlaces).toBe(4);
    expect(metricsA.tableCapacity).toBe(10);
    expect(metricsA.occupiedPlaces).toBe(4);
    expect(metricsA.occupancyPercent).toBe(40);

    const metricsEmpty = getEventOverviewMetrics('event-c', syntheticGraduates, syntheticTables);
    expect(metricsEmpty.graduateCount).toBe(0);
    expect(metricsEmpty.contractedPlaces).toBe(0);
    expect(metricsEmpty.tableCapacity).toBe(0);
    expect(metricsEmpty.occupiedPlaces).toBe(0);
    expect(metricsEmpty.occupancyPercent).toBe(0);
  });
});
