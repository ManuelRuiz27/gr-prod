import { beforeEach, describe, expect, it } from 'vitest';
import { createLocalAccountSeatingGateway, getLocalSeatingSelection, localSeatingScenario, selectLocalSeatingScenario } from '../mocks/localAccountSeating';
import { localTestAccounts, localTestSession, LOCAL_TEST_EVENT, LOCAL_TEST_TOKEN_PREFIX } from '../mocks/localTestAccounts';
import type { SeatingScenario } from '../mocks/seatingQuantityScenarios';

const signal = () => new AbortController().signal;
const admin = localTestAccounts[0];
const andrea = localTestAccounts[1];
const gateway = (account = andrea as typeof localTestAccounts[number], scenario: SeatingScenario = 'partial') =>
  createLocalAccountSeatingGateway(account.id, `${LOCAL_TEST_TOKEN_PREFIX}${account.id}`, LOCAL_TEST_EVENT, scenario);
const distribution = { expected_version: 1, allocations: [{ table_id: 'table-1', quantity: 2 }, { table_id: 'table-4', quantity: 3 }] };

describe('Scenarios attached to local test accounts', () => {
  beforeEach(() => localStorage.clear());

  it('logs in the seeded users with their role and only Andrea’s event membership', () => {
    const graduate = localTestSession(` ${andrea.email.toUpperCase()} `, andrea.password);
    expect(graduate?.user.role).toBe('GRADUATE');
    expect(graduate?.memberships?.[0].event_id).toBe(LOCAL_TEST_EVENT);
    expect(localTestSession(admin.email, admin.password)?.memberships).toEqual([]);
    expect(localTestSession(andrea.email, 'wrong')).toBeNull();
    expect(localTestSession('unknown@example.com', andrea.password)).toBeNull();
  });

  it('shares confirmed counts with admin without exposing the graduate distribution', async () => {
    const adminView = gateway(admin);
    await gateway().save(LOCAL_TEST_EVENT, distribution, 'confirm', signal());
    const result = await adminView.load(LOCAL_TEST_EVENT, 'admin', signal());
    expect(result.mode).toBe('live');
    if (result.mode !== 'live') throw new Error('Expected live fixture');
    expect(result.own).toBeNull();
    expect(result.map.tables[3]).toMatchObject({ occupied: 3, available: 12 });
  });

  it('restores own quantities and idempotent receipts after reloading the account', async () => {
    const first = await gateway().save(LOCAL_TEST_EVENT, distribution, 'retry', signal());
    expect(await gateway().save(LOCAL_TEST_EVENT, distribution, 'retry', signal())).toEqual(first);
    const refreshed = await gateway().load(LOCAL_TEST_EVENT, 'graduate', signal());
    if (refreshed.mode !== 'live') throw new Error('Expected live fixture');
    expect(refreshed.own?.assigned_places).toBe(5);
    expect(refreshed.own?.version).toBe(2);
  });

  it('denies writes by admin and role, token or event impersonation', async () => {
    await expect(gateway(admin).save(LOCAL_TEST_EVENT, distribution, 'admin-write', signal())).rejects.toThrow(/Solo Andrea/);
    await expect(gateway().load(LOCAL_TEST_EVENT, 'admin', signal())).rejects.toThrow(/acceso/);
    await expect(gateway().load('another-event', 'graduate', signal())).rejects.toThrow(/acceso/);
    const wrongToken = createLocalAccountSeatingGateway(andrea.id, `${LOCAL_TEST_TOKEN_PREFIX}${admin.id}`, LOCAL_TEST_EVENT, 'partial');
    await expect(wrongToken.load(LOCAL_TEST_EVENT, 'graduate', signal())).rejects.toThrow(/acceso/);
  });

  it('rotates previously saved portrait mocks without losing quantities or retry receipts', async () => {
    await gateway().save(LOCAL_TEST_EVENT, distribution, 'orientation-retry', signal());
    const key = 'gr.demo.seating-accounts.v1.partial';
    const stored = JSON.parse(localStorage.getItem(key)!);
    const portrait = (snapshot: typeof stored.state) => {
      snapshot.map.width = 1000; snapshot.map.height = 1540;
      snapshot.map.tables = snapshot.map.tables.map((table: { x: number; y: number; width: number; height: number }) =>
        ({ ...table, x: Number((1 - table.y).toFixed(8)), y: table.x, width: table.height, height: table.width }));
    };
    portrait(stored.state);
    stored.receipts.forEach(([, receipt]: [string, { snapshot: typeof stored.state }]) => portrait(receipt.snapshot));
    localStorage.setItem(key, JSON.stringify(stored));
    const rotated = await gateway().load(LOCAL_TEST_EVENT, 'graduate', signal());
    if (rotated.mode !== 'live') throw new Error('Expected live fixture');
    expect(rotated.map.width).toBe(1540);
    expect(rotated.map.tables[0]).toMatchObject({ x: 0.07142857, y: 0.895 });
    expect(rotated.own?.assigned_places).toBe(5);
    expect(await gateway().save(LOCAL_TEST_EVENT, distribution, 'orientation-retry', signal())).toMatchObject(rotated);
  });

  it('keeps scenario data isolated and resets the selected case for both roles', async () => {
    await gateway().save(LOCAL_TEST_EVENT, distribution, 'save', signal());
    selectLocalSeatingScenario('payment-required');
    expect(localSeatingScenario(getLocalSeatingSelection())).toBe('payment-required');
    await expect(gateway(andrea, 'payment-required').save(LOCAL_TEST_EVENT, distribution, 'blocked', signal())).rejects.toMatchObject({ response: { status: 409, data: { error: { code: 'SEATING_NOT_FINANCIALLY_ELIGIBLE' } } } });
    selectLocalSeatingScenario('partial', true);
    const reset = await gateway(admin).load(LOCAL_TEST_EVENT, 'admin', signal());
    if (reset.mode !== 'live') throw new Error('Expected live fixture');
    expect(reset.map.tables[3].occupied).toBe(0);
  });

  it('retains scripted network failure state across account reloads for a successful retry', async () => {
    await expect(gateway(andrea, 'network-error').save(LOCAL_TEST_EVENT, distribution, 'retry', signal())).rejects.toThrow(/Falla de red/);
    const result = await gateway(andrea, 'network-error').save(LOCAL_TEST_EVENT, distribution, 'retry', signal());
    if (result.mode !== 'live') throw new Error('Expected live fixture');
    expect(result.own?.assigned_places).toBe(5);
  });

  it('keeps the real layout preview unassignable even with a valid local account', async () => {
    const preview = gateway(andrea, 'preview');
    const result = await preview.load(LOCAL_TEST_EVENT, 'graduate', signal());
    expect(result.template.tables.every(table => table.capacity === null)).toBe(true);
    await expect(preview.save(LOCAL_TEST_EVENT, distribution, 'preview', signal())).rejects.toThrow();
  });
});
