import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Badge,
  Button,
  Icon,
  Alert,
  Modal,
  Tabs,
  type TabItem,
} from '../../design-system';
import {
  VISUAL_QA_GRADUATE_SEATING_STATES,
  VISUAL_QA_TABLES,
  type VisualGraduateSeatingState,
  type VisualTable,
} from '../../fixtures';
import { SeatingMapCanvas } from '../admin/tables/SeatingMapCanvas';
import { type SeatingTableViewModel } from '../admin/tables/seatingCoordinates';
import { DemoFlowPanel } from '../../demo/DemoFlowPanel';

export interface GraduateTableScreenProps {
  seatingStateId?: string;
}

export const GraduateTableScreen: React.FC<GraduateTableScreenProps> = ({
  seatingStateId = 'seating-andrea-partial',
}) => {
  const navigate = useNavigate();

  // Load visual seating state from fixture
  const seatingState: VisualGraduateSeatingState =
    VISUAL_QA_GRADUATE_SEATING_STATES[seatingStateId] ||
    VISUAL_QA_GRADUATE_SEATING_STATES['seating-andrea-partial'];

  // Local state for tables & assignments
  const [tables] = useState<VisualTable[]>(VISUAL_QA_TABLES);
  const [members, setMembers] = useState(seatingState.members);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(() => {
    // By default, select unassigned members if any
    const unassigned = seatingState.members.filter((m) => !m.assignedTableNumber);
    return unassigned.length > 0 ? [unassigned[0].id] : [];
  });

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'canvas'>('list');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPreviewSuccessNotice, setIsPreviewSuccessNotice] = useState(false);
  const [lastAssignedTableName, setLastAssignedTableName] = useState('');

  // Selected table object
  const selectedTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId) || null;
  }, [tables, selectedTableId]);

  // Transform visual tables to SeatingTableViewModel for the read-only Konva Canvas
  const canvasTables: SeatingTableViewModel[] = useMemo(() => {
    return tables.map((t) => ({
      id: t.id,
      eventId: t.eventId,
      number: t.number,
      shape: t.shape,
      capacity: t.capacity,
      occupied: t.occupied,
      available: t.available,
      status: t.status,
      x: t.x,
      y: t.y,
      assignments: [], // Privacy: Never leak third-party assignments to Graduate canvas
    }));
  }, [tables]);

  // Selected members count
  const selectedMembersCount = selectedMemberIds.length;

  // Check capacity compatibility
  const hasEnoughCapacity = selectedTable
    ? selectedTable.status === 'AVAILABLE' && selectedTable.available >= selectedMembersCount
    : false;

  // Toggle member selection
  const handleToggleMember = (memberId: string) => {
    if (seatingState.isDeadlineClosed || !seatingState.isFinanciallyEligible) return;
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  // Open assignment confirmation
  const handleOpenConfirm = (table: VisualTable) => {
    setSelectedTableId(table.id);
    setIsConfirmModalOpen(true);
  };

  // Confirm assignment in local preview mode
  const handleConfirmAssignment = () => {
    if (!selectedTable) return;

    // Apply local visual update
    setMembers((prev) =>
      prev.map((m) =>
        selectedMemberIds.includes(m.id)
          ? {
              ...m,
              assignedTableNumber: selectedTable.number,
              tableId: selectedTable.id,
            }
          : m
      )
    );

    setLastAssignedTableName(`Mesa ${selectedTable.number}`);
    setIsConfirmModalOpen(false);
    setIsPreviewSuccessNotice(true);
    setSelectedMemberIds([]);
  };

  // -------------------------------------------------------------------------
  // 1. Scenario: LOCKED (Financial ineligibility)
  // -------------------------------------------------------------------------
  if (!seatingState.isFinanciallyEligible) {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto animate-fadeIn font-sans pb-16">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-serif font-bold text-silver-50">
            Asignación de mesas
          </h1>
          <p className="text-xs text-silver-400">
            {seatingState.eventName}
          </p>
        </div>

        <Card className="p-6 bg-obsidian-850 border border-silver-800/80 flex flex-col items-center text-center gap-4 shadow-card">
          <div className="w-14 h-14 rounded-full bg-status-warning/15 text-status-warning flex items-center justify-center">
            <Icon name="lock" size={28} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-silver-100 font-sans">
              Selección de mesa no disponible
            </h2>
            <p className="text-xs text-silver-400 leading-relaxed max-w-md">
              {seatingState.lockedReason ||
                'La selección de mesa aún no está disponible. Completa el pago requerido para continuar.'}
            </p>
          </div>

          <div className="w-full pt-2">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/graduate/payments')}
            >
              Ver mis pagos
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. Main Screen: Eligible Graduate
  // -------------------------------------------------------------------------
  const tabItems: TabItem[] = [
    { id: 'list', label: 'Seleccionar por lista', icon: 'table' },
    { id: 'canvas', label: 'Ver plano de mesas', icon: 'search' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto animate-fadeIn font-sans pb-20">
      <DemoFlowPanel flow="seating" />
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold text-silver-50">
          Asignación de mesas
        </h1>
        <p className="text-xs text-silver-400">
          {seatingState.eventName} • Distribución por integrante
        </p>
      </div>

      {/* Scenario: Deadline Closed Banner */}
      {seatingState.isDeadlineClosed && (
        <Alert variant="info" title="Periodo finalizado">
          El periodo para cambios de mesa ha finalizado. La asignación actual es definitiva.
        </Alert>
      )}

      {/* Scenario: Concurrency Conflict Banner */}
      {seatingState.hasConcurrencyConflict && (
        <Alert variant="warning" title="Disponibilidad actualizada">
          Esta mesa acaba de cambiar y ya no tiene espacio suficiente. Por favor, selecciona otra mesa disponible.
        </Alert>
      )}

      {/* Scenario: Preview Success Feedback */}
      {isPreviewSuccessNotice && (
        <Alert
          variant="success"
          title="Vista previa de asignación"
        >
          Se asignó temporalmente a {lastAssignedTableName}. La disponibilidad y asignación definitiva serán validadas por el backend.
        </Alert>
      )}

      {/* Section 1: Mesas de tu grupo (Resumen por integrante propio) */}
      <Card className="p-5 bg-obsidian-850 border border-silver-800/80 space-y-4">
        <div className="flex items-center justify-between border-b border-silver-800/60 pb-3">
          <div>
            <h2 className="text-sm font-bold text-silver-100">
              Mesas de tu grupo
            </h2>
            <p className="text-[11px] text-silver-400">
              Cada integrante puede ubicarse en una mesa diferente si lo deseas.
            </p>
          </div>
          <Badge variant="neutral" size="sm">
            {members.length} integrantes
          </Badge>
        </div>

        {/* Member list with their assigned table */}
        <div className="space-y-2">
          {members.map((member) => {
            const isSelectedForMove = selectedMemberIds.includes(member.id);
            const isAssigned = !!member.assignedTableNumber;

            return (
              <div
                key={member.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isSelectedForMove
                    ? 'bg-obsidian-800 border-gold-500 shadow-sm'
                    : 'bg-obsidian-900 border-silver-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  {!seatingState.isDeadlineClosed && (
                    <input
                      type="checkbox"
                      checked={isSelectedForMove}
                      onChange={() => handleToggleMember(member.id)}
                      className="rounded border-silver-700 bg-obsidian-800 text-gold-500 focus:ring-gold-500 h-4 w-4"
                      aria-label={`Seleccionar a ${member.name} para asignar mesa`}
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-silver-100">
                        {member.name}
                      </span>
                      {member.isPrimary && (
                        <Badge variant="gold" size="sm">
                          Graduado titular
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-silver-400 block mt-0.5">
                      {member.productType}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {isAssigned ? (
                    <Badge variant="success" size="sm">
                      Mesa {member.assignedTableNumber}
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      Sin mesa asignada
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions for selecting members */}
        {!seatingState.isDeadlineClosed && (
          <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800/60 text-xs text-silver-300 flex items-center justify-between">
            <span>
              {selectedMembersCount > 0
                ? `${selectedMembersCount} persona(s) seleccionada(s) para ubicar.`
                : 'Selecciona una o más personas para asignar o cambiar de mesa.'}
            </span>
            {selectedMembersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMemberIds([])}
                className="text-[11px] text-silver-400 hover:text-silver-200"
              >
                Limpiar selección
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Section 2: Table Selection (Tabs for List vs Canvas) */}
      {!seatingState.isDeadlineClosed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-silver-100 font-sans">
                Elige una mesa para tu selección
              </h2>
              <p className="text-xs text-silver-400">
                Consulta la disponibilidad y asigna los lugares seleccionados.
              </p>
            </div>
          </div>

          <Tabs
            tabs={tabItems}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as 'list' | 'canvas')}
          />

          {/* View Mode 1: Mobile-friendly Table Cards / List */}
          {activeTab === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tables.map((table) => {
                const isBlocked = table.status === 'BLOCKED';
                const isFull = table.available === 0 || isBlocked;
                const canFitSelection =
                  selectedMembersCount > 0
                    ? !isBlocked && table.available >= selectedMembersCount
                    : !isBlocked && table.available > 0;

                return (
                  <Card
                    key={table.id}
                    className={`p-4 bg-obsidian-850 border transition-all flex flex-col justify-between gap-3 ${
                      selectedTableId === table.id
                        ? 'border-gold-500 ring-1 ring-gold-500'
                        : 'border-silver-800/80 hover:border-silver-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-bold text-silver-50">
                          Mesa {table.number}
                        </span>
                        <span className="text-[11px] text-silver-400 block mt-0.5">
                          Forma: {table.shape === 'SQUARE' ? 'Cuadrada' : 'Circular'}
                        </span>
                      </div>

                      {isBlocked ? (
                        <Badge variant="error" size="sm">No disponible</Badge>
                      ) : isFull ? (
                        <Badge variant="neutral" size="sm">Completa</Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          {table.available} libres
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-silver-300 flex justify-between items-center pt-2 border-t border-silver-800/60 font-sans">
                      <span className="text-[11px] text-silver-400">
                        Capacidad total: {table.capacity}
                      </span>
                      <Button
                        variant={canFitSelection ? 'primary' : 'secondary'}
                        size="sm"
                        disabled={!canFitSelection || selectedMembersCount === 0}
                        onClick={() => handleOpenConfirm(table)}
                        title={
                          selectedMembersCount === 0
                            ? 'Selecciona al menos una persona arriba'
                            : !canFitSelection
                            ? 'No hay cupo suficiente para tu selección'
                            : `Asignar a Mesa ${table.number}`
                        }
                      >
                        {selectedMembersCount > 0 && table.available < selectedMembersCount && !isBlocked
                          ? 'Sin cupo suficiente'
                          : 'Asignar aquí'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* View Mode 2: Read-Only Interactive Canvas */}
          {activeTab === 'canvas' && (
            <div className="space-y-3">
              <SeatingMapCanvas
                tables={canvasTables}
                selectedTableId={selectedTableId}
                onSelectTable={(id) => {
                  setSelectedTableId(id);
                  const tbl = tables.find((t) => t.id === id);
                  if (tbl) handleOpenConfirm(tbl);
                }}
                mode="graduate"
              />
              <p className="text-[11px] text-silver-400 text-center">
                Toca cualquier mesa disponible para consultar detalles y asignar a tus integrantes seleccionados.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedTable && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title={`Asignar a Mesa ${selectedTable.number}`}
          size="sm"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-silver-400">Mesa destino:</span>
                <span className="font-bold text-silver-100">
                  Mesa {selectedTable.number} ({selectedTable.shape === 'SQUARE' ? 'Cuadrada' : 'Circular'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Disponibilidad en mesa:</span>
                <span className="font-bold text-silver-100">{selectedTable.available} lugares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Personas a asignar:</span>
                <span className="font-bold text-gold-400">{selectedMembersCount} integrantes</span>
              </div>
            </div>

            {/* List of members being assigned */}
            <div className="space-y-1.5">
              <span className="font-semibold text-silver-300 block">
                Integrantes seleccionados:
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {members
                  .filter((m) => selectedMemberIds.includes(m.id))
                  .map((m) => (
                    <div
                      key={m.id}
                      className="p-2 bg-obsidian-900 rounded-lg border border-silver-800 flex justify-between items-center"
                    >
                      <span className="text-silver-200">{m.name}</span>
                      <span className="text-[10px] text-silver-400 font-medium">
                        {m.productType}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Warning if capacity insufficient */}
            {!hasEnoughCapacity && (
              <div className="p-3 bg-status-error/10 text-status-error rounded-xl flex items-center gap-2 border border-status-error/30">
                <Icon name="alert" size={16} />
                <span>
                  Esta mesa tiene {selectedTable.available} lugares disponibles y seleccionaste {selectedMembersCount} personas.
                </span>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-3 bg-obsidian-900 rounded-xl text-silver-400 text-[11px] leading-relaxed border border-silver-800">
              La asignación se aplicará en modo vista previa. La confirmación definitiva será procesada y revalidada por el backend.
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!hasEnoughCapacity || selectedMembersCount === 0}
                onClick={handleConfirmAssignment}
              >
                Confirmar asignación
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
