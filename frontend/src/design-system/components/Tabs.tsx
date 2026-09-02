import React, { useRef } from 'react';
import { Icon, type IconName } from '../icons/Icon';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: IconName;
  disabled?: boolean;
  /** ID of the tabpanel controlled by this tab. Omit for filter/segmented-control uses. */
  panelId?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'line' | 'pills' | 'enclosed';
  fullWidth?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  fullWidth = false,
  ariaLabel = 'Navegación por pestañas',
  className = '',
}) => {
  const tabsListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const enabledCurrentIndex = enabledTabs.findIndex((t) => t.id === tabs[currentIndex].id);

    let nextIndex = -1;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (enabledCurrentIndex + 1) % enabledTabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (enabledCurrentIndex - 1 + enabledTabs.length) % enabledTabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = enabledTabs.length - 1;
    }

    if (nextIndex !== -1) {
      const nextTab = enabledTabs[nextIndex];
      onChange(nextTab.id);

      // Focus the new tab button
      const buttons = tabsListRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
      const targetButton = Array.from(buttons || []).find(
        (b) => b.getAttribute('data-tab-id') === nextTab.id
      );
      targetButton?.focus();
    }
  };

  const variantContainerStyles = {
    line: 'border-b border-silver-800/80 gap-6',
    pills: 'bg-obsidian-900 p-1 rounded-xl border border-silver-800/60 gap-1',
    enclosed: 'bg-obsidian-900 border-b border-silver-800 gap-1 p-1 rounded-t-xl',
  }[variant];

  return (
    <div className={`w-full overflow-x-auto no-scrollbar ${className}`}>
      <div
        ref={tabsListRef}
        role="tablist"
        aria-label={ariaLabel}
        className={`flex items-center ${variantContainerStyles} ${fullWidth ? 'w-full' : ''}`}
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          const isLine = variant === 'line';
          const isPill = variant === 'pills';
          const isEnclosed = variant === 'enclosed';

          let tabStyles = '';
          if (isLine) {
            tabStyles = isActive
              ? 'text-gold-400 border-b-2 border-gold-500 font-semibold'
              : 'text-silver-400 hover:text-silver-200 border-b-2 border-transparent font-medium';
          } else if (isPill) {
            tabStyles = isActive
              ? 'bg-obsidian-800 text-silver-50 shadow-card-sm border border-silver-700/60 font-semibold'
              : 'text-silver-400 hover:text-silver-200 font-medium';
          } else if (isEnclosed) {
            tabStyles = isActive
              ? 'bg-obsidian-850 text-gold-400 border-t border-x border-silver-800 font-semibold rounded-t-lg'
              : 'text-silver-400 hover:text-silver-200 font-medium';
          }

          const widthClass = fullWidth ? 'flex-1 justify-center' : '';

          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              data-tab-id={tab.id}
              aria-controls={tab.panelId}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`
                inline-flex items-center gap-2 py-2.5 px-3.5 text-sm whitespace-nowrap transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/30 rounded-lg
                disabled:opacity-40 disabled:cursor-not-allowed select-none
                ${tabStyles}
                ${widthClass}
              `}
            >
              {tab.icon && <Icon name={tab.icon} size={16} />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`
                    px-1.5 py-0.5 text-[11px] rounded-full font-sans
                    ${isActive ? 'bg-gold-500/20 text-gold-300' : 'bg-obsidian-800 text-silver-400'}
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
