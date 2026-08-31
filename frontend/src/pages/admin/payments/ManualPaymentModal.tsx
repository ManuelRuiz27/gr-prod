import React, { useState, useRef } from 'react';
import {
  Modal,
  Button,
  Input,
  Select,
  TextArea,
  Icon,
} from '../../../design-system';
import {
  mockGraduatesList,
  mockPaymentPlansMap,
  type PaymentMethod,
} from '../../../fixtures';

export interface ManualPaymentSubmitData {
  graduateId: string;
  graduateName: string;
  installmentId: string;
  installmentLabel: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  reference?: string;
  notes?: string;
  evidenceFileName?: string;
}

export interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  initialGraduateId?: string;
  initialInstallmentId?: string;
}

interface ManualPaymentFormProps {
  eventId: string;
  initialGraduateId?: string;
  initialInstallmentId?: string;
  onClose: () => void;
  onSuccess: (data: ManualPaymentSubmitData) => void;
}

const ManualPaymentForm: React.FC<ManualPaymentFormProps> = ({
  eventId,
  initialGraduateId,
  initialInstallmentId,
  onClose,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventGraduates = mockGraduatesList.filter((g) => g.eventId === eventId);
  const defaultGradId = initialGraduateId || eventGraduates[0]?.id || '';
  const defaultPlan = defaultGradId ? mockPaymentPlansMap[defaultGradId] : undefined;
  const defaultInst =
    defaultPlan?.installments.find((i) => i.id === initialInstallmentId) ||
    defaultPlan?.installments.find((i) => i.status !== 'PAID') ||
    defaultPlan?.installments[0];

  const [selectedGradId, setSelectedGradId] = useState(defaultGradId);
  const [selectedInstId, setSelectedInstId] = useState(defaultInst?.id || '');
  const [amount, setAmount] = useState(defaultInst ? String(defaultInst.amount) : '');
  const [date, setDate] = useState('');
  const [method, setMethod] = useState<'CASH' | 'TRANSFER'>('TRANSFER');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedGraduate = eventGraduates.find((g) => g.id === selectedGradId);
  const selectedPlan = selectedGradId ? mockPaymentPlansMap[selectedGradId] : undefined;

  const handleGraduateChange = (gradId: string) => {
    setSelectedGradId(gradId);
    setErrorMsg('');
    const plan = mockPaymentPlansMap[gradId];
    const firstInst =
      plan?.installments.find((i) => i.status !== 'PAID') || plan?.installments[0];
    setSelectedInstId(firstInst?.id || '');
    setAmount(firstInst ? String(firstInst.amount) : '');
  };

  const handleInstallmentChange = (instId: string) => {
    setSelectedInstId(instId);
    setErrorMsg('');
    const inst = selectedPlan?.installments.find((i) => i.id === instId);
    if (inst) {
      setAmount(String(inst.amount));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFileName(file.name);
    } else {
      setEvidenceFileName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !selectedInstId) {
      setErrorMsg('El graduado seleccionado no cuenta con un plan de pagos u obligaciones configuradas.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0.');
      return;
    }
    if (!date) {
      setErrorMsg('Selecciona la fecha de pago.');
      return;
    }

    const inst = selectedPlan?.installments.find((i) => i.id === selectedInstId);
    const instLabel = inst ? `Mensualidad ${inst.label}` : 'Cuota';

    const data: ManualPaymentSubmitData = {
      graduateId: selectedGradId,
      graduateName: selectedGraduate?.fullName || 'Graduado',
      installmentId: selectedInstId,
      installmentLabel: instLabel,
      amount: parsedAmount,
      method,
      paidAt: date,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
      evidenceFileName: evidenceFileName || undefined,
    };

    onSuccess(data);
  };

  const installmentOptions =
    selectedPlan && selectedPlan.installments.length > 0
      ? selectedPlan.installments.map((inst) => ({
          value: inst.id,
          label: `Mensualidad ${inst.label} — $${inst.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (${inst.status === 'PAID' ? 'Pagada' : 'Pendiente'})`,
        }))
      : [{ value: '', label: 'Sin obligaciones configuradas' }];

  const graduateOptions = eventGraduates.map((g) => ({
    value: g.id,
    label: `${g.fullName} (${g.ticketCount} lugares)`,
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {errorMsg && (
        <div className="p-3 bg-status-error-bg text-status-error text-xs rounded-xl flex items-center gap-2 border border-status-error/20">
          <Icon name="alert" size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Graduate Selector */}
      <Select
        label="Graduado"
        options={graduateOptions}
        value={selectedGradId}
        onChange={(e) => handleGraduateChange(e.target.value)}
        required
      />

      {/* Installment Selector */}
      <Select
        label="Concepto u obligación"
        options={installmentOptions}
        value={selectedInstId}
        onChange={(e) => handleInstallmentChange(e.target.value)}
        required
        disabled={!selectedPlan || selectedPlan.installments.length === 0}
      />

      {/* Amount & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Monto (MXN)"
          type="number"
          step="0.01"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          iconStart="payment"
          required
        />

        <Input
          label="Fecha de pago"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Payment Method Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-content-primary">Método de pago</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod('CASH')}
            className={`
              h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
              ${
                method === 'CASH'
                  ? 'border-navy-900 bg-navy-50 text-navy-900 shadow-sm'
                  : 'border-surface-highest bg-surface-lowest text-content-secondary hover:border-navy-300'
              }
            `}
          >
            <Icon name="payment" size={16} />
            <span>Efectivo</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('TRANSFER')}
            className={`
              h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold border transition-all
              ${
                method === 'TRANSFER'
                  ? 'border-navy-900 bg-navy-50 text-navy-900 shadow-sm'
                  : 'border-surface-highest bg-surface-lowest text-content-secondary hover:border-navy-300'
              }
            `}
          >
            <Icon name="refresh" size={16} />
            <span>Transferencia</span>
          </button>
        </div>
      </div>

      {/* Reference / Note */}
      <Input
        label="Referencia o folio (Opcional)"
        placeholder="Ej. REF-984021, Depósito ventanilla 4..."
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />

      <TextArea
        label="Notas adicionales (Opcional)"
        placeholder="Observaciones sobre la recepción o validación del pago..."
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Real File Input for Evidence */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-content-primary">Evidencia de pago</span>
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
          id="evidence-file-input"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`
            p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all
            ${
              evidenceFileName
                ? 'border-navy-600 bg-navy-50/50'
                : 'border-surface-highest bg-surface-low hover:border-navy-400 hover:bg-surface-lowest'
            }
          `}
        >
          <Icon
            name={evidenceFileName ? 'check' : 'download'}
            size={20}
            className={evidenceFileName ? 'text-navy-900' : 'text-content-muted'}
          />
          {evidenceFileName ? (
            <span className="text-xs font-semibold text-navy-900">
              Archivo seleccionado: {evidenceFileName} (clic para cambiar)
            </span>
          ) : (
            <span className="text-xs text-content-secondary">
              Haz clic para seleccionar comprobante (PDF, JPG o PNG)
            </span>
          )}
        </div>
      </div>

      {/* Backend Pending Integration Disclaimer */}
      <div className="p-3 bg-surface-low rounded-xl flex items-start gap-2.5 text-xs text-content-secondary border border-surface-high">
        <Icon name="info" size={16} className="text-navy-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Los pagos manuales se procesarán a través del endpoint normativo una vez que el backend
          esté conectado.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-low">
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={!selectedPlan || selectedPlan.installments.length === 0}
        >
          Registrar pago
        </Button>
      </div>
    </form>
  );
};

export const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  isOpen,
  onClose,
  eventId,
  initialGraduateId,
  initialInstallmentId,
}) => {
  const [submittedData, setSubmittedData] = useState<ManualPaymentSubmitData | null>(null);

  if (!isOpen) return null;

  const handleSuccess = (data: ManualPaymentSubmitData) => {
    setSubmittedData(data);
  };

  const handleClose = () => {
    setSubmittedData(null);
    onClose();
  };

  // Step 2: Confirmation Screen without claiming persistent storage
  if (submittedData) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="sm">
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-14 h-14 rounded-full bg-navy-50 text-navy-900 flex items-center justify-center mb-4">
            <Icon name="info" size={28} />
          </div>

          <h2 className="text-lg font-bold font-display text-navy-900">
            Registro capturado
          </h2>
          <p className="text-xs text-content-secondary mt-1">
            Integración con backend pendiente
          </p>

          {/* Amount Highlight Box */}
          <div className="w-full bg-surface-low rounded-2xl p-4 my-4 flex items-center justify-between border border-surface-high">
            <span className="text-xs font-semibold text-content-secondary">Monto capturado</span>
            <span className="text-xl font-extrabold text-navy-900 font-display">
              ${submittedData.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </span>
          </div>

          {/* Detail List */}
          <div className="w-full space-y-2 text-xs border-t border-surface-low pt-3 mb-5">
            <div className="flex justify-between py-1.5 border-b border-surface-low/60">
              <span className="text-content-secondary">Graduado</span>
              <span className="font-semibold text-navy-900">{submittedData.graduateName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-surface-low/60">
              <span className="text-content-secondary">Concepto</span>
              <span className="font-semibold text-navy-900">{submittedData.installmentLabel}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-surface-low/60">
              <span className="text-content-secondary">Método de pago</span>
              <span className="font-semibold text-navy-900">
                {submittedData.method === 'CASH' ? 'Efectivo' : 'Transferencia'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-surface-low/60">
              <span className="text-content-secondary">Fecha</span>
              <span className="font-semibold text-navy-900">{submittedData.paidAt}</span>
            </div>
            {submittedData.reference && (
              <div className="flex justify-between py-1.5 border-b border-surface-low/60">
                <span className="text-content-secondary">Referencia</span>
                <span className="font-mono text-content-primary">{submittedData.reference}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5">
              <span className="text-content-secondary">Estado</span>
              <span className="font-medium text-amber-700">Integración con backend pendiente</span>
            </div>
          </div>

          <Button variant="primary" fullWidth onClick={handleClose}>
            Volver a pagos
          </Button>
        </div>
      </Modal>
    );
  }

  // Step 1: Registrar Pago Manual Form
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar pago manual"
      description="Registra un abono o liquidación recibido fuera de las pasarelas electrónicas."
      size="md"
    >
      <ManualPaymentForm
        eventId={eventId}
        initialGraduateId={initialGraduateId}
        initialInstallmentId={initialInstallmentId}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </Modal>
  );
};
