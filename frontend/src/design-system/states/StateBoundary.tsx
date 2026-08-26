import React from 'react';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { OfflineState } from './OfflineState';
import { ActionSuccessState } from './ActionSuccessState';
import type { IconName } from '../icons/Icon';


export type UIState = 'loading' | 'ready' | 'empty' | 'error' | 'offline' | 'action_success';

export interface StateBoundaryProps {
  state: UIState;
  loadingMessage?: string;
  loadingVariant?: 'spinner' | 'skeleton' | 'full-page';
  emptyIcon?: IconName;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  errorTitle?: string;
  errorMessage?: string;
  onRetry?: () => void;
  offlineMessage?: string;
  successTitle?: string;
  successMessage?: string;
  onSuccessAction?: () => void;
  successActionLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export const StateBoundary: React.FC<StateBoundaryProps> = ({
  state,
  loadingMessage,
  loadingVariant,
  emptyIcon,
  emptyTitle = 'No hay información disponible',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  errorTitle,
  errorMessage,
  onRetry,
  offlineMessage,
  successTitle,
  successMessage = 'Acción completada con éxito',
  onSuccessAction,
  successActionLabel,
  children,
  className = '',
}) => {
  switch (state) {
    case 'loading':
      return <LoadingState message={loadingMessage} variant={loadingVariant} className={className} />;
    case 'empty':
      return (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
          className={className}
        />
      );
    case 'error':
      return (
        <ErrorState
          title={errorTitle}
          message={errorMessage}
          onRetry={onRetry}
          className={className}
        />
      );
    case 'offline':
      return <OfflineState message={offlineMessage} onRetry={onRetry} className={className} />;
    case 'action_success':
      return (
        <ActionSuccessState
          title={successTitle}
          message={successMessage}
          actionLabel={successActionLabel}
          onAction={onSuccessAction}
          variant="card"
          className={className}
        />
      );
    case 'ready':
    default:
      return <div className={className}>{children}</div>;
  }
};
