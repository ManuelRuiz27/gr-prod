/**
 * Layout & Seating Fixtures — Mock tables, seats and map
 */

export interface TableMock {
  number: number;
  capacity: number;
  occupiedSeats: number;
  zone: 'VIP' | 'CENTRAL' | 'LATERAL';
  assignedGraduateNames: string[];
}

export interface MealOptionMock {
  id: string;
  name: string;
  description: string;
  type: 'ADULT' | 'KID' | 'VEGAN';
}

export const mockTables: TableMock[] = [
  { number: 1, capacity: 10, occupiedSeats: 10, zone: 'VIP', assignedGraduateNames: ['Sofía Romero'] },
  { number: 2, capacity: 10, occupiedSeats: 10, zone: 'VIP', assignedGraduateNames: ['Alejandro Garza'] },
  { number: 3, capacity: 10, occupiedSeats: 8, zone: 'VIP', assignedGraduateNames: ['Valeria Morales'] },
  { number: 12, capacity: 10, occupiedSeats: 5, zone: 'CENTRAL', assignedGraduateNames: ['Fernando Torres Méndez'] },
  { number: 14, capacity: 10, occupiedSeats: 10, zone: 'CENTRAL', assignedGraduateNames: ['Andrea Martínez', 'Roberto Sánchez'] },
  { number: 15, capacity: 10, occupiedSeats: 0, zone: 'CENTRAL', assignedGraduateNames: [] },
  { number: 21, capacity: 10, occupiedSeats: 4, zone: 'LATERAL', assignedGraduateNames: ['Gabriel Cruz'] },
  { number: 22, capacity: 10, occupiedSeats: 0, zone: 'LATERAL', assignedGraduateNames: [] },
];

export const mockMealOptions: MealOptionMock[] = [
  {
    id: 'meal-res',
    name: 'Filete Mignon en reducción de vino tinto',
    description: 'Acompañado de puré rústico de papa y espárragos a la mantequilla.',
    type: 'ADULT',
  },
  {
    id: 'meal-salmon',
    name: 'Salmón glaseado con cítricos y miel',
    description: 'Sobre cama de risotto parmesano y vegetales salteados.',
    type: 'ADULT',
  },
  {
    id: 'meal-pasta',
    name: 'Pechuga Cordon Bleu / Menú Infantil',
    description: 'Pechuga rellena con jamón y queso, puré de manzana y papas a la francesa.',
    type: 'KID',
  },
  {
    id: 'meal-vegan',
    name: 'Risotto de hongos silvestres y trufa',
    description: 'Opción 100% vegetariana y libre de lácteos con espinacas baby.',
    type: 'VEGAN',
  },
];
