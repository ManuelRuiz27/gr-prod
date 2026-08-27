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

describe('Admin Create Event Wizard Tests (FRONTEND-03B)', () => {
  it('Test 1 — Step 1 validation: shows error and stays on step 1 on empty continue', () => {
    renderWizard('/admin/events/new');

    const nextBtn = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(nextBtn);

    expect(
      screen.getByText('Completa nombre, fecha, lugar y una capacidad válida.')
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Paso 1 de 5/i).length).toBeGreaterThan(0);
  });

  it('Test 2 — Step 1 -> Step 2: advances to step 2 with valid step 1 data', () => {
    renderWizard('/admin/events/new');

    const nameInput = screen.getByLabelText(/Nombre del evento/i);
    const dateInput = screen.getByLabelText(/Fecha/i);
    const capacityInput = screen.getByLabelText(/Capacidad/i);
    const venueInput = screen.getByLabelText(/Lugar/i);

    fireEvent.change(nameInput, { target: { value: 'Graduación Facultad de Derecho 2027' } });
    fireEvent.change(dateInput, { target: { value: '2027-06-19' } });
    fireEvent.change(capacityInput, { target: { value: '500' } });
    fireEvent.change(venueInput, { target: { value: 'Centro de Convenciones' } });

    const nextBtn = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(nextBtn);

    expect(screen.getAllByText(/Paso 2 de 5/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Plan financiero/i })).toBeInTheDocument();
  });

  it('Test 3 — Financial semantics: checks fields and absence of recargos', () => {
    renderWizard('/admin/events/new');

    // Step 1
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
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 2
    expect(screen.getByLabelText(/Requiere pago inicial/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de mensualidades/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Periodo de gracia/i)).toBeInTheDocument();

    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toContain('recargos');
  });

  it('Test 4 — Deadlines: verifies exact three fields and no unsupported options', () => {
    renderWizard('/admin/events/new');

    // Step 1
    fireEvent.change(screen.getByLabelText(/Nombre del evento/i), {
      target: { value: 'Graduación 2027' },
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
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 2
    fireEvent.change(screen.getByLabelText(/Precio total base/i), {
      target: { value: '15000' },
    });
    fireEvent.change(screen.getByLabelText(/Número de mensualidades/i), {
      target: { value: '6' },
    });
    fireEvent.change(screen.getByLabelText(/Fecha del primer vencimiento/i), {
      target: { value: '2027-01-15' },
    });
    fireEvent.change(screen.getByLabelText(/Periodo de gracia/i), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 3
    expect(screen.getByLabelText(/Fecha límite para lugares/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha límite para cambio de mesa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha límite de platillos/i)).toBeInTheDocument();

    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toContain('Adultos');
    expect(bodyText).not.toContain('Infantil');
    expect(bodyText).not.toContain('Menú especial');
    expect(bodyText).not.toContain('comité');
  });

  it('Test 5 — Thermo: defaults to 70 and uses correct copy', () => {
    renderWizard('/admin/events/new');

    // Step 1
    fireEvent.change(screen.getByLabelText(/Nombre del evento/i), {
      target: { value: 'Graduación 2027' },
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
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 2
    fireEvent.change(screen.getByLabelText(/Precio total base/i), {
      target: { value: '15000' },
    });
    fireEvent.change(screen.getByLabelText(/Número de mensualidades/i), {
      target: { value: '6' },
    });
    fireEvent.change(screen.getByLabelText(/Fecha del primer vencimiento/i), {
      target: { value: '2027-01-15' },
    });
    fireEvent.change(screen.getByLabelText(/Periodo de gracia/i), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 3 -> advance
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 4
    const thermoInput = screen.getByLabelText(/Porcentaje para desbloquear el termo/i) as HTMLInputElement;
    expect(thermoInput.value).toBe('70');
    expect(screen.getByText(/disponible para solicitar/i)).toBeInTheDocument();

    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toContain('Listo para entrega');
  });

  it('Test 6 — Review: displays captured values and excludes unsupported fields', () => {
    renderWizard('/admin/events/new');

    // Step 1
    fireEvent.change(screen.getByLabelText(/Nombre del evento/i), {
      target: { value: 'Graduación Gala 2027' },
    });
    fireEvent.change(screen.getByLabelText(/Fecha/i), {
      target: { value: '2027-06-19' },
    });
    fireEvent.change(screen.getByLabelText(/Capacidad/i), {
      target: { value: '450' },
    });
    fireEvent.change(screen.getByLabelText(/Lugar/i), {
      target: { value: 'Salón Bellavista' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 2
    fireEvent.change(screen.getByLabelText(/Precio total base/i), {
      target: { value: '12000' },
    });
    fireEvent.change(screen.getByLabelText(/Número de mensualidades/i), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByLabelText(/Fecha del primer vencimiento/i), {
      target: { value: '2027-02-01' },
    });
    fireEvent.change(screen.getByLabelText(/Periodo de gracia/i), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 3
    fireEvent.change(screen.getByLabelText(/Fecha límite para lugares/i), {
      target: { value: '2027-05-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 4
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 5 - Review
    expect(screen.getByText('Graduación Gala 2027')).toBeInTheDocument();
    expect(screen.getByText('Salón Bellavista')).toBeInTheDocument();
    expect(screen.getByText('450 personas')).toBeInTheDocument();
    expect(screen.getByText('$12000')).toBeInTheDocument();
    expect(screen.getByText('2027-05-01')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();

    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toContain('Meta financiera');
    expect(bodyText).not.toContain('Tipo de evento');
    expect(bodyText).not.toContain('Firma de Contrato');
    expect(bodyText).not.toContain('Anticipo Salón');
  });

  it('Test 7 — Finish: clicking "Crear evento" returns to /admin/events without mutating mockEvents', () => {
    const initialEventsCount = mockEvents.length;
    renderWizard('/admin/events/new');

    // Step 1
    fireEvent.change(screen.getByLabelText(/Nombre del evento/i), {
      target: { value: 'Graduación Gala 2027' },
    });
    fireEvent.change(screen.getByLabelText(/Fecha/i), {
      target: { value: '2027-06-19' },
    });
    fireEvent.change(screen.getByLabelText(/Capacidad/i), {
      target: { value: '450' },
    });
    fireEvent.change(screen.getByLabelText(/Lugar/i), {
      target: { value: 'Salón Bellavista' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 2
    fireEvent.change(screen.getByLabelText(/Precio total base/i), {
      target: { value: '12000' },
    });
    fireEvent.change(screen.getByLabelText(/Número de mensualidades/i), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByLabelText(/Fecha del primer vencimiento/i), {
      target: { value: '2027-02-01' },
    });
    fireEvent.change(screen.getByLabelText(/Periodo de gracia/i), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 3
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 4
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // Step 5 - Finish
    const finishBtn = screen.getByRole('button', { name: /Crear evento/i });
    fireEvent.click(finishBtn);

    // Navigated back to /admin/events
    expect(screen.getByRole('heading', { name: /^Eventos$/i })).toBeInTheDocument();
    expect(mockEvents.length).toBe(initialEventsCount);
  });
});
