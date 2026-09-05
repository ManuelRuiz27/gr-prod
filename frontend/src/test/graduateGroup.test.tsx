import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { GraduateGroupScreen } from '../pages/graduate/GraduateGroupScreen';

describe('GraduateGroupScreen', () => {
  const renderScreen = (groupStateId?: string) =>
    render(
      <MemoryRouter>
        <GraduateGroupScreen groupStateId={groupStateId} />
      </MemoryRouter>,
    );

  it('shows people and available places without a KPI strip', () => {
    renderScreen();

    expect(screen.getByRole('heading', { name: 'Mi grupo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Personas' })).toBeInTheDocument();
    expect(screen.getByText(/lugares tienen nombre/i)).toBeInTheDocument();
    expect(screen.getAllByText('Lugar disponible').length).toBeGreaterThan(0);
    expect(screen.queryByText('Capacidad de tu membresía')).not.toBeInTheDocument();
    expect(screen.queryByText('Integrantes registrados')).not.toBeInTheDocument();
  });

  it('lets an available place start the member registration flow', () => {
    renderScreen();

    fireEvent.click(screen.getByRole('button', { name: 'Agregar integrante' }));
    expect(screen.getByRole('heading', { name: 'Agregar integrante' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Laura González')).toBeInTheDocument();
  });

  it('shows closed event and deadline states without edit actions', () => {
    renderScreen('group-deadline-closed');

    expect(screen.getByText(/periodo para registrar integrantes ya terminó/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar integrante' })).not.toBeInTheDocument();
  });

  it('keeps the additional ticket flow focused on the due amount and new total', () => {
    renderScreen();

    fireEvent.click(screen.getByRole('button', { name: 'Agregar boleto' }));
    expect(screen.getByRole('heading', { name: 'Agregar boleto' })).toBeInTheDocument();
    expect(screen.getByText('Debes abonar hoy')).toBeInTheDocument();
    expect(screen.getByText('Nuevo total')).toBeInTheDocument();
    expect(screen.queryByText('BR-CONTRACT-007')).not.toBeInTheDocument();
  });
});
