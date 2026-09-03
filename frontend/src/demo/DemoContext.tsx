import { createContext, useSyncExternalStore } from 'react';
import { getDemoState, resetDemoState, subscribeDemoState } from './store';
import type { DemoScenario } from './types';

const DemoContext = createContext({ state: getDemoState(), reset: (_scenario?: DemoScenario) => getDemoState() });

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribeDemoState, getDemoState, getDemoState);
  return <DemoContext.Provider value={{ state, reset: resetDemoState }}>{children}</DemoContext.Provider>;
}

export { DemoContext };
