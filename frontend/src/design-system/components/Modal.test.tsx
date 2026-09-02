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

  it('has role=dialog and aria-modal when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Prueba Aria">
        <div>Content</div>
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
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

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Escape Test">
        <div>Content</div>
      </Modal>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('generates unique aria IDs for each modal instance', () => {
    render(
      <>
        <Modal isOpen={true} onClose={() => {}} title="Modal Uno">
          <div>Contenido Uno</div>
        </Modal>
        <Modal isOpen={true} onClose={() => {}} title="Modal Dos">
          <div>Contenido Dos</div>
        </Modal>
      </>
    );
    const dialogs = screen.getAllByRole('dialog');
    expect(dialogs).toHaveLength(2);
    const id1 = dialogs[0].getAttribute('aria-labelledby');
    const id2 = dialogs[1].getAttribute('aria-labelledby');
    expect(id1).not.toEqual(id2);
  });
});
