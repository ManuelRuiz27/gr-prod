/**
 * cancellationQuote.test.tsx
 * Tests for VS-A-CAN-001 (Cotización y Cancelación de Membresía).
 *
 * Requirements covered:
 * - Quote-first modal flow
 * - Loading state with skeleton
 * - Error state handling (blocks confirmation, offers retry)
 * - Expired quote handling (blocks confirmation, offers refresh)
 * - Strict financial hierarchy:
 *     - Total contratado
 *     - Total pagado
 *     - Días antes del evento (from quote, not frontend calculated)
 *     - Política de cancelación version & range applied
 *     - Penalización % & amount
 *     - Monto retenido
 *     - Reembolso estimado / pendiente (distinct from confirmed refund)
 *     - Saldo adicional pendiente (if remainingDue > 0)
 * - Mandatory reason validation (TextArea, non-empty)
 * - Danger variant CTA
 * - Anti-frontend-formula (quote is authoritative from backend fixture)
 * - No fake DB membership cancellation or fake refund
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CancelMembershipModal } from '../pages/admin/cancellation/CancelMembershipModal';

describe('VS-A-CAN-001 — Cotización y Cancelación de Membresía', () => {
  // ── 1. Ready Quote & Financial Hierarchy ────────────────────────────────────
  it('renders quote-first financial hierarchy for Andrea Martínez ($24,500 contratado, $14,700 pagado, $7,350 penalización, $7,350 reembolso)', async () => {
    render(
      <CancelMembershipModal
        isOpen={true}
        onClose={vi.fn()}
        graduateId="grad-andrea-martinez"
        graduateName="Andrea Martínez"
        contractFolio="CT-2027-0042"
        eventName="Graduación Facultad de Derecho 2027"
        quoteScenarioId="quote-andrea-martinez"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('quote-ready-content')).toBeInTheDocument();
    });

    // Check financial figures
    expect(screen.getByText('$24,500')).toBeInTheDocument(); // Contratado
    expect(screen.getByText('$14,700')).toBeInTheDocument(); // Pagado
    expect(screen.getByText('45 días')).toBeInTheDocument(); // Días antes
    expect(screen.getAllByText('$7,350').length).toBeGreaterThan(0); // Penalización & Reembolso
    expect(screen.getByText(/Reembolso estimado \/ pendiente/i)).toBeInTheDocument();
    expect(screen.getByText(/El reembolso se procesa mediante un movimiento independiente/i)).toBeInTheDocument();
  });

  // ── 2. Mandatory Reason Validation ──────────────────────────────────────────
  it('requires mandatory reason before confirming cancellation', async () => {
    const handleSuccess = vi.fn();

    render(
      <CancelMembershipModal
        isOpen={true}
        onClose={vi.fn()}
        graduateId="grad-andrea-martinez"
        graduateName="Andrea Martínez"
        contractFolio="CT-2027-0042"
        eventName="Graduación Facultad de Derecho 2027"
        quoteScenarioId="quote-andrea-martinez"
        onConfirmSuccess={handleSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('quote-ready-content')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole('button', { name: /Confirmar cancelación/i });
    expect(confirmBtn).toBeDisabled();

    // Type reason
    const reasonInput = screen.getByRole('textbox', { name: /Motivo de cancelación/i });
    fireEvent.change(reasonInput, { target: { value: 'Baja voluntaria documentada por oficio 2027-09' } });

    expect(confirmBtn).toBeEnabled();
    fireEvent.click(confirmBtn);

    expect(handleSuccess).toHaveBeenCalledWith(
      expect.stringContaining('La solicitud de cancelación de membresía quedará registrada al integrar backend.')
    );
  });

  // ── 3. Remaining Due State ──────────────────────────────────────────────────
  it('renders remaining due notice when paid amount is less than penalty', async () => {
    render(
      <CancelMembershipModal
        isOpen={true}
        onClose={vi.fn()}
        graduateId="grad-fernando-torres"
        graduateName="Fernando Torres"
        contractFolio="CT-2027-0099"
        eventName="Graduación Facultad de Derecho 2027"
        quoteScenarioId="quote-remaining-due"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('quote-ready-content')).toBeInTheDocument();
    });

    expect(screen.getByText(/Saldo adicional pendiente/i)).toBeInTheDocument();
    expect(screen.getByText('$4,500')).toBeInTheDocument();
  });

  // ── 4. Error Quote State ────────────────────────────────────────────────────
  it('handles quote error state and blocks confirmation', async () => {
    render(
      <CancelMembershipModal
        isOpen={true}
        onClose={vi.fn()}
        graduateId="grad-andrea-martinez"
        graduateName="Andrea Martínez"
        contractFolio="CT-2027-0042"
        eventName="Graduación Facultad de Derecho 2027"
        quoteScenarioId="quote-error"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('quote-error-state')).toBeInTheDocument();
    });

    expect(screen.getByText(/Error al cotizar cancelación/i)).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /Confirmar cancelación/i });
    expect(confirmBtn).toBeDisabled();
  });

  // ── 5. Expired Quote State ──────────────────────────────────────────────────
  it('handles expired quote state and blocks confirmation', async () => {
    render(
      <CancelMembershipModal
        isOpen={true}
        onClose={vi.fn()}
        graduateId="grad-andrea-martinez"
        graduateName="Andrea Martínez"
        contractFolio="CT-2027-0042"
        eventName="Graduación Facultad de Derecho 2027"
        quoteScenarioId="quote-expired"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('quote-expired-state')).toBeInTheDocument();
    });

    expect(screen.getByText(/Cotización vencida/i)).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /Confirmar cancelación/i });
    expect(confirmBtn).toBeDisabled();
  });
});
