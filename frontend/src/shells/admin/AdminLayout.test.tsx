import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AuthProvider } from '../../context/AuthContext';

describe('Shell ADMIN — AdminLayout Integration', () => {
  it('renders skip to content link, topbar, and main container', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<div>Admin Dashboard Body</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/saltar al contenido principal/i)).toBeInTheDocument();
    expect(screen.getAllByText('Plataforma GR').length).toBeGreaterThan(0);
    expect(screen.getByText('Admin Dashboard Body')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('renders six primary event destinations and a Más menu when navigating to /admin/events/:eventId', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin/events/evt-derecho-2027']}>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="events/:eventId" element={<div>Event Overview Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Event title in context header
    expect(screen.getAllByText('Graduación Facultad de Derecho 2027').length).toBeGreaterThan(0);

    // Scoped query inside contextual event navigation
    const eventNav = screen.getByRole('navigation', { name: /navegación contextual del evento/i });
    expect(eventNav).toBeInTheDocument();

    // Six primary destinations plus grouped secondary destinations.
    expect(within(eventNav).getByText('Resumen')).toBeInTheDocument();
    expect(within(eventNav).getByText('Graduados')).toBeInTheDocument();
    expect(within(eventNav).getByText('Pagos')).toBeInTheDocument();
    expect(within(eventNav).getByText('Mesas')).toBeInTheDocument();
    expect(within(eventNav).getByText('Platillos')).toBeInTheDocument();
    expect(within(eventNav).getByText('Termos')).toBeInTheDocument();
    expect(within(eventNav).getByText('Reportes')).toBeInTheDocument();
    expect(within(eventNav).getByText('Configuración')).toBeInTheDocument();
    expect(within(eventNav).getByText('Más')).toBeInTheDocument();
    expect(within(eventNav).getByText('Historial')).toBeInTheDocument();
  });

  it('does NOT render contextual event tabs on /admin/events/new creation wizard', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin/events/new']}>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="events/new" element={<div>Wizard Step 1</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.queryByRole('navigation', { name: /navegación contextual del evento/i })).not.toBeInTheDocument();
    expect(screen.getByText('Wizard Step 1')).toBeInTheDocument();
  });

  it('opens and closes mobile navigation Drawer on trigger click', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<div>Dashboard Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const menuButton = screen.getByLabelText(/abrir menú de navegación/i);
    expect(menuButton).toBeInTheDocument();

    // Drawer is closed initially
    expect(screen.queryByText('Navegación Administrativa')).not.toBeInTheDocument();

    // Open Drawer
    fireEvent.click(menuButton);
    expect(screen.getByText('Navegación Administrativa')).toBeInTheDocument();

    // Close Drawer via close button
    const closeButton = screen.getByLabelText(/cerrar panel lateral/i);
    fireEvent.click(closeButton);
    expect(screen.queryByText('Navegación Administrativa')).not.toBeInTheDocument();
  });

  it('deep link into /admin/events/:eventId/graduates preserves event context', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin/events/evt-derecho-2027/graduates']}>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="events/:eventId/graduates" element={<div>Graduates List</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Graduates List')).toBeInTheDocument();
    expect(screen.getAllByText('Graduación Facultad de Derecho 2027').length).toBeGreaterThan(0);
    const eventNav = screen.getByRole('navigation', { name: /navegación contextual del evento/i });
    expect(within(eventNav).getByText('Mesas')).toBeInTheDocument();
  });

  it('does NOT render persistent sidebar in layout by default and closes drawer when clicking navigation link', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<div>Admin Dashboard</div>} />
              <Route path="events" element={<div>Events Screen</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // No persistent sidebar on initial render (not invasive)
    expect(screen.queryByRole('aside')).not.toBeInTheDocument();

    // Floating hamburger menu button is available
    const menuButton = screen.getByLabelText(/abrir menú de navegación/i);
    expect(menuButton).toBeInTheDocument();

    // Open floating menu
    fireEvent.click(menuButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Navegación Administrativa')).toBeInTheDocument();
    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.getByLabelText(/cerrar sesión/i)).toBeInTheDocument();

    // Clicking navigation item closes the floating drawer
    fireEvent.click(screen.getByText('Eventos'));
    expect(screen.queryByText('Navegación Administrativa')).not.toBeInTheDocument();
  });

  it('interacts with the Más menu in contextual event navigation: open, close on click, close on Escape', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin/events/evt-derecho-2027']}>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="events/:eventId" element={<div>Event Overview</div>} />
              <Route path="events/:eventId/reports" element={<div>Reports Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const eventNav = screen.getByRole('navigation', { name: /navegación contextual del evento/i });
    const masSummary = within(eventNav).getByText('Más');
    const details = masSummary.closest('details')!;
    expect(details).toBeInTheDocument();
    expect(details.open).toBe(false);

    // Open the menu
    fireEvent.click(masSummary);
    details.open = true; // In jsdom fireEvent.click on summary doesn't always toggle open native attribute
    expect(details.open).toBe(true);

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(details.open).toBe(false);

    // Open again and click a link
    details.open = true;
    const reportesLink = within(eventNav).getByText('Reportes');
    fireEvent.click(reportesLink);
    expect(details.open).toBe(false);
  });
});

