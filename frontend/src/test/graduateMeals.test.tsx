import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraduateMealsScreen } from '../pages/graduate/GraduateMealsScreen';

describe('GraduateMealsScreen', () => {
  it('chooses a dish per person without rendering a duplicate catalogue', () => {
    render(<GraduateMealsScreen />);

    expect(screen.getByRole('heading', { name: 'Platillos' })).toBeInTheDocument();
    expect(screen.getByText('Andrea Martínez')).toBeInTheDocument();
    expect(screen.getByText('Laura González')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(9);
    expect(screen.queryByText('Detalle de opciones del evento')).not.toBeInTheDocument();
  });

  it('enables saving after a person chooses an option', () => {
    render(<GraduateMealsScreen />);

    const saveButton = screen.getByRole('button', { name: 'Guardar elecciones' });
    fireEvent.click(screen.getAllByRole('radio')[8]);
    expect(saveButton).toBeEnabled();

    fireEvent.click(saveButton);
    expect(screen.getByText(/elecciones están listas para revisión/i)).toBeInTheDocument();
  });

  it('is read-only after the deadline', () => {
    render(<GraduateMealsScreen mealsStateId="meals-deadline-closed" />);

    expect(screen.getByText(/selección de platillos ya está cerrada/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Platillo')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar elecciones' })).not.toBeInTheDocument();
  });
});
