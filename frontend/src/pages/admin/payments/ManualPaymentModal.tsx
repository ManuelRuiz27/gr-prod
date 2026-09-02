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
} from '../../../fixtures';

export interface ManualPaymentSubmitData {
  graduateId: string;
  graduateName: string;
  installmentId: string;
  installmentLabel: string;
  amount: number;
  method: 'CASH' | 'TRANSFER' | 'DEPOSIT';
  paidAt: string;
  receivedBy?: string;
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
  const [method, setMethod] = useState<'CASH' | 'TRANSFER' | 'DEPOSIT'>('TRANSFER');
  const [receivedBy, setReceivedBy] = useState('');
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
      receivedBy: receivedBy.trim() || undefined,
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

  const getMethodLabel = (m: 'CASH' | 'TRANSFER' | 'DEPOSIT') => {
    switch (m) {
      case 'CASH':
        return 'Efectivo';
      case 'TRANSFER':
        return 'Transferencia';
      case 'DEPOSIT':
        return 'Depósito';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-sans">
      {errorMsg && (
        <div className="p-3 bg-status-error/10 text-status-error rounded-xl flex items-center gap-2 border border-status-error/30">
          <Icon name="alert" size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Graduado */}
      <Select
        id="manualPaymentGrad"
        label="Graduado"
        options={graduateOptions}
        value={selectedGradId}
        onChange={(e) => handleGraduateChange(e.target.value)}
        required
      />

      {/* 2. Concepto / Obligación */}
      <Select
        id="manualPaymentInst"
        label="Concepto u obligación"
        options={installmentOptions}
        value={selectedInstId}
        onChange={(e) => handleInstallmentChange(e.target.value)}
        required
        disabled={!selectedPlan || selectedPlan.installments.length === 0}
      />

      {/* 3. Método (CASH, TRANSFER, DEPOSIT) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-silver-300">Método de pago manual</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setMethod('CASH')}
            className={`
              h-10 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all
              ${
                method === 'CASH'
                  ? 'border-gold-500 bg-obsidian-800 text-gold-400 shadow-sm'
                  : 'border-silver-800 bg-obsidian-900 text-silver-400 hover:border-silver-700'
              }
            `}
          >
            <Icon name="payment" size={14} />
            <span>Efectivo</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('TRANSFER')}
            className={`
              h-10 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all
              ${
                method === 'TRANSFER'
                  ? 'border-gold-500 bg-obsidian-800 text-gold-400 shadow-sm'
                  : 'border-silver-800 bg-obsidian-900 text-silver-400 hover:border-silver-700'
              }
            `}
          >
            <Icon name="refresh" size={14} />
            <span>Transferencia</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('DEPOSIT')}
            className={`
              h-10 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all
              ${
                method === 'DEPOSIT'
                  ? 'border-gold-500 bg-obsidian-800 text-gold-400 shadow-sm'
                  : 'border-silver-800 bg-obsidian-900 text-silver-400 hover:border-silver-700'
              }
            `}
          >
            <Icon name="building" size={14} />
            <span>Depósito</span>
          </button>
        </div>
      </div>

      {/* 4. Monto & 5. Fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="manualAmountInput"
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
          id="manualDateInput"
          label="Fecha de pago"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* 6. Quién recibió (si aplica) */}
      <Input
        id="manualReceivedByInput"
        label="Quién recibió / Responsable administrativo"
        placeholder="Ej. Coordinador de Finanzas GR / Oficina"
        value={receivedBy}
        onChange={(e) => setReceivedBy(e.target.value)}
      />

      {/* 7. Referencia */}
      <Input
        id="manualReferenceInput"
        label="Referencia o folio de operación (Opcional)"
        placeholder="Ej. REC-0492, SPEI-984021..."
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />

      {/* 8. Evidencia de pago */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-silver-300">Evidencia de pago</span>
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
            p-3.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all
            ${
              evidenceFileName
                ? 'border-gold-500/60 bg-obsidian-800/80'
                : 'border-silver-800 bg-obsidian-900 hover:border-silver-700 hover:bg-obsidian-850'
            }
          `}
        >
          <Icon
            name={evidenceFileName ? 'check' : 'download'}
            size={18}
            className={evidenceFileName ? 'text-gold-400' : 'text-silver-500'}
          />
          {evidenceFileName ? (
            <span className="text-xs font-semibold text-silver-100">
              Archivo: {evidenceFileName} (clic para cambiar)
            </span>
          ) : (
            <span className="text-xs text-silver-400">
              Seleccionar comprobante (PDF, JPG o PNG)
            </span>
          )}
        </div>
      </div>

      {/* 9. Notas */}
      <TextArea
        id="manualNotesInput"
        label="Notas adicionales (Opcional)"
        placeholder="Observaciones sobre la recepción o validación del pago..."
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* 10. Resumen antes de confirmar & Preview informativo */}
      <div className="p-3.5 bg-obsidian-900 rounded-card border border-silver-800 space-y-1.5">
        <span className="text-xs font-bold text-silver-300 block">Resumen del registro</span>
        <div className="flex justify-between text-silver-400">
          <span>Método:</span>
          <span className="font-semibold text-silver-200">{getMethodLabel(method)}</span>
        </div>
        <div className="flex justify-between text-silver-400">
          <span>Saldo posterior:</span>
          <span className="text-silver-400 italic">Disponible al integrar cálculo del backend</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
        <Button variant="secondary" size="sm" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="sm"
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
        <div className="flex flex-col items-center text-center p-2 font-sans">
          <div className="w-12 h-12 rounded-full bg-obsidian-800 text-gold-400 border border-silver-700 flex items-center justify-center mb-3">
            <Icon name="check" size={24} />
          </div>

          <h2 className="text-lg font-bold font-display text-silver-50">
            Registro capturado
          </h2>
          <p className="text-xs text-silver-400 mt-1">
            Integración con backend pendiente
          </p>

          {/* Amount Highlight Box */}
          <div className="w-full bg-obsidian-900 rounded-card p-3.5 my-4 flex items-center justify-between border border-silver-800">
            <span className="text-xs font-semibold text-silver-400">Monto capturado</span>
            <span className="text-xl font-extrabold text-gold-400 font-sans">
              ${submittedData.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </span>
          </div>

          {/* Detail List */}
          <div className="w-full space-y-2 text-xs border-t border-silver-800/80 pt-3 mb-5">
            <div className="flex justify-between py-1 border-b border-silver-800/60">
              <span className="text-silver-400">Graduado</span>
              <span className="font-semibold text-silver-100">{submittedData.graduateName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-silver-800/60">
              <span className="text-silver-400">Concepto</span>
              <span className="font-semibold text-silver-100">{submittedData.installmentLabel}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-silver-800/60">
              <span className="text-silver-400">Método de pago</span>
              <span className="font-semibold text-silver-100">
                {submittedData.method === 'CASH'
                  ? 'Efectivo'
                  : submittedData.method === 'DEPOSIT'
                  ? 'Depósito'
                  : 'Transferencia'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-silver-800/60">
              <span className="text-silver-400">Fecha</span>
              <span className="font-semibold text-silver-100">{submittedData.paidAt}</span>
            </div>
            {submittedData.receivedBy && (
              <div className="flex justify-between py-1 border-b border-silver-800/60">
                <span className="text-silver-400">Quién recibió</span>
                <span className="text-silver-200">{submittedData.receivedBy}</span>
              </div>
            )}
            {submittedData.reference && (
              <div className="flex justify-between py-1 border-b border-silver-800/60">
                <span className="text-silver-400">Referencia</span>
                <span className="font-mono text-silver-200">{submittedData.reference}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-silver-400">Estado</span>
              <span className="font-medium text-status-warning">Integración con backend pendiente</span>
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
