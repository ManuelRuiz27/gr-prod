import React, { useState } from 'react';
import { Card, Button, Input, Select, Alert, Icon } from '../../design-system';
import { currentGraduateMock } from '../../fixtures';

export const GraduateThermoScreen: React.FC = () => {
  const [engravedText, setEngravedText] = useState(
    currentGraduateMock.thermoCustomization?.text || 'Ing. Andrea Martínez'
  );
  const [fontFamily, setFontFamily] = useState(
    currentGraduateMock.thermoCustomization?.fontFamily || 'Playfair Display'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header Info */}
      <Card className="flex flex-col gap-2">
        <h2 className="text-base font-bold text-navy-900">Termo Conmemorativo de Gala</h2>
        <p className="text-xs text-content-secondary leading-relaxed">
          Tu paquete incluye un termo metálico grabado con láser de alta precisión con tu nombre y título
          profesional.
        </p>
      </Card>

      {savedSuccess && (
        <Alert variant="success" onDismiss={() => setSavedSuccess(false)}>
          Personalización del termo guardada exitosamente.
        </Alert>
      )}

      {/* Visual Mockup Preview */}
      <Card className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-navy-950 to-navy-900 text-white gap-6">
        <div className="relative w-32 h-64 rounded-3xl bg-navy-900 border-2 border-navy-700 shadow-2xl flex flex-col items-center justify-between p-4 overflow-hidden">
          {/* Lid */}
          <div className="w-20 h-4 rounded-full bg-gold-400/80 shadow-sm" />

          {/* Engraving area */}
          <div className="flex flex-col items-center text-center gap-1 my-auto px-2">
            <div className="w-8 h-8 rounded-full border border-gold-400/40 flex items-center justify-center text-[10px] text-gold-400 font-bold">
              GR
            </div>
            <span
              style={{ fontFamily: fontFamily === 'Playfair Display' ? '"Playfair Display", serif' : 'Inter, sans-serif' }}
              className="text-xs font-bold text-gold-300 tracking-wider break-words max-w-[100px]"
            >
              {engravedText || 'Tu Nombre Aquí'}
            </span>
            <span className="text-[8px] text-navy-300 uppercase tracking-widest">
              Gen 2022 - 2026
            </span>
          </div>

          {/* Bottom base */}
          <div className="w-24 h-2 rounded-full bg-navy-950/60" />
        </div>

        <span className="text-[11px] text-navy-300 flex items-center gap-1.5">
          <Icon name="cup" size={14} className="text-gold-400" />
          <span>Vista previa de grabado láser en acero negro mate</span>
        </span>
      </Card>

      {/* Customization Form */}
      <Card className="flex flex-col gap-4">
        <Input
          label="Texto a Grabar (Máximo 28 caracteres)"
          value={engravedText}
          maxLength={28}
          onChange={(e) => {
            setEngravedText(e.target.value);
            setSavedSuccess(false);
          }}
          helperText={`${engravedText.length}/28 caracteres utilizados`}
          required
        />

        <Select
          label="Estilo Tipográfico"
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value);
            setSavedSuccess(false);
          }}
          options={[
            { value: 'Playfair Display', label: 'Elegante Clásico (Playfair Serif)' },
            { value: 'Inter', label: 'Moderno Ejecutivo (Inter Sans)' },
          ]}
        />
      </Card>

      <Button variant="gold" size="lg" fullWidth iconStart="check" onClick={handleSave}>
        Guardar Personalización
      </Button>
    </div>
  );
};
