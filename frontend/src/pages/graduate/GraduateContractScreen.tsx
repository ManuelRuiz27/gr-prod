import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Badge,
  Button,
  Modal,
  Icon,
  Alert,
  EmptyState,
} from '../../design-system';
import {
  VISUAL_QA_CONTRACTS,
  type VisualContract,
  type VisualContractStatus,
} from '../../fixtures';

export interface GraduateContractScreenProps {
  contractId?: string;
}

export const GraduateContractScreen: React.FC<GraduateContractScreenProps> = ({
  contractId = 'contract-andrea-pending',
}) => {
  const [contract, setContract] = useState<VisualContract | undefined>(
    VISUAL_QA_CONTRACTS[contractId]
  );
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // If contract does not exist
  if (!contract) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans animate-fadeIn pb-20">
        <div>
          <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
            Mi Contrato
          </h1>
          <p className="text-xs text-silver-400 mt-1">
            Documento contractual vinculado a tu membresía.
          </p>
        </div>
        <EmptyState
          icon="ticket"
          title="Contrato no disponible"
          description="Aún no se ha emitido un contrato para tu membresía o el evento seleccionado."
          actionLabel="Ir al inicio"
          onAction={() => {}}
        />
      </div>
    );
  }

  const handleAcceptContract = () => {
    setIsAcceptModalOpen(false);
    // Visual-only preview transition
    setContract((prev) =>
      prev
        ? {
            ...prev,
            status: 'ACCEPTED',
            acceptedAt: new Date().toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            acceptedBy: `${prev.graduateName} (Aceptación en preview)`,
          }
        : undefined
    );
    setFeedbackMessage(
      'Confirmación validada en modo visual. La aceptación definitiva será registrada por el backend.'
    );
  };

  const getStatusBadge = (status: VisualContractStatus) => {
    switch (status) {
      case 'PENDING_ACCEPTANCE':
        return <Badge variant="warning" size="sm" dot>Pendiente de aceptación</Badge>;
      case 'ACCEPTED':
        return <Badge variant="success" size="sm">Aceptado</Badge>;
      case 'SUPERSEDED':
        return <Badge variant="neutral" size="sm">Sustituido</Badge>;
      case 'CANCELLED':
        return <Badge variant="error" size="sm">Cancelado</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans animate-fadeIn pb-20">
      {/* 1. Evento + Folio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
              Mi Contrato
            </h1>
            {getStatusBadge(contract.status)}
          </div>
          <p className="text-xs text-silver-400 mt-1">
            {contract.eventName} • {contract.career} • Generación {contract.generation}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-obsidian-900 border border-silver-800 text-xs">
            <span className="text-silver-400 block text-[10px] uppercase font-bold">Folio contractual</span>
            <span className="font-mono font-bold text-silver-100">{contract.folio || '—'}</span>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <Alert variant="info" onDismiss={() => setFeedbackMessage(null)}>
          {feedbackMessage}
        </Alert>
      )}

      {/* Contract Status Banner if Accepted / Superseded / Cancelled */}
      {contract.status === 'ACCEPTED' && (
        <Card className="p-4 bg-obsidian-850 border border-status-success/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-status-success/20 text-status-success flex items-center justify-center font-bold">
              <Icon name="check" size={18} />
            </div>
            <div>
              <span className="font-bold text-silver-100 block">Contrato formalizado y aceptado</span>
              <span className="text-[11px] text-silver-400">
                Aceptado el {contract.acceptedAt} • {contract.acceptedBy || contract.graduateName}
              </span>
            </div>
          </div>
          <Link to="/graduate/group">
            <Button variant="secondary" size="sm">
              Ver mi grupo →
            </Button>
          </Link>
        </Card>
      )}

      {contract.status === 'SUPERSEDED' && (
        <Card className="p-4 bg-obsidian-850 border border-silver-800 flex items-center gap-3 text-xs">
          <Icon name="info" size={18} className="text-silver-400 shrink-0" />
          <p className="text-silver-300">
            Este contrato fue sustituido por una versión posterior y permanece archivado exclusivamente como historial de auditoría.
          </p>
        </Card>
      )}

      {contract.status === 'CANCELLED' && (
        <Card className="p-4 bg-status-error/10 border border-status-error/30 flex items-center gap-3 text-xs">
          <Icon name="alert" size={18} className="text-status-error shrink-0" />
          <p className="text-silver-200">
            Este contrato y su membresía asociada han sido cancelados. La información mostrada es para fines de consulta histórica.
          </p>
        </Card>
      )}

      {/* 2. Resumen Contractual / Financiero */}
      <Card className="p-6 bg-obsidian-850 border border-silver-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-silver-300">
            Resumen de la Membresía
          </h2>
          <span className="text-xs text-silver-400 font-mono">Versión {contract.termsVersion}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-silver-800/60">
          <div>
            <span className="text-silver-400 block text-xs">Graduado Titular</span>
            <span className="font-bold text-silver-100 text-sm">{contract.graduateName}</span>
            <span className="text-[11px] text-silver-400 block">{contract.institution}</span>
          </div>
          <div>
            <span className="text-silver-400 block text-xs">Lugares Contratados</span>
            <span className="font-bold text-silver-100 text-sm font-sans">{contract.totalPlaces} Lugares</span>
            <span className="text-[11px] text-silver-400 block">Titular + Acompañantes</span>
          </div>
          <div>
            <span className="text-silver-400 block text-xs">Total Contratado</span>
            <span className="text-xl font-extrabold text-silver-50 font-sans block">
              ${contract.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Productos y Lugares (ContractLineItem[]) */}
      <Card className="p-6 bg-obsidian-850 border border-silver-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-silver-300">
              Productos y Lugares Incluidos
            </h2>
            <p className="text-xs text-silver-400">Desglose de conceptos contratados en tu membresía.</p>
          </div>
          <Badge variant="neutral" size="sm">
            {contract.lineItems.length} {contract.lineItems.length === 1 ? 'Concepto' : 'Conceptos'}
          </Badge>
        </div>

        <div className="divide-y divide-silver-800/60 pt-2 border-t border-silver-800/60">
          {contract.lineItems.map((item) => (
            <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-obsidian-800 border border-silver-700/60 text-gold-400 flex items-center justify-center font-bold">
                  {item.quantity}×
                </div>
                <div>
                  <span className="font-bold text-silver-100 block">{item.concept}</span>
                  <span className="text-[11px] text-silver-400">
                    Precio unitario: ${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold font-sans text-silver-100 text-sm">
                  ${item.totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Esquema de Pagos */}
      <Card className="p-6 bg-obsidian-850 border border-silver-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-silver-300">
              Esquema de Pagos Acordado
            </h2>
            <p className="text-xs text-silver-400">
              {contract.paymentScheme.installmentsCount} parcialidades programadas.
            </p>
          </div>
          <Link to="/graduate/payments">
            <Button variant="ghost" size="sm" iconStart="payment">
              Ver mis pagos →
            </Button>
          </Link>
        </div>

        <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800 text-xs space-y-2">
          <div className="flex justify-between text-silver-300">
            <span>Monto por parcialidad estimada:</span>
            <strong className="font-sans text-silver-100">
              ${contract.paymentScheme.installmentAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </strong>
          </div>
          <p className="text-silver-400 text-[11px] leading-relaxed">
            {contract.paymentScheme.dueDatesSummary}
          </p>
        </div>
      </Card>

      {/* 5. Política de Cancelación Aplicable */}
      <Card className="p-6 bg-obsidian-850 border border-silver-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-silver-300">
            Política de Cancelación Aplicable
          </h2>
          <Badge variant="neutral" size="sm">
            {contract.policyVersion}
          </Badge>
        </div>
        <p className="text-xs text-silver-300 leading-relaxed">
          {contract.cancellationPolicySummary}
        </p>
      </Card>

      {/* 6. Términos y Condiciones (Container de lectura) */}
      <Card className="p-6 bg-obsidian-850 border border-silver-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-silver-300">
              Términos del Contrato
            </h2>
            <p className="text-xs text-silver-400">
              Condiciones vinculantes al momento de emisión del contrato.
            </p>
          </div>
          <span className="text-[11px] font-mono text-silver-400">{contract.termsVersion}</span>
        </div>

        <div
          tabIndex={0}
          aria-label="Términos y condiciones del contrato"
          className="max-h-72 overflow-y-auto p-4 bg-obsidian-900 rounded-card border border-silver-800 text-xs text-silver-300 space-y-4 leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
        >
          {contract.termsSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="font-bold text-silver-100">{section.title}</h3>
              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-silver-300">{p}</p>
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* 7. Aceptación CTA (When PENDING_ACCEPTANCE) */}
      {contract.status === 'PENDING_ACCEPTANCE' && (
        <div className="p-6 bg-obsidian-850 border border-gold-500/40 rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-sm font-bold text-silver-50 block">Formaliza tu contrato</span>
            <p className="text-xs text-silver-400">
              Al aceptar el contrato, confirmas tu conformidad con los términos y el esquema de pagos.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            iconStart="check"
            onClick={() => {
              setHasConfirmedCheckbox(false);
              setIsAcceptModalOpen(true);
            }}
          >
            Aceptar contrato
          </Button>
        </div>
      )}

      {/* Modal de Confirmación de Aceptación (UX-G-CON-002) */}
      <Modal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        title="Confirmar aceptación de contrato"
        description="Revisa y confirma que aceptas las condiciones mostradas."
        size="md"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-3.5 bg-obsidian-900 border border-silver-800 rounded-card space-y-2">
            <div className="flex justify-between">
              <span className="text-silver-400">Folio:</span>
              <span className="font-mono font-bold text-silver-100">{contract.folio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver-400">Lugares contratados:</span>
              <span className="font-bold font-sans text-silver-100">{contract.totalPlaces} Lugares</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver-400">Total contractual:</span>
              <span className="font-bold font-sans text-gold-400 text-sm">
                ${contract.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver-400">Versión aplicable:</span>
              <span className="font-mono text-silver-300">{contract.termsVersion}</span>
            </div>
          </div>

          <label className="flex items-start gap-3 p-3 bg-obsidian-900 rounded-card border border-silver-800 cursor-pointer">
            <input
              type="checkbox"
              checked={hasConfirmedCheckbox}
              onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
              className="mt-0.5 rounded border-silver-700 bg-obsidian-800 text-gold-500 focus:ring-gold-500 h-4 w-4"
              id="confirm-contract-checkbox"
            />
            <span className="text-xs text-silver-200 leading-relaxed">
              He leído y acepto los términos y condiciones de mi contrato de graduación y el esquema de pagos establecido.
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAcceptModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!hasConfirmedCheckbox}
              onClick={handleAcceptContract}
            >
              Aceptar y continuar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
