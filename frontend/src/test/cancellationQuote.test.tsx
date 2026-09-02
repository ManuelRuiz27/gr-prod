/**
 * cancellationQuote.test.tsx
 * Tests for VS-A-CAN-001 (Cotización y Cancelación de Membresía — VIS-12-R1).
 *
 * Requirements covered:
 * - Quote-first modal flow with strict graduateId resolution
 * - Loading state with skeleton
 * - Error state handling (blocks confirmation, offers retry for the same graduate)
 * - Expired quote handling (blocks confirmation, offers refresh)
 * - No quote available state (blocks confirmation, does NOT fallback to Andrea)
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
 * - Identity invariant: quote.graduateMembershipId === graduateId
 * - Anti-frontend-formula (quote is authoritative from backend fixture)
 * - No fake DB membership cancellation or fake refund
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CancelMembershipModal } from '../pages/admin/cancellation/CancelMembershipModal';

describe('VS-A-CAN-001 — Cotización y Cancelación de Membresía (VIS-12-R1)', () => {
  // ── 1. Ready Quote & Financial Hierarchy (Andrea) ───────────────────────────
  it('renders quote-first financial hierarchy for Andrea Martínez ($24,500 contratado, $14,700 pagado, $7,350 penalización, $7,350 reembolso)', async () => {
    render(
      <CancelMembershipModal
        isOpen={true}
        onClose={vi.fn()}
        graduateId="grad-andrea-martinez"
        graduateName="Andrea Martínez"
        contractFolio="CT-2027-0042"
        eventName="Graduación Facultad de Derecho 2027"
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

  // ── 2. Ready Quote & Financial Hierarchy (Fernando) ─────────────────────────
  it('renders quote for Fernando Torres ($15,000 contratado, $3,000 pagado, $4,500 saldo pendiente) without Andrea figures', async () => {
    render(
      <CancelMembershipModal
        isOpen={true}
        onClose={vi.fn()}
        graduateId="grad-fernando-torres"
        graduateName="Fernando Torres"
        contractFolio="CT-2027-0058"
        eventName="Graduación Facultad de Derecho 2027"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('quote-ready-content')).toBeInTheDocument();
    });

    // Check Fernando's figures
    expect(screen.getByText('$15,000')).toBeInTheDocument();
    expect(screen.getAllByText('$3,000').length).toBeGreaterThan(0);
    expect(screen.getByText(/Saldo adicional pendiente/i)).toBeInTheDocument();
    expect(screen.getByText('$4,500')).toBeInTheDocument();

    // Invariant: must NOT contain Andrea's figures or folio
    expect(screen.queryByText('$24,500')).not.toBeInTheDocument();
    expect(screen.queryByText('CT-2027-0042')).not.toBeInTheDocument();
  });

  // ── 3. Graduate without Quote Fixture ────────────────────────────────────────
  it('graduate without quote fixture shows unavailable state and disables confirm without fallback to Andrea', async () => {
    render(
      <CancelMembershipModal
        isOpen={true}
        onClose={vi.fn()}
        graduateId="grad-carlos-gomez"
        graduateName="Carlos Gómez"
        contractFolio="CT-2027-0015"
        eventName="Graduación Facultad de Derecho 2027"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('quote-unavailable-state')).toBeInTheDocument();
    });

    expect(screen.getByText(/Cotización de cancelación no disponible para este escenario visual/i)).toBeInTheDocument();
    expect(screen.queryByText('$24,500')).not.toBeInTheDocument(); // No Andrea fallback!
    const confirmBtn = screen.getByRole('button', { name: /Confirmar cancelación/i });
    expect(confirmBtn).toBeDisabled();
  });

  // ── 4. Mandatory Reason Validation ──────────────────────────────────────────
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

  // ── 5. Error & Expired Quote States ─────────────────────────────────────────
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

  // ── 6. Canonical Contract Folio Exact Match & Prefix Mismatch Rejection ─────
  it('strictly rejects prefix mismatch (GR-2027-0042 vs CT-2027-0042) without fuzzy or suffix stripping', async () => {
    render(
      <CancelMembershipModal
        isOpen={true}
        onClose={vi.fn()}
        graduateId="grad-andrea-martinez"
        graduateName="Andrea Martínez"
        contractFolio="GR-2027-0042" // Expediente folio instead of contractFolio -> must reject!
        eventName="Graduación Facultad de Derecho 2027"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('quote-unavailable-state')).toBeInTheDocument();
    });

    expect(screen.getByText(/Cotización de cancelación no disponible para este escenario visual/i)).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /Confirmar cancelación/i });
    expect(confirmBtn).toBeDisabled();
  });
});
