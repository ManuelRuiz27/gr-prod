import React from 'react';

export type CardVariant = 'default' | 'raised' | 'outlined' | 'interactive' | 'gold-accent';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-obsidian-850 border border-silver-800/80 shadow-card',
    raised: 'bg-obsidian-800 border border-silver-700/60 shadow-card-md',
    outlined: 'bg-transparent border border-silver-800',
    interactive:
      'bg-obsidian-850 border border-silver-800 hover:border-gold-500/40 hover:bg-obsidian-800 shadow-card hover:shadow-card-md transition-all duration-200 cursor-pointer active:scale-[0.99]',
    'gold-accent':
      'bg-obsidian-850 border-l-4 border-l-gold-500 border-y border-r border-silver-800 shadow-card',
  }[variant];

  return (
    <div className={`rounded-card p-5 md:p-6 text-silver-100 transition-colors ${variantStyles} ${className}`} {...props}>
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
