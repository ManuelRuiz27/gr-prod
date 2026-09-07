import type { SeatingTable, TableStatus } from './seatingTypes';

export type SeatingEventType =
  | 'table.created'
  | 'table.updated'
  | 'table.deleted'
  | 'table.blocked'
  | 'table.unblocked'
  | 'table.assignment.changed'
  | 'seating.layout.updated';

export interface TableCreatedPayload {
  table: Omit<SeatingTable, 'assignments'>;
}

export interface TableUpdatedPayload {
  tableId: string;
  patch: Partial<Omit<SeatingTable, 'assignments'>>;
  table?: Omit<SeatingTable, 'assignments'>;
}

export interface TableDeletedPayload {
  tableId: string;
}

export interface TableBlockedPayload {
  tableId: string;
  status: 'BLOCKED';
}

export interface TableUnblockedPayload {
  tableId: string;
  status: 'AVAILABLE';
}

/**
 * Payload público en tiempo real para cambios de asignación.
 * NUNCA transmite graduateName, memberName ni arrays nominales de terceros.
 */
export interface TableAssignmentChangedPayload {
  tableId: string;
  occupied: number;
  available: number;
  status?: TableStatus;
}

export interface SeatingLayoutUpdatedPayload {
  backgroundImageUrl?: string | null;
  tables?: Omit<SeatingTable, 'assignments'>[];
}

export type SeatingPayloadMap = {
  'table.created': TableCreatedPayload;
  'table.updated': TableUpdatedPayload;
  'table.deleted': TableDeletedPayload;
  'table.blocked': TableBlockedPayload;
  'table.unblocked': TableUnblockedPayload;
  'table.assignment.changed': TableAssignmentChangedPayload;
  'seating.layout.updated': SeatingLayoutUpdatedPayload;
};

export type SeatingEvent = {
  [K in SeatingEventType]: {
    type: K;
    eventId: string;
    payload: SeatingPayloadMap[K];
    timestamp: number;
    actorId?: string;
    actorRole?: 'admin' | 'graduate';
  };
}[SeatingEventType];
