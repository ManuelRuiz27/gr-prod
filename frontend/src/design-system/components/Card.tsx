import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive' | 'gold-accent';

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
    default: 'bg-surface-lowest border border-surface-high shadow-card-sm',
    elevated: 'bg-surface-lowest border border-surface-high/60 shadow-card-md',
    outlined: 'bg-transparent border border-surface-highest',
    interactive:
      'bg-surface-lowest border border-surface-high shadow-card-sm hover:shadow-card-md hover:border-navy-300 transition-all duration-200 cursor-pointer active:scale-[0.99]',
    'gold-accent':
      'bg-surface-lowest border-l-4 border-l-gold-400 border-y border-r border-surface-high shadow-card-sm',
  }[variant];

  return (
    <div className={`rounded-2xl p-5 md:p-6 transition-colors ${variantStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`flex items-center justify-between pb-4 border-b border-surface-low gap-3 ${className}`} {...props}>
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
  <div className={`pt-4 mt-4 border-t border-surface-low flex items-center justify-between gap-3 ${className}`} {...props}>
    {children}
  </div>
);
