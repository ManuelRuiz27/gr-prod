/**
 * Layout & Table Fixtures — Normalized seating demo data based on SEATING_MAP.md
 */

export type TableShape = 'ROUND' | 'SQUARE';

export type TableStatus = 'AVAILABLE' | 'BLOCKED';

export interface TableMock {
  id: string;
  eventId: string;
  number: number;
  shape: TableShape;
  capacity: number;
  occupied: number;
  available: number;
  status: TableStatus;
}

export interface MealOptionMock {
  id: string;
  eventId: string;
  name: string;
}

export const mockTables: TableMock[] = [
  {
    id: 'tbl-1',
    eventId: 'evt-derecho-2027',
    number: 1,
    shape: 'ROUND',
    capacity: 10,
    occupied: 10,
    available: 0,
    status: 'AVAILABLE',
  },
  {
    id: 'tbl-2',
    eventId: 'evt-derecho-2027',
    number: 2,
    shape: 'ROUND',
    capacity: 10,
    occupied: 6,
    available: 4,
    status: 'AVAILABLE',
  },
  {
    id: 'tbl-12',
    eventId: 'evt-derecho-2027',
    number: 12,
    shape: 'SQUARE',
    capacity: 10,
    occupied: 10,
    available: 0,
    status: 'AVAILABLE',
  },
  {
    id: 'tbl-24',
    eventId: 'evt-derecho-2027',
    number: 24, // Andrea's table
    shape: 'SQUARE',
    capacity: 10,
    occupied: 8, // Andrea's 8 places
    available: 2,
    status: 'AVAILABLE',
  },
  {
    id: 'tbl-25',
    eventId: 'evt-derecho-2027',
    number: 25,
    shape: 'ROUND',
    capacity: 10,
    occupied: 0,
    available: 10,
    status: 'AVAILABLE',
  },
  {
    id: 'tbl-26',
    eventId: 'evt-derecho-2027',
    number: 26,
    shape: 'SQUARE',
    capacity: 12,
    occupied: 4,
    available: 8,
    status: 'AVAILABLE',
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
