import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Drawer } from './Drawer';

describe('Design System — Drawer', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onClose={() => {}}>
        <div>Drawer Content</div>
      </Drawer>
    );
    expect(screen.queryByText('Drawer Content')).not.toBeInTheDocument();
  });

  it('renders title, description and children when isOpen is true', () => {
    render(
      <Drawer
        isOpen={true}
        onClose={() => {}}
        title="Filtros Avanzados"
        description="Selecciona los criterios"
      >
        <div>Contenido del Panel</div>
      </Drawer>
    );
    expect(screen.getByText('Filtros Avanzados')).toBeInTheDocument();
    expect(screen.getByText('Selecciona los criterios')).toBeInTheDocument();
    expect(screen.getByText('Contenido del Panel')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={handleClose} title="Cerrar Panel">
        <div>Contenido</div>
      </Drawer>
    );
    fireEvent.click(screen.getByLabelText(/cerrar panel lateral/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
