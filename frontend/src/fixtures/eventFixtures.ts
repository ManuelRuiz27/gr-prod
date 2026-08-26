/**
 * Event Fixtures — Mock development data based on normative docs
 */

export interface EventMock {
  id: string;
  name: string;
  institution: string;
  career: string;
  generation: string;
  date: string;
  venue: string;
  ticketPrice: number;
  totalGraduates: number;
  confirmedGraduates: number;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  deadlines: {
    registration: string;
    seating: string;
    meals: string;
    thermo: string;
    finalPayment: string;
  };
  limits: {
    maxTicketsPerGraduate: number;
    maxGuestsPerGraduate: number;
  };
}

export const mockEvents: EventMock[] = [
  {
    id: 'evt-ingenieria-2026',
    name: 'Gala de Graduación Ingeniería 2026',
    institution: 'Instituto Tecnológico Superior',
    career: 'Ingeniería en Sistemas Computacionales',
    generation: 'Gen 2022-2026',
    date: '2026-11-20T20:00:00Z',
    venue: 'Salón Real de las Lomas, Salón Diamante',
    ticketPrice: 1850,
    totalGraduates: 85,
    confirmedGraduates: 68,
    status: 'ACTIVE',
    deadlines: {
      registration: '2026-09-30T23:59:59Z',
      seating: '2026-10-15T23:59:59Z',
      meals: '2026-10-25T23:59:59Z',
      thermo: '2026-10-10T23:59:59Z',
      finalPayment: '2026-11-05T23:59:59Z',
    },
    limits: {
      maxTicketsPerGraduate: 10,
      maxGuestsPerGraduate: 9,
    },
  },
  {
    id: 'evt-medicina-2026',
    name: 'Cena Baile Facultad de Medicina',
    institution: 'Universidad Autónoma',
    career: 'Médico Cirujano',
    generation: 'Gen 2020-2026',
    date: '2026-12-05T19:30:00Z',
    venue: 'Centro de Convenciones Terraza Jardín',
    ticketPrice: 2100,
    totalGraduates: 120,
    confirmedGraduates: 112,
    status: 'ACTIVE',
    deadlines: {
      registration: '2026-10-10T23:59:59Z',
      seating: '2026-11-01T23:59:59Z',
      meals: '2026-11-15T23:59:59Z',
      thermo: '2026-10-20T23:59:59Z',
      finalPayment: '2026-11-25T23:59:59Z',
    },
    limits: {
      maxTicketsPerGraduate: 12,
      maxGuestsPerGraduate: 11,
    },
  },
];

export const activeEventMock = mockEvents[0];
