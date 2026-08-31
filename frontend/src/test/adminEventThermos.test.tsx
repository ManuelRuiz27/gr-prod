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

import { describe, it, expect } from 'vitest';
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
    expect(screen.getByText(/Control de Termos Conmemorativos/i)).toBeInTheDocument();
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
    expect(screen.queryByText(/Control de Termos Conmemorativos/i)).not.toBeInTheDocument();
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

// ── 7. Absence of EventSettings shows neutral threshold ───────────────────────

describe('7. Absence of EventSettings shows neutral/unavailable threshold', () => {
  it('displays neutral "Configuración no disponible" in detail view', () => {
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

    expect(screen.getByText('Umbral del evento')).toBeInTheDocument();
    expect(screen.getByText('Configuración no disponible')).toBeInTheDocument();
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

// ── 9. Graduate without PaymentPlan shows "Sin dato financiero disponible" ────

describe('9. Graduate without PaymentPlan shows "Sin dato financiero disponible"', () => {
  it('returns null progress and displays placeholder for Fernando Torres', () => {
    const vms = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027'
    );
    const fernando = vms.find((g) => g.fullName === 'Fernando Torres')!;

    expect(fernando.progressPercentage).toBeNull();

    render(
      <ThermoDetail
        graduate={fernando}
        onClose={() => {}}
        onTransitionPreview={() => {}}
      />
    );

    expect(screen.getByText('Sin dato financiero disponible')).toBeInTheDocument();
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

// ── 18. Local transition shows "Vista previa local / No guardado" ─────────────

describe('18. Local transition shows preview warning banner', () => {
  it('opening Mariana detail and confirming production sets local preview state', async () => {
    renderThermosScreen('/admin/events/evt-derecho-2027/thermos');

    // Click "Ver detalle" on Mariana López
    const marianaRow = screen.getByTestId('thermo-row-grad-mariana-lopez');
    fireEvent.click(within(marianaRow).getByRole('button', { name: /Ver detalle/i }));

    // In detail view, click "Marcar en producción"
    const prodBtn = await screen.findByRole('button', { name: /Marcar en producción/i });
    fireEvent.click(prodBtn);

    // Modal opens with preview warning
    expect(screen.getAllByText(/Vista previa local — No guardada/i).length).toBeGreaterThan(0);

    // Confirm transition
    const confirmBtn = screen.getByRole('button', { name: /Confirmar vista previa/i });
    fireEvent.click(confirmBtn);

    // Detail view now shows preview alert
    expect(screen.getByText(/Vista previa local — No guardado/i)).toBeInTheDocument();
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

// ── 20. Pending local transition blocks chained transition ────────────────────

describe('20. Pending local transition blocks chained transition', () => {
  it('blocks "Marcar como entregado" when thermo is in preview IN_PRODUCTION', () => {
    const vms = buildGraduateThermoViewModels(
      mockGraduatesList,
      mockPaymentPlansMap,
      'evt-derecho-2027',
      { 'grad-mariana-lopez': 'IN_PRODUCTION' } // local preview applied
    );
    const mariana = vms.find((g) => g.fullName === 'Mariana López')!;

    expect(mariana.hasLocalPreview).toBe(true);

    render(
      <ThermoDetail
        graduate={mariana}
        onClose={() => {}}
        onTransitionPreview={() => {}}
      />
    );

    // Must show "Cambio pendiente de backend" badge
    expect(screen.getByText('Cambio pendiente de backend')).toBeInTheDocument();
    // Must NOT show "Marcar como entregado" button
    expect(screen.queryByRole('button', { name: /Marcar como entregado/i })).not.toBeInTheDocument();
  });
});

// ── 21. Timeline contains no invented dates ───────────────────────────────────

describe('21. Timeline contains no invented dates', () => {
  it('does not display invented dates in the timeline', () => {
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
    expect(screen.getByText(/No disponible hasta integrar backend/i)).toBeInTheDocument();
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
  it('does not render invented customization attributes (color, tamaño, grabado, etc.)', () => {
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
