import type { SeatingTable, TableAssignmentMock } from './seatingTypes';

export type SeatingEventType =
  | 'table.created'
  | 'table.updated'
  | 'table.deleted'
  | 'table.blocked'
  | 'table.unblocked'
  | 'table.assignment.changed'
  | 'seating.layout.updated';

export interface TableCreatedPayload {
  table: SeatingTable;
}

export interface TableUpdatedPayload {
  tableId: string;
  patch: Partial<SeatingTable>;
  table?: SeatingTable;
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

export interface TableAssignmentChangedPayload {
  tableId: string;
  assignments: TableAssignmentMock[];
  occupied: number;
  available: number;
}

export interface SeatingLayoutUpdatedPayload {
  backgroundImageUrl?: string | null;
  tables?: SeatingTable[];
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
