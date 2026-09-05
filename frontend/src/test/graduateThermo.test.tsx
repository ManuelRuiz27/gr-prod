import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GraduateThermoScreen } from '../pages/graduate/GraduateThermoScreen';

describe('Graduate thermo — UX simplification', () => {
  it('links locked graduates directly to payments', () => {
    render(<GraduateThermoScreen />);
    expect(screen.getByText('Ver mis pagos').closest('a')).toHaveAttribute('href', '/graduate/payments');
  });
});
