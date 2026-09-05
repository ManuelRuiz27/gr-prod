import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraduateTableScreen } from '../pages/graduate/GraduateTableScreen';
describe('GraduateTableScreen', () => {
 it('uses croquis by default, selects members and exposes a list fallback', () => { render(<GraduateTableScreen />); expect(screen.getByLabelText('Mesas del evento')).toBeInTheDocument(); fireEvent.click(screen.getByRole('button',{name:/Carlos Martínez/})); expect(screen.getByText(/1 persona/)).toBeInTheDocument(); fireEvent.click(screen.getByRole('button',{name:'Ver como lista'})); expect(screen.getAllByText(/Mesa 24/).length).toBeGreaterThan(0); expect(screen.queryByText(/Asignaciones de terceros/i)).not.toBeInTheDocument(); });
});
