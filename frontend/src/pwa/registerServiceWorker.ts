export interface ServiceWorkerCallbacks {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export function registerServiceWorker(callbacks: ServiceWorkerCallbacks = {}): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register once page has loaded
  window.addEventListener('load', () => {
    const swUrl = '/sw.js';

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        // Check for updates already waiting
        if (registration.waiting) {
          callbacks.onUpdate?.(registration);
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available
                callbacks.onUpdate?.(registration);
              } else {
                // Content is cached for offline use
                callbacks.onSuccess?.(registration);
              }
            }
          });
        });
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed:', error);
        callbacks.onError?.(error);
      });
  });
}

export function unregisterServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.warn('[PWA] Unregister error:', error);
      });
  }
}
