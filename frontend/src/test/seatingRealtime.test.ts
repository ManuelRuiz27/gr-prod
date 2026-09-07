import { describe, it, expect, beforeEach } from 'vitest';
import {
  deriveTableVisualStatus,
  getTableStatusDescriptor,
  sanitizeTableForGraduate,
  seatingStore,
  subscribeToSeating,
  publishSeatingEvent,
  type SeatingEvent,
  type SeatingTable,
} from '../services/seating';
import {
  toCanvasCoords,
  toNormalizedCoords,
  toCanvasDimensions,
  toNormalizedDimensions,
} from '../pages/admin/tables/seatingCoordinates';

describe('Seating Realtime & Normalized Geometry Service', () => {
  beforeEach(() => {
    seatingStore.reset();
  });

  describe('1. Geometría Normalizada (0..1) y Conversión Bidireccional', () => {
    const CANVAS_W = 1000;
    const CANVAS_H = 600;

    it('transforms normalized coords (0..1) to canvas pixels and vice versa with precision', () => {
      const normPoint = { x: 0.25, y: 0.75 };
      const pixelPoint = toCanvasCoords(normPoint, CANVAS_W, CANVAS_H);

      expect(pixelPoint.x).toBe(250);
      expect(pixelPoint.y).toBe(450);

      const reverted = toNormalizedCoords(pixelPoint, CANVAS_W, CANVAS_H);
      expect(reverted.x).toBe(0.25);
      expect(reverted.y).toBe(0.75);
    });

    it('clamps coordinates outside 0..1 boundary safely', () => {
      const negativePoint = toNormalizedCoords({ x: -50, y: -100 }, CANVAS_W, CANVAS_H);
      expect(negativePoint.x).toBe(0.02);
      expect(negativePoint.y).toBe(0.02);

      const excessPoint = toNormalizedCoords({ x: 2000, y: 1500 }, CANVAS_W, CANVAS_H);
      expect(excessPoint.x).toBe(0.98);
      expect(excessPoint.y).toBe(0.98);
    });

    it('converts normalized dimensions to canvas pixel dimensions and vice versa', () => {
      const normDims = { width: 0.1, height: 0.1 };
      const canvasDims = toCanvasDimensions(normDims, CANVAS_W, CANVAS_H);

      expect(canvasDims.width).toBe(100);
      expect(canvasDims.height).toBe(60);

      const revertedDims = toNormalizedDimensions(canvasDims, CANVAS_W, CANVAS_H);
      expect(revertedDims.width).toBe(0.1);
      expect(revertedDims.height).toBe(0.1);
    });
  });

  describe('2. Derivación de Estados Visuales (SEATING_MAP.md)', () => {
    it('derives AVAILABLE when free capacity exists and status is AVAILABLE', () => {
      const table: SeatingTable = {
        id: 't-1',
        eventId: 'evt-test',
        number: 1,
        shape: 'ROUND',
        capacity: 10,
        occupied: 0,
        available: 10,
        status: 'AVAILABLE',
        x: 0.5,
        y: 0.5,
      };

      const status = deriveTableVisualStatus(table, false);
      expect(status).toBe('AVAILABLE');

      const desc = getTableStatusDescriptor(table, false);
      expect(desc.badgeVariant).toBe('success');
      expect(desc.label).toBe('Disponible (10 libres)');
    });

    it('derives PARTIAL when some seats are occupied but available > 0', () => {
      const table: SeatingTable = {
        id: 't-2',
        eventId: 'evt-test',
        number: 2,
        shape: 'SQUARE',
        capacity: 10,
        occupied: 4,
        available: 6,
        status: 'AVAILABLE',
        x: 0.5,
        y: 0.5,
      };

      const status = deriveTableVisualStatus(table, false);
      expect(status).toBe('PARTIAL');

      const desc = getTableStatusDescriptor(table, false);
      expect(desc.badgeVariant).toBe('warning');
      expect(desc.label).toBe('Ocupación parcial (6 libres)');
    });

    it('derives FULL when available is 0', () => {
      const table: SeatingTable = {
        id: 't-3',
        eventId: 'evt-test',
        number: 3,
        shape: 'ROUND',
        capacity: 10,
        occupied: 10,
        available: 0,
        status: 'AVAILABLE',
        x: 0.5,
        y: 0.5,
      };

      const status = deriveTableVisualStatus(table, false);
      expect(status).toBe('FULL');

      const desc = getTableStatusDescriptor(table, false);
      expect(desc.badgeVariant).toBe('neutral');
      expect(desc.label).toBe('Mesa completa');
    });

    it('derives BLOCKED when status is BLOCKED regardless of available seats', () => {
      const table: SeatingTable = {
        id: 't-4',
        eventId: 'evt-test',
        number: 4,
        shape: 'ROUND',
        capacity: 10,
        occupied: 0,
        available: 10,
        status: 'BLOCKED',
        x: 0.5,
        y: 0.5,
      };

      const status = deriveTableVisualStatus(table, false);
      expect(status).toBe('BLOCKED');

      const desc = getTableStatusDescriptor(table, false);
      expect(desc.badgeVariant).toBe('error');
      expect(desc.label).toBe('Bloqueada por administración');
    });

    it('prioritizes SELECTED state when table is active', () => {
      const table: SeatingTable = {
        id: 't-5',
        eventId: 'evt-test',
        number: 5,
        shape: 'ROUND',
        capacity: 10,
        occupied: 0,
        available: 10,
        status: 'AVAILABLE',
        x: 0.5,
        y: 0.5,
      };

      const status = deriveTableVisualStatus(table, true);
      expect(status).toBe('SELECTED');
    });
  });

  describe('3. Privacidad Estricta de Graduados (Cero Exposición de PII)', () => {
    it('strips out foreign graduate names, contracts and details for graduate role', () => {
      const rawTable: SeatingTable = {
        id: 'tbl-12',
        eventId: 'evt-derecho-2027',
        number: 12,
        shape: 'ROUND',
        capacity: 10,
        occupied: 6,
        available: 4,
        status: 'AVAILABLE',
        x: 0.5,
        y: 0.5,
        assignments: [
          {
            id: 'asgn-1',
            graduateId: 'grad-foreign-user',
            graduateName: 'Juan Pérez',
            memberName: 'Juan Pérez Jr',
            placesAssigned: 2,
          },
          {
            id: 'asgn-2',
            graduateId: 'grad-andrea-martinez',
            graduateName: 'Andrea Martínez',
            memberName: 'Andrea Martínez',
            placesAssigned: 4,
          },
        ],
      };

      const sanitized = sanitizeTableForGraduate(rawTable, 'grad-andrea-martinez');

      expect(sanitized.capacity).toBe(10);
      expect(sanitized.occupied).toBe(6);
      expect(sanitized.available).toBe(4);

      expect(sanitized.assignments).toHaveLength(1);
      expect(sanitized.assignments![0].graduateId).toBe('grad-andrea-martinez');
      expect(JSON.stringify(sanitized)).not.toContain('Juan Pérez');
    });

    it('strips all assignments if current graduate has no places on that table', () => {
      const rawTable: SeatingTable = {
        id: 'tbl-1',
        eventId: 'evt-derecho-2027',
        number: 1,
        shape: 'ROUND',
        capacity: 10,
        occupied: 10,
        available: 0,
        status: 'AVAILABLE',
        x: 0.5,
        y: 0.5,
        assignments: [
          {
            id: 'asgn-1',
            graduateId: 'grad-other',
            graduateName: 'Persona Confidencial',
            placesAssigned: 10,
          },
        ],
      };

      const sanitized = sanitizeTableForGraduate(rawTable, 'grad-andrea-martinez');
      expect(sanitized.assignments).toHaveLength(0);
      expect(sanitized.occupied).toBe(10);
      expect(sanitized.available).toBe(0);
      expect(JSON.stringify(sanitized)).not.toContain('Persona Confidencial');
    });
  });

  describe('4. Protocolo de Tiempo Real y Eventos (7 Tipos Requeridos)', () => {
    it('dispatches and receives all 7 seating events through subscription', async () => {
      const receivedEvents: SeatingEvent[] = [];
      const unsubscribe = subscribeToSeating('evt-realtime-test', (evt) => {
        receivedEvents.push(evt);
      });

      await publishSeatingEvent({
        type: 'table.created',
        eventId: 'evt-realtime-test',
        payload: {
          table: {
            id: 'tbl-new',
            eventId: 'evt-realtime-test',
            number: 99,
            shape: 'ROUND',
            capacity: 10,
            occupied: 0,
            available: 10,
            status: 'AVAILABLE',
            x: 0.5,
            y: 0.5,
          },
        },
        timestamp: Date.now(),
        actorRole: 'admin',
      });

      await publishSeatingEvent({
        type: 'table.updated',
        eventId: 'evt-realtime-test',
        payload: {
          tableId: 'tbl-new',
          patch: { capacity: 12 },
        },
        timestamp: Date.now(),
        actorRole: 'admin',
      });

      await publishSeatingEvent({
        type: 'table.blocked',
        eventId: 'evt-realtime-test',
        payload: { tableId: 'tbl-new', status: 'BLOCKED' },
        timestamp: Date.now(),
        actorRole: 'admin',
      });

      await publishSeatingEvent({
        type: 'table.unblocked',
        eventId: 'evt-realtime-test',
        payload: { tableId: 'tbl-new', status: 'AVAILABLE' },
        timestamp: Date.now(),
        actorRole: 'admin',
      });

      await publishSeatingEvent({
        type: 'table.assignment.changed',
        eventId: 'evt-realtime-test',
        payload: {
          tableId: 'tbl-new',
          assignments: [],
          occupied: 5,
          available: 7,
        },
        timestamp: Date.now(),
        actorRole: 'admin',
      });

      await publishSeatingEvent({
        type: 'seating.layout.updated',
        eventId: 'evt-realtime-test',
        payload: {
          backgroundImageUrl: 'data:image/png;base64,mock',
          tables: [],
        },
        timestamp: Date.now(),
        actorRole: 'admin',
      });

      await publishSeatingEvent({
        type: 'table.deleted',
        eventId: 'evt-realtime-test',
        payload: { tableId: 'tbl-new' },
        timestamp: Date.now(),
        actorRole: 'admin',
      });

      expect(receivedEvents).toHaveLength(7);
      expect(receivedEvents.map((e) => e.type)).toEqual([
        'table.created',
        'table.updated',
        'table.blocked',
        'table.unblocked',
        'table.assignment.changed',
        'seating.layout.updated',
        'table.deleted',
      ]);

      unsubscribe();
    });
  });

  describe('5. Concurrencia y Validaciones Atómicas en SeatingStore', () => {
    it('prevents overassignment when requested places exceed table available capacity', async () => {
      const eventId = 'evt-derecho-2027';
      const res = await seatingStore.assignMembers(
        eventId,
        'tbl-24',
        [
          {
            id: 'asgn-excess-1',
            graduateId: 'grad-test',
            graduateName: 'Graduado Concurrente',
            placesAssigned: 3,
          },
        ],
        'graduate'
      );

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Capacidad insuficiente/i);
    });

    it('rejects assignments on blocked tables', async () => {
      const eventId = 'evt-derecho-2027';
      await seatingStore.toggleBlockTable(eventId, 'tbl-25');

      const res = await seatingStore.assignMembers(
        eventId,
        'tbl-25',
        [
          {
            id: 'asgn-blocked',
            graduateId: 'grad-test',
            graduateName: 'Graduado Concurrente',
            placesAssigned: 1,
          },
        ],
        'graduate'
      );

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/bloqueada para nuevas asignaciones/i);
    });

    it('prohibits deleting a table with active occupants or assignments', async () => {
      const eventId = 'evt-derecho-2027';
      const deleteResult = await seatingStore.deleteTable(eventId, 'tbl-24');
      expect(deleteResult.success).toBe(false);
      expect(deleteResult.error).toMatch(/No se puede eliminar una mesa que tiene lugares ocupados/i);

      const deleteEmptyResult = await seatingStore.deleteTable(eventId, 'tbl-25');
      expect(deleteEmptyResult.success).toBe(true);
      expect(seatingStore.getTable(eventId, 'tbl-25')).toBeNull();
    });
  });
});