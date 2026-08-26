/**
 * Graduate Fixtures — Mock development data for graduate models
 */

export interface GuestMock {
  id: string;
  name: string;
  isAdult: boolean;
  mealId?: string;
  tableSeat?: number;
}

export interface GraduateMock {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  ticketCount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING_PAYMENT' | 'PARTIAL_PAYMENT' | 'FULLY_PAID' | 'CANCELLED';
  tableNumber?: number;
  thermoCustomization?: {
    text: string;
    fontFamily: string;
    delivered: boolean;
  };
  guests: GuestMock[];
}

export const currentGraduateMock: GraduateMock = {
  id: 'grad-andrea-martinez',
  eventId: 'evt-ingenieria-2026',
  fullName: 'Andrea Martínez Valenzuela',
  email: 'andrea.martinez@ejemplo.com',
  phone: '+52 55 1234 5678',
  ticketCount: 4,
  totalAmount: 7400,
  paidAmount: 7400,
  status: 'FULLY_PAID',
  tableNumber: 14,
  thermoCustomization: {
    text: 'Ing. Andrea Martínez',
    fontFamily: 'Playfair Display',
    delivered: false,
  },
  guests: [
    { id: 'gst-1', name: 'Andrea Martínez (Graduada)', isAdult: true, mealId: 'meal-res', tableSeat: 1 },
    { id: 'gst-2', name: 'Carlos Martínez (Padre)', isAdult: true, mealId: 'meal-res', tableSeat: 2 },
    { id: 'gst-3', name: 'Lucía Valenzuela (Madre)', isAdult: true, mealId: 'meal-salmon', tableSeat: 3 },
    { id: 'gst-4', name: 'Diego Martínez (Hermano)', isAdult: false, mealId: 'meal-pasta', tableSeat: 4 },
  ],
};

export const mockGraduatesList: GraduateMock[] = [
  currentGraduateMock,
  {
    id: 'grad-roberto-sanchez',
    eventId: 'evt-ingenieria-2026',
    fullName: 'Roberto Sánchez Ruiz',
    email: 'roberto.sanchez@ejemplo.com',
    phone: '+52 55 9876 5432',
    ticketCount: 6,
    totalAmount: 11100,
    paidAmount: 5550,
    status: 'PARTIAL_PAYMENT',
    tableNumber: 14,
    thermoCustomization: {
      text: 'Ing. Roberto Sánchez',
      fontFamily: 'Inter',
      delivered: false,
    },
    guests: [
      { id: 'gst-5', name: 'Roberto Sánchez', isAdult: true, mealId: 'meal-res', tableSeat: 5 },
      { id: 'gst-6', name: 'Elena Ruiz', isAdult: true, mealId: 'meal-salmon', tableSeat: 6 },
    ],
  },
  {
    id: 'grad-mariana-lopez',
    eventId: 'evt-ingenieria-2026',
    fullName: 'Mariana López Castro',
    email: 'mariana.lopez@ejemplo.com',
    phone: '+52 55 4567 8901',
    ticketCount: 2,
    totalAmount: 3700,
    paidAmount: 0,
    status: 'PENDING_PAYMENT',
    guests: [],
  },
  {
    id: 'grad-fernando-torres',
    eventId: 'evt-ingenieria-2026',
    fullName: 'Fernando Torres Méndez',
    email: 'fernando.torres@ejemplo.com',
    phone: '+52 55 8765 4321',
    ticketCount: 5,
    totalAmount: 9250,
    paidAmount: 9250,
    status: 'FULLY_PAID',
    tableNumber: 12,
    thermoCustomization: {
      text: 'Ing. Fernando Torres M.',
      fontFamily: 'Inter',
      delivered: true,
    },
    guests: [
      { id: 'gst-7', name: 'Fernando Torres', isAdult: true, mealId: 'meal-res', tableSeat: 1 },
    ],
  },
];
