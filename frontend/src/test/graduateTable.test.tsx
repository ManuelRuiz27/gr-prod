import { fireEvent, render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, beforeEach } from 'vitest';
import { GraduateTableScreen } from '../pages/graduate/GraduateTableScreen';
import { seatingStore } from '../services/seating';

describe('GraduateTableScreen', () => {
  beforeEach(() => {
    seatingStore.reset();
  });

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

  it('reacts in real time when a selected table is blocked by admin', async () => {
    render(
      <MemoryRouter>
        <GraduateTableScreen />
      </MemoryRouter>
    );

    // Select Carlos Martínez
    fireEvent.click(screen.getByRole('button', { name: /Carlos Martínez/ }));

    // Select Mesa 25 (available: 10)
    const table25Node = screen.getByTestId('table-node-tbl-25');
    fireEvent.click(table25Node);

    expect(screen.getAllByText(/10 lugares disponibles de 10/).length).toBeGreaterThan(0);
    const assignBtn = screen.getAllByRole('button', { name: /Asignar 1 persona/i })[0];
    expect(assignBtn).toBeEnabled();

    // Simulate Admin blocking Mesa 25 in real time
    await act(async () => {
      await seatingStore.toggleBlockTable('evt-derecho-2027', 'tbl-25');
    });

    // Verify UI reflects real-time blocked notice and disables CTA
    expect((await screen.findAllByText(/Esta mesa ha sido bloqueada. Selecciona otra./i)).length).toBeGreaterThan(0);
    expect(assignBtn).toBeDisabled();
  });

  it('reacts in real time when a selected table fills up concurrently', async () => {
    render(
      <MemoryRouter>
        <GraduateTableScreen />
      </MemoryRouter>
    );

    // Select Carlos Martínez
    fireEvent.click(screen.getByRole('button', { name: /Carlos Martínez/ }));

    // Select Mesa 2 (available: 4)
    const table2Node = screen.getByTestId('table-node-tbl-2');
    fireEvent.click(table2Node);

    const assignBtn = screen.getAllByRole('button', { name: /Asignar 1 persona/i })[0];
    expect(assignBtn).toBeEnabled();

    // Concurrent assignment fills Mesa 2 completely
    await act(async () => {
      await seatingStore.assignMembers(
        'evt-derecho-2027',
        'tbl-2',
        [
          {
            id: 'asgn-concurrent-fill',
            graduateId: 'grad-other-concurrent',
            graduateName: 'Otro Graduado',
            placesAssigned: 4,
          },
        ],
        'admin'
      );
    });

    // Verify UI updates in real time to full state and disables CTA
    expect((await screen.findAllByText(/Esta mesa se acaba de llenar. Selecciona otra./i)).length).toBeGreaterThan(0);
    expect(assignBtn).toBeDisabled();
  });

  it('never exposes foreign graduate names in the graduate UI', () => {
    render(
      <MemoryRouter>
        <GraduateTableScreen />
      </MemoryRouter>
    );

    // Table 1 has 10 occupied seats by third-party graduates in baseline
    fireEvent.click(screen.getByRole('button', { name: 'Ver como lista' }));

    // Verify no external graduate names leaked
    expect(screen.queryByText('Mariana López')).not.toBeInTheDocument();
    expect(screen.queryByText('Jorge López')).not.toBeInTheDocument();
    expect(screen.queryByText('Patricia Morales')).not.toBeInTheDocument();
    expect(screen.queryByText('Alejandro Ruiz')).not.toBeInTheDocument();
  });
});
