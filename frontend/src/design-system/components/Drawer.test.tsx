import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Drawer } from './Drawer';

describe('Design System - Drawer', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onClose={() => {}}>
        <div>Drawer Content</div>
      </Drawer>
    );
    expect(screen.queryByText('Drawer Content')).not.toBeInTheDocument();
  });

  it('renders title and content when isOpen is true', () => {
    render(
      <Drawer isOpen={true} onClose={() => {}} title="Filtros">
        <div>Drawer Content</div>
      </Drawer>
    );
    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
  });

  it('has role=dialog and aria-modal when open', () => {
    render(
      <Drawer isOpen={true} onClose={() => {}} title="Panel">
        <div>Content</div>
      </Drawer>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={handleClose} title="Cerrar Drawer">
        <div>Content</div>
      </Drawer>
    );
    fireEvent.click(screen.getByLabelText(/cerrar panel lateral/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={handleClose} title="Escape Test">
        <div>Content</div>
      </Drawer>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('generates unique aria IDs for each drawer instance', () => {
    render(
      <>
        <Drawer isOpen={true} onClose={() => {}} title="Drawer Uno">
          <div>Contenido Uno</div>
        </Drawer>
        <Drawer isOpen={true} onClose={() => {}} title="Drawer Dos">
          <div>Contenido Dos</div>
        </Drawer>
      </>
    );
    const dialogs = screen.getAllByRole('dialog');
    expect(dialogs).toHaveLength(2);
    const id1 = dialogs[0].getAttribute('aria-labelledby');
    const id2 = dialogs[1].getAttribute('aria-labelledby');
    expect(id1).not.toEqual(id2);
  });
});