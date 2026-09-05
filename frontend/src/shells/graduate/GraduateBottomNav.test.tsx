import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GraduateBottomNav } from './GraduateBottomNav';

describe('Shell GRADUATE — GraduateBottomNav', () => {
  it('renders standard navigation tabs: Inicio, Mi grupo, Pagos, Más', () => {
    render(
      <MemoryRouter initialEntries={['/graduate']}>
        <GraduateBottomNav />
      </MemoryRouter>
    );

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Mi graduación')).toBeInTheDocument();
    expect(screen.getByText('Pagos')).toBeInTheDocument();
    expect(screen.getByText('Más')).toBeInTheDocument();
  });

  it('marks current route as active with aria-current="page"', () => {
    render(
      <MemoryRouter initialEntries={['/graduate/payments']}>
        <GraduateBottomNav />
      </MemoryRouter>
    );

    const paymentsLink = screen.getByText('Pagos').closest('a');
    expect(paymentsLink).toHaveAttribute('aria-current', 'page');
  });
});
