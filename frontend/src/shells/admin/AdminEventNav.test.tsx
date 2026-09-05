import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { mockEvents, type EventStatus } from '../../fixtures/eventFixtures';
import { AdminEventNav } from './AdminEventNav';

const originalStatus = mockEvents[0].status;

const renderEventNav = (eventId = mockEvents[0].id) => render(
  <MemoryRouter initialEntries={[`/admin/events/${eventId}`]}>
    <Routes>
      <Route path="/admin/events/:eventId" element={<AdminEventNav />} />
    </Routes>
  </MemoryRouter>,
);

afterEach(() => {
  mockEvents[0].status = originalStatus;
});

describe('AdminEventNav', () => {
  it.each([
    ['OPEN', 'Abierto'],
    ['CLOSED', 'Cerrado'],
    ['CANCELLED', 'Cancelado'],
  ] as const)('derives the %s event status as %s', (status, label) => {
    mockEvents[0].status = status as EventStatus;
    renderEventNav();

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('does not render another event identity for an unknown eventId', () => {
    renderEventNav('evt-inexistente');

    expect(screen.queryByRole('navigation', { name: /navegación contextual del evento/i })).not.toBeInTheDocument();
    expect(screen.queryByText(mockEvents[0].name)).not.toBeInTheDocument();
  });
});
