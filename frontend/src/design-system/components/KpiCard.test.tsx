import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KpiCard } from './KpiCard';

describe('Design System — KpiCard', () => {
  it('renders label, value and supporting text', () => {
    render(
      <KpiCard
        label="Total Recaudado"
        value="$7,500.00"
        supportingText="60% de la meta"
      />
    );
    expect(screen.getByText('Total Recaudado')).toBeInTheDocument();
    expect(screen.getByText('$7,500.00')).toBeInTheDocument();
    expect(screen.getByText('60% de la meta')).toBeInTheDocument();
  });

  it('renders interactive variant with button role and handles clicks', () => {
    const handleClick = vi.fn();
    render(
      <KpiCard
        label="Graduados"
        value="120"
        variant="interactive"
        onClick={handleClick}
      />
    );
    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders trend and status badge when provided', () => {
    render(
      <KpiCard
        label="Avance"
        value="85%"
        trend={{ value: '+12%', direction: 'up' }}
        status="success"
        statusLabel="Al día"
      />
    );
    expect(screen.getByText(/↑\+12%/i)).toBeInTheDocument();
    expect(screen.getByText('Al día')).toBeInTheDocument();
  });
});
