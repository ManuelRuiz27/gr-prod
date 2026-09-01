import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CreateEventWizardScreen } from '../pages/admin/event-create/CreateEventWizardScreen';
import { AdminEventsScreen } from '../pages/admin/AdminEventsScreen';
import { INITIAL_CREATE_EVENT_DRAFT } from '../pages/admin/event-create/createEventDraft';
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

describe('Admin Create Event Wizard Tests (VIS-06R2)', () => {
  it('1. Anti-regression: INITIAL_CREATE_EVENT_DRAFT does NOT contain non-normative demo defaults', () => {
    // Products and prices must be empty
    expect(INITIAL_CREATE_EVENT_DRAFT.products).toEqual([]);

    // Meals must be empty
    expect(INITIAL_CREATE_EVENT_DRAFT.mealOptions).toEqual([]);

    // Thermo must be empty string
    expect(INITIAL_CREATE_EVENT_DRAFT.thermoThresholdPercent).toBe('');

    // Milestones and policy summary must be empty
    expect(INITIAL_CREATE_EVENT_DRAFT.financialMilestonesNote).toBe('');
    expect(INITIAL_CREATE_EVENT_DRAFT.cancellationPolicySummary).toBe('');
    expect(INITIAL_CREATE_EVENT_DRAFT.gracePeriodDays).toBe('');
    expect(INITIAL_CREATE_EVENT_DRAFT.lateFeeAmount).toBe('');
  });

  it('2. Step 1 validation: shows error and stays on step 1 on empty continue', () => {
    renderWizard('/admin/events/new');

    const nextBtn = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(nextBtn);

    expect(
      screen.getByText('Completa nombre, fecha, lugar y una capacidad válida.')
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Paso 1 de 6/i).length).toBeGreaterThan(0);
  });

  it('3. Step 2 Products: renders empty state without hardcoded commercial prices', () => {
    renderWizard('/admin/events/new');
    fillStep1();

    expect(screen.getAllByText(/Paso 2 de 6/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Productos y precios/i })).toBeInTheDocument();
    expect(screen.getByText('Sin productos configurados')).toBeInTheDocument();

    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toContain('$1500');
    expect(bodyText).not.toContain('$900');
    expect(bodyText).not.toContain('$700');
    expect(bodyText).not.toContain('$350');
  });

  it('4. Step 3 Finanzas: validation blocks when baseAmount is empty', () => {
    renderWizard('/admin/events/new');
    fillStep1();

    // Step 2 -> advance
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    expect(screen.getAllByText(/Paso 3 de 6/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Plan de pagos/i })).toBeInTheDocument();

    // Try advancing with empty baseAmount
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    expect(
      screen.getByText('Completa correctamente la configuración financiera.')
    ).toBeInTheDocument();
  });

  it('5. Dynamic installments generation & no auto-population of amounts or dates', () => {
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
    expect(m1Amount.value).toBe('');
    expect(m1Date.value).toBe('');
  });

  it('6. Step 4 Operación: renders empty meals state and thermo threshold without default 70%', () => {
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
    expect(screen.getAllByText(/Paso 4 de 6/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Aún no hay opciones de platillo configuradas.')).toBeInTheDocument();

    const thermoInput = screen.getByLabelText(/Porcentaje para desbloquear el termo/i) as HTMLInputElement;
    expect(thermoInput.value).toBe('');
    expect(screen.getByText('Sin umbral configurado')).toBeInTheDocument();

    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toContain('Menú Tradicional');
    expect(bodyText).not.toContain('Menú Vegano');
  });

  it('7. Step 5 Políticas: does NOT render hardcoded ranges (>90 días, 30 a 90 días, 10%, 30%)', () => {
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
    expect(screen.getByText('Sin configurar')).toBeInTheDocument();

    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toContain('> 90 días');
    expect(bodyText).not.toContain('30 a 90 días');
    expect(bodyText).not.toContain('10% retención');
    expect(bodyText).not.toContain('Política estándar');
  });

  it('8. Step 6 Review: displays unconfigured states accurately and allows edits', () => {
    renderWizard('/admin/events/new');
    fillStep1();
    // Step 2
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Step 3
    fireEvent.change(screen.getByLabelText(/Precio total base/i), { target: { value: '7500' } });
    fireEvent.change(screen.getByLabelText(/Número de mensualidades/i), { target: { value: '1' } });
    fireEvent.change(document.getElementById('installment-1-amount')!, { target: { value: '7500' } });
    fireEvent.change(document.getElementById('installment-1-dueDate')!, { target: { value: '2026-12-15' } });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Step 4
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    // Step 5
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 6 - Review
    expect(screen.getAllByText(/Paso 6 de 6/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Graduación Facultad de Derecho 2027')).toBeInTheDocument();
    expect(screen.getByText('Sin productos configurados')).toBeInTheDocument();
    expect(screen.getByText('Sin opciones configuradas')).toBeInTheDocument();
    expect(screen.getByText('Umbral sin configurar')).toBeInTheDocument();
    expect(screen.getAllByText(/\$7500/).length).toBeGreaterThan(0);
  });

  it('9. Finish: clicking "Crear evento" returns to /admin/events without mutating mockEvents', () => {
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
