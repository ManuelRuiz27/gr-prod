import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SeatingTable, TableAssignmentMock } from './seatingTypes';
import { seatingStore, type CreateTableInput, type BulkCreateTablesInput } from './seatingStore';
import { subscribeToSeating } from './seatingRealtimeAdapter';
import type { SeatingEvent } from './seatingRealtimeTypes';

export interface UseSeatingRealtimeOptions {
  eventId: string;
  role?: 'admin' | 'graduate';
  currentGraduateId?: string;
}

export function useSeatingRealtime({
  eventId,
  role = 'admin',
  currentGraduateId,
}: UseSeatingRealtimeOptions) {
  const isGraduate = role === 'graduate';

  // 1. Cargar tablas iniciales desde el store (con filtro de privacidad si es graduate)
  const [tables, setTables] = useState<SeatingTable[]>(() => {
    return seatingStore.getTables(eventId, {
      sanitizeForGraduate: isGraduate,
      currentGraduateId,
    });
  });

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrlState] = useState<string | null>(() => {
    return seatingStore.getBackground(eventId);
  });

  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  const [prevParams, setPrevParams] = useState({ eventId, isGraduate, currentGraduateId });

  // Refrescar estado cuando cambie eventId o currentGraduateId (patrón React para ajustar estado derivado de props)
  if (
    prevParams.eventId !== eventId ||
    prevParams.isGraduate !== isGraduate ||
    prevParams.currentGraduateId !== currentGraduateId
  ) {
    setPrevParams({ eventId, isGraduate, currentGraduateId });
    setTables(
      seatingStore.getTables(eventId, {
        sanitizeForGraduate: isGraduate,
        currentGraduateId,
      })
    );
    setBackgroundImageUrlState(seatingStore.getBackground(eventId));
    setSelectedTableId(null);
    setAssignmentError(null);
  }

  // 2. Suscripción a eventos en tiempo real
  useEffect(() => {
    const unsubscribe = subscribeToSeating(eventId, (event: SeatingEvent) => {
      // Si el actor es el mismo componente y ya se actualizó optimistamente, el store ya lo tiene.
      // Refrescamos desde el store con sanitización según rol.
      const freshTables = seatingStore.getTables(eventId, {
        sanitizeForGraduate: isGraduate,
        currentGraduateId,
      });
      setTables(freshTables);

      if (event.type === 'seating.layout.updated') {
        setBackgroundImageUrlState(event.payload.backgroundImageUrl ?? null);
      } else if (event.type === 'table.deleted') {
        setSelectedTableId((prev) => (prev === event.payload.tableId ? null : prev));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [eventId, isGraduate, currentGraduateId]);

  // Mesa seleccionada actualmente
  const selectedTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId) || null;
  }, [tables, selectedTableId]);

  // Acciones ADMIN
  const createTable = useCallback(
    async (input: CreateTableInput) => {
      const created = await seatingStore.createTable(eventId, input, role);
      setSelectedTableId(created.id);
      return created;
    },
    [eventId, role]
  );

  const createRoundTable = useCallback(
    async (number?: number, capacity = 10) => {
      const maxNum = tables.reduce((max, t) => Math.max(max, t.number), 0);
      const nextNum = number ?? maxNum + 1;
      return createTable({
        number: nextNum,
        shape: 'ROUND',
        capacity,
        x: 0.5,
        y: 0.5,
        width: 0.08,
        height: 0.08,
      });
    },
    [tables, createTable]
  );

  const createSquareTable = useCallback(
    async (number?: number, capacity = 10) => {
      const maxNum = tables.reduce((max, t) => Math.max(max, t.number), 0);
      const nextNum = number ?? maxNum + 1;
      return createTable({
        number: nextNum,
        shape: 'SQUARE',
        capacity,
        x: 0.5,
        y: 0.5,
        width: 0.08,
        height: 0.08,
      });
    },
    [tables, createTable]
  );

  const bulkCreateTables = useCallback(
    async (input: BulkCreateTablesInput) => {
      return seatingStore.bulkCreateTables(eventId, input, role);
    },
    [eventId, role]
  );

  const updateTable = useCallback(
    async (tableId: string, patch: Partial<SeatingTable>) => {
      return seatingStore.updateTable(eventId, tableId, patch, role);
    },
    [eventId, role]
  );

  const moveTable = useCallback(
    async (tableId: string, x: number, y: number) => {
      // Actualización optimista inmediata en UI local
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, x, y } : t))
      );
      return seatingStore.moveTable(eventId, tableId, x, y, role);
    },
    [eventId, role]
  );

  const resizeTable = useCallback(
    async (tableId: string, x: number, y: number, width: number, height: number) => {
      // Actualización optimista inmediata en UI local
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, x, y, width, height } : t))
      );
      return seatingStore.resizeTable(eventId, tableId, x, y, width, height, role);
    },
    [eventId, role]
  );

  const toggleBlockTable = useCallback(
    async (tableId: string) => {
      return seatingStore.toggleBlockTable(eventId, tableId, role);
    },
    [eventId, role]
  );

  const deleteTable = useCallback(
    async (tableId: string) => {
      const res = await seatingStore.deleteTable(eventId, tableId, role);
      if (res.success && selectedTableId === tableId) {
        setSelectedTableId(null);
      }
      return res;
    },
    [eventId, role, selectedTableId]
  );

  const setBackgroundImageUrl = useCallback(
    async (url: string | null) => {
      setBackgroundImageUrlState(url);
      await seatingStore.setBackground(eventId, url, role);
    },
    [eventId, role]
  );

  // Asignaciones
  const assignMembers = useCallback(
    async (tableId: string, assignments: TableAssignmentMock[]) => {
      setAssignmentError(null);
      const res = await seatingStore.assignMembers(eventId, tableId, assignments, role, currentGraduateId);
      if (!res.success) {
        setAssignmentError(res.error || 'Error al asignar integrantes');
      }
      return res;
    },
    [eventId, role, currentGraduateId]
  );

  return {
    tables,
    selectedTableId,
    setSelectedTableId,
    selectedTable,
    backgroundImageUrl,
    setBackgroundImageUrl,
    assignmentError,
    clearAssignmentError: () => setAssignmentError(null),
    // Operaciones
    createTable,
    createRoundTable,
    createSquareTable,
    bulkCreateTables,
    updateTable,
    moveTable,
    resizeTable,
    toggleBlockTable,
    deleteTable,
    assignMembers,
  };
}
