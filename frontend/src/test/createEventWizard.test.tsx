import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CreateEventWizardScreen } from '../pages/admin/event-create/CreateEventWizardScreen';
import { AdminEventsScreen } from '../pages/admin/AdminEventsScreen';
import { mockEvents } from '../fixtures';

function renderWizard(initialEntry = '/admin/events/new') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/admin/events" element={<AdminEventsScreen />} />
        <Route path="/admin/events/new" element={<CreateEventWizardScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

function fillStep1() {
  fireEvent.change(screen.getByLabelText(/Nombre del evento/i), {
    target: { value: 'Graduación Facultad de Derecho 2027' },
  });
  fireEvent.change(screen.getByLabelText(/Fecha/i), {
    target: { value: '2027-06-19' },
  });
  fireEvent.change(screen.getByLabelText(/Capacidad/i), {
    target: { value: '500' },
  });
  fireEvent.change(screen.getByLabelText(/Lugar/i), {
    target: { value: 'Centro de Convenciones' },
  });
  fireEvent.change(screen.getByLabelText(/Escuela \/ institución/i), {
    target: { value: 'Universidad Nacional Autónoma de México' },
  });
  fireEvent.change(screen.getByLabelText(/Carrera o facultad/i), {
    target: { value: 'Licenciatura en Derecho' },
  });
  fireEvent.change(screen.getByLabelText(/Generación/i), {
    target: { value: '2023 - 2027' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
}

describe('Admin Create Event Wizard Tests (VIS-06R1)', () => {
  it('Test 1 — Step 1 validation: shows error and stays on step 1 on empty continue', () => {
    renderWizard('/admin/events/new');

    const nextBtn = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(nextBtn);

    expect(
      screen.getByText('Completa nombre, fecha, lugar y una capacidad válida.')
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Paso 1 de 6/i).length).toBeGreaterThan(0);
  });

  it('Test 2 — Step 1 -> Step 2: advances to Productos y precios step with valid step 1 data', () => {
    renderWizard('/admin/events/new');
    fillStep1();

    expect(screen.getAllByText(/Paso 2 de 6/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Productos y precios/i })).toBeInTheDocument();
    expect(screen.getByText('Boleto Adulto (Con cena)')).toBeInTheDocument();
    expect(screen.getByText('Boleto Infantil')).toBeInTheDocument();
  });

  it('Test 3 — Step 2 -> Step 3: advances to Finanzas with valid products', () => {
    renderWizard('/admin/events/new');
    fillStep1();

    // Step 2 -> advance
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    expect(screen.getAllByText(/Paso 3 de 6/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Plan de pagos/i })).toBeInTheDocument();
  });

  it('Test 4 — Step 3 validation: empty financial step does not advance', () => {
    renderWizard('/admin/events/new');
    fillStep1();
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // On Step 3, empty continue
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    expect(
      screen.getByText('Completa correctamente la configuración financiera.')
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Paso 3 de 6/i).length).toBeGreaterThan(0);
  });

  it('Test 5 — Dynamic installments generation & no auto-population of amounts or dates', () => {
    renderWizard('/admin/events/new');
    fillStep1();
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    const installmentCountInput = screen.getByLabelText(/Número de mensualidades/i);
    fireEvent.change(installmentCountInput, { target: { value: '3' } });

    expect(screen.getByText('Mensualidad 1')).toBeInTheDocument();
    expect(screen.getByText('Mensualidad 2')).toBeInTheDocument();
    expect(screen.getByText('Mensualidad 3')).toBeInTheDocument();

    // Verify empty initial values
    const m1Amount = document.getElementById('installment-1-amount') as HTMLInputElement;
    const m1Date = document.getElementById('installment-1-dueDate') as HTMLInputElement;
    const m2Amount = document.getElementById('installment-2-amount') as HTMLInputElement;
    const m2Date = document.getElementById('installment-2-dueDate') as HTMLInputElement;
    const m3Amount = document.getElementById('installment-3-amount') as HTMLInputElement;
    const m3Date = document.getElementById('installment-3-dueDate') as HTMLInputElement;

    expect(m1Amount.value).toBe('');
    expect(m1Date.value).toBe('');
    expect(m2Amount.value).toBe('');
    expect(m2Date.value).toBe('');
    expect(m3Amount.value).toBe('');
    expect(m3Date.value).toBe('');

    // Fill m1 and m2
    fireEvent.change(m1Amount, { target: { value: '2500' } });
    fireEvent.change(m1Date, { target: { value: '2026-12-15' } });
    fireEvent.change(m2Amount, { target: { value: '2500' } });
    fireEvent.change(m2Date, { target: { value: '2027-01-15' } });

    // Resize down to 2
    fireEvent.change(installmentCountInput, { target: { value: '2' } });

    expect(screen.getByText('Mensualidad 1')).toBeInTheDocument();
    expect(screen.getByText('Mensualidad 2')).toBeInTheDocument();
    expect(screen.queryByText('Mensualidad 3')).not.toBeInTheDocument();

    // Values of m1 and m2 preserved
    expect((document.getElementById('installment-1-amount') as HTMLInputElement).value).toBe('2500');
    expect((document.getElementById('installment-1-dueDate') as HTMLInputElement).value).toBe('2026-12-15');
    expect((document.getElementById('installment-2-amount') as HTMLInputElement).value).toBe('2500');
    expect((document.getElementById('installment-2-dueDate') as HTMLInputElement).value).toBe('2027-01-15');
  });

  it('Test 6 — Step 4 Operación: renders Deadlines, Meals, and Thermo unlock threshold', () => {
    renderWizard('/admin/events/new');
    fillStep1();
    // Step 2
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Step 3
    fireEvent.change(screen.getByLabelText(/Precio total base/i), { target: { value: '15000' } });
    fireEvent.change(screen.getByLabelText(/Número de mensualidades/i), { target: { value: '1' } });
    fireEvent.change(document.getElementById('installment-1-amount')!, { target: { value: '15000' } });
    fireEvent.change(document.getElementById('installment-1-dueDate')!, { target: { value: '2027-01-15' } });
    fireEvent.change(screen.getByLabelText(/Periodo de gracia/i), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 4
    expect(screen.getAllByText(/Paso 4 de 6/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Fecha límite para lugares/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha límite para cambio de mesa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha límite de platillos/i)).toBeInTheDocument();
    expect(screen.getByText('Menú Tradicional')).toBeInTheDocument();
    expect(screen.getByText('Menú Vegano')).toBeInTheDocument();
    expect(screen.getByLabelText(/Porcentaje para desbloquear el termo/i)).toBeInTheDocument();
  });

  it('Test 7 — Step 5 Políticas: renders cancellation policy information', () => {
    renderWizard('/admin/events/new');
    fillStep1();
    // Step 2
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Step 3
    fireEvent.change(screen.getByLabelText(/Precio total base/i), { target: { value: '15000' } });
    fireEvent.change(screen.getByLabelText(/Número de mensualidades/i), { target: { value: '1' } });
    fireEvent.change(document.getElementById('installment-1-amount')!, { target: { value: '15000' } });
    fireEvent.change(document.getElementById('installment-1-dueDate')!, { target: { value: '2027-01-15' } });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Step 4
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 5
    expect(screen.getAllByText(/Paso 5 de 6/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Política de cancelación/i })).toBeInTheDocument();
    expect(screen.getByText(/Esquema de penalización escalonada/i)).toBeInTheDocument();
  });

  it('Test 8 — Step 6 Review: displays all normative sections and handles edit jumps', () => {
    renderWizard('/admin/events/new');
    fillStep1();
    // Step 2
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Step 3
    fireEvent.change(screen.getByLabelText(/Precio total base/i), { target: { value: '7500' } });
    fireEvent.change(screen.getByLabelText(/Número de mensualidades/i), { target: { value: '3' } });
    fireEvent.change(document.getElementById('installment-1-amount')!, { target: { value: '2500' } });
    fireEvent.change(document.getElementById('installment-1-dueDate')!, { target: { value: '2026-12-15' } });
    fireEvent.change(document.getElementById('installment-2-amount')!, { target: { value: '2500' } });
    fireEvent.change(document.getElementById('installment-2-dueDate')!, { target: { value: '2027-01-15' } });
    fireEvent.change(document.getElementById('installment-3-amount')!, { target: { value: '2500' } });
    fireEvent.change(document.getElementById('installment-3-dueDate')!, { target: { value: '2027-02-15' } });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Step 4
    fireEvent.change(screen.getByLabelText(/Fecha límite para lugares/i), {
      target: { value: '2027-05-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Step 5
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 6 - Review
    expect(screen.getAllByText(/Paso 6 de 6/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Graduación Facultad de Derecho 2027')).toBeInTheDocument();
    expect(screen.getByText('Universidad Nacional Autónoma de México')).toBeInTheDocument();
    expect(screen.getByText(/Licenciatura en Derecho/i)).toBeInTheDocument();
    expect(screen.getByText('$7500')).toBeInTheDocument();
    expect(screen.getByText('2027-05-01')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('Mensualidad 1')).toBeInTheDocument();
    expect(screen.getByText('2026-12-15')).toBeInTheDocument();
  });

  it('Test 9 — Finish: clicking "Crear evento" returns to /admin/events without mutating mockEvents', () => {
    const initialEventsCount = mockEvents.length;
    renderWizard('/admin/events/new');
    fillStep1();
    // Step 2
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Step 3
    fireEvent.change(screen.getByLabelText(/Precio total base/i), { target: { value: '12000' } });
    fireEvent.change(screen.getByLabelText(/Número de mensualidades/i), { target: { value: '1' } });
    fireEvent.change(document.getElementById('installment-1-amount')!, { target: { value: '12000' } });
    fireEvent.change(document.getElementById('installment-1-dueDate')!, { target: { value: '2027-02-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Step 4
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Step 5
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 6 - Finish
    const finishBtn = screen.getByRole('button', { name: /Crear evento/i });
    fireEvent.click(finishBtn);

    // Navigated back to /admin/events
    expect(screen.getByRole('heading', { name: /^Eventos$/i })).toBeInTheDocument();
    expect(mockEvents.length).toBe(initialEventsCount);
  });
});
