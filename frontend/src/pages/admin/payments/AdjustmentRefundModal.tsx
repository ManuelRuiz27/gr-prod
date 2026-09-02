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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-sans">
      {errorMsg && (
        <div className="p-3 bg-status-error/10 text-status-error rounded-xl flex items-center gap-2 border border-status-error/30">
          <Icon name="alert" size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Operation Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-silver-300">Tipo de movimiento</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setOperationType('ADJUSTMENT');
              setErrorMsg('');
            }}
            className={`
              h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
              ${
                operationType === 'ADJUSTMENT'
                  ? 'border-gold-500 bg-obsidian-800 text-gold-400 shadow-sm'
                  : 'border-silver-800 bg-obsidian-900 text-silver-400 hover:border-silver-700'
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
              h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
              ${
                operationType === 'REFUND'
                  ? 'border-gold-500 bg-obsidian-800 text-gold-400 shadow-sm'
                  : 'border-silver-800 bg-obsidian-900 text-silver-400 hover:border-silver-700'
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
            <label className="text-xs font-semibold text-silver-300">Sentido del ajuste</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAdjustmentType('CREDIT')}
                className={`
                  h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
                  ${
                    adjustmentType === 'CREDIT'
                      ? 'border-status-success bg-status-success/10 text-status-success'
                      : 'border-silver-800 bg-obsidian-900 text-silver-400'
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
                      ? 'border-status-warning bg-status-warning/10 text-status-warning'
                      : 'border-silver-800 bg-obsidian-900 text-silver-400'
                  }
                `}
              >
                <span>Cargo / Débito (Aumento)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="adjustmentAmountInput"
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
              id="adjustmentInstallmentSelect"
              label="Cuota relacionada"
              options={installmentOptions}
              value={relatedInstallmentId}
              onChange={(e) => setRelatedInstallmentId(e.target.value)}
            />
          </div>

          <TextArea
            id="adjustmentReasonInput"
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
            <label className="text-xs font-semibold text-silver-300">Canal del reembolso</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRefundMode('MANUAL')}
                className={`
                  h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
                  ${
                    refundMode === 'MANUAL'
                      ? 'border-gold-500 bg-obsidian-800 text-gold-400'
                      : 'border-silver-800 bg-obsidian-900 text-silver-400'
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
                      ? 'border-gold-500 bg-obsidian-800 text-gold-400'
                      : 'border-silver-800 bg-obsidian-900 text-silver-400'
                  }
                `}
              >
                <span>Pasarela de Pago Electrónica</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="refundAmountInput"
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
                <label className="text-xs font-semibold text-silver-300">Método</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRefundManualMethod('TRANSFER')}
                    className={`h-10 rounded-xl text-xs font-semibold border transition-all ${
                      refundManualMethod === 'TRANSFER'
                        ? 'border-gold-500 bg-obsidian-800 text-gold-400'
                        : 'border-silver-800 text-silver-400'
                    }`}
                  >
                    Transferencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundManualMethod('CASH')}
                    className={`h-10 rounded-xl text-xs font-semibold border transition-all ${
                      refundManualMethod === 'CASH'
                        ? 'border-gold-500 bg-obsidian-800 text-gold-400'
                        : 'border-silver-800 text-silver-400'
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
              id="refundReferenceInput"
              label="Referencia o folio (Opcional)"
              placeholder="Ej. REF-49204"
              value={refundReference}
              onChange={(e) => setRefundReference(e.target.value)}
            />
          )}

          <TextArea
            id="refundReasonInput"
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
      <div className="p-3 bg-obsidian-900 rounded-card flex items-start gap-2.5 text-xs text-silver-300 border border-silver-800">
        <Icon name="info" size={16} className="text-gold-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          El pago original permanecerá inmutable en el historial. Los ajustes y reembolsos quedan auditados
          como movimientos independientes.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
        <Button variant="secondary" size="sm" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" size="sm" type="submit">
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
        <div className="flex flex-col items-center text-center p-2 font-sans">
          <div className="w-12 h-12 rounded-full bg-obsidian-800 text-gold-400 border border-silver-700 flex items-center justify-center mb-3">
            <Icon name="check" size={24} />
          </div>

          <h2 className="text-lg font-bold font-display text-silver-50">
            Operación capturada
          </h2>
          <p className="text-xs text-silver-400 mt-1">
            Integración con backend pendiente
          </p>

          <p className="text-xs text-silver-400 my-4">
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
