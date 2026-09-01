import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../icons/Icon';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-xs text-silver-400 font-sans ${className}`}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && <Icon name="chevron-right" size={12} className="text-silver-600 shrink-0" />}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-gold-400 hover:underline font-medium text-silver-400 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`font-semibold ${
                  isLast || item.current ? 'text-silver-50' : 'text-silver-400'
                }`}
                aria-current={isLast || item.current ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
