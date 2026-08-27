import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { activeEventMock } from '../../fixtures';
import { Input, Button, Alert, Icon } from '../../design-system';

interface RegisterLocationState {
  eventAccess?: string;
}

export const GraduateRegisterScreen: React.FC = () => {
  const location = useLocation();
  const state = location.state as RegisterLocationState | null;
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  if (!state?.eventAccess) {
    return <Navigate to="/access" replace />;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError('');
    navigate('/graduate');
  }

  return (
    <div className="min-h-screen bg-surface-low text-content-primary flex flex-col items-center px-5 py-8">
      <main className="w-full max-w-[390px] mx-auto flex flex-col gap-5">
        {/* Back navigation */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate('/access')}
            aria-label="Volver"
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-navy-900 hover:bg-surface-lowest transition-colors"
          >
            <Icon name="chevron-left" size={20} />
          </button>
        </div>

        {/* Title and Event Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Registro de graduado
          </h1>
          <p className="text-sm font-semibold text-gold-600">
            {activeEventMock.name}
          </p>
          <p className="text-xs text-content-secondary">
            Tu cuenta quedará vinculada a esta graduación.
          </p>
        </div>

        {error && (
          <Alert variant="error" onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 bg-surface-lowest p-6 rounded-2xl border border-surface-high shadow-card-sm">
          <Input
            id="fullName"
            label="Nombre completo"
            placeholder="Ej. Andrea Martínez"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (error) setError('');
            }}
            iconStart="user"
            required
          />

          <Input
            id="email"
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

          <Input
            id="phone"
            label="Teléfono"
            type="tel"
            placeholder="Ej. 5512345678"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (error) setError('');
            }}
            iconStart="phone"
            required
          />

          <div className="relative">
            <Input
              id="password"
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

          <div className="relative">
            <Input
              id="confirmPassword"
              label="Confirmar contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              iconStart="lock"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ocultar valor de confirmación' : 'Ver valor de confirmación'}
              className="absolute right-0 top-0 text-[11px] font-medium text-gold-600 hover:text-gold-700 transition-colors"
            >
              {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>



          <div className="pt-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              type="submit"
              iconEnd="chevron-right"
              className="h-12 text-sm font-semibold"
            >
              Completar registro
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
