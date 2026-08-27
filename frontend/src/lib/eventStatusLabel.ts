import type { EventStatus } from '../fixtures';

const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'En preparación',
  OPEN: 'Abierto',
  CLOSED: 'Cerrado',
  FINALIZED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

export function getEventStatusLabel(status: EventStatus): string {
  return EVENT_STATUS_LABELS[status];
}
