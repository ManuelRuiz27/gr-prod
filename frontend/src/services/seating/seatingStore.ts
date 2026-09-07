import { mockTables, type TableAssignmentMock } from '../../fixtures';
import type { SeatingTable, TableShape } from './seatingTypes';
import { sanitizeTableForGraduate } from './seatingTypes';
import { publishSeatingEvent } from './seatingRealtimeAdapter';

export interface CreateTableInput {
  number: number;
  shape: TableShape;
  capacity: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface BulkCreateTablesInput {
  quantity: number;
  startNumber: number;
  shape: TableShape;
  capacity: number;
}

class SeatingStore {
  private tablesByEvent: Map<string, SeatingTable[]> = new Map();
  private backgroundsByEvent: Map<string, string | null> = new Map();

  constructor() {
    this.initDefaultEvent();
  }

  private initDefaultEvent() {
    // Inicializar evento default con baseline normativo mockTables
    const defaultEventId = 'evt-derecho-2027';
    const initialTables: SeatingTable[] = mockTables.map((t, idx) => {
      const cols = 3;
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const defaultX = Number((0.20 + col * 0.28).toFixed(2));
      const defaultY = Number((0.25 + row * 0.32).toFixed(2));

      // Asignaciones base para Andrea Martínez (Mesa 24)
      const baseAssignments: TableAssignmentMock[] = [];
      if (t.number === 24) {
        baseAssignments.push({
          id: 'asgn-andrea-init',
          graduateId: 'grad-andrea-martinez',
          graduateName: 'Andrea Martínez',
          placesAssigned: 8,
          isLocalPreview: false,
        });
      }

      const occupied = baseAssignments.reduce((acc, a) => acc + (a.placesAssigned || 1), 0) || t.occupied || 0;
      const available = Math.max(0, t.capacity - occupied);

      return {
        id: t.id,
        eventId: defaultEventId,
        number: t.number,
        label: `Mesa ${t.number}`,
        shape: t.shape,
        capacity: t.capacity,
        occupied,
        available,
        status: t.status,
        x: defaultX,
        y: defaultY,
        width: 0.08,
        height: 0.08,
        assignments: baseAssignments,
      };
    });

    this.tablesByEvent.set(defaultEventId, initialTables);
  }

  /**
   * Resetea el store para entornos de test o inicialización limpia
   */
  reset(eventId?: string) {
    if (eventId) {
      this.tablesByEvent.delete(eventId);
      this.backgroundsByEvent.delete(eventId);
      if (eventId === 'evt-derecho-2027') {
        this.initDefaultEvent();
      }
    } else {
      this.tablesByEvent.clear();
      this.backgroundsByEvent.clear();
      this.initDefaultEvent();
    }
  }

  getTables(
    eventId: string,
    options?: { sanitizeForGraduate?: boolean; currentGraduateId?: string }
  ): SeatingTable[] {
    if (!this.tablesByEvent.has(eventId)) {
      // Buscar si existen mockTables para este evento
      const matched = mockTables.filter((t) => t.eventId === eventId);
      if (matched.length > 0) {
        const generated: SeatingTable[] = matched.map((t, idx) => ({
          id: t.id,
          eventId,
          number: t.number,
          label: `Mesa ${t.number}`,
          shape: t.shape,
          capacity: t.capacity,
          occupied: t.occupied,
          available: t.available,
          status: t.status,
          x: Number((0.20 + (idx % 3) * 0.28).toFixed(2)),
          y: Number((0.25 + Math.floor(idx / 3) * 0.32).toFixed(2)),
          width: 0.08,
          height: 0.08,
          assignments: [],
        }));
        this.tablesByEvent.set(eventId, generated);
      } else {
        this.tablesByEvent.set(eventId, []);
      }
    }

    const rawTables = this.tablesByEvent.get(eventId)!;

    if (options?.sanitizeForGraduate) {
      return rawTables.map((t) => sanitizeTableForGraduate(t, options.currentGraduateId));
    }

    return structuredClone(rawTables);
  }

  getTable(eventId: string, tableId: string): SeatingTable | null {
    const tables = this.getTables(eventId);
    return tables.find((t) => t.id === tableId) || null;
  }

  getBackground(eventId: string): string | null {
    return this.backgroundsByEvent.get(eventId) || null;
  }

  async setBackground(eventId: string, url: string | null, actorRole: 'admin' | 'graduate' = 'admin') {
    this.backgroundsByEvent.set(eventId, url);
    await publishSeatingEvent({
      type: 'seating.layout.updated',
      eventId,
      payload: {
        backgroundImageUrl: url,
        tables: this.getTables(eventId),
      },
      timestamp: Date.now(),
      actorRole,
    });
  }

  async createTable(eventId: string, input: CreateTableInput, actorRole: 'admin' | 'graduate' = 'admin'): Promise<SeatingTable> {
    const currentTables = this.getTables(eventId);

    const newTable: SeatingTable = {
      id: `tbl-${Date.now()}`,
      eventId,
      number: input.number,
      label: `Mesa ${input.number}`,
      shape: input.shape,
      capacity: input.capacity,
      occupied: 0,
      available: input.capacity,
      status: 'AVAILABLE',
      x: input.x ?? 0.5,
      y: input.y ?? 0.5,
      width: input.width ?? 0.08,
      height: input.height ?? 0.08,
      assignments: [],
    };

    const updated = [...currentTables, newTable];
    this.tablesByEvent.set(eventId, updated);

    await publishSeatingEvent({
      type: 'table.created',
      eventId,
      payload: { table: newTable },
      timestamp: Date.now(),
      actorRole,
    });

    return newTable;
  }

  async bulkCreateTables(eventId: string, input: BulkCreateTablesInput, actorRole: 'admin' | 'graduate' = 'admin'): Promise<SeatingTable[]> {
    const currentTables = this.getTables(eventId);
    const newTables: SeatingTable[] = [];
    const cols = 5;

    for (let i = 0; i < input.quantity; i++) {
      const num = input.startNumber + i;
      const rowIdx = Math.floor(i / cols);
      const colIdx = i % cols;

      const posX = 0.15 + colIdx * 0.17;
      const posY = 0.25 + rowIdx * 0.18;

      const tbl: SeatingTable = {
        id: `tbl-${Date.now()}-${i}`,
        eventId,
        number: num,
        label: `Mesa ${num}`,
        shape: input.shape,
        capacity: input.capacity,
        occupied: 0,
        available: input.capacity,
        status: 'AVAILABLE',
        x: Math.min(0.9, Number(posX.toFixed(2))),
        y: Math.min(0.9, Number(posY.toFixed(2))),
        width: 0.08,
        height: 0.08,
        assignments: [],
      };
      newTables.push(tbl);
    }

    const updated = [...currentTables, ...newTables];
    this.tablesByEvent.set(eventId, updated);

    for (const table of newTables) {
      await publishSeatingEvent({
        type: 'table.created',
        eventId,
        payload: { table },
        timestamp: Date.now(),
        actorRole,
      });
    }

    return newTables;
  }

  async updateTable(eventId: string, tableId: string, patch: Partial<SeatingTable>, actorRole: 'admin' | 'graduate' = 'admin'): Promise<SeatingTable> {
    const currentTables = this.getTables(eventId);
    let updatedTable: SeatingTable | null = null;

    const nextTables = currentTables.map((t) => {
      if (t.id !== tableId) return t;

      const occupied =
        patch.occupied !== undefined
          ? patch.occupied
          : patch.assignments
          ? patch.assignments.reduce((sum, a) => sum + (a.placesAssigned || 1), 0)
          : t.occupied;

      const capacity = patch.capacity ?? t.capacity;
      const available = patch.available !== undefined ? patch.available : Math.max(0, capacity - occupied);

      updatedTable = {
        ...t,
        ...patch,
        capacity,
        occupied,
        available,
      };
      return updatedTable;
    });

    if (!updatedTable) {
      throw new Error(`Table ${tableId} not found in event ${eventId}`);
    }

    this.tablesByEvent.set(eventId, nextTables);

    await publishSeatingEvent({
      type: 'table.updated',
      eventId,
      payload: {
        tableId,
        patch,
        table: updatedTable,
      },
      timestamp: Date.now(),
      actorRole,
    });

    return updatedTable;
  }

  async moveTable(eventId: string, tableId: string, x: number, y: number, actorRole: 'admin' | 'graduate' = 'admin'): Promise<SeatingTable> {
    return this.updateTable(eventId, tableId, { x, y }, actorRole);
  }

  async resizeTable(
    eventId: string,
    tableId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    actorRole: 'admin' | 'graduate' = 'admin'
  ): Promise<SeatingTable> {
    return this.updateTable(eventId, tableId, { x, y, width, height }, actorRole);
  }

  async toggleBlockTable(eventId: string, tableId: string, actorRole: 'admin' | 'graduate' = 'admin'): Promise<SeatingTable> {
    const table = this.getTable(eventId, tableId);
    if (!table) throw new Error(`Table ${tableId} not found`);

    const newStatus = table.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE';
    const updated = await this.updateTable(eventId, tableId, { status: newStatus }, actorRole);

    if (newStatus === 'BLOCKED') {
      await publishSeatingEvent({
        type: 'table.blocked',
        eventId,
        payload: { tableId, status: 'BLOCKED' },
        timestamp: Date.now(),
        actorRole,
      });
    } else {
      await publishSeatingEvent({
        type: 'table.unblocked',
        eventId,
        payload: { tableId, status: 'AVAILABLE' },
        timestamp: Date.now(),
        actorRole,
      });
    }

    return updated;
  }

  async deleteTable(eventId: string, tableId: string, actorRole: 'admin' | 'graduate' = 'admin'): Promise<{ success: boolean; error?: string }> {
    const table = this.getTable(eventId, tableId);
    if (!table) return { success: false, error: 'Mesa no encontrada.' };

    if (table.occupied > 0 || (table.assignments && table.assignments.length > 0)) {
      return {
        success: false,
        error: 'No se puede eliminar una mesa que tiene lugares ocupados o asignaciones activas.',
      };
    }

    const currentTables = this.getTables(eventId);
    const nextTables = currentTables.filter((t) => t.id !== tableId);
    this.tablesByEvent.set(eventId, nextTables);

    await publishSeatingEvent({
      type: 'table.deleted',
      eventId,
      payload: { tableId },
      timestamp: Date.now(),
      actorRole,
    });

    return { success: true };
  }

  /**
   * Asignación atómica de personas con validación de concurrencia y sobreasignación
   */
  async assignMembers(
    eventId: string,
    tableId: string,
    newAssignments: TableAssignmentMock[],
    actorRole: 'admin' | 'graduate',
    _actorId?: string
  ): Promise<{ success: boolean; error?: string; table?: SeatingTable }> {
    const table = this.getTable(eventId, tableId);
    if (!table) return { success: false, error: 'Mesa no encontrada.' };

    if (table.status === 'BLOCKED') {
      return { success: false, error: 'La mesa está bloqueada para nuevas asignaciones.' };
    }

    const placesRequested = newAssignments.reduce((acc, a) => acc + (a.placesAssigned || 1), 0);

    // Validación atómica de aforo
    if (table.available < placesRequested) {
      return {
        success: false,
        error: `Capacidad insuficiente. La mesa solo cuenta con ${table.available} lugar(es) disponible(s).`,
      };
    }

    const existingAssignments = table.assignments ? [...table.assignments] : [];

    // Si el integrante ya tenía asignación en otra mesa del evento, liberarlo
    const currentTables = this.getTables(eventId);
    const memberIdsToAssign = new Set(newAssignments.map((a) => a.groupMemberId).filter(Boolean));

    if (memberIdsToAssign.size > 0) {
      for (const otherTable of currentTables) {
        if (otherTable.id !== tableId && otherTable.assignments) {
          const filtered = otherTable.assignments.filter(
            (a) => !a.groupMemberId || !memberIdsToAssign.has(a.groupMemberId)
          );
          if (filtered.length !== otherTable.assignments.length) {
            const otherOccupied = filtered.reduce((acc, a) => acc + (a.placesAssigned || 1), 0);
            await this.updateTable(eventId, otherTable.id, {
              assignments: filtered,
              occupied: otherOccupied,
              available: Math.max(0, otherTable.capacity - otherOccupied),
            }, actorRole);
          }
        }
      }
    }

    const existingExplicitOccupied = existingAssignments.reduce((acc, a) => acc + (a.placesAssigned || 1), 0);
    const baselineOccupied = Math.max(0, table.occupied - existingExplicitOccupied);
    const mergedAssignments = [...existingAssignments, ...newAssignments];
    const newOccupied = baselineOccupied + mergedAssignments.reduce((acc, a) => acc + (a.placesAssigned || 1), 0);
    const newAvailable = Math.max(0, table.capacity - newOccupied);

    const updatedTable = await this.updateTable(eventId, tableId, {
      assignments: mergedAssignments,
      occupied: newOccupied,
      available: newAvailable,
    }, actorRole);

    await publishSeatingEvent({
      type: 'table.assignment.changed',
      eventId,
      payload: {
        tableId,
        assignments: mergedAssignments,
        occupied: newOccupied,
        available: newAvailable,
      },
      timestamp: Date.now(),
      actorRole,
    });

    return { success: true, table: updatedTable };
  }
}

export const seatingStore = new SeatingStore();
