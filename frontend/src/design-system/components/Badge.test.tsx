import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Design System — Badge', () => {
  it('renders badge text correctly', () => {
    render(<Badge variant="success">Liquidado</Badge>);
    expect(screen.getByText('Liquidado')).toBeInTheDocument();
  });

  it('renders with dot indicator', () => {
    const { container } = render(<Badge variant="warning" dot>Parcial</Badge>);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });
});
