import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Icon, Alert } from '../../design-system';
import { mockEvents } from '../../fixtures';

export const GraduateLoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError('Completa correo y contraseña.');
      return;
    }

    setError('');

    if (mockEvents.length > 1) {
      navigate('/graduate/events');
    } else {
      navigate('/graduate');
    }
  }

  return (
    <div className="min-h-screen bg-surface-low text-content-primary flex flex-col justify-center items-center px-5 py-12">
      <main className="w-full max-w-[390px] mx-auto bg-surface-lowest rounded-2xl border border-surface-high shadow-card-sm overflow-hidden flex flex-col">
        {/* Subtle Brand Header Surface */}
        <div className="h-32 w-full bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex items-center justify-center p-6 text-center relative">
          <div className="flex flex-col items-center gap-1 z-10">
            <div className="w-10 h-10 rounded-xl bg-surface-lowest/10 backdrop-blur-sm border border-surface-lowest/20 flex items-center justify-center text-gold-400 mb-1">
              <Icon name="ticket" size={22} />
            </div>
            <h1 className="text-xl font-bold text-surface-lowest tracking-tight">
              Plataforma GR
            </h1>
            <p className="text-[11px] text-surface-lowest/70 font-medium">
              Tu graduación, en un solo lugar.
            </p>
          </div>
        </div>

        {/* Login Form Body */}
        <div className="p-6 flex flex-col gap-5">
          {error && (
            <Alert variant="error" onDismiss={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="loginEmail"
              label="Correo electrónico"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              iconStart="mail"
              required
            />

            <div className="relative">
              <Input
                id="loginPassword"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                iconStart="lock"
                required
              />


              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar valor de contraseña' : 'Ver valor de contraseña'}
                className="absolute right-0 top-0 text-[11px] font-medium text-gold-600 hover:text-gold-700 transition-colors"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => navigate('/forgot-password', { state: { returnTo: '/login' } })}
                className="text-xs font-medium text-navy-900 hover:text-navy-700 transition-colors"
              >
                Olvidé mi contraseña
              </button>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                type="submit"
                iconEnd="chevron-right"
                className="h-12 text-sm font-semibold"
              >
                Iniciar sesión
              </Button>
            </div>
          </form>

          {/* Secondary Action */}
          <div className="pt-4 border-t border-surface-high text-center">
            <button
              type="button"
              onClick={() => navigate('/access')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-content-secondary hover:text-navy-900 transition-colors"
            >
              <Icon name="ticket" size={16} />
              <span>Tengo un código de evento</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
