import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Input,
  Modal,
  Icon,
  Alert,
  EmptyState,
} from '../../design-system';
import {
  VISUAL_QA_GROUP_STATES,
  type VisualGroupState,
  type VisualProductOption,
} from '../../fixtures';

export interface GraduateGroupScreenProps {
  groupStateId?: string;
}

export const GraduateGroupScreen: React.FC<GraduateGroupScreenProps> = ({
  groupStateId = 'group-andrea-available',
}) => {
  const groupState: VisualGroupState | undefined =
    VISUAL_QA_GROUP_STATES[groupStateId] ||
    VISUAL_QA_GROUP_STATES['group-andrea-available'];

  // Modals
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Add Member Form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberProductType, setNewMemberProductType] = useState('Lugar Adulto');

  // Add Product / Quote
  const [selectedProduct, setSelectedProduct] = useState<VisualProductOption | null>(
    groupState?.availableProductOptions?.[0] || null
  );
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  // Honest feedback notifications
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!groupState) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans animate-fadeIn pb-20">
        <div>
          <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
            Mi grupo
          </h1>
          <p className="text-xs text-silver-400 mt-1">
            Gestión de lugares e integrantes de tu graduación.
          </p>
        </div>
        <EmptyState
          icon="group"
          title="Grupo no disponible"
          description="No se encontró información de membresía o grupo para el usuario."
        />
      </div>
    );
  }

  const isLocked = groupState.isDeadlineClosed || groupState.isEventOpen === false;

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setIsAddMemberModalOpen(false);
    setNewMemberName('');
    setFeedbackMessage(
      'Alta preparada en modo visual. La disponibilidad será validada por el backend.'
    );
  };

  const handleConfirmProductPurchase = () => {
    setIsAddProductModalOpen(false);
    setFeedbackMessage(
      'Cotización validada en modo visual. La operación definitiva será confirmada por el backend.'
    );
  };

  const handleSelectProduct = (product: VisualProductOption) => {
    setIsQuoteLoading(true);
    setSelectedProduct(product);
    setTimeout(() => {
      setIsQuoteLoading(false);
    }, 250);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
            Mi grupo
          </h1>
          <p className="text-xs text-silver-400 mt-1">
            Lugares contratados, asignación de integrantes y compra de lugares adicionales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/graduate/contract">
            <Button variant="ghost" size="sm" iconStart="ticket">
              Ver contrato
            </Button>
          </Link>
          {!isLocked && groupState.availableProductOptions.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              iconStart="plus"
              onClick={() => {
                setSelectedProduct(groupState.availableProductOptions[0]);
                setIsAddProductModalOpen(true);
              }}
            >
              Agregar lugar
            </Button>
          )}
        </div>
      </div>

      {feedbackMessage && (
        <Alert variant="info" onDismiss={() => setFeedbackMessage(null)}>
          {feedbackMessage}
        </Alert>
      )}

      {/* Lock Warnings */}
      {groupState.isDeadlineClosed && (
        <Alert variant="warning">
          El periodo para registrar o modificar integrantes ha finalizado conforme al calendario del evento.
        </Alert>
      )}

      {groupState.isEventOpen === false && (
        <Alert variant="info">
          El evento se encuentra cerrado para modificaciones operativas.
        </Alert>
      )}

      {/* 1. Resumen de Lugares (Hero Section - Flat domain composition) */}
      <section aria-labelledby="membership-capacity-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="membership-capacity-heading" className="text-xs font-bold text-silver-400 uppercase tracking-wider">
            Capacidad de tu membresía
          </h2>
          <Badge variant={groupState.availableSlots > 0 ? 'gold' : 'neutral'} size="sm">
            {groupState.namedMembersCount} de {groupState.totalPlaces} Lugares Asignados
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <span className="text-silver-400 block text-xs">Lugares contratados</span>
            <span className="text-2xl font-extrabold text-silver-50 font-sans">
              {groupState.totalPlaces}
            </span>
            <span className="text-[11px] text-silver-400 block mt-0.5">
              {groupState.contractLineItemsSummary}
            </span>
          </div>

          <div>
            <span className="text-silver-400 block text-xs">Integrantes registrados</span>
            <span className="text-2xl font-extrabold text-status-success font-sans">
              {groupState.namedMembersCount}
            </span>
            <span className="text-[11px] text-silver-400 block mt-0.5">
              Con nombre asignado
            </span>
          </div>

          <div>
            <span className="text-silver-400 block text-xs">Lugares pendientes de nombre</span>
            <span className="text-2xl font-extrabold text-status-warning font-sans">
              {groupState.availableSlots}
            </span>
            <span className="text-[11px] text-silver-400 block mt-0.5">
              {groupState.availableSlots > 0
                ? 'Disponibles para asignar'
                : 'Grupo completo'}
            </span>
          </div>
        </div>

        {/* Action button inside section if available */}
        {!isLocked && groupState.availableSlots > 0 && (
          <div className="pt-1">
            <Button
              variant="primary"
              size="sm"
              iconStart="plus"
              onClick={() => setIsAddMemberModalOpen(true)}
            >
              Agregar integrante ({groupState.availableSlots} restante{groupState.availableSlots > 1 ? 's' : ''})
            </Button>
          </div>
        )}
      </section>

      <hr className="border-silver-800/60" />

      {/* 2. Integrantes Nominales (Flat list with hairlines, zero cards) */}
      <section aria-labelledby="members-heading" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 id="members-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
            Integrantes Nominales ({groupState.members.length})
          </h2>
          <Link to="/graduate/meals" className="text-xs text-gold-400 hover:underline">
            Gestionar platillos →
          </Link>
        </div>

        <div className="divide-y divide-silver-800/60">
          {groupState.members.map((member) => (
            <div
              key={member.id}
              className="py-3 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-silver-100">
                    {member.name}
                  </span>
                  <Badge variant={member.isPrimary ? 'gold' : 'neutral'} size="sm">
                    {member.isPrimary ? 'Graduado titular' : 'Acompañante'}
                  </Badge>
                </div>
                <span className="text-xs text-silver-400 block mt-0.5">
                  {member.productType}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-silver-400">
                <span>
                  Ubicación: <strong className="text-silver-200 font-sans font-medium">{member.tableLabel || 'Mesa pendiente'}</strong>
                </span>
                <span>·</span>
                <span>
                  Platillo: <strong className="text-silver-200 font-sans font-medium">{member.mealSummary || 'Sin menú asignado'}</strong>
                </span>
              </div>
            </div>
          ))}

          {/* Unassigned Slots representation */}
          {Array.from({ length: groupState.availableSlots }).map((_, index) => (
            <div
              key={`unassigned-${index}`}
              className="py-3 px-1 flex items-center justify-between text-xs"
            >
              <div>
                <span className="text-silver-400 font-medium block">
                  Lugar disponible #{groupState.namedMembersCount + index + 1}
                </span>
                <span className="text-[11px] text-silver-500">
                  Pendiente de registrar nombre
                </span>
              </div>
              {!isLocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddMemberModalOpen(true)}
                >
                  Registrar
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      <hr className="border-silver-800/60" />

      {/* Reduction and Policies Notice */}
      <div className="py-2 text-xs text-silver-400 space-y-1">
        <div className="flex items-center gap-2 text-silver-300 font-semibold">
          <Icon name="info" size={14} />
          <span>Ajustes y reducciones en tu grupo</span>
        </div>
        <p className="text-[11px] text-silver-400 leading-relaxed">
          Para solicitar una reducción de lugares contratados o aclaraciones sobre asignaciones, contacta a la coordinación de tu evento. Las reducciones están sujetas a la política de cancelación vinculada a tu contrato.
        </p>
      </div>

      {/* Modal: Agregar Integrante (UX-G-GROUP-002) */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Agregar integrante"
        description="Registra el nombre de tu acompañante para asignarlo a uno de tus lugares contratados."
        size="md"
      >
        <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs font-sans">
          <Input
            label="Nombre completo del integrante"
            placeholder="Ej. Laura González"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-silver-300">Tipo de lugar asignado</label>
            <select
              value={newMemberProductType}
              onChange={(e) => setNewMemberProductType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-obsidian-900 border border-silver-700 text-silver-100 text-xs focus:ring-1 focus:ring-gold-500 focus:outline-none"
            >
              <option value="Lugar Adulto">Lugar Adulto (Cena formal)</option>
              <option value="Lugar Infantil">Lugar Infantil (Menú especial)</option>
              <option value="Lugar Sin Cena">Lugar Sin Cena</option>
            </select>
          </div>

          <div className="p-3 bg-obsidian-900 border border-silver-800 rounded-card text-[11px] text-silver-400 space-y-1">
            <span className="text-silver-300 font-semibold block">Selección de platillo:</span>
            <p>
              Podrás seleccionar el menú y platillo de cada acompañante posteriormente en la sección de Platillos.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsAddMemberModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Guardar integrante
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Agregar Producto / Lugar con Cotización Visual (UX-G-GROUP-003) */}
      <Modal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        title="Contratar lugares o productos adicionales"
        description="Selecciona el producto a adquirir para tu grupo y revisa el impacto en tu plan de pagos."
        size="md"
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-silver-300">
              Productos disponibles para el evento
            </label>
            <div className="grid grid-cols-1 gap-2">
              {groupState.availableProductOptions.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleSelectProduct(prod)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedProduct?.id === prod.id
                      ? 'bg-obsidian-800 border-gold-500 text-silver-100'
                      : 'bg-obsidian-900 border-silver-800 text-silver-300 hover:border-silver-700'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block">{prod.name}</span>
                    <span className="text-[11px] text-silver-400">{prod.description}</span>
                  </div>
                  <span className="font-bold font-sans text-gold-400 text-sm">
                    ${prod.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quote Section (from fixture, zero frontend catchup formula) */}
          {selectedProduct && groupState.precalculatedQuote && (
            <div className="p-4 bg-obsidian-900 border border-gold-500/40 rounded-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gold-400 text-xs uppercase tracking-wider">
                  Cotización de Adición
                </span>
                <span className="text-[10px] text-silver-400">BR-CONTRACT-007</span>
              </div>

              {isQuoteLoading ? (
                <div className="py-4 text-center text-silver-400 animate-pulse">
                  Calculando actualización...
                </div>
              ) : (
                <div className="space-y-2 text-xs divide-y divide-silver-800/60">
                  <div className="flex justify-between pt-1">
                    <span className="text-silver-400">Precio del producto:</span>
                    <strong className="font-sans text-silver-100">
                      ${groupState.precalculatedQuote.productPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </strong>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-silver-400">Nuevo total contratado:</span>
                    <strong className="font-sans text-silver-100">
                      ${groupState.precalculatedQuote.newContractedTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </strong>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-silver-400">Pago requerido hoy (catch-up):</span>
                    <strong className="font-sans text-status-warning text-sm">
                      ${groupState.precalculatedQuote.requiredNow.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </strong>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-silver-400">Saldo restante en mensualidades:</span>
                    <strong className="font-sans text-silver-100">
                      ${groupState.precalculatedQuote.futureBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </strong>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-silver-400 leading-relaxed border-t border-silver-800/60 pt-2">
                La compra adicional quedará registrada como una adición/movimiento vinculado a tu contrato.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsAddProductModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmProductPurchase}
            >
              Confirmar y continuar al pago
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
