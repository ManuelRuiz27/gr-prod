export const isMockDataMode = import.meta.env.VITE_DATA_MODE === 'mock' && import.meta.env.MODE !== 'test';
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' && import.meta.env.MODE !== 'test';
