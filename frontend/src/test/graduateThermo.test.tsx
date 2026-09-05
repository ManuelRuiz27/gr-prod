import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { GraduateThermoScreen } from '../pages/graduate/GraduateThermoScreen';

describe('GraduateThermoScreen', () => {
  it('shows all fulfillment states without technical copy', () => {
    const view = render(<MemoryRouter><GraduateThermoScreen /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Ver pagos' })).toHaveAttribute('href', '/graduate/payments');
    for (const [id, label] of [['thermo-available', 'Ya puedes personalizarlo'], ['thermo-requested', 'Solicitado'], ['thermo-in-production', 'En producción'], ['thermo-delivered', 'Entregado']] as const) {
      view.rerender(<MemoryRouter><GraduateThermoScreen key={id} thermoStateId={id} /></MemoryRouter>);
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.queryByText(/backend|preview|modo visual/i)).not.toBeInTheDocument();
  });
});
