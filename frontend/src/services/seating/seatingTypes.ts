import type { TableAssignmentMock, TableShape, TableStatus } from '../../fixtures';

export type { TableShape, TableStatus, TableAssignmentMock };

export interface SeatingGeometry {
  x: number; // 0..1 (coordenada central normalizada)
  y: number; // 0..1 (coordenada central normalizada)
  width?: number; // 0..1 (ancho normalizado respecto al canvas, opcional)
  height?: number; // 0..1 (alto normalizado respecto al canvas, opcional)
  shape: TableShape; // 'ROUND' (círculo) | 'SQUARE' (rectángulo/cuadrado)
}

export interface SeatingTable extends SeatingGeometry {
  id: string;
  eventId: string;
  number: number;
  label?: string; // Etiqueta visible (ej. "Mesa 12" o personalizada)
  capacity: number;
  occupied: number;
  available: number;
  status: TableStatus; // 'AVAILABLE' | 'BLOCKED' (persistido)
  assignments?: TableAssignmentMock[];
}

export type TableVisualStatus = 'AVAILABLE' | 'SELECTED' | 'FULL' | 'BLOCKED' | 'PARTIAL';

export interface TableStatusDescriptor {
  status: TableVisualStatus;
  label: string;
  shortLabel: string;
  badgeVariant: 'success' | 'warning' | 'error' | 'neutral' | 'primary';
  accessibleText: string;
  isSelectableForGraduate: boolean;
}

/**
 * Deriva el estado visual de la mesa según las reglas de SEATING_MAP.md
 */
export function deriveTableVisualStatus(
  table: { capacity: number; occupied?: number; available?: number; status: TableStatus; assignments?: TableAssignmentMock[] },
  isSelected = false
): TableVisualStatus {
  if (isSelected) return 'SELECTED';
  if (table.status === 'BLOCKED') return 'BLOCKED';

  const occupied = table.assignments && table.assignments.length > 0
    ? table.assignments.reduce((sum, a) => sum + (a.placesAssigned || 1), 0)
    : table.occupied ?? 0;

  const available = Math.max(0, table.capacity - occupied);

  if (available === 0 || occupied >= table.capacity) return 'FULL';
  if (occupied > 0) return 'PARTIAL';
  return 'AVAILABLE';
}

/**
 * Retorna la descripción textual, variante de badge y accesibilidad multimodal
 */
export function getTableStatusDescriptor(
  table: SeatingTable,
  isSelected = false
): TableStatusDescriptor {
  const visualStatus = deriveTableVisualStatus(table, isSelected);

  switch (visualStatus) {
    case 'SELECTED':
      return {
        status: 'SELECTED',
        label: 'Seleccionada',
        shortLabel: 'Seleccionada',
        badgeVariant: 'primary',
        accessibleText: `Mesa ${table.number} · Seleccionada actualmente · ${table.available} lugares libres`,
        isSelectableForGraduate: true,
      };
    case 'BLOCKED':
      return {
        status: 'BLOCKED',
        label: 'Bloqueada por administración',
        shortLabel: 'Bloqueada',
        badgeVariant: 'error',
        accessibleText: `Mesa ${table.number} · Bloqueada · ${table.available} lugares físicos no disponibles`,
        isSelectableForGraduate: false,
      };
    case 'FULL':
      return {
        status: 'FULL',
        label: 'Mesa completa',
        shortLabel: 'Completa',
        badgeVariant: 'neutral',
        accessibleText: `Mesa ${table.number} · Completa · 0 lugares libres`,
        isSelectableForGraduate: false,
      };
    case 'PARTIAL':
      return {
        status: 'PARTIAL',
        label: `Ocupación parcial (${table.available} libres)`,
        shortLabel: `${table.available} libres`,
        badgeVariant: 'warning',
        accessibleText: `Mesa ${table.number} · Ocupación parcial · ${table.available} lugares libres de ${table.capacity}`,
        isSelectableForGraduate: true,
      };
    case 'AVAILABLE':
    default:
      return {
        status: 'AVAILABLE',
        label: `Disponible (${table.available} libres)`,
        shortLabel: `${table.available} libres`,
        badgeVariant: 'success',
        accessibleText: `Mesa ${table.number} · Disponible · ${table.available} lugares libres de ${table.capacity}`,
        isSelectableForGraduate: true,
      };
  }
}

/**
 * Sanitiza los datos de una mesa para la vista Graduate eliminando PII de terceros.
 * Solo preserva las asignaciones correspondientes al graduado actual.
 */
export function sanitizeTableForGraduate(
  table: SeatingTable,
  currentGraduateId?: string
): SeatingTable {
  const ownAssignments = (table.assignments || []).filter(
    (a) => currentGraduateId && a.graduateId === currentGraduateId
  );

  return {
    ...table,
    // Elimina cualquier asignación de otros graduados para proteger PII
    assignments: ownAssignments.map((a) => ({
      id: a.id,
      graduateId: a.graduateId,
      graduateName: a.graduateName,
      groupMemberId: a.groupMemberId,
      memberName: a.memberName,
      placesAssigned: a.placesAssigned,
    })),
  };
}
