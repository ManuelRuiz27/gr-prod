import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Badge,
  EmptyState,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Icon,
  Tabs,
  Button,
  Modal,
  Input,
  Select,
  Alert,
} from '../../../design-system';
import {
  mockEvents,
  mockGraduatesList,
  VISUAL_QA_GRADUATE_RECORDS,
  type InternalNoteMock,
  type GraduateGroupMemberMock,
} from '../../../fixtures';
import { getThermoStatusPresentation } from '../../../lib/thermoStatusPresentation';
import { CancelMembershipModal } from '../cancellation/CancelMembershipModal';

export const AdminGraduateOverviewScreen: React.FC = () => {
  const { eventId, graduateId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('resumen');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState('');

  // Note Modal State
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [localNotes, setLocalNotes] = useState<InternalNoteMock[]>([]);

  // Meal Override Modal State
  const [isMealOverrideModalOpen, setIsMealOverrideModalOpen] = useState(false);
  const [overrideMember, setOverrideMember] = useState<GraduateGroupMemberMock | null>(null);
  const [overrideMeal, setOverrideMeal] = useState('Tradicional');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideFeedback, setOverrideFeedback] = useState('');

  const event = mockEvents.find((item) => item.id === eventId);
  const graduate = mockGraduatesList.find(
    (item) => item.id === graduateId && item.eventId === eventId
  );

  if (!event || !graduate) {
    return (
      <div className="flex flex-col gap-6 font-sans animate-fadeIn">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: 'Graduados', href: `/admin/events/${eventId || ''}/graduates` },
            { label: 'Graduado no encontrado', current: true },
          ]}
        />
        <EmptyState
          icon="search"
          title="Graduado no encontrado"
          description="No encontramos este graduado dentro del evento."
          actionLabel="Volver a graduados"
          onAction={() => navigate(`/admin/events/${eventId || ''}/graduates`)}
        />
      </div>
    );
  }

  const visualRecord = VISUAL_QA_GRADUATE_RECORDS[graduate.id];
  const folio = visualRecord?.folio || '—';
  const phone = visualRecord?.phone || '—';
  const total = visualRecord?.totalAmount || '—';
  const paid = visualRecord?.paidAmount || '—';
  const balance = visualRecord?.balanceAmount || '—';
  const overdue = visualRecord?.overdueAmount || '—';
  const membershipStatus = visualRecord?.membershipStatus || 'ACTIVE';
  const contractStatus = visualRecord?.contractStatus || 'ACCEPTED';
  const hasPendingProof = visualRecord?.hasPendingProof ?? false;

  const thermo = getThermoStatusPresentation(graduate.thermoStatus);

  const allNotes = [...(visualRecord?.notes || []), ...localNotes];
  const allAuditLogs = visualRecord?.auditLogs || [];

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    const note: InternalNoteMock = {
      id: `not-loc-${Date.now()}`,
      author: 'Administrador GR',
      createdAt: new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }),
      content: newNoteContent.trim(),
    };
    setLocalNotes((prev) => [note, ...prev]);
    setNewNoteContent('');
    setIsAddNoteModalOpen(false);
  };

  const handleConfirmMealOverride = () => {
    if (!overrideReason.trim()) return;
    setIsMealOverrideModalOpen(false);
    setOverrideFeedback('El cambio de menú administrativo fue registrado con motivo.');
  };

  const tabItems = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'contrato', label: 'Contrato' },
    { id: 'grupo', label: 'Grupo / productos' },
    { id: 'pagos', label: 'Pagos' },
    { id: 'mesa', label: 'Mesa' },
    { id: 'platillos', label: 'Platillos' },
    { id: 'termo', label: 'Termo' },
    { id: 'notas', label: `Notas (${allNotes.length})` },
    { id: 'historial', label: 'Historial' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto font-sans animate-fadeIn pb-16">
      {/* Breadcrumb Hierarchy */}
      <Breadcrumb
        items={[
          { label: 'Plataforma GR', href: '/admin' },
          { label: 'Eventos', href: '/admin/events' },
          { label: event.name, href: `/admin/events/${event.id}` },
          { label: 'Graduados', href: `/admin/events/${event.id}/graduates` },
          { label: graduate.fullName, current: true },
        ]}
      />

      {cancelFeedback && (
        <Alert variant="info" onDismiss={() => setCancelFeedback('')}>
          {cancelFeedback}
        </Alert>
      )}

      {overrideFeedback && (
        <Alert variant="success" onDismiss={() => setOverrideFeedback('')}>
          {overrideFeedback}
        </Alert>
      )}

      {/* Header Banner */}
      <div className="p-6 md:p-8 space-y-4 bg-obsidian-850 border border-silver-800/80 rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-silver-300 font-semibold bg-obsidian-900 px-2.5 py-1 rounded-md border border-silver-800/80">
                Folio: {folio}
              </span>
              <Badge
                variant={
                  membershipStatus === 'ACTIVE'
                    ? 'success'
                    : membershipStatus === 'COMPLETED'
                    ? 'primary'
                    : 'error'
                }
                size="sm"
              >
                {membershipStatus === 'ACTIVE'
                  ? 'Membresía Activa'
                  : membershipStatus === 'COMPLETED'
                  ? 'Membresía Completada'
                  : 'Membresía Cancelada'}
              </Badge>
              {hasPendingProof && (
                <Badge variant="warning" size="sm" dot>
                  Comprobante por revisar
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-silver-50 tracking-tight font-display">
              {graduate.fullName}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-silver-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Icon name="mail" size={14} className="text-gold-400 shrink-0" />
                <span>{graduate.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="phone" size={14} className="text-gold-400 shrink-0" />
                <span>{phone}</span>
              </div>
              {graduate.career && (
                <div className="flex items-center gap-1.5">
                  <Icon name="building" size={14} className="text-gold-400 shrink-0" />
                  <span>
                    {graduate.career}
                    {graduate.generation ? ` • Gen. ${graduate.generation}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link to={`/admin/events/${event.id}/payments`}>
              <Button variant="primary" size="sm" iconStart="payment">
                Registrar pago
              </Button>
            </Link>
            {hasPendingProof && (
              <Link to={`/admin/events/${event.id}/payments`}>
                <Button variant="secondary" size="sm" iconStart="ticket">
                  Revisar comprobante
                </Button>
              </Link>
            )}
            <Button
              variant="danger"
              size="sm"
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
            >
              Cancelar membresía
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        tabs={tabItems}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="line"
      />

      {/* Tab Content */}
      <main className="space-y-6">
        {/* TAB 1: RESUMEN */}
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            {/* 4 Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 flex flex-col justify-between gap-3 bg-obsidian-850 border border-silver-800/80 rounded-lg">
                <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
                  Lugares activos
                </span>
                <div>
                  <span className="text-3xl font-extrabold text-silver-50 font-sans">
                    {graduate.ticketCount}
                  </span>
                </div>
                <span className="text-[11px] text-silver-400 border-t border-silver-800/40 pt-1.5">
                  Lugares contratados
                </span>
              </div>

              <div className="p-5 flex flex-col justify-between gap-3 bg-obsidian-850 border border-silver-800/80 rounded-lg">
                <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
                  Mesa
                </span>
                <div>
                  <span className="text-2xl font-bold text-silver-50 font-sans">
                    {graduate.tableNumber ? `Mesa ${graduate.tableNumber}` : 'Sin mesa'}
                  </span>
                </div>
                <span className="text-[11px] text-silver-400 border-t border-silver-800/40 pt-1.5">
                  {graduate.tableNumber ? 'Asignación confirmada' : 'Pendiente de asignar'}
                </span>
              </div>

              <div className="p-5 flex flex-col justify-between gap-3 bg-obsidian-850 border border-silver-800/80 rounded-lg">
                <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
                  Grupo
                </span>
                <div>
                  <span className="text-2xl font-bold text-silver-50 font-sans">
                    {graduate.guests.length} integrantes
                  </span>
                </div>
                <span className="text-[11px] text-silver-400 border-t border-silver-800/40 pt-1.5">
                  Registrados en el grupo
                </span>
              </div>

              <div className="p-5 flex flex-col justify-between gap-3 bg-obsidian-850 border border-silver-800/80 rounded-lg">
                <span className="text-xs font-semibold uppercase tracking-wider text-silver-400">
                  Termo
                </span>
                <div>
                  <span className="text-2xl font-bold text-silver-50 font-sans">
                    {thermo.label}
                  </span>
                </div>
                <Badge variant={thermo.tone} size="sm" className="self-start">
                  {thermo.label}
                </Badge>
              </div>
            </div>

            {/* Resumen Financiero */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-silver-50">Resumen financiero</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 space-y-2 bg-obsidian-850 border border-silver-800/80 rounded-lg">
                  <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
                    Contratado
                  </span>
                  <div className="text-2xl font-bold text-silver-50 font-sans">{total}</div>
                </div>

                <div className="p-5 space-y-2 bg-obsidian-850 border border-silver-800/80 rounded-lg">
                  <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
                    Pagado
                  </span>
                  <div className="text-2xl font-bold text-silver-50 font-sans">{paid}</div>
                </div>

                <div className="p-5 space-y-2 bg-obsidian-850 border border-silver-800/80 rounded-lg">
                  <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
                    Pendiente
                  </span>
                  <div className="text-2xl font-bold text-silver-50 font-sans">{balance}</div>
                </div>

                <div className="p-5 space-y-2 bg-obsidian-850 border border-silver-800/80 rounded-lg">
                  <span className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
                    Vencido
                  </span>
                  <div className="text-2xl font-bold text-silver-50 font-sans">{overdue}</div>
                </div>
              </div>
              {!visualRecord?.totalAmount && (
                <p className="text-xs text-silver-400">
                  Disponible al integrar el expediente financiero.
                </p>
              )}
            </div>

            {/* Grupo Overview */}
            <div className="p-6 space-y-4 bg-obsidian-850 border border-silver-800/80 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-silver-50">Grupo</h2>
                  <p className="text-xs text-silver-400">
                    Integrantes registrados bajo la membresía del graduado.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setActiveTab('grupo')}
                  iconEnd="chevron-right"
                >
                  Ver grupo completo
                </Button>
              </div>

              {graduate.guests.length === 0 ? (
                <p className="text-xs text-silver-400 py-4 text-center">
                  No hay integrantes registrados en el grupo.
                </p>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Nombre</TableHeader>
                      <TableHeader>Platillo</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {graduate.guests.map((guest, idx) => (
                      <TableRow key={guest.id || idx}>
                        <TableCell className="font-semibold text-silver-100">
                          {guest.name}
                        </TableCell>
                        <TableCell className="text-silver-300">
                          {guest.meal}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CONTRATO */}
        {activeTab === 'contrato' && (
          <div className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80 rounded-xl">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-silver-50">Contrato digital</h2>
              <p className="text-xs text-silver-400">
                Estatus formal y versión del contrato firmado por el graduado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-2">
                <span className="text-silver-400 block">Folio del contrato:</span>
                <span className="text-sm font-bold font-mono text-silver-100">{folio}</span>
              </div>

              <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-2">
                <span className="text-silver-400 block">Estado del contrato:</span>
                <Badge
                  variant={contractStatus === 'ACCEPTED' ? 'success' : 'warning'}
                  size="sm"
                >
                  {contractStatus === 'ACCEPTED' ? 'Aceptado digitalmente' : 'Pendiente de aceptación'}
                </Badge>
              </div>

              <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-2">
                <span className="text-silver-400 block">Versión de términos:</span>
                <span className="text-sm font-semibold text-silver-100">
                  {visualRecord?.contractVersion || 'v1.2'}
                </span>
              </div>

              <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-2">
                <span className="text-silver-400 block">Fecha de aceptación:</span>
                <span className="text-sm font-semibold text-silver-100">
                  {visualRecord?.contractAcceptedAt || 'Pendiente de aceptación'}
                </span>
              </div>

              <div className="md:col-span-2 p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-2">
                <span className="text-silver-400 block">Política de cancelación vinculada:</span>
                <span className="text-sm font-semibold text-silver-100">
                  {visualRecord?.cancellationPolicyVersion || 'POL-CAN-2027-V1 (Estándar)'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GRUPO / PRODUCTOS */}
        {activeTab === 'grupo' && (
          <div className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-silver-50">Grupo e integrantes</h2>
                <p className="text-xs text-silver-400">
                  Desglose de los {graduate.ticketCount} lugares contratados y sus integrantes asignados.
                </p>
              </div>
              <Badge variant="gold" size="sm">
                {graduate.guests.length} de {graduate.ticketCount} lugares asignados
              </Badge>
            </div>

            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Nombre</TableHeader>
                  <TableHeader>Producto / Tipo</TableHeader>
                  <TableHeader>Mesa</TableHeader>
                  <TableHeader>Platillo</TableHeader>
                  <TableHeader>Estado</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {visualRecord?.guests && visualRecord.guests.length > 0 ? (
                  visualRecord.guests.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-semibold text-silver-100">
                        {member.name}
                      </TableCell>
                      <TableCell className="text-xs text-silver-300">
                        {member.productType}
                      </TableCell>
                      <TableCell className="text-xs text-silver-300">
                        {member.tableNumber ? `Mesa ${member.tableNumber}` : 'Sin mesa'}
                      </TableCell>
                      <TableCell className="text-xs text-silver-300">
                        {member.meal}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" size="sm">
                          {member.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  graduate.guests.map((guest, idx) => (
                    <TableRow key={guest.id || idx}>
                      <TableCell className="font-semibold text-silver-100">
                        {guest.name}
                      </TableCell>
                      <TableCell className="text-xs text-silver-300">
                        Boleto Adulto
                      </TableCell>
                      <TableCell className="text-xs text-silver-300">
                        {graduate.tableNumber ? `Mesa ${graduate.tableNumber}` : 'Sin mesa'}
                      </TableCell>
                      <TableCell className="text-xs text-silver-300">
                        {guest.meal}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" size="sm">
                          Confirmado
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* TAB 4: PAGOS */}
        {activeTab === 'pagos' && (
          <div className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-silver-50">Estado de cuenta y pagos</h2>
                <p className="text-xs text-silver-400">
                  Plan de pagos, aportaciones y validación de comprobantes.
                </p>
              </div>
              <Link to={`/admin/events/${event.id}/payments`}>
                <Button variant="secondary" size="sm" iconStart="payment">
                  Ver / gestionar pagos
                </Button>
              </Link>
            </div>

            {hasPendingProof && visualRecord?.pendingProofDetails && (
              <div className="p-4 bg-status-warning/10 border border-status-warning/30 rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon name="alert" size={16} className="text-status-warning" />
                    <span className="text-xs font-bold text-silver-100">Comprobante de pago pendiente de revisión</span>
                  </div>
                  <p className="text-xs text-silver-300">
                    Monto: {visualRecord.pendingProofDetails.amount} • Ref: {visualRecord.pendingProofDetails.reference} • Fecha: {visualRecord.pendingProofDetails.date}
                  </p>
                </div>
                <Link to={`/admin/events/${event.id}/payments`}>
                  <Button variant="primary" size="sm">
                    Revisar en pagos
                  </Button>
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-1">
                <span className="text-xs text-silver-400">Total contratado:</span>
                <span className="text-xl font-bold font-sans text-silver-100 block">{total}</span>
              </div>
              <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-1">
                <span className="text-xs text-silver-400">Total pagado:</span>
                <span className="text-xl font-bold font-sans text-status-success block">{paid}</span>
              </div>
              <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-1">
                <span className="text-xs text-silver-400">Saldo pendiente:</span>
                <span className="text-xl font-bold font-sans text-silver-100 block">{balance}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MESA */}
        {activeTab === 'mesa' && (
          <div className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-silver-50">Mesa y croquis</h2>
                <p className="text-xs text-silver-400">
                  Ubicación y asignación de mesa para el graduado y sus acompañantes.
                </p>
              </div>
              <Link to={`/admin/events/${event.id}/tables`}>
                <Button variant="secondary" size="sm" iconStart="building">
                  Gestionar mesa en croquis
                </Button>
              </Link>
            </div>

            <div className="p-6 bg-obsidian-900 rounded-card border border-silver-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-obsidian-800 text-gold-400 border border-silver-700/60 flex items-center justify-center font-bold text-lg">
                  {graduate.tableNumber || '—'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-silver-100">
                    {graduate.tableNumber ? `Mesa ${graduate.tableNumber}` : 'Sin mesa asignada'}
                  </h3>
                  <p className="text-xs text-silver-400">
                    {graduate.ticketCount} lugares contemplados para esta membresía.
                  </p>
                </div>
              </div>
              <Badge variant={graduate.tableNumber ? 'success' : 'warning'} size="sm">
                {graduate.tableNumber ? 'Mesa asignada' : 'Pendiente de ubicar'}
              </Badge>
            </div>
          </div>
        )}

        {/* TAB 6: PLATILLOS */}
        {activeTab === 'platillos' && (
          <div className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-silver-50">Selección de platillos</h2>
                <p className="text-xs text-silver-400">
                  Menús asignados por integrante del grupo para el banquete.
                </p>
              </div>
            </div>

            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Integrante</TableHeader>
                  <TableHeader>Menú actual</TableHeader>
                  <TableHeader className="text-right">Acción</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {graduate.guests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-semibold text-silver-100">
                      {guest.name}
                    </TableCell>
                    <TableCell className="text-silver-300">
                      <Badge variant="neutral" size="sm">
                        {guest.meal}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => {
                          setOverrideMember({
                            id: guest.id,
                            name: guest.name,
                            meal: guest.meal,
                            productType: 'Boleto Adulto',
                            tableNumber: graduate.tableNumber,
                            status: 'Confirmado',
                          });
                          setOverrideMeal(guest.meal);
                          setOverrideReason('');
                          setIsMealOverrideModalOpen(true);
                        }}
                      >
                        Modificar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* TAB 7: TERMO */}
        {activeTab === 'termo' && (
          <div className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80 rounded-xl">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-silver-50">Termo conmemorativo</h2>
              <p className="text-xs text-silver-400">
                Estatus de personalización, umbral y entrega de la pieza grabada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-2">
                <span className="text-silver-400 block">Estado del termo:</span>
                <Badge variant={thermo.tone} size="sm">
                  {thermo.label}
                </Badge>
              </div>

              <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-2">
                <span className="text-silver-400 block">Umbral de desbloqueo:</span>
                <span className="text-sm font-semibold font-sans text-silver-100">
                  {graduate.thermoThreshold}% de pago del evento
                </span>
              </div>

              <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-2">
                <span className="text-silver-400 block">Nombre grabado:</span>
                <span className="text-sm font-semibold text-silver-100">
                  {graduate.thermoCustomName || graduate.fullName}
                </span>
              </div>

              <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-2">
                <span className="text-silver-400 block">Control de entrega:</span>
                <span className="text-sm font-semibold text-silver-100">
                  {graduate.thermoStatus === 'DELIVERED' ? 'Entregado a graduado' : 'Pendiente de entrega en evento'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: NOTAS */}
        {activeTab === 'notas' && (
          <div className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-silver-50">Notas internas administrativas</h2>
                <p className="text-xs text-silver-400">
                  Comentarios y seguimiento operativo exclusivo del staff de administración.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                type="button"
                onClick={() => setIsAddNoteModalOpen(true)}
                iconStart="plus"
              >
                Agregar nota
              </Button>
            </div>

            {allNotes.length === 0 ? (
              <p className="text-xs text-silver-400 py-6 text-center">
                Aún no hay notas registradas para este graduado.
              </p>
            ) : (
              <div className="space-y-3">
                {allNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gold-400">{note.author}</span>
                      <span className="text-[11px] text-silver-400">{note.createdAt}</span>
                    </div>
                    <p className="text-silver-200 leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 9: HISTORIAL */}
        {activeTab === 'historial' && (
          <div className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80 rounded-xl">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-silver-50">Historial y auditoría</h2>
              <p className="text-xs text-silver-400">
                Registro cronológico de eventos y acciones administrativas sobre el expediente.
              </p>
            </div>

            {allAuditLogs.length === 0 ? (
              <p className="text-xs text-silver-400 py-6 text-center">
                Sin registros de auditoría históricos.
              </p>
            ) : (
              <div className="space-y-3">
                {allAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-silver-100">{log.action}</span>
                      <span className="text-[11px] text-silver-400">{log.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2 text-silver-300">
                      <span>Actor: <strong className="text-silver-200">{log.actor}</strong></span>
                      <span>•</span>
                      <span>Contexto: {log.context}</span>
                    </div>
                    {log.reason && (
                      <p className="text-silver-400 pt-1 border-t border-silver-800/60">
                        Motivo: {log.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cancel Membership Modal (Quote-First Flow) */}
      <CancelMembershipModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        graduateId={graduate.id}
        graduateName={graduate.fullName}
        contractFolio={visualRecord?.contractFolio || '—'}
        eventName={event.name}
        onConfirmSuccess={(feedback) => {
          setCancelFeedback(feedback);
        }}
      />

      {/* Add Internal Note Modal */}
      <Modal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        title="Agregar nota interna"
        description="Registra un comentario administrativo sobre este expediente."
      >
        <div className="space-y-4 text-xs font-sans">
          <Input
            id="noteContent"
            label="Contenido de la nota"
            placeholder="Ej. Se acordó prórroga para selección de menú hasta el viernes."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800/80">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsAddNoteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              disabled={!newNoteContent.trim()}
              onClick={handleAddNote}
            >
              Guardar nota
            </Button>
          </div>
        </div>
      </Modal>

      {/* Meal Override Modal */}
      {overrideMember && (
        <Modal
          isOpen={isMealOverrideModalOpen}
          onClose={() => setIsMealOverrideModalOpen(false)}
          title={`Modificar menú: ${overrideMember.name}`}
          description="Override administrativo de platillo con registro de motivo."
        >
          <div className="space-y-4 text-xs font-sans">
            <Select
              id="overrideMealSelect"
              label="Nueva opción de menú"
              value={overrideMeal}
              onChange={(e) => setOverrideMeal(e.target.value)}
              options={[
                { label: 'Menú Tradicional', value: 'Tradicional' },
                { label: 'Menú Vegano', value: 'Vegano' },
                { label: 'Menú Vegetariano', value: 'Vegetariano' },
                { label: 'Menú Infantil', value: 'Infantil' },
              ]}
            />

            <Input
              id="overrideReasonInput"
              label="Motivo del cambio administrativo"
              placeholder="Ej. Solicitud por alergia alimentaria notificada por graduado"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800/80">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsMealOverrideModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="button"
                disabled={!overrideReason.trim()}
                onClick={handleConfirmMealOverride}
              >
                Guardar cambio
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
