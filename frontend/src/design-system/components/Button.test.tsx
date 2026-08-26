import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Design System — Button', () => {
  it('renders children correctly', () => {
    render(<Button>Confirmar Pago</Button>);
    expect(screen.getByRole('button', { name: /confirmar pago/i })).toBeInTheDocument();
  });

  it('triggers onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Hacer Clic</Button>);
    fireEvent.click(screen.getByRole('button', { name: /hacer clic/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders loading state and disables interaction', () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Guardar
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText(/cargando.../i)).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders disabled state correctly', () => {
    render(<Button disabled>Deshabilitado</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
