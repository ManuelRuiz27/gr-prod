import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Design System — Input', () => {
  it('renders label and placeholder', () => {
    render(<Input label="Nombre del Graduado" placeholder="Ej. Andrea Martínez" />);
    expect(screen.getByLabelText(/nombre del graduado/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ej. andrea martínez/i)).toBeInTheDocument();
  });

  it('displays error message and sets aria role', () => {
    render(<Input label="Correo" error="El correo es obligatorio" />);
    expect(screen.getByRole('alert')).toHaveTextContent(/el correo es obligatorio/i);
  });

  it('updates value on change', () => {
    const handleChange = vi.fn();
    render(<Input label="Teléfono" onChange={handleChange} />);
    const input = screen.getByLabelText(/teléfono/i);
    fireEvent.change(input, { target: { value: '5512345678' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
