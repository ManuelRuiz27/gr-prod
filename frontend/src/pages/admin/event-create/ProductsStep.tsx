import React from 'react';
import { Card, SectionHeader, Input, Badge, Button, Icon } from '../../../design-system';
import type { CreateEventDraft, UpdateCreateEventDraft } from './createEventDraft';

interface ProductsStepProps {
  draft: CreateEventDraft;
  updateDraft: UpdateCreateEventDraft;
}

export const ProductsStep: React.FC<ProductsStepProps> = ({
  draft,
  updateDraft,
}) => {
  const handlePriceChange = (productId: string, newPrice: string) => {
    const updated = draft.products.map((p) =>
      p.id === productId ? { ...p, price: newPrice } : p
    );
    updateDraft('products', updated);
  };

  const handleToggleStatus = (productId: string) => {
    const updated = draft.products.map((p) =>
      p.id === productId
        ? { ...p, status: (p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE' }
        : p
    );
    updateDraft('products', updated);
  };

  return (
    <div className="space-y-6 font-sans">
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-silver-800/80 pb-4">
          <SectionHeader
            title="Productos y precios"
            description="Configura el catálogo de boletos y amenidades adicionales disponibles para este evento."
            className="mb-0"
          />
          <Badge variant="neutral" size="sm">
            {draft.products.length} productos configurables
          </Badge>
        </div>

        <div className="space-y-4">
          {draft.products.map((product) => (
            <div
              key={product.id}
              className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-obsidian-800 border border-silver-700/60 text-gold-400 flex items-center justify-center shrink-0">
                  <Icon name="ticket" size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-silver-100">{product.name}</span>
                    <Badge variant={product.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                      {product.status === 'ACTIVE' ? 'Habilitado' : 'Deshabilitado'}
                    </Badge>
                  </div>
                  <span className="text-xs text-silver-400 mt-0.5">{product.description}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <div className="w-32">
                  <Input
                    id={`price-${product.id}`}
                    label="Precio unitario"
                    type="number"
                    min={0}
                    placeholder="Ej. 1500"
                    value={product.price}
                    onChange={(e) => handlePriceChange(product.id, e.target.value)}
                    iconStart="payment"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => handleToggleStatus(product.id)}
                  className="mt-5 text-xs text-silver-400 hover:text-silver-100"
                >
                  {product.status === 'ACTIVE' ? 'Pausar' : 'Activar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
