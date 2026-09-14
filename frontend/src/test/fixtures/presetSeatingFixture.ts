import { createSeatingScenarioSnapshot } from '../../mocks/seatingQuantityScenarios';
import type { SeatingGateway } from '../../services/seating/presetSeatingTypes';

// Test-only operational numbers; never used by the normal preview adapter.
export const liveSeatingFixture = createSeatingScenarioSnapshot;
export function testSeatingGateway(snapshot = liveSeatingFixture()): SeatingGateway {
  return { mode: 'http', async load() { return snapshot; }, async save() { return snapshot; } };
}
