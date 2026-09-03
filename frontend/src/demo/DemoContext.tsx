import { createContext, useSyncExternalStore } from 'react';
import { getDemoSnapshot, resetDemoState, subscribeDemoState } from './store';
import type { DemoScenario } from './types';

const DemoContext = createContext({ state: getDemoSnapshot(), reset: (_scenario?: DemoScenario) => getDemoSnapshot() });

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribeDemoState, getDemoSnapshot, getDemoSnapshot);
  return <DemoContext.Provider value={{ state, reset: resetDemoState }}>{children}</DemoContext.Provider>;
}

export { DemoContext };
