import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import manifestRaw from '../../public/manifest.webmanifest?raw';
import swContent from '../../public/sw.js?raw';
import iconSvg from '../../public/icons/icon.svg?raw';
import { PwaProvider, usePwa, OfflineBanner, InstallPromptBanner } from '../pwa';

// Helper component to test usePwa hook
const PwaConsumer = () => {
  const { isOnline, isOffline, canInstall, isInstalled, installApp } = usePwa();
  return (
    <div>
      <span data-testid="status">{isOnline ? 'online' : 'offline'}</span>
      <span data-testid="offline-flag">{isOffline ? 'is-offline' : 'is-online'}</span>
      <span data-testid="can-install">{canInstall ? 'yes' : 'no'}</span>
      <span data-testid="is-installed">{isInstalled ? 'yes' : 'no'}</span>
      <button onClick={() => void installApp()}>Trigger Install</button>
    </div>
  );
};

describe('PWA — Manifest & Service Worker Assets', () => {
  it('manifest.webmanifest exists and contains valid required PWA properties', () => {
    expect(manifestRaw).toBeTruthy();
    const manifest = JSON.parse(manifestRaw);

    expect(manifest.name).toBe('Plataforma GR');
    expect(manifest.short_name).toBe('GR');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#08090A');
    expect(manifest.background_color).toBe('#08090A');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const has192 = manifest.icons.some((icon: { sizes: string }) => icon.sizes === '192x192');
    const has512 = manifest.icons.some((icon: { sizes: string }) => icon.sizes === '512x512');
    expect(has192).toBe(true);
    expect(has512).toBe(true);
  });

  it('sw.js exists and contains precache & offline navigation handling', () => {
    expect(swContent).toBeTruthy();
    expect(swContent).toContain('CACHE_NAME');
    expect(swContent).toContain('install');
    expect(swContent).toContain('activate');
    expect(swContent).toContain('fetch');
    expect(swContent).toContain('navigate');
  });

  it('icon.svg exists and contains gold branding elements', () => {
    expect(iconSvg).toBeTruthy();
    expect(iconSvg).toContain('<svg');
    expect(iconSvg).toContain('GR');
    expect(iconSvg).toContain('PLATAFORMA');
  });
});

describe('PWA — React Context & UI Components', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('provides default online status via usePwa hook', () => {
    render(
      <PwaProvider>
        <PwaConsumer />
      </PwaProvider>
    );

    expect(screen.getByTestId('status').textContent).toBe('online');
    expect(screen.getByTestId('offline-flag').textContent).toBe('is-online');
  });

  it('OfflineBanner renders when device goes offline and disappears when back online', () => {
    render(
      <PwaProvider>
        <OfflineBanner />
      </PwaProvider>
    );

    // Initially online: banner not present
    expect(screen.queryByText(/modo sin conexi[óo]n/i)).not.toBeInTheDocument();

    // Trigger offline event
    fireEvent(window, new Event('offline'));

    expect(screen.getByText(/modo sin conexi[óo]n/i)).toBeInTheDocument();

    // Trigger online event
    fireEvent(window, new Event('online'));

    expect(screen.getByText(/conexi[óo]n restablecida/i)).toBeInTheDocument();
  });

  it('InstallPromptBanner dismisses and remembers choice in localStorage', () => {
    // Mock userAgent as iOS to trigger banner for test
    const originalUserAgent = window.navigator.userAgent;
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      configurable: true,
    });

    render(
      <PwaProvider>
        <InstallPromptBanner />
      </PwaProvider>
    );

    expect(screen.getByText(/app plataforma gr/i)).toBeInTheDocument();
    expect(screen.getByText(/instala en tu iphone/i)).toBeInTheDocument();

    const closeBtn = screen.getByLabelText(/cerrar aviso de instalaci[óo]n/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/app plataforma gr/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('gr_pwa_install_dismissed')).toBe('true');

    // Restore userAgent
    Object.defineProperty(window.navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });
  });
});
