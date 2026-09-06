import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Input,
  Select,
  Badge,
  Button,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
  Drawer,
  Modal,
  Icon,
  Alert,
} from '../../../design-system';
import {
  VISUAL_QA_SUBMISSIONS_QUEUE,
  type VisualPaymentSubmission,
  type VisualSubmissionStatus,
  type VisualSubmissionMethod,
} from '../../../fixtures';
import { demoApi } from '../../../demo/apiClient';
import { useDemo } from '../../../demo/useDemo';
import { isMockDataMode } from '../../../demo/config';

export interface EventProofQueueTabProps {
  eventId: string;
  onViewGraduatePlan?: (graduateId: string) => void;
}

export const EventProofQueueTab: React.FC<EventProofQueueTabProps> = ({
  eventId,
  onViewGraduatePlan: _onViewGraduatePlan,
}) => {
  const navigate = useNavigate();
  const { state: demoState } = useDemo();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VisualSubmissionStatus | 'ALL'>('PENDING_REVIEW');
  const [methodFilter, setMethodFilter] = useState<VisualSubmissionMethod | 'ALL'>('ALL');

  // Selected submission for drawer
  const [selectedSubmission, setSelectedSubmission] = useState<VisualPaymentSubmission | null>(null);

  // Approval Modal State
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Scoped submissions
  const eventSubmissions = useMemo(() => {
    const submissions = isMockDataMode ? demoState.payment_submissions : VISUAL_QA_SUBMISSIONS_QUEUE;
    return submissions.filter((s) => s.eventId === eventId);
  }, [demoState.payment_submissions, eventId]);

  const filteredSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return eventSubmissions.filter((sub) => {
      const matchSearch =
        !query ||
        sub.graduateName.toLowerCase().includes(query) ||
        sub.folio.toLowerCase().includes(query) ||
        sub.reference.toLowerCase().includes(query);

      if (!matchSearch) return false;

      if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
      if (methodFilter !== 'ALL' && sub.method !== methodFilter) return false;

      return true;
    });
  }, [eventSubmissions, search, statusFilter, methodFilter]);

  const pendingCount = useMemo(() => {
    return eventSubmissions.filter((s) => s.status === 'PENDING_REVIEW').length;
  }, [eventSubmissions]);

  const handleApprove = () => {
    if (!selectedSubmission) return;
    if (isMockDataMode) void demoApi.approveSubmission(selectedSubmission.id);
    setIsApproveModalOpen(false);
    setSelectedSubmission(null);
    setFeedbackMessage(`Comprobante ${selectedSubmission.folio} aprobado.`);
  };

  const handleReject = () => {
    if (!selectedSubmission || !rejectionReason.trim()) return;
    if (isMockDataMode) void demoApi.rejectSubmission(selectedSubmission.id, rejectionReason.trim());
    setIsRejectModalOpen(false);
    setSelectedSubmission(null);
    setRejectionReason('');
    setFeedbackMessage(
      `Comprobante ${selectedSubmission.folio} rechazado. Motivo registrado: "${rejectionReason.trim()}".`
    );
  };

  const getStatusBadge = (status: VisualSubmissionStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <Badge variant="warning" size="sm" dot>
            Pendiente de validar
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="success" size="sm">
            Aprobado
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="error" size="sm">
            Rechazado
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="neutral" size="sm">
            Cancelado
          </Badge>
        );
    }
  };

  const getMethodLabel = (method: VisualSubmissionMethod) => {
    switch (method) {
      case 'TRANSFER':
        return 'Transferencia';
      case 'DEPOSIT':
        return 'Depósito';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-display text-silver-50 tracking-tight">
              Comprobantes por validar
            </h2>
            {pendingCount > 0 && (
              <Badge variant="warning" size="sm">
                {pendingCount} pendientes
              </Badge>
            )}
          </div>
          <p className="text-xs text-silver-400 mt-0.5">
            Cola de revisión para depósitos y transferencias reportados por los graduados.
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <Alert variant="info" onDismiss={() => setFeedbackMessage(null)}>
          {feedbackMessage}
        </Alert>
      )}

      {/* Filter Toolbar — Flat */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-silver-800 pb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Quick toggle buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant={statusFilter === 'PENDING_REVIEW' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('PENDING_REVIEW')}
            >
              Pendientes {pendingCount > 0 && `(${pendingCount})`}
            </Button>
            <Button
              variant={statusFilter === 'ALL' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('ALL')}
            >
              Ver historial
            </Button>
          </div>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Buscar por folio, graduado o referencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              iconStart="search"
              aria-label="Buscar comprobantes"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="w-44 shrink-0">
            <Select
              options={[
                { value: 'ALL', label: 'Todos los métodos' },
                { value: 'TRANSFER', label: 'Transferencia' },
                { value: 'DEPOSIT', label: 'Depósito' },
              ]}
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as VisualSubmissionMethod | 'ALL')}
              aria-label="Filtrar por método"
            />
          </div>
        </div>
      </div>

      {/* Submissions Table / Mobile List */}
      {filteredSubmissions.length === 0 ? (
        <EmptyState
          icon="search"
          title="No hay comprobantes para mostrar"
          description="No se encontraron solicitudes de validación de pago con los filtros seleccionados."
          actionLabel="Restablecer filtros"
          onAction={() => {
            setSearch('');
            setStatusFilter('ALL');
            setMethodFilter('ALL');
          }}
        />
      ) : (
        <>
          {/* Desktop Table (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader className="whitespace-nowrap">Folio</TableHeader>
                  <TableHeader className="whitespace-nowrap">Graduado</TableHeader>
                  <TableHeader className="whitespace-nowrap text-right">Monto reportado</TableHeader>
                  <TableHeader className="whitespace-nowrap">Método</TableHeader>
                  <TableHeader className="whitespace-nowrap">Fecha declarada</TableHeader>
                  <TableHeader className="whitespace-nowrap">Referencia</TableHeader>
                  <TableHeader className="whitespace-nowrap">Estado</TableHeader>
                  <TableHeader className="whitespace-nowrap text-right">Acción</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.map((sub) => (
                  <TableRow
                    key={sub.id}
                    className="hover:bg-obsidian-800/60 cursor-pointer transition-colors"
                    onClick={() => setSelectedSubmission(sub)}
                  >
                    <TableCell className="font-mono text-xs text-silver-300">
                      {sub.folio}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-silver-100 truncate">
                          {sub.graduateName}
                        </span>
                        <span className="text-[11px] text-silver-400 truncate">
                          {sub.career}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-sans font-bold text-silver-100">
                      ${sub.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </TableCell>
                    <TableCell className="text-xs text-silver-300">
                      {getMethodLabel(sub.method)}
                    </TableCell>
                    <TableCell className="text-xs text-silver-300">
                      {sub.declaredDate}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-silver-300">
                      {sub.reference}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(sub.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubmission(sub);
                        }}
                      >
                        Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Dense List (< 768px) */}
          <div className="block md:hidden divide-y divide-silver-800/60 bg-obsidian-900/60 rounded-xl border border-silver-800/80">
            {filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-obsidian-800/40 transition-colors"
                onClick={() => setSelectedSubmission(sub)}
              >
                <div className="flex flex-col min-w-0 space-y-0.5">
                  <span className="font-mono text-xs text-gold-400 font-semibold">{sub.folio}</span>
                  <span className="font-semibold text-silver-100 text-sm truncate">{sub.graduateName}</span>
                  <span className="text-xs text-silver-300">
                    ${sub.amount.toLocaleString('es-MX', { minimumFractionDigits: 0 })} · {getMethodLabel(sub.method)}
                  </span>
                  <span className="text-[11px] text-silver-400">{sub.declaredDate}</span>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {getStatusBadge(sub.status)}
                  <span className="text-xs font-semibold text-gold-400 flex items-center gap-0.5">
                    Revisar →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Drawer: Submission Detail & Evidence Preview */}
      <Drawer
        isOpen={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        title={selectedSubmission ? `Comprobante ${selectedSubmission.folio}` : 'Detalle'}
        description="Revisión de evidencia de pago reportada por graduado."
        size="lg"
        footer={
          selectedSubmission && (
            <div className="flex items-center justify-between gap-3 w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedSubmission(null)}
              >
                Cerrar
              </Button>

              {selectedSubmission.status === 'PENDING_REVIEW' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setIsRejectModalOpen(true)}
                  >
                    Rechazar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsApproveModalOpen(true)}
                  >
                    Aprobar comprobante
                  </Button>
                </div>
              )}
            </div>
          )
        }
      >
        {selectedSubmission && (
          <div className="space-y-6 text-xs font-sans">
            {/* Status Alert Banner */}
            <div className="p-4 bg-obsidian-900 border border-silver-800 rounded-card flex items-center justify-between">
              <div>
                <span className="text-silver-400 block">Estado actual:</span>
                <span className="font-bold text-silver-100 text-sm">
                  {getStatusBadge(selectedSubmission.status)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-silver-400 block">Monto declarado:</span>
                <span className="text-lg font-bold font-sans text-gold-400">
                  ${selectedSubmission.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>

            {/* Graduate & Financial Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-obsidian-900 border border-silver-800 rounded-card">
              <div>
                <span className="text-silver-400 block">Graduado:</span>
                <span className="text-sm font-bold text-silver-100">{selectedSubmission.graduateName}</span>
                <span className="text-[11px] text-silver-400 block">{selectedSubmission.graduateEmail}</span>
              </div>
              <div>
                <span className="text-silver-400 block">Método:</span>
                <span className="text-sm font-semibold text-silver-100">
                  {getMethodLabel(selectedSubmission.method)}
                </span>
              </div>
              <div>
                <span className="text-silver-400 block">Fecha declarada:</span>
                <span className="text-sm font-semibold text-silver-100">{selectedSubmission.declaredDate}</span>
              </div>
              <div>
                <span className="text-silver-400 block">Referencia bancaria:</span>
                <span className="text-sm font-mono font-semibold text-silver-100">{selectedSubmission.reference}</span>
              </div>
              {selectedSubmission.notes && (
                <div className="sm:col-span-2 pt-2 border-t border-silver-800/60">
                  <span className="text-silver-400 block">Notas del graduado:</span>
                  <p className="text-silver-200 mt-1">{selectedSubmission.notes}</p>
                </div>
              )}
            </div>

            {/* Evidence Preview Box */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-silver-300">Evidencia de pago adjunta</span>
              <div className="p-6 bg-obsidian-900 border border-silver-800 rounded-card flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-obsidian-800 border border-silver-700/60 flex items-center justify-center text-gold-400">
                  <Icon name="payment" size={28} />
                </div>
                <div>
                  <p className="font-semibold text-silver-100">{selectedSubmission.evidenceFileName}</p>
                  {selectedSubmission.evidenceFileSize && (
                    <p className="text-[11px] text-silver-400 mt-0.5">{selectedSubmission.evidenceFileSize}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rejection Details (if rejected) */}
            {selectedSubmission.status === 'REJECTED' && selectedSubmission.rejectionReason && (
              <div className="p-4 bg-status-error/10 border border-status-error/30 rounded-card space-y-1">
                <span className="font-bold text-status-error block">Motivo de rechazo:</span>
                <p className="text-silver-200">{selectedSubmission.rejectionReason}</p>
                {selectedSubmission.reviewedAt && (
                  <span className="text-[11px] text-silver-400 block pt-1">
                    Revisado el {selectedSubmission.reviewedAt} por {selectedSubmission.reviewedBy}
                  </span>
                )}
              </div>
            )}

            {/* Expediente Link */}
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const gradId = selectedSubmission.graduateId;
                  setSelectedSubmission(null);
                  navigate(`/admin/events/${eventId}/graduates/${gradId}`);
                }}
              >
                Ver expediente del graduado →
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Aprobar comprobante de pago"
        description="Confirmación administrativa de recepción de fondos."
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-3.5 bg-status-warning/10 border border-status-warning/30 rounded-card space-y-1 text-silver-200">
            <span className="font-bold text-status-warning block">Aviso importante</span>
            <p className="leading-relaxed">
              Aprobar este comprobante confirmará la recepción de fondos y registrará el movimiento financiero correspondiente para el graduado.
            </p>
          </div>

          {selectedSubmission && (
            <div className="p-3 bg-obsidian-900 rounded-card border border-silver-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-silver-400">Graduado:</span>
                <span className="font-semibold text-silver-100">{selectedSubmission.graduateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Monto:</span>
                <span className="font-bold font-sans text-silver-100">
                  ${selectedSubmission.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Referencia:</span>
                <span className="font-mono text-silver-100">{selectedSubmission.reference}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsApproveModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
            >
              Confirmar aprobación
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal with Mandatory Reason */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Rechazar comprobante de pago"
        description="Especifica el motivo claro por el cual el comprobante no es válido."
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="p-3 bg-status-error/10 border border-status-error/30 rounded-card text-status-error">
            <p className="leading-relaxed">
              El graduado podrá ver este motivo en su Centro de Pagos para corregir su comprobante o comunicarse con administración.
            </p>
          </div>

          <Input
            id="rejectionReasonInput"
            label="Motivo de rechazo (obligatorio)"
            placeholder="Ej. Referencia no coincide con el estado de cuenta bancario / imagen ilegible"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!rejectionReason.trim()}
              onClick={handleReject}
            >
              Confirmar rechazo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
