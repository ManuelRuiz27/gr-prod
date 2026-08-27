import type { GraduateMock, TableMock } from '../../../fixtures';

export interface EventOverviewMetrics {
  graduateCount: number;
  contractedPlaces: number;
  tableCapacity: number;
  occupiedPlaces: number;
  occupancyPercent: number;
}

export function getEventOverviewMetrics(
  eventId: string,
  graduates: GraduateMock[],
  tables: TableMock[]
): EventOverviewMetrics {
  const eventGraduates = graduates.filter(
    (graduate) => graduate.eventId === eventId
  );
  const eventTables = tables.filter(
    (table) => table.eventId === eventId
  );

  const graduateCount = eventGraduates.length;
  const contractedPlaces = eventGraduates.reduce(
    (sum, graduate) => sum + graduate.ticketCount,
    0
  );
  const tableCapacity = eventTables.reduce(
    (sum, table) => sum + table.capacity,
    0
  );
  const occupiedPlaces = eventTables.reduce(
    (sum, table) => sum + table.occupied,
    0
  );
  const occupancyPercent =
    tableCapacity === 0
      ? 0
      : Math.round((occupiedPlaces / tableCapacity) * 100);

  return {
    graduateCount,
    contractedPlaces,
    tableCapacity,
    occupiedPlaces,
    occupancyPercent,
  };
}
