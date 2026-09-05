import React, { useState } from 'react';
import { Badge, Button, Input, Modal } from '../../design-system';
import { VISUAL_QA_GRADUATE_PAYMENT_STATES } from '../../fixtures';

export interface GraduatePaymentsScreenProps { graduateId?: string; }
const currency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);

export const GraduatePaymentsScreen: React.FC<GraduatePaymentsScreenProps> = ({ graduateId = 'grad-andrea-martinez' }) => {
  const state = VISUAL_QA_GRADUATE_PAYMENT_STATES[graduateId] ?? VISUAL_QA_GRADUATE_PAYMENT_STATES['grad-andrea-martinez'];
  const [step, setStep] = useState<'closed' | 'amount' | 'method' | 'ready'>('closed');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string | null>(null);
  const next = state.nextPayment;
  const parsedAmount = Number(amount.replace(/[^0-9.]/g, ''));
  const amountIsValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  return <div className="w-full max-w-5xl mx-auto flex flex-col gap-7 font-sans animate-fadeIn pb-12">
    <header><h1 className="text-2xl font-display font-bold text-silver-50">Mis pagos</h1></header>
    <section className="grid gap-6 sm:grid-cols-2">
      <div><p className="text-xs uppercase tracking-wider text-silver-400">Has abonado</p><p className="text-3xl font-bold text-silver-50">{currency(state.totalPaid)} <span className="text-base font-normal text-silver-400">de {currency(state.totalContracted)}</span></p></div>
      <div><p className="text-xs uppercase tracking-wider text-silver-400">Restan</p><p className="text-2xl font-bold text-silver-50">{currency(state.totalPending)}</p></div>
    </section>
    {next && <section aria-label="Próximo abono" className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs uppercase tracking-wider text-silver-400">Próximo abono</p><p className="text-lg font-semibold text-silver-100">{next.dueDate}</p><p className="text-sm text-silver-400">Mínimo: {currency(next.amount)}</p></div>
      <Button variant="primary" size="md" onClick={() => { setAmount(String(next.amount)); setMethod(null); setStep('amount'); }}>Abonar</Button>
    </section>}
    <section className="space-y-2"><h2 className="text-xs uppercase tracking-wider font-semibold text-silver-400">Plan de pagos</h2>{state.installments.map((item) => <div key={item.id} className="flex items-center justify-between py-2.5 text-sm"><span className="text-silver-200">{item.dueDate}</span><span className="text-silver-100">{currency(item.amount)}</span><Badge variant={item.status === 'PAID' ? 'success' : item.status === 'OVERDUE' ? 'error' : 'neutral'} size="sm">{item.status === 'PAID' ? 'Pagado' : item.status === 'OVERDUE' ? 'Vencido' : 'Pendiente'}</Badge></div>)}</section>
    <section className="space-y-2"><h2 className="text-xs uppercase tracking-wider font-semibold text-silver-400">Historial y comprobantes</h2>{state.confirmedTransactions.map((item) => <div key={item.id} className="flex justify-between py-2 text-sm"><span className="text-silver-300">{item.paidAt} · {item.method}</span><span className="text-silver-100">{currency(item.amount)}</span></div>)}</section>
    <Modal isOpen={step !== 'closed'} onClose={() => setStep('closed')} title={step === 'amount' ? '¿Cuánto quieres abonar?' : step === 'method' ? '¿Cómo quieres pagar?' : 'Pago preparado'} description={step === 'amount' && next ? 'Mínimo actual: ' + currency(next.amount) : step === 'method' ? 'Monto: ' + currency(parsedAmount) : 'Monto: ' + currency(parsedAmount)} size="sm">
      {step === 'amount' ? <div className="space-y-4"><Input label="Monto" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" /><div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setStep('closed')}>Cancelar</Button><Button variant="primary" disabled={!amountIsValid} onClick={() => setStep('method')}>Continuar</Button></div></div> :
      step === 'method' ? <div className="space-y-3">{['Mercado Pago', 'Reportar transferencia', 'Reportar depósito'].map((option) => <label key={option} className="flex cursor-pointer items-center gap-3 py-2 text-sm text-silver-100"><input type="radio" name="payment-method" checked={method === option} onChange={() => setMethod(option)} />{option}</label>)}<p className="pt-2 text-xs text-silver-400">{method ? 'Continuarás con ' + method + '.' : 'Selecciona un método para continuar.'}</p><div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setStep('amount')}>Atrás</Button><Button variant="primary" disabled={!method} onClick={() => setStep('ready')}>Continuar</Button></div></div> : <div className="space-y-4"><p className="text-sm text-silver-200">Método elegido: {method}</p><p className="text-xs text-silver-400">Tu selección está lista para continuar con el método elegido.</p><div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setStep('method')}>Cambiar método</Button><Button variant="primary" onClick={() => setStep('closed')}>Cerrar</Button></div></div>}
    </Modal>
  </div>;
};
