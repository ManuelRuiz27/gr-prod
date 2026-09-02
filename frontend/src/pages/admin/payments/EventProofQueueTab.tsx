import React, { useState, useMemo } from 'react';
import {
  Card,
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

export interface EventProofQueueTabProps {
  eventId: string;
  onViewGraduatePlan?: (graduateId: string) => void;
}

export const EventProofQueueTab: React.FC<EventProofQueueTabProps> = ({
  eventId,
  onViewGraduatePlan,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VisualSubmissionStatus | 'ALL'>('ALL');
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
    return VISUAL_QA_SUBMISSIONS_QUEUE.filter((s) => s.eventId === eventId);
  }, [eventId]);

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
    setIsApproveModalOpen(false);
    setSelectedSubmission(null);
    setFeedbackMessage(
      `Comprobante ${selectedSubmission.folio} aprobado en preview. La generación del movimiento financiero y su aplicación serán ejecutadas por el backend.`
    );
  };

  const handleReject = () => {
    if (!selectedSubmission || !rejectionReason.trim()) return;
    setIsRejectModalOpen(false);
    setSelectedSubmission(null);
    setRejectionReason('');
    setFeedbackMessage(
      `Comprobante ${selectedSubmission.folio} marcado como rechazado con motivo: "${rejectionReason.trim()}".`
    );
  };

  const getStatusBadge = (status: VisualSubmissionStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <Badge variant="warning" size="sm" dot>
            Pendiente de validación
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

      {/* Filter Toolbar */}
      <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-obsidian-850 border border-silver-800/80">
        <div className="w-full md:w-80">
          <Input
            placeholder="Buscar por folio, graduado o referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconStart="search"
            aria-label="Buscar comprobantes"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="w-48 shrink-0">
            <Select
              options={[
                { value: 'ALL', label: 'Todos los estados' },
                { value: 'PENDING_REVIEW', label: 'Pendiente de validación' },
                { value: 'APPROVED', label: 'Aprobado' },
                { value: 'REJECTED', label: 'Rechazado' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VisualSubmissionStatus | 'ALL')}
              aria-label="Filtrar por estado"
            />
          </div>

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
      </Card>

      {/* Submissions Table */}
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
        <div className="overflow-x-auto">
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
                  <p className="text-[11px] text-silver-400">{selectedSubmission.evidenceFileSize || '1.2 MB'} • Formato verificado</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" iconStart="download">
                    Descargar archivo
                  </Button>
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
            {onViewGraduatePlan && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const gradId = selectedSubmission.graduateId;
                    setSelectedSubmission(null);
                    onViewGraduatePlan(gradId);
                  }}
                >
                  Ver expediente financiero del graduado →
                </Button>
              </div>
            )}
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
              Aprobar este comprobante generará un movimiento financiero confirmado y su aplicación a cuotas u obligaciones será determinada por el backend.
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
