import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Badge, Icon } from '../../design-system';
import { VISUAL_QA_GRADUATE_SEATING_STATES, type TableAssignmentMock } from '../../fixtures';
import { SeatingMapCanvas } from '../admin/tables/SeatingMapCanvas';
import { useSeatingRealtime } from '../../services/seating';

export interface GraduateTableScreenProps {
  seatingStateId?: string;
}

export const GraduateTableScreen: React.FC<GraduateTableScreenProps> = ({
  seatingStateId = 'seating-andrea-partial',
}) => {
  const seating =
    VISUAL_QA_GRADUATE_SEATING_STATES[seatingStateId] ??
    VISUAL_QA_GRADUATE_SEATING_STATES['seating-andrea-partial'];
  const eventId = seating.eventId || 'evt-derecho-2027';

  // Realtime subscription and state
  const {
    tables,
    selectedTableId,
    setSelectedTableId,
    selectedTable,
    backgroundImageUrl,
    assignMembers,
    assignmentError,
    clearAssignmentError,
  } = useSeatingRealtime({
    eventId,
    role: 'graduate',
    currentGraduateId: seating.graduateId,
  });

  const [membersState, setMembersState] = useState(seating.members);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const [assignedTableNumber, setAssignedTableNumber] = useState<number | null>(null);

  const selectedMembers = membersState.filter((member) => selectedMemberIds.includes(member.id));
  const toggleMember = (id: string) => {
    clearAssignmentError();
    setSelectedMemberIds((current) =>
      current.includes(id) ? current.filter((memberId) => memberId !== id) : [...current, id]
    );
  };

  const containsChild = selectedMembers.some((member) => /niñ|infantil/i.test(member.productType));

  // Dynamic visual states
  const isBlocked = selectedTable?.status === 'BLOCKED';
  const isFull = selectedTable ? selectedTable.available === 0 : false;
  const hasEnoughSpace = selectedTable ? selectedTable.available >= selectedMembers.length : false;

  const canAssign = Boolean(
    selectedTable &&
      selectedMembers.length > 0 &&
      !isBlocked &&
      !isFull &&
      hasEnoughSpace
  );

  const handleAssign = async () => {
    if (!selectedTable || !canAssign) return;

    const newAssignments: TableAssignmentMock[] = selectedMembers.map((m) => ({
      id: `asgn-${Date.now()}-${m.id}`,
      graduateId: seating.graduateId,
      graduateName: seating.graduateName,
      groupMemberId: m.id,
      memberName: m.name,
      placesAssigned: 1,
      isLocalPreview: false,
    }));

    const res = await assignMembers(selectedTable.id, newAssignments);
    if (res.success) {
      setAssigned(true);
      setAssignedTableNumber(selectedTable.number);
      setMembersState((prev) =>
        prev.map((m) =>
          selectedMemberIds.includes(m.id)
            ? { ...m, assignedTableNumber: selectedTable.number, tableId: selectedTable.id }
            : m
        )
      );
      setSelectedMemberIds([]);
    }
  };

  if (!seating.isFinanciallyEligible) {
    return (
      <div className="mx-auto max-w-xl space-y-5 pb-16 font-sans animate-fadeIn">
        <h1 className="font-display text-2xl font-bold text-silver-50">Mesa</h1>
        <p className="text-sm text-silver-300">La selección de mesa aún no está disponible.</p>
        <Link to="/graduate/payments">
          <Button variant="primary">Ver pagos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 overflow-hidden pb-16 font-sans animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-silver-50 tracking-tight">
            Selección de Mesa
          </h1>
          <p className="text-xs text-silver-400 mt-0.5">
            {seating.eventName} • Elige la ubicación para ti y tus acompañantes
          </p>
        </div>
      </header>

      {/* Success Notification */}
      {assigned && (
        <div className="p-3 bg-status-success/15 border border-status-success/30 rounded-xl text-sm text-status-success flex items-center justify-between animate-fadeIn">
          <span>Asignación preparada para Mesa {assignedTableNumber || selectedTable?.number}.</span>
          <button
            type="button"
            onClick={() => setAssigned(false)}
            className="text-xs text-status-success underline ml-2"
          >
            Aceptar
          </button>
        </div>
      )}

      {/* Main Content Layout: 75% Canvas / 25% Sidebar */}
      <div className="grid gap-6 lg:grid-cols-4 lg:items-start">
        {/* Canvas / List Area (75% on Desktop) */}
        <section className="order-2 space-y-3 lg:order-1 lg:col-span-3">
          <SeatingMapCanvas
            tables={tables}
            selectedTableId={selectedTableId}
            onSelectTable={(id) => {
              clearAssignmentError();
              setSelectedTableId(id);
            }}
            backgroundImageUrl={backgroundImageUrl}
            mode="graduate"
            currentGraduateId={seating.graduateId}
          />

          <div className="flex items-center justify-between pt-1">
            <Button
              variant="ghost"
              size="sm"
              iconStart={listOpen ? 'chevron-up' : 'menu'}
              onClick={() => setListOpen((current) => !current)}
            >
              {listOpen ? 'Ocultar lista' : 'Ver como lista'}
            </Button>
            <span className="text-[11px] text-silver-500">
              Disponibilidad actualizada automáticamente
            </span>
          </div>

          {/* Accessible Table List Alternative */}
          {listOpen && (
            <div className="space-y-2 pt-2 bg-obsidian-900 border border-silver-800/80 rounded-xl p-4 animate-fadeIn">
              <h3 className="text-xs font-bold text-silver-300 uppercase tracking-wider mb-2">
                Listado accesible de mesas
              </h3>
              <div className="divide-y divide-silver-800/60">
                {tables.map((table) => {
                  const isTblBlocked = table.status === 'BLOCKED';
                  const isTblFull = table.available === 0;
                  const isSelected = table.id === selectedTableId;

                  return (
                    <div
                      key={table.id}
                      className={`flex items-center justify-between gap-3 py-2.5 text-xs ${
                        isSelected ? 'bg-gold-500/10 px-2 rounded-lg' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-silver-100">Mesa {table.number}</span>
                        <span className="text-[11px] text-silver-400">
                          ({table.shape === 'SQUARE' ? 'Cuadrada' : 'Circular'} • {table.capacity} lugares)
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-silver-300 font-medium">
                          {isTblBlocked
                            ? 'Bloqueada'
                            : isTblFull
                            ? 'Completa'
                            : `${table.available} libres`}
                        </span>

                        {!isTblBlocked && !isTblFull && (
                          <Button
                            size="sm"
                            variant={isSelected ? 'primary' : 'ghost'}
                            onClick={() => setSelectedTableId(table.id)}
                          >
                            {isSelected ? 'Seleccionada' : 'Seleccionar'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Sidebar: Group Members & Assignment (25% on Desktop) */}
        <aside className="order-1 space-y-4 lg:order-2 lg:col-span-1 bg-obsidian-850 border border-silver-800/80 p-5 rounded-2xl shadow-card">
          <div>
            <h2 className="text-sm font-bold font-display text-silver-100">
              ¿A quién quieres ubicar?
            </h2>
            <p className="text-[11px] text-silver-400 mt-0.5">
              Selecciona los integrantes para asignarles lugar en la mesa elegida.
            </p>
          </div>

          {/* Members Checklist / Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible">
            {membersState.map((member) => {
              const isSelected = selectedMemberIds.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={`shrink-0 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-gold-500 text-obsidian-950 font-bold shadow-md'
                      : 'bg-obsidian-900 border border-silver-800 text-silver-200 hover:border-silver-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>{member.name}</span>
                    {member.isPrimary && (
                      <Badge variant="neutral" size="sm" className="text-[9px]">
                        Titular
                      </Badge>
                    )}
                  </div>
                  {member.assignedTableNumber ? (
                    <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-obsidian-800' : 'text-silver-400'}`}>
                      · Mesa {member.assignedTableNumber}
                    </span>
                  ) : (
                    <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-obsidian-800' : 'text-status-warning'}`}>
                      · Sin mesa asignada
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Contextual Warning for Minors */}
          {containsChild && (
            <div className="p-2.5 bg-gold-500/10 border border-gold-500/30 rounded-xl text-xs text-gold-300 flex items-start gap-1.5">
              <Icon name="info" size={14} className="shrink-0 mt-0.5" />
              <span>Verifica en qué mesa quedará el menor.</span>
            </div>
          )}

          <p className="text-xs text-silver-400">
            {selectedMembers.length
              ? `${selectedMembers.length} persona(s) seleccionada(s)`
              : 'Selecciona una o más personas.'}
          </p>

          {/* Table Selection Summary on Desktop */}
          {selectedTable ? (
            <div className="space-y-3 pt-3 border-t border-silver-800/80">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-silver-100">
                    Mesa {selectedTable.number}
                  </span>
                  {isBlocked ? (
                    <Badge variant="error" size="sm">Bloqueada</Badge>
                  ) : isFull ? (
                    <Badge variant="neutral" size="sm">Completa</Badge>
                  ) : (
                    <Badge variant="success" size="sm">{selectedTable.available} libres</Badge>
                  )}
                </div>
                <p className="text-xs text-silver-400 mt-0.5">
                  {selectedTable.available} lugares disponibles de {selectedTable.capacity}
                </p>
              </div>

              {/* Realtime dynamic conflict notices */}
              {isFull && (
                <div className="p-2.5 bg-status-error/10 border border-status-error/30 rounded-xl text-xs text-status-error">
                  Esta mesa se acaba de llenar. Selecciona otra.
                </div>
              )}
              {isBlocked && (
                <div className="p-2.5 bg-status-error/10 border border-status-error/30 rounded-xl text-xs text-status-error">
                  Esta mesa ha sido bloqueada. Selecciona otra.
                </div>
              )}
              {selectedTable && !isFull && !isBlocked && !hasEnoughSpace && (
                <div className="p-2.5 bg-status-warning/10 border border-status-warning/30 rounded-xl text-xs text-status-warning">
                  No hay suficiente espacio para los {selectedMembers.length} integrantes seleccionados ({selectedTable.available} disponibles).
                </div>
              )}
              {assignmentError && (
                <div className="p-2.5 bg-status-error/10 border border-status-error/30 rounded-xl text-xs text-status-error">
                  {assignmentError}
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                className="w-full"
                disabled={!canAssign}
                onClick={handleAssign}
              >
                Asignar {selectedMembers.length || ''} persona{selectedMembers.length === 1 ? '' : 's'}
              </Button>
            </div>
          ) : (
            <div className="p-3 bg-obsidian-900/60 rounded-xl border border-silver-800/60 text-center text-xs text-silver-400">
              Toca una mesa en el croquis para ver su aforo disponible.
            </div>
          )}
        </aside>
      </div>

      {/* Mobile Bottom Sheet (Visible on screens < lg when table is selected) */}
      {selectedTable && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 lg:hidden bg-obsidian-900 border-t border-silver-800 rounded-t-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto"
          role="dialog"
          aria-label={`Mesa ${selectedTable.number}`}
        >
          <div className="w-10 h-1 bg-silver-700 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display font-bold text-lg text-silver-50">
                Mesa {selectedTable.number}
              </h3>
              <p className="text-xs text-silver-400">
                {selectedTable.available} lugares disponibles de {selectedTable.capacity}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTableId(null)}
              className="p-1.5 rounded-lg text-silver-400 hover:text-silver-100"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Realtime notices */}
          {isFull && (
            <div className="p-2.5 mb-3 bg-status-error/10 border border-status-error/30 rounded-xl text-xs text-status-error">
              Esta mesa se acaba de llenar. Selecciona otra.
            </div>
          )}
          {isBlocked && (
            <div className="p-2.5 mb-3 bg-status-error/10 border border-status-error/30 rounded-xl text-xs text-status-error">
              Esta mesa ha sido bloqueada. Selecciona otra.
            </div>
          )}
          {selectedTable && !isFull && !isBlocked && !hasEnoughSpace && (
            <div className="p-2.5 mb-3 bg-status-warning/10 border border-status-warning/30 rounded-xl text-xs text-status-warning">
              No hay suficiente espacio para los {selectedMembers.length} integrantes seleccionados.
            </div>
          )}

          {/* Member Selection Checklist in Mobile Sheet */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-silver-300">Integrantes a ubicar:</p>
            {membersState.map((member) => {
              const isSelected = selectedMemberIds.includes(member.id);
              return (
                <label
                  key={member.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-gold-500/15 border-gold-500 text-silver-100'
                      : 'bg-obsidian-850 border-silver-800 text-silver-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMember(member.id)}
                      className="rounded border-silver-700 text-gold-500 focus:ring-gold-500"
                    />
                    <span className="font-medium">{member.name}</span>
                  </div>
                  {member.assignedTableNumber && (
                    <span className="text-[10px] text-silver-400">
                      Mesa {member.assignedTableNumber}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          <Button
            variant="primary"
            className="w-full"
            disabled={!canAssign}
            onClick={async () => {
              await handleAssign();
              setSelectedTableId(null);
            }}
          >
            Asignar {selectedMembers.length || ''} persona{selectedMembers.length === 1 ? '' : 's'}
          </Button>
        </div>
      )}
    </div>
  );
};
