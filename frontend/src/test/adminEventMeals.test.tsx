/**
 * adminEventMeals.test.tsx
 * FRONTEND-05 — GR-07-08 — Platillos ADMIN
 *
 * Validates all 13 normative requirements from the ticket.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventMealsScreen } from '../pages/admin/AdminEventMealsScreen';
import { EditMealSelectionModal } from '../pages/admin/meals/EditMealSelectionModal';
import { GraduateMealDetail } from '../pages/admin/meals/GraduateMealDetail';
import { mockMealOptions } from '../fixtures/layoutFixtures';
import { mockGraduatesList, type GraduateMock } from '../fixtures/graduateFixtures';
import {
  buildMealOptionCounts,
  buildGraduateMealViewModels,
  deriveGraduateCaptureStatus,
  totalKnownSelections,
} from '../pages/admin/meals/mealViewModel';

// ── Render helpers ─────────────────────────────────────────────────────────────

function renderMealsScreen(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/events/:eventId/meals" element={<AdminEventMealsScreen />} />
        <Route path="/admin/meals" element={<AdminEventMealsScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

// ── 1. Event isolation ─────────────────────────────────────────────────────────

describe('1. /admin/events/:eventId/meals — strict event isolation', () => {
  it('renders event-specific content for evt-derecho-2027', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.getByRole('heading', { level: 1, name: /Platillos/i })).toBeInTheDocument();
  });

  it('shows "Selecciona un evento" when no eventId is in path', () => {
    renderMealsScreen('/admin/meals');
    expect(screen.getAllByText(/Selecciona un evento/i).length).toBeGreaterThan(0);
  });
});

// ── 2. No fallback to evt-derecho-2027 ────────────────────────────────────────

describe('2. No automatic fallback to evt-derecho-2027', () => {
  it('does NOT silently fall back to evt-derecho-2027 when eventId is missing', () => {
    renderMealsScreen('/admin/meals');
    // Must show "Selecciona un evento", not the main meal UI
    expect(screen.getAllByText(/Selecciona un evento/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { level: 1, name: /Platillos/i })).not.toBeInTheDocument();
  });
});

// ── 3. Non-existent event shows EmptyState ────────────────────────────────────

describe('3. Non-existent event shows EmptyState', () => {
  it('shows "Evento no encontrado" for an unknown eventId', () => {
    renderMealsScreen('/admin/events/evt-no-existe-xyz/meals');
    expect(screen.getAllByText(/Evento no encontrado/i).length).toBeGreaterThan(0);
  });
});

// ── 4. Hardcodes 68, 12, 8 are gone ──────────────────────────────────────────

describe('4. Hardcoded raciones (68, 12, 8) do not appear', () => {
  it('does not render "68 raciones" or "68 Platillos"', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.queryByText(/68\s*raciones/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/68\s*Platillos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^68$/)).not.toBeInTheDocument();
  });

  it('does not render "12 raciones" or "12 Platillos"', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.queryByText(/12\s*raciones/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/12\s*Platillos/i)).not.toBeInTheDocument();
  });

  it('does not render "8 raciones" or "8 Platillos"', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.queryByText(/8\s*raciones/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/8\s*Platillos/i)).not.toBeInTheDocument();
  });
});

// ── 5. Totals derived from existing fixtures only ─────────────────────────────

describe('5. Meal totals derived from existing fixture data', () => {
  it('counts Tradicional selections from existing fixture guests', () => {
    const eventOptions = mockMealOptions.filter((m) => m.eventId === 'evt-derecho-2027');
    const counts = buildMealOptionCounts(mockGraduatesList, eventOptions, 'evt-derecho-2027');
    const tradicional = counts.find((c) => c.option.name === 'Tradicional');
    expect(tradicional).toBeDefined();
    // From fixtures: Andrea(5 Tradicional) + Fernando(1 Tradicional) + Roberto(1 Tradicional) = 7
    expect(tradicional!.count).toBe(7);
  });

  it('counts Vegetariano selections from existing fixture guests', () => {
    const eventOptions = mockMealOptions.filter((m) => m.eventId === 'evt-derecho-2027');
    const counts = buildMealOptionCounts(mockGraduatesList, eventOptions, 'evt-derecho-2027');
    const vegetariano = counts.find((c) => c.option.name === 'Vegetariano');
    expect(vegetariano).toBeDefined();
    // From fixtures: Andrea(1 Vegetariano) + Mariana(1 Vegetariano) = 2
    expect(vegetariano!.count).toBe(2);
  });

  it('counts Vegano selections from existing fixture guests', () => {
    const eventOptions = mockMealOptions.filter((m) => m.eventId === 'evt-derecho-2027');
    const counts = buildMealOptionCounts(mockGraduatesList, eventOptions, 'evt-derecho-2027');
    const vegano = counts.find((c) => c.option.name === 'Vegano');
    expect(vegano).toBeDefined();
    // From fixtures: Andrea(2 Vegano) = 2
    expect(vegano!.count).toBe(2);
  });

  it('totalKnownSelections equals sum of all counts', () => {
    const eventOptions = mockMealOptions.filter((m) => m.eventId === 'evt-derecho-2027');
    const counts = buildMealOptionCounts(mockGraduatesList, eventOptions, 'evt-derecho-2027');
    const total = totalKnownSelections(counts);
    const manualSum = counts.reduce((acc, c) => acc + c.count, 0);
    expect(total).toBe(manualSum);
  });
});

// ── 6. No invented guests when ticketCount > guests.length ────────────────────

describe('6. No invented guests beyond known fixture guests', () => {
  it('Fernando Torres shows only 1 known guest despite ticketCount=10', () => {
    const vms = buildGraduateMealViewModels(mockGraduatesList, 'evt-derecho-2027');
    const fernando = vms.find((g) => g.fullName === 'Fernando Torres');
    expect(fernando).toBeDefined();
    // ticketCount = 10, but guests = 1
    expect(fernando!.ticketCount).toBe(10);
    expect(fernando!.knownGuests).toHaveLength(1);
  });

  it('Roberto Sánchez shows only 1 known guest despite ticketCount=8', () => {
    const vms = buildGraduateMealViewModels(mockGraduatesList, 'evt-derecho-2027');
    const roberto = vms.find((g) => g.fullName === 'Roberto Sánchez');
    expect(roberto).toBeDefined();
    expect(roberto!.ticketCount).toBe(8);
    expect(roberto!.knownGuests).toHaveLength(1);
  });
});

// ── 7. Andrea Martínez detail uses only her fixture guests ────────────────────

describe('7. Andrea Martínez detail uses only fixture guests/selections', () => {
  it('Andrea has exactly 8 known guests matching fixtures', () => {
    const vms = buildGraduateMealViewModels(mockGraduatesList, 'evt-derecho-2027');
    const andrea = vms.find((g) => g.fullName === 'Andrea Martínez');
    expect(andrea).toBeDefined();
    expect(andrea!.knownGuests).toHaveLength(8);
    // Verify specific names
    const names = andrea!.knownGuests.map((g) => g.name);
    expect(names).toContain('Andrea Martínez');
    expect(names).toContain('Carlos Martínez');
    expect(names).toContain('Elena Martínez');
    expect(names).toContain('Luis Martínez');
    expect(names).toContain('Sofía Ramírez');
    expect(names).toContain('Diego Ramírez');
    expect(names).toContain('Paula Hernández');
    expect(names).toContain('Mateo Hernández');
  });

  it('Andrea guest meals match exactly the fixture values', () => {
    const vms = buildGraduateMealViewModels(mockGraduatesList, 'evt-derecho-2027');
    const andrea = vms.find((g) => g.fullName === 'Andrea Martínez')!;
    const carlosMeal = andrea.knownGuests.find((g) => g.name === 'Carlos Martínez');
    expect(carlosMeal?.mealName).toBe('Vegano');
    const andreaMeal = andrea.knownGuests.find((g) => g.name === 'Andrea Martínez');
    expect(andreaMeal?.mealName).toBe('Tradicional');
  });
});

// ── 8. Meal options come from event catalogue ─────────────────────────────────

describe('8. Meal options come from event catalogue (not hardcoded strings)', () => {
  it('mockMealOptions contains only options for evt-derecho-2027', () => {
    const eventOptions = mockMealOptions.filter((m) => m.eventId === 'evt-derecho-2027');
    expect(eventOptions.length).toBeGreaterThan(0);
    // All have the correct eventId
    expect(eventOptions.every((o) => o.eventId === 'evt-derecho-2027')).toBe(true);
  });

  it('options visible in screen match the event catalogue names', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    const eventOptions = mockMealOptions.filter((m) => m.eventId === 'evt-derecho-2027');
    eventOptions.forEach((opt) => {
      // Each option name should appear at least once (in summary cards)
      expect(screen.getAllByText(opt.name).length).toBeGreaterThan(0);
    });
  });
});

// ── 9. Event change clears previous event state ───────────────────────────────

describe('9. Changing eventId resets view-model state', () => {
  it('different eventId produces an independent view-model', () => {
    const vm1 = buildGraduateMealViewModels(mockGraduatesList, 'evt-derecho-2027');
    const vm2 = buildGraduateMealViewModels(mockGraduatesList, 'evt-medicina-9999');
    // evt-medicina-9999 has no fixtures -> empty
    expect(vm2).toHaveLength(0);
    // evt-derecho-2027 has fixtures
    expect(vm1.length).toBeGreaterThan(0);
  });
});

// ── 10. Admin meal modification directly from table without technical labels ──

describe('10. Admin meal modification directly from table without technical labels', () => {
  it('clicking "Modificar" on a person opens modal with tactile options and saves without technical copy', async () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');

    // Click "Modificar" directly on a person row
    const modifyBtns = screen.getAllByRole('button', { name: /Modificar/i });
    expect(modifyBtns.length).toBeGreaterThan(0);
    fireEvent.click(modifyBtns[0]);

    // Modal title must be "Modificar platillo"
    expect(screen.getByText('Modificar platillo')).toBeInTheDocument();

    // Must NOT contain technical jargon
    expect(screen.queryByText(/Vista previa local/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/backend/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mock/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/override/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/local state/i)).not.toBeInTheDocument();

    // Primary save button should say "Guardar selección"
    const saveBtn = screen.getByRole('button', { name: /Guardar selección/i });
    expect(saveBtn).toBeInTheDocument();

    // Save selection
    fireEvent.click(saveBtn);

    // Modal closes and no technical notices
    expect(screen.queryByText('Modificar platillo')).not.toBeInTheDocument();
    expect(screen.queryByText(/Override local/i)).not.toBeInTheDocument();
  });
});

// ── 11. Real component test for EditMealSelectionModal (post-deadline override) ─

describe('11. EditMealSelectionModal — real component post-deadline validation', () => {
  it('blocks save when isAfterDeadline=true and reason is empty, then allows on valid reason', () => {
    const onPreviewSave = vi.fn();
    const onClose = vi.fn();
    const knownGuests = [
      { id: 'gst-1', name: 'Carlos Martínez', mealName: 'Vegano' },
    ];
    const mealOptions = [
      { id: 'opt-1', eventId: 'evt-derecho-2027', name: 'Tradicional' },
      { id: 'opt-2', eventId: 'evt-derecho-2027', name: 'Vegano' },
    ];

    render(
      <EditMealSelectionModal
        isOpen={true}
        onClose={onClose}
        graduateId="grad-andrea"
        graduateName="Andrea Martínez"
        knownGuests={knownGuests}
        mealOptions={mealOptions}
        isAfterDeadline={true}
        onPreviewSave={onPreviewSave}
      />
    );

    // Modal is open with deadline banner
    expect(screen.getByText(/Fecha límite vencida/i)).toBeInTheDocument();

    // Confirm button clicked with empty reason
    const confirmBtn = screen.getByRole('button', { name: /Guardar selección/i });
    fireEvent.click(confirmBtn);

    // Must show error message
    expect(
      screen.getByText(/El motivo del cambio es obligatorio cuando la fecha límite ya venció/i)
    ).toBeInTheDocument();
    // onPreviewSave must NOT be executed
    expect(onPreviewSave).not.toHaveBeenCalled();

    // Fill valid reason
    const reasonInput = screen.getByLabelText(/Motivo del cambio/i);
    fireEvent.change(reasonInput, { target: { value: 'Alergia severa sobrevenida' } });

    // Confirm again
    fireEvent.click(confirmBtn);

    // onPreviewSave must now be called with payload
    expect(onPreviewSave).toHaveBeenCalledTimes(1);
    expect(onPreviewSave).toHaveBeenCalledWith({
      guestId: 'gst-1',
      guestName: 'Carlos Martínez',
      graduateId: 'grad-andrea',
      newMealOptionId: 'opt-1',
      newMealName: 'Tradicional',
      overrideReason: 'Alergia severa sobrevenida',
      isLocalPreview: true,
    });
  });
});

// ── 12. Capture status does NOT compare guests.length against ticketCount ──────

describe('12. Capture status derives only from known guest data without ticketCount comparison', () => {
  it('returns "Con información" for graduates with known guests regardless of ticketCount', () => {
    const andrea = mockGraduatesList.find((g) => g.id === 'grad-andrea-martinez')!;
    const fernando = mockGraduatesList.find((g) => g.id === 'grad-fernando-torres')!;
    const roberto = mockGraduatesList.find((g) => g.id === 'grad-roberto-sanchez')!;

    // Andrea has 8 guests, ticketCount 8 -> "Con información"
    expect(deriveGraduateCaptureStatus(andrea)).toBe('Con información');
    // Fernando has 1 guest, ticketCount 10 -> must still be "Con información", not "Parcial"
    expect(deriveGraduateCaptureStatus(fernando)).toBe('Con información');
    // Roberto has 1 guest, ticketCount 8 -> must still be "Con información", not "Parcial"
    expect(deriveGraduateCaptureStatus(roberto)).toBe('Con información');
  });

  it('returns "Sin información" when a graduate has no known guests', () => {
    const emptyGrad: GraduateMock = {
      id: 'grad-empty',
      eventId: 'evt-derecho-2027',
      fullName: 'Graduado Sin Integrantes',
      email: 'empty@ejemplo.com',
      career: 'Derecho',
      generation: '2027',
      ticketCount: 10,
      tableNumber: null,
      thermoStatus: 'LOCKED',
      thermoThreshold: 70,
      guests: [],
    };
    expect(deriveGraduateCaptureStatus(emptyGrad)).toBe('Sin información');
  });
});

// ── 13. UI does not show "X de Y lugares" ──────────────────────────────────────

describe('13. UI does not display "X de Y lugares" as member/selection coverage', () => {
  it('shows person-centric rows without comparing against ticketCount', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    // Check that pattern like "1 de 10 lugares" or "de 10 lugares" is NOT in the UI
    expect(screen.queryByText(/de\s+\d+\s+lugares/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+\s+de\s+\d+\s+lugares/i)).not.toBeInTheDocument();
    // Must display person names directly
    expect(screen.getAllByText('Andrea Martínez').length).toBeGreaterThan(0);
  });
});

// ── 14. UI does not calculate ticketCount - guests.length ─────────────────────

describe('14. UI in detail view does not calculate missing places', () => {
  it('shows neutral gap note without calculating missing guests (ticketCount - guests.length)', () => {
    const vms = buildGraduateMealViewModels(mockGraduatesList, 'evt-derecho-2027');
    const fernando = vms.find((g) => g.fullName === 'Fernando Torres')!;

    render(
      <GraduateMealDetail
        graduate={fernando}
        mealOptions={mockMealOptions.filter((o) => o.eventId === 'evt-derecho-2027')}
        isAfterDeadline={false}
        onClose={() => {}}
      />
    );

    // Fernando has 1 guest and 10 tickets
    expect(
      screen.getByText('No hay información nominal adicional disponible.')
    ).toBeInTheDocument();

    // Must NOT compute "9 lugares sin datos" or "9 lugar(es)"
    expect(screen.queryByText(/9\s*lugar/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/faltan/i)).not.toBeInTheDocument();
  });
});

// ── 15. Elimination of MealSummary KPI strip and technical terms ───────────────

describe('15. Elimination of MealSummary KPI strip and technical terms', () => {
  it('does not render KPI strip with big numbers, "— Sin dato consolidado", or "fixtures"', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.queryByText(/fixture/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/— Sin dato consolidado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Información nominal disponible/i)).not.toBeInTheDocument();
  });
});

// ── 16. Filter chips are derived dynamically from real event options ──────────

describe('16. Filter chips are derived dynamically from real event options', () => {
  it('shows dynamic filter chips for real options and does not show "Opción de platillo activa"', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.queryByText('Opción de platillo activa')).not.toBeInTheDocument();
    // Check dynamic chips in toolbar
    expect(screen.getByRole('button', { name: /Todos \(\d+\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pendientes \(\d+\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tradicional \(\d+\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vegetariano \(\d+\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vegano \(\d+\)/i })).toBeInTheDocument();
  });
});

// ── 17. UI does not label members as Graduado/Acompañante by index ─────────────

describe('17. UI does not infer roles as Graduado/Acompañante by array index', () => {
  it('labels known guests with neutral "Integrante"', () => {
    const vms = buildGraduateMealViewModels(mockGraduatesList, 'evt-derecho-2027');
    const andrea = vms.find((g) => g.fullName === 'Andrea Martínez')!;

    render(
      <GraduateMealDetail
        graduate={andrea}
        mealOptions={mockMealOptions.filter((o) => o.eventId === 'evt-derecho-2027')}
        isAfterDeadline={false}
        onClose={() => {}}
      />
    );

    // Role subtitles should be "Integrante"
    const integranteLabels = screen.getAllByText('Integrante');
    expect(integranteLabels.length).toBe(8);

    // Should NOT have inferred "Acompañante"
    expect(screen.queryByText('Acompañante')).not.toBeInTheDocument();
  });
});

// ── 18. No invented deadline date appears in UI ───────────────────────────────

describe('18. No invented deadline date appears', () => {
  it('the meals screen does not display any invented date for the deadline', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.queryByText(/31 de marzo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/15 de junio/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Fecha límite vencida/i)).not.toBeInTheDocument();
  });
});

// ── 19. No technical enum names exposed to user ───────────────────────────────

describe('19. No technical enum or model names exposed in UI', () => {
  it('does not show "MealOption" in the UI', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.queryByText('MealOption')).not.toBeInTheDocument();
  });

  it('does not show "MealSelection" in the UI', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.queryByText('MealSelection')).not.toBeInTheDocument();
  });

  it('does not show "GroupMember" in the UI', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.queryByText('GroupMember')).not.toBeInTheDocument();
  });

  it('does not show "is_active" in the UI', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.queryByText('is_active')).not.toBeInTheDocument();
  });

  it('does not show "override_reason" in the UI', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.queryByText('override_reason')).not.toBeInTheDocument();
  });

  it('does not show "GraduateMembership" in the UI', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.queryByText('GraduateMembership')).not.toBeInTheDocument();
  });
});

// ── 20. FASE D2: Person-centric dense table and mobile vertical list ──────────

describe('20. FASE D2: Person-centric dense table and mobile vertical list', () => {
  it('renders desktop table with columns Persona, Folio, Platillo, Acciones', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    expect(screen.getByRole('columnheader', { name: 'Persona' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Folio' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Platillo' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument();
  });

  it('renders persons as individual rows rather than graduate blocks', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    // Multiple persons under Andrea Martinez's membership are shown as separate rows
    expect(screen.getAllByText('Andrea Martínez').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Carlos Martínez').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Elena Martínez').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Fernando Torres').length).toBeGreaterThan(0);
  });
});

// ── 21. FASE D2: Toolbar search by person name and contract folio ─────────────

describe('21. FASE D2: Toolbar search by person name and contract folio', () => {
  it('filters persons when typing a person name', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    const searchInput = screen.getByLabelText(/Buscar nombre o folio/i);

    fireEvent.change(searchInput, { target: { value: 'Sofía Ramírez' } });

    expect(screen.getAllByText('Sofía Ramírez').length).toBeGreaterThan(0);
    expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();
    expect(screen.queryByText('Roberto Sánchez')).not.toBeInTheDocument();
  });

  it('filters persons when typing a contract folio', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    const searchInput = screen.getByLabelText(/Buscar nombre o folio/i);

    fireEvent.change(searchInput, { target: { value: 'CT-2027-0089' } });

    expect(screen.getAllByText('Fernando Torres').length).toBeGreaterThan(0);
    expect(screen.queryByText('Carlos Martínez')).not.toBeInTheDocument();
    expect(screen.queryByText('Mariana López')).not.toBeInTheDocument();
  });

  it('shows empty message when search yields no matches', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');
    const searchInput = screen.getByLabelText(/Buscar nombre o folio/i);

    fireEvent.change(searchInput, { target: { value: 'Inexistente ZZZ' } });

    expect(
      screen.getByText('No se encontraron personas con los filtros aplicados.')
    ).toBeInTheDocument();
  });
});

// ── 22. FASE D2: Dynamic filter chips (Todos, Pendientes, real options) ───────

describe('22. FASE D2: Dynamic filter chips', () => {
  it('clicking option chip filters table to only persons with that selection', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');

    // Click Vegetariano chip
    const vegChip = screen.getByRole('button', { name: /Vegetariano/i });
    fireEvent.click(vegChip);

    // Should display Vegetariano persons (Sofía Ramírez, Mariana López)
    expect(screen.getAllByText('Sofía Ramírez').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mariana López').length).toBeGreaterThan(0);

    // Should NOT display Tradicional persons
    expect(screen.queryByText('Fernando Torres')).not.toBeInTheDocument();
    expect(screen.queryByText('Roberto Sánchez')).not.toBeInTheDocument();
  });

  it('clicking Pendientes filters to only persons with no meal assigned', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');

    const pendingChip = screen.getByRole('button', { name: /Pendientes/i });
    fireEvent.click(pendingChip);

    // In fixtures, all 11 persons have meals, so empty message is expected
    expect(
      screen.getByText('No se encontraron personas con los filtros aplicados.')
    ).toBeInTheDocument();
  });
});

// ── 23. FASE D2: Direct modification updates UI immediately without technical jargon

describe('23. FASE D2: Direct modification updates UI immediately', () => {
  it('modifying a person updates their meal, status, and filter chips immediately', () => {
    renderMealsScreen('/admin/events/evt-derecho-2027/meals');

    // Find Fernando Torres' modify button
    // Fernando currently has Tradicional
    const modifyBtns = screen.getAllByRole('button', { name: /Modificar/i });
    expect(modifyBtns.length).toBeGreaterThan(0);

    // Click first modify button (for Andrea Martínez)
    fireEvent.click(modifyBtns[0]);

    // Check modal opens with tactile options
    expect(screen.getByRole('radiogroup', { name: /Opciones de platillo/i })).toBeInTheDocument();

    // Select Vegano
    const veganOption = screen.getByRole('radio', { name: /Vegano/i });
    fireEvent.click(veganOption);

    // Save
    const saveBtn = screen.getByRole('button', { name: /Guardar selección/i });
    fireEvent.click(saveBtn);

    // Modal closed
    expect(screen.queryByText('Modificar platillo')).not.toBeInTheDocument();

    // Vegano count increased from 2 to 3
    expect(screen.getByRole('button', { name: /Vegano \(3\)/i })).toBeInTheDocument();
    // Tradicional count decreased from 7 to 6
    expect(screen.getByRole('button', { name: /Tradicional \(6\)/i })).toBeInTheDocument();

    // No technical jargon
    expect(screen.queryByText(/Override local/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/preview/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mock/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/backend/i)).not.toBeInTheDocument();
  });
});

// ── 24. FASE D2: Tactile buttons for <= 4 options vs select for > 4 options ────

describe('24. FASE D2: Tactile buttons for <= 4 options vs select for > 4 options', () => {
  it('renders radio button tiles when mealOptions <= 4', () => {
    const knownGuests = [{ id: 'gst-1', name: 'Carlos Martínez', mealName: 'Vegano' }];
    const fourOptions = [
      { id: 'opt-1', eventId: 'evt-1', name: 'Opción 1' },
      { id: 'opt-2', eventId: 'evt-1', name: 'Opción 2' },
      { id: 'opt-3', eventId: 'evt-1', name: 'Opción 3' },
      { id: 'opt-4', eventId: 'evt-1', name: 'Opción 4' },
    ];

    render(
      <EditMealSelectionModal
        isOpen={true}
        onClose={() => {}}
        graduateId="grad-1"
        graduateName="Graduado Uno"
        knownGuests={knownGuests}
        mealOptions={fourOptions}
        isAfterDeadline={false}
      />
    );

    expect(screen.getByRole('radiogroup', { name: /Opciones de platillo/i })).toBeInTheDocument();
    expect(screen.getAllByRole('radio').length).toBe(4);
  });

  it('renders clean select dropdown when mealOptions > 4', () => {
    const knownGuests = [{ id: 'gst-1', name: 'Carlos Martínez', mealName: 'Vegano' }];
    const fiveOptions = [
      { id: 'opt-1', eventId: 'evt-1', name: 'Opción 1' },
      { id: 'opt-2', eventId: 'evt-1', name: 'Opción 2' },
      { id: 'opt-3', eventId: 'evt-1', name: 'Opción 3' },
      { id: 'opt-4', eventId: 'evt-1', name: 'Opción 4' },
      { id: 'opt-5', eventId: 'evt-1', name: 'Opción 5' },
    ];

    render(
      <EditMealSelectionModal
        isOpen={true}
        onClose={() => {}}
        graduateId="grad-1"
        graduateName="Graduado Uno"
        knownGuests={knownGuests}
        mealOptions={fiveOptions}
        isAfterDeadline={false}
      />
    );

    expect(screen.queryByRole('radiogroup', { name: /Opciones de platillo/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Opción de platillo/i)).toBeInTheDocument();
  });
});

// ── 25. FASE D2: Deadline business rules ───────────────────────────────────────

describe('25. FASE D2: Deadline business rules', () => {
  it('allows modification without reason when isAfterDeadline=false', () => {
    const onSave = vi.fn();
    const knownGuests = [{ id: 'gst-1', name: 'Carlos Martínez', mealName: 'Vegano' }];
    const mealOptions = [{ id: 'opt-1', eventId: 'evt-1', name: 'Tradicional' }];

    render(
      <EditMealSelectionModal
        isOpen={true}
        onClose={() => {}}
        graduateId="grad-1"
        graduateName="Graduado Uno"
        knownGuests={knownGuests}
        mealOptions={mealOptions}
        isAfterDeadline={false}
        onSave={onSave}
      />
    );

    // Reason field is not required and has no deadline banner
    expect(screen.queryByText(/Fecha límite vencida/i)).not.toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /Guardar selección/i });
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
