import React, { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  Card,
  Button,
  EmptyState,
  Icon,
  Badge,
  Tabs,
  type TabItem,
} from '../../design-system';
import {
  mockEvents,
  mockTables,
  type TableAssignmentMock,
} from '../../fixtures';
import { SeatingMapCanvas } from './tables/SeatingMapCanvas';
import { TableDetailPanel } from './tables/TableDetailPanel';
import { CreateTableModal, type CreateTableSubmitData } from './tables/CreateTableModal';
import { BulkCreateTablesModal, type BulkCreateTablesSubmitData } from './tables/BulkCreateTablesModal';
import { EditTableModal, type EditTableSubmitData } from './tables/EditTableModal';
import { AssignGraduateModal, type SelectedMemberAssignment } from './tables/AssignGraduateModal';
import {
  type SeatingTableViewModel,
  createSeatingViewModels,
  calculateTableOccupancy,
} from './tables/seatingCoordinates';

interface AdminEventTablesContentProps {
  paramEventId?: string;
}

const AdminEventTablesContent: React.FC<AdminEventTablesContentProps> = ({ paramEventId }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Strictly resolve event from route parameter (no fallback to demo event)
  const event = paramEventId ? mockEvents.find((e) => e.id === paramEventId) : null;

  // Active view tab: 'canvas' | 'list'
  const [activeTab, setActiveTab] = useState<'canvas' | 'list'>('canvas');

  // Local UI view-model state for tables scoped to this event
  const [tables, setTables] = useState<SeatingTableViewModel[]>(() => {
    if (!event) return [];
    return createSeatingViewModels(mockTables.filter((t) => t.eventId === event.id));
  });

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Selected table
  const selectedTable = tables.find((t) => t.id === selectedTableId) || null;

  // Calculate global summary stats
  const summaryStats = useMemo(() => {
    const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);
    const totalOccupied = tables.reduce((acc, t) => acc + calculateTableOccupancy(t).occupied, 0);
    const totalAvailable = tables.reduce((acc, t) => acc + calculateTableOccupancy(t).available, 0);
    const blockedCount = tables.filter((t) => t.status === 'BLOCKED').length;
    const occupiedPercentage = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

    return {
      totalCapacity,
      totalOccupied,
      totalAvailable,
      blockedCount,
      occupiedPercentage,
      totalTables: tables.length,
    };
  }, [tables]);

  // If no eventId in URL (e.g. /admin/tables), prompt to select an event
  if (!paramEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Mesas', current: true },
          ]}
        />
        <EmptyState
          title="Selecciona un evento"
          description="Para consultar el croquis de mesas y asignaciones, selecciona un evento desde el catálogo."
          actionLabel="Ver eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // Event not found fallback
  if (!event) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: 'Evento no encontrado', current: true },
          ]}
        />
        <EmptyState
          title="Evento no encontrado"
          description="No encontramos el evento solicitado para gestionar las mesas y el croquis."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // Action handlers
  const handleTableMove = (tableId: string, normX: number, normY: number) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, x: normX, y: normY } : t))
    );
  };

  const handleCreateTable = (data: CreateTableSubmitData) => {
    const newTable: SeatingTableViewModel = {
      id: `tbl-${Date.now()}`,
      eventId: event.id,
      number: data.number,
      shape: data.shape,
      capacity: data.capacity,
      occupied: 0,
      available: data.capacity,
      status: 'AVAILABLE',
      x: 0.5,
      y: 0.5,
      assignments: [],
    };

    setTables((prev) => [...prev, newTable]);
    setSelectedTableId(newTable.id);
  };

  const handleBulkCreateTables = (data: BulkCreateTablesSubmitData) => {
    const newTables: SeatingTableViewModel[] = [];
    const cols = 5;

    for (let i = 0; i < data.quantity; i++) {
      const num = data.startNumber + i;
      const rowIdx = Math.floor(i / cols);
      const colIdx = i % cols;

      const posX = 0.15 + colIdx * 0.17;
      const posY = 0.25 + rowIdx * 0.18;

      newTables.push({
        id: `tbl-${Date.now()}-${i}`,
        eventId: event.id,
        number: num,
        shape: data.shape,
        capacity: data.capacity,
        occupied: 0,
        available: data.capacity,
        status: 'AVAILABLE',
        x: Math.min(0.9, posX),
        y: Math.min(0.9, posY),
        assignments: [],
      });
    }

    setTables((prev) => [...prev, ...newTables]);
  };

  const handleEditTable = (data: EditTableSubmitData) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== data.tableId) return t;
        const occupied = calculateTableOccupancy(t).occupied;
        return {
          ...t,
          number: data.number,
          capacity: data.capacity,
          available: Math.max(0, data.capacity - occupied),
        };
      })
    );
  };

  const handleToggleBlock = () => {
    if (!selectedTableId) return;
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTableId) return t;
        const newStatus = t.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE';
        const occupied = calculateTableOccupancy(t).occupied;
        return {
          ...t,
          status: newStatus,
          available: Math.max(0, t.capacity - occupied),
        };
      })
    );
  };

  const handleDuplicateTable = () => {
    if (!selectedTable) return;
    const maxNum = tables.reduce((max, t) => Math.max(max, t.number), 0);
    const newNumber = maxNum + 1;

    const duplicatedTable: SeatingTableViewModel = {
      id: `tbl-${Date.now()}`,
      eventId: event.id,
      number: newNumber,
      shape: selectedTable.shape,
      capacity: selectedTable.capacity,
      occupied: 0,
      available: selectedTable.capacity,
      status: 'AVAILABLE',
      x: Math.min(0.92, selectedTable.x + 0.05),
      y: Math.min(0.92, selectedTable.y + 0.05),
      assignments: [],
    };

    setTables((prev) => [...prev, duplicatedTable]);
    setSelectedTableId(duplicatedTable.id);
  };

  const handleConfirmAssign = (
    graduateId: string,
    graduateName: string,
    places: number,
    selectedMembers?: SelectedMemberAssignment[]
  ) => {
    if (!selectedTableId) return;
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTableId) return t;

        const newAssignmentsList: TableAssignmentMock[] = [...(t.assignments || [])];

        if (selectedMembers && selectedMembers.length > 0) {
          selectedMembers.forEach((m, idx) => {
            newAssignmentsList.push({
              id: `asgn-${Date.now()}-${idx}`,
              graduateId,
              graduateName,
              groupMemberId: m.groupMemberId,
              memberName: m.memberName,
              placesAssigned: 1,
              isLocalPreview: true,
            });
          });
        } else {
          newAssignmentsList.push({
            id: `asgn-${Date.now()}`,
            graduateId,
            graduateName,
            placesAssigned: places,
            isLocalPreview: true,
          });
        }

        const newOccupied = newAssignmentsList.reduce((acc, a) => acc + a.placesAssigned, 0);
        return {
          ...t,
          assignments: newAssignmentsList,
          occupied: newOccupied,
          available: Math.max(0, t.capacity - newOccupied),
        };
      })
    );
  };

  const handleBackgroundFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundImageUrl(url);
    }
  };

  const highestTableNumber = tables.reduce((max, t) => Math.max(max, t.number), 0);

  const tabsItems: TabItem[] = [
    { id: 'canvas', label: 'Croquis interactivo', icon: 'table' },
    { id: 'list', label: `Lista de mesas (${tables.length})`, icon: 'users' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans pb-16">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Plataforma GR', href: '/admin' },
          { label: 'Eventos', href: '/admin/events' },
          { label: event.name, href: `/admin/events/${event.id}` },
          { label: 'Mesas / Croquis', current: true },
        ]}
      />

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
            Mesas y croquis
          </h1>
          <p className="text-xs text-silver-400 mt-0.5">
            {event.name} • {event.venue} • {event.date}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Reference Background Upload */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".jpg,.jpeg,.png"
            onChange={handleBackgroundFileSelect}
            className="hidden"
            id="bg-plan-upload"
          />
          {backgroundImageUrl ? (
            <Button
              variant="secondary"
              size="sm"
              iconStart="close"
              onClick={() => setBackgroundImageUrl(null)}
              title="Quitar plano de referencia"
            >
              Quitar fondo
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              iconStart="download"
              onClick={() => fileInputRef.current?.click()}
              title="Subir JPG o PNG como referencia visual"
            >
              Fondo de referencia
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsBulkCreateOpen(true)}
          >
            Crear varias mesas
          </Button>

          <Button
            variant="primary"
            size="sm"
            iconStart="plus"
            onClick={() => setIsCreateOpen(true)}
          >
            Crear mesa
          </Button>
        </div>
      </div>

      {/* Summary Bento Stats (Design System 1.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Aforo Total */}
        <Card className="p-4 bg-obsidian-850 border border-silver-800/80 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider">
              Aforo Total
            </span>
            <div className="w-7 h-7 rounded-full bg-obsidian-800 text-silver-300 flex items-center justify-center">
              <Icon name="users" size={14} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-silver-50 font-sans">
              {summaryStats.totalCapacity} <span className="text-xs font-normal text-silver-400">lugares</span>
            </h3>
            <p className="text-[11px] text-silver-400 mt-0.5">
              {summaryStats.totalTables} mesas configuradas
            </p>
          </div>
        </Card>

        {/* Metric 2: Ocupados */}
        <Card className="p-4 bg-obsidian-850 border border-silver-800/80 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider">
              Lugares Ocupados
            </span>
            <div className="w-7 h-7 rounded-full bg-status-success/20 text-status-success flex items-center justify-center">
              <Icon name="check" size={14} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-extrabold text-silver-50 font-sans">
                {summaryStats.totalOccupied} <span className="text-xs font-normal text-silver-400">lugares</span>
              </h3>
              <span className="text-xs font-bold text-status-success font-sans">
                {summaryStats.occupiedPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-silver-400 mt-0.5">Asignados a integrantes</p>
          </div>
        </Card>

        {/* Metric 3: Disponibles */}
        <Card className="p-4 bg-obsidian-850 border border-silver-800/80 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider">
              Lugares Libres
            </span>
            <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center">
              <Icon name="clock" size={14} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-silver-50 font-sans">
              {summaryStats.totalAvailable} <span className="text-xs font-normal text-silver-400">libres</span>
            </h3>
            <p className="text-[11px] text-silver-400 mt-0.5">Disponibles físicamente</p>
          </div>
        </Card>

        {/* Metric 4: Mesas Bloqueadas */}
        <Card className="p-4 bg-obsidian-850 border border-silver-800/80 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider">
              Mesas Bloqueadas
            </span>
            <div className="w-7 h-7 rounded-full bg-status-error/20 text-status-error flex items-center justify-center">
              <Icon name="alert" size={14} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-silver-50 font-sans">
              {summaryStats.blockedCount} <span className="text-xs font-normal text-silver-400">mesas</span>
            </h3>
            <p className="text-[11px] text-silver-400 mt-0.5">No admiten nuevas asignaciones</p>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation (Croquis vs Accessible List) */}
      <Tabs
        tabs={tabsItems}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'canvas' | 'list')}
      />

      {/* Tab 1: Interactive Canvas */}
      {activeTab === 'canvas' && (
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Canvas Area */}
          <div className="flex-1 w-full flex flex-col gap-3">
            <SeatingMapCanvas
              tables={tables}
              selectedTableId={selectedTableId}
              onSelectTable={(id) => setSelectedTableId(id)}
              onTableMove={handleTableMove}
              backgroundImageUrl={backgroundImageUrl}
              mode="admin"
            />

            {/* Canvas helper caption */}
            <div className="flex items-center justify-between text-[11px] text-silver-400 px-1">
              <span>Arrastra cualquier mesa para reubicarla. Haz clic para consultar detalles y asignaciones.</span>
              <span>Motor gráfico: Coordenadas normalizadas (0..1)</span>
            </div>
          </div>

          {/* Selected Table Detail Panel */}
          {selectedTable && (
            <TableDetailPanel
              table={selectedTable}
              onClose={() => setSelectedTableId(null)}
              onOpenEdit={() => setIsEditOpen(true)}
              onOpenAssign={() => setIsAssignOpen(true)}
              onToggleBlock={handleToggleBlock}
              onDuplicate={handleDuplicateTable}
            />
          )}
        </div>
      )}

      {/* Tab 2: Accessible Table List Alternative */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden bg-obsidian-850 border border-silver-800/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-silver-800 bg-obsidian-900/80 text-silver-400 font-semibold uppercase text-[11px]">
                    <th className="py-3.5 px-4">Mesa</th>
                    <th className="py-3.5 px-4">Forma</th>
                    <th className="py-3.5 px-4">Capacidad</th>
                    <th className="py-3.5 px-4">Ocupados</th>
                    <th className="py-3.5 px-4">Libres</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-silver-800/60 text-silver-200">
                  {tables.map((tbl) => {
                    const stats = calculateTableOccupancy(tbl);
                    const isBlocked = tbl.status === 'BLOCKED';
                    const isSelected = tbl.id === selectedTableId;

                    return (
                      <tr
                        key={tbl.id}
                        className={`hover:bg-obsidian-800/50 transition-colors ${
                          isSelected ? 'bg-gold-500/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-silver-100">
                          Mesa {tbl.number}
                        </td>
                        <td className="py-3 px-4">
                          {tbl.shape === 'SQUARE' ? 'Cuadrada' : 'Circular'}
                        </td>
                        <td className="py-3 px-4 font-sans">{tbl.capacity}</td>
                        <td className="py-3 px-4 font-sans text-status-success font-semibold">
                          {stats.occupied}
                        </td>
                        <td className="py-3 px-4 font-sans text-status-warning font-semibold">
                          {stats.available}
                        </td>
                        <td className="py-3 px-4">
                          {isBlocked ? (
                            <Badge variant="error" size="sm">Bloqueada</Badge>
                          ) : stats.isFull ? (
                            <Badge variant="neutral" size="sm">Completa</Badge>
                          ) : stats.occupied > 0 ? (
                            <Badge variant="warning" size="sm">Parcial ({stats.percentage}%)</Badge>
                          ) : (
                            <Badge variant="success" size="sm">Disponible</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant={isSelected ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => {
                              setSelectedTableId(tbl.id);
                              setActiveTab('canvas');
                            }}
                          >
                            {isSelected ? 'Seleccionada' : 'Ver en croquis'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Modals */}
      <CreateTableModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTable}
        suggestedNumber={highestTableNumber + 1}
      />

      <BulkCreateTablesModal
        isOpen={isBulkCreateOpen}
        onClose={() => setIsBulkCreateOpen(false)}
        onSubmit={handleBulkCreateTables}
        suggestedStartNumber={highestTableNumber + 1}
      />

      {selectedTable && (
        <>
          <EditTableModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            table={selectedTable}
            onSubmit={handleEditTable}
          />

          <AssignGraduateModal
            isOpen={isAssignOpen}
            onClose={() => setIsAssignOpen(false)}
            table={selectedTable}
            eventId={event.id}
            onConfirmAssign={handleConfirmAssign}
          />
        </>
      )}
    </div>
  );
};

export const AdminEventTablesScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  return <AdminEventTablesContent key={paramEventId || 'no-event'} paramEventId={paramEventId} />;
};
