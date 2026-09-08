import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { registerServiceWorker } from './registerServiceWorker';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PwaContextType {
  isOnline: boolean;
  isOffline: boolean;
  canInstall: boolean;
  isInstalled: boolean;
  isIos: boolean;
  hasUpdate: boolean;
  showInstallBanner: boolean;
  installApp: () => Promise<boolean>;
  dismissInstallBanner: () => void;
  updateApp: () => void;
  justReconnected: boolean;
}

const PwaContext = createContext<PwaContextType | null>(null);

const STORAGE_KEY_DISMISSED = 'gr_pwa_install_dismissed';

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_DISMISSED) === 'true';
    } catch {
      return false;
    }
  });

  // Detect iOS Safari
  const isIos = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  }, []);

  // Check if currently running in standalone (PWA) mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkStandalone = () => {
      const isStandalone =
        (typeof window.matchMedia === 'function' &&
          window.matchMedia('(display-mode: standalone)').matches) ||
        // @ts-expect-error iOS Safari navigator.standalone property
        Boolean(window.navigator?.standalone);
      setIsInstalled(isStandalone);
    };

    checkStandalone();
    if (typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      mediaQuery.addEventListener?.('change', checkStandalone);
      return () => mediaQuery.removeEventListener?.('change', checkStandalone);
    }
  }, []);

  // Online / Offline listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      const timer = setTimeout(() => setJustReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // BeforeInstallPrompt listener for Chromium / Android
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Register Service Worker in production / supported environments
  useEffect(() => {
    registerServiceWorker({
      onUpdate: (registration) => {
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setHasUpdate(true);
        }
      },
      onSuccess: () => {
        // App is cached for offline use
      },
    });
  }, []);

  // Trigger installation
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) return false;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[PWA] Error prompting installation:', err);
      return false;
    }
  }, [installPrompt]);

  const dismissInstallBanner = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY_DISMISSED, 'true');
    } catch {
      // Ignore storage errors
    }
  }, []);

  const updateApp = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [waitingWorker]);

  const canInstall = Boolean(installPrompt) && !isInstalled;
  // Show install banner if installable or if on iOS (not installed yet and not dismissed)
  const showInstallBanner = !isInstalled && !dismissed && (canInstall || isIos);

  const value = useMemo(
    () => ({
      isOnline,
      isOffline: !isOnline,
      canInstall,
      isInstalled,
      isIos,
      hasUpdate,
      showInstallBanner,
      installApp,
      dismissInstallBanner,
      updateApp,
      justReconnected,
    }),
    [
      isOnline,
      canInstall,
      isInstalled,
      isIos,
      hasUpdate,
      showInstallBanner,
      installApp,
      dismissInstallBanner,
      updateApp,
      justReconnected,
    ]
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
};

const defaultPwaContext: PwaContextType = {
  isOnline: true,
  isOffline: false,
  canInstall: false,
  isInstalled: false,
  isIos: false,
  hasUpdate: false,
  showInstallBanner: false,
  installApp: async () => false,
  dismissInstallBanner: () => {},
  updateApp: () => {},
  justReconnected: false,
};

export const usePwa = (): PwaContextType => {
  const context = useContext(PwaContext);
  return context ?? defaultPwaContext;
};
