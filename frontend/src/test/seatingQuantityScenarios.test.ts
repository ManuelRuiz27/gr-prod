import { describe, expect, it } from 'vitest';
import { createSeatingScenarioGateway, seatingScenarios } from '../mocks/seatingQuantityScenarios';

const signal = () => new AbortController().signal;
describe('Quantity scenario mocks', () => {
  it('provides ten isolated QA use cases without changing the default preview', async () => {
    expect(Object.keys(seatingScenarios)).toHaveLength(10);
    const result = await createSeatingScenarioGateway('preview').load('', 'graduate', signal());
    expect(result.mode).toBe('preview');
    expect(result.template.tables.every(table => table.capacity === null)).toBe(true);
  });
  it('moves quantities atomically, preserves named members and does not double count retries', async () => {
    const gateway = createSeatingScenarioGateway('partial');
    const input = { expected_version: 1, allocations: [{ table_id: 'table-1', quantity: 1 }, { table_id: 'table-4', quantity: 1 }] };
    const result = await gateway.save('test-event', input, 'same-key', signal());
    expect(result.mode).toBe('live');
    if (result.mode !== 'live') throw new Error('Expected live mock');
    expect(result.own?.assigned_places).toBe(2);
    expect(result.map.tables[0].occupied).toBe(8);
    expect(result.map.tables[3].occupied).toBe(1);
    expect(await gateway.save('test-event', input, 'same-key', signal())).toEqual(result);
    await expect(gateway.save('test-event', { ...input, expected_version: 2 }, 'same-key', signal())).rejects.toMatchObject({ response: { status: 409 } });
  });
  it.each([
    ['payment-required', 'SEATING_NOT_FINANCIALLY_ELIGIBLE'],
    ['deadline-closed', 'SEATING_DEADLINE_CLOSED'],
    ['blocked', 'TABLE_BLOCKED'],
    ['full', 'TABLE_CAPACITY_CHANGED'],
    ['capacity-conflict', 'TABLE_CAPACITY_CHANGED'],
    ['version-conflict', 'ALLOCATION_VERSION_CHANGED'],
  ] as const)('simulates %s without persisting requested quantities', async (scenario, code) => {
    const gateway = createSeatingScenarioGateway(scenario);
    const input = { expected_version: 1, allocations: [{ table_id: 'table-1', quantity: 2 }, { table_id: 'table-4', quantity: 1 }] };
    await expect(gateway.save('test-event', input, 'key', signal())).rejects.toMatchObject({ response: { data: { error: { code } } } });
    const result = await gateway.load('test-event', 'graduate', signal());
    if (result.mode === 'live') expect(result.own?.assigned_places).toBe(2);
  });
  it('allows retry after the scripted network error', async () => {
    const gateway = createSeatingScenarioGateway('network-error');
    const input = { expected_version: 1, allocations: [{ table_id: 'table-1', quantity: 3 }] };
    await expect(gateway.save('test-event', input, 'key', signal())).rejects.toThrow(/Falla de red simulada/);
    const result = await gateway.save('test-event', input, 'key', signal());
    if (result.mode === 'live') expect(result.own?.assigned_places).toBe(3);
  });
  it('can clear unnamed allocations without cancelling confirmed places', async () => {
    const gateway = createSeatingScenarioGateway('available');
    await gateway.save('test-event', { expected_version: 1, allocations: [{ table_id: 'table-4', quantity: 3 }] }, 'add', signal());
    const result = await gateway.save('test-event', { expected_version: 2, allocations: [] }, 'clear', signal());
    if (result.mode === 'live') {
      expect(result.own?.confirmed_places).toBe(8);
      expect(result.own?.unassigned_places).toBe(8);
      expect(result.map.tables[3].occupied).toBe(0);
    }
  });
});
