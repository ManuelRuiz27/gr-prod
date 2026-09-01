import React from 'react';
import { Card, SectionHeader, Input, Button, Icon } from '../../../design-system';
import type { CreateEventDraft, UpdateCreateEventDraft, CreateEventProductDraft } from './createEventDraft';

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

  const handleNameChange = (productId: string, newName: string) => {
    const updated = draft.products.map((p) =>
      p.id === productId ? { ...p, name: newName } : p
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

  const handleRemoveProduct = (productId: string) => {
    const updated = draft.products.filter((p) => p.id !== productId);
    updateDraft('products', updated);
  };

  const handleAddProduct = () => {
    const newProduct: CreateEventProductDraft = {
      id: `prod-${Date.now()}`,
      name: '',
      price: '',
      description: '',
      status: 'ACTIVE',
    };
    updateDraft('products', [...draft.products, newProduct]);
  };

  const handleLoadBaseTemplate = () => {
    const template: CreateEventProductDraft[] = [
      {
        id: 'prod-adulto',
        name: 'Boleto Adulto (Con cena)',
        price: '',
        description: 'Lugar con servicio de banquete.',
        status: 'ACTIVE',
      },
      {
        id: 'prod-nino',
        name: 'Boleto Infantil',
        price: '',
        description: 'Lugar con menú infantil.',
        status: 'ACTIVE',
      },
      {
        id: 'prod-sin-cena',
        name: 'Boleto Sin Cena',
        price: '',
        description: 'Acceso a ceremonia y gala sin servicio de banquete.',
        status: 'ACTIVE',
      },
    ];
    updateDraft('products', template);
  };

  return (
    <div className="space-y-6 font-sans">
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-silver-800/80 pb-4">
          <SectionHeader
            title="Productos y precios"
            description="Configura el catálogo de boletos y amenidades específicas para este evento."
            className="mb-0"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={handleAddProduct}
              iconStart="plus"
            >
              Agregar producto
            </Button>
          </div>
        </div>

        {draft.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-card border border-dashed border-silver-800 bg-obsidian-900/40 text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-obsidian-800 text-silver-400 border border-silver-700/60 flex items-center justify-center">
              <Icon name="ticket" size={24} />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <span className="text-sm font-bold text-silver-100">Sin productos configurados</span>
              <p className="text-xs text-silver-400">
                Aún no has configurado productos o precios para este evento.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                type="button"
                onClick={handleLoadBaseTemplate}
              >
                Cargar plantilla de tipos base
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleAddProduct}
                iconStart="plus"
              >
                Crear producto desde cero
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {draft.products.map((product, idx) => (
              <div
                key={product.id}
                className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-obsidian-800 border border-silver-700/60 text-gold-400 flex items-center justify-center shrink-0">
                    <Icon name="ticket" size={20} />
                  </div>
                  <div className="flex flex-col flex-1 gap-2">
                    <Input
                      id={`prod-name-${product.id}`}
                      label={`Nombre del producto ${idx + 1}`}
                      placeholder="Ej. Boleto Adulto"
                      value={product.name}
                      onChange={(e) => handleNameChange(product.id, e.target.value)}
                    />
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
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => handleRemoveProduct(product.id)}
                    className="mt-5 text-xs text-status-error hover:bg-status-error/10"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
