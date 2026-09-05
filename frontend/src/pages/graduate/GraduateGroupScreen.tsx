import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, EmptyState, Input, Modal } from '../../design-system';
import { VISUAL_QA_GROUP_STATES, type VisualGroupState } from '../../fixtures';

export interface GraduateGroupScreenProps {
  groupStateId?: string;
}

export const GraduateGroupScreen: React.FC<GraduateGroupScreenProps> = ({
  groupStateId = 'group-andrea-available',
}) => {
  const groupState: VisualGroupState | undefined =
    VISUAL_QA_GROUP_STATES[groupStateId] ??
    VISUAL_QA_GROUP_STATES['group-andrea-available'];
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addPlaceOpen, setAddPlaceOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!groupState) {
    return (
      <EmptyState
        icon="group"
        title="Grupo no disponible"
        description="No encontramos información de tu grupo."
      />
    );
  }

  const isLocked = groupState.isDeadlineClosed || groupState.isEventOpen === false;
  const selectedProduct = groupState.availableProductOptions.find((product) => product.id === selectedProductId);
  const quote = groupState.precalculatedQuote?.productId === selectedProductId
    ? groupState.precalculatedQuote
    : undefined;

  const saveMember = (event: React.FormEvent) => {
    event.preventDefault();
    if (!memberName.trim()) return;
    setMemberName('');
    setAddMemberOpen(false);
    setFeedback('Revisa los datos antes de continuar con el registro.');
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-20 font-sans animate-fadeIn">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-silver-50">Mi grupo</h1>
        <p className="text-sm text-silver-400">
          {groupState.namedMembersCount} de {groupState.totalPlaces} lugares tienen nombre.
        </p>
      </header>

      {feedback && <Alert variant="info" onDismiss={() => setFeedback(null)}>{feedback}</Alert>}
      {groupState.isDeadlineClosed && (
        <Alert variant="warning">El periodo para registrar integrantes ya terminó.</Alert>
      )}
      {groupState.isEventOpen === false && (
        <Alert variant="info">Este evento no admite cambios por ahora.</Alert>
      )}

      <section aria-labelledby="members-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 id="members-heading" className="text-sm font-semibold text-silver-100">Personas</h2>
          <Link to="/graduate/meals" className="text-sm text-gold-400 hover:text-gold-300">
            Elegir platillos
          </Link>
        </div>
        <div className="divide-y divide-silver-800/70">
          {groupState.members.map((member) => (
            <div key={member.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-silver-100">{member.name}</p>
                <p className="text-xs text-silver-400">{member.productType}</p>
              </div>
              <p className="text-xs text-silver-400">
                {member.tableLabel || 'Mesa pendiente'} · {member.mealSummary || 'Platillo pendiente'}
              </p>
            </div>
          ))}
          {Array.from({ length: groupState.availableSlots }).map((_, index) => (
            <div key={index} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm text-silver-200">Lugar disponible</p>
                <p className="text-xs text-silver-500">Aún sin nombre</p>
              </div>
              {!isLocked && (
                <Button variant="ghost" size="sm" onClick={() => setAddMemberOpen(true)}>
                  Registrar
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {!isLocked && (
        <div className="flex flex-wrap gap-3">
          {groupState.availableSlots > 0 && (
            <Button variant="primary" size="sm" iconStart="plus" onClick={() => setAddMemberOpen(true)}>
              Agregar integrante
            </Button>
          )}
          {groupState.availableProductOptions.length > 0 && (
            <Button variant="secondary" size="sm" iconStart="plus" onClick={() => {
              setSelectedProductId(groupState.availableProductOptions[0]?.id ?? null);
              setAddPlaceOpen(true);
            }}>
              Agregar boleto
            </Button>
          )}
        </div>
      )}

      <p className="text-xs leading-relaxed text-silver-400">
        Para cambios en lugares contratados, consulta tu contrato o contacta a coordinación.
      </p>

      <Modal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        title="Agregar integrante"
        description="Asigna un nombre a uno de tus lugares disponibles."
        size="md"
      >
        <form className="space-y-5" onSubmit={saveMember}>
          <Input
            label="Nombre completo"
            value={memberName}
            onChange={(event) => setMemberName(event.target.value)}
            placeholder="Ej. Laura González"
            required
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" type="button" onClick={() => setAddMemberOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">Continuar</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={addPlaceOpen}
        onClose={() => setAddPlaceOpen(false)}
        title="Agregar boleto"
        description="Elige una opción y revisa su impacto antes de continuar."
        size="md"
      >
        <div className="space-y-5">
          <div className="divide-y divide-silver-800/70">
            {groupState.availableProductOptions.map((product) => (
              <label key={product.id} className="flex cursor-pointer items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-silver-100"><input type="radio" name="additional-product" className="mr-2" checked={selectedProductId === product.id} onChange={() => setSelectedProductId(product.id)} />{product.name}</p>
                  <p className="text-xs text-silver-400">{product.description}</p>
                </div>
                <span className="text-sm font-medium text-gold-400">
                  {'$'}{product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </label>
            ))}
          </div>
          {quote && (
            <div className="space-y-2 border-y border-silver-800/70 py-4 text-sm">
              <p className="flex justify-between gap-4 text-silver-300">
                <span>Debes abonar hoy</span>
                <strong className="text-gold-400">{'$'}{quote.requiredNow.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
              </p>
              <p className="flex justify-between gap-4 text-silver-300">
                <span>Nuevo total</span>
                <strong>{'$'}{quote.newContractedTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
              </p>
            </div>
          )}
          {selectedProduct && !quote && (
            <p className="text-xs text-silver-400">El importe final de esta opción se confirmará antes de continuar.</p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setAddPlaceOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" disabled={!selectedProduct} onClick={() => {
              setAddPlaceOpen(false);
              setFeedback(selectedProduct ? `Elegiste ${selectedProduct.name}. Revisa el importe antes de registrar el pago.` : null);
            }}>Continuar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
