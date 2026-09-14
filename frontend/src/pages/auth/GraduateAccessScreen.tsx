import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Icon } from '../../design-system';
import { isInteractiveDemoMode } from '../../demo/config';

export const GraduateAccessScreen: React.FC = () => {
  const [eventAccess, setEventAccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = eventAccess.trim();
    if (!trimmed) {
      setError('Ingresa el código del evento.');
      return;
    }
    setError('');
    navigate('/register', { state: { eventAccess: trimmed } });
  }

  return (
    <div className="min-h-screen bg-surface-low text-content-primary flex flex-col justify-center items-center px-5 py-12">
      <main className="w-full max-w-[390px] mx-auto flex flex-col gap-6">
        {/* Branding Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-900 text-gold-400 flex items-center justify-center shadow-md">
            <Icon name="ticket" size={32} />
          </div>
        </div>

        {/* Header Section */}
        <header className="space-y-1.5 text-center">
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Accede a tu graduación
          </h1>

          <p className="text-xs text-content-secondary">
            Ingresa el código que te proporcionó tu organizador.
          </p>
        </header>

        {/* Form Section */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5 bg-surface-lowest p-6 rounded-2xl border border-surface-high shadow-card-sm">
          <Input
            id="eventCode"
            label="Código del evento"
            placeholder="Ej. GRAD2027"
            value={eventAccess}
            onChange={(e) => {
              setEventAccess(e.target.value);
              if (error) setError('');
            }}
            error={error}
            iconStart="ticket"
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
              Continuar
            </Button>

            <Button
              variant="ghost"
              size="md"
              fullWidth
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-navy-900 hover:text-navy-700"
            >
              Ya tengo una cuenta
            </Button>
          </div>
        </form>

        {isInteractiveDemoMode && (
          <section className="space-y-3 rounded-2xl border border-gold-300/40 bg-surface-lowest p-5 shadow-card-sm" aria-label="Demo de croquis">
            <div>
              <p className="text-sm font-semibold text-navy-900">Demo de croquis y mesas</p>
              <p className="mt-1 text-xs text-content-secondary">
                Recorre los casos simulados de disponibilidad, ocupación, bloqueos, conflictos y errores sin modificar datos reales.
              </p>
            </div>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              type="button"
              onClick={() => navigate('/__qa/seating?scenario=partial&role=graduate')}
              iconEnd="chevron-right"
            >
              Ver casos de uso
            </Button>
          </section>
        )}
      </main>
    </div>
  );
};
