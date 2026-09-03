import { safeGetItem, safeSetItem, safeRemoveItem } from '../lib/storage';
import { createDemoScenario } from './scenarios';
import type { DemoScenario, DemoState } from './types';

export const DEMO_STORAGE_KEY = 'gr.demo.mock-api.v1';
export const DEMO_STATE_EVENT = 'gr:demo-state-change';

let memoryState: DemoState | null = null;

function readPersisted(): DemoState | null {
  const value = safeGetItem(DEMO_STORAGE_KEY);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as DemoState;
    return parsed.schema_version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function getDemoState(): DemoState {
  memoryState ??= readPersisted() ?? createDemoScenario('NORMAL');
  return structuredClone(memoryState);
}

/** Stable reference for useSyncExternalStore; it changes only after setDemoState. */
export function getDemoSnapshot(): DemoState {
  memoryState ??= readPersisted() ?? createDemoScenario('NORMAL');
  return memoryState;
}

export function setDemoState(next: DemoState): DemoState {
  memoryState = structuredClone(next);
  safeSetItem(DEMO_STORAGE_KEY, JSON.stringify(memoryState));
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(DEMO_STATE_EVENT));
  return getDemoState();
}

export function updateDemoState(recipe: (draft: DemoState) => void): DemoState {
  const draft = getDemoState();
  recipe(draft);
  draft.payment_plan.submissions = draft.payment_submissions;
  return setDemoState(draft);
}

export function resetDemoState(scenario: DemoScenario = 'NORMAL'): DemoState {
  safeRemoveItem(DEMO_STORAGE_KEY);
  memoryState = createDemoScenario(scenario);
  return setDemoState(memoryState);
}

export function subscribeDemoState(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === DEMO_STORAGE_KEY) {
      memoryState = readPersisted();
      listener();
    }
  };
  window.addEventListener(DEMO_STATE_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(DEMO_STATE_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}
