import { type TableMock, type TableAssignmentMock } from '../../../fixtures';
import type { SeatingTable } from '../../../services/seating';

export interface Point {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Local UI view-model for tables on the canvas.
 * Disassociates transient canvas coordinates from the normative TableMock domain fixture.
 */
export interface SeatingTableViewModel extends TableMock {
  x: number; // normalized 0..1 (visual UI state)
  y: number; // normalized 0..1 (visual UI state)
  width?: number; // normalized 0..1
  height?: number; // normalized 0..1
  assignments?: TableAssignmentMock[];
}

/**
 * Generates local UI view-models from domain TableMock items with default grid positions.
 */
export function createSeatingViewModels(tables: TableMock[]): SeatingTableViewModel[] {
  const cols = 3;
  return tables.map((t, idx) => {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const defaultX = Number((0.20 + col * 0.28).toFixed(2));
    const defaultY = Number((0.25 + row * 0.32).toFixed(2));
    return {
      ...t,
      x: defaultX,
      y: defaultY,
      width: 0.08,
      height: 0.08,
      assignments: t.assignments ? [...t.assignments] : [],
    };
  });
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

/**
 * Converts normalized dimensions (0.0 to 1.0) to canvas pixel dimensions.
 */
export function toCanvasDimensions(
  normDimensions: { width?: number; height?: number },
  canvasWidth: number,
  canvasHeight: number,
  defaultSize = 76
): Dimensions {
  const w = normDimensions.width ? normDimensions.width * canvasWidth : defaultSize;
  const h = normDimensions.height ? normDimensions.height * canvasHeight : defaultSize;
  return {
    width: Math.max(36, Math.round(w)),
    height: Math.max(36, Math.round(h)),
  };
}

/**
 * Converts canvas pixel dimensions to normalized dimensions clamped between 0.02 and 0.5.
 */
export function toNormalizedDimensions(
  pixelDimensions: Dimensions,
  canvasWidth: number,
  canvasHeight: number
): Dimensions {
  if (canvasWidth <= 0 || canvasHeight <= 0) return { width: 0.08, height: 0.08 };
  return {
    width: Math.max(0.03, Math.min(0.5, Number((pixelDimensions.width / canvasWidth).toFixed(4)))),
    height: Math.max(0.03, Math.min(0.5, Number((pixelDimensions.height / canvasHeight).toFixed(4)))),
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
 * occupied = SUM(assignments.placesAssigned) || table.occupied
 * available = capacity - occupied (regardless of BLOCKED status)
 * FULL is derived (available === 0)
 */
export function calculateTableOccupancy(table: TableMock | SeatingTableViewModel | SeatingTable): TableOccupancyStats {
  const occupied =
    table.assignments && table.assignments.length > 0
      ? table.assignments.reduce((sum, a) => sum + (a.placesAssigned || 1), 0)
      : table.occupied ?? 0;

  const available = Math.max(0, table.capacity - occupied);
  const isFull = available === 0;
  const percentage = table.capacity > 0 ? Math.min(100, Math.round((occupied / table.capacity) * 100)) : 0;

  return {
    occupied,
    available,
    isFull,
    percentage,
  };
}
