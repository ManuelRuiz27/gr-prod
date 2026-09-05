import React, { useState } from 'react';
import { Badge, Button, Input, Modal } from '../../design-system';
import { VISUAL_QA_GRADUATE_PAYMENT_STATES } from '../../fixtures';

export interface GraduatePaymentsScreenProps { graduateId?: string; }
const currency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);

export const GraduatePaymentsScreen: React.FC<GraduatePaymentsScreenProps> = ({ graduateId = 'grad-andrea-martinez' }) => {
  const state = VISUAL_QA_GRADUATE_PAYMENT_STATES[graduateId] || VISUAL_QA_GRADUATE_PAYMENT_STATES['grad-andrea-martinez'];
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(state.nextPayment ? String(state.nextPayment.amount) : '');
  if (!state) return null;
  const next = state.nextPayment;
  return <div className="w-full max-w-4xl mx-auto flex flex-col gap-7 font-sans animate-fadeIn pb-12">
    <header><h1 className="text-2xl font-display font-bold text-silver-50">Mis pagos</h1></header>
    <section className="space-y-1 lg:grid lg:grid-cols-2 lg:gap-8">
      <div><p className="text-xs uppercase tracking-wider text-silver-400">Has abonado</p><p className="text-3xl font-bold text-silver-50">{currency(state.totalPaid)} <span className="text-base font-normal text-silver-400">de {currency(state.totalContracted)}</span></p></div>
      <div><p className="text-xs uppercase tracking-wider text-silver-400">Restan</p><p className="text-2xl font-bold text-silver-50">{currency(state.totalPending)}</p></div>
    </section>
    {next && <section aria-label="Próximo abono" className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs uppercase tracking-wider text-silver-400">Próximo abono</p><p className="text-lg font-semibold text-silver-100">{next.dueDate}</p><p className="text-sm text-silver-400">Mínimo: {currency(next.amount)}</p></div>
      <Button variant="primary" size="md" onClick={() => setIsOpen(true)}>Abonar</Button>
    </section>}
    <section className="space-y-2"><h2 className="text-xs uppercase tracking-wider font-semibold text-silver-400">Plan de pagos</h2>{state.installments.map((item) => <div key={item.id} className="flex items-center justify-between py-2.5 text-sm"><span className="text-silver-200">{item.dueDate}</span><span className="text-silver-100">{currency(item.amount)}</span><Badge variant={item.status === 'PAID' ? 'success' : item.status === 'OVERDUE' ? 'error' : 'neutral'} size="sm">{item.status === 'PAID' ? 'Pagado' : item.status === 'OVERDUE' ? 'Vencido' : 'Pendiente'}</Badge></div>)}</section>
    <section className="space-y-2"><h2 className="text-xs uppercase tracking-wider font-semibold text-silver-400">Historial y comprobantes</h2>{state.confirmedTransactions.map((item) => <div key={item.id} className="flex justify-between py-2 text-sm"><span className="text-silver-300">{item.paidAt} · {item.method}</span><span className="text-silver-100">{currency(item.amount)}</span></div>)}</section>
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="¿Cuánto quieres abonar?" description={next ? `Mínimo actual: ${currency(next.amount)}` : undefined} size="sm"><div className="space-y-4"><Input label="Monto" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" /><p className="text-xs text-silver-400">El pago se valida antes de actualizar tu saldo.</p><div className="flex justify-end"><Button variant="primary" onClick={() => setIsOpen(false)}>Continuar</Button></div></div></Modal>
  </div>;
};
