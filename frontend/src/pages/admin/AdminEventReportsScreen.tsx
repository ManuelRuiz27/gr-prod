import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, EmptyState, Button } from '../../design-system';
import { mockEvents, type EventMock } from '../../fixtures/eventFixtures';
import {
  buildEventSpreadsheetRows,
  filterEventSpreadsheetRows,
  calculateReportTotals,
  resolveEventPrices,
  INITIAL_SPREADSHEET_FILTER_STATE,
  type SpreadsheetFilterState,
} from './reports/eventSpreadsheetViewModel';
import { EventReportHeaderSummary } from './reports/EventReportHeaderSummary';
import { EventReportToolbar } from './reports/EventReportToolbar';
import { EventSpreadsheetTable } from './reports/EventSpreadsheetTable';
import { downloadEventReportXLSX } from './reports/exportReportUtils';

export const AdminEventReportsScreen: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // If in /admin/reports without eventId, allow selecting an event
  const isGlobalRoute = !eventId;
  const [selectedInstitution, setSelectedInstitution] = useState<string>('ALL');
  const [selectedGlobalEventId, setSelectedGlobalEventId] = useState<string>(
    mockEvents[0]?.id || 'evt-derecho-2027'
  );

  const activeEventId = isGlobalRoute ? selectedGlobalEventId : eventId;
  const event = useMemo(() => {
    return mockEvents.find((e: EventMock) => e.id === activeEventId);
  }, [activeEventId]);

  // Filters state
  const [filters, setFilters] = useState<SpreadsheetFilterState>(INITIAL_SPREADSHEET_FILTER_STATE);

  // Derive spreadsheet rows from canonical fixtures
  const allRows = useMemo(() => {
    if (!activeEventId) return [];
    return buildEventSpreadsheetRows(activeEventId);
  }, [activeEventId]);

  // Overall event totals (independent of active UI filters)
  const eventTotals = useMemo(() => {
    return calculateReportTotals(allRows);
  }, [allRows]);

  // Configured prices for the event
  const prices = useMemo(() => {
    return resolveEventPrices(activeEventId || '', event);
  }, [activeEventId, event]);

  // Extract unique table numbers for the filter dropdown
  const availableTables = useMemo(() => {
    const tableSet = new Set<number>();
    allRows.forEach((r) => {
      if (r.tableNumber !== null) {
        tableSet.add(r.tableNumber);
      }
    });
    return Array.from(tableSet).sort((a, b) => a - b);
  }, [allRows]);

  // Apply search and dropdown filters (strictly affects visible table)
  const filteredRows = useMemo(() => {
    return filterEventSpreadsheetRows(allRows, filters);
  }, [allRows, filters]);

  // Dynamic totals for the table sticky footer (scoped to visible filteredRows)
  const tableTotals = useMemo(() => {
    return calculateReportTotals(filteredRows);
  }, [filteredRows]);

  // Handle Excel download: respects active filters per AC-REP-007
  const handleExportExcel = () => {
    if (!event) return;
    downloadEventReportXLSX(filteredRows, event.name, tableTotals, {
      eventName: event.name,
      institution: event.institution,
      career: event.career,
      venue: event.venue,
      date: event.date,
      adultPrice: prices.adultPrice,
      childPrice: prices.childPrice,
      noDinnerPrice: prices.noDinnerPrice,
      penalties: null,
      courtesies: null,
    });
  };

  // Handle export of all event records: explicit separate action per AC-REP-007
  const handleExportAll = () => {
    if (!event) return;
    downloadEventReportXLSX(allRows, event.name, eventTotals, {
      eventName: event.name,
      institution: event.institution,
      career: event.career,
      venue: event.venue,
      date: event.date,
      adultPrice: prices.adultPrice,
      childPrice: prices.childPrice,
      noDinnerPrice: prices.noDinnerPrice,
      penalties: null,
      courtesies: null,
    });
  };

  // If specific eventId requested in route but not found
  if (eventId && !event) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto font-sans p-6">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: 'Reportes', current: true },
          ]}
        />
        <EmptyState
          title="Evento no encontrado"
          description={`No pudimos encontrar la información del evento con identificador "${eventId}".`}
          actionLabel="Volver a lista de eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full mx-auto font-sans pb-12 animate-fadeIn">
      {/* Breadcrumb navigation */}
      <Breadcrumb
        items={
          isGlobalRoute
            ? [
                { label: 'Plataforma GR', href: '/admin' },
                { label: 'Reportes', current: true },
              ]
            : [
                { label: 'Plataforma GR', href: '/admin' },
                { label: 'Eventos', href: '/admin/events' },
                { label: event?.name || 'Evento', href: `/admin/events/${eventId}` },
                { label: 'Reporte del evento', current: true },
              ]
        }
      />

      {/* Global selector bar when accessing /admin/reports */}
      {isGlobalRoute && (
        <div className="p-4 bg-obsidian-900/90 border border-silver-800 rounded-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-silver-300">Seleccionar evento:</span>
            <select
              value={selectedGlobalEventId}
              onChange={(e) => setSelectedGlobalEventId(e.target.value)}
              className="bg-obsidian-950 border border-silver-700 rounded-md px-3 py-1.5 text-xs text-silver-100 focus:outline-none focus:border-gold-500"
              aria-label="Seleccionar evento para reporte"
            >
              {mockEvents
                .filter((e: EventMock) => selectedInstitution === 'ALL' || e.institution === selectedInstitution)
                .map((e: EventMock) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.institution} - {e.generation})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-silver-400">Filtrar por institución:</span>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="bg-obsidian-950 border border-silver-700 rounded-md px-2.5 py-1.5 text-xs text-silver-200 focus:outline-none focus:border-gold-500"
              aria-label="Filtrar eventos por institución"
            >
              <option value="ALL">Todas las instituciones</option>
              {Array.from(new Set(mockEvents.map((e: EventMock) => e.institution))).map((inst: string) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Compact Event Context Header with Export Action */}
      {event && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-silver-800/80">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-xl font-bold font-display text-silver-50 tracking-tight">
                Reporte del evento
              </h1>
              <p className="text-xs text-silver-400">
                {event.institution} · {event.career} · Generación {event.generation} · {event.date}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAll}
                className="text-xs font-semibold text-silver-300 hover:text-silver-100 border-silver-700 hover:border-silver-500"
                title="Descargar todos los registros del evento en formato Excel (.xlsx)"
              >
                Exportar todo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportExcel}
                className="text-xs font-semibold text-silver-100 hover:text-gold-400 border-silver-700 hover:border-gold-500"
                title="Descargar vista actual con filtros aplicados en formato Excel (.xlsx)"
              >
                <svg
                  className="w-3.5 h-3.5 mr-1.5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Exportar Excel
              </Button>
            </div>
          </div>

          {/* Operational Header Summary: General Data, Event Reservations, Donut SVG */}
          <EventReportHeaderSummary
            event={event}
            totals={eventTotals}
            prices={prices}
          />

          {/* Compact Operational Toolbar */}
          <EventReportToolbar
            filters={filters}
            onFilterChange={setFilters}
            availableTables={availableTables}
            totalRowsCount={allRows.length}
            filteredRowsCount={filteredRows.length}
          />

          {/* Operational Excel Spreadsheet Surface */}
          <EventSpreadsheetTable
            eventId={activeEventId || ''}
            rows={filteredRows}
            totals={tableTotals}
          />
        </div>
      )}
    </div>
  );
};
