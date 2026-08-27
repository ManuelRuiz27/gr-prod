/**
 * Layout & Table Fixtures — Normalized seating demo data based on SEATING_MAP.md
 */

import type { MealType } from './graduateFixtures';

export type TableShape = 'ROUND' | 'SQUARE';

export type TableStatus = 'AVAILABLE' | 'BLOCKED';

export interface TableMock {
  id: string;
  number: number;
  shape: TableShape;
  capacity: number;
  occupied: number;
  available: number;
  status: TableStatus;
}

export interface MealOptionMock {
  id: MealType;
  name: MealType;
  description: string;
}

export const mockTables: TableMock[] = [
  {
    id: 'tbl-1',
    number: 1,
    shape: 'ROUND',
    capacity: 10,
    occupied: 10,
    available: 0,
    status: 'AVAILABLE',
  },
  {
    id: 'tbl-2',
    number: 2,
    shape: 'ROUND',
    capacity: 10,
    occupied: 6,
    available: 4,
    status: 'AVAILABLE',
  },
  {
    id: 'tbl-12',
    number: 12,
    shape: 'SQUARE',
    capacity: 10,
    occupied: 10,
    available: 0,
    status: 'AVAILABLE',
  },
  {
    id: 'tbl-24',
    number: 24, // Andrea's table
    shape: 'SQUARE',
    capacity: 10,
    occupied: 8, // Andrea's 8 places
    available: 2,
    status: 'AVAILABLE',
  },
  {
    id: 'tbl-25',
    number: 25,
    shape: 'ROUND',
    capacity: 10,
    occupied: 0,
    available: 10,
    status: 'AVAILABLE',
  },
  {
    id: 'tbl-26',
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
    id: 'Tradicional',
    name: 'Tradicional',
    description: 'Menú principal estándar del banquete del evento.',
  },
  {
    id: 'Vegetariano',
    name: 'Vegetariano',
    description: 'Opción basada en plantas y lácteos seleccionados.',
  },
  {
    id: 'Vegano',
    name: 'Vegano',
    description: 'Opción 100% libre de ingredientes de origen animal.',
  },
];
