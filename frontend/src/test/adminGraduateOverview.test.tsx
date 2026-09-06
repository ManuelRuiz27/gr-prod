import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

describe('Admin Graduate Overview Tests (Fase C: Dossier Continuo)', () => {
  it('1. Displays Andrea Martinez header info: name, folio, phone, and direct actions', () => {
    renderGraduateOverview();

    expect(screen.getByRole('heading', { name: 'Andrea Martínez' })).toBeInTheDocument();
    expect(screen.getByText(/Folio GR-2027-0042/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar abono/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Más acciones del graduado/i })).toBeInTheDocument();
    expect(screen.getByText(/Volver a graduados/i)).toBeInTheDocument();
  });

  it('2. Invariant: Does NOT render 9 tabs or decorative KPI cards', () => {
    renderGraduateOverview();

    // No tab elements
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('3. Finanzas section: displays continuous financial summary', () => {
    renderGraduateOverview();

    expect(screen.getByRole('heading', { name: /Finanzas/i })).toBeInTheDocument();
    expect(screen.getByText(/\$7,500 abonados de \$12,500/i)).toBeInTheDocument();
    expect(screen.getByText(/\$5,000/i)).toBeInTheDocument();
    expect(screen.getByText(/Próximo mínimo:/i)).toBeInTheDocument();
  });

  it('4. Grupo section: displays members and table assignments', () => {
    renderGraduateOverview();

    expect(screen.getByRole('heading', { name: /Grupo/i })).toBeInTheDocument();
    expect(screen.getByText(/8 lugares/i)).toBeInTheDocument();
    expect(screen.getAllByText('Andrea Martínez').length).toBeGreaterThan(0);
    expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
    expect(screen.getAllByText('Mesa 24').length).toBeGreaterThan(0);
  });

  it('5. Platillos, Termo and Contrato sections render continuously', () => {
    renderGraduateOverview();

    // Platillos
    expect(screen.getByRole('heading', { name: /Platillos/i })).toBeInTheDocument();

    // Termo
    expect(screen.getByRole('heading', { name: /Termo/i })).toBeInTheDocument();

    // Contrato: shows status without unverified link
    expect(screen.getByRole('heading', { name: /Contrato/i })).toBeInTheDocument();
    expect(screen.getByText(/Aceptado/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ver contrato →/i })).not.toBeInTheDocument();
  });

  it('does NOT expose unverified contract link to prevent leaking foreign contract default', () => {
    renderGraduateOverview('/admin/events/evt-derecho-2027/graduates/grad-carlos-torres');
    expect(screen.queryByRole('link', { name: /Ver contrato →/i })).not.toBeInTheDocument();
  });

  it('6. Does NOT display raw enum strings (LOCKED, IN_PRODUCTION, AVAILABLE)', () => {
    const { container } = renderGraduateOverview();
    const textContent = container.textContent || '';

    expect(textContent).not.toMatch(/\bLOCKED\b/);
    expect(textContent).not.toMatch(/\bIN_PRODUCTION\b/);
    expect(textContent).not.toMatch(/\bAVAILABLE\b/);
  });

  it('7. Registrar abono button opens contextual ManualPaymentModal', () => {
    renderGraduateOverview();

    const abonoBtn = screen.getByRole('button', { name: /Registrar abono/i });
    fireEvent.click(abonoBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: /Registrar abono/i })).toBeInTheDocument();
    expect(within(dialog).getAllByText(/GR-2027-0042/i).length).toBeGreaterThan(0);
  });

  it('8. Actions menu (···) allows modifying meal with mandatory reason', () => {
    renderGraduateOverview();

    // Open menu
    const menuBtn = screen.getByRole('button', { name: /Más acciones del graduado/i });
    fireEvent.click(menuBtn);

    // Click Modificar platillo
    const modifyMealBtn = screen.getByRole('button', { name: /Modificar platillo/i });
    fireEvent.click(modifyMealBtn);

    expect(screen.getByRole('heading', { name: /Modificar platillo/i })).toBeInTheDocument();
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

  it('9. Actions menu (···) toggles audit history inline', () => {
    renderGraduateOverview();

    expect(screen.queryByRole('heading', { name: /Historial y Auditoría/i })).not.toBeInTheDocument();

    // Open menu
    const menuBtn = screen.getByRole('button', { name: /Más acciones del graduado/i });
    fireEvent.click(menuBtn);

    // Click Ver historial
    const historyBtn = screen.getByRole('button', { name: /Ver historial/i });
    fireEvent.click(historyBtn);

    expect(screen.getByRole('heading', { name: /Historial y Auditoría/i })).toBeInTheDocument();
    expect(screen.getByText('Aceptación de contrato digital')).toBeInTheDocument();
  });

  it('10. Actions menu (···) allows canceling membership and requires reason', () => {
    renderGraduateOverview();

    const menuBtn = screen.getByRole('button', { name: /Más acciones del graduado/i });
    fireEvent.click(menuBtn);

    const cancelContractBtn = screen.getByRole('button', { name: /Cancelar contrato/i });
    fireEvent.click(cancelContractBtn);

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

  it('11. Displays EmptyState when graduateId does not exist', () => {
    renderGraduateOverview('/admin/events/evt-derecho-2027/graduates/no-existe');

    expect(screen.getAllByText('Graduado no encontrado').length).toBeGreaterThan(0);
    expect(
      screen.getByText('No encontramos este graduado dentro del evento.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a graduados' })).toBeInTheDocument();
  });

  it('12. Cancel membership integration: Fernando Torres shows Fernando folio and quote ($15,000) without Andrea figures', () => {
    renderGraduateOverview('/admin/events/evt-derecho-2027/graduates/grad-fernando-torres');

    const menuBtn = screen.getByRole('button', { name: /Más acciones del graduado/i });
    fireEvent.click(menuBtn);

    const cancelBtn = screen.getByRole('button', { name: /Cancelar contrato/i });
    fireEvent.click(cancelBtn);

    expect(screen.getByRole('heading', { name: 'Cancelar membresía del graduado' })).toBeInTheDocument();
    expect(screen.getAllByText('Fernando Torres').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$15,000').length).toBeGreaterThan(0); // Contratado Fernando
    expect(screen.getAllByText('$4,500').length).toBeGreaterThan(0); // Saldo pendiente Fernando

    // Invariant: does NOT contain Andrea's folio or figures
    expect(screen.queryByText('$24,500')).not.toBeInTheDocument();
    expect(screen.queryByText('GR-2027-0042')).not.toBeInTheDocument();
  });

  it('13. Cancel membership integration: graduate without quote fixture shows unavailable notice and disables confirm', () => {
    renderGraduateOverview('/admin/events/evt-derecho-2027/graduates/grad-roberto-sanchez');

    const menuBtn = screen.getByRole('button', { name: /Más acciones del graduado/i });
    fireEvent.click(menuBtn);

    const cancelBtn = screen.getByRole('button', { name: /Cancelar contrato/i });
    fireEvent.click(cancelBtn);

    expect(screen.getByRole('heading', { name: 'Cancelar membresía del graduado' })).toBeInTheDocument();
    expect(screen.getAllByText('Roberto Sánchez').length).toBeGreaterThan(0);
    expect(screen.getByText(/Cotización de cancelación no disponible para este escenario visual/i)).toBeInTheDocument();
    expect(screen.queryByText('$24,500')).not.toBeInTheDocument(); // No Andrea fallback!

    const confirmCancelBtn = screen.getByRole('button', { name: 'Confirmar cancelación' });
    expect(confirmCancelBtn).toBeDisabled();
  });
});

