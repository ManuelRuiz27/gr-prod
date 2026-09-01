import React from 'react';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  SectionHeader,
  KpiCard,
  Card,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button,
  Icon,
  EmptyState,
  Alert,
  SkeletonKpi,
  SkeletonCard,
  SkeletonTable,
} from '../../design-system';
import { mockEvents, mockGraduatesList, mockPaymentPlan } from '../../fixtures';

export interface AdminDashboardScreenProps {
  isLoading?: boolean;
  partialError?: string | null;
  eventsOverride?: typeof mockEvents;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  isLoading = false,
  partialError = null,
  eventsOverride,
}) => {
  const events = eventsOverride !== undefined ? eventsOverride : mockEvents;
  const activeEvents = events.filter((e) => e.status === 'OPEN');
  const activeEventsCount = activeEvents.length;
  const totalGraduatesCount = mockGraduatesList.length;

  // Formatted financial numbers derived from fixtures
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const collectedAmount = formatCurrency(mockPaymentPlan.paidAmount);
  const pendingAmount = formatCurrency(mockPaymentPlan.pendingAmount);
  const overdueAmount = formatCurrency(mockPaymentPlan.overdueAmount || 0);

  // Actionable alerts data
  const pendingSubmissions = mockPaymentPlan.transactions?.filter(
    (t) => t.status === 'CONFIRMED' || t.status === 'PENDING'
  ) || [];

  const alerts = [
    {
      id: 'alt-1',
      type: 'pending_validation' as const,
      title: 'Comprobantes por validar',
      description: `${pendingSubmissions.length} pago registrado pendiente de conciliación o verificación.`,
      linkText: 'Revisar pagos',
      to: '/admin/payments',
    },
  ];

  // Quick action destinations
  const quickActions = [
    {
      label: 'Crear nuevo evento',
      description: 'Configurar fechas, precios y cuotas',
      to: '/admin/events/new',
      icon: 'plus' as const,
    },
    {
      label: 'Gestión de eventos',
      description: 'Consultar eventos activos y cerrados',
      to: '/admin/events',
      icon: 'building' as const,
    },
    {
      label: 'Validación de pagos',
      description: 'Verificar comprobantes y transacciones',
      to: '/admin/payments',
      icon: 'payment' as const,
    },
    {
      label: 'Directorio de graduados',
      description: 'Padrón de alumnos y lugares',
      to: '/admin/graduates',
      icon: 'users' as const,
    },
  ];

  // 1. Loading State (Structural Skeleton)
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 font-sans">
        <PageHeader
          title="Resumen general"
          subtitle="Panorama general de eventos, cartera y operaciones activas."
        />

        {/* 5 KPI Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <SkeletonKpi />
          <SkeletonKpi />
          <SkeletonKpi />
          <SkeletonKpi />
          <SkeletonKpi />
        </div>

        <SkeletonCard />
        <SkeletonTable rows={3} cols={6} />
      </div>
    );
  }

  // 2. Empty State (No Events in system)
  if (events.length === 0) {
    return (
      <div className="flex flex-col gap-6 font-sans">
        <PageHeader
          title="Resumen general"
          subtitle="Panorama general de eventos, cartera y operaciones activas."
          actions={
            <Link to="/admin/events/new">
              <Button variant="primary" iconStart="plus">
                Crear evento
              </Button>
            </Link>
          }
        />

        <EmptyState
          title="No hay eventos registrados"
          description="Aún no tienes ningún evento en gestión. Comienza creando el primer evento de graduación para habilitar el registro de graduados, mesas y pagos."
          actionLabel="Crear mi primer evento"
          onAction={() => {
            window.location.href = '/admin/events/new';
          }}
          icon="building"
        />
      </div>
    );
  }

  // 3. Normal / Operational Dashboard
  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* 1. Page Header with Title & Primary CTA */}
      <PageHeader
        title="Resumen general"
        subtitle="Panorama general de eventos, cartera y operaciones activas."
        actions={
          <Link to="/admin/events/new">
            <Button variant="primary" iconStart="plus">
              Crear evento
            </Button>
          </Link>
        }
      />

      {/* Partial Error Alert if one block fails */}
      {partialError && (
        <Alert variant="error" title="Atención parcial">
          {partialError}
        </Alert>
      )}

      {/* 2. Mandatory 5 KPIs Grid */}
      <section aria-label="Métricas globales de la plataforma">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <KpiCard
            label="Eventos activos"
            value={String(activeEventsCount)}
            supportingText="En gestión operativa"
            status="neutral"
            icon="building"
          />

          <KpiCard
            label="Graduados"
            value={String(totalGraduatesCount)}
            supportingText="Padrón registrado"
            status="neutral"
            icon="users"
          />

          <KpiCard
            label="Cobrado"
            value={collectedAmount}
            supportingText="Recaudación acumulada"
            status="success"
            trend={{ value: '+60%', direction: 'up', positive: true }}
            icon="payment"
          />

          <KpiCard
            label="Pendiente"
            value={pendingAmount}
            supportingText="Por cobrar en calendario"
            status="info"
            icon="clock"
          />

          <KpiCard
            label="Vencido"
            value={overdueAmount}
            supportingText="Cartera al corriente"
            status="neutral"
            icon="alert"
          />
        </div>
      </section>

      {/* 3. Actionable Alerts Section */}
      <section aria-label="Alertas accionables">
        {alerts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-obsidian-850 border border-silver-800/90 rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/15 text-gold-400 border border-gold-500/30 flex items-center justify-center shrink-0">
                    <Icon name="alert" size={16} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-silver-100">{alert.title}</span>
                    <span className="text-xs text-silver-400 truncate">{alert.description}</span>
                  </div>
                </div>
                <Link to={alert.to} className="shrink-0 self-end sm:self-center">
                  <Button variant="outline" size="sm" iconEnd="chevron-right">
                    {alert.linkText}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <Alert variant="info">
            Sin alertas críticas pendientes — Todas las operaciones se encuentran al corriente.
          </Alert>
        )}
      </section>

      {/* 4. Active / Recent Events Section */}
      <section aria-label="Eventos recientes">
        <Card>
          <div className="p-4 sm:p-5 border-b border-silver-800/80 flex items-center justify-between gap-4">
            <SectionHeader
              title="Eventos activos"
              description="Selecciona un evento para gestionar su padrón, mesas, platillos y reportes."
            />
            <Link to="/admin/events" className="shrink-0">
              <Button variant="ghost" size="sm" iconEnd="chevron-right">
                Ver todos
              </Button>
            </Link>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Evento</TableHeader>
                <TableHeader>Institución</TableHeader>
                <TableHeader>Fecha</TableHeader>
                <TableHeader>Estado</TableHeader>
                <TableHeader>Graduados</TableHeader>
                <TableHeader>Acción</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex flex-col min-w-[180px]">
                      <span className="font-semibold text-silver-100">{event.name}</span>
                      <span className="text-[11px] text-silver-400">{event.venue}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-silver-300 font-medium">{event.institution}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-silver-300 whitespace-nowrap">{event.date}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={event.status === 'OPEN' ? 'success' : 'neutral'}
                      size="sm"
                      dot
                    >
                      {event.status === 'OPEN' ? 'Abierto' : event.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-silver-100">{totalGraduatesCount}</span>
                  </TableCell>
                  <TableCell>
                    <Link to={`/admin/events/${event.id}`}>
                      <Button variant="secondary" size="sm" iconEnd="chevron-right">
                        Administrar
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      {/* 5. Two-column Layout: Pagos por validar & Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Pagos recientes / por validar */}
        <section aria-label="Pagos por validar">
          <Card className="h-full flex flex-col justify-between">
            <div className="p-4 sm:p-5 border-b border-silver-800/80 flex items-center justify-between gap-3">
              <SectionHeader
                title="Pagos por validar"
                description="Comprobantes y transferencias recientes."
              />
              <Link to="/admin/payments" className="shrink-0">
                <Button variant="ghost" size="sm">
                  Ver cartera
                </Button>
              </Link>
            </div>

            <div className="p-4 flex flex-col gap-3 flex-1">
              {pendingSubmissions.slice(0, 3).map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-obsidian-900 border border-silver-800/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-obsidian-800 border border-silver-700 flex items-center justify-center text-silver-300 shrink-0">
                      <Icon name="payment" size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-silver-100 truncate">
                        {mockPaymentPlan.graduateName} • {tx.installmentLabel}
                      </span>
                      <span className="text-[11px] text-silver-400">
                        {tx.paidAt} • Ref: {tx.reference || 'Manual'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-silver-100 font-sans">
                      {formatCurrency(tx.amount)}
                    </span>
                    <Badge variant="success" size="sm">
                      {tx.status === 'CONFIRMED' ? 'Confirmado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 pt-0 border-t border-silver-800/40 mt-2 flex items-center justify-between text-xs text-silver-400">
              <span>Total por conciliar: {formatCurrency(mockPaymentPlan.paidAmount)}</span>
              <Link to="/admin/payments" className="text-gold-400 hover:underline font-semibold">
                Gestionar pagos
              </Link>
            </div>
          </Card>
        </section>

        {/* Column 2: Accesos rápidos */}
        <section aria-label="Accesos rápidos">
          <Card className="h-full flex flex-col justify-between">
            <div className="p-4 sm:p-5 border-b border-silver-800/80">
              <SectionHeader
                title="Accesos rápidos"
                description="Operaciones clave y navegación directa."
              />
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="p-3.5 rounded-card bg-obsidian-900 hover:bg-obsidian-800 border border-silver-800/60 hover:border-silver-700 transition-all duration-150 flex flex-col justify-between gap-2 group shadow-card-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-obsidian-800 group-hover:bg-gold-500/15 group-hover:text-gold-400 text-silver-300 border border-silver-700/60 transition-colors flex items-center justify-center">
                      <Icon name={action.icon} size={16} />
                    </div>
                    <Icon
                      name="chevron-right"
                      size={14}
                      className="text-silver-500 group-hover:text-gold-400 transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-silver-100 group-hover:text-gold-400 transition-colors block">
                      {action.label}
                    </span>
                    <span className="text-[11px] text-silver-400 block mt-0.5 line-clamp-1">
                      {action.description}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="p-4 pt-0 text-[11px] text-silver-500 flex items-center justify-between border-t border-silver-800/40 mt-2">
              <span>Plataforma GR • v1.2</span>
              <span>4 módulos directos</span>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};
