import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  EmptyState,
  Badge,
  Tabs,
  type TabItem,
} from '../../design-system';
import {
  mockEvents,
  type TableAssignmentMock,
} from '../../fixtures';
import { SeatingMapCanvas } from './tables/SeatingMapCanvas';
import { TableDetailPanel } from './tables/TableDetailPanel';
import { CreateTableModal, type CreateTableSubmitData } from './tables/CreateTableModal';
import { BulkCreateTablesModal, type BulkCreateTablesSubmitData } from './tables/BulkCreateTablesModal';
import { EditTableModal, type EditTableSubmitData } from './tables/EditTableModal';
import { AssignGraduateModal, type SelectedMemberAssignment } from './tables/AssignGraduateModal';
import {
  calculateTableOccupancy,
} from './tables/seatingCoordinates';
import { useSeatingRealtime } from '../../services/seating';

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

  // Realtime hook providing canonical tables, sync, and mutation operations
  const {
    tables,
    selectedTableId,
    setSelectedTableId,
    selectedTable,
    backgroundImageUrl,
    setBackgroundImageUrl,
    createTable,
    createRoundTable,
    createSquareTable,
    bulkCreateTables,
    updateTable,
    moveTable,
    resizeTable,
    toggleBlockTable,
    deleteTable,
    assignMembers,
  } = useSeatingRealtime({
    eventId: event?.id || '',
    role: 'admin',
  });

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

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
    moveTable(tableId, normX, normY);
  };

  const handleTableResize = (
    tableId: string,
    normX: number,
    normY: number,
    width: number,
    height: number
  ) => {
    resizeTable(tableId, normX, normY, width, height);
  };

  const handleCreateRoundTable = async () => {
    await createRoundTable();
  };

  const handleCreateSquareTable = async () => {
    await createSquareTable();
  };

  const handleCreateTable = async (data: CreateTableSubmitData) => {
    await createTable({
      number: data.number,
      shape: data.shape,
      capacity: data.capacity,
      x: 0.5,
      y: 0.5,
    });
  };

  const handleBulkCreateTables = async (data: BulkCreateTablesSubmitData) => {
    await bulkCreateTables(data);
  };

  const handleEditTable = async (data: EditTableSubmitData) => {
    await updateTable(data.tableId, {
      number: data.number,
      capacity: data.capacity,
    });
  };

  const handleToggleBlock = async () => {
    if (!selectedTableId) return;
    await toggleBlockTable(selectedTableId);
  };

  const handleDuplicateTable = async () => {
    if (!selectedTable) return;
    const maxNum = tables.reduce((max, t) => Math.max(max, t.number), 0);
    const newNumber = maxNum + 1;

    await createTable({
      number: newNumber,
      shape: selectedTable.shape,
      capacity: selectedTable.capacity,
      x: Math.min(0.92, (selectedTable.x || 0.5) + 0.05),
      y: Math.min(0.92, (selectedTable.y || 0.5) + 0.05),
      width: selectedTable.width,
      height: selectedTable.height,
    });
  };

  const handleDeleteTable = async () => {
    if (!selectedTableId) return;
    await deleteTable(selectedTableId);
  };

  const handleConfirmAssign = async (
    graduateId: string,
    graduateName: string,
    places: number,
    selectedMembers?: SelectedMemberAssignment[]
  ) => {
    if (!selectedTableId) return;

    const newAssignmentsList: TableAssignmentMock[] = [];
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

    await assignMembers(selectedTableId, newAssignmentsList);
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
              title="Cargar imagen JPG o PNG como plano de referencia visual"
            >
              Cargar plano
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            iconStart="plus"
            onClick={handleCreateRoundTable}
            title="Insertar mesa circular de 10 personas"
          >
            Mesa circular
          </Button>

          <Button
            variant="secondary"
            size="sm"
            iconStart="plus"
            onClick={handleCreateSquareTable}
            title="Insertar mesa rectangular de 10 personas"
          >
            Mesa rectangular
          </Button>

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

      {/* Tabs Navigation (Croquis vs Accessible List) */}
      <Tabs
        tabs={tabsItems}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'canvas' | 'list')}
      />

      {/* Tab 1: Interactive Canvas (Occupies 70-80% useful area) */}
      {activeTab === 'canvas' && (
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Canvas Area (72-75% when panel open, 100% when closed) */}
          <div className={`w-full ${selectedTable ? 'lg:w-[72%] xl:w-[75%]' : 'lg:w-full'} flex flex-col gap-3 transition-all`}>
            <SeatingMapCanvas
              tables={tables}
              selectedTableId={selectedTableId}
              onSelectTable={(id) => setSelectedTableId(id)}
              onTableMove={handleTableMove}
              onTableResize={handleTableResize}
              backgroundImageUrl={backgroundImageUrl}
              mode="admin"
            />

            {/* Canvas helper caption */}
            <div className="flex items-center justify-between text-[11px] text-silver-400 px-1">
              <span>Arrastra cualquier mesa para reubicarla o redimensiona desde las esquinas. Haz clic para consultar detalles y asignaciones.</span>
              <span>Motor gráfico: Coordenadas normalizadas (0..1)</span>
            </div>
          </div>

          {/* Selected Table Detail Panel (25-28%) */}
          {selectedTable && (
            <div className="w-full lg:w-[28%] xl:w-[25%] lg:sticky lg:top-4">
              <TableDetailPanel
                table={selectedTable}
                onClose={() => setSelectedTableId(null)}
                onOpenEdit={() => setIsEditOpen(true)}
                onOpenAssign={() => setIsAssignOpen(true)}
                onToggleBlock={handleToggleBlock}
                onDuplicate={handleDuplicateTable}
                onDelete={handleDeleteTable}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Accessible Table List Alternative */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="p-0 overflow-hidden bg-obsidian-850 border border-silver-800/80 rounded-lg">
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
          </div>
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
