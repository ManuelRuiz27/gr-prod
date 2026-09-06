import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { GraduatePaymentsScreen } from '../pages/graduate/GraduatePaymentsScreen';

describe('Graduate payments — UX simplification', () => {
  it('shows paid, balance, next minimum, schedule and history', () => {
    render(<GraduatePaymentsScreen />);
    expect(screen.getByText('Has abonado')).toBeInTheDocument();
    expect(screen.getByText('Restan')).toBeInTheDocument();
    expect(screen.getByText('Plan de pagos')).toBeInTheDocument();
    expect(screen.getByText('Historial y comprobantes')).toBeInTheDocument();
  });

  it('opens an amount-led Abonar flow without choosing an installment and validates amount', () => {
    render(<GraduatePaymentsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Abonar' }));
    expect(screen.getByText('¿Cuánto quieres abonar?')).toBeInTheDocument();
    const amountInput = screen.getByLabelText('Monto');
    expect(amountInput).toBeInTheDocument();

    const continueBtn = screen.getByRole('button', { name: 'Continuar' });
    expect(continueBtn).toBeEnabled();

    fireEvent.change(amountInput, { target: { value: '' } });
    expect(continueBtn).toBeDisabled();

    fireEvent.change(amountInput, { target: { value: '0' } });
    expect(continueBtn).toBeDisabled();

    fireEvent.change(amountInput, { target: { value: '3500' } });
    expect(continueBtn).toBeEnabled();
  });

  it('navigates through method selection and completes offline proof submission', () => {
    render(<GraduatePaymentsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Abonar' }));

    const continueBtn = screen.getByRole('button', { name: 'Continuar' });
    fireEvent.click(continueBtn);

    expect(screen.getByText('¿Cómo quieres pagar?')).toBeInTheDocument();
    const transferRadio = screen.getByRole('radio', { name: /Reportar transferencia/i });
    expect(transferRadio).toBeInTheDocument();

    fireEvent.click(transferRadio);
    const continueMethodBtn = screen.getByRole('button', { name: 'Continuar' });
    expect(continueMethodBtn).toBeEnabled();
    fireEvent.click(continueMethodBtn);

    expect(screen.getByText(/Cuenta de depósito \/ transferencia/i)).toBeInTheDocument();
    expect(screen.getByText(/012180001234567890/)).toBeInTheDocument();

    const sendProofBtn = screen.getByRole('button', { name: 'Enviar comprobante' });
    expect(sendProofBtn).toBeDisabled();

    const folioInput = screen.getByLabelText(/Folio o número de referencia/i);
    fireEvent.change(folioInput, { target: { value: 'TRANSF-98765' } });
    expect(sendProofBtn).toBeEnabled();

    fireEvent.click(sendProofBtn);

    expect(screen.getByText(/Comprobante enviado/i)).toBeInTheDocument();
    expect(screen.getByText(/Hemos registrado tu comprobante con referencia TRANSF-98765/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }));
    expect(screen.queryByText(/Comprobante enviado/i)).not.toBeInTheDocument();
  });

  it('navigates to Mercado Pago flow', () => {
    render(<GraduatePaymentsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Abonar' }));

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    fireEvent.click(screen.getByRole('radio', { name: /Mercado Pago/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByRole('heading', { name: /Pago en línea con Mercado Pago/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Proceder al pago' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Proceder al pago' }));
    expect(screen.getByText(/Pago registrado/i)).toBeInTheDocument();
  });
});
