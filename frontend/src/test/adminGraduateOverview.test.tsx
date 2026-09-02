import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminGraduateOverviewScreen } from '../pages/admin/graduates/AdminGraduateOverviewScreen';
import { AdminEventGraduatesListScreen } from '../pages/admin/graduates/AdminEventGraduatesListScreen';

function renderGraduateOverview(
  initialEntry = '/admin/events/evt-derecho-2027/graduates/grad-andrea-martinez'
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/admin/events/:eventId/graduates"
          element={<AdminEventGraduatesListScreen />}
        />
        <Route
          path="/admin/events/:eventId/graduates/:graduateId"
          element={<AdminGraduateOverviewScreen />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('Admin Graduate Overview Tests (VIS-07 / VS-A-GRAD-002)', () => {
  it('1. Displays Andrea Martinez header info: name, email, folio, places, Mesa 24, and active membership', () => {
    renderGraduateOverview();

    expect(screen.getByRole('heading', { name: 'Andrea Martínez' })).toBeInTheDocument();
    expect(screen.getByText('andrea.martinez@ejemplo.com')).toBeInTheDocument();
    expect(screen.getByText('Folio: GR-2027-0042')).toBeInTheDocument();
    expect(screen.getByText('Membresía Activa')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument(); // ticketCount
    expect(screen.getAllByText('Mesa 24').length).toBeGreaterThan(0);
    expect(screen.getByText('8 integrantes')).toBeInTheDocument();
  });

  it('2. Resumen tab: displays financial figures and summary KPIs', () => {
    renderGraduateOverview();

    expect(screen.getByRole('heading', { name: 'Resumen financiero' })).toBeInTheDocument();
    expect(screen.getByText('Contratado')).toBeInTheDocument();
    expect(screen.getByText('Pagado')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Vencido')).toBeInTheDocument();

    expect(screen.getByText('$12,500')).toBeInTheDocument();
    expect(screen.getByText('$7,500')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('3. Does NOT display raw enum strings (LOCKED, IN_PRODUCTION, AVAILABLE)', () => {
    const { container } = renderGraduateOverview();
    const textContent = container.textContent || '';

    expect(textContent).not.toMatch(/\bLOCKED\b/);
    expect(textContent).not.toMatch(/\bIN_PRODUCTION\b/);
    expect(textContent).not.toMatch(/\bAVAILABLE\b/);
  });

  it('4. Navigates to Contrato tab and renders digital contract details', () => {
    renderGraduateOverview();

    const contractTab = screen.getByRole('tab', { name: 'Contrato' });
    fireEvent.click(contractTab);

    expect(screen.getByRole('heading', { name: 'Contrato digital' })).toBeInTheDocument();
    expect(screen.getByText('GR-2027-0042')).toBeInTheDocument();
    expect(screen.getByText('Aceptado digitalmente')).toBeInTheDocument();
  });

  it('5. Navigates to Grupo / productos tab and renders nominal members table', () => {
    renderGraduateOverview();

    const groupTab = screen.getByRole('tab', { name: 'Grupo / productos' });
    fireEvent.click(groupTab);

    expect(screen.getByRole('heading', { name: 'Grupo e integrantes' })).toBeInTheDocument();
    expect(screen.getAllByText('Andrea Martínez').length).toBeGreaterThan(0);
    expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
    expect(screen.getAllByText('Tradicional').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Vegano').length).toBeGreaterThan(0);
  });

  it('6. Navigates to Pagos tab and renders account state', () => {
    renderGraduateOverview();

    const paymentsTab = screen.getByRole('tab', { name: 'Pagos' });
    fireEvent.click(paymentsTab);

    expect(screen.getByRole('heading', { name: 'Estado de cuenta y pagos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver / gestionar pagos' })).toBeInTheDocument();
  });

  it('7. Navigates to Mesa tab and renders table location', () => {
    renderGraduateOverview();

    const tableTab = screen.getByRole('tab', { name: 'Mesa' });
    fireEvent.click(tableTab);

    expect(screen.getByRole('heading', { name: 'Mesa y croquis' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gestionar mesa en croquis' })).toBeInTheDocument();
  });

  it('8. Navigates to Platillos tab and handles admin meal override modal', () => {
    renderGraduateOverview();

    const mealsTab = screen.getByRole('tab', { name: 'Platillos' });
    fireEvent.click(mealsTab);

    expect(screen.getByRole('heading', { name: 'Selección de platillos' })).toBeInTheDocument();

    // Click modify on first member
    const modifyBtns = screen.getAllByRole('button', { name: 'Modificar' });
    fireEvent.click(modifyBtns[0]);

    expect(screen.getByRole('heading', { name: /Modificar menú/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Motivo del cambio administrativo/i)).toBeInTheDocument();

    // Fill reason and confirm
    fireEvent.change(screen.getByLabelText(/Motivo del cambio administrativo/i), {
      target: { value: 'Solicitud médica de cambio de menú' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambio' }));

    expect(
      screen.getByText('El cambio de menú administrativo fue registrado con motivo.')
    ).toBeInTheDocument();
  });

  it('9. Navigates to Termo tab and renders commemorative cup status', () => {
    renderGraduateOverview();

    const thermoTab = screen.getByRole('tab', { name: 'Termo' });
    fireEvent.click(thermoTab);

    expect(screen.getByRole('heading', { name: 'Termo conmemorativo' })).toBeInTheDocument();
    expect(screen.getByText(/70% de pago del evento/i)).toBeInTheDocument();
  });

  it('10. Navigates to Notas tab and handles adding internal note', () => {
    renderGraduateOverview();

    const notesTab = screen.getByRole('tab', { name: /Notas/i });
    fireEvent.click(notesTab);

    expect(screen.getByRole('heading', { name: 'Notas internas administrativas' })).toBeInTheDocument();

    // Open add note modal
    const addNoteBtn = screen.getByRole('button', { name: 'Agregar nota' });
    fireEvent.click(addNoteBtn);

    expect(screen.getByRole('heading', { name: 'Agregar nota interna' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Contenido de la nota/i), {
      target: { value: 'Nota de seguimiento operativo para prueba' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar nota' }));

    expect(screen.getByText('Nota de seguimiento operativo para prueba')).toBeInTheDocument();
  });

  it('11. Navigates to Historial tab and renders audit timeline', () => {
    renderGraduateOverview();

    const historyTab = screen.getByRole('tab', { name: 'Historial' });
    fireEvent.click(historyTab);

    expect(screen.getByRole('heading', { name: 'Historial y auditoría' })).toBeInTheDocument();
    expect(screen.getByText('Aceptación de contrato digital')).toBeInTheDocument();
  });

  it('12. Cancel membership dangerous action modal requires reason', () => {
    renderGraduateOverview();

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar membresía' });
    fireEvent.click(cancelBtn);

    expect(screen.getByRole('heading', { name: 'Cancelar membresía del graduado' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Motivo de cancelación/i)).toBeInTheDocument();

    const confirmCancelBtn = screen.getByRole('button', { name: 'Confirmar cancelación' });
    expect(confirmCancelBtn).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Motivo de cancelación/i), {
      target: { value: 'Baja solicitada por el alumno' },
    });
    expect(confirmCancelBtn).not.toBeDisabled();

    fireEvent.click(confirmCancelBtn);
    expect(
      screen.getByText('La solicitud de cancelación de membresía quedará registrada al integrar backend.')
    ).toBeInTheDocument();
  });

  it('13. Displays EmptyState when graduateId does not exist', () => {
    renderGraduateOverview('/admin/events/evt-derecho-2027/graduates/no-existe');

    expect(screen.getAllByText('Graduado no encontrado').length).toBeGreaterThan(0);
    expect(
      screen.getByText('No encontramos este graduado dentro del evento.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a graduados' })).toBeInTheDocument();
  });

  it('14. Cancel membership integration: Fernando Torres shows Fernando folio and quote ($15,000) without Andrea figures', () => {
    renderGraduateOverview('/admin/events/evt-derecho-2027/graduates/grad-fernando-torres');

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar membresía' });
    fireEvent.click(cancelBtn);

    expect(screen.getByRole('heading', { name: 'Cancelar membresía del graduado' })).toBeInTheDocument();
    expect(screen.getAllByText('Fernando Torres').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$15,000').length).toBeGreaterThan(0); // Contratado Fernando
    expect(screen.getAllByText('$4,500').length).toBeGreaterThan(0); // Saldo pendiente Fernando

    // Invariant: does NOT contain Andrea's folio or figures
    expect(screen.queryByText('$24,500')).not.toBeInTheDocument();
    expect(screen.queryByText('GR-2027-0042')).not.toBeInTheDocument();
  });

  it('15. Cancel membership integration: graduate without quote fixture shows unavailable notice and disables confirm', () => {
    renderGraduateOverview('/admin/events/evt-derecho-2027/graduates/grad-roberto-sanchez');

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar membresía' });
    fireEvent.click(cancelBtn);

    expect(screen.getByRole('heading', { name: 'Cancelar membresía del graduado' })).toBeInTheDocument();
    expect(screen.getAllByText('Roberto Sánchez').length).toBeGreaterThan(0);
    expect(screen.getByText(/Cotización de cancelación no disponible para este escenario visual/i)).toBeInTheDocument();
    expect(screen.queryByText('$24,500')).not.toBeInTheDocument(); // No Andrea fallback!

    const confirmCancelBtn = screen.getByRole('button', { name: 'Confirmar cancelación' });
    expect(confirmCancelBtn).toBeDisabled();
  });
});
