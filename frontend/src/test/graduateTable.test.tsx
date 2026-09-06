import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { GraduateTableScreen } from '../pages/graduate/GraduateTableScreen';

describe('GraduateTableScreen', () => {
  it('uses croquis by default, selects members and exposes a list fallback', () => {
    render(
      <MemoryRouter>
        <GraduateTableScreen />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('Mesas del evento')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Carlos Martínez/ }));
    expect(screen.getByText(/1 persona/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver como lista' }));
    expect(screen.getAllByText(/Mesa 24/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Asignaciones de terceros/i)).not.toBeInTheDocument();
  }, 15000);

  it('displays contextual minor warning when child member is selected', () => {
    render(
      <MemoryRouter>
        <GraduateTableScreen />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Carlos Martínez/ }));
    expect(screen.getByText('Verifica en qué mesa quedará el menor.')).toBeInTheDocument();
  });

  it('renders blocked state with SPA link to payments when financially ineligible', () => {
    render(
      <MemoryRouter>
        <GraduateTableScreen seatingStateId="seating-locked-financial" />
      </MemoryRouter>
    );
    expect(screen.getByText('La selección de mesa aún no está disponible.')).toBeInTheDocument();
    const payLink = screen.getByRole('link', { name: 'Ver pagos' });
    expect(payLink).toBeInTheDocument();
    expect(payLink).toHaveAttribute('href', '/graduate/payments');
  });
});
