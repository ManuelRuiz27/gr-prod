/**
 * Notification Fixtures — Normalized alerts based on approved docs
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
    message: 'Recuerda seleccionar los platillos de tu grupo antes de la fecha límite.',
    date: '10 Feb 2027',
    read: false,
    type: 'WARNING',
  },
  {
    id: 'notif-2',
    title: 'Pago confirmado',
    message: 'Tu pago de la mensualidad M3 por $2,500.00 MXN fue registrado exitosamente.',
    date: '10 Feb 2027',
    read: true,
    type: 'SUCCESS',
  },
  {
    id: 'notif-3',
    title: 'Mesa asignada',
    message: 'Tu grupo ha sido asignado a la Mesa 24.',
    date: '15 Ene 2027',
    read: true,
    type: 'INFO',
  },
];
