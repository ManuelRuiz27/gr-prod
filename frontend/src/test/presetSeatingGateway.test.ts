import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../services/api/apiClient';
import { decodeSeatingSnapshot, httpSeatingGateway, previewSeatingGateway } from '../services/seating/presetSeatingGateway';
import { defaultSeatingTemplate } from '../services/seating/seatingTemplate';
import { liveSeatingFixture } from './fixtures/presetSeatingFixture';

afterEach(() => vi.restoreAllMocks());
describe('Preset layout and HTTP contract', () => {
  it('shows the landscape layout with the dance floor above and preserves all 100 table identities', () => {
    const { tables, width, height } = defaultSeatingTemplate;
    expect(tables).toHaveLength(100);
    expect(tables.map(table => table.label)).toEqual(Array.from({ length: 100 }, (_, i) => String(i + 1)));
    expect(new Set(tables.map(table => table.key)).size).toBe(100);
    expect(width).toBe(1540);
    expect(height).toBe(1000);
    expect(tables[0]).toMatchObject({ key: 'r01-c01', x: 0.07142857, y: 0.895 });
    expect([...new Set(tables.map(table => table.x))].map(x => tables.filter(table => table.x === x).length))
      .toEqual([9, 8, 9, 8, 7, 4, 4, 4, 4, 9, 8, 9, 8, 9]);
    for (const table of tables) {
      expect(table.capacity).toBeNull();
      expect(table.x - table.width / 2).toBeGreaterThanOrEqual(0);
      expect(table.y + table.height / 2).toBeLessThanOrEqual(1);
      expect(table.width * width).toBeCloseTo(table.height * height, 4);
      // Counterclockwise rotation: dance floor/stage now occupy x 565..932 and y <= 470.
      const intersectsDance = (table.y - table.height / 2) * height < 470 &&
        (table.x + table.width / 2) * width > 565 && (table.x - table.width / 2) * width < 932;
      expect(intersectsDance).toBe(false);
    }
  });
  it('preview neither loads HTTP nor allows writes', async () => {
    const get = vi.spyOn(apiClient, 'get'); const put = vi.spyOn(apiClient, 'put');
    expect((await previewSeatingGateway.load('', 'graduate', new AbortController().signal)).mode).toBe('preview');
    await expect(previewSeatingGateway.save('', { expected_version: 0, allocations: [] }, 'key', new AbortController().signal)).rejects.toThrow(/vista previa/);
    expect(get).not.toHaveBeenCalled(); expect(put).not.toHaveBeenCalled();
  });
  it('decodes the proposed public shape and discards unapproved nominal fields', () => {
    const state = liveSeatingFixture();
    Object.assign(state.map.tables[0], { assignments: [{ fullName: 'Private test person' }], graduateName: 'Private' });
    const parsed = decodeSeatingSnapshot(state.map, state.own, 'test-event');
    expect(JSON.stringify(parsed)).not.toContain('Private');
    expect(parsed.mode).toBe('live');
  });
  it.each(['capacity', 'occupied', 'available', 'template_key', 'width', 'height'])('fails closed without table %s', field => {
    const state = liveSeatingFixture();
    delete (state.map.tables[0] as unknown as Record<string, unknown>)[field];
    expect(() => decodeSeatingSnapshot(state.map, state.own, 'test-event')).toThrow();
  });
  it('rejects legacy shapes, event mismatch, unsupported versions, duplicate keys and missing tables', () => {
    const state = liveSeatingFixture();
    expect(() => decodeSeatingSnapshot({ seatingMap: {}, tables: [] }, state.own, 'test-event')).toThrow();
    expect(() => decodeSeatingSnapshot(state.map, state.own, 'other-event')).toThrow();
    expect(() => decodeSeatingSnapshot({ ...state.map, template_version: 9 }, state.own, 'test-event')).toThrow();
    expect(() => decodeSeatingSnapshot({ ...state.map, tables: state.map.tables.slice(1) }, state.own, 'test-event')).toThrow();
    state.map.tables[1].template_key = state.map.tables[0].template_key;
    expect(() => decodeSeatingSnapshot(state.map, state.own, 'test-event')).toThrow();
  });
  it('rejects inconsistent counts and own quantities that exceed occupied places', () => {
    const state = liveSeatingFixture();
    state.map.tables[0].occupied = 3;
    expect(() => decodeSeatingSnapshot(state.map, state.own, 'test-event')).toThrow();
    state.map.tables[0].available = 12;
    state.own!.allocations[0].quantity = 4;
    expect(() => decodeSeatingSnapshot(state.map, state.own, 'test-event')).toThrow();
  });
  it('loads own allocations with the graduate map but does not request them for admin', async () => {
    const state = liveSeatingFixture();
    const get = vi.spyOn(apiClient, 'get').mockImplementation(async url => ({ data: String(url).endsWith('table-allocations') ? state.own : state.map }));
    const signal = new AbortController().signal;
    await httpSeatingGateway.load('test-event', 'graduate', signal);
    expect(get).toHaveBeenCalledWith('/me/events/test-event/seating-map', { signal });
    expect(get).toHaveBeenCalledWith('/me/events/test-event/table-allocations', { signal });
    get.mockClear();
    const snapshot = await httpSeatingGateway.load('test-event', 'admin', signal);
    expect(get).toHaveBeenCalledOnce();
    expect(get).toHaveBeenCalledWith('/admin/events/test-event/seating-map', { signal });
    if (snapshot.mode === 'live') expect(snapshot.own).toBeNull();
  });
  it('serializes the complete distribution and preserves the idempotency key', async () => {
    const state = liveSeatingFixture();
    const put = vi.spyOn(apiClient, 'put').mockResolvedValue({ data: { map: state.map, allocation_state: state.own } });
    const input = { expected_version: 1, allocations: [{ table_id: 'table-1', quantity: 2 }] };
    const signal = new AbortController().signal;
    await httpSeatingGateway.save('test-event', input, 'same-intent', signal);
    expect(put).toHaveBeenCalledWith('/me/events/test-event/table-allocations', input, { signal, headers: { 'Idempotency-Key': 'same-intent' } });
  });
});
