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
  it('opens an amount-led Abonar flow without choosing an installment', () => {
    render(<GraduatePaymentsScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Abonar' }));
    expect(screen.getByText('¿Cuánto quieres abonar?')).toBeInTheDocument();
    expect(screen.getByLabelText('Monto')).toBeInTheDocument();
  });
});
