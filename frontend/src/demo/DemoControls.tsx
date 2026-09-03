import { Button, Select } from '../design-system';
import { DEMO_SCENARIOS, type DemoScenario } from './types';
import { useDemo } from './useDemo';
import { isDemoMode } from './config';

export function DemoControls() {
  const { state, reset } = useDemo();
  if (!isDemoMode) return null;
  return <div className="flex items-center gap-2" data-testid="demo-controls">
    <Select aria-label="Escenario demo" fullWidth={false} className="!h-8 !text-xs w-40" value={state.scenario} onChange={(event) => reset(event.target.value as DemoScenario)} options={DEMO_SCENARIOS.map((scenario) => ({ value: scenario, label: scenario.replaceAll('_', ' ') }))} />
    <Button variant="ghost" size="sm" onClick={() => reset(state.scenario)}>Reset demo</Button>
  </div>;
}
