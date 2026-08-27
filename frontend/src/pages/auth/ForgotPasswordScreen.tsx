import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input, Button, Icon } from '../../design-system';

export type PasswordResetReturnTo = '/login' | '/admin/login';

export interface PasswordResetNavigationState {
  returnTo?: PasswordResetReturnTo;
}

export const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const navigationState = location.state as PasswordResetNavigationState | null;
  const returnTo: PasswordResetReturnTo =
    navigationState?.returnTo === '/admin/login' ? '/admin/login' : '/login';

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    navigate('/forgot-password/sent', {
      state: {
        returnTo,
        email: email.trim(),
      },
    });
  }

  return (
    <div className="min-h-screen bg-surface-low text-content-primary flex flex-col justify-center items-center px-5 py-12">
      <main className="w-full max-w-[390px] mx-auto flex flex-col gap-6">
        {/* Branding / Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-lowest border border-surface-high text-navy-900 flex items-center justify-center shadow-card-sm">
            <Icon name="lock" size={28} />
          </div>
        </div>

        {/* Header Section */}
        <header className="space-y-1.5 text-center">
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Recupera tu contraseña
          </h1>
          <p className="text-xs text-content-secondary leading-relaxed max-w-xs mx-auto">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.
          </p>
        </header>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-surface-lowest p-6 rounded-2xl border border-surface-high shadow-card-sm">
          <Input
            id="forgotEmail"
            label="Correo electrónico"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            iconStart="mail"
            required
          />

          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              type="submit"
              iconEnd="chevron-right"
              className="h-12 text-sm font-semibold"
            >
              Enviar enlace
            </Button>

            <Button
              variant="ghost"
              size="md"
              fullWidth
              type="button"
              onClick={() => navigate(returnTo)}
              className="text-xs font-semibold text-navy-900 hover:text-navy-700"
            >
              Volver al inicio de sesión
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
