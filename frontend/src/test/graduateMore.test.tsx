import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { GraduateMoreScreen } from '../pages/graduate/GraduateMoreScreen';

describe('GraduateMoreScreen', () => {
  it('renders all key subpage links without hardcoded fake emails or technical copy', () => {
    render(
      <MemoryRouter>
        <GraduateMoreScreen />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /m[áa]s/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mi contrato' })).toHaveAttribute('href', '/graduate/contract');
    expect(screen.getByRole('link', { name: 'Mi termo' })).toHaveAttribute('href', '/graduate/thermo');
    expect(screen.getByRole('link', { name: 'Platillos' })).toHaveAttribute('href', '/graduate/meals');
    expect(screen.getByRole('link', { name: 'Mesa' })).toHaveAttribute('href', '/graduate/table');
    expect(screen.getByRole('link', { name: 'Cerrar sesión' })).toHaveAttribute('href', '/login');

    expect(screen.queryByText(/contacto@plataformagr\.mx/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/backend|preview|modo visual/i)).not.toBeInTheDocument();
  });
});
