import { describe, it, expect } from 'vitest';
import {
  getAvailableEventActions,
  getEventActionLabel,
} from '../pages/admin/event-overview/eventLifecycle';

describe('Event Lifecycle Unit Tests (FRONTEND-03C)', () => {
  it('returns valid actions for DRAFT status: OPEN, CANCEL', () => {
    const actions = getAvailableEventActions('DRAFT');
    expect(actions).toEqual(['OPEN', 'CANCEL']);
  });

  it('returns valid actions for OPEN status: CLOSE, CANCEL', () => {
    const actions = getAvailableEventActions('OPEN');
    expect(actions).toEqual(['CLOSE', 'CANCEL']);
  });

  it('returns valid actions for CLOSED status: REOPEN, FINALIZE, CANCEL', () => {
    const actions = getAvailableEventActions('CLOSED');
    expect(actions).toEqual(['REOPEN', 'FINALIZE', 'CANCEL']);
  });

  it('returns empty actions for FINALIZED status', () => {
    const actions = getAvailableEventActions('FINALIZED');
    expect(actions).toEqual([]);
  });

  it('returns empty actions for CANCELLED status', () => {
    const actions = getAvailableEventActions('CANCELLED');
    expect(actions).toEqual([]);
  });

  it('maps lifecycle actions to natural Spanish labels', () => {
    expect(getEventActionLabel('OPEN')).toBe('Abrir evento');
    expect(getEventActionLabel('CLOSE')).toBe('Cerrar evento');
    expect(getEventActionLabel('REOPEN')).toBe('Reabrir evento');
    expect(getEventActionLabel('FINALIZE')).toBe('Finalizar evento');
    expect(getEventActionLabel('CANCEL')).toBe('Cancelar evento');
  });
});
