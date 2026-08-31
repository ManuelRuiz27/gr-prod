import { type TableMock } from '../../../fixtures';

export interface Point {
  x: number;
  y: number;
}

/**
 * Converts normalized coordinates (0.0 to 1.0) to canvas pixel coordinates.
 */
export function toCanvasCoords(normPoint: Point, canvasWidth: number, canvasHeight: number): Point {
  return {
    x: normPoint.x * canvasWidth,
    y: normPoint.y * canvasHeight,
  };
}

/**
 * Converts canvas pixel coordinates to normalized coordinates clamped between 0.0 and 1.0.
 */
export function toNormalizedCoords(canvasPoint: Point, canvasWidth: number, canvasHeight: number): Point {
  if (canvasWidth <= 0 || canvasHeight <= 0) return { x: 0, y: 0 };
  const rawX = canvasPoint.x / canvasWidth;
  const rawY = canvasPoint.y / canvasHeight;
  return {
    x: Math.max(0.02, Math.min(0.98, Number(rawX.toFixed(4)))),
    y: Math.max(0.02, Math.min(0.98, Number(rawY.toFixed(4)))),
  };
}

export interface TableOccupancyStats {
  occupied: number;
  available: number;
  isFull: boolean;
  percentage: number;
}

/**
 * Derives dynamic occupancy stats according to SEATING_MAP.md rules:
 * occupied = SUM(assignments.placesAssigned)
 * available = capacity - occupied
 * FULL is derived (available === 0 && status !== 'BLOCKED')
 */
export function calculateTableOccupancy(table: TableMock): TableOccupancyStats {
  const occupied =
    table.assignments && table.assignments.length > 0
      ? table.assignments.reduce((sum, a) => sum + a.placesAssigned, 0)
      : table.occupied ?? 0;

  const available =
    table.status === 'BLOCKED'
      ? 0
      : Math.max(0, table.capacity - occupied);

  const isFull = table.status !== 'BLOCKED' && available === 0;
  const percentage = table.capacity > 0 ? Math.min(100, Math.round((occupied / table.capacity) * 100)) : 0;

  return {
    occupied,
    available,
    isFull,
    percentage,
  };
}
