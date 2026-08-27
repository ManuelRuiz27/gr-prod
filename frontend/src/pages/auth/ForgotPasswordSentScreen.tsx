import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '../../design-system';

export const ForgotPasswordSentScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-low text-content-primary flex flex-col justify-center items-center px-5 py-12">
      <main className="w-full max-w-[390px] mx-auto bg-surface-lowest rounded-2xl border border-surface-high shadow-card-sm p-8 flex flex-col items-center text-center gap-6">
        {/* Email sent icon illustration */}
        <div className="w-20 h-20 rounded-full bg-status-success-bg border border-status-success/20 flex items-center justify-center text-status-success">
          <Icon name="mail" size={36} />
        </div>

        {/* Typography cluster */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-display text-navy-900 tracking-tight">
            Revisa tu correo
          </h1>
          <p className="text-xs text-content-secondary leading-relaxed max-w-xs mx-auto">
            Si existe una cuenta asociada a ese correo, recibirás instrucciones para restablecer tu contraseña.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            type="button"
            onClick={() => navigate('/login')}
            className="h-12 text-sm font-semibold"
          >
            Volver al inicio
          </Button>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-xs font-semibold"
          >
            Enviar de nuevo
          </Button>
        </div>
      </main>
    </div>
  );
};
