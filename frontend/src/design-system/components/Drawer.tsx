import React, { useEffect, useRef } from 'react';
import { Icon } from '../icons/Icon';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  description?: string;
  placement?: 'right' | 'left' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  placement = 'right',
  size = 'md',
  children,
  footer,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        if (drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            drawerRef.current.focus();
          }
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }

        // Focus trap
        if (e.key === 'Tab' && drawerRef.current) {
          const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length > 0) {
            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
        if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
          triggerElementRef.current.focus();
        }
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const placementStyles = {
    right: 'inset-y-0 right-0 max-w-full flex pl-10 animate-slideInRight',
    left: 'inset-y-0 left-0 max-w-full flex pr-10 animate-fadeIn',
    bottom: 'inset-x-0 bottom-0 max-h-[90vh] flex flex-col animate-slideInBottom',
  }[placement];

  const sizeStyles = {
    sm: 'w-screen max-w-sm',
    md: 'w-screen max-w-md',
    lg: 'w-screen max-w-xl',
    full: 'w-screen max-w-4xl',
  }[size];

  const titleId = typeof title === 'string' ? 'drawer-title' : undefined;
  const descId = description ? 'drawer-desc' : undefined;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className={`fixed ${placementStyles}`}>
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          tabIndex={-1}
          className={`
            ${placement === 'bottom' ? 'w-full rounded-t-3xl' : sizeStyles}
            h-full bg-obsidian-850 text-silver-50 shadow-floating border-l border-silver-700/80
            flex flex-col overflow-hidden focus:outline-none z-10
          `}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-silver-800/80 gap-4 shrink-0">
            <div className="flex flex-col gap-1">
              {typeof title === 'string' ? (
                <h3 id={titleId} className="text-lg font-bold text-silver-50 tracking-tight font-sans">
                  {title}
                </h3>
              ) : (
                title
              )}
              {description && (
                <p id={descId} className="text-xs text-silver-400">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-silver-400 hover:text-silver-50 hover:bg-obsidian-750 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 transition-colors"
              aria-label="Cerrar panel lateral"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 overflow-y-auto text-silver-100">{children}</div>

          {/* Optional Footer */}
          {footer && (
            <div className="p-6 border-t border-silver-800/80 bg-obsidian-900/60 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
