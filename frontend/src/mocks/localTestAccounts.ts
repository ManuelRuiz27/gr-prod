import type { LoginResult } from '../services/api/authApi';

// Public test credentials already defined in backend/prisma/seed.ts. DEV + mock mode only.
export const LOCAL_TEST_EVENT = 'evt-derecho-2027';
export const LOCAL_TEST_TOKEN_PREFIX = 'gr-local-demo:';
export const localTestAccounts = [
  { id: 'a0000000-0000-0000-0000-000000000001', email: 'admin@plataformagr.com', password: 'AdminPass123!', full_name: 'Administrador Principal', role: 'ADMIN' },
  { id: 'a0000000-0000-0000-0000-000000000002', email: 'andrea.martinez@ejemplo.com', password: 'GraduatePass123!', full_name: 'Andrea Martínez', role: 'GRADUATE' },
] as const;

export function localTestSession(email: string, password: string): LoginResult | null {
  const account = localTestAccounts.find(item => item.email === email.trim().toLowerCase() && item.password === password);
  if (!account) return null;
  return {
    accessToken: `${LOCAL_TEST_TOKEN_PREFIX}${account.id}`, refreshToken: `local-refresh:${account.id}`, expiresIn: 3600,
    user: { id: account.id, email: account.email, full_name: account.full_name, role: account.role, status: 'ACTIVE' },
    memberships: account.role === 'GRADUATE' ? [{ id: 'grad-andrea-martinez', event_id: LOCAL_TEST_EVENT, status: 'ACTIVE', active_places: 8,
      event: { id: LOCAL_TEST_EVENT, name: 'Graduación Facultad de Derecho 2027', date: '2027-07-15', venue: 'Taller 2560 · prueba local', status: 'OPEN' } }] : [],
  };
}
