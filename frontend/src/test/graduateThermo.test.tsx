/**
 * graduateThermo.test.tsx
 * Tests for VS-G-TH-001 (Termo GRADUATE).
 *
 * Requirements covered:
 * - 5 presentation states: LOCKED, AVAILABLE, REQUESTED, IN_PRODUCTION, DELIVERED
 * - Critical authoritative status test: progress = 90, threshold = 70, status = LOCKED -> stays LOCKED
 * - Dynamic threshold: no hardcoded 70%
 * - Dynamic personalization fields: renders display_name vs custom_text
 * - Anti-fullName fallback: empty personalization stays empty in input
 * - Visual mode feedback without fake persistence
 * - Read-only for IN_PRODUCTION and DELIVERED
 * - Additional thermo summary when present
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GraduateThermoScreen } from '../pages/graduate/GraduateThermoScreen';

describe('VS-G-TH-001 — Termo GRADUATE', () => {
  it('renders LOCKED state with progress bar and CTA to payments', () => {
    render(<GraduateThermoScreen thermoStateId="thermo-locked-below-threshold" />);

    expect(screen.getAllByText(/Bloqueado/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Tu termo se encuentra bloqueado/i)).toBeInTheDocument();
    expect(screen.getByText(/40% de 60% requerido/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver mis pagos/i })).toBeInTheDocument();
  });

  it('CRITICAL TEST: Authoritative status — progress (90%) >= threshold (70%) with status=LOCKED must render LOCKED', () => {
    render(<GraduateThermoScreen thermoStateId="thermo-locked-inconsistent" />);

    // Must remain LOCKED because backend status is LOCKED
    expect(screen.getAllByText(/Bloqueado/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/¡Has alcanzado el requisito para tu termo!/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Personalizar y solicitar termo/i })).not.toBeInTheDocument();
  });

  it('renders dynamic thresholds for different events without hardcoding 70%', () => {
    // Event with 60%
    const { unmount } = render(<GraduateThermoScreen thermoStateId="thermo-threshold-60" />);
    expect(screen.getByText(/50% de 60% requerido/i)).toBeInTheDocument();
    unmount();

    // Event with 85%
    render(<GraduateThermoScreen thermoStateId="thermo-threshold-85" />);
    expect(screen.getByText(/70% de 85% requerido/i)).toBeInTheDocument();
  });

  it('renders AVAILABLE state with celebratory banner and empty personalization (anti-fullName fallback)', () => {
    render(<GraduateThermoScreen thermoStateId="thermo-available" />);

    expect(screen.getByText(/¡Has alcanzado el requisito para tu termo!/i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/Ej. Lic. Andrea Martínez/i) as HTMLInputElement;
    expect(input.value).toBe(''); // MUST be empty, NOT 'Andrea Martínez'
  });

  it('renders dynamic personalization fields (custom_text vs display_name)', () => {
    render(<GraduateThermoScreen thermoStateId="thermo-dynamic-field-b" />);

    expect(screen.getByText('Frase o dedicatoria')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ej. Generación 2027/i)).toBeInTheDocument();
  });

  it('allows filling personalization and submitting request with visual feedback without fake persistence', () => {
    render(<GraduateThermoScreen thermoStateId="thermo-available" />);

    const input = screen.getByPlaceholderText(/Ej. Lic. Andrea Martínez/i);
    fireEvent.change(input, { target: { value: 'Lic. Andrea M.' } });

    const submitBtn = screen.getByRole('button', { name: /Personalizar y solicitar termo/i });
    fireEvent.click(submitBtn);

    // Transitions to REQUESTED with visual notice
    expect(screen.getByText(/Solicitud preparada en modo visual/i)).toBeInTheDocument();
    expect(screen.getByText(/Lic. Andrea M./i)).toBeInTheDocument();
  });

  it('renders REQUESTED state in read-only mode', () => {
    render(<GraduateThermoScreen thermoStateId="thermo-requested" />);

    expect(screen.getAllByText(/Solicitado/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Lic. Mariana López M.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Personalizar y solicitar termo/i })).not.toBeInTheDocument();
  });

  it('renders IN_PRODUCTION state in read-only mode', () => {
    render(<GraduateThermoScreen thermoStateId="thermo-in-production" />);

    expect(screen.getAllByText(/En producción/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Gabriel Solís R.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Personalizar y solicitar termo/i })).not.toBeInTheDocument();
  });

  it('renders DELIVERED state in read-only mode with delivery voucher info', () => {
    render(<GraduateThermoScreen thermoStateId="thermo-delivered" />);

    expect(screen.getAllByText(/Entregado/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/12 de mayo de 2027/i)).toBeInTheDocument();
    expect(screen.getByText('Roberto Sánchez B.')).toBeInTheDocument();
  });

  it('renders additional thermo badge when configured in fixture', () => {
    render(<GraduateThermoScreen thermoStateId="thermo-with-additional" />);

    expect(screen.getByText(/1 termo adicional/i)).toBeInTheDocument();
  });
});
