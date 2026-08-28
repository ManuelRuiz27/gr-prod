import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  Badge,
  Card,
  EmptyState,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Icon,
} from '../../../design-system';
import { mockEvents, mockGraduatesList } from '../../../fixtures';
import { getThermoStatusPresentation } from '../../../lib/thermoStatusPresentation';

export const AdminGraduateOverviewScreen: React.FC = () => {
  const { eventId, graduateId } = useParams();
  const navigate = useNavigate();

  const event = mockEvents.find((item) => item.id === eventId);
  const graduate = mockGraduatesList.find(
    (item) => item.id === graduateId && item.eventId === eventId
  );

  if (!event || !graduate) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: 'Graduados', href: `/admin/events/${eventId || ''}/graduates` },
            { label: 'Graduado no encontrado', current: true },
          ]}
        />
        <EmptyState
          title="Graduado no encontrado"
          description="No encontramos este graduado dentro del evento."
          actionLabel="Volver a graduados"
          onAction={() => navigate(`/admin/events/${eventId || ''}/graduates`)}
        />
      </div>
    );
  }

  const thermo = getThermoStatusPresentation(graduate.thermoStatus);

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Plataforma GR', href: '/admin' },
          { label: 'Eventos', href: '/admin/events' },
          { label: event.name, href: `/admin/events/${event.id}` },
          { label: 'Graduados', href: `/admin/events/${event.id}/graduates` },
          { label: graduate.fullName, current: true },
        ]}
      />

      {/* Header Banner */}
      <Card variant="gold-accent" className="p-6 md:p-8 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
              {graduate.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-content-secondary">
              <div className="flex items-center gap-1.5">
                <Icon name="mail" size={14} className="text-gold-600 shrink-0" />
                <span>{graduate.email}</span>
              </div>
              {graduate.career && (
                <div className="flex items-center gap-1.5">
                  <Icon name="user" size={14} className="text-gold-600 shrink-0" />
                  <span>
                    {graduate.career}
                    {graduate.generation ? ` • Gen. ${graduate.generation}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold text-content-secondary">
            Lugares activos
          </span>
          <div>
            <span className="text-3xl font-extrabold text-navy-900">
              {graduate.ticketCount}
            </span>
          </div>
          <span className="text-[11px] text-content-muted">
            Lugares contratados
          </span>
        </Card>

        <Card className="p-5 flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold text-content-secondary">
            Mesa
          </span>
          <div>
            <span className="text-2xl font-bold text-navy-900">
              {graduate.tableNumber ? `Mesa ${graduate.tableNumber}` : 'Sin mesa'}
            </span>
          </div>
          <span className="text-[11px] text-content-muted">
            Asignación de mesa
          </span>
        </Card>

        <Card className="p-5 flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold text-content-secondary">
            Grupo
          </span>
          <div>
            <span className="text-2xl font-bold text-navy-900">
              {graduate.guests.length} integrantes
            </span>
          </div>
          <span className="text-[11px] text-content-muted">
            Registrados en el grupo
          </span>
        </Card>

        <Card className="p-5 flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold text-content-secondary">
            Termo
          </span>
          <div>
            <span className="text-2xl font-bold text-navy-900">
              {thermo.label}
            </span>
          </div>
          <Badge variant={thermo.tone} size="sm" className="self-start">
            {thermo.label}
          </Badge>
        </Card>
      </div>

      {/* Resumen financiero */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-navy-900">Resumen financiero</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 space-y-2">
            <span className="text-xs font-semibold text-content-secondary">
              Contratado
            </span>
            <div className="text-2xl font-bold text-navy-900">—</div>
          </Card>

          <Card className="p-5 space-y-2">
            <span className="text-xs font-semibold text-content-secondary">
              Pagado
            </span>
            <div className="text-2xl font-bold text-navy-900">—</div>
          </Card>

          <Card className="p-5 space-y-2">
            <span className="text-xs font-semibold text-content-secondary">
              Pendiente
            </span>
            <div className="text-2xl font-bold text-navy-900">—</div>
          </Card>

          <Card className="p-5 space-y-2">
            <span className="text-xs font-semibold text-content-secondary">
              Vencido
            </span>
            <div className="text-2xl font-bold text-navy-900">—</div>
          </Card>
        </div>
        <p className="text-xs text-content-muted">
          Disponible al integrar el expediente financiero.
        </p>
      </div>

      {/* Grupo Preview */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-navy-900">Grupo</h2>
            <p className="text-xs text-content-secondary">
              Integrantes registrados bajo la membresía del graduado.
            </p>
          </div>
          <span className="text-xs font-semibold text-content-muted cursor-default">
            Ver grupo
          </span>
        </div>

        {graduate.guests.length === 0 ? (
          <p className="text-xs text-content-muted py-4 text-center">
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
                  <TableCell className="font-semibold text-content-primary">
                    {guest.name}
                  </TableCell>
                  <TableCell className="text-content-secondary">
                    {guest.meal}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
