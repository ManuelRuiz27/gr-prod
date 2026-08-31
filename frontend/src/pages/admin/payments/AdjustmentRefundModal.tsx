import React, { useState } from 'react';
import {
  Modal,
  Button,
  Input,
  Select,
  TextArea,
  Icon,
} from '../../../design-system';

export interface AdjustmentRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  graduateName: string;
  installments?: Array<{ id: string; label: string; amount: number }>;
}

interface AdjustmentRefundFormProps {
  installments: Array<{ id: string; label: string; amount: number }>;
  onClose: () => void;
  onSuccess: () => void;
}

const AdjustmentRefundForm: React.FC<AdjustmentRefundFormProps> = ({
  installments,
  onClose,
  onSuccess,
}) => {
  const [operationType, setOperationType] = useState<'ADJUSTMENT' | 'REFUND'>('ADJUSTMENT');
  const [adjustmentType, setAdjustmentType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [relatedInstallmentId, setRelatedInstallmentId] = useState(installments[0]?.id || '');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const [refundMode, setRefundMode] = useState<'PROVIDER' | 'MANUAL'>('MANUAL');
  const [refundManualMethod, setRefundManualMethod] = useState<'TRANSFER' | 'CASH'>('TRANSFER');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReference, setRefundReference] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (operationType === 'ADJUSTMENT') {
      const parsed = parseFloat(adjustmentAmount);
      if (!parsed || parsed <= 0) {
        setErrorMsg('Ingresa un monto válido para el ajuste.');
        return;
      }
      if (!adjustmentReason.trim()) {
        setErrorMsg('El motivo o justificación del ajuste es obligatorio.');
        return;
      }
      onSuccess();
    } else {
      const parsed = parseFloat(refundAmount);
      if (!parsed || parsed <= 0) {
        setErrorMsg('Ingresa un monto válido para el reembolso.');
        return;
      }
      if (!refundReason.trim()) {
        setErrorMsg('El motivo del reembolso es obligatorio.');
        return;
      }
      onSuccess();
    }
  };

  const installmentOptions = [
    { value: '', label: 'General / Todo el plan' },
    ...installments.map((i) => ({
      value: i.id,
      label: `Mensualidad ${i.label} ($${i.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })})`,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {errorMsg && (
        <div className="p-3 bg-status-error-bg text-status-error text-xs rounded-xl flex items-center gap-2 border border-status-error/20">
          <Icon name="alert" size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Operation Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-content-primary">Tipo de movimiento</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setOperationType('ADJUSTMENT');
              setErrorMsg('');
            }}
            className={`
              h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
              ${
                operationType === 'ADJUSTMENT'
                  ? 'border-navy-900 bg-navy-50 text-navy-900 shadow-sm'
                  : 'border-surface-highest bg-surface-lowest text-content-secondary hover:border-navy-300'
              }
            `}
          >
            <span>Ajuste financiero</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setOperationType('REFUND');
              setErrorMsg('');
            }}
            className={`
              h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
              ${
                operationType === 'REFUND'
                  ? 'border-navy-900 bg-navy-50 text-navy-900 shadow-sm'
                  : 'border-surface-highest bg-surface-lowest text-content-secondary hover:border-navy-300'
              }
            `}
          >
            <span>Reembolso</span>
          </button>
        </div>
      </div>

      {operationType === 'ADJUSTMENT' ? (
        <>
          {/* Adjustment Type: Credit vs Debit */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-content-primary">Sentido del ajuste</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAdjustmentType('CREDIT')}
                className={`
                  h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
                  ${
                    adjustmentType === 'CREDIT'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-surface-highest bg-surface-lowest text-content-secondary'
                  }
                `}
              >
                <span>Crédito a favor (Bono/Descuento)</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('DEBIT')}
                className={`
                  h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
                  ${
                    adjustmentType === 'DEBIT'
                      ? 'border-amber-600 bg-amber-50 text-amber-800'
                      : 'border-surface-highest bg-surface-lowest text-content-secondary'
                  }
                `}
              >
                <span>Cargo / Débito (Aumento)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Monto del ajuste (MXN)"
              type="number"
              step="0.01"
              min="1"
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(e.target.value)}
              placeholder="0.00"
              iconStart="payment"
              required
            />

            <Select
              label="Cuota relacionada"
              options={installmentOptions}
              value={relatedInstallmentId}
              onChange={(e) => setRelatedInstallmentId(e.target.value)}
            />
          </div>

          <TextArea
            label="Motivo o justificación obligatoria"
            placeholder="Explica la causa del ajuste (ej. Descuento por beca autorizado, Corrección de cargo)..."
            rows={2}
            value={adjustmentReason}
            onChange={(e) => setAdjustmentReason(e.target.value)}
            required
          />
        </>
      ) : (
        <>
          {/* Refund Mode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-content-primary">Canal del reembolso</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRefundMode('MANUAL')}
                className={`
                  h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
                  ${
                    refundMode === 'MANUAL'
                      ? 'border-navy-900 bg-navy-50 text-navy-900'
                      : 'border-surface-highest bg-surface-lowest text-content-secondary'
                  }
                `}
              >
                <span>Reembolso Manual (Transferencia/Efectivo)</span>
              </button>
              <button
                type="button"
                onClick={() => setRefundMode('PROVIDER')}
                className={`
                  h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
                  ${
                    refundMode === 'PROVIDER'
                      ? 'border-navy-900 bg-navy-50 text-navy-900'
                      : 'border-surface-highest bg-surface-lowest text-content-secondary'
                  }
                `}
              >
                <span>Pasarela de Pago Electrónica</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Monto a reembolsar (MXN)"
              type="number"
              step="0.01"
              min="1"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="0.00"
              iconStart="payment"
              required
            />

            {refundMode === 'MANUAL' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-content-primary">Método</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRefundManualMethod('TRANSFER')}
                    className={`h-11 rounded-xl text-xs font-semibold border transition-all ${
                      refundManualMethod === 'TRANSFER'
                        ? 'border-navy-900 bg-navy-50 text-navy-900'
                        : 'border-surface-highest text-content-secondary'
                    }`}
                  >
                    Transferencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundManualMethod('CASH')}
                    className={`h-11 rounded-xl text-xs font-semibold border transition-all ${
                      refundManualMethod === 'CASH'
                        ? 'border-navy-900 bg-navy-50 text-navy-900'
                        : 'border-surface-highest text-content-secondary'
                    }`}
                  >
                    Efectivo
                  </button>
                </div>
              </div>
            )}
          </div>

          {refundMode === 'MANUAL' && (
            <Input
              label="Referencia o folio (Opcional)"
              placeholder="Ej. REF-49204"
              value={refundReference}
              onChange={(e) => setRefundReference(e.target.value)}
            />
          )}

          <TextArea
            label="Motivo del reembolso obligatorio"
            placeholder="Causa de la devolución (ej. Cancelación parcial de lugares, Pago duplicado)..."
            rows={2}
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            required
          />
        </>
      )}

      {/* Normative Mandatory Disclaimer */}
      <div className="p-3 bg-amber-50 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 border border-amber-200">
        <Icon name="info" size={16} className="text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          El pago original permanecerá en el historial. Los ajustes y reembolsos quedan auditados
          como movimientos independientes.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-low">
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {operationType === 'ADJUSTMENT' ? 'Guardar ajuste' : 'Procesar reembolso'}
        </Button>
      </div>
    </form>
  );
};

export const AdjustmentRefundModal: React.FC<AdjustmentRefundModalProps> = ({
  isOpen,
  onClose,
  graduateName,
  installments = [],
}) => {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="sm">
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-14 h-14 rounded-full bg-navy-50 text-navy-900 flex items-center justify-center mb-4">
            <Icon name="info" size={28} />
          </div>

          <h2 className="text-lg font-bold font-display text-navy-900">
            Operación capturada
          </h2>
          <p className="text-xs text-content-secondary mt-1">
            Integración con backend pendiente
          </p>

          <p className="text-xs text-content-muted my-4">
            La operación fue capturada en la interfaz, pero no se ha persistido en el servidor
            ya que los endpoints financieros continúan en desarrollo.
          </p>

          <Button variant="primary" fullWidth onClick={handleClose}>
            Entendido
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar ajuste o reembolso"
      description={`Operación financiera sobre el plan de ${graduateName}.`}
      size="md"
    >
      <AdjustmentRefundForm
        installments={installments}
        onClose={handleClose}
        onSuccess={() => setSubmitted(true)}
      />
    </Modal>
  );
};
