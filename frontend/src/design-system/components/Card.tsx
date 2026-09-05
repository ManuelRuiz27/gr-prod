import React from 'react';

export type CardVariant = 'default' | 'raised' | 'outlined' | 'interactive' | 'gold-accent';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
}

/**
 * @deprecated UI v2 does not use Card as a layout primitive. Keep only for
 * document/evidence surfaces while legacy consumers are migrated.
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  style,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-transparent border-0 shadow-none',
    raised: 'bg-transparent border-0 shadow-none',
    outlined: 'bg-transparent border-0 shadow-none',
    interactive:
      'bg-obsidian-850 border border-silver-800 hover:border-gold-500/40 hover:bg-obsidian-800 shadow-card hover:shadow-card-md transition-all duration-200 cursor-pointer active:scale-[0.99]',
    'gold-accent':
      'bg-transparent border-l-2 border-l-gold-500 shadow-none',
  }[variant];

  return (
    <div
      className={`p-0 text-silver-100 transition-colors ${variantStyles} ${className}`}
      style={variant === 'interactive' ? style : { background: 'transparent', borderWidth: 0, borderRadius: 0, boxShadow: 'none', padding: 0, ...style }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`flex items-center justify-between pb-4 border-b border-silver-800/60 gap-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`pt-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`pt-4 mt-4 border-t border-silver-800/60 flex items-center justify-between gap-3 ${className}`} {...props}>
    {children}
  </div>
);
