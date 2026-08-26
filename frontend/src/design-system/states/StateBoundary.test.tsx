import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StateBoundary } from './StateBoundary';

describe('Design System — StateBoundary', () => {
  it('renders children when state is ready', () => {
    render(
      <StateBoundary state="ready">
        <div>Contenido Principal Listo</div>
      </StateBoundary>
    );
    expect(screen.getByText('Contenido Principal Listo')).toBeInTheDocument();
  });

  it('renders loading indicator when state is loading', () => {
    render(
      <StateBoundary state="loading" loadingMessage="Sincronizando...">
        <div>Contenido</div>
      </StateBoundary>
    );
    expect(screen.getByText('Sincronizando...')).toBeInTheDocument();
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('renders empty state with action trigger', () => {
    const handleAction = vi.fn();
    render(
      <StateBoundary
        state="empty"
        emptyTitle="Sin invitados"
        emptyActionLabel="Agregar invitado"
        onEmptyAction={handleAction}
      >
        <div>Contenido</div>
      </StateBoundary>
    );
    expect(screen.getByText('Sin invitados')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /agregar invitado/i }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders error state with retry action', () => {
    const handleRetry = vi.fn();
    render(
      <StateBoundary
        state="error"
        errorTitle="Error de red"
        errorMessage="No se pudo conectar"
        onRetry={handleRetry}
      >
        <div>Contenido</div>
      </StateBoundary>
    );
    expect(screen.getByText('Error de red')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders offline state properly', () => {
    render(
      <StateBoundary state="offline" offlineMessage="Sin internet">
        <div>Contenido</div>
      </StateBoundary>
    );
    expect(screen.getByText('Sin internet')).toBeInTheDocument();
  });
});
