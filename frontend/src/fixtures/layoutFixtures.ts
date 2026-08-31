/**
 * Layout & Table Fixtures — Normalized seating demo data based on SEATING_MAP.md
 */

export type TableShape = 'ROUND' | 'SQUARE';

export type TableStatus = 'AVAILABLE' | 'BLOCKED';

export interface TableAssignmentMock {
  id: string;
  graduateId: string;
  graduateName: string;
  placesAssigned: number;
}

export interface TableMock {
  id: string;
  eventId: string;
  number: number;
  label?: string;
  shape: TableShape;
  capacity: number;
  occupied: number;
  available: number;
  status: TableStatus;
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  assignments: TableAssignmentMock[];
}

export interface MealOptionMock {
  id: string;
  eventId: string;
  name: string;
}

export const mockTables: TableMock[] = [
  {
    id: 'tbl-12',
    eventId: 'evt-derecho-2027',
    number: 12,
    label: 'Mesa 12',
    shape: 'SQUARE',
    capacity: 10,
    occupied: 10,
    available: 0,
    status: 'AVAILABLE',
    x: 0.15,
    y: 0.20,
    assignments: [
      {
        id: 'asgn-ft-1',
        graduateId: 'grad-fernando-torres',
        graduateName: 'Fernando Torres',
        placesAssigned: 10,
      },
    ],
  },
  {
    id: 'tbl-15',
    eventId: 'evt-derecho-2027',
    number: 15,
    label: 'Mesa 15',
    shape: 'ROUND',
    capacity: 10,
    occupied: 4,
    available: 6,
    status: 'AVAILABLE',
    x: 0.38,
    y: 0.20,
    assignments: [
      {
        id: 'asgn-15-1',
        graduateId: 'grad-invitado-1',
        graduateName: 'Familia Ramírez',
        placesAssigned: 4,
      },
    ],
  },
  {
    id: 'tbl-18',
    eventId: 'evt-derecho-2027',
    number: 18,
    label: 'Mesa 18',
    shape: 'ROUND',
    capacity: 8,
    occupied: 8,
    available: 0,
    status: 'AVAILABLE',
    x: 0.62,
    y: 0.20,
    assignments: [
      {
        id: 'asgn-rs-1',
        graduateId: 'grad-roberto-sanchez',
        graduateName: 'Roberto Sánchez',
        placesAssigned: 8,
      },
    ],
  },
  {
    id: 'tbl-20',
    eventId: 'evt-derecho-2027',
    number: 20,
    label: 'Mesa 20',
    shape: 'ROUND',
    capacity: 10,
    occupied: 0,
    available: 0,
    status: 'BLOCKED',
    x: 0.85,
    y: 0.20,
    assignments: [],
  },
  {
    id: 'tbl-22',
    eventId: 'evt-derecho-2027',
    number: 22,
    label: 'Mesa 22',
    shape: 'ROUND',
    capacity: 10,
    occupied: 7,
    available: 3,
    status: 'AVAILABLE',
    x: 0.15,
    y: 0.50,
    assignments: [
      {
        id: 'asgn-22-1',
        graduateId: 'grad-invitado-2',
        graduateName: 'Familia Gómez',
        placesAssigned: 7,
      },
    ],
  },
  {
    id: 'tbl-24',
    eventId: 'evt-derecho-2027',
    number: 24, // Andrea's table
    label: 'Mesa 24',
    shape: 'SQUARE',
    capacity: 10,
    occupied: 8, // Andrea's 8 places
    available: 2,
    status: 'AVAILABLE',
    x: 0.38,
    y: 0.50,
    assignments: [
      {
        id: 'asgn-am-1',
        graduateId: 'grad-andrea-martinez',
        graduateName: 'Andrea Martínez',
        placesAssigned: 8,
      },
    ],
  },
  {
    id: 'tbl-25',
    eventId: 'evt-derecho-2027',
    number: 25,
    label: 'Mesa 25',
    shape: 'ROUND',
    capacity: 10,
    occupied: 0,
    available: 10,
    status: 'AVAILABLE',
    x: 0.62,
    y: 0.50,
    assignments: [],
  },
  {
    id: 'tbl-26',
    eventId: 'evt-derecho-2027',
    number: 26,
    label: 'Mesa 26',
    shape: 'SQUARE',
    capacity: 12,
    occupied: 4,
    available: 8,
    status: 'AVAILABLE',
    x: 0.85,
    y: 0.50,
    assignments: [
      {
        id: 'asgn-26-1',
        graduateId: 'grad-invitado-3',
        graduateName: 'Familia Vargas',
        placesAssigned: 4,
      },
    ],
  },
  {
    id: 'tbl-30',
    eventId: 'evt-derecho-2027',
    number: 30,
    label: 'Mesa 30',
    shape: 'ROUND',
    capacity: 10,
    occupied: 10,
    available: 0,
    status: 'AVAILABLE',
    x: 0.28,
    y: 0.80,
    assignments: [
      {
        id: 'asgn-30-1',
        graduateId: 'grad-invitado-4',
        graduateName: 'Familia Mendoza',
        placesAssigned: 10,
      },
    ],
  },
  {
    id: 'tbl-32',
    eventId: 'evt-derecho-2027',
    number: 32,
    label: 'Mesa 32',
    shape: 'ROUND',
    capacity: 10,
    occupied: 0,
    available: 10,
    status: 'AVAILABLE',
    x: 0.52,
    y: 0.80,
    assignments: [],
  },
];

export const mockMealOptions: MealOptionMock[] = [
  {
    id: 'meal-tradicional',
    eventId: 'evt-derecho-2027',
    name: 'Tradicional',
  },
  {
    id: 'meal-vegetariano',
    eventId: 'evt-derecho-2027',
    name: 'Vegetariano',
  },
  {
    id: 'meal-vegano',
    eventId: 'evt-derecho-2027',
    name: 'Vegano',
  },
];
