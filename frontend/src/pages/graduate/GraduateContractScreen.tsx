import React, { useState } from 'react';
import { Button } from '../../design-system';
import { VISUAL_QA_CONTRACTS, type VisualContract } from '../../fixtures';

export interface GraduateContractScreenProps { contractId?: string; }

const money = (amount: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount);

export const GraduateContractScreen: React.FC<GraduateContractScreenProps> = ({ contractId = 'contract-andrea-pending' }) => {
  const initial = VISUAL_QA_CONTRACTS[contractId] ?? VISUAL_QA_CONTRACTS['contract-andrea-pending'];
  const [contract, setContract] = useState<VisualContract>(initial);
  const [accepted, setAccepted] = useState(contract.status === 'ACCEPTED');

  const accept = () => {
    setAccepted(true);
    setContract((current) => ({ ...current, status: 'ACCEPTED', acceptedAt: current.acceptedAt ?? 'Aceptado hoy' }));
  };

  return <article className="mx-auto max-w-3xl space-y-8 pb-20 font-sans animate-fadeIn">
    <header className="space-y-3">
      <h1 className="font-display text-3xl font-bold text-silver-50">Contrato {contract.folio}</h1>
      <div className="space-y-1 text-sm text-silver-300"><p>{contract.graduateName}</p><p>{contract.career}</p><p>Generación {contract.generation}</p></div>
      <p className="text-sm text-silver-100">{contract.totalPlaces} lugares · Total {money(contract.totalAmount)}</p>
    </header>

    <section className="space-y-3 text-sm text-silver-300">
      {contract.lineItems.map((item) => <p key={item.id}>{item.quantity}× {item.concept} · {money(item.totalPrice)}</p>)}
      <p>{contract.paymentScheme.dueDatesSummary}</p>
      <p>{contract.cancellationPolicySummary}</p>
    </section>

    <section aria-labelledby="terms-heading" className="space-y-5">
      <h2 id="terms-heading" className="text-xs font-semibold uppercase tracking-wider text-silver-400">Términos y condiciones</h2>
      {contract.termsSections.map((section) => <section key={section.title} className="space-y-2"><h3 className="text-base font-semibold text-silver-100">{section.title}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph} className="text-sm leading-7 text-silver-300">{paragraph}</p>)}</section>)}
    </section>

    {contract.status === 'PENDING_ACCEPTANCE' && <div className="space-y-4 pt-4">
      <label className="flex items-start gap-3 text-sm text-silver-200"><input aria-label="He leído y acepto los términos" type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />He leído y acepto los términos</label>
      <Button variant="primary" disabled={!accepted} onClick={accept}>Aceptar contrato</Button>
    </div>}
    {contract.status === 'ACCEPTED' && <p className="text-sm text-status-success">Contrato aceptado{contract.acceptedAt ? ` · ${contract.acceptedAt}` : ''}</p>}
  </article>;
};
