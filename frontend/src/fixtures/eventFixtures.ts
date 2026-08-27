/**
 * Event Fixtures — Normalized development data based on approved docs
 */

export type EventStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'FINALIZED' | 'CANCELLED';

export interface EventMock {
  id: string;
  name: string;
  institution: string;
  career: string;
  generation: string;
  date: string;
  venue: string;
  status: EventStatus;
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
  },
];

export const activeEventMock: EventMock = mockEvents[0];
