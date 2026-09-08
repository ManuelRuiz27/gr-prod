import React from 'react';
import { usePwa } from './PwaContext';
import { Button, Icon } from '../design-system';

export const InstallPromptBanner: React.FC = () => {
  const { showInstallBanner, isIos, canInstall, installApp, dismissInstallBanner } = usePwa();

  if (!showInstallBanner) {
    return null;
  }

  return (
    <aside
      aria-label="Instalación de la aplicación móvil"
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-40 bg-obsidian-900/95 backdrop-blur-md border border-gold-500/30 rounded-2xl p-4 shadow-floating text-silver-100 animate-fadeInUp font-sans"
    >
      <div className="flex items-start gap-3">
        {/* App Emblem */}
        <div className="w-11 h-11 rounded-xl bg-obsidian-800 border border-gold-500/40 text-gold-400 font-display font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
          GR
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
              App Plataforma GR
            </h3>
            <button
              type="button"
              onClick={dismissInstallBanner}
              className="text-silver-400 hover:text-silver-100 p-1 -mr-1 rounded-md transition-colors"
              aria-label="Cerrar aviso de instalación"
            >
              <Icon name="close" size={16} />
            </button>
          </div>

          <p className="text-xs text-silver-300 mt-1 leading-relaxed">
            {isIos
              ? 'Instala en tu iPhone: presiona Compartir (icono cuadrado con flecha) y elige "Agregar a pantalla de inicio".'
              : 'Instala la app en tu pantalla de inicio para una experiencia más rápida y completa.'}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 pt-1">
            {canInstall ? (
              <>
                <Button variant="primary" size="sm" onClick={() => void installApp()}>
                  Instalar
                </Button>
                <Button variant="ghost" size="sm" onClick={dismissInstallBanner}>
                  Ahora no
                </Button>
              </>
            ) : isIos ? (
              <Button variant="secondary" size="sm" onClick={dismissInstallBanner}>
                Entendido
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
};
