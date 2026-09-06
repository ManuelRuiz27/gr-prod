import React, { useState, useRef, useMemo } from 'react';
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
  VISUAL_QA_GRADUATE_RECORDS,
} from '../../../fixtures';

export interface ManualPaymentSubmitData {
  graduateId: string;
  graduateName: string;
  installmentId?: string;
  installmentLabel?: string;
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

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

  const [selectedGradId, setSelectedGradId] = useState(defaultGradId);
  const selectedGraduate = eventGraduates.find((g) => g.id === selectedGradId);
  const selectedPlan = selectedGradId ? mockPaymentPlansMap[selectedGradId] : undefined;
  const visualRecord = selectedGradId ? VISUAL_QA_GRADUATE_RECORDS[selectedGradId] : undefined;

  // Unpaid installment for context/suggestion
  const nextUnpaidInst = useMemo(() => {
    if (!selectedPlan) return undefined;
    if (initialInstallmentId) {
      const match = selectedPlan.installments.find((i) => i.id === initialInstallmentId);
      if (match) return match;
    }
    return selectedPlan.installments.find((i) => i.status !== 'PAID') || selectedPlan.installments[0];
  }, [selectedPlan, initialInstallmentId]);

  const folio = visualRecord?.folio || '—';
  const balanceText = visualRecord?.balanceAmount
    ? visualRecord.balanceAmount
    : selectedPlan
    ? `$${selectedPlan.pendingAmount.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`
    : '—';

  const minimumAmount = nextUnpaidInst?.amount ?? (selectedPlan?.pendingAmount ?? 0);
  const minimumText = minimumAmount > 0
    ? `$${minimumAmount.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`
    : 'Sin mínimo configurado';

  const [amount, setAmount] = useState(minimumAmount > 0 ? String(minimumAmount) : '');
  const [date, setDate] = useState(getTodayDateString());
  const [method, setMethod] = useState<'CASH' | 'TRANSFER' | 'DEPOSIT'>('TRANSFER');
  const [receivedBy, setReceivedBy] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');


  const handleGraduateChange = (gradId: string) => {
    setSelectedGradId(gradId);
    setErrorMsg('');
    const plan = mockPaymentPlansMap[gradId];
    const firstInst = plan?.installments.find((i) => i.status !== 'PAID') || plan?.installments[0];
    const min = firstInst?.amount ?? (plan?.pendingAmount ?? 0);
    setAmount(min > 0 ? String(min) : '');
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

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0.');
      return;
    }
    if (minimumAmount > 0 && parsedAmount < minimumAmount) {
      setErrorMsg(`El mínimo actual es $${minimumAmount.toLocaleString('es-MX')}.`);
      return;
    }
    if (!date) {
      setErrorMsg('Selecciona la fecha de pago.');
      return;
    }

    // Explicit initialInstallmentId only if explicitly requested; generic payments have no implicit installment allocation
    const isExplicitInst = Boolean(
      initialInstallmentId &&
      selectedPlan?.installments.some((i) => i.id === initialInstallmentId)
    );
    const targetInstallment = isExplicitInst
      ? selectedPlan?.installments.find((i) => i.id === initialInstallmentId)
      : undefined;

    const data: ManualPaymentSubmitData = {
      graduateId: selectedGradId,
      graduateName: selectedGraduate?.fullName || 'Graduado',
      installmentId: targetInstallment?.id,
      installmentLabel: targetInstallment ? `Mensualidad ${targetInstallment.label}` : undefined,
      amount: parsedAmount,
      method,
      paidAt: date,
      receivedBy: method === 'CASH' ? receivedBy.trim() || undefined : undefined,
      reference: method !== 'CASH' ? reference.trim() || undefined : undefined,
      notes: notes.trim() || undefined,
      evidenceFileName: method !== 'CASH' ? evidenceFileName || undefined : undefined,
    };

    onSuccess(data);
  };

  const graduateOptions = eventGraduates.map((g) => {
    const rec = VISUAL_QA_GRADUATE_RECORDS[g.id];
    const fol = rec?.folio ? `[${rec.folio}] ` : '';
    return {
      value: g.id,
      label: `${fol}${g.fullName} (${g.ticketCount} lugares)`,
    };
  });

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

      {/* 1. Selector de Graduado */}
      <Select
        id="manualPaymentGrad"
        label="Graduado"
        options={graduateOptions}
        value={selectedGradId}
        onChange={(e) => handleGraduateChange(e.target.value)}
        required
      />

      {/* Contexto Operativo: Folio, Saldo, Mínimo */}
      <div className="p-3 bg-obsidian-900 rounded-card border border-silver-800 grid grid-cols-3 gap-2 text-center">
        <div>
          <span className="text-[11px] text-silver-400 block">Folio</span>
          <span className="font-mono font-semibold text-silver-200">{folio}</span>
        </div>
        <div>
          <span className="text-[11px] text-silver-400 block">Saldo</span>
          <span className="font-bold text-silver-100">{balanceText}</span>
        </div>
        <div>
          <span className="text-[11px] text-silver-400 block">Mínimo actual</span>
          <span className="font-semibold text-gold-400">{minimumText}</span>
        </div>
      </div>

      {/* 2. Monto recibido & Fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            id="manualAmountInput"
            label="Monto recibido (MXN)"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setErrorMsg('');
            }}
            placeholder="0.00"
            iconStart="payment"
            required
          />
          {minimumAmount > 0 && (
            <p className="text-[11px] text-silver-400 mt-1">
              Mínimo sugerido: {minimumText}. Puedes registrar el total o cualquier monto superior.
            </p>
          )}
        </div>

        <Input
          id="manualDateInput"
          label="Fecha de pago"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* 3. Método de pago */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-silver-300">Método de pago</label>
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

      {/* Campos contextuales por método */}
      {method === 'CASH' ? (
        <Input
          id="manualReceivedByInput"
          label="Recibido por (Responsable)"
          placeholder="Ej. Coordinador de Finanzas GR / Oficina"
          value={receivedBy}
          onChange={(e) => setReceivedBy(e.target.value)}
          required
        />
      ) : (
        <>
          <Input
            id="manualReferenceInput"
            label="Referencia bancaria o folio de autorización"
            placeholder="Ej. SPEI-984021, AUT-8472..."
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-silver-300">Comprobante de operación (Opcional)</span>
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
                p-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all
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
                  Adjuntar comprobante (PDF, JPG o PNG)
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Notas */}
      <TextArea
        id="manualNotesInput"
        label="Notas u observaciones (Opcional)"
        placeholder="Anotaciones para control interno..."
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Resumen Operativo */}
      <div className="p-3 bg-obsidian-900 rounded-card border border-silver-800 space-y-1 text-xs">
        <div className="flex justify-between text-silver-400">
          <span>Método:</span>
          <span className="font-semibold text-silver-200">{getMethodLabel(method)}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
        <Button variant="secondary" size="sm" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" size="sm" type="submit">
          Registrar abono
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

  // Step 2: Pantalla de confirmación de captura
  if (submittedData) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="sm">
        <div className="flex flex-col items-center text-center p-2 font-sans">
          <div className="w-12 h-12 rounded-full bg-obsidian-800 text-gold-400 border border-silver-700 flex items-center justify-center mb-3">
            <Icon name="check" size={24} />
          </div>

          <h2 className="text-lg font-bold font-display text-silver-50">
            Abono listo
          </h2>
          <p className="text-xs text-silver-400 mt-1">
            Revisa los datos capturados.
          </p>

          {/* Amount Highlight Box */}
          <div className="w-full bg-obsidian-900 rounded-card p-3.5 my-4 flex items-center justify-between border border-silver-800">
            <span className="text-xs font-semibold text-silver-400">Monto recibido</span>
            <span className="text-xl font-extrabold text-gold-400 font-sans">
              ${submittedData.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </span>
          </div>

          {/* Detail List */}
          <div className="w-full space-y-2 text-xs border-t border-silver-800/80 pt-3 mb-5 text-left">
            <div className="flex justify-between py-1 border-b border-silver-800/60">
              <span className="text-silver-400">Graduado</span>
              <span className="font-semibold text-silver-100">{submittedData.graduateName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-silver-800/60">
              <span className="text-silver-400">Método</span>
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
                <span className="text-silver-400">Recibido por</span>
                <span className="text-silver-200">{submittedData.receivedBy}</span>
              </div>
            )}
            {submittedData.reference && (
              <div className="flex justify-between py-1 border-b border-silver-800/60">
                <span className="text-silver-400">Referencia</span>
                <span className="font-mono text-silver-200">{submittedData.reference}</span>
              </div>
            )}
          </div>

          <Button variant="primary" fullWidth onClick={handleClose}>
            Volver a pagos
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar abono"
      description="Captura un abono recibido en efectivo, transferencia o depósito."
      size="md"
    >
      <ManualPaymentForm
        key={`${eventId}-${initialGraduateId || 'default'}-${initialInstallmentId || 'none'}`}
        eventId={eventId}
        initialGraduateId={initialGraduateId}
        initialInstallmentId={initialInstallmentId}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </Modal>
  );
};

