import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GraduateAccessScreen } from '../pages/auth/GraduateAccessScreen';
import { GraduateLoginScreen } from '../pages/auth/GraduateLoginScreen';
import { GraduateRegisterScreen } from '../pages/auth/GraduateRegisterScreen';
import { ForgotPasswordScreen } from '../pages/auth/ForgotPasswordScreen';
import { ForgotPasswordSentScreen } from '../pages/auth/ForgotPasswordSentScreen';
import { GraduateEventSelectorScreen } from '../pages/auth/GraduateEventSelectorScreen';
import { AdminLoginScreen } from '../pages/auth/AdminLoginScreen';
import { GraduateHomeScreen } from '../pages/graduate/GraduateHomeScreen';
import { mockEvents } from '../fixtures';

function renderAuthRoutes(initialEntry: string | { pathname: string; state?: unknown }) {
  return render(
    <MemoryRouter initialEntries={[initialEntry as never]}>
      <Routes>
        <Route path="/access" element={<GraduateAccessScreen />} />
        <Route path="/login" element={<GraduateLoginScreen />} />
        <Route path="/register" element={<GraduateRegisterScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/forgot-password/sent" element={<ForgotPasswordSentScreen />} />
        <Route path="/graduate" element={<GraduateHomeScreen />} />
        <Route path="/graduate/events" element={<GraduateEventSelectorScreen />} />
        <Route path="/admin/login" element={<AdminLoginScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Auth & Access Flow Tests (FRONTEND-02A & FRONTEND-02A-R1 & FRONTEND-02A-R2)', () => {
  it('Test 1: GraduateAccessScreen shows error and stays on /access when submitting empty input', () => {
    renderAuthRoutes('/access');

    const submitBtn = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Ingresa el código del evento.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Accede a tu graduación/i })).toBeInTheDocument();
  });

  it('Test 2: GraduateAccessScreen navigates to /register and shows event name when valid code is entered', () => {
    renderAuthRoutes('/access');

    const input = screen.getByLabelText(/Código del evento/i);
    fireEvent.change(input, { target: { value: 'CODIGO-PRUEBA' } });

    const submitBtn = screen.getByRole('button', { name: /Continuar/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole('heading', { name: /Registro de graduado/i })).toBeInTheDocument();
    expect(screen.getByText('Graduación Facultad de Derecho 2027')).toBeInTheDocument();
  });

  it('Test 3: /register without location.state redirects to /access', () => {
    renderAuthRoutes('/register');

    expect(screen.getByRole('heading', { name: /Accede a tu graduación/i })).toBeInTheDocument();
  });

  it('Test 4: GraduateRegisterScreen shows error when password does not match confirmPassword', () => {
    renderAuthRoutes({ pathname: '/register', state: { eventAccess: 'CODIGO-PRUEBA' } });

    const fullNameInput = screen.getByLabelText(/Nombre completo/i);
    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const phoneInput = screen.getByLabelText(/Teléfono/i);
    const passwordInput = screen.getByLabelText(/^Contraseña/i);
    const confirmPasswordInput = screen.getByLabelText(/^Confirmar contraseña/i);

    fireEvent.change(fullNameInput, { target: { value: 'Andrea Martínez' } });
    fireEvent.change(emailInput, { target: { value: 'andrea@ejemplo.com' } });
    fireEvent.change(phoneInput, { target: { value: '5512345678' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'passwordDifferent' } });

    const submitBtn = screen.getByRole('button', { name: /Completar registro/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });

  it('Test 5: GraduateLoginScreen navigates to ForgotPasswordScreen on "Olvidé mi contraseña"', () => {
    renderAuthRoutes('/login');

    const forgotLink = screen.getByRole('button', { name: /Olvidé mi contraseña/i });
    fireEvent.click(forgotLink);

    expect(screen.getByRole('heading', { name: /Recupera tu contraseña/i })).toBeInTheDocument();
  });

  it('Test 6: ForgotPasswordScreen submit navigates to ForgotPasswordSentScreen with generic notice', () => {
    renderAuthRoutes('/forgot-password');

    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    fireEvent.change(emailInput, { target: { value: 'andrea@ejemplo.com' } });

    const submitBtn = screen.getByRole('button', { name: /Enviar enlace/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole('heading', { name: /Revisa tu correo/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Si existe una cuenta asociada a ese correo, recibirás instrucciones para restablecer tu contraseña\./i)
    ).toBeInTheDocument();
  });

  it('Test 7: GraduateEventSelectorScreen renders exact mockEvents with natural status label and no OPEN', () => {
    const { container } = renderAuthRoutes('/graduate/events');

    expect(screen.getByRole('heading', { name: /Mis eventos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Selecciona un evento/i })).toBeInTheDocument();
    expect(screen.getByText('Graduación Facultad de Derecho 2027')).toBeInTheDocument();
    expect(screen.getByText('Abierto')).toBeInTheDocument();

    const textContent = container.textContent || '';
    expect(textContent).not.toMatch(/\bOPEN\b/);
    expect(screen.getAllByRole('button', { name: /Abrir/i })).toHaveLength(mockEvents.length);
  });

  it('Test 8: AdminLoginScreen displays "Administración" and does NOT show "Crear cuenta"', () => {
    renderAuthRoutes('/admin/login');

    expect(screen.getByRole('heading', { name: /Administración/i })).toBeInTheDocument();
    expect(screen.queryByText(/Crear cuenta/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  // A6 Additions
  it('Test 9 (A6.1): Graduate login empty fields show error Alert and do not navigate', () => {
    renderAuthRoutes('/login');

    const submitBtn = screen.getByRole('button', { name: /Iniciar sesión/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Completa correo y contraseña.')).toBeInTheDocument();
    expect(screen.queryByText(/Facultad de Derecho/i)).not.toBeInTheDocument();
  });

  it('Test 10 (A6.2): Graduate register with empty fields shows required fields Alert', () => {
    renderAuthRoutes({ pathname: '/register', state: { eventAccess: 'CODIGO-PRUEBA' } });

    const submitBtn = screen.getByRole('button', { name: /Completar registro/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Completa todos los campos requeridos.')).toBeInTheDocument();
  });

  it('Test 11 (A6.3): Admin login empty fields show error Alert', () => {
    renderAuthRoutes('/admin/login');

    const submitBtn = screen.getByRole('button', { name: /Iniciar sesión/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Completa correo y contraseña.')).toBeInTheDocument();
  });

  it('Test 12 (A6.4): From AdminLogin, ForgotPassword back button returns to AdminLogin (/admin/login)', () => {
    renderAuthRoutes('/admin/login');

    const forgotBtn = screen.getByRole('button', { name: /Olvidé mi contraseña/i });
    fireEvent.click(forgotBtn);

    expect(screen.getByRole('heading', { name: /Recupera tu contraseña/i })).toBeInTheDocument();

    const backBtn = screen.getByRole('button', { name: /Volver al inicio de sesión/i });
    fireEvent.click(backBtn);

    expect(screen.getByRole('heading', { name: /Administración/i })).toBeInTheDocument();
  });

  // Required semantics asserts
  it('Test 13: GraduateLogin inputs have required attribute', () => {
    renderAuthRoutes('/login');

    expect(screen.getByLabelText(/Correo electrónico/i)).toBeRequired();
    expect(screen.getByLabelText(/^Contraseña/i)).toBeRequired();
  });

  it('Test 14: AdminLogin inputs have required attribute', () => {
    renderAuthRoutes('/admin/login');

    expect(screen.getByLabelText(/Correo electrónico/i)).toBeRequired();
    expect(screen.getByLabelText(/^Contraseña/i)).toBeRequired();
  });

  it('Test 15: GraduateRegister inputs have required attribute on all five fields', () => {
    renderAuthRoutes({ pathname: '/register', state: { eventAccess: 'CODIGO-PRUEBA' } });

    expect(screen.getByLabelText(/Nombre completo/i)).toBeRequired();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeRequired();
    expect(screen.getByLabelText(/Teléfono/i)).toBeRequired();
    expect(screen.getByLabelText(/^Contraseña/i)).toBeRequired();
    expect(screen.getByLabelText(/^Confirmar contraseña/i)).toBeRequired();
  });
});
