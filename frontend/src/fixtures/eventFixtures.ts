/**
 * Event Fixtures — Normalized development data based on approved docs
 */

export type EventStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED';

export interface EventMock {
  id: string;
  name: string;
  institution?: string;
  career?: string;
  generation: string;
  date: string;
  venue: string;
  status: EventStatus;
  ticketPrice?: number;
  totalGraduates?: number;
  confirmedGraduates?: number;
  deadlines?: {
    seating?: string;
    meals?: string;
    thermo?: string;
    finalPayment?: string;
  };
}

export const mockEvents: EventMock[] = [
  {
    id: 'evt-derecho-2027',
    name: 'Graduación Facultad de Derecho 2027',
    institution: 'Facultad de Derecho',
    career: 'Licenciatura en Derecho',
    generation: '2027',
    date: '19 Jun 2027',
    venue: 'Centro de Convenciones',
    status: 'OPEN',
    ticketPrice: 1562.5,
    totalGraduates: 100,
    confirmedGraduates: 84,
    deadlines: {
      seating: '2027-05-15',
      meals: '2027-05-20',
      thermo: '2027-05-01',
      finalPayment: '2027-06-01',
    },
  },
];

export const activeEventMock: EventMock = mockEvents[0];
