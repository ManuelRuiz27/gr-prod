/**
 * Notification Fixtures — Mock alerts and system messages
 */

export interface NotificationMock {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
}

export const mockNotifications: NotificationMock[] = [
  {
    id: 'notif-1',
    title: 'Fecha límite de platillos próxima',
    message: 'Recuerda seleccionar el menú de tus invitados antes del 25 de Octubre.',
    date: '2026-08-20T10:00:00Z',
    read: false,
    type: 'WARNING',
  },
  {
    id: 'notif-2',
    title: 'Pago confirmado',
    message: 'Tu pago de la cuota #3 por $2,400.00 MXN fue registrado exitosamente.',
    date: '2026-08-10T14:35:00Z',
    read: true,
    type: 'SUCCESS',
  },
  {
    id: 'notif-3',
    title: 'Mesa confirmada',
    message: 'Tu grupo ha sido asignado a la Mesa 14 (Zona Central).',
    date: '2026-08-01T12:00:00Z',
    read: true,
    type: 'INFO',
  },
];
