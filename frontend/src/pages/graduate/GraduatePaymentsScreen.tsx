import React, { useState, useRef } from 'react';
import {
  Card,
  Badge,
  Button,
  Icon,
  Modal,
  Input,
  TextArea,
  Alert,
} from '../../design-system';
import { VISUAL_QA_GRADUATE_PAYMENT_STATES, type VisualPaymentSubmission } from '../../fixtures';
import { createElectronicPaymentAttempt, submitPaymentProof } from '../../demo/actions';
import { useDemo } from '../../demo/useDemo';
import { isMockDataMode } from '../../demo/config';

export interface GraduatePaymentsScreenProps {
  graduateId?: string;
}

export const GraduatePaymentsScreen: React.FC<GraduatePaymentsScreenProps> = ({
  graduateId = 'grad-andrea-martinez',
}) => {
  const { state: demoState } = useDemo();
  // Graduate state fixture
  const graduateState = isMockDataMode
    ? demoState.payment_plan
    : VISUAL_QA_GRADUATE_PAYMENT_STATES[graduateId] || VISUAL_QA_GRADUATE_PAYMENT_STATES['grad-andrea-martinez'];

  // Modals state
  const [isPayNowModalOpen, setIsPayNowModalOpen] = useState(false);
  const [isReportProofModalOpen, setIsReportProofModalOpen] = useState(false);

  // Report Proof Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [proofMethod, setProofMethod] = useState<'TRANSFER' | 'DEPOSIT'>('TRANSFER');
  const [proofAmount, setProofAmount] = useState(
    graduateState?.nextPayment ? String(graduateState.nextPayment.amount) : ''
  );
  const [proofReference, setProofReference] = useState('');
  const [proofDate, setProofDate] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [proofError, setProofError] = useState('');
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [localSubmissions, setLocalSubmissions] = useState<VisualPaymentSubmission[]>(graduateState?.submissions || []);

  if (!graduateState) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFileName(file.name);
    } else {
      setProofFileName('');
    }
  };

  const handleReportProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProofError('');

    const parsedAmount = parseFloat(proofAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      setProofError('Ingresa un monto válido mayor a 0.');
      return;
    }
    if (!proofReference.trim()) {
      setProofError('La referencia o folio de rastreo es obligatoria.');
      return;
    }
    if (!proofDate) {
      setProofError('Ingresa la fecha en la que realizaste el pago.');
      return;
    }
    if (!proofFileName) {
      setProofError('Adjunta el comprobante o fotografía del pago.');
      return;
    }

    const proof = {
      graduateId: graduateState.graduateId,
      graduateName: graduateState.graduateName,
      graduateEmail: 'andrea.martinez@ejemplo.com',
      career: 'Licenciatura en Derecho',
      eventId: graduateState.eventId,
      amount: parsedAmount,
      method: proofMethod,
      declaredDate: proofDate,
      reference: proofReference.trim(),
      notes: proofNotes.trim() || undefined,
      evidenceFileName: proofFileName,
      evidenceFileSize: '1.4 MB',
    };
    if (isMockDataMode) submitPaymentProof(proof);
    else setLocalSubmissions((current) => [{ ...proof, id: `sub-local-${current.length + 10}`, folio: `SUB-2027-00${String(current.length + 10).padStart(2, '0')}`, status: 'PENDING_REVIEW' }, ...current]);
    setIsReportProofModalOpen(false);
    setSubmissionFeedback(
      'Tu comprobante ha sido enviado a validación. Recuerda que tu saldo se actualizará una vez que el equipo administrativo apruebe la operación.'
    );

    // Reset form
    setProofReference('');
    setProofDate('');
    setProofNotes('');
    setProofFileName('');
  };

  const getInstallmentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success" size="sm">Pagado</Badge>;
      case 'UPCOMING':
        return <Badge variant="warning" size="sm">Próximo</Badge>;
      case 'DUE':
        return <Badge variant="warning" size="sm">Por vencer</Badge>;
      case 'OVERDUE':
        return <Badge variant="error" size="sm">Vencido</Badge>;
      case 'FUTURE':
        return <Badge variant="neutral" size="sm">Futuro</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const getSubmissionBadge = (status: VisualPaymentSubmission['status']) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Badge variant="warning" size="sm" dot>Pendiente de validación</Badge>;
      case 'APPROVED':
        return <Badge variant="success" size="sm">Aprobado</Badge>;
      case 'REJECTED':
        return <Badge variant="error" size="sm">Rechazado</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral" size="sm">Cancelado</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
            Centro de Pagos
          </h1>
          <p className="text-xs text-silver-400 mt-1">
            Consulta tu estado de cuenta, próximas cuotas y reporta tus comprobantes de pago.
          </p>
        </div>
        {!graduateState.nextPayment && (
          <div>
            <Button
              variant="secondary"
              size="sm"
              iconStart="download"
              onClick={() => setIsReportProofModalOpen(true)}
            >
              Reportar transferencia
            </Button>
          </div>
        )}
      </div>

      {submissionFeedback && (
        <Alert variant="info" onDismiss={() => setSubmissionFeedback(null)}>
          {submissionFeedback}
        </Alert>
      )}

      {/* Hero Financial Status Card (Inter font for numbers, controlled Gold) */}
      <Card className="p-6 flex flex-col gap-5 bg-obsidian-850 border border-silver-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
            Total Contratado
          </span>
          <Badge variant="gold" size="sm">
            {graduateState.progressPercentage}% Cubierto
          </Badge>
        </div>

        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-extrabold text-silver-50 font-sans tracking-tight">
            ${graduateState.totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs sm:text-sm text-silver-400 font-sans">
            de ${graduateState.totalContracted.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </span>
        </div>

        {/* Progress Bar towards Financial Completion */}
        <div className="space-y-1.5">
          <div className="w-full bg-obsidian-900 rounded-full h-2.5 overflow-hidden border border-silver-800">
            <div
              style={{ width: `${graduateState.progressPercentage}%` }}
              className="bg-gold-500 h-full rounded-full transition-all duration-500"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-silver-400">
            <span>Saldo pendiente: <strong className="text-silver-200 font-sans">${graduateState.totalPending.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong></span>
            <span>Avance financiero: <strong className="text-silver-200 font-sans">{graduateState.progressPercentage}% cubierto</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-silver-800/60 text-xs">
          <div>
            <span className="text-silver-400 block text-[11px]">Contratado</span>
            <span className="font-bold text-silver-100 font-sans">${graduateState.totalContracted.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-silver-400 block text-[11px]">Abonado</span>
            <span className="font-bold text-status-success font-sans">${graduateState.totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-silver-400 block text-[11px]">Pendiente</span>
            <span className="font-bold text-status-warning font-sans">${graduateState.totalPending.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-silver-400 block text-[11px]">Vencido</span>
            <span className="font-bold text-silver-300 font-sans">${graduateState.totalOverdue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </Card>

      {/* Next Payment Priority Alert & Direct Action */}
      {graduateState.nextPayment && (
        <Card className="p-5 bg-obsidian-850 border border-gold-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">
                Próximo pago
              </span>
              <Badge variant="warning" size="sm">
                {graduateState.nextPayment.concept}
              </Badge>
            </div>
            <div className="text-2xl font-extrabold text-silver-50 font-sans">
              ${graduateState.nextPayment.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </div>
            <p className="text-xs text-silver-300 flex items-center gap-1.5">
              <Icon name="calendar" size={14} className="text-gold-400" />
              <span>Fecha límite de pago: <strong>{graduateState.nextPayment.dueDate}</strong></span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              iconStart="payment"
              onClick={() => setIsPayNowModalOpen(true)}
            >
              Pagar ahora
            </Button>
            <Button
              variant="secondary"
              size="md"
              iconStart="download"
              onClick={() => setIsReportProofModalOpen(true)}
            >
              Reportar transferencia
            </Button>
          </div>
        </Card>
      )}

      {/* Installments Breakdown (Calendario de Pagos Dinámico) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-silver-300">
            Calendario de Pagos ({graduateState.installments.length} cuotas)
          </h2>
          <span className="text-xs text-silver-400">Planes con vencimientos programados</span>
        </div>

        <div className="space-y-3">
          {graduateState.installments.map((inst) => {
            const isPaid = inst.status === 'PAID';

            return (
              <Card key={inst.id} className="p-4 flex flex-col gap-2 bg-obsidian-850 border border-silver-800/80">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        isPaid
                          ? 'bg-status-success/20 text-status-success border border-status-success/30'
                          : 'bg-obsidian-800 text-silver-400 border border-silver-700/60'
                      }`}
                    >
                      {inst.concept.replace('Mensualidad ', 'M').slice(0, 3)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-silver-100 font-sans truncate">
                        {inst.concept} — ${inst.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                      <span className="text-xs text-silver-400">
                        {isPaid && inst.paidAt
                          ? `Cubierto el ${inst.paidAt}`
                          : `Vence el ${inst.dueDate}`}
                      </span>
                    </div>
                  </div>
                  {getInstallmentBadge(inst.status)}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Reported Submissions Block (Comprobantes reportados por validar / aprobados / rechazados) */}
      {(isMockDataMode ? graduateState.submissions : localSubmissions).length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-silver-300">
              Comprobantes Reportados
            </h2>
            <span className="text-xs text-silver-400">Seguimiento de validación</span>
          </div>

          <div className="space-y-3">
            {(isMockDataMode ? graduateState.submissions : localSubmissions).map((sub) => (
              <Card
                key={sub.id}
                className="p-4 bg-obsidian-850 border border-silver-800/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-silver-300 font-semibold">{sub.folio}</span>
                    <span className="text-xs text-silver-400">• {sub.declaredDate}</span>
                  </div>
                  {getSubmissionBadge(sub.status)}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-silver-400">Monto reportado:</span>{' '}
                    <strong className="text-silver-100 font-sans">${sub.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                  </div>
                  <div>
                    <span className="text-silver-400">Referencia:</span>{' '}
                    <span className="font-mono text-silver-200">{sub.reference}</span>
                  </div>
                </div>

                {sub.status === 'PENDING_REVIEW' && (
                  <div className="p-2.5 bg-obsidian-900 rounded-lg text-[11px] text-silver-400 flex items-center gap-2 border border-silver-800">
                    <Icon name="info" size={14} className="text-gold-400 shrink-0" />
                    <span>Tu comprobante está en cola de revisión administrativa.</span>
                  </div>
                )}

                {sub.status === 'REJECTED' && sub.rejectionReason && (
                  <div className="p-3 bg-status-error/10 border border-status-error/30 rounded-lg space-y-1 text-xs">
                    <span className="font-bold text-status-error block">Motivo de rechazo:</span>
                    <p className="text-silver-200">{sub.rejectionReason}</p>
                    <p className="text-[11px] text-silver-400 pt-1">
                      Por favor vuelve a reportar el comprobante con los datos correctos o acude a coordinación.
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Transactions History */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-silver-300">
            Historial de Pagos Confirmados
          </h2>
          <span className="text-xs text-silver-400">Dinero acreditado</span>
        </div>

        {graduateState.confirmedTransactions.length === 0 ? (
          <p className="text-xs text-silver-400 py-4 text-center">
            Aún no tienes pagos confirmados registrados.
          </p>
        ) : (
          <div className="space-y-3">
            {graduateState.confirmedTransactions.map((tx) => (
              <Card key={tx.id} className="p-4 bg-obsidian-850 border border-silver-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-status-success/20 text-status-success flex items-center justify-center font-bold">
                    <Icon name="check" size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-silver-100 block">{tx.concept}</span>
                    <span className="text-[11px] text-silver-400">
                      {tx.paidAt} • Ref: {tx.reference}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-status-success text-sm font-sans block">
                    +${tx.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                  <Badge variant="success" size="sm">
                    Confirmado
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Available Payment Methods Information Box */}
      <Card className="p-6 bg-obsidian-850 border border-silver-800/80 space-y-4">
        <h3 className="text-base font-bold text-silver-50">Datos para transferencia bancaria</h3>
        <p className="text-xs text-silver-400">
          Si prefieres pagar mediante SPEI o practicaja bancaria, utiliza los siguientes datos y posteriormente reporta tu comprobante arriba:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-obsidian-900 rounded-card border border-silver-800 text-xs">
          <div>
            <span className="text-silver-400 block text-[11px]">Banco receptor:</span>
            <span className="font-semibold text-silver-100">BBVA México</span>
          </div>
          <div>
            <span className="text-silver-400 block text-[11px]">Beneficiario:</span>
            <span className="font-semibold text-silver-100">Graduaciones Reales S.A. de C.V.</span>
          </div>
          <div>
            <span className="text-silver-400 block text-[11px]">CLABE Interbancaria:</span>
            <span className="font-mono font-bold text-gold-400">012180001234567890</span>
          </div>
          <div>
            <span className="text-silver-400 block text-[11px]">Concepto / Referencia obligatoria:</span>
            <span className="font-mono font-bold text-silver-100">GR-2027-0042</span>
          </div>
        </div>
      </Card>

      {/* Modal: Pagar Ahora (Online Checkout Trigger) */}
      <Modal
        isOpen={isPayNowModalOpen}
        onClose={() => setIsPayNowModalOpen(false)}
        title="Pago en línea con tarjeta / SPEI"
        description="Selecciona el método electrónico de pago para liquidar tu cuota."
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-4 bg-obsidian-900 border border-silver-800 rounded-card space-y-1">
            <span className="text-silver-400">Cuota a pagar:</span>
            <div className="text-2xl font-bold text-silver-50 font-sans">
              {graduateState.nextPayment
                ? `$${graduateState.nextPayment.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                : '—'}
            </div>
            <p className="text-silver-400 text-[11px]">Concepto: {graduateState.nextPayment?.concept || 'Liquidación de saldo'}</p>
          </div>

          <div className="p-3.5 bg-obsidian-900 border border-silver-800 rounded-card text-silver-300 space-y-1">
            <span className="font-bold text-gold-400 block">Pasarela segura</span>
            <p className="leading-relaxed">
              La conexión directa con pasarela de pagos (Tarjeta de crédito, débito o SPEI automático) se habilitará al desplegar el backend de procesamiento.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
            <Button variant="secondary" size="sm" onClick={() => setIsPayNowModalOpen(false)}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (isMockDataMode) createElectronicPaymentAttempt('MERCADO_PAGO');
                setIsPayNowModalOpen(false);
                setSubmissionFeedback(isMockDataMode ? 'Intento de pago electrónico simulado creado. La confirmación real siempre corresponde al backend.' : 'Conexión con pasarela de pago en línea lista para integración.');
              }}
            >
              Continuar a pasarela
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Reportar Transferencia / Depósito (VS-G-PROOF-001) */}
      <Modal
        isOpen={isReportProofModalOpen}
        onClose={() => setIsReportProofModalOpen(false)}
        title="Reportar transferencia o depósito"
        description="Envía los datos y fotografía de tu comprobante bancario para validación."
        size="md"
      >
        <form onSubmit={handleReportProofSubmit} className="space-y-4 text-xs font-sans">
          {proofError && (
            <div className="p-3 bg-status-error/10 text-status-error rounded-xl flex items-center gap-2 border border-status-error/30">
              <Icon name="alert" size={16} />
              <span>{proofError}</span>
            </div>
          )}

          {/* CRITICAL DISCLAIMER (Mandatory) */}
          <div className="p-3.5 bg-obsidian-900 border border-gold-500/40 rounded-card space-y-1 text-silver-200">
            <div className="flex items-center gap-2 text-gold-400 font-bold">
              <Icon name="alert" size={16} />
              <span>Enviar este comprobante no confirma el pago.</span>
            </div>
            <p className="leading-relaxed text-[11px] text-silver-400">
              El equipo administrativo revisará la información. Tu saldo se actualizará únicamente después de la aprobación.
            </p>
          </div>

          {/* 1. Método */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-silver-300">Método de pago realizado</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProofMethod('TRANSFER')}
                className={`
                  h-10 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all
                  ${
                    proofMethod === 'TRANSFER'
                      ? 'border-gold-500 bg-obsidian-800 text-gold-400'
                      : 'border-silver-800 bg-obsidian-900 text-silver-400'
                  }
                `}
              >
                <Icon name="refresh" size={14} />
                <span>Transferencia SPEI</span>
              </button>
              <button
                type="button"
                onClick={() => setProofMethod('DEPOSIT')}
                className={`
                  h-10 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all
                  ${
                    proofMethod === 'DEPOSIT'
                      ? 'border-gold-500 bg-obsidian-800 text-gold-400'
                      : 'border-silver-800 bg-obsidian-900 text-silver-400'
                  }
                `}
              >
                <Icon name="building" size={14} />
                <span>Depósito / Practicaja</span>
              </button>
            </div>
          </div>

          {/* 2. Monto & 3. Fecha declarada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="proofAmountInput"
              label="Monto depositado (MXN)"
              type="number"
              step="0.01"
              min="1"
              value={proofAmount}
              onChange={(e) => setProofAmount(e.target.value)}
              placeholder="0.00"
              iconStart="payment"
              required
            />

            <Input
              id="proofDateInput"
              label="Fecha del comprobante"
              type="date"
              value={proofDate}
              onChange={(e) => setProofDate(e.target.value)}
              required
            />
          </div>

          {/* 4. Referencia o Folio */}
          <Input
            id="proofReferenceInput"
            label="Número de referencia o folio de rastreo"
            placeholder="Ej. SPEI-984021 o Folio de practicaja"
            value={proofReference}
            onChange={(e) => setProofReference(e.target.value)}
            required
          />

          {/* 5. Comprobante (File upload) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-silver-300">Archivo de comprobante (PDF, JPG o PNG)</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
              id="proof-file-input"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`
                p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all
                ${
                  proofFileName
                    ? 'border-gold-500/60 bg-obsidian-800/80'
                    : 'border-silver-800 bg-obsidian-900 hover:border-silver-700'
                }
              `}
            >
              <Icon
                name={proofFileName ? 'check' : 'download'}
                size={20}
                className={proofFileName ? 'text-gold-400' : 'text-silver-500'}
              />
              {proofFileName ? (
                <span className="text-xs font-semibold text-silver-100">
                  Comprobante: {proofFileName} (clic para cambiar)
                </span>
              ) : (
                <span className="text-xs text-silver-400">
                  Haz clic para adjuntar comprobante o foto del ticket
                </span>
              )}
            </div>
          </div>

          {/* 6. Notas */}
          <TextArea
            id="proofNotesInput"
            label="Notas adicionales (Opcional)"
            placeholder="Comentarios sobre la transferencia..."
            rows={2}
            value={proofNotes}
            onChange={(e) => setProofNotes(e.target.value)}
          />

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsReportProofModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Enviar comprobante
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
