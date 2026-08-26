import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Design System — Modal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('renders title and content when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Detalles del Evento">
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText('Detalles del Evento')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Cerrar Prueba">
        <div>Content</div>
      </Modal>
    );
    fireEvent.click(screen.getByLabelText(/cerrar modal/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
