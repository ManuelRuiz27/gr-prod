import type { EventStatus } from '../../../fixtures';

export type EventLifecycleAction =
  | 'OPEN'
  | 'CLOSE'
  | 'REOPEN'
  | 'FINALIZE'
  | 'CANCEL';

export function getAvailableEventActions(
  status: EventStatus
): EventLifecycleAction[] {
  switch (status) {
    case 'DRAFT':
      return ['OPEN', 'CANCEL'];
    case 'OPEN':
      return ['CLOSE', 'CANCEL'];
    case 'CLOSED':
      return ['REOPEN', 'FINALIZE', 'CANCEL'];
    case 'FINALIZED':
      return [];
    case 'CANCELLED':
      return [];
    default:
      return [];
  }
}

export function getEventActionLabel(action: EventLifecycleAction): string {
  switch (action) {
    case 'OPEN':
      return 'Abrir evento';
    case 'CLOSE':
      return 'Cerrar evento';
    case 'REOPEN':
      return 'Reabrir evento';
    case 'FINALIZE':
      return 'Finalizar evento';
    case 'CANCEL':
      return 'Cancelar evento';
  }
}
