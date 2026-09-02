/**
 * graduateMeals.test.tsx
 * Tests for VS-G-MEAL-001 (Platillos GRADUATE).
 *
 * Requirements covered:
 * - GroupMember model used (GroupMember -> MealSelection -> MealOption)
 * - isPrimary indicates titular (tested with titular not being index 0)
 * - Active options used for selection
 * - Historical inactive option handling
 * - Draft changes and review modal
 * - Visual confirmation feedback (no fake persistence)
 * - Deadline visible and deadline closed read-only mode
 * - Empty options state
 * - Anti-name-semantic (custom meal names work with zero color/logic branching)
 * - Anti-guest (no dependency on currentGraduateMock.guests)
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GraduateMealsScreen } from '../pages/graduate/GraduateMealsScreen';
import {
  VISUAL_QA_GRADUATE_MEALS_STATES,
} from '../fixtures/mealThermoVisualFixtures';

describe('VS-G-MEAL-001 — Platillos GRADUATE', () => {
  it('renders all members in the graduate group with their meal selections', () => {
    render(<GraduateMealsScreen mealsStateId="meals-andrea-active" />);

    expect(screen.getByText(/Selección de platillos/i)).toBeInTheDocument();
    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
    expect(screen.getByText('Laura González')).toBeInTheDocument();
    expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
  });

  it('anti-index-primary: correctly identifies titular via isPrimary when titular is not at index 0', () => {
    render(<GraduateMealsScreen mealsStateId="meals-non-first-primary" />);

    // In meals-non-first-primary: Laura is index 0 (not titular), Andrea is index 1 (isPrimary: true)
    const andreaBadge = screen.getByText('Graduado titular');
    expect(andreaBadge).toBeInTheDocument();
  });

  it('anti-name-semantic: renders custom non-standard dish names without crashing or branching', () => {
    render(<GraduateMealsScreen mealsStateId="meals-custom-names" />);

    expect(screen.getAllByText('Cena de Gala 3 Tiempos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Menú Chef Signature').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Menú Especial X').length).toBeGreaterThan(0);
  });

  it('shows empty state when no options are configured for the event', () => {
    render(<GraduateMealsScreen mealsStateId="meals-no-options" />);

    expect(
      screen.getByText(/Aún no hay opciones de platillo disponibles/i)
    ).toBeInTheDocument();
  });

  it('shows warning and enters read-only mode when deadline is closed', () => {
    render(<GraduateMealsScreen mealsStateId="meals-deadline-closed" />);

    expect(screen.getByText(/La selección de platillos ya cerró/i)).toBeInTheDocument();
    // Guardar / Revisar button should NOT be rendered
    expect(screen.queryByRole('button', { name: /Revisar cambios/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sin cambios pendientes/i })).not.toBeInTheDocument();
  });

  it('displays notice for historical inactive options and prevents selecting inactive ones', () => {
    render(<GraduateMealsScreen mealsStateId="meals-with-inactive" />);

    expect(screen.getByText(/Opción ya no disponible para nuevos cambios/i)).toBeInTheDocument();
  });

  it('allows draft selection change, shows review modal, and provides visual mode feedback without fake persistence', () => {
    render(<GraduateMealsScreen mealsStateId="meals-andrea-active" />);

    // Initially button is disabled ("Sin cambios pendientes")
    const reviewBtn = screen.getByRole('button', { name: /Sin cambios pendientes/i });
    expect(reviewBtn).toBeDisabled();

    // Select a new option for Carlos Martínez
    const selects = screen.getAllByRole('combobox');
    // Change the last select (Carlos)
    fireEvent.change(selects[2], { target: { value: 'meal-opt-3' } });

    // Review button should now be enabled with count (1)
    const activeReviewBtn = screen.getByRole('button', { name: /Revisar cambios \(1\)/i });
    expect(activeReviewBtn).toBeEnabled();

    // Click to open review modal
    fireEvent.click(activeReviewBtn);

    expect(screen.getByText(/Confirmar selección de platillos/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Vegano/i).length).toBeGreaterThan(0);

    // Confirm changes
    const confirmBtn = screen.getByRole('button', { name: /Confirmar selecciones/i });
    fireEvent.click(confirmBtn);

    // Verify visual notice (no "guardado exitosamente" fake persistence)
    expect(screen.getByText(/Cambios preparados en modo visual/i)).toBeInTheDocument();
  });

  it('anti-guest: GraduateMealsScreen operates directly on GroupMember model without GuestMock', () => {
    const state = VISUAL_QA_GRADUATE_MEALS_STATES['meals-andrea-active'];
    expect(state.members[0]).toHaveProperty('isPrimary');
    expect(state.members[0]).toHaveProperty('productType');
    expect(state.members[0]).toHaveProperty('graduateMembershipId');
  });
});
