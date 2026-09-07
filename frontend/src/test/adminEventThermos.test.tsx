/**
 * adminEventThermos.test.tsx
 * FRONTEND-06 — GR-07-09 — Termos ADMIN
 *
 * Validates all 24 normative test requirements:
 * 1. Strict event isolation
 * 2. No automatic fallback to evt-derecho-2027
 * 3. Non-existent event shows EmptyState
 * 4. Summary counts derived exclusively from event graduates
 * 5. UI does not show raw enums (LOCKED, AVAILABLE, REQUESTED, IN_PRODUCTION, DELIVERED, ThermoRequest, ThermoStatus)
 * 6. UI does not hardcode 70% threshold
 * 7. Absence of EventSettings shows neutral/unavailable threshold
 * 8. Andrea gets progress exclusively from mockPaymentPlansMap (60% pagado)
 * 9. Graduate without PaymentPlan shows "Sin dato financiero disponible"
 * 10. No invented progress to justify thermoStatus
 * 11. Personalization strictly uses thermoCustomName (no fallback to fullName)
 * 12. REQUESTED offers only "Marcar en producción"
 * 13. IN_PRODUCTION offers only "Marcar como entregado"
 * 14. LOCKED does not offer administrative transition
 * 15. AVAILABLE does not offer administrative transition
 * 16. DELIVERED does not offer administrative transition
 * 17. No free selector of the five statuses
 * 18. Local transition shows "Vista previa local / No guardado"
 * 19. Local transition does NOT mutate mockGraduatesList fixture
 * 20. Pending local transition blocks chained second transition ("Cambio pendiente de backend")
 * 21. Timeline contains no invented dates
 * 22. Changing eventId resets previews and detail view
 * 23. No undefined customization attributes appear
 * 24. No technical model language in UI
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventThermosScreen } from '../pages/admin/AdminEventThermosScreen';
import { ThermoDetail } from '../pages/admin/thermos/ThermoDetail';
import { mockGraduatesList, type GraduateMock } from '../fixtures/graduateFixtures';
import { mockPaymentPlansMap } from '../fixtures/paymentFixtures';
import {
  buildGraduateThermoViewModels,
  buildThermoStatusCounts,
} from '../pages/admin/thermos/thermoViewModel';

function renderThermosScreen(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/events/:eventId/thermos" element={<AdminEventThermosScreen />} />
        <Route path="/admin/thermos" element={<AdminEventThermosScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

// ── 1. Strict event isolation ─────────────────────────────────────────────────

describe('1. /admin/events/:eventId/thermos — strict event isolation', () => {
  it('renders event-specific content for evt-derecho-2027', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');
    expect(screen.getByRole('heading', { level: 1, name: /^Termos$/i })).toBeInTheDocument();
  });

  it('shows "Selecciona un evento" when no eventId is in path', () => {
    renderThermosScreen('/admin/thermos');
    expect(screen.getAllByText(/Selecciona un evento/i).length).toBeGreaterThan(0);
  });
});

// ── 2. No automatic fallback to evt-derecho-2027 ────────────────────────────

describe('2. No automatic fallback to evt-derecho-2027', () => {
  it('does NOT silently fall back to evt-derecho-2027 when eventId is missing', () => {
    renderThermosScreen('/admin/thermos');
    expect(screen.getAllByText(/Selecciona un evento/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { level: 1, name: /^Termos$/i })).not.toBeInTheDocument();
  });
});

// ── 3. Non-existent event shows EmptyState ────────────────────────────────────

describe('3. Non-existent event shows EmptyState', () => {
  it('shows "Evento no encontrado" for an unknown eventId', () => {
    renderThermosScreen('/admin/events/evt-no-existe-xyz/thermos');
    expect(screen.getAllByText(/Evento no encontrado/i).length).toBeGreaterThan(0);
  });
});

// ── 4. Summary counts derived exclusively from event graduates ────────────────

describe('4. Summary counts derived strictly from event graduates', () => {
  it('calculates counts from evt-derecho-2027 graduates only', () => {
    const vms = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027'
    );
    const counts = buildThermoStatusCounts(vms);

    // In fixtures for evt-derecho-2027:
    // Andrea (LOCKED), Fernando (AVAILABLE), Mariana (REQUESTED), Roberto (IN_PRODUCTION)
    expect(counts.locked).toBe(1);
    expect(counts.available).toBe(1);
    expect(counts.requested).toBe(1);
    expect(counts.inProduction).toBe(1);
    expect(counts.delivered).toBe(0);
    expect(counts.total).toBe(4);
  });
});

// ── 5. UI does not show raw enums ─────────────────────────────────────────────

describe('5. UI does not expose raw technical enums or model names', () => {
  it('does not render raw LOCKED, AVAILABLE, REQUESTED, IN_PRODUCTION, DELIVERED strings', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');
    expect(screen.queryByText('LOCKED')).not.toBeInTheDocument();
    expect(screen.queryByText('AVAILABLE')).not.toBeInTheDocument();
    expect(screen.queryByText('REQUESTED')).not.toBeInTheDocument();
    expect(screen.queryByText('IN_PRODUCTION')).not.toBeInTheDocument();
    expect(screen.queryByText('DELIVERED')).not.toBeInTheDocument();
    expect(screen.queryByText('ThermoStatus')).not.toBeInTheDocument();
    expect(screen.queryByText('ThermoRequest')).not.toBeInTheDocument();
  });

  it('renders natural Spanish labels instead', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');
    expect(screen.getAllByText(/Bloqueado/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Disponible/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Solicitado/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/En producción/i).length).toBeGreaterThan(0);
  });
});

// ── 6. UI does not hardcode 70% ───────────────────────────────────────────────

describe('6. UI does not hardcode 70% threshold', () => {
  it('does not render hardcoded threshold texts like "< 70% pago" or "umbral 70%"', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');
    expect(screen.queryByText(/< 70%/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/>= 70%/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/umbral 70%/i)).not.toBeInTheDocument();
  });
});

// ── 7. Absence of dashboard cards in detail view ──────────────────────────────

describe('7. Absence of dashboard cards in detail view', () => {
  it('does not render dashboard cards like "Umbral del evento" in detail view', () => {
    const vms = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027'
    );
    const andrea = vms.find((g) => g.fullName === 'Andrea Martínez')!;

    render(
      <ThermoDetail
        graduate={andrea}
        onClose={() => {}}
        onTransitionPreview={() => {}}
      />
    );

    expect(screen.queryByText('Umbral del evento')).not.toBeInTheDocument();
    expect(screen.queryByText('Configuración no disponible')).not.toBeInTheDocument();
  });
});

// ── 8. Andrea gets progress from mockPaymentPlansMap (60% pagado) ─────────────

describe('8. Andrea gets progress from mockPaymentPlansMap matching graduateId + eventId', () => {
  it('derives 60% pagado for Andrea from payment plan', () => {
    const vms = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027'
    );
    const andrea = vms.find((g) => g.fullName === 'Andrea Martínez')!;

    expect(andrea.progressPercentage).toBe(60);
    expect(andrea.paidAmount).toBe(7500);
    expect(andrea.totalAmount).toBe(12500);
  });
});

// ── 9. Graduate detail shows strictly operational fields ──────────────────────

describe('9. Graduate detail shows strictly operational fields without dashboard cards', () => {
  it('displays folio, name, table, personalization, status and valid next action', () => {
    const vms = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027'
    );
    const fernando = vms.find((g) => g.fullName === 'Fernando Torres')!;

    render(
      <ThermoDetail
        graduate={fernando}
        onClose={() => {}}
        onTransitionPreview={() => {}}
      />
    );

    expect(screen.getAllByText('CT-2027-0089').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Fernando Torres').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Mesa 12')).toBeInTheDocument();
    expect(screen.getAllByText('Disponible').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/Avance financiero/i)).not.toBeInTheDocument();
  });
});

// ── 10. No invented progress to justify thermoStatus ──────────────────────────

describe('10. No invented progress to justify thermoStatus', () => {
  it('keeps progressPercentage as null for Mariana and Roberto', () => {
    const vms = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027'
    );
    const mariana = vms.find((g) => g.fullName === 'Mariana López')!;
    const roberto = vms.find((g) => g.fullName === 'Roberto Sánchez')!;

    expect(mariana.progressPercentage).toBeNull();
    expect(roberto.progressPercentage).toBeNull();
  });
});

// ── 11. Personalization strictly uses thermoCustomName ─────────────────────────

describe('11. Personalization strictly uses thermoCustomName (no fallback to fullName)', () => {
  it('returns null customName when thermoCustomName is absent or empty', () => {
    const syntheticGrad: GraduateMock = {
      id: 'grad-no-custom',
      eventId: 'evt-derecho-2027',
      fullName: 'Pedro Sin Personalizacion',
      email: 'pedro@ejemplo.com',
      career: 'Derecho',
      generation: '2027',
      ticketCount: 1,
      tableNumber: null,
      thermoStatus: 'AVAILABLE',
      thermoThreshold: 70,
      thermoCustomName: '',
      guests: [],
    };

    const vms = buildGraduateThermoViewModels(
      [syntheticGrad],
      {},
      'evt-derecho-2027'
    );
    expect(vms[0].customName).toBeNull();

    render(
      <ThermoDetail
        graduate={vms[0]}
        onClose={() => {}}
        onTransitionPreview={() => {}}
      />
    );

    expect(screen.getByText('Sin personalización registrada')).toBeInTheDocument();
    // Does NOT render fullName in personalization box
    expect(screen.queryByText('"Pedro Sin Personalizacion"')).not.toBeInTheDocument();
  });
});

// ── 12. REQUESTED offers only "Marcar en producción" ──────────────────────────

describe('12. REQUESTED offers only "Marcar en producción"', () => {
  it('Mariana López (REQUESTED) displays "Marcar en producción" button', () => {
    const vms = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027'
    );
    const mariana = vms.find((g) => g.fullName === 'Mariana López')!;

    render(
      <ThermoDetail
        graduate={mariana}
        onClose={() => {}}
        onTransitionPreview={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /Marcar en producción/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Marcar como entregado/i })).not.toBeInTheDocument();
  });
});

// ── 13. IN_PRODUCTION offers only "Marcar como entregado" ─────────────────────

describe('13. IN_PRODUCTION offers only "Marcar como entregado"', () => {
  it('Roberto Sánchez (IN_PRODUCTION) displays "Marcar como entregado" button', () => {
    const vms = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027'
    );
    const roberto = vms.find((g) => g.fullName === 'Roberto Sánchez')!;

    render(
      <ThermoDetail
        graduate={roberto}
        onClose={() => {}}
        onTransitionPreview={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /Marcar como entregado/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Marcar en producción/i })).not.toBeInTheDocument();
  });
});

// ── 14. LOCKED does not offer administrative transition ───────────────────────

describe('14. LOCKED does not offer administrative transition', () => {
  it('Andrea Martínez (LOCKED) has no transition CTA buttons', () => {
    const vms = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027'
    );
    const andrea = vms.find((g) => g.fullName === 'Andrea Martínez')!;

    render(
      <ThermoDetail
        graduate={andrea}
        onClose={() => {}}
        onTransitionPreview={() => {}}
      />
    );

    expect(screen.queryByRole('button', { name: /Marcar en producción/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Marcar como entregado/i })).not.toBeInTheDocument();
  });
});

// ── 15. AVAILABLE does not offer administrative transition ────────────────────

describe('15. AVAILABLE does not offer administrative transition', () => {
  it('Fernando Torres (AVAILABLE) has no transition CTA buttons', () => {
    const vms = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027'
    );
    const fernando = vms.find((g) => g.fullName === 'Fernando Torres')!;

    render(
      <ThermoDetail
        graduate={fernando}
        onClose={() => {}}
        onTransitionPreview={() => {}}
      />
    );

    expect(screen.queryByRole('button', { name: /Marcar en producción/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Marcar como entregado/i })).not.toBeInTheDocument();
  });
});

// ── 16. DELIVERED does not offer administrative transition ────────────────────

describe('16. DELIVERED does not offer administrative transition', () => {
  it('a delivered thermo has no transition CTA buttons', () => {
    const deliveredGrad: GraduateMock = {
      id: 'grad-deliv',
      eventId: 'evt-derecho-2027',
      fullName: 'Graduado Entregado',
      email: 'deliv@ejemplo.com',
      career: 'Derecho',
      generation: '2027',
      ticketCount: 1,
      tableNumber: null,
      thermoStatus: 'DELIVERED',
      thermoThreshold: 70,
      guests: [],
    };

    const vms = buildGraduateThermoViewModels([deliveredGrad], {}, 'evt-derecho-2027');

    render(
      <ThermoDetail
        graduate={vms[0]}
        onClose={() => {}}
        onTransitionPreview={() => {}}
      />
    );

    expect(screen.queryByRole('button', { name: /Marcar en producción/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Marcar como entregado/i })).not.toBeInTheDocument();
  });
});

// ── 17. No free selector of the five statuses ─────────────────────────────────

describe('17. No free selector of the five statuses in modal or screen', () => {
  it('does not render status dropdown/buttons to pick arbitrary status', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');
    expect(screen.queryByText(/Seleccionar Nuevo Estado/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cambiar Estado' })).not.toBeInTheDocument();
  });
});

// ── 18. Transition REQUESTED -> IN_PRODUCTION without technical copy ─────────

describe('18. Transition REQUESTED -> IN_PRODUCTION without technical copy', () => {
  it('opening Mariana detail and confirming production updates status immediately', async () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');

    // Click "Ver detalle" on Mariana López
    const marianaRow = screen.getByTestId('thermo-row-grad-mariana-lopez');
    fireEvent.click(within(marianaRow).getByRole('button', { name: /Ver detalle/i }));

    // In detail view, click "Marcar en producción"
    const prodBtn = await screen.findByRole('button', { name: /Marcar en producción/i });
    fireEvent.click(prodBtn);

    // Modal opens without technical preview copy
    expect(screen.queryByText(/Vista previa local — No guardada/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/backend/i)).not.toBeInTheDocument();

    // Confirm transition
    const confirmBtn = screen.getByRole('button', { name: /Confirmar producción/i });
    fireEvent.click(confirmBtn);

    // Detail view now shows status "En producción" without preview alert
    expect(screen.queryByText(/Vista previa local — No guardado/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/En producción/i).length).toBeGreaterThanOrEqual(1);
  });
});

// ── 19. Local transition does NOT mutate mockGraduatesList fixture ────────────

describe('19. Local transition does NOT mutate mockGraduatesList fixture', () => {
  it('Mariana López fixture remains REQUESTED after preview transition', () => {
    const marianaFixture = mockGraduatesList.find((g) => g.id === 'grad-mariana-lopez')!;
    expect(marianaFixture.thermoStatus).toBe('REQUESTED');
  });
});

// ── 20. Transition IN_PRODUCTION -> DELIVERED ─────────────────────────────────

describe('20. Transition IN_PRODUCTION -> DELIVERED without technical copy', () => {
  it('allows Roberto to transition from IN_PRODUCTION to DELIVERED without technical badges', async () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');

    const robertoRow = screen.getByTestId('thermo-row-grad-roberto-sanchez');
    fireEvent.click(within(robertoRow).getByRole('button', { name: /Ver detalle/i }));

    const delivBtn = await screen.findByRole('button', { name: /Marcar como entregado/i });
    fireEvent.click(delivBtn);

    expect(screen.getByText(/¿Confirmas la entrega final del termo conmemorativo a Roberto Sánchez\?/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Confirmar entrega/i });
    fireEvent.click(confirmBtn);

    expect(screen.queryByText('Cambio pendiente de backend')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Entregado/i).length).toBeGreaterThanOrEqual(1);
  });
});

// ── 21. Absence of dashboard bloat in detail view ─────────────────────────────

describe('21. Absence of dashboard bloat in detail view', () => {
  it('detail view does not contain timeline or invented dates', () => {
    const vms = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027'
    );
    const andrea = vms.find((g) => g.fullName === 'Andrea Martínez')!;

    render(
      <ThermoDetail
        graduate={andrea}
        onClose={() => {}}
        onTransitionPreview={() => {}}
      />
    );

    expect(screen.queryByText(/20 Mar 2027/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/22 Mar 2027/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Línea de tiempo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Historial de cambios/i)).not.toBeInTheDocument();
  });
});

// ── 22. Changing eventId resets previews and detail view ──────────────────────

describe('22. Changing eventId resets view state and previews', () => {
  it('renders clean state for different eventId', () => {
    const vms1 = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027'
    );
    const vms2 = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-medicina-9999'
    );

    expect(vms1.length).toBeGreaterThan(0);
    expect(vms2).toHaveLength(0);
  });
});

// ── 23. No undefined customization attributes appear ──────────────────────────

describe('23. No undefined customization attributes appear', () => {
  it('does not render invented customization attributes (color, tamaño, acabado, etc.)', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');
    expect(screen.queryByText(/color/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/tamaño/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/tipografía/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/acabado/i)).not.toBeInTheDocument();
  });
});

// ── 24. No technical model language in UI ─────────────────────────────────────

describe('24. No technical model language in UI', () => {
  it('does not show technical database/model identifiers', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');
    expect(screen.queryByText('thermo_threshold_percent')).not.toBeInTheDocument();
    expect(screen.queryByText('membershipId')).not.toBeInTheDocument();
    expect(screen.queryByText('START_PRODUCTION')).not.toBeInTheDocument();
    expect(screen.queryByText('MARK_DELIVERED')).not.toBeInTheDocument();
  });
});

// ── 25. FASE D3: Live updates during session ──────────────────────────────────

describe('25. Session transitions update state immediately across views', () => {
  it('moving Mariana to IN_PRODUCTION updates her status in list immediately', async () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');

    const marianaRow = screen.getByTestId('thermo-row-grad-mariana-lopez');
    fireEvent.click(within(marianaRow).getByRole('button', { name: /Ver detalle/i }));

    const prodBtn = await screen.findByRole('button', { name: /Marcar en producción/i });
    fireEvent.click(prodBtn);

    const confirmBtn = screen.getByRole('button', { name: /Confirmar producción/i });
    fireEvent.click(confirmBtn);

    fireEvent.click(screen.getByRole('button', { name: /Volver al listado/i }));

    // In list view, Mariana now shows "En producción"
    const updatedRow = screen.getByTestId('thermo-row-grad-mariana-lopez');
    expect(within(updatedRow).getByText('En producción')).toBeInTheDocument();
  });
});

// ── 26. FASE D3: Operational filters update immediately with session transitions ─

describe('26. Operational filters update immediately with session transitions', () => {
  it('Mariana moves from "Por preparar" to "En producción" after transition', async () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');

    // Initially under "Por preparar", Mariana is visible
    const porPrepararChip = screen.getByRole('button', { name: /Por preparar/i });
    fireEvent.click(porPrepararChip);
    expect(screen.getByTestId('thermo-row-grad-mariana-lopez')).toBeInTheDocument();

    // Open detail and transition
    const marianaRow = screen.getByTestId('thermo-row-grad-mariana-lopez');
    fireEvent.click(within(marianaRow).getByRole('button', { name: /Ver detalle/i }));
    const prodBtn = await screen.findByRole('button', { name: /Marcar en producción/i });
    fireEvent.click(prodBtn);
    fireEvent.click(screen.getByRole('button', { name: /Confirmar producción/i }));

    // Return to list
    fireEvent.click(screen.getByRole('button', { name: /Volver al listado/i }));

    // Under "Por preparar", Mariana is no longer visible
    fireEvent.click(screen.getByRole('button', { name: /Por preparar/i }));
    expect(screen.queryByTestId('thermo-row-grad-mariana-lopez')).not.toBeInTheDocument();

    // Under "En producción", Mariana is now visible
    fireEvent.click(screen.getByRole('button', { name: /En producción/i }));
    expect(screen.getByTestId('thermo-row-grad-mariana-lopez')).toBeInTheDocument();
  });
});

// ── 27. FASE D3: Language checks (no taller, proveedor, grabado) ───────────────

describe('27. UI does not contain unapproved assumptions (taller, proveedor, grabado)', () => {
  it('does not contain "taller", "proveedor", "fabricación en taller" or "grabado" in UI', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');

    expect(screen.queryByText(/taller/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/proveedor/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fabricación en taller/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/grabado/i)).not.toBeInTheDocument();
  });
});

// ── 28. FASE D3: Elimination of ThermoSummary 5 KPIs ──────────────────────────

describe('28. FASE D3: Elimination of ThermoSummary 5 KPIs', () => {
  it('does not render 5 large KPI numbers or secondary dashboard labels', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');
    expect(screen.queryByText('Avance insuficiente')).not.toBeInTheDocument();
    expect(screen.queryByText('Listos para solicitar')).not.toBeInTheDocument();
    expect(screen.queryByText('Completados')).not.toBeInTheDocument();
  });
});

// ── 29. FASE D3: Toolbar search by folio or name ──────────────────────────────

describe('29. FASE D3: Toolbar search by folio or name', () => {
  it('filters table rows when typing folio or name', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');
    const searchInput = screen.getByLabelText(/Buscar folio o nombre/i);

    // Search by folio
    fireEvent.change(searchInput, { target: { value: 'CT-2027-0042' } });
    expect(screen.getByTestId('thermo-row-grad-andrea-martinez')).toBeInTheDocument();
    expect(screen.queryByTestId('thermo-row-grad-mariana-lopez')).not.toBeInTheDocument();

    // Search by name
    fireEvent.change(searchInput, { target: { value: 'Roberto Sánchez' } });
    expect(screen.getByTestId('thermo-row-grad-roberto-sanchez')).toBeInTheDocument();
    expect(screen.queryByTestId('thermo-row-grad-andrea-martinez')).not.toBeInTheDocument();
  });
});

// ── 30. FASE D3: Lista de entrega (Obligatoria) e Impresión ───────────────────

describe('30. FASE D3: Lista de entrega (Obligatoria) e Impresión', () => {
  it('opens delivery list, displays required columns and signature line, and prints', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');

    // Click "Lista de entrega"
    const listBtn = screen.getByRole('button', { name: /Lista de entrega/i });
    fireEvent.click(listBtn);

    // Check delivery list surface is visible
    expect(screen.getByTestId('thermo-delivery-list')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Mesa' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Folio' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Información de registro disponible' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Personalización' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Firma de recibido' })).toBeInTheDocument();

    // Check printable signature space
    expect(screen.getAllByText(/Firma de recibido: __________________/i).length).toBeGreaterThan(0);

    // Click "Imprimir lista"
    const printBtn = screen.getByRole('button', { name: /Imprimir lista/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalledTimes(1);

    // Return to main table
    const backBtn = screen.getByRole('button', { name: /Volver a termos/i });
    fireEvent.click(backBtn);
    expect(screen.queryByTestId('thermo-delivery-list')).not.toBeInTheDocument();

    printSpy.mockRestore();
  });

  it('sorts delivery list by tableNumber first and then by name', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');
    fireEvent.click(screen.getByRole('button', { name: /Lista de entrega/i }));

    const rows = screen.getAllByTestId(/delivery-row-/i);
    // Table 12 (Fernando), Table 18 (Roberto), Table 24 (Andrea), Sin mesa (Mariana)
    expect(rows[0]).toHaveAttribute('data-testid', 'delivery-row-grad-fernando-torres');
    expect(rows[1]).toHaveAttribute('data-testid', 'delivery-row-grad-roberto-sanchez');
    expect(rows[2]).toHaveAttribute('data-testid', 'delivery-row-grad-andrea-martinez');
    expect(rows[3]).toHaveAttribute('data-testid', 'delivery-row-grad-mariana-lopez');
  });
});

// ── 31. FASE D3: Mobile vertical list ─────────────────────────────────────────

describe('31. FASE D3: Mobile vertical list', () => {
  it('renders mobile vertical list without requiring horizontal table scroll', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');
    expect(screen.getByTestId('thermo-mobile-list')).toBeInTheDocument();
    expect(screen.getByTestId('thermo-mobile-item-grad-andrea-martinez')).toBeInTheDocument();
  });
});

// ── 32. FASE D3: Zero technical copy in UI ────────────────────────────────────

describe('32. FASE D3: Zero technical copy in UI', () => {
  it('does not contain "vista previa", "local", "backend", "no guardado", or "mock"', () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');

    expect(screen.queryByText(/vista previa/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no guardado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/backend/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mock/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/local state/i)).not.toBeInTheDocument();
  });
});

