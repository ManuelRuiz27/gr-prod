export const isMockDataMode = import.meta.env.VITE_DATA_MODE === 'mock' && import.meta.env.MODE !== 'test';
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' && import.meta.env.MODE !== 'test';

// Local development stays convenient, while production bundles expose synthetic
// seating scenarios only when the deployment is explicitly configured as a demo.
export const isInteractiveDemoMode = isMockDataMode && (import.meta.env.DEV || isDemoMode);
