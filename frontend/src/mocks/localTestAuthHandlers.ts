import { http, HttpResponse } from 'msw';
import { localTestAccounts, localTestSession } from './localTestAccounts';

// Installed only by the DEV mock bootstrap, never by the production worker.
export const localTestAuthHandlers = [
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string };
    const session = localTestSession(body.email ?? '', body.password ?? '');
    return session ? HttpResponse.json(session) : HttpResponse.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Correo o contraseña incorrectos.' } }, { status: 401 });
  }),
  http.post('*/api/v1/auth/refresh', async ({ request }) => {
    const body = await request.json() as { refresh_token?: string };
    const account = localTestAccounts.find(item => body.refresh_token === `local-refresh:${item.id}`);
    return account ? HttpResponse.json(localTestSession(account.email, account.password)) : new HttpResponse(null, { status: 401 });
  }),
  http.post('*/api/v1/auth/logout', () => new HttpResponse(null, { status: 204 })),
];
