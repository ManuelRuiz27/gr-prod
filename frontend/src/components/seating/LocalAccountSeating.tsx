import { lazy, Suspense, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isInteractiveDemoMode } from '../../demo/config';

const AccountSeatingScreen = isInteractiveDemoMode ? lazy(() => import('../../mocks/AccountSeatingScreen')) : null;

export function LocalAccountSeating({ eventId, role, children }: { eventId: string; role: 'admin' | 'graduate'; children: ReactNode }) {
  const { token } = useAuth();
  if (!AccountSeatingScreen || !token?.startsWith('gr-local-demo:')) return children;
  return <Suspense fallback={<p role="status">Cargando mesas del usuario de prueba…</p>}><AccountSeatingScreen eventId={eventId} role={role} /></Suspense>;
}
