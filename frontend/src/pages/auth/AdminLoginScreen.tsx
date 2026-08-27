import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Icon } from '../../design-system';

export const AdminLoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    navigate('/admin');
  }

  return (
    <div className="min-h-screen bg-surface-low text-content-primary flex flex-col justify-center items-center px-5 py-12">
      <main className="w-full max-w-[420px] bg-surface-lowest rounded-2xl border border-surface-high shadow-card-md p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Accent Top Border */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-navy-900" />

        {/* Header Area */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 mx-auto bg-navy-900 text-gold-400 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
            <Icon name="lock" size={26} />
          </div>
          <h1 className="text-2xl font-bold font-display text-navy-900 tracking-tight">
            Administración
          </h1>
          <p className="text-xs text-content-secondary">
            Ingrese sus credenciales de acceso
          </p>
        </div>

        {/* Form Area */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 flex flex-col w-full">
          <Input
            id="adminEmail"
            label="Correo electrónico"
            type="email"
            placeholder="nombre@plataforma.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            iconStart="mail"
            required
          />

          <div className="relative">
            <Input
              id="adminPassword"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              onClick={() => navigate('/forgot-password')}
              className="text-xs font-medium text-navy-900 hover:text-navy-700 transition-colors"
            >
              Olvidé mi contraseña
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
              Iniciar sesión
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
