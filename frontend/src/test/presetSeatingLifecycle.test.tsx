import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePresetSeating } from '../services/seating/usePresetSeating';
import { liveSeatingFixture } from './fixtures/presetSeatingFixture';
import type { SeatingGateway, SeatingSnapshot } from '../services/seating/presetSeatingTypes';

afterEach(() => { cleanup(); vi.useRealTimers(); });
describe('Seating lifecycle and retry safety', () => {
  it('does not replace confirmed counts with optimistic counts while saving', async () => {
    const state = liveSeatingFixture();
    let finish!: (value: SeatingSnapshot) => void;
    const save = vi.fn(() => new Promise<SeatingSnapshot>(resolve => { finish = resolve; }));
    const gateway: SeatingGateway = { mode: 'http', load: async () => state, save };
    const { result } = renderHook(() => usePresetSeating(gateway, 'test-event', 'graduate'));
    await act(async () => {});
    const input = { expected_version: 1, allocations: [{ table_id: 'table-1', quantity: 3 }] };
    let pending!: Promise<boolean>;
    act(() => { pending = result.current.save(input); });
    expect(result.current.saving).toBe(true);
    expect(result.current.snapshot).toEqual(state);
    await act(async () => { expect(await result.current.save(input)).toBe(false); });
    expect(save).toHaveBeenCalledOnce();
    await act(async () => { finish(state); await pending; });
    expect(result.current.saving).toBe(false);
  });
  it('uses the same idempotency key for an identical retry after an uncertain network failure', async () => {
    const state = liveSeatingFixture();
    const save = vi.fn<SeatingGateway['save']>().mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValue(state);
    const gateway: SeatingGateway = { mode: 'http', load: async () => state, save };
    const { result } = renderHook(() => usePresetSeating(gateway, 'test-event', 'graduate'));
    await act(async () => {});
    const input = { expected_version: 1, allocations: [{ table_id: 'table-1', quantity: 3 }] };
    await act(async () => { expect(await result.current.save(input)).toBe(false); });
    expect(result.current.error).toBe('Sin conexión');
    expect(result.current.snapshot).toEqual(state);
    await act(async () => { await result.current.refresh(); });
    await act(async () => { expect(await result.current.save(input)).toBe(true); });
    expect(save.mock.calls[0][2]).toBe(save.mock.calls[1][2]);
  });
  it('ignores an older poll response that finishes after a successful mutation', async () => {
    const old = liveSeatingFixture();
    const fresh = structuredClone(old); fresh.own!.version = 2;
    let oldPoll!: (value: SeatingSnapshot) => void;
    const load = vi.fn<SeatingGateway['load']>().mockResolvedValueOnce(old)
      .mockImplementationOnce(() => new Promise(resolve => { oldPoll = resolve; })).mockResolvedValue(fresh);
    const gateway: SeatingGateway = { mode: 'http', load, save: async () => fresh };
    const { result } = renderHook(() => usePresetSeating(gateway, 'test-event', 'graduate'));
    await act(async () => {});
    let poll!: Promise<void>;
    act(() => { poll = result.current.refresh(); });
    await act(async () => { await result.current.save({ expected_version: 1, allocations: [] }); });
    await act(async () => { oldPoll(old); await poll; });
    expect(result.current.snapshot).toEqual(fresh);
  });
  it('aborts pending requests on unmount and does not poll in preview', async () => {
    vi.useFakeTimers();
    const load = vi.fn<SeatingGateway['load']>().mockImplementation(() => new Promise(() => {}));
    const gateway: SeatingGateway = { mode: 'preview', load, save: vi.fn() };
    const { unmount } = renderHook(() => usePresetSeating(gateway, '', 'graduate'));
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
    expect(load).toHaveBeenCalledOnce();
    const signal = load.mock.calls[0][2];
    unmount();
    expect(signal.aborted).toBe(true);
  });
});
