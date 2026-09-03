import React, { useState, useMemo } from 'react';
import {
  Modal,
  Button,
  TextArea,
  Alert,
  Badge,
  Skeleton,
  Icon,
} from '../../../design-system';
import {
  type VisualCancellationQuote,
  getVisualQaCancellationQuote,
} from '../../../fixtures/cancellationReportsAuditVisualFixtures';
import { DemoFlowPanel } from '../../../demo/DemoFlowPanel';

export interface CancelMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  graduateId: string;
  graduateName: string;
  contractFolio?: string;
  eventName: string;
  quoteScenarioId?: string;
  onConfirmSuccess?: (feedback: string) => void;
}

const CancelMembershipModalContent: React.FC<CancelMembershipModalProps> = ({
  onClose,
  graduateId,
  graduateName,
  contractFolio,
  eventName,
  quoteScenarioId,
  onConfirmSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const initialQuote = useMemo(() => {
    return getVisualQaCancellationQuote(graduateId, contractFolio, quoteScenarioId);
  }, [graduateId, contractFolio, quoteScenarioId]);

  const [quoteState, setQuoteState] = useState<VisualCancellationQuote | null>(initialQuote);
  const [isLoading, setIsLoading] = useState(false);

  const handleRetryQuote = () => {
    setIsLoading(true);
    setTimeout(() => {
      setQuoteState(getVisualQaCancellationQuote(graduateId, contractFolio, quoteScenarioId));
      setIsLoading(false);
    }, 100);
  };

  // Invariant verification (strict literal exact match)
  const isValidQuote =
    Boolean(quoteState) &&
    quoteState?.status === 'READY' &&
    quoteState?.graduateMembershipId === graduateId &&
    (!contractFolio ||
      contractFolio === '—' ||
      !quoteState?.contractFolio ||
      quoteState?.contractFolio === contractFolio);

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError('El motivo de cancelación es obligatorio.');
      return;
    }

    if (!isValidQuote) {
      return;
    }

    onClose();
    if (onConfirmSuccess) {
      onConfirmSuccess(
        'La solicitud de cancelación de membresía quedará registrada al integrar backend.'
      );
    }
  };

  const displayFolio = contractFolio && contractFolio !== '—'
    ? contractFolio
    : quoteState?.contractFolio || '—';

  return (
    <div className="flex flex-col gap-5 font-sans text-xs">
      <DemoFlowPanel flow="cancellation" />
      {/* Context Information */}
      <div className="p-4 bg-obsidian-900 rounded-xl border border-silver-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-silver-400">
            Expediente a cancelar
          </span>
          <h4 className="text-sm font-bold text-silver-100">
            {graduateName}
          </h4>
          <p className="text-[11px] text-silver-400">
            Folio: <span className="font-mono text-gold-400 font-bold">{displayFolio}</span> • {eventName}
          </p>
        </div>
        <Badge variant="error" size="sm">
          Acción crítica
        </Badge>
      </div>

      {/* Informational intro */}
      <p className="text-silver-300 leading-relaxed">
        Antes de proceder con la cancelación, se calcula el impacto financiero aplicable según la política de cancelación vigente.
      </p>

      {/* Loading Quote State */}
      {isLoading && (
        <div className="space-y-3 p-4 bg-obsidian-900 rounded-xl border border-silver-800" data-testid="quote-loading-skeleton">
          <div className="flex items-center gap-2 text-silver-400">
            <Icon name="refresh" size={14} className="animate-spin text-gold-400" />
            <span className="font-semibold">Calculando cotización de cancelación...</span>
          </div>
          <Skeleton height={60} />
          <Skeleton height={80} />
        </div>
      )}

      {/* Error Quote State */}
      {!isLoading && quoteState?.status === 'ERROR' && (
        <div className="space-y-3" data-testid="quote-error-state">
          <Alert variant="error" title="Error al cotizar cancelación">
            No pudimos obtener la cotización de cancelación desde el servidor. La operación no puede confirmarse sin una cotización válida.
          </Alert>
          <div className="flex justify-start">
            <Button variant="secondary" size="sm" onClick={handleRetryQuote} iconStart="refresh">
              Reintentar cotización
            </Button>
          </div>
        </div>
      )}

      {/* Expired Quote State */}
      {!isLoading && quoteState?.status === 'EXPIRED' && (
        <div className="space-y-3" data-testid="quote-expired-state">
          <Alert variant="warning" title="Cotización vencida">
            La cotización ya no es válida porque su periodo de vigencia ha expirado. Solicita una nueva cotización para continuar.
          </Alert>
          <div className="flex justify-start">
            <Button variant="secondary" size="sm" onClick={handleRetryQuote} iconStart="refresh">
              Solicitar nueva cotización
            </Button>
          </div>
        </div>
      )}

      {/* Unavailable Quote State (Graduate without QA quote or invariant mismatch) */}
      {!isLoading && quoteState === null && (
        <div className="space-y-3" data-testid="quote-unavailable-state">
          <Alert variant="info" title="Cotización no disponible">
            Cotización de cancelación no disponible para este escenario visual.
          </Alert>
          <div className="flex justify-start">
            <Button variant="secondary" size="sm" onClick={handleRetryQuote} iconStart="refresh">
              Reintentar cotización
            </Button>
          </div>
        </div>
      )}

      {/* Ready Quote State — Financial Hierarchy */}
      {!isLoading && isValidQuote && quoteState && (
        <div className="space-y-4" data-testid="quote-ready-content">
          {/* Financial Bento Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800">
              <span className="text-[10px] uppercase font-bold text-silver-400 block">
                Total contratado
              </span>
              <span className="text-base font-bold text-silver-100 font-mono mt-0.5 block">
                ${quoteState.totalContracted.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800">
              <span className="text-[10px] uppercase font-bold text-silver-400 block">
                Total pagado
              </span>
              <span className="text-base font-bold text-silver-100 font-mono mt-0.5 block">
                ${quoteState.totalPaid.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800">
              <span className="text-[10px] uppercase font-bold text-silver-400 block">
                Días antes del evento
              </span>
              <span className="text-base font-bold text-gold-400 font-mono mt-0.5 block">
                {quoteState.daysBeforeEvent} días
              </span>
            </div>

            <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800">
              <span className="text-[10px] uppercase font-bold text-silver-400 block">
                Penalización ({quoteState.penaltyPercent}%)
              </span>
              <span className="text-base font-bold text-status-warning font-mono mt-0.5 block">
                ${quoteState.penaltyAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Applied Policy Details */}
          <div className="p-3.5 bg-obsidian-900/90 rounded-xl border border-silver-800 text-xs text-silver-300 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-silver-200">
                Política aplicada: Versión {quoteState.policyVersion} ({quoteState.policyStatus})
              </span>
              <Badge variant="neutral" size="sm">
                {quoteState.appliedRangeLabel}
              </Badge>
            </div>
            <div className="text-[11px] text-silver-400 flex justify-between pt-1">
              <span>Monto retenido según pagos realizados:</span>
              <span className="font-mono font-bold text-silver-200">
                ${quoteState.retainedAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Refund Due / Remaining Due Banner */}
          {quoteState.refundDue > 0 ? (
            <div className="p-4 bg-obsidian-900 rounded-xl border border-silver-700/80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-silver-200 uppercase tracking-wider">
                  Reembolso estimado / pendiente
                </span>
                <span className="text-lg font-bold text-silver-50 font-mono">
                  ${quoteState.refundDue.toLocaleString()}
                </span>
              </div>
              <Alert variant="info">
                El reembolso se procesa mediante un movimiento independiente después de la cancelación.
              </Alert>
            </div>
          ) : quoteState.remainingDue > 0 ? (
            <div className="p-4 bg-status-warning/10 rounded-xl border border-status-warning/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-status-warning uppercase tracking-wider">
                  Saldo adicional pendiente
                </span>
                <span className="text-lg font-bold text-status-warning font-mono">
                  ${quoteState.remainingDue.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-silver-300">
                El monto pagado es menor a la penalización aplicable. El saldo remanente permanece como adeudo pendiente.
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-obsidian-900 rounded-xl border border-silver-800 text-xs text-silver-300 flex justify-between items-center">
              <span>Sin saldo remanente ni reembolso aplicable.</span>
              <span className="font-bold text-silver-100">$0</span>
            </div>
          )}

          {/* Released Operational Capacity Summary */}
          {quoteState.releasedPlacesSummary && (
            <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800/80 text-xs text-silver-400 flex items-center justify-between">
              <span>Capacidad operativa a liberar:</span>
              <span className="text-silver-200 font-medium">
                {quoteState.releasedPlacesSummary.totalPlaces} lugares • {quoteState.releasedPlacesSummary.assignedTables.join(', ')}
              </span>
            </div>
          )}

          {/* Quote Metadata */}
          <div className="text-[10px] text-silver-500 flex flex-wrap justify-between gap-2 px-1">
            <span>Folio de cotización: {quoteState.id}</span>
            <span>Calculada: {quoteState.calculatedAt}</span>
            <span>Vigencia hasta: {quoteState.expiresAt}</span>
          </div>
        </div>
      )}

      {/* Reason for Cancellation (Mandatory) */}
      <div className="space-y-1.5 pt-2 border-t border-silver-800">
        <TextArea
          id="cancellationReasonInput"
          label="Motivo de cancelación (obligatorio)"
          placeholder="Ingresa el motivo documentado de la cancelación..."
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (reasonError) setReasonError('');
          }}
          error={reasonError}
          required
          rows={3}
        />
      </div>

      {/* Actions Toolbar */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cerrar
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={
            isLoading ||
            !isValidQuote ||
            reason.trim().length === 0
          }
          onClick={handleConfirm}
        >
          Confirmar cancelación
        </Button>
      </div>
    </div>
  );
};

export const CancelMembershipModal: React.FC<CancelMembershipModalProps> = (props) => {
  if (!props.isOpen) return null;

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Cancelar membresía del graduado"
      size="lg"
    >
      <CancelMembershipModalContent
        key={`${props.quoteScenarioId || 'default'}-${props.graduateId}`}
        {...props}
      />
    </Modal>
  );
};
