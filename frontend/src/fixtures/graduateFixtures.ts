/**
 * Graduate Fixtures — Normalized development data based on approved docs
 */

export type MealType = string;

export type ThermoStatus = 'LOCKED' | 'AVAILABLE' | 'REQUESTED' | 'IN_PRODUCTION' | 'DELIVERED';

export interface GuestMock {
  id: string;
  name: string;
  meal: MealType;
}

export interface GraduateMock {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  career: string;
  generation: string;
  ticketCount: number; // 8 lugares
  tableNumber: number | null; // Mesa 24 o null (Sin mesa)
  thermoStatus: ThermoStatus;
  thermoThreshold: number; // 70%
  thermoCustomName?: string; // Nombre a colocar en el termo si aplica
  guests: GuestMock[];
}

export const currentGraduateMock: GraduateMock = {
  id: 'grad-andrea-martinez',
  eventId: 'evt-derecho-2027',
  fullName: 'Andrea Martínez',
  email: 'andrea.martinez@ejemplo.com',
  career: 'Licenciatura en Derecho',
  generation: '2027',
  ticketCount: 8,
  tableNumber: 24,
  thermoStatus: 'LOCKED', // 60% pagado < 70% umbral
  thermoThreshold: 70,
  thermoCustomName: 'Andrea Martínez',
  guests: [
    { id: 'gst-1', name: 'Andrea Martínez', meal: 'Tradicional' },
    { id: 'gst-2', name: 'Carlos Martínez', meal: 'Vegano' },
    { id: 'gst-3', name: 'Elena Martínez', meal: 'Tradicional' },
    { id: 'gst-4', name: 'Luis Martínez', meal: 'Tradicional' },
    { id: 'gst-5', name: 'Sofía Ramírez', meal: 'Vegetariano' },
    { id: 'gst-6', name: 'Diego Ramírez', meal: 'Tradicional' },
    { id: 'gst-7', name: 'Paula Hernández', meal: 'Vegano' },
    { id: 'gst-8', name: 'Mateo Hernández', meal: 'Tradicional' },
  ],
};

export const mockGraduatesList: GraduateMock[] = [
  currentGraduateMock,
  {
    id: 'grad-fernando-torres',
    eventId: 'evt-derecho-2027',
    fullName: 'Fernando Torres',
    email: 'fernando.torres@ejemplo.com',
    career: 'Licenciatura en Derecho',
    generation: '2027',
    ticketCount: 10,
    tableNumber: 12,
    thermoStatus: 'AVAILABLE', // >= 70%
    thermoThreshold: 70,
    thermoCustomName: 'Fernando Torres',
    guests: [
      { id: 'gst-f1', name: 'Fernando Torres', meal: 'Tradicional' },
    ],
  },
  {
    id: 'grad-mariana-lopez',
    eventId: 'evt-derecho-2027',
    fullName: 'Mariana López',
    email: 'mariana.lopez@ejemplo.com',
    career: 'Licenciatura en Derecho',
    generation: '2027',
    ticketCount: 6,
    tableNumber: null, // Sin mesa
    thermoStatus: 'REQUESTED',
    thermoThreshold: 70,
    thermoCustomName: 'Mariana López',
    guests: [
      { id: 'gst-m1', name: 'Mariana López', meal: 'Vegetariano' },
    ],
  },
  {
    id: 'grad-roberto-sanchez',
    eventId: 'evt-derecho-2027',
    fullName: 'Roberto Sánchez',
    email: 'roberto.sanchez@ejemplo.com',
    career: 'Licenciatura en Derecho',
    generation: '2027',
    ticketCount: 8,
    tableNumber: 18,
    thermoStatus: 'IN_PRODUCTION',
    thermoThreshold: 70,
    thermoCustomName: 'Roberto Sánchez',
    guests: [
      { id: 'gst-r1', name: 'Roberto Sánchez', meal: 'Tradicional' },
    ],
  },
];
