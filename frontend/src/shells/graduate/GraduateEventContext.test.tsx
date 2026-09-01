import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GraduateEventContext } from './GraduateEventContext';

describe('Shell GRADUATE — GraduateEventContext', () => {
  it('renders default event information and status badge', () => {
    render(<GraduateEventContext />);

    expect(screen.getByText(/evento de graduación/i)).toBeInTheDocument();
    expect(screen.getByText('Graduación Facultad de Derecho 2027')).toBeInTheDocument();
    expect(screen.getByText('Abierto')).toBeInTheDocument();
  });

  it('renders custom event information when props are provided', () => {
    render(
      <GraduateEventContext
        eventName="Graduación Medicina 2028"
        institution="Facultad de Medicina UASLP"
        generation="2028"
        date="15 de Julio de 2028"
        venue="Salón Baalbek"
        status="CLOSED"
      />
    );

    expect(screen.getByText('Graduación Medicina 2028')).toBeInTheDocument();
    expect(screen.getByText('Facultad de Medicina UASLP')).toBeInTheDocument();
    expect(screen.getByText(/Gen. 2028/)).toBeInTheDocument();
    expect(screen.getByText('15 de Julio de 2028')).toBeInTheDocument();
    expect(screen.getByText('Salón Baalbek')).toBeInTheDocument();
    expect(screen.getByText('Cerrado')).toBeInTheDocument();
  });
});
