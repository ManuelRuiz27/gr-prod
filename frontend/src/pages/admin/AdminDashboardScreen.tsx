import React from 'react';
import { Link } from 'react-router-dom';
import {
  Alert, Button, EmptyState, InlineMetric, PageHeader, Skeleton, SkeletonTable,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../design-system';
import { mockEvents, mockGraduatesList, mockPaymentPlan } from '../../fixtures';

export interface AdminDashboardScreenProps {
  isLoading?: boolean;
  partialError?: string | null;
  eventsOverride?: typeof mockEvents;
}

const money = (amount: number) => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
}).format(amount);

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  isLoading = false, partialError = null, eventsOverride,
}) => {
  const events = eventsOverride ?? mockEvents;
  const activeEvents = events.filter((event) => event.status === 'OPEN');
  const pendingReviews = mockPaymentPlan.transactions?.filter((transaction) => transaction.status !== 'CONFIRMED').length ?? 0;

  if (isLoading) return (
    <div className="space-y-7 font-sans">
      <div className="flex justify-between border-b border-silver-800 pb-6"><Skeleton width={180} height={36} /><Skeleton width={132} height={40} /></div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4"><Skeleton height={52}/><Skeleton height={52}/><Skeleton height={52}/><Skeleton height={52}/></div>
      <SkeletonTable rows={3} cols={5} />
    </div>
  );

  if (!events.length) return (
    <div className="space-y-6 font-sans">
      <PageHeader title="Eventos" actions={<Link to="/admin/events/new"><Button variant="primary">Nuevo evento</Button></Link>} />
      <EmptyState title="Aún no hay eventos" description="Crea un evento para comenzar la operación." actionLabel="Nuevo evento" onAction={() => { window.location.href = '/admin/events/new'; }} />
    </div>
  );

  return (
    <div className="space-y-7 font-sans">
      <PageHeader title="Buenas tardes" displayFont={false} actions={<Link to="/admin/events/new"><Button variant="primary" iconStart="plus">Nuevo evento</Button></Link>} />
      {partialError && <Alert variant="error" title="No pudimos actualizar una parte del resumen">{partialError}</Alert>}

      <section aria-label="Resumen financiero y operativo" className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-silver-800 pb-6 sm:grid-cols-5">
        <InlineMetric value={activeEvents.length} label="eventos activos" />
        <InlineMetric value={mockGraduatesList.length} label="graduados" />
        <InlineMetric value={money(mockPaymentPlan.paidAmount)} label="cobrado" emphasis="positive" />
        <InlineMetric value={money(mockPaymentPlan.pendingAmount)} label="pendiente" />
        <InlineMetric value={money(mockPaymentPlan.overdueAmount || 0)} label="vencido" emphasis={mockPaymentPlan.overdueAmount ? 'danger' : 'default'} />
      </section>

      <section aria-labelledby="attention-heading" className="border-b border-silver-800 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div><h2 id="attention-heading" className="font-semibold text-silver-50">Requieren atención</h2><p className="mt-1 text-sm text-silver-400">{pendingReviews} pagos por revisar</p></div>
          <Link className="text-sm font-semibold text-gold-400 hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500" to="/admin/payments">Revisar pagos →</Link>
        </div>
      </section>

      <section aria-labelledby="events-heading">
        <div className="mb-3 flex items-center justify-between"><h2 id="events-heading" className="text-lg font-semibold text-silver-50">Próximos eventos</h2><Link to="/admin/events" className="text-sm text-silver-400 hover:text-silver-100">Ver todos</Link></div>
        <Table aria-label="Próximos eventos">
          <TableHead><TableRow><TableHeader>Evento</TableHeader><TableHeader>Institución</TableHeader><TableHeader>Fecha</TableHeader><TableHeader>Personas</TableHeader><TableHeader aria-label="Abrir" /></TableRow></TableHead>
          <TableBody>{activeEvents.map((event) => (
            <TableRow key={event.id} onClick={() => { window.location.href = `/admin/events/${event.id}`; }} className="cursor-pointer focus-within:bg-obsidian-800/50">
              <TableCell className="font-semibold">{event.name}</TableCell><TableCell>{event.institution}</TableCell><TableCell>{event.date}</TableCell><TableCell>{mockGraduatesList.filter((graduate) => graduate.eventId === event.id).length}</TableCell><TableCell className="text-gold-400">→</TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </section>
    </div>
  );
};
